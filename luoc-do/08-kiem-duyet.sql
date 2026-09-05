-- ============================================================
-- giapha-supabase · luoc-do/08-kiem-duyet.sql
-- Vai trò  : KIỂM DUYỆT NỘI DUNG. Mỗi lần Lưu của thành viên treo cờ chờ;
--            quản trị viên duyệt thì thành chính thức, từ chối thì HOÀN TÁC.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU 07-duyet-dang-ky.sql.
-- ⚠ Chạy xong PHẢI dán lại 03-ham-luu-cay.sql — xem mục 0 ngay dưới.
-- Phiên bản: 0.1.2 · Cập nhật: 04/09/2026 22:45
-- ============================================================
-- ⚠⚠ BỐN HÀM CỦA FILE NÀY ĐÃ BỊ ĐỊNH NGHĨA LẠI Ở `10-sua-nhieu-cay.sql`
--    (05/09/2026): `trang_thai_cua_toi` · `xin_vao_cay` · `ds_cho_duyet` ·
--    `ds_kiem_duyet` · `dem_cho_kiem_duyet` — tuỳ file. Bản trong file này
--    tự chọn cây bằng `(select id from public.trees limit 1)`, và câu ấy
--    trả về cây NÀO TUỲ Ý khi máy chủ có nhiều hơn một cây.
--
--    Nên: **dán lại file này thì phải dán lại `10-sua-nhieu-cay.sql` ngay
--    sau đó**, nếu không là lùi về bản đoán cây, và nó không báo lỗi gì —
--    chỉ trả lời về nhầm cây, im lặng.
--
-- ═══ TÊN GỌI: BỐN HẠNG NGƯỜI, VÀ MÃ CỦA CHÚNG TRONG BẢNG ═══
--
-- Chủ dự án chốt cách gọi 04/09/2026. Chữ bên trái là thứ hiện ra cho
-- người đọc; chữ bên phải là giá trị nằm trong `tree_members.role`.
--
--   Quản trị hệ thống  →  `quan_tri_he_thong`  duy nhất một người, không ai gỡ được
--   Quản trị viên      →  `quan_tri`     kiểm duyệt nội dung, cấp cho nhiều người
--   Thành viên         →  `sua`       sửa được trực hệ của mình
--   Khách              →  `xem`       chỉ xem
--   (tài khoản máy)    →  `sao_luu`   không phải một người
--
-- ⚠ **Mã `chu` đã đổi thành `quan_tri_he_thong`** cùng ngày, sau khi chủ dự
--   án nói *"mình nhìn chữ chu rất không thích"*. Việc đổi nằm ở
--   `09-doi-ma-vai.sql`; nó đổi dữ liệu và ràng buộc, còn các hàm thì đổi
--   bằng cách dán lại chính file chứa chúng. Chỗ dịch mã sang tên hiển thị
--   là `js/pages/settings.js` hàm `vaiTroBangChu()`, và chỉ một chỗ ấy.
--
-- ═══ 0. HAI FILE, KHÔNG PHẢI MỘT — ĐỌC TRƯỚC KHI DÁN ═══
--
-- File này chỉ dựng CHỖ CHỨA và các cửa duyệt. Thứ thật sự chụp ảnh dữ liệu
-- cũ và treo cờ là `luu_cay()`, và nó nằm ở `03-ham-luu-cay.sql`.
--
--     dán 08 xong → dán lại 03-ham-luu-cay.sql → mới dùng được.
--
-- Quên bước hai thì hỏng ĐẰNG NÀO? Cột `trang_thai` mặc định `'cho'`, mà bản
-- `luu_cay()` cũ không điền cột ấy — nên **mọi lần Lưu, kể cả của quản trị
-- hệ thống, đều rơi vào hàng chờ**. Ồn ào, thấy ngay, không mất gì. Đó là hướng
-- cố ý: hỏng đằng cấm chứ không hỏng đằng cho qua, cùng lý lẽ với `06`.
--
-- ═══ 1. LUẬT, THEO LỜI CHỦ DỰ ÁN 04/09/2026 ═══
--
--   Mọi nội dung sửa đều gắn cờ tạm, quản trị viên duyệt rồi mới thành
--   chính thức.
--
-- Ba điều chủ dự án nói rõ, và cả ba đổi thiết kế so với bản nháp đầu:
--
--   1. Dữ liệu chưa duyệt **VẪN GHI THẲNG** vào bảng. Không dựng kho chờ
--      riêng. App chạy bình thường; quản trị viên lúc nào rảnh thì vào xem — đạt thì
--      nhận, không đạt thì gạt đi và dữ liệu quay về như cũ.
--   2. Trang duyệt là một trang HTML độc lập, duyệt dạng bảng. (b98)
--   3. Hai hạng quản trị: một hạng can thiệp được hệ thống, một hạng chỉ
--      kiểm duyệt. Xem mục 4.
--
-- ⚠ HỆ QUẢ ĐÃ CHẤP NHẬN: dữ liệu sai vẫn hiện ra cho cả họ cho tới khi quản
--   trị viên dọn. Cách này bảo vệ gia phả bằng cách **sửa sau**, không phải **chặn
--   trước**. Đổi lại, người đóng góp thấy ngay việc mình làm — đó là lý do
--   chọn nó, và nó là một lựa chọn chứ không phải một chỗ chưa làm xong.
--
-- ⚠ VÀ NÓ NUỐT TRỌN LỖ HỔNG LEO QUYỀN mà hàng rào 4 của b93 sinh ra để chặn:
--   khai bừa ai đó làm bố mình thì cũng chỉ là một đề nghị chờ duyệt. Từ đây,
--   **quản trị viên duyệt là hàng rào thật, trực hệ chỉ còn là bộ lọc** giúp
--   họ đỡ phải đọc những đề nghị chắc chắn bị từ chối. Đừng mô tả ngược lại.
--
-- ═══ 2. ĐƠN VỊ KIỂM DUYỆT LÀ MỘT LẦN BẤM LƯU ═══
--
-- Không phải một ô dữ liệu. Nên nó gắn vào `change_log` — bảng vốn đã có sẵn
-- đúng một dòng cho mỗi lần Lưu, và đã có `revision` để biết thứ tự.
--
-- ⚠ **KHÔNG dùng `change_log.diff` để hoàn tác.** Cột ấy do TRÌNH DUYỆT gửi
--   lên (`services/repo.js`) và mặc định rỗng `{}`. Dựa vào nó để hoàn tác là
--   để chính người sửa tự khai mình đã sửa gì — người muốn phá chỉ cần gửi
--   `diff` rỗng là bản cũ biến mất vĩnh viễn. Cột `truoc` bên dưới phải do
--   `luu_cay()` **tự chụp**, cùng đúng lý lẽ với việc `ts`/`by` bị bỏ qua và
--   lấy lại từ JWT.

