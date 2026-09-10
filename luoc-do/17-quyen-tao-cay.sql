-- ============================================================
-- giapha-supabase · luoc-do/17-quyen-tao-cay.sql
-- Vai trò  : CỬA THỨ BẢY của luật "không ai tự đặt quyền cho mình" —
--            bật/tắt cờ `tai_khoan.duoc_tao_cay`. Đây là quyền DỰNG GIA PHẢ
--            MỚI, một quyền của TÀI KHOẢN, không thuộc cây nào, và tách hẳn
--            khỏi vai Quản trị gia phả.
-- Phiên bản: 0.1.0 · Cập nhật: 09/09/2026 (b110b)
-- ============================================================
--
-- ═══ VÌ SAO CÓ FILE NÀY ═══
--
-- Cột `tai_khoan.duoc_tao_cay` có từ `11-quyen-he-thong.sql` (b102), và hàm
-- đọc nó — `duoc_tao_cay()` — cũng có từ đó. Nhưng **không hàm nào ĐẶT được
-- cột ấy**. Nghĩa là từ b102 tới hôm nay, đường duy nhất cấp quyền dựng cây
-- cho một người là mở SQL Editor gõ `update` tay.
--
-- Chủ dự án chốt 09/09/2026, nguyên văn:
--
--   > *"quyền tạo cây cần tách riêng khỏi quyền quản trị gia phả, ở các bảng
--   > có liên quan đến tài khoản cần thêm 1 cột quyền tạo cây gia phả, muốn
--   > gán quyền cho ai thì tích vào là xong, đây là đặc quyền của tài khoản
--   > quản trị hệ thống."*
--
-- ⚠ **TÁCH RIÊNG là phần quan trọng nhất của câu ấy.** Ba hạng dễ bị gộp:
--
--   · **Quản trị gia phả** (`tree_members.role = 'quan_tri'`) — quyền THEO
--     CÂY. Sửa và duyệt nội dung của đúng cây ấy. **Không** dựng được cây mới.
--   · **Chủ cây** (`trees.chu_so_huu`) — cũng THEO CÂY. Đổi được quyền trong
--     cây mình. Cũng **không** vì thế mà dựng được cây thứ hai.
--   · **Được tạo cây** (`tai_khoan.duoc_tao_cay`) — quyền của TÀI KHOẢN,
--     không hỏi cây nào cả. Đây là cờ file này đặt.
--
--   Gộp chúng lại là mở một đường leo thang không ai nhìn thấy: người được
--   phong Quản trị gia phả của một cây sẽ dựng được cây riêng, rồi trong cây
--   riêng ấy họ là chủ — tức tự cấp cho mình đúng cái quyền đổi quyền mà
--   `13` mục 8 dựng cả một luật để chặn.
--
-- ═══ CỬA THỨ BẢY, VÀ NÓ GÁC ĐÚNG CÂU CỦA SÁU CỬA KIA ═══
--
-- `THIET-KE-NHIEU-CAY.md` mục 11.3 và 11.5 đếm sáu cửa của luật *không ai tự
-- đặt quyền cho mình*: đổi vai · gắn mã người · bật tin cậy · duyệt đơn vào
-- cây · mời vào cây · cờ Quản trị hệ thống. Cờ này là cửa thứ bảy, và nó
-- chặn bằng đúng một câu: `la_chinh_minh(p_user)` thì từ chối.
--
-- ⚠ Chặn tự-bật KHÔNG lấy đi khả năng nào của Quản trị hệ thống: hàm
--   `duoc_tao_cay()` của `11` mục 11 đã trả `true` cho họ qua nhánh
--   `la_quan_tri_he_thong()`, không cần cột. Đúng lý lẽ của mục 11.3:
--   *một luật không ngoại lệ thì kiểm được; một luật có một ngoại lệ thì
--   phải kiểm cả ngoại lệ, và ngoại lệ là chỗ lỗ hổng hay nằm.*
--
-- ⚠ **KHÔNG có phép "không tắt được người cuối cùng"** như
--   `dat_quan_tri_he_thong()` có. Hai cờ khác nhau ở chỗ này: tắt hết Quản
--   trị hệ thống là khoá cả nhà rồi vứt chìa — không ai bật lại được. Tắt hết
--   `duoc_tao_cay` thì Quản trị hệ thống **vẫn dựng được cây** (nhánh trên),
--   nên không có cửa nào đóng lại vĩnh viễn. Thêm một phép đếm ở đây là thêm
--   một câu từ chối không bảo vệ điều gì.
--
-- ═══ THỨ TỰ DÁN ═══
--
-- File này dán SAU `11-quyen-he-thong.sql` (nó cần bảng `tai_khoan`) và SAU
-- `13-quan-ly-thanh-vien.sql` (nó gọi `la_chinh_minh()`). Nó **không định
-- nghĩa đè hàm nào của file khác**, nên nó không nằm trong hai chuỗi dán lại
-- đã ghi ở đầu `16-thung-rac-cay.sql`. Dán một lần là xong; dán lại `11`,
-- `13`, `14`, `15`, `16` đều không xoá mất nó.
--
-- ⚠ Ngược lại thì có một chỗ phải nhớ: dán lại `11` là **dựng lại cột**
--   `duoc_tao_cay` với `default false` — nếu `11` dùng `create table` chứ
--   không `create table if not exists` thì mọi cờ đã cấp về `false`. Đọc đầu
--   `11` trước khi dán lại nó.
--
-- ═══ PHÉP ĐO ═══
--
-- Bảng tự kiểm cuối file chỉ hỏi *"thứ này có tồn tại không"*. Phép đo thật —
-- gọi hàm bằng danh nghĩa mượn của từng tài khoản — nằm ở
-- `kiem-thu/ban-thu-sql/do-b110b.mjs` (ngoài repo, chỉ có trên máy này).
-- Bài học b102 chép lại một lần nữa: một bảng tự kiểm 12/12 ĐẠT đã từng đứng
-- cạnh hai lỗ hổng leo quyền.

