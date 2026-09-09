// ============================================================
// giapha-supabase · js/pages/quan-tri/khu-gia-pha.js
// Vai trò  : Khu 1 của trang Quản trị — danh sách mọi gia phả người này THẤY
//            được, dấu tích "cây làm việc" / nút Xin quyền, công tắc "cho
//            người lạ thấy tên", và ô đặt cây mặc định của hệ thống.
// Lớp      : pages — được phép gọi mọi lớp dưới
// Phụ thuộc: services/sb, config
// Phiên bản: 0.6.0 · Cập nhật: 09/09/2026 (b109b)
//            0.6.0 hai ô của `veFormMoi()` nay CÓ GỢI Ý: gõ vài chữ của tên
//            hoặc email thì hiện danh sách khớp (`o-goi-y.js`, lọc ở máy chủ
//            bằng `15-tim-kiem.sql`). Trước bản này cả hai là ô gõ tay mù —
//            phải nhớ đúng từng chữ một địa chỉ email và mã `P0231` của một
//            người trong cây 681 người.
//            0.5.1 `veFormMoi()` thêm ô *Mã người trong sơ đồ* — chủ dự án
//            bấm thử bản 0.5.0 thấy thiếu, dù `moiVaoCay()`/`moi_vao_cay()`
//            đã nhận tham số này từ đầu.
//            0.5.0 cột *Mời* (chủ cây · Quản trị hệ thống) — `veFormMoi()`
//            gọi `moiVaoCay()`. Cột *Cây làm việc* thêm nhánh `duocMoi`:
//            Nhận/Từ chối thay cho Xin quyền, xem `veKhoiNhanTuChoi()`.
//            0.4.0 (b104) nút *+ Dựng gia phả mới* và hộp nhập tên · mã ·
//            ghi chú. Nút hiện cho MỌI người — hàng rào ở máy chủ, xem
//            `veHopTaoCay()`.
//            0.2.0 bỏ nút "Chọn" — chủ dự án đo bằng mắt trên app thật và
//            nói chữ ấy mơ hồ. Thay bằng cột dấu tích.
//            0.2.1 đổi cây xong thì Ở LẠI trang Quản trị, không hất sang sơ đồ.
//            0.3.0 cột tên là *Cây làm việc*, và dấu tích HỎI trước khi đổi —
//            hộp Đổi / Huỷ bỏ. Bấm nhầm ô tròn không còn đổi được cây.
//            0.3.1 sửa chữ trong hộp: "mọi quyền quản trị" thay cho "mọi màn
//            hình" — đúng chuyện thật (RLS xét theo cây đang mở), và ĐO ĐẠT
//            trên app thật (chủ dự án bấm thử, cả Đổi lẫn Huỷ bỏ).
// ============================================================
//
// ═══ KHU NÀY LÀ CHỖ DUY NHẤT NGƯỜI LẠ CÓ VIỆC ═══
//
// Ba khu kia đều đòi có chân trong một cây. Khu này thì ngược lại: nó tồn tại
// để phục vụ đúng người CHƯA có chân ở đâu cả — họ vào đây để thấy tên các
// cây và bấm xin quyền. Nên nó không được chặn ai, và không được vẽ câu
// "bạn không có quyền" khi danh sách rỗng.
//
// ═══ BA TẦNG NHÌN THẤY, VÀ MÁY CHỦ QUYẾT CẢ BA ═══
//
// `ds_gia_pha()` trả về đúng những cây người này được thấy tên, kèm bốn câu
// trả lời mà màn hình KHÔNG được tự suy ra: `coTheXem` · `suaDuoc` ·
// `toiLaChu` · `daNopDon`.
//
// ⚠ Đặc biệt `toiLaChu`. Bản đầu (codex/, 07/09) so email chủ cây với email
//   người đang đăng nhập ngay tại đây. Không phải lỗ hổng — máy chủ vẫn chặn
//   — nhưng sai theo hướng khó thấy: cây chưa gán chủ thì `emailChu` rỗng, và
//   chủ cây thật không thấy công tắc của chính mình mà không hiểu vì sao.
//   Cùng luật đã ghi ở `sb.js`: **hỏi máy chủ, đừng tự suy**.
//
// ⚠ **Không `alert()`, không `confirm()`.** Cả app chưa có chỗ nào dùng
//   (`khung.js` đầu file). Việc hỏng thì nói ngay tại dòng nó hỏng.

import {
  layDanhSachGiaPha, layCayMacDinh, datCayMacDinh,
  datChoNguoiLaThayTen, chonGiaPha, xinVaoCay, taoGiaPhaMoi,
  moiVaoCay, nhanLoiMoi, tuChoiLoiMoi,
  timTaiKhoan, timNguoiTrongCay,
} from '../../services/sb.js';
import { vaiTroBangChu } from '../../config.js';
import { sinhMaCay } from '../../utils/id.js';
import { ganGoiY, dongTaiKhoan, dongNguoi } from './o-goi-y.js';

/**
 * Vẽ khu Gia phả.
 *
 * @param {HTMLElement} el   thân trang, đã dọn sạch
 * @param {object} phien     kết quả `sb.layPhien()`
 */
export async function mountKhuGiaPha(el, phien) {
  el.innerHTML = '';

  const h = document.createElement('h2');
  h.className = 'qt-tua';
  h.textContent = 'Gia phả';

  const dan = document.createElement('p');
  dan.textContent =
    'Những gia phả bạn thấy được trên hệ thống. Mỗi lúc app chỉ mở một gia ' +
    'phả — tích vào cột Cây làm việc để chuyển sang gia phả khác, hoặc bấm ' +
    'Xin quyền nếu bạn chưa có chân trong gia phả ấy.';
  // ⚠ Câu trên là chỗ DUY NHẤT nói ra luật "mỗi lúc chỉ một gia phả". Cột dấu
  //   tích cho thấy luật ấy nhưng không nói ra được, và người mới vào không
  //   suy ngược từ hình sang luật. Rút câu này là lấy mất lời giải thích.
  dan.style.cssText = 'margin:0 0 16px;color:#6a625a;line-height:1.5';

  const than = document.createElement('div');
  than.textContent = 'Đang đọc danh sách…';
  than.style.cssText = 'color:#8a8078';

  el.append(h, dan, than);
  await nap(than, phien);
}

