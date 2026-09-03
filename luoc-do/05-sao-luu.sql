-- ============================================================
-- giapha-supabase · luoc-do/05-sao-luu.sql
-- Vai trò  : Mở đường cho SAO LƯU chạy bằng một TÀI KHOẢN THƯỜNG,
--            bỏ hẳn nhu cầu dùng khoá bí mật.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU 04-view-ma-da-dung.sql.
-- Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 00:04
-- ============================================================
--
-- ═══ VÌ SAO CÓ FILE NÀY ═══
--
-- Ngày 03/09/2026, lúc dựng sao lưu thật lần đầu, lộ ra một bức tường:
--
--   • Supabase **từ chối khoá bí mật đời mới** (`sb_secret_…`) khi thấy
--     `User-Agent` trông giống trình duyệt. Câu lỗi nguyên văn:
--     `Forbidden use of secret API key in browser`.
--   • Apps Script **luôn** gửi `User-Agent` là
--     `Mozilla/5.0 (compatible; Google-Apps-Script; …)`, và Google
--     **không cho đổi** dòng ấy. Đây là giới hạn nền tảng, không sửa được
--     bằng mã.
--
-- Hai luật đụng nhau, không bên nào nhường. Đường vòng duy nhất còn lại là
-- khoá `service_role` đời cũ (`eyJ…`) — **nhưng Supabase khai tử loại khoá ấy
-- cuối năm 2026**, nên đi đường ấy là hẹn ngày hỏng.
--
-- ═══ CÁCH FILE NÀY GIẢI ═══
--
-- Không dùng khoá bí mật nữa, dưới bất kỳ hình thức nào. Sao lưu đăng nhập
-- như **một người thường** — email + mật khẩu — rồi đọc bằng chính phiếu
-- đăng nhập ấy, kèm **khoá CÔNG KHAI**. Khoá công khai không bị phép kiểm
-- trình duyệt chặn (nó sinh ra để chạy trong trình duyệt), và không nằm trong
-- diện khai tử.
--
-- Muốn thế thì tài khoản sao lưu phải ĐỌC ĐƯỢC MỌI DÒNG. Hôm nay RLS chặn nó
-- ở đúng ba chỗ, và file này mở đúng ba chỗ ấy — không mở rộng hơn một ly:
--
--   1. `branch_access`   — đang chỉ cho thấy dòng của chính mình
--   2. `user_settings`   — đang chỉ cho thấy dòng của chính mình
--   3. danh sách tài khoản (`auth.users`) — REST thường không với tới
--   (+ liệt kê tệp trong kho ảnh, vốn trước đây đi nhờ khoá bí mật)
--
-- ═══ VÌ SAO AN TOÀN HƠN CÁCH CŨ, CHỨ KHÔNG PHẢI ĐÁNH ĐỔI ═══
--
-- Khoá bí mật **vượt qua toàn bộ RLS**: cầm nó là đọc được và GHI được mọi
-- thứ, ở mọi cây, mãi mãi. Vai `sao_luu` dựng ở đây thì:
--
--   • `co_the_sua()` = `role in ('chu','sua')` → **false**. Cửa ghi duy nhất
--     là `luu_cay()`, và nó hỏi đúng hàm ấy. Nên tài khoản sao lưu
--     **không ghi được một dòng nào**, kể cả khi mật khẩu lọt ra ngoài.
--   • `co_the_sua_nguoi()` rơi vào nhánh `when vai_tro <> 'sua' then false`
--     → cũng false. (Đã đọc kỹ: nó KHÔNG rơi xuống `else true`.)
--   • Quyền chỉ có trên đúng những cây được thêm vào `tree_members`, thu lại
--     bất cứ lúc nào bằng cách xoá một dòng.
--
-- Tức cách mới **chặt hơn** cách cũ, đồng thời không có hạn dùng.

-- ============================================================
-- 1. THÊM VAI `sao_luu` VÀO DANH SÁCH VAI HỢP LỆ
-- ============================================================
-- `01-bang.sql` khai `check (role in ('chu','sua','xem'))`. Ràng buộc ấy
-- không được đặt tên, nên Postgres tự đặt là `tree_members_role_check` —
-- nhưng "tự đặt" thì không có gì bảo đảm, và thêm nhầm một ràng buộc thứ hai
-- sẽ khiến vai mới bị chính ràng buộc cũ chặn lại mà không ai hiểu vì sao.
-- Nên: tìm và gỡ MỌI ràng buộc kiểm liên quan cột `role`, rồi đặt lại một
-- cái có tên hẳn hoi. Chạy lại file này nhiều lần cũng không sinh rác.
do $$
declare rb record;
begin
  for rb in
    select conname
      from pg_constraint
     where conrelid = 'public.tree_members'::regclass
       and contype  = 'c'
       and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.tree_members drop constraint %I', rb.conname);
  end loop;
end $$;

alter table public.tree_members
  add constraint tree_members_role_check
  check (role in ('chu', 'sua', 'xem', 'sao_luu'));

-- ============================================================
-- 2. `branch_access` — cho vai sao lưu đọc đủ
-- ============================================================
-- Giữ nguyên tinh thần cũ: ai cũng chỉ thấy phần của mình, chủ cây thấy tất.
-- Chỉ thêm đúng vai `sao_luu` vào vế sau.
drop policy if exists doc_branch_access on public.branch_access;
create policy doc_branch_access on public.branch_access
  for select to authenticated
  using (
    user_id = auth.uid()
    or public.vai_tro(tree_id) in ('chu', 'sao_luu')
  );

