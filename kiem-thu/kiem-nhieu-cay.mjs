// ============================================================
// giapha-supabase · kiem-thu/kiem-nhieu-cay.mjs
// Vai trò  : Gác ba chỗ hỏng của NHIỀU CÂY — `luoc-do/10-sua-nhieu-cay.sql`
//            và bốn file JS đi kèm.
// Chạy     : cd supabase/kiem-thu && node kiem-nhieu-cay.mjs
// Phiên bản: 0.1.0 · Cập nhật: 05/09/2026 11:09
// ============================================================
//
// ═══ BÀI KIỂM NÀY ĐỨNG Ở ĐÂU ═══
//
// Nó **không chạy SQL** — nó đọc văn bản file. Phần chạy thật là
// `kiem-thu/thu-nhieu-cay.sql`, đo trên hai cây có thật (16 phép, có kiểm
// chứng ngược).
//
// Hai bài kiểm gác hai thứ khác nhau, và cần cả hai:
//
//   • `thu-nhieu-cay.sql` chứng minh **máy chủ xử sự đúng**. Nhưng nó không
//     biết trình duyệt có gọi đúng cửa hay không — `chonGiaPha()` vẫn có thể
//     `delete` sạch như cũ mà mọi phép SQL vẫn xanh, vì nó tự gọi
//     `dat_cay_dang_mo()` để đo.
//   • File này gác **phía trình duyệt**: cái `delete` cũ có thật sự đi khỏi
//     mã chưa, và có ai lặng lẽ dựng lại nó không.
//
// ⚠ Bài học đã ghi ở `kiem-duyet-dang-ky.mjs` và áp lại ở đây: **đừng hỏi
//   đúng chữ, hãy hỏi đúng điều.** Phép về `limit 1` dưới đây không hỏi "có
//   viết `order by` không" — thêm `order by` vẫn là đoán; nó hỏi "còn chỗ nào
//   tự chọn cây thay người gọi không".

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DAY = dirname(fileURLToPath(import.meta.url));
const doc = (p) => readFileSync(resolve(DAY, p), 'utf8');

const SQL_10 = doc('../luoc-do/10-sua-nhieu-cay.sql');
const SQL_07 = doc('../luoc-do/07-duyet-dang-ky.sql');
const SQL_08 = doc('../luoc-do/08-kiem-duyet.sql');
const JS_SB  = doc('../js/services/sb.js');
const JS_REPO = doc('../js/services/repo.js');
const JS_ST  = doc('../js/pages/settings.js');
const JS_KD  = doc('../js/pages/khoi-dong.js');
const THU    = doc('./thu-nhieu-cay.sql');

let dat = 0, hong = 0;
const lenh10 = boGhiChu(SQL_10);

// ============================================================
// PHẦN A — lược đồ: hai cột mới và cái chỉ số canh chúng
// ============================================================
console.log('\nPHẦN A — lược đồ');

kiem('thêm cột dang_mo vào user_settings',
     /alter\s+table\s+public\.user_settings[\s\S]{0,120}?dang_mo\s+boolean/i.test(lenh10),
     'không thấy câu alter thêm cột');

kiem('thêm cột hien_ngay_gio vào user_settings',
     /alter\s+table\s+public\.user_settings[\s\S]{0,120}?hien_ngay_gio\s+boolean/i.test(lenh10),
     'không thấy câu alter thêm cột');

// ⚠ Cột `dang_mo` mà không có chỉ số duy nhất thì hai cây cùng bật cờ được,
//   và lúc ấy `cay_dang_mo()` lại rơi vào đúng cái `limit 1` tuỳ ý mà cả file
//   này sinh ra để gỡ — chỉ khác chỗ đứng.
kiem('có chỉ số DUY NHẤT canh "mỗi người một cây đang mở"',
     /create\s+unique\s+index[\s\S]{0,200}?user_settings\s*\(\s*user_id\s*\)\s*where\s+dang_mo/i.test(lenh10),
     'thiếu unique index một phần trên (user_id) where dang_mo');

kiem('câu di dời dữ liệu cũ dùng thứ tự ỔN ĐỊNH',
     /distinct\s+on\s*\(\s*user_id\s*\)[\s\S]{0,200}?order\s+by/i.test(lenh10),
     'distinct on mà không có order by — kết quả tuỳ ý');

// ============================================================
// PHẦN B — HỎNG 3: không hàm nào được tự chọn cây thay người gọi
// ============================================================
console.log('\nPHẦN B — không còn hàm nào đoán cây');

