-- ============================================================
-- giapha-supabase · luoc-do/06-quyen-truc-he.sql
-- Vai trò  : Luật SỬA theo TRỰC HỆ. Thay hẳn ý tưởng "chia chi/nhánh".
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU 05-sao-luu.sql.
-- ⚠ Chạy xong PHẢI dán lại 03-ham-luu-cay.sql — xem mục 0 ngay dưới.
-- Phiên bản: 0.1.3 · Cập nhật: 04/09/2026 22:45 — đổi mã vai sang `quan_tri_he_thong`
-- ============================================================
--
-- ═══ 0. HAI FILE, KHÔNG PHẢI MỘT — ĐỌC TRƯỚC KHI DÁN ═══
--
-- File này đổi Ý NGHĨA của `co_the_sua_nguoi()`: tham số thứ hai xưa là mã
-- NHÁNH, nay là mã NGƯỜI. Chữ ký `(uuid, text)` không đổi, nên bản
-- `luu_cay()` cũ vẫn gọi được — nhưng nó truyền `branch_id`, mà `branch_id`
-- của mọi người đều `null`. Kết quả: **không ai lưu được gì.**
--
-- Điều đó là CỐ Ý và là hướng an toàn: hỏng thì hỏng đằng cấm, không hỏng
-- đằng cho qua, và hỏng to đến mức không thể không nhận ra. Nhưng nghĩa là:
--
--     dán 06 xong → dán lại 03-ham-luu-cay.sql → mới dùng được.
--
-- ═══ 1. LUẬT, VÀ VÌ SAO ĐÚNG LUẬT NÀY ═══
--
-- Chủ dự án chốt 04/09/2026:
--
--   Tài khoản muốn sửa phải GẮN với một mã người trong gia phả, và phải được
--   ADMIN DUYỆT. Duyệt rồi thì sửa được TRỰC HỆ của người ấy:
--     • đi LÊN  — chỉ đường trực hệ: bố mẹ, ông bà, cụ, kỵ…
--                 KHÔNG rẽ ngang sang bác, chú, cô, dì.
--     • đi XUỐNG — toàn bộ con cháu, không giới hạn đời.
--     • cộng    — vợ/chồng của những người trong hai tập trên (sửa và thêm).
--   Chưa gắn mã, hoặc chưa được duyệt → CHỈ XEM.
--   Vai quản trị viên gắn được cho NHIỀU tài khoản.
--
-- Trước khi chốt đã đo trên cây thật Nguyễn Phúc 681 người. Ba con số giải
-- thích vì sao KHÔNG chọn mấy phương án nghe hợp lý hơn:
--
--   • "Cùng huyết thống" hiểu đầy đủ (mọi hậu duệ của mọi tổ tiên) →
--     552/681 tài khoản sửa được trên 500 người. Cả họ chung một cụ tổ nên
--     luật ấy KHÔNG chặn gì giữa chi này với chi kia. Trung vị 555 người.
--   • Và nó chặn nhầm chỗ ruột thịt nhất: vợ chồng không cùng huyết thống,
--     nên 131/133 cặp mà chồng không sửa nổi hồ sơ vợ mình. Đó là lý do
--     dòng "cộng vợ/chồng" ở trên bắt buộc phải có.
--   • Trực hệ (luật này): trung vị 27 người. Đúng cỡ một nhánh gia đình.
--
-- ⚠ HỆ QUẢ ĐÃ BIẾT VÀ ĐÃ CHẤP NHẬN: **không ai sửa được anh chị em ruột của
--   mình** (0/514 người trên cây 681). Em ruột không phải tổ tiên, cũng không
--   phải con cháu. Chủ dự án biết điều này và vẫn chọn trực hệ nghiêm ngặt
--   04/09/2026; đường ra là nhờ bố (bố là trực hệ của cả hai) hoặc nhờ quản trị viên.
--   Ngày nào muốn đổi thì mở đúng một chỗ: `pham_vi_sua()` bên dưới.
--
-- ⚠ TRỰC HỆ CHẠY HAI CHIỀU, đừng đọc nhầm thành một chiều. Tôi sửa được tổ
--   tiên tôi, và con cháu tôi cũng sửa được TÔI — vì tôi nằm trong tập tổ
--   tiên của chúng. Nhờ vậy hồ sơ một cụ già được cả đường con cháu chăm,
--   không phụ thuộc vào việc cụ có tài khoản hay không.
--
-- ═══ 2. `branches` VÀ `branch_access` TỪ NAY KHÔNG DÙNG NỮA ═══
--
-- Hai bảng ấy dựng từ `01-bang.sql` để chờ một quy tắc chia chi mà chưa ai
-- định nghĩa được từ 24/08/2026. Luật trực hệ tính thẳng từ đồ thị quan hệ
-- nên KHÔNG cần chúng: không ai phải ngồi liệt kê chi, không ai phải bảo trì
-- danh sách ấy khi có người mới sinh ra.
--
-- File này KHÔNG xoá chúng, cũng không xoá cột `persons.branch_id`. Xoá bảng
-- là việc phải hỏi chủ dự án (CLAUDE.md mục 9), và giữ lại thì rẻ — chúng
-- đang trống. Coi như ba vết sẹo, ghi ở `KIEN-TRUC.md` mục 4.

