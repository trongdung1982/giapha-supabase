-- ============================================================
-- giapha-supabase · luoc-do/12-tao-cay.sql
-- Vai trò  : Dựng gia phả MỚI từ trong app — ràng buộc `unique` trên mã cây,
--            và hàm `tao_gia_pha_moi()` đẻ `trees` + `tree_members` trong
--            CÙNG MỘT giao dịch.
-- Chạy ở   : Supabase → SQL Editor → dán → Run.
--            Chạy SAU 11-quyen-he-thong.sql (bản 0.3.1 trở lên).
-- Phiên bản: 0.1.0 · Cập nhật: 08/09/2026 15:01
--
-- ⚠ File này DÁN LẠI ĐƯỢC: ràng buộc kiểm sự tồn tại trước khi thêm, hàm dùng
--   `create or replace`. Danh sách cột trả về không có (hàm trả `jsonb`), nên
--   nó KHÔNG dính lỗi 42P13 mà `11` đã vấp ngày 08/09 — xem đầu file ấy.
--
-- Nguồn thiết kế: THIET-KE-NHIEU-CAY.md mục 7 (đọc trước file này).
-- Phép đo: `kiem-thu/ban-thu-sql/do-b104.mjs` (ngoài repo) — nó MƯỢN DANH
--          NGHĨA tài khoản bằng `set local role authenticated`, nên nó đo
--          HÀNG RÀO chứ không chỉ hỏi hàm. Khác biệt ấy là chỗ b102 bắt được
--          hai lỗ hổng mà bảng tự kiểm 12/12 báo xanh.
-- ============================================================
--
-- ═══ MỘT CHỖ LỆCH KHỎI TÀI LIỆU THIẾT KẾ, VÀ LÝ DO ĐO ĐƯỢC ═══
--
-- `THIET-KE-NHIEU-CAY.md` mục 7 viết người tạo cây nhận vai **`quan_tri`**.
-- File này cấp **`quan_tri_he_thong`** trong `tree_members`. Ba phép đo dẫn
-- tới chỗ lệch ấy:
--
--   1. Hai cây đang chạy (`NTB`, `NPGQ8C9`) đều gán chủ cây vai
--      `quan_tri_he_thong`. Cấp `quan_tri` là đẻ ra một hạng chủ cây THỨ HAI,
--      yếu hơn hạng đang có, mà không ai giải thích được vì sao.
--   2. `co_the_quan_tri()` của `08-kiem-duyet.sql` mục 8 chỉ nhận **đúng một
--      vai**: `quan_tri_he_thong`. Mà `duyet_thanh_vien()` và
--      `tu_choi_thanh_vien()` đều gác bằng hàm ấy. Nên người dựng cây mà mang
--      vai `quan_tri` thì **không duyệt được đơn xin vào cây của chính mình**
--      — họ phải đi nhờ Quản trị hệ thống từng lần một. Đó là hỏng đúng chỗ
--      b104 sinh ra để mở: cho người trong họ dựng cây riêng, tự đứng được.
--   3. `di-doi/sinh-sql-di-doi.mjs` (b100) — đường tạo cây DUY NHẤT đang có —
--      cấp `quan_tri_he_thong`, và chính nó ghi chú rằng đường đúng về sau là
--      `tao_gia_pha_moi()` của b104. Cấp vai khác đi là hai đường tạo cây cho
--      ra hai loại chủ cây khác nhau.
--
-- ⚠ VÀ VÌ SAO ĐIỀU ẤY KHÔNG PHẢI LỖ HỔNG: `quan_tri_he_thong` trong
--   `tree_members` là quyền **theo cây** — mọi hàm hỏi nó đều hỏi qua
--   `vai_tro(p_tree)`, tức luôn kèm một mã cây. Quản trị **toàn hệ thống** thì
--   đọc ở chỗ khác hẳn: cờ `tai_khoan.la_quan_tri_he_thong`, và
--   `la_quan_tri_he_thong()` không nhìn `tree_members` một dòng nào. Người
--   dựng cây mới vì thế là chủ ở cây họ dựng, và là người lạ ở mọi cây khác.
--   Đã đo: `do-b104.mjs` hàng rào 4.
--
--   Cái giá còn lại là **tên gọi**: một mã vai mang chữ "hệ thống" mà nghĩa
--   chỉ trong một cây. Đổi tên mã là dán lại năm file như ngày 04/09 (`chu` →
--   `quan_tri_he_thong`, đo được: 11 hàm, 2 luật RLS, 1 ràng buộc, cả dữ
--   liệu). Không đáng, nhưng phải ghi ra để người đọc sau không tưởng là nhầm.

