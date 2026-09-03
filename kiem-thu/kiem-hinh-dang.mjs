// ============================================================
// giapha-supabase · kiem-thu/kiem-hinh-dang.mjs
// Vai trò  : Kiểm `services/hinh-dang.js` bằng gia phả thật, chạy trong Node.
//            Không cần Supabase, không cần mạng, không cần trình duyệt.
// Chạy     : cd supabase/kiem-thu && node kiem-hinh-dang.mjs
// Phiên bản: 0.2.0 · Cập nhật: 03/09/2026 14:24
// ============================================================
//
// ═══ BA CÂU HỎI BÀI KIỂM NÀY TRẢ LỜI ═══
//
// 1. **Bảng tên có sót trường nào không?** `boCay()` rồi `rapCay()` phải ra
//    lại đúng cây ban đầu. Sót một trường thì dữ liệu của trường ấy im lặng
//    biến mất ở lần lưu đầu tiên — không có lỗi nào báo, không có gì đỏ lên,
//    chỉ là ngày sinh của một ông cụ bỗng trống.
//
// 2. **So một cây với chính nó có ra RỖNG không?** Đây là câu quan trọng
//    nhất, và cũng là câu dễ trượt nhất. `soSanh` mà trả về "cả 681 người
//    đều đổi" thì app vẫn chạy, vẫn lưu được, vẫn đúng dữ liệu — chỉ có điều
//    mỗi lần lưu sẽ ghi lại cả cây, và ngày bật giới hạn theo nhánh thì MỌI
//    người biên tập đều bị từ chối MỌI lần lưu. Cái hỏng ấy nằm im hàng
//    tháng rồi mới lộ ra, đúng lúc khó truy nhất.
//
// 3. **Sửa một chỗ có ra đúng một chỗ không?** Không thừa, không thiếu.
//
// ⚠ Bài kiểm đọc `tai-lieu/giapha-nguyen-trong-bac.json` — gia phả đang dùng
//   để dựng và kiểm phần mềm. Dữ liệu trong đó **toàn bộ là GIẢ**
//   (`CLAUDE.md` mục 9). Bài kiểm CHỈ ĐỌC, không ghi gì vào file ấy.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { rapCay, boCay, soSanh, coGiDeGhi } from '../js/services/hinh-dang.js';

const DAY = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(DAY, '../../tai-lieu/giapha-nguyen-trong-bac.json');
const MA_CAY_THU = '00000000-0000-4000-8000-000000000001';

let dat = 0;
let hong = 0;

