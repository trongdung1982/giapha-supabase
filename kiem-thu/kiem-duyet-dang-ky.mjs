// ============================================================
// giapha-supabase · kiem-thu/kiem-duyet-dang-ky.mjs
// Vai trò  : Kiểm cơ chế XẾP HÀNG CHỜ DUYỆT — `luoc-do/07-duyet-dang-ky.sql`
//            và ba file JS đi kèm.
// Chạy     : cd supabase/kiem-thu && node kiem-duyet-dang-ky.mjs
// Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 16:35
// ============================================================
//
// ═══ BÀI KIỂM NÀY CHỨNG MINH ĐƯỢC GÌ ═══
//
// ⚠ **Không chạy SQL** — máy không có Postgres, cùng lý lẽ với
//   `kiem-quyen-truc-he.mjs`. Nó đọc văn bản file và soi cấu trúc.
//
// Nhưng nó gác đúng ba thứ mà đọc bằng mắt hay bỏ sót, và cả ba đều đã có
// tiền lệ hỏng thật trong dự án này:
//
//   1. **Bẫy `null`** — b94: `null not in (…)` ra `null` chứ không ra `true`,
//      nên một cửa kiểm quyền viết dạng phủ định mà quên bọc là cửa mở.
//   2. **Thứ tự trong file** — mục bật `approved` cho thành viên cũ phải chạy
//      TRƯỚC khi `la_thanh_vien()` đổi nghĩa. Ngược lại là chủ dự án bị khoá
//      ngoài chính gia phả của mình, và không còn ai mở khoá cho ai được nữa.
//   3. **Vai đóng cứng trong thân hàm** — `xin_vao_cay()` là cửa duy nhất cho
//      người lạ ghi vào `tree_members`. Nếu vai lấy từ tham số thay vì viết
//      chết là ai cũng tự phong mình làm `quan_tri_he_thong`.
//
// ⚠ Và một phép mang tính nguyên tắc, học từ b94: **đừng hỏi đúng chữ, hãy
//   hỏi đúng điều.** Phép về `null` dưới đây hỏi "có `coalesce` không", không
//   hỏi "có viết `not in` không" — bản hỏng ngày ấy viết `not in` rất đúng.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DAY = dirname(fileURLToPath(import.meta.url));
const doc = (p) => readFileSync(resolve(DAY, p), 'utf8');

const SQL_07 = doc('../luoc-do/07-duyet-dang-ky.sql');
const JS_SB = doc('../js/services/sb.js');
const JS_KD = doc('../js/pages/khoi-dong.js');
const JS_ST = doc('../js/pages/settings.js');

let dat = 0, hong = 0;

// Bỏ dòng ghi chú `--` trước khi soi LỆNH. Không bỏ thì mọi phép đều "đạt"
// nhờ chính đoạn ghi chú giải thích nó — bẫy đã gặp ở `kiem-sao-luu.mjs`.
const lenh = boGhiChu(SQL_07);

// ============================================================
// PHẦN A — bốn hàm mới
// ============================================================
console.log('\nPHẦN A — bốn hàm mới trong 07-duyet-dang-ky.sql');

const HAM_MOI = ['xin_vao_cay', 'trang_thai_cua_toi', 'ds_cho_duyet',
                 'tu_choi_thanh_vien'];

for (const ten of HAM_MOI) {
  const than = thanHam(lenh, ten);
  kiem('hàm ' + ten + '() có mặt', than !== null, 'không tìm thấy');
  if (!than) continue;

  // `security definer` là cả cơ chế: người lạ không có quyền ghi vào
  // `tree_members`, nên hàm phải chạy bằng quyền của chủ hàm chứ không phải
  // quyền người gọi. Thiếu nó thì hàm chạy nhưng không làm được gì.
  kiem('  ' + ten + '() là security definer',
       /security\s+definer/i.test(than), 'thiếu security definer');

  // Thiếu `set search_path` thì người dùng dựng được một schema riêng chứa
  // bảng `tree_members` giả rồi lừa hàm đọc nhầm.
  kiem('  ' + ten + '() khoá search_path',
       /set\s+search_path/i.test(than), 'thiếu set search_path');
}

// ============================================================
// PHẦN B — ba cái bẫy đã có tiền lệ hỏng
// ============================================================
console.log('\nPHẦN B — ba cái bẫy đã có tiền lệ');

