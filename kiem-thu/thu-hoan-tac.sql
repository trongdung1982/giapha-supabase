-- ============================================================
-- giapha-supabase · kiem-thu/thu-hoan-tac.sql
-- Vai trò  : ĐO ĐƯỜNG HOÀN TÁC trên cơ sở dữ liệu THẬT. Đóng vai một Thành
--            viên bấm Lưu (treo cờ chờ), rồi đóng vai Quản trị bấm Gạt, rồi
--            ĐỌC LẠI dữ liệu xem nó có quay về đúng bản cũ không.
-- Chạy ở   : Supabase → SQL Editor → New query → dán CẢ FILE → Run.
-- Phiên bản: 0.1.0 · Cập nhật: 05/09/2026 00:15
-- ============================================================
--
-- ═══ VÌ SAO PHẢI CÓ FILE NÀY ═══
--
-- `luoc-do/08-kiem-duyet.sql` viết đường hoàn tác từ 04/09/2026, và bộ kiểm
-- `kiem-thu/kiem-kiem-duyet.mjs` gác nó bằng 111 phép. Nhưng bộ kiểm ấy **đọc
-- văn bản file**, không chạy SQL — nó chứng minh được mã viết đúng khuôn, chứ
-- không chứng minh được dữ liệu quay về đúng chỗ. Trang `QuanTri.html` (b98)
-- vừa đặt một cái nút đỏ lên trên đúng đường ấy, nên câu hỏi *"hoàn tác có
-- chạy không"* từ nay là câu hỏi có hậu quả.
--
-- Cách đo đúng là **gọi thẳng hai hàm ở máy chủ rồi đọc lại bảng** — đúng
-- cách b94 đã đo phân quyền, và cùng lý lẽ: thử bằng trình duyệt không chứng
-- minh được, vì trình duyệt luôn đi qua đúng một đường đã dọn sẵn.
--
-- ═══ NÓ ĐỘNG VÀO GÌ, VÀ VÌ SAO AN TOÀN ═══
--
-- Nó **có ghi vào cơ sở dữ liệu thật** — không có cách nào đo thật mà không
-- ghi thật. Nhưng nó tự dọn, và bốn lớp bảo vệ này đặt sẵn:
--
--   1. **Chỉ đụng ghi chú của ĐÚNG MỘT người**, rồi trả lại nguyên văn. Không
--      đụng tên, ngày tháng, quan hệ.
--   2. **Người mới nó tạo ra mang mã `PTHU9`**, không trùng khuôn `P0001` của
--      app, và bị xoá ở bước dọn dù phép thử đạt hay hỏng.
--   3. **Tự tay trả mọi thứ về chỗ cũ ở cuối**, kể cả khi hoàn tác hỏng —
--      phần dọn KHÔNG dựa vào chính cái nó đang đo.
--   4. **Cả file là MỘT lệnh `do`**, tức một giao dịch. Vấp lỗi giữa chừng là
--      Postgres tự trả lại toàn bộ, không để lại nửa vời. Lúc ấy màn hình chỉ
--      hiện câu lỗi, không hiện bảng — đọc câu lỗi, đừng chạy lại vội.
--
-- ⚠ Trong lúc chạy, vai của tài khoản bạn **tạm hạ xuống `sua`** rồi nâng
--   lại. Đừng mở app bấm gì trong mấy giây ấy. Cuối file có phép đo kiểm
--   chứng vai đã trả về đúng.
--
-- ⚠ Số bản ghi (`trees.revision`) sẽ tăng vài đơn vị và **không trả lại được**
--   — đó là đúng: nó là bộ đếm chống ghi đè, không phải dữ liệu gia phả. Ai
--   đang mở app lúc này sẽ bị bảo tải lại trang ở lần Lưu kế tiếp.
--
-- ═══ ĐỌC KẾT QUẢ ═══
--
-- Bảng hiện ra ở cuối, mỗi dòng một phép đo, cột cuối là `DAT` hay `HONG`.
-- **Hàng A6 và B4 là hai hàng quan trọng nhất** — chúng trả lời đúng câu hỏi
-- của cả file: dữ liệu cũ có về không, và người mới có biến đi không.
-- Dòng `(ghi nhớ)` không phải phép đo, chỉ là số để đọc.