async function nap(than, phien) {
  // Hai câu hỏi đi cùng lượt — chúng không phụ thuộc nhau.
  const [kq, cayMacDinh] = await Promise.all([layDanhSachGiaPha(), layCayMacDinh()]);

  than.innerHTML = '';
  than.style.cssText = '';

  if (!kq.ok) {
    than.append(veLoi(kq.loi || 'Không đọc được danh sách gia phả.',
      () => nap(than, phien)));
    return;
  }

  const ds = kq.ds || [];

  // ⚠ Nút này đứng TRƯỚC nhánh "danh sách rỗng" bên dưới, và đó là chỗ nó
  //   phải đứng: người vừa được cấp quyền dựng cây mà chưa có chân ở đâu cả
  //   nhìn thấy đúng một màn hình trống — nếu nút nằm cạnh bảng thì họ không
  //   có nút.
  than.append(veHangTao(() => nap(than, phien)));

  if (phien.laQuanTriHeThong) {
    than.append(veOCayMacDinh(ds, cayMacDinh, () => nap(than, phien)));
  }

  if (!ds.length) {
    // ⚠ Câu này nói ĐÚNG hai điều cùng lúc, và cả hai đều là sự thật của máy
    //   chủ: người này chưa là thành viên cây nào, VÀ chưa có cây nào bật
    //   công tắc cho người lạ thấy tên. Đừng rút gọn thành "không có gia phả
    //   nào" — hệ thống có cây, chỉ là chưa cây nào mở tên ra.
    const r = document.createElement('div');
    r.className = 'qt-chua-lam';
    r.textContent =
      'Bạn chưa là thành viên của gia phả nào, và hiện chưa có gia phả nào ' +
      'mở tên cho người ngoài xem. Hãy liên hệ người quản lý gia phả bạn muốn vào.';
    than.append(r);
    return;
  }

  than.append(veBang(ds, cayMacDinh, phien, () => nap(than, phien)));
}

// ============================================================
// Bảng danh sách
// ============================================================

function veBang(ds, cayMacDinh, phien, napLai) {
  // Bảng rộng phải tự cuộn trong khung của nó — không thì nó kéo phình cả
  // lưới hai cột của trang. Cùng cách `khu-kiem-duyet.js` làm.
  const khung = document.createElement('div');
  khung.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';

  const bang = document.createElement('table');
  bang.style.cssText =
    'width:100%;min-width:820px;border-collapse:collapse;font-size:13px;' +
    'background:#fffdf9;border:1px solid #e6e0d8;border-radius:10px';

  bang.append(veDauBang(), veThanBang(ds, cayMacDinh, phien, napLai));
  khung.append(bang);
  return khung;
}

function veDauBang() {
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #e6e0d8;background:#faf8f5';

  const cot = [
    ['Gia phả', ''],
    ['Mã', ''],
    ['Người đứng tên', ''],
    ['Số người', 'text-align:right'],
    ['Vai của tôi', ''],
    ['Người lạ thấy tên', 'text-align:center'],
    // ⚠ Tiêu đề cột này là lời giải thích DUY NHẤT của ô tích bên dưới — ô
    //   tròn không mang chữ nào. Đổi nó là làm cột ấy câm.
    ['Cây làm việc', 'text-align:center'],
    // b108 — chỉ chủ cây và Quản trị hệ thống thấy nút; người khác thấy ô
    // trống. Xem `veOMoi()`.
    ['Mời', 'text-align:center'],
  ];
  for (const [chu, them] of cot) {
    const th = document.createElement('th');
    th.textContent = chu;
    th.style.cssText =
      'padding:9px 10px;text-align:left;font-weight:600;color:#6a625a;' +
      'font-size:12px;white-space:nowrap;' + them;
    tr.append(th);
  }
  thead.append(tr);
  return thead;
}

function veThanBang(ds, cayMacDinh, phien, napLai) {
  const tbody = document.createElement('tbody');
  for (const c of ds) tbody.append(veDong(c, cayMacDinh, phien, napLai));
  return tbody;
}

function veDong(c, cayMacDinh, phien, napLai) {
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #f2eee8;vertical-align:top';

  // — Tên cây, kèm hai huy hiệu trạng thái —
  const oTen = o('', 'padding:10px;font-weight:600;color:#2a2622');
  oTen.textContent = c.ten || '(chưa đặt tên)';
  // ⚠ KHÔNG gắn huy hiệu "Đang mở" ở đây nữa (bỏ 08/09/2026). Dấu tích ở cột
  //   *Cây làm việc* đã nói đúng điều ấy, và nói ở chỗ người ta bấm để đổi.
  //   Hai chỗ cùng nói một tin trên một hàng thì người đọc phải dừng lại hỏi
  //   "hai cái này có khác nhau không" — mà chúng không khác.
  //   Huy hiệu "Mặc định" thì Ở LẠI: nó nói chuyện khác hẳn — cây mà NGƯỜI LẠ
  //   vào được khi chưa có chân ở đâu — và không cột nào khác nói điều đó.
  if (c.fileId === cayMacDinh) oTen.append(huyHieu('Mặc định', false));

  const oMa = o(c.tenFile || '',
    'padding:10px;font-family:ui-monospace,monospace;font-size:12px;color:#5b4533');

  // Email người đứng tên đi ra cho cả người lạ, và đó là CỐ Ý: nó là đường
  // liên hệ để xin quyền (`THIET-KE-NHIEU-CAY.md`, mục Ba tầng nhìn thấy).
  const oChu = o(c.emailChu || '—', 'padding:10px;color:#6a625a;word-break:break-all');

  const oSo = o(String(c.soNguoi),
    'padding:10px;text-align:right;font-variant-numeric:tabular-nums');

  const chuVai = vaiTroBangChu(c.vaiCuaToi);
  const oVai = o(chuVai || 'chưa có quyền',
    'padding:10px;' + (chuVai ? '' : 'color:#8a8078;font-style:italic'));

  tr.append(oTen, oMa, oChu, oSo, oVai,
            veOCongTac(c, phien), veOThaoTac(c, phien, napLai),
            veOMoi(c, phien, napLai));
  return tr;
}

