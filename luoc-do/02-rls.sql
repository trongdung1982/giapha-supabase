-- ============================================================
-- giapha-supabase · luoc-do/02-rls.sql
-- Vai trò  : Bật Row Level Security và viết luật ĐỌC.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU 01-bang.sql, TRƯỚC 03-…sql.
-- Phiên bản: 0.1.1 · Cập nhật: 04/09/2026 22:45 — đổi mã vai sang `quan_tri_he_thong`
-- ============================================================
--
-- ═══ QUYẾT ĐỊNH GỐC CỦA CẢ FILE NÀY ═══
--
--   ĐỌC  → cơ sở dữ liệu tự lọc theo quyền (các `policy` bên dưới).
--   GHI  → **không ai ghi thẳng được vào bảng nào cả.** Không có một
--          `policy` insert/update/delete nào cho dữ liệu gia phả. Cửa ghi duy
--          nhất là hàm `luu_cay()` ở `03-ham-luu-cay.sql`.
--
-- Vì sao khắt khe thế, khi cấp quyền ghi từng dòng nghe có vẻ đủ rồi?
--
-- `supabase/BAT-DAU.md` mục 2 nêu HAI điều bản Drive không làm được, và điều
-- thứ hai là *"chặn Editor sửa tay file JSON ngoài app"*. Nếu bảng `persons`
-- có `policy` cho insert/update, thì người biên tập mở `curl` ra ghi thẳng
-- vào REST API của Supabase — không qua app, không qua kiểm tra hợp lệ,
-- không sinh một dòng `change_log` nào, không tăng `revision`. Tức là điều
-- thứ hai VẪN chưa làm được, chỉ đổi chỗ từ Drive sang REST.
--
-- Đóng hẳn đường ghi rồi mở đúng một cửa thì `change_log` và `revision` trở
-- thành thứ **không thể vòng qua**, chứ không phải thứ app tử tế thì mới ghi.
--
-- ⚠ Cái giá: `luu_cay()` buộc phải là `security definer`, tức nó chạy vượt
--   RLS. Toàn bộ phép kiểm quyền dồn vào một hàm. Một lỗi trong hàm ấy là
--   thủng toàn bộ. Đó là lý do phép thử H9 (`KE-HOACH-HA-TANG` bước H9) —
--   hai tài khoản thật, mỗi tài khoản một nhánh — là **bắt buộc**, không phải
--   tuỳ chọn.

-- ============================================================
-- 1. BỐN HÀM TRẢ LỜI "NGƯỜI NÀY ĐƯỢC LÀM GÌ"
-- ============================================================
-- ⚠ Cả bốn PHẢI là `security definer`. Nếu để mặc định (`invoker`), thì
--   `policy` trên `tree_members` sẽ gọi một hàm mà bản thân hàm ấy lại đọc
--   `tree_members` — Postgres báo `infinite recursion detected in policy`.
--   Đây là cái bẫy quen thuộc nhất của RLS trên Supabase; đừng gỡ chữ
--   `security definer` đi vì thấy nó "thừa".
--
-- `set search_path` khoá đường tra tên: không có nó, người dùng tạo được một
-- schema riêng chứa bảng tên `tree_members` giả rồi lừa hàm đọc nhầm.

create or replace function public.vai_tro(p_tree uuid)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.tree_members
   where tree_id = p_tree and user_id = auth.uid();
$$;