-- ============================================================
-- 3. CỘT MỚI
-- ============================================================
-- ⚠ Khối `do` này KHÔNG phải để cho đẹp. `add column … default 'cho'` sẽ điền
--   `'cho'` cho cả 13 dòng nhật ký đã có — tức lịch sử cũ bỗng thành hàng chờ.
--   Phải bật chúng về `'duyet'`, nhưng CHỈ ĐÚNG MỘT LẦN: dán lại file này lần
--   thứ hai mà bật lần nữa là **duyệt sạch mọi đơn đang xếp hàng**.
--   Cái mốc phân biệt "lần đầu" là chính sự vắng mặt của cột.
--   (Cùng cái bẫy `07-duyet-dang-ky.sql` mục 2 đã gặp và đã chốt bằng
--    `xin_luc is null`; ở đây không có trường tương đương nên dùng khối `do`.)

do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'change_log'
       and column_name = 'trang_thai'
  ) then
    alter table public.change_log
      add column trang_thai text not null default 'cho';
    update public.change_log set trang_thai = 'duyet';
  end if;
end $$;

alter table public.change_log
  add column if not exists truoc          jsonb       not null default '{}'::jsonb,
  add column if not exists duyet_boi      text,
  add column if not exists duyet_luc      timestamptz,
  add column if not exists ly_do_tu_choi  text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.change_log'::regclass
       and conname  = 'change_log_trang_thai_check'
  ) then
    alter table public.change_log
      add constraint change_log_trang_thai_check
      check (trang_thai in ('cho', 'duyet', 'tu_choi'));
  end if;
end $$;

comment on column public.change_log.trang_thai is
  'cho = chờ duyệt · duyet = đã nhận chính thức · tu_choi = đã gạt và hoàn tác.';
comment on column public.change_log.truoc is
  'Ảnh chụp CÁC DÒNG BỊ ĐỤNG, trạng thái TRƯỚC lần Lưu này, do luu_cay() tự lấy. '
  'Đây là thứ duy nhất hoàn tác được — KHÔNG dùng cột diff.';

-- Hàng chờ đọc theo cây, mới nhất trước. Một chỉ mục riêng vì màn hình duyệt
-- lọc `trang_thai = 'cho'` ở mọi lần mở, còn `change_log_tree_idx` cũ không
-- biết cột này.
create index if not exists change_log_cho_idx
  on public.change_log (tree_id, id desc)
  where trang_thai = 'cho';

-- `tin_cay` — quản trị viên bật cho người chịu trách nhiệm ghi chép một chi. Mặc định
-- `false`, tức **mặc định ai cũng phải chờ duyệt**, đúng như chủ dự án chọn.
alter table public.tree_members
  add column if not exists tin_cay boolean not null default false;

comment on column public.tree_members.tin_cay is
  'Lần Lưu của người này thành chính thức ngay, không qua hàng chờ. Mặc định false.';

