-- ============================================================
-- giapha-supabase · luoc-do/14-loi-moi.sql
-- Vai trò  : MỜI người vào gia phả (chiều ngược của "xin vào"), cờ Quản trị
--            hệ thống bật được trên màn hình, và hai hàm cho khu Tài khoản
--            nhìn TOÀN HỆ THỐNG chứ không chỉ cây đang mở.
-- Phiên bản: 0.2.0 · Cập nhật: 09/09/2026 (b108)
--            0.2.0 vá `trang_thai_cua_toi()` — mục 6b — để người ĐƯỢC MỜI mở
--            app thường (không phải trang Quản trị) thấy đúng lời mời của
--            mình, thay vì câu "đơn của bạn đang chờ duyệt". Đây là chỗ
--            b107 cố ý để hở, ghi ở `KE-HOACH.md` mục b107 "Còn hở, cố ý".
-- ============================================================
--
-- ⚠⚠ THỨ TỰ DÁN: file này dán SAU `13-quan-ly-thanh-vien.sql`.
--    Nó gọi `co_the_quan_tri()` bản mới của `13` (neo vào `trees.chu_so_huu`).
--    Dán trước `13` thì nó gọi bản cũ — bản hỏi MÃ VAI — và chủ cây mời được
--    vào cây mình sẽ bị từ chối. Cùng khuôn cảnh báo `06` → `07` → `08` → `13`.
--
-- ⚠⚠ VÀ MỘT CHIỀU NGƯỢC: file này ĐỊNH NGHĨA ĐÈ `ds_gia_pha()` của
--    `11-quyen-he-thong.sql` (thêm ba cột lời mời). **Dán lại `11` thì bắt
--    buộc dán lại `14`**, nếu không màn hình khu Gia phả mất cột *Được mời*
--    và người được mời không thấy lời mời của mình ở đâu cả.
--
-- ⚠⚠ CHIỀU NGƯỢC THỨ HAI (0.2.0, b108): file này CŨNG định nghĩa đè
--    `trang_thai_cua_toi()` của `10-sua-nhieu-cay.sql` (thêm nhánh
--    `duocmoi`). **Dán lại `10` thì bắt buộc dán lại `14`**, nếu không màn
--    hình khởi động của app thường lại nói người ĐƯỢC MỜI là "đơn đang chờ
--    duyệt" — sai hẳn chuyện đang xảy ra.
--
-- ═══ VÌ SAO CÓ FILE NÀY ═══
--
-- Chủ dự án chốt 08/09/2026:
--
--   *"quyền vào gia phả hay không là quyền mỗi người nên quản trị hệ thống
--   cũng chỉ có thể mời người vào gia phả rồi để người dùng quyết định có vào
--   hay không."*
--
-- Tới hôm nay hệ thống chỉ có MỘT chiều vào cây: người ta **xin**
-- (`xin_vao_cay` của `07`), quản trị **duyệt** (`duyet_thanh_vien`). Không có
-- đường nào để quản trị ngỏ lời trước. File này thêm chiều ấy, và giữ nguyên
-- luật hai chữ ký: một bên ngỏ lời, một bên nhận. **Không cú bấm nào đưa được
-- một tài khoản vào cây.** Kể cả Quản trị hệ thống — họ mời được vào mọi cây,
-- nhưng không nhận hộ ai.
--
-- Thiết kế đầy đủ: `THIET-KE-NHIEU-CAY.md` mục 11.4 và 11.5.
--
-- ═══ BA TRẠNG THÁI, MỘT BẢNG ═══
--
--   `moi_boi` trống · approved=false  → ĐƠN XIN VÀO. Người ta gõ cửa.
--   `moi_boi` có     · approved=false  → LỜI MỜI.     Mình gõ cửa nhà người ta.
--   approved=true                      → thành viên thật.
--
-- Không đẻ bảng `loi_moi` riêng, đúng `THIET-KE-QUAN-TRI.md` mục 7 điều 3 đã
-- chốt cho hàng chờ đăng ký: hai bảng cho một quan hệ là hai chỗ để lệch nhau,
-- và cả hai trạng thái đều trả lời đúng một câu — *tài khoản này đứng ở đâu
-- trong cây này*.
--
-- ═══⚠ CÁI BẪY ĐO ĐƯỢC, VÀ VÌ SAO CÓ CỘT `moi_vai` ═══
--
-- `la_thanh_vien()` của `11` mục 9 cho vào cây khi:
--
--     approved  OR  role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')
--
-- Mệnh đề đi tắt ấy `07` cố ý đặt vào và b102 đã trả giá một lần để giữ nó
-- (bỏ đi thì bản sao lưu đêm ra file rỗng, không báo lỗi). Hậu quả ở đây:
-- **một lời mời ghi thẳng vai `quan_tri` vào cột `role` sẽ mở cây ra ngay lúc
-- mời**, trước khi người kia bấm gì — đúng thứ luật trên cấm.
--
-- Nên vai được mời nằm ở cột RIÊNG `moi_vai`; cột `role` của dòng mời là
-- `xem`, và chỉ lúc nhận mới chép sang. Cách này **không đụng một dòng nào**
-- của `la_thanh_vien()` — hàm nền móng mà mọi hàm quyết quyền đều hỏi.

begin;

