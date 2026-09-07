-- ============================================================
-- giapha-supabase · luoc-do/11-quyen-he-thong.sql
-- Vai trò  : Tầng quyền cấp hệ thống — bảng tai_khoan, cau_hinh,
--            cột mới trên trees, trigger tự tạo mã ngắn, bảy hàm mới,
--            sửa vai_tro() và la_thanh_vien(), đổi 6 luật RLS đọc.
-- Chạy ở   : Supabase → SQL Editor → dán → Run.
--            Chạy SAU 10-sua-nhieu-cay.sql.
-- Phiên bản: 0.2.0 · Cập nhật: 07/09/2026 21:10
--            0.1.0 soạn bởi Antigravity (codex/) · 0.2.0 vá hai lỗ hổng
--            do phép đo `kiem-thu/ban-thu-sql/do-b102.mjs` bắt được.
-- ============================================================
--
-- ⚠⚠ BƯỚC NGUY HIỂM NHẤT CỦA CẢ DỰ ÁN ⚠⚠
--
-- File này sửa vai_tro() — hàm nền móng mà MỌI luật quyền đều hỏi.
-- Sai ở đây thì mọi thứ xây bên trên đều sai theo, và KHÔNG CÓ GÌ BÁO LỖI.
--
-- Ba bẫy đã biết, được nhắc lại ở từng hàm bên dưới:
--   Bẫy 1 — Quên sửa la_thanh_vien() → admin sửa được mà không đọc được.
--   Bẫy 2 — la_quan_tri_he_thong() phải coalesce(…, false) — bẫy null.
--   Bẫy 3 — Đổi nhầm policy tree_members sang co_the_xem_cay → lộ email cả họ.
--
-- ⚠ VÀ MỘT BẪY THỨ TƯ, KHÔNG AI GHI TRƯỚC, ĐO MỚI RA (07/09/2026):
--   Bẫy 4 — Bảng `tai_khoan` giữ CỜ QUYỀN, nên nó KHÔNG được có luật ghi.
--           Bản 0.1.0 chép khuôn `rieng_user_settings` (`for all` … `user_id
--           = auth.uid()`) sang đây. Khuôn ấy vô hại ở `user_settings` vì
--           bảng ấy chỉ giữ cỡ chữ với màu nền; ở `tai_khoan` nó nghĩa là
--           **ai cũng tự đặt mình thành Quản trị hệ thống bằng một lệnh
--           PATCH**. Đo được ở mục 3 của `do-b102.mjs`: người lạ tự bật cờ
--           rồi đọc 59 người và 5 dòng `tree_members` (email cả họ).
--           Xem mục 1 bên dưới.
--
-- Nguồn thiết kế: THIET-KE-NHIEU-CAY.md (đọc trước file này).
-- Phép đo: `kiem-thu/ban-thu-sql/do-b102.mjs` (ngoài repo, cần bàn thử
--          Postgres tại chỗ). Nó mượn danh nghĩa tài khoản bằng
--          `set local role authenticated`, nên nó đo BẢNG chứ không chỉ hỏi
--          HÀM — khác biệt ấy chính là chỗ bẫy 4 lộ ra.
--
-- ⚠ Chạy lại lần thứ hai là an toàn (if not exists · create or replace).

-- ============================================================
-- 1. BẢNG tai_khoan — tầng người, không thuộc cây nào
-- ============================================================
-- Ba câu hỏi mà tree_members không trả lời được (vì cả ba không thuộc cây nào):
--   1. Ai là Quản trị hệ thống?
--   2. Ai được tạo cây mới?
--   3. Mã ngắn của tài khoản (để chỉ đúng người khi tên trùng)?
--
-- Vì sao không dùng auth.users.id thẳng: uuid 36 ký tự, không ai đọc qua
-- điện thoại được, gõ nhầm một ký tự là gán quyền cho người khác. Mã 6 ký tự
-- chữ hoa + số đọc được và unique bắt buộc nên không đụng nhau.
--
-- ⚠ MỌI tài khoản phải có dòng ở đây, kể cả người vừa đăng ký. Trigger bên
--   dưới (mục 2) lo việc này tự động.