-- ============================================================
-- 1. RÀNG BUỘC `unique` TRÊN trees.tree_code
-- ============================================================
-- ⚠ `tree_code_hop_le` của `01-bang.sql` chỉ canh HÌNH DẠNG (chữ hoa, số,
--   gạch dưới). Nó không canh TRÙNG. Hai cây cùng mã `NTB` thì mã người
--   `NTB_P0013` hết là duy nhất — và cột `noi_ve` của b109 sẽ trỏ vào chỗ mập
--   mờ mà không có cách nào phân giải.
--
-- ⚠ Postgres không có `add constraint if not exists`, nên phải hỏi
--   `pg_constraint` trước. Và phải hỏi TRÙNG trước khi thêm: nếu dữ liệu đang
--   có hai cây cùng mã thì câu `alter` ném lỗi thô, còn khối này nói ra đúng
--   mã nào trùng để người dán biết phải sửa gì.

do $$
declare
  v_trung text;
begin
  if exists (
    select 1 from pg_constraint
     where conrelid = 'public.trees'::regclass
       and conname  = 'trees_tree_code_unique'
  ) then
    raise notice 'Ràng buộc trees_tree_code_unique đã có — bỏ qua.';
    return;
  end if;

  select string_agg(tree_code, ', ') into v_trung
    from (
      select tree_code from public.trees
       group by tree_code having count(*) > 1
    ) x;

  if v_trung is not null then
    raise exception 'Không thêm được ràng buộc: đang có mã cây trùng nhau (%). '
                    'Sửa mã cho khác nhau rồi chạy lại file này.', v_trung;
  end if;

  alter table public.trees add constraint trees_tree_code_unique unique (tree_code);
  raise notice 'Đã thêm ràng buộc trees_tree_code_unique.';
end $$;

-- ============================================================
-- 2. HÀM tao_gia_pha_moi(p_ten, p_ma_cay, p_note)
-- ============================================================
-- `02-rls.sql` cố ý KHÔNG cấp cho trình duyệt quyền ghi vào `trees`. Nên cửa
-- duy nhất để dựng cây là một hàm `security definer` — đúng cùng khuôn với
-- `luu_cay()`: đóng hẳn đường ghi rồi mở đúng một cửa có người gác.
--
-- ⚠⚠ HAI CÂU `insert` KHÔNG ĐƯỢC TÁCH RỜI. Đẻ ra một dòng `trees` mà không đẻ
--   dòng `tree_members` là đẻ ra một cây **không ai vào được, kể cả người vừa
--   tạo** — và vì RLS chặn, chính họ cũng không xoá được nó. Chỉ dọn được
--   bằng SQL Editor. Ở đây cả hai nằm trong thân một hàm plpgsql, tức trong
--   cùng một giao dịch: câu thứ hai hỏng thì câu thứ nhất tự lùi.
--
-- ⚠ Vì sao KHÔNG tự sinh mã cây từ tên: mã cây là thứ hiện ra cho người dùng
--   đọc, và là thứ b109 ghép vào mã người (`NTB_P0013`) để trỏ xuyên cây. Máy
--   đoán hộ thì người ta nhận một chuỗi không nhận ra là của mình, và đổi lại
--   thì phải đổi cả những chỗ đã trỏ tới. Màn hình GỢI Ý một mã, người bấm quyết.
--
-- ⚠ MỘT CHỖ DỄ ĐỌC NHẦM DỮ LIỆU, VẤP PHẢI 08/09/2026: nhìn vào bảng `persons`
--   hôm nay chỉ thấy `P0001…P0681` — không mã nào mang tiền tố — và rất dễ kết
--   luận rằng mã cây không dính gì tới mã người. **Sai.** Hai loại mã cùng sống
--   trong một cây:
--     · mã ĐỜI CŨ (`P0001`) — di dời nguyên văn từ bản Apps Script, cố ý giữ;
--     · mã MỚI (`LEBN_P0001`) — `utils/id.js` `nextId()` gắn tiền tố mỗi khi app
--       thêm người, vì `hinh-dang.js` điền `tree.treeCode` lúc nạp.
--   Bảng chưa có mã loại hai chỉ vì chưa ai thêm người mới kể từ ngày di dời.
--   `persons_pkey` là `(tree_id, id)` nên cả hai loại đều duy nhất trong cây.
--
--   Bài học chung hơn, và nó đã suýt đi vào tài liệu: **đọc dữ liệu di dời rồi
--   kết luận về hành vi của app là đo nhầm vật.** Dữ liệu ấy kể chuyện bản
--   Apps Script, không kể chuyện mã đang chạy.