-- ============================================================
-- 1. BA CỘT MỚI TRÊN `tree_members`
-- ============================================================
-- `on delete set null` cho `moi_boi`: xoá tài khoản người mời thì lời mời vẫn
-- còn giá trị — người được mời không mất chỗ vì chuyện của người khác. Nhưng
-- `moi_boi` thành `null` sẽ biến dòng ấy thành "đơn xin vào" theo cách đọc ở
-- mục trên, nên `moi_luc` mới là chỗ phân biệt thật, và mọi câu truy vấn dưới
-- đây hỏi `moi_luc is not null`, không hỏi `moi_boi is not null`.
--
-- ⚠ Đó là chỗ dễ viết sai nhất trong cả file, và nó chỉ hiện ra khi có người
--   bị xoá tài khoản — tức là không bao giờ hiện ra trong lúc kiểm.

alter table public.tree_members
  add column if not exists moi_boi uuid references auth.users(id) on delete set null,
  add column if not exists moi_luc timestamptz,
  add column if not exists moi_vai text;

-- Vai được mời chỉ có ba giá trị, đúng trần của `doi_vai_thanh_vien` ở `13`
-- mục 8: không mời ai vào làm `sao_luu`, không mời ai làm `quan_tri_he_thong`
-- (mã ấy `13` đã đuổi khỏi bảng).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tree_members_moi_vai_hop_le'
  ) then
    alter table public.tree_members
      add constraint tree_members_moi_vai_hop_le
      check (moi_vai is null or moi_vai in ('quan_tri', 'sua', 'xem'));
  end if;
end $$;

-- ============================================================
-- 2. moi_vao_cay(p_tree, p_email, p_vai, p_ma_nguoi)
-- ============================================================
-- Ai mời được: `co_the_quan_tri(p_tree)` — Quản trị hệ thống ở mọi cây, chủ
-- cây ở cây mình. **Quản trị gia phả được phong thì không**, đúng bảng năm
-- hạng ở `THIET-KE-NHIEU-CAY.md` mục 11.3: mời một người vào cây là cấp quyền
-- đọc, việc ấy nằm ở cột "đổi quyền", không nằm ở cột "duyệt nội dung".
--
-- ⚠ Không mời được chính mình. Nghe như thừa — ai lại mời mình? — nhưng đó
--   đúng là đường leo thang: Quản trị hệ thống tự mời mình vào cây người khác
--   với `moi_vai = 'quan_tri'`, rồi tự nhận, là chiếm quyền quản trị cây ấy
--   qua hai cú bấm hợp lệ. Luật sáu cửa của mục 11.5 gác đúng chỗ này, và nó
--   gác ở CẢ HAI đầu: `moi_vao_cay` từ chối tự mời, `nhan_loi_moi` từ chối
--   dòng mà người mời chính là người nhận.

