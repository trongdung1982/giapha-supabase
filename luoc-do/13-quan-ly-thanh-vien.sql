-- ============================================================
-- giapha-supabase · luoc-do/13-quan-ly-thanh-vien.sql
-- Vai trò  : Quản lý TÀI KHOẢN của một gia phả — 6 hàm quản trị, cộng việc
--            vá chỗ lệch của b104: chủ cây thôi mang mã vai
--            `quan_tri_he_thong` trong `tree_members`.
-- Chạy ở   : Supabase → SQL Editor → dán → Run.
--            Chạy SAU `12-tao-cay.sql`.
-- Phiên bản: 0.1.0 · Cập nhật: 08/09/2026 17:21
--
-- ⚠⚠ BA FILE CŨ NÀY, DÁN LẠI THÌ PHẢI DÁN LẠI `13` NGAY SAU ĐÓ:
--
--   · `08-kiem-duyet.sql` — nó định nghĩa `co_the_quan_tri()` bản CŨ (hỏi mã
--     vai). Dán lại mà quên `13` là **chủ cây mất quyền quản trị ở cây mình**,
--     và triệu chứng *"không ai duyệt được đơn nữa"* chỉ lộ khi có người nộp.
--   · `09-doi-ma-vai.sql` — nó ĐẶT mã `quan_tri_he_thong` vào `tree_members`.
--     Sau `13` ràng buộc từ chối mã ấy, nên nó sẽ **ném lỗi ngay** (to, không
--     lặng lẽ — đó là chủ ý). File ấy là file di dời của b97, đã xong việc.
--   · `12-tao-cay.sql` — phải là bản **0.2.0 trở lên**. Bản 0.1.0 cấp
--     `quan_tri_he_thong` nên nút *Dựng gia phả mới* ném lỗi ràng buộc.
--
--   Thứ tự dán là một phần của lược đồ, không phải chi tiết thao tác — cùng
--   lẽ với khối cảnh báo `06`/`07`/`08` ở `08-kiem-duyet.sql` mục 4.
--
-- ⚠ File này DÁN LẠI ĐƯỢC. Mọi câu `update` có điều kiện thu hẹp dần, mọi
--   ràng buộc hỏi `pg_constraint` trước, mọi hàm dùng `create or replace`.
--   Hai hàm trả BẢNG đi kèm `drop function if exists` — đúng bài học 42P13
--   ngày 08/09 (xem đầu `11-quyen-he-thong.sql`).
--
-- Nguồn: chủ dự án chốt 08/09/2026, ba câu, nguyên văn:
--   · "không ai được chỉ định quyền cho chính mình"
--   · "mặc định người tạo cây thì có quyền quản trị với cây đó"
--   · "người quản trị được chủ cây gán, chỉ có quyền sửa, duyệt nội dung,
--      không có quyền thay đổi quyền của người khác"
-- ============================================================
--
-- ═══ 0. LUẬT PHÂN QUYỀN — BẢN CHỐT 08/09/2026 ═══
--
--   | Hạng                | Nhận ra bằng            | Sửa | Duyệt   | Đổi     |
--   |                     |                         | d.l | nội dung| quyền   |
--   |---------------------|-------------------------|-----|---------|---------|
--   | Quản trị hệ thống   | cờ tai_khoan.la_quan_…  |  ✓  |    ✓    | ✓ mọi cây
--   | Chủ cây             | cột trees.chu_so_huu    |  ✓  |    ✓    | ✓ cây mình
--   | Quản trị gia phả    | tree_members.role       |  ✓  |    ✓    | ✗
--   |   (`quan_tri`)      |                         |     |         |
--   | Thành viên (`sua`)  | tree_members.role       | trực hệ, qua hàng chờ
--   | Khách (`xem`)       | tree_members.role       |  ✗  |    ✗    | ✗
--
-- Trùm lên tất cả: **KHÔNG AI ĐẶT QUYỀN CHO CHÍNH MÌNH.** Không ngoại lệ,
-- kể cả chủ cây, kể cả Quản trị hệ thống. Xem mục 6.
--
-- ═══ VÌ SAO PHẢI ĐỔI — b104 ĐI LỆCH, VÀ GỐC RỄ CỦA CHỖ LỆCH ═══
--
-- `12-tao-cay.sql` 0.1.0 cấp người dựng cây vai `quan_tri_he_thong` trong
-- `tree_members`. Nó KHÔNG phải lỗ hổng rò rỉ (vai trong bảng ấy luôn hỏi
-- kèm một mã cây, đã đo: `do-b104.mjs` hàng rào 4 — người dựng cây riêng đọc
-- cây `NTB` ra 0 dòng). Nhưng nó sai về kiến trúc, vì một chữ đang mang HAI
-- nghĩa:
--
--   · `tai_khoan.la_quan_tri_he_thong`  → Quản trị hệ thống THẬT, mọi cây
--   · `tree_members.role`               → chủ của ĐÚNG MỘT cây
--
-- Hai nghĩa ấy trùng nhau hồi b97 (04/09) vì lúc đó hệ thống có đúng một cây,
-- nên "chủ cây" và "quản trị hệ thống" là cùng một người. b102 tách chúng ra,
-- nhưng cái tên trong bảng thì không ai đổi — và b104 vấp đúng vào đó.
--
-- File này đóng hẳn đường ấy: sau khi chạy, ràng buộc của bảng **từ chối** giá
-- trị `quan_tri_he_thong`, nên chuyện một chữ hai nghĩa không tái hiện được.
--
-- ═══ NEO MỚI: CHỦ CÂY LÀ MỘT CỘT, KHÔNG PHẢI MỘT VAI ═══
--
-- `co_the_quan_tri()` đổi nghĩa từ *"vai = quan_tri_he_thong"* sang
-- *"là Quản trị hệ thống HOẶC là chủ cây (`trees.chu_so_huu`)"*.
--
-- Được ba thứ cùng lúc:
--   1. Mỗi cây có ĐÚNG MỘT người đổi được quyền → không có cảnh hai quản trị
--      hạ vai lẫn nhau, cũng không có cảnh người được mời phụ việc chiếm cây.
--   2. Chủ cây không tự phong mình được (họ đã là chủ; và mục 6 chặn thẳng).
--   3. Bảng `tree_members` chỉ còn giữ ba vai hiểu được bằng tiếng Việt
--      thường: quản trị gia phả · thành viên · khách.
--
-- ⚠ HẠ VAI CHỦ CÂY XUỐNG `quan_tri` KHÔNG LÀM HỌ MẤT GÌ KHÁC — đã tra từng
--   hàm, không suy đoán:
--     · `co_the_sua()`      `06` mục 5  = vai in (quan_tri_he_thong, quan_tri) ✓
--     · `co_the_kiem_duyet()` `08` mục 4 = vai in (quan_tri_he_thong, quan_tri) ✓
--     · `ghi_thang()`       `08` mục 4  = vai in (quan_tri_he_thong, quan_tri) ✓
--     · `la_thanh_vien()`   `11` mục 8  = ... or role in (…, quan_tri, …)      ✓
--   Đúng MỘT hàm đổi hành vi, và đó là `co_the_quan_tri()` — cố ý.
--
-- ⚠ HAI CHỖ CÓ ĐỔI HÀNH VI, ghi ra để không ai phát hiện sau rồi coi là lỗi:
--   1. `ds_tai_khoan()` của `05-sao-luu.sql` lọc theo
--      `role in ('quan_tri_he_thong','sao_luu')` đọc THẲNG từ bảng. Bỏ mã ấy
--      khỏi bảng thì chủ cây thôi thấy danh sách tài khoản — mà đó chính là
--      thứ màn hình b106 cần. → Mục 7 định nghĩa lại hàm ấy.
--   2. `02-rls.sql` mục cuối gác bảng `branch_access` bằng
--      `vai_tro(tree_id) = 'quan_tri_he_thong'`, nên sau file này chỉ Quản trị
--      hệ thống đọc được nó. **Không sửa, và cố ý**: `branch_access` là tàn dư
--      của thiết kế chia quyền theo nhánh mà b93 đã thay bằng luật trực hệ.
--      Bảng ấy rỗng và không hàm nào của app còn đọc nó. Ghi ra đây thay vì
--      lặng lẽ đụng vào một bảng không ai dùng.