function kiem(ten, dung, chiTiet) {
  if (dung) { dat++; console.log('  ĐẠT  ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? '\n        ' + chiTiet : '')); }
}

// ------------------------------------------------------------
// Dựng bối cảnh: file JSON thật → dòng → cây
// ------------------------------------------------------------
//
// ⚠ `tai-lieu/` CỐ Ý nằm NGOÀI repo này (chủ dự án chốt 03/09/2026). Nó là
//   bản sao Knowledge Base dùng chung cho cả hai nhánh, và repo này để Public
//   nên đẩy 87 bước nhật ký thiết kế lên đó là việc không gỡ lại được.
//
//   Hệ quả: ai tải repo về từ GitHub sẽ KHÔNG có file dữ liệu, và bài kiểm
//   này chết bằng một câu `ENOENT` chẳng nói được gì. Nên bắt trước, và nói
//   rõ đây là chuyện bình thường chứ không phải bộ kiểm hỏng.
if (!existsSync(FILE)) {
  console.log('BỎ QUA — không tìm thấy file gia phả thử:\n  ' + FILE + '\n');
  console.log('Đây KHÔNG phải lỗi của bộ kiểm. Thư mục `tai-lieu/` cố ý nằm');
  console.log('ngoài repo `giapha-supabase`, nên bài kiểm này chỉ chạy được');
  console.log('trên máy chủ dự án, nơi có sẵn `Claude_Code/tai-lieu/`.');
  process.exit(0);
}

const goc = JSON.parse(readFileSync(FILE, 'utf8'));

// File trên Drive không có `imports` nếu lập trước 29/08/2026, và `changeLog`
// của nó mang đủ ngày giờ. Chuẩn hoá về đúng hình mà `rapCay` sinh ra, để
// phép so khứ hồi so đúng thứ đáng so.
for (const ten of ['persons', 'unions', 'media', 'sources', 'changeLog', 'imports']) {
  if (!Array.isArray(goc[ten])) goc[ten] = [];
}

const dong = boCay(goc, MA_CAY_THU);

// `rapCay` chờ đúng hình mà `sb.layDong()` trả về — trong đó nhật ký đã rút
// gọn còn một cột mã. Rút ở đây cho khớp.
dong.maNhatKy = [];
for (const m of goc.changeLog) {
  if (m && m.target) dong.maNhatKy.push(m.target);
  if (m && m.diff) for (const k of Object.keys(m.diff)) dong.maNhatKy.push(k);
}
dong.tree.created_at = new Date().toISOString();
dong.tree.updated_at = new Date().toISOString();

const lai = rapCay(dong);

console.log('Gia phả thử: ' + goc.persons.length + ' người, ' +
            goc.unions.length + ' hôn nhân, ' +
            goc.media.length + ' ảnh\n');

// ------------------------------------------------------------
// 1. Khứ hồi — không được rơi rụng trường nào
// ------------------------------------------------------------
console.log('1. Khứ hồi cây → dòng → cây');

kiem('số người giữ nguyên', lai.persons.length === goc.persons.length,
     goc.persons.length + ' → ' + lai.persons.length);
kiem('số hôn nhân giữ nguyên', lai.unions.length === goc.unions.length);
kiem('số ảnh giữ nguyên', lai.media.length === goc.media.length);

// So từng người trên từng trường. Không so bằng `JSON.stringify` cả mảng: khi
// hỏng thì nó chỉ nói "khác nhau" mà không nói khác ở đâu, và với 59 người
// thì đi tìm bằng mắt là một buổi tối.
const cheoLech = [];
const theoMa = new Map(lai.persons.map((p) => [p.id, p]));
for (const p of goc.persons) {
  const q = theoMa.get(p.id);
  if (!q) { cheoLech.push(p.id + ': mất hẳn'); continue; }
  for (const k of Object.keys(p)) {
    const a = JSON.stringify(p[k] === undefined ? null : p[k]);
    const b = JSON.stringify(q[k] === undefined ? null : q[k]);
    if (a !== b) cheoLech.push(p.id + '.' + k + ': ' + a + ' → ' + b);
  }
}
kiem('mọi trường của mọi người về nguyên vẹn', cheoLech.length === 0,
     cheoLech.slice(0, 8).join('\n        '));

const conGoc = goc.unions.reduce((t, u) => t + (u.children || []).length, 0);
const conLai = lai.unions.reduce((t, u) => t + (u.children || []).length, 0);
kiem('số quan hệ cha mẹ–con giữ nguyên', conGoc === conLai,
     conGoc + ' → ' + conLai);

// Con phải về đúng cặp, đúng quan hệ, đúng thứ tự.
const lechCon = [];
const unionLai = new Map(lai.unions.map((u) => [u.id, u]));
for (const u of goc.unions) {
  const v = unionLai.get(u.id);
  if (!v) { lechCon.push(u.id + ': mất hẳn'); continue; }
  const a = (u.children || []).map((c) => c.personId + '/' + (c.relation || 'birth')).sort();
  const b = (v.children || []).map((c) => c.personId + '/' + (c.relation || 'birth')).sort();
  if (JSON.stringify(a) !== JSON.stringify(b)) lechCon.push(u.id + ': ' + a + ' → ' + b);
}
kiem('con về đúng cặp và đúng quan hệ', lechCon.length === 0,
     lechCon.slice(0, 5).join('\n        '));

// ------------------------------------------------------------
// 2. So cây với chính nó — phải RỖNG
// ------------------------------------------------------------
console.log('\n2. So một cây với chính nó');

const opsRong = soSanh(lai, JSON.parse(JSON.stringify(lai)));
kiem('không có gì để ghi', !coGiDeGhi(opsRong), keOps(opsRong));

// ⚠ Phép so thật sự đắt giá: cây RÁP TỪ DÒNG so với cây ĐỌC TỪ FILE. Hai bản
//   này có cùng nội dung nhưng thứ tự khoá khác nhau — bản đầu theo bảng tên,
//   bản sau theo cách `domains/person.js` dựng ra. Nếu `bangNhau()` lỡ so
//   bằng `JSON.stringify` thì đúng chỗ này lộ ra, và chỉ đúng chỗ này.
const opsCheo = soSanh(lai, goc);
kiem('cây ráp từ dòng và cây đọc từ file là MỘT',
     !coGiDeGhi(opsCheo), keOps(opsCheo));

// ------------------------------------------------------------
// 3. Sửa một chỗ — phải ra đúng một chỗ
// ------------------------------------------------------------
console.log('\n3. Sửa một chỗ');

const sua = JSON.parse(JSON.stringify(lai));
sua.persons[0].note = 'ghi chú thử ' + Date.now();
const ops1 = soSanh(lai, sua);
kiem('đổi ghi chú một người → đúng 1 dòng persons',
     ops1.persons.luu.length === 1 && ops1.persons.xoa.length === 0,
     keOps(ops1));
kiem('và không đụng bảng nào khác',
     ops1.unions.luu.length === 0 && ops1.children.luu.length === 0 &&
     ops1.media.luu.length === 0 && ops1.sources.luu.length === 0,
     keOps(ops1));
kiem('dòng gửi lên mang tên cột snake_case',
     Object.prototype.hasOwnProperty.call(ops1.persons.luu[0], 'photo_file_id') &&
     !Object.prototype.hasOwnProperty.call(ops1.persons.luu[0], 'photoFileId'),
     Object.keys(ops1.persons.luu[0]).join(', '));

// Xoá mềm phải đi đường `luu`, không đi đường `xoa`.
const xoaMem = JSON.parse(JSON.stringify(lai));
xoaMem.persons[1].deleted = true;
const ops2 = soSanh(lai, xoaMem);
kiem('xoá MỀM đi đường luu, không đi đường xoa',
     ops2.persons.luu.length === 1 && ops2.persons.xoa.length === 0,
     keOps(ops2));

// Xoá thật (dọn thùng rác) mới sinh ra `xoa`.
const xoaThat = JSON.parse(JSON.stringify(lai));
const maBoDi = xoaThat.persons[2].id;
xoaThat.persons.splice(2, 1);
const ops3 = soSanh(lai, xoaThat);
kiem('xoá THẬT sinh ra đúng một mã trong xoa',
     ops3.persons.xoa.length === 1 && ops3.persons.xoa[0] === maBoDi,
     keOps(ops3));

// Đổi thứ tự con phải sinh ra dòng con, không sinh ra dòng hôn nhân.
const doiCon = JSON.parse(JSON.stringify(lai));
const uCoCon = doiCon.unions.find((u) => (u.children || []).length > 0);
if (uCoCon) {
  uCoCon.children[0].order = (uCoCon.children[0].order || 1) + 100;
  const ops4 = soSanh(lai, doiCon);
  kiem('đổi thứ tự một người con → 1 dòng children, 0 dòng unions',
       ops4.children.luu.length === 1 && ops4.unions.luu.length === 0,
       keOps(ops4));
} else {
  console.log('  BỎ QUA  không có cặp nào có con để thử');
}

// ------------------------------------------------------------
// 4. Cột `not null` không bao giờ được nhận `null`
// ------------------------------------------------------------
//
// ⚠ PHÉP KIỂM NÀY SINH RA TỪ MỘT LỖI THẬT (03/09/2026). Lần thêm người đầu
//   tiên trên app thật báo:
//     null value in column "vn" of relation "persons" violates not-null
//   `domains/person.js` dựng người mới không có khoá `vn` — đúng, vì `vn`
//   chỉ mọc ra khi người dùng điền Đời / Chi / ngày giỗ. `veBang()` khi ấy
//   đổi mọi khoá thiếu thành `null`, và `default` của Postgres không cứu:
//   `luu_cay()` đi qua `jsonb_populate_recordset`, nơi khoá thiếu cho ra
//   `null` chứ không cho ra `default`.
//
// Danh sách cột đọc THẲNG từ `luoc-do/01-bang.sql`, không chép tay. Chép tay
// thì ngày ai đó thêm một cột `not null` mới, bộ kiểm vẫn xanh — mà đó đúng
// là ngày cần nó đỏ.
console.log('\n4. Cột not null không nhận null');

const FILE_SQL = resolve(DAY, '../luoc-do/01-bang.sql');
const sql = readFileSync(FILE_SQL, 'utf8');

/** Tên các cột `not null` của một bảng, đọc từ file SQL. */
function cotBatBuoc(tenBang) {
  const m = sql.match(new RegExp('create table if not exists public\\.' +
                                 tenBang + '\\s*\\(([\\s\\S]*?)\\n\\);'));
  if (!m) return null;
  const ra = [];
  for (const dong of m[1].split('\n')) {
    const sach = dong.replace(/--.*$/, '').trim();
    if (!/not null/i.test(sach)) continue;
    const ten = sach.match(/^([a-z_]+)\s+/);
    if (!ten) continue;                       // primary key / foreign key / constraint
    if (['primary', 'foreign', 'constraint', 'unique', 'check'].includes(ten[1])) continue;
    if (ten[1] === 'tree_id') continue;        // `luu_cay()` tự gắn, không đi qua veBang
    ra.push(ten[1]);
  }
  return ra;
}

// Người mới TOANH, dựng đúng như `domains/person.js` dựng: không có `vn`,
// không có `branchId`. Đây chính là bản ghi đã làm hỏng app thật.
const nguoiMoiToanh = {
  id: 'P9999',
  uid: 'THU_P9999',
  names: [], sex: 'U',
  birth: { iso: null, raw: '', place: '' },
  death: { iso: null, raw: '', place: '' },
  burialPlace: '', title: '', occupation: '', education: '',
  religion: '', residence: '', nationality: '',
  living: true, photoFileId: '', note: '', deleted: false,
  meta: { createdAt: '', updatedAt: '', updatedBy: '' },
};

const cayThemNguoi = JSON.parse(JSON.stringify(lai));
cayThemNguoi.persons.push(nguoiMoiToanh);
const opsThem = soSanh(lai, cayThemNguoi);

kiem('thêm một người → đúng 1 dòng persons',
     opsThem.persons.luu.length === 1, keOps(opsThem));

// Quét CẢ BỐN bảng, không chỉ `persons`. Cùng một cái sai nằm sẵn ở `unions`
// (`ranks`, `partner_order`), chỉ là chưa ai chạm tới nó.
const BANG = [
  ['persons',  'persons'],
  ['unions',   'unions'],
  ['media',    'media'],
  ['sources',  'sources'],
];

// ⚠ PHÉP KIỂM CỦA PHÉP KIỂM. `cotBatBuoc()` đọc file SQL bằng biểu thức
//   chính quy; hỏng biểu thức ấy thì nó trả về danh sách RỖNG, và phép quét
//   dưới đây sẽ "đạt" mà chẳng kiểm gì cả. Một bộ kiểm xanh vì không kiểm gì
//   còn tệ hơn không có bộ kiểm, nên đếm luôn ở đây.
const demCot = BANG.map(([t]) => t + '=' + (cotBatBuoc(t) || []).length).join(' · ');
kiem('đọc được danh sách cột not null từ 01-bang.sql',
     (cotBatBuoc('persons') || []).length >= 15 &&
     (cotBatBuoc('unions')  || []).length >= 7 &&
     (cotBatBuoc('media')   || []).length >= 6 &&
     (cotBatBuoc('sources') || []).length >= 3,
     demCot);

const nullSai = [];
for (const [tenBang, tenOps] of BANG) {
  const batBuoc = cotBatBuoc(tenBang);
  if (batBuoc === null) { nullSai.push(tenBang + ': không đọc được lược đồ'); continue; }

  // Mọi dòng sinh ra trong bài kiểm này: dòng của `boCay` (cả cây) và dòng
  // của `soSanh` (chỉ phần đổi). Cả hai đường đều phải sạch.
  const dsDong = (dong[tenBang] || []).concat(opsThem[tenOps] ? opsThem[tenOps].luu : []);
  for (const d of dsDong) {
    for (const c of batBuoc) {
      if (d[c] === null || d[c] === undefined) {
        nullSai.push(tenBang + '.' + c + ' = null  (dòng ' + (d.id || '?') + ')');
      }
    }
  }
}

kiem('không dòng nào có null ở cột not null', nullSai.length === 0,
     [...new Set(nullSai)].slice(0, 8).join('\n        '));

// Và mỗi người mới phải mang một object `vn` RIÊNG, không dùng chung.
if (opsThem.persons.luu.length === 1) {
  const a = opsThem.persons.luu[0];
  const cayHaiNguoi = JSON.parse(JSON.stringify(cayThemNguoi));
  cayHaiNguoi.persons.push({ ...nguoiMoiToanh, id: 'P9998', uid: 'THU_P9998' });
  const hai = soSanh(lai, cayHaiNguoi).persons.luu;
  kiem('hai người mới không dùng chung một object vn',
       hai.length === 2 && hai[0].vn !== hai[1].vn && hai[0].birth !== hai[1].birth,
       'số dòng = ' + hai.length);
  kiem('vn của người mới là {} chứ không phải null',
       a.vn !== null && typeof a.vn === 'object' && Object.keys(a.vn).length === 0,
       JSON.stringify(a.vn));
}

// ------------------------------------------------------------
console.log('\n' + (hong === 0 ? 'TẤT CẢ ĐẠT' : 'CÓ PHÉP HỎNG') +
            ' — ' + dat + ' đạt, ' + hong + ' hỏng.');
process.exitCode = hong === 0 ? 0 : 1;

function keOps(ops) {
  const phan = [];
  for (const ten of ['persons', 'unions', 'children', 'media', 'sources']) {
    const o = ops[ten];
    if (o && (o.luu.length || o.xoa.length)) {
      phan.push(ten + ' luu=' + o.luu.length + ' xoa=' + o.xoa.length);
    }
  }
  if (ops.tree) phan.push('khối cây đổi');
  return phan.length ? phan.join(' · ') : '(rỗng)';
}