/**
 * Cột công tắc. Chỉ người ĐỨNG TÊN cây và Quản trị hệ thống mới thấy ô bấm;
 * người khác thấy trạng thái ở dạng chữ.
 *
 * ⚠ Ẩn ô bấm KHÔNG phải là hàng rào — hàng rào ở Postgres
 *   (`dat_cho_nguoi_la_thay_ten`, đã đo). Ẩn ở đây chỉ để không mời người ta
 *   bấm một thứ chắc chắn bị từ chối.
 */
function veOCongTac(c, phien) {
  const td = o('', 'padding:10px;text-align:center');

  // `toiLaChu` là câu trả lời của MÁY CHỦ (cột trong `ds_gia_pha()`), không
  // phải phép so email ở đây. Quản trị hệ thống bấm được ở mọi cây.
  if (!c.toiLaChu && !phien.laQuanTriHeThong) {
    td.textContent = c.choNguoiLaThayTen ? 'Có' : 'Không';
    td.style.color = c.choNguoiLaThayTen ? '#2f6b3a' : '#8a8078';
    return td;
  }

  const nhan = document.createElement('label');
  nhan.style.cssText =
    'display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:12px';

  const oBam = document.createElement('input');
  oBam.type = 'checkbox';
  oBam.checked = !!c.choNguoiLaThayTen;

  const chu = document.createElement('span');
  chu.textContent = oBam.checked ? 'Có' : 'Không';
  chu.style.color = oBam.checked ? '#2f6b3a' : '#8a8078';

  oBam.addEventListener('change', async () => {
    oBam.disabled = true;
    const kq = await datChoNguoiLaThayTen(c.fileId, oBam.checked);
    oBam.disabled = false;
    if (kq.ok) {
      chu.textContent = oBam.checked ? 'Có' : 'Không';
      chu.style.color = oBam.checked ? '#2f6b3a' : '#8a8078';
      return;
    }
    // Máy chủ từ chối: trả ô bấm về đúng sự thật, rồi nói lý do TẠI ĐÂY.
    oBam.checked = !oBam.checked;
    td.append(dongLoi(kq.loi || 'Không đổi được.'));
  });

  nhan.append(oBam, chu);
  td.append(nhan);
  return td;
}

/** Cột *Cây làm việc*: dấu tích · Xin quyền · Đã nộp đơn · Nhận/Từ chối lời mời. */
function veOThaoTac(c, phien, napLai) {
  const td = o('', 'padding:10px;text-align:center');

  if (c.coTheXem) {
    td.append(veDauTich(c, phien));
    return td;
  }

  // ⚠ ĐỨNG TRƯỚC `daNopDon` — một dòng chưa duyệt là ĐƠN XIN VÀO hoặc LỜI
  //   MỜI (b107), và `ds_gia_pha()` đã tách rõ hai cờ. Xem cùng lý lẽ ở
  //   `khoi-dong.js` nhánh `duocmoi`.
  if (c.duocMoi) {
    td.append(veKhoiNhanTuChoi(c, td, napLai));
    return td;
  }

  if (c.daNopDon) {
    const d = document.createElement('span');
    d.textContent = 'đã nộp đơn, đang chờ duyệt';
    d.style.cssText = 'font-size:12px;color:#8a8078';
    td.append(d);
    return td;
  }

  const b = nut('Xin quyền', false);
  b.addEventListener('click', () => veFormXin(td, c, napLai));
  td.append(b);
  return td;
}

/** Hai nút Nhận / Từ chối cho một lời mời — dùng ở cột *Cây làm việc*. */
function veKhoiNhanTuChoi(c, td, napLai) {
  const hop = document.createElement('div');
  hop.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px';

  const chu = document.createElement('span');
  chu.textContent = 'được mời làm ' + (vaiTroBangChu(c.moiVai) || c.moiVai || '');
  chu.style.cssText = 'font-size:11px;color:#6a625a';

  const hang = document.createElement('div');
  hang.style.cssText = 'display:flex;gap:6px';

  const bNhan = nut('Nhận', true);
  const bTuChoi = nut('Từ chối', false);
  hang.append(bNhan, bTuChoi);

  bNhan.addEventListener('click', async () => {
    bNhan.disabled = true; bTuChoi.disabled = true;
    bNhan.textContent = 'Đang nhận…';
    const kq = await nhanLoiMoi(c.fileId);
    if (kq.ok) { napLai(); return; }
    bNhan.disabled = false; bTuChoi.disabled = false;
    bNhan.textContent = 'Nhận';
    hop.append(dongLoi(kq.loi || 'Không nhận được.'));
  });

  bTuChoi.addEventListener('click', async () => {
    bNhan.disabled = true; bTuChoi.disabled = true;
    bTuChoi.textContent = 'Đang từ chối…';
    const kq = await tuChoiLoiMoi(c.fileId);
    if (kq.ok) { napLai(); return; }
    bNhan.disabled = false; bTuChoi.disabled = false;
    bTuChoi.textContent = 'Từ chối';
    hop.append(dongLoi(kq.loi || 'Không từ chối được.'));
  });

  hop.append(chu, hang);
  return hop;
}

