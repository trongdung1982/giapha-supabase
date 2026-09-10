// ============================================================
// giapha-supabase · js/pages/quan-tri/khu-thanh-vien.js
// Vai trò  : Khu 2 của trang Quản trị — danh sách TÀI KHOẢN có tên trong gia
//            phả đang mở, cộng năm việc đổi quyền và hai việc duyệt đơn.
//            Cộng cửa sang tấm lọc *Toàn hệ thống* (file bên cạnh), và là chỗ
//            GIỮ năm việc ấy để file kia dùng lại nguyên vẹn.
// Lớp      : pages — được phép gọi mọi lớp dưới
// Phụ thuộc: services/sb, config, quan-tri/o-goi-y,
//            pages/quan-tri/khu-tai-khoan-he-thong (nạp động)
// Phiên bản: 0.10.0 · Cập nhật: 10/09/2026 (b111b)
//            0.10.0 hai việc chủ dự án chốt 10/09/2026, cùng một gốc: **khu
//            này thôi ngầm định cây đang mở, và cột *Người được gắn* thôi chỉ
//            để đọc.**
//              ① Dòng *"Đang xét quyền trong: …"* trở thành **Ô CHỌN CÂY**.
//                 Trước bản này nó khoá cứng vào `phien.treeId` — cây đang mở
//                 trên trình duyệt — nên muốn sửa quyền ở cây khác thì phải
//                 rời trang, sang khu Gia phả đổi cây, rồi quay lại. Đó là
//                 chỗ cuối cùng còn sót của luật b110b *"không màn hình nào
//                 được ngầm định cây đang hoạt động"*.
//                 ⚠ Ô này **KHÔNG đổi cây đang mở của cả app** — nó chỉ đổi
//                 câu hỏi của riêng khu này. Đổi cây làm việc là việc của khu
//                 Gia phả, và trộn hai thứ ấy vào một chỗ bấm là để người ta
//                 tưởng mình vừa xem một danh sách trong khi vừa đổi cả phiên.
//              ② Cột **Người được gắn** bấm được, mở thẳng hàng *Mã người
//                 trong sơ đồ* của đúng cây đang xét. Trước bản này nó là ô
//                 chữ chết, và đường duy nhất tới chỗ gắn mã người đi vòng qua
//                 nút *Sửa quyền* ở cột cuối — cột đầu tiên rơi khỏi mép màn
//                 hình khi màn hình hẹp.
//            0.9.0 ⚠ **BA TẤM LỌC CÂY NAY PHÂN BIỆT ĐƯỢC LỜI MỜI VỚI ĐƠN XIN
//            VÀO.** Chủ dự án báo lỗ hổng 10/09/2026: mời một tài khoản rồi
//            *"vào kiểm duyệt thêm được người này luôn và đổi được quyền cho
//            họ mà không đợi họ đồng ý"*. Hàng rào thật đã vá ở máy chủ
//            (`luoc-do/18-hai-chu-ky.sql`, bốn cửa + `la_thanh_vien()`);
//            phần ở đây là **thôi mời người ta bấm một thứ chắc chắn bị từ
//            chối** — dòng lời mời nay mang huy hiệu *Được mời — chờ họ bấm
//            Nhận*, nút mở bảng việc **khoá sẵn kèm lý do**, và cột Vai trò
//            hiện đúng vai họ SẼ nhận (`moiVai`) thay vì `xem`.
//            Ba trạng thái phân biệt bằng `moiLuc` (`sb.js` 0.15.0) — đúng
//            cách `veDongVaiTro()` đã làm từ b109c, nay dùng chung một hàm
//            `trangThaiDong()` để hai chỗ không lệch nhau.
//            0.8.0 ⚠ **KHÔNG CÒN CHỖ NÀO ĐỔI QUYỀN MÀ KHÔNG GỌI TÊN CÂY.**
//            Chủ dự án chốt 09/09/2026: *"một người chủ cây gia phả có thể
//            tạo nhiều cây gia phả, vì vậy khi gán quyền không nên ngầm định
//            gán quyền cho cây đang hoạt động mà cần luôn luôn xác định người
//            nào, cây nào, quyền gì"*. Ba việc theo sau:
//              ① `veBangViec()` và `veXetDon()` thôi nhận `treeId` trần, nay
//                 nhận cả một **đối tượng `cay`** `{treeId, ten, maCay}`. Đây
//                 là chỗ sửa THẬT: một chuỗi uuid không tự nói nó là cây nào,
//                 nên chừng nào tham số còn là `treeId` thì màn hình còn phải
//                 tự bịa ra một cái nhãn — và nó đã bịa: chuỗi *"Gia phả đang
//                 mở"* ở bản 0.7.0. Đổi hình dạng tham số thì **không viết
//                 được lời gọi thiếu tên cây nữa**.
//              ② Mọi bảng việc mở ra đều có `dongCay()` ở dòng đầu — tên cây
//                 và mã cây, nền đậm, đứng trên cả năm việc.
//              ③ Câu giải thích của việc *Gỡ* và *Bàn giao* gọi đúng tên cây,
//                 thay cho hai chữ "gia phả" trống không.
//            Tên cây tới đây từ `layPhien()` (`sb.js` 0.14.0), không tốn thêm
//            vòng mạng nào.
//            0.7.0 dòng danh tính (`dongDanhTinh()`, b109d) nay hiện Ở CẢ BỐN
//            TẤM LỌC, không riêng *Toàn hệ thống* — chủ dự án chỉ ra bất nhất
//            ngay sau khi bấm thử b109d: ba tấm *Đang chờ · Đã duyệt · Tất cả*
//            vẫn không nói ai đang xem, dù rủi ro "nhầm tài khoản đang đăng
//            nhập khi đổi quyền" giống hệt ở cả bốn. Tách thành hai `<p>` độc
//            lập: dòng danh tính cố định, câu dẫn theo tấm lọc (`DAN_CAY`) chỉ
//            hiện ở ba tấm cây, ẩn hẳn ở *Toàn hệ thống*.
//            0.6.0 câu dẫn của tấm *Toàn hệ thống* đổi hẳn: không còn mô tả
//            khu này liệt kê gì, mà nói **CHÍNH MÌNH đang đăng nhập bằng tài
//            khoản nào** — tên, email, mã. Chủ dự án bấm thử b109c trên máy
//            chủ thật rồi đổi ý cùng ngày: cờ Quản trị hệ thống có thể cấp
//            cho nhiều tài khoản, và đây là màn hình sửa được cờ ấy cho người
//            khác — nhầm tài khoản đang đăng nhập ở đây là nhầm chỗ nguy
//            hiểm nhất app. `layPhien()` (`sb.js` 0.12.0) nay mang thêm
//            `hoTen`, đọc thẳng bảng `tai_khoan` qua RLS sẵn có, không hàm mới.
//            0.5.0 cột **Vai trò** của ba tấm lọc cây nay BẤM ĐƯỢC: nó mở
//            `veBangVaiTroTungCay()` — một bảng hai cột *gia phả · vai trò*,
//            bấm tiếp vào vai trò là vào thẳng bảng sửa quyền của cây ấy. Cùng
//            hàm ấy phục vụ cột Vai trò của tấm *Toàn hệ thống*. Cộng: bảng
//            dài quá tám dòng thì tự cuộn TRONG khung (bảng việc ở dưới không
//            còn bị đẩy xuống sâu), và câu dẫn tấm *Toàn hệ thống* rút gọn.
//            0.4.0 ô *Mã người trong sơ đồ* nay có gợi ý (`o-goi-y.js`) — gõ
//            tên là ra người, kèm năm sinh–mất và câu "đã gắn cho ai". Và cột
//            *Người được gắn* từ nay hiện được TÊN: `ds_thanh_vien()` trước
//            b109b đọc `vn->>'name'` (luôn null) nên luôn rơi xuống mã người.
//            0.3.0 (b109) tấm lọc thứ tư **Toàn hệ thống**, chỉ hiện cho người
//            có cờ Quản trị hệ thống · sáu hàm việc nhận thẳng `treeId` thay
//            cho cả `phien` (chúng vốn chỉ đọc đúng trường ấy) nên bảng sâu
//            của file bên cạnh gọi lại được chúng theo TỪNG CÂY, không phải
//            chỉ cây đang mở · xuất mấy mẩu vẽ chung.
//            0.2.0 sau lần chủ dự án bấm thử đầu tiên: bảng việc ra NGOÀI
//            bảng (trước nó nằm trong khung 860px nên việc thứ ba trở đi rơi
//            khỏi mép màn hình) · nút *Sửa quyền* khoá sẵn ở dòng không đổi
//            được gì · cờ `tin_cay` trên màn hình gọi đúng là **Tin cậy**.
// ============================================================
//
// ═══ CHỮ "TÀI KHOẢN", KHÔNG PHẢI "THÀNH VIÊN" ═══
//
// Bảng dưới máy chủ tên là `tree_members` và hàm tên `ds_thanh_vien`, nhưng
// thứ liệt kê ở đây là **tài khoản đăng nhập**, không phải người trong sơ đồ
// gia phả. Hai cột khác hẳn nhau và nhầm chúng là hiểu sai cả khu này:
//
//   · `userId`  → tài khoản trong phần mềm. **Vai trò gắn vào đây.**
//   · `maNguoi` → mã người trong cây (`P0012`), có thể trống. Chỉ dùng để tính
//                 phạm vi sửa trực hệ khi vai là `sua`.
//
// Nghĩa là chủ cây phong `quan_tri` cho một tài khoản bất kỳ — người ấy không
// cần có mặt trong gia phả, không cần là con cháu trong họ. Chủ dự án nhắc
// thẳng chỗ này 08/09/2026; `luoc-do/13` mục 7 ghi nguyên văn.
//
// ═══ AI ĐỔI ĐƯỢC QUYỀN — VÀ VÌ SAO KHU NÀY CÓ HAI HẠNG NGƯỜI XEM ═══
//
// `THIET-KE-NHIEU-CAY.md` mục 11.3, chốt 08/09/2026:
//
//   · **Quản trị hệ thống** (cờ `tai_khoan`) — đổi được ở mọi cây.
//   · **Chủ cây** (cột `trees.chu_so_huu`) — đổi được ở cây mình.
//   · **Quản trị gia phả** (`quan_tri` được phong) — **chỉ sửa + duyệt NỘI
//     DUNG. Không đổi quyền, và không duyệt đơn xin vào cây** — nhận một người
//     vào cây là cấp quyền ĐỌC, đó là đổi quyền chứ không phải kiểm một lần Lưu.
//
// Hạng thứ ba vẫn **thấy** bảng này (máy chủ gác `ds_thanh_vien` bằng
// `co_the_kiem_duyet`, cố ý — `02-rls.sql` vốn đã cho mọi thành viên đọc
// `tree_members`, gác chặt hơn ở đó là diễn kịch). Nên khu này phải phân biệt
// *xem được* với *đổi được*, và câu trả lời cho vế thứ hai hỏi máy chủ bằng
// `coTheQuanTri()` — **không suy từ `phien.vaiTro`**: chủ cây nhận quyền qua
// một CỘT, không qua mã vai, nên mọi phép suy trong trình duyệt đều khoá tay
// đúng người có quyền nhất.
//
// ⚠ **Ẩn / mờ nút KHÔNG phải hàng rào.** Hàng rào nằm trong thân bảy hàm SQL
//   của `13`. Ở đây mờ nút chỉ để không mời người ta bấm một thứ chắc chắn bị
//   từ chối — `THIET-KE-QUAN-TRI.md` mục 5 câu cuối.
//
// ═══ HAI NHỊP, VÀ VÌ SAO MỜ SẴN NÚT TRÊN DÒNG CỦA CHÍNH MÌNH ═══
//
// Năm cửa đổi quyền đều từ chối khi người bị tác động **chính là người đang
// gọi** — luật *"không ai đặt quyền cho chính mình"*, không ngoại lệ, kể cả
// Quản trị hệ thống. Hai cửa trong đó không ai gọi là "quyền" mà vẫn là leo
// thang: tự **gắn mã người** cho mình vào một cụ tổ mở `pham_vi_sua()` ra cả
// cây; tự bật **ghi thẳng** là tự bỏ qua kiểm duyệt.
//
// Nên dòng của chính mình phải **mờ sẵn kèm một câu lý do**, đừng để bấm rồi
// mới nhận câu từ chối. Mờ chứ không ẩn: ẩn thì người ta đi tìm, và không có
// gì dạy họ luật ấy tồn tại.
//
// ⚠ **Không `alert()`, không `confirm()`.** Cả app chưa có chỗ nào dùng
//   (`khung.js` đầu file). Việc hỏng thì nói ngay tại dòng nó hỏng.

import {
  layPhien, coTheQuanTri, dsThanhVien,
  doiVaiThanhVien, ganNguoiChoThanhVien, datTinCayThanhVien,
  goThanhVien, doiChuCay, duyetThanhVien, tuChoiThanhVien,
  timNguoiTrongCay, dsCayCuaTaiKhoan, layDanhSachGiaPha,
} from '../../services/sb.js';
import { vaiTroBangChu } from '../../config.js';
import { ganGoiY, dongNguoi } from './o-goi-y.js';

/**
 * Bốn tấm lọc. **Ba tấm đầu lọc ở TRÌNH DUYỆT**, không gọi lại máy chủ — cả
 * ba nhìn cùng một danh sách, khác nhau đúng một cột `approved`, và danh sách
 * ấy đếm bằng chục chứ không bằng nghìn. Gọi lại một vòng mạng cho mỗi lần bấm
 * tấm lọc là trả tiền mạng để lấy về đúng những dòng vừa có trong tay.
 *
 * Tấm thứ tư thì ngược lại: nó hỏi một câu khác nên nó phải gọi máy chủ.
 */
