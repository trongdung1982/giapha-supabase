// ============================================================
// giapha-supabase · kiem-thu/kiem-trang-quan-tri.mjs
// Vai trò  : Kiểm TRANG QUẢN TRỊ — `QuanTri.html`, `js/app-quan-tri.js`,
//            `js/pages/quan-tri/khung.js` · `khu-kiem-duyet.js` ·
//            `khu-thanh-vien.js`, và những cửa của chúng trong
//            `js/services/sb.js` (b98 + b101 + b106).
// Chạy     : cd supabase/kiem-thu && node kiem-trang-quan-tri.mjs
// Phiên bản: 0.3.0 · Cập nhật: 08/09/2026 20:40
//            0.3.0 (b106) PHẦN H mới — khu Tài khoản & quyền; PHẦN E đổi
//            chiều lần thứ hai (khối Đơn chờ duyệt nay PHẢI đi).
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
//   7. **Tên class trong JS lệch tên class trong CSS** (b101). Khung vẽ ra
//      vẫn đủ chữ nhưng bố cục vỡ — không có lỗi nào, và trên máy người
//      viết mã thì nó thường vẫn *trông* tạm được. PHẦN F đối chiếu từng
//      class `qt-` trong `khung.js` với `quan-tri.css`.
//   8. **Hai bộ mã cho hai bề ngang màn hình** (b101). Hỏi `innerWidth`
//      trong JS rồi vẽ khác đi thì hôm nay đúng, và lệch dần từ lần sửa
//      thứ hai trở đi — vì hai chỗ ấy không ai bắt phải sửa cùng nhau.
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
const CSS = doc('../quan-tri.css');
const JS_APP = doc('../js/app-quan-tri.js');
const JS_QT = doc('../js/pages/quan-tri/khu-kiem-duyet.js');
const JS_KH = doc('../js/pages/quan-tri/khung.js');
const JS_SB = doc('../js/services/sb.js');
const JS_ST = doc('../js/pages/settings.js');
// Đường vào trang Quản trị chuyển từ Cài đặt sang màn hình sơ đồ (b103).
const JS_TV = doc('../js/pages/tree-view.js');
const JS_GP = doc('../js/pages/quan-tri/khu-gia-pha.js');
const JS_TK = doc('../js/pages/quan-tri/khu-thanh-vien.js');
const SQL_08 = boGhiChu(doc('../luoc-do/08-kiem-duyet.sql'));
const SQL_13 = boGhiChu(doc('../luoc-do/13-quan-ly-thanh-vien.sql'));

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

// CSS của khung nằm ở FILE RIÊNG chứ không nhúng, để bản giả dùng để nhìn
// bằng mắt (`kiem-thu/trang-quan-tri-gia.html`) nạp đúng một nguồn ấy.
kiem('nạp quan-tri.css — bố cục khung bốn khu',
     /<link\s+rel="stylesheet"\s+href="quan-tri\.css">/.test(HTML),
     'thiếu thẻ link tới quan-tri.css');

kiem('file quan-tri.css có thật',
     existsSync(resolve(DAY, '../quan-tri.css')), 'thiếu file');

kiem('có đường về trang chính khi không nạp được mã',
     /href="index\.html"/.test(HTML), 'không có lối về index.html');

