-- ============================================================
-- giapha-supabase · luoc-do/07-duyet-dang-ky.sql
-- Vai trò  : Đăng ký tài khoản phải XẾP HÀNG CHỜ, admin duyệt mới vào được.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU 06-quyen-truc-he.sql.
-- Phiên bản: 0.1.1 · Cập nhật: 04/09/2026 22:45 — đổi mã vai sang `quan_tri_he_thong`
-- ============================================================
--
-- ═══ 0. FILE NÀY ĐỔI MỘT ĐIỀU LỚN — ĐỌC TRƯỚC KHI DÁN ═══
--
-- Trước file này: **có tên trong `tree_members` là đọc được cả gia phả.**
-- Cột `approved` (b93) chỉ gác quyền SỬA.
--
-- Sau file này: **`approved` gác cả quyền ĐỌC.** Người vừa nộp đơn có dòng
-- trong bảng nhưng chưa duyệt thì không đọc được một chữ nào — nếu không,
-- "xếp hàng chờ" chẳng chặn gì cả, ai đăng ký cũng xem được cả họ ngay.
--
-- ⚠ Nghĩa là mục 2 bên dưới **bắt buộc phải chạy**: nó bật `approved` cho
--   những dòng đã có từ trước. Thiếu nó là chính chủ dự án bị khoá ngoài app
--   của mình. Cả file nằm trong một giao dịch nên không có chuyện chạy nửa
--   chừng — nhưng đừng cắt riêng từng khối ra chạy.
--
-- ═══ 1. LUẬT, THEO LỜI CHỦ DỰ ÁN 04/09/2026 ═══
--
--   "việc tạo tài khoản không được phép tràn lan, phải kiểm soát chặt.
--    cơ chế => đăng ký tài khoản => xếp hàng chờ, đợi admin vào duyệt
--    mới tạo tài khoản thành công."
--
-- Bốn trạng thái một người có thể đang ở, và app phải nói đúng câu cho mỗi:
--
--   chưa đăng nhập            → màn hình đăng nhập
--   đăng nhập, CHƯA nộp đơn   → nút "Xin vào gia phả"
--   đã nộp đơn, chờ duyệt     → "Đơn của bạn đang chờ duyệt, gửi lúc …"
--   đã duyệt                  → mở sơ đồ
--
-- ⚠ **Tài khoản Supabase vẫn tự đăng ký được** (`disable_signup` để nguyên).
--   Đó là chủ ý: chủ dự án nói *"đăng ký → xếp hàng"*, tức có bước đăng ký.
--   Cái được kiểm soát chặt là **chỗ đứng trong gia phả**, không phải chỗ
--   đứng trong `auth.users`. Người lạ đăng ký xong vẫn không thấy gì —
--   phép thử H9 hàng rào 1 (b94) đã đo: 0 dòng trên cả tám bảng.

-- ============================================================
-- 2. BẬT `approved` CHO NHỮNG DÒNG ĐÃ CÓ
-- ============================================================
-- Phải chạy TRƯỚC khi `la_thanh_vien()` đổi nghĩa ở mục 3. Không thì giữa hai
-- lệnh ấy chủ dự án mất quyền đọc chính gia phả của mình.
--
-- ⚠ Điều kiện `xin_luc is null` là cái chốt an toàn: mọi dòng có từ trước file
--   này đều chưa có ngày nộp đơn, còn đơn xin thì luôn có. Nhờ vậy dán lại
--   file này lần thứ hai KHÔNG duyệt bừa những đơn đang xếp hàng.
--
--   Cái giá: một dòng admin thêm tay bằng `insert` (không qua đơn) mà cố ý để
--   `approved = false` sẽ bị lệnh này bật lên nếu file chạy lại. Hiếm, và đổi
--   lại là không bao giờ duyệt nhầm một đơn thật.

alter table public.tree_members
  add column if not exists xin_luc  timestamptz,
  add column if not exists loi_nhan text not null default '';

comment on column public.tree_members.xin_luc is
  'Lúc người này tự nộp đơn xin vào. null = được thêm tay, không qua hàng chờ.';
