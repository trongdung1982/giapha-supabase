// ============================================================
// giapha-supabase · kiem-thu/kiem-tao-cay.mjs
// Vai trò  : Gác bước b104 — `luoc-do/12-tao-cay.sql` và ba file JS đi kèm.
// Chạy     : cd supabase/kiem-thu && node kiem-tao-cay.mjs
// Phiên bản: 0.1.0 · Cập nhật: 08/09/2026 15:01
// ============================================================
//
// ═══ BÀI KIỂM NÀY ĐỨNG Ở ĐÂU ═══
//
// Nó **không chạy SQL** — nó đọc văn bản file. Phần chạy thật là
// `kiem-thu/ban-thu-sql/do-b104.mjs` (ngoài repo, cần Postgres tại chỗ):
// 35 phép, mượn danh nghĩa tài khoản, có ba phép kiểm chứng ngược.
//
// Hai bài kiểm gác hai thứ khác nhau, và cần cả hai:
//
//   • `do-b104.mjs` chứng minh **máy chủ chặn đúng**. Nhưng nó tự gọi hàm SQL
//     để đo, nên nó không biết trình duyệt có gọi đúng cửa hay không —
//     `repo.taoGiaPhaMoi()` vẫn có thể trả `'chualam'` như cũ mà mọi phép SQL
//     vẫn xanh.
//   • File này gác **phía trình duyệt**, cộng những chỗ trong file SQL mà một
//     phép đo hành vi không nhìn thấy: `security definer`, `grant`, và ba câu
//     chú thích cảnh báo bẫy.
//
// ⚠ Luật đã ghi ở `kiem-nhieu-cay.mjs` và áp lại ở đây: **đừng hỏi đúng chữ,
//   hãy hỏi đúng điều.**

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DAY = dirname(fileURLToPath(import.meta.url));
const doc = (p) => readFileSync(resolve(DAY, p), 'utf8');

const SQL_12  = doc('../luoc-do/12-tao-cay.sql');
const JS_ID   = doc('../js/utils/id.js');

// ⚠ SOI TRÊN BẢN ĐÃ BỎ CHÚ THÍCH. Ba phép của PHẦN C lúc đầu HỎNG oan vì
//   đúng lẽ này: chúng đi tìm sự VẮNG MẶT của `chualam`, `duoc_tao_cay` và
//   `confirm()`, mà cả ba chuỗi ấy đều có mặt trong những dòng chú thích giải
//   thích vì sao chúng không được dùng. Bài kiểm "đạt" hay "hỏng" nhờ chính
//   lời giải thích là bài kiểm đo văn bản chứ không đo mã — đúng lý do
//   `boGhiChu()` có mặt cho phía SQL từ `kiem-nhieu-cay.mjs`.
const JS_SB   = boGhiChuJs(doc('../js/services/sb.js'));
const JS_REPO = boGhiChuJs(doc('../js/services/repo.js'));
const JS_KHU  = boGhiChuJs(doc('../js/pages/quan-tri/khu-gia-pha.js'));

let dat = 0, hong = 0;
const lenh12 = boGhiChu(SQL_12);
const thanTao = thanHam(lenh12, 'tao_gia_pha_moi');

// ============================================================
// PHẦN A — lược đồ và hàng rào ở máy chủ
// ============================================================
console.log('\nPHẦN A — máy chủ');

kiem('có ràng buộc unique trên trees.tree_code',
     /add\s+constraint\s+trees_tree_code_unique\s+unique\s*\(\s*tree_code\s*\)/i.test(lenh12),
     'thiếu — hai cây trùng mã thì mã người hết là duy nhất');

// ⚠ Không hỏi "có câu alter không" mà hỏi "có kiểm trùng TRƯỚC khi alter
//   không". Thêm thẳng ràng buộc lên một bảng đang có mã trùng thì Postgres
//   ném lỗi thô, và người dán không biết mã nào phải sửa.
kiem('kiểm mã trùng trước khi thêm ràng buộc',
     /group\s+by\s+tree_code\s+having\s+count/i.test(lenh12),
     'thêm thẳng ràng buộc — người dán sẽ nhận lỗi thô, không biết sửa gì');