-- ============================================================
-- 4. HAI HẠNG QUẢN TRỊ — TÁCH RA TỪ ĐÂY
-- ============================================================
-- Tới trước file này hai vai làm được y hệt nhau. Chủ dự án chốt 04/09/2026
-- là phải tách:
--
--   | Hạng                        | Sửa dữ liệu | Duyệt nội dung | Đổi vai · gắn thành viên |
--   | Quản trị hệ thống (`quan_tri_he_thong`)   | ghi thẳng   | ✓              | ✓                        |
--   | Quản trị viên     (`quan_tri`) | ghi thẳng   | ✓              | ✗                        |
--
-- Nghĩa là **quản trị viên là người kiểm duyệt nội dung**, không phải người
-- quản trị hệ thống. Cửa nhận người vào gia phả và cửa gắn mã người vẫn chỉ
-- quản trị hệ thống mở được — đó là hai việc đổi được **ai có quyền gì**, và
-- người kiểm duyệt nội dung không cần tới chúng để làm việc của mình.
--
-- ⚠ Điều này THU HẸP quyền của quản trị viên so với `06` và `07`. Mục 8 bên dưới
--   định nghĩa lại ba hàm của hai file ấy. Thứ tự chạy theo số nên bản ở đây
--   thắng — **nhưng dán lại RIÊNG file 06 hoặc 07 sau này sẽ âm thầm mở rộng
--   quản trị viên trở lại.** Dán lại chúng thì dán lại cả 08.
--
-- Gom câu hỏi vào hai hàm, mỗi câu một chỗ trả lời, thay vì rải điều kiện ra
-- năm nơi gọi — cùng lý lẽ đã dùng cho `la_thanh_vien()` ở b87.
--
-- ⚠ Cả hai viết dạng KHẲNG ĐỊNH (`=`, `in`). Người ngoài cây có `vai_tro()`
--   trả `null`, và `null = 'quan_tri_he_thong'` ra `null`, `case` không nhận nhánh ấy nên
--   rơi về `else false` — chặn đúng. Viết dạng phủ định (`not in`) là dựng
--   lại đúng lỗ hổng b94 đã bắt được. Đừng "gọn hoá" theo hướng ấy.

create or replace function public.co_the_quan_tri(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.vai_tro(p_tree), '') = 'quan_tri_he_thong';
$$;

create or replace function public.co_the_kiem_duyet(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.vai_tro(p_tree), '') in ('quan_tri_he_thong', 'quan_tri');
$$;

-- ------------------------------------------------------------
-- Lần Lưu của người này thành chính thức ngay, hay phải xếp hàng?
--
-- `luu_cay()` hỏi đúng hàm này. Để câu trả lời ở một chỗ thì ngày nào chủ dự
-- án đổi ý — ví dụ cho cả vai `sua` ghi thẳng trong một đợt nhập liệu — chỉ
-- phải sửa ở đây, không phải đi tìm trong cửa ghi.
-- ------------------------------------------------------------
create or replace function public.ghi_thang(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when public.vai_tro(p_tree) in ('quan_tri_he_thong', 'quan_tri') then true
    else coalesce((select tm.tin_cay
                     from public.tree_members tm
                    where tm.tree_id = p_tree
                      and tm.user_id = auth.uid()
                      and tm.approved), false)
  end;
$$;

-- ============================================================
-- 5. KHOÁ CỦA MỘT LẦN LƯU — trái tim của luật hoàn tác
-- ============================================================
-- Trả về danh sách "những dòng mà lần Lưu này đã đụng vào", dạng chuỗi khoá.
--
-- Nó dùng cho ĐÚNG một việc, và việc ấy là luật hoàn tác:
--
--   ⚠ Chỉ hoàn tác được khi bản ghi **chưa bị lần Lưu nào sau đó đụng vào**.
--     Bị đụng rồi mà vẫn hoàn tác là xoá mất công của người sau. Máy chủ phải
--     từ chối và chỉ ra ai đã sửa tiếp, chứ không âm thầm ghi đè — cùng đúng
--     cái lý lẽ của hàng rào 3 (`revision`) ở `03-ham-luu-cay.sql`.
--
-- Vì `truoc` liệt kê chính xác các dòng một lần Lưu đụng tới, so hai tập khoá
-- là trả lời được câu ấy mà **không cần thêm cột nào lên bảng dữ liệu**. Cách
-- kia — gắn `log_id` lên từng dòng của năm bảng — nhanh hơn nhưng đẻ thêm năm
-- cột phải nhớ điền ở mọi đường ghi, và `DU-LIEU.md` mục 3 điều 7 đã ghi lại
-- cái giá của một cột bị quên điền: nó âm thầm ghi `null` đè lên.

create or replace function public.khoa_cua(p_truoc jsonb)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(k), '{}'::text[]) from (
    select 'p:' || (e->>'id') as k
      from jsonb_array_elements(coalesce(p_truoc->'persons', '[]'::jsonb)) e
    union
    select 'u:' || (e->>'id')
      from jsonb_array_elements(coalesce(p_truoc->'unions', '[]'::jsonb)) e
    union
    select 'c:' || (e->>'union_id') || '|' || (e->>'person_id')
      from jsonb_array_elements(coalesce(p_truoc->'children', '[]'::jsonb)) e
    union
    select 'm:' || (e->>'id')
      from jsonb_array_elements(coalesce(p_truoc->'media', '[]'::jsonb)) e
    union
    select 's:' || (e->>'id')
      from jsonb_array_elements(coalesce(p_truoc->'sources', '[]'::jsonb)) e
    union
    select 't:' where jsonb_typeof(coalesce(p_truoc->'tree', 'null'::jsonb)) = 'object'
  ) x;
$$;

-- ------------------------------------------------------------
-- Lần Lưu nào SAU `p_id` đã đụng vào cùng những dòng ấy?
--
-- Trả về dòng nhật ký sớm nhất chạm mặt, hoặc không dòng nào.
--
-- ⚠ Bỏ qua những lần Lưu ĐÃ BỊ TỪ CHỐI. Tác dụng của chúng đã được hoàn tác
--   rồi, nên chúng không còn "giữ" dòng nào cả. Đếm cả chúng thì một lần từ
--   chối sẽ khoá cứng mọi lần từ chối trước nó, mà chẳng bảo vệ được gì.
-- ------------------------------------------------------------
create or replace function public.dung_do_sau(p_tree uuid, p_id bigint)
returns table (id bigint, by_email text, ts timestamptz)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select sau.id, sau.by_email, sau.ts
    from public.change_log sau
   where sau.tree_id = p_tree
     and sau.id > p_id
     and sau.trang_thai <> 'tu_choi'
     and public.khoa_cua(sau.truoc) && public.khoa_cua(
           (select cl.truoc from public.change_log cl where cl.id = p_id))
   order by sau.id
   limit 1;
