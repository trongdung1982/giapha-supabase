-- ============================================================
-- giapha-supabase · luoc-do/16-thung-rac-cay.sql
-- Vai trò  : XOÁ GIA PHẢ theo luật hai chữ ký — chủ cây XIN, Quản trị hệ
--            thống DUYỆT — rồi cây nằm trong thùng rác 30 ngày trước khi
--            được dọn hẳn. Dọn là việc bấm tay, chọn hàng loạt, chỉ Quản
--            trị hệ thống làm được.
-- Phiên bản: 0.2.0 · Cập nhật: 09/09/2026 (b110)
--            0.2.0 chủ dự án chốt sau khi đọc bản 0.1.0: *"không hiện cây
--            trong thùng rác. nếu người nào đang có chân trong cây này thì
--            nhận thông báo cây đã bị xoá bởi… vậy không lo màn hình trắng"*.
--            Ba việc theo sau: `ds_gia_pha()` **bỏ** nhánh `la_thanh_vien`
--            của 0.1.0 (cây biến hẳn khỏi danh sách người thường) · thêm cột
--            `da_xoa_boi` — 0.1.0 CỐ Ý không lưu ai duyệt, nay câu thông báo
--            đòi đúng cái tên ấy · thêm hàm `tin_thung_rac()` để màn hình
--            hỏi được tên cây và người xoá, thứ mà RLS nay không cho họ đọc.
-- ============================================================
--
-- ⚠⚠ SỐ 16, KHÔNG PHẢI 15. `15-tim-kiem.sql` đã lấy số ấy và đã dán
--    09/09/2026 (b109b). `THIET-KE-NHIEU-CAY.md` mục 11.6 còn ghi tên file
--    này là `15-thung-rac-cay.sql` vì nó viết ra trước khi b109b tồn tại —
--    lấy số ở `KE-HOACH.md`, đừng lấy ở đó.
--
-- ⚠⚠ THỨ TỰ DÁN: file này dán SAU `14-loi-moi.sql`.
--    Nó định nghĩa đè `ds_gia_pha()` bản 3 cột lời mời của `14`. Dán trước
--    `14` thì `14` sẽ đè ngược lại và bốn cột thùng rác biến mất — màn hình
--    mất nút Xin xoá, mất hàng chờ, mất cả khu Thùng rác, mà không báo lỗi.
--
-- ⚠⚠ VÀ CHIỀU NGƯỢC, ĐỌC KỸ VÌ NÓ IM LẶNG:
--    **Dán lại `11` hoặc `14` thì BẮT BUỘC dán lại file này.** `11` định
--    nghĩa `co_the_xem_cay()` bản không biết gì về thùng rác, và `14` định
--    nghĩa `ds_gia_pha()` bản 14 cột. Dán một trong hai mà quên file này thì
--    cây trong thùng rác **mở lại cho cả họ đọc**, và không có gì báo lỗi.
--    Đây là chuỗi dài nhất trong cả lược đồ, chép lại cho gọn:
--        dán lại `11`/`10` → dán lại `14` → dán lại `16`
--        dán lại `13`/`14` → dán lại `15`
--
-- ═══ VÌ SAO CÓ FILE NÀY ═══
--
-- Chủ dự án chốt 09/09/2026: *"chủ cây có quyền yêu cầu xoá cây do mình tạo
-- ra"*. Chữ **yêu cầu** là nghĩa đen — chủ cây xin, Quản trị hệ thống duyệt.
-- Cùng khuôn hai chữ ký đã dùng cho việc vào cây (`14`), và dùng ở đây vì
-- đây là việc phá nhiều dữ liệu nhất trong cả hệ thống: một cú gật xoá 681
-- người, 189 hôn nhân và toàn bộ nhật ký thay đổi của họ.
--
-- Thiết kế đầy đủ: `THIET-KE-NHIEU-CAY.md` mục 11.6.
--
-- ═══ BỐN TRẠNG THÁI CỦA MỘT CÂY ═══
--
--   xin_xoa_luc trống · da_xoa_luc trống  → bình thường
--   xin_xoa_luc CÓ    · da_xoa_luc trống  → ĐANG XIN XOÁ ⚠ cây vẫn dùng
--                                             được y như thường
--   xin_xoa_luc CÓ    · da_xoa_luc CÓ     → trong thùng rác, không ai đọc
--   quá 30 ngày trong thùng rác            → dọn hẳn được
--
-- ⚠ DÒNG THỨ HAI LÀ CHỖ DỄ LÀM SAI NHẤT, và nó sai theo hướng không ai báo:
--   một lá đơn xin xoá **không được** khoá cây lại. Đơn còn có thể bị từ
--   chối, và trong lúc chờ thì cả dòng họ vẫn đang dùng. Khoá sớm là biến
--   một lá đơn thành một lệnh. Nên `co_the_xem_cay()` và `co_the_sua()` dưới
--   đây chỉ hỏi `da_xoa_luc`, KHÔNG hỏi `xin_xoa_luc`.
--
-- ═══⚠⚠ CHỖ KHÓ THẬT SỰ: THIẾT KẾ CHỈ ĐÚNG NGUY HIỂM NHƯNG CHỈ SAI ĐƯỜNG VÁ
--
-- `THIET-KE-NHIEU-CAY.md` mục 11.6 viết:
--
--     *"`co_the_xem_cay()` — thêm điều kiện 'chưa vào thùng rác' vào đây.
--     An toàn. `la_thanh_vien()` — ĐỪNG ĐỘNG VÀO […] bản sao lưu PHẢI tiếp
--     tục chép cây đang nằm trong thùng rác."*
--
-- Câu ấy đúng về đích và sai về đường, và đo mới ra. `SaoLuu.gs` chép chín
-- bảng, trong đó **sáu bảng nội dung** (`trees` · `persons` · `unions` ·
-- `union_children` · `media` · `sources`) gác bằng đúng `co_the_xem_cay()` —
-- `11` mục 16 đổi chúng sang hàm ấy. Nên làm đúng chữ của thiết kế thì:
--
--     tài khoản `sao_luu` đọc cây trong thùng rác ra **0 dòng persons**,
--     file sao lưu đêm vẫn sinh ra, vẫn đủ chín bảng, chỉ thiếu đúng cái cây
--     mong manh nhất — và **không có gì báo lỗi**.
--
-- Tức đúng lỗ hổng b102 (`la_thanh_vien()` viết gọn → file sao lưu rỗng),
-- lặp lại ở hàm bên cạnh, sau năm ngày. Chỉ khác một chỗ: lần này thiết kế
-- đã ghi sẵn lời cảnh báo, và lời cảnh báo ấy trỏ vào hàm KHÔNG PHẢI chỗ
-- hỏng. **Đọc lời cảnh báo không thay được việc đo.**
--
-- Nên `co_the_xem_cay()` ở đây mang một lối riêng cho vai `sao_luu`:
-- thùng rác đóng cửa với NGƯỜI, không đóng cửa với MÁY SAO LƯU. Ba mươi
-- ngày ấy chính là ba mươi ngày dữ liệu mong manh nhất — để nó không có bản
-- sao nào là hỏng đúng lúc không được phép hỏng.
--
-- ═══ HAI HÀM ĐƯỢC SỬA, VÀ VÌ SAO CHỈ HAI ═══
--
--   `co_the_xem_cay()` → khoá ĐỌC 6 bảng nội dung. Có lối cho `sao_luu`.
--   `co_the_sua()`     → khoá GHI. Không có lối cho ai.
--
-- `co_the_sua()` là chỗ duy nhất phải sửa để khoá chiều ghi, và đó là kết
-- quả đo chứ không phải chọn cho gọn: `luu_cay()` hỏi nó ở hàng rào đầu
-- (`03` dòng 115), hai luật RLS của kho ảnh (`ghi_anh` · `xoa_anh`) cũng hỏi
-- nó. Ba cửa ghi, một câu hỏi.
--
-- KHÔNG động `la_thanh_vien()` và KHÔNG động `vai_tro()`:
--   · `la_thanh_vien()` gác `tree_members` · `change_log` · `imports` ·
--     `user_settings` — bốn bảng sao lưu vẫn phải chép được.
--   · `vai_tro()` là nền móng, và `05-sao-luu.sql` dùng nó ở luật đọc
--     `user_settings` và ở luật liệt kê kho ảnh. Đụng vào là máy sao lưu mất
--     nốt hai thứ ấy.