/**
 * Cột *Mời*: chỉ chủ cây và Quản trị hệ thống thấy nút — người khác thấy ô
 * trống. Ẩn nút KHÔNG phải hàng rào (hàng rào là `co_the_quan_tri()` trong
 * `moi_vao_cay()`), chỉ để không mời người ta bấm một thứ chắc chắn bị từ
 * chối, đúng lý lẽ đã ghi ở `veOCongTac()`.
 */
function veOMoi(c, phien, napLai) {
  const td = o('', 'padding:10px;text-align:center');

  if (!c.toiLaChu && !phien.laQuanTriHeThong) return td;

  const b = nut('Mời…', false);
  b.addEventListener('click', () => veFormMoi(td, c, napLai));
  td.append(b);
  return td;
}

/** Ô email + vai + nút Mời, mở tại chỗ khi bấm "Mời…". */
function veFormMoi(td, c, napLai) {
  td.innerHTML = '';

  const hop = document.createElement('div');
  hop.style.cssText = 'display:flex;flex-direction:column;gap:6px;text-align:left;min-width:220px';

  const oEmail = document.createElement('input');
  oEmail.type = 'email';
  oEmail.placeholder = 'gõ vài chữ của tên hoặc email';
  oEmail.style.cssText =
    'width:100%;box-sizing:border-box;padding:7px;border:1px solid #dcd5cb;' +
    'border-radius:6px;font:inherit;font-size:12px';
  // ⚠ `autocomplete=off`: trình duyệt tự điền địa chỉ cũ đè lên đúng chỗ ô
  //   gợi ý của mình sắp vẽ, và hai danh sách chồng nhau thì không ai đọc được
  //   cái nào.
  oEmail.autocomplete = 'off';

  // ⚠ Không bắt buộc — để trống thì `moi_vao_cay()` mời mà không gắn ai vào
  //   sơ đồ. Có gõ thì nó là mã NGƯỜI TRONG CÂY (`P0012`), không phải mã tài
  //   khoản; máy chủ không kiểm mã này có thật hay không (cùng luật với ô
  //   "Mã người trong sơ đồ" của khu Tài khoản, `khu-thanh-vien.js`
  //   `viecGanNguoi`) — gõ sai thì gắn treo, không báo lỗi.
  const nhanMa = document.createElement('div');
  nhanMa.textContent = 'Mã người trong sơ đồ (không bắt buộc):';
  nhanMa.style.cssText = 'font-size:11px;color:#6a625a';

  const oMa = document.createElement('input');
  oMa.type = 'text';
  oMa.placeholder = 'gõ tên hoặc mã — để trống nếu chưa biết';
  oMa.autocomplete = 'off';
  oMa.style.cssText =
    'width:100%;box-sizing:border-box;padding:7px;border:1px solid #dcd5cb;' +
    'border-radius:6px;font:inherit;font-size:12px;font-family:ui-monospace,monospace';

  // ⚠ HAI Ô GỢI Ý, và cả hai đều lọc Ở MÁY CHỦ. Đừng đổi sang nạp danh sách
  //   về rồi lọc tại chỗ: cây này có 681 người, và `THIET-KE-QUAN-TRI.md`
  //   mục 1 nói `QuanTri.html` cố ý không nạp cây gia phả.
  const goGoiY = [
    ganGoiY(oEmail, {
      tim: async (chuoi) => (await timTaiKhoan(c.fileId, chuoi)).ds,
      ve: dongTaiKhoan,
      giaTri: (m) => m.email,
    }),
    ganGoiY(oMa, {
      tim: async (chuoi) => (await timNguoiTrongCay(c.fileId, chuoi)).ds,
      ve: dongNguoi,
      giaTri: (m) => m.maNguoi,
    }),
  ];

  const oVai = document.createElement('select');
  oVai.style.cssText =
    'width:100%;box-sizing:border-box;padding:7px;border:1px solid #dcd5cb;' +
    'border-radius:6px;font:inherit;font-size:12px';
  for (const [ma, chu] of [['xem', 'Xem'], ['sua', 'Sửa'], ['quan_tri', 'Quản trị']]) {
    const op = document.createElement('option');
    op.value = ma; op.textContent = chu;
    oVai.append(op);
  }
  oVai.value = 'xem';

  const hangNut = document.createElement('div');
  hangNut.style.cssText = 'display:flex;gap:6px;justify-content:flex-end';

  // ⚠ Gỡ ô gợi ý TRƯỚC khi vẽ lại khu. `ganGoiY()` treo bộ nghe lên `window`
  //   (cuộn · đổi cỡ) và thả danh sách vào `document.body` — hai thứ nằm
  //   NGOÀI cái ô sắp bị `innerHTML = ''` xoá đi. Không gỡ thì mỗi lần mở
  //   form là thêm hai bộ nghe không ai dọn, và một danh sách gợi ý có thể
  //   còn treo lơ lửng sau khi cái ô sinh ra nó đã biến mất.
  const dongForm = () => { goGoiY.forEach((go) => go()); napLai(); };

  const bThoi = nut('Thôi', false);
  bThoi.addEventListener('click', dongForm);

  const bMoi = nut('Gửi lời mời', true);
  bMoi.addEventListener('click', async () => {
    bMoi.disabled = true;
    bMoi.textContent = 'Đang mời…';
    const kq = await moiVaoCay(c.fileId, oEmail.value, oVai.value, oMa.value);
    if (kq.ok) { dongForm(); return; }
    bMoi.disabled = false;
    bMoi.textContent = 'Gửi lời mời';
    hop.append(dongLoi(kq.loi || 'Không mời được.'));
  });

  hangNut.append(bThoi, bMoi);
  hop.append(oEmail, nhanMa, oMa, oVai, hangNut);
  td.append(hop);
  oEmail.focus();
}

