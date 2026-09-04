// ============================================================
// giapha-supabase · kiem-thu/kiem-kiem-duyet.mjs
// Vai trò  : Kiểm cơ chế KIỂM DUYỆT NỘI DUNG — `luoc-do/08-kiem-duyet.sql`
//            và bản `luu_cay()` 0.3.0 ở `luoc-do/03-ham-luu-cay.sql`.
// Chạy     : cd supabase/kiem-thu && node kiem-kiem-duyet.mjs
// Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 21:35
// ============================================================
//
// ═══ BÀI KIỂM NÀY CHỨNG MINH ĐƯỢC GÌ, VÀ KHÔNG CHỨNG MINH ĐƯỢC GÌ ═══
//
// ⚠ **Không chạy SQL** — máy không có Postgres, và Supabase thật thì không
//   đem ra thử. Cùng lý lẽ với `kiem-quyen-truc-he.mjs` và
//   `kiem-duyet-dang-ky.mjs`. Nó đọc văn bản file và soi cấu trúc.
//
// Nên nó KHÔNG chứng minh được: câu SQL chạy được, hoàn tác trả lại đúng dữ
// liệu, hay hàng rào chặn được người thật. Ba điều ấy chỉ phép thử trên máy
// chủ thật mới nói được — đúng như b94 đã làm cho phân quyền.
//
// Cái nó gác là **năm cái bẫy mà đọc bằng mắt hay bỏ sót**, và cả năm đều có
// tiền lệ hỏng thật trong dự án này hoặc trong chính thiết kế lần này:
//
//   1. **Thứ tự trong `luu_cay()`** — chụp ảnh phải đứng TRƯỚC mọi lệnh ghi.
//      Đứng sau thì `truoc` chụp đúng dữ liệu MỚI, và hoàn tác trở thành ghi
//      lại y nguyên cái vừa ghi. Không có gì báo lỗi, không ai nhận ra cho
//      tới ngày cần hoàn tác thật.
//   2. **`to_jsonb` trên dòng không khớp `left join`** — cho ra một object
//      toàn `null` chứ KHÔNG cho ra `null`. Lẫn hai thứ ấy thì hoàn tác một
//      lần "thêm người mới" sẽ chèn vào bảng một người không tên thay vì bỏ
//      người ấy đi.
//   3. **Danh sách cột lệch nhau** — `luu_cay()` ghi 19 cột của `persons`,
//      đường khôi phục ở `08` phải khôi phục đúng 19 cột ấy. Thêm một cột
//      vào bảng mà quên một bên là cột ấy âm thầm mất khi hoàn tác. Đây đúng
//      kiểu hỏng `DU-LIEU.md` mục 3 điều 7 đã ghi về `branch_id`.
//   4. **Bẫy `null`** (b94) — cửa kiểm quyền viết dạng phủ định mà quên bọc.
//   5. **Xoá-rồi-chèn khi khôi phục** — xoá một người là cascade cắt mọi
//      quan hệ của họ, kể cả quan hệ lần Lưu này không đụng tới.
//
// ⚠ Và nguyên tắc học từ b94, giữ nguyên ở đây: **đừng hỏi đúng chữ, hãy hỏi
//   đúng điều.** Phần G ở cuối chứng minh điều đó bằng cách bẻ gãy chính mã
//   này rồi kiểm lại — một phép "đạt" trên mã hỏng là một phép vô dụng.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const DAY = dirname(fileURLToPath(import.meta.url));
const doc = (p) => readFileSync(resolve(DAY, p), 'utf8');
const docNeuCo = (p) => (existsSync(resolve(DAY, p)) ? doc(p) : null);

/** Mọi `.sql` của `luoc-do/` và mọi `.js` của `js/`, trừ `js/vendor/`. */
function docCaThuMuc() {
  const ra = {};
  const quet = (thuMuc, duoi) => {
    for (const e of readdirSync(resolve(DAY, thuMuc), { withFileTypes: true })) {
      const p = join(thuMuc, e.name);
      // `vendor/` là thư viện của người khác, chép nguyên — không soi.
      if (e.isDirectory()) { if (e.name !== 'vendor') quet(p, duoi); continue; }
      if (e.name.endsWith(duoi)) ra[p.replace(/\\/g, '/')] = doc(p);
    }
  };
  quet('../luoc-do', '.sql');
  quet('../js', '.js');
  return ra;
}

const SQL_03 = doc('../luoc-do/03-ham-luu-cay.sql');
const SQL_08 = doc('../luoc-do/08-kiem-duyet.sql');
const JS_ST = doc('../js/pages/settings.js');
const SQL_09 = docNeuCo('../luoc-do/09-doi-ma-vai.sql');

