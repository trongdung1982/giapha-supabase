// ============================================================
// giapha-supabase · kiem-thu/kiem-trang-quan-tri.mjs
// Vai trò  : Kiểm TRANG DUYỆT NỘI DUNG — `QuanTri.html`,
//            `js/app-quan-tri.js`, `js/pages/quan-tri.js` và năm cửa mới
//            trong `js/services/sb.js` (b98).
// Chạy     : cd supabase/kiem-thu && node kiem-trang-quan-tri.mjs
// Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 23:35
// ============================================================
//
// ═══ BÀI KIỂM NÀY CHỨNG MINH ĐƯỢC GÌ, VÀ KHÔNG CHỨNG MINH ĐƯỢC GÌ ═══
//
// ⚠ **Không mở trình duyệt và không chạy SQL.** Nó đọc văn bản file. Nên nó
//   KHÔNG chứng minh được: bảng vẽ ra trông thế nào, bấm Duyệt có chạy không,
//   hay hoàn tác trả lại đúng dữ liệu. Ba điều ấy chỉ người bấm thử trên máy
//   chủ thật mới nói được — đúng như b94 đã làm cho phân quyền.
//
// Cái nó gác là **sáu chỗ hỏng câm**, tức hỏng mà không có câu lỗi nào:
//
//   1. **Tên tham số RPC lệch chữ ký SQL.** Gõ `p_trangthai` thay vì
//      `p_trang_thai` thì Supabase trả lỗi *"function not found"* mà `sb.js`
//      nuốt gọn thành mảng rỗng — màn hình hiện "Không có gì đang chờ duyệt",
//      y hệt lúc hàng chờ trống thật. Đây là chỗ nguy hiểm nhất của cả b98,
//      nên PHẦN D đối chiếu từng tên với chính file SQL.
//   2. **Tên file sai chữ hoa.** GitHub Pages phân biệt hoa với thường; nút
//      trỏ tới `quantri.html` ra trang 404, mà trên máy Windows thì mở vẫn
//      được — tức lỗi chỉ lộ ra sau khi đã đẩy lên mạng.
//   3. **Thứ tự hai thẻ `<script>`.** Bản UMD đặt `window.supabase`; module
//      chạy trước nó thì `services/sb.js` thấy `undefined` và app im lặng
//      không mở được, kèm một câu lỗi không nói gì về nguyên nhân.
//   4. **Trang mới gọi thẳng máy chủ**, phá luật một cửa của `CLAUDE.md`
//      mục 5.
//   5. **Lấy `vaiTro` phía trình duyệt làm hàng rào** thay vì hỏi máy chủ.
//   6. **Điểm khởi động kéo theo cả bộ vẽ sơ đồ** về máy người chỉ định đọc
//      một cái bảng.
//
// ⚠ Nguyên tắc giữ từ b94 và b97: **đừng hỏi đúng chữ, hãy hỏi đúng điều.**
//   PHẦN G ở cuối bẻ gãy chính mã này rồi kiểm lại — một phép "đạt" trên mã
//   hỏng là một phép vô dụng.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DAY = dirname(fileURLToPath(import.meta.url));
const doc = (p) => readFileSync(resolve(DAY, p), 'utf8');

const HTML = doc('../QuanTri.html');
const JS_APP = doc('../js/app-quan-tri.js');
const JS_QT = doc('../js/pages/quan-tri.js');
const JS_SB = doc('../js/services/sb.js');
const JS_ST = doc('../js/pages/settings.js');
const SQL_08 = boGhiChu(doc('../luoc-do/08-kiem-duyet.sql'));

/** Tên file có thật ở gốc repo, giữ nguyên chữ hoa chữ thường. */
const FILE_GOC = readdirSync(resolve(DAY, '..'));

let dat = 0, hong = 0;

// ============================================================
// PHẦN A — trang QuanTri.html
// ============================================================
console.log('\nPHẦN A — trang QuanTri.html');

kiem('file mang đúng tên QuanTri.html (đúng cả chữ hoa)',
     FILE_GOC.includes('QuanTri.html'),
     'gốc repo có: ' + FILE_GOC.filter((f) => /quantri/i.test(f)).join(', '));

kiem('có thẻ nạp thư viện Supabase trong repo',
     /<script\s+src="js\/vendor\/supabase\.js"><\/script>/.test(HTML),
     'thiếu thẻ vendor');