/**
 * Dấu tích *cây làm việc* — một ô tròn cho mỗi cây người này mở được.
 *
 * ⚠ Vì sao là `input type=radio` thật, không phải một dấu ✓ vẽ bằng chữ:
 *   app **chỉ mở được một gia phả tại một lúc**, và đó đúng là ngữ nghĩa sẵn
 *   có của một nhóm radio. Đổi lại được: đi bằng phím Tab, mũi tên lên xuống
 *   chuyển cây, trình đọc màn hình đọc thành *"chọn một trong nhiều"*, và
 *   trình duyệt tự lo việc bỏ tích ở dòng cũ. Vẽ tay thì mất cả bốn thứ và
 *   phải viết lại từng thứ một.
 *
 * ⚠ Ô này KHÔNG tự nói lên nó làm gì như một cái nút có chữ. Cái nói thay nó
 *   là **tiêu đề cột** (*Cây làm việc*) cộng câu dẫn đầu khu. Đổi tiêu đề cột
 *   thành chữ khác là lấy mất lời giải thích duy nhất của ô này.
 */
function veDauTich(c, phien) {
  const dangLam = c.fileId === phien.treeId;

  // ⚠ `padding:12px` không phải để cho thoáng — nó là VÙNG BẤM. Bản thân ô
  //   tròn chỉ 17px, nhỏ hơn đầu ngón tay; thẻ `label` bọc ngoài nhận cú bấm
  //   thay nó, nên vùng bấm thật thành ~41px. Khu này phải chạy trên điện
  //   thoại (`THIET-KE-QUAN-TRI.md` bảng cuối), và ở đó bấm trượt nghĩa là
  //   không có gì xảy ra mà không ai hiểu vì sao.
  const nhan = document.createElement('label');
  nhan.style.cssText =
    'display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:12px';
  nhan.title = dangLam
    ? 'Đây là cây làm việc hiện nay'
    : 'Bấm để lấy gia phả này làm cây làm việc';

  const oTron = document.createElement('input');
  oTron.type = 'radio';
  oTron.name = 'cay-lam-viec';
  oTron.checked = dangLam;
  oTron.dataset.cay = c.fileId;
  oTron.setAttribute('aria-label',
    'Lấy ' + (c.ten || 'gia phả này') + ' làm cây làm việc');
  oTron.style.cssText =
    'width:17px;height:17px;margin:0;accent-color:#2a2622;cursor:pointer';

  // ⚠ Bấm dấu tích KHÔNG đổi cây ngay — nó chỉ mở câu hỏi. Một ô tròn nằm
  //   giữa bảng là thứ dễ bấm nhầm khi cuộn trang trên điện thoại, và cái
  //   giá của lần nhầm ấy không nhỏ: cả trang nạp lại, mọi con số nhảy sang
  //   cây khác, người dùng không hiểu vừa xảy ra chuyện gì.
  //   `chonGiaPha()` chỉ được gọi sau khi người ấy bấm **Đổi**.
  oTron.addEventListener('change', () => {
    if (!oTron.checked) return;
    hoiRoiDoiCay(c, phien);
  });

  nhan.append(oTron);
  return nhan;
}

/** Trả dấu tích về đúng cây làm việc HIỆN NAY (dùng khi huỷ, và khi hỏng). */
function traDauTichVe(treeId) {
  for (const r of document.querySelectorAll('input[name="cay-lam-viec"]')) {
    r.checked = r.dataset.cay === treeId;
  }
}

/**
 * Hỏi trước, đổi sau. Hộp có hai lối ra: **Đổi** và **Huỷ bỏ**.
 *
 * ⚠ Vì sao phải hỏi, chứ không đổi thẳng rồi báo: một ô tròn nằm giữa bảng
 *   là thứ dễ chạm nhầm khi cuộn trang trên điện thoại, và lần nhầm ấy không
 *   rẻ — cả trang nạp lại, mọi con số nhảy sang cây khác, người dùng không
 *   hiểu vừa xảy ra chuyện gì. Chủ dự án chốt 08/09/2026.
 *
 * ⚠ Huỷ phải trả dấu tích về cây cũ. Trình duyệt đã dời tích sang dòng vừa
 *   bấm TRƯỚC khi ta kịp hỏi (đó là bản tính của radio), nên bỏ qua bước này
 *   là để lại một màn hình nói dối: tích nằm ở cây A trong khi máy chủ vẫn
 *   đang làm việc với cây B.
 *
 * ⚠ Tự dựng bằng DOM, KHÔNG `confirm()` — luật ghi ở đầu file này và ở
 *   `khung.js`. Ngôn ngữ hình lấy nguyên của lớp phủ trong `pages/backup.js`
 *   (cùng nền mờ, cùng bo góc, cùng bóng đổ) để người dùng không phải học
 *   kiểu hộp thứ hai.
 */
