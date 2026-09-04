// ============================================================
// giapha-supabase · kiem-thu/kiem-di-doi.mjs
// Vai trò  : Kiểm `di-doi/sinh-sql-di-doi.mjs` — bộ sinh file SQL di dời dữ
//            liệu — bằng cách sinh SQL từ gia phả thật rồi BÓC NGƯỢC dữ liệu
//            ra khỏi chính file ấy và so lại với cây nguồn.
// Chạy     : cd supabase/kiem-thu && node kiem-di-doi.mjs
// Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 09:31
// ============================================================
//
// ═══ CÂU HỎI BÀI KIỂM NÀY TRẢ LỜI ═══
//
// Di dời là việc làm **một lần**, trên dữ liệu **không có bản thứ hai ở phía
// đích**. Mọi kiểu hỏng của nó đều im lặng: sót một trường thì ngày sinh của
// một ông cụ bỗng trống, sót một dòng con thì một nhánh rụng khỏi sơ đồ, sai
// múi giờ thì mọi mốc lệch bảy tiếng. Không cái nào làm câu SQL đỏ lên.
//
// Nên bài kiểm không hỏi *"file SQL có sinh ra không"* mà hỏi:
//
//   1. **Bóc dữ liệu ra khỏi file SQL rồi ráp lại thành cây — có ra đúng cây
//      nguồn không?** Đây là phép khứ hồi, và nó đo ĐÚNG những byte sẽ đi tới
//      máy chủ, chứ không đo giá trị trả về của một hàm ở giữa đường.
//   2. **Nhật ký có còn nguyên `ts` và `by` không?** Đó là thứ đường GEDCOM
//      không mang nổi và `luu_cay()` sẽ ghi đè — cả lý do file SQL này tồn tại.
//   3. **Câu SQL có giới hạn đúng một cây không?** Một `delete` thiếu `where`
//      là xoá gia phả của mọi cây trong project.
//
// ⚠ **BÀI KIỂM NÀY KHÔNG CHẠY SQL.** Máy này không có Postgres, và Supabase
//   thật thì không đem ra thử. Nên nó chứng minh được *dữ liệu đúng* và *câu
//   lệnh đúng hình*, KHÔNG chứng minh được *Postgres nuốt trôi*. Lần chạy đầu
//   tiên là lúc chủ dự án dán vào SQL Editor — và cả khối nằm trong một giao
//   dịch, nên hỏng cú pháp thì không có gì được ghi.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { docCay, dienUid, sinhSql, isoTuDau, nhatKyRa }
  from '../di-doi/sinh-sql-di-doi.mjs';
import { rapCay, soSanh, coGiDeGhi } from '../js/services/hinh-dang.js';
import { sinhUid } from '../js/utils/id.js';

const DAY = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(DAY, '../../tai-lieu/giapha-nguyen-trong-bac.json');
const FILE_SQL_LUOC_DO = resolve(DAY, '../luoc-do/01-bang.sql');
const MA_CAY = 'NTB';
const LUC = '04/09/2026 09:31';

let dat = 0;
let hong = 0;