// ⚠ **Đừng hỏi "file 07 còn chữ `limit 1` không".** Hỏi thế thì phép này
//   HỎNG mãi mãi, vì `07` và `08` giữ nguyên văn bản cũ — chúng không được
//   dán lại, `10` định nghĩa đè lên chúng ở máy chủ. Bản đang CHẠY mới là
//   thứ phải đúng, và câu hỏi đúng là câu dưới đây.
kiem('file 10 tự nó không đoán cây thay người gọi',
     !/coalesce\s*\(\s*p_tree\s*,/i.test(lenh10),
     'file sửa mà lại dựng lại đúng cái nó đi sửa');

// Phép đắt nhất của cả bài, và nó quét **cả hai file cũ** thay vì đọc một
// danh sách viết tay: hàm bị quên cũng là hàm không có trong danh sách. Cùng
// lý lẽ với phép "còn file nào sót mã vai cũ" của `09-doi-ma-vai.sql`.
{
  const sot = [];
  for (const [ten, sql] of [['07', SQL_07], ['08', SQL_08]]) {
    for (const h of hamCoDoanCay(sql)) {
      if (!thanHam(lenh10, h)) sot.push(ten + '·' + h + '()');
    }
  }
  kiem('mọi hàm còn đoán cây ở 07/08 đều đã được ĐỊNH NGHĨA LẠI ở file 10',
       sot.length === 0,
       'còn đoán mà không ai thay: ' + sot.join(', '));
}

// ⚠ Ba hàm này phải BẮT BUỘC có `p_tree`. `default null` còn đó thì nơi gọi
//   quên truyền vẫn chạy, và trả về một bảng rỗng khó hiểu thay vì một lỗi.
for (const ten of ['ds_cho_duyet', 'dem_cho_kiem_duyet', 'ds_kiem_duyet']) {
  const than = thanHam(lenh10, ten);
  kiem('hàm ' + ten + '() được định nghĩa lại ở file 10', than !== null, 'không thấy');
  if (!than) continue;
  const dau = than.slice(0, than.indexOf('returns'));
  kiem('  ' + ten + '() KHÔNG cho p_tree bỏ trống',
       !/p_tree[^,)]*default/i.test(dau), 'p_tree vẫn có default');
}

// `trang_thai_cua_toi()` là ngoại lệ có lý do — người chưa được duyệt không
// đọc được bảng `trees` nên không biết mã cây. Nhưng nó phải trả lời thật khi
// không quyết được, chứ không đoán.
{
  const than = thanHam(lenh10, 'trang_thai_cua_toi');
  kiem('trang_thai_cua_toi() vẫn cho p_tree bỏ trống (có lý do)',
       than !== null && /p_tree\s+uuid\s+default\s+null/i.test(than),
       'ngoại lệ này là cố ý — xem mục 4d');
  kiem('  và khi không quyết được thì nói thật (trạng thái nhieucay)',
       than !== null && /nhieucay/.test(than), 'thiếu nhánh nhieucay');
  kiem('  ưu tiên cây của CHÍNH người gọi trước khi nhìn ra cả máy chủ',
       than !== null &&
       than.indexOf('tree_members') < than.indexOf('count(*) into v_so'),
       'nhìn ra cả máy chủ trước là bỏ rơi người đã có chân trong một cây');
}

// ============================================================
// PHẦN C — HỎNG 1: phía trình duyệt thôi xoá sạch
// ============================================================
console.log('\nPHẦN C — trình duyệt');

