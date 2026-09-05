-- ============================================================
-- giapha-supabase · luoc-do/10-sua-nhieu-cay.sql
-- Vai trò  : Gỡ ba chỗ hỏng chỉ lộ ra khi máy chủ có TỪ HAI CÂY TRỞ LÊN.
-- Chạy ở   : Supabase → SQL Editor → dán → Run.
--            Chạy SAU `09-doi-ma-vai.sql`, và TRƯỚC khi nạp cây thứ hai.
-- Phiên bản: 0.1.0 · Cập nhật: 05/09/2026
-- ============================================================
--
-- ═══ VÌ SAO CÓ FILE NÀY ═══
--
-- Tới hôm nay máy chủ có ĐÚNG MỘT cây, và ba chỗ hỏng dưới đây đều **không
-- có triệu chứng nào** với một cây. Chúng ngồi im từ b87, và cái làm chúng
-- thức dậy không phải một lần sửa mã — mà là câu *"nạp luôn cây Nguyễn Phúc
-- Giáo"* của chủ dự án ngày 05/09/2026.
--
-- Đó là lý do file này chạy TRƯỚC file di dời, không phải sau. Sửa sau là sửa
-- trong lúc đang có triệu chứng, và triệu chứng của cả ba đều là loại **im
-- lặng**: không báo lỗi, chỉ trả lời sai.
--
-- Đo đầy đủ ở `KE-HOACH.md` mục *NHIỀU CÂY GIA PHẢ*.
--
-- ═══ FILE NÀY KHÔNG ĐỤNG GÌ ═══
--
-- Không đụng `luu_cay()`, không đụng `pham_vi_sua()`, không đụng một luật RLS
-- nào. Nó không đổi ai được làm gì — chỉ đổi *"hàm đang nói về CÂY NÀO"*.
-- Việc mở quyền cấp hệ thống là `11-quyen-he-thong.sql`, bước b102, và nó
-- nguy hiểm hơn hẳn file này.
--
-- ⚠ Chạy lại lần thứ hai là an toàn (`if not exists` · `create or replace`).

-- ============================================================
-- 1. HỎNG 1 — `user_settings` đang gánh HAI nghĩa mâu thuẫn
-- ============================================================
-- Bảng dựng theo khoá `(user_id, tree_id)` — tức **mỗi cây một dòng, mỗi cây
-- một người trung tâm riêng**. Đó là nghĩa đúng.
--
-- Nhưng `sb.chonGiaPha()` mượn chính bảng ấy để trả lời một câu KHÁC HẲN —
-- *"đang mở cây nào"* — và vì câu ấy chỉ có một câu trả lời cho mỗi người,
-- nó phải `delete` sạch mọi dòng rồi chèn lại đúng một dòng.
--
-- Hậu quả đo được: **đổi cây là xoá người trung tâm mặc định của MỌI cây**,
-- kể cả cây vừa chuyển sang. Với một cây thì không ai thấy, vì xoá xong lại
-- chèn đúng cây ấy.
--
-- Đường sửa là tách hai nghĩa ra, và nó rẻ: *"đang mở cây nào"* thành một CỜ
-- trên chính dòng ấy, thay vì thành *sự vắng mặt của những dòng khác*.

alter table public.user_settings
  add column if not exists dang_mo boolean not null default false;

-- ------------------------------------------------------------
-- 2. HỎNG 2 — công tắc *Hiển thị* không lưu ở đâu cả
-- ------------------------------------------------------------
-- `state.hienNgayGio` khai `false` ở `state.js:41` và không đọc/ghi
-- `user_settings`, cũng không `localStorage`. Tắt trình duyệt là mất.
--
-- Đây KHÔNG phải lỗi của nhiều cây — nó hỏng ngay với một cây, chỉ chưa ai
-- báo. Sửa kèm ở đây vì chỗ đúng của nó là cùng dòng với `focus_person_id`,
-- và **chỉ sau khi Hỏng 1 được gỡ**: đưa vào trước thì nó cũng bị `delete`
-- cuốn đi mỗi lần đổi cây.
--
-- ⚠ Đây là cài đặt **theo cây**, không phải theo người. Một người xem cây có
--   ngày giỗ đầy đủ và một cây chưa nhập ngày nào thì muốn hai lựa chọn khác
--   nhau — và bảng này vốn đã khoá theo `(user_id, tree_id)`.

