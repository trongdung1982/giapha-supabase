-- ============================================================
-- giapha-supabase · luoc-do/15-tim-kiem.sql
-- Vai trò  : Ô TÌM/GỢI Ý cho form Mời và cho việc gắn mã người. Thêm cột
--            `ho_ten` cho tài khoản, một hàm bỏ dấu tiếng Việt, và hai hàm
--            tìm có lọc — giới hạn số dòng, gác đúng quyền, chạy ở máy chủ.
-- Phiên bản: 0.2.0 · Cập nhật: 09/09/2026 14:05 (b109b)
--            0.2.0 `ds_tai_khoan_he_thong()` thêm cột `vai_cao_nhat` — khu
--            *Toàn hệ thống* phải nói được mỗi tài khoản đang có quyền gì.
--            ⚠ ĐỔI DANH SÁCH CỘT, nên `drop function` trước là BẮT BUỘC
--            (42P13). Chủ dự án đã dán 0.1.0 lên cả hai Supabase 09/09 —
--            **phải dán lại bản này**, dán đè an toàn, không mất dữ liệu.
-- ============================================================
--
-- ⚠⚠ THỨ TỰ DÁN: file này dán SAU `13-quan-ly-thanh-vien.sql`.
--    Cả hai hàm tìm đều gác bằng `co_the_quan_tri()` bản MỚI của `13` — bản
--    neo vào cột `trees.chu_so_huu`. Dán trước `13` thì chúng gọi bản cũ (bản
--    hỏi MÃ VAI) và chủ cây sẽ không có gợi ý trong chính cây mình. Cùng
--    khuôn cảnh báo `06` → `07` → `08` → `13` → `14`.
--
-- ⚠⚠ CHIỀU NGƯỢC — file này ĐỊNH NGHĨA ĐÈ BA HÀM ĐỌC:
--       · `ds_thanh_vien()`          của `13-quan-ly-thanh-vien.sql` mục 7
--       · `ds_tai_khoan_he_thong()`  của `14-loi-moi.sql` mục 8  ⚠ THÊM CỘT
--       · `ds_cay_cua_tai_khoan()`   của `14-loi-moi.sql` mục 9
--    **Dán lại `13` thì bắt buộc dán lại `15`. Dán lại `14` cũng vậy.** Không
--    thì cột "Người được gắn" trên màn hình Thành viên quay về hiện mã người
--    thay cho tên — xem mục 4 để biết vì sao. Cùng khuôn với chiều ngược mà
--    `14` có với `11` và `10`.
--
-- ═══ VÌ SAO CÓ FILE NÀY ═══
--
-- Chủ dự án bấm thử form Mời của b108 và đo ra: ô email và ô mã người là hai
-- ô gõ tay mù. Phải nhớ đúng từng chữ của một địa chỉ email, và phải nhớ mã
-- `P0231` của một người trong cây 681 người. Không ai làm được việc ấy.
--
-- ═══ VÌ SAO KHÔNG DÙNG LẠI HAI HÀM ĐÃ CÓ ═══
--
-- Đã tra trước khi viết, và cả hai đường có sẵn đều hỏng ở một chỗ khác nhau:
--
--   · `ds_tai_khoan_he_thong()` (`14` mục 8) — CHỈ Quản trị hệ thống gọi
--     được, nên chủ cây thường sẽ không có gợi ý nào. Hạ quyền nó thì mở luôn
--     12 cột gồm cờ quyền, lần đăng nhập gần nhất, số cây làm chủ — trong khi
--     ô gợi ý chỉ cần hai chữ. Và nó KHÔNG có tham số lọc: mỗi lần gõ một chữ
--     là tải cả sổ đăng ký về trình duyệt rồi lọc tại chỗ, đúng thứ
--     `THIET-KE-QUAN-TRI.md` khu 2 đã cấm.
--
--   · `ds_tai_khoan()` (`13` mục 6) — chủ cây gọi được, nhưng nó chỉ trả tài
--     khoản ĐÃ CÓ CHÂN trong cây mình quản trị. Người mình sắp mời, theo định
--     nghĩa, chưa có chân trong cây ấy. Hàm ấy đúng cho việc gắn người, sai
--     hẳn cho việc mời.
--
-- ═══ VÌ SAO GỢI Ý EMAIL KHÔNG PHẢI LÀ MỞ SỔ ĐĂNG KÝ ═══
--
-- Hai phép đo, cùng ngày 09/09/2026:
--
--   1. `js/pages/dang-nhap.js` ghi rõ *"trang này không tự đăng ký được"* —
--      mọi tài khoản trong hệ thống đều do chủ dự án tạo tay. Sổ này là một
--      DANH BẠ do một người lập, không phải một cái chợ ai vào cũng được. Đó
--      đúng hình dạng danh bạ tổ chức mà Google Workspace, Slack, Microsoft
--      365 cho mọi thành viên tìm tự do.
--
--   2. Ai gọi được hàm này thì HÔM NAY đã có sẵn một cái máy dò email rồi:
--      `moi_vao_cay()` trả ba câu khác nhau cho *"chưa có tài khoản nào"*,
--      *"đã có tên trong gia phả rồi"*, *"đang chờ nhận lời"*. Gõ thử từng
--      email là biết. Hàm này gác bằng ĐÚNG hàng rào ấy (`co_the_quan_tri`),
--      nên nó không thêm quyền nào — nó chỉ đổi TỐC ĐỘ.
--
-- Nên chỗ phải trả giá là tốc độ, và ba chốt chặn nằm ở đó: tối thiểu 2 ký
-- tự, trả tối đa 8 dòng, và không hàm nào trả về cờ quyền hay dấu thời gian
-- đăng nhập. Nói thẳng cái còn lại: một chủ cây gõ được vài chữ và thấy email
-- của người không dính gì tới cây họ. Chủ dự án đã chốt chấp nhận, 09/09/2026.
--
-- ═══ VÌ SAO KHÔNG DÙNG `unaccent` ═══
--
-- Tìm tên tiếng Việt phải bỏ dấu được — gõ `nguyen tr` ra `Nguyễn Trọng`.
-- Extension `unaccent` làm được, nhưng nó là THÊM MỘT THƯ VIỆN, mà luật của
-- dự án bắt hỏi chủ dự án trước. Hàm `bo_dau()` ở mục 3 làm đúng chừng ấy
-- việc bằng một câu `translate()` thuần, chép đúng bảng chữ mà
-- `js/utils/text.js` đang dùng — không thêm phụ thuộc nào.
--
-- Thứ nó KHÔNG làm được: chịu lỗi gõ sai chữ thật (`hnug` → `hùng`). Cái ấy
-- cần `pg_trgm`. Chưa thêm, cố ý — danh bạ này vài chục người, và ngày nào
-- cần thì chỉ sửa bên trong hai hàm tìm, hình dạng chúng trả về không đổi.