// Đây là phép mà `thu-nhieu-cay.sql` KHÔNG thay được: nó gọi thẳng hàm máy
// chủ, nên nó xanh cả khi `chonGiaPha()` vẫn xoá sạch như cũ.
{
  const than = hamJs(JS_SB, 'chonGiaPha');
  kiem('sb.chonGiaPha() có mặt', than !== null, 'không thấy');
  kiem('  KHÔNG còn delete trên user_settings',
       than !== null && !/from\('user_settings'\)[\s\S]{0,80}?\.delete\(/.test(than),
       'vẫn xoá sạch — đúng Hỏng 1');
  kiem('  đi qua cửa dat_cay_dang_mo',
       than !== null && /rpc\('dat_cay_dang_mo'/.test(than), 'không gọi hàm máy chủ');
}

// Rộng hơn một bậc: không file nào trong `services/` được phép xoá cả cụm
// `user_settings` của một người nữa.
{
  const con = (JS_SB.match(/from\('user_settings'\)[\s\S]{0,80}?\.delete\(/g) || []).length;
  kiem('không còn chỗ nào trong sb.js xoá cả cụm user_settings', con === 0,
       con + ' chỗ còn lại');
}

kiem('cayDangChon() đọc CỜ dang_mo, không đọc "có dòng hay không"',
     /\.eq\('dang_mo',\s*true\)/.test(JS_SB),
     'vẫn suy ra cây đang mở từ sự có mặt của dòng');

// ============================================================
// PHẦN D — HỎNG 2: công tắc ngày giỗ có chỗ nằm
// ============================================================
console.log('\nPHẦN D — công tắc ngày giỗ');

kiem('sb.js có hàm ghi công tắc xuống máy chủ',
     /export\s+async\s+function\s+datHienNgayGio/.test(JS_SB), 'thiếu datHienNgayGio');
kiem('layPhien() trả về hienNgayGio',
     /hienNgayGio/.test(JS_SB), 'phiên không mang giá trị này về');
kiem('repo.khoiTao() nạp nó vào state',
     /state\.hienNgayGio\s*=\s*phien\.hienNgayGio/.test(JS_REPO), 'không nạp');
kiem('settings.js ghi lại khi người dùng bấm',
     /datHienNgayGio\(/.test(JS_ST), 'bấm xong không lưu ở đâu');

// ============================================================
// PHẦN E — nơi gọi truyền cây tường minh
// ============================================================
console.log('\nPHẦN E — nơi gọi');

for (const ten of ['dsChoDuyet', 'dsKiemDuyet', 'demChoKiemDuyet']) {
  const than = hamJs(JS_SB, ten);
  kiem(ten + '() không gọi máy chủ khi thiếu treeId',
       than !== null && /if\s*\(!k\s*\|\|\s*!treeId\)/.test(than),
       'vẫn gọi với p_tree rỗng');
  kiem('  ' + ten + '() thôi truyền `treeId || null`',
       than !== null && !/p_tree:\s*treeId\s*\|\|\s*null/.test(than),
       'còn biến thiếu treeId thành null rồi gửi đi');
}

kiem('màn hình xin vào truyền cây tường minh',
     /xinVaoCay\([^)]*phien\.treeId/.test(JS_KD), 'vẫn để máy chủ đoán hộ');
kiem('màn hình khởi động xử lý được trạng thái nhieucay',
     /'nhieucay'/.test(JS_KD), 'người rơi vào đó sẽ thấy một màn hình sai');

// ============================================================
// PHẦN F — bài kiểm chạy thật phải còn phép kiểm chứng ngược
// ============================================================
console.log('\nPHẦN F — bài kiểm chạy thật');

kiem('thu-nhieu-cay.sql có phép KIỂM CHỨNG NGƯỢC',
     /KIỂM CHỨNG NGƯỢC/.test(THU),
     'mất phép ấy thì mọi dòng ĐẠT chỉ nói "hôm nay không hỏng"');
kiem('  và nó tự trả lại nguyên trạng',
     /trả lại nguyên trạng/.test(THU), 'bài kiểm để lại rác trên máy chủ thật');
kiem('  và nó dừng ngay nếu chưa có cây thứ hai',
     /TỪ HAI CÂY/.test(THU), 'chạy khi chỉ có một cây là đo được cái gì?');

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

/** Thân của một hàm SQL: từ `create … function <ten>` tới dấu `$$;` đóng. */
function thanHam(sql, ten) {
  const re = new RegExp('create\\s+or\\s+replace\\s+function\\s+public\\.' + ten + '\\b');
  const i = sql.search(re);
  if (i < 0) return null;
  const j = sql.indexOf('$$;', i);
  return j < 0 ? sql.slice(i) : sql.slice(i, j + 3);
}

/**
 * Tên những hàm SQL trong một file mà thân của chúng còn tự chọn cây thay
 * người gọi (`coalesce(p_tree, …)`).
 */
function hamCoDoanCay(sql) {
  const s = boGhiChu(sql);
  const re = /create\s+or\s+replace\s+function\s+public\.([a-z0-9_]+)/gi;
  const moc = [];
  let m;
  while ((m = re.exec(s)) !== null) moc.push({ ten: m[1], i: m.index });
  const ra = [];
  for (let k = 0; k < moc.length; k++) {
    const doan = s.slice(moc[k].i, k + 1 < moc.length ? moc[k + 1].i : s.length);
    if (/coalesce\s*\(\s*p_tree\s*,/i.test(doan) && !ra.includes(moc[k].ten)) {
      ra.push(moc[k].ten);
    }
  }
  return ra;
}

/**
 * Thân của một hàm JavaScript, cắt thô từ chữ `function <ten>` tới hàm kế
 * tiếp. Đủ dùng cho việc soi "trong hàm này có câu ấy không", và cố ý không
 * cố phân tích cú pháp — một bộ phân tích JS trong bài kiểm là thứ phải bảo
 * trì thêm mà không mua được gì.
 */
function hamJs(js, ten) {
  const i = js.search(new RegExp('function\\s+' + ten + '\\s*\\('));
  if (i < 0) return null;
  const j = js.indexOf('\nexport ', i + 1);
  return j < 0 ? js.slice(i) : js.slice(i, j);
}