function hoiRoiDoiCay(c, phien) {
  const tenCay = c.ten || 'Gia phả này';

  const lopPhu = document.createElement('div');
  lopPhu.style.cssText =
    'position:fixed;inset:0;background:rgba(42,38,34,.35);z-index:30;' +
    'display:flex;align-items:center;justify-content:center;padding:16px;' +
    'font-family:system-ui,sans-serif;color:#2a2622';

  const hop = document.createElement('div');
  hop.setAttribute('role', 'dialog');
  hop.setAttribute('aria-modal', 'true');
  hop.style.cssText =
    'background:#fffdf9;border-radius:14px;padding:18px;box-sizing:border-box;' +
    'width:100%;max-width:400px;box-shadow:0 8px 32px rgba(42,38,34,.28)';

  const tua = document.createElement('div');
  tua.textContent = 'Đổi cây làm việc?';
  tua.style.cssText = 'font-size:19px;font-weight:600';

  const chu = document.createElement('div');
  chu.textContent =
    'Bạn sắp chuyển sang làm việc với “' + tenCay + '”. Trang sẽ nạp lại, và ' +
    'từ đó mọi quyền quản trị tính theo gia phả này.';
  chu.style.cssText =
    'font-size:13px;line-height:1.55;color:#8a8078;margin-top:6px';

  const oLoi = document.createElement('div');

  const hang = document.createElement('div');
  hang.style.cssText =
    'display:flex;justify-content:flex-end;gap:8px;margin-top:16px';

  const bHuy = nut('Huỷ bỏ', false);
  bHuy.style.cssText += ';padding:8px 16px;font-size:13px';

  const bDoi = nut('Đổi', true);
  bDoi.style.cssText += ';padding:8px 18px;font-size:13px';

  function dong() {
    document.removeEventListener('keydown', phimEsc);
    lopPhu.remove();
  }

  function huy() {
    dong();
    traDauTichVe(phien.treeId);
  }

  function phimEsc(e) {
    if (e.key === 'Escape' && !bDoi.disabled) huy();
  }

  bHuy.addEventListener('click', huy);
  // Bấm ra vùng mờ = huỷ, giống mọi hộp khác trong app.
  lopPhu.addEventListener('click', (e) => {
    if (e.target === lopPhu && !bDoi.disabled) huy();
  });
  document.addEventListener('keydown', phimEsc);

  bDoi.addEventListener('click', async () => {
    bDoi.disabled = true;
    bHuy.disabled = true;
    bDoi.textContent = 'Đang chuyển…';
    oLoi.innerHTML = '';

    const kq = await chonGiaPha(c.fileId);
    if (kq.ok) {
      // ⚠ Ở LẠI trang Quản trị. Đổi cây là việc người ta làm KHI ĐANG quản
      //   trị — hất họ sang sơ đồ là bắt họ tự tìm đường quay lại chỗ vừa đứng.
      //
      // ⚠⚠ NHƯNG PHẢI NẠP LẠI TRANG, không được chỉ vẽ lại bảng. `khung.js`
      //   lấy `phien` đúng MỘT lần lúc dựng trang, rồi đếm số đơn chờ duyệt
      //   và số thay đổi chờ kiểm duyệt theo `phien.treeId` ấy. Chỉ gọi
      //   `napLai()` thì bảng này đúng còn hai con số trên nút điều hướng vẫn
      //   của cây cũ — sai lặng lẽ, không có gì báo. Cùng một họ với cảnh báo
      //   ở `sb.chonGiaPha`, chỉ nhỏ hơn.
      //
      //   `reload()` giữ nguyên khu đang mở vì khu nằm ở `location.hash`.
      window.location.reload();
      return;
    }

    // Hỏng thì nói NGAY TRONG HỘP, đừng đóng hộp rồi báo sau lưng người ta.
    bDoi.disabled = false;
    bHuy.disabled = false;
    bDoi.textContent = 'Đổi';
    oLoi.append(dongLoi(kq.loi || 'Không đổi được gia phả.'));
    traDauTichVe(phien.treeId);
  });

  hang.append(bHuy, bDoi);
  hop.append(tua, chu, oLoi, hang);
  lopPhu.append(hop);
  document.body.append(lopPhu);
  bDoi.focus();
}

/** Ô nhập lời nhắn, mở ngay tại dòng ấy — không lớp phủ, không hộp thoại. */
function veFormXin(td, c, napLai) {
  td.innerHTML = '';

  const hop = document.createElement('div');
  hop.style.cssText = 'display:flex;flex-direction:column;gap:6px;text-align:left;min-width:210px';

  const nhan = document.createElement('div');
  nhan.textContent = 'Vài lời để người quản lý biết bạn là ai:';
  nhan.style.cssText = 'font-size:12px;color:#6a625a';

  const oNhap = document.createElement('textarea');
  oNhap.rows = 3;
  oNhap.maxLength = 500;
  oNhap.placeholder = 'Ví dụ: Tôi là con ông Nguyễn Văn A, chi thứ hai.';
  oNhap.style.cssText =
    'width:100%;box-sizing:border-box;padding:7px;border:1px solid #dcd5cb;' +
    'border-radius:6px;font:inherit;font-size:12px;resize:vertical';

  const hangNut = document.createElement('div');
  hangNut.style.cssText = 'display:flex;gap:6px;justify-content:flex-end';

  const bThoi = nut('Thôi', false);
  bThoi.addEventListener('click', () => napLai());

  const bGui = nut('Gửi đơn', true);
  bGui.addEventListener('click', async () => {
    bGui.disabled = true;
    bGui.textContent = 'Đang gửi…';
    const kq = await xinVaoCay(oNhap.value, c.fileId);
    if (kq.ok) { napLai(); return; }
    bGui.disabled = false;
    bGui.textContent = 'Gửi đơn';
    hop.append(dongLoi(kq.loi || kq.lyDo || 'Không gửi được đơn.'));
  });

  hangNut.append(bThoi, bGui);
  hop.append(nhan, oNhap, hangNut);
  td.append(hop);
  oNhap.focus();
}

// ============================================================
// Dựng gia phả mới
// ============================================================

/** Hàng chứa nút *+ Dựng gia phả mới*, đứng trên cùng khu. */
function veHangTao(napLai) {
  const hang = document.createElement('div');
  hang.style.cssText = 'margin-bottom:16px';

  const b = nut('+ Dựng gia phả mới', false);
  b.style.cssText += ';padding:7px 14px;font-size:13px';
  b.addEventListener('click', () => veHopTaoCay(napLai));

  hang.append(b);
  return hang;
}