comment on column public.tree_members.loi_nhan is
  'Người nộp đơn tự giới thiệu. Admin đọc để biết đây là ai trong họ.';

update public.tree_members
   set approved = true
 where approved = false
   and xin_luc is null;

-- ============================================================
-- 3. `approved` TỪ NAY GÁC CẢ QUYỀN ĐỌC
-- ============================================================
-- Mọi policy đọc của `02-rls.sql` đều đi qua hàm này, nên sửa đúng một chỗ là
-- đủ — đó là cả lý do b87 gom câu hỏi "người này có chân trong cây không" vào
-- một hàm thay vì chép điều kiện ra chín policy.
--
-- ⚠ Ba vai đi tắt, và phải đi tắt:
--   • `quan_tri_he_thong`     — người dựng cây. Khoá chủ ra ngoài nhà mình là hỏng kiểu tệ
--                 nhất: không ai còn quyền mở khoá cho ai nữa.
--   • `quan_tri`   — chủ dự án cấp tay, không qua hàng chờ bao giờ.
--   • `sao_luu` — tài khoản máy chạy hằng đêm (`05-sao-luu.sql`). Nó không có
--                 người ngồi sau để bấm nút, nên không bao giờ được rơi vào
--                 trạng thái chờ. Quên vai này là sao lưu **thất bại im lặng**
--                 — đúng kiểu hỏng b94 đã ghi.

create or replace function public.la_thanh_vien(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.tree_members
     where tree_id = p_tree
       and user_id = auth.uid()
       and (approved or role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu'))
  );
$$;

-- ============================================================
-- 4. NỘP ĐƠN
-- ============================================================
-- Người mới KHÔNG tự `insert` vào `tree_members` được — Row Level Security
-- chặn, và phép thử H9 đã đo chính đòn ấy (`403`). Nên phải có một cửa hẹp
-- `security definer` làm hộ đúng một việc, với vai và cờ **đóng cứng trong
-- thân hàm**: `role = 'xem'`, `approved = false`. Người gọi không chọn được
-- vai của mình — đó là điểm khác nhau giữa một cửa và một lỗ hổng.
--
-- ⚠ `p_tree` cho phép bỏ trống: người chưa được duyệt **không đọc được bảng
--   `trees`**, nên họ không có cách nào biết mã cây để mà truyền vào. Bỏ
--   trống thì hàm tự lấy cây duy nhất. Có từ hai cây trở lên thì nó từ chối
--   thay vì đoán — ngày ấy tới thì phải có màn hình chọn, và cái từ chối này
--   chính là thứ nhắc rằng chưa có.
--
-- ⚠ `on conflict do nothing`: bấm mười lần vẫn một đơn. Và nếu người ấy đã là
--   thành viên thật rồi thì hàm KHÔNG hạ vai họ xuống `xem` — cái bẫy ấy có
--   thật nếu viết `do update`.

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
      'Có nhiều gia phả trên máy chủ này, phải nói rõ xin vào cây nào.');
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
-- 5. TÔI ĐANG Ở TRẠNG THÁI NÀO
-- ============================================================
-- Màn hình từ chối phải nói đúng một trong hai câu — *"bấm nút để xin vào"*
-- hay *"đơn của bạn đang chờ"* — mà chính người ấy lại **không đọc được**
-- dòng của mình trong `tree_members` (mục 3 vừa khoá). Nên câu trả lời phải
-- đi qua một hàm `security definer` chỉ nói về **chính người gọi**.
--
-- Trả `chuadangnhap` / `chuanop` / `cho` / `daduyet`. Bốn giá trị ấy ánh xạ
-- thẳng sang bốn màn hình ở mục 1.

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
begin
  if auth.uid() is null then
    return jsonb_build_object('trangThai', 'chuadangnhap');
  end if;

  v_tree := coalesce(p_tree, (select id from public.trees limit 1));

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

