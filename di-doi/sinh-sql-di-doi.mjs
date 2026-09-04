// ============================================================
// giapha-supabase · di-doi/sinh-sql-di-doi.mjs
// Vai trò  : Đọc một file gia phả `giapha-json` và sinh ra MỘT file `.sql`
//            để dán vào Supabase → SQL Editor. Đây là bước di dời dữ liệu
//            (H5) từ bản Apps Script sang bản Supabase.
// Chạy     : cd supabase/di-doi && node sinh-sql-di-doi.mjs --file … --ma-cay …
// Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 09:31
// ============================================================
//
// ═══ VÌ SAO KHÔNG ĐI ĐƯỜNG GEDCOM ═══
//
// Chủ dự án hỏi đúng câu (04/09/2026): *"chỉ cần nhập file GEDCOM xuất từ app
// trên GAS thôi chứ?"*. GEDCOM là đường đúng để đi sang **phần mềm khác**,
// nhưng ở đây hai đầu là **cùng một app, cùng một khuôn JSON** — nên bắt dữ
// liệu chui qua một khuôn hẹp hơn rồi phình lại là mất mát tự nguyện:
//
//   • `changeLog` không có chỗ trong GEDCOM → mất danh sách **mã đã dùng**,
//     và `utils/id.js` sẽ cấp lại mã cũ cho người mới. Không có gì báo lỗi.
//   • Bản ghi mang cờ `deleted` **không xuất** (luật 2 của đường xuất) → cả
//     thùng rác biến mất.
//   • `meta` (ai tạo, ai sửa, lúc nào) không có thẻ tương ứng.
//   • Sổ nhập `imports` — bảng ánh xạ uid của những lần nhập trước — mất.
//   • Ảnh **cố ý không nhập** (luật 3 của đường nhập).
//   • Và mặc định xuất là **ẩn chi tiết người còn sống**: quên bỏ chọn thì
//     ngày sinh, ghi chú, tên phụ, ngày giỗ của người đang sống lặng lẽ mất.
//
// Cộng thêm một chuyện thực tế: nhập `.ged` để **tạo gia phả mới** gọi
// `repo.taoGiaPhaMoi()`, mà bản Supabase của hàm ấy còn trả `lyDo: 'chualam'`.
//
// ═══ VÌ SAO SINH SQL, KHÔNG VIẾT SCRIPT ĐĂNG NHẬP ═══
//
// Bản nháp đầu của bước này là một script Node tự đăng nhập vào Supabase rồi
// gọi `luu_cay()`. Bỏ, vì ba lẽ:
//
//   1. Nó cần **mật khẩu** của một tài khoản có quyền sửa. Thêm một chỗ nữa
//      để mật khẩu đi lạc, đổi lấy một việc chỉ làm ĐÚNG MỘT LẦN.
//   2. Đi qua `luu_cay()` thì `ts` và `by` của nhật ký **bị máy chủ ghi đè**
//      thành người đang chạy script (`03-ham-luu-cay.sql`, hàng rào cuối).
//      Ghi thẳng vào bảng thì giữ được nguyên văn ngày và người sửa của bản
//      Apps Script — bản này **trung thực hơn**, không phải tiện hơn.
//   3. Chủ dự án đã dán 5 file SQL vào SQL Editor. Đây là thao tác đã biết,
//      không phải thao tác mới.
//
// ⚠ Ghi thẳng vào bảng là **cố ý phá lệ "cửa ghi duy nhất"**, và chỉ được
//   phép vì đây là việc một lần, do chính chủ dự án dán tay, ngoài app. Không
//   có đường nào từ trình duyệt tới file này. Ngày nào thấy app gọi tới đây
//   là ngày ranh giới đã vỡ.
//
// ═══ FILE `.sql` SINH RA ĐI ĐÂU ═══
//
// ⚠ **KHÔNG được để trong `supabase/`.** Repo ấy Public, mà file sinh ra chứa
//   TOÀN BỘ gia phả. Hôm nay dữ liệu là giả nên không sao; ngày nhập dữ liệu
//   thật thì đẩy nhầm một lần là không gỡ lại được — lịch sử git giữ cả bản
//   đã xoá. Mặc định của script là ghi ra `tai-lieu/`, nằm ngoài repo.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, basename } from 'node:path';
import { boCay } from '../js/services/hinh-dang.js';
import { sinhUid } from '../js/utils/id.js';
import { DATA_VERSION } from '../js/config.js';