create table if not exists public.tai_khoan (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  ma_ngan                 text not null unique,
  la_quan_tri_he_thong    boolean not null default false,
  duoc_tao_cay            boolean not null default false,
  tao_luc                 timestamptz not null default now()
);

-- ⚠⚠ BẪY 4 — VÌ SAO LUẬT DƯỚI ĐÂY LÀ `for select`, KHÔNG PHẢI `for all` ⚠⚠
--
-- Bảng này giữ hai CỜ QUYỀN: `la_quan_tri_he_thong` và `duoc_tao_cay`. Cho
-- người ta ghi vào dòng của chính mình nghĩa là cho người ta TỰ CẤP QUYỀN
-- cho mình — một lệnh `PATCH /rest/v1/tai_khoan?user_id=eq.<mình>` với thân
-- `{"la_quan_tri_he_thong": true}` là xong, không qua app, không qua hàm nào.
--
-- Bản 0.1.0 viết `for all` vì chép khuôn `rieng_user_settings` ở `02-rls.sql`
-- mục 4. Khuôn ấy ĐÚNG ở chỗ nó đứng — `user_settings` giữ cỡ chữ, hỏng thì
-- hỏng đúng một người — và SAI ở đây, vì cùng một hình dạng mà nội dung khác
-- hẳn. Đó là loại lỗi đọc mã không thấy: hai luật trông giống nhau như đúc.
--
-- Phép đo bắt được nó (`do-b102.mjs` mục ĐÒN 1, 07/09/2026): một tài khoản
-- không có chân ở cây nào, sau đúng một câu `update`, đọc được 59 người, 5
-- dòng `tree_members` (email cả họ) và `duoc_tao_cay()` trả `true`.
--
-- Vì sao phép kiểm cũ không thấy: nó chạy bằng `postgres` (superuser, RLS
-- không áp) và nó hỏi HÀM `la_quan_tri_he_thong()` chứ không hỏi BẢNG. Hàm
-- trả đúng; đường vòng qua bảng mới là chỗ thủng.
--
-- ⚠ ĐỔI CỜ QUYỀN Ở ĐÂU: không ở đây. Cửa duy nhất là hàm `security definer`
--   của b105 (`13-quan-ly-thanh-vien.sql`), nơi có phép kiểm "người gọi có
--   phải Quản trị hệ thống không" viết trong thân hàm. Cùng một nguyên tắc
--   với `luu_cay()`: đóng hẳn đường ghi rồi mở đúng một cửa.
alter table public.tai_khoan enable row level security;

drop policy if exists rieng_tai_khoan on public.tai_khoan;
create policy rieng_tai_khoan on public.tai_khoan
  for select to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- 2. TRIGGER tự tạo dòng tai_khoan khi có user mới
-- ============================================================
-- Đây là chỗ DUY NHẤT trong dự án đụng vào schema auth.
-- Trigger chạy sau insert on auth.users, sinh mã ngắn 6 ký tự
-- (chữ hoa A-Z + số 2-9, tránh 0/O và 1/I nhầm nhau).
--
-- ⚠ Trigger này chạy ngoài tầm mắt — phải có phép kiểm xác nhận.

create or replace function public.tao_ma_ngan_tai_khoan()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ma   text;
  v_thu  int := 0;
begin
  loop
    -- Bảng ký tự: loại 0, 1, I, O tránh nhầm
    v_ma := substring(
      md5(gen_random_uuid()::text || clock_timestamp()::text),
      1, 12
    );
    -- Chuyển hex → ký tự dễ đọc bằng cách ánh xạ từng ký tự
    v_ma := translate(upper(v_ma), '0123456789ABCDEF', '23456789ABCDEFGH');
    v_ma := left(v_ma, 6);

    exit when not exists (
      select 1 from public.tai_khoan where ma_ngan = v_ma
    );

    v_thu := v_thu + 1;
    if v_thu > 100 then
      raise exception 'Không sinh được mã ngắn duy nhất sau 100 lần thử';
    end if;
  end loop;

  insert into public.tai_khoan (user_id, ma_ngan)
  values (new.id, v_ma)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists sau_khi_tao_user on auth.users;
create trigger sau_khi_tao_user
  after insert on auth.users
  for each row
  execute function public.tao_ma_ngan_tai_khoan();