begin;

-- ============================================================
-- 1. NĂM CỘT MỚI TRÊN `trees`
-- ============================================================
-- ⚠ `xin_xoa_boi` và `da_xoa_boi` khai `on delete set null`, KHÔNG `cascade`:
--   xoá tài khoản người từng xin (hoặc từng duyệt) không được phép kéo theo
--   cả cái cây. Cùng lý lẽ `chu_so_huu` ở `11` mục 5.
--
-- ⚠ `da_xoa_boi` là cột THÊM Ở 0.2.0, và bản 0.1.0 cố ý KHÔNG có nó — lý lẽ
--   lúc ấy: *"ai duyệt thì `change_log` ghi, đẻ thêm cột là đẻ thêm chỗ để
--   hai bản lệch nhau"*. Lý lẽ ấy đúng khi không ai cần đọc cái tên đó trên
--   màn hình. Từ 0.2.0 thì có: thành viên của cây vừa bị xoá nhận một câu
--   **"đã bị xoá bởi ai"**, và họ KHÔNG đọc được `change_log` (bảng ấy gác
--   bằng `la_thanh_vien()`, mà đường đọc thật đi qua `luu_cay()`). Bắt một
--   câu thông báo đi lục nhật ký kiểm toán là sai tầng.

alter table public.trees
  add column if not exists xin_xoa_luc   timestamptz,
  add column if not exists xin_xoa_boi   uuid references auth.users(id) on delete set null,
  add column if not exists xin_xoa_ly_do text not null default '',
  add column if not exists da_xoa_luc    timestamptz,
  add column if not exists da_xoa_boi    uuid references auth.users(id) on delete set null;

-- ⚠ Ràng buộc này canh đúng một trạng thái VÔ NGHĨA: vào thùng rác mà chưa
--   từng có ai xin. Không phải để chặn người dùng — không màn hình nào dựng
--   được trạng thái ấy — mà để một câu `update` gõ tay trong SQL Editor lúc
--   nửa đêm không lặng lẽ tạo ra một cây không ai giải thích được vì sao mất.
alter table public.trees
  drop constraint if exists trees_thung_rac_hop_le;
alter table public.trees
  add constraint trees_thung_rac_hop_le
  check (da_xoa_luc is null or xin_xoa_luc is not null);

comment on column public.trees.xin_xoa_luc is
  'Lúc chủ cây nộp đơn xin xoá. Có đơn KHÔNG khoá cây — cây vẫn dùng bình thường.';
comment on column public.trees.da_xoa_luc is
  'Lúc Quản trị hệ thống duyệt đơn. Từ đây cây vào thùng rác: không ai đọc được, trừ máy sao lưu.';

