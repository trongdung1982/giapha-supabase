-- ============================================================
-- giapha-supabase · luoc-do/03-ham-luu-cay.sql
-- Vai trò  : CỬA GHI DUY NHẤT vào dữ liệu gia phả.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU 02-rls.sql.
-- Phiên bản: 0.1.0 · Cập nhật: 02/09/2026 22:45
-- ============================================================
--
-- ═══ ĐỌC BA ĐOẠN NÀY TRƯỚC KHI SỬA MỘT DÒNG NÀO ═══
--
-- **1. Hàm này chạy vượt RLS.** `security definer` nghĩa là nó mang quyền của
-- người tạo ra nó, không phải của người gọi. Mọi `policy` ở `02-rls.sql`
-- KHÔNG áp cho những câu lệnh bên trong đây. Nói cách khác: bốn phép kiểm ở
-- đầu hàm **là** toàn bộ hàng rào. Bỏ sót một phép là thủng, và thủng im
-- lặng — không có lớp thứ hai đứng sau đỡ.
--
-- **2. Cả hàm là MỘT giao dịch.** Hàm Postgres chạy trong một transaction:
-- `raise exception` ở dòng cuối cũng huỷ sạch mọi thứ đã ghi ở dòng đầu. Nhờ
-- thế mới dám ghi bảy bảng liên tiếp mà không sợ ghi được ba bảng rồi hỏng.
--
-- **3. Vì sao trình duyệt gửi lên KHÁC BIỆT chứ không gửi cả cây.** Gửi cả
-- cây rồi ghi đè hết thì đơn giản hơn nhiều — 681 người là dữ liệu bé. Nhưng
-- lúc ấy MỌI dòng đều bị ghi lại ở mỗi lần lưu, nên người biên tập chỉ được
-- sửa chi Giáp mà đổi một cái tên trong chi mình cũng sẽ ghi đè lên toàn bộ
-- chi Ất. Giới hạn theo nhánh sẽ không bao giờ cho phép nổi việc ấy, tức là
-- lối "gửi cả cây" **giết chết đúng lý do của cả cuộc chuyển nhà này**.
-- Khác biệt tồn tại vì phân quyền, không phải vì tốc độ.