create or replace function public.tao_gia_pha_moi(
  p_ten    text,
  p_ma_cay text,
  p_note   text default ''
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_ten   text;
  v_ma    text;
  v_email text;
  v_tree  uuid;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'lyDo', 'Chưa đăng nhập.');
  end if;

  -- ⚠ Hàng rào quyền đứng TRƯỚC mọi phép kiểm hình dạng. Người không được cấp
  --   quyền tạo cây thì không cần biết mã nào còn trống — và câu trả lời phải
  --   giống nhau dù họ gõ gì, nếu không thì chính câu lỗi thành công cụ dò.
  if not public.duoc_tao_cay() then
    return jsonb_build_object('ok', false, 'lyDo',
      'Bạn chưa được cấp quyền dựng gia phả mới. Hãy hỏi Quản trị hệ thống.');
  end if;

  v_ten := btrim(coalesce(p_ten, ''));
  if v_ten = '' then
    return jsonb_build_object('ok', false, 'lyDo', 'Chưa đặt tên cho gia phả.');
  end if;
  if length(v_ten) > 120 then
    return jsonb_build_object('ok', false, 'lyDo',
      'Tên gia phả dài quá 120 chữ cái.');
  end if;

  -- Chữ thường gõ vào thì nâng lên chữ hoa, vì `tree_code_hop_le` chỉ nhận
  -- chữ hoa. Dấu tiếng Việt và khoảng trắng thì KHÔNG tự bỏ — chúng đổi mã
  -- thành một chuỗi khác hẳn thứ người ta gõ, mà mã cây là thứ họ phải đọc
  -- lại về sau. Từ chối và nói rõ, để người bấm sửa.
  v_ma := upper(btrim(coalesce(p_ma_cay, '')));
  if v_ma = '' then
    return jsonb_build_object('ok', false, 'lyDo', 'Chưa đặt mã cho gia phả.');
  end if;
  -- ⚠ KHUÔN NÀY HẸP HƠN `tree_code_hop_le` CỦA `01-bang.sql`, và cố ý.
  --   Ràng buộc bảng nhận `^[A-Z0-9_]+$`; `utils/id.js` thì chỉ nhận
  --   `^[A-Z][A-Z0-9]{0,13}$` — không gạch dưới, ký tự đầu phải là chữ.
  --   Mã `LE_BN` hay `1LE` vì thế qua được cơ sở dữ liệu mà `maCayCuaCay()`
  --   coi như cây KHÔNG có mã, nên `nextId()` sinh mã đời cũ `P0001` không
  --   tiền tố — hỏng lặng lẽ, không câu lỗi nào, và chỉ lộ ra khi ai đó hỏi
  --   "người này thuộc cây nào" trên một mã trần.
  --   Cửa hẹp hơn phải đứng ở chỗ NGƯỜI GÕ, không phải ở chỗ sâu nhất.
  if v_ma !~ '^[A-Z][A-Z0-9]*$' then
    return jsonb_build_object('ok', false, 'lyDo',
      'Mã gia phả phải bắt đầu bằng chữ cái, và chỉ gồm chữ cái không dấu '
      || 'cùng chữ số — không dấu cách, không gạch dưới. Ví dụ: NTB, LEBACNINH.');
  end if;
  -- Trần 16: mã cây thành TIỀN TỐ của mọi mã người sinh ra từ nay
  -- (`LEBN_P0001` — `utils/id.js` `nextId()`), và mã người thì hiện trên màn
  -- hình. Sàn 2 để không có mã một ký tự đọc lên nghe như lỗi gõ.
  --
  -- ⚠ `utils/id.js` nhận mã cây theo khuôn `^[A-Z][A-Z0-9]{0,13}$` — hẹp hơn
  --   khuôn ở đây hai chỗ: nó đòi ký tự ĐẦU là chữ cái, và nó KHÔNG nhận gạch
  --   dưới. Mã `1LE` hay `LE_BN` qua được hàm này nhưng `maCayCuaCay()` sẽ coi
  --   như cây không có mã, và người thêm mới nhận mã đời cũ `P0001` không tiền
  --   tố — lặng lẽ, không báo lỗi. Nên hàng rào dưới đây đi theo khuôn HẸP.
  -- Trần 14 = đúng trần của `KHUON_MA_CAY` trong `utils/id.js` (1 + 13).
  if length(v_ma) < 2 or length(v_ma) > 14 then
    return jsonb_build_object('ok', false, 'lyDo',
      'Mã gia phả phải dài từ 2 tới 14 ký tự.');
  end if;

  if exists (select 1 from public.trees where tree_code = v_ma) then
    return jsonb_build_object('ok', false, 'lyDo',
      'Mã ' || v_ma || ' đã có gia phả khác dùng. Hãy chọn mã khác.');
  end if;

  select email into v_email from auth.users where id = auth.uid();

  insert into public.trees (tree_code, name, note, chu_so_huu, updated_by)
  values (v_ma, v_ten, btrim(coalesce(p_note, '')), auth.uid(), coalesce(v_email, ''))
  returning id into v_tree;

  -- ⚠ VAI `quan_tri_he_thong` LÀ CÓ CHỦ Ý — xem khối đầu file. Nó là quyền
  --   THEO CÂY (mọi nơi hỏi nó đều hỏi qua `vai_tro(p_tree)`), không phải
  --   quyền toàn hệ thống — cờ ấy nằm ở `tai_khoan.la_quan_tri_he_thong`.
  --
  -- ⚠ `approved = true`: người dựng cây không xếp hàng chờ chính mình duyệt.
  --   Cùng lẽ với ba vai đi tắt của `07-duyet-dang-ky.sql` mục 3.
  insert into public.tree_members (tree_id, user_id, role, email, approved)
  values (v_tree, auth.uid(), 'quan_tri_he_thong', coalesce(v_email, ''), true);

  return jsonb_build_object(
    'ok', true,
    'cay', jsonb_build_object('id', v_tree, 'ten', v_ten, 'maCay', v_ma)
  );