const LOC = [
  { ma: 'cho',    chu: 'Đang chờ' },
  { ma: 'duyet',  chu: 'Đã duyệt' },
  { ma: 'tatca',  chu: 'Tất cả' },
  // ⚠ Tấm thứ tư KHÔNG phải một tấm lọc của cùng danh sách — nó đổi hẳn câu
  //   hỏi: ba tấm trên hỏi *"ai có quyền trong CÂY NÀY"*, tấm này hỏi *"sổ
  //   đăng ký của cả phần mềm có những ai"*. Nên nó gọi hàm khác, vẽ bảng
  //   khác cột, và nằm ở file khác (`khu-tai-khoan-he-thong.js`).
  //   Nó vẫn đứng ở hàng tấm lọc vì đó là chỗ người ta đang đứng khi nghĩ ra
  //   câu hỏi ấy — thêm một mục thứ năm vào thanh điều hướng bên trái là đẻ
  //   ra một khu chỉ một người trong hệ thống mở được.
  { ma: 'hethong', chu: 'Toàn hệ thống', chiQuanTriHeThong: true },
];

/** Trần quyền cấp được cho tài khoản khác — `13` mục 8 chặn phần còn lại. */
const VAI_CAP_DUOC = ['quan_tri', 'sua', 'xem'];

// ⚠ Mở ra là thấy **Tất cả**, không phải "Đang chờ" như khu Kiểm duyệt. Hai
//   khu trả lời hai câu khác nhau: bên kia là một HÀNG CHỜ, mở ra để xử lý cho
//   hết; bên này là một DANH SÁCH, mở ra để biết ai đang có quyền gì. Lọc sẵn
//   thành một khúc là giấu mất câu trả lời chính, và người mới vào không biết
//   mình đang nhìn một phần.
let locDangXem = 'tatca';

/** Câu dẫn dưới tựa khu — đổi theo tấm lọc đang mở. Vắng ở tấm *Toàn hệ
 *  thống*: dòng danh tính ngay bên trên đã là điều đáng nói nhất ở đó, và
 *  đầu cột của bảng tự nói phần còn lại (`bấm để xem/sửa chi tiết`…). */
// ⚠ **"GIA PHẢ ĐANG XÉT", KHÔNG PHẢI "GIA PHẢ ĐANG MỞ"** — sửa b111b. Từ khi
//   có ô chọn cây, hai thứ ấy tách nhau ra được, và câu cũ để lại một câu SAI
//   đứng ngay trên một cái bảng đúng. Người đọc tin câu chữ trước khi tin cái
//   bảng — đúng lý lẽ khối chú thích của `oGioiThieu` đã dựng ra khi tấm
//   *Toàn hệ thống* ra đời. Câu này không gọi TÊN cây: dòng ngay trên đã gọi,
//   và nhắc lần thứ hai là làm loãng chính chỗ chọn.
const DAN_CAY =
  'Những tài khoản đăng nhập có tên trong gia phả đang xét ở trên. Vai trò ' +
  'gắn cho TÀI KHOẢN, không gắn cho người trong sơ đồ — một tài khoản có thể ' +
  'quản trị gia phả mà không có mặt trong họ.';

// ⚠ HIỆN Ở CẢ BỐN TẤM LỌC, không riêng *Toàn hệ thống* — sửa 09/09/2026
//   (b109e) sau khi chủ dự án chỉ ra bất nhất: b109d mới sửa mỗi tấm *Toàn hệ
//   thống*, còn ba tấm *Đang chờ · Đã duyệt · Tất cả* vẫn không nói ai đang
//   xem. Rủi ro ban đầu viện dẫn cho *Toàn hệ thống* — nhầm tài khoản đang
//   đăng nhập khi đổi quyền — **ĐÚNG Y HỆT ở ba tấm kia**: cả ba đều mở được
//   cùng bảng việc năm nút (đổi vai, gắn người, tin cậy, gỡ, bàn giao). Không
//   có lý do gì để chỉ một trong bốn tấm nói ra ai đang cầm chuột.
//
// ⚠ Đứng RIÊNG một dòng, KHÔNG gộp vào `DAN_CAY`/mô tả tấm lọc: danh tính
//   không đổi theo tấm lọc đang mở, còn `DAN_CAY` thì có. Gộp chung một câu
//   là buộc câu ấy phải viết lại mỗi khi một trong hai nửa đổi.
function dongDanhTinh(phien) {
  const phan = [];
  if (phien.hoTen) phan.push(phien.hoTen);
  if (phien.email) phan.push(phien.email);
  if (phien.maNgan) phan.push('mã ' + phien.maNgan);
  // `phan.length` gần như không bao giờ rỗng — người đọc được tới đây đã
  // đăng nhập, tức có email. Vẫn phòng hờ: trống thì không vẽ hàng ấy,
  // `CLAUDE.md` mục 7, thay vì để một câu "Bạn: " cụt lủn.
  return phan.length ? 'Bạn đang đăng nhập bằng ' + phan.join(' · ') + '.' : '';
}

/** Thẻ `<p>` chứa dòng danh tính — CỐ ĐỊNH, không đổi theo tấm lọc. */
let oDanhTinh = null;

/**
 * Ô nói **đang xét quyền trong cây nào** — ba tấm lọc cây có, tấm *Toàn hệ
 * thống* không (ở đó mỗi dòng dính tới nhiều cây khác nhau, một câu chung sẽ
 * là một câu sai).
 *
 * ⚠ Đứng RIÊNG với dòng danh tính bên trên. Hai câu trả lời hai câu hỏi khác
 *   nhau — *ai đang cầm chuột* và *đang đứng trong cây nào* — và chủ dự án
 *   đòi cả hai phải nói ra trước khi ai bấm gì (09/09/2026).
 *
 * ⚠ Từ b111b đây là chỗ **CHỌN** cây, không còn là chỗ đọc tên cây đang mở.
 *   Xem `veODoiCay()`.
 */
let oCayDangMo = null;

/**
 * Cây khu này đang xét — `{treeId, ten, maCay}`, hoặc `null` khi chưa chọn.
 *
 * ⚠⚠ **KHÔNG PHẢI cây đang mở của app.** `phien.treeId` là cây người ta đang
 *   vẽ sơ đồ; biến này là cây khu Tài khoản & quyền đang hỏi. Chúng khởi đầu
 *   bằng nhau và tách ra ngay khi người dùng đổi ô chọn — và đó là cả điểm:
 *   sửa quyền ở cây B không được bắt người ta bỏ dở cây A đang mở.
 *
 * ⚠ Nằm ở tầng mô-đun chứ không trong `phien`: `phien` là ảnh chụp của máy
 *   chủ, ghi vào đó là dựng một sự thật thứ hai cạnh sự thật thật.
 */
let cayDangXet = null;

/**
 * Danh sách cây để đổ vào ô chọn — đọc MỘT LẦN mỗi lần mở khu.
 *
 * ⚠ Không đọc lại sau mỗi `napLai()`. Năm việc đổi quyền không đẻ ra cây mới,
 *   nên đọc lại là một vòng mạng lấy về đúng thứ vừa có trong tay. Đổi cây
 *   thì `mountKhuThanhVien()` chạy lại và danh sách tươi trở lại.
 */
let dsCayChon = [];

/** Thẻ `<p>` chứa câu dẫn theo TẤM LỌC, giữ lại để `nap()` đổi chữ. */
let oGioiThieu = null;

// ============================================================
// Cửa vào
// ============================================================

/**
 * Vẽ khu Tài khoản & quyền.
 *
 * @param {HTMLElement} el     thân trang, đã dọn sạch
 * @param {object} [phienVao]  kết quả `sb.layPhien()`; thiếu thì tự hỏi
 */
export async function mountKhuThanhVien(el, phienVao) {
  el.innerHTML = '';

  const h = document.createElement('h2');
  h.className = 'qt-tua';
  h.textContent = 'Tài khoản & quyền';

  // ⚠ Dòng danh tính đứng TRƯỚC câu dẫn, và không đổi theo tấm lọc — nó trả
  //   lời "ai đang xem", chứ không phải "khu này liệt kê gì". Rỗng lúc mới vẽ
  //   (chưa có `phien`); `nap()` điền chữ ngay khi đọc xong.
  const ai = document.createElement('p');
  ai.style.cssText = 'margin:0 0 6px;color:#2a2622;font-weight:600;line-height:1.5';
  oDanhTinh = ai;

  // Dòng "đang xét quyền trong cây nào" — xem `oCayDangMo`.
  const oc = document.createElement('p');
  oc.style.cssText = 'margin:0 0 8px;color:#2a2622;font-weight:600;line-height:1.5';
  oCayDangMo = oc;

  // ⚠ Câu dẫn phải ĐỔI THEO tấm lọc đang mở, không phải viết một lần rồi thôi.
  //   Ba tấm đầu liệt kê tài khoản của CÂY ĐANG MỞ; tấm thứ tư liệt kê cả sổ
  //   đăng ký (và ẩn hẳn câu này — dòng danh tính bên trên đã đủ, xem
  //   `dongDanhTinh()`). Để nguyên câu cũ khi sang tấm thứ tư là để một câu
  //   SAI đứng ngay trên một cái bảng đúng — và người đọc tin câu chữ trước
  //   khi tin cái bảng.
  const dan = document.createElement('p');
  dan.textContent = DAN_CAY;
  dan.style.cssText = 'margin:0 0 16px;color:#6a625a;line-height:1.5';
  oGioiThieu = dan;

  const than = document.createElement('div');
  than.textContent = 'Đang đọc danh sách…';
  than.style.cssText = 'color:#8a8078';

  el.append(h, ai, oc, dan, than);

  const phien = phienVao || await layPhien();
  if (phien.loi) {
    than.innerHTML = '';
    than.style.cssText = '';
    than.append(veLoi(phien.loi, () => mountKhuThanhVien(el, null)));
    return;
  }

  // ⚠ Đọc danh sách cây TRƯỚC khi vẽ bảng, vì ô chọn cây quyết định bảng hỏi
  //   cây nào. Một vòng mạng rẻ (`ds_gia_pha` trả vài dòng), và nó thay cho
  //   việc bắt người ta rời trang sang khu Gia phả rồi quay lại.
  //
  // ⚠ Lỗi đọc danh sách KHÔNG được biến thành "bạn chưa có cây nào" — đúng
  //   luật `THIET-KE-QUAN-TRI.md` khu 1: *không biến lỗi thành danh sách rỗng*.
  //   Rơi về đúng cây đang mở thì khu vẫn dùng được, chỉ mất chỗ đổi cây.
  const kqCay = await layDanhSachGiaPha();
  dsCayChon = kqCay.ok ? cayChonDuoc(kqCay.ds) : [];
  if (!dsCayChon.length && phien.treeId) {
    dsCayChon = [cayCuaPhien(phien)];
  }

  // Cây mở sẵn: cây đang mở nếu nó có trong danh sách, không thì cây đầu.
  cayDangXet = dsCayChon.find((c) => c.treeId === phien.treeId)
    || dsCayChon[0] || null;

  // ⚠ Cửa này chỉ chặn được người KHÔNG phải Quản trị hệ thống. Tấm lọc *Toàn
  //   hệ thống* không đọc cây nào cả — chặn nó vì "chưa mở gia phả" là khoá
  //   đúng người duy nhất có việc ở đó, và khoá bằng một lý do chẳng liên quan.
  if (!cayDangXet && !phien.laQuanTriHeThong) {
    than.innerHTML = '';
    than.style.cssText = '';
    const r = document.createElement('div');
    r.className = 'qt-chua-lam';
    r.textContent = kqCay.ok
      ? 'Bạn chưa có chân trong gia phả nào, nên chưa có danh sách tài khoản ' +
        'để xem.'
      : 'Không đọc được danh sách gia phả, nên chưa biết xét quyền trong cây ' +
        'nào. Mở lại khu này một lần nữa.';
    than.append(r);
    return;
  }

  if (!cayDangXet) locDangXem = 'hethong';

  await nap(than, phien);
}

/**
 * Lọc ra những cây **đổ vào ô chọn được**, và trả đúng ba trường mà năm việc
 * đổi quyền chờ.
 *
 * ⚠ KHÔNG lọc theo vai ở trình duyệt. Cám dỗ là chỉ hiện cây mình làm chủ hay
 *   quản trị — nhưng vai ấy đọc từ `vaiCuaToi`, mà **chủ cây nhận quyền qua
 *   một CỘT chứ không qua mã vai** (`13` mục 4), và Quản trị hệ thống thì
 *   không có dòng `tree_members` nào ở phần lớn cây. Lọc kiểu ấy là khoá tay
 *   đúng hai hạng người có quyền nhất — đúng cái bẫy khối chú thích đầu file
 *   đã cảnh báo với `phien.vaiTro`. Máy chủ trả lời câu "đổi được không" bằng
 *   `coTheQuanTri()`, và bảng rỗng đã có câu giải thích riêng.
 *
 * ⚠ Nhưng CÓ lọc bằng `coTheXem`, và đó không phải mâu thuẫn với đoạn trên:
 *   `co_the_xem` là câu trả lời của MÁY CHỦ (`ds_gia_pha` hỏi
 *   `co_the_xem_cay()`, thứ đã tính cả cờ Quản trị hệ thống lẫn cột chủ cây),
 *   không phải một phép suy trong trình duyệt. Cây mình mới **nộp đơn** mà
 *   chưa ai duyệt thì `co_the_xem` là `false` — đổ nó vào ô chọn là mời người
 *   ta xét quyền trong một cây họ còn chưa vào được, và thứ nhận về sẽ là một
 *   bảng rỗng kèm câu giải thích chẳng ăn nhập.
 *
 * ⚠ Cây trong THÙNG RÁC thì bỏ. Nó chưa xoá hẳn, nhưng xét quyền trong một
 *   cây đang chờ xoá là mời người ta làm một việc sắp thành vô nghĩa.
 */
function cayChonDuoc(ds) {
  return (ds || [])
    .filter((c) => c && c.fileId && c.coTheXem && !c.daXoaLuc)
    .map((c) => ({ treeId: c.fileId, ten: c.ten || '', maCay: c.treeCode || '' }));
}