create or replace function public.moi_vao_cay(
  p_tree     uuid,
  p_email    text,
  p_vai      text default 'xem',
  p_ma_nguoi text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_user  uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_dong  public.tree_members%rowtype;
begin
  if not public.co_the_quan_tri(p_tree) then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ chủ gia phả và Quản trị hệ thống mới mời được người vào gia phả.');
  end if;

  if coalesce(p_vai, '') not in ('quan_tri', 'sua', 'xem') then
    return jsonb_build_object('ok', false, 'loi',
      'Vai mời được chỉ có: quan_tri, sua, xem.');
  end if;

  if v_email = '' then
    return jsonb_build_object('ok', false, 'loi', 'Chưa nhập email.');
  end if;

  select u.id into v_user from auth.users u
   where lower(u.email::text) = v_email;

  -- ⚠ Nói thật là "chưa có tài khoản", đừng vờ như đã gửi thư. Hệ thống này
  --   không gửi email được (không có máy chủ thư), nên một lời mời cho địa chỉ
  --   chưa đăng ký sẽ nằm chờ mãi mà người kia không bao giờ biết.
  if v_user is null then
    return jsonb_build_object('ok', false, 'loi',
      'Chưa có tài khoản nào đăng ký bằng email này. Bảo người ấy đăng ký trước, ' ||
      'rồi mời lại.');
  end if;

  if public.la_chinh_minh(v_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai tự mời mình vào gia phả được. Nhờ một quản trị khác làm việc này.');
  end if;

  select * into v_dong from public.tree_members
   where tree_id = p_tree and user_id = v_user;

  if found then
    if v_dong.approved then
      return jsonb_build_object('ok', false, 'loi',
        'Tài khoản này đã có tên trong gia phả rồi.');
    end if;
    if v_dong.moi_luc is not null then
      return jsonb_build_object('ok', false, 'loi',
        'Đã mời tài khoản này rồi, đang chờ người ta nhận lời.');
    end if;
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản này đang có đơn xin vào gia phả. Duyệt đơn ấy, đừng mời lại.');
  end if;

  insert into public.tree_members
         (tree_id, user_id, role, email, approved, person_id,
          moi_boi, moi_luc, moi_vai)
  values (p_tree, v_user, 'xem', v_email, false, nullif(trim(coalesce(p_ma_nguoi,'')), ''),
          auth.uid(), now(), p_vai);

  return jsonb_build_object('ok', true, 'userId', v_user, 'email', v_email,
                            'moiVai', p_vai);
end;
$$;

-- ============================================================
-- 3. loi_moi_cua_toi() — người được mời nhìn thấy gì
-- ============================================================
-- ⚠ Hàm này CỐ Ý đọc `trees` của một cây mà người gọi **chưa** có quyền xem.
--   Đó là điều kiện để lời mời có nghĩa: không biết mình được mời vào đâu thì
--   không quyết được có vào hay không. Nhưng nó chỉ trả về TÊN và MÃ cây —
--   không một dòng `persons` nào. Ranh giới ấy phải giữ nguyên: mở thêm một
--   cột nội dung ở đây là cho người chưa nhận lời đọc gia phả.

create or replace function public.loi_moi_cua_toi()
returns table (
  tree_id       uuid,
  ten           text,
  tree_code     text,
  moi_vai       text,
  moi_luc       timestamptz,
  email_nguoi_moi text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select tm.tree_id,
         t.name,
         t.tree_code,
         tm.moi_vai,
         tm.moi_luc,
         coalesce(u.email::text, '')
    from public.tree_members tm
    join public.trees t on t.id = tm.tree_id
    left join auth.users u on u.id = tm.moi_boi
   where tm.user_id = auth.uid()
     and tm.approved = false
     and tm.moi_luc is not null
   order by tm.moi_luc desc;
$$;

-- ============================================================
-- 4. nhan_loi_moi(p_tree) — chữ ký thứ hai
-- ============================================================
-- ⚠⚠ VÌ SAO HÀM NÀY KHÔNG VI PHẠM LUẬT "KHÔNG AI ĐẶT QUYỀN CHO CHÍNH MÌNH".
--
-- Nhìn qua thì nó đúng là người ta tự đặt `approved = true` cho dòng của
-- chính mình. Ranh giới nằm ở ba chỗ, và cả ba đều kiểm được:
--
--   1. Chỉ lật đúng cột `approved`, trên đúng dòng của mình.
--   2. Chỉ lật khi dòng ấy có `moi_luc` — tức có người đủ thẩm quyền đã ký
--      trước. Dòng "xin vào" (không `moi_luc`) thì hàm này từ chối, người ta
--      vẫn phải đợi duyệt như cũ.
--   3. Vai lấy từ `moi_vai` — thứ NGƯỜI MỜI chọn, không phải thứ người nhận
--      truyền vào. Hàm không nhận tham số vai, nên không có gì để nâng.
--
-- Và chốt chặn cuối: `moi_boi = auth.uid()` thì từ chối. Ai lách được vào bảng
-- để tự tạo một dòng mời cho mình sẽ dừng ở đúng dòng ấy.

create or replace function public.nhan_loi_moi(p_tree uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare v_dong public.tree_members%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'loi', 'Chưa đăng nhập.');
  end if;

  select * into v_dong from public.tree_members
   where tree_id = p_tree and user_id = auth.uid();

  if not found or v_dong.moi_luc is null then
    return jsonb_build_object('ok', false, 'loi',
      'Không có lời mời nào vào gia phả này.');
  end if;

  if v_dong.approved then
    return jsonb_build_object('ok', true, 'daVao', true);
  end if;

  if v_dong.moi_boi is not null and v_dong.moi_boi = auth.uid() then
    return jsonb_build_object('ok', false, 'loi',
      'Lời mời này do chính bạn tạo ra — không tự nhận được.');
  end if;

  update public.tree_members
     set approved = true,
         role     = coalesce(v_dong.moi_vai, 'xem'),
         added_at = now()
   where tree_id = p_tree and user_id = auth.uid();

  return jsonb_build_object('ok', true, 'vai', coalesce(v_dong.moi_vai, 'xem'));
end;
$$;

-- ============================================================
-- 5. tu_choi_loi_moi(p_tree)
-- ============================================================
-- Từ chối là XOÁ dòng, không phải đánh dấu. Giữ lại một dòng "đã từ chối" thì
-- người mời không mời lại được nữa mà chẳng hiểu vì sao — và bảng này không
-- phải nhật ký, `change_log` mới là.

create or replace function public.tu_choi_loi_moi(p_tree uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare v_so int;
begin
  delete from public.tree_members
   where tree_id = p_tree
     and user_id = auth.uid()
     and approved = false
     and moi_luc is not null;
  get diagnostics v_so = row_count;

  if v_so = 0 then
    return jsonb_build_object('ok', false, 'loi',
      'Không có lời mời nào đang chờ bạn ở gia phả này.');
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ============================================================
-- 6. ds_gia_pha() — THÊM BA CỘT LỜI MỜI
-- ============================================================
-- ⚠ `drop function` trước: hàm trả BẢNG, `create or replace` không đổi được
--   danh sách cột. Bài học b103, trả giá bằng mã lỗi `42P13`.
--
-- ⚠ Ba cột mới đứng CUỐI danh sách, cố ý: `khu-gia-pha.js` đọc theo TÊN cột
--   trong JSON nên thứ tự không đổi gì với nó, nhưng bất kỳ ai đọc theo vị
--   trí (psql, phép đo) cũng không bị lệch.

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
  email_nguoi_moi      text
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
    -- ⚠ `and tm.moi_luc is null` là chỗ DUY NHẤT khác bản `11`, và nó bắt
    --   buộc: từ b107 một dòng `approved = false` có thể là đơn xin vào HOẶC
    --   lời mời. Thiếu vế này thì người vừa ĐƯỢC MỜI mang huy hiệu *"Đã nộp
    --   đơn"* — nói ngược hẳn chuyện đang xảy ra, và giấu mất nút Nhận lời.
    exists (
      select 1 from public.tree_members tm
       where tm.tree_id = t.id
         and tm.user_id = auth.uid()
         and tm.approved = false
         and tm.moi_luc is null
    )                                            as da_nop_don,
    t.cho_nguoi_la_thay_ten,
    -- ⚠ Câu này để MÀN HÌNH biết có nên vẽ công tắc hay không, và nó phải do
    --   MÁY CHỦ trả lời. Bản đầu (codex/, 07/09) so sánh `email_chu` với email
    --   người đang đăng nhập ngay trong trình duyệt — không phải lỗ hổng (máy
    --   chủ vẫn chặn), nhưng sai theo hướng khó thấy: cây chưa gán `chu_so_huu`
    --   thì `email_chu` là null, và chủ cây thật KHÔNG thấy công tắc của chính
    --   mình mà không hiểu vì sao.
    coalesce(t.chu_so_huu = auth.uid(), false)   as toi_la_chu,
    -- Ba cột b107, đứng cuối để không xô lệch ai đọc theo vị trí.
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
                                                 as email_nguoi_moi
  from public.trees t
  left join auth.users au on au.id = t.chu_so_huu
  where
    -- ⚠⚠ MỆNH ĐỀ `where` NÀY CHÉP NGUYÊN CỦA `11`, KHÔNG ĐƯỢC BỎ. Hàm này là
    --   `security definer` — bỏ `where` đi là mọi tài khoản đã đăng nhập đọc
    --   được tên, mã và số người của MỌI gia phả trên máy chủ, kể cả cây họ
    --   không có chân. Bản nháp đầu của b107 đúng là đã bỏ mất nó.
    public.co_the_xem_cay(t.id)
    or t.cho_nguoi_la_thay_ten = true
    or public.la_quan_tri_he_thong()
    -- b103: NGƯỜI ĐANG CHỜ DUYỆT vẫn thấy cây mình đã nộp đơn — và từ b107,
    -- nhánh này cũng là đường để NGƯỜI ĐƯỢC MỜI nhìn thấy cây mình được mời
    -- vào. Cả hai đều là dòng `approved = false`, nên một nhánh gánh cả hai.
    -- ⚠ Đây là chỗ duy nhất cho người chưa nhận lời thấy TÊN cây; họ vẫn
    --   không đọc được một dòng `persons` nào, vì `co_the_xem_cay()` vẫn false.
    or exists (
      select 1 from public.tree_members tm
       where tm.tree_id = t.id
         and tm.user_id = auth.uid()
         and tm.approved = false
    )
  order by t.name;
$$;

-- ============================================================
-- 6b. trang_thai_cua_toi() — THÊM NHÁNH "duocmoi" (0.2.0, b108)
-- ============================================================
-- ⚠ Đây là bản đè của bản `10-sua-nhieu-cay.sql`. Chép nguyên phần chọn
--   `v_tree` (ba câu hỏi theo thứ tự) — KHÔNG đổi gì ở đó, chỉ thêm MỘT
--   nhánh mới sau khi đã có `v_dong`.
--
-- ═══ VÌ SAO CẦN NHÁNH NÀY ═══
--
-- Từ b107, một dòng `tree_members` có `approved = false` có thể là ĐƠN XIN
-- VÀO hoặc LỜI MỜI — hai thứ khác hẳn nhau (mục "Ba trạng thái" đầu file).
-- Hàm này trước b108 gộp cả hai vào một chữ `'cho'`, và màn hình khởi động
-- (`khoi-dong.js`) đọc chữ ấy ra câu "Đơn của bạn đang chờ duyệt" — đúng với
-- người xin, SAI hẳn với người được mời: họ chưa nộp đơn nào, và họ cần bấm
-- Nhận hoặc Từ chối, không phải chờ.
--
-- ⚠ Nhánh mới đứng TRƯỚC câu trả lời `'cho'`/`'daduyet'` cũ, và kiểm đúng
--   điều kiện `ds_gia_pha()` mục 6 đã dùng: `moi_luc is not null`, không phải
--   `moi_boi is not null` — lý do giống hệt, xem cảnh báo ở mục 1 đầu file.
--
-- Trả thêm tên/mã cây và email người mời để màn hình vẽ được câu hỏi đầy đủ
-- mà không phải gọi thêm một vòng máy chủ nữa.

create or replace function public.trang_thai_cua_toi(p_tree uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_tree      uuid;
  v_dong      public.tree_members%rowtype;
  v_so        integer;
  v_ten       text;
  v_ma        text;
  v_email_moi text;
begin
  if auth.uid() is null then
    return jsonb_build_object('trangThai', 'chuadangnhap');
  end if;

  if p_tree is not null then
    v_tree := p_tree;
  else
    select tm.tree_id into v_tree
      from public.tree_members tm
      left join public.user_settings us
             on us.user_id = tm.user_id and us.tree_id = tm.tree_id
     where tm.user_id = auth.uid()
     order by coalesce(us.dang_mo, false) desc,
              tm.approved desc,
              tm.added_at,
              tm.tree_id
     limit 1;

    if v_tree is null then
      select count(*) into v_so from public.trees;
      if v_so = 1 then
        select id into v_tree from public.trees;
      else
        return jsonb_build_object('trangThai', 'nhieucay', 'soCay', v_so);
      end if;
    end if;
  end if;

  select * into v_dong from public.tree_members
   where tree_id = v_tree and user_id = auth.uid();

  if not found then
    return jsonb_build_object('trangThai', 'chuanop', 'treeId', v_tree);
  end if;

  -- b108: LỜI MỜI đứng TRƯỚC câu trả lời cũ. Xem "VÌ SAO CẦN NHÁNH NÀY" trên.
  if not v_dong.approved and v_dong.moi_luc is not null then
    select t.name, t.tree_code into v_ten, v_ma
      from public.trees t where t.id = v_tree;
    select u.email::text into v_email_moi
      from auth.users u where u.id = v_dong.moi_boi;

    return jsonb_build_object(
      'trangThai', 'duocmoi',
      'treeId', v_tree,
      'tenCay', coalesce(v_ten, ''),
      'maCay', coalesce(v_ma, ''),
      'moiVai', v_dong.moi_vai,
      'moiLuc', v_dong.moi_luc,
      'emailNguoiMoi', coalesce(v_email_moi, ''));
  end if;

  return jsonb_build_object(
    'trangThai', case when v_dong.approved
                        or v_dong.role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')
                      then 'daduyet' else 'cho' end,
    'treeId', v_tree,
    'vaiTro', v_dong.role,
    'xinLuc', v_dong.xin_luc);
end;
$$;

-- ============================================================
-- 7. dat_quan_tri_he_thong(p_user, p_bat) — CỬA THỨ SÁU
-- ============================================================
-- Chủ dự án chốt 08/09/2026: có nút, **nhưng không ai trỏ vào chính mình**.
-- Trước file này cột `tai_khoan.la_quan_tri_he_thong` không có hàm nào đặt —
-- cố ý, vì đó đúng là lỗ hổng b102 bắt được. Nay có hàm, và nó gác bằng đúng
-- câu của năm cửa kia: `la_chinh_minh(p_user)` thì từ chối.
--
-- ⚠ VÀ MỘT PHÉP KHÔNG CỬA NÀO KHÁC CẦN: **không hạ được người cuối cùng.**
--   Hai Quản trị hệ thống tắt lẫn nhau về không là khoá cả nhà rồi vứt chìa —
--   sửa lại chỉ còn đường dán SQL tay. Nên hàm đếm trước khi tắt.

create or replace function public.dat_quan_tri_he_thong(
  p_user uuid,
  p_bat  boolean
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare v_con int;
begin
  if not public.la_quan_tri_he_thong() then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ Quản trị hệ thống mới đặt được cờ này.');
  end if;

  if public.la_chinh_minh(p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai đặt quyền cho chính mình được, kể cả cờ này. Nhờ một Quản trị ' ||
      'hệ thống khác làm.');
  end if;

  if not exists (select 1 from auth.users where id = p_user) then
    return jsonb_build_object('ok', false, 'loi', 'Không có tài khoản này.');
  end if;

  if p_bat is false then
    select count(*) into v_con from public.tai_khoan
     where la_quan_tri_he_thong = true;
    if v_con <= 1 then
      return jsonb_build_object('ok', false, 'loi',
        'Đây là Quản trị hệ thống cuối cùng — tắt nốt thì không ai bật lại được ' ||
        'nữa trừ khi dán SQL tay.');
    end if;
  end if;

  -- Dòng `tai_khoan` sinh ra cùng tài khoản (trigger `sau_khi_tao_user` của
  -- `11` mục 2), nhưng `insert` ở đây là để hàm không hỏng với một tài khoản
  -- cũ lọt lưới — và cột `ma_ngan` là `not null unique` nên phải điền.
  --
  -- ⚠ KHÔNG gọi `tao_ma_ngan_tai_khoan()`: **nó là hàm TRIGGER**, gọi thẳng
  --   thì Postgres ném `trigger functions can only be called as triggers` và
  --   cả hàm này hỏng. Bản nháp đầu của b107 gọi đúng như thế, và bảng tự
  --   kiểm cuối file vẫn báo 5/5 ĐẠT — vì nó chỉ hỏi *hàm có tồn tại không*.
  --   Bàn thử tại chỗ bắt được, đúng việc nó sinh ra để làm.
  --
  --   Công thức dưới đây chép của `11` mục 3 (đường điền tay cho tài khoản
  --   đăng ký trước khi có trigger), nên hai chỗ sinh mã cùng một hình dạng.
  insert into public.tai_khoan (user_id, ma_ngan, la_quan_tri_he_thong)
  values (p_user,
          left(upper(translate(md5(p_user::text), '0123456789abcdef', '23456789ABCDEFGH')), 6),
          coalesce(p_bat, false))
  on conflict (user_id) do update
    set la_quan_tri_he_thong = coalesce(p_bat, false);

  return jsonb_build_object('ok', true, 'bat', coalesce(p_bat, false));
end;
$$;

-- ============================================================
-- 8. ds_tai_khoan_he_thong() — MỌI tài khoản, kể cả người chưa có cây nào
-- ============================================================
-- ⚠ Khác hẳn `ds_tai_khoan()` của `13` mục 6, và đừng gộp hai hàm: hàm kia
--   trả về những tài khoản có chân trong cây mà NGƯỜI GỌI quản trị được — nó
--   phục vụ việc gắn người trong một cây. Hàm này trả về **toàn bộ sổ đăng ký
--   của phần mềm**, gồm cả người tạo tài khoản rồi bỏ đấy, và chỉ Quản trị hệ
--   thống đọc được.
--
-- `so_cay` đếm chân THẬT (`approved`), `so_cho` đếm đơn đang chờ, `so_moi`
-- đếm lời mời chưa nhận. Ba con số khác nhau, và gộp lại là mất đúng thứ khu
-- Tài khoản cần nói.

create or replace function public.ds_tai_khoan_he_thong()
returns table (
  user_id            uuid,
  email              text,
  ma_ngan            text,
  la_quan_tri_he_thong boolean,
  duoc_tao_cay       boolean,
  so_cay             bigint,
  so_cho             bigint,
  so_moi             bigint,
  so_cay_lam_chu     bigint,
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
         u.created_at,
         u.last_sign_in_at,
         (u.email_confirmed_at is not null)
    from auth.users u
    left join public.tai_khoan tk on tk.user_id = u.id
   where public.la_quan_tri_he_thong()
   order by u.created_at;
$$;

-- ============================================================
-- 9. ds_cay_cua_tai_khoan(p_user) — bảng sâu của một tài khoản
-- ============================================================
-- Một dòng cho mỗi cây tài khoản ấy dính tới, ở bất kỳ trạng thái nào trong
-- ba trạng thái. Màn hình b108 dùng nó rồi gọi thẳng năm hàm của `13` —
-- không hàm việc nào phải viết mới, vì chúng đã nhận `(p_tree, p_user)` sẵn.

create or replace function public.ds_cay_cua_tai_khoan(p_user uuid)
returns table (
  tree_id    uuid,
  ten        text,
  tree_code  text,
  vai        text,
  approved   boolean,
  moi_luc    timestamptz,
  moi_vai    text,
  person_id  text,
  ten_nguoi  text,
  tin_cay    boolean,
  la_chu_cay boolean,
  added_at   timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select tm.tree_id,
         t.name,
         t.tree_code,
         tm.role,
         tm.approved,
         tm.moi_luc,
         tm.moi_vai,
         tm.person_id,
         coalesce(p.vn->>'name', p.id, ''),
         tm.tin_cay,
         coalesce(t.chu_so_huu = tm.user_id, false),
         tm.added_at
    from public.tree_members tm
    join public.trees t on t.id = tm.tree_id
    left join public.persons p on p.tree_id = tm.tree_id and p.id = tm.person_id
   where tm.user_id = p_user
     and public.la_quan_tri_he_thong()
   order by t.name;
$$;

-- ============================================================
-- 10. xoa_tai_khoan(p_user, p_email_xac_nhan) — CỬA THỨ BẢY, KHÔNG HOÀN TÁC
-- ============================================================
-- Chủ dự án chốt 08/09/2026: bảng sâu của khu Tài khoản có nút xoá hẳn tài
-- khoản khỏi ứng dụng, không chỉ gỡ khỏi một cây.
--
-- ⚠ ĐÍNH CHÍNH MỘT CÂU TÔI ĐÃ NÓI SAI cùng ngày: *"xoá tài khoản thì xoá cả
--   dấu vết người ấy trong nhật ký thay đổi"* — **không đúng**. `change_log`
--   giữ `by_email` là CHỮ và `user_id` là uuid rời, **không có khoá ngoại** tới
--   `auth.users` (`01-bang.sql` mục change_log). Xoá tài khoản thì lịch sử ai
--   sửa gì vẫn còn nguyên. Đo bằng `grep "references auth.users"`, không đoán.
--
-- ⚠⚠ NGUY HIỂM THẬT NẰM CHỖ KHÁC, VÀ NÓ IM LẶNG: `trees.chu_so_huu` khai
--    `on delete set null` (`11` mục 15). Xoá một tài khoản đang làm CHỦ CÂY
--    thì cây ấy mất chủ — không báo lỗi, không ai biết — và từ b105 chỉ còn
--    Quản trị hệ thống động vào được.
--
-- ⚠ BẢN ĐẦU CHỮA SAI CHỖ NÀY, chủ dự án bác bỏ ngay 08/09/2026. Bản ấy **từ
--   chối** xoá cho tới khi tài khoản kia tự bàn giao cây đi. Nguyên văn:
--
--     *"tài khoản bị xóa thường có vi phạm nhất định, yêu cầu họ bàn giao là
--     không khả thi. vì vậy xoá thì chỉ định người làm chủ cây, mặc định tài
--     khoản quản trị hệ thống thực hiện thao tác xoá sẽ là chủ cây."*
--
--   Đúng, và chỗ sai đáng ghi lại: **một hàng rào mà lối đi qua nó nằm trong
--   tay chính người đang bị đuổi thì không phải hàng rào.** Nó chỉ đổi "cây
--   mất chủ" thành "không xoá được tài khoản hỏng", tức dời cái kẹt sang chỗ
--   khác rồi gọi đó là an toàn.
--
--   Nay hàm **chuyển chủ trong cùng một giao dịch với lệnh xoá**: mặc định là
--   chính người bấm nút, hoặc một tài khoản khác nếu họ chỉ định. Cây không
--   bao giờ tồn tại ở trạng thái không chủ, dù chỉ một khoảnh khắc.
--
-- ⚠ Việc người bấm nút tự nhận cây KHÔNG phá luật *"không ai đặt quyền cho
--   chính mình"*: chỉ Quản trị hệ thống gọi được hàm này, mà họ **đã** có mọi
--   quyền ở mọi cây qua cờ `tai_khoan` (`co_the_quan_tri()` trả `true` khắp
--   nơi). Nhận cột `chu_so_huu` không thêm cho họ khả năng nào chưa có —
--   đúng lý lẽ b105 đã dùng để chặn họ tự trỏ vào mình mà không mất gì.
--
-- Bảy cửa gác cùng một câu, và hai cửa cuối là loại "hỏng trong im lặng" mà
-- b102 đã dạy phải canh: tài khoản `sao_luu` bị xoá thì bản sao lưu đêm vẫn
-- chạy, vẫn sinh file, chỉ là file rỗng.
--
-- ⚠ VÌ SAO ĐÒI GÕ LẠI EMAIL. Đây là việc duy nhất trong cả hệ thống phá huỷ
--   một lối đăng nhập, và nó bấm từ một danh sách TOÀN HỆ THỐNG nơi hai dòng
--   trông na ná nhau. Nút hai nhịp gác được cái bấm nhầm, không gác được cái
--   bấm nhầm DÒNG. Gõ lại email thì gác được cả hai.

-- ⚠ `drop` bản HAI THAM SỐ trước. `create or replace` với một tham số mới có
--   giá trị mặc định KHÔNG thay bản cũ — nó đẻ thêm một bản nạp chồng, và mọi
--   lời gọi hai tham số sau đó ném `function ... is not unique`. Máy chủ thật
--   chưa dán bản nào nên dòng này chỉ là vô hại ở đó; bàn thử thì đã có bản
--   cũ, và không có dòng này thì phép đo hỏng ở chỗ chẳng liên quan gì.
drop function if exists public.xoa_tai_khoan(uuid, text);

create or replace function public.xoa_tai_khoan(
  p_user           uuid,
  p_email_xac_nhan text,
  p_chu_moi        uuid default null   -- để trống = chính người bấm nút
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_email      text;
  v_email_chu  text;
  v_chu_moi    uuid;
  v_cay        int;
  v_chan       int;
  v_saoluu     int;
  v_con        int;
  v_co_co      boolean;
begin
  if not public.la_quan_tri_he_thong() then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ Quản trị hệ thống mới xoá được tài khoản.');
  end if;

  if public.la_chinh_minh(p_user) then
    return jsonb_build_object('ok', false, 'loi',
      'Không ai tự xoá tài khoản của chính mình ở đây được.');
  end if;

  select u.email::text into v_email from auth.users u where u.id = p_user;
  if v_email is null then
    return jsonb_build_object('ok', false, 'loi', 'Không có tài khoản này.');
  end if;

  if lower(trim(coalesce(p_email_xac_nhan, ''))) <> lower(v_email) then
    return jsonb_build_object('ok', false, 'loi',
      'Email gõ lại không khớp với tài khoản định xoá.');
  end if;

  -- Ai nhận những cây người này đang làm chủ.
  v_chu_moi := coalesce(p_chu_moi, auth.uid());

  if v_chu_moi = p_user then
    return jsonb_build_object('ok', false, 'loi',
      'Không giao cây cho chính tài khoản sắp bị xoá được.');
  end if;

  -- ⚠ Hỏi `tai_khoan` chứ không hỏi `auth.users`, chép đúng `doi_chu_cay()`
  --   của `13` mục 12: `11` mục 3 đặt luật mọi tài khoản đều có một dòng ở đó.
  --   Tài khoản thiếu dòng ấy là tài khoản hỏng — giao cây cho nó là giấu lỗi.
  select u.email::text into v_email_chu
    from auth.users u
    join public.tai_khoan k on k.user_id = u.id
   where u.id = v_chu_moi;

  if v_email_chu is null then
    return jsonb_build_object('ok', false, 'loi',
      'Tài khoản định giao cây cho không có trong phần mềm.');
  end if;

  select count(*) into v_cay from public.trees t where t.chu_so_huu = p_user;

  select count(*) into v_saoluu from public.tree_members m
   where m.user_id = p_user and m.role = 'sao_luu';
  if v_saoluu > 0 then
    return jsonb_build_object('ok', false, 'loi',
      'Đây là tài khoản sao lưu tự động — xoá nó thì bản sao lưu đêm vẫn chạy ' ||
      'và vẫn sinh file, chỉ là file rỗng.');
  end if;

  select coalesce(k.la_quan_tri_he_thong, false) into v_co_co
    from public.tai_khoan k where k.user_id = p_user;
  if coalesce(v_co_co, false) then
    select count(*) into v_con from public.tai_khoan
     where la_quan_tri_he_thong = true;
    if v_con <= 1 then
      return jsonb_build_object('ok', false, 'loi',
        'Đây là Quản trị hệ thống cuối cùng — xoá nốt thì không ai quản trị ' ||
        'hệ thống được nữa.');
    end if;
  end if;

  -- Đếm TRƯỚC khi xoá, để câu báo trên màn hình nói đúng cái vừa mất.
  select count(*) into v_chan from public.tree_members m where m.user_id = p_user;

  -- ⚠⚠ CHUYỂN CHỦ TRƯỚC, XOÁ SAU, TRONG CÙNG MỘT GIAO DỊCH. Cả hàm nằm trong
  --    một transaction ngầm của Postgres, nên cây không bao giờ tồn tại ở
  --    trạng thái không chủ — kể cả khi lệnh xoá vấp ở giữa.
  --
  --    Thứ tự ngược lại (xoá trước) thì `on delete set null` kịp quét qua và
  --    ta phải đi dò lại xem cây nào vừa mất chủ — dò bằng cái gì thì không
  --    còn, vì hàng đã trắng.
  if v_cay > 0 then
    update public.trees set chu_so_huu = v_chu_moi where chu_so_huu = p_user;

    -- Chủ mới phải ĐỌC được cây vừa nhận. Bài học `doi_chu_cay()`: thiếu dòng
    -- `tree_members` là chủ mới *sửa được mà không đọc được*.
    insert into public.tree_members (tree_id, user_id, role, email, approved)
    select t.id, v_chu_moi, 'quan_tri', v_email_chu, true
      from public.trees t where t.chu_so_huu = v_chu_moi
    on conflict (tree_id, user_id) do update
       set approved = true,
           -- ⚠ Không đụng vai `sao_luu`: nâng nó lên `quan_tri` là làm hỏng
           --   bản sao lưu đêm trong im lặng, đúng lỗ hổng b102.
           role = case when public.tree_members.role = 'sao_luu'
                       then public.tree_members.role else 'quan_tri' end;
  end if;

  -- `tree_members`, `tai_khoan`, `user_settings`, `branch_access` đều khai
  -- `on delete cascade` nên đi theo. `change_log` KHÔNG — cố ý, xem đầu mục.
  delete from auth.users where id = p_user;

  return jsonb_build_object('ok', true, 'email', v_email,
                            'soChanDaGo', v_chan,
                            'soCayDaChuyen', v_cay,
                            'chuMoi', v_chu_moi,
                            'emailChuMoi', v_email_chu);
end;
$$;

-- ============================================================
-- 11. QUYỀN GỌI
-- ============================================================
-- ⚠ `revoke … from public, anon` trước mỗi `grant`, đúng khuôn `07` mục 8:
--   mặc định của Postgres là **mọi vai đều gọi được**, kể cả `anon` — tức
--   người chưa đăng nhập. Quên dòng này là mở cửa cho cả internet gọi hàm
--   `security definer`.

revoke all on function public.moi_vao_cay(uuid, text, text, text) from public, anon;
revoke all on function public.loi_moi_cua_toi()                   from public, anon;
revoke all on function public.nhan_loi_moi(uuid)                  from public, anon;
revoke all on function public.tu_choi_loi_moi(uuid)               from public, anon;
revoke all on function public.dat_quan_tri_he_thong(uuid, boolean) from public, anon;
revoke all on function public.ds_tai_khoan_he_thong()             from public, anon;
revoke all on function public.ds_cay_cua_tai_khoan(uuid)          from public, anon;
revoke all on function public.ds_gia_pha()                        from public, anon;
revoke all on function public.xoa_tai_khoan(uuid, text, uuid)     from public, anon;

grant execute on function public.moi_vao_cay(uuid, text, text, text) to authenticated;
grant execute on function public.loi_moi_cua_toi()                   to authenticated;
grant execute on function public.nhan_loi_moi(uuid)                  to authenticated;
grant execute on function public.tu_choi_loi_moi(uuid)               to authenticated;
grant execute on function public.dat_quan_tri_he_thong(uuid, boolean) to authenticated;
grant execute on function public.ds_tai_khoan_he_thong()             to authenticated;
grant execute on function public.ds_cay_cua_tai_khoan(uuid)          to authenticated;
grant execute on function public.ds_gia_pha()                        to authenticated;
grant execute on function public.xoa_tai_khoan(uuid, text, uuid)      to authenticated;

commit;

-- ============================================================
-- 12. BẢNG TỰ KIỂM — đọc sau khi dán
-- ============================================================
-- ⚠ Bảng này chỉ hỏi *"thứ này có tồn tại không"*, KHÔNG hỏi *"nó có chặn
--   được không"*. Bài học b102: một bảng tự kiểm 12/12 ĐẠT đứng cạnh hai lỗ
--   hổng leo quyền. Phép đo thật là `kiem-thu/ban-thu-sql/do-b107.mjs`, chạy
--   trên bàn thử tại chỗ với danh nghĩa mượn của từng tài khoản.

select ten_kiem as "Kiểm", ket_qua as "Kết quả"
from (
  select 1 as stt, 'Ba cột lời mời đã có' as ten_kiem,
    case when (select count(*) from information_schema.columns
                where table_schema='public' and table_name='tree_members'
                  and column_name in ('moi_boi','moi_luc','moi_vai')) = 3
         then 'ĐẠT' else 'HỎNG — thiếu cột' end as ket_qua
  union all
  select 2, 'Tám hàm mới đã có',
    case when (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                where n.nspname='public' and p.proname in
                  ('moi_vao_cay','loi_moi_cua_toi','nhan_loi_moi','tu_choi_loi_moi',
                   'dat_quan_tri_he_thong','ds_tai_khoan_he_thong','ds_cay_cua_tai_khoan',
                   'xoa_tai_khoan')) = 8
         then 'ĐẠT' else 'HỎNG — thiếu hàm' end
  union all
  select 3, 'ds_gia_pha() đã có cột duoc_moi',
    case when exists (
      select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.proname='ds_gia_pha'
         and pg_get_function_result(p.oid) like '%duoc_moi%')
         then 'ĐẠT' else 'HỎNG — chưa dán đè bản của 11' end
  union all
  select 4, 'anon KHÔNG gọi được hàm mời',
    case when not has_function_privilege('anon',
           'public.moi_vao_cay(uuid, text, text, text)', 'execute')
         then 'ĐẠT' else 'HỎNG — anon gọi được' end
  union all
  select 5, 'Ràng buộc moi_vai đã có',
    case when exists (select 1 from pg_constraint
                       where conname='tree_members_moi_vai_hop_le')
         then 'ĐẠT' else 'HỎNG — thiếu ràng buộc' end
  union all
  select 6, 'trang_thai_cua_toi() đã biết nhánh duocmoi (0.2.0)',
    case when pg_get_functiondef(
           (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
             where n.nspname='public' and p.proname='trang_thai_cua_toi')
         ) like '%duocmoi%'
         then 'ĐẠT' else 'HỎNG — chưa dán bản 0.2.0' end
) t order by stt;