exception
  -- Hai người bấm Tạo cùng một mã trong cùng một khoảnh khắc: phép kiểm
  -- `exists` ở trên chạy trước cả hai lần `insert`, nên nó cho qua cả hai và
  -- ràng buộc `unique` mới là thứ chặn. Bắt lại ở đây để người thua cuộc nhận
  -- một câu tiếng Việt thay vì mã lỗi Postgres.
  when unique_violation then
    return jsonb_build_object('ok', false, 'lyDo',
      'Mã ' || v_ma || ' vừa có người khác dùng mất. Hãy chọn mã khác.');
end;
$$;

-- ============================================================
-- 3. CẤP QUYỀN GỌI HÀM
-- ============================================================
-- ⚠ KHÔNG cấp cho `anon`: hàm đọc `auth.uid()`, và người chưa đăng nhập thì
--   `duoc_tao_cay()` trả `false` — nhưng cấp quyền cho một vai không có việc
--   gì ở đây là mở rộng bề mặt tấn công mà không đổi lấy gì. Cùng lý lẽ với
--   `11-quyen-he-thong.sql` mục 17.

revoke all on function public.tao_gia_pha_moi(text, text, text) from public, anon;
grant execute on function public.tao_gia_pha_moi(text, text, text) to authenticated;

-- ============================================================
-- 4. BẢNG TỰ KIỂM — đọc sau khi dán, xác nhận trước khi bấm thử
-- ============================================================
-- ⚠ Bảng này hỏi *"thứ này có tồn tại và có đúng hình dạng không"*. Nó KHÔNG
--   hỏi *"hàng rào có chặn được không"* — câu ấy chỉ phép đo mượn danh nghĩa
--   tài khoản mới trả lời được (`do-b104.mjs`). Ngày 07/09/2026 một bảng tự
--   kiểm 12/12 ĐẠT đã cho qua hai lỗ hổng thật; đọc bảng này với đúng chừng
--   ấy lòng tin.