kiem('hàm tao_gia_pha_moi tồn tại trong file',
     thanTao !== null,
     'không thấy create … function public.tao_gia_pha_moi');

kiem('hàm là security definer',
     /security\s+definer/i.test(thanTao || ''),
     'thiếu — RLS sẽ chặn chính hàm này, nút Dựng hỏng');

// Hàng rào quyền DUY NHẤT của bước. Mất nó thì mọi tài khoản đã đăng nhập
// dựng được cây, và không có gì báo lỗi.
kiem('hàm hỏi duoc_tao_cay() trước khi ghi',
     /duoc_tao_cay\s*\(\s*\)/i.test(thanTao || ''),
     'AI CŨNG DỰNG ĐƯỢC CÂY');

// ⚠ Thứ tự quan trọng: hàng rào quyền phải đứng TRƯỚC mọi phép kiểm hình
//   dạng, nếu không thì câu lỗi ("mã ấy đã có người dùng") thành công cụ dò
//   cho người không có quyền.
kiem('hàng rào quyền đứng TRƯỚC phép kiểm mã trùng',
     viTri(thanTao, /duoc_tao_cay/i) < viTri(thanTao, /da co gia pha khac dung|đã có gia phả khác dùng/i),
     'kiểm mã trùng chạy trước kiểm quyền — câu lỗi thành công cụ dò');

// Bẫy lớn nhất của bước: cây không có dòng thành viên là cây không ai vào
// được, kể cả người vừa tạo — và RLS chặn nên chính họ cũng không xoá được.
kiem('hàm chèn CẢ tree_members, không chỉ trees',
     /insert\s+into\s+public\.tree_members/i.test(thanTao || ''),
     'cây đẻ ra sẽ không ai vào được, kể cả người vừa tạo');

kiem('hai câu insert nằm trong CÙNG thân hàm (một giao dịch)',
     /insert\s+into\s+public\.trees[\s\S]*insert\s+into\s+public\.tree_members/i.test(thanTao || ''),
     'hai câu insert tách rời — có đường đẻ ra cây thiếu thành viên');

kiem('người tạo được duyệt sẵn (không xếp hàng chờ chính mình)',
     /'quan_tri_he_thong'[\s\S]{0,80}true/i.test(thanTao || ''),
     'approved không bật — người dựng cây bị chính cây mình chặn');

kiem('bắt được unique_violation để trả câu tiếng Việt',
     /exception[\s\S]{0,200}unique_violation/i.test(thanTao || ''),
     'hai người bấm cùng lúc thì người thua nhận mã lỗi Postgres thô');

kiem('không cấp quyền gọi cho anon',
     /revoke\s+all\s+on\s+function\s+public\.tao_gia_pha_moi[\s\S]{0,80}anon/i.test(lenh12)
       && !/grant\s+execute\s+on\s+function\s+public\.tao_gia_pha_moi[^;]*anon/i.test(lenh12),
     'anon gọi được — thừa, và mở rộng bề mặt tấn công');

// ============================================================
// PHẦN B — hai khuôn mã cây phải khớp nhau
// ============================================================
// ⚠ Đây là phép đắt nhất của cả bài, và nó gác một lỗ hổng có thật, vá
//   08/09/2026: ràng buộc `tree_code_hop_le` của `01-bang.sql` nhận
//   `^[A-Z0-9_]+$`, còn `KHUON_MA_CAY` của `utils/id.js` chỉ nhận
//   `^[A-Z][A-Z0-9]{0,13}$`. Mã lọt qua khe giữa hai khuôn ấy (`LE_BN`,
//   `1LE`) làm `maCayCuaCay()` trả rỗng, nên mọi người thêm mới trong cây đó
//   nhận mã đời cũ `P0001` không tiền tố — lặng lẽ, không câu lỗi nào.
//
//   Phép này KHÔNG so hai chuỗi regex bằng nhau: `utils/id.js` có thể đổi
//   cách viết mà vẫn cùng nghĩa. Nó hỏi ba điều mà cửa hẹp phải có.
console.log('\nPHẦN B — khuôn mã cây khớp với utils/id.js');