$$;

-- ============================================================
-- 6. DUYỆT — nhận chính thức
-- ============================================================
-- Không đụng một dòng dữ liệu nào, vì dữ liệu đã nằm trong bảng từ lúc người
-- ta bấm Lưu. Duyệt chỉ là **thôi treo cờ**. Đó chính là chỗ rẻ của thiết kế
-- "ghi thẳng rồi duyệt sau" mà chủ dự án chọn.

create or replace function public.duyet_thay_doi(p_tree uuid, p_id bigint)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text := coalesce(auth.jwt() ->> 'email', '');
  v_tt    text;
begin
  if not public.co_the_kiem_duyet(p_tree) then
    return jsonb_build_object('ok', false, 'lyDo', 'khongcoquyen',
      'loi', 'Chỉ quản trị hệ thống hoặc quản trị viên mới duyệt được nội dung.');
  end if;

  select trang_thai into v_tt from public.change_log
   where id = p_id and tree_id = p_tree;

  if v_tt is null then
    return jsonb_build_object('ok', false, 'lyDo', 'khongthay',
      'loi', 'Không có thay đổi nào mang số ' || p_id || ' trong gia phả này.');
  end if;
  if v_tt <> 'cho' then
    return jsonb_build_object('ok', false, 'lyDo', 'daxuly',
      'loi', 'Thay đổi này đã được xử lý rồi (' || v_tt || ').');
  end if;

  update public.change_log
     set trang_thai = 'duyet', duyet_boi = v_email, duyet_luc = now(),
         ly_do_tu_choi = null
   where id = p_id and tree_id = p_tree;

  return jsonb_build_object('ok', true, 'id', p_id, 'trangThai', 'duyet');
end;
$$;

-- ============================================================
-- 7. TỪ CHỐI — gạt đi VÀ HOÀN TÁC
-- ============================================================
-- Đây là hàm nặng nhất của cả file, và cũng là hàm dễ làm sai nhất. Bốn điều
-- phải đúng cùng lúc:
--
--   1. Không hoàn tác nếu có người sửa tiếp lên trên (mục 5).
--   2. Xoá một người thì **cascade** kéo theo `union_children` — `01-bang.sql`
--      dòng 217-218 đặt `on delete cascade`. Nghĩa là hoàn tác một lần Lưu
--      "thêm người mới" có thể ÂM THẦM cắt mất những mối nối do lần Lưu KHÁC
--      tạo ra. Postgres không báo lỗi, nó làm đúng như được dặn. Nên phải tự
--      soát trước — mục 7b.
--   3. Khôi phục một dòng đã có thì phải `on conflict do update`, **không**
--      được xoá-rồi-chèn: xoá là cascade lần nữa.
--   4. Thứ tự do khoá ngoại quyết định: xoá con trước, rồi hôn nhân và người;
--      chèn người trước, rồi hôn nhân, rồi con.
--
-- ⚠ Từ chối KHÔNG ghi thêm một dòng `change_log` mới, dù nó có đổi dữ liệu.
--   Nghe thì thiếu, nhưng ghi vào là sai: dòng mới ấy sẽ mang khoá của đúng
--   những bản ghi vừa hoàn tác, nên nó khoá luôn việc từ chối những lần Lưu
--   TRƯỚC đó — trong khi dữ liệu đã quay về đúng trạng thái cho phép làm thế.
--   Vết duyệt nằm ngay trên chính dòng bị từ chối: `duyet_boi`, `duyet_luc`,
--   `ly_do_tu_choi`.
--
-- ⚠ `revision` VẪN tăng. Trình duyệt của người khác đang mở cây bản cũ phải
--   bị chặn ở lần Lưu kế tiếp và buộc tải lại — nếu không, họ sẽ ghi đè bản
--   vừa được khôi phục bằng bản trong bộ nhớ của họ.