const DAY = dirname(fileURLToPath(import.meta.url));

// Mã cây giả gắn tạm vào mọi dòng. `boCay()` đòi một mã cây, nhưng mã THẬT
// (uuid) thì chỉ Supabase biết — nên file SQL tra nó ra theo `tree_code` lúc
// chạy, rồi `public.gan_ma_cay()` ghi đè lên chỗ này. Nhờ vậy không ai phải
// chép tay một chuỗi uuid, và không có cái sai "dán nhầm mã cây khác".
const MA_CAY_TAM = '00000000-0000-4000-8000-000000000000';

// Nhãn của dấu nháy đô-la. Dùng nó thay dấu nháy đơn nên chuỗi bên trong
// KHÔNG phải nhân đôi dấu nháy — tức không có phép thoát nào để mà làm sai.
const RAO = '$giapha$';

// Múi giờ Việt Nam. Dấu thời gian trong file JSON là giờ địa phương, không
// mang múi giờ; ghi vào `timestamptz` mà không nói múi thì Postgres hiểu theo
// múi của máy chủ (UTC) và mọi mốc lệch đi 7 tiếng.
const MUI_GIO = '+07';

// ============================================================
// ĐỌC VÀ KIỂM FILE NGUỒN
// ============================================================

/**
 * Đọc chuỗi JSON thành cây, và từ chối sớm nếu nó không phải thứ ta tưởng.
 *
 * ⚠ Từ chối SỚM là cả điểm của hàm này. Một file sai khuôn mà đi lọt tới bước
 *   sinh SQL thì cái sai ấy biến thành một file `.sql` trông rất bình thường,
 *   và nó chỉ lộ mặt lúc đã dán vào cơ sở dữ liệu thật.
 */
export function docCay(chu, ten = 'file nguồn') {
  let cay;
  try {
    cay = JSON.parse(chu);
  } catch (e) {
    throw new Error(ten + ' không phải JSON đọc được: ' + e.message);
  }
  if (!cay || typeof cay !== 'object') {
    throw new Error(ten + ' không chứa một object nào.');
  }
  if (cay.format !== 'giapha-json') {
    throw new Error(ten + ' không mang dấu "format": "giapha-json" — đây ' +
      'không phải file gia phả của app này.');
  }
  const v = Number(cay.version);
  if (!Number.isFinite(v)) {
    throw new Error(ten + ' không ghi số phiên bản dữ liệu ("version").');
  }
  if (v > DATA_VERSION) {
    throw new Error(ten + ' là phiên bản dữ liệu ' + v + ', mới hơn app ' +
      '(phiên bản ' + DATA_VERSION + '). Nâng app trước, đừng đổ vào bảng.');
  }
  if (!cay.tree || typeof cay.tree !== 'object') {
    throw new Error(ten + ' thiếu khối "tree".');
  }
  if (!Array.isArray(cay.persons) || cay.persons.length === 0) {
    throw new Error(ten + ' không có người nào. Không di dời một cây rỗng.');
  }
  for (const b of cay.persons) {
    if (!b || !b.id) throw new Error(ten + ' có một người không mang mã "id".');
  }
  for (const u of cay.unions || []) {
    if (!u || !u.id) throw new Error(ten + ' có một hôn nhân không mang mã "id".');
  }
  return cay;
}

