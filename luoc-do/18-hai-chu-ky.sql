-- ============================================================
-- giapha-supabase · luoc-do/18-hai-chu-ky.sql
-- Vai trò  : VÁ LỖ HỔNG — bốn cửa đổi quyền và cửa duyệt đơn đều ghi được vào
--            một dòng LỜI MỜI CHƯA AI NHẬN, tức đưa người vào cây và cấp
--            quyền cho họ mà không cần chữ ký thứ hai.
-- Phiên bản: 0.1.0 · Cập nhật: 10/09/2026 (b110c)
-- ============================================================
--
-- ═══ CHỦ DỰ ÁN BÁO, 10/09/2026 ═══
--
--   > *"mời tài khoản khach@io.vn vào làm thành viên, sau đó vào kiểm duyệt
--   > thêm được người này luôn và có thể đổi quyền cho tài khoản này mà không
--   > đợi khach@io.vn đồng ý."*
--
-- Đúng. Đã tái hiện trên bàn thử (`kiem-thu/ban-thu-sql/do-b110c.mjs`):
-- **bốn cửa thủng**, và cửa nặng nhất cho người chưa bấm gì đọc đủ 59 người.
--
-- ═══ LUẬT BỊ VI PHẠM ═══
--
-- `THIET-KE-NHIEU-CAY.md` mục 11.4: **vào cây luôn cần HAI CHỮ KÝ.** Một bên
-- ngỏ lời, một bên nhận. *"Không đường nào đưa được một tài khoản vào cây
-- bằng một cú bấm."*
--
-- Mục ấy còn kể sẵn cái bẫy, và kể rất kỹ: `la_thanh_vien()` mở cây ra khi
-- `role in ('quan_tri_he_thong','quan_tri','sao_luu')` **mà không hỏi
-- `approved`**. Vì thế `14` dựng hẳn một cột riêng `moi_vai`, để lời mời
-- không chạm vào cột `role`.
--
-- ⚠⚠ **CHỖ SAI: `moi_vao_cay()` KHÔNG PHẢI CỬA DUY NHẤT GHI VÀO CỘT ẤY.**
--    `13` có bốn cửa cũng ghi thẳng vào cùng những cột ấy, và không cửa nào
--    hỏi dòng mình đang ghi có phải một lời mời chưa nhận hay không. Cột
--    `moi_vai` chặn đúng một đường và để ngỏ bốn đường bên cạnh.
--
--    Bài học đáng giữ hơn cả bản vá: **hàng rào phải gác CỘT, không gác HÀM.**
--    Ngày `14` viết ra, `13` đã tồn tại; không ai đi hỏi lại *"còn hàm nào
--    khác ghi vào `role` và `approved` không?"*
--
-- ═══ BỐN CỬA THỦNG, ĐO ĐƯỢC ═══
--
--   HR1 · `duyet_thanh_vien()`  — bật thẳng `approved` trên dòng lời mời.
--          Đo: khách đọc **59 người** mà chưa bấm gì.
--   HR2 · `doi_vai_thanh_vien()` — đặt `role='quan_tri'` trên dòng lời mời.
--          Đo: khách đọc **59 người** NGAY LÚC ẤY, không đợi cả nút Duyệt.
--          Đây là cửa nặng nhất: *"đổi vai"* nghe như một việc vô hại.
--   HR3 · `gan_nguoi_cho_thanh_vien()` — gắn mã người vào dòng lời mời.
--   HR4 · `dat_tin_cay_thanh_vien()` — bật ghi thẳng cho người chưa nhận.
--
-- ⚠ HR3 suýt lọt khỏi phép đo: bản đầu thử bằng mã `P0012` và báo ĐẠT, nhưng
--   nó bị chặn bởi chỉ mục `unique (tree_id, person_id)` chứ không phải bởi
--   hàng rào nào. Thử lại bằng một mã còn trống thì nó ghi được. Cùng họ với
--   bài học b94: **một phép xanh trên mã thủng.**
--
-- ═══ VÁ Ở ĐÂU ═══
--
-- Hai lớp, và lớp thứ hai là lớp thật sự đáng tin:
--
--   **Lớp 1 — bốn cửa + cửa duyệt tự từ chối.** Nói ra bằng tiếng Việt để
--   người bấm hiểu vì sao, và chỉ đúng đường đi (rút lời mời rồi mời lại).
--
--   **Lớp 2 — `la_thanh_vien()` thôi nhận đường tắt trên dòng lời mời.** Kể
--   cả khi có ngày ai đó viết cửa thứ năm mà quên lớp 1, một dòng
--   `approved = false` có `moi_boi` vẫn **không** mở được cây.
--
-- ⚠⚠ **VÀ ĐÂY LÀ CHỖ PHẢI ĐỌC KỸ TRƯỚC KHI SỬA TIẾP.** Cả `CHI-DAN.md` lẫn
--    `THIET-KE-NHIEU-CAY.md` mục 11.6 đều ghi **"ĐỪNG SỬA `la_thanh_vien()`"**,
--    và lời cảnh báo ấy có thật: b102 sửa gọn một dòng ở hàm này và **bản sao
--    lưu đêm ra file rỗng, không báo lỗi**, mất nửa buổi mới lần ra.
--
--    Bản vá này **KHÔNG bỏ đường tắt** — nó chỉ **thu hẹp** đường tắt lại cho
--    đúng những dòng KHÔNG phải lời mời (`moi_boi is null`). Mọi dòng hợp lệ
--    đi qua y như cũ:
--      · tài khoản `sao_luu` — `moi_boi` trống, `approved` true;
--      · `quan_tri` do `tao_gia_pha_moi()` sinh ra — `moi_boi` trống;
--      · người đã bấm Nhận — `approved` true, nhánh đầu nhận.
--    `do-b110c.mjs` có một phép riêng đo đúng đường sao lưu sau khi vá.
--
-- ═══ THỨ TỰ DÁN — ĐỌC TRƯỚC KHI DÁN LẠI BẤT KỲ FILE NÀO ═══
--
-- File này **định nghĩa đè** năm hàm của `08`, `11`, `13`. Nên:
--
--     dán lại `08`  → phải dán lại `18`
--     dán lại `11`  → phải dán lại `18`   (và `16`, xem đầu file ấy)
--     dán lại `13`  → phải dán lại `18`   (và `15`)
--
-- Chuỗi đầy đủ hôm nay, chép lại cho gọn:
--
--     `11`/`10` → `14` → `16` → **`18`**
--     `13`/`14` → `15` → **`18`**
--     `08`      → **`18`**
--
-- Quên `18` sau khi dán lại một trong ba file ấy là **mở lại đúng lỗ hổng
-- này**, và nó không báo lỗi — nó chỉ lặng lẽ cho một người vào cây.

