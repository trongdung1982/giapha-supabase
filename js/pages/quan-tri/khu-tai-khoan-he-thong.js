// ============================================================
// giapha-supabase · js/pages/quan-tri/khu-tai-khoan-he-thong.js
// Vai trò  : Tấm lọc *Toàn hệ thống* của khu Tài khoản — SỔ ĐĂNG KÝ của cả
//            phần mềm, và bảng sâu theo từng cây của một tài khoản.
// Lớp      : pages — được phép gọi mọi lớp dưới
// Phụ thuộc: services/sb, config, pages/quan-tri/khu-thanh-vien
// Phiên bản: 0.6.0 · Cập nhật: 10/09/2026 (b111b)
//            0.6.0 cột **Người được gắn**, chủ dự án đặt hàng 10/09/2026.
//              ⚠ CÂU HỎI NÀY XUYÊN CÂY, và đó là cả cái khó của nó. Mã người
//                là khái niệm THEO TỪNG CÂY — một tài khoản có `person_id`
//                khác nhau ở mỗi cây họ có mặt — nên một ô bảng ở tấm *Toàn hệ
//                thống* không có cách nào là chỗ SỬA: sửa thì sửa cho cây nào?
//                Đường đã có sẵn hình mẫu ngay cạnh: cột *Vai trò* cũng là một
//                dòng tóm tắt xuyên cây, và nó **bấm ra bảng theo từng cây**
//                rồi mới sửa ở đó. Cột này đi y hệt — bấm mở bảng *các cây tài
//                khoản này dính tới*, và ô *Người được gắn* TRONG bảng ấy mới
//                là chỗ sửa, vì tới đó mới có tên cây đứng cạnh.
//              ⚠ Nội dung cột lấy từ hai trường mới của `ds_tai_khoan_he_thong()`
//                (`luoc-do/20-nguoi-duoc-gan.sql`): `nguoiGan` **trần 3 phần
//                tử** và `soCayGan` là số đầy đủ. Vẽ theo `nguoiGan.length` là
//                nói dối ở đúng tài khoản dính nhiều cây nhất.
//              Cộng: ô *Người được gắn* trong bảng con theo từng cây nay bấm
//              được, mở đúng hàng *Mã người trong sơ đồ* của cây ấy — trước
//              bản này nó là ô chữ chết và đường duy nhất đi vòng qua nút
//              *Sửa quyền* ở cột cuối.
//            0.5.0 chủ dự án chốt 09/09/2026, hai việc rời nhau nhưng cùng
//            một câu: *"luôn luôn xác định người nào, cây nào, quyền gì"*.
//              ① **Cột *Tạo gia phả*** — một ô tích, bật/tắt cờ
//                 `tai_khoan.duoc_tao_cay` bằng một cú bấm. Nguyên văn chủ dự
//                 án: *"quyền tạo cây cần tách riêng khỏi quyền quản trị gia
//                 phả… muốn gán quyền cho ai thì tích vào là xong, đây là đặc
//                 quyền của tài khoản quản trị hệ thống"*. Cửa máy chủ là
//                 `dat_duoc_tao_cay()` ở `luoc-do/17-quyen-tao-cay.sql`, đo
//                 bằng `ban-thu-sql/do-b110b.mjs` — 29 phép, 3 kiểm chứng
//                 ngược. Cùng ô tích ấy hiện lại trong bảng sâu, nơi có chỗ
//                 nói ra hậu quả.
//              ② **Ô chọn gia phả ở form Mời thôi chọn sẵn cây đầu danh
//                 sách.** Nó mở ra ở mục trống *"— chọn gia phả —"*, và nút
//                 Gửi khoá cho tới khi người ta chọn. Chọn sẵn là đúng thứ
//                 "ngầm định cây đang hoạt động" mà chủ dự án bác bỏ: bảng
//                 này liệt kê tài khoản của CẢ hệ thống, mời nhầm cây ở đây
//                 là cấp quyền đọc một gia phả không liên quan.
//              Cộng: hai lời gọi `veBangViec()`/`veXetDon()` đổi theo chữ ký
//              mới của `khu-thanh-vien.js` 0.8.0 — tham số thứ hai nay là cả
//              đối tượng cây, không phải `treeId` trần.
//            0.4.0 cột **Quyền** đổi tên thành **Vai trò** (đúng chữ cột cùng
//            nghĩa ở ba tấm lọc kia), và bấm nó nay mở một bảng HAI CỘT *gia
//            phả · vai trò* — `veBangVaiTroTungCay()` bên `khu-thanh-vien.js`
//            — chứ không mở cả bảng sâu như ô Tài khoản. Bấm tiếp vào vai trò
//            là vào thẳng bảng sửa quyền của cây ấy. Cộng: bảng dài quá tám
//            dòng thì tự cuộn trong khung, tiêu đề cột dính lại.
//            0.3.0 chủ dự án bấm thử bản 0.2.0 và đặt hai việc: ① thêm cột
//            **Quyền** (vai cao nhất, bấm được để xem từng cây) · ② **bỏ cột
//            nút riêng**, gộp chỗ bấm vào chính ô Tài khoản, kèm chú thích
//            nhỏ dưới tiêu đề cột. `moDong()` vì thế đổi cách đánh dấu dòng
//            đang mở: `datTrangThai(bool)` thay cho gán đè `textContent` —
//            ô Tài khoản nay chứa tên, email và huy hiệu, gán đè là xoá sạch.
//            0.2.0 ô *mã người* của form Mời nay có gợi ý (`o-goi-y.js`), và
//            0.2.0 ô *mã người* của form Mời nay có gợi ý (`o-goi-y.js`), và
//            thêm việc **Họ tên** — chỗ DUY NHẤT điền tên cho một tài khoản.
//            Tên hiện chồng trên email trong ô Tài khoản, KHÔNG thành cột mới
//            (bảng này đã phải hạ `min-width` xuống 880 ở b109).
// ============================================================
//
// ═══ FILE NÀY TRẢ LỜI MỘT CÂU KHÁC HẲN FILE BÊN CẠNH ═══
//
// `khu-thanh-vien.js` hỏi: *ai có quyền gì trong CÂY ĐANG MỞ*. Nó bắt đầu từ
// một cây và đi ra người.
//
// File này hỏi ngược lại: *phần mềm này có những tài khoản nào, và mỗi tài
// khoản đứng ở đâu trong TỪNG cây*. Nó bắt đầu từ một người và đi ra cây. Nên
// nó liệt kê cả người đăng ký rồi bỏ đấy — người không có chân ở cây nào —
// thứ mà `ds_thanh_vien()` theo định nghĩa không bao giờ thấy.
//
// Hai câu hỏi ấy chỉ có MỘT hạng người hỏi được câu thứ hai: **Quản trị hệ
// thống**, cờ `tai_khoan.la_quan_tri_he_thong`. Hàng rào nằm ở máy chủ —
// `ds_tai_khoan_he_thong()` có `where public.la_quan_tri_he_thong()` ngay
// trong câu truy vấn, nên người khác gọi được nó và nhận về mảng rỗng.
//
// ═══ KHÔNG HÀM VIỆC NÀO VIẾT MỚI ═══
//
// Năm việc của bảng sâu — đổi vai · gắn mã người · tin cậy · gỡ · bàn giao —
// là **đúng năm hàm** `khu-thanh-vien.js` đã có, gọi lại nguyên vẹn. b109 chỉ
// đổi tham số của chúng từ cả `phien` thành một `treeId`, vì chúng vốn chỉ
// đọc đúng trường ấy. Đó là lý do bước này nhỏ, và cũng là lý do nó KHÔNG
// được đẻ ra bản thứ hai của năm việc ấy: hai bản thì có ngày lệch nhau, và
// bản lệch sẽ là bản ít người bấm hơn — tức bản ở đây.
//
// ⚠ `duocDoiQuyen` truyền xuống năm việc ấy là **true** cứng, và đó không
//   phải cẩu thả: `co_the_quan_tri()` của `13` mục 4 trả `true` cho Quản trị
//   hệ thống ở MỌI cây, mà chỉ Quản trị hệ thống mở được tấm lọc này. Hỏi lại
//   từng cây là N vòng mạng để nhận N lần cùng một câu trả lời. Và câu ấy dù
//   sao cũng chỉ để mờ nút cho lịch sự — hàng rào thật nằm trong thân bảy hàm
//   SQL của `13`, `THIET-KE-QUAN-TRI.md` mục 5 câu cuối.
//
// ═══ ⚠ RANH GIỚI VẪN CHƯA BỊ PHÁ — kể cả sau b109b ═══
//
// `THIET-KE-QUAN-TRI.md` mục 1: *"`QuanTri.html` cố ý KHÔNG nạp cây gia phả"*.
// File này giữ nguyên ranh giới ấy. Ô *mã người* ở form Mời nay CÓ gợi ý
// (b109b), nhưng nó đi bằng `timNguoiTrongCay()` — một hàm `security definer`
// **lọc ở máy chủ và trả tối đa 10 dòng**. Trang này vẫn không giữ một danh
// sách người nào trong bộ nhớ.
//
// ⚠ Ngày nào có ai thấy mình sắp viết `layCayGiaPha()` ở đây "cho tiện lọc"
//   thì dừng lại và đọc lại mục 1. Cây thật có 681 người, và lý do số 2 khiến
//   trang này là trang riêng biến mất ngay lúc nó nạp cây.
//
// ⚠ **Không `alert()`, không `confirm()`.** Cả app không dùng ở đâu cả.