-- ============================================================
-- 3. Điền tay cho tài khoản đã đăng ký TRƯỚC khi có trigger
-- ============================================================
-- Trigger chỉ chạy cho user MỚI. Tài khoản đã có (trongdung1982@gmail.com,
-- sao-luu@…, thu-h9@…, v.v.) phải điền bằng câu INSERT bên dưới.
-- ma_ngan đặt sẵn có ý nghĩa để dễ nhớ, phải thỏa unique.

insert into public.tai_khoan (user_id, ma_ngan, la_quan_tri_he_thong, duoc_tao_cay)
select
  au.id,
  case au.email
    when 'trongdung1982@gmail.com'        then 'TKNTB1'
    when 'sao-luu@nguyentrongbac.io.vn'  then 'TKSAOLUU'
    else left(upper(translate(md5(au.id::text), '0123456789abcdef', '23456789ABCDEFGH')), 6)
  end,
  (au.email = 'trongdung1982@gmail.com'),
  (au.email = 'trongdung1982@gmail.com')
from auth.users au
on conflict (user_id) do nothing;

-- ============================================================
-- 4. BẢNG cau_hinh — cấu hình cấp hệ thống (chỉ 1 dòng)
-- ============================================================
-- Mẹo boolean primary key check (chi_mot_dong): bảng không thể có dòng thứ
-- hai. Rẻ hơn một trigger, và cơ sở dữ liệu tự canh.
-- on delete set null: xoá cây đang là cây mặc định → không còn cây mặc định,
-- không phải khoá ngoại gãy.

create table if not exists public.cau_hinh (
  chi_mot_dong  boolean primary key default true check (chi_mot_dong),
  cay_mac_dinh  uuid references public.trees(id) on delete set null,
  cap_nhat_luc  timestamptz not null default now(),
  cap_nhat_boi  text not null default ''
);

-- Chèn dòng cấu hình ban đầu (chưa có cây mặc định)
insert into public.cau_hinh (chi_mot_dong, cay_mac_dinh)
values (true, null)
on conflict (chi_mot_dong) do nothing;

-- RLS cho cau_hinh: mọi người đã đăng nhập đọc được (cần để app biết cây mặc định)
alter table public.cau_hinh enable row level security;

drop policy if exists doc_cau_hinh on public.cau_hinh;
create policy doc_cau_hinh on public.cau_hinh
  for select to authenticated
  using (true);

-- Ghi: chỉ qua hàm dat_cay_mac_dinh() (security definer) — không mở policy ghi

-- ============================================================
-- 5. CỘT MỚI TRÊN BẢNG trees
-- ============================================================
-- chu_so_huu: người dựng cây. Hiện trong danh sách và là người mặc định mang
--   vai quan_tri của cây. Nullable vì hai cây hiện có chưa biết ai tạo.
-- cho_nguoi_la_thay_ten: công tắc tầng 1 (thấy tên cây trong danh sách).
--   MẶC ĐỊNH TẮT — cây đã có phải do chủ bật, không tự nhiên phơi ra.

alter table public.trees
  add column if not exists chu_so_huu           uuid references auth.users(id) on delete set null,
  add column if not exists cho_nguoi_la_thay_ten boolean not null default false;

-- Gán chu_so_huu cho HAI CÂY ĐÃ CÓ (tài khoản trongdung1982@gmail.com).
--
-- ⚠ `and tree_code in ('NTB', 'NPGQ8C9')` không thừa. File này an toàn khi
--   chạy lại, và từ b104 trở đi người khác dựng được cây riêng. Nếu điều kiện
--   chỉ là `chu_so_huu is null` thì một lần chạy lại sau b104 sẽ **gán cây của
--   người khác cho chủ dự án** — im lặng, không lỗi. Kê tên hai cây ra là
--   khoá câu lệnh này vào đúng việc nó sinh ra để làm.
update public.trees
set chu_so_huu = (
  select id from auth.users where email = 'trongdung1982@gmail.com' limit 1
)
where chu_so_huu is null
  and tree_code in ('NTB', 'NPGQ8C9');

-- ============================================================
-- 6. HÀM la_quan_tri_he_thong() — nền của tất cả
-- ============================================================
-- PHẢI viết dạng KHẲNG ĐỊNH và bọc coalesce(…, false).
-- Lý do: bảng tai_khoan có thể chưa có dòng cho người ấy → SELECT trả null
-- → case/if không nhận nhánh nào → nếu viết phủ định là lọt (Bẫy 2).