begin;

-- ============================================================
-- 1. la_loi_moi_cho_nhan(p_tree, p_user) — câu hỏi chung của cả file
-- ============================================================
-- Dòng này có phải một LỜI MỜI CHƯA AI NHẬN không?
--
-- ⚠ Phân biệt bằng `moi_boi`, KHÔNG bằng `moi_vai`. Ba trạng thái của một
--   dòng `tree_members` (`THIET-KE-NHIEU-CAY.md` mục 11.4):
--     · `moi_boi` trống · `approved` false → **đơn xin vào** — duyệt được;
--     · `moi_boi` có    · `approved` false → **lời mời** — CHỜ người ta nhận;
--     · `approved` true                    → thành viên thật.
--
-- ⚠ `moi_boi` khai `on delete set null` (`14` mục 1), nên xoá tài khoản người
--   mời sẽ biến một lời mời thành thứ trông y hệt đơn xin vào. Đó là chỗ lệch
--   đã biết và ghi ở `14`; nó làm hàm này trả `false` cho một lời mời mồ côi,
--   tức **mở nhẹ tay hơn**, không phải chặt tay hơn. Chốt lại được bằng cột
--   `moi_luc` ở một bước sau — chưa làm ở đây vì đổi cột là đổi cả `14`.

create or replace function public.la_loi_moi_cho_nhan(p_tree uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.tree_members
     where tree_id = p_tree
       and user_id = p_user
       and coalesce(approved, false) = false
       and moi_boi is not null
  );