// --- BẪY 1: null ------------------------------------------------------------
// Mọi chỗ hỏi vai trò bằng dạng PHỦ ĐỊNH đều phải bọc null. Dạng khẳng định
// (`in`, `=`) thì null tự rơi về false nên an toàn.
{
  const phuDinh = lenh.match(/public\.vai_tro\([^)]*\)\s*(?:not\s+in|<>|!=)/gi) || [];
  const coBoc = lenh.match(/coalesce\s*\(\s*public\.vai_tro\([^)]*\)\s*,/gi) || [];
  kiem('mọi chỗ hỏi vai_tro bằng phủ định đều bọc null (bẫy b94)',
       phuDinh.length === 0 || coBoc.length >= phuDinh.length,
       phuDinh.length + ' chỗ phủ định nhưng chỉ ' + coBoc.length + ' chỗ bọc');
}

// --- BẪY 2: thứ tự ----------------------------------------------------------
// Bật `approved` cho thành viên cũ PHẢI đứng trước lúc `la_thanh_vien()` đổi
// nghĩa. Đo bằng vị trí trong văn bản — thứ tự chạy của SQL chính là thứ tự
// dòng, không có gì khác quyết định nó.
{
  const viTriUpdate = lenh.search(/update\s+public\.tree_members[\s\S]{0,200}?set\s+approved\s*=\s*true/i);
  const viTriHam = lenh.search(/create\s+or\s+replace\s+function\s+public\.la_thanh_vien/i);
  kiem('lệnh bật approved cho thành viên cũ đứng TRƯỚC la_thanh_vien()',
       viTriUpdate > -1 && viTriHam > -1 && viTriUpdate < viTriHam,
       'update ở ' + viTriUpdate + ', hàm ở ' + viTriHam);

  // Chốt an toàn: chỉ bật cho dòng KHÔNG phải đơn xin. Thiếu điều kiện này
  // thì dán lại file lần hai là duyệt sạch mọi đơn đang xếp hàng.
  kiem('lệnh ấy chỉ đụng dòng không qua hàng chờ (xin_luc is null)',
       /update[\s\S]{0,400}?xin_luc\s+is\s+null/i.test(lenh),
       'thiếu điều kiện xin_luc is null — dán lại lần hai sẽ duyệt bừa');
}

// --- BẪY 3: vai đóng cứng ---------------------------------------------------
{
  const than = thanHam(lenh, 'xin_vao_cay') || '';
  kiem("xin_vao_cay() đóng cứng vai 'xem' trong thân hàm",
       /'xem'/.test(than) && !/p_role|p_vai/i.test(than),
       'vai lấy từ tham số → ai cũng tự phong mình làm quản trị hệ thống');
  kiem('xin_vao_cay() đóng cứng approved = false',
       /,\s*false\s*,/.test(than) || /approved[^,]*false/i.test(than),
       'không thấy chỗ đặt approved = false');
  // `do update` ở đây sẽ HẠ VAI một thành viên thật xuống 'xem' nếu họ lỡ bấm
  // nút xin vào lần nữa. `do nothing` mới đúng.
  kiem('xin_vao_cay() dùng on conflict DO NOTHING, không do update',
       /on\s+conflict[\s\S]{0,60}do\s+nothing/i.test(than),
       'do update sẽ hạ vai thành viên thật xuống xem');
}

// ============================================================
// PHẦN C — la_thanh_vien và ba vai đi tắt
// ============================================================
console.log('\nPHẦN C — quyền đọc');

{
  const than = thanHam(lenh, 'la_thanh_vien') || '';
  kiem('la_thanh_vien() nay xét approved',
       /\bapproved\b/i.test(than), 'chưa xét approved → hàng chờ vô nghĩa');

  // Ba vai không bao giờ được rơi vào trạng thái chờ. `sao_luu` là vai dễ
  // quên nhất và hỏng nặng nhất: nó là máy chạy hằng đêm, không có người ngồi
  // sau để bấm nút, nên quên nó là sao lưu thất bại IM LẶNG.
  for (const vai of ['quan_tri_he_thong', 'quan_tri', 'sao_luu']) {
    kiem("  vai '" + vai + "' đi tắt, không phải chờ duyệt",
         new RegExp("'" + vai + "'").test(than), 'thiếu vai ' + vai);
  }
}