/**
 * Mọi file SQL của lược đồ và mọi file JS của dự án, để soát mã vai cũ.
 * Đọc cả thư mục ở ĐÂY là cố ý — phép ở phần I hỏi *"còn file nào sót"*, mà
 * một danh sách viết tay thì không bao giờ trả lời được câu ấy: file bị quên
 * cũng là file không có trong danh sách.
 */
const MOI_FILE = docCaThuMuc();

const L03 = boGhiChu(SQL_03);
const L08 = boGhiChu(SQL_08);

let dat = 0, hong = 0;

// ============================================================
// PHẦN A — cột mới và cái chốt chỉ-bật-một-lần
// ============================================================
console.log('\nPHẦN A — cột mới trên change_log và tree_members');

for (const cot of ['trang_thai', 'truoc', 'duyet_boi', 'duyet_luc',
                   'ly_do_tu_choi']) {
  kiem('change_log có cột ' + cot,
       new RegExp('\\b' + cot + '\\b').test(L08), 'không thấy');
}

kiem('tree_members có cột tin_cay, mặc định false',
     /add column if not exists tin_cay\s+boolean\s+not null\s+default\s+false/i.test(L08),
     'thiếu cột hoặc mặc định không phải false');

// Mặc định `'cho'` là hướng hỏng-đằng-cấm: quên dán lại 03 thì mọi lần Lưu
// rơi vào hàng chờ — ồn ào và thấy ngay. Mặc định `'duyet'` thì kiểm duyệt
// im lặng không chạy, và không ai biết.
kiem("cột trang_thai mặc định 'cho', không phải 'duyet'",
     /add column trang_thai text not null default 'cho'/i.test(L08),
     'mặc định sai hướng — quên dán 03 sẽ không ai biết');

// Bật `approved`/`duyet` cho dòng cũ mà chạy lại lần hai là duyệt sạch hàng
// chờ. `07` chốt bằng `xin_luc is null`; ở đây chốt bằng sự vắng mặt của cột.
{
  const khoi = khoiDo(L08, 'trang_thai');
  kiem('lệnh bật nhật ký cũ thành duyet nằm trong khối do có chốt một-lần',
       khoi !== null &&
       /information_schema\.columns/i.test(khoi) &&
       /update public\.change_log set trang_thai = 'duyet'/i.test(khoi),
       'lệnh update đứng trần → dán lại lần hai là duyệt sạch hàng chờ');

  // ⚠ Đếm số lệnh đổi `trang_thai` HÀNG LOẠT — tức không giới hạn bằng
  //   `where … id =`. `duyet_thay_doi()` và `tu_choi_thay_doi()` cũng đổi cột
  //   ấy nhưng mỗi lần đúng một dòng, nên chúng không tính. Hỏi đúng điều
  //   (có quét cả bảng không), không hỏi đúng chữ (có bao nhiêu câu update).
  const hangLoat = cacCauUpdate(L08, 'change_log')
    .filter((c) => /trang_thai/.test(c) && !/where[\s\S]*\bid\s*=/i.test(c));
  kiem('  và chỉ có ĐÚNG MỘT lệnh đổi trang_thai hàng loạt, nằm trong khối ấy',
       hangLoat.length === 1 && khoi !== null && khoi.includes(hangLoat[0]),
       hangLoat.length + ' lệnh quét cả bảng — dán lại lần hai là duyệt sạch hàng chờ');
}

// ============================================================
// PHẦN B — bảy hàm mới
// ============================================================
console.log('\nPHẦN B — bảy hàm mới trong 08-kiem-duyet.sql');

const HAM_DEFINER = ['co_the_quan_tri', 'co_the_kiem_duyet', 'ghi_thang',
                     'dung_do_sau', 'duyet_thay_doi', 'tu_choi_thay_doi',
                     'ds_kiem_duyet', 'dem_cho_kiem_duyet'];

for (const ten of HAM_DEFINER) {
  const than = thanHam(L08, ten);
  kiem('hàm ' + ten + '() có mặt', than !== null, 'không tìm thấy');
  if (!than) continue;
  kiem('  ' + ten + '() là security definer',
       /security\s+definer/i.test(than), 'thiếu security definer');
  kiem('  ' + ten + '() khoá search_path',
       /set\s+search_path/i.test(than), 'thiếu set search_path');
}

// `khoa_cua()` là hàm thuần trên một tham số jsonb — không đọc bảng nào, nên
// không cần (và không nên) là security definer. Nhưng nó PHẢI immutable, vì
// `dung_do_sau()` gọi nó trong mệnh đề `where` trên từng dòng nhật ký.
{
  const than = thanHam(L08, 'khoa_cua');
  kiem('khoa_cua() có mặt và là immutable',
       than !== null && /\bimmutable\b/i.test(than), 'thiếu hoặc không immutable');
}