/**
 * Điền `uid` cho bản ghi nào còn thiếu. **Đây là chỗ ĐÚNG để làm việc ấy**,
 * và `services/repo.canhBaoThieuUid()` nói rõ vì sao không để app tự điền:
 *
 *   App chỉ gửi lên phần KHÁC BIỆT, mà khác biệt tính bằng cách so với bản
 *   đã điền — nên uid app tự điền **không bao giờ** xuống tới cơ sở dữ liệu.
 *   Mỗi lần mở app lại điền lại, lần nào cũng "thành công", và không ai biết
 *   chúng chưa từng được ghi.
 *
 * `sinhUid` là hàm thuần: cùng `maCay` + cùng mã người thì luôn ra cùng một
 * uid. Nhờ thế chạy bộ sinh hai lần ra hai file giống hệt nhau.
 *
 * @returns {number} số bản ghi vừa được điền
 */
export function dienUid(cay, maCay) {
  let dem = 0;
  for (const ten of ['persons', 'unions']) {
    for (const b of cay[ten] || []) {
      if (!b || !b.id) continue;
      if (typeof b.uid === 'string' && b.uid) continue;
      b.uid = sinhUid(maCay, b.id);
      dem++;
    }
  }
  return dem;
}

/**
 * `dd/mm/yyyy HH:mm` → chuỗi Postgres đọc được, kèm múi giờ Việt Nam.
 * Không đọc được thì trả `null`; câu SQL đã có `coalesce(…, now())` đỡ.
 */
export function isoTuDau(dau) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2}))?/.exec(String(dau || '').trim());
  if (!m) return null;
  const gio = m[4] || '00';
  const phut = m[5] || '00';
  return m[3] + '-' + m[2] + '-' + m[1] + ' ' + gio + ':' + phut + ':00' + MUI_GIO;
}

/**
 * Nhật ký thay đổi → dòng bảng `change_log`, GIỮ NGUYÊN `ts` và `by`.
 *
 * ⚠ Đây là thứ đường GEDCOM không mang nổi, và cũng là thứ `luu_cay()` sẽ ghi
 *   đè nếu đi cửa ấy. `04-view-ma-da-dung.sql` gom `target` cùng các KHOÁ của
 *   `diff` thành danh sách mã đã dùng, nên mất bảng này là `utils/id.js` cấp
 *   lại mã của người cũ cho người mới — kiểu hỏng im lặng nhất trong gia phả.
 */
export function nhatKyRa(cay) {
  return (cay.changeLog || []).map((m) => ({
    ts:       isoTuDau(m && m.ts),
    by_email: (m && m.by) || '',
    action:   (m && m.action) || 'migrate',
    target:   (m && m.target) || '',
    note:     (m && m.note) || '',
    diff:     (m && m.diff) || {},
    revision: 0,
  }));
}

/** Sổ nhập → dòng bảng `imports`. Cây lập trước 29/08/2026 không có mảng này. */
export function soNhapRa(cay) {
  return (cay.imports || []).map((e) => ({
    at:          isoTuDau(e && e.at),
    by_email:    (e && e.by) || '',
    file:        (e && e.file) || '',
    source:      (e && e.source) || '',
    source_name: (e && e.sourceName) || '',
    exporter:    (e && e.exporter) || '',
    counts:      (e && e.counts) || {},
    map:         (e && e.map) || [],
  }));
}

// ============================================================
// SINH SQL
// ============================================================

/** Một mảng object → chuỗi JSON đặt giữa hai dấu rào đô-la. */
function khoi(ds) {
  const chu = JSON.stringify(ds, null, 0);
  // ⚠ Dấu rào lọt vào giữa dữ liệu là câu SQL đứt làm đôi — và phần đuôi khi
  //   ấy lại là SQL hợp lệ theo một nghĩa khác. Chặn ở đây, đừng để tới máy chủ.
  if (chu.includes(RAO)) {
    throw new Error('Dữ liệu có chứa chuỗi ' + RAO + ' — đổi hằng số RAO ' +
      'trong sinh-sql-di-doi.mjs rồi sinh lại.');
  }
  return RAO + chu + RAO;
}