async function nap(than, phien) {
  const coHeThong = Boolean(phien.laQuanTriHeThong);

  // Cờ tắt đi giữa chừng (đổi tài khoản, hay ai đó vừa hạ cờ của mình) thì
  // đừng để màn hình đứng ở một tấm lọc không còn tồn tại.
  if (locDangXem === 'hethong' && !coHeThong) locDangXem = 'tatca';

  // Danh tính hiện Ở CẢ BỐN TẤM LỌC — không phụ thuộc `locDangXem`.
  if (oDanhTinh) oDanhTinh.textContent = dongDanhTinh(phien);

  // Cây đang xét: nói ở ba tấm lọc cây, ẩn hẳn ở *Toàn hệ thống*.
  // `display:none` chứ không để trống — một ô rỗng vẫn ăn `margin-bottom`.
  if (oCayDangMo) {
    const co = locDangXem !== 'hethong' && Boolean(cayDangXet);
    oCayDangMo.innerHTML = '';
    oCayDangMo.style.display = co ? '' : 'none';
    if (co) oCayDangMo.append(veODoiCay(than, phien));
  }

  // Câu dẫn theo tấm lọc: ẩn hẳn ở *Toàn hệ thống* (dòng danh tính bên trên
  // đã đủ), hiện `DAN_CAY` ở ba tấm cây. `display:none` chứ không chỉ để
  // trống — một `<p>` rỗng vẫn ăn `margin-bottom:16px`, để lại một khoảng
  // trắng vô cớ ngay dưới dòng danh tính.
  if (oGioiThieu) {
    const co = locDangXem !== 'hethong';
    oGioiThieu.textContent = co ? DAN_CAY : '';
    oGioiThieu.style.display = co ? '' : 'none';
  }

  if (locDangXem === 'hethong') return napHeThong(than, phien);

  // ⚠ HỎI THEO `cayDangXet`, KHÔNG theo `phien.treeId`. Đây là chỗ luật b110b
  //   thi hành thật: hai dòng dưới là hai lời gọi duy nhất quyết bảng này nói
  //   về cây nào, và chúng gọi tên cây người dùng đã chọn.
  const cay = cayDangXet;
  const [kq, duocDoiQuyen] = await Promise.all([
    dsThanhVien(cay.treeId),
    coTheQuanTri(cay.treeId),
  ]);

  than.innerHTML = '';
  than.style.cssText = '';

  const napLai = () => nap(than, phien);

  if (!kq.ok) {
    than.append(veLoi(kq.loi || 'Không đọc được danh sách tài khoản.', napLai));
    return;
  }

  const ds = kq.ds || [];

  // ⚠ Danh sách RỖNG ở đây gần như luôn nghĩa là *"máy chủ không cho bạn
  //   đọc"*, không phải *"gia phả không có ai"*: mọi cây đều có ít nhất dòng
  //   của chủ nó. Nói đúng chuyện ấy, đừng vẽ một cái bảng trống — bảng trống
  //   nói "không có dữ liệu" và người đọc đi tìm lỗi ở chỗ khác.
  if (!ds.length) {
    // Quản trị hệ thống vẫn phải thấy hàng tấm lọc: đường sang *Toàn hệ thống*
    // đi qua đó, và cây này rỗng không nói gì về sổ đăng ký của cả phần mềm.
    if (coHeThong) {
      than.append(veThanhLoc(0, true, (moi) => { locDangXem = moi; napLai(); }));
    }
    const r = document.createElement('div');
    r.className = 'qt-chua-lam';
    // ⚠ GỌI TÊN CÂY. Từ b111b ô chọn cây cho phép đứng ở một cây mình không
    //   đọc được danh sách — câu "máy chủ không trả về tài khoản nào" mà không
    //   nói cây nào thì đọc ra như cả phần mềm hỏng.
    r.textContent =
      'Máy chủ không trả về tài khoản nào trong ' + cumCay(cay) + '. Khu này ' +
      'dành cho người quản trị gia phả; tài khoản của bạn xem và sửa gia phả ' +
      'bình thường ở trang chính. Cần đổi thì nhắn cho ' +
      (phien.nguoiQuanLy || 'người quản lý') + '.';
    than.append(r);
    return;
  }

  if (!duocDoiQuyen) than.append(veNhacChiXem());

  // ⚠ ĐẾM ĐƠN XIN VÀO, KHÔNG ĐẾM LỜI MỜI (sửa b110c). Con số này nói *"còn
  //   bao nhiêu việc bạn phải bấm"*; một lời mời thì đang chờ CHÍNH NGƯỜI ĐƯỢC
  //   MỜI bấm Nhận, không phải việc của người quản trị. Đếm cả hai là dẫn
  //   người ta đi tìm một cái nút mà bấm — đúng cái nút mở ra lỗ hổng
  //   10/09/2026. Máy chủ đếm cùng một cách (`ds_cho_duyet()`, `18` mục 6c),
  //   nên hai con số trên màn hình không lệch nhau.
  const soDonXin = ds.filter((t) => trangThaiDong(t) === 'donxin').length;

  than.append(veThanhLoc(soDonXin, coHeThong, (moi) => {
    locDangXem = moi;
    napLai();
  }));

  const hienRa = ds.filter(hopLoc);
  if (!hienRa.length) {
    const r = document.createElement('div');
    r.className = 'qt-chua-lam';
    r.textContent = locDangXem === 'cho'
      ? 'Không có ai đang chờ duyệt.'
      : 'Không có tài khoản nào ở mục này.';
    than.append(r);
    return;
  }

  // ⚠ BẢNG VIỆC ĐỨNG NGOÀI BẢNG, và đó là kết quả ĐO chứ không phải sở thích.
  //   Bản đầu mở nó thành một dòng `<tr>` ngay dưới dòng vừa bấm — đọc mã thì
  //   hợp lý, và trên máy tính 1280px trông đẹp. Ảnh chụp 390px cho thấy nó
  //   hỏng: ô mở rộng nằm TRONG cái bảng `min-width:860px`, nên nửa phải của
  //   mọi câu giải thích bị cắt, và muốn đọc phải kéo ngang từng dòng một.
  //   Đúng loại lỗi bất biến văn bản không bắt được — hợp lệ, mà không dùng
  //   được. Đứng ngoài thì nó rộng đúng bằng khu, ở cả hai bề ngang màn hình.
  //   ⚠ Một chỗ đứng chung thì **mỗi lúc chỉ một dòng mở được**, và đó là chủ
  //   ý: hai bảng việc cùng mở là hai ô nhập mã người nằm cạnh nhau không nói
  //   rõ ô nào của ai.
  const oViec = document.createElement('div');
  // `oVai` đứng riêng với `nut` vì hai chỗ bấm trả trạng thái về theo hai cách
  // khác nhau: nút thao tác đổi CHỮ trên mình ("Sửa quyền" ↔ "Thu lại"), còn ô
  // Vai trò chỉ đổi nền — gán đè chữ lên nó là xoá mất huy hiệu bên trong.
  const boMoRong = { oViec, dangMo: null, nut: [], oVai: [] };

  const khung = veBang(hienRa, phien, cay, duocDoiQuyen, napLai, boMoRong);
  than.append(khung);

  // ⚠ Nói ra CHỈ KHI nó đúng, và ĐO để biết nó đúng — chép đúng cách
  //   `khu-kiem-duyet.js` làm. Nút mở bảng việc nằm ở cột cuối, tức nó là thứ
  //   đầu tiên biến mất khi màn hình hẹp; không nói thì người cầm điện thoại
  //   tưởng khu này chỉ để đọc. Ảnh chụp 390px bắt được đúng chỗ này (b106).
  if (khung.scrollWidth > khung.clientWidth + 4) {
    const n = document.createElement('div');
    n.textContent =
      'Màn hình hẹp hơn bảng — kéo ngang trong bảng để thấy cột thao tác ở cuối dòng.';
    n.style.cssText = 'margin-top:8px;font-size:12px;color:#8a8078;line-height:1.5';
    than.append(n);
  }

  than.append(oViec);
}

/**
 * Tấm lọc thứ tư — **Toàn hệ thống**. Cả phần vẽ nằm ở
 * `khu-tai-khoan-he-thong.js`, và nó tới đây bằng `import()` ĐỘNG, không phải
 * `import` ở đầu file. Hai lý do, lý do thứ hai mới là lý do thật:
 *
 *   1. Chỉ đúng một hạng người mở được tấm lọc này. Nạp sẵn cả file cho mọi
 *      người quản trị gia phả là bắt họ tải một thứ họ không có cửa dùng.
 *   2. **Không có vòng import.** File kia `import` ngược lại chỗ này để dùng
 *      lại năm việc của `13` và mấy mẩu vẽ chung — đúng chủ ý, vì "không hàm
 *      việc nào phải viết mới" chính là điều làm b109 nhỏ. Tĩnh cả hai chiều
 *      là một vòng; động một chiều thì không.
 *
 * ⚠ File nạp hụt (gõ sai chữ hoa trong tên file — GitHub Pages phân biệt hoa
 *   thường, còn Windows thì không) phải NÓI RA. Không bắt thì màn hình đứng
 *   nguyên ở chữ "Đang đọc…" và chẳng có câu lỗi nào ở đâu cả.
 */
async function napHeThong(than, phien) {
  than.innerHTML = '';
  than.style.cssText = '';

  const napLai = () => nap(than, phien);

  than.append(veThanhLoc(null, true, (moi) => {
    locDangXem = moi;
    napLai();
  }));

  const cho = document.createElement('div');
  cho.textContent = 'Đang đọc sổ tài khoản…';
  cho.style.cssText = 'color:#8a8078';
  than.append(cho);

  let mo;
  try {
    mo = await import('./khu-tai-khoan-he-thong.js');
  } catch (e) {
    cho.remove();
    than.append(veLoi('Không nạp được phần Toàn hệ thống: ' + (e && e.message
      ? e.message : 'lỗi không rõ'), napLai));
    return;
  }

  cho.remove();
  await mo.mountToanHeThong(than, napLai);
}

function hopLoc(t) {
  if (locDangXem === 'cho') return !t.daDuyet;
  if (locDangXem === 'duyet') return t.daDuyet;
  return true;
}

/**
 * Câu nói thẳng cho người mang vai `quan_tri` **được phong**: xem được, không
 * đổi được. Đây là món nợ b105 trả ở đây — trước bước này họ thấy khối *Đơn
 * chờ duyệt* trong Cài đặt, bấm Duyệt rồi mới nghe máy chủ từ chối.
 */
function veNhacChiXem() {
  const hop = document.createElement('div');
  hop.style.cssText =
    'margin-bottom:14px;padding:11px 13px;border:1px solid #e2d5bf;' +
    'border-radius:9px;background:#faf6ee;color:#7a5a28;font-size:13px;' +
    'line-height:1.55';
  hop.textContent =
    'Bạn xem được danh sách này nhưng không đổi được quyền của ai, và cũng ' +
    'không duyệt được đơn xin vào gia phả — nhận một người vào cây là cấp ' +
    'quyền đọc, việc ấy thuộc chủ gia phả. Bạn vẫn sửa và duyệt nội dung bình thường.';
  return hop;
}

// ============================================================
// Ô CHỌN CÂY — chỗ luật "không ngầm định cây đang mở" thi hành thật
// ============================================================

/**
 * Dòng *"Đang xét quyền trong: …"*, nhưng là chỗ **chọn**, không phải chỗ đọc.
 *
 * ⚠ MỘT CÂY THÌ KHÔNG VẼ Ô CHỌN. Một `<select>` có đúng một mục là một cái nút
 *   mời người ta bấm rồi chẳng đưa đi đâu — và nó còn nói sai một câu: rằng có
 *   thứ để chọn. Câu chữ vẫn gọi tên cây, nên luật *"luôn xác định cây nào"*
 *   không mất gì.
 *
 * ⚠ Ô này **KHÔNG đổi cây đang mở của cả app.** Nó không gọi `datCayLamViec()`
 *   hay chạm `phien` — nó chỉ đổi câu hỏi của khu này. Trộn hai việc ấy là để
 *   người ta tưởng mình vừa lọc một bảng trong khi vừa đổi cả phiên làm việc,
 *   và sơ đồ ở tab bên cạnh im lặng nhảy sang cây khác.
 *
 * @param {HTMLElement} than  thân khu, để vẽ lại sau khi đổi
 */
function veODoiCay(than, phien) {
  const hop = document.createElement('span');
  hop.style.cssText = 'display:inline-flex;flex-wrap:wrap;align-items:center;gap:8px';

  const nhan = document.createElement('span');
  nhan.textContent = 'Đang xét quyền trong:';
  hop.append(nhan);

  // Một cây — nói tên ra, hết. Dấu hai chấm ở trên, KHÔNG viết *"trong gia phả
  // <tên>"*: tên cây thật hay mở đầu bằng chính chữ ấy (*"Gia phả họ Nguyễn
  // Trọng Bắc"*), và câu kia đọc ra thành *"trong gia phả Gia phả họ…"*.
  if (dsCayChon.length < 2) {
    const t = document.createElement('span');
    t.textContent = nhanCay(cayDangXet) + '.';
    hop.append(t);
    return hop;
  }

  const chon = document.createElement('select');
  chon.style.cssText =
    'padding:5px 8px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;font-weight:400;max-width:100%';
  for (const c of dsCayChon) {
    const m = document.createElement('option');
    m.value = c.treeId;
    m.textContent = nhanCay(c);
    chon.append(m);
  }
  chon.value = cayDangXet.treeId;

  chon.addEventListener('change', () => {
    const moi = dsCayChon.find((c) => c.treeId === chon.value);
    if (!moi || moi.treeId === cayDangXet.treeId) return;
    cayDangXet = moi;
    // ⚠ Vẽ lại CẢ KHU, không vá từng ô. Đổi cây là đổi câu trả lời của mọi
    //   dòng, mọi con số trên tấm lọc, và cả câu *"bạn chỉ xem được"* — vá
    //   từng chỗ là để sót đúng một chỗ, và chỗ ấy sẽ nói về cây cũ.
    than.textContent = 'Đang đọc danh sách…';
    than.style.cssText = 'color:#8a8078';
    nap(than, phien);
  });

  hop.append(chon);

  // ⚠ Nói thẳng ô này KHÔNG đổi cây đang mở. Không có câu này thì người dùng
  //   hợp lý sẽ đoán ngược lại — mọi chỗ chọn cây khác trong app đều đổi cây
  //   làm việc thật.
  const nhac = document.createElement('span');
  nhac.textContent = 'chỉ đổi bảng dưới đây, không đổi gia phả đang mở';
  nhac.style.cssText = 'font-size:12px;font-weight:400;color:#8a8078';
  hop.append(nhac);

  return hop;
}