begin;

-- ============================================================
-- 1. CỘT `ho_ten` TRÊN `tai_khoan`
-- ============================================================
-- Tới hôm nay một TÀI KHOẢN không có tên. Bảng `tai_khoan` đúng năm cột, và
-- tên người chỉ xuất hiện khi tài khoản đã được GẮN vào một người trong một
-- cây (`tree_members.person_id`).
--
-- Chỗ ấy đau đúng vào việc Mời: người sắp được mời, theo định nghĩa, chưa gắn
-- vào cây nào — nên họ chưa có tên, và ô gợi ý sẽ chỉ hiện được tám dòng
-- email na ná nhau. Cột này là thứ khiến dòng gợi ý đọc được như của phần mềm
-- lớn: `Nguyễn Văn Hùng · hungnv@gmail.com`.
--
-- ⚠ Mặc định `''` chứ không `null`: mọi chỗ đọc nó đều nối chuỗi để tìm, và
--   `null` nối vào là cả chuỗi thành `null` — dòng ấy lặng lẽ không bao giờ
--   khớp. Đúng loại hỏng không có triệu chứng.

alter table public.tai_khoan
  add column if not exists ho_ten text not null default '';

comment on column public.tai_khoan.ho_ten is
  'Họ tên người dùng tài khoản. Chủ dự án điền lúc cấp tài khoản. Chỉ để '
  'nhận mặt trong ô gợi ý — KHÔNG phải tên người trong sơ đồ gia phả.';