import {
  dsTaiKhoanHeThong, dsCayCuaTaiKhoan, datQuanTriHeThong, xoaTaiKhoan,
  moiVaoCay, layDanhSachGiaPha, timNguoiTrongCay, datHoTenTaiKhoan,
  datDuocTaoCay,
} from '../../services/sb.js';
import { vaiTroBangChu } from '../../config.js';
import {
  veBangViec, veXetDon, veBangVaiTroTungCay,
  veONguoiGan, tieuDeGan, bangGanNguoi,
  hangViec, nutHaiNhip, xong, dongBao, dongNhac, nhanCay,
  o, huyHieu, nut, veLoi, gioVietNam, capChieuCao, CSS_DAU_BANG,
} from './khu-thanh-vien.js';
import { ganGoiY, dongNguoi } from './o-goi-y.js';

/** Trần quyền mời được — đúng trần của `moi_vao_cay()` ở `14` mục 2. */
const VAI_MOI_DUOC = ['quan_tri', 'sua', 'xem'];

/**
 * Ô tích *Tạo gia phả* của một tài khoản hiện ở HAI CHỖ — cột trong bảng, và
 * một hàng trong bảng sâu. Bản đồ này giữ chúng nói cùng một câu.
 *
 * ⚠ Vì sao không đơn giản gọi `napLai()` sau mỗi cú tích, như năm việc kia
 *   làm: chủ dự án đặt hàng đúng chữ *"tích vào là xong"*. Vẽ lại cả khu sau
 *   một cú tích là cuộn màn hình về đầu và đóng bảng sâu đang mở — người đang
 *   cấp quyền cho ba người liền phải mở lại ba lần. Nên ô tích tự cập nhật
 *   tại chỗ, và giá phải trả là hai bản vẽ của cùng một cờ có thể lệch nhau —
 *   bản đồ này trả đúng cái giá ấy.
 *
 * Khoá là `userId`; dọn sạch mỗi lần vẽ lại khu (`mountToanHeThong`).
 */
const dongBoTaoCay = new Map();

// ============================================================
// Cửa vào
// ============================================================

/**
 * Vẽ tấm lọc *Toàn hệ thống* vào `than` (hàng tấm lọc đã có sẵn ở trên).
 *
 * @param {HTMLElement} than
 * @param {Function} napLai vẽ lại cả khu — dùng sau mỗi việc đã đổi dữ liệu
 */
export async function mountToanHeThong(than, napLai) {
  // Vẽ lại từ đầu thì mọi ô tích cũ đi theo DOM cũ — giữ lại là giữ một danh
  // sách hàm gọi vào những nút không còn trên màn hình.
  dongBoTaoCay.clear();

  // Hai câu hỏi đi cùng lượt: sổ tài khoản, và danh sách cây cho ô chọn ở
  // form Mời. Chúng không phụ thuộc nhau.
  const [kq, kqCay] = await Promise.all([
    dsTaiKhoanHeThong(),
    layDanhSachGiaPha(),
  ]);

  if (!kq.ok) {
    than.append(veLoi(kq.loi || 'Không đọc được sổ tài khoản.', napLai));
    return;
  }

  const ds = kq.ds || [];

  // ⚠ Rỗng ở đây gần như luôn nghĩa là *"máy chủ không cho bạn đọc"*, không
  //   phải *"phần mềm không có tài khoản nào"* — chính bạn đang là một tài
  //   khoản. Nói đúng chuyện ấy thay vì vẽ một cái bảng trống.
  if (!ds.length) {
    const r = document.createElement('div');
    r.className = 'qt-chua-lam';
    r.textContent =
      'Máy chủ không trả về tài khoản nào. Danh sách này chỉ Quản trị hệ ' +
      'thống đọc được — nếu bạn vừa được cấp cờ ấy thì đăng xuất rồi đăng ' +
      'nhập lại một lần.';
    than.append(r);
    return;
  }

  const dsCay = (kqCay.ok ? kqCay.ds : []) || [];

  // Bảng việc đứng NGOÀI bảng — bài học b106, và ở đây nó còn sắc hơn: thứ mở
  // ra không phải năm cái nút mà là cả một bảng con.
  const oSau = document.createElement('div');
  const bo = { oSau, dangMo: null, nut: [] };

  const khung = veBang(ds, dsCay, napLai, bo);
  than.append(khung);

  // Nói ra CHỈ KHI nó đúng, và ĐO để biết nó đúng — chép cách `khu-kiem-duyet`
  // và `khu-thanh-vien` làm. Bảng này đông cột hơn cả hai.
  if (khung.scrollWidth > khung.clientWidth + 4) {
    const n = document.createElement('div');
    n.textContent =
      'Màn hình hẹp hơn bảng — kéo ngang trong bảng để thấy hết các cột.';
    n.style.cssText = 'margin-top:8px;font-size:12px;color:#8a8078;line-height:1.5';
    than.append(n);
  }

  than.append(oSau);
}

// ============================================================
// Bảng — sổ đăng ký
// ============================================================

function veBang(ds, dsCay, napLai, bo) {
  const khung = document.createElement('div');
  khung.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';
  // ⚠ Sổ đăng ký là bảng DÀI NHẤT cả trang — nó liệt kê mọi tài khoản của cả
  //   phần mềm. Không cắt chiều cao thì bảng sâu mở ra nằm sau dòng cuối cùng,
  //   và bấm dòng thứ hai của ba chục dòng là phải cuộn qua hai mươi tám dòng
  //   mới thấy thứ vừa mở. Chủ dự án nói đúng chỗ ấy 09/09/2026.
  capChieuCao(khung, ds.length);

  const bang = document.createElement('table');
  // ⚠ 880, không phải 980. Bản đầu để 980 và ảnh chụp 1280px cho thấy **cột
  //   nút Mở rơi khỏi mép** — đúng cái bẫy b106, chỉ khác chỗ: lần ấy việc thứ
  //   ba rơi ra, lần này là cả cột thao tác, ngay trên màn hình MÁY TÍNH. Khu
  //   này chỉ rộng ~925px vì thanh trái ăn mất 230px, thứ mà con số 1280 trên
  //   giấy không nói ra.
  //
  // ⚠ b110b thêm cột thứ TÁM (*Tạo gia phả*) mà **giữ nguyên 880**, có chủ ý:
  //   `min-width` là sàn, không phải trần — bảng vẫn tự nới ra theo nội dung,
  //   và câu nhắc "kéo ngang" bên dưới đã đo `scrollWidth` thật để chỉ nói
  //   khi nó đúng. Nâng sàn lên là ép một thanh cuộn ngang xuất hiện trên MỌI
  //   màn hình 1280, kể cả lúc nội dung vừa đủ chỗ. Ảnh chụp là thứ quyết
  //   định con số này, không phải phép cộng bề ngang trên giấy.
  bang.style.cssText =
    'width:100%;min-width:880px;border-collapse:collapse;font-size:13px;' +
    'background:#fffdf9;border:1px solid #e6e0d8;border-radius:10px';

  bang.append(veDauBang());

  const ruot = document.createElement('tbody');
  for (const tk of ds) veMotDong(ruot, tk, ds, dsCay, napLai, bo);
  bang.append(ruot);

  khung.append(bang);
  return khung;
}