// ============================================================
// Ba tấm lọc
// ============================================================

/**
 * Ngôn ngữ hình lấy nguyên của `veThanhLoc()` trong khu Kiểm duyệt.
 *
 * @param {number|null} soCho  số đơn đang chờ; `null` khi chưa đọc danh sách
 *                             cây (lúc đang đứng ở tấm *Toàn hệ thống*)
 * @param {boolean} coHeThong  người này có cờ Quản trị hệ thống không
 */
function veThanhLoc(soCho, coHeThong, doiLoc) {
  const hang = document.createElement('div');
  hang.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px';

  for (const l of LOC) {
    if (l.chiQuanTriHeThong && !coHeThong) continue;
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.loc = l.ma;
    // Số trong ngoặc chỉ mọc ở tấm "Đang chờ", và chỉ khi khác 0 — đúng luật
    // `CLAUDE.md` mục 7. Một cái "(0)" nói *có việc đấy* trong khi không có.
    b.textContent = (l.ma === 'cho' && soCho) ? l.chu + ' (' + soCho + ')' : l.chu;
    const dangChon = l.ma === locDangXem;
    b.style.cssText =
      'padding:8px 14px;font:inherit;font-size:13px;border-radius:9px;' +
      'cursor:pointer;touch-action:manipulation;' +
      'border:1px solid ' + (dangChon ? '#2a2622' : '#e6e0d8') + ';' +
      'background:' + (dangChon ? '#2a2622' : '#faf8f5') + ';' +
      'color:' + (dangChon ? '#fffdf9' : '#2a2622') + ';' +
      'font-weight:' + (dangChon ? '600' : '400');
    b.addEventListener('click', () => {
      if (locDangXem === l.ma) return;
      doiLoc(l.ma);
    });
    hang.append(b);
  }
  return hang;
}

// ============================================================
// Bảng
// ============================================================

function veBang(ds, phien, cay, duocDoiQuyen, napLai, bo) {
  // Bảng rộng phải tự cuộn TRONG khung của nó, không kéo phình cả lưới hai cột
  // của trang. Cùng cách hai khu kia làm.
  const khung = document.createElement('div');
  khung.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';
  capChieuCao(khung, ds.length);

  const bang = document.createElement('table');
  bang.style.cssText =
    'width:100%;min-width:860px;border-collapse:collapse;font-size:13px;' +
    'background:#fffdf9;border:1px solid #e6e0d8;border-radius:10px';

  bang.append(veDauBang());

  const ruot = document.createElement('tbody');
  for (const t of ds) veMotDong(ruot, t, phien, cay, duocDoiQuyen, napLai, bo);
  bang.append(ruot);

  khung.append(bang);
  return khung;
}

function veDauBang() {
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #e6e0d8;background:#faf8f5';

  const cot = [
    ['Tài khoản', ''],
    // ⚠ Cột này có việc thật, không phải trang trí: hai người trong họ trùng
    //   tên là chuyện thường ở gia phả, và mã ngắn là thứ chỉ đúng một tài
    //   khoản mà không phải đọc email lên. Màn Cài đặt hiện đúng mã ấy cho
    //   từng người tự đọc (`settings.js`, khối *Tài khoản và quyền*).
    ['Mã tài khoản', ''],
    // ⚠ Chú thích nhỏ *"bấm để gắn/đổi"* KHÔNG phải trang trí — cùng lý do đã
    //   phải thêm nó cho cột *Tài khoản* của tấm *Toàn hệ thống* (b109c): một
    //   ô bảng trông không giống nút, và không nói thì chỗ bấm ấy vô hình.
    ['Người được gắn', '', 'bấm để gắn/đổi'],
    ['Vai trò', '', 'bấm xem từng cây'],
    // ⚠ Trên màn hình gọi là **Tin cậy**, đúng tên cột `tree_members.tin_cay`
    //   và đúng chữ chủ dự án dùng khi hỏi. Bản đầu b106 gọi nó là *Ghi thẳng*
    //   — mô tả đúng cái nó làm, nhưng chủ dự án đi tìm chữ "tin cậy" và không
    //   thấy (08/09/2026). Chữ "ghi thẳng" vẫn ở nguyên trong câu giải thích,
    //   nơi nó có việc: nói ra HẬU QUẢ của việc bật.
    ['Tin cậy', 'text-align:center'],
    ['Tham gia', ''],
    ['', 'text-align:right'],
  ];
  for (const [chu, them, phu] of cot) {
    const th = document.createElement('th');
    th.style.cssText =
      'padding:9px 10px;text-align:left;font-weight:600;color:#6a625a;' +
      'font-size:12px;white-space:nowrap;' + CSS_DAU_BANG + them;
    th.append(document.createTextNode(chu));
    if (phu) {
      const d = document.createElement('div');
      d.textContent = phu;
      d.style.cssText = 'font-weight:400;font-size:11px;color:#8a8078';
      th.append(d);
    }
    tr.append(th);
  }
  thead.append(tr);
  return thead;
}

/**
 * Bảng dài thì tự cuộn TRONG khung, thay vì đẩy mọi thứ dưới nó xuống sâu.
 *
 * ⚠ ĐÂY LÀ MỘT LỖI ĐO ĐƯỢC, KHÔNG PHẢI SỞ THÍCH. Bảng việc đứng NGOÀI bảng
 *   (b106, có lý do riêng ở `moBangViec()`), nên nó nằm sau dòng cuối cùng.
 *   Ba chục tài khoản là bấm dòng thứ hai rồi phải cuộn qua hai mươi tám dòng
 *   mới thấy thứ vừa mở — chủ dự án nói đúng chữ ấy 09/09/2026. Kéo bảng việc
 *   lên trên bảng thì hỏng ngược lại: bấm dòng cuối phải cuộn NGƯỢC lên.
 *
 * ⚠ Chỉ cắt khi bảng thật sự dài. Bốn dòng mà nhốt trong khung cuộn là đẻ ra
 *   một thanh cuộn thứ hai chẳng để làm gì, và trên điện thoại `62vh` chỉ đủ
 *   bốn năm dòng — cắt sớm là làm hỏng đúng màn hình chật nhất.
 *
 * @param {HTMLElement} khung  ô có `overflow-x:auto` bọc ngoài bảng
 * @param {number} soDong      số dòng sắp vẽ
 */
export function capChieuCao(khung, soDong) {
  if (soDong <= 8) return;
  khung.style.overflowY = 'auto';
  khung.style.maxHeight = '62vh';
}

/**
 * Dòng tiêu đề DÍNH khi khung cuộn dọc — không có nó thì cuộn xuống dòng thứ
 * mười lăm là mất tên cột, và cột *Vai trò* với cột *Tin cậy* trông giống hệt
 * nhau khi cùng ghi "Có".
 *
 * `box-shadow` thay cho `border-bottom`: `border-collapse:collapse` gộp đường
 * viền vào hàng, và đường viền đã gộp thì **cuộn đi mất** cùng thân bảng.
 */
export const CSS_DAU_BANG =
  'position:sticky;top:0;z-index:1;background:#faf8f5;' +
  'box-shadow:inset 0 -1px 0 #e6e0d8;';

/**
 * Một dòng của bảng, cộng một cái nút mở bảng việc **ở dưới bảng** (`bo`).
 *
 * ⚠ Vì sao bảng việc đứng riêng chứ không nhồi năm nút vào cột cuối: ba trong
 *   năm việc cần một ô nhập hoặc một ô chọn đứng cạnh nút. Nhồi hết vào một ô
 *   bảng thì trên điện thoại chúng xếp chồng thành một cột hẹp không đọc nổi,
 *   còn trên máy tính thì bảng phình ngang tới mức phải cuộn mới thấy cột đầu.
 */
/**
 * Một dòng `tree_members` ở đúng MỘT trong ba trạng thái. Hàm này là chỗ
 * DUY NHẤT trả lời câu ấy, và đó là chủ ý.
 *
 * ⚠ **Phân biệt bằng `moiLuc`, KHÔNG bằng người mời.** `moi_boi` khai
 *   `on delete set null` (`14` mục 1), nên xoá tài khoản người mời sẽ biến một
 *   lời mời thành thứ trông y hệt đơn xin vào.
 *
 * ⚠ Trước b110c hàm này KHÔNG tồn tại ở tấm lọc cây, vì `ds_thanh_vien()`
 *   không trả `moiLuc` — nên màn hình vẽ chữ *"Đang chờ"* cộng nút *"Xét đơn"*
 *   lên cả lời mời, và bấm vào là đưa người ta vào cây khi họ chưa đồng ý.
 *   Đó đúng là lỗ hổng chủ dự án báo 10/09/2026. Máy chủ nay từ chối
 *   (`luoc-do/18`), và chỗ này thôi mời người ta bấm.
 *
 * @returns {'thanhvien'|'duocmoi'|'donxin'}
 */
export function trangThaiDong(t) {
  if (t.daDuyet) return 'thanhvien';
  return t.moiLuc ? 'duocmoi' : 'donxin';
}

function veMotDong(ruot, t, phien, cay, duocDoiQuyen, napLai, bo) {
  const trangThai = trangThaiDong(t);
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #f2eee8;vertical-align:top';

  // — Tài khoản: email + huy hiệu —
  const oTk = o('', 'padding:10px;color:#2a2622;word-break:break-all');
  const email = document.createElement('span');
  email.textContent = t.email || '(không rõ email)';
  email.style.fontWeight = '600';
  oTk.append(email);
  if (t.laChuCay) oTk.append(huyHieu('Chủ gia phả', true));
  if (t.laChinhToi) oTk.append(huyHieu('Bạn', false));
  // ⚠ HAI CÂU KHÁC HẲN NHAU, và bản trước gộp chúng thành một chữ "Đang chờ".
  //   *Đơn xin vào* chờ NGƯỜI QUẢN TRỊ bấm; *lời mời* chờ CHÍNH NGƯỜI ẤY bấm.
  //   Gộp lại là mời người quản trị đi làm hộ việc của người kia.
  if (trangThai === 'duocmoi') oTk.append(huyHieu('Được mời — chờ họ bấm Nhận', false));
  else if (trangThai === 'donxin') oTk.append(huyHieu('Đơn chờ duyệt', false));

  const oMa = o(t.maNgan || '—',
    'padding:10px;font-family:ui-monospace,monospace;font-size:12px;color:#5b4533');

  // ⚠ Ô này BẤM ĐƯỢC từ b111b — mở thẳng hàng *Mã người trong sơ đồ* của cây
  //   đang xét. Xem `veONguoiGan()`.
  const oNguoi = veONguoiGan(t, {
    css: 'padding:10px',
    // Đúng ba lý do khoá của nút *Sửa quyền* ngay cột cuối, và cùng nguồn:
    // `gan_nguoi_cho_thanh_vien()` từ chối cả ba (`18` mục 4).
    khoa: !duocDoiQuyen || t.laChinhToi || trangThai === 'duocmoi',
    lyDo: t.laChinhToi
      ? 'Dòng của chính bạn — không ai tự gắn mã người cho mình được. Tự gắn '
        + 'mình vào một cụ tổ là mở quyền sửa cho cả một nhánh.'
      : trangThai === 'duocmoi'
      ? 'Đây là lời mời đang chờ chính người ấy bấm Nhận. Gắn mã người hộ họ '
        + 'là bỏ mất chữ ký thứ hai.'
      : 'Bạn xem được danh sách này nhưng không đổi được quyền của ai.',
  });
  if (oNguoi.dat) {
    bo.oVai.push(oNguoi.dat);
    oNguoi.nut.addEventListener('click', () => moOChung(
      bo, 'gan:' + t.userId, oNguoi.dat,
      tieuDeGan(t, cay),
      () => bangGanNguoi(t, cay, duocDoiQuyen, napLai)));
  }

  // `nowrap`: tên vai dài nhất là *Thành viên họ tộc*, và để nó gãy làm hai
  //   dòng thì cột Vai trò cao gấp đôi mọi cột khác trên cùng một hàng — đo
  //   bằng ảnh chụp 1280px, không đoán.
  const oVai = veOVaiTro(t, phien, cay, duocDoiQuyen, napLai, bo);

  const oTin = o(t.tinCay ? 'Có' : 'Không',
    'padding:10px;text-align:center;color:' + (t.tinCay ? '#2f6b3a' : '#8a8078'));

  // Người đang chờ thì mốc đáng đọc là lúc họ NỘP ĐƠN, không phải lúc dòng
  // được tạo — hai mốc ấy trùng nhau hôm nay, nhưng câu chữ phải nói đúng cái
  // người duyệt cần biết.
  const oLuc = o(gioVietNam(t.daDuyet ? t.thamGia : (t.xinLuc || t.thamGia)),
    'padding:10px;color:#6a625a;font-size:12px;white-space:nowrap');

  const oThao = o('', 'padding:10px;text-align:right');

  tr.append(oTk, oMa, oNguoi.td, oVai, oTin, oLuc, oThao);
  ruot.append(tr);

  // — Nút mở bảng việc —
  //
  // ⚠ **Khoá sẵn, không mở ra rồi mới giải thích.** Chủ dự án bảo thẳng
  //   08/09/2026, sau khi bấm vào dòng của chính mình: *"nút chuyển sang màu
  //   xám và ở trạng thái khoá, không cần cho bấm vào rồi đi giải thích."*
  //
  //   Hai trường hợp khoá, và cả hai đều là *mọi việc bên trong đều bị máy chủ
  //   từ chối*, chứ không phải *phần lớn*:
  //     · dòng của chính mình — cả năm cửa của `luoc-do/13` đều từ chối khi
  //       người bị tác động là người đang gọi;
  //     · người chỉ xem được (`quan_tri` được phong) — không cửa nào mở.
  //
  //   Lý do vì sao khoá đã nằm sẵn trên màn hình mà không phải bấm gì: huy
  //   hiệu *Bạn* ngay cột đầu, và câu nhắc `veNhacChiXem()` ở đầu khu. `title`
  //   chỉ là lớp thứ hai cho người dùng chuột — đừng để nó thành chỗ DUY NHẤT
  //   nói ra lý do, điện thoại không có chuột.
  // ⚠ Dòng LỜI MỜI không có nút nào, đúng luật đã ghi ở `veDongVaiTro()` và
  //   ở `THIET-KE-QUAN-TRI.md` khu 2: *"Lời mời không có nút — nhận hộ người
  //   khác là bỏ mất chữ ký thứ hai"*. Bản trước áp luật ấy cho bảng sâu của
  //   tấm *Toàn hệ thống* mà quên ba tấm lọc cây, và chính chỗ quên ấy là
  //   đường chủ dự án đi vào khi báo lỗ hổng 10/09/2026.
  const chuDong = t.daDuyet ? 'Sửa quyền' : 'Xét đơn';
  const khoaMo = !duocDoiQuyen || t.laChinhToi || trangThai === 'duocmoi';

  const bMo = nut(trangThai === 'duocmoi' ? 'Chờ họ bấm Nhận' : chuDong, false);
  bMo.dataset.chuDong = chuDong;

  if (khoaMo) {
    bMo.disabled = true;
    bMo.style.opacity = '0.45';
    bMo.style.cursor = 'not-allowed';
    bMo.title = t.laChinhToi
      ? 'Dòng của chính bạn — không ai đặt quyền cho chính mình được.'
      : trangThai === 'duocmoi'
      ? 'Đây là lời mời đang chờ chính người ấy bấm Nhận. Không ai nhận hộ '
        + 'được — vào gia phả luôn cần hai chữ ký. Muốn đổi ý thì gỡ lời mời '
        + 'rồi mời lại.'
      : 'Bạn xem được danh sách này nhưng không đổi được quyền của ai.';
  } else {
    // ⚠ `cay` là ĐỐI TƯỢNG, không phải `treeId` trần, và từ b111b nó tới đây
    //   từ **ô chọn cây** chứ không từ `phien` — cùng một lý do: chuỗi uuid
    //   không tự nói nó là cây nào, nên bảng việc mở ra sẽ phải tự bịa một cái
    //   nhãn, và bản 0.7.0 đã bịa đúng như thế. Xem khối đầu file.
    bo.nut.push(bMo);
    bMo.addEventListener('click', () => moBangViec(bo, t, bMo, cay, () => (t.daDuyet
      ? veBangViec(t, cay, duocDoiQuyen, napLai)
      : veXetDon(t, cay, duocDoiQuyen, napLai))));
  }

  oThao.append(bMo);
}