// ============================================================
// PHẦN C — bẫy null (b94) và hai hạng admin
// ============================================================
console.log('\nPHẦN C — cửa kiểm quyền');

kiem('mọi chỗ hỏi vai_tro bằng phủ định đều bọc null (bẫy b94)',
     demPhuDinhHo(L08) === 0,
     demPhuDinhHo(L08) + ' chỗ dùng vai_tro() dạng phủ định mà không bọc coalesce');

// ⚠ Soi THÂN HÀM, không soi cả file: chữ `quan_tri` có mặt khắp nơi, kể cả ở
//   những chỗ GỌI `co_the_quan_tri()`. Soi cả file thì phép này báo hỏng trên
//   mã đúng — và một phép báo hỏng oan bị người ta tắt đi, y như một phép báo
//   đạt oan.
kiem('co_the_quan_tri() chỉ nhận quản trị hệ thống',
     /=\s*'quan_tri_he_thong'/.test(thanHam(L08, 'co_the_quan_tri') || '') &&
     !/'quan_tri'/.test(thanHam(L08, 'co_the_quan_tri') || ''),
     'còn nhận admin → hai hạng admin không tách được');

kiem('co_the_kiem_duyet() nhận cả hai hạng quản trị',
     /in\s*\(\s*'quan_tri_he_thong'\s*,\s*'quan_tri'\s*\)/i.test(thanHam(L08, 'co_the_kiem_duyet') || ''),
     'không thấy cả hai vai');

// Ba hàm của 06/07 phải được định nghĩa lại cho hẹp hơn. Không định nghĩa lại
// thì `quan_tri` vẫn gắn được mã người cho tài khoản khác — tức vẫn tự cấp được
// quyền sửa cho bất kỳ ai, và "hạng chỉ kiểm duyệt" chỉ là chữ trên giấy.
for (const ten of ['duyet_thanh_vien', 'tu_choi_thanh_vien', 'ds_cho_duyet']) {
  const than = thanHam(L08, ten);
  kiem(ten + '() được định nghĩa lại trong 08', than !== null,
       'chưa thu hẹp → admin vẫn đổi được quyền của người khác');
  if (than) {
    kiem('  ' + ten + '() gác bằng co_the_quan_tri()',
         /co_the_quan_tri/.test(than), 'còn tự viết điều kiện vai trò');
  }
}

// `ghi_thang()` quyết ai không phải chờ duyệt. Phải viết dạng KHẲNG ĐỊNH và
// phải mặc định false cho người lạ — `coalesce(..., false)`.
{
  const than = thanHam(L08, 'ghi_thang') || '';
  kiem('ghi_thang() cho quản trị đi thẳng',
       /in\s*\(\s*'quan_tri_he_thong'\s*,\s*'quan_tri'\s*\)/i.test(than), 'thiếu hai vai');
  kiem('ghi_thang() đọc cờ tin_cay và chỉ khi đã approved',
       /tin_cay/.test(than) && /\bapproved\b/.test(than),
       'thiếu tin_cay hoặc quên vế approved');
  kiem('ghi_thang() mặc định false khi không tra được',
       /coalesce\s*\([\s\S]{0,300}?,\s*false\s*\)/i.test(than),
       'thiếu coalesce → null làm case rơi lung tung');
}

// ============================================================
// PHẦN D — luu_cay() 0.3.0 chụp ảnh ĐÚNG CHỖ
// ============================================================
console.log('\nPHẦN D — cửa ghi chụp ảnh dữ liệu cũ');

const THAN_LUU = thanHam(L03, 'luu_cay') || '';

// Hỏi "từ 0.3 trở lên", không hỏi đúng một con số: mốc cần gác là *đã có
// khối chụp ảnh hay chưa*, mà sửa vặt sau đó vẫn đẩy số hiệu lên 0.3.1, 0.3.2…
kiem('03-ham-luu-cay.sql đã lên 0.3.x trở lên',
     /Phiên bản: 0\.3\.\d/.test(SQL_03), 'còn bản cũ');

kiem('đầu file 03 dặn phải dán lại SAU 08',
     /SAU\s+08-kiem-duyet\.sql/i.test(SQL_03),
     'thiếu lời dặn → dán 08 xong quên 03 là kiểm duyệt không chạy');

kiem('luu_cay() có chụp ảnh vào v_truoc',
     /into\s+v_truoc/i.test(THAN_LUU), 'không thấy chỗ gán v_truoc');

// ⚠ BẪY 1 — thứ tự. Đây là phép quan trọng nhất của cả bài kiểm.
{
  const viTriChup = THAN_LUU.search(/into\s+v_truoc/i);
  const viTriGhi = viTriDauTien(THAN_LUU, [
    /delete\s+from\s+public\./i,
    /insert\s+into\s+public\./i,
    /update\s+public\.trees/i,
  ]);
  kiem('chụp ảnh đứng TRƯỚC mọi lệnh ghi trong luu_cay()',
       viTriChup > -1 && viTriGhi > -1 && viTriChup < viTriGhi,
       'chụp ở ' + viTriChup + ', lệnh ghi đầu tiên ở ' + viTriGhi +
       ' → truoc sẽ chụp đúng dữ liệu MỚI');
}