-- ============================================================
-- 3. HAI CỘT MỚI TRÊN `tree_members`
-- ============================================================
-- `person_id` — tài khoản này là AI trong gia phả. `null` = chưa gắn.
-- `approved`  — quản trị viên đã duyệt chưa. Mặc định `false`: thêm dòng thôi thì
--               chưa có quyền sửa, đúng như chủ dự án yêu cầu.
--
-- Khoá ngoại tới `persons` để không gắn được vào một mã người không tồn tại.
-- `on delete set null`: người ấy bị xoá cứng khỏi gia phả thì tài khoản rơi
-- về trạng thái chưa gắn — tức mất quyền sửa, không phải giữ quyền mồ côi.

alter table public.tree_members
  add column if not exists person_id text,
  add column if not exists approved  boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.tree_members'::regclass
       and conname  = 'tree_members_person_fk'
  ) then
    alter table public.tree_members
      add constraint tree_members_person_fk
      foreign key (tree_id, person_id)
      references public.persons(tree_id, id) on delete set null;
  end if;
end $$;

-- Một người trong gia phả chỉ gắn được với MỘT tài khoản. Không có ràng buộc
-- này thì hai người cùng nhận mình là cụ Nguyễn Bá Long, và cả hai cùng sửa
-- được trực hệ của cụ — không ai thấy gì bất thường trên màn hình.
create unique index if not exists tree_members_person_uniq
  on public.tree_members (tree_id, person_id)
  where person_id is not null;

-- ============================================================
-- 4. THÊM VAI `quan_tri`
-- ============================================================
-- ⚠ Lặp lại đúng cái bẫy `05-sao-luu.sql` đã gặp và đã ghi: ràng buộc kiểm
--   trên cột `role` KHÔNG được đặt tên ở `01-bang.sql`, nên Postgres tự đặt.
--   Gỡ theo tên đoán mò thì trượt, và `add constraint` sau đó báo trùng tên.
--   Nên: quét MỌI ràng buộc kiểm có nhắc `role`, gỡ hết, rồi đặt lại một cái
--   có tên đàng hoàng.
--
-- `quan_tri_he_thong` khác `quan_tri` thế nào? `quan_tri_he_thong` là người dựng cây, đúng một người, và là
-- người duy nhất không ai gỡ được. `quan_tri` là quyền chủ dự án cấp thêm cho
-- người khác, gỡ được. Hai vai làm được y hệt nhau về sửa dữ liệu.

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
  check (role in ('quan_tri_he_thong', 'quan_tri', 'sua', 'xem', 'sao_luu'));

