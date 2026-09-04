-- ============================================================
-- giapha-supabase · luoc-do/09-doi-ma-vai.sql
-- Vai trò  : ĐỔI MÃ VAI trong bảng — 'chu' → 'quan_tri_he_thong',
--            'admin' → 'quan_tri'.
-- Chạy ở   : Supabase → SQL Editor. Chạy TRƯỚC khi dán lại 05·06·07·08·03.
-- Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 22:45
-- ============================================================
--
-- ═══ 0. NẾU CÓ GÌ ĐÓ HỎNG GIỮA CHỪNG — ĐỌC DÒNG NÀY TRƯỚC ═══
--
-- Đổi mã vai nghĩa là **đổi chính vai của tài khoản chủ dự án**. Trong lúc
-- làm, có một quãng mà dữ liệu đã mang mã mới còn vài hàm vẫn hỏi mã cũ —
-- lúc ấy app từ chối bạn ở chính gia phả của bạn. Đó là quãng bình thường,
-- không phải hỏng; dán nốt các file ở mục 1 là hết.
--
-- **Và bạn không bao giờ bị khoá thật.** Cửa sổ SQL Editor không đi qua Row
-- Level Security, nên nó luôn sửa được bảng. Câu quay về bản cũ, dán vào đó
-- là chạy được bất cứ lúc nào:
--
--     alter table public.tree_members drop constraint tree_members_role_check;
--     update public.tree_members set role = 'chu'
--      where role = 'quan_tri_he_thong';
--     update public.tree_members set role = 'admin'
--      where role = 'quan_tri';
--
-- (Quay về rồi thì dán lại các file bản CŨ — lấy bằng `git log -p`. Ràng buộc
--  cũng do chính các file ấy đặt lại, nên không phải dựng tay.)
--
-- ═══ 1. VÌ SAO ĐỔI, VÀ PHẢI DÁN NHỮNG GÌ ═══
--
-- Chủ dự án 04/09/2026: *"mình nhìn chữ chu rất không thích"*, rồi ngay sau
-- đó: *"mất công sửa này thì sửa luôn admin thành quan_tri"*. Hai mã ấy là thứ
-- hiện lên màn hình Cài đặt suốt từ đầu, và không có lý do gì để người trong
-- họ phải đọc mã của bảng.
--
-- Bốn hạng, và mã của chúng từ nay:
--
--     Quản trị hệ thống  →  `quan_tri_he_thong`   (đổi từ `chu`)
--     Quản trị viên      →  `quan_tri`            (đổi từ `admin`)
--     Thành viên         →  `sua`
--     Khách              →  `xem`
--     (tài khoản máy)    →  `sao_luu`
--
-- ⚠ **File này CHỈ đổi dữ liệu và ràng buộc.** Mã cũ còn nằm trong 11 hàm và
--   2 luật RLS đang chạy trên máy chủ. Chúng nằm ở các file 05·06·07·08·03,
--   và cách sửa chúng là **dán lại đúng những file ấy** — bản trên máy đã
--   viết mã mới rồi.
--
--   Vì sao không gộp hết vào đây cho gọn một lần dán? Vì lúc ấy thân của
--   `la_thanh_vien()` sẽ tồn tại ở HAI file, và người sửa nó lần sau sẽ sửa
--   đúng một bản. Dự án này đã tự đặt luật *"một câu hỏi một chỗ trả lời"*;
--   đổi tên một hằng số không đáng để phá luật ấy.
--
--     DÁN THEO ĐÚNG THỨ TỰ NÀY:
--
--       1. 09-doi-ma-vai.sql      ← file này (dữ liệu + ràng buộc)
--       2. 05-sao-luu.sql         ← 2 luật RLS + ds_tai_khoan()
--       3. 06-quyen-truc-he.sql   ← co_the_sua() · co_the_sua_nguoi()
--       4. 07-duyet-dang-ky.sql   ← la_thanh_vien() · xin_vao_cay() · …
--       5. 08-kiem-duyet.sql      ← co_the_quan_tri() · ghi_thang() · …
--       6. 03-ham-luu-cay.sql     ← luu_cay()  (bản 0.3.0, vốn đã phải dán)
--
--   Thứ tự 05 → 06 là bắt buộc và không đảo được: `05` đặt lại ràng buộc vai
--   **thiếu `quan_tri`** (nó có trước khi vai ấy ra đời), `06` mới thêm vào. Dán
--   06 trước rồi 05 là tự tay bỏ vai quản trị viên khỏi danh sách hợp lệ.
--
--   Dán lại 07 và 08 an toàn: cả hai có chốt chống chạy-lần-hai
--   (`xin_luc is null` ở 07, khối `do` dò cột ở 08), nên không đơn nào đang
--   xếp hàng bị duyệt bừa.
--
-- ═══ 2. ĐỔI RÀNG BUỘC VÀ DỮ LIỆU ═══
--
-- Thứ tự trong mục này KHÔNG đảo được: còn ràng buộc cũ thì lệnh `update`
-- bên dưới bị chặn ngay, vì `quan_tri_he_thong` chưa nằm trong danh sách hợp
-- lệ. Gỡ trước, đổi, rồi đặt lại danh sách mới.
--
-- ⚠ Quét MỌI ràng buộc kiểm nhắc tới `role` rồi gỡ hết — không gỡ theo tên
--   đoán mò. Đây là cái bẫy `05-sao-luu.sql` mục 1 đã gặp và ghi lại: ràng
--   buộc do `01-bang.sql` sinh ra KHÔNG được đặt tên, nên tên của nó là thứ
--   Postgres tự chọn.

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