$$;

-- ============================================================
-- 2. la_thanh_vien(p_tree) — LỚP HAI, thu hẹp đường tắt
-- ============================================================
-- ⚠⚠ Đọc khối "VÁ Ở ĐÂU" ở đầu file trước khi đụng hàm này. Chép nguyên bản
--    của `11` mục 9, thêm đúng một mệnh đề: đường tắt theo `role` chỉ áp cho
--    dòng **không phải lời mời**. Nhánh `approved` để nguyên không đổi.

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
         and (
           approved
           or (moi_boi is null
               and role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu'))
         )
    )
  );
$$;

-- ============================================================
-- 3. duyet_thanh_vien(...) — HR1
-- ============================================================
-- Chép nguyên bản của `08`, thêm một cửa. Giữ nguyên cả khối chú thích về
-- `coalesce(…, '')` vì cái bẫy `null not in (…)` vẫn còn nguyên giá trị.

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
  -- ⚠ `coalesce(…, '')` KHÔNG phải để cho đẹp: với người NGOÀI cây `vai_tro()`
  --   trả `null`, và `null not in (…)` ra `null` chứ không ra `true` — `if`
  --   không nhận, cửa không đóng. Lỗ hổng thật, phép thử H9 bắt được 04/09/2026.
  if coalesce(public.vai_tro(p_tree), '') not in ('quan_tri_he_thong', 'quan_tri') then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ quản trị hệ thống hoặc quản trị viên mới duyệt được thành viên.');
  end if;

  select id into v_user from auth.users where lower(email) = lower(p_email);
  if v_user is null then
    return jsonb_build_object('ok', false, 'loi',
      'Không có tài khoản nào mang email ' || p_email || '.');
  end if;

  -- ⚠ CỬA MỚI (b110c). Duyệt là việc dành cho ĐƠN XIN VÀO. Một lời mời thì
  --   chữ ký thứ hai thuộc về người được mời, không thuộc về người duyệt.
  --   Chặn cả khi `p_duyet = false`: từ chối một lời mời là việc của
  --   `go_thanh_vien()` / `tu_choi_thanh_vien()`, và để hai đường cùng làm
  --   một việc là hai chỗ để lệch nhau.
  if public.la_loi_moi_cho_nhan(p_tree, v_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Đây là LỜI MỜI đang chờ chính người ấy bấm Nhận, không phải đơn xin '
      || 'vào gia phả. Không ai nhận hộ được — vào cây luôn cần hai chữ ký. '
      || 'Muốn đổi vai mời hay đổi ý thì rút lời mời rồi mời lại.');
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