kiem('utils/id.js vẫn giữ khuôn mã cây hẹp (chữ đầu, không gạch dưới)',
     /KHUON_MA_CAY\s*=\s*\/\^\[A-Z\]\[A-Z0-9\]\{0,13\}\$\//.test(JS_ID),
     'khuôn ở utils đã đổi — đọc lại rồi chỉnh hàng rào SQL cho khớp');

kiem('hàm SQL đòi ký tự đầu là CHỮ CÁI',
     /\^\[A-Z\]\[A-Z0-9\]\*\$/.test(thanTao || ''),
     'mã mở đầu bằng số lọt qua — app sẽ sinh mã người không có tiền tố');

kiem('hàm SQL KHÔNG nhận gạch dưới trong mã cây',
     !/\^\[A-Z0-9_\]\+\$/.test(thanTao || ''),
     'mã có gạch dưới lọt qua — utils/id.js sẽ coi như cây không có mã');

kiem('trần độ dài mã cây là 14, khớp trần của utils/id.js',
     /length\s*\(\s*v_ma\s*\)\s*>\s*14/.test(thanTao || ''),
     'trần lệch với KHUON_MA_CAY (1 + 13 ký tự)');

// ============================================================
// PHẦN C — phía trình duyệt
// ============================================================
console.log('\nPHẦN C — trình duyệt');