/**
 * Ô **Vai trò** của ba tấm lọc cây — bấm được, mở bảng *gia phả · vai trò*.
 *
 * ⚠ Ở tấm lọc này ô ấy trông như thừa: cả bảng vốn nói về ĐÚNG MỘT cây, nên
 *   bảng mở ra thường chỉ có một dòng. Nó vẫn có việc thật, và là việc chủ dự
 *   án đặt tên 09/09/2026: *"bấm vào cũng xuất hiện bảng tương tự"*. Quyền ở
 *   app này gắn với TỪNG cây, nên một chỗ bấm duy nhất — cùng hình, cùng chỗ,
 *   ở cả hai tấm lọc — dạy đúng một câu: **vai trò không phải thuộc tính của
 *   tài khoản.** Với Quản trị hệ thống thì bảng ấy dài ra thật.
 */
function veOVaiTro(t, phien, cay, duocDoiQuyen, napLai, bo) {
  // ⚠ Người được mời mang vai `xem` ở cột `role` cho tới lúc họ bấm Nhận —
  //   đó là cả điểm của cột `moi_vai` (`14` mục 4). Hiện đúng vai họ SẼ nhận,
  //   đừng hiện `xem`: người quản trị đọc "Khách" rồi đi đổi vai, và cú đổi
  //   vai ấy chính là đường vào lỗ hổng 10/09/2026.
  const vaiHien = trangThaiDong(t) === 'duocmoi' ? (t.moiVai || t.vai) : t.vai;
  const chu = vaiTroBangChu(vaiHien) || vaiHien || '';
  const td = o('', 'padding:0;white-space:nowrap');

  if (!chu) {
    const d = document.createElement('div');
    d.textContent = '—';
    d.style.cssText = 'padding:10px;color:#a89f94';
    td.append(d);
    return td;
  }

  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = chu;
  b.style.cssText =
    'display:block;width:100%;padding:10px;border:0;background:none;' +
    'font:inherit;color:inherit;text-align:left;cursor:pointer;border-radius:8px';
  td.append(b);

  const dat = (dangMo) => {
    b.style.background = dangMo ? '#f2ece2' : 'none';
    b.style.boxShadow = dangMo ? 'inset 0 0 0 1px #c9c0b4' : 'none';
  };
  bo.oVai.push(dat);

  b.addEventListener('click', () => moBangVaiTro(bo, t, dat, () =>
    veBangVaiTroTungCay(t, {
      // Chỉ Quản trị hệ thống đọc được cả sổ — hàng rào nằm trong thân
      // `ds_cay_cua_tai_khoan()`, xem khối chú thích của hàm ấy.
      docCaSo: Boolean(phien.laQuanTriHeThong),
      cayNay: {
        // ⚠ Cây ĐANG XÉT, không phải cây đang mở — từ b111b hai thứ ấy tách
        //   nhau ra được. Bảng một dòng này nói về đúng cái bảng bên trên nó,
        //   nên nó phải lấy cùng một nguồn; đọc `phien` ở đây là để bảng con
        //   nói về cây A trong khi bảng cha nói về cây B.
        treeId: cay.treeId,
        ten: cay.ten || '',
        maCay: cay.maCay || '',
        vai: t.vai,
        daDuyet: t.daDuyet,
        // ⚠ Từ b110c `ds_thanh_vien()` TRẢ `moi_luc` (`luoc-do/18` mục 6b),
        //   nên chỗ này thôi phải đoán. Bản trước truyền `null` cứng và nói
        //   thật rằng nó không biết — đúng, nhưng cái không biết ấy chính là
        //   thứ làm màn hình vẽ nút *Xét đơn* lên một dòng lời mời.
        moiLuc: t.moiLuc,
        nhanCho: t.moiLuc ? 'Được mời' : 'Đơn chờ duyệt',
        moiVai: t.moiVai || '',
        maNguoi: t.maNguoi,
        tenNguoi: t.tenNguoi,
        tinCay: t.tinCay,
        laChuCay: t.laChuCay,
      },
      duocDoiQuyen,
      napLai,
    })));

  return td;
}

/**
 * Mở bảng việc của một dòng, **bên NGOÀI bảng** — không phải một `<tr>` ẩn
 * ngay dưới dòng vừa bấm.
 *
 * ⚠ Bản đầu của b106 làm đúng kiểu `<tr>` ẩn ấy, và nó **hỏng thật**: ô mở
 *   rộng nằm TRONG cái bảng `min-width:860px`, nên việc thứ ba trở đi rơi ra
 *   ngoài mép màn hình. Chủ dự án sửa được vai (việc 1) và gỡ được tài khoản
 *   (việc 4) rồi vẫn hỏi *"bật tắt tin cậy ở đâu?"* — việc 3 nằm ngay đó, chỉ
 *   là không nhìn thấy. Đứng ngoài bảng thì bảng việc rộng đúng bằng khu.
 *
 * ⚠ Loại lỗi này bất biến văn bản không bắt được: 121 phép của
 *   `kiem-trang-quan-tri.mjs` đều xanh trong khi màn hình không dùng được.
 *   Phải nhìn bằng mắt, hoặc chụp ảnh ở đúng bề ngang thật.
 */
function moBangViec(bo, t, bMo, cay, veNoiDung) {
  const dangMoDongNay = bo.dangMo === 'viec:' + t.userId;

  dongHet(bo);

  if (dangMoDongNay) {
    bo.dangMo = null;
    return;
  }

  bo.dangMo = 'viec:' + t.userId;
  bMo.textContent = 'Thu lại';

  const hop = document.createElement('div');
  hop.style.cssText =
    'margin-top:14px;padding:0 14px 14px;border:1px solid #e6e0d8;' +
    'border-radius:10px;background:#faf8f5';

  // Bảng việc nay đứng tách khỏi dòng nên nó phải TỰ NÓI nó của ai — cột
  // *Mã tài khoản* có mặt ở đây đúng vì lý do ấy: hai người trùng tên trong
  // họ là chuyện thường.
  const tieu = document.createElement('div');
  tieu.style.cssText = 'padding:12px 0 0;font-size:13px;color:#2a2622';
  tieu.append(document.createTextNode(t.daDuyet ? 'Sửa quyền của ' : 'Xét đơn của '));

  const ai = document.createElement('span');
  ai.textContent = t.email || '(không rõ email)';
  ai.style.cssText = 'font-weight:600;word-break:break-all';
  tieu.append(ai);

  if (t.maNgan) {
    const m = document.createElement('span');
    m.textContent = ' · ' + t.maNgan;
    m.style.cssText = 'font-family:ui-monospace,monospace;font-size:12px;color:#5b4533';
    tieu.append(m);
  }

  // ⚠ TÊN CÂY NẰM NGAY TRONG TIÊU ĐỀ, không chỉ ở dòng nhắc bên dưới. Đây là
  //   chỗ chủ dự án chỉ ra 09/09/2026: bảng việc này đứng TÁCH khỏi dòng vừa
  //   bấm (b106), nên nó đã phải tự nói nó của AI — và từ nay phải tự nói nó
  //   ở CÂY NÀO nữa, vì một tài khoản có chân ở nhiều cây và năm việc bên
  //   dưới chỉ đụng đúng một cây.
  if (cay && (cay.ten || cay.maCay)) {
    tieu.append(document.createTextNode(' — trong '));
    const c = document.createElement('span');
    c.textContent = cumCay(cay);
    c.style.fontWeight = '600';
    tieu.append(c);
  }

  hop.append(tieu, veNoiDung());
  bo.oViec.append(hop);

  // `nearest` chứ không phải `start`: cuộn vừa đủ để thấy, không hất cái bảng
  // ra khỏi màn hình — người đang so mấy dòng với nhau thì cần thấy cả hai.
  hop.scrollIntoView({ block: 'nearest' });
}

/**
 * Đóng mọi thứ đang mở ở chỗ đứng chung, kể cả khi sắp mở dòng khác.
 *
 * Trả **mọi** nút về chữ cũ là cách duy nhất để không còn cái nút nào ghi
 * "Thu lại" mà chẳng thu cái gì. `nut` và `oVai` phải đi riêng: nút thao tác
 * đổi chữ trên mình, ô Vai trò chỉ đổi nền — gán đè chữ lên ô Vai trò là xoá
 * mất huy hiệu bên trong nó.
 */
function dongHet(bo) {
  bo.oViec.innerHTML = '';
  for (const n of bo.nut) n.textContent = n.dataset.chuDong;
  for (const dat of bo.oVai || []) dat(false);
}

/** Cùng một chỗ đứng, cùng luật "mỗi lúc một thứ" của `moBangViec()`. */
function moBangVaiTro(bo, t, dat, veNoiDung) {
  const tieu = document.createElement('div');
  tieu.style.cssText = 'padding:12px 0 0;font-size:13px;color:#2a2622';
  tieu.append(document.createTextNode('Vai trò của '));

  const ai = document.createElement('span');
  ai.textContent = t.email || '(không rõ email)';
  ai.style.cssText = 'font-weight:600;word-break:break-all';
  tieu.append(ai, document.createTextNode(' ở từng gia phả'));

  moOChung(bo, 'vai:' + t.userId, dat, tieu, veNoiDung);
}

/**
 * Mở một ô bảng thành một khung ở chỗ đứng chung dưới bảng.
 *
 * ⚠ **MỘT CHỖ ĐỨNG, MỖI LÚC MỘT THỨ.** `moBangViec()` · `moBangVaiTro()` và
 *   ô *Người được gắn* đều đổ vào `bo.oViec`, nên mở cái này là đóng cái kia.
 *   Đó là chủ ý, không phải tiết kiệm mã: hai bảng cùng mở là hai ô nhập mã
 *   người nằm cạnh nhau không nói rõ ô nào của ai.
 *
 * @param {object} bo         `{oViec, dangMo, nut, oVai}`
 * @param {string} khoa       khoá nhận diện thứ đang mở, ví dụ `gan:<userId>`
 * @param {Function} dat      `dat(true|false)` — tô nền chỗ vừa bấm
 * @param {HTMLElement} tieu  dòng tiêu đề của khung
 */
function moOChung(bo, khoa, dat, tieu, veNoiDung) {
  const dangMoCaiNay = bo.dangMo === khoa;

  dongHet(bo);

  if (dangMoCaiNay) {
    bo.dangMo = null;
    return;
  }

  bo.dangMo = khoa;
  dat(true);

  const hop = document.createElement('div');
  hop.style.cssText =
    'margin-top:14px;padding:0 14px 14px;border:1px solid #e6e0d8;' +
    'border-radius:10px;background:#faf8f5';

  hop.append(tieu, veNoiDung());
  bo.oViec.append(hop);

  // `nearest` chứ không phải `start`: cuộn vừa đủ để thấy, không hất cái bảng
  // ra khỏi màn hình.
  hop.scrollIntoView({ block: 'nearest' });
}

// ============================================================
// Ô "NGƯỜI ĐƯỢC GẮN" — bấm được ở CẢ HAI tấm lọc (b111b)
// ============================================================
//
// ⚠ VÌ SAO CỘT NÀY PHẢI BẤM ĐƯỢC, chứ không để yên như một ô chữ:
//
// Gắn mã người là việc người quản trị làm nhiều nhất sau khi duyệt một tài
// khoản, và tới b111b nó chỉ có đúng MỘT đường vào — nút *Sửa quyền* ở cột
// cuối cùng. Cột cuối là cột đầu tiên rơi khỏi mép màn hình khi màn hình hẹp
// (bài học b106 và b109), nên trên điện thoại việc hay làm nhất nằm ở chỗ khó
// tới nhất. Ô này là đường thứ hai, và nó nằm ngay trên chính dữ liệu nó sửa.
//
// ⚠ **KHÔNG mở cả bảng năm việc.** Nó mở đúng một hàng — *Mã người trong sơ
//   đồ*. Bấm vào cột A mà ra bảng làm được cả năm chuyện là mời người ta đổi
//   vai trong lúc họ đang định gắn mã người.
//
// ⚠ Khoá thì **mờ sẵn kèm lý do**, không mở ra rồi mới giải thích — luật chủ
//   dự án chốt 08/09/2026. Và ba lý do khoá phải TRÙNG với ba lý do
//   `gan_nguoi_cho_thanh_vien()` từ chối (`18` mục 4), không được rộng hơn hay
//   hẹp hơn: rộng hơn là khoá tay người có quyền, hẹp hơn là mời người ta bấm
//   một thứ chắc chắn bị từ chối.