-- ============================================================
-- 1. GÁN CHỦ CÂY CHO CÂY CHƯA CÓ CHỦ  ⚠ PHẢI CHẠY TRƯỚC MỤC 2
-- ============================================================
-- ⚠⚠ ĐÂY LÀ CÂU NGUY HIỂM NHẤT CỦA CẢ FILE, và bàn thử đã bắt được nó
--    08/09/2026 trước khi ai kịp dán:
--
--    `11-quyen-he-thong.sql` mục 5 gán `chu_so_huu` theo email **cắm cứng**
--    `trongdung1982@gmail.com`. Trên máy chủ thật câu ấy trúng; trên bàn thử
--    (email `chu@thu.local`) nó **không gán được gì**, và cột đứng `null` mà
--    không một câu lỗi nào. Nếu mục 4 neo `co_the_quan_tri()` vào một cột
--    `null` thì kết quả là **không ai duyệt được đơn xin vào cây nữa** — và
--    triệu chứng chỉ lộ ra khi có người nộp đơn.
--
--    Nên ở đây KHÔNG hỏi email. Hỏi chính bảng `tree_members`: ai đang mang
--    vai chủ cây thì người ấy là chủ. Nguồn ấy đúng trên mọi máy chủ, và nó
--    là nguồn duy nhất còn nói được sự thật sau khi mục 2 xoá mã vai đi.
--
-- ⚠ `order by added_at, user_id` chứ không `limit 1` trần: cây nào lỡ có hai
--   dòng `quan_tri_he_thong` thì lấy dòng CŨ NHẤT — người vào trước là người
--   dựng. Không có `order by` thì Postgres trả dòng nào cũng được, và hai lần
--   chạy cho hai kết quả khác nhau.

update public.trees t
   set chu_so_huu = (
     select tm.user_id
       from public.tree_members tm
      where tm.tree_id = t.id
        and tm.role = 'quan_tri_he_thong'
      order by tm.added_at, tm.user_id
      limit 1
   )
 where t.chu_so_huu is null
   and exists (
     select 1 from public.tree_members tm
      where tm.tree_id = t.id and tm.role = 'quan_tri_he_thong'
   );