kiem('thẻ vendor đứng TRƯỚC thẻ module (bẫy 3)',
     thuTuScriptDung(HTML), 'module chạy trước khi window.supabase có mặt');

kiem('điểm khởi động là js/app-quan-tri.js',
     /<script\s+type="module"\s+src="js\/app-quan-tri\.js"><\/script>/.test(HTML),
     'không thấy thẻ module đúng đường dẫn');

kiem('file điểm khởi động ấy có thật',
     existsSync(resolve(DAY, '../js/app-quan-tri.js')), 'thiếu file');

kiem('có meta robots noindex — gia phả không nằm trong kết quả tìm kiếm',
     /name="robots"\s+content="noindex/.test(HTML), 'thiếu thẻ robots');

kiem('có <title>', /<title>[^<]+<\/title>/.test(HTML), 'thiếu title');

kiem('có đường về trang chính khi không nạp được mã',
     /href="index\.html"/.test(HTML), 'không có lối về index.html');

// `CLAUDE.md` mục 3: thư viện nằm trong repo, không nạp từ CDN.
kiem('không nạp mã từ máy chủ ngoài',
     !/src="https?:/.test(HTML), 'có thẻ script trỏ ra ngoài');

// ============================================================
// PHẦN B — điểm khởi động
// ============================================================
console.log('\nPHẦN B — js/app-quan-tri.js');

kiem('nạp màn hình duyệt', /from '\.\/pages\/quan-tri\.js'/.test(JS_APP),
     'không import pages/quan-tri.js');

kiem('vẽ vào #app', /getElementById\('app'\)/.test(JS_APP), 'không tìm #app');

// Cả điểm của việc có HAI điểm khởi động: trang duyệt không kéo theo bộ vẽ.
kiem('KHÔNG kéo theo bộ vẽ sơ đồ (bẫy 6)',
     khongKeoTheoSoDo(JS_APP), 'import tree-view/khoi-dong — kéo cả bộ vẽ về');

// ============================================================
// PHẦN C — màn hình js/pages/quan-tri.js
// ============================================================
console.log('\nPHẦN C — màn hình js/pages/quan-tri.js');

kiem('không chạm window.supabase — luật MỘT CỬA (bẫy 4)',
     motCua(JS_QT), 'gọi thẳng máy chủ, phá luật một cửa của CLAUDE.md mục 5');

kiem('hỏi máy chủ ai được duyệt, không tự suy từ vaiTro (bẫy 5)',
     /coTheKiemDuyet/.test(JS_QT) && !/vaiTro\s*===/.test(JS_QT),
     'lấy vaiTro phía trình duyệt làm hàng rào');

for (const cua of ['dsKiemDuyet', 'demChoKiemDuyet', 'duyetThayDoi', 'tuChoiThayDoi']) {
  kiem('gọi cửa ' + cua + '()', new RegExp('\\b' + cua + '\\s*\\(').test(JS_QT),
       'không dùng cửa này');
}

// Máy chủ viết sẵn câu tiếng Việt cho cả bốn ca không hoàn tác được
// (`dabisuatiep` · `keotheo` · `khongcoanhchup` · `vuongkhoangoai`). Chỉ nó
// mới biết AI đã sửa tiếp và sửa LÚC NÀO — tự chế câu khác là bỏ mất điều ấy.
kiem('in thẳng câu giải thích của máy chủ, không tự chế câu khác',
     /kq\s*&&\s*kq\.loi/.test(JS_QT), 'không thấy chỗ đọc kq.loi');

// Duyệt hay gạt đều đổi con số trên tấm lọc, và gạt còn đổi cả dữ liệu mà
// những dòng khác đang nói về. Giữ bảng cũ là để người duyệt quyết định dựa
// trên một bức tranh đã cũ.
kiem('vẽ lại cả bảng sau mỗi lần bấm',
     (JS_QT.match(/napLai\(\)/g) || []).length >= 3, 'không thấy đủ chỗ nạp lại');

// Nút gạt phải nói ra hậu quả TRƯỚC khi bấm: gạt không phải bỏ qua, nó hoàn
// tác dữ liệu về ảnh chụp trước lần Lưu.
kiem('nút gạt nói rõ nó HOÀN TÁC dữ liệu',
     /Gạt đi và hoàn tác/.test(JS_QT), 'chữ trên nút không nói ra hậu quả');

// App này không dùng confirm() ở đâu cả — trên điện thoại hộp thoại ấy hiện ra
// ở một chỗ chẳng liên quan gì tới nút vừa bấm.
kiem('không dùng confirm() — hỏi lại bằng hai nhịp',
     !/\bconfirm\s*\(/.test(boGhiChuJs(JS_QT)), 'còn dùng confirm()');

kiem('có ô lý do khi gạt — câu ấy lưu vào nhật ký',
     /textarea/.test(JS_QT) && /tuChoiThayDoi\([^)]*oLyDo|oLyDo\.value/.test(JS_QT),
     'gạt mà không gửi lý do lên');

for (const [ten, ma] of [['quan-tri.js', JS_QT], ['app-quan-tri.js', JS_APP]]) {
  kiem(ten + ' có ghi chú đầu file đúng khuôn', ghiChuDauFile(ma), 'thiếu dòng');
}

// ============================================================
// PHẦN D — năm cửa mới trong sb.js, đối chiếu CHỮ KÝ SQL
// ============================================================
console.log('\nPHẦN D — sb.js gọi đúng chữ ký của 08-kiem-duyet.sql (bẫy 1)');

const CUA = [
  { js: 'coTheKiemDuyet',  sql: 'co_the_kiem_duyet' },
  { js: 'dsKiemDuyet',     sql: 'ds_kiem_duyet' },
  { js: 'demChoKiemDuyet', sql: 'dem_cho_kiem_duyet' },
  { js: 'duyetThayDoi',    sql: 'duyet_thay_doi' },
  { js: 'tuChoiThayDoi',   sql: 'tu_choi_thay_doi' },
];

for (const c of CUA) {
  kiem('sb.js xuất hàm ' + c.js + '()',
       new RegExp('export\\s+async\\s+function\\s+' + c.js + '\\b').test(JS_SB),
       'không thấy');

  const lech = lechThamSo(JS_SB, SQL_08, c.sql);
  kiem('  ' + c.sql + '() — tên tham số khớp chữ ký SQL',
       lech !== null && lech.length === 0,
       lech === null ? 'không tìm thấy lời gọi hoặc chữ ký' : lech.join('; '));

  // Đóng sẵn cửa vẫn hơn tin vào một phép kiểm trong thân hàm.
  kiem('  ' + c.sql + '() được cấp cho authenticated',
       coCapQuyen(SQL_08, c.sql), 'thiếu grant execute … to authenticated');
}

// `sb.js` là file DUY NHẤT được chạm `window.supabase` — nên phép trên chỉ có
// nghĩa nếu năm hàm ấy thật sự đi qua `layKhach()`, không dựng máy khách riêng.
kiem('năm cửa mới đều đi qua layKhach() chung',
     (JS_SB.match(/const k = layKhach\(\);/g) || []).length >= 5 + 10,
     'có hàm tự dựng máy khách riêng');

// ============================================================
// PHẦN E — đường vào trang, từ màn hình Cài đặt
// ============================================================
console.log('\nPHẦN E — đường vào trang (settings.js)');

kiem('Cài đặt có khối Duyệt nội dung',
     /veKhoiKiemDuyet/.test(JS_ST) && /demChoKiemDuyet/.test(JS_ST), 'thiếu khối');

kiem('nút trỏ tới đúng tên file có thật, đúng cả chữ hoa (bẫy 2)',
     tenFileTrongMaCoThat(JS_ST, FILE_GOC),
     'chuỗi trong settings.js không khớp tên file nào ở gốc repo');

// Điều kiện vai trong Cài đặt chỉ để khỏi vẽ khối trống. Nếu nó là phép kiểm
// DUY NHẤT thì hỏng — nên trang kia phải hỏi lại máy chủ, và nó có hỏi
// (PHẦN C). Ở đây chỉ soát rằng khối không tự cấp quyền cho ai khác.
kiem('khối ấy chỉ mọc cho hai vai quản trị',
     /veKhoiKiemDuyet[\s\S]{0,600}quan_tri_he_thong[\s\S]{0,80}quan_tri/.test(JS_ST),
     'điều kiện vai không đúng hai vai quản trị');

// ============================================================
// PHẦN G — KIỂM CHỨNG NGƯỢC: bẻ gãy mã rồi xem bài kiểm có bắt được không
// ============================================================
console.log('\nPHẦN G — kiểm chứng ngược (bẻ gãy có chủ ý)');

// G1 — đổi một chữ trong tên tham số. Đây là bẫy số 1, và là ca duy nhất
// hỏng mà màn hình vẫn trông bình thường.
{
  const hong1 = JS_SB.replace("p_trang_thai:", "p_trangthai:");
  const lech = lechThamSo(hong1, SQL_08, 'ds_kiem_duyet');
  kiem('bắt được tên tham số sai một chữ', lech !== null && lech.length > 0,
       'không bắt được — phép ở PHẦN D vô dụng');
}

// G2 — tên file mất chữ hoa. Trên Windows vẫn mở được, trên GitHub Pages thì 404.
{
  const hong2 = JS_ST.replace(/'QuanTri\.html'/, "'quantri.html'");
  kiem('bắt được tên file sai chữ hoa',
       !tenFileTrongMaCoThat(hong2, FILE_GOC), 'không bắt được');
}

// G3 — trang duyệt tự gọi thẳng máy chủ.
{
  const hong3 = JS_QT + '\nconst k = window.supabase.createClient(1, 2);\n';
  kiem('bắt được lời gọi thẳng window.supabase', !motCua(hong3), 'không bắt được');
}

// G4 — đảo thứ tự hai thẻ script.
{
  const hong4 = HTML
    .replace('<script src="js/vendor/supabase.js"></script>', '@@VENDOR@@')
    .replace('<script type="module" src="js/app-quan-tri.js"></script>',
             '<script src="js/vendor/supabase.js"></script>')
    .replace('@@VENDOR@@',
             '<script type="module" src="js/app-quan-tri.js"></script>');
  kiem('bắt được thứ tự hai thẻ script bị đảo', !thuTuScriptDung(hong4),
       'không bắt được');
}

// G5 — điểm khởi động kéo theo bộ vẽ sơ đồ.
{
  const hong5 = JS_APP + "\nimport { mountTreeView } from './pages/tree-view.js';\n";
  kiem('bắt được điểm khởi động kéo theo bộ vẽ', !khongKeoTheoSoDo(hong5),
       'không bắt được');
}

// ------------------------------------------------------------
console.log('\n' + (hong === 0 ? 'TẤT CẢ ĐẠT' : 'CÓ PHÉP HỎNG') +
            ' — ' + dat + ' đạt, ' + hong + ' hỏng.');
process.exitCode = hong === 0 ? 0 : 1;

// ============================================================
// Hàm phụ
// ============================================================

function kiem(ten, dieuKien, chiTiet) {
  if (dieuKien) { dat++; console.log('  ĐẠT  ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + '  →  ' + chiTiet); }
}

/** Bỏ mọi dòng ghi chú `--` để phép soi không "đạt" nhờ chính lời giải thích. */
function boGhiChu(sql) {
  return sql.split('\n').filter((d) => !/^\s*--/.test(d)).join('\n');
}

/** Thẻ vendor phải đứng trước thẻ module — nếu không, `window.supabase` chưa có. */
function thuTuScriptDung(html) {
  // ⚠ Tìm chính THẺ, không tìm tên file trần: tên `js/vendor/supabase.js` còn
  //   nằm trong khối #loi ở đầu trang (câu *"Thiếu file …"*), và bắt trúng chỗ
  //   ấy thì phép này luôn "đạt" dù hai thẻ có đảo chỗ cho nhau. PHẦN G bẻ ra
  //   đúng cái bẫy ấy, và lần đầu chạy nó đã bắt được bản viết vội này.
  const v = html.search(/<script\s+src="js\/vendor\/supabase\.js">/);
  const m = html.search(/<script\s+type="module"/);
  return v > -1 && m > -1 && v < m;
}

/**
 * Luật một cửa: chỉ `services/sb.js` được chạm `window.supabase`, và không
 * file nào ngoài nó được gọi `.rpc(`.
 * ⚠ Bỏ ghi chú `//` trước khi soi — nhắc TÊN trong ghi chú thì không tính,
 *   đúng như `/kiem-tra` phép 2 quy định.
 */
function motCua(js) {
  const lenh = boGhiChuJs(js);
  return !/window\.supabase/.test(lenh) && !/\.rpc\s*\(/.test(lenh);
}

/**
 * Bỏ mọi dòng ghi chú `//` và `*` trước khi soi LỆNH.
 *
 * ⚠ Không bỏ thì phép nào cũng "đạt" — hoặc "hỏng" — nhờ chính đoạn ghi chú
 *   giải thích nó. Bẫy này đã có tiền lệ ở `kiem-sao-luu.mjs`, và nó vồ đúng
 *   file này ngay lần chạy đầu: câu ghi chú *"app này không dùng confirm()"*
 *   trong `quan-tri.js` làm phép cấm `confirm(` báo hỏng trên một file không
 *   hề gọi `confirm` một lần nào.
 */
function boGhiChuJs(js) {
  return js.split('\n').filter((d) => !/^\s*(\/\/|\*|\/\*)/.test(d)).join('\n');
}

/** Điểm khởi động chỉ được kéo theo màn hình của chính nó. */
function khongKeoTheoSoDo(js) {
  const lenh = boGhiChuJs(js);
  return !/from\s+'\.\/pages\/(tree-view|khoi-dong)\.js'/.test(lenh);
}

/** Khối ghi chú sáu dòng của `CLAUDE.md` mục 6. */
function ghiChuDauFile(js) {
  const dau = js.slice(0, 700);
  return /Vai trò\s+:/.test(dau) && /Lớp\s+:/.test(dau) &&
         /Phụ thuộc:/.test(dau) && /Phiên bản:/.test(dau);
}

/** Tham số của một hàm SQL: `[{ ten, coMacDinh }]`, hoặc `null` nếu không thấy. */
function thamSoSql(sql, ten) {
  const re = new RegExp('create\\s+or\\s+replace\\s+function\\s+public\\.' +
                        ten + '\\s*\\(([\\s\\S]*?)\\)\\s*returns', 'i');
  const m = sql.match(re);
  if (!m) return null;
  return m[1].split(',').map((p) => p.trim()).filter(Boolean).map((p) => ({
    ten: (p.match(/^([a-z_]+)/i) || [])[1] || '',
    coMacDinh: /\bdefault\b/i.test(p),
  }));
}

/** Tên các khoá truyền vào một lời gọi `.rpc('<ten>', { … })`. */
function khoaRpc(js, ten) {
  const m = js.match(new RegExp("\\.rpc\\(\\s*'" + ten + "'\\s*,\\s*\\{([\\s\\S]*?)\\}"));
  if (!m) return null;
  return [...m[1].matchAll(/(p_[a-z_]+)\s*:/g)].map((x) => x[1]);
}

/**
 * So khoá trình duyệt gửi lên với tham số hàm SQL nhận vào. Trả mảng lời kể
 * chỗ lệch — rỗng là khớp, `null` là không tìm thấy một trong hai bên.
 *
 * Hai chiều đều phải soát:
 *   · khoá thừa  → Supabase không tìm thấy hàm nào có chữ ký ấy → lỗi câm.
 *   · thiếu tham số KHÔNG có `default` → cùng một kiểu hỏng.
 */
function lechThamSo(js, sql, ten) {
  const cua = thamSoSql(sql, ten);
  const goi = khoaRpc(js, ten);
  if (!cua || !goi) return null;

  const tenCua = cua.map((p) => p.ten);
  const loi = [];
  for (const k of goi) {
    if (!tenCua.includes(k)) loi.push('gửi thừa/sai tên ' + k);
  }
  for (const p of cua) {
    if (!p.coMacDinh && !goi.includes(p.ten)) loi.push('thiếu tham số bắt buộc ' + p.ten);
  }
  return loi;
}

function coCapQuyen(sql, ten) {
  return new RegExp('grant\\s+execute\\s+on\\s+function\\s+public\\.' + ten +
                    '\\s*\\([^)]*\\)\\s*to\\s+authenticated', 'i').test(sql);
}

/**
 * Mọi chuỗi `'<gì đó>.html'` trong mã phải trỏ tới một file CÓ THẬT ở gốc
 * repo, đúng từng chữ hoa. Đây là phép duy nhất bắt được lỗi chữ hoa trên máy
 * Windows — nơi `quantri.html` vẫn mở ra đúng file.
 */
function tenFileTrongMaCoThat(js, dsFile) {
  const ds = [...js.matchAll(/'([A-Za-z0-9_-]+\.html)'/g)].map((m) => m[1]);
  return ds.length > 0 && ds.every((f) => dsFile.includes(f));
}