-- ============================================================
-- 5. PHẠM VI SỬA — trái tim của cả file
-- ============================================================
-- Trả về mã của MỌI người mà tài khoản gắn với `p_goc` được sửa.
--
-- ⚠ `union` chứ không phải `union all` trong cả hai nhánh đệ quy. Đó chính
--   là tập `visited` mà CLAUDE.md mục 7 bắt buộc phải có — Postgres tự loại
--   dòng trùng nên vòng lặp trong đồ thị dừng lại. Đổi thành `union all` là
--   treo cơ sở dữ liệu trên đúng những gia phả có hôn nhân cận huyết, chứ
--   không phải chạy chậm.
--
-- ⚠ Đi lên nối qua `persons` bằng `= any(un.partners)` chứ không `unnest`
--   thẳng mảng. Hai cái lợi cùng lúc: không cần `lateral` trong nhánh đệ quy
--   (Postgres kén chỗ đặt tham chiếu đệ quy), và mã người chết nằm lại trong
--   `partners` bị loại luôn — `DU-LIEU.md` mục 2 đã cảnh báo mảng ấy không
--   có khoá ngoại nên chứa được mã không tồn tại.
--
-- ⚠ KHÔNG lọc `deleted = false`. Người bị xoá mềm vẫn phải sửa được, nếu
--   không thì không ai khôi phục họ lại được.
--
-- Chi phí: đo trên cây 681 người / 189 hôn nhân thì không đáng kể. Ngày nào
-- cây lớn hơn nhiều lần thì chỗ tối ưu là gọi MỘT lần rồi giữ vào mảng —
-- `luu_cay()` đã làm đúng thế, xem `03-ham-luu-cay.sql` hàng rào 4.