{
  const than = thanHam(lenh, 'tu_choi_thanh_vien') || '';
  // Từ chối là XOÁ dòng. Không có hai điều kiện này thì một lần gõ nhầm email
  // xoá mất một thành viên thật, kèm cả mã người họ đang gắn.
  kiem('tu_choi_thanh_vien() chỉ xoá đơn đang chờ (approved = false)',
       /delete[\s\S]{0,300}?approved\s*=\s*false/i.test(than),
       'xoá được cả thành viên thật');
  kiem('tu_choi_thanh_vien() không đụng được quản trị/sao_luu',
       /delete[\s\S]{0,400}?role\s+not\s+in/i.test(than),
       'thiếu chặn ba vai đi tắt');
}

// ============================================================
// PHẦN D — cấp quyền gọi
// ============================================================
console.log('\nPHẦN D — ai gọi được gì');

for (const ten of HAM_MOI) {
  kiem(ten + '() chặn anon',
       new RegExp('revoke[\\s\\S]{0,120}' + ten + '[\\s\\S]{0,80}anon', 'i').test(lenh),
       'chưa revoke khỏi anon');
  kiem('  ' + ten + '() cấp cho authenticated',
       new RegExp('grant\\s+execute[\\s\\S]{0,120}' + ten + '[\\s\\S]{0,80}authenticated', 'i').test(lenh),
       'chưa grant cho authenticated');
}

// ============================================================
// PHẦN E — phía trình duyệt
// ============================================================
console.log('\nPHẦN E — ba file JS');

kiem('sb.js xuất đủ bốn hàm mới',
     ['xinVaoCay', 'trangThaiCuaToi', 'dsChoDuyet', 'tuChoiThanhVien']
       .every((h) => new RegExp('export\\s+async\\s+function\\s+' + h + '\\b').test(JS_SB)),
     'thiếu hàm');

// ⚠ Luật lớn nhất của cả nhánh: chỉ `services/sb.js` được chạm máy chủ.
for (const [ten, ma] of [['khoi-dong.js', JS_KD], ['settings.js', JS_ST]]) {
  kiem(ten + ' không tự gọi rpc — đi qua sb.js',
       !/\.rpc\s*\(/.test(ma) && !/window\.supabase/.test(ma),
       'gọi thẳng máy chủ, phá luật một cửa');
}

// `suaDuoc` phải HỎI máy chủ. Câu cũ `vaiTro === 'quan_tri_he_thong' || vaiTro === 'sua'`
// sai hai đường: bỏ sót vai `quan_tri`, và cho người `sua` chưa duyệt tưởng mình
// sửa được — giao diện mở nút Sửa rồi máy chủ mới chặn lúc bấm Lưu.
kiem('layPhien() hỏi máy chủ về quyền sửa, không tự suy từ vai trò',
     /co_the_sua/.test(JS_SB) && !/suaDuoc:\s*vaiTro\s*===/.test(JS_SB),
     'còn tự suy suaDuoc từ vaiTro');

kiem('layPhien() trả trangThai cho màn hình từ chối',
     /trangThai/.test(JS_SB), 'không trả trangThai');

// Bốn trạng thái ánh xạ sang bốn màn hình. Trộn 'cho' với 'chuanop' là hiện
// nút "Xin vào gia phả" cho người đã nộp đơn — họ bấm mãi và tưởng nút hỏng.
kiem("khoi-dong.js phân biệt 'đang chờ' với 'chưa nộp đơn'",
     /trangThai\s*===\s*'cho'/.test(JS_KD), 'không phân biệt hai trạng thái');

kiem('settings.js có khối hàng chờ cho quản trị',
     /veKhoiChoDuyet/.test(JS_ST) && /dsChoDuyet/.test(JS_ST), 'thiếu khối');

// Điều kiện vai trong settings.js chỉ để khỏi vẽ khối trống — nhưng nếu nó là
// phép kiểm quyền DUY NHẤT thì hỏng. Máy chủ phải tự lọc.
kiem('ds_cho_duyet() tự lọc quyền ở máy chủ, không tin phía trình duyệt',
     /coalesce\s*\([\s\S]{0,120}vai_tro[\s\S]{0,200}in\s*\(\s*'quan_tri_he_thong'/i.test(lenh),
     'không thấy phép lọc quyền trong hàm');

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

/** Thân của một hàm SQL: từ `create … function <ten>` tới dấu `$$;` đóng. */
function thanHam(sql, ten) {
  const re = new RegExp('create\\s+or\\s+replace\\s+function\\s+public\\.' + ten + '\\b');
  const i = sql.search(re);
  if (i < 0) return null;
  const j = sql.indexOf('$$;', i);
  return j < 0 ? sql.slice(i) : sql.slice(i, j + 3);
}