-- ============================================================
-- 2. dat_ho_ten_tai_khoan(p_user, p_ho_ten)
-- ============================================================
-- ⚠ VÌ SAO PHẢI CÓ HÀM, KHÔNG GHI THẲNG VÀO BẢNG: `11-quyen-he-thong.sql`
--   BẪY 4 đặt luật RLS của `tai_khoan` là `for select`, không phải `for all`,
--   vì bảng ấy giữ hai cờ quyền. Cửa duy nhất để ghi là một hàm
--   `security definer` có phép kiểm viết trong thân. Thêm một cột vô hại vào
--   bảng ấy KHÔNG được phép nới luật kia ra — đó đúng đường mà lỗ hổng b102
--   đã đi (một câu `PATCH` thẳng vào bảng là tự cấp quyền cho mình).
--
-- ⚠ CHỈ Quản trị hệ thống đặt được, kể cả tên của chính mình. Cố ý hẹp:
--   tài khoản ở app này do chủ dự án cấp, nên tên cũng do chủ dự án điền —
--   chưa có màn hình nào cho người ta tự sửa tên mình, và mở một cửa chưa có
--   màn hình đi qua là mở một cửa không ai nhìn.
--
-- ⚠ Đây KHÔNG phải cờ quyền, nên nó KHÔNG thuộc luật "không tự đặt quyền cho
--   chính mình" (`13` mục 5). Quản trị hệ thống sửa tên mình được. Ghi câu
--   này ra để lần sau không ai chép nhầm phép kiểm `la_chinh_minh()` vào đây.

create or replace function public.dat_ho_ten_tai_khoan(
  p_user   uuid,
  p_ho_ten text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_ten text := btrim(coalesce(p_ho_ten, ''));
begin
  if not public.la_quan_tri_he_thong() then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ Quản trị hệ thống mới đặt được họ tên cho tài khoản.');
  end if;

  if length(v_ten) > 100 then
    return jsonb_build_object('ok', false, 'loi',
      'Họ tên dài quá 100 ký tự.');
  end if;

  update public.tai_khoan set ho_ten = v_ten where user_id = p_user;

  if not found then
    return jsonb_build_object('ok', false, 'loi',
      'Không thấy tài khoản này. Có thể nó vừa bị xoá trên máy chủ.');
  end if;

  return jsonb_build_object('ok', true, 'hoTen', v_ten);
end;
$$;

-- ============================================================
-- 3. bo_dau(p_chuoi) — bỏ dấu tiếng Việt, không cần extension
-- ============================================================
-- Chép đúng bảng chữ của `js/utils/text.js`. `lower()` trước rồi mới thay,
-- nên bảng chỉ cần chữ thường — một nửa số ký tự, một nửa số chỗ gõ sai.
--
-- ⚠ HAI CHUỖI PHẢI DÀI BẰNG NHAU. `translate()` mà chuỗi sau ngắn hơn thì nó
--   XOÁ HẲN những ký tự thừa ở chuỗi trước, im lặng, không lỗi. Nên chúng
--   được viết thành từng cụm nối bằng `||`, mỗi cụm một nguyên âm — đếm được
--   bằng mắt. Và phép kiểm 3 ở bảng tự kiểm cuối file đo lại bằng một cái tên
--   thật, chứ không đo bằng độ dài.
--
-- ⚠ `immutable`: cùng đầu vào luôn ra cùng kết quả, không đọc bảng nào. Nhờ
--   thế Postgres gọi nó một lần cho mỗi dòng thay vì tính lại nhiều lần, và
--   ngày nào cần thì đánh chỉ mục lên nó được.

create or replace function public.bo_dau(p_chuoi text)
returns text
language sql
immutable
as $$
  select translate(
    lower(coalesce(p_chuoi, '')),
    'áàảãạ' || 'ăắằẳẵặ' || 'âấầẩẫậ'
      || 'éèẻẽẹ' || 'êếềểễệ'
      || 'íìỉĩị'
      || 'óòỏõọ' || 'ôốồổỗộ' || 'ơớờởỡợ'
      || 'úùủũụ' || 'ưứừửữự'
      || 'ýỳỷỹỵ'
      || 'đ',
    'aaaaa' || 'aaaaaa' || 'aaaaaa'
      || 'eeeee' || 'eeeeee'
      || 'iiiii'
      || 'ooooo' || 'oooooo' || 'oooooo'
      || 'uuuuu' || 'uuuuuu'
      || 'yyyyy'
      || 'd'
  );
$$;

-- ============================================================
-- 3b. ten_day_du(p_names) — ghép tên người từ mảng `names`
-- ============================================================
-- ⚠⚠ ĐÂY LÀ MỘT LỖI ĐANG CHẠY, ĐO ĐƯỢC 09/09/2026 TRÊN BÀN THỬ.
--
-- `ds_thanh_vien()` (`13` mục 7) và `ds_cay_cua_tai_khoan()` (`14` mục 9) đều
-- lấy tên người bằng `coalesce(p.vn->>'name', p.id, '')`. Đo trên 740 bản ghi
-- thật của bàn thử: **`vn->>'name'` là null ở CẢ 740 dòng.** Cột `vn` giữ thứ
-- khác — `{"gio": "30/05", "generation": 6}`. Tên thật nằm ở mảng `names`:
--
--     [{"type":"chinh","surname":"Nguyễn","middle":"Phúc","given":"Hiền"}]
--
-- Nên hai hàm ấy luôn rơi xuống nhánh `p.id`, và cột *"Người được gắn (mã +
-- tên)"* của màn hình Thành viên **chưa bao giờ hiện được một cái tên nào** —
-- nó hiện mã, rồi `khu-thanh-vien.js` thấy tên trùng mã nên giấu luôn đi.
-- Không ai báo lỗi vì màn hình trông vẫn "đúng", chỉ thiếu.
--
-- Hàm này chép đúng luật của `js/utils/text.js` hàm `fullName()`:
--   · lấy mục `type = 'chinh'`; không có thì lấy mục đầu tiên
--   · ghép `surname → middle → given`, phần nào trống thì bỏ hẳn
--
-- ⚠ `jsonb_typeof` canh cửa: `jsonb_array_elements()` ném lỗi nếu gặp một
--   object thay vì mảng, và một dòng dữ liệu méo sẽ làm CẢ câu truy vấn chết
--   chứ không phải chỉ dòng ấy.

