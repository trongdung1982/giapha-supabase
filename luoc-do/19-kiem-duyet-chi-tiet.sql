-- ============================================================
-- giapha-supabase · luoc-do/19-kiem-duyet-chi-tiet.sql
-- Vai trò  : b111 — MỘT HÀM MỚI cho màn hình Duyệt: mở rộng một dòng "chờ
--            duyệt" thành bảng phẳng TRƯỚC/SAU. Không đụng hàm nào của `08`.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU `08-kiem-duyet.sql`.
-- Phiên bản: 0.1.0 · Cập nhật: 10/09/2026 (b111)
-- ============================================================
--
-- ═══ VÌ SAO KHÔNG THÊM CỘT, VÀ VÌ SAO KHÔNG SỬA `ds_kiem_duyet()` ═══
--
-- `08-kiem-duyet.sql` mục 9 đã nói rõ: `ds_kiem_duyet()` CỐ Ý không trả cột
-- `truoc` — bảng danh sách chỉ cần biết "đụng bao nhiêu dòng", còn `truoc` có
-- thể rất nặng. Màn hình xem chi tiết là MỘT VÒNG GỌI RIÊNG, đúng thiết kế
-- "dựng bản gọn nhất trước" đã chốt từ đầu.
--
-- Và không cần thêm cột `sau` lên `change_log`: **`sau` chính là dòng đang
-- nằm trong bảng thật hôm nay.** `truoc` đã có sẵn — nó là ảnh chụp
-- `luu_cay()` tự lấy TRƯỚC khi ghi (mục "CHỤP ẢNH" của `03-ham-luu-cay.sql`).
-- Hàm này chỉ việc đọc lại `truoc`, rồi với mỗi khoá trong đó, tra thêm một
-- lần vào bảng thật để lấy "sau". Không có gì phải lưu thêm.
--
-- ═══ HÌNH TRẢ VỀ ═══
--
--   { ok:true, id, trangThai,
--     banGhi: { nguoi:[…], honnhan:[…], con:[…], anh:[…], nguon:[…],
--               cay: {truoc,sau} | null },
--     biKhoa: null | { id, byEmail, ts } }
--
-- Mỗi phần tử của `nguoi`/`honnhan`/`anh`/`nguon` có hình `{id, truoc, sau}`;
-- `con` có hình `{unionId, personId, truoc, sau}`. `truoc`/`sau` là NGUYÊN
-- VĂN một dòng Postgres (snake_case) hoặc `null` nếu dòng ấy không tồn tại ở
-- thời điểm đó — đúng quy ước `cu` của `03`. Bên nhận (domains/so-sanh.js) sẽ
-- xếp phẳng chúng ra thành từng ô, không phải việc của tầng SQL.
--
-- `biKhoa` là **cùng câu trả lời** `dung_do_sau()` đã tính cho
-- `tu_choi_thay_doi()` — dùng lại nguyên hàm, không viết lại phép so khoá lần
-- hai. Có `biKhoa` thì màn hình làm mờ nút "Từ chối" NGAY, kèm lý do, thay vì
-- để người duyệt bấm rồi mới nghe máy chủ từ chối — đúng luật "khoá sẵn kèm
-- lý do" đã áp cho các cửa khác.
--
-- ⚠ KHÔNG cấp cho ai ngoài `co_the_kiem_duyet()`. Đọc `truoc` là đọc được
--   TOÀN VĂN bản ghi cũ của người khác — cùng mức nhạy cảm với đọc thẳng
--   `change_log.truoc`, và cột ấy vẫn chỉ cho quản trị đọc qua đường này.

create or replace function public.chi_tiet_kiem_duyet(p_tree uuid, p_id bigint)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_tt      text;
  v_truoc   jsonb;
  v_ban_ghi jsonb;
  v_khoa    record;