function veDauBang() {
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #e6e0d8;background:#faf8f5';

  // ⚠ KHÔNG CÒN CỘT NÚT RIÊNG. Chủ dự án chốt 09/09/2026: *"nút mở đó tích
  //   hợp luôn vào cột tài khoản"*. Cả ô Tài khoản và ô Vai trò đều bấm được,
  //   nhưng chúng mở HAI THỨ KHÁC NHAU — nên tiêu đề cột phải nói ra, vì một ô
  //   bảng trông không giống nút, và hai chỗ bấm cạnh nhau mà không nói gì thì
  //   người ta tưởng chúng cùng một việc.
  const cot = [
    ['Tài khoản', '', 'bấm để xem/sửa chi tiết'],
    ['Mã tài khoản', ''],
    // ⚠ Gọi là **Vai trò**, không phải *Quyền* — đúng chữ của cột cùng nghĩa ở
    //   ba tấm lọc kia, chủ dự án đổi 09/09/2026. Cùng một thứ mà hai màn hình
    //   gọi hai tên là bắt người đọc tự đoán chúng có phải một không.
    ['Vai trò', '', 'cao nhất · bấm xem từng cây'],
    // ⚠ Cột XUYÊN CÂY, và chú thích phải nói ra điều ấy. Bấm nó KHÔNG sửa gì —
    //   nó mở bảng theo từng cây, vì "gắn mã người" mà không nói cây nào là
    //   một câu chưa đủ nghĩa (`THIET-KE-QUAN-TRI.md` mục 5a).
    ['Người được gắn', '', 'theo từng cây · bấm để mở'],
    // ⚠ CỘT NÀY KHÔNG HỎI CÂY NÀO, và đó là cả điểm của nó. Ba cột bên trái
    //   nói về quyền TRONG một cây; cột này là cờ của TÀI KHOẢN — bật một
    //   lần thì người ấy dựng được gia phả, chấm hết. Chủ dự án đặt hàng
    //   09/09/2026 đúng vì hai thứ ấy đang bị gộp trong đầu người dùng.
    ['Tạo gia phả', 'text-align:center', 'tích là cấp quyền'],
    ['Số cây', 'text-align:center'],
    // Ba cột chỉ đọc dưới đây là **thứ duy nhất ở cả trang này** nói được
    // "tài khoản kia có thật đang dùng phần mềm không". Email chưa xác nhận
    // cộng chưa đăng nhập lần nào là một tài khoản gõ nhầm địa chỉ — mời nó
    // vào cây bao nhiêu lần cũng không ai nhận.
    ['Xác nhận email', 'text-align:center'],
    ['Đăng ký', ''],
    ['Đăng nhập gần nhất', ''],
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

function veMotDong(ruot, tk, ds, dsCay, napLai, bo) {
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #f2eee8;vertical-align:top';

  // ⚠ HỌ TÊN ĐỨNG TRONG CÙNG Ô VỚI EMAIL, KHÔNG THÀNH CỘT RIÊNG. Bảng này
  //   đã phải hạ `min-width` xuống 880 ở b109 vì cột nút rơi khỏi mép trên
  //   màn hình 1280 — khu chỉ rộng ~925px, thanh trái ăn 230px. Thêm một cột
  //   là làm lại đúng chỗ hỏng ấy. Xếp chồng hai dòng thì không tốn bề ngang.
  // ⚠ `break-all` KHÔNG đặt ở cả ô nữa (đổi b110b). Cột này hẹp đi khi bảng
  //   có thêm cột thứ tám, và `break-all` ở mức ô thì gãy cả TÊN NGƯỜI giữa
  //   chữ — *"Nguyễn Hoàng Na / m"*. Chỉ địa chỉ email cần nó, và nó được đặt
  //   riêng cho đúng phần tử email bên dưới.
  const oTk = o('', 'padding:0;color:#2a2622');

  // ⚠ MỘT `<button>` THẬT, không phải `<div>` gắn `onclick`. Ô này là chỗ duy
  //   nhất mở được bảng sâu từ khi bỏ cột nút, nên nó phải đi được bằng phím
  //   Tab và bấm được bằng Enter như mọi nút khác. Một `div` bấm được là thứ
  //   chuột dùng được còn bàn phím thì không.
  const bMo = document.createElement('button');
  bMo.type = 'button';
  bMo.style.cssText =
    'display:block;width:100%;padding:10px;border:0;background:none;' +
    'font:inherit;color:inherit;text-align:left;cursor:pointer;' +
    'border-radius:8px';
  bMo.addEventListener('mouseenter', () => { bMo.style.background = '#f5f1ea'; });
  bMo.addEventListener('mouseleave', () => { bMo.style.background = 'none'; });

  const email = document.createElement('span');
  email.textContent = tk.email || '(không rõ email)';
  email.style.cssText = 'display:inline-block;word-break:break-all;' +
    'font-weight:' + (tk.hoTen ? '400' : '600');
  if (tk.hoTen) {
    const ten = document.createElement('div');
    // Tên người xuống dòng ở khoảng trắng, không gãy giữa chữ.
    ten.textContent = tk.hoTen;
    ten.style.cssText = 'font-weight:600;overflow-wrap:break-word';
    bMo.append(ten);
    email.style.cssText = 'display:inline-block;word-break:break-all;' +
      'font-size:12px;color:#6a625a';
  }
  bMo.append(email);
  if (tk.laQuanTriHeThong) bMo.append(huyHieu('Quản trị hệ thống', true));
  if (tk.laChinhToi) bMo.append(huyHieu('Bạn', false));
  oTk.append(bMo);

  const oMa = o(tk.maNgan || '—',
    'padding:10px;font-family:ui-monospace,monospace;font-size:12px;color:#5b4533');

  const oVaiTro = veOVaiTro(tk);
  const oGan = veOGanXuyenCay(tk);

  const oTaoCay = o('', 'padding:10px;text-align:center');
  oTaoCay.append(oTichTaoCay(tk, true));

  // Ba con số không gộp được, nên chúng không gộp: số to là chân THẬT, dòng
  // nhỏ dưới nói phần đang treo — và chỉ hiện khi khác 0, đúng `CLAUDE.md`
  // mục 7. Một dòng "0 chờ · 0 mời" nói *có việc đấy* trong khi không có.
  const oSo = o('', 'padding:10px;text-align:center;color:#2a2622');
  const so = document.createElement('div');
  so.textContent = String(tk.soCay);
  so.style.cssText = 'font-weight:600';
  oSo.append(so);
  const treo = [];
  if (tk.soCho) treo.push(tk.soCho + ' chờ');
  if (tk.soMoi) treo.push(tk.soMoi + ' mời');
  if (treo.length) {
    const d = document.createElement('div');
    d.textContent = treo.join(' · ');
    d.style.cssText = 'font-size:11px;color:#7a5a28;white-space:nowrap';
    oSo.append(d);
  }

  const oXn = o(tk.daXacNhanEmail ? 'Có' : 'Chưa',
    'padding:10px;text-align:center;color:' +
    (tk.daXacNhanEmail ? '#2f6b3a' : '#8a3a2a'));

  const oTao = o(gioVietNam(tk.taoLuc),
    'padding:10px;color:#6a625a;font-size:12px;white-space:nowrap');

  // Chưa đăng nhập lần nào là một trạng thái CÓ THẬT và đáng đọc — tài khoản
  // tạo xong bỏ đấy. Nói ra bằng chữ, đừng để nó trông giống dữ liệu thiếu.
  const oDn = o(tk.dangNhapGanNhat ? gioVietNam(tk.dangNhapGanNhat) : 'chưa lần nào',
    'padding:10px;font-size:12px;white-space:nowrap;color:' +
    (tk.dangNhapGanNhat ? '#6a625a' : '#8a8078'));
  if (!tk.dangNhapGanNhat) oDn.style.fontStyle = 'italic';

  tr.append(oTk, oMa, oVaiTro, oGan.td, oTaoCay, oSo, oXn, oTao, oDn);
  ruot.append(tr);

  // ⚠ Dòng của chính mình KHÔNG khoá ở đây, khác hẳn bảng bên `khu-thanh-vien`.
  //   Bên ấy cả năm việc đều bị máy chủ từ chối trên dòng của mình nên nút mở
  //   ra chẳng để làm gì. Ở đây thì bảng sâu vẫn có việc thật: xem mình đang
  //   đứng ở những cây nào. Chỉ hai việc bên trong bị khoá — cờ Quản trị hệ
  //   thống và Xoá tài khoản — và chúng tự nói lý do tại chỗ.
  // ⚠ HAI CHỖ BẤM, HAI THỨ MỞ RA — đổi ở b109c. Trước đó cả hai ô cùng mở một
  //   bảng sâu, và ô Vai trò chỉ là một cái nút thứ hai làm đúng việc của cái
  //   thứ nhất. Chủ dự án đặt lại 09/09/2026: ô Vai trò mở đúng bảng *gia phả ·
  //   vai trò*, ngắn, hai cột, bấm tiếp là sửa được. Ô Tài khoản vẫn mở cả bảng
  //   sâu năm việc. Chúng dùng CHUNG một chỗ đứng dưới bảng, nên mở cái này là
  //   đóng cái kia — đúng luật "mỗi lúc một thứ" của `moDong()`.
  // `datTrangThai` thay cho lối cũ gán đè `textContent`: ô Tài khoản nay chứa
  // cả tên, email và huy hiệu, nên gán đè chữ là **xoá sạch nội dung ô**.
  const datTk = (dangMo) => {
    bMo.style.boxShadow = dangMo ? 'inset 0 0 0 1px #c9c0b4' : 'none';
    bMo.style.background = dangMo ? '#f2ece2' : 'none';
  };
  bo.nut.push(datTk);
  if (oVaiTro.datTrangThai) bo.nut.push(oVaiTro.datTrangThai);
  if (oGan.dat) bo.nut.push(oGan.dat);

  bMo.addEventListener('click', () => moDong(bo, 'tk:' + tk.userId, tk, datTk,
    () => veBangSau(tk, ds, dsCay, napLai)));

  if (oVaiTro.nut) {
    oVaiTro.nut.addEventListener('click', () => moDong(bo, 'vai:' + tk.userId, tk,
      oVaiTro.datTrangThai,
      // `docCaSo: true` và `duocDoiQuyen: true` đều là hằng ĐÚNG ở đây, không
      // phải cẩu thả: chỉ Quản trị hệ thống mở được tấm lọc này, và
      // `co_the_quan_tri()` trả `true` cho họ ở MỌI cây — xem khối đầu file.
      () => veBangVaiTroTungCay(tk, {
        docCaSo: true, duocDoiQuyen: true, napLai,
      })));
  }

  // ⚠ Cột *Người được gắn* mở **cùng bảng** mà ô Tài khoản mở một phần — bảng
  //   các cây tài khoản này dính tới. Khác nhau ở chỗ nó mở THẲNG vào đó, thay
  //   vì bắt cuộn qua bốn việc cấp tài khoản để tới. Khoá riêng (`gan:`) vì
  //   một dòng nay có BA chỗ bấm mở ba thứ, và khoá trùng nhau thì bấm chỗ này
  //   sẽ đóng chỗ kia — trông hệt như cú bấm không ăn.
  if (oGan.nut) {
    oGan.nut.addEventListener('click', () => moDong(bo, 'gan:' + tk.userId, tk,
      oGan.dat, () => veCacCay(tk, napLai)));
  }
}

/**
 * Ô **Người được gắn** của sổ đăng ký — một dòng TÓM TẮT xuyên cây.
 *
 * ⚠ ĐỌC `soCayGan`, KHÔNG ĐỌC `nguoiGan.length`. Máy chủ cắt mảng ở ba phần tử
 *   (`20-nguoi-duoc-gan.sql` mục 1) nên hai con số ấy lệch nhau đúng ở tài
 *   khoản dính nhiều cây nhất — tức đúng tài khoản người ta mở ra để xem.
 *
 * ⚠ KHÔNG khoá trên dòng của chính mình, khác cột cùng tên ở ba tấm lọc kia.
 *   Ở đây bấm vào chỉ MỞ một bảng để xem; mọi nút sửa nằm trong bảng ấy và
 *   chúng tự khoá lấy. Khoá ở đây là giấu mất câu *"tôi đang được gắn vào ai"*,
 *   một câu ai cũng có quyền đọc về chính mình.
 */
function veOGanXuyenCay(tk) {
  const td = o('', 'padding:0');
  const ds = tk.nguoiGan || [];

  // Chưa gắn ở đâu là một trạng thái CÓ THẬT và đáng đọc — nói ra bằng chữ,
  // đừng để nó trông giống dữ liệu thiếu. Và không vẽ nút: không có gì để mở
  // mà vẫn mời bấm là hứa hão.
  if (!ds.length) {
    const d = document.createElement('div');
    d.textContent = tk.soCay ? 'chưa gắn ở cây nào' : '—';
    d.style.cssText = 'padding:10px;color:#8a8078;' +
      (tk.soCay ? 'font-style:italic' : '');
    // Hai câu khác nhau: *chưa gắn* là có chân mà chưa ai gắn; dấu gạch là
    // chưa có chân ở cây nào cả, và lúc ấy chữ "chưa gắn" đọc ra như một việc
    // đang chờ ai làm — không phải.
    if (!tk.soCay) d.title = 'Tài khoản này chưa có chân trong gia phả nào.';
    td.append(d);
    return { td, nut: null, dat: null };
  }

  const b = document.createElement('button');
  b.type = 'button';
  b.style.cssText =
    'display:block;width:100%;padding:10px;border:0;background:none;' +
    'font:inherit;color:inherit;text-align:left;cursor:pointer;border-radius:8px';

  const dau = ds[0] || {};
  const hang1 = document.createElement('div');
  const ma = document.createElement('span');
  ma.textContent = dau.maNguoi || '';
  ma.style.cssText = 'font-family:ui-monospace,monospace;font-size:12px;color:#5b4533';
  hang1.append(ma);
  if (dau.maCay) {
    const mc = document.createElement('span');
    mc.textContent = ' · ' + dau.maCay;
    mc.style.cssText = 'font-size:11px;color:#8a8078';
    hang1.append(mc);
  }
  b.append(hang1);

  if (dau.ten && dau.ten !== dau.maNguoi) {
    const ten = document.createElement('div');
    ten.textContent = dau.ten;
    ten.style.cssText = 'font-size:12px;color:#6a625a;overflow-wrap:break-word';
    b.append(ten);
  }

  // Chỉ mọc khi khác 0, đúng luật `CLAUDE.md` mục 7 — một dòng "và 0 cây khác"
  // nói *có thêm gì đấy* trong khi không có.
  const con = (Number(tk.soCayGan) || ds.length) - 1;
  if (con > 0) {
    const d = document.createElement('div');
    d.textContent = 'và ' + con + ' cây khác';
    d.style.cssText = 'font-size:11px;color:#7a5a28;white-space:nowrap';
    b.append(d);
  }

  td.append(b);

  const dat = (dangMo) => {
    b.style.background = dangMo ? '#f2ece2' : 'none';
    b.style.boxShadow = dangMo ? 'inset 0 0 0 1px #c9c0b4' : 'none';
  };

  return { td, nut: b, dat };
}

/**
 * Ô **Vai trò** — vai CAO NHẤT tài khoản này đang có ở đâu đó.
 *
 * ⚠ ĐÂY LÀ MỘT NỬA SỰ THẬT, VÀ NÓ PHẢI TỰ NÓI RA. Vai trò ở app này gắn với
 *   TỪNG cây: cùng một người có thể là chủ cây A và chỉ xem được cây B. Nên ô
 *   này bấm được, và bấm là mở đúng bảng hai cột *gia phả · vai trò* — một
 *   dòng cho mỗi cây, bấm tiếp là sửa được. Hiện vai cao nhất mà không mở được
 *   đường xuống chi tiết là làm người ta tin một câu tóm tắt.
 *
 * ⚠ `chu_cay` KHÔNG có trong `vaiTroBangChu()` của `config.js` — nó không
 *   phải mã vai trong `tree_members` (ràng buộc bảng ấy từ chối nó từ b105),
 *   nó là cột `trees.chu_so_huu`. Nên tên chữ của nó nằm ở đây.
 */
function veOVaiTro(tk) {
  const td = o('', 'padding:0');

  if (!tk.vaiCaoNhat) {
    // Trường trống thì không vẽ hàng ấy — `CLAUDE.md` mục 7. Nhưng ô bảng thì
    // phải có gì đó, nếu không người đọc tưởng màn hình lỗi. Một gạch ngang mờ
    // nói "không có", khác hẳn một ô trắng nói "không biết".
    const d = document.createElement('div');
    d.textContent = '—';
    d.style.cssText = 'padding:10px;color:#a89f94';
    td.append(d);
    return td;
  }

  const b = document.createElement('button');
  b.type = 'button';
  b.style.cssText =
    'display:block;width:100%;padding:10px;border:0;background:none;' +
    'font:inherit;color:inherit;text-align:left;cursor:pointer;border-radius:8px';

  const hh = huyHieu(
    tk.vaiCaoNhat === 'chu_cay' ? 'Chủ gia phả' : vaiTroBangChu(tk.vaiCaoNhat),
    tk.vaiCaoNhat === 'chu_cay');
  hh.style.marginLeft = '0';
  b.append(hh);

  td.append(b);
  td.nut = b;
  td.datTrangThai = (dangMo) => {
    b.style.background = dangMo ? '#f2ece2' : 'none';
    b.style.boxShadow = dangMo ? 'inset 0 0 0 1px #c9c0b4' : 'none';
  };
  return td;
}

// ============================================================
// Ô tích *Tạo gia phả* — cờ `tai_khoan.duoc_tao_cay`
// ============================================================
//
// ═══ VÌ SAO QUYỀN NÀY KHÔNG HỎI "CÂY NÀO" ═══
//
// Chủ dự án chốt 09/09/2026: *"quyền tạo cây cần tách riêng khỏi quyền quản
// trị gia phả"*. Ba hạng hay bị gộp làm một, và gộp là mở một đường leo thang
// không ai nhìn thấy:
//
//   · **Quản trị gia phả** (`tree_members.role='quan_tri'`) — theo CÂY.
//   · **Chủ cây** (`trees.chu_so_huu`) — cũng theo CÂY.
//   · **Được tạo cây** (`tai_khoan.duoc_tao_cay`) — theo TÀI KHOẢN.
//
// Người được phong Quản trị gia phả mà dựng được cây riêng thì trong cây ấy
// họ là chủ — tức tự cấp cho mình đúng cái quyền đổi quyền mà `13` mục 8 dựng
// cả một luật để chặn. Hàng rào thật ở `dat_duoc_tao_cay()` của
// `luoc-do/17-quyen-tao-cay.sql`, đo bằng `do-b110b.mjs` HR2 · HR3 · HR8 · HR9.
//
// ⚠ **MỘT NHỊP, KHÔNG HAI NHỊP** — chủ dự án đặt hàng đúng chữ *"tích vào là
//   xong"*. Khác năm việc của `13` và khác cờ Quản trị hệ thống, và khác có
//   lý do: bấm nhầm ở đây cho người ta dựng một cây RỖNG của riêng họ, không
//   đụng một dòng nào của gia phả nào đang có, và tích lại một cái là xong.
//   Nhịp thứ hai để dành cho việc lùi lại không được.

/**
 * ⚠ KHÔNG nhận `napLai`, khác mọi việc khác ở file này — nó cố ý KHÔNG vẽ lại
 *   khu. Xem `dongBoTaoCay` ở đầu file.
 *
 * @param {object} tk        một dòng của `dsTaiKhoanHeThong()`
 * @param {boolean} gonGang  `true` cho ô trong bảng (chỉ ô tích + chữ ngắn),
 *                           `false` cho bảng sâu (thêm chỗ báo lỗi rộng)
 */
function oTichTaoCay(tk, gonGang) {
  const boc = document.createElement('div');
  boc.style.cssText = 'display:inline-flex;flex-direction:column;gap:3px;' +
                      'align-items:' + (gonGang ? 'center' : 'flex-start');

  const nhan = document.createElement('label');
  nhan.style.cssText =
    'display:inline-flex;align-items:center;gap:6px;font-size:12px;' +
    'color:#2a2622;' + (tk.laChinhToi ? 'cursor:not-allowed;opacity:0.5'
                                      : 'cursor:pointer');

  const tich = document.createElement('input');
  tich.type = 'checkbox';
  tich.checked = Boolean(tk.duocTaoCay);
  tich.style.cssText = 'width:16px;height:16px;accent-color:#2a2622;margin:0;' +
                    'touch-action:manipulation';

  // ⚠ **Khoá sẵn trên dòng của chính mình, kèm lý do** — cùng luật đã ghi ở
  //   `khu-thanh-vien.js`: đừng để bấm rồi mới nhận câu từ chối. Máy chủ cũng
  //   từ chối (cửa thứ bảy), nhưng câu từ chối ấy tới sau một vòng mạng.
  //   Chặn ở đây không lấy đi khả năng nào: Quản trị hệ thống đã dựng được
  //   cây qua nhánh `la_quan_tri_he_thong()` của `duoc_tao_cay()`.
  if (tk.laChinhToi) {
    tich.disabled = true;
    nhan.title = 'Dòng của chính bạn — không ai đặt quyền cho chính mình được. ' +
      'Bạn đang là Quản trị hệ thống nên vẫn dựng được gia phả.';
  }

  // ⚠ Chữ *Có/Không* chỉ hiện ở BẢNG SÂU, không hiện trong ô bảng. Ảnh chụp
  //   1280px cho thấy nó ăn thêm ~45px của một bảng vốn đã phải cuộn ngang —
  //   và nó không nói thêm gì: một ô tích đã tự nói nó đang bật hay tắt. Chỗ
  //   ấy đắt hơn: cột *Tài khoản* hẹp đi là tên người gãy giữa chữ.
  const chu = document.createElement('span');
  const datChu = () => {
    chu.textContent = gonGang ? '' : (tich.checked ? 'Có' : 'Không');
  };
  datChu();

  nhan.append(tich, chu);

  const bao = document.createElement('div');
  bao.style.cssText = 'font-size:11px;line-height:1.4;color:#a83220;' +
                      (gonGang ? 'max-width:150px' : 'max-width:640px');

  boc.append(nhan, bao);

  // Giữ hai bản vẽ của cùng một cờ nói cùng một câu — xem `dongBoTaoCay`.
  const dongBo = (bat) => { tich.checked = bat; datChu(); bao.textContent = ''; };
  if (!dongBoTaoCay.has(tk.userId)) dongBoTaoCay.set(tk.userId, []);
  dongBoTaoCay.get(tk.userId).push(dongBo);

  tich.addEventListener('change', async () => {
    const muon = tich.checked;
    tich.disabled = true;
    bao.textContent = '';

    const kq = await datDuocTaoCay(tk.userId, muon);

    tich.disabled = Boolean(tk.laChinhToi);

    if (!kq.ok) {
      // ⚠ TRẢ Ô TÍCH VỀ CHỖ CŨ. Một ô tích đứng ở trạng thái mới trong khi
      //   máy chủ đã từ chối là màn hình nói dối — và nói dối đúng về một
      //   cột quyền. In NGUYÊN VĂN câu của máy chủ, đừng chế câu khác.
      tich.checked = Boolean(tk.duocTaoCay);
      datChu();
      bao.textContent = kq.loi || 'Không đặt được quyền dựng gia phả.';
      return;
    }

    // Máy chủ là nguồn của giá trị hiện ra, không phải cú bấm.
    tk.duocTaoCay = Boolean(kq.bat);
    for (const f of dongBoTaoCay.get(tk.userId) || []) f(tk.duocTaoCay);
  });

  return boc;
}

/**
 * Mở bảng sâu của một tài khoản, **bên NGOÀI bảng** — cùng lý do đã đo được ở
 * b106: ô mở rộng nằm trong cái bảng `min-width` thì nửa phải của nó rơi khỏi
 * mép màn hình điện thoại, và 121 phép kiểm văn bản đều xanh trong khi màn
 * hình không dùng được.
 *
 * Một chỗ đứng chung nên **mỗi lúc chỉ một dòng mở được** — đó là chủ ý: hai
 * bảng sâu cùng mở là hai ô "gõ lại email để xoá" nằm cạnh nhau.
 *
 * ⚠ `khoa` là *dòng nào* CỘNG *chỗ bấm nào*, không phải chỉ `userId`. Từ b109c
 *   một dòng có hai chỗ bấm mở hai thứ khác nhau; khoá chỉ bằng `userId` thì
 *   bấm ô Vai trò của dòng đang mở bảng sâu sẽ ĐÓNG nó lại thay vì đổi sang
 *   bảng vai trò — trông hệt như cú bấm không ăn.
 *
 * @param {string} khoa  `'tk:<userId>'` hoặc `'vai:<userId>'`
 */
function moDong(bo, khoa, tk, datTrangThai, veNoiDung) {
  const dangMoDongNay = bo.dangMo === khoa;

  bo.oSau.innerHTML = '';
  // `bo.nut` nay chứa HÀM đặt trạng thái, không phải phần tử nút. Đổi từ
  // b109b, khi ô Tài khoản thành chỗ bấm: gán đè `textContent` lên nó là xoá
  // sạch tên, email và huy hiệu bên trong.
  for (const dat of bo.nut) dat(false);

  if (dangMoDongNay) {
    bo.dangMo = null;
    return;
  }

  bo.dangMo = khoa;
  datTrangThai(true);

  const hop = document.createElement('div');
  hop.style.cssText =
    'margin-top:14px;padding:0 14px 14px;border:1px solid #e6e0d8;' +
    'border-radius:10px;background:#faf8f5';

  // ⚠ Hai chỗ bấm mở hai thứ khác nhau vào CÙNG một hộp, nên hộp phải tự nói
  //   nó đang là thứ nào. Để nguyên một câu "Tài khoản …" cho cả hai là dựng
  //   đúng cái cảnh người ta bấm ô Vai trò rồi đọc được chữ "Tài khoản" và
  //   tưởng mình bấm nhầm ô.
  const tieu = document.createElement('div');
  tieu.style.cssText = 'padding:12px 0 0;font-size:13px;color:#2a2622';
  tieu.append(document.createTextNode(
    khoa.startsWith('vai:') ? 'Vai trò của '
      : khoa.startsWith('gan:') ? 'Người được gắn cho '
      : 'Tài khoản '));

  const ai = document.createElement('span');
  ai.textContent = tk.email || '(không rõ email)';
  ai.style.cssText = 'font-weight:600;word-break:break-all';
  tieu.append(ai);

  if (tk.maNgan) {
    const m = document.createElement('span');
    m.textContent = ' · ' + tk.maNgan;
    m.style.cssText = 'font-family:ui-monospace,monospace;font-size:12px;color:#5b4533';
    tieu.append(m);
  }

  if (khoa.startsWith('vai:')) tieu.append(document.createTextNode(' — ở từng gia phả'));
  else if (khoa.startsWith('gan:')) {
    tieu.append(document.createTextNode(' — ở từng gia phả'));
    // ⚠ Nói thẳng chỗ SỬA nằm đâu. Người ta bấm cột *Người được gắn* để đổi mã
    //   người, và thứ mở ra là một bảng — không có câu này thì họ đọc bảng
    //   xong đi tìm nút Lưu ở đâu đó ngoài màn hình.
    const d = document.createElement('div');
    d.textContent =
      'Mã người gắn theo TỪNG cây. Bấm vào ô Người được gắn của dòng cây nào ' +
      'thì sửa cho cây ấy.';
    d.style.cssText = 'margin-top:4px;font-size:12px;font-weight:400;' +
      'color:#8a8078;line-height:1.5;max-width:640px';
    tieu.append(d);
  }

  hop.append(tieu, veNoiDung());
  bo.oSau.append(hop);

  hop.scrollIntoView({ block: 'nearest' });
}

// ============================================================
// Bảng sâu — bốn việc chủ dự án chốt cho một tài khoản
// ============================================================

/**
 * Bốn việc, đúng thứ tự nguy hiểm tăng dần: xem từng cây → cờ toàn hệ thống →
 * mời vào một cây → xoá hẳn. Việc phá huỷ đứng cuối, nơi phải cuộn xuống mới
 * tới, chứ không nằm cạnh mấy việc bấm hằng ngày.
 */
function veBangSau(tk, ds, dsCay, napLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'display:flex;flex-direction:column;gap:14px;padding:12px 0 2px;' +
    'border-top:1px solid #ece6dd';

  if (tk.laChinhToi) {
    hop.append(dongNhac(
      'Đây là tài khoản của chính bạn. Xem được mọi thứ ở đây, nhưng ba việc ' +
      'khoá sẵn: bật/tắt cờ Quản trị hệ thống, tự mời mình vào một cây, và tự ' +
      'xoá mình. Luật "không ai đặt quyền cho chính mình" không có ngoại lệ, kể ' +
      'cả với Quản trị hệ thống. Nhờ một Quản trị hệ thống khác làm.'));
  }

  hop.append(viecDatHoTen(tk, napLai));

  // ⚠ HAI CỜ CẤP TÀI KHOẢN ĐỨNG CẠNH NHAU, TRƯỚC MỌI THỨ THEO CÂY. Đó là
  //   trật tự chủ dự án đặt ra 09/09/2026: *"riêng quản trị hệ thống, khi gán
  //   quyền quản trị hệ thống cho người khác mới không cần chọn cây"*. Hai
  //   hàng này là hai hàng DUY NHẤT trong cả trang không hỏi cây nào — xếp
  //   chúng lẫn vào giữa mấy việc theo cây là xoá mất chính điều ấy.
  hop.append(viecCoQuanTriHeThong(tk, napLai));
  hop.append(viecQuyenTaoCay(tk));

  hop.append(veCacCay(tk, napLai));
  hop.append(viecMoiVaoCay(tk, dsCay, napLai));
  hop.append(viecXoaTaiKhoan(tk, ds, napLai));
  return hop;
}

/**
 * **Quyền dựng gia phả mới** — cờ `tai_khoan.duoc_tao_cay`, cửa thứ BẢY của
 * luật *không ai tự đặt quyền cho mình*.
 *
 * Cùng một ô tích với cột trong bảng; ở đây nó có chỗ để nói ra hậu quả, thứ
 * mà một ô bảng rộng 90px không nói được. Xem khối chú thích của
 * `oTichTaoCay()`.
 */
function viecQuyenTaoCay(tk) {
  return hangViec('Quyền dựng gia phả mới — cả hệ thống, không riêng cây nào',
    [oTichTaoCay(tk, false)],
    'Đang ' + (tk.duocTaoCay ? 'CÓ' : 'KHÔNG') + '. Tích là cho tài khoản này ' +
    'dựng gia phả mới; cây họ dựng ra là cây của họ, và họ là chủ cây ấy. ' +
    'Quyền này TÁCH HẲN khỏi vai Quản trị gia phả: người được phong quản trị ' +
    'một cây, và cả chủ cây, đều không vì thế mà dựng được cây mới. Quản trị ' +
    'hệ thống luôn dựng được, không cần tích.', null);
}

/**
 * Đặt HỌ TÊN cho tài khoản — `15-tim-kiem.sql` mục 1 và 2.
 *
 * ⚠ ĐÂY LÀ CHỖ DUY NHẤT TRONG CẢ PHẦN MỀM ĐIỀN TÊN NÀY, và nếu để trống thì
 *   ô gợi ý email ở form Mời chỉ hiện được tám dòng email na ná nhau. Người
 *   hay cần mời nhất — tài khoản vừa cấp, chưa gắn vào ai — chính là người
 *   chưa có tên ở đâu khác để mượn.
 *
 * ⚠ MỘT NHỊP, KHÔNG HAI NHỊP. Bốn việc kia ở panel này đều hai nhịp vì chúng
 *   đổi quyền hoặc phá dữ liệu. Tên thì gõ sai chỉ việc gõ lại — bắt bấm hai
 *   lần cho "đồng bộ" là làm nhờn đúng cái nhịp thứ hai đang bảo vệ bốn việc
 *   kia.
 *
 * ⚠ KHÔNG khoá trên dòng của chính mình. Đây không phải cờ quyền, nên luật
 *   *không ai đặt quyền cho chính mình* không với tới. Máy chủ cũng cho.
 */
function viecDatHoTen(tk, napLai) {
  const oNhap = document.createElement('input');
  oNhap.type = 'text';
  oNhap.value = tk.hoTen || '';
  oNhap.placeholder = 'Nguyễn Văn Hùng — để trống là xoá tên';
  oNhap.maxLength = 100;
  oNhap.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;min-width:240px';

  const bao = dongBao();
  const b = nut('Lưu họ tên', false);
  b.addEventListener('click', async () => {
    b.disabled = true;
    const kq = await datHoTenTaiKhoan(tk.userId, oNhap.value);
    b.disabled = false;
    return xong(kq, bao, napLai, 'Không lưu được họ tên.');
  });

  return hangViec('Họ tên', [oNhap, b],
    'Tên để NHẬN MẶT tài khoản trong ô gợi ý — không phải tên người trong sơ ' +
    'đồ gia phả, và một tài khoản chưa gắn vào ai vẫn có tên này. Bỏ trống ' +
    'thì lúc mời người ấy, ô gợi ý chỉ hiện được địa chỉ email.', bao);
}

/** Cửa thứ SÁU của luật không-tự-đặt-quyền — `14` mục 7. */
function viecCoQuanTriHeThong(tk, napLai) {
  const bat = !tk.laQuanTriHeThong;
  const khoa = tk.laChinhToi;

  const bao = dongBao();
  const b = nutHaiNhip(
    bat ? 'Bật cờ Quản trị hệ thống' : 'Tắt cờ Quản trị hệ thống',
    'Bấm lần nữa để ' + (bat ? 'bật' : 'tắt'),
    khoa,
    async () => {
      const kq = await datQuanTriHeThong(tk.userId, bat);
      return xong(kq, bao, napLai, 'Không đặt được cờ Quản trị hệ thống.');
    },
    !bat);

  return hangViec('Quản trị hệ thống — cả hệ thống, không chọn cây', [b],
    'Đang ' + (tk.laQuanTriHeThong ? 'BẬT' : 'TẮT') + '. Đây là cờ của TÀI ' +
    'KHOẢN, nên nó không hỏi gia phả nào: bật là cho tài khoản này đọc và sửa ' +
    'MỌI gia phả — cả cây đang có lẫn cây dựng sau này — đổi quyền ở mọi cây, ' +
    'và bật/tắt cờ này cho người khác. Máy chủ không cho tắt người cuối cùng ' +
    '— tắt nốt thì không ai bật lại được nữa trừ khi dán SQL tay.', bao);
}

/**
 * Mời thẳng vào một cây — chữ ký THỨ NHẤT, không phải một cú bấm đưa người
 * vào cây. Người kia vẫn phải tự bấm Nhận.
 *
 * ⚠ Ô *mã người* còn là ô gõ tay. Ô tìm/gợi ý thật là **b109b**, và nó cần
 *   một hàm tìm kiếm mới ở máy chủ — xem khối đầu file.
 */
function viecMoiVaoCay(tk, dsCay, napLai) {
  const chonCay = document.createElement('select');
  chonCay.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;min-width:200px';
  // ⚠⚠ MỤC TRỐNG ĐỨNG ĐẦU, VÀ NÓ ĐƯỢC CHỌN SẴN. Bản 0.4.0 để ô này mở ra ở
  //   cây ĐẦU DANH SÁCH — tức một lời mời gửi được mà người gửi chưa hề chọn
  //   cây nào. Chủ dự án bác đúng chỗ ấy 09/09/2026: *"khi gán quyền không nên
  //   ngầm định gán quyền cho cây đang hoạt động mà cần luôn luôn xác định
  //   người nào, cây nào, quyền gì"*.
  //
  //   Ở bảng này hậu quả nặng hơn ở khu bên: đây là sổ đăng ký của CẢ hệ
  //   thống, người gửi đang nhìn một tài khoản chứ không nhìn một cây, và cây
  //   đầu danh sách chẳng liên quan gì tới việc đang làm. Mời nhầm là cấp
  //   quyền đọc một gia phả không dính dáng — và người kia bấm Nhận là xong.
  const m0 = document.createElement('option');
  m0.value = '';
  m0.textContent = '— chọn gia phả —';
  chonCay.append(m0);

  for (const c of dsCay) {
    const m = document.createElement('option');
    m.value = c.fileId;
    m.textContent = c.ten + (c.treeCode ? ' · ' + c.treeCode : '');
    chonCay.append(m);
  }
  chonCay.value = '';

  const chonVai = document.createElement('select');
  chonVai.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;min-width:160px';
  for (const v of VAI_MOI_DUOC) {
    const m = document.createElement('option');
    m.value = v;
    m.textContent = vaiTroBangChu(v);
    chonVai.append(m);
  }
  chonVai.value = 'xem';

  const oNhap = document.createElement('input');
  oNhap.type = 'text';
  oNhap.placeholder = 'gõ tên hoặc mã — để trống cũng được';
  oNhap.autocomplete = 'off';
  oNhap.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;font-family:ui-monospace,monospace;min-width:215px';

  // ⚠ Đọc `chonCay.value` LÚC GỌI, không lúc gắn: người ta đổi cây trong ô
  //   chọn bên trái thì gợi ý phải đổi theo cây ấy. Chụp giá trị lại ở đây là
  //   sinh ra cảnh gợi ý người của cây A trong lúc lời mời đi vào cây B —
  //   hỏng im lặng, vì cả hai mã người đều "trông đúng".
  ganGoiY(oNhap, {
    // Chưa chọn cây thì KHÔNG hỏi máy chủ: `tim_nguoi_trong_cay(null, …)` trả
    // rỗng, và gửi một vòng mạng để nhận về sự trống rỗng ấy là vô cớ.
    tim: async (chuoi) => (chonCay.value
      ? (await timNguoiTrongCay(chonCay.value, chuoi)).ds : []),
    ve: dongNguoi,
    giaTri: (m) => m.maNguoi,
  });

  const bao = dongBao();

  // Hai lý do khoá. Cái thứ hai nghe như thừa — ai lại tự mời mình? — nhưng
  // nó đúng là đường leo thang `14` mục 2 gác ở cả hai đầu: tự mời mình vào
  // cây người khác với vai `quan_tri` rồi tự nhận là chiếm quyền cây ấy qua
  // hai cú bấm hợp lệ.
  const khong = !dsCay.length;
  const khoa = khong || tk.laChinhToi;

  const b = nutHaiNhip('Gửi lời mời', 'Bấm lần nữa để gửi', khoa, async () => {
    // ⚠ Chặn ở đây là để nói một câu tử tế, KHÔNG phải hàng rào — `moi_vao_cay()`
    //   với `p_tree` rỗng cũng từ chối. Nhưng câu từ chối của máy chủ tới sau
    //   một vòng mạng và nói bằng chữ của máy chủ.
    if (!chonCay.value) {
      bao.textContent = 'Chưa chọn gia phả. Quyền ở app này gắn với TỪNG cây, ' +
        'nên lời mời phải nói rõ mời vào cây nào.';
      bao.style.color = '#a83220';
      return false;
    }
    const kq = await moiVaoCay(chonCay.value, tk.email, chonVai.value,
                               oNhap.value.trim());
    return xong(kq, bao, napLai, 'Không gửi được lời mời.');
  });

  // Nút Gửi mờ cho tới khi có cây — khoá sẵn kèm lý do, không mở ra rồi mới
  // giải thích. Cùng luật đã ghi ở `khu-thanh-vien.js`.
  const datKhoaNut = () => {
    const mo = !khoa && Boolean(chonCay.value);
    b.disabled = !mo;
    b.style.opacity = mo ? '' : '0.45';
    b.style.cursor = mo ? 'pointer' : 'not-allowed';
    b.title = mo ? '' : 'Chọn gia phả trước — lời mời phải nói rõ mời vào cây nào.';
  };
  chonCay.addEventListener('change', datKhoaNut);
  datKhoaNut();

  chonCay.disabled = khoa;
  chonVai.disabled = khoa;
  oNhap.disabled = khoa;

  return hangViec('Mời vào một gia phả — chọn cây trước',
    [chonCay, chonVai, oNhap, b],
    khong
      ? 'Máy chủ không trả về gia phả nào để mời vào.'
      : tk.laChinhToi
      ? 'Không ai tự mời mình vào cây được — tự mời rồi tự nhận là cấp quyền ' +
        'cho chính mình qua hai cú bấm trông hợp lệ.'
      : 'Ô gia phả mở ra ở mục trống, cố ý: quyền ở app này gắn với TỪNG cây, ' +
        'và bảng này liệt kê tài khoản của cả hệ thống nên không có cây nào là ' +
        '"cây đang làm việc" ở đây. Lời mời là chữ ký thứ nhất — tài khoản này ' +
        'phải tự bấm Nhận thì mới thật sự vào cây, trước lúc ấy họ đọc 0 dòng. ' +
        'Mã người để trống thì họ vào xem được nhưng không sửa được gì.', bao);
}

/**
 * Xoá hẳn tài khoản — việc duy nhất trong cả phần mềm phá huỷ một lối đăng
 * nhập, và không có nút hoàn tác.
 *
 * ⚠ Ô gõ lại email KHÔNG so ở đây. Nút hai nhịp gác được cái bấm nhầm, không
 *   gác được cái bấm nhầm DÒNG — mà bảng này là chỗ hai dòng trông na ná nhau
 *   nhất trong cả app. Phép so phải hỏi chính hàng sắp bị xoá, tức phải ở máy
 *   chủ; so ở trình duyệt là so với đúng cái chữ màn hình vừa vẽ ra.
 */
function viecXoaTaiKhoan(tk, ds, napLai) {
  const khoa = tk.laChinhToi;

  const oNhap = document.createElement('input');
  oNhap.type = 'text';
  oNhap.placeholder = 'gõ lại email của tài khoản này';
  oNhap.disabled = khoa;
  oNhap.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;min-width:260px';

  const phanTu = [oNhap];

  // Ô chọn chủ mới chỉ mọc khi tài khoản này ĐANG làm chủ cây nào đó — không
  // làm chủ cây nào thì nó là một câu hỏi vô nghĩa đặt cạnh một nút nguy hiểm.
  let chonChu = null;
  if (tk.soCayLamChu > 0) {
    chonChu = document.createElement('select');
    chonChu.disabled = khoa;
    chonChu.style.cssText =
      'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
      'font:inherit;font-size:13px;min-width:220px';

    const m0 = document.createElement('option');
    m0.value = '';
    m0.textContent = 'Bạn nhận (mặc định)';
    chonChu.append(m0);

    for (const k of ds) {
      if (k.userId === tk.userId) continue;
      const m = document.createElement('option');
      m.value = k.userId;
      m.textContent = k.email;
      chonChu.append(m);
    }
    phanTu.push(chonChu);
  }

  const bao = dongBao();
  const b = nutHaiNhip('Xoá hẳn tài khoản',
    'Bấm lần nữa để xoá — KHÔNG hoàn tác được', khoa, async () => {
      const kq = await xoaTaiKhoan(tk.userId, oNhap.value.trim(),
                                   chonChu ? chonChu.value : '');
      return xong(kq, bao, napLai, 'Không xoá được tài khoản.');
    }, true);
  phanTu.push(b);

  const giai =
    'Xoá là mất lối đăng nhập, không phải gỡ khỏi một cây. Không hoàn tác được. ' +
    (tk.soCayLamChu > 0
      ? 'Tài khoản này đang làm chủ ' + tk.soCayLamChu + ' gia phả — số cây ấy ' +
        'sang tên trong cùng một giao dịch với lệnh xoá, nên không cây nào ' +
        'tồn tại ở trạng thái không chủ. '
      : '') +
    'Nhật ký ai sửa gì VẪN CÒN nguyên sau khi xoá — `change_log` giữ email ' +
    'bằng chữ, không có khoá ngoại tới bảng tài khoản.';

  return hangViec('Xoá hẳn tài khoản', phanTu, giai, bao);
}

// ============================================================
// Bảng con — tài khoản này đứng ở đâu trong từng cây
// ============================================================

/**
 * Đọc `ds_cay_cua_tai_khoan()` rồi vẽ một dòng cho mỗi cây, ở bất kỳ trạng
 * thái nào trong ba trạng thái. Đọc **lúc mở bảng sâu**, không đọc sẵn cho cả
 * danh sách: một sổ đăng ký ba chục dòng mà đọc trước là ba chục vòng mạng cho
 * một cái bảng người ta mở đúng một dòng.
 */
function veCacCay(tk, napLai) {
  const hop = document.createElement('div');

  const nhan = document.createElement('div');
  nhan.textContent = 'Gia phả tài khoản này dính tới';
  nhan.style.cssText = 'font-size:12px;font-weight:600;color:#6a625a;margin-bottom:5px';
  hop.append(nhan);

  const than = document.createElement('div');
  than.textContent = 'Đang đọc…';
  than.style.cssText = 'color:#8a8078;font-size:12px';
  hop.append(than);

  dsCayCuaTaiKhoan(tk.userId).then((kq) => {
    than.innerHTML = '';
    than.style.cssText = '';

    if (!kq.ok) {
      than.append(veLoi(kq.loi || 'Không đọc được danh sách gia phả.', napLai));
      return;
    }

    const ds = kq.ds || [];
    if (!ds.length) {
      const d = document.createElement('div');
      d.textContent =
        'Tài khoản này chưa dính tới gia phả nào — chưa vào cây nào, chưa nộp ' +
        'đơn, chưa được mời. Dùng ô Mời bên dưới để ngỏ lời.';
      d.style.cssText = 'font-size:12px;line-height:1.5;color:#8a8078;max-width:720px';
      than.append(d);
      return;
    }

    const oViec = document.createElement('div');
    const bo = { oSau: oViec, dangMo: null, nut: [] };

    than.append(veBangCay(ds, tk, napLai, bo));
    than.append(oViec);
  });

  return hop;
}

function veBangCay(ds, tk, napLai, bo) {
  const khung = document.createElement('div');
  khung.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';

  const bang = document.createElement('table');
  bang.style.cssText =
    'width:100%;min-width:720px;border-collapse:collapse;font-size:13px;' +
    'background:#fffdf9;border:1px solid #e6e0d8;border-radius:10px';

  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #e6e0d8;background:#faf8f5';
  for (const [chu, them, phu] of [
    ['Gia phả', ''], ['Đứng ở đâu', ''], ['Vai trò', ''],
    // ⚠ ĐÂY mới là chỗ sửa mã người, và chú thích phải nói ra — cột cùng tên ở
    //   bảng trên chỉ mở được bảng này chứ không sửa gì. Tới đây thì đã có tên
    //   cây đứng ngay bên trái, tức câu "gắn cho cây nào" mới có câu trả lời.
    ['Người được gắn', '', 'bấm để gắn/đổi'],
    ['Tin cậy', 'text-align:center'], ['', 'text-align:right'],
  ]) {
    const th = document.createElement('th');
    th.style.cssText =
      'padding:8px 10px;text-align:left;font-weight:600;color:#6a625a;' +
      'font-size:12px;white-space:nowrap;' + them;
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
  for (const c of ds) veMotDongCay(ruot, c, tk, napLai, bo);
  bang.append(ruot);

  khung.append(bang);
  return khung;
}

function veMotDongCay(ruot, c, tk, napLai, bo) {
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #f2eee8;vertical-align:top';

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

  // ⚠ BA trạng thái, và chúng phân biệt bằng `moiLuc`, KHÔNG bằng người mời:
  //   `moi_boi` khai `on delete set null`, nên xoá tài khoản người mời sẽ biến
  //   một lời mời thành thứ trông y hệt đơn xin vào (`14` mục 1).
  const trangThai = c.daDuyet ? 'thanhvien' : (c.moiLuc ? 'duocmoi' : 'donxin');
  const CHU = {
    thanhvien: 'Thành viên',
    duocmoi: 'Được mời — chờ họ bấm Nhận',
    donxin: 'Đơn xin vào — chờ duyệt',
  };
  const oTt = o(CHU[trangThai], 'padding:9px 10px;font-size:12px;color:' +
    (trangThai === 'thanhvien' ? '#2f6b3a' : '#7a5a28'));

  // Người được mời mang vai `xem` ở cột `role` cho tới lúc nhận — đó là cả
  // điểm của cột `moi_vai`. Hiện đúng vai họ SẼ nhận, đừng hiện `xem`.
  const vaiHien = trangThai === 'duocmoi' ? (c.moiVai || c.vai) : c.vai;
  const oVai = o('', 'padding:9px 10px;white-space:nowrap');
  oVai.textContent = vaiTroBangChu(vaiHien) || vaiHien || '';
  if (c.laChuCay) oVai.append(huyHieu('Chủ gia phả', true));

  // ⚠ ĐÂY là chỗ gắn mã người THẬT của cả tấm *Toàn hệ thống* — tới dòng này
  //   thì "cây nào" mới có câu trả lời, vì tên cây đứng ngay cột đầu.
  //   Hai lý do khoá, và cả hai trùng đúng với `gan_nguoi_cho_thanh_vien()`
  //   (`18` mục 4). `duocDoiQuyen` không có trong danh sách vì chỉ Quản trị hệ
  //   thống mở được tấm này, và `co_the_quan_tri()` trả `true` cho họ ở MỌI
  //   cây — xem khối đầu file.
  const oNguoi = veONguoiGan(
    { maNguoi: c.maNguoi, tenNguoi: c.tenNguoi },
    {
      css: 'padding:9px 10px',
      khoa: trangThai === 'duocmoi' || tk.laChinhToi,
      lyDo: tk.laChinhToi
        ? 'Tài khoản của chính bạn — không ai tự gắn mã người cho mình được.'
        : 'Lời mời đang chờ chính người ấy bấm Nhận. Gắn mã người hộ họ là bỏ '
          + 'mất chữ ký thứ hai.',
    });

  const oTin = o(c.tinCay ? 'Có' : 'Không',
    'padding:9px 10px;text-align:center;color:' + (c.tinCay ? '#2f6b3a' : '#8a8078'));

  const oThao = o('', 'padding:9px 10px;text-align:right');

  tr.append(oCay, oTt, oVai, oNguoi.td, oTin, oThao);
  ruot.append(tr);

  // Hình dạng `t` mà năm việc của `13` chờ: quyền gắn vào TÀI KHOẢN, còn vai
  // và mã người thì theo TỪNG CÂY. Ghép hai nguồn ấy lại đúng ở đây.
  const t = {
    userId: tk.userId,
    email: tk.email,
    maNgan: tk.maNgan,
    laChinhToi: tk.laChinhToi,
    vai: c.vai,
    daDuyet: c.daDuyet,
    maNguoi: c.maNguoi,
    tenNguoi: c.tenNguoi,
    tinCay: c.tinCay,
    laChuCay: c.laChuCay,
  };

  // ⚠ Tham số `cay` là cả ĐỐI TƯỢNG từ `khu-thanh-vien.js` 0.8.0 — mọi việc
  //   bên trong phải gọi được TÊN cây, không chỉ biết uuid của nó.
  const cay = { treeId: c.treeId, ten: c.ten || '', maCay: c.maCay || '' };

  // Ô *Người được gắn* của dòng này — chỗ sửa mã người thật. Nó mở TRƯỚC cả
  // cửa `duocmoi` bên dưới vì ô ấy đã tự khoá cho trạng thái ấy rồi.
  if (oNguoi.dat) {
    bo.nut.push(oNguoi.dat);
    oNguoi.nut.addEventListener('click', () => moDongCay(
      bo, 'gan:' + c.treeId, oNguoi.dat, tieuDeGan(t, cay),
      () => bangGanNguoi(t, cay, true, napLai)));
  }

  // ⚠ Lời mời KHÔNG có nút nào ở đây, và đó là luật chứ không phải thiếu sót:
  //   nhận hộ người ta là bỏ mất chữ ký thứ hai — đúng thứ `14` dựng cả cột
  //   `moi_vai` riêng để giữ. `nhan_loi_moi()` ở máy chủ cũng từ chối.
  //   Ô thao tác để TRỐNG, không vẽ một cái nút mờ ghi "Chờ họ bấm Nhận":
  //   cột *Đứng ở đâu* ngay bên cạnh vừa nói đúng câu ấy rồi, và hai lần cùng
  //   một câu trên một dòng là chỗ để người đọc đi tìm khác biệt không có.
  if (trangThai === 'duocmoi') return;

  const chuDong = c.daDuyet ? 'Sửa quyền' : 'Xét đơn';
  const b = nut(chuDong, false);

  // ⚠ **Khoá sẵn, không mở ra rồi mới giải thích** — chủ dự án bảo thẳng
  //   08/09/2026 sau khi bấm vào dòng của chính mình ở khu bên. Năm việc bên
  //   trong đều từ chối khi người bị tác động là người đang gọi, nên mở ra chỉ
  //   để đọc năm câu từ chối. Lý do đã nằm sẵn ở khối nhắc đầu bảng sâu.
  if (tk.laChinhToi) {
    b.disabled = true;
    b.style.opacity = '0.45';
    b.style.cursor = 'not-allowed';
    b.title = 'Tài khoản của chính bạn — không ai đặt quyền cho chính mình được.';
    oThao.append(b);
    return;
  }

  // ⚠ `bo.nut` chứa HÀM đặt trạng thái, không phải phần tử nút — đổi ở b111b,
  //   cùng lý do `moDong()` ở trên đã đổi từ b109b: một dòng nay có HAI chỗ
  //   bấm, và chỗ thứ hai (ô Người được gắn) chứa mã người, tên người và cả
  //   chữ nghiêng *"chưa gắn"*. Gán đè `textContent` lên nó là xoá sạch ô.
  const datNut = (dangMo) => { b.textContent = dangMo ? 'Thu lại' : chuDong; };
  bo.nut.push(datNut);

  // Gọi tên cây bằng đúng `nhanCay()` mà khu bên dùng — tên KÈM mã cây. Hai
  // cây trùng tên là chuyện có thật (chi trên, chi dưới), và mã cây là thứ
  // duy nhất chỉ đúng một cây.
  const tieu = document.createElement('div');
  tieu.textContent = (c.daDuyet ? 'Sửa quyền trong ' : 'Xét đơn vào ') +
    nhanCay(cay);
  tieu.style.cssText = 'padding:10px 0 0;font-size:13px;color:#2a2622;font-weight:600';

  // `true` cho `duocDoiQuyen`: chỉ Quản trị hệ thống mở được tấm lọc này, và
  // `co_the_quan_tri()` trả true cho họ ở mọi cây — xem khối đầu file.
  b.addEventListener('click', () => moDongCay(bo, c.treeId, datNut, tieu,
    () => (c.daDuyet
      ? veBangViec(t, cay, true, napLai)
      : veXetDon(t, cay, true, napLai))));

  oThao.append(b);
}

/**
 * Cùng luật "một chỗ đứng chung, mỗi lúc một dòng" của `moDong()` ở trên.
 *
 * ⚠ `khoa` là THAM SỐ từ b111b, không còn là `c.treeId` cứng: một dòng cây nay
 *   có hai chỗ bấm mở hai thứ khác nhau — ô *Người được gắn* và nút *Sửa
 *   quyền*. Khoá trùng nhau thì bấm chỗ này sẽ ĐÓNG chỗ kia thay vì đổi sang,
 *   trông hệt như cú bấm không ăn. Đúng chỗ hỏng `moDong()` đã sửa ở b109c.
 */
function moDongCay(bo, khoa, dat, tieu, veNoiDung) {
  const dangMoCaiNay = bo.dangMo === khoa;

  bo.oSau.innerHTML = '';
  for (const d of bo.nut) d(false);

  if (dangMoCaiNay) {
    bo.dangMo = null;
    return;
  }

  bo.dangMo = khoa;
  dat(true);

  const hop = document.createElement('div');
  hop.style.cssText =
    'margin-top:12px;padding:0 12px 12px;border:1px solid #e6e0d8;' +
    'border-radius:9px;background:#fffdf9';

  hop.append(tieu, veNoiDung());
  bo.oSau.append(hop);

  hop.scrollIntoView({ block: 'nearest' });
}