-- ============================================================
-- 2. HAI HÀM PHỤ — trả lời đúng một câu, không hơn
-- ============================================================
-- ⚠ Cả hai bọc `coalesce(…, false)` và viết dạng KHẲNG ĐỊNH. Đúng Bẫy 2 của
--   `11` mục 6: cây không tồn tại thì `select` trả `null`, và `null` đi vào
--   một mệnh đề `and`/`or` cho ra `null` chứ không cho ra `false`. Lỗ leo
--   quyền 04/09 sinh ra đúng từ chỗ ấy, và 57 phép kiểm báo xanh suốt.

create or replace function public.trong_thung_rac(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select t.da_xoa_luc is not null from public.trees t where t.id = p_tree),
    false
  );
$$;

-- ⚠ Hỏi thẳng `tree_members`, KHÔNG hỏi `vai_tro(p_tree) = 'sao_luu'`, và đó
--   là chủ ý: `vai_tro()` trả `'quan_tri_he_thong'` ở nhánh ĐẦU TIÊN cho bất
--   cứ ai mang cờ hệ thống (`11` mục 10), nên một tài khoản vừa là máy sao
--   lưu vừa mang cờ ấy sẽ không bao giờ nhận ra mình là máy sao lưu. Hôm nay
--   không có tài khoản nào như thế; câu hỏi này không được phụ thuộc vào
--   việc ấy còn đúng bao lâu.
create or replace function public.la_may_sao_luu(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.tree_members m
     where m.tree_id = p_tree
       and m.user_id = auth.uid()
       and m.role    = 'sao_luu'
  );
$$;

-- ============================================================
-- 3. `co_the_xem_cay()` — THÊM MỆNH ĐỀ THÙNG RÁC
-- ============================================================
-- Bản của `11` mục 8, chép nguyên ba nhánh, bọc thêm một mệnh đề `and`.
--
-- ⚠ Ba nhánh cũ giữ NGUYÊN VĂN. Viết gọn lại "cho dễ đọc" ở một hàm nền
--   móng chính là hình dạng của lỗ hổng b102 — ở đó `la_thanh_vien()` bị
--   rút một mệnh đề và bảng tự kiểm 12/12 vẫn báo xanh.
--
-- ⚠ `la_quan_tri_he_thong()` nằm TRONG dấu ngoặc, tức Quản trị hệ thống cũng
--   KHÔNG đọc được nội dung cây trong thùng rác. Cố ý, và đây là chỗ đáng
--   cân nhắc nhất của cả file: thiết kế viết *"không ai đọc được"*, và một
--   thùng rác mà người có quyền cao nhất vẫn đọc xuyên qua thì nó là bộ lọc
--   hiển thị, không phải hàng rào. Muốn xem lại trước khi dọn thì bấm **Phục
--   hồi** — một cú bấm, có ghi lại, đảo ngược được.
--
-- ⚠ Họ VẪN THẤY TÊN cây trong danh sách (`ds_gia_pha()` mục 5 lọc theo cột,
--   không theo hàm này) — nếu không thì không ai bấm phục hồi được nữa và
--   thùng rác thành hố đen.

create or replace function public.co_the_xem_cay(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (
      public.la_thanh_vien(p_tree)
      or (public.cay_mac_dinh() is not null and p_tree = public.cay_mac_dinh())
      or public.la_quan_tri_he_thong()
    )
    and (
      not public.trong_thung_rac(p_tree)
      -- Thùng rác đóng cửa với người, không đóng cửa với máy sao lưu.
      or public.la_may_sao_luu(p_tree)
    ),
    false
  );
$$;

-- ============================================================
-- 4. `co_the_sua()` — KHOÁ CHIỀU GHI, KHÔNG CÓ LỐI CHO AI
-- ============================================================
-- Bản của `06` mục cuối, chép nguyên `case`, bọc thêm một mệnh đề.
--
-- Ba cửa ghi cùng hỏi hàm này, nên một mệnh đề khoá cả ba:
--   · `luu_cay()` hàng rào đầu — `03-ham-luu-cay.sql` dòng 115
--   · luật RLS `ghi_anh`  trên `storage.objects` — `02-rls.sql` mục 5
--   · luật RLS `xoa_anh`  trên `storage.objects` — `02-rls.sql` mục 5
--
-- ⚠ KHÔNG có lối cho `sao_luu` ở đây, khác hẳn mục 3. Máy sao lưu chỉ đọc;
--   một vai chỉ-đọc mà đi qua được cửa ghi là mở rộng bề mặt tấn công để
--   đổi lấy đúng con số không.