-- ============================================================
-- 4. doi_vai_thanh_vien(...) — HR2, cửa nặng nhất
-- ============================================================
-- Chép nguyên bản của `13` mục 8, thêm một cửa ngay sau phép "không tự đặt
-- quyền cho mình".

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

  -- ⚠⚠ CỬA MỚI (b110c), VÀ ĐÂY LÀ CỬA ĐẮT NHẤT CỦA CẢ FILE. Đặt `role` trên
  --    một dòng lời mời chưa nhận là **mở cây ra ngay lập tức** qua đường tắt
  --    của `la_thanh_vien()` — không đợi ai bấm gì. Đo được: khách đọc đủ 59
  --    người ngay sau cú bấm *Đổi vai*.
  if public.la_loi_moi_cho_nhan(p_tree, p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này mới được MỜI, chưa bấm Nhận. Chưa đổi vai được — đổi vai '
      || 'lúc này là cho họ vào cây mà họ chưa đồng ý. Muốn mời với vai khác '
      || 'thì rút lời mời rồi mời lại.');
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
-- 5. gan_nguoi_cho_thanh_vien(...) — HR3
-- ============================================================

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

  -- ⚠ CỬA MỚI (b110c). Gắn mã người cho một người chưa nhận lời mời là đặt
  --   trước phạm vi sửa của họ, và chiếm chỗ mã ấy (`unique (tree_id,
  --   person_id)`) cho một người có thể không bao giờ vào cây.
  if public.la_loi_moi_cho_nhan(p_tree, p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này mới được MỜI, chưa bấm Nhận. Gắn mã người sau khi họ vào '
      || 'cây — hoặc rút lời mời rồi mời lại kèm mã người ngay từ đầu.');
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
  when unique_violation then
    return jsonb_build_object('ok', false, 'loi',
      'Mã ' || v_ma || ' đã gắn cho một tài khoản khác rồi. Gỡ bên đó trước.');
end;
$$;

