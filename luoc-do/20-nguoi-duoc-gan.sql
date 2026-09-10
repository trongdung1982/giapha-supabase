-- ============================================================
-- giapha-supabase · luoc-do/20-nguoi-duoc-gan.sql
-- Vai trò  : b111b — sổ đăng ký tài khoản trả thêm **người được gắn**, để tấm
--            lọc *Toàn hệ thống* có cột ấy. Cộng: vá lại quyền gọi mà `15`
--            đánh rơi.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU `15-tim-kiem.sql`.
--            ⚠ Đây là bản ĐỨNG CUỐI của `ds_tai_khoan_he_thong()`. Dán lại
--            `14` hay `15` sau file này thì phải dán lại file này.
-- Phiên bản: 0.1.0 · Cập nhật: 10/09/2026 (b111b)
-- ============================================================
--
-- ═══ VÌ SAO PHẢI HỎI MÁY CHỦ, KHÔNG TÍNH ĐƯỢC Ở TRÌNH DUYỆT ═══
--
-- Tấm lọc *Toàn hệ thống* hỏi *"phần mềm này có những tài khoản nào"*. Cột
-- **Người được gắn** ở đó là một câu hỏi XUYÊN CÂY: cùng một tài khoản có mã
-- người khác nhau ở mỗi cây họ có mặt. `ds_cay_cua_tai_khoan()` trả lời được,
-- nhưng nó hỏi **một** tài khoản một lần — vẽ ba chục dòng là ba chục vòng
-- mạng cho một cái cột. Nên câu trả lời phải đi cùng chuyến với sổ đăng ký.
--
-- ═══ HAI CỘT, VÀ VÌ SAO KHÔNG PHẢI MỘT ═══
--
--   · `so_cay_gan`  — đếm. Dùng để nói *"…và 2 cây khác"* mà không phải mang
--                     cả danh sách về.
--   · `nguoi_gan`   — mảng jsonb, **trần 3 phần tử**, mỗi phần tử
--                     `{maCay, maNguoi, ten}`. Đủ để cột hiện NỘI DUNG THẬT
--                     chứ không phải một con số.
--
-- ⚠ Một con số trần trụi ở cột này là đúng thứ `15` mục 5b đã cảnh báo với
--   `vai_cao_nhat`: *"nói một nửa sự thật mà trông như cả sự thật"*. Người
--   quản trị nhìn cột **Người được gắn** là để nhận ra *"à, tài khoản này
--   chính là cụ Bắc"* — một chữ "2" không nói được câu ấy. Nên cột mang theo
--   mã và tên thật, và màn hình vẫn phải mở được bảng theo TỪNG CÂY từ chính
--   nó, vì trần 3 phần tử là một trần thật.
--
-- ⚠ CHỈ ĐẾM CHÂN THẬT (`approved`). Lời mời chưa nhận và đơn đang chờ không
--   mang mã người — `duyet_thanh_vien()` mới là chỗ điền nó — và gộp chúng vào
--   là nói người ta đã được gắn trong khi chưa.
--
-- ═══ ⚠ VÀ MỘT CHỖ HỎNG TÌM RA LÚC ĐỌC `15` ═══
--
-- `15-tim-kiem.sql` mục 5 **xoá rồi dựng lại** `ds_tai_khoan_he_thong()` và
-- `ds_cay_cua_tai_khoan()`, nhưng mục 6 của nó chỉ cấp quyền cho ba hàm MỚI —
-- hai hàm dựng lại thì không có dòng `revoke`/`grant` nào.
--
-- Mặc định của Postgres là **EXECUTE cấp cho `public`**, tức mọi vai, kể cả
-- `anon` — người chưa đăng nhập. Nên `drop function` ở `15` đã lặng lẽ **xoá
-- mất dòng `revoke` của `14` mục 11**, và từ lúc dán `15` tới nay hai hàm ấy
-- gọi được bằng khoá `anon` công khai.
--
-- Không phải lỗ hổng dữ liệu: hàng rào thật nằm TRONG thân hai hàm
-- (`where public.la_quan_tri_he_thong()`), nên `anon` gọi được và nhận về
-- **mảng rỗng**. Nhưng đó là một cửa đáng lẽ đã đóng mà nay lại mở, và luật
-- của `07` mục 8 nói thẳng: `revoke` đứng trước mọi `grant`. Vá ở mục 3.
--
-- ⚠ Bài học chung, đắt hơn chỗ hỏng này: **`drop function` xoá cả quyền gọi.**
--   File nào dựng lại một hàm đã có thì phải chép theo cả dòng `grant` của nó,
--   không thì hàm ấy âm thầm rơi về mặc định *ai cũng gọi được*.

begin;