create or replace function public.ten_day_du(p_names jsonb)
returns text
language sql
immutable
as $$
  select coalesce(
    btrim(concat_ws(' ',
      nullif(btrim(coalesce(m->>'surname', '')), ''),
      nullif(btrim(coalesce(m->>'middle',  '')), ''),
      nullif(btrim(coalesce(m->>'given',   '')), ''))),
    '')
    from (
      select coalesce(
        (select e from jsonb_array_elements(ds.mang) e
          where e->>'type' = 'chinh' limit 1),
        (select e from jsonb_array_elements(ds.mang) e limit 1)
      ) as m
        from (select case when jsonb_typeof(p_names) = 'array'
                          then p_names else '[]'::jsonb end as mang) ds
    ) t;
$$;

-- ============================================================
-- 4. tim_tai_khoan(p_tree, p_chuoi) — gợi ý cho ô EMAIL của form Mời
-- ============================================================
-- ⚠ GÁC BẰNG ĐÚNG HÀNG RÀO CỦA NÚT NÓ PHỤC VỤ. `moi_vao_cay()` mở đầu bằng
--   `if not co_the_quan_tri(p_tree)`; hàm này hỏi y câu ấy. Gác lỏng hơn là
--   cho người không mời được đi dò danh bạ; gác chặt hơn là chủ cây thấy ô
--   gợi ý trống trong chính cây mình mà không hiểu vì sao.
--
-- ⚠ KHÔNG DÙNG `like` MỘT CHỖ NÀO, và đó không phải chuyện thẩm mỹ: chuỗi
--   người ta gõ đi thẳng vào mẫu khớp, mà `%` với `_` là ký tự đại diện của
--   `like`. Gõ đúng một chữ `%` là lấy về tám dòng đầu của cả danh bạ, không
--   cần biết gì thêm. `position()` không có ký tự đại diện nào để lợi dụng,
--   nên chuyện ấy không tồn tại thay vì phải nhớ thoát chuỗi cho đúng.
--
-- Khớp theo TỪNG CHỮ, không theo cả câu: chuỗi gõ vào tách ra bằng khoảng
-- trắng, mọi chữ đều phải có mặt trong (họ tên + email). Nhờ thế `hung nguyen`
-- và `nguyen hung` đều ra cùng một người — cách người ta gõ thật.
--
-- Xếp hạng chép của phần mềm lớn: trùng khít trước, rồi khớp ĐẦU chuỗi, rồi
-- khớp giữa chuỗi.
--
-- ⚠ `person_id` / `ten_nguoi` chỉ lấy trong CHÍNH `p_tree`. Người này có thể
--   đang gắn vào một người ở cây khác, và nói ra là để lộ nội dung cây ấy cho
--   người không quản trị nó. Cây nào hỏi thì trả lời về cây ấy.