create or replace function public.la_thanh_vien(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.vai_tro(p_tree) is not null;
$$;

create or replace function public.co_the_sua(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.vai_tro(p_tree) in ('quan_tri_he_thong', 'sua');
$$;

-- ⚠⚠ HÀM NÀY CHƯA LÀM ĐÚNG VIỆC CỦA NÓ — và đó là chỗ dối duy nhất còn lại
--     trong cả lược đồ, nên nó được viết to ra đây thay vì giấu đi.
--
-- Nó PHẢI trả lời: *"người đang đăng nhập có được sửa NGƯỜI thuộc nhánh này
-- không"*. Hiện nó bỏ qua `p_branch` và trả lời như thể ai sửa được cây thì
-- sửa được mọi nhánh — tức đúng bằng bản Drive, tức chưa giải quyết điều thứ
-- nhất của `BAT-DAU.md` mục 2.
--
-- Không viết đủ được vì **chưa ai định nghĩa "chi/nhánh"**:
-- `KE-HOACH-HA-TANG-Supabase_V01.md` mục "Việc phải hỏi chủ dự án" hỏi câu ấy
-- từ 24/08/2026 và chưa có trả lời. Đoán bừa một quy tắc rồi để RLS thi hành
-- nó là cách tệ nhất — sai thì không ai thấy, người ta chỉ thấy "không sửa
-- được ông nội mình" mà không hiểu vì sao.
--
-- Khi có câu trả lời, sửa ĐÚNG hàm này và không sửa chỗ nào khác: bỏ chú
-- thích ở khối `-- KHI CHỐT XONG` bên dưới là xong.
create or replace function public.co_the_sua_nguoi(p_tree uuid, p_branch text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    case
      -- ⚠ Người NGOÀI cây phải bị chặn ở nhánh ĐẦU TIÊN, không phải ở nhánh
      --   thứ hai. Với họ `vai_tro()` trả `null`, mà trong SQL `null <> 'sua'`
      --   ra `null` chứ không ra `true` — nhánh thứ hai sẽ không bắt được họ,
      --   và họ rơi xuống `else true`. Tức là hàm quyết quyền trả lời "được
      --   sửa" cho đúng người không có quyền gì. Hàng rào 2 của `luu_cay()`
      --   đã chặn họ từ trước, nhưng một hàm quyết quyền chỉ đúng nhờ hàm
      --   khác đứng trước nó thì không phải một hàng rào.
      when public.vai_tro(p_tree) is null then false

      -- Chủ cây sửa mọi nhánh. Điều này đúng dù quy tắc chia nhánh là gì.
      when public.vai_tro(p_tree) = 'quan_tri_he_thong' then true
      when public.vai_tro(p_tree) <> 'sua' then false

      -- KHI CHỐT XONG QUY TẮC NHÁNH, bỏ chú thích bốn dòng dưới đây:
      -- when p_branch is null then false
      -- else exists (select 1 from public.branch_access
      --               where tree_id = p_tree and user_id = auth.uid()
      --                 and branch_id = p_branch)

      -- Cho tới lúc ấy: người 'sua' sửa được cả cây, đúng như bản Drive.
      else true
    end;
$$;

-- ============================================================
-- 2. BẬT RLS TRÊN MỌI BẢNG
-- ============================================================
-- ⚠ Bảng đã bật RLS mà KHÔNG có `policy` nào thì mặc định là **cấm tất**.
--   Đó chính là điều ta muốn cho đường ghi. Nhưng nó cũng nghĩa là: quên bật
--   RLS trên một bảng là bảng ấy mở toang cho mọi người đăng nhập. Nên danh
--   sách dưới đây phải khớp đúng danh sách bảng ở `01-bang.sql`.

alter table public.trees          enable row level security;
alter table public.tree_members   enable row level security;
alter table public.branches       enable row level security;
alter table public.branch_access  enable row level security;
alter table public.persons        enable row level security;
alter table public.unions         enable row level security;
alter table public.union_children enable row level security;
alter table public.media          enable row level security;
alter table public.sources        enable row level security;
alter table public.change_log     enable row level security;
alter table public.imports        enable row level security;
alter table public.user_settings  enable row level security;

-- ============================================================
-- 3. LUẬT ĐỌC
-- ============================================================
-- Một khuôn duy nhất cho mọi bảng dữ liệu: *thấy được cây thì thấy được mọi
-- thứ trong cây*.
--
-- ⚠ CHÚ Ý ĐIỀU NÀY, nó ngược với trực giác: giới hạn theo nhánh chỉ áp cho
--   đường GHI, không áp cho đường ĐỌC. Người biên tập chi Giáp vẫn XEM được
--   cả họ. Đó là chủ ý — gia phả là thứ để cả họ cùng đọc; cái cần chặn là
--   người chi này sửa người chi kia.
--
--   Ngày nào cần giấu cả phần đọc (ví dụ giấu chi tiết người còn sống với
--   người chỉ có quyền xem — việc `AN_NGUOI_CON_SONG_VOI_NGUOI_XEM` của
--   `Config.gs` đang làm), thì đó là một `policy` KHÁC trên `persons`, và nó
--   phải lọc theo cột chứ không theo dòng. Chưa làm; đừng mô tả như đã có.

drop policy if exists doc_trees on public.trees;
create policy doc_trees on public.trees
  for select to authenticated
  using (public.la_thanh_vien(id));

drop policy if exists doc_persons on public.persons;
create policy doc_persons on public.persons
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

drop policy if exists doc_unions on public.unions;
create policy doc_unions on public.unions
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

drop policy if exists doc_union_children on public.union_children;
create policy doc_union_children on public.union_children
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

drop policy if exists doc_media on public.media;
create policy doc_media on public.media
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

drop policy if exists doc_sources on public.sources;
create policy doc_sources on public.sources
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

drop policy if exists doc_change_log on public.change_log;
create policy doc_change_log on public.change_log
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

drop policy if exists doc_imports on public.imports;
create policy doc_imports on public.imports
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

drop policy if exists doc_branches on public.branches;
create policy doc_branches on public.branches
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

-- Người dùng thấy danh sách thành viên của cây mình ở trong — cần cho câu
-- *"liên hệ … để được thêm vào"* trên màn hình từ chối.
drop policy if exists doc_tree_members on public.tree_members;
create policy doc_tree_members on public.tree_members
  for select to authenticated
  using (public.la_thanh_vien(tree_id));

-- Quyền theo nhánh thì CHỈ thấy phần của chính mình. Biết ai được sửa nhánh
-- nào là chuyện riêng giữa người ấy và quản trị hệ thống.
drop policy if exists doc_branch_access on public.branch_access;
create policy doc_branch_access on public.branch_access
  for select to authenticated
  using (user_id = auth.uid() or public.vai_tro(tree_id) = 'quan_tri_he_thong');

-- ============================================================
-- 4. CÀI ĐẶT RIÊNG — bảng DUY NHẤT trình duyệt ghi thẳng
-- ============================================================
-- Được ghi thẳng vì nó không phải dữ liệu gia phả: hỏng thì hỏng đúng một
-- người, không sinh `change_log`, không cần `revision`. Và giữ đúng tính chất
-- của `PropertiesService.getUserProperties()` mà nó thay thế: người chỉ có
-- quyền XEM vẫn lưu được cài đặt của mình.

drop policy if exists rieng_user_settings on public.user_settings;
create policy rieng_user_settings on public.user_settings
  for all to authenticated
  using      (user_id = auth.uid())
  with check (user_id = auth.uid() and public.la_thanh_vien(tree_id));

-- ============================================================
-- 5. KHO ẢNH
-- ============================================================
-- Đọc: kho `anh` để `public = true` ở `01-bang.sql` nên ai có đường dẫn thì
-- xem được — không cần `policy` đọc. Xem cảnh báo riêng tư ở file ấy.
--
-- Ghi: chỉ người sửa được cây, và chỉ vào đúng thư mục của cây ấy. Đường dẫn
-- quy ước `<tree_id>/<media_id>-nho.jpg`, nên đoạn đầu chính là mã cây.
-- `storage.foldername(name)` trả về mảng các đoạn; phần tử [1] là đoạn đầu.

drop policy if exists ghi_anh on storage.objects;
create policy ghi_anh on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'anh'
    and public.co_the_sua(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists xoa_anh on storage.objects;
create policy xoa_anh on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'anh'
    and public.co_the_sua(((storage.foldername(name))[1])::uuid)
  );