/**
 * Hộp nhập tên · mã · ghi chú, rồi gọi máy chủ.
 *
 * ⚠⚠ **NÚT NÀY HIỆN CHO MỌI NGƯỜI, KỂ CẢ NGƯỜI KHÔNG CÓ QUYỀN** — và đó là
 *   yêu cầu viết thành chữ ở điểm dừng b104: *"một tài khoản không được cấp
 *   bấm vào thì bị MÁY CHỦ từ chối, không phải bị JavaScript giấu nút"*.
 *
 *   Không phải chuyện lười. Hai lý do:
 *   · Giấu nút thì người không có quyền **không biết là có thứ để xin** — đúng
 *     cái lỗi mà cả tầng 1 của `THIET-KE-NHIEU-CAY.md` sinh ra để tránh.
 *   · Và giấu nút cám dỗ người viết sau tin rằng cái ẩn là cái được chặn.
 *     Hàng rào thật nằm ở `duoc_tao_cay()` trong `12-tao-cay.sql`, đã đo bằng
 *     REST giả lập (`do-b104.mjs` HR1). Màn hình chỉ chuyển lời từ chối ấy.
 *
 * ⚠ Mã cây điền sẵn bằng `sinhMaCay()` của `utils/id.js`, và **thôi tự điền
 *   ngay khi người dùng gõ tay vào ô mã**. Ghi đè lên chữ người ta vừa gõ là
 *   kiểu hỏng làm người dùng tưởng bàn phím hỏng.
 */
function veHopTaoCay(napLai) {
  const lopPhu = document.createElement('div');
  lopPhu.style.cssText =
    'position:fixed;inset:0;background:rgba(42,38,34,.35);z-index:30;' +
    'display:flex;align-items:center;justify-content:center;padding:16px;' +
    'font-family:system-ui,sans-serif;color:#2a2622';

  const hop = document.createElement('div');
  hop.setAttribute('role', 'dialog');
  hop.setAttribute('aria-modal', 'true');
  hop.style.cssText =
    'background:#fffdf9;border-radius:14px;padding:18px;box-sizing:border-box;' +
    'width:100%;max-width:440px;box-shadow:0 8px 32px rgba(42,38,34,.28)';

  const tua = document.createElement('div');
  tua.textContent = 'Dựng gia phả mới';
  tua.style.cssText = 'font-size:19px;font-weight:600';

  const dan = document.createElement('div');
  dan.textContent =
    'Gia phả mới dựng ra sẽ rỗng, và bạn là người quản trị của nó. ' +
    'Thêm người đầu tiên ở màn hình sơ đồ.';
  dan.style.cssText =
    'font-size:13px;line-height:1.55;color:#8a8078;margin:6px 0 14px';

  const [oTen, khungTen] = oNhap('Tên gia phả', 'Ví dụ: Họ Lê làng Bắc Ninh');
  const [oMa, khungMa] = oNhap('Mã gia phả',
    'Chữ không dấu và số, ví dụ: LEBN');
  const [oNote, khungNote] = oNhap('Ghi chú (không bắt buộc)', '');

  // Mã hiện trên màn hình như một mã, không như một câu chữ.
  oMa.style.cssText += ';font-family:ui-monospace,monospace;text-transform:uppercase';
  oMa.maxLength = 14;
  oTen.maxLength = 120;

  let nguoiDungTuGoMa = false;
  oMa.addEventListener('input', () => { nguoiDungTuGoMa = true; });
  oTen.addEventListener('input', () => {
    if (nguoiDungTuGoMa) return;
    const t = oTen.value.trim();
    // Hạt giống là chính cái tên: hàm thuần, nên gõ cùng một tên luôn ra cùng
    // một mã, và người dùng thấy mã đứng yên thay vì nhảy mỗi lần gõ.
    oMa.value = t ? sinhMaCay(t, t) : '';
  });

  const oLoi = document.createElement('div');

  const hang = document.createElement('div');
  hang.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:16px';

  const bHuy = nut('Huỷ bỏ', false);
  bHuy.style.cssText += ';padding:8px 16px;font-size:13px';
  const bTao = nut('Dựng', true);
  bTao.style.cssText += ';padding:8px 18px;font-size:13px';

  function dong() {
    document.removeEventListener('keydown', phimEsc);
    lopPhu.remove();
  }
  function phimEsc(e) { if (e.key === 'Escape' && !bTao.disabled) dong(); }

  bHuy.addEventListener('click', dong);
  lopPhu.addEventListener('click', (e) => {
    if (e.target === lopPhu && !bTao.disabled) dong();
  });
  document.addEventListener('keydown', phimEsc);

  bTao.addEventListener('click', async () => {
    oLoi.innerHTML = '';
    bTao.disabled = true;
    bHuy.disabled = true;
    bTao.textContent = 'Đang dựng…';

    const kq = await taoGiaPhaMoi(oTen.value, oMa.value.toUpperCase(), oNote.value);

    if (kq.ok) { veDaDung(kq.cay); return; }

    // Máy chủ từ chối — nói lý do NGAY TRONG HỘP, đừng đóng hộp rồi báo sau
    // lưng người ta. Đây cũng là chỗ người không được cấp quyền nghe câu
    // "chưa được cấp quyền dựng gia phả mới", nguyên văn từ máy chủ.
    bTao.disabled = false;
    bHuy.disabled = false;
    bTao.textContent = 'Dựng';
    oLoi.append(dongLoi(kq.loi || 'Không dựng được gia phả.'));
  });

  /** Dựng xong: đổi cả ruột hộp, cho đúng một đường đi tiếp. */
  function veDaDung(cay) {
    hop.innerHTML = '';

    const t = document.createElement('div');
    t.textContent = 'Đã dựng xong';
    t.style.cssText = 'font-size:19px;font-weight:600';

    const c = document.createElement('div');
    c.textContent =
      '“' + (cay.ten || '') + '” (mã ' + (cay.maCay || '') + ') nay là gia phả ' +
      'của bạn, và đang rỗng. Mở nó ra để thêm người đầu tiên.';
    c.style.cssText = 'font-size:13px;line-height:1.55;color:#8a8078;margin-top:6px';

    const loi2 = document.createElement('div');

    const h = document.createElement('div');
    h.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:16px';

    const bSau = nut('Để sau', false);
    bSau.style.cssText += ';padding:8px 16px;font-size:13px';
    bSau.addEventListener('click', () => { dong(); napLai(); });

    const bMo = nut('Mở gia phả mới', true);
    bMo.style.cssText += ';padding:8px 18px;font-size:13px';
    bMo.addEventListener('click', async () => {
      bMo.disabled = true;
      bSau.disabled = true;
      bMo.textContent = 'Đang mở…';
      const d = await chonGiaPha(cay.fileId);
      if (d.ok) {
        // ⚠ Đi thẳng sang SƠ ĐỒ, khác hẳn việc đổi cây ở cột *Cây làm việc*
        //   (chỗ ấy cố ý ở lại trang Quản trị). Ở đây người ta vừa dựng một
        //   cây rỗng, và việc duy nhất còn ý nghĩa là thêm người đầu tiên —
        //   thứ chỉ có ở màn hình sơ đồ.
        window.location.href = 'index.html';
        return;
      }
      bMo.disabled = false;
      bSau.disabled = false;
      bMo.textContent = 'Mở gia phả mới';
      loi2.append(dongLoi(d.loi || 'Đã dựng được nhưng chưa mở được.'));
    });

    h.append(bSau, bMo);
    hop.append(t, c, loi2, h);
    bMo.focus();
  }

  hang.append(bHuy, bTao);
  hop.append(tua, dan, khungTen, khungMa, khungNote, oLoi, hang);
  lopPhu.append(hop);
  document.body.append(lopPhu);
  oTen.focus();
}