-- ------------------------------------------------------------
-- Chỗ đựng kết quả. Bảng tạm, mất theo phiên, không nằm trong gia phả.
-- ------------------------------------------------------------
create temp table if not exists thu_hoan_tac_kq (
  thu_tu   int,
  muc      text,
  do_duoc  text,
  mong_doi text
);
truncate thu_hoan_tac_kq;

do $thu$
declare
  v_tree     uuid;
  v_uid      uuid;
  v_email    text;
  v_vai_cu   text;
  v_nguoi_cu text;
  v_tin_cu   boolean;
  v_duyet_cu boolean;

  v_goc      text;        -- người đem ra sửa thử
  v_hang     jsonb;       -- nguyên hàng của người ấy, để dựng phép sửa
  v_note_cu  text;
  v_rev_dau  integer;
  v_rev      integer;
  v_dem_dau  integer;      -- số người trong gia phả TRƯỚC khi thử

  v_kq       jsonb;
  v_log      bigint := null;
  v_log2     bigint := null;
  v_tt       text;
  v_truoc    jsonb;

  v_ma_thu   text := 'PTHU9';
  v_dau      text := 'PHÉP THỬ HOÀN TÁC — thấy dòng này nghĩa là hoàn tác KHÔNG chạy';

  -- Hai dấu này là cách file tự nhận ra dòng nhật ký CỦA MÌNH. Xem lời giải
  -- thích ở khối A, chỗ tìm `v_log`.
  v_dau_a    text := 'PHÉP THỬ HOÀN TÁC (thu-hoan-tac.sql) · A · sửa một ô';
  v_dau_b    text := 'PHÉP THỬ HOÀN TÁC (thu-hoan-tac.sql) · B · thêm người mới';