create or replace function public.la_quan_tri_he_thong()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select la_quan_tri_he_thong
       from public.tai_khoan
      where user_id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- 7. HÀM cay_mac_dinh() — cây mặc định của hệ thống
-- ============================================================
-- Có thể trả null nếu chưa cấu hình. Dùng trong co_the_xem_cay().

create or replace function public.cay_mac_dinh()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select cay_mac_dinh from public.cau_hinh where chi_mot_dong = true;
$$;

-- ============================================================
-- 8. HÀM co_the_xem_cay(p_tree) — gác 6 bảng nội dung
-- ============================================================
-- Tách ra từ la_thanh_vien() để mở cửa cho tầng 1 (cây mặc định)
-- mà KHÔNG lộ tree_members / change_log / imports.
--
-- ⚠ Bẫy NULL (đo được 06/09/2026): khi cay_mac_dinh() trả null,
--   p_tree = null cho ra null, và false OR null cho ra null (không phải false).
--   Bắt buộc bọc coalesce và dùng IS NOT NULL trước khi so sánh.
--
-- Ba nhánh theo thứ tự ưu tiên:
--   1. la_thanh_vien() — có dòng tree_members đã duyệt
--   2. cây mặc định (chỉ khi IS NOT NULL)
--   3. quản trị hệ thống

create or replace function public.co_the_xem_cay(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    public.la_thanh_vien(p_tree)
    or (public.cay_mac_dinh() is not null and p_tree = public.cay_mac_dinh())
    or public.la_quan_tri_he_thong(),
    false
  );
$$;

-- ============================================================
-- 9. HÀM la_thanh_vien(p_tree) — SỬA: thêm nhánh quản trị HT
-- ============================================================
-- ⚠ BẪYYY 1: phải sửa hàm này cùng lúc với vai_tro().
--   Quên → quản trị HT sửa được mà không đọc được.
--   Triệu chứng: "Lưu báo thành công mà màn hình trống" — mất nửa buổi lần ra.
--
-- la_thanh_vien() gác: tree_members · change_log · imports · user_settings
-- (các bảng nhạy cảm KHÔNG được mở theo cây mặc định)
--
-- ⚠⚠ BA VAI ĐI TẮT PHẢI GIỮ NGUYÊN — `07-duyet-dang-ky.sql` mục 3.
--   Bản 0.1.0 của file này viết gọn thành `and approved = true`, tức LẶNG LẼ
--   bỏ mất mệnh đề `or role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')`
--   mà `07` cố ý đặt vào. Đo được (`do-b102.mjs` mục ĐÒN 2): tài khoản mang
--   vai `sao_luu` với `approved = false` đọc **0 dòng** `persons` — tức bản
--   sao lưu hằng đêm chạy ra một file rỗng, và **không có gì báo lỗi**. Đúng
--   kiểu hỏng mà `07` viết hẳn một khối chú thích để cảnh báo.
--
--   Ba vai ấy không bao giờ đi qua hàng chờ: `quan_tri_he_thong` là người
--   dựng cây (khoá chủ ra ngoài nhà mình là hỏng kiểu tệ nhất), `quan_tri`
--   do chủ dự án cấp tay, `sao_luu` là máy chạy đêm không có ai ngồi sau để
--   bấm nút.