/**
 * Sinh trọn nội dung file `.sql`.
 *
 * @param {object} cay   cây đã đọc và đã điền uid
 * @param {{maCay:string, tenNguon:string, luc:string}} tuyChon
 * @returns {{sql:string, dem:object}}
 */
export function sinhSql(cay, tuyChon) {
  const maCay = tuyChon.maCay;
  if (!/^[A-Z0-9_]+$/.test(maCay || '')) {
    throw new Error('Mã cây "' + maCay + '" sai khuôn. Chỉ chữ HOA, chữ số ' +
      'và gạch dưới — đúng ràng buộc tree_code_hop_le của 01-bang.sql.');
  }

  const dong    = boCay(cay, MA_CAY_TAM);
  const nhatKy  = nhatKyRa(cay);
  const soNhap  = soNhapRa(cay);
  const goc     = (cay.tree.rootPersonId || '').trim();

  // Mã cây tạm bị `gan_ma_cay()` ghi đè lúc chạy, nên bỏ nó ra khỏi file cho
  // khỏi ai tưởng đó là mã thật rồi đi sửa tay.
  const bo = (ds) => ds.map((d) => {
    const { tree_id, ...con } = d;   // eslint-disable-line no-unused-vars
    return con;
  });

  const dem = {
    persons:        dong.persons.length,
    unions:         dong.unions.length,
    union_children: dong.children.length,
    media:          dong.media.length,
    sources:        dong.sources.length,
    imports:        soNhap.length,
    change_log:     nhatKy.length,
  };

  const doiChieu = Object.keys(dem).map((bang) =>
    '  select count(*) into n from public.' + bang + ' where tree_id = v_tree;\n' +
    '  if n <> ' + dem[bang] + ' then\n' +
    '    raise exception \'Bảng ' + bang + ': đổ vào ' + dem[bang] +
    ' dòng nhưng đếm lại được %. Đã huỷ sạch, cơ sở dữ liệu giữ nguyên như trước.\', n;\n' +
    '  end if;').join('\n');

  const sql = [
'-- ============================================================',
'-- DI DỜI DỮ LIỆU GIA PHẢ  →  Supabase',
'--',
'-- Sinh tự động bởi: supabase/di-doi/sinh-sql-di-doi.mjs',
'-- Từ file nguồn   : ' + tuyChon.tenNguon,
'-- Cây đích        : tree_code = ' + maCay,
'-- Sinh lúc        : ' + tuyChon.luc,
'--',
'-- CÁCH DÙNG: Supabase → SQL Editor → New query → dán TOÀN BỘ file này → Run.',
'--',
'-- ⚠ FILE NÀY XOÁ SẠCH dữ liệu gia phả đang có của cây ' + maCay + ' rồi đổ',
'--   bản mới vào. Cả khối nằm trong MỘT giao dịch: sai một con số ở phần đối',
'--   chiếu cuối là mọi thứ tự huỷ, cơ sở dữ liệu giữ nguyên như trước khi chạy.',
'--',
'-- ⚠ Nó KHÔNG đụng vào: tên gia phả, danh sách người được vào (tree_members),',
'--   tài khoản đăng nhập, kho ảnh. Chỉ dữ liệu gia phả của đúng cây này.',
'-- ============================================================',
'',
'do $di_doi$',
'declare',
'  v_ma_cay constant text := ' + "'" + maCay + "';",
'  v_goc    constant text := ' + "'" + goc.replace(/'/g, "''") + "';",
'  v_tree     uuid;',
'  n          integer;',
'  v_persons  jsonb := ' + khoi(bo(dong.persons)) + '::jsonb;',
'  v_unions   jsonb := ' + khoi(bo(dong.unions)) + '::jsonb;',
'  v_children jsonb := ' + khoi(bo(dong.children)) + '::jsonb;',
'  v_media    jsonb := ' + khoi(bo(dong.media)) + '::jsonb;',
'  v_sources  jsonb := ' + khoi(bo(dong.sources)) + '::jsonb;',
'  v_so_nhap  jsonb := ' + khoi(soNhap) + '::jsonb;',
'  v_nhat_ky  jsonb := ' + khoi(nhatKy) + '::jsonb;',
'begin',
'  -- ══ 1. TÌM CÂY, VÀ DỪNG NGAY NẾU KHÔNG THẤY ══',
'  select id into v_tree from public.trees where tree_code = v_ma_cay;',
'  if v_tree is null then',
'    raise exception \'Không có gia phả nào mang tree_code = %. Mở Table Editor \'',
'      \'→ bảng trees để xem mã đúng, hoặc tạo cây trước khi di dời.\', v_ma_cay;',
'  end if;',
'',
'  -- `gan_ma_cay()` do 03-ham-luu-cay.sql dựng. Thiếu nó thì mọi dòng dưới đây',
'  -- sẽ mang tree_id rỗng, nên hỏi trước cho câu lỗi nói được điều phải làm.',
'  if to_regprocedure(\'public.gan_ma_cay(jsonb,uuid)\') is null then',
'    raise exception \'Thiếu hàm gan_ma_cay. Chạy luoc-do/03-ham-luu-cay.sql trước.\';',
'  end if;',
'',
'  select data_version into n from public.trees where id = v_tree;',
'  if n <> ' + Number(cay.version) + ' then',
'    raise exception \'Cây trên Supabase là data_version %, còn file nguồn là ' +
  Number(cay.version) + '. Hai bên khác đời dữ liệu — dừng lại.\', n;',
'  end if;',
'',
'  -- ══ 2. XOÁ DỮ LIỆU GIA PHẢ CŨ CỦA ĐÚNG CÂY NÀY ══',
'  -- Thứ tự theo khoá ngoại: con trước, rồi hôn nhân và người.',
'  delete from public.union_children where tree_id = v_tree;',
'  delete from public.unions         where tree_id = v_tree;',
'  delete from public.media          where tree_id = v_tree;',
'  delete from public.sources        where tree_id = v_tree;',
'  delete from public.persons        where tree_id = v_tree;',
'  delete from public.imports        where tree_id = v_tree;',
'  delete from public.change_log     where tree_id = v_tree;',
'',
'  -- ══ 3. ĐỔ DỮ LIỆU MỚI ══',
'  -- Thứ tự ngược lại: người trước, rồi hôn nhân, rồi con.',
'  insert into public.persons',
'  select * from jsonb_populate_recordset(null::public.persons,',
'                                         public.gan_ma_cay(v_persons, v_tree));',
'',
'  insert into public.unions',
'  select * from jsonb_populate_recordset(null::public.unions,',
'                                         public.gan_ma_cay(v_unions, v_tree));',
'',
'  insert into public.union_children',
'  select * from jsonb_populate_recordset(null::public.union_children,',
'                                         public.gan_ma_cay(v_children, v_tree));',
'',
'  insert into public.media',
'  select * from jsonb_populate_recordset(null::public.media,',
'                                         public.gan_ma_cay(v_media, v_tree));',
'',
'  insert into public.sources',
'  select * from jsonb_populate_recordset(null::public.sources,',
'                                         public.gan_ma_cay(v_sources, v_tree));',
'',
'  -- Sổ nhập và nhật ký có cột `id` tự tăng nên phải nêu tên cột, không dùng',
'  -- được `select *`.',
'  insert into public.imports (tree_id, at, by_email, file, source, source_name,',
'                              exporter, counts, map)',
'  select v_tree, coalesce(x.at, now()), x.by_email, x.file, x.source,',
'         x.source_name, x.exporter, x.counts, x.map',
'    from jsonb_to_recordset(v_so_nhap) as x(at timestamptz, by_email text,',
'         file text, source text, source_name text, exporter text,',
'         counts jsonb, map jsonb);',
'',
'  -- ⚠ `ts` và `by_email` GIỮ NGUYÊN VĂN của bản Apps Script. Đi qua luu_cay()',
'  --   thì hai trường ấy bị ghi đè thành người đang chạy — xem đầu file .mjs.',
'  insert into public.change_log (tree_id, ts, by_email, action, target, note,',
'                                 diff, revision)',
'  select v_tree, coalesce(x.ts, now()), x.by_email, x.action, x.target,',
'         x.note, x.diff, x.revision',
'    from jsonb_to_recordset(v_nhat_ky) as x(ts timestamptz, by_email text,',
'         action text, target text, note text, diff jsonb, revision integer);',
'',
'  -- ══ 4. KHỐI THÔNG TIN CÂY ══',
'  -- CỐ Ý không đụng vào `name`: tên trên Supabase là tên chủ dự án đã đặt,',
'  -- còn tên trong file nguồn là tên của bản đang dùng để dựng phần mềm.',
'  update public.trees',
'     set root_person_id = nullif(v_goc, \'\'),',
'         revision       = revision + 1,',
'         updated_at     = now(),',
'         updated_by     = \'di-doi (script)\'',
'   where id = v_tree;',
'',
'  -- ══ 5. ĐỐI CHIẾU — sai một con số là huỷ sạch ══',
doiChieu,
'',
'  -- Không bản ghi nào được thiếu uid: đây là việc mà CHỈ script di dời làm,',
'  -- app cố ý không tự điền (services/repo.js → canhBaoThieuUid).',
'  select count(*) into n from public.persons where tree_id = v_tree and uid = \'\';',
'  if n <> 0 then',
'    raise exception \'% người không có uid sau khi đổ vào. Đã huỷ sạch.\', n;',
'  end if;',
'  select count(*) into n from public.unions where tree_id = v_tree and uid = \'\';',
'  if n <> 0 then',
'    raise exception \'% hôn nhân không có uid sau khi đổ vào. Đã huỷ sạch.\', n;',
'  end if;',
'',
'  -- Người trung tâm phải là người CÓ THẬT trong cây, nếu không thì app mở ra',
'  -- một sơ đồ trống mà không báo gì (services/repo.js → chonNguoiTrungTam).',
'  if v_goc <> \'\' then',
'    select count(*) into n from public.persons',
'     where tree_id = v_tree and id = v_goc;',
'    if n <> 1 then',
'      raise exception \'Người trung tâm % không có trong danh sách người. Đã huỷ sạch.\', v_goc;',
'    end if;',
'  end if;',
'',
'  raise notice \'Di dời xong: % người, % hôn nhân, % quan hệ con.\',',
'    ' + dem.persons + ', ' + dem.unions + ', ' + dem.union_children + ';',
'end',
'$di_doi$;',
'',
'-- ============================================================',
'-- BẢNG ĐỐI CHIẾU CUỐI — nhìn bằng mắt cho yên tâm',
'-- Chạy xong, SQL Editor hiện một bảng. Cột "so_dong" phải khớp cột "mong_doi".',
'-- ============================================================',
'select b.bang, b.mong_doi, x.so_dong',
'  from (values',
Object.keys(dem).map((bang, i, ds) =>
  '        (\'' + bang + '\', ' + dem[bang] + ')' + (i === ds.length - 1 ? '' : ',')).join('\n'),
'       ) as b(bang, mong_doi)',
'  cross join lateral (',
'    select case b.bang',
'      when \'persons\'        then (select count(*) from public.persons        p join public.trees t on t.id = p.tree_id where t.tree_code = \'' + maCay + '\')',
'      when \'unions\'         then (select count(*) from public.unions         u join public.trees t on t.id = u.tree_id where t.tree_code = \'' + maCay + '\')',
'      when \'union_children\' then (select count(*) from public.union_children c join public.trees t on t.id = c.tree_id where t.tree_code = \'' + maCay + '\')',
'      when \'media\'          then (select count(*) from public.media          m join public.trees t on t.id = m.tree_id where t.tree_code = \'' + maCay + '\')',
'      when \'sources\'        then (select count(*) from public.sources        s join public.trees t on t.id = s.tree_id where t.tree_code = \'' + maCay + '\')',
'      when \'imports\'        then (select count(*) from public.imports        i join public.trees t on t.id = i.tree_id where t.tree_code = \'' + maCay + '\')',
'      else                       (select count(*) from public.change_log     l join public.trees t on t.id = l.tree_id where t.tree_code = \'' + maCay + '\')',
'    end as so_dong',
'  ) as x',
' order by b.bang;',
'',
  ].join('\n');

  return { sql, dem };
}

// ============================================================
// CHẠY TỪ DÒNG LỆNH
// ============================================================

function docThamSo(argv) {
  const ra = { file: '', maCay: '', ra: '' };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--file')       ra.file  = argv[++i] || '';
    else if (t === '--ma-cay') ra.maCay = argv[++i] || '';
    else if (t === '--ra')     ra.ra    = argv[++i] || '';
  }
  return ra;
}