create or replace function public.co_the_sua(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when public.trong_thung_rac(p_tree) then false
    when public.vai_tro(p_tree) in ('quan_tri_he_thong', 'quan_tri') then true
    when public.vai_tro(p_tree) = 'sua' then public.nguoi_gan(p_tree) is not null
    else false
  end;
$$;

-- ============================================================
-- 5. `ds_gia_pha()` — THÊM BỐN CỘT THÙNG RÁC
-- ============================================================
-- ⚠ `drop function` trước. Hàm trả BẢNG và danh sách cột đổi (14 → 18), nên
--   `create or replace` ném `42P13`. Bài học b103, trả giá trên máy chủ thật
--   08/09/2026.
--
-- ⚠ Bốn cột mới đứng CUỐI, đúng nếp `14` mục 6: `khu-gia-pha.js` đọc theo
--   TÊN nên nó không quan tâm, nhưng phép đo và `psql` đọc theo VỊ TRÍ.
--
-- ⚠⚠ MỆNH ĐỀ `where` CHÉP NGUYÊN CỦA `14`, KHÔNG THÊM NHÁNH NÀO.
--
--    Bản 0.1.0 có thêm `or public.la_thanh_vien(t.id)` để thành viên còn
--    thấy tên cây vừa vào thùng rác, kèm một dấu hiệu. **Chủ dự án bác bỏ**
--    (09/09/2026): *"không hiện cây trong thùng rác. nếu người nào đang có
--    chân trong cây này thì nhận thông báo cây đã bị xoá bởi… vậy không lo
--    màn hình trắng"*.
--
--    Đúng, và chỗ tôi sai đáng ghi lại: tôi lo **màn hình trắng** rồi chữa
--    bằng cách để cái cây ở lại trong danh sách — tức trả lời một câu hỏi
--    của người dùng bằng cách nới một hàng rào. Một cây đã đóng mà vẫn nằm
--    trong bảng chọn là mời người ta bấm vào thứ không mở được. Câu trả lời
--    đúng nằm ở TẦNG KHÁC: một lời nhắn nói rõ chuyện gì đã xảy ra — mục 5b
--    (`tin_thung_rac`) và nhánh `daxoa` của màn hình khởi động.
--
--    Nên từ 0.2.0, cây trong thùng rác chỉ còn Quản trị hệ thống thấy, qua
--    nhánh `or public.la_quan_tri_he_thong()` vốn đã có — đủ để khu Thùng
--    rác hoạt động. HR10 của `do-b110.mjs` nay canh chiều NGƯỢC LẠI: thành
--    viên phải **không** thấy dòng ấy nữa.

drop function if exists public.ds_gia_pha();

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
  cho_nguoi_la_thay_ten boolean,
  toi_la_chu           boolean,
  duoc_moi             boolean,
  moi_vai              text,
  email_nguoi_moi      text,
  xin_xoa_luc          timestamptz,
  xin_xoa_ly_do        text,
  email_xin_xoa        text,
  da_xoa_luc           timestamptz
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
         and tm.moi_luc is null
    )                                            as da_nop_don,
    t.cho_nguoi_la_thay_ten,
    coalesce(t.chu_so_huu = auth.uid(), false)   as toi_la_chu,
    exists (
      select 1 from public.tree_members tm
       where tm.tree_id = t.id
         and tm.user_id = auth.uid()
         and tm.approved = false
         and tm.moi_luc is not null
    )                                            as duoc_moi,
    (select tm.moi_vai from public.tree_members tm
      where tm.tree_id = t.id and tm.user_id = auth.uid()
        and tm.approved = false and tm.moi_luc is not null) as moi_vai,
    coalesce((select um.email::text
                from public.tree_members tm
                left join auth.users um on um.id = tm.moi_boi
               where tm.tree_id = t.id and tm.user_id = auth.uid()
                 and tm.approved = false and tm.moi_luc is not null), '')
                                                 as email_nguoi_moi,
    -- Bốn cột b110, đứng cuối.
    t.xin_xoa_luc,
    t.xin_xoa_ly_do,
    coalesce(ax.email::text, '')                 as email_xin_xoa,
    t.da_xoa_luc
  from public.trees t
  left join auth.users au on au.id = t.chu_so_huu
  left join auth.users ax on ax.id = t.xin_xoa_boi
  where
    -- ⚠⚠ MỆNH ĐỀ NÀY CHÉP NGUYÊN CỦA `14`, KHÔNG ĐƯỢC BỎ. Hàm là
    --   `security definer` — bỏ `where` là mọi tài khoản đọc được tên, mã và
    --   số người của MỌI gia phả trên máy chủ.
    public.co_the_xem_cay(t.id)
    or t.cho_nguoi_la_thay_ten = true
    or public.la_quan_tri_he_thong()
    or exists (
      select 1 from public.tree_members tm
       where tm.tree_id = t.id
         and tm.user_id = auth.uid()
         and tm.approved = false
    )
  order by t.name;
$$;

-- ============================================================
-- 5b. `tin_thung_rac(p_tree)` — MỘT LỜI NHẮN, KHÔNG PHẢI MỘT CÁNH CỬA
-- ============================================================
-- Từ 0.2.0, cây trong thùng rác biến hẳn khỏi `ds_gia_pha()` của người
-- thường, và RLS `doc_trees` cũng đóng (`co_the_xem_cay()` trả `false`). Nên
-- thành viên của cây ấy **không còn đường nào** đọc ra tên cây hay ai đã xoá
-- nó — kể cả để hiện một câu thông báo.
--
-- Hàm này mở đúng khe hẹp ấy, và không hơn: nó trả về **tên cây, ngày xoá,
-- email người xin và email người duyệt**. Không trả một dòng `persons` nào,
-- không trả danh sách thành viên, không trả `revision`.
--
-- ⚠ `security definer` nên PHẢI tự gác. Ba câu hỏi, theo thứ tự:
--   1. cây có thật và có đang trong thùng rác không — không thì trả rỗng;
--   2. người hỏi có chân trong cây ấy không (`la_thanh_vien()`, hàm KHÔNG bị
--      b110 đụng vào nên nó vẫn đúng với cây đã đóng) hoặc là Quản trị hệ
--      thống — không thì trả rỗng;
--   3. chỉ khi đó mới nói.
--
--   Bỏ câu 2 là người lạ dò được tên mọi gia phả từng bị xoá trên máy chủ,
--   kèm email hai người liên quan. Đó là cùng hình dạng với Bẫy 3 của `11`
--   (đổi nhầm luật RLS `tree_members` sang `co_the_xem_cay` là lộ email cả
--   họ) — một hàm `security definer` viết thiếu một mệnh đề `where`.
--
-- ⚠ Trả `jsonb` rỗng `{}` chứ KHÔNG ném lỗi khi không được phép: nơi gọi là
--   màn hình khởi động, và một màn hình từ chối mà tự nó vỡ thì người dùng
--   không còn đường nào đi tiếp. Cùng lý lẽ `trangThaiCuaToi()` ở `sb.js`.