-- ------------------------------------------------------------
-- Hàm phụ: gắn mã cây vào từng bản ghi trình duyệt gửi lên.
--
-- Làm ở đây chứ không bắt trình duyệt gửi kèm `tree_id`, vì như thế thì
-- không tồn tại cái sai "gửi nhầm mã cây khác" để mà phải đi kiểm.
-- ------------------------------------------------------------
create or replace function public.gan_ma_cay(p_ds jsonb, p_tree uuid)
returns jsonb
language sql
immutable
as $$
  select coalesce(
    jsonb_agg(e || jsonb_build_object('tree_id', p_tree)),
    '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_ds, '[]'::jsonb)) e;
$$;

-- ------------------------------------------------------------
-- LƯU CÂY
--
-- @param p_tree_id   cây nào
-- @param p_revision  số bản ghi mà trình duyệt TƯỞNG đang là mới nhất
-- @param p_ops       khác biệt, do `services/hinh-dang.js` sinh ra:
--        {
--          "tree":     { "name":…, "root_person_id":…, "note":… } | null,
--          "persons":  { "luu": [ … ], "xoa": [ "P0001", … ] },
--          "unions":   { "luu": [ … ], "xoa": [ … ] },
--          "children": { "luu": [ {union_id,person_id,relation,ord} ],
--                        "xoa": [ {union_id,person_id} ] },
--          "media":    { "luu": [ … ], "xoa": [ … ] },
--          "sources":  { "luu": [ … ], "xoa": [ … ] },
--          "imports":  [ … ]
--        }
--        Khoá trong `luu` là **tên cột snake_case**, không phải camelCase của
--        trình duyệt. Chỗ đổi tên nằm ở `hinh-dang.js`, và chỉ ở đó.
--
--        ⚠ `xoa` là xoá THẬT, và trong cả app chỉ có một đường dẫn tới đây:
--          *Dọn thùng rác* (`domains/purge.js`). Xoá thường là đặt cờ
--          `deleted = true`, tức là một bản ghi trong `luu`.
--
-- @param p_mo_ta     { action, target, note, diff } — ghi vào `change_log`.
--        ⚠ `ts` và `by` gửi lên đều bị BỎ QUA. Hàm tự lấy từ JWT.
--
-- @returns { ok, lyDo, loi, revision, tree }
-- ------------------------------------------------------------
create or replace function public.luu_cay(
  p_tree_id  uuid,
  p_revision integer,
  p_ops      jsonb,
  p_mo_ta    jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email      text := coalesce(auth.jwt() ->> 'email', '');
  v_rev_thuc   integer;
  v_rev_moi    integer;
  v_persons    jsonb;
  v_unions     jsonb;
  v_children   jsonb;
  v_media      jsonb;
  v_sources    jsonb;
  v_nhanh_hong text;
  v_tree       jsonb;
begin
  -- ══ HÀNG RÀO 1 — có đăng nhập không ══
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'lyDo', 'chuadangnhap',
      'loi', 'Phiên đăng nhập đã hết hạn. Tải lại trang và đăng nhập lại.');
  end if;

  -- ══ HÀNG RÀO 2 — có quyền sửa cây này không ══
  -- Người ngoài và người chỉ có quyền xem dừng ở đây. Câu trả lời cố ý KHÔNG
  -- phân biệt "không thấy cây" với "thấy nhưng không sửa được" bằng lời lẽ
  -- kỹ thuật; `services/repo.js` mới là chỗ viết câu cho người đọc.
  if not public.co_the_sua(p_tree_id) then
    return jsonb_build_object('ok', false, 'lyDo', 'khongcoquyen',
      'loi', 'Bạn chỉ có quyền xem gia phả này, không sửa được.');
  end if;

  -- ══ HÀNG RÀO 3 — có ai vừa sửa trước mình không ══
  -- Khoá dòng cây lại luôn (`for update`): hai người bấm Lưu cùng lúc thì
  -- người sau đứng đợi ở đây, đọc được số đã tăng, rồi bị từ chối đúng cách.
  -- Không có `for update` thì cả hai cùng đọc số cũ và cả hai cùng qua.
  select revision into v_rev_thuc
    from public.trees where id = p_tree_id for update;

  if v_rev_thuc is null then
    return jsonb_build_object('ok', false, 'lyDo', 'khongthaycay',
      'loi', 'Không tìm thấy gia phả này.');
  end if;

  -- ⚠ `p_revision is null` phải kiểm RIÊNG. Trong SQL, `5 <> null` không ra
  --   `true` mà ra `null`, và `if null then` là không chạy — nên một lần gọi
  --   thiếu tham số sẽ ĐI THẲNG QUA hàng rào này và ghi đè. Đây đúng kiểu lỗ
  --   hổng không bao giờ lộ ra khi thử bằng app (app luôn gửi số), chỉ lộ khi
  --   có người gọi thẳng vào RPC.
  if p_revision is null or v_rev_thuc <> p_revision then
    -- ⚠ CỐ Ý không tự nạp lại rồi ghi tiếp. Nghe thì tiện, nhưng đó chính là
    --   ghi đè mất bản của người kia — đúng cái việc cơ chế này sinh ra để
    --   chặn. Đường ra duy nhất là nạp lại cây.
    return jsonb_build_object('ok', false, 'lyDo', 'xungdot',
      'loi', 'Người khác vừa sửa gia phả trong lúc bạn đang mở. ' ||
             'Tải lại trang để lấy bản mới nhất rồi sửa lại.',
      'revision', v_rev_thuc);
  end if;

  -- Gắn mã cây vào mọi bản ghi, một lần, ở một chỗ.
  v_persons  := public.gan_ma_cay(p_ops->'persons'->'luu',  p_tree_id);
  v_unions   := public.gan_ma_cay(p_ops->'unions'->'luu',   p_tree_id);
  v_children := public.gan_ma_cay(p_ops->'children'->'luu', p_tree_id);
  v_media    := public.gan_ma_cay(p_ops->'media'->'luu',    p_tree_id);
  v_sources  := public.gan_ma_cay(p_ops->'sources'->'luu',  p_tree_id);

  -- ══ HÀNG RÀO 4 — giới hạn theo NHÁNH ══
  --
  -- Kiểm CẢ HAI phía, và phía thứ hai mới là phía dễ quên: nhánh MỚI của bản
  -- ghi gửi lên, và nhánh CŨ của bản ghi đang nằm trong bảng. Chỉ kiểm nhánh
  -- mới thì người biên tập chi Giáp gắp được một người của chi Ất sang chi
  -- mình rồi sửa thoải mái — sửa nhánh là một cách sửa người.
  --
  -- ⚠ Hôm nay phép kiểm này chưa chặn ai cả, vì `co_the_sua_nguoi()` còn bỏ
  --   qua tham số nhánh (`02-rls.sql` giải thích vì sao). Khung thì đã đúng
  --   chỗ — chốt xong quy tắc chia nhánh là nó có hiệu lực ngay, không phải
  --   sửa file này.
  select p.id into v_nhanh_hong
    from jsonb_populate_recordset(null::public.persons, v_persons) p
   where not public.co_the_sua_nguoi(p_tree_id, p.branch_id)
   limit 1;
  if v_nhanh_hong is not null then
    return jsonb_build_object('ok', false, 'lyDo', 'ngoainhanh',
      'loi', 'Bạn không được cấp quyền sửa nhánh của người ' || v_nhanh_hong || '.');
  end if;

  select cu.id into v_nhanh_hong
    from public.persons cu
   where cu.tree_id = p_tree_id
     and (cu.id in (select p.id from jsonb_populate_recordset(null::public.persons, v_persons) p)
       or cu.id in (select jsonb_array_elements_text(coalesce(p_ops->'persons'->'xoa','[]'::jsonb))))
     and not public.co_the_sua_nguoi(p_tree_id, cu.branch_id)
   limit 1;
  if v_nhanh_hong is not null then
    return jsonb_build_object('ok', false, 'lyDo', 'ngoainhanh',
      'loi', 'Người ' || v_nhanh_hong || ' đang thuộc một nhánh bạn không được sửa.');
  end if;

  -- ══════════════════════════════════════════════════════════
  -- TỪ ĐÂY TRỞ XUỐNG MỚI ĐƯỢC GHI
  -- ══════════════════════════════════════════════════════════
  --
  -- Thứ tự KHÔNG tuỳ tiện, khoá ngoại quyết định nó:
  --   xoá  — con trước, rồi hôn nhân và người (con trỏ tới cả hai)
  --   thêm — người trước, rồi hôn nhân, rồi con
  -- Làm ngược là Postgres từ chối, và vì cả hàm là một giao dịch nên nó từ
  -- chối trọn gói chứ không để lại nửa vời.

  -- --- XOÁ THẬT (chỉ đến từ Dọn thùng rác) ---
  delete from public.union_children uc
   using jsonb_to_recordset(coalesce(p_ops->'children'->'xoa','[]'::jsonb))
         as x(union_id text, person_id text)
   where uc.tree_id = p_tree_id
     and uc.union_id = x.union_id and uc.person_id = x.person_id;

  delete from public.union_children
   where tree_id = p_tree_id
     and (union_id  in (select jsonb_array_elements_text(coalesce(p_ops->'unions'->'xoa','[]'::jsonb)))
       or person_id in (select jsonb_array_elements_text(coalesce(p_ops->'persons'->'xoa','[]'::jsonb))));

  delete from public.unions
   where tree_id = p_tree_id
     and id in (select jsonb_array_elements_text(coalesce(p_ops->'unions'->'xoa','[]'::jsonb)));

  delete from public.media
   where tree_id = p_tree_id
     and id in (select jsonb_array_elements_text(coalesce(p_ops->'media'->'xoa','[]'::jsonb)));

  delete from public.sources
   where tree_id = p_tree_id
     and id in (select jsonb_array_elements_text(coalesce(p_ops->'sources'->'xoa','[]'::jsonb)));

  delete from public.persons
   where tree_id = p_tree_id
     and id in (select jsonb_array_elements_text(coalesce(p_ops->'persons'->'xoa','[]'::jsonb)));

  -- --- THÊM VÀ SỬA ---
  insert into public.persons
  select * from jsonb_populate_recordset(null::public.persons, v_persons)
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

  insert into public.unions
  select * from jsonb_populate_recordset(null::public.unions, v_unions)
  on conflict (tree_id, id) do update set
    uid = excluded.uid, partners = excluded.partners,
    partner_order = excluded.partner_order, ranks = excluded.ranks,
    status = excluded.status, marriage = excluded.marriage,
    note = excluded.note, deleted = excluded.deleted;

  insert into public.union_children
  select * from jsonb_populate_recordset(null::public.union_children, v_children)
  on conflict (tree_id, union_id, person_id) do update set
    relation = excluded.relation, ord = excluded.ord;

  insert into public.media
  select * from jsonb_populate_recordset(null::public.media, v_media)
  on conflict (tree_id, id) do update set
    subject_id = excluded.subject_id,
    drive_file_id = excluded.drive_file_id,
    drive_file_id_lon = excluded.drive_file_id_lon,
    caption = excluded.caption, year = excluded.year,
    deleted = excluded.deleted, meta = excluded.meta;

  insert into public.sources
  select * from jsonb_populate_recordset(null::public.sources, v_sources)
  on conflict (tree_id, id) do update set
    title = excluded.title, author = excluded.author, note = excluded.note;

  -- --- SỔ NHẬP ---
  insert into public.imports (tree_id, by_email, file, source, source_name,
                              exporter, counts, map)
  select p_tree_id, v_email,
         coalesce(e->>'file',''), coalesce(e->>'source',''),
         coalesce(e->>'source_name',''), coalesce(e->>'exporter',''),
         coalesce(e->'counts','{}'::jsonb), coalesce(e->'map','[]'::jsonb)
    from jsonb_array_elements(coalesce(p_ops->'imports','[]'::jsonb)) e;

  -- --- KHỐI THÔNG TIN CHUNG CỦA CÂY + TĂNG SỐ BẢN GHI ---
  v_rev_moi := v_rev_thuc + 1;
  update public.trees set
    name           = coalesce(p_ops->'tree'->>'name', name),
    root_person_id = coalesce(p_ops->'tree'->>'root_person_id', root_person_id),
    note           = coalesce(p_ops->'tree'->>'note', note),
    revision       = v_rev_moi,
    updated_at     = now(),
    updated_by     = v_email
   where id = p_tree_id
   returning to_jsonb(trees.*) into v_tree;

  -- --- NHẬT KÝ ---
  -- ⚠ `ts` và `by` lấy ở ĐÂY, không lấy của trình duyệt. Trình duyệt gửi kèm
  --   thì hai trường ấy nằm trong `p_mo_ta` và không được đọc tới.
  insert into public.change_log (tree_id, by_email, user_id, action, target,
                                 note, diff, revision)
  values (p_tree_id, v_email, auth.uid(),
          coalesce(p_mo_ta->>'action', 'update'),
          coalesce(p_mo_ta->>'target', ''),
          coalesce(p_mo_ta->>'note', ''),
          coalesce(p_mo_ta->'diff', '{}'::jsonb),
          v_rev_moi);

  return jsonb_build_object('ok', true, 'lyDo', null, 'loi', null,
                            'revision', v_rev_moi, 'tree', v_tree);
end;
$$;

-- Chỉ người đã đăng nhập gọi được. `anon` (khách chưa đăng nhập) không.
revoke all on function public.luu_cay(uuid, integer, jsonb, jsonb) from public, anon;
grant execute on function public.luu_cay(uuid, integer, jsonb, jsonb) to authenticated;