drop function if exists public.tim_tai_khoan(uuid, text);

create or replace function public.tim_tai_khoan(p_tree uuid, p_chuoi text)
returns table (
  user_id    uuid,
  email      text,
  ho_ten     text,
  ma_ngan    text,
  person_id  text,
  ten_nguoi  text,
  trang_thai text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with tim as (
    select public.bo_dau(btrim(coalesce(p_chuoi, ''))) as chuoi
  ),
  tach as (
    select chuoi,
           regexp_split_to_array(chuoi, '\s+') as tu
      from tim
  )
  select tk.user_id,
         u.email::text,
         tk.ho_ten,
         tk.ma_ngan,
         tm.person_id,
         coalesce(nullif(public.ten_day_du(p.names), ''), p.id),
         case when tk.user_id = auth.uid()   then 'chinh_minh'
              when tm.user_id is null        then 'chua'
              when tm.approved               then 'thanh_vien'
              when tm.moi_luc is not null    then 'da_moi'
              else                                'cho_duyet' end
    from public.tai_khoan tk
    join auth.users u on u.id = tk.user_id
    cross join tach
    left join public.tree_members tm
           on tm.tree_id = p_tree and tm.user_id = tk.user_id
    left join public.persons p
           on p.tree_id = p_tree and p.id = tm.person_id
   where public.co_the_quan_tri(p_tree)
     and length(tach.chuoi) >= 2
     and (
       select bool_and(
                position(w in public.bo_dau(tk.ho_ten || ' ' || u.email::text)) > 0
              )
         from unnest(tach.tu) as w
       )
   order by
     case
       when public.bo_dau(u.email::text) = tach.chuoi then 0
       when left(public.bo_dau(u.email::text), length(tach.chuoi)) = tach.chuoi then 1
       when left(public.bo_dau(tk.ho_ten),     length(tach.chuoi)) = tach.chuoi then 1
       else 2
     end,
     coalesce(nullif(tk.ho_ten, ''), u.email::text)
   limit 8;
$$;

-- ============================================================
-- 5. tim_nguoi_trong_cay(p_tree, p_chuoi) — gợi ý cho ô MÃ NGƯỜI
-- ============================================================
-- ⚠ KHU NÀY KHÔNG PHÁ RANH GIỚI `THIET-KE-QUAN-TRI.md` MỤC 1 — *"QuanTri.html
--   cố ý KHÔNG nạp cây gia phả"*. Hàm trả tối đa 10 dòng, mỗi dòng bốn chữ.
--   Nó KHÔNG nạp 681 người về trình duyệt rồi lọc tại chỗ; nó lọc ở máy chủ
--   và trả về đúng thứ đủ để nhận mặt một người.
--
-- Khuôn dòng chép của phần mềm gia phả (Ancestry · MyHeritage · Gramps):
-- **tên, năm sinh–mất trong ngoặc, mã đứng cuối như một cái nhãn**. Gia phả
-- nào cũng đầy người trùng tên, và năm sinh là thứ tách họ ra.
--
-- ⚠ `gan_cho_email` phải có: gắn nhầm mã người là đổi thẳng `pham_vi_sua()`,
--   tức mở quyền sửa cho cả một nhánh. Dòng nào đã gắn cho người khác thì nói
--   ra ngay trong lúc chọn, đừng để bấm xong mới biết.
--
-- ⚠ Năm sinh đọc `iso` trước, rớt xuống thì bốc bốn chữ số đầu tiên gặp trong
--   `raw`. Không tự suy đoán rồi ghi đè `raw` — luật dữ liệu của dự án. Đây
--   chỉ là ĐỌC để hiện lên màn hình, không có câu `update` nào.

drop function if exists public.tim_nguoi_trong_cay(uuid, text);

create or replace function public.tim_nguoi_trong_cay(p_tree uuid, p_chuoi text)
returns table (
  id            text,
  ten           text,
  nam_sinh      text,
  nam_mat       text,
  gioi          text,
  gan_cho_email text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with tim as (
    select public.bo_dau(btrim(coalesce(p_chuoi, ''))) as chuoi
  ),
  tach as (
    select chuoi,
           regexp_split_to_array(chuoi, '\s+') as tu
      from tim
  )
  select p.id,
         coalesce(nullif(public.ten_day_du(p.names), ''), p.id),
         coalesce(
           left(nullif(p.birth->>'iso', ''), 4),
           substring(coalesce(p.birth->>'raw', '') from '\d{4}'),
           ''
         ),
         coalesce(
           left(nullif(p.death->>'iso', ''), 4),
           substring(coalesce(p.death->>'raw', '') from '\d{4}'),
           ''
         ),
         p.sex,
         coalesce(tm.email, '')
    from public.persons p
    cross join tach
    left join public.tree_members tm
           on tm.tree_id = p.tree_id and tm.person_id = p.id
   where p.tree_id = p_tree
     and not p.deleted
     and public.co_the_quan_tri(p_tree)
     and length(tach.chuoi) >= 2
     and (
       select bool_and(
                position(w in public.bo_dau(
                  public.ten_day_du(p.names) || ' ' || p.id
                )) > 0
              )
         from unnest(tach.tu) as w
       )
   order by
     case
       when lower(p.id) = tach.chuoi then 0
       when left(public.bo_dau(public.ten_day_du(p.names)),
                 length(tach.chuoi)) = tach.chuoi then 1
       else 2
     end,
     coalesce(nullif(public.ten_day_du(p.names), ''), p.id)
   limit 10;
$$;

-- ============================================================
-- 5b. DÁN ĐÈ HAI HÀM ĐỌC CŨ — để màn hình Thành viên hiện được TÊN
-- ============================================================
-- Lý do đầy đủ ở mục 3b. Ở đây chỉ đổi ĐÚNG MỘT biểu thức trong mỗi hàm:
-- `coalesce(p.vn->>'name', p.id, '')` → `coalesce(nullif(ten_day_du(p.names),
-- ''), p.id, '')`. Danh sách cột, hàng rào, thứ tự sắp xếp giữ nguyên từng
-- chữ, chép từ `13` mục 7 và `14` mục 9.
--
-- ⚠ `drop function` trước vì cả hai trả BẢNG — bài học 42P13 mà
--   `ds_thanh_vien()` đã trả giá sáng 08/09/2026: `create or replace` không
--   đổi được danh sách cột, và lần dán vấp giữa file để lại một máy chủ nửa
--   vời. Ở đây danh sách không đổi, nhưng `drop` trước là thói quen rẻ.
--
-- ⚠⚠ ĐÂY LÀ CHỖ SINH RA RÀNG BUỘC "dán lại `13`/`14` thì phải dán lại `15`"
--    ghi ở đầu file. Đừng gỡ hai khối này ra mà không gỡ cả cảnh báo ấy.

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
         coalesce(nullif(public.ten_day_du(p.names), ''), p.id, ''),
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

-- ------------------------------------------------------------
-- ds_tai_khoan_he_thong() — thêm cột `ho_ten`
-- ------------------------------------------------------------
-- ⚠ ĐÂY LÀ HÀM DUY NHẤT TRONG FILE NÀY THẬT SỰ ĐỔI DANH SÁCH CỘT, nên `drop`
--   trước KHÔNG phải thói quen mà là bắt buộc: `create or replace` gặp danh
--   sách cột khác sẽ ném `42P13 cannot change return type of existing
--   function`, và lần dán vấp ở giữa file để lại một máy chủ nửa vời — đúng
--   chuyện đã xảy ra sáng 08/09/2026.
--
-- Cột mới đứng NGAY SAU `email`, chỗ người đọc mong thấy tên. Mọi thứ khác
-- chép nguyên từ `14` mục 8, kể cả `where public.la_quan_tri_he_thong()`
-- nằm trong câu truy vấn.

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
         --   trả lời đầy đủ. Quyền ở app này gắn với TỪNG cây: cùng một người
         --   có thể là chủ cây A và chỉ xem được cây B. Cột này nói *"cao nhất
         --   người ấy đang có ở đâu đó"*, và màn hình phải mở được bảng chi
         --   tiết theo từng cây ngay từ nó — nếu không thì nó đang nói một nửa
         --   sự thật mà trông như cả sự thật.
         --
         -- ⚠ `chu_cay` KHÔNG phải một mã vai trong `tree_members` — ràng buộc
         --   bảng ấy chỉ nhận `quan_tri · sua · xem · sao_luu` (b105). Chủ cây
         --   là cột `trees.chu_so_huu`, nên nó phải hỏi riêng, và nó đứng trên
         --   `quan_tri`: quản trị gia phả sửa và duyệt nội dung, chủ cây mới
         --   đổi được quyền.
         --
         -- ⚠ Chỉ tính chân THẬT (`approved`). Đơn đang chờ và lời mời chưa
         --   nhận không phải quyền — chúng đã có chỗ riêng ở `so_cho`/`so_moi`.
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
         u.created_at,
         u.last_sign_in_at,
         (u.email_confirmed_at is not null)
    from auth.users u
    left join public.tai_khoan tk on tk.user_id = u.id
   where public.la_quan_tri_he_thong()
   order by u.created_at;
$$;

drop function if exists public.ds_cay_cua_tai_khoan(uuid);

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
         coalesce(nullif(public.ten_day_du(p.names), ''), p.id, ''),
         tm.tin_cay,
         coalesce(t.chu_so_huu = tm.user_id, false),
         tm.added_at
    from public.tree_members tm
    join public.trees t on t.id = tm.tree_id
    left join public.persons p
           on p.tree_id = tm.tree_id and p.id = tm.person_id
   where tm.user_id = p_user
     and public.la_quan_tri_he_thong()
   order by t.name;
$$;

-- ============================================================
-- 6. QUYỀN GỌI
-- ============================================================
-- ⚠ `revoke … from public, anon` trước mỗi `grant`, đúng khuôn `07` mục 8 và
--   `14` mục 11: mặc định của Postgres là MỌI vai gọi được, kể cả `anon` —
--   người chưa đăng nhập. Quên dòng này là mở cửa cho cả internet gọi một hàm
--   `security definer`.
--
-- `bo_dau()` cấp cho cả `anon`: nó không đọc bảng nào, không có gì để lộ, và
-- màn hình đăng nhập cũng có thể cần nó sau này.

revoke all on function public.dat_ho_ten_tai_khoan(uuid, text) from public, anon;
revoke all on function public.tim_tai_khoan(uuid, text)        from public, anon;
revoke all on function public.tim_nguoi_trong_cay(uuid, text)  from public, anon;

grant execute on function public.dat_ho_ten_tai_khoan(uuid, text) to authenticated;
grant execute on function public.tim_tai_khoan(uuid, text)        to authenticated;
grant execute on function public.tim_nguoi_trong_cay(uuid, text)  to authenticated;
grant execute on function public.bo_dau(text)                     to anon, authenticated;

commit;

-- ============================================================
-- 7. BẢNG TỰ KIỂM — đọc sau khi dán
-- ============================================================
-- ⚠ Bảng này hỏi *"thứ này có tồn tại và có đúng hình dạng không"*. Nó KHÔNG
--   hỏi *"hàng rào có chặn được không"* — câu ấy chỉ phép đo mượn danh nghĩa
--   tài khoản mới trả lời được: `kiem-thu/ban-thu-sql/do-b109b.mjs`, ngoài
--   repo. Ngày 07/09/2026 một bảng tự kiểm 12/12 ĐẠT đã cho qua hai lỗ hổng
--   thật. Đọc bảng này với đúng chừng ấy lòng tin.
--
-- Phép 3 là phép đáng giá nhất ở đây: nó đo `bo_dau()` bằng một cái tên thật
-- thay vì đếm độ dài hai chuỗi. Hai chuỗi lệch nhau một ký tự thì
-- `translate()` xoá chữ đi mà không báo gì.

select ten_kiem as "Kiểm", ket_qua as "Kết quả"
from (

  select 1 as stt, 'Cột ho_ten đã có trên tai_khoan' as ten_kiem,
    case when exists (select 1 from information_schema.columns
                       where table_schema = 'public' and table_name = 'tai_khoan'
                         and column_name = 'ho_ten')
         then 'ĐẠT' else 'HỎNG — thiếu cột' end as ket_qua

  union all
  select 2, 'Năm hàm mới đã có',
    case when (select count(*) from pg_proc p
                 join pg_namespace n on n.oid = p.pronamespace
                where n.nspname = 'public'
                  and p.proname in ('bo_dau', 'ten_day_du', 'tim_tai_khoan',
                                    'tim_nguoi_trong_cay',
                                    'dat_ho_ten_tai_khoan')) = 5
         then 'ĐẠT' else 'HỎNG — thiếu hàm' end

  union all
  select 3, 'bo_dau() bỏ đúng dấu tiếng Việt',
    case when public.bo_dau('Nguyễn Trọng Bác Đỗ Thị Ửu')
              = 'nguyen trong bac do thi uu'
         then 'ĐẠT'
         else 'HỎNG — ra: ' || public.bo_dau('Nguyễn Trọng Bác Đỗ Thị Ửu') end

  union all
  select 4, 'anon KHÔNG gọi được hai hàm tìm',
    case when not has_function_privilege('anon',
                    'public.tim_tai_khoan(uuid, text)', 'execute')
          and not has_function_privilege('anon',
                    'public.tim_nguoi_trong_cay(uuid, text)', 'execute')
         then 'ĐẠT' else 'HỎNG — anon gọi được' end

  union all
  select 5, 'Hai hàm tìm đều hỏi co_the_quan_tri()',
    case when (select count(*) from pg_proc p
                 join pg_namespace n on n.oid = p.pronamespace
                where n.nspname = 'public'
                  and p.proname in ('tim_tai_khoan', 'tim_nguoi_trong_cay')
                  and p.prosrc ilike '%co_the_quan_tri%') = 2
         then 'ĐẠT' else 'HỎNG — có hàm không gác' end

  union all
  select 6, 'Hai hàm tìm đều có trần số dòng',
    case when (select count(*) from pg_proc p
                 join pg_namespace n on n.oid = p.pronamespace
                where n.nspname = 'public'
                  and p.proname in ('tim_tai_khoan', 'tim_nguoi_trong_cay')
                  and p.prosrc ilike '%limit%') = 2
         then 'ĐẠT' else 'HỎNG — có hàm trả không giới hạn' end

  union all
  select 7, 'Luật RLS của tai_khoan vẫn là for select',
    case when (select count(*) from pg_policies
                where schemaname = 'public' and tablename = 'tai_khoan'
                  and cmd <> 'SELECT') = 0
         then 'ĐẠT' else 'HỎNG — có luật ghi thẳng vào bảng cờ quyền' end

  union all
  select 8, 'dat_ho_ten_tai_khoan() hỏi la_quan_tri_he_thong()',
    case when (select p.prosrc from pg_proc p
                 join pg_namespace n on n.oid = p.pronamespace
                where n.nspname = 'public'
                  and p.proname = 'dat_ho_ten_tai_khoan')
              ilike '%la_quan_tri_he_thong%'
         then 'ĐẠT' else 'HỎNG — không gác' end

  union all
  select 9, 'ten_day_du() ghép đúng tên từ mảng names',
    case when public.ten_day_du(
                 '[{"type":"chinh","surname":"Nguyễn","middle":"Phúc",
                    "given":"Hiền"}]'::jsonb) = 'Nguyễn Phúc Hiền'
         then 'ĐẠT'
         else 'HỎNG — ra: ' || public.ten_day_du(
                '[{"type":"chinh","surname":"Nguyễn","middle":"Phúc",
                   "given":"Hiền"}]'::jsonb) end

  union all
  select 10, 'Hai hàm đọc cũ đã thôi hỏi vn->>''name''',
    case when (select count(*) from pg_proc p
                 join pg_namespace n on n.oid = p.pronamespace
                where n.nspname = 'public'
                  and p.proname in ('ds_thanh_vien', 'ds_cay_cua_tai_khoan')
                  and p.prosrc ilike '%ten_day_du%') = 2
         then 'ĐẠT' else 'HỎNG — chưa dán đè, cột tên vẫn hiện mã người' end

  union all
  select 13, 'ds_tai_khoan_he_thong() đã có cột vai_cao_nhat',
    case when exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'ds_tai_khoan_he_thong'
         and pg_get_function_result(p.oid) like '%vai_cao_nhat%')
         then 'ĐẠT' else 'HỎNG — chưa dán bản 0.2.0' end

  union all
  select 12, 'ds_tai_khoan_he_thong() đã có cột ho_ten',
    case when exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'ds_tai_khoan_he_thong'
         and pg_get_function_result(p.oid) like '%ho_ten%')
         then 'ĐẠT' else 'HỎNG — chưa dán đè bản của 14' end

  union all
  select 11, 'Người thật trong cây có tên đọc được',
    coalesce((select case when public.ten_day_du(p.names) <> ''
                          then 'ĐẠT' else 'HỎNG — ghép ra chuỗi rỗng' end
                from public.persons p
               where jsonb_array_length(p.names) > 0 limit 1),
             'ĐẠT (chưa có dữ liệu để đo)')

) t order by stt;