kiem('sb.js có hàm taoGiaPhaMoi gọi RPC tao_gia_pha_moi',
     /export\s+async\s+function\s+taoGiaPhaMoi[\s\S]{0,600}rpc\(\s*'tao_gia_pha_moi'/.test(JS_SB),
     'chưa nối được nút với máy chủ');

// Luật tuyệt đối của cả dự án: chỉ `sb.js` chạm máy chủ.
kiem('chỉ sb.js gọi RPC ấy, không file nào khác',
     !/rpc\(\s*'tao_gia_pha_moi'/.test(JS_REPO) && !/rpc\(\s*'tao_gia_pha_moi'/.test(JS_KHU),
     'có file khác gọi thẳng máy chủ — vi phạm luật phân lớp');

kiem('repo.taoGiaPhaMoi() thôi trả "chualam"',
     !/chualam/.test(JS_REPO),
     'vẫn còn chốt chặn cũ — nút Dựng sẽ báo "chưa làm xong"');

kiem('repo dùng lại sinhMaCay() của utils, không tự viết phép sinh mã',
     /import\s*\{\s*sinhMaCay\s*\}\s*from\s*'\.\.\/utils\/id\.js'/.test(JS_REPO),
     'viết lại phép sinh mã là đẻ ra bản thứ hai sẽ lệch dần');

// ⚠ Điểm dừng b104 viết thành chữ: *"một tài khoản không được cấp bấm vào thì
//   bị MÁY CHỦ từ chối, không phải bị JavaScript giấu nút"*. Phép này hỏi
//   đúng điều ấy: màn hình không được hỏi trước rồi ẩn nút.
kiem('khu Gia phả KHÔNG hỏi quyền trước để giấu nút',
     !/duocTaoCay|duoc_tao_cay/i.test(JS_KHU),
     'màn hình tự dựng phân quyền — hàng rào phải là máy chủ');

kiem('nút Dựng gia phả mới có mặt trong khu Gia phả',
     /Dựng gia phả mới/.test(JS_KHU),
     'không có lối vào — hàm máy chủ nằm đó không ai gọi');

kiem('mã cây gợi ý bằng sinhMaCay(), không ghép chuỗi tại chỗ',
     /import\s*\{\s*sinhMaCay\s*\}[\s\S]{0,80}utils\/id\.js/.test(JS_KHU),
     'ghép chuỗi tại chỗ sẽ lệch với utils/id.js');

// Người dùng gõ tay vào ô mã rồi mà mã vẫn tự đổi theo tên là kiểu hỏng làm
// người ta tưởng bàn phím hỏng.
kiem('thôi tự điền mã khi người dùng đã gõ tay',
     /nguoiDungTuGoMa/.test(JS_KHU),
     'gợi ý ghi đè lên chữ người dùng vừa gõ');

kiem('dựng xong có đường sang sơ đồ để thêm người đầu tiên',
     /Mở gia phả mới[\s\S]{0,1200}index\.html/.test(JS_KHU),
     'dựng xong rồi đứng đó — điểm dừng b104 đòi thêm được người đầu tiên');

kiem('không dùng alert() hay confirm()',
     !/\b(alert|confirm)\s*\(/.test(JS_KHU),
     'cả app chưa có chỗ nào dùng — xem khối đầu khu-gia-pha.js');

// ============================================================
// PHẦN D — quy tắc SINH mã cây (chủ dự án chốt 08/09/2026)
// ============================================================
// ⚠⚠ PHẦN NÀY LÀ THỨ DUY NHẤT GÁC BẢN MỚI, và lý do đáng ghi rõ:
//   `kiem-thu/kiem-ma-cay.mjs` (ngoài repo) có hẳn 8 phép về `sinhMaCay`,
//   nhưng nó `import` từ **`../giapha/js/utils/id.js`** — nhánh ĐÃ ĐÓNG BĂNG.
//   Từ 08/09/2026 hai bản `utils/id.js` lệch nhau ở hàm `phanPhanBiet()`, nên
//   bộ kiểm ấy vẫn xanh trong khi nó đang đo một file khác. Đúng cái bẫy mà
//   phép 9 của `/kiem-tra` cảnh báo cho `domains/`, chỉ khác thư mục.
//
// Phần này gọi hàm THẬT của nhánh Supabase, không soi văn bản.
console.log('\nPHẦN D — quy tắc sinh mã cây');

const { sinhMaCay } = await import('../js/utils/id.js');

{
  // Hàng rào đáng tiền nhất: mã cây KHÔNG BAO GIỜ được chứa [PUMS] + 4 chữ số.
  // Bốn tên dưới đây cố ý cho ra viết tắt kết thúc bằng P, U, M, S — đúng bốn
  // chữ mở được lỗ hổng. Đo 08/09/2026: mã 4 số làm bộ đếm nguồn nhảy từ
  // S0003 lên S1235.
  const bay = /[PUMS][0-9]{4,}/;
  const ten = ['Ho Nguyen Phuc', 'Ho Le Van Su', 'Ho Tran Minh',
               'Ho Nguyen Uyen', 'Ho Le lang Bac Ninh', '', 'gia pha ho'];
  let dinhBay = null;
  let saiKhuon = null;
  for (const t of ten) {
    const m = sinhMaCay(t, t);
    if (bay.test(m)) dinhBay = t + ' → ' + m;
    if (!/^[A-Z][A-Z0-9]{1,13}$/.test(m)) saiKhuon = t + ' → ' + m;
  }
  kiem('không tên nào sinh ra mã dính bẫy [PUMS] + 4 chữ số',
       dinhBay === null, 'dính bẫy: ' + dinhBay);
  kiem('mọi mã sinh ra đều lọt hàng rào của 12-tao-cay.sql',
       saiKhuon === null, 'sai khuôn: ' + saiKhuon);
}

kiem('phần phân biệt là BA CHỮ SỐ, không phải bốn ký tự xen kẽ',
     /^[A-Z]+[0-9]{3}$/.test(sinhMaCay('Ho Nguyen Phuc Giao', 'h')),
     'sinh ra: ' + sinhMaCay('Ho Nguyen Phuc Giao', 'h'));

kiem('phần đọc được vẫn lấy chữ đầu các từ có nghĩa',
     sinhMaCay('Gia pha ho Nguyen Phuc Giao', 'h').slice(0, 3) === 'NPG',
     'sinh ra: ' + sinhMaCay('Gia pha ho Nguyen Phuc Giao', 'h'));

kiem('vẫn là hàm THUẦN — cùng tên cùng hạt ra cùng mã',
     sinhMaCay('Ho Le', 'hat') === sinhMaCay('Ho Le', 'hat'),
     'hai lần gọi ra hai kết quả — cây sẽ mọc hai tiền tố');

// Ba số chỉ dùng 2–9: mã cây là thứ người ta đọc cho nhau qua điện thoại, và
// 0/1 nhầm với O/I. Đây là luật cũ của bảng ký tự, giữ nguyên khi đổi sang
// toàn số.
kiem('phần số không dùng 0 và 1 (dễ nhầm với O và I)',
     !/[01]/.test(sinhMaCay('Ho Nguyen Phuc Giao', 'h').replace(/^[A-Z]+/, '')),
     'có 0 hoặc 1: ' + sinhMaCay('Ho Nguyen Phuc Giao', 'h'));

// ⚠ Mã đã cấp thì KHÔNG đổi. Hai cây đang chạy mang mã kiểu cũ, và
//   `maCayCuaCay()` phải vẫn nhận chúng, nếu không thì mọi người thêm mới
//   trong hai cây ấy nhận mã không tiền tố — lặng lẽ.
{
  const { maCayCuaCay } = await import('../js/utils/id.js');
  kiem('mã kiểu CŨ vẫn hợp lệ — NPGQ8C9 (cây đang chạy)',
       maCayCuaCay({ tree: { treeCode: 'NPGQ8C9' } }) === 'NPGQ8C9',
       'cây NPGQ8C9 mất mã cây');
  kiem('mã kiểu cũ ngắn vẫn hợp lệ — NTB (cây đang chạy)',
       maCayCuaCay({ tree: { treeCode: 'NTB' } }) === 'NTB',
       'cây NTB mất mã cây');
}

// ============================================================
console.log('\n' + '─'.repeat(56));
console.log('  ' + dat + '/' + (dat + hong) + ' ĐẠT'
  + (hong ? '   HỎNG ' + hong : '   — không phép nào hỏng —'));
console.log('─'.repeat(56) + '\n');
process.exitCode = hong ? 1 : 0;

// ============================================================
// Mấy mẩu dùng chung
// ============================================================

function kiem(ten, dieuKien, chiTiet) {
  if (dieuKien) { dat++; console.log('  ĐẠT  ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + '  →  ' + chiTiet); }
}

/** Bỏ mọi dòng ghi chú `--` để phép soi không "đạt" nhờ chính lời giải thích. */
function boGhiChu(sql) {
  return sql.split('\n').filter((d) => !/^\s*--/.test(d)).join('\n');
}

/**
 * Bỏ chú thích JavaScript — chỉ những dòng MỞ ĐẦU bằng `//`, `/*` hay `*`.
 *
 * Cố ý không đụng tới `//` giữa dòng: cắt ở đó là cắt nhầm `https://…` trong
 * chuỗi. Cả ba file soi ở đây đặt chú thích trên dòng riêng, nên cách thô này
 * đủ — và nó không bao giờ cắt nhầm mã, chỉ có thể sót chú thích.
 */
function boGhiChuJs(js) {
  return js.split('\n')
    .filter((d) => !/^\s*(\/\/|\/\*|\*)/.test(d))
    .join('\n');
}

/** Thân của một hàm SQL: từ `create … function <ten>` tới dấu `$$;` đóng. */
function thanHam(sql, ten) {
  const re = new RegExp('create\\s+or\\s+replace\\s+function\\s+public\\.' + ten + '\\b');
  const i = sql.search(re);
  if (i < 0) return null;
  const j = sql.indexOf('$$;', i);
  return j < 0 ? sql.slice(i) : sql.slice(i, j + 3);
}

/** Vị trí khớp đầu tiên, hoặc một số rất lớn khi không khớp. */
function viTri(s, re) {
  const i = (s || '').search(re);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i;
}