// `CLAUDE.md` mục 3: thư viện nằm trong repo, không nạp từ CDN.
kiem('không nạp mã từ máy chủ ngoài',
     !/src="https?:/.test(HTML), 'có thẻ script trỏ ra ngoài');

// ============================================================
// PHẦN B — điểm khởi động
// ============================================================
console.log('\nPHẦN B — js/app-quan-tri.js');

kiem('nạp khung quản trị',
     /from '\.\/pages\/quan-tri\/khung\.js'/.test(JS_APP),
     'không import pages/quan-tri/khung.js');

kiem('vẽ vào #app', /getElementById\('app'\)/.test(JS_APP), 'không tìm #app');

// Cả điểm của việc có HAI điểm khởi động: trang duyệt không kéo theo bộ vẽ.
kiem('KHÔNG kéo theo bộ vẽ sơ đồ (bẫy 6)',
     khongKeoTheoSoDo(JS_APP), 'import tree-view/khoi-dong — kéo cả bộ vẽ về');

// ============================================================
// PHẦN C — khu Kiểm duyệt js/pages/quan-tri/khu-kiem-duyet.js
// ============================================================
console.log('\nPHẦN C — khu Kiểm duyệt js/pages/quan-tri/khu-kiem-duyet.js');

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
kiem('nút từ chối nói rõ nó HOÀN TÁC dữ liệu',
     /Từ chối và hoàn tác/.test(JS_QT), 'chữ trên nút không nói ra hậu quả');

// App này không dùng confirm() ở đâu cả — trên điện thoại hộp thoại ấy hiện ra
// ở một chỗ chẳng liên quan gì tới nút vừa bấm.
kiem('không dùng confirm() — hỏi lại bằng hai nhịp',
     !/\bconfirm\s*\(/.test(boGhiChuJs(JS_QT)), 'còn dùng confirm()');

kiem('có ô lý do khi gạt — câu ấy lưu vào nhật ký',
     /textarea/.test(JS_QT) && /tuChoiThayDoi\([^)]*oLyDo|oLyDo\.value/.test(JS_QT),
     'gạt mà không gửi lý do lên');

for (const [ten, ma] of [['khu-kiem-duyet.js', JS_QT], ['khung.js', JS_KH],
                         ['app-quan-tri.js', JS_APP]]) {
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

// ⚠ PHẦN NÀY ĐỔI CHIỀU 08/09/2026 (b103). Tới b102 nó canh *"Cài đặt có nút
//   mở trang Duyệt nội dung"*; nay khối ấy đã DỜI hẳn sang khu 3 của trang
//   Quản trị, nên phép cũ canh một thứ cố ý không còn.
//
//   Nhưng KHÔNG bỏ phần này đi. Dời một khối đi mà quên đường vào mới thì
//   người dùng mất hẳn chức năng, và không có gì báo lỗi — đúng kiểu hỏng câm
//   mà cả bộ kiểm này sinh ra để bắt. Nên phép mới hỏi ba câu:
//   khối cũ đã đi chưa · đường vào mới có thật không · tên file đúng chữ hoa
//   chưa (bẫy 2 vẫn nguyên giá trị, chỉ đổi chỗ đứng).

kiem('Cài đặt KHÔNG còn khối Duyệt nội dung (đã dời sang khu 3)',
     !/veKhoiKiemDuyet/.test(JS_ST), 'khối cũ còn nằm lại — nay có hai đường vào');

kiem('  và cũng không còn khối Gia phả (đã dời sang khu 1)',
     !/function veKhoiGiaPha/.test(JS_ST), 'khối cũ còn nằm lại');

// ⚠ PHÉP NÀY ĐỔI CHIỀU LẦN THỨ HAI 08/09/2026 (b106). Tới b105 nó canh *"khối
//   Đơn chờ duyệt PHẢI CÒN"* — gỡ trước khi có chỗ nhận là cắt đứt đường duyệt
//   đơn. Nay khu 2 đã viết xong, nên chiều đúng là ngược lại: còn lại thì có
//   HAI đường duyệt đơn, và hai đường thì có ngày lệch nhau.
kiem('  và khối Đơn chờ duyệt đã dời sang khu 2 (b106)',
     !/veKhoiChoDuyet/.test(JS_ST),
     'khối cũ còn nằm lại — nay có hai đường duyệt đơn');

// Gỡ một khối mà quên gỡ hàm nó gọi thì `import` treo lại một cái tên không ai
// dùng; không hỏng gì, nhưng lần sau đọc file sẽ tưởng khối ấy còn.
kiem('  Cài đặt thôi import ba cửa duyệt đơn của sb.js',
     !/\bdsChoDuyet\b/.test(JS_ST) && !/\bduyetThanhVien\b/.test(JS_ST) &&
     !/\btuChoiThanhVien\b/.test(JS_ST),
     'còn import hàm của khối đã gỡ');

kiem('đường vào trang Quản trị đúng tên file có thật, đúng cả chữ hoa (bẫy 2)',
     tenFileTrongMaCoThat(JS_TV, FILE_GOC) || tenFileTrongMaCoThat(JS_ST, FILE_GOC),
     'không mã nào trỏ tới một tên file có thật ở gốc repo');

// ============================================================
// PHẦN F — khung điều hướng bốn khu (b101)
// ============================================================
console.log('\nPHẦN F — khung js/pages/quan-tri/khung.js');

// Khung không phải hàng rào (hàng rào ở Postgres), nhưng nó vẫn phải theo
// luật một cửa: mọi lời gọi máy chủ đi qua `services/sb.js`.
kiem('khung không chạm window.supabase — luật MỘT CỬA',
     motCua(JS_KH), 'khung gọi thẳng máy chủ');

kiem('khung KHÔNG kéo theo bộ vẽ sơ đồ',
     khongKeoTheoSoDo(JS_KH), 'khung import tree-view/khoi-dong');

kiem('khung không tự lọc quyền bằng vaiTro phía trình duyệt',
     !/vaiTro\s*===/.test(boGhiChuJs(JS_KH)), 'khung tự cấp quyền');

// Bốn khu, và `ma` của chúng là giao kèo với người dùng: nó đi vào `#` của
// địa chỉ, nên đổi một chữ là mọi link đã gửi đi hỏng.
for (const ma of ['gia-pha', 'thanh-vien', 'kiem-duyet', 'sao-luu']) {
  kiem('có khu ' + ma, new RegExp("ma: '" + ma + "'").test(JS_KH),
       'thiếu khu này trong danh sách KHU');
}

// Luật 3 của khung: khu đang mở ghi vào `#`, và cú bấm lẫn nút Back đều đi
// qua đúng một đường là `hashchange`.
kiem('khu đang mở ghi vào # của địa chỉ',
     /location\.hash/.test(JS_KH) && /'hashchange'/.test(JS_KH),
     'không thấy đường đi qua hashchange');

// `#` lạ thì phải sửa thanh địa chỉ bằng replaceState. Gán `location.hash`
// trong hàm vẽ đẻ ra một hashchange nữa (vẽ hai lần) và thêm một mục vào
// lịch sử — nút Back quay về đúng cái `#` hỏng vừa bỏ đi.
kiem('# lạ được sửa bằng replaceState, không gán lại location.hash',
     suaHashBangReplaceState(JS_KH),
     'hàm vẽ khu gán location.hash — vẽ hai lần và kẹt nút Back');

// Luật 2: mỗi lần chỉ vẽ MỘT khu, và chỉ khu ấy gọi máy chủ. Khung chỉ được
// gọi hai hàm ĐẾM; đọc dữ liệu của một khu là việc của chính khu ấy.
kiem('khung chỉ gọi hai hàm đếm, không đọc dữ liệu khu nào',
     /dsChoDuyet/.test(JS_KH) && /demChoKiemDuyet/.test(JS_KH) &&
     !/\bdsKiemDuyet\s*\(/.test(boGhiChuJs(JS_KH)),
     'khung đọc luôn dữ liệu của một khu');

// `CLAUDE.md` mục 7: trường trống thì không vẽ hàng đó. Huy hiệu "0" nói
// *có việc đấy* trong khi sự thật là không có việc nào.
kiem('số 0 thì không vẽ huy hiệu',
     /if\s*\(!nut\s*\|\|\s*!so\)\s*return/.test(JS_KH),
     'vẽ cả số 0');

// Ba khu chưa viết phải nói thẳng chúng làm ở bước nào — bảng trống nói
// "không có dữ liệu", mà sự thật là "chưa ai viết màn hình này".
// b106 viết xong khu Tài khoản, nên chỉ còn MỘT khu mang câu `chuaLam` (Sao
// lưu → b108). Con số này giảm dần theo từng bước, và nó phải giảm ĐÚNG LÚC:
// một khu đã viết mà vẫn còn `chuaLam` thì `veKhu()` vẽ câu "chưa làm" đè lên
// màn hình vừa viết xong.
kiem('một khu chưa làm còn lại, và nó nói rõ làm ở bước nào',
     (JS_KH.match(/chuaLam:/g) || []).length === 1, 'sai số khu chưa làm');

// ⚠ Regex phải dừng ở dấu `}` của chính mục ấy. Bản đầu quét 120 ký tự bất
//   kể ranh giới, nên nó vớ luôn `chuaLam` của MỤC SAU và báo hỏng oan —
//   thước đo sai, không phải vật đo sai. Mất một vòng vì chuyện này 08/09.
kiem('khu Gia phả đã nối vào khung, không còn câu "chưa làm"',
     /mountKhuGiaPha/.test(JS_KH) &&
     !/'gia-pha'[^}]*chuaLam/.test(JS_KH),
     'khu 1 chưa nối, hoặc còn câu chưa làm đè lên nó');

kiem('khu Tài khoản đã nối vào khung, không còn câu "chưa làm"',
     /mountKhuThanhVien/.test(JS_KH) &&
     !/'thanh-vien'[^}]*chuaLam/.test(JS_KH),
     'khu 2 chưa nối, hoặc còn câu chưa làm đè lên nó');

// ⚠ `ma` là giao kèo trong `#` của địa chỉ, chữ trên thanh là thứ người đọc.
//   b106 tách hai thứ ấy có chủ ý: `thanh-vien` giữ nguyên để link cũ không
//   hỏng, còn chữ đổi sang *Tài khoản* vì khu ấy liệt kê tài khoản đăng nhập,
//   không liệt kê người trong sơ đồ. Phép này canh đúng cặp ấy đứng cùng nhau.
kiem('khu 2 mang mã thanh-vien nhưng hiện chữ "Tài khoản"',
     /ma:\s*'thanh-vien',\s*chu:\s*'Tài khoản'/.test(JS_KH),
     'chữ trên thanh lệch khỏi thoả thuận b106');

// Luật "một danh sách khu, hai cách vẽ": chỗ biết bề ngang màn hình nằm
// TRỌN trong @media của QuanTri.html.
kiem('khung không hỏi bề ngang màn hình trong JS (chỗ hỏng câm 8)',
     motBoMa(JS_KH), 'khung có nhánh riêng theo innerWidth/matchMedia');

kiem('quan-tri.css có @media đổi thanh trái thành hàng thẻ ngang',
     /@media[^{]*max-width:\s*680px[\s\S]{0,500}\.qt-dieu-huong[^}]*row/.test(CSS),
     'thiếu @media chuyển .qt-dieu-huong sang hàng ngang');

// Chỗ hỏng câm 7: class trong JS lệch class trong CSS.
{
  const thieu = classThieuTrongCss(JS_KH, CSS);
  kiem('mọi class qt- dùng trong khung đều có trong quan-tri.css',
       thieu.length === 0, 'thiếu định nghĩa: ' + thieu.join(', '));
}

kiem('khu Kiểm duyệt được nhúng vào khung, không còn là cả trang',
     /mountKhuKiemDuyet/.test(JS_KH) &&
     /export\s+async\s+function\s+mountKhuKiemDuyet/.test(JS_QT),
     'khung không gọi được khu Kiểm duyệt');

// ============================================================
// PHẦN H — khu Tài khoản & quyền (b106)
// ============================================================
console.log('\nPHẦN H — khu Tài khoản js/pages/quan-tri/khu-thanh-vien.js');

kiem('khu Tài khoản có khối ghi chú đầu file đúng khuôn',
     ghiChuDauFile(JS_TK), 'thiếu Vai trò / Lớp / Phụ thuộc / Phiên bản');

kiem('khu Tài khoản không chạm window.supabase — luật MỘT CỬA',
     motCua(JS_TK), 'khu gọi thẳng máy chủ');

kiem('khu Tài khoản KHÔNG kéo theo bộ vẽ sơ đồ',
     !/from\s+'\.\.\/(tree-view|khoi-dong)\.js'/.test(boGhiChuJs(JS_TK)),
     'khu import bộ vẽ — trang này cố ý không nạp cây');

kiem('khu Tài khoản không dùng alert/confirm',
     !/\b(alert|confirm)\s*\(/.test(boGhiChuJs(JS_TK)),
     'app này không dùng hộp thoại của trình duyệt ở đâu cả');

// ⚠ ĐÂY LÀ PHÉP ĐÁNG TIỀN NHẤT CỦA PHẦN NÀY. `vai_tro()` trong trình duyệt
//   KHÔNG trả lời được câu "ai đổi được quyền": chủ cây nhận quyền qua CỘT
//   `trees.chu_so_huu`, không qua mã vai (`13` mục 4, và cả bài học b105 —
//   *khi phải nâng quyền cho một thứ để nó chạy được, hãy nghi ngờ hàng rào
//   chứ đừng nghi ngờ cái quyền*). Suy ở đây là khoá tay đúng người có quyền
//   nhất, và không có gì báo lỗi.
kiem('khu Tài khoản hỏi máy chủ ai đổi được quyền, không suy từ vaiTro',
     /coTheQuanTri\s*\(/.test(boGhiChuJs(JS_TK)) &&
     !/vaiTro\s*===/.test(boGhiChuJs(JS_TK)),
     'khu tự quyết quyền bằng JavaScript');

// Bảy cửa của `13`, đối chiếu CHỮ KÝ SQL — đúng bẫy số 1: sai một chữ trong
// tên tham số thì Supabase trả "function not found", `sb.js` nuốt gọn thành
// mảng rỗng, và màn hình hiện y hệt lúc không có dữ liệu.
const CUA_13 = [
  { js: 'coTheQuanTri',          sql: 'co_the_quan_tri' },
  { js: 'dsThanhVien',           sql: 'ds_thanh_vien' },
  { js: 'doiVaiThanhVien',       sql: 'doi_vai_thanh_vien' },
  { js: 'ganNguoiChoThanhVien',  sql: 'gan_nguoi_cho_thanh_vien' },
  { js: 'datTinCayThanhVien',    sql: 'dat_tin_cay_thanh_vien' },
  { js: 'goThanhVien',           sql: 'go_thanh_vien' },
  { js: 'doiChuCay',             sql: 'doi_chu_cay' },
];

for (const c of CUA_13) {
  kiem('sb.js xuất hàm ' + c.js + '()',
       new RegExp('export\\s+async\\s+function\\s+' + c.js + '\\b').test(JS_SB),
       'không thấy');

  const lech = lechThamSo(JS_SB, SQL_13, c.sql);
  kiem('  ' + c.sql + '() — tên tham số khớp chữ ký SQL',
       lech !== null && lech.length === 0,
       lech === null ? 'không tìm thấy lời gọi hoặc chữ ký' : lech.join('; '));

  kiem('  ' + c.sql + '() được cấp cho authenticated',
       coCapQuyen(SQL_13, c.sql), 'thiếu grant execute … to authenticated');
}

// `ds_thanh_vien` là hàm trả BẢNG, và `13` đã học bài 42P13: phải `drop` trước.
// Phép này canh chính chỗ đã làm hỏng lần dán sáng 08/09.
kiem('ds_thanh_vien() có drop function trước create (bài học 42P13)',
     /drop\s+function\s+if\s+exists\s+public\.ds_thanh_vien/i.test(SQL_13),
     'create or replace không đổi được danh sách cột trả về');

// Năm việc đổi quyền + hai việc xét đơn, tất cả đều phải đi qua `sb.js`.
for (const ten of ['doiVaiThanhVien', 'ganNguoiChoThanhVien',
                   'datTinCayThanhVien', 'goThanhVien', 'doiChuCay',
                   'duyetThanhVien', 'tuChoiThanhVien']) {
  kiem('  khu Tài khoản gọi ' + ten + '()',
       new RegExp('\\b' + ten + '\\s*\\(').test(boGhiChuJs(JS_TK)),
       'thiếu việc này trên màn hình');
}

// Ba tấm lọc của thiết kế: Đang chờ · Đã duyệt · Tất cả.
for (const ma of ['cho', 'duyet', 'tatca']) {
  kiem('  có tấm lọc ' + ma, new RegExp("ma: '" + ma + "'").test(JS_TK),
       'thiếu tấm lọc này');
}

// ⚠ Hai nhịp, không `confirm()`. Cả bảy việc ở đây đổi thứ người dùng không
//   nhìn thấy hậu quả ngay, và ba trong số đó không cứu lại được bằng một cú
//   bấm (gỡ · bàn giao · gắn mã người vào cụ tổ).
kiem('mọi việc đều đi qua nút HAI NHỊP',
     /function nutHaiNhip\(/.test(JS_TK) &&
     !/\bnut\('Đổi vai'/.test(JS_TK),
     'có việc chạy ngay từ nhịp đầu');

// ⚠ Luật "không ai đặt quyền cho chính mình" gác NĂM cửa ở máy chủ. Màn hình
//   phải mờ sẵn nút trên dòng của chính mình — bấm rồi mới nhận câu từ chối là
//   dạy người dùng rằng phần mềm hay hỏng.
kiem('dòng của chính mình bị khoá tay (laChinhToi)',
     (boGhiChuJs(JS_TK).match(/laChinhToi/g) || []).length >= 5,
     'chưa mờ đủ năm cửa trên dòng của chính mình');

// `laChinhToi` phải tính bằng `user_id` của phiên, KHÔNG bằng email: email đổi
// được và trùng được, `user_id` thì không. Phép tính ấy nằm ở `sb.js` để chỉ
// có một chỗ trả lời.
kiem('laChinhToi tính bằng user_id trong sb.js, không so email ở màn hình',
     /laChinhToi:\s*Boolean\(toi && r\.user_id === toi\)/.test(JS_SB) &&
     !/laChinhToi\s*=/.test(boGhiChuJs(JS_TK)),
     'màn hình tự suy "đây là tôi"');

// Chủ cây không hạ vai và không gỡ được — kể cả Quản trị hệ thống. Muốn đổi
// thì đi đường Bàn giao.
kiem('chủ cây được mờ nút Đổi vai và Gỡ (laChuCay)',
     (boGhiChuJs(JS_TK).match(/laChuCay/g) || []).length >= 3,
     'chưa chặn hạ vai / gỡ chủ cây');

// Chỗ hỏng câm 7 vẫn nguyên giá trị ở khu mới.
{
  const thieu = classThieuTrongCss(JS_TK, CSS);
  kiem('mọi class qt- dùng trong khu Tài khoản đều có trong quan-tri.css',
       thieu.length === 0, 'thiếu định nghĩa: ' + thieu.join(', '));
}

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

// G6 — đổi tên một class trong JS mà quên đổi trong CSS. Đây là chỗ hỏng câm
// số 7: chữ vẫn đủ, bố cục vỡ, không có lỗi nào.
{
  const hong6 = JS_KH.replace("'qt-nut'", "'qt-nut-moi'");
  kiem('bắt được class trong JS không có trong CSS',
       classThieuTrongCss(hong6, CSS).length > 0, 'không bắt được');
}

// G7 — khung tự hỏi bề ngang màn hình, tức bắt đầu có bộ mã thứ hai.
{
  const hong7 = JS_KH + "\nif (window.innerWidth < 680) veHangThe();\n";
  kiem('bắt được nhánh riêng theo bề ngang màn hình', !motBoMa(hong7),
       'không bắt được');
}

// G8 — sửa `#` lạ bằng cách gán lại location.hash: vẽ hai lần, kẹt nút Back.
{
  const hong8 = JS_KH.replace(/window\.history\.replaceState\([^;]*;/,
                              "window.location.hash = khu.ma;");
  kiem('bắt được # lạ bị sửa bằng cách gán lại location.hash',
       !suaHashBangReplaceState(hong8), 'không bắt được');
}

// G9 — khu Tài khoản tự quyết quyền bằng `vaiTro` thay vì hỏi máy chủ. Đây là
// chỗ hỏng câm số 5, và ở khu này nó khoá tay đúng CHỦ CÂY — người nhận quyền
// qua một cột, không qua mã vai.
{
  const hong9 = JS_TK + "\nconst duoc = phien.vaiTro === 'quan_tri';\n";
  kiem('bắt được khu Tài khoản tự suy quyền từ vaiTro',
       /vaiTro\s*===/.test(boGhiChuJs(hong9)), 'không bắt được');
}

// G10 — sai một chữ trong tên tham số của một cửa `13`. Cùng bẫy G1, khác file.
{
  const hong10 = JS_SB.replace('p_user_moi:', 'p_usermoi:');
  const lech = lechThamSo(hong10, SQL_13, 'doi_chu_cay');
  kiem('bắt được tên tham số sai một chữ ở cửa doi_chu_cay',
       lech !== null && lech.length > 0, 'không bắt được — phép ở PHẦN H vô dụng');
}

// G11 — quên mờ nút trên dòng của chính mình. Máy chủ vẫn chặn, nên KHÔNG phải
// lỗ hổng; nhưng người dùng bấm năm nút và nhận năm câu từ chối liên tiếp.
{
  const hong11 = JS_TK.replace(/laChinhToi/g, 'laKhachLa');
  kiem('bắt được việc bỏ mờ nút trên dòng của chính mình',
       (boGhiChuJs(hong11).match(/laChinhToi/g) || []).length < 5,
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

/**
 * Hàm vẽ khu phải sửa `#` lạ bằng `replaceState`, KHÔNG bằng cách gán lại
 * `location.hash`. Gán vào nó đẻ ra một `hashchange` nữa — vẽ hai lần — và
 * thêm một mục vào lịch sử, khiến nút Back quay về đúng cái `#` vừa bỏ đi.
 *
 * ⚠ Chỉ soi trong THÂN hàm `veKhu`. Chỗ khác gán `location.hash` là đúng:
 *   cú bấm vào nút điều hướng chính là phải gán nó.
 */
function suaHashBangReplaceState(js) {
  const m = js.match(/function veKhu\([\s\S]*?\n}\n/);
  if (!m) return false;
  const than = boGhiChuJs(m[0]);
  return /replaceState/.test(than) && !/location\.hash\s*=/.test(than);
}

/**
 * Một danh sách khu, hai cách vẽ đổi bằng `@media` — chứ không phải hai bộ
 * mã. File khung không được hỏi màn hình rộng bao nhiêu.
 */
function motBoMa(js) {
  const lenh = boGhiChuJs(js);
  return !/innerWidth/.test(lenh) && !/matchMedia/.test(lenh);
}

/**
 * Mọi class `qt-…` mà `khung.js` gán vào DOM phải có mặt trong
 * `quan-tri.css`. Trả mảng những class thiếu.
 *
 * Đây là phép duy nhất bắt được chỗ hỏng câm số 7 — đổi tên class một bên
 * mà quên bên kia thì trang vẫn hiện đủ chữ, chỉ là bố cục vỡ, và không có
 * một câu lỗi nào ở đâu cả.
 */
function classThieuTrongCss(js, css) {
  const dung = new Set();
  for (const m of js.matchAll(/'(qt-[a-z-]+)'/g)) dung.add(m[1]);
  const co = new Set();
  for (const m of css.matchAll(/\.(qt-[a-z-]+)/g)) co.add(m[1]);
  return [...dung].filter((c) => !co.has(c));
}