-- Cây nào vẫn không có chủ sau câu trên thì DỪNG HẲN. Chạy tiếp là đẻ ra một
-- cây không ai quản trị được, và vì RLS chặn nên chỉ dọn được bằng SQL Editor.
do $$
declare v_hong text;
begin
  select string_agg(tree_code, ', ') into v_hong
    from public.trees where chu_so_huu is null;

  if v_hong is not null then
    raise exception
      'DỪNG: gia phả (%) không có chủ, và không có dòng tree_members nào mang '
      'vai quan_tri_he_thong để suy ra. Gán tay bằng câu: update public.trees '
      'set chu_so_huu = (select id from auth.users where email = ''…'') where '
      'tree_code = ''…''; rồi chạy lại file này.', v_hong;
  end if;

  raise notice 'Mọi gia phả đều đã có chủ sở hữu.';
end $$;

-- ============================================================
-- 2. HẠ VAI `quan_tri_he_thong` → `quan_tri` TRONG tree_members
-- ============================================================
-- Sau mục 1, mọi cây đã có `chu_so_huu`, nên hạ vai không lấy mất quyền quản
-- trị của ai — quyền ấy nay đọc ở cột kia.
--
-- ⚠ Giữ nguyên `approved`, `person_id`, `tin_cay`. Chỉ đổi đúng một cột.

update public.tree_members
   set role = 'quan_tri'
 where role = 'quan_tri_he_thong';

-- ============================================================
-- 3. THU HẸP RÀNG BUỘC — mã `quan_tri_he_thong` KHÔNG ĐẶT VÀO BẢNG ĐƯỢC NỮA
-- ============================================================
-- Đây là phần đắt nhất của file, và nó không sửa một hàm nào: nó làm cho
-- chuyện "một chữ hai nghĩa" thành **không thể xảy ra**, thay vì thành một
-- điều cấm ghi trong tài liệu mà ai cũng có thể quên.
--
-- ⚠ Lặp lại đúng cái bẫy `05` và `06` đã gặp: ràng buộc kiểm trên `role`
--   không được đặt tên ở `01-bang.sql` nên Postgres tự đặt. Quét MỌI ràng
--   buộc kiểm có nhắc `role`, gỡ hết, rồi đặt lại một cái có tên đàng hoàng.

do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
     where conrelid = 'public.tree_members'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.tree_members drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.tree_members
  add constraint tree_members_role_check
  check (role in ('quan_tri', 'sua', 'xem', 'sao_luu'));

-- ============================================================
-- 4. co_the_quan_tri() ĐỔI NGHĨA — neo vào chu_so_huu
-- ============================================================
-- Trước: `vai_tro(p_tree) = 'quan_tri_he_thong'`.
-- Nay  : Quản trị hệ thống, HOẶC chủ của chính cây ấy.
--
-- ⚠ Viết dạng KHẲNG ĐỊNH và bọc `coalesce(…, false)` ở nhánh so sánh. Cây
--   không tồn tại → `select` không ra dòng nào → `null`; `false or null` cho
--   ra `null` chứ không cho ra `false`, và một hàm gác cửa trả `null` là đúng
--   cái bẫy đã mở lỗ leo quyền ngày 04/09 (b94) mà 57 phép kiểm báo xanh.
--   `la_quan_tri_he_thong()` đã tự bọc `coalesce` bên trong nó (`11` mục 6).

create or replace function public.co_the_quan_tri(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.la_quan_tri_he_thong()
      or coalesce(
           (select t.chu_so_huu = auth.uid()
              from public.trees t where t.id = p_tree),
           false);
$$;

-- ============================================================
-- 5. HAI HÀM HỎI NHỎ — gom câu trả lời về một chỗ
-- ============================================================
-- Năm hàm dưới đây đều phải hỏi hai câu giống hệt nhau. Gom vào đây thay vì
-- chép năm lần, đúng lý lẽ đã dùng cho `la_thanh_vien()` ở b87 và
-- `co_the_quan_tri()` ở b97: một chỗ trả lời thì đổi ý chỉ phải sửa một chỗ,
-- và bảng tự kiểm cuối file **đếm được** năm hàm ấy có hỏi hay không.

-- ------------------------------------------------------------
-- ⚠⚠ LUẬT KHÔNG NGOẠI LỆ: KHÔNG AI ĐẶT QUYỀN CHO CHÍNH MÌNH
--
-- Chủ dự án chốt 08/09/2026: *"quy tắc không được đặt quyền cho chính bản
-- thân để không bao giờ có thể leo thang quyền, chiếm quyền cao hơn trong hệ
-- thống."*
--
-- Không có ngoại lệ cho Quản trị hệ thống. Họ đã có mọi quyền ở mọi cây qua
-- cờ `tai_khoan`, nên chặn họ tự trỏ vào mình không lấy đi khả năng nào —
-- chỉ lấy đi đúng một đường: tự nhận cây của người khác về tên mình.
-- Một luật không có ngoại lệ thì kiểm được; một luật có một ngoại lệ thì phải
-- kiểm cả ngoại lệ, và ngoại lệ là chỗ lỗ hổng hay nằm.
--
-- ⚠ Vì sao luật này KHÔNG cấm `tao_gia_pha_moi()` tự cấp vai cho người dựng
--   cây: ở đó người gọi không chọn được vai, không truyền vai vào, không nâng
--   được lên gì cao hơn — hệ thống đặt một giá trị cố định theo luật. Khác hẳn
--   việc gọi một hàm đổi quyền rồi trỏ vào dòng của chính mình.
-- ------------------------------------------------------------
create or replace function public.la_chinh_minh(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(p_user = auth.uid(), false);
$$;

-- Người này có phải chủ của cây này không? Dùng để CHẶN hạ vai / gỡ chủ cây.
create or replace function public.la_chu_cay(p_tree uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select t.chu_so_huu = p_user from public.trees t where t.id = p_tree),
    false);
$$;

-- ============================================================
-- 6. ds_tai_khoan() SỬA THEO — nếu không, chủ cây mất danh sách tài khoản
-- ============================================================
-- Bản của `05-sao-luu.sql` lọc `role in ('quan_tri_he_thong','sao_luu')` đọc
-- thẳng từ bảng. Mục 2 vừa xoá mã ấy khỏi bảng, nên nếu để nguyên thì chỉ tài
-- khoản sao lưu còn gọi được — và màn hình b106 sẽ hiện danh sách rỗng mà
-- không báo lỗi gì.
--
-- Bản mới hỏi `co_the_quan_tri()` cho phần quản trị, và giữ nguyên đường của
-- tài khoản sao lưu (nó không phải quản trị, nhưng phải đọc được để sao lưu).
--
-- ⚠ `drop function` trước vì hàm trả BẢNG — `create or replace` không đổi
--   được danh sách cột. Ở đây danh sách không đổi, nhưng `drop` trước là thói
--   quen rẻ, và lần dán sáng 08/09 đã trả giá cho việc thiếu nó.

drop function if exists public.ds_tai_khoan();

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
           select t.id from public.trees t
            where public.co_the_quan_tri(t.id)
           union
           select tm.tree_id from public.tree_members tm
            where tm.user_id = auth.uid()
              and tm.role = 'sao_luu'
         );