/**
 * Ô bảng **Người được gắn**: mã người + tên, hoặc chữ *"chưa gắn"*.
 *
 * @param {object} t  cần `maNguoi`, `tenNguoi`
 * @param {{css:string, khoa:boolean, lyDo:string}} opt
 * @returns {{td:HTMLElement, nut:HTMLElement|null, dat:Function|null}}
 *          `nut`/`dat` là `null` khi ô bị khoá — nơi gọi kiểm `dat` để biết
 *          có phải gắn bộ nghe hay không.
 */
export function veONguoiGan(t, opt) {
  const td = o('', 'padding:0');

  // Trường trống thì KHÔNG vẽ chữ thay thế kiểu "Không rõ" — `CLAUDE.md` mục
  // 7. Ở đây *"chưa gắn"* là một trạng thái hợp lệ và có thật, nên nó được nói
  // ra; nhưng TÊN người thì chỉ hiện khi có.
  const ruot = () => {
    const d = document.createDocumentFragment();
    if (t.maNguoi) {
      const ma = document.createElement('span');
      ma.textContent = t.maNguoi;
      ma.style.cssText =
        'font-family:ui-monospace,monospace;font-size:12px;color:#5b4533';
      d.append(ma);
      if (t.tenNguoi && t.tenNguoi !== t.maNguoi) {
        const ten = document.createElement('div');
        ten.textContent = t.tenNguoi;
        ten.style.cssText = 'font-size:12px;color:#6a625a';
        d.append(ten);
      }
    } else {
      const c = document.createElement('span');
      c.textContent = 'chưa gắn';
      c.style.cssText = 'color:#8a8078;font-style:italic';
      d.append(c);
    }
    return d;
  };

  if (opt.khoa) {
    const d = document.createElement('div');
    d.style.cssText = opt.css + ';color:#2a2622';
    d.append(ruot());
    // `title` là lớp thứ HAI, không phải chỗ duy nhất nói ra lý do — điện
    // thoại không có chuột. Lý do chính đã nằm ở huy hiệu cột đầu và ở câu
    // nhắc đầu khu.
    if (opt.lyDo) d.title = opt.lyDo;
    td.append(d);
    return { td, nut: null, dat: null };
  }

  // ⚠ Một `<button>` THẬT, không phải `<div>` gắn `onclick` — nó phải đi được
  //   bằng phím Tab và bấm được bằng Enter. Cùng lý do đã ghi ở ô *Tài khoản*
  //   của `khu-tai-khoan-he-thong.js`.
  const b = document.createElement('button');
  b.type = 'button';
  b.style.cssText =
    'display:block;width:100%;border:0;background:none;font:inherit;' +
    'color:inherit;text-align:left;cursor:pointer;border-radius:8px;' + opt.css;
  b.append(ruot());
  td.append(b);

  const dat = (dangMo) => {
    b.style.background = dangMo ? '#f2ece2' : 'none';
    b.style.boxShadow = dangMo ? 'inset 0 0 0 1px #c9c0b4' : 'none';
  };

  return { td, nut: b, dat };
}

/** Dòng tiêu đề của khung gắn mã người — nói rõ CỦA AI và Ở CÂY NÀO. */
export function tieuDeGan(t, cay) {
  const tieu = document.createElement('div');
  tieu.style.cssText = 'padding:12px 0 0;font-size:13px;color:#2a2622';
  tieu.append(document.createTextNode('Mã người của '));

  const ai = document.createElement('span');
  ai.textContent = t.email || '(không rõ email)';
  ai.style.cssText = 'font-weight:600;word-break:break-all';
  tieu.append(ai);

  if (cay && (cay.ten || cay.maCay)) {
    tieu.append(document.createTextNode(' — trong '));
    const c = document.createElement('span');
    c.textContent = cumCay(cay);
    c.style.fontWeight = '600';
    tieu.append(c);
  }
  return tieu;
}

/**
 * Khung mở ra khi bấm ô *Người được gắn*: **đúng một việc**, không phải cả năm.
 *
 * Dùng lại nguyên `viecGanNguoi()` — không đẻ ra bản thứ hai của cùng một
 * việc. Hai bản thì có ngày lệch nhau, và bản lệch sẽ là bản ít người bấm hơn.
 */
export function bangGanNguoi(t, cay, duocDoiQuyen, napLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'display:flex;flex-direction:column;gap:12px;padding:12px 0 2px;' +
    'border-top:1px solid #ece6dd';

  // Dòng "cây nào" đứng TRƯỚC mọi thứ khác — cùng lý do như `veBangViec()`:
  // một tài khoản có chân ở nhiều cây, và mã người là khái niệm theo TỪNG cây.
  hop.append(dongCay(cay));
  hop.append(viecGanNguoi(t, cay, duocDoiQuyen, napLai));
  return hop;
}

// ============================================================
// Bảng VAI TRÒ THEO TỪNG CÂY — dùng chung cho cả hai tấm lọc
// ============================================================

/**
 * Một bảng hai cột: **một bên gia phả, một bên vai trò ở gia phả ấy**. Bấm
 * tiếp vào ô vai trò là mở đúng bảng sửa quyền của cây ấy, ngay dưới bảng.
 *
 * ⚠ VÌ SAO NÓ Ở FILE NÀY, không phải ở `khu-tai-khoan-he-thong.js` — nơi câu
 *   hỏi *"một người đứng ở đâu trong từng cây"* vốn thuộc về. File kia
 *   `import` file này (để dùng lại năm việc của `13`), nên chiều ngược lại chỉ
 *   đi được bằng `import()` ĐỘNG. Bắt một cú bấm chờ tải cả mô-đun sổ đăng ký
 *   để vẽ một bảng hai cột là đắt vô cớ, và với người KHÔNG phải Quản trị hệ
 *   thống thì đó còn là tải đúng cái mô-đun họ không có cửa dùng. Đặt ở đây
 *   thì cả hai bên `import` tĩnh theo đúng chiều đã có.
 *
 * ⚠ HAI NGƯỜI GỌI, HAI NGUỒN DỮ LIỆU — và khác nhau vì HÀNG RÀO MÁY CHỦ, chứ
 *   không phải vì tiện:
 *     · Quản trị hệ thống → `dsCayCuaTaiKhoan()`, trả MỌI cây.
 *     · Chủ cây / quản trị gia phả → đúng MỘT dòng, dựng từ dữ liệu đã có sẵn
 *       trong tay về cây đang mở, không gọi máy chủ thêm lần nào.
 *   Không phải bản rút gọn cho gọn: `ds_cay_cua_tai_khoan()` có
 *   `where public.la_quan_tri_he_thong()` ngay trong thân (`14` mục 9, `15`
 *   mục 5b) — chủ cây A gọi nó sẽ nhận về mảng RỖNG, vì họ không có quyền biết
 *   người kia còn chân ở cây B nào. Gọi rồi vẽ ra "chưa dính cây nào" là bịa
 *   một câu trả lời từ một lời từ chối.
 *
 * @param {object} t     tài khoản — cần `userId`, `email`, `maNgan`, `laChinhToi`
 * @param {object} opt   `{docCaSo, cayNay, duocDoiQuyen, napLai}`
 */
export function veBangVaiTroTungCay(t, opt) {
  const hop = document.createElement('div');
  hop.style.cssText = 'padding:12px 0 2px;border-top:1px solid #ece6dd';

  const than = document.createElement('div');
  than.textContent = 'Đang đọc…';
  than.style.cssText = 'color:#8a8078;font-size:12px';
  hop.append(than);

  const ve = (ds) => {
    than.innerHTML = '';
    than.style.cssText = '';

    if (!ds.length) {
      const d = document.createElement('div');
      d.textContent = 'Tài khoản này chưa dính tới gia phả nào.';
      d.style.cssText = 'font-size:12px;color:#8a8078';
      than.append(d);
      return;
    }

    const oSau = document.createElement('div');
    const bo = { oSau, dangMo: null, nut: [] };
    than.append(veBangHaiCot(ds, t, opt, bo), oSau);

    // Nói ra CHỈ KHI nó đúng: người không phải Quản trị hệ thống đang nhìn
    // đúng một cây, và họ phải biết đó không phải cả câu trả lời.
    if (!opt.docCaSo) {
      const n = document.createElement('div');
      n.textContent =
        'Chỉ có gia phả đang mở. Vai trò của tài khoản này ở những gia phả ' +
        'khác thuộc về chủ các cây ấy — chỉ Quản trị hệ thống xem được cả sổ.';
      n.style.cssText =
        'margin-top:8px;font-size:12px;color:#8a8078;line-height:1.5;max-width:640px';
      than.append(n);
    }
  };

  if (opt.docCaSo) {
    dsCayCuaTaiKhoan(t.userId).then((kq) => {
      if (!kq.ok) {
        than.innerHTML = '';
        than.style.cssText = '';
        than.append(veLoi(kq.loi || 'Không đọc được danh sách gia phả.', opt.napLai));
        return;
      }
      ve(kq.ds || []);
    });
  } else {
    ve(opt.cayNay ? [opt.cayNay] : []);
  }

  return hop;
}

function veBangHaiCot(ds, t, opt, bo) {
  const khung = document.createElement('div');
  khung.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';
  capChieuCao(khung, ds.length);

  const bang = document.createElement('table');
  // `max-width` chứ không `min-width`: hai cột mà kéo hết bề ngang khu thì cột
  // Vai trò trôi tít sang phải, cách tên cây cả gang tay — mắt phải bắc cầu
  // qua khoảng trống để ghép đúng hàng.
  bang.style.cssText =
    'width:100%;max-width:560px;border-collapse:collapse;font-size:13px;' +
    'background:#fffdf9;border:1px solid #e6e0d8;border-radius:10px';

  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #e6e0d8';
  for (const [chu, phu] of [['Gia phả', ''], ['Vai trò', 'bấm để sửa']]) {
    const th = document.createElement('th');
    th.style.cssText =
      'padding:8px 10px;text-align:left;font-weight:600;color:#6a625a;' +
      'font-size:12px;white-space:nowrap;' + CSS_DAU_BANG;
    th.append(document.createTextNode(chu));
    if (phu) {
      const d = document.createElement('div');
      d.textContent = phu;
      d.style.cssText = 'font-weight:400;font-size:11px;color:#8a8078';
      th.append(d);
    }
    tr.append(th);
  }
  thead.append(tr);
  bang.append(thead);

  const ruot = document.createElement('tbody');
  for (const c of ds) veDongVaiTro(ruot, c, t, opt, bo);
  bang.append(ruot);

  khung.append(bang);
  return khung;
}

function veDongVaiTro(ruot, c, t, opt, bo) {
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #f2eee8;vertical-align:top';

  // BA trạng thái, phân biệt bằng `moiLuc` chứ KHÔNG bằng người mời: `moi_boi`
  // khai `on delete set null`, nên xoá tài khoản người mời sẽ biến một lời mời
  // thành thứ trông y hệt đơn xin vào (`14` mục 1).
  const trangThai = c.daDuyet ? 'thanhvien' : (c.moiLuc ? 'duocmoi' : 'donxin');
  // Người được mời mang vai `xem` ở cột `role` cho tới lúc nhận — đó là cả
  // điểm của cột `moi_vai`. Hiện đúng vai họ SẼ nhận, đừng hiện `xem`.
  const vaiHien = trangThai === 'duocmoi' ? (c.moiVai || c.vai) : c.vai;

  const oCay = o('', 'padding:9px 10px;color:#2a2622');
  const ten = document.createElement('div');
  ten.textContent = c.ten || '(không tên)';
  ten.style.fontWeight = '600';
  oCay.append(ten);
  if (c.maCay) {
    const m = document.createElement('div');
    m.textContent = c.maCay;
    m.style.cssText = 'font-family:ui-monospace,monospace;font-size:11px;color:#5b4533';
    oCay.append(m);
  }

  const noiDung = () => {
    const d = document.createDocumentFragment();
    const v = document.createElement('span');
    v.textContent = vaiTroBangChu(vaiHien) || vaiHien || '—';
    d.append(v);
    if (c.laChuCay) d.append(huyHieu('Chủ gia phả', true));
    if (trangThai === 'duocmoi') d.append(huyHieu('Chờ họ bấm Nhận', false));
    else if (trangThai === 'donxin') d.append(huyHieu(c.nhanCho || 'Đơn chờ duyệt', false));
    return d;
  };

  const oVai = o('', 'padding:0');

  // ⚠ Lời mời KHÔNG bấm được, và đó là luật chứ không phải thiếu sót: sửa
  //   quyền hộ một lời mời chưa nhận là bỏ mất chữ ký thứ hai — đúng thứ `14`
  //   dựng cả cột `moi_vai` riêng để giữ.
  const khoa = trangThai === 'duocmoi' || t.laChinhToi || !opt.duocDoiQuyen;

  if (khoa) {
    const d = document.createElement('div');
    d.style.cssText = 'padding:9px 10px;white-space:nowrap';
    d.append(noiDung());
    if (t.laChinhToi) d.title = 'Tài khoản của chính bạn — không ai đặt quyền cho chính mình được.';
    oVai.append(d);
    tr.append(oCay, oVai);
    ruot.append(tr);
    return;
  }

  const b = document.createElement('button');
  b.type = 'button';
  b.style.cssText =
    'display:block;width:100%;padding:9px 10px;border:0;background:none;' +
    'font:inherit;color:inherit;text-align:left;cursor:pointer;' +
    'border-radius:8px;white-space:nowrap';
  b.append(noiDung());
  oVai.append(b);

  tr.append(oCay, oVai);
  ruot.append(tr);

  const dat = (dangMo) => {
    b.style.background = dangMo ? '#f2ece2' : 'none';
    b.style.boxShadow = dangMo ? 'inset 0 0 0 1px #c9c0b4' : 'none';
  };
  bo.nut.push(dat);

  // Hình dạng `t` mà năm việc của `13` chờ: quyền gắn vào TÀI KHOẢN, còn vai
  // và mã người thì theo TỪNG CÂY. Ghép hai nguồn ấy lại đúng ở đây.
  const tGhep = {
    userId: t.userId,
    email: t.email,
    maNgan: t.maNgan,
    laChinhToi: t.laChinhToi,
    vai: c.vai,
    daDuyet: c.daDuyet,
    maNguoi: c.maNguoi,
    tenNguoi: c.tenNguoi,
    tinCay: c.tinCay,
    laChuCay: c.laChuCay,
  };

  // `c` đã mang sẵn `treeId` · `ten` · `maCay` — đúng hình dạng `cay` mà năm
  // việc chờ. Không dựng lại, chỉ cắt đúng ba trường để nơi nhận không lỡ tay
  // đọc thêm thứ gì của dòng này.
  const cay = { treeId: c.treeId, ten: c.ten || '', maCay: c.maCay || '' };

  b.addEventListener('click', () => moSuaVai(bo, c, dat, () => (c.daDuyet
    ? veBangViec(tGhep, cay, opt.duocDoiQuyen, opt.napLai)
    : veXetDon(tGhep, cay, opt.duocDoiQuyen, opt.napLai))));
}