-- ============================================================
-- 6. HÀNG CHỜ — admin nhìn thấy gì
-- ============================================================
-- ⚠ Phép kiểm quyền nằm TRONG mệnh đề `where`, không phải một câu `if` đứng
--   trước. Với hàm `sql` trả bảng thì đó là cách gọn nhất, và nó **không dính
--   cái bẫy `null`** mà b94 vừa vá: người ngoài cây có `vai_tro()` trả `null`,
--   `coalesce` biến thành chuỗi rỗng, không khớp `in (…)`, nên bảng trả về
--   rỗng. Không có nhánh nào để rơi lọt qua.

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
     and coalesce(
           public.vai_tro(coalesce(p_tree, (select id from public.trees limit 1))),
           '') in ('quan_tri_he_thong', 'quan_tri')
   order by tm.xin_luc nulls last, tm.email;
$$;

-- ============================================================
-- 7. TỪ CHỐI MỘT ĐƠN
-- ============================================================
-- Duyệt thì đã có `duyet_thanh_vien()` từ b93. Thiếu vế còn lại: gạt đi.
--
-- ⚠ `and approved = false` không phải thừa. Không có nó thì một lần gõ nhầm
--   email sẽ **xoá một thành viên thật** khỏi gia phả, và người ấy mất luôn
--   mã người đang gắn. Hàm này chỉ được phép đụng vào những đơn đang xếp hàng.

create or replace function public.tu_choi_thanh_vien(p_tree uuid, p_email text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare n integer;
begin
  if coalesce(public.vai_tro(p_tree), '') not in ('quan_tri_he_thong', 'quan_tri') then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ quản trị hệ thống hoặc quản trị viên mới từ chối được đơn.');
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

-- ============================================================
-- 8. AI GỌI ĐƯỢC GÌ
-- ============================================================
-- `anon` là bất kỳ ai mở trang, kể cả chưa đăng nhập. Bốn hàm dưới đều tự
-- kiểm người gọi trong thân, nhưng đóng sẵn cửa vẫn hơn tin vào một phép kiểm
-- — cùng lý lẽ với `05-sao-luu.sql` mục cuối.

revoke all on function public.xin_vao_cay(uuid, text)          from public, anon;
revoke all on function public.trang_thai_cua_toi(uuid)         from public, anon;
revoke all on function public.ds_cho_duyet(uuid)               from public, anon;
revoke all on function public.tu_choi_thanh_vien(uuid, text)   from public, anon;

grant execute on function public.xin_vao_cay(uuid, text)        to authenticated;
grant execute on function public.trang_thai_cua_toi(uuid)       to authenticated;
grant execute on function public.ds_cho_duyet(uuid)             to authenticated;
grant execute on function public.tu_choi_thanh_vien(uuid, text) to authenticated;

-- ============================================================
-- 9. TỰ KIỂM — chạy xong nhìn bảng này
-- ============================================================
-- Dòng quan trọng nhất là dòng cuối: **không còn ai đang bị khoá ngoài oan.**
-- Nếu nó ra khác 0 thì có người vừa mất quyền đọc vì mục 2 không bắt được họ.

select 'cot xin_luc va loi_nhan' as muc,
       (select count(*) from information_schema.columns
         where table_schema = 'public' and table_name = 'tree_members'
           and column_name in ('xin_luc', 'loi_nhan'))::text as gia_tri,
       '2' as mong_doi
union all
select 'la_thanh_vien da doi approved',
       (select case when prosrc ilike '%approved%' then 'co' else 'CHUA' end
          from pg_proc where proname = 'la_thanh_vien'
           and pronamespace = 'public'::regnamespace),
       'co'
union all
select 'bon ham moi co mat',
       (select count(*)::text from pg_proc
         where pronamespace = 'public'::regnamespace
           and proname in ('xin_vao_cay', 'trang_thai_cua_toi',
                           'ds_cho_duyet', 'tu_choi_thanh_vien')),
       '4'
union all
select 'thanh vien cu bi khoa ngoai oan',
       (select count(*)::text from public.tree_members
         where approved = false and xin_luc is null
           and role not in ('quan_tri_he_thong', 'quan_tri', 'sao_luu')),
       '0';