begin;

-- ============================================================
-- 1. dat_duoc_tao_cay(p_user, p_bat) — CỬA THỨ BẢY
-- ============================================================
-- Ai gọi được: **chỉ Quản trị hệ thống**. Không phải chủ cây, không phải
-- Quản trị gia phả — cấp quyền dựng cây là việc cấp hệ thống, và cây mới
-- sinh ra không thuộc cây nào của người cấp.
--
-- ⚠ Hàm KHÔNG nhận `p_tree`, và đó là cả điểm của nó. Mọi cửa đổi quyền khác
--   trong dự án đều bắt truyền `p_tree` tường minh (`THIET-KE-NHIEU-CAY.md`
--   mục 8 Hỏng 3 kể vì sao). Hai cửa duy nhất KHÔNG có `p_tree` là cửa này
--   và `dat_quan_tri_he_thong()` — vì cả hai đặt cờ ở tầng TÀI KHOẢN. Thêm
--   `p_tree` vào đây là nói dối về phạm vi: cờ bật một lần thì người ấy dựng
--   được cây ở mọi nơi, không riêng cây nào.

create or replace function public.dat_duoc_tao_cay(
  p_user uuid,
  p_bat  boolean
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.la_quan_tri_he_thong() then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ Quản trị hệ thống mới cấp được quyền dựng gia phả mới.');
  end if;

  -- Cửa thứ bảy. Xem khối đầu file: chặn ở đây không lấy đi khả năng nào,
  -- vì Quản trị hệ thống đã dựng được cây qua nhánh khác của `duoc_tao_cay()`.
  if public.la_chinh_minh(p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai đặt quyền cho chính mình được, kể cả quyền dựng gia phả. ' ||
      'Nhờ một Quản trị hệ thống khác làm.');
  end if;

  if not exists (select 1 from auth.users where id = p_user) then
    return jsonb_build_object('ok', false, 'loi', 'Không có tài khoản này.');
  end if;

  -- ⚠ `insert … on conflict` chứ không `update` trần, và KHÔNG gọi
  --   `tao_ma_ngan_tai_khoan()`: **nó là hàm TRIGGER**, gọi thẳng thì Postgres
  --   ném `trigger functions can only be called as triggers`. Bản nháp b107
  --   vấp đúng chỗ ấy và bảng tự kiểm vẫn báo ĐẠT — nó chỉ hỏi *hàm có tồn
  --   tại không*. Công thức sinh mã dưới đây chép nguyên của `14` mục 7, để
  --   hai chỗ sinh mã cùng một hình dạng.
  --
  --   Dòng `tai_khoan` đáng lẽ đã có sẵn (trigger `sau_khi_tao_user` của `11`
  --   mục 2); `insert` là đường lùi cho một tài khoản cũ lọt lưới, và cột
  --   `ma_ngan` là `not null unique` nên phải điền.
  insert into public.tai_khoan (user_id, ma_ngan, duoc_tao_cay)
  values (p_user,
          left(upper(translate(md5(p_user::text), '0123456789abcdef', '23456789ABCDEFGH')), 6),
          coalesce(p_bat, false))
  on conflict (user_id) do update
    set duoc_tao_cay = coalesce(p_bat, false);

  return jsonb_build_object('ok', true, 'bat', coalesce(p_bat, false));
end;
$$;

-- ============================================================
-- 2. QUYỀN GỌI
-- ============================================================
-- ⚠ `revoke … from public, anon` TRƯỚC `grant`, đúng khuôn `07` mục 8 và
--   `14` mục 11: mặc định của Postgres là mọi vai đều gọi được, kể cả `anon`
--   — tức người chưa đăng nhập. Quên dòng này là mở cửa cho cả internet gọi
--   một hàm `security definer`.

revoke all on function public.dat_duoc_tao_cay(uuid, boolean) from public, anon;
grant execute on function public.dat_duoc_tao_cay(uuid, boolean) to authenticated;

commit;

-- ============================================================
-- 3. BẢNG TỰ KIỂM — đọc sau khi dán
-- ============================================================
-- ⚠ Bảng này chỉ hỏi *"thứ này có tồn tại không"*, KHÔNG hỏi *"nó có chặn
--   được không"*. Phép đo thật là `kiem-thu/ban-thu-sql/do-b110b.mjs`.

select ten_kiem as "Kiểm", ket_qua as "Kết quả"
from (
  select 1 as stt, 'Cột duoc_tao_cay còn nguyên trong tai_khoan' as ten_kiem,
    case when exists (select 1 from information_schema.columns
                       where table_schema='public' and table_name='tai_khoan'
                         and column_name='duoc_tao_cay')
         then 'ĐẠT' else 'HỎNG — chưa dán 11-quyen-he-thong.sql' end as ket_qua
  union all
  select 2, 'Hàm dat_duoc_tao_cay() đã có',
    case when exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                       where n.nspname='public' and p.proname='dat_duoc_tao_cay')
         then 'ĐẠT' else 'HỎNG — thiếu hàm' end
  union all
  select 3, 'anon KHÔNG gọi được hàm ấy',
    case when not has_function_privilege('anon',
           'public.dat_duoc_tao_cay(uuid, boolean)', 'execute')
         then 'ĐẠT' else 'HỎNG — anon gọi được' end
  union all
  select 4, 'authenticated gọi được (hàng rào nằm TRONG thân hàm)',
    case when has_function_privilege('authenticated',
           'public.dat_duoc_tao_cay(uuid, boolean)', 'execute')
         then 'ĐẠT' else 'HỎNG — chưa cấp quyền gọi' end
  union all
  select 5, 'Hàm có gác la_quan_tri_he_thong()',
    case when pg_get_functiondef(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='dat_duoc_tao_cay')
         ) like '%la_quan_tri_he_thong%'
         then 'ĐẠT' else 'HỎNG — ai cũng cấp được quyền' end
  union all
  select 6, 'Hàm có gác la_chinh_minh() — cửa thứ bảy',
    case when pg_get_functiondef(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='dat_duoc_tao_cay')
         ) like '%la_chinh_minh%'
         then 'ĐẠT' else 'HỎNG — tự bật cờ cho mình được' end
  union all
  select 7, 'Hàm KHÔNG nhận p_tree — cờ ở tầng tài khoản',
    case when (select pg_get_function_identity_arguments(p.oid)
                 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                where n.nspname='public' and p.proname='dat_duoc_tao_cay')
              not like '%p_tree%'
         then 'ĐẠT' else 'HỎNG — cờ tài khoản mà hỏi cây' end
  union all
  select 8, 'ds_tai_khoan_he_thong() vẫn trả cột duoc_tao_cay',
    case when pg_get_function_result(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='ds_tai_khoan_he_thong')
         ) like '%duoc_tao_cay%'
         then 'ĐẠT' else 'HỎNG — màn hình không đọc được cờ để vẽ ô tích' end
) t order by stt;