select
  ten_kiem as "Kiểm",
  ket_qua  as "Kết quả"
from (
  -- 1. Ràng buộc unique đã có
  select 1 as stt,
    'trees.tree_code có ràng buộc unique' as ten_kiem,
    case when exists (
      select 1 from pg_constraint
       where conrelid = 'public.trees'::regclass
         and conname  = 'trees_tree_code_unique'
    ) then 'ĐẠT'
    else 'HỎNG — hai cây có thể trùng mã, và mã người hết là duy nhất' end as ket_qua

  union all

  -- 2. Hàm tồn tại, đúng ba tham số
  select 2,
    'Hàm tao_gia_pha_moi(text, text, text) tồn tại',
    case when to_regprocedure('public.tao_gia_pha_moi(text, text, text)') is not null
      then 'ĐẠT' else 'HỎNG — nút Tạo gia phả mới sẽ báo không tìm thấy hàm' end

  union all

  -- 3. Hàm phải là security definer
  -- Không có cờ này thì hàm chạy bằng quyền người gọi, mà `02-rls.sql` không
  -- cho trình duyệt ghi vào `trees` — nút Tạo sẽ hỏng với một câu lỗi RLS
  -- khó hiểu thay vì dựng được cây.
  select 3,
    'tao_gia_pha_moi là security definer',
    case when (
      select p.prosecdef from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'tao_gia_pha_moi'
    ) then 'ĐẠT' else 'HỎNG — hàm chạy bằng quyền người gọi, RLS sẽ chặn' end

  union all

  -- 4. Hàm có hỏi duoc_tao_cay() không
  -- ⚠ Đây là hàng rào quyền DUY NHẤT của bước này. Mất nó thì mọi tài khoản
  --   đã đăng nhập dựng được cây, và không có gì báo lỗi.
  select 4,
    'tao_gia_pha_moi() có hỏi duoc_tao_cay()',
    case when (
      select p.prosrc from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'tao_gia_pha_moi'
    ) ilike '%duoc_tao_cay%' then 'ĐẠT'
    else 'HỎNG — AI CŨNG DỰNG ĐƯỢC CÂY. Dừng lại, đừng dùng tiếp.' end

  union all

  -- 5. Hàm có đẻ dòng tree_members không (bẫy lớn nhất của bước)
  select 5,
    'tao_gia_pha_moi() có chèn tree_members',
    case when (
      select p.prosrc from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'tao_gia_pha_moi'
    ) ilike '%insert into public.tree_members%' then 'ĐẠT'
    else 'HỎNG — cây đẻ ra sẽ KHÔNG AI VÀO ĐƯỢC, kể cả người vừa tạo' end

  union all

  -- 6. Không cấp quyền gọi cho anon
  select 6,
    'anon KHÔNG gọi được tao_gia_pha_moi()',
    case when not has_function_privilege('anon',
      'public.tao_gia_pha_moi(text, text, text)', 'execute')
      then 'ĐẠT' else 'CẦN CHÚ Ý — anon gọi được (không thủng, nhưng thừa)' end

  union all

  -- 7. Số cây đang có — để đối chiếu trước/sau khi bấm thử
  select 7,
    'Số gia phả đang có: ' || (select count(*)::text from public.trees),
    'ghi nhớ — bấm Tạo xong con số này phải tăng đúng 1'

) t
order by stt;