function kiem(ten, dung, chiTiet) {
  if (dung) { dat++; console.log('  ĐẠT  ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? '\n        ' + chiTiet : '')); }
}

// ⚠ `tai-lieu/` cố ý nằm NGOÀI repo này, nên ai tải repo về từ GitHub sẽ
//   không có file dữ liệu. Nói rõ đây là chuyện bình thường, đừng để nó chết
//   bằng một câu ENOENT chẳng giải thích gì.
if (!existsSync(FILE)) {
  console.log('BỎ QUA — không tìm thấy file gia phả thử:\n  ' + FILE + '\n');
  console.log('Đây KHÔNG phải lỗi của bộ kiểm. Thư mục `tai-lieu/` cố ý nằm');
  console.log('ngoài repo `giapha-supabase` vì repo để Public.');
  process.exitCode = 0;
} else {
  chayHet();
}

function chayHet() {
  const chuNguon = readFileSync(FILE, 'utf8');

  // ------------------------------------------------------------
  // Dựng bối cảnh: file JSON thật → cây đã điền uid → file SQL
  // ------------------------------------------------------------
  const cay = docCay(chuNguon, 'giapha-nguyen-trong-bac.json');
  const daDien = dienUid(cay, MA_CAY);
  const { sql, dem } = sinhSql(cay, {
    maCay: MA_CAY, tenNguon: 'giapha-nguyen-trong-bac.json', luc: LUC,
  });

  // ============================================================
  // 1. VÒNG KHỨ HỒI — bóc dữ liệu RA KHỎI file SQL rồi so lại
  // ============================================================
  console.log('\n1. Khứ hồi: file SQL → cây, phải bằng cây nguồn');

  const khoi = bocKhoi(sql);
  const TEN_KHOI = ['persons', 'unions', 'children', 'media', 'sources',
                    'so_nhap', 'nhat_ky'];
  kiem('bóc được đủ bảy khối JSON ra khỏi file SQL',
       TEN_KHOI.every((t) => Array.isArray(khoi[t])),
       TEN_KHOI.filter((t) => !Array.isArray(khoi[t])).join(', ') || '');

  kiem('số dòng mỗi khối khớp con số bộ sinh báo ra',
       khoi.persons.length === dem.persons &&
       khoi.unions.length === dem.unions &&
       khoi.children.length === dem.union_children &&
       khoi.nhat_ky.length === dem.change_log,
       khoi.persons.length + '/' + dem.persons + ' người · ' +
       khoi.children.length + '/' + dem.union_children + ' con');

  // Ráp lại y như `services/sb.layDong()` sẽ trả về sau khi dữ liệu nằm trong
  // bảng, rồi so với cây nguồn. `soSanh` trả rỗng nghĩa là: đổ file SQL này
  // vào bảng xong, app đọc lên sẽ thấy ĐÚNG cây nguồn, không thiếu trường nào.
  const cayTuSql = rapCay({
    tree: {
      id: '00000000-0000-4000-8000-000000000000',
      tree_code: MA_CAY,
      name: cay.tree.name,
      root_person_id: cay.tree.rootPersonId || null,
      note: cay.tree.note || '',
      data_version: cay.version,
      revision: 1,
      created_at: null, updated_at: null, updated_by: '',
    },
    persons: khoi.persons, unions: khoi.unions, children: khoi.children,
    media: khoi.media, sources: khoi.sources, imports: [], maNhatKy: [],
  });

  const ops = soSanh(cayTuSql, cay);
  kiem('so cây bóc từ SQL với cây nguồn: KHÔNG còn gì để ghi',
       !coGiDeGhi(ops), moTaOps(ops));

  // Và chiều ngược lại, vì `soSanh` chỉ nhìn những gì có trong cây MỚI: một
  // người thừa trong SQL mà nguồn không có sẽ không hiện ra ở phép trên.
  const opsNguoc = soSanh(cay, cayTuSql);
  kiem('so ngược chiều cũng KHÔNG còn gì để ghi', !coGiDeGhi(opsNguoc),
       moTaOps(opsNguoc));

  const maNguon = new Set(cay.persons.map((p) => p.id));
  const maSql = new Set(khoi.persons.map((p) => p.id));
  kiem('không thiếu, không thừa một mã người nào',
       maNguon.size === maSql.size &&
       [...maNguon].every((m) => maSql.has(m)),
       [...maNguon].filter((m) => !maSql.has(m)).slice(0, 5).join(', '));

  const soCon = (cay.unions || []).reduce(
    (t, u) => t + ((u.children || []).length), 0);
  kiem('số dòng quan hệ con khớp tổng số con của mọi hôn nhân',
       soCon === khoi.children.length, soCon + ' ≠ ' + khoi.children.length);

  // `tree_id` phải VẮNG MẶT trong file: mã cây thật do `gan_ma_cay()` gắn lúc
  // chạy. Còn sót một mã cây tạm trong file là dòng ấy đi vào cây khác.
  kiem('không dòng nào mang sẵn tree_id (gan_ma_cay gắn lúc chạy)',
       ![].concat(khoi.persons, khoi.unions, khoi.children, khoi.media,
                  khoi.sources).some((d) => 'tree_id' in d),
       'có dòng còn tree_id');

  // ============================================================
  // 2. UID — việc mà CHỈ script di dời được làm
  // ============================================================
  console.log('\n2. uid');

  kiem('điền uid cho đúng số bản ghi vốn thiếu',
       daDien === cay.persons.length + (cay.unions || []).length,
       daDien + ' ≠ ' + (cay.persons.length + (cay.unions || []).length));

  kiem('không người nào còn thiếu uid',
       khoi.persons.every((p) => typeof p.uid === 'string' && p.uid),
       khoi.persons.filter((p) => !p.uid).map((p) => p.id).slice(0, 5).join(', '));

  kiem('không hôn nhân nào còn thiếu uid',
       khoi.unions.every((u) => typeof u.uid === 'string' && u.uid),
       khoi.unions.filter((u) => !u.uid).map((u) => u.id).slice(0, 5).join(', '));

  kiem('uid đúng bằng sinhUid(mã cây, mã bản ghi) — tính lại được',
       khoi.persons.every((p) => p.uid === sinhUid(MA_CAY, p.id)),
       'có uid không tính lại ra');

  const uidRieng = new Set(khoi.persons.map((p) => p.uid));
  kiem('không hai người nào trùng uid', uidRieng.size === khoi.persons.length,
       uidRieng.size + ' uid cho ' + khoi.persons.length + ' người');

  // ⚠ uid CÓ SẴN phải giữ nguyên. Bản ghi nhập từ cây khác mang uid của cây
  //   ấy; tính lại từ mã mới là bịa ra một con người khác (utils/id.js).
  // Hai người: một người ĐÃ có uid lạ, một người chưa có. Phải giữ nguyên
  // người thứ nhất và chỉ điền cho người thứ hai — đếm bằng đúng con số 1.
  const cayThu = cayGia();
  cayThu.persons[0].uid = 'aaaaaaaa-bbbb-8ccc-9ddd-eeeeeeeeeeee';
  cayThu.persons.push({ id: 'P0002', names: [], sex: 'U' });
  const dien2 = dienUid(cayThu, MA_CAY);
  kiem('uid có sẵn KHÔNG bị tính lại đè lên, người thiếu thì được điền',
       cayThu.persons[0].uid === 'aaaaaaaa-bbbb-8ccc-9ddd-eeeeeeeeeeee' &&
       cayThu.persons[1].uid === sinhUid(MA_CAY, 'P0002') &&
       dien2 === 1,
       cayThu.persons[0].uid + ' · điền ' + dien2);

  // ============================================================
  // 3. NHẬT KÝ — thứ GEDCOM không mang nổi
  // ============================================================
  console.log('\n3. Nhật ký thay đổi');

  kiem('giữ đủ mọi mục nhật ký của file nguồn',
       khoi.nhat_ky.length === (cay.changeLog || []).length,
       khoi.nhat_ky.length + ' ≠ ' + (cay.changeLog || []).length);

  kiem('đổi dấu thời gian sang khuôn Postgres kèm múi giờ +07',
       isoTuDau('14/08/2026 10:00') === '2026-08-14 10:00:00+07' &&
       isoTuDau('01/01/2026') === '2026-01-01 00:00:00+07' &&
       isoTuDau('') === null,
       String(isoTuDau('14/08/2026 10:00')));

  const nguoiNguon = new Set((cay.changeLog || []).map((m) => m.by).filter(Boolean));
  const nguoiSql = new Set(khoi.nhat_ky.map((m) => m.by_email).filter(Boolean));
  kiem('giữ NGUYÊN VĂN người sửa của bản Apps Script',
       nguoiNguon.size > 0 && [...nguoiNguon].every((e) => nguoiSql.has(e)),
       [...nguoiNguon].join(', ') + '  →  ' + [...nguoiSql].join(', '));

  // Mọi mã từng xuất hiện phải còn nguyên: `04-view-ma-da-dung.sql` gom
  // `target` cùng các KHOÁ của `diff` thành danh sách mã đã dùng, và
  // `utils/id.js` đọc đúng danh sách ấy để không cấp lại mã cũ.
  const maCu = new Set();
  for (const m of cay.changeLog || []) {
    if (m && m.target) maCu.add(m.target);
    for (const k of Object.keys((m && m.diff) || {})) maCu.add(k);
  }
  const maMoi = new Set();
  for (const m of khoi.nhat_ky) {
    if (m.target) maMoi.add(m.target);
    for (const k of Object.keys(m.diff || {})) maMoi.add(k);
  }
  kiem('không mất một mã đã dùng nào (target + khoá diff)',
       maCu.size > 0 && [...maCu].every((m) => maMoi.has(m)),
       [...maCu].filter((m) => !maMoi.has(m)).slice(0, 5).join(', '));

  // ============================================================
  // 4. CỘT `not null` — bắt lại đúng lỗi ngày 03/09/2026
  // ============================================================
  console.log('\n4. Cột not null của lược đồ');

  const luocDo = readFileSync(FILE_SQL_LUOC_DO, 'utf8');

  /** Tên các cột `not null` của một bảng, đọc THẲNG từ 01-bang.sql. */
  function cotBatBuoc(tenBang) {
    const m = luocDo.match(new RegExp('create table if not exists public\\.' +
                                      tenBang + '\\s*\\(([\\s\\S]*?)\\n\\);'));
    if (!m) return null;
    const ra = [];
    for (const dong of m[1].split('\n')) {
      const sach = dong.replace(/--.*$/, '').trim();
      if (!/not null/i.test(sach)) continue;
      const ten = sach.match(/^([a-z_]+)\s+/);
      if (!ten) continue;
      if (['primary', 'foreign', 'constraint', 'unique', 'check'].includes(ten[1])) continue;
      if (ten[1] === 'tree_id') continue;      // gan_ma_cay() gắn lúc chạy
      ra.push(ten[1]);
    }
    return ra;
  }

  // ⚠ PHÉP KIỂM CỦA PHÉP KIỂM: hỏng biểu thức chính quy thì hàm trên trả về
  //   danh sách rỗng, và phép quét dưới đây "đạt" mà chẳng kiểm gì cả.
  kiem('đọc được danh sách cột not null từ 01-bang.sql',
       (cotBatBuoc('persons') || []).length >= 15 &&
       (cotBatBuoc('unions') || []).length >= 7 &&
       (cotBatBuoc('union_children') || []).length >= 3,
       'persons=' + (cotBatBuoc('persons') || []).length +
       ' unions=' + (cotBatBuoc('unions') || []).length +
       ' union_children=' + (cotBatBuoc('union_children') || []).length);

  const thieuCot = [];
  for (const [bang, ds] of [['persons', khoi.persons], ['unions', khoi.unions],
                            ['union_children', khoi.children],
                            ['media', khoi.media], ['sources', khoi.sources]]) {
    for (const cot of cotBatBuoc(bang) || []) {
      for (const d of ds) {
        if (d[cot] === undefined || d[cot] === null) {
          thieuCot.push(bang + '.' + cot + ' (' + (d.id || d.person_id) + ')');
        }
      }
    }
  }
  kiem('không dòng nào để trống một cột not null', thieuCot.length === 0,
       [...new Set(thieuCot)].slice(0, 8).join('\n        '));

  // ============================================================
  // 5. HÌNH CỦA CÂU SQL
  // ============================================================
  console.log('\n5. Hình của câu SQL');

  kiem('đúng một khối do $di_doi$ … $di_doi$;',
       demChuoi(sql, '$di_doi$') === 2, String(demChuoi(sql, '$di_doi$')));

  kiem('dấu rào $giapha$ đóng mở chẵn đôi',
       demChuoi(sql, '$giapha$') === 14, String(demChuoi(sql, '$giapha$')));

  const viTriXoa = sql.lastIndexOf('delete from public.');
  const viTriChen = sql.indexOf('insert into public.');
  kiem('mọi câu xoá đứng TRƯỚC mọi câu chèn',
       viTriXoa > 0 && viTriChen > viTriXoa, viTriXoa + ' / ' + viTriChen);

  kiem('xoá con trước, xoá người sau (thứ tự khoá ngoại)',
       sql.indexOf('delete from public.union_children') <
       sql.indexOf('delete from public.persons'));

  kiem('chèn người trước, chèn con sau (thứ tự khoá ngoại)',
       sql.indexOf('insert into public.persons') <
       sql.indexOf('insert into public.union_children'));

  // ⚠ PHÉP QUAN TRỌNG NHẤT CỦA MỤC NÀY. Một `delete from public.persons;`
  //   thiếu `where` là xoá gia phả của MỌI cây trong project — và câu lệnh ấy
  //   trông hoàn toàn bình thường.
  const cauNguyHiem = sql
    .split(';')
    .map((c) => c.replace(/--.*$/gm, '').trim())
    .filter((c) => /^(delete|update)\s+(from\s+)?public\./i.test(c))
    .filter((c) => !/\bv_tree\b/.test(c));
  kiem('mọi câu xoá/sửa đều giới hạn bằng v_tree', cauNguyHiem.length === 0,
       cauNguyHiem.slice(0, 3).join(' | '));

  const thieuDoiChieu = ['persons', 'unions', 'union_children', 'media',
                         'sources', 'imports', 'change_log']
    .filter((b) => !sql.includes('select count(*) into n from public.' + b +
                                 ' where tree_id = v_tree;'));
  kiem('mỗi bảng có một phép đối chiếu số dòng', thieuDoiChieu.length === 0,
       thieuDoiChieu.join(', '));

  kiem('con số đối chiếu bám theo dữ liệu thật, không phải số cứng',
       sql.includes('if n <> ' + dem.persons + ' then') &&
       sql.includes('if n <> ' + dem.union_children + ' then'),
       'persons=' + dem.persons + ' children=' + dem.union_children);

  // Ba thứ file này TUYỆT ĐỐI không được đụng vào.
  for (const cam of ['public.tree_members', 'auth.users', 'storage.',
                     'set name =', 'drop ']) {
    kiem('không đụng tới ' + cam.trim(), !sql.includes(cam));
  }

  // Repo Public: một cái khoá lọt vào file sinh ra là khoá đã lên mạng.
  for (const bi of ['sb_secret_', 'service_role', 'sb_publishable_', 'password']) {
    kiem('không chứa chuỗi "' + bi + '"', !sql.includes(bi));
  }

  kiem('sinh hai lần ra hai file giống hệt nhau (hàm thuần)',
       sinhSql(cay, { maCay: MA_CAY, tenNguon: 'x', luc: LUC }).sql ===
       sinhSql(cay, { maCay: MA_CAY, tenNguon: 'x', luc: LUC }).sql);

  // ============================================================
  // 6. TỪ CHỐI SỚM — file sai khuôn không được đi tới bước sinh SQL
  // ============================================================
  console.log('\n6. Từ chối sớm');

  kiem('từ chối file không mang format giapha-json',
       nem(() => docCay('{"format":"khac","version":1}')));
  kiem('từ chối file JSON hỏng', nem(() => docCay('{ khong phai json')));
  kiem('từ chối phiên bản dữ liệu MỚI HƠN app',
       nem(() => docCay(JSON.stringify({
         format: 'giapha-json', version: 99, tree: {}, persons: [{ id: 'P1' }] }))));
  kiem('từ chối cây rỗng', nem(() => docCay(JSON.stringify({
         format: 'giapha-json', version: 1, tree: {}, persons: [] }))));
  kiem('từ chối người không có mã id', nem(() => docCay(JSON.stringify({
         format: 'giapha-json', version: 1, tree: {}, persons: [{ names: [] }] }))));
  kiem('từ chối mã cây sai khuôn (chữ thường)',
       nem(() => sinhSql(cayGia(), { maCay: 'ntb', tenNguon: 'x', luc: LUC })));

  // ============================================================
  // 7. PHÁ HOẠI CÓ CHỦ Ý — chứng minh bộ kiểm biết đỏ
  // ============================================================
  console.log('\n7. Phá hoại có chủ ý');

  // 7a. Bớt một người thì con số đối chiếu phải đi theo.
  const cayThieu = JSON.parse(JSON.stringify(cay));
  cayThieu.persons.pop();
  const sqlThieu = sinhSql(cayThieu, { maCay: MA_CAY, tenNguon: 'x', luc: LUC });
  kiem('bớt một người → con số đối chiếu giảm đúng một',
       sqlThieu.dem.persons === dem.persons - 1 &&
       sqlThieu.sql.includes('if n <> ' + (dem.persons - 1) + ' then'),
       String(sqlThieu.dem.persons));

  // 7b. Dấu rào lọt vào giữa dữ liệu là câu SQL đứt làm đôi — và phần đuôi
  //     khi ấy vẫn là SQL hợp lệ theo một nghĩa khác.
  const cayPha = cayGia();
  cayPha.persons[0].note = 'ghi chú có $giapha$ trong đó';
  kiem('chặn khi dữ liệu chứa chính dấu rào $giapha$',
       nem(() => sinhSql(cayPha, { maCay: MA_CAY, tenNguon: 'x', luc: LUC })));

  // 7c. Bỏ một trường ra khỏi cây nguồn thì phép khứ hồi phải đỏ — nếu không,
  //     phép khứ hồi ở mục 1 chỉ là một câu "đạt" không đo gì.
  const cayMat = JSON.parse(JSON.stringify(cay));
  cayMat.persons[0].birth = { iso: null, raw: '', place: '' };
  kiem('đổi ngày sinh một người → phép khứ hồi mục 1 phải thấy',
       coGiDeGhi(soSanh(cayTuSql, cayMat)),
       'phép khứ hồi không phân biệt được hai cây khác nhau');

  // ------------------------------------------------------------
  console.log('\n' + (hong === 0 ? 'TẤT CẢ ĐẠT' : 'CÓ PHÉP HỎNG') +
              ' — ' + dat + ' đạt, ' + hong + ' hỏng.');
  process.exitCode = hong === 0 ? 0 : 1;
}

// ============================================================
// Phụ tùng
// ============================================================

/** Bóc mọi khối `v_<tên> jsonb := $giapha$…$giapha$` ra khỏi file SQL. */
function bocKhoi(sql) {
  const ra = {};
  const khuon = /v_([a-z_]+)\s+jsonb := \$giapha\$([\s\S]*?)\$giapha\$::jsonb;/g;
  let m;
  while ((m = khuon.exec(sql)) !== null) {
    try { ra[m[1]] = JSON.parse(m[2]); }
    catch (e) { ra[m[1]] = { loi: e.message }; }
  }
  return ra;
}

function demChuoi(chu, tim) {
  return chu.split(tim).length - 1;
}

function nem(viec) {
  try { viec(); return false; } catch (e) { return true; }
}

function moTaOps(ops) {
  const phan = [];
  for (const ten of ['persons', 'unions', 'children', 'media', 'sources']) {
    const o = ops[ten];
    if (o && o.luu.length) phan.push(ten + ' còn ' + o.luu.length + ' dòng phải ghi: ' +
      o.luu.slice(0, 2).map((d) => d.id || d.person_id).join(', '));
    if (o && o.xoa.length) phan.push(ten + ' thừa ' + o.xoa.length + ' dòng');
  }
  if (ops.tree) phan.push('khối thông tin cây khác nhau');
  return phan.join(' · ');
}

/** Một cây bé xíu, đủ hợp lệ để đi qua `docCay`. */
function cayGia() {
  return {
    format: 'giapha-json', version: 1,
    tree: { id: 'T1', name: 'Cây thử', rootPersonId: 'P0001', note: '', revision: 0 },
    persons: [{ id: 'P0001', names: [], sex: 'U' }],
    unions: [], media: [], sources: [], changeLog: [],
  };
}