begin
  if not public.co_the_kiem_duyet(p_tree) then
    return jsonb_build_object('ok', false, 'lyDo', 'khongcoquyen',
      'loi', 'Chỉ quản trị hệ thống hoặc quản trị viên mới xem chi tiết được.');
  end if;

  select trang_thai, truoc into v_tt, v_truoc
    from public.change_log
   where id = p_id and tree_id = p_tree;

  if v_tt is null then
    return jsonb_build_object('ok', false, 'lyDo', 'khongthay',
      'loi', 'Không có thay đổi nào mang số ' || p_id || ' trong gia phả này.');
  end if;

  select jsonb_build_object(

    'nguoi', (
      select coalesce(jsonb_agg(jsonb_build_object('id', e->>'id', 'truoc', e->'cu',
               'sau', case when cu.tree_id is null then 'null'::jsonb
                           else to_jsonb(cu.*) end)), '[]'::jsonb)
        from jsonb_array_elements(coalesce(v_truoc->'persons', '[]'::jsonb)) e
        left join public.persons cu
          on cu.tree_id = p_tree and cu.id = e->>'id'),

    'honnhan', (
      select coalesce(jsonb_agg(jsonb_build_object('id', e->>'id', 'truoc', e->'cu',
               'sau', case when cu.tree_id is null then 'null'::jsonb
                           else to_jsonb(cu.*) end)), '[]'::jsonb)
        from jsonb_array_elements(coalesce(v_truoc->'unions', '[]'::jsonb)) e
        left join public.unions cu
          on cu.tree_id = p_tree and cu.id = e->>'id'),

    'con', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'unionId', e->>'union_id', 'personId', e->>'person_id',
               'truoc', e->'cu',
               'sau', case when cu.tree_id is null then 'null'::jsonb
                           else to_jsonb(cu.*) end)), '[]'::jsonb)
        from jsonb_array_elements(coalesce(v_truoc->'children', '[]'::jsonb)) e
        left join public.union_children cu
          on cu.tree_id = p_tree
         and cu.union_id = e->>'union_id' and cu.person_id = e->>'person_id'),

    'anh', (
      select coalesce(jsonb_agg(jsonb_build_object('id', e->>'id', 'truoc', e->'cu',
               'sau', case when cu.tree_id is null then 'null'::jsonb
                           else to_jsonb(cu.*) end)), '[]'::jsonb)
        from jsonb_array_elements(coalesce(v_truoc->'media', '[]'::jsonb)) e
        left join public.media cu
          on cu.tree_id = p_tree and cu.id = e->>'id'),

    'nguon', (
      select coalesce(jsonb_agg(jsonb_build_object('id', e->>'id', 'truoc', e->'cu',
               'sau', case when cu.tree_id is null then 'null'::jsonb
                           else to_jsonb(cu.*) end)), '[]'::jsonb)
        from jsonb_array_elements(coalesce(v_truoc->'sources', '[]'::jsonb)) e
        left join public.sources cu
          on cu.tree_id = p_tree and cu.id = e->>'id'),

    -- Ba trường của khối cây — đúng ba trường `03` chụp, không hơn.
    'cay', case
      when jsonb_typeof(coalesce(v_truoc->'tree', 'null'::jsonb)) = 'object'
      then jsonb_build_object('truoc', v_truoc->'tree',
             'sau', (select jsonb_build_object('name', t.name,
                                                'root_person_id', t.root_person_id,
                                                'note', t.note)
                       from public.trees t where t.id = p_tree))
      else null end

  ) into v_ban_ghi;

  -- Cùng câu hỏi `tu_choi_thay_doi()` tự hỏi trước khi hoàn tác — xem trước
  -- kết quả ấy ở đây để màn hình khoá nút sớm, thay vì để người duyệt bấm
  -- rồi mới biết.
  select * into v_khoa from public.dung_do_sau(p_tree, p_id);

  return jsonb_build_object('ok', true, 'id', p_id, 'trangThai', v_tt,
    'banGhi', v_ban_ghi,
    'biKhoa', case when not found or v_khoa.id is null then null
              else jsonb_build_object('id', v_khoa.id, 'byEmail', v_khoa.by_email,
                                       'ts', v_khoa.ts) end);
end;
$$;

revoke all on function public.chi_tiet_kiem_duyet(uuid, bigint) from public, anon;
grant execute on function public.chi_tiet_kiem_duyet(uuid, bigint) to authenticated;

-- ============================================================
-- TỰ KIỂM
-- ============================================================
select 'ham chi_tiet_kiem_duyet co mat' as muc,
       (select count(*)::text from pg_proc
         where pronamespace = 'public'::regnamespace
           and proname = 'chi_tiet_kiem_duyet')                    as gia_tri,
       '1' as mong_doi
union all
select 'ham chi tu quan tri goi duoc (revoke public/anon)',
       (select has_function_privilege('anon', 'public.chi_tiet_kiem_duyet(uuid,bigint)',
                                       'execute')::text),
       'false';