alter table public.user_settings
  add column if not exists hien_ngay_gio boolean not null default false;

-- ------------------------------------------------------------
-- Đúng MỘT cây đang mở cho mỗi người — để cơ sở dữ liệu tự canh
-- ------------------------------------------------------------
-- Chỉ số một phần (`where dang_mo`) canh đúng điều cần canh mà không đụng tới
-- những dòng `dang_mo = false`. Rẻ hơn một trigger, và không có đường vòng:
-- ai ghi bằng cách nào cũng bị nó chặn.
--
-- ⚠ Đây là chỗ đắt nhất của cách sửa này, và nó có thật: hai câu `update` +
--   `insert` phải chạy ĐÚNG THỨ TỰ (tắt cờ cũ trước, bật cờ mới sau), nếu
--   không chỉ số này từ chối. Đó là lý do có `dat_cay_dang_mo()` ở mục 3 —
--   để trình duyệt không phải tự giữ thứ tự ấy qua hai vòng mạng.

create unique index if not exists user_settings_dang_mo_duy_nhat
  on public.user_settings (user_id) where dang_mo;

-- ------------------------------------------------------------
-- Di dời dữ liệu đang có
-- ------------------------------------------------------------
-- Hôm nay mỗi người có nhiều nhất MỘT dòng (vì `chonGiaPha()` xoá sạch rồi
-- chèn lại). Nhưng viết như thể có nhiều dòng, vì `datNguoiTrungTamMacDinh()`
-- đẻ thêm dòng được, và một câu di dời chỉ chạy đúng khi dữ liệu đúng như ta
-- tưởng thì không phải một câu di dời.
--
-- `distinct on` + `order by` cho ra kết quả **ổn định**, không phụ thuộc thứ
-- tự Postgres trả về — đúng cái mà Hỏng 3 dưới đây thiếu.

with mot_dong as (
  select distinct on (user_id) user_id, tree_id
    from public.user_settings
   order by user_id, tree_id
)
update public.user_settings us
   set dang_mo = true
  from mot_dong m
 where us.user_id = m.user_id
   and us.tree_id = m.tree_id
   and not exists (select 1 from public.user_settings x
                    where x.user_id = us.user_id and x.dang_mo);

-- ============================================================
-- 3. CỬA MỚI: ĐỔI CÂY ĐANG MỞ, MỘT LỜI GỌI
-- ============================================================
-- ⚠ **KHÔNG `security definer`.** Bảng `user_settings` là bảng duy nhất
--   trình duyệt được ghi thẳng, và luật `rieng_user_settings` của `02-rls.sql`
--   đang canh hai điều: dòng phải là của chính mình, và cây phải là cây mình
--   có chân trong đó (`la_thanh_vien`). Cho hàm này chạy vượt RLS là tự tay
--   gỡ hàng rào thứ hai — người ta sẽ "mở" được cây mình không có quyền.
--
--   Hàm vẫn có ích dù không vượt quyền: nó gói hai câu lệnh vào **một giao
--   dịch**, nên chỉ số duy nhất ở mục 2 không bao giờ thấy trạng thái nửa vời.

create or replace function public.dat_cay_dang_mo(p_tree uuid)
returns jsonb
language plpgsql
volatile
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'loi', 'Chưa đăng nhập.');
  end if;

  update public.user_settings
     set dang_mo = false
   where user_id = auth.uid() and dang_mo;

  insert into public.user_settings (user_id, tree_id, dang_mo)
  values (auth.uid(), p_tree, true)
      on conflict (user_id, tree_id) do update set dang_mo = true;

  return jsonb_build_object('ok', true);
end;
$$;