$$;

-- ============================================================
-- 7. ds_thanh_vien(p_tree) — danh sách TÀI KHOẢN của một gia phả
-- ============================================================
-- ⚠ TÊN GỌI. Bảng tên là `tree_members` và hàm này tên `ds_thanh_vien`, nhưng
--   thứ nó liệt kê là **TÀI KHOẢN ĐĂNG NHẬP**, không phải người trong sơ đồ
--   gia phả. Chủ dự án nhắc thẳng chỗ này 08/09/2026. Hai cột khác nhau:
--     · `user_id`   → tài khoản trong phần mềm. Vai trò gắn vào ĐÂY.
--     · `person_id` → mã người trong cây (`P0012`), có thể trống. Chỉ dùng để
--                     tính phạm vi trực hệ khi vai là `sua`.
--   Nghĩa là chủ cây phong `quan_tri` cho một tài khoản bất kỳ — người ấy
--   không cần có mặt trong gia phả, không cần là con cháu trong họ.
--   Màn hình b106 phải dùng chữ **"tài khoản"**, đừng dùng chữ "thành viên".
--
-- ⚠ Gác bằng `co_the_kiem_duyet()` chứ không `co_the_quan_tri()`, và cố ý:
--   `02-rls.sql` đã cho MỌI thành viên đọc bảng `tree_members`, nên gác chặt
--   hơn ở đây là diễn kịch chứ không phải hàng rào. Quản trị gia phả mở khu
--   Thành viên mà thấy bảng trống thì không hiểu vì sao — cho họ nhìn, và để
--   năm hàm bên dưới chặn tay họ.
--
-- ⚠ Phép kiểm quyền nằm TRONG `where`, đúng khuôn `ds_cho_duyet()` của `07`:
--   với hàm `sql` trả bảng thì đó là cách gọn nhất, không có nhánh nào để rơi
--   lọt qua.

drop function if exists public.ds_thanh_vien(uuid);