// Máy chủ tự chụp. Đọc `diff` của trình duyệt là để người sửa tự khai mình
// đã sửa gì — người muốn phá chỉ cần gửi diff rỗng.
{
  const khoiChup = THAN_LUU.slice(
    Math.max(0, THAN_LUU.search(/select jsonb_build_object/i)),
    THAN_LUU.search(/into\s+v_truoc/i) + 20);
  kiem('ảnh chụp KHÔNG lấy từ p_mo_ta->diff của trình duyệt',
       !/p_mo_ta/.test(khoiChup), 'đang tin dữ liệu do trình duyệt gửi lên');
}

// ⚠ BẪY 2 — to_jsonb trên dòng left join không khớp.
{
  const soToJsonb = (THAN_LUU.match(/to_jsonb\s*\(\s*cu\.\*\s*\)/gi) || []).length;
  const soChan = (THAN_LUU.match(
    /case\s+when\s+cu\.tree_id\s+is\s+null\s+then\s+'null'::jsonb/gi) || []).length;
  kiem('mọi to_jsonb(cu.*) đều có chốt "không khớp thì cho ra null"',
       soToJsonb > 0 && soChan >= soToJsonb,
       soToJsonb + ' chỗ to_jsonb nhưng chỉ ' + soChan + ' chốt → hoàn tác sẽ ' +
       'chèn một người toàn null thay vì bỏ người ấy đi');
}

// ⚠ BẪY 3b — cạnh bị CASCADE cắt theo người/hôn nhân bị xoá cứng phải được
// chụp, dù chúng không có trong p_ops.
{
  const khoiCon = khoiKhoa(THAN_LUU, "'children'");
  kiem('ảnh chụp gồm cả cạnh sắp bị cascade cắt theo người/hôn nhân bị xoá',
       khoiCon !== null &&
       /public\.union_children\s+c2/i.test(khoiCon) &&
       /'unions'->'xoa'/.test(khoiCon) && /'persons'->'xoa'/.test(khoiCon),
       'thiếu nhánh thứ ba → hoàn tác trả người về mà không trả chỗ đứng');
}

// Năm bảng dữ liệu đều phải có mặt trong ảnh chụp, cộng khối cây.
for (const k of ['persons', 'unions', 'children', 'media', 'sources', 'tree']) {
  kiem("  ảnh chụp có khối '" + k + "'",
       new RegExp("'" + k + "',\\s*[\\(c]").test(THAN_LUU), 'thiếu khối');
}

kiem('sổ nhập giữ mã dòng vừa đẻ ra vào imports_moi',
     /returning id/i.test(THAN_LUU) && /imports_moi/.test(THAN_LUU),
     'thiếu → hoàn tác để lại một dòng nhập của lần Lưu bị gạt');