-- ⚠ `where role = …` chứ không đổi tất: chạy lại file này lần thứ hai phải là
--   một việc vô hại. Lần hai không còn dòng nào khớp, nên không có gì xảy ra.
update public.tree_members
   set role = 'quan_tri_he_thong'
 where role = 'chu';

update public.tree_members
   set role = 'quan_tri'
 where role = 'admin';

alter table public.tree_members
  add constraint tree_members_role_check
  check (role in ('quan_tri_he_thong', 'quan_tri', 'sua', 'xem', 'sao_luu'));

-- ============================================================
-- 3. TỰ KIỂM — chạy xong nhìn bảng này
-- ============================================================
-- Hai dòng cuối là hai dòng đáng tiền, và chúng KHÔNG hỏi "tôi có nhớ sửa
-- file nào không" — chúng hỏi thẳng máy chủ *"còn chỗ nào đang nói mã cũ
-- không"*, quét toàn bộ hàm và toàn bộ luật RLS.
--
-- Ngay sau khi dán riêng file này, cả hai sẽ ra một con số KHÁC 0 — đúng như
-- vậy, vì các hàm chưa được dán lại. Dán xong bước 2→6 ở mục 1 thì chạy lại
-- khối `select` này (bôi đen từ chữ `select` cuối cùng tới hết rồi Run); lúc
-- ấy cả hai phải về **0**. Còn khác 0 nghĩa là còn sót một file chưa dán.

select 'tai khoan mang ma cu (chu hoac admin)' as muc,
       (select count(*)::text from public.tree_members
         where role in ('chu', 'admin')) as gia_tri,
       '0' as mong_doi
union all
select 'tai khoan quan tri he thong',
       (select count(*)::text from public.tree_members
         where role = 'quan_tri_he_thong'),
       '1'
union all
select 'rang buoc da nhan ca hai ma moi',
       (select case when pg_get_constraintdef(oid) ilike '%quan_tri_he_thong%'
                     and pg_get_constraintdef(oid) ilike '%''quan_tri''%'
                    then 'co' else 'CHUA' end
          from pg_constraint
         where conrelid = 'public.tree_members'::regclass
           and conname = 'tree_members_role_check'),
       'co'
union all
-- ⚠ `'admin'` phải so CÓ NHÁY, không so chữ trần. Chữ `admin` còn nằm trong
--   nhiều câu lỗi tiếng Việt và tên biến; so trần thì dòng này không bao giờ
--   về 0 và người đọc sẽ học cách bỏ qua nó — một phép luôn báo đỏ cũng vô
--   dụng ngang một phép luôn báo xanh.
select 'so HAM con nhac ma cu (phai dan lai 05-06-07-08-03)',
       (select count(*)::text from pg_proc
         where pronamespace = 'public'::regnamespace
           and (prosrc like '%''chu''%' or prosrc like '%''admin''%')),
       '0'
union all
select 'so LUAT RLS con nhac ma cu',
       (select count(*)::text from pg_policies
         where coalesce(qual, '') || coalesce(with_check, '')
               like any (array['%''chu''%', '%''admin''%'])),
       '0';