create or replace function public.ds_thanh_vien(p_tree uuid)
returns table (
  user_id    uuid,
  email      text,
  ma_ngan    text,
  vai        text,
  approved   boolean,
  person_id  text,
  ten_nguoi  text,
  tin_cay    boolean,
  la_chu_cay boolean,
  xin_luc    timestamptz,
  loi_nhan   text,
  added_at   timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select tm.user_id,
         tm.email,
         coalesce(tk.ma_ngan, ''),
         tm.role,
         tm.approved,
         tm.person_id,
         coalesce(p.vn->>'name', p.id, ''),
         tm.tin_cay,
         coalesce(t.chu_so_huu = tm.user_id, false),
         tm.xin_luc,
         tm.loi_nhan,
         tm.added_at
    from public.tree_members tm
    join public.trees t         on t.id  = tm.tree_id
    left join public.tai_khoan tk on tk.user_id = tm.user_id
    left join public.persons  p on p.tree_id = tm.tree_id and p.id = tm.person_id
   where tm.tree_id = p_tree
     and public.co_the_kiem_duyet(p_tree)
   order by (t.chu_so_huu = tm.user_id) desc nulls last,
            tm.approved, tm.role, tm.email;
$$;

-- ============================================================
-- 8. doi_vai_thanh_vien(p_tree, p_user, p_vai)
-- ============================================================
-- Trần quyền cấp được: `quan_tri`. Chủ dự án chốt 08/09/2026 — *"việc đổi vai
-- thì quyền tối đa cấp cho tài khoản khác là quản trị và áp dụng cho cây mình
-- tạo."*
--
-- ⚠ `sao_luu` KHÔNG nằm trong trần, và cũng không đổi được đi. Nó là tài khoản
--   máy chạy sao lưu đêm (`05-sao-luu.sql`); đổi vai nó là làm hỏng sao lưu
--   lặng lẽ — file sinh ra vẫn có, chỉ rỗng. Đúng lỗ hổng b102 đã bắt được.

create or replace function public.doi_vai_thanh_vien(
  p_tree uuid,
  p_user uuid,
  p_vai  text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare v_vai_cu text;
begin
  if not public.co_the_quan_tri(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ chủ gia phả mới đổi được quyền của tài khoản khác.');
  end if;

  if public.la_chinh_minh(p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai đặt quyền cho chính mình được. Nhờ một quản trị khác làm việc này.');
  end if;

  if coalesce(p_vai, '') not in ('quan_tri', 'sua', 'xem') then
    return jsonb_build_object('ok', false, 'loi',
      'Quyền cấp được cho tài khoản khác chỉ có: quan_tri, sua, xem.');
  end if;

  if public.la_chu_cay(p_tree, p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Đây là chủ gia phả — không hạ vai được. Muốn đổi chủ thì dùng Bàn giao gia phả.');
  end if;

  select role into v_vai_cu from public.tree_members
   where tree_id = p_tree and user_id = p_user;

  if v_vai_cu is null then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này chưa có tên trong gia phả.');
  end if;

  if v_vai_cu = 'sao_luu' then
    return jsonb_build_object('ok', false, 'loi',
      'Đây là tài khoản sao lưu tự động — đổi vai nó là làm hỏng bản sao lưu đêm.');
  end if;

  update public.tree_members
     set role = p_vai
   where tree_id = p_tree and user_id = p_user;

  return jsonb_build_object('ok', true, 'vaiCu', v_vai_cu, 'vaiMoi', p_vai);
end;
$$;

-- ============================================================
-- 9. gan_nguoi_cho_thanh_vien(p_tree, p_user, p_person)
-- ============================================================
-- Gắn mã người vào một tài khoản. `p_person = null` là GỠ gắn.
--
-- ⚠⚠ ĐÂY LÀ CỬA LEO THANG KHÔNG AI NGHĨ TỚI khi nghe chữ "đổi quyền". Gắn
--    mình vào một cụ tổ đời trên cùng là mở `pham_vi_sua()` ra **cả cây** —
--    `06-quyen-truc-he.sql` mục 5 đi xuống toàn bộ con cháu. Không cần đổi
--    vai một chữ nào. Nên hàm này chặn "tự làm cho mình" y hệt mục 8.

create or replace function public.gan_nguoi_cho_thanh_vien(
  p_tree   uuid,
  p_user   uuid,
  p_person text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_ma text;
  n    integer;
begin
  if not public.co_the_quan_tri(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ chủ gia phả mới gắn được mã người cho tài khoản.');
  end if;

  if public.la_chinh_minh(p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai tự gắn mã người cho chính mình được — gắn vào một cụ tổ là tự '
      || 'mở quyền sửa ra cả gia phả. Nhờ một quản trị khác làm việc này.');
  end if;

  v_ma := nullif(btrim(coalesce(p_person, '')), '');

  if v_ma is not null then
    select count(*) into n from public.persons
     where tree_id = p_tree and id = v_ma and not coalesce(deleted, false);
    if n <> 1 then
      return jsonb_build_object('ok', false, 'loi',
        'Không có người mang mã ' || v_ma || ' trong gia phả này.');
    end if;
  end if;

  update public.tree_members
     set person_id = v_ma
   where tree_id = p_tree and user_id = p_user;

  if not found then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này chưa có tên trong gia phả.');
  end if;

  return jsonb_build_object('ok', true, 'maNguoi', v_ma);

exception
  -- `06-quyen-truc-he.sql` mục 3 dựng chỉ mục `unique (tree_id, person_id)`:
  -- một mã người chỉ gắn cho MỘT tài khoản. Bắt lại để người bấm nhận một câu
  -- tiếng Việt thay vì mã lỗi Postgres.
  when unique_violation then
    return jsonb_build_object('ok', false, 'loi',
      'Mã ' || v_ma || ' đã gắn cho một tài khoản khác rồi. Gỡ bên đó trước.');
end;
$$;

-- ============================================================
-- 10. dat_tin_cay_thanh_vien(p_tree, p_user, p_bat)
-- ============================================================
-- `tin_cay` = lần Lưu của người này thành chính thức ngay, KHÔNG qua hàng chờ
-- duyệt (`08-kiem-duyet.sql` mục 3 và `ghi_thang()`).
--
-- ⚠⚠ CỬA LEO THANG THỨ HAI, và là cửa sắc nhất: tự bật cờ này cho mình là tự
--    bỏ qua kiểm duyệt nội dung. Không đổi vai, không gắn mã người, không có
--    gì trên màn hình đổi màu. Đây là ví dụ rõ nhất cho thấy vì sao luật
--    "không tự đặt quyền cho mình" phải gác cả bốn cửa chứ không riêng cửa vai.

create or replace function public.dat_tin_cay_thanh_vien(
  p_tree uuid,
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
  if not public.co_the_quan_tri(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ chủ gia phả mới bật/tắt được chế độ ghi thẳng.');
  end if;

  if public.la_chinh_minh(p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai tự cho mình ghi thẳng được — đó là tự bỏ qua kiểm duyệt. '
      || 'Nhờ một quản trị khác làm việc này.');
  end if;

  update public.tree_members
     set tin_cay = coalesce(p_bat, false)
   where tree_id = p_tree and user_id = p_user;

  if not found then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này chưa có tên trong gia phả.');
  end if;

  return jsonb_build_object('ok', true, 'tinCay', coalesce(p_bat, false));
end;
$$;

-- ============================================================
-- 11. go_thanh_vien(p_tree, p_user)
-- ============================================================
-- Gỡ một tài khoản khỏi gia phả. Sau khi gỡ, người ấy đọc 0 dòng — RLS gác
-- bằng `la_thanh_vien()`, không cần dọn gì thêm.
--
-- ⚠ Chặn "tự gỡ mình" tuy KHÔNG phải leo thang (tự gỡ là tự bớt quyền). Chặn
--   để luật chỉ có một câu, không có "trừ trường hợp". Người muốn rời gia phả
--   thì đó là một việc khác, có tên khác, và chưa ai xin.

create or replace function public.go_thanh_vien(p_tree uuid, p_user uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_vai   text;
  v_email text;
begin
  if not public.co_the_quan_tri(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ chủ gia phả mới gỡ được tài khoản khỏi gia phả.');
  end if;

  if public.la_chinh_minh(p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai tự gỡ mình khỏi gia phả bằng màn hình này được.');
  end if;

  if public.la_chu_cay(p_tree, p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Đây là chủ gia phả — không gỡ được. Muốn đổi chủ thì dùng Bàn giao gia phả.');
  end if;

  select role, email into v_vai, v_email from public.tree_members
   where tree_id = p_tree and user_id = p_user;

  if v_vai is null then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này chưa có tên trong gia phả.');
  end if;

  if v_vai = 'sao_luu' then
    return jsonb_build_object('ok', false, 'loi',
      'Đây là tài khoản sao lưu tự động — gỡ nó là bản sao lưu đêm ra file rỗng.');
  end if;

  delete from public.tree_members
   where tree_id = p_tree and user_id = p_user;

  return jsonb_build_object('ok', true, 'email', coalesce(v_email, ''), 'vaiCu', v_vai);
end;
$$;

-- ============================================================
-- 12. doi_chu_cay(p_tree, p_user_moi) — BÀN GIAO GIA PHẢ
-- ============================================================
-- Chủ dự án nêu 08/09/2026: *"bàn giao cây cho người khác => đây đúng là 1
-- chức năng bị bỏ sót, cần bổ sung."*
--
-- Trước file này, `chu_so_huu` là vĩnh viễn: cột ấy chỉ do `tao_gia_pha_moi()`
-- đặt một lần, không hàm nào đổi. Chủ cây bỏ đi khỏi dòng họ, hay đơn giản là
-- muốn giao lại cho con cháu, thì không có đường nào ngoài SQL Editor.
--
-- ⚠⚠ BA CÂU GHI PHẢI ĐI CÙNG NHAU, không tách rời được:
--    1. `trees.chu_so_huu` sang người mới
--    2. người mới phải CÓ dòng `tree_members`, vai `quan_tri`, `approved`
--    3. chủ cũ ở lại làm `quan_tri`
--
--    Thiếu câu 2 là đẻ ra đúng cái trạng thái mâu thuẫn mà
--    `THIET-KE-NHIEU-CAY.md` mục 2 cảnh báo — **chủ mới SỬA được mà không ĐỌC
--    được**: `co_the_quan_tri()` cho qua vì nó hỏi `chu_so_huu`, còn RLS chặn
--    vì nó hỏi `la_thanh_vien()` (đọc `tree_members`). Triệu chứng sẽ là
--    *"bấm Lưu báo thành công mà màn hình trống"*.
--
--    Cả ba nằm trong thân một hàm plpgsql, tức trong cùng một giao dịch: câu
--    nào hỏng thì cả ba tự lùi.
--
-- ⚠ Chủ cũ Ở LẠI làm `quan_tri`, không bị gỡ. Bàn giao không phải đuổi đi, và
--   người vừa giao cây thường là người duy nhất còn biết dữ liệu trong đó.
--   Chủ mới muốn gỡ họ thì gỡ được — đó là quyền của chủ mới.
--
-- ⚠ Quản trị hệ thống gọi được hàm này (qua `co_the_quan_tri()`), nhưng KHÔNG
--   tự nhận cây về mình được: mục 5 chặn `p_user_moi = auth.uid()` không
--   ngoại lệ. Họ chuyển cây cho một tài khoản khác thì được — và họ vốn đã có
--   mọi quyền ở mọi cây, nên chặn đường ấy không lấy đi khả năng nào.

create or replace function public.doi_chu_cay(p_tree uuid, p_user_moi uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_chu_cu    uuid;
  v_email_moi text;
begin
  if not public.co_the_quan_tri(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ chủ gia phả mới bàn giao được gia phả này.');
  end if;

  if p_user_moi is null then
    return jsonb_build_object('ok', false, 'loi', 'Chưa chọn tài khoản nhận.');
  end if;

  if public.la_chinh_minh(p_user_moi) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai tự nhận gia phả về tên mình được.');
  end if;

  select chu_so_huu into v_chu_cu from public.trees where id = p_tree;
  if not found then
    return jsonb_build_object('ok', false, 'loi', 'Không có gia phả này.');
  end if;

  if v_chu_cu = p_user_moi then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này đang là chủ gia phả rồi.');
  end if;

  -- ⚠ Hỏi `tai_khoan` chứ không hỏi `auth.users`: `11` mục 3 đặt luật mọi tài
  --   khoản đều có một dòng ở đó (có trigger trên `auth.users`). Tài khoản
  --   thiếu dòng ấy là tài khoản hỏng — giao cây cho nó là giấu lỗi đi.
  select u.email into v_email_moi
    from auth.users u
    join public.tai_khoan tk on tk.user_id = u.id
   where u.id = p_user_moi;

  if v_email_moi is null then
    return jsonb_build_object('ok', false, 'loi',
      'Không có tài khoản nào mang mã ấy trong phần mềm.');
  end if;

  -- 1 · đổi chủ
  update public.trees set chu_so_huu = p_user_moi where id = p_tree;

  -- 2 · chủ mới phải đọc được cây mình vừa nhận
  insert into public.tree_members (tree_id, user_id, role, email, approved)
  values (p_tree, p_user_moi, 'quan_tri', coalesce(v_email_moi, ''), true)
  on conflict (tree_id, user_id) do update
     set role = 'quan_tri', approved = true;

  -- 3 · chủ cũ ở lại làm quản trị gia phả
  if v_chu_cu is not null then
    update public.tree_members
       set role = 'quan_tri', approved = true
     where tree_id = p_tree and user_id = v_chu_cu;
  end if;

  return jsonb_build_object('ok', true,
    'chuCu', v_chu_cu, 'chuMoi', p_user_moi, 'emailMoi', coalesce(v_email_moi, ''));
end;
$$;

-- ============================================================
-- 13. CẤP QUYỀN GỌI HÀM
-- ============================================================
-- ⚠ KHÔNG cấp cho `anon`. Mọi hàm ở đây đọc `auth.uid()`, và người chưa đăng
--   nhập thì mọi hàng rào trả `false` — nhưng cấp quyền cho một vai không có
--   việc gì ở đây là mở rộng bề mặt tấn công mà không đổi lấy gì. Cùng lý lẽ
--   với `11-quyen-he-thong.sql` mục 17 và `12-tao-cay.sql` mục 3.

revoke all on function public.la_chinh_minh(uuid)                        from public, anon;
revoke all on function public.la_chu_cay(uuid, uuid)                     from public, anon;
revoke all on function public.ds_thanh_vien(uuid)                        from public, anon;
revoke all on function public.doi_vai_thanh_vien(uuid, uuid, text)       from public, anon;
revoke all on function public.gan_nguoi_cho_thanh_vien(uuid, uuid, text) from public, anon;
revoke all on function public.dat_tin_cay_thanh_vien(uuid, uuid, boolean) from public, anon;
revoke all on function public.go_thanh_vien(uuid, uuid)                  from public, anon;
revoke all on function public.doi_chu_cay(uuid, uuid)                    from public, anon;
revoke all on function public.ds_tai_khoan()                             from public, anon;
revoke all on function public.co_the_quan_tri(uuid)                      from public, anon;

grant execute on function public.la_chinh_minh(uuid)                        to authenticated;
grant execute on function public.la_chu_cay(uuid, uuid)                     to authenticated;
grant execute on function public.ds_thanh_vien(uuid)                        to authenticated;
grant execute on function public.doi_vai_thanh_vien(uuid, uuid, text)       to authenticated;
grant execute on function public.gan_nguoi_cho_thanh_vien(uuid, uuid, text) to authenticated;
grant execute on function public.dat_tin_cay_thanh_vien(uuid, uuid, boolean) to authenticated;
grant execute on function public.go_thanh_vien(uuid, uuid)                  to authenticated;
grant execute on function public.doi_chu_cay(uuid, uuid)                    to authenticated;
grant execute on function public.ds_tai_khoan()                             to authenticated;
grant execute on function public.co_the_quan_tri(uuid)                      to authenticated;

-- ============================================================
-- 14. BẢNG TỰ KIỂM — đọc sau khi dán
-- ============================================================
-- ⚠ Bảng này hỏi *"thứ này có tồn tại và có đúng hình dạng không"*. Nó KHÔNG
--   hỏi *"hàng rào có chặn được không"* — câu ấy chỉ phép đo mượn danh nghĩa
--   tài khoản mới trả lời được (`kiem-thu/ban-thu-sql/do-b105.mjs`, ngoài
--   repo). Ngày 07/09/2026 một bảng tự kiểm 12/12 ĐẠT đã cho qua hai lỗ hổng
--   thật. Đọc bảng này với đúng chừng ấy lòng tin.

select ten_kiem as "Kiểm", ket_qua as "Kết quả"
from (

  select 1 as stt,
    'Mọi gia phả đều có chủ sở hữu' as ten_kiem,
    case when (select count(*) from public.trees where chu_so_huu is null) = 0
      then 'ĐẠT'
      else 'HỎNG — còn ' || (select count(*)::text from public.trees
                              where chu_so_huu is null)
           || ' cây không ai quản trị được' end as ket_qua

  union all
  select 2,
    'Không còn dòng tree_members nào mang vai quan_tri_he_thong',
    case when (select count(*) from public.tree_members
                where role = 'quan_tri_he_thong') = 0
      then 'ĐẠT' else 'HỎNG — mục 2 chưa chạy' end

  union all
  select 3,
    'Ràng buộc role đã TỪ CHỐI mã quan_tri_he_thong',
    case when (select pg_get_constraintdef(oid) from pg_constraint
                where conrelid = 'public.tree_members'::regclass
                  and conname = 'tree_members_role_check')
              not ilike '%quan_tri_he_thong%'
      then 'ĐẠT' else 'HỎNG — một chữ vẫn mang hai nghĩa được' end

  union all
  -- ⚠ Phép quan trọng nhất bảng này. Sai ở đây là mọi thứ xây bên trên đều sai.
  select 4,
    'co_the_quan_tri() neo vào chu_so_huu, không neo vào mã vai',
    case when (select p.prosrc from pg_proc p join pg_namespace n
                 on n.oid = p.pronamespace
                where n.nspname = 'public' and p.proname = 'co_the_quan_tri')
              ilike '%chu_so_huu%'
      then 'ĐẠT' else 'HỎNG — DỪNG LẠI, không ai duyệt được đơn nữa' end

  union all
  select 5,
    'co_the_quan_tri() KHÔNG còn hỏi mã vai quan_tri_he_thong',
    case when (select p.prosrc from pg_proc p join pg_namespace n
                 on n.oid = p.pronamespace
                where n.nspname = 'public' and p.proname = 'co_the_quan_tri')
              not ilike '%= ''quan_tri_he_thong''%'
      then 'ĐẠT' else 'CẦN CHÚ Ý — bản cũ có thể còn đè lên' end

  union all
  select 6,
    'Đủ 6 hàm quản lý tài khoản + 2 hàm hỏi nhỏ',
    case when (select count(*) from pg_proc p join pg_namespace n
                 on n.oid = p.pronamespace
                where n.nspname = 'public'
                  and p.proname in ('ds_thanh_vien','doi_vai_thanh_vien',
                        'gan_nguoi_cho_thanh_vien','dat_tin_cay_thanh_vien',
                        'go_thanh_vien','doi_chu_cay',
                        'la_chinh_minh','la_chu_cay')) = 8
      then 'ĐẠT' else 'HỎNG — thiếu hàm, xem lại file có chạy hết không' end

  union all
  -- ⚠⚠ Phép này đếm được thứ mà đọc mã bằng mắt hay bỏ sót: LUẬT "không tự
  --    đặt quyền cho mình" phải gác ĐỦ NĂM cửa. Quên một cửa là còn một đường
  --    leo thang, và bốn cửa kia vẫn báo xanh.
  select 7,
    'Cả 5 hàm đổi quyền đều hỏi la_chinh_minh()',
    case when (select count(*) from pg_proc p join pg_namespace n
                 on n.oid = p.pronamespace
                where n.nspname = 'public'
                  and p.proname in ('doi_vai_thanh_vien','gan_nguoi_cho_thanh_vien',
                        'dat_tin_cay_thanh_vien','go_thanh_vien','doi_chu_cay')
                  and p.prosrc ilike '%la_chinh_minh%') = 5
      then 'ĐẠT'
      else 'HỎNG — CÒN ĐƯỜNG TỰ NÂNG QUYỀN. Dừng lại, đừng dùng tiếp.' end

  union all
  select 8,
    'doi_vai_thanh_vien() có trần quyền (không cấp được quan_tri_he_thong)',
    case when (select p.prosrc from pg_proc p join pg_namespace n
                 on n.oid = p.pronamespace
                where n.nspname = 'public' and p.proname = 'doi_vai_thanh_vien')
              ilike '%not in (''quan_tri'', ''sua'', ''xem'')%'
      then 'ĐẠT' else 'HỎNG — trần quyền mất, cấp được vai bất kỳ' end

  union all
  select 9,
    'doi_chu_cay() có chèn tree_members cho chủ mới',
    case when (select p.prosrc from pg_proc p join pg_namespace n
                 on n.oid = p.pronamespace
                where n.nspname = 'public' and p.proname = 'doi_chu_cay')
              ilike '%insert into public.tree_members%'
      then 'ĐẠT'
      else 'HỎNG — chủ mới sẽ SỬA được mà KHÔNG ĐỌC được' end

  union all
  select 10,
    'ds_tai_khoan() đã đổi sang hỏi co_the_quan_tri()',
    case when (select p.prosrc from pg_proc p join pg_namespace n
                 on n.oid = p.pronamespace
                where n.nspname = 'public' and p.proname = 'ds_tai_khoan')
              ilike '%co_the_quan_tri%'
      then 'ĐẠT' else 'HỎNG — chủ cây sẽ thấy danh sách tài khoản RỖNG' end

  union all
  select 11,
    'anon KHÔNG gọi được doi_vai_thanh_vien()',
    case when not has_function_privilege('anon',
      'public.doi_vai_thanh_vien(uuid, uuid, text)', 'execute')
      then 'ĐẠT' else 'CẦN CHÚ Ý — anon gọi được (không thủng, nhưng thừa)' end

  union all
  select 12,
    'Số tài khoản đang mang vai quan_tri: '
      || (select count(*)::text from public.tree_members where role = 'quan_tri'),
    'ghi nhớ — đối chiếu với số chủ cây cộng số người được phong'

  union all
  select 13,
    'Số gia phả: ' || (select count(*)::text from public.trees)
      || ' · số chủ cây khác nhau: '
      || (select count(distinct chu_so_huu)::text from public.trees),
    'ghi nhớ'

) t
order by stt;
