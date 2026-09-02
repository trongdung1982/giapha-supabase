-- ============================================================
-- giapha-supabase · luoc-do/04-view-ma-da-dung.sql
-- Vai trò  : Khung nhìn gom mọi MÃ từng xuất hiện trong nhật ký thay đổi.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU 03-ham-luu-cay.sql.
-- Phiên bản: 0.1.0 · Cập nhật: 02/09/2026 22:45
-- ============================================================
--
-- ═══ VÌ SAO CÓ FILE NÀY ═══
--
-- `utils/id.js` sinh mã người mới bằng cách tìm số lớn nhất đã từng dùng, và
-- nó quét **cả `changeLog`** chứ không chỉ quét danh sách người đang có. Lời
-- giải thích nằm ngay trong file ấy, và nó đáng chép lại:
--
--   *"Cấp lại một mã đã dùng là kiểu hỏng tệ nhất trong gia phả: không có gì
--   báo lỗi, chỉ là mọi câu chuyện cũ về mã ấy lặng lẽ dính sang một người
--   khác."*
--
-- Trên Drive, cả `changeLog` nằm sẵn trong file JSON nên quét là miễn phí. Ở
-- đây nó là một bảng riêng, mọc dài mãi, và tải trọn nó về chỉ để tìm mấy con
-- số là lãng phí ngày một lớn.
--
-- Nhưng **cắt bớt thì không được** — cắt đúng chỗ chứa mã lớn nhất là cấp
-- lại mã ấy, tức là dựng lại đúng cái hỏng vừa nói ở trên. Nên thay vì cắt,
-- khung nhìn này rút gọn theo chiều khác: chỉ trả về **danh sách mã**, bỏ
-- hết ngày giờ, người sửa, và giá trị cũ/mới. `id.js` cũng chỉ đọc tới đó —
-- nó nhìn `target` và các KHOÁ của `diff`, không bao giờ nhìn giá trị.
--
-- Vài trăm chuỗi ngắn thay cho cả bảng nhật ký, mà không bỏ sót mã nào.
--
-- ⚠ `security_invoker = true` là bắt buộc. Không có nó, khung nhìn chạy bằng
--   quyền của người TẠO ra nó và trả về mã của mọi cây cho mọi người — RLS ở
--   `02-rls.sql` bị vòng qua mà không có gì báo.

create or replace view public.v_ma_nhat_ky
with (security_invoker = true) as
  -- Mã của bản ghi bị tác động
  select tree_id, target as ma
    from public.change_log
   where target is not null and target <> ''
  union
  -- Mã nằm trong khoá của `diff`, ví dụ "P0001.birth.iso"
  select cl.tree_id, k
    from public.change_log cl,
         lateral jsonb_object_keys(cl.diff) k;