/** Một ô nhập kèm nhãn. Trả về `[ô, khung]`. */
function oNhap(nhanChu, goiY) {
  const khung = document.createElement('label');
  khung.style.cssText = 'display:block;margin-bottom:10px';

  const n = document.createElement('div');
  n.textContent = nhanChu;
  n.style.cssText = 'font-size:12px;color:#6a625a;margin-bottom:4px';

  const o_ = document.createElement('input');
  o_.type = 'text';
  o_.placeholder = goiY;
  o_.style.cssText =
    'width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #dcd5cb;' +
    'border-radius:7px;font:inherit;font-size:13px;background:#fff';

  khung.append(n, o_);
  return [o_, khung];
}

// ============================================================
// Ô cây mặc định — chỉ Quản trị hệ thống thấy
// ============================================================

/**
 * Cây mặc định là **công tắc của cả hệ thống**: người chưa có chân ở đâu cả
 * mở app sẽ vào thẳng cây này, ở chế độ chỉ xem.
 *
 * ⚠ Khác hẳn công tắc "người lạ thấy tên" ở cột trong bảng. Cái kia mở TÊN
 *   cây cho người lạ; cái này mở NỘI DUNG một cây cho họ. Hai quyết định khác
 *   nhau, hai người khác nhau quyết (chủ cây · quản trị hệ thống), nên chúng
 *   đứng ở hai chỗ khác nhau trên màn hình.
 */
function veOCayMacDinh(ds, cayMacDinh, napLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'border:1px solid #e6e0d8;border-radius:10px;padding:14px 16px;' +
    'background:#faf8f5;margin-bottom:18px';

  const tua = document.createElement('div');
  tua.textContent = 'Cây mặc định cho người chưa có quyền';
  tua.style.cssText = 'font-weight:600;margin-bottom:4px;color:#2a2622';

  const dan = document.createElement('div');
  dan.textContent =
    'Người đăng nhập mà chưa có chân trong gia phả nào sẽ mở được cây này, ' +
    'chỉ xem, và không thấy danh sách thành viên.';
  dan.style.cssText = 'font-size:12px;color:#6a625a;line-height:1.5;margin-bottom:10px';

  const hang = document.createElement('div');
  hang.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center';

  const chon = document.createElement('select');
  chon.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;' +
    'background:#fff;font:inherit;font-size:13px;min-width:230px';

  const rong = document.createElement('option');
  rong.value = '';
  rong.textContent = '— không mở cây nào —';
  chon.append(rong);

  for (const c of ds) {
    const m = document.createElement('option');
    m.value = c.fileId;
    m.textContent = (c.ten || '(chưa đặt tên)') + '  ·  ' + (c.tenFile || '');
    chon.append(m);
  }
  chon.value = cayMacDinh || '';

  const bLuu = nut('Lưu', true);
  bLuu.addEventListener('click', async () => {
    bLuu.disabled = true;
    bLuu.textContent = 'Đang lưu…';
    const kq = await datCayMacDinh(chon.value || null);
    if (kq.ok) { napLai(); return; }
    bLuu.disabled = false;
    bLuu.textContent = 'Lưu';
    hop.append(dongLoi(kq.loi || 'Không lưu được.'));
  });

  hang.append(chon, bLuu);
  hop.append(tua, dan, hang);
  return hop;
}

// ============================================================
// Mấy mẩu dùng chung
// ============================================================

function o(chu, css) {
  const td = document.createElement('td');
  if (chu) td.textContent = chu;
  td.style.cssText = css;
  return td;
}

function huyHieu(chu, dam) {
  const s = document.createElement('span');
  s.textContent = chu;
  s.style.cssText =
    'margin-left:7px;font-size:11px;font-weight:500;padding:2px 7px;border-radius:10px;' +
    (dam ? 'background:#2a2622;color:#fffdf9'
         : 'background:#f3ece1;color:#7a5a28;border:1px solid #e2d5bf');
  return s;
}

function nut(chu, dam) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = chu;
  b.style.cssText =
    'padding:5px 12px;border-radius:6px;font:inherit;font-size:12px;cursor:pointer;' +
    (dam ? 'border:1px solid #2a2622;background:#2a2622;color:#fffdf9'
         : 'border:1px solid #dcd5cb;background:#fffdf9;color:#2a2622');
  return b;
}

/** Câu lỗi đứng ngay cạnh chỗ vừa bấm — không nhảy hộp thoại lên giữa màn. */
function dongLoi(chu) {
  const d = document.createElement('div');
  d.textContent = chu;
  d.style.cssText = 'margin-top:6px;font-size:12px;color:#a83220;line-height:1.4';
  return d;
}

function veLoi(chu, thuLai) {
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