create or replace function public.tin_thung_rac(p_tree uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v jsonb;
begin
  if p_tree is null or not public.trong_thung_rac(p_tree) then
    return '{}'::jsonb;
  end if;

  if not (public.la_thanh_vien(p_tree) or public.la_quan_tri_he_thong()) then
    return '{}'::jsonb;
  end if;

  select jsonb_build_object(
           'daXoa',       true,
           'tenCay',      t.name,
           'maCay',       t.tree_code,
           'daXoaLuc',    t.da_xoa_luc,
           'lyDo',        t.xin_xoa_ly_do,
           'emailXinXoa', coalesce(ax.email::text, ''),
           'emailDuyet',  coalesce(ad.email::text, ''))
    into v
    from public.trees t
    left join auth.users ax on ax.id = t.xin_xoa_boi
    left join auth.users ad on ad.id = t.da_xoa_boi
   where t.id = p_tree;

  return coalesce(v, '{}'::jsonb);
end;
$$;

-- ============================================================
-- 6. `xin_xoa_cay(p_tree, p_ly_do)` — CHỮ KÝ THỨ NHẤT
-- ============================================================
-- Ai xin được: **chủ cây** (`trees.chu_so_huu`) và **Quản trị hệ thống**.
--
-- ⚠ Quản trị GIA PHẢ (`tree_members.role = 'quan_tri'`) KHÔNG xin được, dù
--   họ sửa được mọi người trong cây. Đúng bảng năm hạng của
--   `THIET-KE-NHIEU-CAY.md` mục 11.3: vai ấy *"chỉ sửa + duyệt nội dung"*.
--   Xin xoá cả cây không phải sửa nội dung — nó là xử lý cái vỏ.
--
-- ⚠ ĐƠN KHÔNG KHOÁ CÂY. Hàm này chỉ ghi ba cột; không hàm quyết quyền nào
--   hỏi `xin_xoa_luc`. Xem khối "bốn trạng thái" đầu file.

create or replace function public.xin_xoa_cay(p_tree uuid, p_ly_do text default '')
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_ten     text;
  v_la_chu  boolean;
begin
  select t.name, coalesce(t.chu_so_huu = auth.uid(), false)
    into v_ten, v_la_chu
    from public.trees t where t.id = p_tree;

  if v_ten is null then
    return jsonb_build_object('ok', false, 'loi', 'Không có gia phả này.');
  end if;

  if not (v_la_chu or public.la_quan_tri_he_thong()) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ người đứng tên gia phả hoặc Quản trị hệ thống mới xin xoá được.');
  end if;

  if public.trong_thung_rac(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Gia phả này đã nằm trong thùng rác rồi.');
  end if;

  if exists (select 1 from public.trees t
              where t.id = p_tree and t.xin_xoa_luc is not null) then
    return jsonb_build_object('ok', false, 'loi',
      'Gia phả này đã có một đơn xin xoá đang chờ duyệt.');
  end if;

  update public.trees
     set xin_xoa_luc   = now(),
         xin_xoa_boi   = auth.uid(),
         xin_xoa_ly_do = coalesce(p_ly_do, '')
   where id = p_tree;

  return jsonb_build_object('ok', true, 'ten', v_ten);
end;
$$;

-- ============================================================
-- 7. `huy_xin_xoa_cay(p_tree)` — RÚT ĐƠN
-- ============================================================
-- Cùng tập người với mục 6. Chỉ rút được khi đơn CHƯA được duyệt — cây đã
-- vào thùng rác thì đường về là `phuc_hoi_cay()`, và đường ấy chỉ Quản trị
-- hệ thống đi được.

create or replace function public.huy_xin_xoa_cay(p_tree uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_ten     text;
  v_la_chu  boolean;
  v_xin     timestamptz;
begin
  select t.name, coalesce(t.chu_so_huu = auth.uid(), false), t.xin_xoa_luc
    into v_ten, v_la_chu, v_xin
    from public.trees t where t.id = p_tree;

  if v_ten is null then
    return jsonb_build_object('ok', false, 'loi', 'Không có gia phả này.');
  end if;

  if not (v_la_chu or public.la_quan_tri_he_thong()) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ người đứng tên gia phả hoặc Quản trị hệ thống mới rút đơn được.');
  end if;

  if v_xin is null then
    return jsonb_build_object('ok', false, 'loi',
      'Gia phả này không có đơn xin xoá nào.');
  end if;

  if public.trong_thung_rac(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Đơn đã được duyệt và gia phả đang nằm trong thùng rác — ' ||
      'đường về là nút Phục hồi, và chỉ Quản trị hệ thống bấm được.');
  end if;

  update public.trees
     set xin_xoa_luc = null, xin_xoa_boi = null, xin_xoa_ly_do = ''
   where id = p_tree;

  return jsonb_build_object('ok', true, 'ten', v_ten);
end;
$$;

-- ============================================================
-- 8. `duyet_xoa_cay(p_tree)` — CHỮ KÝ THỨ HAI
-- ============================================================
-- Chỉ Quản trị hệ thống. Đặt `da_xoa_luc` — từ giây này cây đóng cửa.
--
-- ⚠ KHÔNG cấm người vừa xin tự duyệt đơn của chính mình, và đây là chỗ lệch
--   khỏi nếp `13`/`14` nên phải nói rõ vì sao. Nếp ấy — *"không ai tự đặt
--   quyền cho mình"* — canh việc một người TỰ NÂNG quyền của mình
--   (`dat_quan_tri_he_thong`, `doi_vai_thanh_vien`, `xoa_tai_khoan`). Việc ở
--   đây ngược hẳn chiều: người ta tự bỏ đi thứ mình đang có, và trên chính
--   cây mình đứng tên.
--
--   Cấm đi thì hệ thống hôm nay **không xoá được cây nào**: chủ dự án là
--   Quản trị hệ thống duy nhất và đứng tên cả hai cây. Một hàng rào mà lối
--   đi qua nó không tồn tại thì nó không phải hàng rào — nó là cái kẹt, đúng
--   bài học `xoa_tai_khoan()` của `14` mục 10 đã trả giá một lần.
--
--   Cái giữ an toàn ở đây không phải hai NGƯỜI mà là hai NHỊP và một quãng
--   chờ: xin ở một màn hình, duyệt ở màn hình khác, rồi 30 ngày nữa mới mất
--   thật, và mọi bước đều lùi lại được.

create or replace function public.duyet_xoa_cay(p_tree uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_ten  text;
  v_xin  timestamptz;
begin
  if not public.la_quan_tri_he_thong() then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ Quản trị hệ thống mới duyệt được đơn xin xoá gia phả.');
  end if;

  select t.name, t.xin_xoa_luc into v_ten, v_xin
    from public.trees t where t.id = p_tree;

  if v_ten is null then
    return jsonb_build_object('ok', false, 'loi', 'Không có gia phả này.');
  end if;

  -- ⚠ Không có đơn thì không duyệt được, kể cả Quản trị hệ thống. Đây là chỗ
  --   luật hai chữ ký thật sự nằm: bỏ phép kiểm này đi là còn đúng một chữ ký.
  if v_xin is null then
    return jsonb_build_object('ok', false, 'loi',
      'Gia phả này chưa có đơn xin xoá. Người đứng tên phải xin trước.');
  end if;

  if public.trong_thung_rac(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Gia phả này đã nằm trong thùng rác rồi.');
  end if;

  -- ⚠ Ghi `da_xoa_boi` cùng lúc, không để câu thông báo đi lục `change_log`.
  --   Mục 1 nói vì sao cột này có mặt từ 0.2.0.
  update public.trees
     set da_xoa_luc = now(), da_xoa_boi = auth.uid()
   where id = p_tree;

  return jsonb_build_object('ok', true, 'ten', v_ten,
                            'donLuc', to_char(now() + interval '30 days',
                                              'DD/MM/YYYY'));
end;
$$;

-- ============================================================
-- 9. `phuc_hoi_cay(p_tree)` — LẤY KHỎI THÙNG RÁC
-- ============================================================
-- Chỉ Quản trị hệ thống. Xoá sạch cả bốn cột, tức cây trở về đúng trạng thái
-- bình thường chứ không về trạng thái "đang xin xoá" — người muốn xoá lại
-- phải nộp đơn lại từ đầu.

create or replace function public.phuc_hoi_cay(p_tree uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_ten text;
begin
  if not public.la_quan_tri_he_thong() then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ Quản trị hệ thống mới phục hồi được gia phả.');
  end if;

  select t.name into v_ten from public.trees t where t.id = p_tree;

  if v_ten is null then
    return jsonb_build_object('ok', false, 'loi', 'Không có gia phả này.');
  end if;

  if not public.trong_thung_rac(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Gia phả này không nằm trong thùng rác.');
  end if;

  update public.trees
     set da_xoa_luc = null, da_xoa_boi = null, xin_xoa_luc = null,
         xin_xoa_boi = null, xin_xoa_ly_do = ''
   where id = p_tree;

  return jsonb_build_object('ok', true, 'ten', v_ten);
end;
$$;

-- ============================================================
-- 10. `don_thung_rac(p_ds)` — XOÁ CỨNG. KHÔNG CÓ ĐƯỜNG LÙI.
-- ============================================================
-- Chủ dự án chốt 09/09/2026: **chỉ Quản trị hệ thống · bấm tay · chọn hàng
-- loạt.** Không nối vào trigger Apps Script chạy đêm — một việc phá dữ liệu
-- không được chạy lúc không có ai ngồi xem.
--
-- Nhận một MẢNG mã cây, đúng vì "chọn hàng loạt": màn hình cho tích nhiều
-- dòng rồi bấm một lần. Cả loạt nằm trong một giao dịch.
--
-- ⚠ ĐÂY LÀ CHỖ DUY NHẤT TRONG CẢ PHẦN MỀM ĐƯỢC PHÉP `delete from
--   public.trees`. Mọi bảng còn lại đi theo bằng `on delete cascade` — đã
--   soát `01-bang.sql`, cả chín bảng mang tree_id đều khai cascade.
--
-- ⚠⚠ `change_log` CŨNG ĐI THEO, và đây là chỗ khác hẳn `xoa_tai_khoan()` của
--    `14` mục 10. Ở đó nhật ký ở lại vì nó nói về NGƯỜI (`by_email` là chữ,
--    không có khoá ngoại). Ở đây nhật ký nói về CÂY, và cái cây thì đang
--    được xoá — giữ lại nhật ký của một cây không còn tồn tại là giữ lại
--    những dòng không ai đọc được nữa. Cây mất thì lịch sử sửa nó mất theo.
--    Nói ra vì nó KHÔNG lấy lại được, và bảng sao lưu đêm là bản duy nhất
--    còn giữ nó.
--
-- ⚠ BA MƯƠI NGÀY LÀ HÀNG RÀO CỨNG, không phải gợi ý trên màn hình. Cây chưa
--   đủ 30 ngày thì hàm BỎ QUA nó và kể tên ra, chứ không ném lỗi cả loạt —
--   người bấm chọn năm cây không đáng bị chặn cả năm vì một cây mới vào hôm
--   qua. `THIET-KE-NHIEU-CAY.md` mục 11.6: *"xoá cứng cây quá 30 ngày"*.
--
-- ⚠ ẢNH TRONG KHO KHÔNG ĐI THEO. `media` là bảng Postgres nên nó cascade,
--   nhưng file ảnh nằm trong kho `anh` của Supabase Storage — Postgres không
--   với tới. Nên hàm trả về `dsAnh`, danh sách đường dẫn vừa mồ côi, và
--   `khu-gia-pha.js` gọi `xoaAnhThat()` ngay sau. Đọc `media` TRƯỚC khi xoá:
--   sau lệnh `delete` thì không còn gì để hỏi.

create or replace function public.don_thung_rac(p_ds uuid[])
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_du       uuid[];
  v_chua     jsonb;
  v_anh      text[];
  v_ten      text[];
  v_nguoi    bigint;
begin
  if not public.la_quan_tri_he_thong() then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ Quản trị hệ thống mới dọn được thùng rác.');
  end if;

  if p_ds is null or array_length(p_ds, 1) is null then
    return jsonb_build_object('ok', false, 'loi',
      'Chưa chọn gia phả nào để dọn.');
  end if;

  -- Đủ 30 ngày trong thùng rác.
  select coalesce(array_agg(t.id), '{}'::uuid[]),
         coalesce(array_agg(t.name), '{}'::text[])
    into v_du, v_ten
    from public.trees t
   where t.id = any(p_ds)
     and t.da_xoa_luc is not null
     and t.da_xoa_luc <= now() - interval '30 days';

  -- Chưa đủ ngày, hoặc không nằm trong thùng rác: kể tên ra, đừng im lặng.
  select coalesce(jsonb_agg(jsonb_build_object(
           'ten', t.name,
           'conLai', greatest(0, 30 - floor(extract(epoch from
                        now() - t.da_xoa_luc) / 86400)::int))), '[]'::jsonb)
    into v_chua
    from public.trees t
   where t.id = any(p_ds)
     and (t.da_xoa_luc is null
          or t.da_xoa_luc > now() - interval '30 days');

  if array_length(v_du, 1) is null then
    return jsonb_build_object('ok', false, 'loi',
      'Không cây nào trong số đã chọn đủ 30 ngày nằm trong thùng rác.',
      'boQua', v_chua);
  end if;

  -- ⚠ ĐỌC TRƯỚC KHI XOÁ. Sau `delete` thì `media` đã cascade đi mất và không
  --   còn cách nào biết file nào vừa mồ côi trong kho ảnh.
  select coalesce(array_agg(d), '{}'::text[]) into v_anh
    from (
      select unnest(array[m.drive_file_id, m.drive_file_id_lon]) as d
        from public.media m
       where m.tree_id = any(v_du)
    ) x
   where d is not null and d <> '';

  select count(*) into v_nguoi
    from public.persons p where p.tree_id = any(v_du);

  delete from public.trees where id = any(v_du);

  return jsonb_build_object(
    'ok',      true,
    'soCay',   array_length(v_du, 1),
    'tenCay',  to_jsonb(v_ten),
    'soNguoi', v_nguoi,
    'dsAnh',   to_jsonb(v_anh),
    'boQua',   v_chua
  );
end;
$$;

-- ============================================================
-- 11. QUYỀN GỌI
-- ============================================================
-- ⚠ `revoke … from public, anon` trước mỗi `grant`, đúng khuôn `07` mục 8 và
--   `14` mục 11: mặc định của Postgres là MỌI vai gọi được, kể cả `anon` —
--   người chưa đăng nhập. Với `don_thung_rac()` thì quên dòng ấy là để cả
--   internet gọi được một hàm xoá cứng.

revoke all on function public.trong_thung_rac(uuid)  from public, anon;
revoke all on function public.tin_thung_rac(uuid)    from public, anon;
revoke all on function public.la_may_sao_luu(uuid)   from public, anon;
revoke all on function public.xin_xoa_cay(uuid, text) from public, anon;
revoke all on function public.huy_xin_xoa_cay(uuid)  from public, anon;
revoke all on function public.duyet_xoa_cay(uuid)    from public, anon;
revoke all on function public.phuc_hoi_cay(uuid)     from public, anon;
revoke all on function public.don_thung_rac(uuid[])  from public, anon;

grant execute on function public.trong_thung_rac(uuid)   to authenticated;
grant execute on function public.tin_thung_rac(uuid)     to authenticated;
grant execute on function public.la_may_sao_luu(uuid)    to authenticated;
grant execute on function public.xin_xoa_cay(uuid, text) to authenticated;
grant execute on function public.huy_xin_xoa_cay(uuid)   to authenticated;
grant execute on function public.duyet_xoa_cay(uuid)     to authenticated;
grant execute on function public.phuc_hoi_cay(uuid)      to authenticated;
grant execute on function public.don_thung_rac(uuid[])   to authenticated;

-- `co_the_xem_cay` và `co_the_sua` vừa được định nghĩa lại nên quyền cũ mất
-- theo — `11` mục 17 và `02` đã cấp một lần, cấp lại ở đây cho đủ.
grant execute on function public.co_the_xem_cay(uuid) to authenticated;
grant execute on function public.co_the_sua(uuid)     to authenticated;
grant execute on function public.ds_gia_pha()         to authenticated;

commit;

-- ============================================================
-- 12. BẢNG TỰ KIỂM — đọc sau khi dán, xác nhận trước khi bấm thử
-- ============================================================
-- ⚠ Bảng này hỏi *"thứ này có đúng hình dạng không"*, KHÔNG hỏi *"nó có chặn
--   được không"*. Hai câu khác nhau, và b102 đã trả giá để học: bảng tự kiểm
--   12/12 báo xanh trong lúc ai cũng tự đặt mình thành Quản trị hệ thống.
--   Phép đo hàng rào nằm ở `kiem-thu/ban-thu-sql/do-b110.mjs`.

select
  ten_kiem as "Kiểm",
  ket_qua  as "Kết quả"
from (
  select 1 as stt,
    'Năm cột thùng rác có trên bảng trees' as ten_kiem,
    case when (
      select count(*) from information_schema.columns
       where table_schema = 'public' and table_name = 'trees'
         and column_name in ('xin_xoa_luc','xin_xoa_boi','xin_xoa_ly_do',
                             'da_xoa_luc','da_xoa_boi')
    ) = 5 then 'ĐẠT' else 'HỎNG — thiếu cột' end as ket_qua

  union all

  select 2, 'Ràng buộc trees_thung_rac_hop_le có',
    case when exists (
      select 1 from pg_constraint where conname = 'trees_thung_rac_hop_le'
    ) then 'ĐẠT' else 'HỎNG — chưa tạo được ràng buộc' end

  union all

  select 3, 'Tám hàm mới của b110 đều có',
    case when (
      select count(distinct p.proname) from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('trong_thung_rac','la_may_sao_luu','xin_xoa_cay',
                          'huy_xin_xoa_cay','duyet_xoa_cay','phuc_hoi_cay',
                          'don_thung_rac','tin_thung_rac')
    ) = 8 then 'ĐẠT' else 'HỎNG — thiếu hàm' end

  union all

  -- ⚠ Mục 4 và 5 hỏi THÂN hàm, không hỏi hàm có tồn tại. Đúng bài học b103
  --   (mục 19 của `11`): một máy chủ còn giữ bản cũ vẫn báo ĐẠT ở mục "có
  --   hàm không", và đó chính là cách `42P13` lọt tới máy chủ thật.
  select 4, 'co_the_xem_cay() đã biết tới thùng rác',
    case when (
      select pg_get_functiondef(p.oid) from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'co_the_xem_cay'
    ) like '%trong_thung_rac%' then 'ĐẠT'
    else 'HỎNG — còn bản cũ của `11`, cây trong thùng rác vẫn đọc được' end

  union all

  select 5, 'co_the_xem_cay() vẫn chừa lối cho máy sao lưu',
    case when (
      select pg_get_functiondef(p.oid) from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'co_the_xem_cay'
    ) like '%la_may_sao_luu%' then 'ĐẠT'
    else 'HỎNG — sao lưu đêm sẽ ra file THIẾU cây trong thùng rác, KHÔNG báo lỗi' end

  union all

  select 6, 'co_the_sua() đã khoá chiều ghi',
    case when (
      select pg_get_functiondef(p.oid) from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'co_the_sua'
    ) like '%trong_thung_rac%' then 'ĐẠT'
    else 'HỎNG — còn bản cũ của `06`, cây trong thùng rác vẫn ghi được' end

  union all

  select 7, 'la_thanh_vien() KHÔNG bị đụng vào',
    case when (
      select pg_get_functiondef(p.oid) from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'la_thanh_vien'
    ) not like '%trong_thung_rac%' then 'ĐẠT'
    else 'HỎNG — sao lưu đêm mất tree_members/change_log của cây trong thùng rác' end

  union all

  select 8, 'ds_gia_pha() trả đủ 18 cột',
    case when (
      select count(*) from information_schema.parameters
       where specific_schema = 'public'
         and specific_name like 'ds_gia_pha%'
         and parameter_mode = 'OUT'
    ) = 18 then 'ĐẠT'
    else 'HỎNG — còn bản 14 cột của `14`, màn hình mất hết nút thùng rác' end

  union all

  -- ⚠ 0.2.0: chủ dự án chốt cây trong thùng rác KHÔNG hiện cho người thường.
  --   Mục này canh đúng nhánh đã gỡ — dán nhầm lại bản 0.1.0 thì nó bắt được.
  select 8.5, 'ds_gia_pha() KHÔNG còn nhánh la_thanh_vien (bản 0.1.0 đã gỡ)',
    case when (
      select pg_get_functiondef(p.oid) from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'ds_gia_pha'
    ) not like '%la_thanh_vien%' then 'ĐẠT'
    else 'HỎNG — cây trong thùng rác vẫn hiện trong danh sách người thường' end

  union all

  select 9, 'Chưa cây nào lỡ vào thùng rác',
    case when (select count(*) from public.trees where da_xoa_luc is not null) = 0
      then 'ĐẠT'
      else 'XEM LẠI — có ' ||
           (select count(*)::text from public.trees where da_xoa_luc is not null) ||
           ' cây đang trong thùng rác' end

  union all

  select 10, 'anon KHÔNG gọi được don_thung_rac()',
    case when has_function_privilege('anon', 'public.don_thung_rac(uuid[])', 'execute')
      then 'HỎNG — cả internet gọi được hàm xoá cứng' else 'ĐẠT' end
) x
order by stt;