kiem('luu_cay() treo cờ bằng ghi_thang(), không tự suy từ vai trò',
     /ghi_thang\s*\(/.test(THAN_LUU) &&
     /trang_thai/.test(THAN_LUU),
     'không thấy chỗ quyết trạng thái');

kiem('luu_cay() ghi truoc và trang_thai vào change_log',
     /insert into public\.change_log[\s\S]{0,400}?truoc[\s\S]{0,80}?trang_thai/i.test(THAN_LUU),
     'hai cột mới không được điền');

kiem('luu_cay() trả trangThai về cho trình duyệt',
     /'trangThai'/.test(THAN_LUU), 'app không biết bản sửa đang chờ hay đã nhận');

// ============================================================
// PHẦN E — hoàn tác
// ============================================================
console.log('\nPHẦN E — từ chối và hoàn tác');

const THAN_TC = thanHam(L08, 'tu_choi_thay_doi') || '';

// Luật hoàn tác: có người sửa tiếp lên trên thì từ chối, và phải nói ai.
kiem('tu_choi_thay_doi() hỏi dung_do_sau() trước khi hoàn tác',
     /dung_do_sau/.test(THAN_TC), 'thiếu luật "đã bị sửa tiếp"');

{
  const viTriHoi = THAN_TC.search(/dung_do_sau/);
  const viTriGhi = viTriDauTien(THAN_TC, [
    /delete\s+from\s+public\./i, /insert\s+into\s+public\./i,
  ]);
  kiem('  phép hỏi ấy đứng TRƯỚC mọi lệnh ghi',
       viTriHoi > -1 && viTriGhi > -1 && viTriHoi < viTriGhi,
       'hỏi ở ' + viTriHoi + ', ghi ở ' + viTriGhi);
}

kiem('  và câu từ chối nêu TÊN người đã sửa tiếp',
     /by_email/.test(THAN_TC), 'không nói ai sửa → người bấm không biết làm gì');

kiem('dung_do_sau() bỏ qua những lần Lưu đã bị từ chối',
     /trang_thai\s*<>\s*'tu_choi'/i.test(thanHam(L08, 'dung_do_sau') || ''),
     'đếm cả chúng → một lần từ chối khoá cứng mọi lần từ chối trước nó');

// ⚠ BẪY 5 — khôi phục phải là upsert, không được xoá-rồi-chèn.
for (const bang of ['persons', 'unions']) {
  const cau = cauInsert(THAN_TC, bang);
  kiem('khôi phục ' + bang + ' dùng on conflict do update (không xoá-rồi-chèn)',
       cau !== null && /on conflict[\s\S]{0,60}do update/i.test(cau),
       'xoá một người là cascade cắt mọi quan hệ của họ');
}

// Chỉ được xoá đúng những dòng CHƯA TỪNG TỒN TẠI trước lần Lưu ấy.
kiem('chỉ xoá những dòng có cu = null (tức lần Lưu ấy tạo ra)',
     /jsonb_typeof\s*\(\s*e->'cu'\s*\)\s*=\s*'null'/.test(THAN_TC),
     'không phân biệt "đã có" với "mới tạo" → xoá nhầm dữ liệu cũ');

// Soát cascade trước khi xoá — hai đường đã biết.
kiem('soát trước: bỏ người mới thêm có cắt quan hệ của lần Lưu khác không',
     /union_children[\s\S]{0,400}?not\s*\(\s*\('c:'/i.test(THAN_TC),
     'thiếu → cascade cắt âm thầm, Postgres không báo lỗi');

kiem('soát trước: người sắp bị bỏ có đang gắn với tài khoản nào không',
     /tree_members[\s\S]{0,200}?person_id\s*=\s*any/i.test(THAN_TC),
     'thiếu → tài khoản rơi về trạng thái chưa gắn mà không ai biết vì sao');

kiem('có lưới cuối bắt lỗi khoá ngoại và trả câu tiếng Việt',
     /exception[\s\S]{0,200}?foreign_key_violation/i.test(THAN_TC),
     'thiếu → người bấm nhận được mã lỗi Postgres');

kiem('hoàn tác gỡ luôn dòng sổ nhập lần Lưu ấy đẻ ra',
     /delete from public\.imports/i.test(THAN_TC), 'thiếu');

kiem('hoàn tác tăng revision để trình duyệt đang mở phải tải lại',
     /revision\s*=\s*v_rev_moi/.test(THAN_TC), 'thiếu → người khác ghi đè bản khôi phục');

// Từ chối KHÔNG được đẻ thêm một dòng nhật ký: dòng ấy sẽ mang khoá của đúng
// những bản ghi vừa hoàn tác và khoá luôn việc từ chối những lần Lưu trước.
kiem('từ chối KHÔNG chèn thêm dòng change_log mới',
     !/insert into public\.change_log/i.test(THAN_TC),
     'đẻ dòng mới → khoá cứng việc từ chối các lần Lưu trước đó');

kiem('từ chối để lại vết: duyet_boi, duyet_luc, ly_do_tu_choi',
     /duyet_boi/.test(THAN_TC) && /duyet_luc/.test(THAN_TC) &&
     /ly_do_tu_choi/.test(THAN_TC), 'thiếu vết duyệt');

// Duyệt thì không đụng dữ liệu — đó là chỗ rẻ của thiết kế "ghi thẳng rồi
// duyệt sau". Nếu nó có lệnh ghi lên bảng dữ liệu thì thiết kế đã bị hiểu sai.
{
  const thanD = thanHam(L08, 'duyet_thay_doi') || '';
  kiem('duyet_thay_doi() không đụng bảng dữ liệu nào',
       !/(insert into|delete from)\s+public\.(persons|unions|union_children|media|sources)/i.test(thanD),
       'duyệt mà phải chép dữ liệu → đã hiểu sai thiết kế "ghi thẳng"');
  kiem('duyet_thay_doi() chỉ nhận đơn đang ở trạng thái cho',
       /<>\s*'cho'/.test(thanD), 'duyệt lại được đơn đã xử lý');
}

// ============================================================
// PHẦN F — danh sách cột phải khớp giữa 03 và 08
// ============================================================
// ⚠ BẪY 3. `luu_cay()` ghi bao nhiêu cột thì đường khôi phục phải trả lại
// đúng bấy nhiêu. Thêm một cột vào bảng, sửa 03 mà quên 08, thì cột ấy âm
// thầm mất mỗi lần hoàn tác — đúng kiểu hỏng `DU-LIEU.md` mục 3 điều 7.
console.log('\nPHẦN F — danh sách cột khôi phục khớp danh sách cột ghi');

for (const bang of ['persons', 'unions', 'union_children', 'media', 'sources']) {
  const a = cotExcluded(cauInsert(THAN_LUU, bang));
  const b = cotExcluded(cauInsert(THAN_TC, bang));
  const thieu = a.filter((c) => !b.includes(c));
  const thua = b.filter((c) => !a.includes(c));
  kiem(bang + ': 08 khôi phục đủ ' + a.length + ' cột mà 03 ghi',
       a.length > 0 && thieu.length === 0 && thua.length === 0,
       'thiếu [' + thieu.join(', ') + '] · thừa [' + thua.join(', ') + ']');
}

// ============================================================
// PHẦN G — cấp quyền gọi
// ============================================================
console.log('\nPHẦN G — ai gọi được gì');

for (const ten of ['duyet_thay_doi', 'tu_choi_thay_doi', 'ds_kiem_duyet',
                   'dem_cho_kiem_duyet']) {
  kiem(ten + '() chặn anon',
       new RegExp('revoke[\\s\\S]{0,120}' + ten + '[\\s\\S]{0,80}anon', 'i').test(L08),
       'chưa revoke khỏi anon');
  kiem('  ' + ten + '() cấp cho authenticated',
       new RegExp('grant\\s+execute[\\s\\S]{0,120}' + ten + '[\\s\\S]{0,80}authenticated', 'i').test(L08),
       'chưa grant cho authenticated');
}

// `khoa_cua` và `dung_do_sau` là ruột, không phải cửa. Cấp cho trình duyệt là
// mở thêm bề mặt mà chẳng ai cần.
for (const ten of ['khoa_cua', 'dung_do_sau']) {
  kiem(ten + '() KHÔNG cấp cho authenticated (là ruột, không phải cửa)',
       !new RegExp('grant\\s+execute[\\s\\S]{0,120}' + ten + '\\s*\\(', 'i').test(L08),
       'đang mở cho trình duyệt gọi thẳng');
}

// ============================================================
// PHẦN I — tên vai hiện ra cho người đọc
// ============================================================
// Chủ dự án chốt 04/09/2026: trên màn hình chỉ dùng **Quản trị hệ thống**,
// **Quản trị viên**, **Thành viên**. Mã trong bảng (`quan_tri_he_thong`, `quan_tri`, `sua`,
// `xem`) giữ nguyên — đổi nó là sửa cả cơ sở dữ liệu để được mấy chữ trên
// màn hình. Nên phải có ĐÚNG MỘT chỗ dịch, và không chỗ nào in mã ra.
console.log('\nPHẦN I — tên vai hiện ra cho người đọc');

{
  kiem('settings.js có hàm dịch tên vai',
       /function vaiTroBangChu/.test(JS_ST), 'thiếu hàm dịch');

  for (const ten of ['Quản trị hệ thống', 'Quản trị viên', 'Thành viên']) {
    kiem("  dịch được '" + ten + "'", JS_ST.includes("'" + ten + "'"),
         'thiếu tên này');
  }

  // ⚠ Đây là dòng đã hỏng thật: nó in `phien.vaiTro` — tức mã vai trong bảng — thẳng
  //   ra màn hình Cài đặt. Hỏi đúng ĐIỀU: có dòng nào đưa mã vai vào bảng
  //   hiển thị mà không đi qua hàm dịch không.
  kiem('không dòng nào in thẳng mã vai ra màn hình',
       !/hang\([^)]*,\s*phien\.vaiTro\s*\)/.test(JS_ST),
       'còn in mã trong cơ sở dữ liệu ra cho người trong họ đọc');

  // Câu lỗi máy chủ trả về cũng là chữ người đọc thấy.
  kiem('câu lỗi của 08 không còn gọi vai bằng tên cũ',
       !/chủ gia phả/.test(SQL_08), 'còn chữ "chủ gia phả" trong câu lỗi');

  kiem("dịch được 'Khách' cho vai chỉ xem",
       /'Khách'/.test(JS_ST), 'thiếu tên Khách');

  // ⚠ Phép quan trọng nhất của phần này. Mã vai đổi 04/09/2026 từ `chu` sang
  //   `quan_tri_he_thong`, và mã ấy nằm rải ở 11 hàm, 2 luật RLS, 1 ràng buộc
  //   và chính dữ liệu. Sót MỘT chỗ là khoá chính chủ dự án ra ngoài gia phả
  //   của mình — không có gì báo lỗi, app chỉ nói "bạn chỉ có quyền xem".
  //
  //   Nên hỏi thẳng: còn file nào trong repo nhắc mã cũ không. Phép này rẻ,
  //   và nó là thứ duy nhất bắt được một file bị bỏ quên.
  {
    // ⚠ Trừ đúng `09-doi-ma-vai.sql`. Nó là file DI DỜI, nên nó buộc phải gọi
    //   tên mã cũ — `where role = 'chu'` chính là việc của nó. Đây là ngoại lệ
    //   duy nhất, và nêu đích danh chứ không bỏ qua theo mẫu, để ngày mai
    //   thêm một file khác thì phép này vẫn bắt được.
    const sot = [];
    for (const [ten, ma] of Object.entries(MOI_FILE)) {
      if (ten.endsWith('09-doi-ma-vai.sql')) continue;
      // ⚠ So CÓ NHÁY. Chữ `admin` còn nằm trong câu tiếng Việt và tên biến ở
      //   khắp nơi; so chữ trần thì phép này luôn báo đỏ, và một phép luôn báo
      //   đỏ bị người ta bỏ qua y như một phép luôn báo xanh.
      if (/'chu'|'admin'/.test(ma)) sot.push(ten);
    }
    kiem('không file nào trong luoc-do/ và js/ còn mã vai cũ',
         sot.length === 0, 'còn ở: ' + sot.join(', '));
  }

  // File di dời phải có mặt, và phải nói rõ thứ tự dán — thứ tự 05 trước 06
  // không đảo được, vì `05` đặt lại ràng buộc vai THIẾU `quan_tri`.
  kiem('có luoc-do/09-doi-ma-vai.sql',
       SQL_09 !== null, 'thiếu file di dời → máy chủ không đổi theo được');
  if (SQL_09) {
    // ⚠ Soi LỆNH, không soi cả file. Mục 0 của `09` có sẵn một câu `update`
    //   nằm trong ghi chú — câu quay về bản cũ phòng khi hỏng giữa chừng —
    //   và nó đứng TRƯỚC mọi lệnh thật. Đọc cả ghi chú thì phép thứ tự dưới
    //   đây báo hỏng trên một file hoàn toàn đúng.
    const L09 = boGhiChu(SQL_09);
    kiem('  09 đổi CẢ HAI mã vai cũ',
         /where role = 'chu'/i.test(L09) && /where role = 'admin'/i.test(L09),
         'thiếu một trong hai → còn tài khoản mang mã cũ, ràng buộc mới chặn');
    kiem('  09 đổi dữ liệu có giới hạn (chạy lại lần hai là vô hại)',
         (L09.match(/update public\.tree_members[\s\S]{0,120}?where role = '/gi) || [])
           .length === 2,
         'thiếu where role = … → chạy lại lần hai đổi bừa');
    kiem('  09 gỡ ràng buộc cũ trước khi đổi dữ liệu',
         L09.search(/drop constraint/i) < L09.search(/update public\.tree_members/i),
         'đổi trước khi gỡ → ràng buộc cũ chặn ngay lệnh update');
    kiem('  09 tự kiểm bằng cách hỏi MÁY CHỦ còn hàm nào nhắc mã cũ',
         /pg_proc[\s\S]{0,200}?prosrc like/i.test(L09) &&
         /pg_policies/i.test(L09),
         'chỉ tự kiểm dữ liệu → không biết còn sót file nào chưa dán');
  }
}

// ============================================================
// PHẦN H — KIỂM CHỨNG NGƯỢC
// ============================================================
// Một phép "đạt" trên mã hỏng là một phép vô dụng. b94 học điều ấy bằng cách
// đắt: 57 phép báo xanh trên chính cái mã thủng. Nên bốn phép nặng nhất của
// bài này được bẻ gãy có chủ ý, và phải HỎNG.
console.log('\nPHẦN H — kiểm chứng ngược (bẻ gãy có chủ ý, phải bắt được)');

{
  // Bẫy 1: dời lệnh chụp ảnh xuống sau lệnh ghi đầu tiên.
  const gay = THAN_LUU.replace(/into\s+v_truoc/i, 'into v_KHONG_DUNG');
  const viTriChup = gay.search(/into\s+v_truoc/i);
  batDuoc('bắt được khi luu_cay() không còn chụp ảnh', viTriChup === -1);
}
{
  // Bẫy 2: bỏ chốt null của to_jsonb.
  const gay = THAN_LUU.replace(
    /case\s+when\s+cu\.tree_id\s+is\s+null\s+then\s+'null'::jsonb\s+else\s+/gi, '');
  const soToJsonb = (gay.match(/to_jsonb\s*\(\s*cu\.\*\s*\)/gi) || []).length;
  const soChan = (gay.match(
    /case\s+when\s+cu\.tree_id\s+is\s+null\s+then\s+'null'::jsonb/gi) || []).length;
  batDuoc('bắt được khi bỏ chốt null của to_jsonb(cu.*)',
          !(soToJsonb > 0 && soChan >= soToJsonb));
}
{
  // Bẫy 3: bỏ một cột khỏi đường khôi phục.
  const gay = (cauInsert(THAN_TC, 'persons') || '')
    .replace(/,\s*branch_id = excluded\.branch_id/i, '');
  const a = cotExcluded(cauInsert(THAN_LUU, 'persons'));
  const b = cotExcluded(gay);
  batDuoc('bắt được khi đường khôi phục thiếu một cột',
          a.filter((c) => !b.includes(c)).length > 0);
}
{
  // Bẫy 4: viết cửa kiểm quyền dạng phủ định mà quên bọc null (đúng b94).
  const gay = L08.replace(
    /coalesce\(public\.vai_tro\(p_tree\), ''\) in \('quan_tri_he_thong', 'quan_tri'\)/,
    "public.vai_tro(p_tree) not in ('xem', 'sua')");
  batDuoc('bắt được cửa kiểm quyền dạng phủ định không bọc null',
          demPhuDinhHo(gay) > 0);
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

/** Phép kiểm chứng ngược: điều kiện phải ĐÚNG, tức bài kiểm đã bắt được lỗi. */
function batDuoc(ten, daBat) {
  kiem(ten, daBat, 'mã hỏng vẫn lọt qua → phép kiểm tương ứng là vô dụng');
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

/** Khối `do $$ … end $$;` có nhắc tới `moc`. */
function khoiDo(sql, moc) {
  const re = /do\s+\$\$[\s\S]*?end\s+\$\$;/gi;
  for (const m of sql.match(re) || []) if (m.includes(moc)) return m;
  return null;
}

/** Một câu `insert into public.<bang> … ;` trọn vẹn. */
function cauInsert(sql, bang) {
  if (!sql) return null;
  const i = sql.search(new RegExp('insert\\s+into\\s+public\\.' + bang + '\\b'));
  if (i < 0) return null;
  const j = sql.indexOf(';', i);
  return j < 0 ? sql.slice(i) : sql.slice(i, j + 1);
}

/** Danh sách cột trong `… = excluded.…` của một câu insert. */
function cotExcluded(cau) {
  if (!cau) return [];
  return [...cau.matchAll(/(\w+)\s*=\s*excluded\.\w+/gi)]
    .map((m) => m[1]).sort();
}

/**
 * Khối giá trị của một khoá trong `jsonb_build_object`, tới khoá kế tiếp.
 * ⚠ Tìm dạng `'children', (` chứ không tìm chuỗi `'children'` trần: chuỗi
 *   trần còn nằm ở `p_ops->'children'->'luu'` phía trên, và bắt trúng chỗ ấy
 *   là cắt ra một khối chẳng liên quan gì tới ảnh chụp.
 */
function khoiKhoa(sql, khoa) {
  const m = sql.match(new RegExp(khoa + ",\\s*[(c]"));
  if (!m) return null;
  const sau = sql.slice(m.index + m[0].length);
  const j = sau.search(/\n\s*'(?:persons|unions|children|media|sources|tree)',\s*[(c]/);
  return j < 0 ? sau : sau.slice(0, j);
}

/** Mọi câu `update public.<bang> … ;` trong một đoạn SQL. */
function cacCauUpdate(sql, bang) {
  const re = new RegExp('update\\s+public\\.' + bang + '\\b', 'gi');
  const ra = [];
  for (const m of sql.matchAll(re)) {
    const j = sql.indexOf(';', m.index);
    ra.push(j < 0 ? sql.slice(m.index) : sql.slice(m.index, j + 1));
  }
  return ra;
}

/** Vị trí sớm nhất khớp một trong các mẫu; -1 nếu không mẫu nào khớp. */
function viTriDauTien(sql, mau) {
  const vt = mau.map((m) => sql.search(m)).filter((v) => v > -1);
  return vt.length ? Math.min(...vt) : -1;
}

/**
 * Đếm số chỗ hỏi `vai_tro()` bằng dạng PHỦ ĐỊNH mà KHÔNG bọc `coalesce`.
 * Dạng khẳng định (`in`, `=`) an toàn vì `null` tự rơi về false.
 * ⚠ Hỏi đúng ĐIỀU, không hỏi đúng CHỮ: bản hỏng của b94 viết `not in` rất
 *   đúng ngữ pháp — cái thiếu là lớp bọc, nên đó mới là thứ phải đếm.
 */
function demPhuDinhHo(sql) {
  const moi = [...sql.matchAll(/(coalesce\s*\(\s*)?public\.vai_tro\s*\([^)]*\)[^\n]{0,40}?(not\s+in|<>|!=)/gi)];
  return moi.filter((m) => !m[1]).length;
}