/** Cùng luật "một chỗ đứng chung, mỗi lúc một dòng" của `moBangViec()`. */
function moSuaVai(bo, c, dat, veNoiDung) {
  const dangMoDongNay = bo.dangMo === c.treeId;

  bo.oSau.innerHTML = '';
  for (const d of bo.nut) d(false);

  if (dangMoDongNay) {
    bo.dangMo = null;
    return;
  }

  bo.dangMo = c.treeId;
  dat(true);

  const hop = document.createElement('div');
  hop.style.cssText =
    'margin-top:12px;padding:0 12px 12px;border:1px solid #e6e0d8;' +
    'border-radius:9px;background:#fffdf9';

  const tieu = document.createElement('div');
  tieu.textContent = (c.daDuyet ? 'Sửa quyền trong ' : 'Xét đơn vào ') +
    nhanCay({ ten: c.ten, maCay: c.maCay });
  tieu.style.cssText = 'padding:10px 0 0;font-size:13px;color:#2a2622;font-weight:600';

  hop.append(tieu, veNoiDung());
  bo.oSau.append(hop);

  hop.scrollIntoView({ block: 'nearest' });
}

// ============================================================
// Bảng việc của một tài khoản ĐÃ DUYỆT — năm việc, đều hai nhịp
// ============================================================

/**
 * Năm việc đổi quyền của một tài khoản **trong đúng một cây**.
 *
 * ⚠ THAM SỐ THỨ HAI LÀ MỘT ĐỐI TƯỢNG, KHÔNG PHẢI MỘT CHUỖI `treeId` — đổi ở
 *   b110b, và đổi có chủ ý. Chừng nào nó còn là `treeId` trần thì mọi nơi gọi
 *   đều đứng trước cùng một cám dỗ: truyền cây đang mở rồi để màn hình tự bịa
 *   một cái nhãn. Bản 0.7.0 bịa đúng như thế (*"Gia phả đang mở"*). Đổi hình
 *   dạng tham số thì **lời gọi thiếu tên cây không viết ra được nữa**.
 *
 * @param {object} t    tài khoản — `userId`, `email`, `vai`, `maNguoi`…
 * @param {{treeId:string, ten:string, maCay:string}} cay  cây bị tác động
 * @param {boolean} duocDoiQuyen  máy chủ trả lời `co_the_quan_tri()`
 * @param {Function} napLai
 */
export function veBangViec(t, cay, duocDoiQuyen, napLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'display:flex;flex-direction:column;gap:12px;padding:12px 0 2px;' +
    'border-top:1px solid #ece6dd';

  // ⚠ Dòng "cây nào" đứng TRƯỚC mọi thứ khác, kể cả trước câu giải thích vì
  //   sao nút mờ. Năm việc dưới đây đều chỉ đụng đúng cây này, và một tài
  //   khoản có chân ở nhiều cây — đọc nhầm dòng là đổi quyền nhầm chỗ.
  hop.append(dongCay(cay));

  // Vì sao nút mờ — nói MỘT lần ở đầu bảng việc, thay vì nhắc lại năm lần.
  const vuong = lyDoVuong(t, duocDoiQuyen);
  if (vuong) hop.append(dongNhac(vuong));

  hop.append(viecDoiVai(t, cay, duocDoiQuyen, napLai));
  hop.append(viecGanNguoi(t, cay, duocDoiQuyen, napLai));
  hop.append(viecTinCay(t, cay, duocDoiQuyen, napLai));
  hop.append(viecGo(t, cay, duocDoiQuyen, napLai));
  hop.append(viecBanGiao(t, cay, duocDoiQuyen, napLai));
  return hop;
}

/**
 * Một câu giải thích vì sao dòng này bị khoá tay. Ba lý do, và chúng không
 * loại trừ nhau — chọn lý do NẶNG NHẤT để nói, vì nói cả ba thì người đọc
 * phải tự xếp hạng.
 */
function lyDoVuong(t, duocDoiQuyen) {
  if (!duocDoiQuyen) {
    return 'Bạn không đổi được quyền trong gia phả này — việc ấy thuộc chủ gia phả ' +
           'và Quản trị hệ thống.';
  }
  if (t.laChinhToi) {
    return 'Đây là dòng của chính bạn. Không ai đặt quyền cho chính mình được — ' +
           'luật này không có ngoại lệ, kể cả Quản trị hệ thống, và nó gác cả ' +
           'việc tự gắn mã người lẫn việc tự bật ghi thẳng. Nhờ một quản trị khác làm.';
  }
  if (t.vai === 'sao_luu') {
    return 'Đây là tài khoản sao lưu tự động. Đổi vai hay gỡ nó là bản sao lưu ' +
           'đêm ra file rỗng mà không báo lỗi.';
  }
  return '';
}

/** Đổi vai — trần là `quan_tri`, và chủ cây thì không hạ vai được. */
export function viecDoiVai(t, cay, duocDoiQuyen, napLai) {
  const treeId = cay.treeId;
  const khoa = !duocDoiQuyen || t.laChinhToi || t.laChuCay || t.vai === 'sao_luu';

  const chon = document.createElement('select');
  chon.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;min-width:190px';
  for (const v of VAI_CAP_DUOC) {
    const m = document.createElement('option');
    m.value = v;
    m.textContent = vaiTroBangChu(v);
    chon.append(m);
  }
  chon.value = VAI_CAP_DUOC.includes(t.vai) ? t.vai : 'xem';
  chon.disabled = khoa;

  const bao = dongBao();
  const b = nutHaiNhip('Đổi vai', 'Bấm lần nữa để đổi vai', khoa, async () => {
    const kq = await doiVaiThanhVien(treeId, t.userId, chon.value);
    return xong(kq, bao, napLai, 'Không đổi được vai trò.');
  });

  // ⚠ Câu nào cũng gọi TÊN CÂY. Vai trò ở app này không phải thuộc tính của
  //   tài khoản — cùng một người có thể là Quản trị gia phả cây A và Khách ở
  //   cây B. Viết "vai trò của người này" trống không là nói sai chuyện ấy.
  const ghi = (t.laChuCay && duocDoiQuyen && !t.laChinhToi
    ? 'Chủ gia phả không hạ vai được. Muốn đổi chủ thì dùng Bàn giao gia phả bên dưới.'
    : 'Quyền cao nhất cấp được cho tài khoản khác là Quản trị gia phả.')
    + ' Vai này chỉ có hiệu lực trong ' + cumCay(cay) +
      ', không đụng tới cây nào khác.';

  // ⚠ NHÃN KHÔNG LẶP LẠI TÊN CÂY, câu giải thích thì có. Bảng việc đã có
  //   `dongCay()` đứng đầu và tiêu đề khung cũng gọi tên cây; nhắc lần thứ ba
  //   ngay trên nhãn là làm loãng đúng cái nó định nhấn. Ba việc *lùi lại
  //   được* dùng nhãn ngắn; hai việc **Gỡ** và **Bàn giao** thì giữ tên cây
  //   trong cả nhãn lẫn chữ trên nút — chúng không lùi lại được.
  return hangViec('Vai trò', [chon, b], ghi, bao);
}

/** Gắn / đổi / gỡ mã người. Để trống là GỠ, và đó là lựa chọn hợp lệ. */
export function viecGanNguoi(t, cay, duocDoiQuyen, napLai) {
  const treeId = cay.treeId;
  const khoa = !duocDoiQuyen || t.laChinhToi;

  const oNhap = document.createElement('input');
  oNhap.type = 'text';
  oNhap.value = t.maNguoi || '';
  oNhap.placeholder = 'gõ tên hoặc mã — để trống là gỡ gắn';
  oNhap.disabled = khoa;
  oNhap.autocomplete = 'off';
  oNhap.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;font-family:ui-monospace,monospace;min-width:190px';

  // ⚠ Ô GỢI Ý QUAN TRỌNG NHẤT TRONG BA Ô, vì hậu quả gõ nhầm ở đây nặng nhất:
  //   mã người quyết `pham_vi_sua()`, nên gắn nhầm là mở quyền sửa cho cả một
  //   nhánh — và máy chủ KHÔNG kiểm mã có thật hay không, gõ sai thì gắn treo
  //   mà không báo lỗi. Dòng gợi ý nói sẵn người ấy đã gắn cho ai chưa.
  //
  //   Không gỡ bộ nghe ở đây: hàng việc này sống cùng bảng, và mỗi lần
  //   `napLai()` là cả khu vẽ lại từ đầu nên `oNhap` bị vứt cùng lúc. Khác
  //   `veFormMoi()` — chỗ ấy đóng/mở form nhiều lần trên cùng một trang.
  if (!khoa) {
    ganGoiY(oNhap, {
      tim: async (chuoi) => (await timNguoiTrongCay(treeId, chuoi)).ds,
      ve: dongNguoi,
      giaTri: (m) => m.maNguoi,
    });
  }

  const bao = dongBao();
  const b = nutHaiNhip('Lưu mã người', 'Bấm lần nữa để lưu', khoa, async () => {
    const kq = await ganNguoiChoThanhVien(treeId, t.userId, oNhap.value);
    return xong(kq, bao, napLai, 'Không gắn được mã người.');
  });

  return hangViec('Mã người trong sơ đồ', [oNhap, b],
    'Mã này quyết định người ấy sửa được những ai TRONG ' + cumCay(cay) +
    ': bản thân, tổ tiên đường thẳng, toàn bộ con cháu, cộng vợ/chồng. ' +
    'Để trống thì chỉ xem. Một mã chỉ gắn cho MỘT tài khoản.', bao);
}

/** Bật / tắt **tin cậy** — cửa leo thang sắc nhất, nên nói thẳng nó làm gì. */
export function viecTinCay(t, cay, duocDoiQuyen, napLai) {
  const treeId = cay.treeId;
  const khoa = !duocDoiQuyen || t.laChinhToi;
  const bat = !t.tinCay;

  const bao = dongBao();
  const b = nutHaiNhip(
    bat ? 'Bật tin cậy' : 'Tắt tin cậy',
    'Bấm lần nữa để ' + (bat ? 'bật' : 'tắt'),
    khoa,
    async () => {
      const kq = await datTinCayThanhVien(treeId, t.userId, bat);
      return xong(kq, bao, napLai, 'Không đổi được chế độ tin cậy.');
    });

  return hangViec('Tin cậy', [b],
    'Đang ' + (t.tinCay ? 'BẬT' : 'TẮT') + '. Bật là cho người này ghi thẳng ' +
    'vào ' + cumCay(cay) + ': mỗi lần họ bấm Lưu là thành chính thức ' +
    'ngay, không qua hàng chờ kiểm duyệt. Cây khác không đổi theo.',
    bao);
}

/** Gỡ khỏi gia phả — chỉ xoá dòng trong cây, không xoá tài khoản. */
export function viecGo(t, cay, duocDoiQuyen, napLai) {
  const treeId = cay.treeId;
  const khoa = !duocDoiQuyen || t.laChinhToi || t.laChuCay || t.vai === 'sao_luu';

  const bao = dongBao();
  const b = nutHaiNhip('Gỡ khỏi ' + nhanCay(cay), 'Bấm lần nữa để gỡ', khoa,
    async () => {
      const kq = await goThanhVien(treeId, t.userId);
      return xong(kq, bao, napLai, 'Không gỡ được tài khoản.');
    }, true);

  return hangViec('Gỡ khỏi ' + cumCay(cay), [b],
    'Gỡ xong người này đọc 0 dòng của ' + cumCay(cay) + '. Tài khoản ' +
    'của họ vẫn còn, vẫn đăng nhập được, vẫn xin vào lại được, và chân của họ ' +
    'ở những gia phả KHÁC không suy suyển.', bao);
}

/**
 * Bàn giao gia phả. Việc **không có nút hoàn tác** — sau khi giao, người vừa
 * giao không giao ngược lại được; chỉ chủ mới (hoặc Quản trị hệ thống) làm
 * được. Nên câu cảnh báo phải đứng TRƯỚC nhịp thứ hai, không đứng sau.
 */
export function viecBanGiao(t, cay, duocDoiQuyen, napLai) {
  const treeId = cay.treeId;
  const khoa = !duocDoiQuyen || t.laChinhToi || t.laChuCay || t.vai === 'sao_luu';

  const bao = dongBao();
  const b = nutHaiNhip('Bàn giao ' + nhanCay(cay) + ' cho tài khoản này',
    'Bấm lần nữa để bàn giao — không hoàn tác được', khoa, async () => {
      const kq = await doiChuCay(treeId, t.userId);
      return xong(kq, bao, napLai, 'Không bàn giao được gia phả.');
    }, true);

  return hangViec('Bàn giao ' + cumCay(cay), [b],
    'Người này thành chủ ' + cumCay(cay) + ' và nhận toàn bộ quyền ' +
    'đổi quyền TRONG cây ấy. Bạn ở lại làm Quản trị gia phả — vẫn sửa và duyệt ' +
    'nội dung, nhưng thôi đổi được quyền của ai. Không có đường quay lại từ ' +
    'phía bạn. Những gia phả khác bạn đang làm chủ không đổi gì.', bao);
}