-- ============================================================
-- 3. `user_settings` — thêm một luật ĐỌC riêng, không đụng luật cũ
-- ============================================================
-- ⚠ Không sửa `rieng_user_settings`. Nó là luật `for all` giữ đúng tính chất
--   "người chỉ có quyền XEM vẫn lưu được cài đặt của mình", và đụng vào nó là
--   đụng vào đường GHI. Ở đây thêm một luật SELECT riêng.
--
-- Postgres cộng dồn các `policy` cùng loại bằng HOẶC, nên luật mới chỉ nới
-- thêm cho vai `sao_luu`, không lấy bớt của ai.
drop policy if exists doc_user_settings_sao_luu on public.user_settings;
create policy doc_user_settings_sao_luu on public.user_settings
  for select to authenticated
  using (public.vai_tro(tree_id) = 'sao_luu');

-- ============================================================
-- 4. DANH SÁCH TÀI KHOẢN — thay cho Admin API
-- ============================================================
-- Vì sao phải sao lưu danh sách này: `tree_members.user_id` trỏ vào
-- `auth.users(id)`. Khôi phục `tree_members` mà không có danh sách người thì
-- mọi dòng phân quyền trỏ vào hư không — không có gì báo lỗi, chỉ là chẳng ai
-- vào được app.
--
-- Bản cũ đọc nó qua `/auth/v1/admin/users`, mà cửa ấy **bắt buộc khoá bí
-- mật**. Nay thay bằng một hàm `security definer`: hàm chạy bằng quyền của
-- người tạo ra nó nên với tới `auth.users`, còn ai được gọi thì chính thân
-- hàm quyết.
--
-- ⚠ Chỉ trả về người có chân trong đúng những cây mà người gọi đang giữ vai
--   `chu` hoặc `sao_luu`. Không bao giờ trả về toàn bộ `auth.users` — bản cũ
--   làm thế chỉ vì khoá bí mật cho phép, không phải vì cần thế.
--
-- ⚠ `search_path` khoá cứng và `auth.users` viết đủ tên: thiếu hai thứ ấy thì
--   người dùng dựng được một schema riêng chứa bảng `users` giả để lừa hàm.
create or replace function public.ds_tai_khoan()
returns table (
  id                 uuid,
  email              text,
  created_at         timestamptz,
  last_sign_in_at    timestamptz,
  email_confirmed_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select distinct
         u.id,
         u.email::text,
         u.created_at,
         u.last_sign_in_at,
         u.email_confirmed_at
    from auth.users u
    join public.tree_members tv on tv.user_id = u.id
   where tv.tree_id in (
           select tree_id
             from public.tree_members
            where user_id = auth.uid()
              and role in ('chu', 'sao_luu')
         );
$$;

-- Người chưa đăng nhập không được gọi. Không có dòng này thì `anon` — tức
-- bất kỳ ai mở trang — cũng gọi được, và tuy thân hàm lọc theo `auth.uid()`
-- (với `anon` là `null`, nên trả về rỗng), đóng sẵn vẫn hơn là tin vào một
-- phép lọc ở tầng trong.
revoke all     on function public.ds_tai_khoan() from public, anon;
grant  execute on function public.ds_tai_khoan() to authenticated;

-- ============================================================
-- 5. LIỆT KÊ TỆP TRONG KHO ẢNH
-- ============================================================
-- `02-rls.sql` mục 5 nói đúng rằng ĐỌC một tấm ảnh không cần `policy` — kho
-- `anh` để `public = true`. Nhưng **liệt kê** thì khác hẳn: nó hỏi bảng
-- `storage.objects`, và bảng ấy có RLS. Bản cũ liệt kê được chỉ nhờ khoá bí
-- mật vượt RLS; bỏ khoá ấy đi thì danh sách trả về rỗng — và **rỗng trong im
-- lặng**, đúng kiểu hỏng tệ nhất: bản sao lưu vẫn chạy xanh, vẫn ghi file,
-- chỉ là mục "có bao nhiêu ảnh chưa được chép đi đâu" luôn báo 0.
--
-- ⚠ Phép so `~ '^[0-9a-fA-F-]{36}$'` đứng TRƯỚC phép ép kiểu uuid, và thứ tự
--   ấy là bắt buộc. Kho có thể chứa tệp nằm ngay gốc (đoạn đầu không phải mã
--   cây); ép kiểu thẳng sẽ ném lỗi và làm hỏng cả câu liệt kê, chứ không phải
--   chỉ bỏ qua một dòng.
drop policy if exists liet_ke_anh on storage.objects;
create policy liet_ke_anh on storage.objects
  for select to authenticated
  using (
    bucket_id = 'anh'
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    and public.vai_tro(((storage.foldername(name))[1])::uuid) in ('chu', 'sao_luu')
  );

-- ============================================================
-- 6. SAU KHI CHẠY FILE NÀY — ba việc làm bằng tay
-- ============================================================
-- Từng bước có ảnh chụp màn hình ở `sao-luu/HUONG-DAN-SAO-LUU.md`. Tóm tắt:
--
--   1. Tạo một tài khoản Supabase riêng cho sao lưu (Authentication → Users →
--      Add user), đặt mật khẩu dài và ngẫu nhiên.
--   2. Thêm nó vào MỌI cây cần sao lưu:
--        insert into public.tree_members (tree_id, user_id, role)
--        values ('<mã cây>', '<mã tài khoản>', 'sao_luu');
--   3. Điền bốn giá trị vào Script Properties của dự án Apps Script:
--        SUPABASE_URL · KHOA_CONG_KHAI · EMAIL_SAO_LUU · MAT_KHAU_SAO_LUU
--      và **xoá hẳn** `KHOA_BI_MAT` nếu còn.
--
-- Tự kiểm rằng vai này thật sự không ghi được: đăng nhập bằng chính tài khoản
-- sao lưu trên app, thử sửa một người. Phải bị từ chối.
