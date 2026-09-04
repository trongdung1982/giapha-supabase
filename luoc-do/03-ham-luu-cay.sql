-- ============================================================
-- giapha-supabase · luoc-do/03-ham-luu-cay.sql
-- Vai trò  : CỬA GHI DUY NHẤT vào dữ liệu gia phả.
-- Chạy ở   : Supabase → SQL Editor. Chạy SAU 02-rls.sql.
-- ⚠ TỪ 04/09/2026 phải chạy lại file này SAU 06-quyen-truc-he.sql. Hàng rào 4
--   đổi từ "giới hạn theo nhánh" sang "giới hạn theo TRỰC HỆ"; bản cũ truyền
--   `branch_id` (luôn null) vào hàm quyết quyền mới nên KHÔNG AI LƯU ĐƯỢC GÌ.
-- ⚠ VÀ phải chạy lại SAU 08-kiem-duyet.sql. Bản 0.3.0 chụp ảnh dữ liệu cũ vào
--   `change_log.truoc` và treo cờ `trang_thai`; hai cột ấy do 08 dựng ra.
-- Phiên bản: 0.3.1 · Cập nhật: 04/09/2026 22:45
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
  v_ngoai      text;
  v_pham_vi    text[];      -- null = KHÔNG giới hạn (hai hạng quản trị). Xem hàng rào 4.
  v_tree       jsonb;
  v_truoc      jsonb;       -- ảnh chụp dữ liệu CŨ. Xem khối "CHỤP ẢNH" dưới.
  v_imports    jsonb;       -- mã những dòng sổ nhập lần Lưu này đẻ ra
  v_trang_thai text;        -- 'duyet' hay 'cho'. Xem 08-kiem-duyet.sql mục 4.
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
    -- Vai `sua` mà vẫn trượt nghĩa là chưa gắn mã người, hoặc quản trị viên chưa
    -- duyệt. Đó là hai tình cảnh khác hẳn "người chỉ có quyền xem", và người
    -- gặp nó cần biết phải làm gì tiếp — nói chung một câu là họ đi hỏi vòng.
    if public.vai_tro(p_tree_id) = 'sua' then
      return jsonb_build_object('ok', false, 'lyDo', 'chuaduyet',
        'loi', 'Tài khoản của bạn chưa được gắn với một người trong gia phả, '
            || 'hoặc quản trị viên chưa duyệt. Trong lúc chờ, bạn vẫn xem '
            || 'được toàn bộ gia phả.');
    end if;
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

  -- ══ HÀNG RÀO 4 — giới hạn theo TRỰC HỆ ══
  --
  -- Luật và lý do chọn nó: `06-quyen-truc-he.sql` mục 1. Ở đây chỉ thi hành.
  --
  -- Tính phạm vi MỘT lần rồi giữ vào mảng. Gọi `co_the_sua_nguoi()` cho từng
  -- dòng cũng ra kết quả ấy, nhưng mỗi dòng chạy lại một truy vấn đệ quy trên
  -- cả cây.
  --
  -- ⚠ `null` ở đây nghĩa là KHÔNG GIỚI HẠN, không phải "phạm vi rỗng". Lẫn
  --   hai thứ ấy thì quản trị hệ thống thành người không sửa được gì — hoặc tệ hơn,
  --   ngược lại.
  if public.vai_tro(p_tree_id) in ('quan_tri_he_thong', 'quan_tri') then
    v_pham_vi := null;
  else
    v_pham_vi := array(
      select pv.person_id
        from public.pham_vi_sua(p_tree_id, public.nguoi_gan(p_tree_id)) pv);
  end if;

  if v_pham_vi is not null then
    -- ── 4a. NGƯỜI gửi lên ───────────────────────────────────────────────
    -- Người MỚI cho qua: họ chưa tồn tại nên chưa thuộc phạm vi của ai, và
    -- `luu_cay()` là đường duy nhất tạo ra họ. Người ĐÃ CÓ thì phải nằm
    -- trong phạm vi.
    select p.id into v_ngoai
      from jsonb_populate_recordset(null::public.persons, v_persons) p
     where not (p.id = any(v_pham_vi))
       and exists (select 1 from public.persons cu
                    where cu.tree_id = p_tree_id and cu.id = p.id)
     limit 1;
    if v_ngoai is not null then
      return jsonb_build_object('ok', false, 'lyDo', 'ngoaiphamvi',
        'loi', 'Người ' || v_ngoai || ' không thuộc trực hệ của bạn nên bạn '
            || 'không sửa được. Nhờ quản trị viên nếu cần.');
    end if;

    -- ── 4b. NGƯỜI bị xoá ────────────────────────────────────────────────
    select cu.id into v_ngoai
      from public.persons cu
     where cu.tree_id = p_tree_id
       and cu.id in (select jsonb_array_elements_text(
                              coalesce(p_ops->'persons'->'xoa','[]'::jsonb)))
       and not (cu.id = any(v_pham_vi))
     limit 1;
    if v_ngoai is not null then
      return jsonb_build_object('ok', false, 'lyDo', 'ngoaiphamvi',
        'loi', 'Người ' || v_ngoai || ' không thuộc trực hệ của bạn nên bạn '
            || 'không xoá được.');
    end if;

    -- ── 4c. QUAN HỆ — chỗ quên là chỗ thủng ─────────────────────────────
    --
    -- Bản cũ của hàng rào này chỉ xét NGƯỜI, và ghi lại lý do phải xét cả
    -- hai phía: *"sửa nhánh là một cách sửa người"*. Với luật trực hệ câu ấy
    -- còn đúng hơn nữa, vì phạm vi KHÔNG nằm trong một cột mà mọc ra từ
    -- chính các cạnh quan hệ:
    --
    --   Tôi khai cụ tổ là bố tôi  →  cụ tổ thành tổ tiên trực hệ của tôi
    --                             →  lần lưu sau tôi sửa được cụ tổ.
    --
    -- Không xét cạnh thì đó là đường leo quyền chỉ mất hai lần bấm Lưu, và
    -- không sinh ra một dòng lỗi nào. Nên: mọi cạnh đụng tới đều phải có
    -- MỌI người đang-tồn-tại của nó nằm trong phạm vi.
    --
    -- ⚠ Phạm vi tính trên dữ liệu CŨ, trước khi ghi. Tính trên dữ liệu mới
    --   thì cạnh vừa khai ra đã tự cấp quyền cho chính nó.

    -- Hôn nhân gửi lên: partner nào đã tồn tại đều phải trong phạm vi.
    -- (Partner MỚI thì chưa tồn tại — đó là ca "thêm vợ/chồng", được phép.)
    select u.id into v_ngoai
      from jsonb_populate_recordset(null::public.unions, v_unions) u
     where exists (select 1 from public.persons px
                    where px.tree_id = p_tree_id
                      and px.id = any(u.partners)
                      and not (px.id = any(v_pham_vi)))
     limit 1;
    if v_ngoai is not null then
      return jsonb_build_object('ok', false, 'lyDo', 'ngoaiphamvi',
        'loi', 'Hôn nhân ' || v_ngoai || ' có người ngoài trực hệ của bạn.');
    end if;

    -- Hôn nhân ĐANG CÓ mà bị sửa hoặc xoá: xét partner CŨ của nó.
    select cu.id into v_ngoai
      from public.unions cu
     where cu.tree_id = p_tree_id
       and (cu.id in (select u.id
                        from jsonb_populate_recordset(null::public.unions, v_unions) u)
         or cu.id in (select jsonb_array_elements_text(
                               coalesce(p_ops->'unions'->'xoa','[]'::jsonb))))
       and exists (select 1 from public.persons px
                    where px.tree_id = p_tree_id
                      and px.id = any(cu.partners)
                      and not (px.id = any(v_pham_vi)))
     limit 1;
    if v_ngoai is not null then
      return jsonb_build_object('ok', false, 'lyDo', 'ngoaiphamvi',
        'loi', 'Hôn nhân ' || v_ngoai || ' đang có người ngoài trực hệ của bạn.');
    end if;

    -- Quan hệ cha mẹ–con gửi lên: đứa con đã tồn tại thì phải trong phạm vi.
    select uc.person_id into v_ngoai
      from jsonb_populate_recordset(null::public.union_children, v_children) uc
     where not (uc.person_id = any(v_pham_vi))
       and exists (select 1 from public.persons cu
                    where cu.tree_id = p_tree_id and cu.id = uc.person_id)
     limit 1;
    if v_ngoai is not null then
      return jsonb_build_object('ok', false, 'lyDo', 'ngoaiphamvi',
        'loi', 'Không gắn được người ' || v_ngoai || ' làm con: người ấy '
            || 'không thuộc trực hệ của bạn.');
    end if;

    -- …và cái union mà nó gắn vào cũng vậy. ĐÂY là chỗ chặn "khai cụ tổ làm
    -- bố tôi": union của cụ tổ đang có partner ngoài phạm vi của tôi.
    select uc.union_id into v_ngoai
      from jsonb_populate_recordset(null::public.union_children, v_children) uc
     where exists (select 1 from public.unions un
                    join public.persons px
                      on px.tree_id = p_tree_id and px.id = any(un.partners)
                   where un.tree_id = p_tree_id and un.id = uc.union_id
                     and not (px.id = any(v_pham_vi)))
     limit 1;
    if v_ngoai is not null then
      return jsonb_build_object('ok', false, 'lyDo', 'ngoaiphamvi',
        'loi', 'Hôn nhân ' || v_ngoai || ' ngoài trực hệ của bạn nên bạn '
            || 'không thêm bớt con của họ được.');
    end if;

    -- Gỡ một đứa con ra khỏi hôn nhân: xét cả hai đầu của cạnh bị gỡ.
    select x.person_id into v_ngoai
      from jsonb_to_recordset(coalesce(p_ops->'children'->'xoa','[]'::jsonb))
           as x(union_id text, person_id text)
     where not (x.person_id = any(v_pham_vi))
        or exists (select 1 from public.unions un
                    join public.persons px
                      on px.tree_id = p_tree_id and px.id = any(un.partners)
                   where un.tree_id = p_tree_id and un.id = x.union_id
                     and not (px.id = any(v_pham_vi)))
     limit 1;
    if v_ngoai is not null then
      return jsonb_build_object('ok', false, 'lyDo', 'ngoaiphamvi',
        'loi', 'Quan hệ cha mẹ–con của người ' || v_ngoai || ' nằm ngoài '
            || 'trực hệ của bạn.');
    end if;
  end if;

  -- ══ CHỤP ẢNH DỮ LIỆU CŨ — phải đứng TRƯỚC mọi lệnh ghi ══
  --
  -- Đây là thứ duy nhất hoàn tác được một lần Lưu bị từ chối
  -- (`08-kiem-duyet.sql` mục 7). Ba điều phải đúng:
  --
  -- ⚠ 1. **Máy chủ tự chụp.** Không đọc `p_mo_ta->'diff'` — cột ấy do trình
  --      duyệt gửi lên và mặc định rỗng. Dựa vào nó để hoàn tác là để chính
  --      người sửa tự khai mình đã sửa gì. Cùng lý lẽ với `ts`/`by`.
  --
  -- ⚠ 2. **`cu` là `null` nghĩa là DÒNG ẤY CHƯA TỪNG TỒN TẠI**, tức hoàn tác
  --      là xoá nó đi. Nên `left join` không tìm thấy PHẢI cho ra `null` chứ
  --      không phải một object toàn khoá rỗng — mà `to_jsonb(cu.*)` trên một
  --      dòng không khớp lại cho ra đúng cái object toàn `null` ấy. Cái `case`
  --      dưới đây là chỗ chặn, và bỏ nó đi thì hoàn tác sẽ chèn vào bảng một
  --      người không tên, không giới tính, thay vì bỏ người ấy đi.
  --
  -- ⚠ 3. **Xoá một người hay một hôn nhân là CASCADE cắt luôn `union_children`**
  --      (`01-bang.sql` dòng 217-218). Những cạnh bị cắt kiểu ấy không nằm
  --      trong `p_ops` nên phải tự đi tìm — nhánh thứ ba của khối `children`.
  --      Thiếu nó thì hoàn tác một lần Dọn thùng rác sẽ trả người về mà không
  --      trả lại chỗ đứng của họ trong gia đình.

  select jsonb_build_object(

    'persons', (
      select coalesce(jsonb_agg(jsonb_build_object('id', k.id, 'cu',
               case when cu.tree_id is null then 'null'::jsonb
                    else to_jsonb(cu.*) end)), '[]'::jsonb)
        from (
          select p.id
            from jsonb_populate_recordset(null::public.persons, v_persons) p
          union
          select jsonb_array_elements_text(
                   coalesce(p_ops->'persons'->'xoa', '[]'::jsonb))
        ) k
        left join public.persons cu
          on cu.tree_id = p_tree_id and cu.id = k.id),

    'unions', (
      select coalesce(jsonb_agg(jsonb_build_object('id', k.id, 'cu',
               case when cu.tree_id is null then 'null'::jsonb
                    else to_jsonb(cu.*) end)), '[]'::jsonb)
        from (
          select u.id
            from jsonb_populate_recordset(null::public.unions, v_unions) u
          union
          select jsonb_array_elements_text(
                   coalesce(p_ops->'unions'->'xoa', '[]'::jsonb))
        ) k
        left join public.unions cu
          on cu.tree_id = p_tree_id and cu.id = k.id),

    'children', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'union_id', k.union_id, 'person_id', k.person_id, 'cu',
               case when cu.tree_id is null then 'null'::jsonb
                    else to_jsonb(cu.*) end)), '[]'::jsonb)
        from (
          select uc.union_id, uc.person_id
            from jsonb_populate_recordset(null::public.union_children, v_children) uc
          union
          select x.union_id, x.person_id
            from jsonb_to_recordset(coalesce(p_ops->'children'->'xoa','[]'::jsonb))
                 as x(union_id text, person_id text)
          union
          -- Cạnh sắp bị CASCADE cắt theo người / hôn nhân bị xoá cứng.
          select c2.union_id, c2.person_id
            from public.union_children c2
           where c2.tree_id = p_tree_id
             and (c2.union_id in (select jsonb_array_elements_text(
                    coalesce(p_ops->'unions'->'xoa', '[]'::jsonb)))
               or c2.person_id in (select jsonb_array_elements_text(
                    coalesce(p_ops->'persons'->'xoa', '[]'::jsonb))))
        ) k
        left join public.union_children cu
          on cu.tree_id = p_tree_id
         and cu.union_id = k.union_id and cu.person_id = k.person_id),

    'media', (
      select coalesce(jsonb_agg(jsonb_build_object('id', k.id, 'cu',
               case when cu.tree_id is null then 'null'::jsonb
                    else to_jsonb(cu.*) end)), '[]'::jsonb)
        from (
          select m.id
            from jsonb_populate_recordset(null::public.media, v_media) m
          union
          select jsonb_array_elements_text(
                   coalesce(p_ops->'media'->'xoa', '[]'::jsonb))
        ) k
        left join public.media cu
          on cu.tree_id = p_tree_id and cu.id = k.id),

    'sources', (
      select coalesce(jsonb_agg(jsonb_build_object('id', k.id, 'cu',
               case when cu.tree_id is null then 'null'::jsonb
                    else to_jsonb(cu.*) end)), '[]'::jsonb)
        from (
          select s.id
            from jsonb_populate_recordset(null::public.sources, v_sources) s
          union
          select jsonb_array_elements_text(
                   coalesce(p_ops->'sources'->'xoa', '[]'::jsonb))
        ) k
        left join public.sources cu
          on cu.tree_id = p_tree_id and cu.id = k.id),

    -- Ba trường của khối cây. Chỉ chụp khi lần Lưu này thật sự đụng tới —
    -- có `tree` trong `p_ops` — để hoàn tác không đụng vào thứ nó không sửa.
    --
    -- ⚠ `luu_cay()` dùng `coalesce` khi ghi ba trường này, nên nó KHÔNG bao
    --   giờ xoá trắng được một trường. Đường hoàn tác dưới đây dùng đúng
    --   `coalesce` ấy, nên hai chiều cân nhau — cố ý, đừng "sửa" một bên.
    'tree', case
      when jsonb_typeof(coalesce(p_ops->'tree', 'null'::jsonb)) = 'object'
      then (select jsonb_build_object('name', t.name,
                                      'root_person_id', t.root_person_id,
                                      'note', t.note)
              from public.trees t where t.id = p_tree_id)
      else 'null'::jsonb end

  ) into v_truoc;

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
  -- ⚠ Sổ nhập chỉ mọc thêm nên nó không có bản "cũ" để chụp. Thứ hoàn tác cần
  --   là MÃ những dòng vừa đẻ ra — giữ riêng vào `truoc.imports_moi`. Để lại
  --   một dòng nhập của lần Lưu bị gạt là nói dối: lần nhập lại cùng file sau
  --   này sẽ tra bảng ánh xạ ấy và tưởng đã nhập rồi.
  with them as (
    insert into public.imports (tree_id, by_email, file, source, source_name,
                                exporter, counts, map)
    select p_tree_id, v_email,
           coalesce(e->>'file',''), coalesce(e->>'source',''),
           coalesce(e->>'source_name',''), coalesce(e->>'exporter',''),
           coalesce(e->'counts','{}'::jsonb), coalesce(e->'map','[]'::jsonb)
      from jsonb_array_elements(coalesce(p_ops->'imports','[]'::jsonb)) e
    returning id
  )
  select coalesce(jsonb_agg(them.id), '[]'::jsonb) into v_imports from them;

  v_truoc := v_truoc || jsonb_build_object('imports_moi', v_imports);

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
  --   thì hai trường ấy nằm trong `p_mo_ta` và không được đọc tới. Từ 0.3.0
  --   `truoc` và `trang_thai` cũng vậy — cả ba đều là những thứ người gửi
  --   không được phép tự khai.
  --
  -- ⚠ `ghi_thang()` trả lời "lần Lưu này thành chính thức ngay hay phải chờ
  --   duyệt" (`08-kiem-duyet.sql` mục 4). Dữ liệu ĐÃ nằm trong bảng dù trả
  --   lời thế nào — chủ dự án chọn "ghi thẳng rồi duyệt sau", nên cái cờ này
  --   không chặn gì cả, nó chỉ xếp hàng cho admin xem.
  v_trang_thai := case when public.ghi_thang(p_tree_id) then 'duyet' else 'cho' end;

  insert into public.change_log (tree_id, by_email, user_id, action, target,
                                 note, diff, revision, truoc, trang_thai,
                                 duyet_boi, duyet_luc)
  values (p_tree_id, v_email, auth.uid(),
          coalesce(p_mo_ta->>'action', 'update'),
          coalesce(p_mo_ta->>'target', ''),
          coalesce(p_mo_ta->>'note', ''),
          coalesce(p_mo_ta->'diff', '{}'::jsonb),
          v_rev_moi, v_truoc, v_trang_thai,
          case when v_trang_thai = 'duyet' then v_email end,
          case when v_trang_thai = 'duyet' then now()   end);

  return jsonb_build_object('ok', true, 'lyDo', null, 'loi', null,
                            'revision', v_rev_moi, 'tree', v_tree,
                            'trangThai', v_trang_thai);
end;
$$;

-- Chỉ người đã đăng nhập gọi được. `anon` (khách chưa đăng nhập) không.
revoke all on function public.luu_cay(uuid, integer, jsonb, jsonb) from public, anon;
grant execute on function public.luu_cay(uuid, integer, jsonb, jsonb) to authenticated;