-- ============================================================
-- 6. dat_tin_cay_thanh_vien(...) — HR4
-- ============================================================

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

  -- ⚠ CỬA MỚI (b110c). Bật ghi thẳng cho người chưa nhận lời mời là cấp sẵn
  --   quyền bỏ qua kiểm duyệt cho một người chưa đồng ý vào cây.
  if public.la_loi_moi_cho_nhan(p_tree, p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này mới được MỜI, chưa bấm Nhận. Bật tin cậy sau khi họ vào cây.');
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
-- 6b. ds_thanh_vien(p_tree) — MÀN HÌNH PHẢI PHÂN BIỆT ĐƯỢC BA TRẠNG THÁI
-- ============================================================
-- ⚠ ĐÂY LÀ NỬA THỨ HAI CỦA BẢN VÁ, VÀ NÓ KHÔNG PHẢI CHUYỆN THẨM MỸ.
--
-- Bốn cửa trên nay từ chối đúng lúc. Nhưng màn hình vẫn vẽ chữ **"Đang chờ"**
-- và một cái nút **"Xét đơn"** trên dòng lời mời — tức mời người ta bấm một
-- thứ chắc chắn bị từ chối. Luật nhà nói ngược lại, và nói bằng chữ của chính
-- chủ dự án (08/09/2026): *"nút chuyển sang màu xám và ở trạng thái khoá,
-- không cần cho bấm vào rồi đi giải thích."*
--
-- Màn hình không phân biệt được vì `ds_thanh_vien()` **không trả `moi_luc`**.
-- `khu-thanh-vien.js` đã ghi sẵn lời thú nhận ấy trong một khối chú thích:
-- *"ở tấm lọc cây KHÔNG phân biệt được đơn xin vào với lời mời chưa nhận"*.
-- Nó chọn nói thật thay vì đoán bừa — đúng, nhưng chỗ chữa nằm ở đây.
--
-- ⚠⚠ `drop` TRƯỚC, BẮT BUỘC. Hàm này đổi DANH SÁCH CỘT, và `create or replace`
--    gặp danh sách cột khác sẽ ném `42P13 cannot change return type of
--    existing function` — lần dán vấp ở giữa file, để lại một máy chủ nửa
--    vời. Đúng chuyện đã xảy ra sáng 08/09/2026, chép lại đây vì file này
--    cũng dài và cũng dán một lần.
--
-- ⚠ Hai cột mới đứng CUỐI danh sách, sau `added_at`. Chèn vào giữa là mọi
--   `select` theo thứ tự cột ở nơi khác đọc lệch một ô mà không báo lỗi.

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
  added_at   timestamptz,
  moi_luc    timestamptz,
  moi_vai    text
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
         coalesce(nullif(public.ten_day_du(p.names), ''), p.id, ''),
         tm.tin_cay,
         coalesce(t.chu_so_huu = tm.user_id, false),
         tm.xin_luc,
         tm.loi_nhan,
         tm.added_at,
         -- ⚠ Phân biệt bằng `moi_luc`, và màn hình cũng phải phân biệt bằng
         --   nó, KHÔNG bằng `moi_boi`: cột kia khai `on delete set null`
         --   (`14` mục 1), nên xoá tài khoản người mời sẽ biến một lời mời
         --   thành thứ trông y hệt đơn xin vào.
         tm.moi_luc,
         coalesce(tm.moi_vai, '')
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
-- 6c. ds_cho_duyet(p_tree) — CON SỐ TRÊN THANH ĐIỀU HƯỚNG
-- ============================================================
-- ⚠ Hàm này đếm *"còn bao nhiêu việc người quản trị phải bấm"*, và con số ấy
--   hiện ngay cạnh mục **Tài khoản** trên thanh điều hướng
--   (`THIET-KE-QUAN-TRI.md` mục 3, luật 1: *"thanh điều hướng CHÍNH LÀ
--   dashboard"*).
--
-- Bản trước lấy mọi dòng `approved = false`, tức **đếm cả lời mời**. Nhưng
-- lời mời không phải việc của người quản trị — nó đang chờ CHÍNH NGƯỜI ĐƯỢC
-- MỜI bấm Nhận. Con số vì thế nói *"có đơn phải duyệt"* trong khi không có,
-- và nó dẫn người quản trị đi tìm một cái nút mà bấm — đúng cái nút mở ra lỗ
-- hổng 10/09/2026.
--
-- ⚠ Giữ nguyên mệnh đề `role not in (...)`: nó lọc bỏ tài khoản máy và hai
--   hạng quản trị, đã có từ `10` và không liên quan tới việc này.
--
-- ⚠⚠ **VÀ FILE NÀY CÒN VÁ MỘT CHỖ THỨ HAI, TÌM RA LÚC ĐANG VÁ CHỖ THỨ NHẤT.**
--    `08-kiem-duyet.sql` cũng định nghĩa `ds_cho_duyet()`, và bản của nó là
--    bản CŨ:
--
--        where tm.tree_id = coalesce(p_tree, (select id from public.trees limit 1))
--
--    Đó đúng **Hỏng 3** của `THIET-KE-NHIEU-CAY.md` mục 8 — `limit 1` không
--    `order by`, tức *"duyệt nhầm hàng chờ của cây khác, và duyệt xong thì
--    không có gì báo là đã nhầm"*. `10-sua-nhieu-cay.sql` đã chữa nó
--    05/09/2026, nhưng **dán lại `08` là mở lại**, im lặng, vì `08` đứng sau
--    trong bất kỳ lần dán lại nào theo số thứ tự.
--
--    Chuyện ấy không ai ghi ở đâu cả, và nó lộ ra đúng lúc phép đo b110c dán
--    lại `08` để dựng nền chưa vá. Từ nay `18` là bản đứng CUỐI cùng cho hàm
--    này, nên chuỗi `08` → `18` chữa luôn cả hai.
--
-- ⚠ `drop` TRƯỚC, bắt buộc: bản của `08` khai `p_tree uuid default null`, còn
--   bản này bắt truyền tường minh. Bỏ một `default` đi thì Postgres ném
--   `cannot remove parameter defaults from existing function` — `10` mục 4 đã
--   phải làm đúng thế, và lần dán vấp ở giữa file để lại máy chủ nửa vời.
--
-- ⚠ `drop` xoá cả QUYỀN GỌI, nên phải `grant` lại ở mục 7 bên dưới. Quên là
--   khu Tài khoản đọc ra mảng rỗng và người dùng thấy "không có đơn nào" —
--   một lời nói dối trông y hệt sự thật.

drop function if exists public.ds_cho_duyet(uuid);

create or replace function public.ds_cho_duyet(p_tree uuid)
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
   where tm.tree_id = p_tree
     and tm.approved = false
     -- b110c: lời mời chưa nhận KHÔNG phải đơn xin vào.
     and tm.moi_boi is null
     and tm.role not in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')
     and public.co_the_quan_tri(p_tree)
   order by tm.xin_luc nulls last, tm.email;
$$;

-- ============================================================
-- 7. QUYỀN GỌI
-- ============================================================
-- ⚠ `create or replace` GIỮ NGUYÊN quyền đã cấp, nên năm hàm cũ không cần cấp
--   lại. Hàm MỚI `la_loi_moi_cho_nhan()` thì cần — và cần cả `revoke` trước,
--   vì mặc định của Postgres là mọi vai gọi được, kể cả `anon`.

revoke all on function public.la_loi_moi_cho_nhan(uuid, uuid) from public, anon;
grant execute on function public.la_loi_moi_cho_nhan(uuid, uuid) to authenticated;

-- ⚠ Hai hàm dưới đây bị `drop` ở mục 6b và 6c, nên chúng MẤT quyền gọi. Cấp
--   lại, và cấp đúng khuôn `revoke … from public, anon` trước.
revoke all on function public.ds_thanh_vien(uuid) from public, anon;
grant execute on function public.ds_thanh_vien(uuid) to authenticated;

revoke all on function public.ds_cho_duyet(uuid) from public, anon;
grant execute on function public.ds_cho_duyet(uuid) to authenticated;

commit;

-- ============================================================
-- 8. BẢNG TỰ KIỂM — đọc sau khi dán
-- ============================================================
-- ⚠ Bảng này chỉ hỏi *"thứ này có tồn tại không"*. Phép đo thật — mượn danh
--   nghĩa từng tài khoản rồi thử đi xuyên hàng rào — là
--   `kiem-thu/ban-thu-sql/do-b110c.mjs`, 30 phép, 3 kiểm chứng ngược.

select ten_kiem as "Kiểm", ket_qua as "Kết quả"
from (
  select 1 as stt, 'Hàm la_loi_moi_cho_nhan() đã có' as ten_kiem,
    case when exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                       where n.nspname='public' and p.proname='la_loi_moi_cho_nhan')
         then 'ĐẠT' else 'HỎNG — thiếu hàm' end as ket_qua
  union all
  select 2, 'anon KHÔNG gọi được hàm ấy',
    case when not has_function_privilege('anon',
           'public.la_loi_moi_cho_nhan(uuid, uuid)', 'execute')
         then 'ĐẠT' else 'HỎNG — anon gọi được' end
  union all
  select 3, 'duyet_thanh_vien() đã có cửa lời mời',
    case when pg_get_functiondef((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='duyet_thanh_vien'))
         like '%la_loi_moi_cho_nhan%'
         then 'ĐẠT' else 'HỎNG — chưa vá HR1' end
  union all
  select 4, 'doi_vai_thanh_vien() đã có cửa lời mời',
    case when pg_get_functiondef((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='doi_vai_thanh_vien'))
         like '%la_loi_moi_cho_nhan%'
         then 'ĐẠT' else 'HỎNG — chưa vá HR2, cửa nặng nhất' end
  union all
  select 5, 'gan_nguoi_cho_thanh_vien() đã có cửa lời mời',
    case when pg_get_functiondef((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='gan_nguoi_cho_thanh_vien'))
         like '%la_loi_moi_cho_nhan%'
         then 'ĐẠT' else 'HỎNG — chưa vá HR3' end
  union all
  select 6, 'dat_tin_cay_thanh_vien() đã có cửa lời mời',
    case when pg_get_functiondef((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='dat_tin_cay_thanh_vien'))
         like '%la_loi_moi_cho_nhan%'
         then 'ĐẠT' else 'HỎNG — chưa vá HR4' end
  union all
  select 7, 'la_thanh_vien() đã thu hẹp đường tắt (lớp hai)',
    case when pg_get_functiondef((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='la_thanh_vien'))
         like '%moi_boi is null%'
         then 'ĐẠT' else 'HỎNG — lớp hai chưa có' end
  union all
  select 8, '⚠ la_thanh_vien() VẪN GIỮ đường tắt cho sao_luu',
    case when pg_get_functiondef((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='la_thanh_vien'))
         like '%sao_luu%'
         then 'ĐẠT' else 'HỎNG — sao lưu đêm sẽ ra file RỖNG' end
  union all
  select 9, 'ds_thanh_vien() đã trả cột moi_luc — màn hình phân biệt được',
    case when pg_get_function_result((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='ds_thanh_vien'))
         like '%moi_luc%'
         then 'ĐẠT' else 'HỎNG — màn hình vẫn ghi nhầm lời mời thành đơn' end
  union all
  select 10, 'ds_cho_duyet() thôi đếm lời mời, và bắt truyền p_tree',
    case when pg_get_functiondef((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='ds_cho_duyet'))
           like '%moi_boi is null%'
          and (select pg_get_function_identity_arguments(p.oid)
                 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                where n.nspname='public' and p.proname='ds_cho_duyet') = 'uuid'
         then 'ĐẠT' else 'HỎNG — con số trên thanh điều hướng còn sai' end
  union all
  select 11, '⚠ ds_cho_duyet() KHÔNG còn đoán cây bằng limit 1 (Hỏng 3)',
    case when pg_get_functiondef((select p.oid from pg_proc p
            join pg_namespace n on n.oid=p.pronamespace
           where n.nspname='public' and p.proname='ds_cho_duyet'))
         not like '%trees limit 1%'
         then 'ĐẠT' else 'HỎNG — dán lại `08` đã mở lại Hỏng 3' end
  union all
  select 12, 'authenticated vẫn gọi được hai hàm vừa drop',
    case when has_function_privilege('authenticated',
           'public.ds_thanh_vien(uuid)', 'execute')
          and has_function_privilege('authenticated',
           'public.ds_cho_duyet(uuid)', 'execute')
         then 'ĐẠT' else 'HỎNG — quên grant lại sau drop' end
  union all
  select 13, 'Không còn dòng lời mời nào đang mang vai quan_tri',
    case when not exists (
      select 1 from public.tree_members
       where coalesce(approved, false) = false
         and moi_boi is not null
         and role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu'))
         then 'ĐẠT'
         else 'HỎNG — có dòng đã bị lỗ hổng chạm vào, xem mục 9 dưới đây' end
) t order by stt;

-- ============================================================
-- 9. DỌN VẾT — chạy TAY, chỉ khi mục 9 của bảng trên báo HỎNG
-- ============================================================
-- ⚠ Bản vá đóng cửa lại, nhưng **không tự dọn những dòng đã lọt qua cửa ấy**.
--   Nếu đã lỡ bấm *Đổi vai* hay *Duyệt* trên một lời mời, dòng ấy vẫn còn
--   nguyên trạng thái sai. Hai câu dưới đây trả nó về đúng hình một lời mời
--   chưa nhận — **đọc trước khi chạy, và chạy từng câu một.**
--
--   Câu 1 chỉ ĐỌC: nó kể ra những dòng cần dọn.

-- select tm.tree_id, t.name, tm.email, tm.role, tm.approved, tm.moi_vai
--   from public.tree_members tm
--   join public.trees t on t.id = tm.tree_id
--  where tm.moi_boi is not null
--    and (tm.approved or tm.role <> 'xem');

--   Câu 2 SỬA: trả mọi lời mời chưa nhận về `role='xem'`, `approved=false`.
--   Vai thật của lời mời nằm ở `moi_vai` và không bị đụng tới, nên người được
--   mời bấm Nhận vẫn vào đúng vai đã mời.

-- update public.tree_members
--    set role = 'xem', approved = false
--  where moi_boi is not null
--    and approved = false;