-- Cây đang mở của chính người gọi. `limit 1` ở đây an toàn — chỉ số duy nhất
-- ở mục 2 bảo đảm không bao giờ có dòng thứ hai để mà chọn nhầm.
create or replace function public.cay_dang_mo()
returns uuid
language sql
stable
set search_path = public, pg_temp
as $$
  select tree_id from public.user_settings
   where user_id = auth.uid() and dang_mo
   limit 1;
$$;

-- ============================================================
-- 4. HỎNG 3 — `limit 1` không có `order by`, ở tám chỗ
-- ============================================================
-- `coalesce(p_tree, (select id from public.trees limit 1))` nằm ở bốn hàm.
-- Không có `order by` thì Postgres trả cây **nào tuỳ ý** — và nó có quyền đổi
-- ý giữa hai lần gọi, vì không có gì buộc nó phải nhất quán.
--
-- Với một cây thì luôn đúng. Với nhiều cây, bốn hàm này trả lời về **một cây
-- khác cây đang mở**, và trả lời im lặng.
--
-- ⚠ **Không rò rỉ dữ liệu** — `co_the_quan_tri()` và `co_the_kiem_duyet()`
--   vẫn canh theo đúng cái cây mà hàm chọn nhầm, nên không ai thấy cây mình
--   không có quyền. Nhưng **hiện sai con số, và duyệt nhầm hàng chờ**.
--
-- ⚠ Và nó nguy hiểm hơn kể từ b102: người mang vai quản trị toàn hệ thống có
--   quyền ở MỌI cây, nên một hàm chọn nhầm cây sẽ **duyệt nhầm hàng chờ của
--   nhà khác** — mà duyệt xong thì không có gì báo là đã nhầm.
--
-- ═══ CÁCH SỬA, VÀ VÌ SAO KHÔNG PHẢI "THÊM order by" ═══
--
-- Thêm `order by created_at limit 1` thì hàm hết tuỳ tiện, nhưng vẫn **đoán**.
-- Một hàm đoán đúng 90% là hàm không ai kiểm được.
--
-- Nên bỏ hẳn phép đoán: `p_tree` thiếu thì hàm trả về **rỗng**, và nơi gọi
-- phải nói rõ nó hỏi về cây nào. `state.phien.treeId` luôn có sẵn ở trình
-- duyệt — chưa bao giờ có lý do thật để bỏ trống.
--
-- Ba hàm dưới đây vì thế **bỏ luôn `default null`**: gọi thiếu là lỗi ngay ở
-- PostgREST, chứ không phải một bảng rỗng khó hiểu ba tháng sau.

-- ------------------------------------------------------------
-- 4a. Hàng chờ ĐƠN XIN VÀO
-- ------------------------------------------------------------
-- Bản đang chạy là bản trong `08-kiem-duyet.sql` mục 12 (nó thu hẹp bản của
-- `07`). Chép nguyên thân ấy, đổi đúng chỗ chọn cây.
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
     and tm.role not in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')
     and public.co_the_quan_tri(p_tree)
   order by tm.xin_luc nulls last, tm.email;
$$;

-- ------------------------------------------------------------
-- 4b. Hàng chờ KIỂM DUYỆT NỘI DUNG
-- ------------------------------------------------------------
drop function if exists public.ds_kiem_duyet(uuid, text, integer);