create or replace function public.pham_vi_sua(p_tree uuid, p_goc text)
returns table (person_id text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with recursive
  -- Đi LÊN. Chỉ trực hệ: từ một người, qua union mà người ấy làm CON, lấy
  -- các partner của union ấy. Không bao giờ lấy con của union ấy — lấy con
  -- chính là rẽ ngang sang anh chị em, thứ luật này cố ý loại.
  to_tien (id) as (
    select p_goc where p_goc is not null
    union
    select p.id
      from to_tien t
      join public.union_children uc
        on uc.tree_id = p_tree and uc.person_id = t.id
      join public.unions un
        on un.tree_id = p_tree and un.id = uc.union_id
      join public.persons p
        on p.tree_id = p_tree and p.id = any(un.partners)
     where p.id <> t.id
  ),
  -- Đi XUỐNG. Không giới hạn đời. Từ một người, qua MỌI union mà người ấy
  -- làm vợ/chồng, lấy con của union ấy.
  hau_due (id) as (
    select p_goc where p_goc is not null
    union
    select uc.person_id
      from hau_due h
      join public.unions un
        on un.tree_id = p_tree and h.id = any(un.partners)
      join public.union_children uc
        on uc.tree_id = p_tree and uc.union_id = un.id
  ),
  co_ban (id) as (
    select id from to_tien
    union
    select id from hau_due
  ),
  -- Vợ/chồng của người trong `co_ban`. MỘT bước, không lan tiếp — nếu lan
  -- thì qua vài đời dâu rể là phủ kín cả họ, và luật mất hết ý nghĩa.
  vo_chong (id) as (
    select p.id
      from public.unions un
      join public.persons p
        on p.tree_id = p_tree and p.id = any(un.partners)
     where un.tree_id = p_tree
       and exists (select 1 from co_ban c where c.id = any(un.partners))
  )
  select id from co_ban
  union
  select id from vo_chong;
$$;

-- ============================================================
-- 6. TÀI KHOẢN NÀY GẮN VỚI AI
-- ============================================================
-- Trả `null` khi chưa gắn HOẶC chưa được duyệt. Gộp hai điều kiện vào một
-- hàm để không nơi nào quên mất vế `approved` — quên vế ấy là duyệt trở
-- thành hình thức.

create or replace function public.nguoi_gan(p_tree uuid)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select person_id from public.tree_members
   where tree_id = p_tree
     and user_id = auth.uid()
     and approved
     and person_id is not null;
$$;

-- ============================================================
-- 7. HAI HÀM QUYẾT QUYỀN, VIẾT LẠI
-- ============================================================
-- `co_the_sua()` nay gánh thêm luật *"chưa gắn mã thì chỉ có quyền xem"*.
-- Đặt ở đây chứ không rải ra nơi gọi, để chỉ có MỘT chỗ trả lời câu ấy.

create or replace function public.co_the_sua(p_tree uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when public.vai_tro(p_tree) in ('quan_tri_he_thong', 'quan_tri') then true
    when public.vai_tro(p_tree) = 'sua' then public.nguoi_gan(p_tree) is not null
    else false
  end;
$$;

-- Tham số thứ hai nay là MÃ NGƯỜI, không còn là mã nhánh. Xem mục 0.
--
-- ⚠ Phải DROP trước, không `create or replace` thẳng được. Bản cũ ở
--   `02-rls.sql` đặt tên tham số hai là `p_branch`; Postgres cho đổi THÂN hàm
--   nhưng KHÔNG cho đổi TÊN tham số bằng `create or replace`, và báo
--   `42P13: cannot change name of input parameter "p_branch"`. Đổi tên là cố
--   ý — tên `p_branch` nay sai nghĩa, giữ lại thì người đọc sau hiểu nhầm.
--   Drop được an toàn vì không policy RLS nào gọi hàm này (đã soát
--   `02-rls.sql` 04/09/2026); `luu_cay()` gọi `pham_vi_sua()`, không gọi nó.
drop function if exists public.co_the_sua_nguoi(uuid, text);

create or replace function public.co_the_sua_nguoi(p_tree uuid, p_person text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    -- ⚠ Người ngoài cây phải bị chặn ở nhánh ĐẦU TIÊN. Giữ nguyên lời cảnh
    --   báo của bản cũ vì cái bẫy không đổi: với họ `vai_tro()` trả `null`,
    --   mà `null <> 'sua'` ra `null` chứ không ra `true`, nên nhánh sau
    --   không bắt được họ và họ rơi xuống `else`.
    when public.vai_tro(p_tree) is null then false
    when public.vai_tro(p_tree) in ('quan_tri_he_thong', 'quan_tri') then true
    when public.vai_tro(p_tree) <> 'sua' then false
    when public.nguoi_gan(p_tree) is null then false
    else exists (
      select 1 from public.pham_vi_sua(p_tree, public.nguoi_gan(p_tree)) pv
       where pv.person_id = p_person
    )
  end;
$$;

-- ============================================================
-- 8. ADMIN DUYỆT — cửa cho màn hình duyệt mai kia
-- ============================================================
-- Hôm nay chưa có màn hình duyệt (`KIEN-TRUC.md` mục 6 liệt kê các màn hình
-- còn thiếu). Hàm này là cửa dựng sẵn cho màn hình ấy.
--
-- ⚠ **KHÔNG gọi được từ SQL Editor** — câu ghi ở đây trước 04/09/2026 nói
--   ngược lại và đã sai. Cửa sổ SQL Editor không mang danh nghĩa tài khoản nào,
--   nên `auth.uid()` rỗng, `vai_tro()` trả `null`, và sau bản vá bên dưới thì
--   hàm coi đó là người ngoài và từ chối.
--
--   Bản chưa vá thì gọi được — nhưng chỉ vì đúng cái lỗ hổng H9 bắt được: cửa
--   kiểm quyền không đóng với `null`. Tức "dùng được từ SQL Editor" chưa bao
--   giờ là tính năng, nó là triệu chứng.
--
--   Duyệt tay từ SQL Editor thì dùng `update` — câu đầy đủ, kèm phép chặn gõ
--   nhầm, nằm ở `HUONG-DAN-PHAN-QUYEN.md` mục 3.
--
-- ⚠ `security definer` nên nó tự kiểm người gọi. Không kiểm là bất kỳ ai
--   đăng nhập cũng tự duyệt cho mình.

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
  -- ⚠ `coalesce(…, '')` KHÔNG phải để cho đẹp. Bản 0.1.1 viết thẳng
  --   `vai_tro(p_tree) not in ('quan_tri_he_thong','quan_tri')`, và phép thử H9 ngày 04/09/2026
  --   bắt được lỗ hổng: với người NGOÀI cây `vai_tro()` trả `null`, mà
  --   `null not in (…)` ra `null` chứ không ra `true` — nên `if` không nhận,
  --   cửa không đóng, và hàm chạy thẳng xuống lệnh `update` bên dưới. Người ấy
  --   không tự duyệt cho mình được (mình chưa có dòng nào để update), nhưng
  --   **duyệt được cho tài khoản khác** nếu biết email của họ: gắn mã người tuỳ
  --   ý và bật `approved`. Bất kỳ ai cũng tự đăng ký được, nên "người ngoài cây"
  --   không phải một vai hiếm.
  --
  --   Đây là ĐÚNG cái bẫy `co_the_sua_nguoi()` đã ghi chú cẩn thận ở mục 7 và
  --   b87 đã ghi vào nhật ký — chỉ khác là ở đó viết dạng dương (`in`, `=`) nên
  --   `null` rơi về `else false` và chặn đúng. Một chữ `not` là đủ lật ngược.
  --   Đã soát lại toàn bộ `luoc-do/`: đây là chỗ DUY NHẤT dùng `not in` với
  --   `vai_tro()`; mọi cửa khác viết dạng dương và an toàn.
  if coalesce(public.vai_tro(p_tree), '') not in ('quan_tri_he_thong', 'quan_tri') then
    return jsonb_build_object('ok', false, 'loi',
      'Chỉ quản trị hệ thống hoặc quản trị viên mới duyệt được thành viên.');
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

revoke all on function public.duyet_thanh_vien(uuid, text, text, boolean) from public;
grant execute on function public.duyet_thanh_vien(uuid, text, text, boolean) to authenticated;

-- ============================================================
-- 9. TỰ KIỂM — chạy xong nhìn bảng này
-- ============================================================
-- Hai cột mới có mặt chưa, vai `quan_tri` nhận chưa, và ai đang gắn với ai.

select 'cot moi' as muc,
       (select count(*) from information_schema.columns
         where table_schema = 'public' and table_name = 'tree_members'
           and column_name in ('person_id', 'approved'))::text as gia_tri,
       '2' as mong_doi
union all
select 'vai quan tri nhan duoc',
       (select case when pg_get_constraintdef(oid) ilike '%''quan_tri''%'
                    then 'co' else 'KHONG' end
          from pg_constraint
         where conrelid = 'public.tree_members'::regclass
           and conname = 'tree_members_role_check'),
       'co'
union all
select 'ham pham_vi_sua',
       (select count(*)::text from pg_proc
         where proname = 'pham_vi_sua'
           and pronamespace = 'public'::regnamespace),
       '1'
union all
-- Vá lỗ hổng H9 (xem ghi chú ở mục 8). Bản chưa vá KHÔNG có chữ `coalesce`
-- trong thân `duyet_thanh_vien` — nên dòng này phân biệt được hai bản.
select 'cua duyet da va lo hong',
       (select case when prosrc ilike '%coalesce(public.vai_tro%'
                    then 'co' else 'CHUA' end
          from pg_proc where proname = 'duyet_thanh_vien'
           and pronamespace = 'public'::regnamespace),
       'co';