begin
  -- ══════════════════════════════════════════════════════════
  -- 0. AI ĐANG LÀM VIỆC NÀY, VÀ TRÊN GIA PHẢ NÀO
  -- ══════════════════════════════════════════════════════════
  select id into v_tree from public.trees limit 1;
  if v_tree is null then
    raise exception 'Không có gia phả nào trong bảng trees. Dán nhầm project?';
  end if;

  -- Hai phép kiểm này chỉ để đổi một câu lỗi khó hiểu lấy một câu nói rõ phải
  -- làm gì. Thiếu chúng thì người dán nhận về "column truoc does not exist"
  -- và đi tìm nguyên nhân ở chỗ khác.
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'change_log'
                    and column_name = 'truoc') then
    raise exception 'Chưa dán luoc-do/08-kiem-duyet.sql — chưa có cột truoc thì không có gì để hoàn tác.';
  end if;

  if not exists (select 1 from pg_proc
                  where pronamespace = 'public'::regnamespace
                    and proname = 'luu_cay' and prosrc ilike '%ghi_thang%') then
    raise exception 'Chưa dán lại luoc-do/03-ham-luu-cay.sql bản 0.3.1 — luu_cay() chưa biết treo cờ chờ.';
  end if;

  select user_id, email, role, person_id, coalesce(tin_cay, false),
         coalesce(approved, false)
    into v_uid, v_email, v_vai_cu, v_nguoi_cu, v_tin_cu, v_duyet_cu
    from public.tree_members
   where tree_id = v_tree and role = 'quan_tri_he_thong'
   limit 1;

  if v_uid is null then
    raise exception 'Không tìm thấy tài khoản vai quan_tri_he_thong. Đã dán 09-doi-ma-vai.sql chưa?';
  end if;

  -- ⚠ SQL Editor không mang danh nghĩa tài khoản nào — `auth.uid()` rỗng, và
  --   với `co_the_sua()` thì nó chính là "người ngoài" (b94 đã đo). Dòng dưới
  --   mượn danh nghĩa tài khoản quản trị hệ thống ĐÚNG TRONG GIAO DỊCH NÀY
  --   (`true` = local), để hai hàm được đo nhìn thấy một người gọi thật.
  --   Đây không phải lỗ hổng: ai vào được SQL Editor thì vốn đã có toàn quyền.
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_uid::text, 'email', v_email,
                      'role', 'authenticated')::text, true);

  insert into thu_hoan_tac_kq values
    (1, '0 · máy chủ nhận ra người gọi là ai',
     coalesce(auth.uid()::text, '(rỗng)'), v_uid::text);

  -- Mượn danh nghĩa không xong thì dừng ngay, và nói ra đường đi tiếp. Không
  -- có dòng này thì phép thử vẫn chạy tiếp rồi chết ở `luu_cay()` với câu
  -- *"Phiên đăng nhập đã hết hạn"* — một câu đúng về kỹ thuật mà chẳng liên
  -- quan gì tới việc người dán vừa làm.
  if auth.uid() is distinct from v_uid then
    raise exception 'Không mượn được danh nghĩa tài khoản trong SQL Editor: auth.uid() vẫn rỗng. Phép thử này không chạy được ở đây — phải đo bằng REST như b94 đã làm.';
  end if;

  -- Người đem ra sửa: chính người mà tài khoản này gắn vào, để chắc chắn nằm
  -- trong trực hệ của chính mình ở bước đóng vai Thành viên.
  v_goc := coalesce(v_nguoi_cu,
                    (select root_person_id from public.trees where id = v_tree),
                    (select id from public.persons
                      where tree_id = v_tree and deleted = false
                      order by id limit 1));
  if v_goc is null then
    raise exception 'Gia phả chưa có người nào để thử.';
  end if;

  select note, to_jsonb(p.*) into v_note_cu, v_hang
    from public.persons p where tree_id = v_tree and id = v_goc;
  select revision into v_rev_dau from public.trees where id = v_tree;
  select count(*) into v_dem_dau from public.persons where tree_id = v_tree;

  insert into thu_hoan_tac_kq values
    (2, '0 · người đem ra thử', v_goc, null);

  -- ══════════════════════════════════════════════════════════
  -- A. SỬA MỘT Ô — hoàn tác phải trả GIÁ TRỊ CŨ về
  -- ══════════════════════════════════════════════════════════

  -- Đóng vai Thành viên thường: vai `sua`, chưa bật cờ tin cậy. Đúng hạng
  -- người mà `08-kiem-duyet.sql` bắt phải xếp hàng chờ duyệt.
  update public.tree_members
     set role = 'sua', tin_cay = false, person_id = v_goc, approved = true
   where tree_id = v_tree and user_id = v_uid;

  insert into thu_hoan_tac_kq values
    (3, 'A0 · hạng người này KHÔNG được ghi thẳng',
     public.ghi_thang(v_tree)::text, 'false');

  select revision into v_rev from public.trees where id = v_tree;

  v_kq := public.luu_cay(
    v_tree, v_rev,
    jsonb_build_object('persons', jsonb_build_object(
      'luu', jsonb_build_array(jsonb_set(v_hang, '{note}', to_jsonb(v_dau))),
      'xoa', '[]'::jsonb)),
    jsonb_build_object('action', 'update', 'target', v_goc, 'note', v_dau_a));

  -- Lưu không xong thì chưa có gì để hoàn tác. Dừng hẳn — cả giao dịch trả
  -- lại, kể cả việc vừa hạ vai ở trên.
  if coalesce(v_kq->>'ok', 'false') <> 'true' then
    raise exception 'Bước A: máy chủ không nhận lần Lưu — %', coalesce(v_kq->>'loi', v_kq::text);
  end if;

  -- ⚠ Tìm dòng nhật ký BẰNG DẤU RIÊNG, không lấy "dòng mới nhất". Bản đầu
  --   viết `order by id desc limit 1`, và nó đúng đúng chín mươi chín lần
  --   trên một trăm — lần thứ một trăm là lần `luu_cay()` gật mà không ghi
  --   nhật ký, và khi ấy phép thử sẽ đem HOÀN TÁC một lần sửa THẬT của người
  --   trong họ. Một dòng `where note = …` đổi cái rủi ro ấy lấy một câu lỗi.
  select id, trang_thai, truoc into v_log, v_tt, v_truoc
    from public.change_log
   where tree_id = v_tree and note = v_dau_a
   order by id desc limit 1;

  if v_log is null then
    raise exception 'Bước A: máy chủ nhận lần Lưu nhưng không ghi dòng nhật ký nào mang dấu phép thử.';
  end if;

  insert into thu_hoan_tac_kq values
    (4, 'A1 · lần Lưu của Thành viên bị TREO CỜ CHỜ', v_tt, 'cho');

  -- Ảnh chụp phải do MÁY CHỦ tự lấy trước khi ghi. Đây là chỗ `08` cố ý không
  -- tin `change_log.diff` — cột ấy do trình duyệt gửi lên.
  insert into thu_hoan_tac_kq values
    (5, 'A2 · máy chủ tự chụp được GIÁ TRỊ CŨ',
     coalesce(nullif(v_truoc->'persons'->0->'cu'->>'note', ''), '(trống)'),
     coalesce(nullif(v_note_cu, ''), '(trống)'));

  insert into thu_hoan_tac_kq values
    (6, 'A3 · dữ liệu ĐÃ ĐỔI thật trên bảng',
     (select case when note = v_dau then 'đã đổi' else 'CHƯA đổi' end
        from public.persons where tree_id = v_tree and id = v_goc), 'đã đổi');

  -- Đóng lại vai Quản trị hệ thống rồi bấm Gạt.
  update public.tree_members set role = 'quan_tri_he_thong'
   where tree_id = v_tree and user_id = v_uid;

  v_kq := public.tu_choi_thay_doi(v_tree, v_log,
            'Phép thử hoàn tác — kiem-thu/thu-hoan-tac.sql');

  insert into thu_hoan_tac_kq values
    (7, 'A4 · máy chủ nhận lệnh Gạt và hoàn tác',
     case when coalesce(v_kq->>'ok', 'false') = 'true' then 'true'
          else 'false — ' || coalesce(v_kq->>'loi', '(không nói lý do)') end,
     'true');

  -- ⚠ HÀNG QUAN TRỌNG NHẤT CỦA CẢ FILE.
  insert into thu_hoan_tac_kq values
    (8, 'A5 · GHI CHÚ đã quay về đúng bản cũ',
     coalesce(nullif((select note from public.persons
                       where tree_id = v_tree and id = v_goc), ''), '(trống)'),
     coalesce(nullif(v_note_cu, ''), '(trống)'));

  insert into thu_hoan_tac_kq values
    (9, 'A6 · dòng nhật ký mang cờ đã gạt',
     (select trang_thai from public.change_log where id = v_log), 'tu_choi');

  insert into thu_hoan_tac_kq values
    (10, 'A7 · lý do gạt được lưu lại',
     (select case when coalesce(ly_do_tu_choi, '') <> '' then 'có' else 'KHÔNG' end
        from public.change_log where id = v_log), 'có');

  -- ══════════════════════════════════════════════════════════
  -- B. THÊM NGƯỜI MỚI — hoàn tác phải LẤY NGƯỜI ẤY ĐI
  -- ══════════════════════════════════════════════════════════
  -- Nhánh khác hẳn nhánh A: ở A máy chủ ghi đè giá trị cũ trở lại, ở B nó
  -- phải XOÁ một dòng chưa từng tồn tại trước lần Lưu. Nhận ra hai ca ấy dựa
  -- vào `cu` trong ảnh chụp là `null` hay là một object — đúng cái bẫy
  -- `to_jsonb` mà `kiem-kiem-duyet.mjs` phép 2 gác.

  update public.tree_members set role = 'sua', tin_cay = false
   where tree_id = v_tree and user_id = v_uid;

  select revision into v_rev from public.trees where id = v_tree;

  v_kq := public.luu_cay(
    v_tree, v_rev,
    jsonb_build_object('persons', jsonb_build_object(
      'luu', jsonb_build_array(v_hang || jsonb_build_object(
        'id', v_ma_thu, 'uid', 'THU-HOAN-TAC',
        'note', 'Người của phép thử — phải biến mất sau khi gạt')),
      'xoa', '[]'::jsonb)),
    jsonb_build_object('action', 'create', 'target', v_ma_thu, 'note', v_dau_b));

  if coalesce(v_kq->>'ok', 'false') <> 'true' then
    raise exception 'Bước B: máy chủ không nhận lần Lưu — %', coalesce(v_kq->>'loi', v_kq::text);
  end if;

  select id into v_log2 from public.change_log
   where tree_id = v_tree and note = v_dau_b
   order by id desc limit 1;

  if v_log2 is null then
    raise exception 'Bước B: không tìm thấy dòng nhật ký mang dấu phép thử.';
  end if;

  insert into thu_hoan_tac_kq values
    (11, 'B1 · người mới đã có mặt trong bảng',
     (select count(*)::text from public.persons
       where tree_id = v_tree and id = v_ma_thu), '1');

  update public.tree_members set role = 'quan_tri_he_thong'
   where tree_id = v_tree and user_id = v_uid;

  v_kq := public.tu_choi_thay_doi(v_tree, v_log2, 'Phép thử hoàn tác — người mới');

  insert into thu_hoan_tac_kq values
    (12, 'B2 · máy chủ nhận lệnh Gạt lần hai',
     case when coalesce(v_kq->>'ok', 'false') = 'true' then 'true'
          else 'false — ' || coalesce(v_kq->>'loi', '(không nói lý do)') end,
     'true');

  -- ⚠ HÀNG QUAN TRỌNG THỨ HAI.
  insert into thu_hoan_tac_kq values
    (13, 'B3 · người mới đã BIẾN MẤT',
     (select count(*)::text from public.persons
       where tree_id = v_tree and id = v_ma_thu), '0');

  -- ══════════════════════════════════════════════════════════
  -- C. DỌN — không dựa vào chính cái vừa đo
  -- ══════════════════════════════════════════════════════════
  -- Nếu hoàn tác chạy đúng thì ba lệnh đầu ở đây chẳng đụng dòng nào. Nếu nó
  -- hỏng, đây là thứ trả gia phả về nguyên vẹn. Cố ý KHÔNG viết `if hỏng
  -- then dọn` — dọn vô điều kiện thì không có nhánh nào để quên.

  update public.persons set note = v_note_cu
   where tree_id = v_tree and id = v_goc and note <> v_note_cu;

  delete from public.persons where tree_id = v_tree and id = v_ma_thu;

  -- Hai dòng nhật ký này là phép thử, không phải lịch sử của gia phả. Để lại
  -- thì tấm lọc "Đã gạt" trên `QuanTri.html` mở ra toàn rác thử nghiệm.
  delete from public.change_log
   where tree_id = v_tree and id in (coalesce(v_log, -1), coalesce(v_log2, -1));

  update public.tree_members
     set role = v_vai_cu, tin_cay = v_tin_cu, person_id = v_nguoi_cu,
         approved = v_duyet_cu
   where tree_id = v_tree and user_id = v_uid;

  select revision into v_rev from public.trees where id = v_tree;

  insert into thu_hoan_tac_kq values
    (14, 'DỌN · vai trò tài khoản đã trả về như cũ',
     (select role from public.tree_members
       where tree_id = v_tree and user_id = v_uid), v_vai_cu),
    (15, 'DỌN · gắn mã người đã trả về như cũ',
     coalesce((select person_id from public.tree_members
                where tree_id = v_tree and user_id = v_uid), '(không gắn)'),
     coalesce(v_nguoi_cu, '(không gắn)')),
    (16, 'DỌN · không còn dấu vết người thử',
     (select count(*)::text from public.persons
       where tree_id = v_tree and id = v_ma_thu), '0'),
    (17, 'DỌN · hai dòng nhật ký thử đã bỏ',
     (select count(*)::text from public.change_log
       where tree_id = v_tree and id in (coalesce(v_log, -1), coalesce(v_log2, -1))), '0'),
    (18, 'DỌN · số người trong gia phả không đổi',
     (select count(*)::text from public.persons where tree_id = v_tree),
     v_dem_dau::text),
    (19, '(ghi nhớ) số bản ghi revision đã tăng',
     v_rev_dau::text || ' → ' || v_rev::text, null);
end
$thu$;

-- ------------------------------------------------------------
-- Bảng kết quả. Cột cuối là thứ phải đọc.
-- ------------------------------------------------------------
select thu_tu                                as "#",
       muc                                   as "Phép đo",
       do_duoc                               as "Đo được",
       coalesce(mong_doi, '—')               as "Mong đợi",
       case when mong_doi is null            then '(ghi nhớ)'
            when do_duoc is not distinct from mong_doi then 'DAT'
            else 'HONG' end                  as "Kết"
  from thu_hoan_tac_kq
 order by thu_tu;