create or replace function public.ds_kiem_duyet(
  p_tree       uuid,
  p_trang_thai text default 'cho',
  p_gioi_han   integer default 200
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
   where cl.tree_id = p_tree
     and (p_trang_thai is null or cl.trang_thai = p_trang_thai)
     and public.co_the_kiem_duyet(p_tree)
   order by cl.id desc
   limit coalesce(p_gioi_han, 200);
$$;

-- ------------------------------------------------------------
-- 4c. Đếm cho cái nhãn "Chờ duyệt (n)"
-- ------------------------------------------------------------
drop function if exists public.dem_cho_kiem_duyet(uuid);

create or replace function public.dem_cho_kiem_duyet(p_tree uuid)
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(*)::integer
    from public.change_log cl
   where cl.tree_id = p_tree
     and cl.trang_thai = 'cho'
     and public.co_the_kiem_duyet(p_tree);
$$;

-- ------------------------------------------------------------
-- 4d. TÔI ĐANG Ở TRẠNG THÁI NÀO — chỗ DUY NHẤT được phép không biết cây
-- ------------------------------------------------------------
-- Ba hàm trên bắt buộc phải có `p_tree`. Hàm này thì **không thể** bắt, và lý
-- do rất cụ thể: nó chạy ở màn hình từ chối, cho người **chưa được duyệt** —
-- mà từ `07-duyet-dang-ky.sql` thì người ấy **không đọc được bảng `trees`**,
-- nên họ không có cách nào biết mã cây để mà truyền vào.
--
-- Nên thay vì đoán một cây bất kỳ, hàm hỏi ba câu theo thứ tự:
--
--   1. Người gọi nói rõ cây nào chưa?           → dùng cây ấy
--   2. Người gọi có chân trong cây nào không?    → cây của chính họ,
--                                                  ưu tiên cây ĐÃ DUYỆT
--   3. Không có chân ở đâu cả, mà máy chủ có
--      đúng MỘT cây?                            → cây ấy
--   4. Còn lại                                  → `nhieucay`, và nói thật
--
-- ⚠ Câu 2 là chỗ dễ làm sai nhất, và làm sai thì hỏng nặng: người ĐÃ được
--   duyệt ở cây A mà hàm trả lời về cây B sẽ bị chính màn hình từ chối chặn
--   lại, dù họ có đủ quyền. Nên câu 2 phải đứng TRƯỚC câu 3, và trong câu 2
--   thì `approved` phải được xếp lên trước.
--
-- ⚠ `order by` ở đây không phải để cho đẹp: thiếu nó là dựng lại đúng Hỏng 3
--   ở một chỗ mới.

create or replace function public.trang_thai_cua_toi(p_tree uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_tree uuid;
  v_dong public.tree_members%rowtype;
  v_so   integer;
begin
  if auth.uid() is null then
    return jsonb_build_object('trangThai', 'chuadangnhap');
  end if;

  if p_tree is not null then
    v_tree := p_tree;
  else
    -- Cây của chính người gọi. Cây đang mở đứng trước, rồi cây đã duyệt,
    -- rồi cây vào sớm nhất — ba mức, và mức nào cũng ổn định.
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

  return jsonb_build_object(
    'trangThai', case when v_dong.approved
                        or v_dong.role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')
                      then 'daduyet' else 'cho' end,
    'treeId', v_tree,
    'vaiTro', v_dong.role,
    'xinLuc', v_dong.xin_luc);
end;
$$;

-- ------------------------------------------------------------
-- 4e. NỘP ĐƠN — thứ tự ổn định, và câu từ chối nói đúng việc phải làm
-- ------------------------------------------------------------
-- ⚠ Hàm này **giữ nguyên việc từ chối** khi máy chủ có nhiều cây mà người gọi
--   không nói rõ xin vào cây nào. Đó không phải thiếu sót — nó là chỗ nhắc
--   rằng **màn hình chọn gia phả chưa có** (b103). Bỏ cái từ chối ấy đi mà
--   chưa có màn hình là quay lại đúng kiểu đoán mà cả file này đang gỡ.
--
--   Cái sửa ở đây chỉ có hai: nơi gọi **được phép** truyền `p_tree` *(trình
--   duyệt biết cây đang mở thì nói ra)*, và câu từ chối nói rõ phải làm gì.

create or replace function public.xin_vao_cay(
  p_tree     uuid default null,
  p_loi_nhan text default ''
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_tree  uuid;
  v_email text := coalesce(auth.jwt() ->> 'email', '');
  v_dong  public.tree_members%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'loi',
      'Chưa đăng nhập nên chưa nộp đơn được.');
  end if;

  if p_tree is not null then
    v_tree := p_tree;
  elsif (select count(*) from public.trees) = 1 then
    select id into v_tree from public.trees;
  else
    return jsonb_build_object('ok', false, 'loi',
      'Máy chủ này có nhiều gia phả. Hãy mở trang Quản trị, chọn gia phả '
      || 'muốn xin vào rồi bấm Xin quyền ở đúng dòng ấy.');
  end if;

  if not exists (select 1 from public.trees where id = v_tree) then
    return jsonb_build_object('ok', false, 'loi', 'Không có gia phả này.');
  end if;

  insert into public.tree_members
         (tree_id, user_id, role, email, approved, xin_luc, loi_nhan)
  values (v_tree, auth.uid(), 'xem', v_email, false, now(),
          left(coalesce(p_loi_nhan, ''), 500))
  on conflict (tree_id, user_id) do nothing;

  select * into v_dong from public.tree_members
   where tree_id = v_tree and user_id = auth.uid();

  return jsonb_build_object(
    'ok', true,
    'trangThai', case when v_dong.approved
                        or v_dong.role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')
                      then 'daduyet' else 'cho' end,
    'xinLuc', v_dong.xin_luc,
    'email',  v_dong.email);
end;
$$;

-- ============================================================
-- 5. QUYỀN GỌI
-- ============================================================
grant execute on function public.dat_cay_dang_mo(uuid)   to authenticated;
grant execute on function public.cay_dang_mo()           to authenticated;

-- ============================================================
-- 6. BẢNG TỰ KIỂM — đọc kỹ trước khi báo là đã chạy xong
-- ============================================================
-- Mọi dòng phải ĐẠT. Một dòng LỖI là file này chưa chạy hết, đừng chạy tiếp
-- file di dời.

select 'cột dang_mo có chưa'                     as phep,
       case when exists (select 1 from information_schema.columns
                          where table_schema = 'public' and table_name = 'user_settings'
                            and column_name = 'dang_mo')
            then 'ĐẠT' else 'LỖI' end as ket_qua
union all
select 'cột hien_ngay_gio có chưa',
       case when exists (select 1 from information_schema.columns
                          where table_schema = 'public' and table_name = 'user_settings'
                            and column_name = 'hien_ngay_gio')
            then 'ĐẠT' else 'LỖI' end
union all
select 'chỉ số duy nhất cho dang_mo',
       case when exists (select 1 from pg_indexes
                          where schemaname = 'public'
                            and indexname = 'user_settings_dang_mo_duy_nhat')
            then 'ĐẠT' else 'LỖI' end
union all
select 'mỗi người nhiều nhất MỘT cây đang mở',
       case when not exists (select 1 from public.user_settings
                              where dang_mo group by user_id having count(*) > 1)
            then 'ĐẠT' else 'LỖI' end
union all
select 'không còn hàm nào đoán cây bằng `limit 1`',
       -- ⚠ `prokind = 'f'` không phải thừa: `pg_get_functiondef()` ném lỗi
       --   `"array_agg" is an aggregate function` nếu quét trúng một hàm tổng
       --   hợp, và bàn thử tại chỗ đã bắt đúng điều đó ngày 05/09/2026.
       case when (select count(*) from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace
                   where n.nspname = 'public'
                     and p.prokind = 'f'
                     and pg_get_functiondef(p.oid) like '%from public.trees limit 1%') = 0
            then 'ĐẠT' else 'LỖI' end
union all
select 'ds_cho_duyet bắt buộc có p_tree',
       case when (select pronargdefaults from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace
                   where n.nspname = 'public' and p.proname = 'ds_cho_duyet') = 0
            then 'ĐẠT' else 'LỖI' end
union all
select 'dem_cho_kiem_duyet bắt buộc có p_tree',
       case when (select pronargdefaults from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace
                   where n.nspname = 'public' and p.proname = 'dem_cho_kiem_duyet') = 0
            then 'ĐẠT' else 'LỖI' end
union all
select 'ds_kiem_duyet còn đúng 2 tham số có sẵn giá trị',
       case when (select pronargdefaults from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace
                   where n.nspname = 'public' and p.proname = 'ds_kiem_duyet') = 2
            then 'ĐẠT' else 'LỖI' end
union all
select 'hàm dat_cay_dang_mo KHÔNG chạy vượt quyền',
       case when (select prosecdef from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace
                   where n.nspname = 'public' and p.proname = 'dat_cay_dang_mo') = false
            then 'ĐẠT' else 'LỖI' end;