create or replace function public.tu_choi_thay_doi(
  p_tree uuid,
  p_id   bigint,
  p_ly_do text default ''
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_email    text := coalesce(auth.jwt() ->> 'email', '');
  v_tt       text;
  v_truoc    jsonb;
  v_khoa     text[];
  v_sau      record;
  v_ngoai    text;
  v_xoa_p    text[];
  v_xoa_u    text[];
  v_rev_moi  integer;
begin
  if not public.co_the_kiem_duyet(p_tree) then
    return jsonb_build_object('ok', false, 'lyDo', 'khongcoquyen',
      'loi', 'Chỉ quản trị hệ thống hoặc quản trị viên mới từ chối được nội dung.');
  end if;

  -- Khoá dòng nhật ký lại: hai admin bấm Từ chối cùng lúc thì người sau đứng
  -- đợi ở đây rồi đọc được `trang_thai` đã đổi, và dừng ở phép kiểm ngay dưới.
  -- Không có `for update` thì cả hai cùng hoàn tác, và lần thứ hai khôi phục
  -- đè lên đúng cái nó vừa khôi phục.
  select trang_thai, truoc into v_tt, v_truoc
    from public.change_log
   where id = p_id and tree_id = p_tree
     for update;

  if v_tt is null then
    return jsonb_build_object('ok', false, 'lyDo', 'khongthay',
      'loi', 'Không có thay đổi nào mang số ' || p_id || ' trong gia phả này.');
  end if;
  if v_tt <> 'cho' then
    return jsonb_build_object('ok', false, 'lyDo', 'daxuly',
      'loi', 'Thay đổi này đã được xử lý rồi (' || v_tt || ').');
  end if;

  v_khoa := public.khoa_cua(v_truoc);

  -- ══ 7a. CÓ AI SỬA TIẾP LÊN TRÊN KHÔNG ══
  -- ⚠ Hỏi `found`, đừng hỏi `v_sau.id is not null`. Với biến `record` mà câu
  --   `select … into` không trả về dòng nào thì đọc một trường của nó là đất
  --   trơn; `found` thì luôn có nghĩa rõ ràng.
  select * into v_sau from public.dung_do_sau(p_tree, p_id);
  if found then
    return jsonb_build_object('ok', false, 'lyDo', 'dabisuatiep',
      'loi', 'Không hoàn tác được: ' || coalesce(v_sau.by_email, 'người khác')
          || ' đã sửa tiếp lên đúng những bản ghi này lúc '
          || to_char(v_sau.ts, 'HH24:MI DD/MM/YYYY')
          || '. Hoàn tác bây giờ là xoá mất công của họ. '
          || 'Hãy từ chối thay đổi mới hơn trước, hoặc sửa tay.',
      'canxuly', v_sau.id);
  end if;

  -- ⚠ Bản nhật ký cũ (trước file này) có `truoc` rỗng — không có gì để khôi
  --   phục. Từ chối chúng là đánh lừa người bấm: cờ đổi mà dữ liệu đứng yên.
  if v_khoa = '{}'::text[] then
    return jsonb_build_object('ok', false, 'lyDo', 'khongcoanhchup',
      'loi', 'Lần Lưu này không có ảnh chụp dữ liệu cũ (nó có trước khi bật '
          || 'kiểm duyệt), nên không hoàn tác tự động được. Sửa tay nếu cần.');
  end if;

  -- Mã của những người / hôn nhân sẽ BIẾN MẤT khi hoàn tác — tức lúc chụp
  -- ảnh chúng chưa tồn tại (`cu` là null), nên lần Lưu ấy đã tạo ra chúng.
  select coalesce(array_agg(e->>'id'), '{}'::text[]) into v_xoa_p
    from jsonb_array_elements(coalesce(v_truoc->'persons', '[]'::jsonb)) e
   where jsonb_typeof(e->'cu') = 'null';

  select coalesce(array_agg(e->>'id'), '{}'::text[]) into v_xoa_u
    from jsonb_array_elements(coalesce(v_truoc->'unions', '[]'::jsonb)) e
   where jsonb_typeof(e->'cu') = 'null';

  -- ══ 7b. XOÁ CÓ KÉO THEO GÌ NGOÀI TẦM KHÔNG ══
  -- Cascade là thứ làm đúng lệnh mà vẫn ra kết quả sai. Ba phép dưới đây soát
  -- trước, và thà từ chối hoàn tác còn hơn cắt mất dữ liệu của người khác.

  select uc.union_id || ' ↔ ' || uc.person_id into v_ngoai
    from public.union_children uc
   where uc.tree_id = p_tree
     and (uc.person_id = any(v_xoa_p) or uc.union_id = any(v_xoa_u))
     and not (('c:' || uc.union_id || '|' || uc.person_id) = any(v_khoa))
   limit 1;
  if v_ngoai is not null then
    return jsonb_build_object('ok', false, 'lyDo', 'keotheo',
      'loi', 'Không hoàn tác được: bỏ những người mới thêm sẽ cắt luôn quan hệ '
          || v_ngoai || ' do lần Lưu khác tạo ra. Sửa tay nếu cần.');
  end if;

  select tm.email into v_ngoai
    from public.tree_members tm
   where tm.tree_id = p_tree and tm.person_id = any(v_xoa_p)
   limit 1;
  if v_ngoai is not null then
    return jsonb_build_object('ok', false, 'lyDo', 'keotheo',
      'loi', 'Không hoàn tác được: tài khoản ' || v_ngoai || ' đang gắn với '
          || 'một trong những người sắp bị bỏ. Gỡ gắn kết ấy trước.');
  end if;

  -- ══════════════════════════════════════════════════════════
  -- TỪ ĐÂY TRỞ XUỐNG MỚI ĐƯỢC GHI
  -- ══════════════════════════════════════════════════════════

  -- --- CON: xoá sạch mọi cạnh trong ảnh chụp, rồi chèn lại cạnh từng có ---
  -- Xoá cả rồi chèn lại được phép ở ĐÂY (và chỉ ở đây) vì `union_children`
  -- không có bảng nào trỏ tới nó — xoá một dòng không kéo theo gì.
  delete from public.union_children uc
   using jsonb_array_elements(coalesce(v_truoc->'children', '[]'::jsonb)) e
   where uc.tree_id  = p_tree
     and uc.union_id  = e->>'union_id'
     and uc.person_id = e->>'person_id';

  -- --- NGƯỜI và HÔN NHÂN chưa từng tồn tại: bỏ đi ---
  delete from public.unions
   where tree_id = p_tree and id = any(v_xoa_u);
  delete from public.persons
   where tree_id = p_tree and id = any(v_xoa_p);

  -- --- KHÔI PHỤC NGƯỜI ---
  -- ⚠ `on conflict do update`, KHÔNG xoá-rồi-chèn: xoá một người là cascade
  --   cắt mọi quan hệ của họ, kể cả những quan hệ lần Lưu này không đụng tới.
  insert into public.persons
  select * from jsonb_populate_recordset(null::public.persons, (
    select coalesce(jsonb_agg(e->'cu'), '[]'::jsonb)
      from jsonb_array_elements(coalesce(v_truoc->'persons', '[]'::jsonb)) e
     where jsonb_typeof(e->'cu') = 'object'))
  on conflict (tree_id, id) do update set
    uid = excluded.uid, names = excluded.names, sex = excluded.sex,
    birth = excluded.birth, death = excluded.death,
    burial_place = excluded.burial_place,
    title = excluded.title, occupation = excluded.occupation,
    education = excluded.education, religion = excluded.religion,
    residence = excluded.residence, nationality = excluded.nationality,
    living = excluded.living, photo_file_id = excluded.photo_file_id,
    note = excluded.note, deleted = excluded.deleted,
    vn = excluded.vn, meta = excluded.meta, branch_id = excluded.branch_id;

  -- --- KHÔI PHỤC HÔN NHÂN ---
  insert into public.unions
  select * from jsonb_populate_recordset(null::public.unions, (
    select coalesce(jsonb_agg(e->'cu'), '[]'::jsonb)
      from jsonb_array_elements(coalesce(v_truoc->'unions', '[]'::jsonb)) e
     where jsonb_typeof(e->'cu') = 'object'))
  on conflict (tree_id, id) do update set
    uid = excluded.uid, partners = excluded.partners,
    partner_order = excluded.partner_order, ranks = excluded.ranks,
    status = excluded.status, marriage = excluded.marriage,
    note = excluded.note, deleted = excluded.deleted;

  -- --- KHÔI PHỤC CON (sau người và hôn nhân, vì khoá ngoại) ---
  insert into public.union_children
  select * from jsonb_populate_recordset(null::public.union_children, (
    select coalesce(jsonb_agg(e->'cu'), '[]'::jsonb)
      from jsonb_array_elements(coalesce(v_truoc->'children', '[]'::jsonb)) e
     where jsonb_typeof(e->'cu') = 'object'))
  on conflict (tree_id, union_id, person_id) do update set
    relation = excluded.relation, ord = excluded.ord;

  -- --- KHÔI PHỤC ẢNH và NGUỒN ---
  delete from public.media
   where tree_id = p_tree
     and id in (select e->>'id'
                  from jsonb_array_elements(coalesce(v_truoc->'media','[]'::jsonb)) e
                 where jsonb_typeof(e->'cu') = 'null');

  insert into public.media
  select * from jsonb_populate_recordset(null::public.media, (
    select coalesce(jsonb_agg(e->'cu'), '[]'::jsonb)
      from jsonb_array_elements(coalesce(v_truoc->'media', '[]'::jsonb)) e
     where jsonb_typeof(e->'cu') = 'object'))
  on conflict (tree_id, id) do update set
    subject_id = excluded.subject_id,
    drive_file_id = excluded.drive_file_id,
    drive_file_id_lon = excluded.drive_file_id_lon,
    caption = excluded.caption, year = excluded.year,
    deleted = excluded.deleted, meta = excluded.meta;

  delete from public.sources
   where tree_id = p_tree
     and id in (select e->>'id'
                  from jsonb_array_elements(coalesce(v_truoc->'sources','[]'::jsonb)) e
                 where jsonb_typeof(e->'cu') = 'null');

  insert into public.sources
  select * from jsonb_populate_recordset(null::public.sources, (
    select coalesce(jsonb_agg(e->'cu'), '[]'::jsonb)
      from jsonb_array_elements(coalesce(v_truoc->'sources', '[]'::jsonb)) e
     where jsonb_typeof(e->'cu') = 'object'))
  on conflict (tree_id, id) do update set
    title = excluded.title, author = excluded.author, note = excluded.note;

  -- --- SỔ NHẬP: gỡ những dòng chính lần Lưu này đẻ ra ---
  -- ⚠ Sổ nhập chỉ mọc thêm, nên nó không có `cu` — `truoc.imports_moi` giữ
  --   thẳng mã dòng. Để lại một dòng nhập của lần Lưu bị gạt là nói dối: lần
  --   nhập lại cùng file sau này sẽ tra bảng ánh xạ ấy và tưởng đã nhập rồi.
  delete from public.imports
   where tree_id = p_tree
     and id in (select x::bigint
                  from jsonb_array_elements_text(
                         coalesce(v_truoc->'imports_moi', '[]'::jsonb)) x);

  -- --- KHỐI THÔNG TIN CHUNG CỦA CÂY + TĂNG SỐ BẢN GHI ---
  -- `for update` khoá dòng cây đúng như hàng rào 3 của `luu_cay()` làm, để
  -- một lần Lưu đang chạy song song không cùng lúc tăng `revision`.
  select revision + 1 into v_rev_moi
    from public.trees where id = p_tree for update;

  update public.trees set
    name           = coalesce(v_truoc->'tree'->>'name', name),
    root_person_id = coalesce(v_truoc->'tree'->>'root_person_id', root_person_id),
    note           = coalesce(v_truoc->'tree'->>'note', note),
    revision       = v_rev_moi,
    updated_at     = now(),
    updated_by     = v_email
   where id = p_tree;

  update public.change_log
     set trang_thai = 'tu_choi', duyet_boi = v_email, duyet_luc = now(),
         ly_do_tu_choi = left(coalesce(p_ly_do, ''), 500)
   where id = p_id and tree_id = p_tree;

  return jsonb_build_object('ok', true, 'id', p_id, 'trangThai', 'tu_choi',
                            'revision', v_rev_moi);

exception
  -- Lưới cuối. Mục 7b soát hai đường cascade đã biết, nhưng khoá ngoại là thứ
  -- người sau còn thêm được. Rơi vào đây thì cả giao dịch đã tự huỷ — dữ liệu
  -- nguyên vẹn — và người bấm nhận được một câu tiếng Việt thay vì mã lỗi.
  when foreign_key_violation then
    return jsonb_build_object('ok', false, 'lyDo', 'vuongkhoangoai',
      'loi', 'Không hoàn tác được vì còn bản ghi khác đang trỏ tới dữ liệu '
          || 'này. Không có gì bị thay đổi. Sửa tay nếu cần.');
end;
$$;

-- ============================================================
-- 8. BA HÀM CỦA `06` VÀ `07`, ĐỊNH NGHĨA LẠI CHO HẸP HƠN
-- ============================================================
-- Xem mục 4. Ba hàm này xưa nhận cả hai hạng quản trị; từ nay chỉ quản trị
-- hệ thống.
-- Thân hàm giữ nguyên từng chữ ngoài cái cửa đầu — cố ý, để `git diff` giữa
-- hai bản chỉ có một dòng, và người đọc sau thấy ngay điều duy nhất đã đổi.

create or replace function public.duyet_thanh_vien(
  p_tree      uuid,
  p_email     text,
  p_person_id text,
  p_duyet     boolean default true
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid;
  n integer;
begin
  if not public.co_the_quan_tri(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ quản trị hệ thống mới duyệt được thành viên.');
  end if;

  select id into v_user from auth.users where lower(email) = lower(p_email);
  if v_user is null then
    return jsonb_build_object('ok', false, 'loi',
      'Không có tài khoản nào mang email ' || p_email || '.');
  end if;

  if p_person_id is not null then
    select count(*) into n from public.persons
     where tree_id = p_tree and id = p_person_id;
    if n <> 1 then
      return jsonb_build_object('ok', false, 'loi',
        'Không có người mang mã ' || p_person_id || ' trong gia phả này.');
    end if;
  end if;

  update public.tree_members
     set person_id = p_person_id,
         approved  = p_duyet
   where tree_id = p_tree and user_id = v_user;

  if not found then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản ' || p_email || ' chưa được thêm vào gia phả này.');
  end if;

  return jsonb_build_object('ok', true, 'email', p_email,
    'person_id', p_person_id, 'approved', p_duyet);
end;
$$;

create or replace function public.tu_choi_thanh_vien(p_tree uuid, p_email text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare n integer;
begin
  if not public.co_the_quan_tri(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ quản trị hệ thống mới từ chối được đơn.');
  end if;

  delete from public.tree_members
   where tree_id = p_tree
     and lower(email) = lower(p_email)
     and approved = false
     and role not in ('quan_tri_he_thong', 'quan_tri', 'sao_luu');
  get diagnostics n = row_count;

  if n = 0 then
    return jsonb_build_object('ok', false, 'loi',
      'Không có đơn nào đang chờ mang email ' || p_email || '.');
  end if;
  return jsonb_build_object('ok', true, 'email', p_email);
end;
$$;

create or replace function public.ds_cho_duyet(p_tree uuid default null)
returns table (
  email    text,
  user_id  uuid,
  xin_luc  timestamptz,
  loi_nhan text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select tm.email, tm.user_id, tm.xin_luc, tm.loi_nhan
    from public.tree_members tm
   where tm.tree_id = coalesce(p_tree, (select id from public.trees limit 1))
     and tm.approved = false
     and tm.role not in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')
     and public.co_the_quan_tri(
           coalesce(p_tree, (select id from public.trees limit 1)))
   order by tm.xin_luc nulls last, tm.email;
$$;

-- ============================================================
-- 9. HÀNG CHỜ NỘI DUNG — người kiểm duyệt nhìn thấy gì
-- ============================================================
-- Cửa cho `duyet.html` của b98, và cũng là thứ khiến duyệt tay bằng SQL Editor
-- xem được hàng chờ hôm nay.
--
-- ⚠ Phép kiểm quyền nằm TRONG `where`, đúng khuôn `ds_cho_duyet()` của `07`:
--   với hàm `sql` trả bảng thì đó là cách gọn nhất và không có nhánh nào để
--   rơi lọt qua.
--
-- ⚠ KHÔNG trả về cả cột `truoc`. Nó chứa nguyên văn bản ghi cũ và có thể rất
--   nặng — màn hình bảng chỉ cần biết *có bao nhiêu* dòng bị đụng. Xem chi
--   tiết thì đọc thẳng `change_log` (mọi thành viên đọc được, `02-rls.sql`).

create or replace function public.ds_kiem_duyet(
  p_tree      uuid default null,
  p_trang_thai text default 'cho',
  p_gioi_han  integer default 200
)
returns table (
  id         bigint,
  ts         timestamptz,
  by_email   text,
  action     text,
  target     text,
  note       text,
  revision   integer,
  trang_thai text,
  so_nguoi   integer,
  so_honnhan integer,
  so_quanhe  integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select cl.id, cl.ts, cl.by_email, cl.action, cl.target, cl.note,
         cl.revision, cl.trang_thai,
         jsonb_array_length(coalesce(cl.truoc->'persons',  '[]'::jsonb)),
         jsonb_array_length(coalesce(cl.truoc->'unions',   '[]'::jsonb)),
         jsonb_array_length(coalesce(cl.truoc->'children', '[]'::jsonb))
    from public.change_log cl
   where cl.tree_id = coalesce(p_tree, (select id from public.trees limit 1))
     and (p_trang_thai is null or cl.trang_thai = p_trang_thai)
     and public.co_the_kiem_duyet(
           coalesce(p_tree, (select id from public.trees limit 1)))
   order by cl.id desc
   limit coalesce(p_gioi_han, 200);
$$;

-- ------------------------------------------------------------
-- Đếm nhanh cho cái nhãn "Chờ duyệt (n)" trên màn hình.
-- ------------------------------------------------------------
create or replace function public.dem_cho_kiem_duyet(p_tree uuid default null)
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(*)::integer
    from public.change_log cl
   where cl.tree_id = coalesce(p_tree, (select id from public.trees limit 1))
     and cl.trang_thai = 'cho'
     and public.co_the_kiem_duyet(
           coalesce(p_tree, (select id from public.trees limit 1)));
$$;

-- ============================================================
-- 10. AI GỌI ĐƯỢC GÌ
-- ============================================================
-- Mọi hàm đều tự kiểm người gọi trong thân, nhưng đóng sẵn cửa vẫn hơn tin
-- vào một phép kiểm — cùng lý lẽ với `05-sao-luu.sql` và `07`.
--
-- `khoa_cua()` và `dung_do_sau()` không cấp cho ai: chúng là ruột của
-- `tu_choi_thay_doi()`, không phải cửa cho trình duyệt.

revoke all on function public.duyet_thay_doi(uuid, bigint)          from public, anon;
revoke all on function public.tu_choi_thay_doi(uuid, bigint, text)  from public, anon;
revoke all on function public.ds_kiem_duyet(uuid, text, integer)    from public, anon;
revoke all on function public.dem_cho_kiem_duyet(uuid)              from public, anon;
revoke all on function public.co_the_quan_tri(uuid)                 from public, anon;
revoke all on function public.co_the_kiem_duyet(uuid)               from public, anon;
revoke all on function public.ghi_thang(uuid)                       from public, anon;
revoke all on function public.khoa_cua(jsonb)                       from public, anon;
revoke all on function public.dung_do_sau(uuid, bigint)             from public, anon;

grant execute on function public.duyet_thay_doi(uuid, bigint)         to authenticated;
grant execute on function public.tu_choi_thay_doi(uuid, bigint, text) to authenticated;
grant execute on function public.ds_kiem_duyet(uuid, text, integer)   to authenticated;
grant execute on function public.dem_cho_kiem_duyet(uuid)             to authenticated;
grant execute on function public.co_the_quan_tri(uuid)                to authenticated;
grant execute on function public.co_the_kiem_duyet(uuid)              to authenticated;
grant execute on function public.ghi_thang(uuid)                      to authenticated;

-- ============================================================
-- 11. TỰ KIỂM — chạy xong nhìn bảng này
-- ============================================================
-- Dòng quan trọng nhất là dòng cuối: nó nói cho biết đã dán lại
-- `03-ham-luu-cay.sql` chưa. Chưa dán thì mọi lần Lưu rơi vào hàng chờ.

select 'nam cot moi tren change_log' as muc,
       (select count(*) from information_schema.columns
         where table_schema = 'public' and table_name = 'change_log'
           and column_name in ('trang_thai', 'truoc', 'duyet_boi',
                               'duyet_luc', 'ly_do_tu_choi'))::text as gia_tri,
       '5' as mong_doi
union all
select 'cot tin_cay tren tree_members',
       (select count(*) from information_schema.columns
         where table_schema = 'public' and table_name = 'tree_members'
           and column_name = 'tin_cay')::text,
       '1'
union all
select 'nhat ky cu da duoc nhan chinh thuc',
       (select count(*)::text from public.change_log where trang_thai = 'cho'),
       '0'
union all
select 'bay ham moi co mat',
       (select count(*)::text from pg_proc
         where pronamespace = 'public'::regnamespace
           and proname in ('co_the_quan_tri', 'co_the_kiem_duyet', 'ghi_thang',
                           'khoa_cua', 'dung_do_sau', 'duyet_thay_doi',
                           'tu_choi_thay_doi')),
       '7'
union all
select 'chi quan tri he thong duyet duoc thanh vien',
       (select case when prosrc ilike '%co_the_quan_tri%' then 'co' else 'CHUA' end
          from pg_proc where proname = 'duyet_thanh_vien'
           and pronamespace = 'public'::regnamespace),
       'co'
union all
select 'DA DAN LAI 03-ham-luu-cay.sql CHUA',
       (select case when prosrc ilike '%ghi_thang%' then 'roi' else 'CHUA — dan di' end
          from pg_proc where proname = 'luu_cay'
           and pronamespace = 'public'::regnamespace),
       'roi';