function chay(argv) {
  const ts = docThamSo(argv);
  if (!ts.file || !ts.maCay) {
    console.log('Cách dùng:');
    console.log('  node sinh-sql-di-doi.mjs --file <duong-dan.json> --ma-cay <MACAY> [--ra <file.sql>]');
    console.log('');
    console.log('  --file    file gia phả `giapha-json` (bản xuất của app Apps Script)');
    console.log('  --ma-cay  tree_code của cây đích trên Supabase, ví dụ NTB');
    console.log('  --ra      nơi ghi file .sql. Mặc định: tai-lieu/di-doi-<MACAY>-<ngày>.sql');
    console.log('            ⚠ ĐỪNG ghi vào supabase/ — repo ấy Public.');
    process.exitCode = 1;
    return;
  }

  const nguon = resolve(process.cwd(), ts.file);
  if (!existsSync(nguon)) {
    console.error('Không thấy file nguồn: ' + nguon);
    process.exitCode = 1;
    return;
  }

  const cay = docCay(readFileSync(nguon, 'utf8'), basename(nguon));
  const daDien = dienUid(cay, ts.maCay);

  const luc = dauThoiGianNay();
  const { sql, dem } = sinhSql(cay, {
    maCay: ts.maCay, tenNguon: basename(nguon), luc,
  });

  const dich = ts.ra
    ? resolve(process.cwd(), ts.ra)
    : resolve(DAY, '../../tai-lieu/di-doi-' + ts.maCay + '-' +
              luc.slice(6, 10) + luc.slice(3, 5) + luc.slice(0, 2) + '.sql');

  // ⚠ Cảnh báo, không chặn: chủ dự án có thể có lý do. Nhưng phải nói ra.
  if (dich.replace(/\\/g, '/').includes('/supabase/')) {
    console.warn('⚠ File .sql đang được ghi vào TRONG repo `supabase/`, mà repo');
    console.warn('  ấy để Public. File này chứa toàn bộ gia phả. Cân nhắc lại.');
  }

  writeFileSync(dich, sql, 'utf8');

  console.log('Đã sinh: ' + dich);
  console.log('  nguồn        : ' + basename(nguon));
  console.log('  cây đích     : tree_code = ' + ts.maCay);
  console.log('  uid điền thêm: ' + daDien + ' bản ghi');
  for (const bang of Object.keys(dem)) {
    console.log('  ' + bang.padEnd(15) + dem[bang]);
  }
  console.log('');
  console.log('Bước tiếp theo: mở supabase/di-doi/HUONG-DAN-DI-DOI.md');
}

/** `dd/mm/yyyy HH:mm` của lúc này — khuôn thời gian duy nhất của cả dự án. */
function dauThoiGianNay() {
  const d = new Date();
  const hai = (n) => String(n).padStart(2, '0');
  return hai(d.getDate()) + '/' + hai(d.getMonth() + 1) + '/' + d.getFullYear() +
         ' ' + hai(d.getHours()) + ':' + hai(d.getMinutes());
}

// Chỉ chạy khi được gọi thẳng từ dòng lệnh; `import` vào bài kiểm thì không.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  chay(process.argv.slice(2));
}