// ============================================================
// Xét đơn của một tài khoản ĐANG CHỜ
// ============================================================

/**
 * Duyệt đơn thuộc nhóm **đổi quyền**, không thuộc "duyệt nội dung": nhận một
 * người vào cây là cấp quyền ĐỌC. Nên nó gác bằng đúng `coTheQuanTri()` như
 * năm việc trên, chứ không bằng `coTheKiemDuyet()`.
 */
export function veXetDon(t, cay, duocDoiQuyen, napLai) {
  const treeId = cay.treeId;
  const hop = document.createElement('div');
  hop.style.cssText =
    'display:flex;flex-direction:column;gap:12px;padding:12px 0 2px;' +
    'border-top:1px solid #ece6dd';

  // Duyệt một lá đơn là CẤP QUYỀN ĐỌC cho đúng một cây. Nói tên cây ấy ra
  // trước, cùng lý do như `veBangViec()`.
  hop.append(dongCay(cay));

  if (t.loiNhan) {
    const ln = document.createElement('div');
    ln.textContent = '“' + t.loiNhan + '”';
    ln.style.cssText =
      'font-size:13px;line-height:1.55;color:#2a2622;padding:9px 11px;' +
      'background:#fffdf9;border:1px solid #ece6dd;border-radius:8px';
    hop.append(ln);
  }

  if (!duocDoiQuyen) {
    hop.append(dongNhac(
      'Bạn không duyệt được đơn xin vào gia phả — nhận một người vào cây là ' +
      'cấp quyền đọc, việc ấy thuộc chủ gia phả và Quản trị hệ thống.'));
  }

  const oNhap = document.createElement('input');
  oNhap.type = 'text';
  oNhap.placeholder = 'P0012 — để trống thì người này chỉ xem';
  oNhap.disabled = !duocDoiQuyen;
  oNhap.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;font-family:ui-monospace,monospace;min-width:220px';

  const bao = dongBao();

  const bDuyet = nutHaiNhip('Duyệt', 'Bấm lần nữa để duyệt', !duocDoiQuyen,
    async () => {
      const kq = await duyetThanhVien(treeId, t.email, oNhap.value.trim());
      return xong(kq, bao, napLai, 'Không duyệt được đơn.');
    });

  const bTuChoi = nutHaiNhip('Từ chối', 'Bấm lần nữa để từ chối', !duocDoiQuyen,
    async () => {
      const kq = await tuChoiThanhVien(treeId, t.email);
      return xong(kq, bao, napLai, 'Không từ chối được đơn.');
    }, true);

  hop.append(hangViec('Mã người trong sơ đồ', [oNhap],
    'Duyệt mà không gắn mã thì người ấy vào xem được nhưng không sửa được gì ' +
    '— để trống là một lựa chọn hợp lệ, không phải thiếu sót.', null));
  hop.append(hangViec('Quyết định — cho vào ' + cumCay(cay),
    [bDuyet, bTuChoi],
    'Duyệt là cấp quyền ĐỌC ' + cumCay(cay) + ', và chỉ cây ấy. ' +
    'Từ chối là XOÁ đơn, không phải đánh dấu. Người ấy nộp lại được.', bao));
  return hop;
}

// ============================================================
// GỌI TÊN CÂY — ba mẩu nhỏ, một luật
// ============================================================
//
// ⚠ **Luật b110b, chủ dự án chốt 09/09/2026:** không màn hình nào được ngầm
//   định "cây đang hoạt động". Mọi chỗ gán quyền phải nói rõ *người nào · cây
//   nào · quyền gì*. Ngoại lệ duy nhất là cờ **Quản trị hệ thống** và cờ
//   **Quyền dựng gia phả** — hai cờ ấy ở tầng TÀI KHOẢN, không thuộc cây nào,
//   nên hỏi "cây nào" ở đó là một câu hỏi không có câu trả lời. Cả hai nằm ở
//   `khu-tai-khoan-he-thong.js`.

/**
 * Cắt từ một `phien` ra đúng ba trường mô tả cây đang mở.
 *
 * ⚠ Trả một đối tượng chứ không trả `phien` nguyên: nơi nhận chỉ được biết
 *   cây nào, không được thò tay vào `phien.vaiTro` để tự dựng phân quyền
 *   trong trình duyệt (`THIET-KE-QUAN-TRI.md` mục 7 điều 5).
 */
export function cayCuaPhien(phien) {
  return {
    treeId: (phien && phien.treeId) || null,
    ten: (phien && phien.tenCay) || '',
    maCay: (phien && phien.maCay) || '',
  };
}

/**
 * Tên cây để in ra: `Nguyễn Trọng Bắc · NTBK7R3`.
 *
 * ⚠ Thiếu tên thì rơi về MÃ cây, thiếu cả hai mới đành nói *"(gia phả không
 *   tên)"*. Trường trống không vẽ chữ thay thế — `CLAUDE.md` mục 7 — nhưng ở
 *   đây câu chữ ôm lấy nó (*"trong gia phả …"*) nên bỏ trắng là để lại một
 *   câu cụt. Mã cây luôn có thật, nên ca cuối gần như không xảy ra.
 */
export function nhanCay(cay) {
  if (!cay) return '(gia phả không tên)';
  const phan = [];
  if (cay.ten) phan.push(cay.ten);
  if (cay.maCay) phan.push(cay.maCay);
  return phan.length ? phan.join(' · ') : '(gia phả không tên)';
}

/**
 * Cụm *"gia phả X"* — nhưng KHÔNG thêm chữ ấy khi tên cây đã tự mang nó.
 *
 * ⚠ Không phải chuyện chải chuốt. Tên thật của cây đầu tiên trên máy chủ là
 *   *"Gia phả họ Nguyễn Trọng Bắc"*, nên câu ghép thẳng đọc ra thành *"gỡ
 *   khỏi gia phả Gia phả họ Nguyễn Trọng Bắc"*. Ảnh chụp b110b bắt được đúng
 *   chỗ ấy, sáu lần trong một bảng việc.
 */
export function cumCay(cay) {
  const nhan = nhanCay(cay);
  return /^gia\s*phả/i.test(nhan) ? nhan : 'gia phả ' + nhan;
}

/**
 * Dòng **cây nào** đứng đầu mỗi bảng việc. Nền đậm hơn `dongNhac()` một chút
 * vì nó không phải một lời nhắc — nó là chỗ neo của mọi nút bên dưới.
 */
export function dongCay(cay) {
  const d = document.createElement('div');
  d.style.cssText =
    'padding:9px 11px;border:1px solid #d8cfc0;border-radius:8px;' +
    'background:#f3ece2;color:#2a2622;font-size:12px;line-height:1.5';

  const nhan = document.createElement('span');
  nhan.textContent = 'Gia phả bị tác động: ';
  nhan.style.color = '#6a625a';

  const ten = document.createElement('span');
  ten.textContent = nhanCay(cay);
  ten.style.fontWeight = '600';

  d.append(nhan, ten);
  return d;
}

// ============================================================
// Mấy mẩu dùng chung
// ============================================================

/**
 * Một việc: nhãn · mấy thứ để bấm · một câu giải thích · chỗ báo kết quả.
 *
 * Câu giải thích KHÔNG phải trang trí. Cả năm việc ở đây đều đổi thứ người
 * dùng không nhìn thấy hậu quả ngay — quyền đọc, phạm vi sửa, đường đi qua
 * kiểm duyệt — nên chỗ duy nhất nói ra hậu quả là dòng chữ này.
 */
export function hangViec(nhanChu, dsPhanTu, giaiThich, bao) {
  const hop = document.createElement('div');

  const nhan = document.createElement('div');
  nhan.textContent = nhanChu;
  nhan.style.cssText = 'font-size:12px;font-weight:600;color:#6a625a;margin-bottom:5px';
  hop.append(nhan);

  const hang = document.createElement('div');
  hang.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center';
  for (const p of dsPhanTu) hang.append(p);
  hop.append(hang);

  if (giaiThich) {
    const g = document.createElement('div');
    g.textContent = giaiThich;
    g.style.cssText =
      'margin-top:5px;font-size:12px;line-height:1.5;color:#8a8078;max-width:720px';
    hop.append(g);
  }
  if (bao) hop.append(bao);
  return hop;
}

/**
 * Nút hai nhịp: bấm lần đầu đổi chữ và đổi màu, bấm lần nữa mới chạy.
 *
 * ⚠ **Không `confirm()`**, và không phải vì sở thích: trên điện thoại hộp
 *   thoại ấy hiện ra ở một chỗ chẳng liên quan gì tới nút vừa bấm. App này
 *   không dùng nó ở đâu cả.
 *
 * ⚠ Nhịp một tự huỷ sau 6 giây. Một cái nút đứng ở trạng thái *"bấm lần nữa"*
 *   vô thời hạn là cái bẫy: người ta cuộn đi, quay lại, bấm một cái tưởng là
 *   nhịp đầu — và việc chạy luôn.
 */
export function nutHaiNhip(chuDau, chuHoi, khoa, chay, nguyHiem) {
  const b = nut(chuDau, false);
  if (nguyHiem) b.style.color = '#8a3a2a';
  b.disabled = !!khoa;
  if (khoa) {
    b.style.opacity = '0.45';
    b.style.cursor = 'not-allowed';
  }

  let daHoi = false;
  let hen = 0;

  const veDauLai = () => {
    daHoi = false;
    b.textContent = chuDau;
    b.style.borderColor = '#dcd5cb';
    b.style.fontWeight = '400';
    if (hen) { clearTimeout(hen); hen = 0; }
  };

  b.addEventListener('click', async () => {
    if (b.disabled) return;
    if (!daHoi) {
      daHoi = true;
      b.textContent = chuHoi;
      b.style.borderColor = '#c98f80';
      b.style.fontWeight = '600';
      hen = setTimeout(veDauLai, 6000);
      return;
    }
    if (hen) { clearTimeout(hen); hen = 0; }
    b.disabled = true;
    b.textContent = 'Đang chạy…';
    const xongRoi = await chay();
    if (xongRoi) return;          // đã gọi napLai — cả bảng vẽ lại, nút này đi theo
    b.disabled = false;
    veDauLai();
  });

  return b;
}

/**
 * Xử lý một câu trả lời của máy chủ.
 *
 * ⚠ **Máy chủ từ chối thì in NGUYÊN VĂN câu của nó**, đừng chế câu khác: chỉ
 *   máy chủ mới biết đây là "chủ gia phả không hạ vai được" hay "mã ấy đã gắn
 *   cho tài khoản khác rồi". Cùng luật đã ghi ở `tuChoiThayDoi()` trong `sb.js`.
 *
 * @returns {boolean} `true` khi đã gọi `napLai()` — nơi gọi thôi động vào nút.
 */
export function xong(kq, bao, napLai, cauMacDinh) {
  if (kq && kq.ok) { napLai(); return true; }
  bao.textContent = (kq && kq.loi) || cauMacDinh;
  bao.style.color = '#a83220';
  return false;
}

export function dongBao() {
  const d = document.createElement('div');
  d.style.cssText = 'margin-top:6px;font-size:12px;line-height:1.45;min-height:0';
  return d;
}

export function dongNhac(chu) {
  const d = document.createElement('div');
  d.textContent = chu;
  d.style.cssText =
    'padding:9px 11px;border:1px solid #e2d5bf;border-radius:8px;' +
    'background:#faf6ee;color:#7a5a28;font-size:12px;line-height:1.5';
  return d;
}

export function o(chu, css) {
  const td = document.createElement('td');
  if (chu) td.textContent = chu;
  td.style.cssText = css;
  return td;
}

export function huyHieu(chu, dam) {
  const s = document.createElement('span');
  s.textContent = chu;
  // ⚠ `inline-block`, KHÔNG `inline`. Một `span` inline có `padding` mà bị
  //   xuống dòng thì nền của nó tràn lên đè chữ ở dòng trên — không phải lỗi
  //   trình duyệt, đó là cách hộp inline vỡ qua hai dòng. Ảnh chụp b109b bắt
  //   được: huy hiệu *Quản trị hệ thống* đè lên đúng địa chỉ email bên cạnh,
  //   và chỉ lộ ra khi ô hẹp lại đủ để huy hiệu phải xuống dòng.
  s.style.cssText =
    'display:inline-block;margin-left:7px;font-size:11px;font-weight:500;' +
    'padding:2px 7px;border-radius:10px;' +
    'white-space:nowrap;' +
    (dam ? 'background:#2a2622;color:#fffdf9'
         : 'background:#f3ece1;color:#7a5a28;border:1px solid #e2d5bf');
  return s;
}

export function nut(chu, dam) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = chu;
  b.style.cssText =
    'padding:6px 12px;border-radius:6px;font:inherit;font-size:12px;cursor:pointer;' +
    // `nowrap`: cột thao tác hẹp, và không có dòng này thì *Sửa quyền* gãy
    // thành hai dòng — ảnh chụp 1280px của b106 bắt đúng chỗ ấy.
    'touch-action:manipulation;white-space:nowrap;' +
    (dam ? 'border:1px solid #2a2622;background:#2a2622;color:#fffdf9'
         : 'border:1px solid #dcd5cb;background:#fffdf9;color:#2a2622');
  return b;
}

export function veLoi(chu, thuLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'padding:14px 16px;border:1px solid #f1c0b9;background:#fdf2f0;' +
    'border-radius:9px;color:#8a3a2a';

  const p = document.createElement('div');
  p.textContent = chu;

  const b = nut('Thử lại', false);
  b.style.cssText += ';margin-top:8px';
  b.addEventListener('click', thuLai);

  hop.append(p, b);
  return hop;
}

/** `dd/mm/yyyy HH:mm` — khuôn thời gian duy nhất của dự án. */
export function gioVietNam(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const hai = (n) => String(n).padStart(2, '0');
  return hai(d.getDate()) + '/' + hai(d.getMonth() + 1) + '/' + d.getFullYear() +
         ' ' + hai(d.getHours()) + ':' + hai(d.getMinutes());
}