create or replace function public.la_thanh_vien(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select (
    public.la_quan_tri_he_thong()
    or exists (
      select 1 from public.tree_members
       where tree_id = p_tree
         and user_id = auth.uid()
         and (approved or role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu'))
    )
  );
$$;

-- ============================================================
-- 10. HÀM vai_tro(p_tree) — SỬA: thêm nhánh quản trị HT
-- ============================================================
-- ⚠ NỀN MÓNG CỦA TOÀN BỘ HỆ THỐNG QUYỀN. Mọi hàm quyết quyền đều hỏi đây.
--
-- Nhánh quản trị HT phải là nhánh ĐẦU TIÊN (WHEN), không phải ELSE.
-- Lý do: nếu không có dòng tree_members, SELECT role trả null; case không
-- nhận nhánh nào → null trả ra — hệ thống ứng xử như người lạ dù đang là admin.

create or replace function public.vai_tro(p_tree uuid)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when public.la_quan_tri_he_thong() then 'quan_tri_he_thong'
    else (
      select role from public.tree_members
       where tree_id = p_tree
         and user_id = auth.uid()
         and approved = true
    )
  end;
$$;

-- ============================================================
-- 11. HÀM duoc_tao_cay() — ai được tạo gia phả mới
-- ============================================================
-- Quản trị HT luôn được. Người khác cần duoc_tao_cay = true trong tai_khoan.

create or replace function public.duoc_tao_cay()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  -- ⚠ `tk.` không thừa: hàm và cột trùng tên `duoc_tao_cay`. Postgres hiện
  --   giải đúng về cột, nhưng một tên trần ở đây là chỗ chờ sẵn để hiểu nhầm.
  select coalesce(
    public.la_quan_tri_he_thong()
    or (select tk.duoc_tao_cay from public.tai_khoan tk where tk.user_id = auth.uid()),
    false
  );
$$;

-- ============================================================
-- 12. HÀM ma_tai_khoan_cua_toi() — mã ngắn hiện ở Cài đặt
-- ============================================================

create or replace function public.ma_tai_khoan_cua_toi()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select ma_ngan from public.tai_khoan where user_id = auth.uid();
$$;

-- ============================================================
-- 13. HÀM dat_cay_mac_dinh(p_tree) — chỉ quản trị HT được đặt
-- ============================================================
-- p_tree = null → không có cây mặc định (tắt tầng 1 cho mọi cây).

create or replace function public.dat_cay_mac_dinh(p_tree uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.la_quan_tri_he_thong() then
    return jsonb_build_object('ok', false, 'lyDo', 'Chỉ Quản trị hệ thống mới đặt được cây mặc định.');
  end if;

  update public.cau_hinh
  set cay_mac_dinh = p_tree,
      cap_nhat_luc = now(),
      cap_nhat_boi = (select email from auth.users where id = auth.uid())
  where chi_mot_dong = true;

  return jsonb_build_object('ok', true);
end;
$$;

-- ============================================================
-- 14. HÀM ds_gia_pha() — danh sách cây cho màn hình chọn
-- ============================================================
-- PHẢI là security definer và KHÔNG mở RLS trên trees.
-- Lọc theo CỘT (ẩn root_person_id, note, revision) chứ không theo dòng
-- → người lạ thấy tên cây mà không thấy nội dung nhạy cảm.
--
-- Trả về: tên · mã · email chủ · số người · vai của tôi · trạng thái · đơn chờ.
--
-- ⚠ `email_chu` ĐI RA CHO CẢ NGƯỜI LẠ, và đó là CỐ Ý, không phải chỗ hở.
--   `THIET-KE-NHIEU-CAY.md` mục *Ba tầng nhìn thấy*: *"Tầng 1 lộ địa chỉ email
--   của chủ cây cho mọi tài khoản đã đăng nhập. Đó là cái giá, và nó chính là
--   công dụng — email là đường liên hệ để xin quyền. Chủ cây không muốn thì
--   tắt công tắc, cây biến mất khỏi danh sách người lạ."*
--   Phép đo `do-b102.mjs` mục ĐÒN 3 canh đúng câu ấy: nó KỲ VỌNG thấy email.
--   Ai đọc file này rồi thấy "lộ email" mà định vá, đọc lại mục ấy trước —
--   vá đi là gỡ mất đường xin quyền, và người lạ không còn cách nào vào cây.
--   Khác hẳn `tree_members` (bẫy 3): bảng ấy lộ email CỦA CẢ HỌ, không phải
--   của một người tự nguyện đứng tên chủ cây.

create or replace function public.ds_gia_pha()
returns table (
  id                   uuid,
  ten                  text,
  tree_code            text,
  email_chu            text,
  so_nguoi             bigint,
  vai_cua_toi          text,
  co_the_xem           boolean,
  co_the_sua_du_lieu   boolean,
  da_nop_don           boolean,
  cho_nguoi_la_thay_ten boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    t.id,
    t.name                                       as ten,
    t.tree_code,
    au.email                                     as email_chu,
    (select count(*) from public.persons p
      where p.tree_id = t.id and p.deleted = false) as so_nguoi,
    public.vai_tro(t.id)                         as vai_cua_toi,
    public.co_the_xem_cay(t.id)                  as co_the_xem,
    public.co_the_sua(t.id)                      as co_the_sua_du_lieu,
    exists (
      select 1 from public.tree_members tm
       where tm.tree_id = t.id
         and tm.user_id = auth.uid()
         and tm.approved = false
    )                                            as da_nop_don,
    t.cho_nguoi_la_thay_ten
  from public.trees t
  left join auth.users au on au.id = t.chu_so_huu
  where
    -- Thấy cây của mình (có chân) hoặc cây công khai hoặc là quản trị HT
    public.co_the_xem_cay(t.id)
    or t.cho_nguoi_la_thay_ten = true
    or public.la_quan_tri_he_thong()
  order by t.name;
$$;

-- ============================================================
-- 15. ĐỔI 6 LUẬT RLS ĐỌC — la_thanh_vien → co_the_xem_cay
-- ============================================================
-- Sáu bảng NỘI DUNG gia phả: đổi sang co_the_xem_cay để người vào bằng
-- cửa cây mặc định xem được gia phả.
--
-- ⚠⚠ BẪY 3 — TUYỆT ĐỐI KHÔNG đổi các bảng nhạy cảm:
--   tree_members → lộ email cả họ
--   change_log   → lộ nhật ký kiểm toán
--   imports      → lộ sổ nhập liệu
--   Cả ba giữ nguyên la_thanh_vien() — chỉ thành viên đã duyệt mới thấy.

-- trees
drop policy if exists doc_trees on public.trees;
create policy doc_trees on public.trees
  for select to authenticated
  using (public.co_the_xem_cay(id));

-- persons
drop policy if exists doc_persons on public.persons;
create policy doc_persons on public.persons
  for select to authenticated
  using (public.co_the_xem_cay(tree_id));

-- unions
drop policy if exists doc_unions on public.unions;
create policy doc_unions on public.unions
  for select to authenticated
  using (public.co_the_xem_cay(tree_id));

-- union_children
drop policy if exists doc_union_children on public.union_children;
create policy doc_union_children on public.union_children
  for select to authenticated
  using (public.co_the_xem_cay(tree_id));

-- media
drop policy if exists doc_media on public.media;
create policy doc_media on public.media
  for select to authenticated
  using (public.co_the_xem_cay(tree_id));

-- sources
drop policy if exists doc_sources on public.sources;
create policy doc_sources on public.sources
  for select to authenticated
  using (public.co_the_xem_cay(tree_id));

-- ============================================================
-- 16. CẤP QUYỀN GỌI HÀM
-- ============================================================
-- Supabase có sẵn `alter default privileges` cấp `execute` cho `authenticated`,
-- nên bỏ khối này thì app vẫn chạy. Viết ra vì sáu file trước đều viết
-- (`03` · `05` · `06` · `07` · `08` · `10`), và một file lặng lẽ dựa vào mặc
-- định của nhà cung cấp là một chỗ khác biệt không ai giải thích được về sau.
--
-- ⚠ KHÔNG cấp cho `anon`. Mọi hàm ở đây đọc `auth.uid()`; gọi khi chưa đăng
--   nhập thì `auth.uid()` là `null`, và `null` đi qua các hàm này ra `false`
--   — nhưng cấp quyền cho một vai không có việc gì ở đây là mở rộng bề mặt
--   tấn công mà không đổi lấy gì.

grant execute on function public.la_quan_tri_he_thong()    to authenticated;
grant execute on function public.cay_mac_dinh()            to authenticated;
grant execute on function public.co_the_xem_cay(uuid)      to authenticated;
grant execute on function public.duoc_tao_cay()            to authenticated;
grant execute on function public.ma_tai_khoan_cua_toi()    to authenticated;
grant execute on function public.dat_cay_mac_dinh(uuid)    to authenticated;
grant execute on function public.ds_gia_pha()              to authenticated;

-- ============================================================
-- 17. BẢNG TỰ KIỂM — đọc sau khi dán, xác nhận trước khi tiếp tục
-- ============================================================
-- Chủ dự án đọc bảng này và xác nhận tất cả cột "Kết quả" đều hiện "ĐẠT"
-- trước khi bấm thử bốn hàng rào.

select
  ten_kiem as "Kiểm",
  ket_qua  as "Kết quả"
from (
  -- 1. Bảng tai_khoan tồn tại
  select 1 as stt,
    'Bảng tai_khoan tồn tại' as ten_kiem,
    case when exists (
      select 1 from information_schema.tables
       where table_schema = 'public' and table_name = 'tai_khoan'
    ) then 'ĐẠT' else 'HỎNG — bảng chưa tạo được' end as ket_qua

  union all

  -- 2. Bảng cau_hinh tồn tại và có dòng
  select 2,
    'Bảng cau_hinh có đúng 1 dòng',
    case when (select count(*) from public.cau_hinh) = 1
      then 'ĐẠT' else 'HỎNG — ' || (select count(*)::text from public.cau_hinh) || ' dòng' end

  union all

  -- 3. Cột chu_so_huu tồn tại trên trees
  select 3,
    'trees.chu_so_huu tồn tại',
    case when exists (
      select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'trees'
         and column_name = 'chu_so_huu'
    ) then 'ĐẠT' else 'HỎNG — cột chưa thêm được' end

  union all

  -- 4. Cột cho_nguoi_la_thay_ten tồn tại trên trees
  select 4,
    'trees.cho_nguoi_la_thay_ten tồn tại',
    case when exists (
      select 1 from information_schema.columns
       where table_schema = 'public' and table_name = 'trees'
         and column_name = 'cho_nguoi_la_thay_ten'
    ) then 'ĐẠT' else 'HỎNG — cột chưa thêm được' end

  union all

  -- 5. Trigger tồn tại
  select 5,
    'Trigger sau_khi_tao_user tồn tại',
    case when exists (
      select 1 from information_schema.triggers
       where trigger_name = 'sau_khi_tao_user'
    ) then 'ĐẠT' else 'HỎNG — trigger chưa tạo được' end

  union all

  -- 6. Tài khoản trongdung1982 đã có dòng tai_khoan
  --
  -- ⚠ Ba nhánh, không phải hai. Bàn thử tại chỗ KHÔNG có tài khoản này, nên
  --   nhánh hai kia sẽ nhuộm đỏ hai dòng ở mọi lần chạy bàn thử — và một bảng
  --   tự kiểm lúc nào cũng có hai dòng đỏ "bình thường" là bảng dạy người đọc
  --   bỏ qua màu đỏ. Nhánh BỎ QUA giữ màu đỏ chỉ cho lỗi thật.
  select 6,
    'trongdung1982@gmail.com có dòng tai_khoan',
    case
      when not exists (select 1 from auth.users where email = 'trongdung1982@gmail.com')
        then 'BỎ QUA — máy chủ này không có tài khoản ấy (đúng với bàn thử)'
      when exists (
        select 1 from public.tai_khoan tk
          join auth.users au on au.id = tk.user_id
         where au.email = 'trongdung1982@gmail.com'
      ) then 'ĐẠT'
      else 'HỎNG — chưa có dòng tai_khoan' end

  union all

  -- 7. Tài khoản trongdung1982 được đánh dấu là Quản trị hệ thống
  select 7,
    'trongdung1982@gmail.com là Quản trị hệ thống',
    case
      when not exists (select 1 from auth.users where email = 'trongdung1982@gmail.com')
        then 'BỎ QUA — máy chủ này không có tài khoản ấy (đúng với bàn thử)'
      when (
        select tk.la_quan_tri_he_thong
          from public.tai_khoan tk
          join auth.users au on au.id = tk.user_id
         where au.email = 'trongdung1982@gmail.com'
      ) = true then 'ĐẠT'
      else 'HỎNG — la_quan_tri_he_thong = false' end

  union all

  -- 8. Hàm la_quan_tri_he_thong tồn tại
  select 8,
    'Hàm la_quan_tri_he_thong() tồn tại',
    case when exists (
      select 1 from information_schema.routines
       where routine_schema = 'public'
         and routine_name = 'la_quan_tri_he_thong'
    ) then 'ĐẠT' else 'HỎNG — hàm chưa tạo được' end

  union all

  -- 9. Hàm co_the_xem_cay tồn tại
  select 9,
    'Hàm co_the_xem_cay(uuid) tồn tại',
    case when exists (
      select 1 from information_schema.routines
       where routine_schema = 'public'
         and routine_name = 'co_the_xem_cay'
    ) then 'ĐẠT' else 'HỎNG — hàm chưa tạo được' end

  union all

  -- 10. Hàm ds_gia_pha tồn tại
  select 10,
    'Hàm ds_gia_pha() tồn tại',
    case when exists (
      select 1 from information_schema.routines
       where routine_schema = 'public'
         and routine_name = 'ds_gia_pha'
    ) then 'ĐẠT' else 'HỎNG — hàm chưa tạo được' end

  union all

  -- 11. Số cây đã có chu_so_huu
  select 11,
    'Số cây đã gán chu_so_huu: ' || (select count(*)::text from public.trees where chu_so_huu is not null),
    case when (select count(*) from public.trees where chu_so_huu is null) = 0
      then 'ĐẠT — mọi cây đã có chủ'
      else 'CẦN CHÚ Ý — còn ' || (select count(*)::text from public.trees where chu_so_huu is null) || ' cây chưa có chủ'
    end

  union all

  -- 12. policy doc_trees dùng co_the_xem_cay (kiểm qua pg_policies)
  select 12,
    'Policy doc_trees đã đổi sang co_the_xem_cay',
    case when exists (
      select 1 from pg_policies
       where schemaname = 'public'
         and tablename = 'trees'
         and policyname = 'doc_trees'
         and qual ilike '%co_the_xem_cay%'
    ) then 'ĐẠT' else 'HỎNG — policy chưa đổi hoặc vẫn dùng la_thanh_vien' end

  union all

  -- 13. ⚠ BẪY 4 — bảng tai_khoan KHÔNG được có luật ghi
  -- Đây là dòng đáng tiền nhất của cả bảng: nó hỏi thẳng máy chủ "còn luật
  -- nào cho ghi vào bảng cờ quyền không", chứ không hỏi trí nhớ của ai.
  select 13,
    'tai_khoan chỉ có luật ĐỌC (không ai tự cấp quyền cho mình)',
    case when not exists (
      select 1 from pg_policies
       where schemaname = 'public'
         and tablename = 'tai_khoan'
         and cmd <> 'SELECT'
    ) then 'ĐẠT' else 'HỎNG — CÓ LUẬT GHI trên tai_khoan: ai cũng tự đặt mình '
                    || 'thành Quản trị hệ thống. DỪNG LẠI, đừng dùng tiếp.' end

  union all

  -- 14. ⚠ BẪY 1b — la_thanh_vien() còn giữ ba vai đi tắt của 07 không
  select 14,
    'la_thanh_vien() còn mệnh đề ba vai đi tắt (sao_luu…)',
    case when (
      select p.prosrc from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'la_thanh_vien'
    ) ilike '%sao_luu%' then 'ĐẠT'
    else 'HỎNG — mất mệnh đề `or role in (…)`. Sao lưu đêm sẽ ra file RỖNG '
      || 'mà không báo lỗi. Xem 07-duyet-dang-ky.sql mục 3.' end

  union all

  -- 15. vai_tro() đã có nhánh quản trị hệ thống chưa
  select 15,
    'vai_tro() có nhánh la_quan_tri_he_thong()',
    case when (
      select p.prosrc from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'vai_tro'
    ) ilike '%la_quan_tri_he_thong%' then 'ĐẠT'
    else 'HỎNG — vai_tro() chưa sửa; cả tầng quyền hệ thống chưa có hiệu lực' end

  union all

  -- 16. Ba bảng nhạy cảm PHẢI còn dùng la_thanh_vien, không được đổi (bẫy 3)
  select 16,
    'tree_members · change_log · imports vẫn gác bằng la_thanh_vien',
    case when not exists (
      select 1 from pg_policies
       where schemaname = 'public'
         and tablename in ('tree_members', 'change_log', 'imports')
         and qual ilike '%co_the_xem_cay%'
    ) then 'ĐẠT' else 'HỎNG — ĐÃ ĐỔI NHẦM: lộ email cả họ. Xem bẫy 3.' end

) t
order by stt;