-- ============================================================
-- 1. ds_tai_khoan_he_thong() — thêm `so_cay_gan` và `nguoi_gan`
-- ============================================================
-- ⚠ `drop` trước là BẮT BUỘC, không phải thói quen: `create or replace` gặp
--   danh sách cột khác sẽ ném `42P13 cannot change return type of existing
--   function`, và một lần dán vấp giữa file để lại máy chủ nửa vời — đúng
--   chuyện đã xảy ra sáng 08/09/2026 (`15` mục 5 kể).
--
-- ⚠ Mọi cột cũ chép NGUYÊN VĂN từ `15` mục 5, kể cả `vai_cao_nhat`. Nghĩa là
--   file này cũng mang theo bản 0.2.0 của `15` — máy chủ nào chưa kịp dán `15`
--   0.2.0 thì dán file này là có luôn cột ấy, không phải dán hai lần.

drop function if exists public.ds_tai_khoan_he_thong();

create or replace function public.ds_tai_khoan_he_thong()
returns table (
  user_id            uuid,
  email              text,
  ho_ten             text,
  vai_cao_nhat       text,
  ma_ngan            text,
  la_quan_tri_he_thong boolean,
  duoc_tao_cay       boolean,
  so_cay             bigint,
  so_cho             bigint,
  so_moi             bigint,
  so_cay_lam_chu     bigint,
  so_cay_gan         bigint,
  nguoi_gan          jsonb,
  tao_luc            timestamptz,
  dang_nhap_gan_nhat timestamptz,
  da_xac_nhan_email  boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select u.id,
         u.email::text,
         coalesce(tk.ho_ten, ''),
         -- ⚠ VAI CAO NHẤT TRONG MỌI CÂY — một dòng tóm tắt, KHÔNG phải câu
         --   trả lời đầy đủ. Chép nguyên từ `15` mục 5b; lý do đầy đủ ở đó.
         (case
            when exists (select 1 from public.trees t where t.chu_so_huu = u.id)
              then 'chu_cay'
            else coalesce((
              select m.role from public.tree_members m
               where m.user_id = u.id and m.approved
               order by case m.role
                          when 'quan_tri' then 1
                          when 'sua'      then 2
                          when 'xem'      then 3
                          when 'sao_luu'  then 4
                          else 5 end
               limit 1), '')
          end),
         coalesce(tk.ma_ngan, ''),
         coalesce(tk.la_quan_tri_he_thong, false),
         coalesce(tk.duoc_tao_cay, false),
         (select count(*) from public.tree_members m
           where m.user_id = u.id and m.approved),
         (select count(*) from public.tree_members m
           where m.user_id = u.id and not m.approved and m.moi_luc is null),
         (select count(*) from public.tree_members m
           where m.user_id = u.id and not m.approved and m.moi_luc is not null),
         (select count(*) from public.trees t where t.chu_so_huu = u.id),
         -- ⚠ `nullif(…,'')` là ĐAI AN TOÀN, không phải phép sửa một chỗ hỏng
         --   đang có — và nói đúng chuyện ấy ra vì bản nháp đầu của file này
         --   nói sai. Hôm nay `person_id = ''` **không tồn tại nổi**: khoá
         --   ngoại `tree_members_person_fk` (`06` mục 3) trỏ
         --   `(tree_id, person_id)` sang `persons(tree_id, id)`, nên chuỗi
         --   rỗng bị từ chối ngay lúc ghi — bàn thử đo được đúng câu từ chối
         --   ấy (`do-b111b.mjs`, Q5). Trạng thái *"chưa gắn"* chỉ có một hình
         --   dạng duy nhất là `null`.
         --
         --   Giữ `nullif` vì nó không tốn gì và nó còn đúng cả khi khoá ngoại
         --   kia bị gỡ — nhưng ĐỪNG đọc nó như bằng chứng rằng có dòng bẩn.
         (select count(*) from public.tree_members m
           where m.user_id = u.id and m.approved
             and nullif(m.person_id, '') is not null),
         -- Trần 3 phần tử. Sắp theo TÊN CÂY để hai lần đọc ra cùng thứ tự —
         -- một cột đổi thứ tự giữa hai lần vẽ trông như dữ liệu vừa đổi.
         coalesce((
           select jsonb_agg(x order by x->>'tenCay')
             from (
               select jsonb_build_object(
                        'treeId',  m.tree_id,
                        'tenCay',  t2.name,
                        'maCay',   t2.tree_code,
                        'maNguoi', m.person_id,
                        'ten',     coalesce(nullif(public.ten_day_du(p.names), ''),
                                            m.person_id, '')
                      ) as x
                 from public.tree_members m
                 join public.trees t2 on t2.id = m.tree_id
                 left join public.persons p
                        on p.tree_id = m.tree_id and p.id = m.person_id
                where m.user_id = u.id and m.approved
                  and nullif(m.person_id, '') is not null
                order by t2.name
                limit 3
             ) q
         ), '[]'::jsonb),
         u.created_at,
         u.last_sign_in_at,
         (u.email_confirmed_at is not null)
    from auth.users u
    left join public.tai_khoan tk on tk.user_id = u.id
   where public.la_quan_tri_he_thong()
   order by u.created_at;
$$;

-- ============================================================
-- 2. QUYỀN GỌI — cấp lại cho hàm vừa dựng lại
-- ============================================================

revoke all on function public.ds_tai_khoan_he_thong() from public, anon;
grant execute on function public.ds_tai_khoan_he_thong() to authenticated;

-- ============================================================
-- 3. VÁ CHỖ `15` ĐÁNH RƠI — xem khối đầu file
-- ============================================================
-- Hai hàm này `15` dựng lại mà không cấp lại quyền, nên chúng đang ở mặc định
-- *ai cũng gọi được*. Câu `revoke` dưới đây là câu của `14` mục 11, đặt lại.
-- Chạy được cả khi `15` chưa dán: `ds_cay_cua_tai_khoan()` có từ `14`.

revoke all on function public.ds_cay_cua_tai_khoan(uuid) from public, anon;
grant execute on function public.ds_cay_cua_tai_khoan(uuid) to authenticated;

commit;

-- ============================================================
-- 4. BẢNG TỰ KIỂM — đọc sau khi dán
-- ============================================================
-- ⚠ Bảng này chỉ hỏi *"thứ này có tồn tại và đúng hình dạng không"*. Nó KHÔNG
--   hỏi *"hàng rào có chặn được không"* — câu ấy chỉ phép đo mượn danh nghĩa
--   tài khoản mới trả lời được: `kiem-thu/ban-thu-sql/do-b111b.mjs`, ngoài
--   repo. Ngày 07/09/2026 một bảng tự kiểm 12/12 ĐẠT đã cho qua hai lỗ hổng
--   thật, và ngày 10/09/2026 chính bảng tự kiểm của `18` báo nhầm hai phép.

select ten_kiem as "Kiểm", ket_qua as "Kết quả"
from (
  select 1 as stt, 'ds_tai_khoan_he_thong() trả cột nguoi_gan' as ten_kiem,
    case when pg_get_function_result(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='ds_tai_khoan_he_thong')
         ) like '%nguoi_gan%'
         then 'ĐẠT' else 'HỎNG — màn hình không có gì để vẽ cột' end as ket_qua
  union all
  select 2, 'ds_tai_khoan_he_thong() trả cột so_cay_gan',
    case when pg_get_function_result(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='ds_tai_khoan_he_thong')
         ) like '%so_cay_gan%'
         then 'ĐẠT' else 'HỎNG — thiếu số đếm' end
  union all
  select 3, 'Vẫn còn cột vai_cao_nhat (0.2.0 của `15` đi kèm file này)',
    case when pg_get_function_result(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='ds_tai_khoan_he_thong')
         ) like '%vai_cao_nhat%'
         then 'ĐẠT' else 'HỎNG — cột Vai trò sẽ trống trơn' end
  union all
  select 4, 'Vẫn còn cột duoc_tao_cay (ô tích Tạo gia phả)',
    case when pg_get_function_result(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='ds_tai_khoan_he_thong')
         ) like '%duoc_tao_cay%'
         then 'ĐẠT' else 'HỎNG — mất ô tích của b110b' end
  union all
  select 5, 'Hàm vẫn gác bằng la_quan_tri_he_thong()',
    case when pg_get_functiondef(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='ds_tai_khoan_he_thong')
         ) like '%la_quan_tri_he_thong%'
         then 'ĐẠT' else 'HỎNG — cả sổ đăng ký hở ra' end
  union all
  select 6, 'anon KHÔNG gọi được ds_tai_khoan_he_thong()',
    case when not has_function_privilege('anon',
           'public.ds_tai_khoan_he_thong()', 'execute')
         then 'ĐẠT' else 'HỎNG — chưa revoke' end
  union all
  select 7, 'authenticated gọi được ds_tai_khoan_he_thong()',
    case when has_function_privilege('authenticated',
           'public.ds_tai_khoan_he_thong()', 'execute')
         then 'ĐẠT' else 'HỎNG — tấm lọc Toàn hệ thống sẽ báo lỗi' end
  union all
  select 8, 'anon KHÔNG gọi được ds_cay_cua_tai_khoan() — cửa `15` đánh rơi',
    case when not has_function_privilege('anon',
           'public.ds_cay_cua_tai_khoan(uuid)', 'execute')
         then 'ĐẠT' else 'HỎNG — chưa revoke' end
  union all
  select 9, 'authenticated gọi được ds_cay_cua_tai_khoan()',
    case when has_function_privilege('authenticated',
           'public.ds_cay_cua_tai_khoan(uuid)', 'execute')
         then 'ĐẠT' else 'HỎNG — bảng theo từng cây sẽ báo lỗi' end
  union all
  select 10, 'ten_day_du() có sẵn (file này gọi nó)',
    case when exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                       where n.nspname='public' and p.proname='ten_day_du')
         then 'ĐẠT' else 'HỎNG — dán 15-tim-kiem.sql trước' end
) t order by stt;
