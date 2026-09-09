// ============================================================
// giapha-supabase · js/pages/khoi-dong.js
// Vai trò  : Màn hình mở đầu — chờ máy chủ trả danh tính và quyền,
//            báo lỗi rõ ràng nếu người dùng chưa đăng nhập hoặc chưa có quyền.
// Lớp      : pages
// Phụ thuộc: services/repo, services/sb, utils/date, pages/dang-nhap,
//            pages/tree-view
// Phiên bản: 0.12.0 · Cập nhật: 09/09/2026 (b110)
//            0.12.0 nhánh `daxoa` — cây đang mở vừa bị xoá. ⚠ Người rơi vào
//            đây CÓ ĐỦ QUYỀN; thiếu là thiếu cái cây. Không có nhánh này thì
//            họ mở ra một sơ đồ trống không lời giải thích, hoặc nghe câu
//            "chưa được cấp quyền" — sai hẳn. Màn hình kể ĐÍCH DANH tên cây,
//            người xin và người duyệt, đúng chữ chủ dự án chốt 09/09/2026.
//            0.11.0 nhánh `duocmoi` — người ĐƯỢC MỜI (b107) thấy Nhận/Từ chối
//            ngay tại màn hình khởi động, thay vì câu "đơn đang chờ duyệt".
// ============================================================
//
// ⚠ **ĐỔI SO VỚI BẢN APPS SCRIPT: có thêm một kết cục thứ ba.**
//
// Trên nền Google, người mở app bao giờ cũng đã đăng nhập sẵn — câu hỏi duy
// nhất là "có được chia sẻ file không". Ở đây có ba câu, và phải trả lời đúng
// câu, vì chúng dẫn tới ba việc khác hẳn nhau:
//
//   chưa đăng nhập            → mở màn hình đăng nhập  (người dùng tự làm được)
//   đăng nhập, chưa nộp đơn   → nút "Xin vào gia phả"  (người dùng tự làm được)
//   đã nộp đơn, đang chờ      → nói rõ là đang chờ, KHÔNG hiện nút nữa
//   ĐƯỢC MỜI, chưa nhận       → nút Nhận / Từ chối     (người dùng tự làm được)
//   đọc được                  → mở sơ đồ
//
// ⚠ Kết cục thứ ba thêm vào 04/09/2026 cùng `luoc-do/07-duyet-dang-ky.sql`.
//   Trước đó người chưa có quyền chỉ được bảo *"liên hệ người quản lý"* — một
//   ngõ cụt: họ không biết nhắn thế nào cho phải, và người quản lý thì không có
//   danh sách ai đang đợi. Nay đơn tự vào hàng chờ và admin thấy nó trong Cài đặt.
//
// ⚠ Kết cục thứ tư thêm vào 09/09/2026 (b108) cùng `luoc-do/14-loi-moi.sql`.
//   Trước đó một dòng "chưa duyệt" chỉ có một cách đọc — đơn xin vào — và
//   người ĐƯỢC MỜI (b107, quản trị ngỏ lời trước) rơi lẫn vào đúng kết cục
//   thứ ba, nghe câu "đơn đang chờ duyệt" trong khi họ chưa nộp đơn nào.
//
// Trộn các câu này là gửi người ta đi tìm người quản lý trong khi họ chỉ cần
// gõ mật khẩu, bấm Nhận, hoặc ngồi chờ — ba việc khác hẳn nhau.

import * as repo from '../services/repo.js';
import { xinVaoCay, nhanLoiMoi, tuChoiLoiMoi } from '../services/sb.js';
import { mountDangNhap } from './dang-nhap.js';
import { mountTreeView } from './tree-view.js';
import { rongHop, vaiTroBangChu } from '../config.js';
import { stampNow } from '../utils/date.js';

/**
 * Hiện màn hình chờ, gọi repo.khoiTao(), rồi chuyển sang tree-view.
 * @returns {Promise<boolean>} true nếu người dùng đọc được cây
 */
export async function mountKhoiDong(containerEl) {
  hienManHinhCho(containerEl);

  let phien;
  try {
    phien = await repo.khoiTao();
  } catch (loi) {
    hienManHinhLoi(containerEl, loi);
    return false;
  }

  if (phien.loi) {
    hienManHinhLoi(containerEl, new Error(phien.loi));
    return false;
  }

  // Kết cục 1 — chưa đăng nhập. Đăng nhập xong thì chạy LẠI từ đầu hàm này,
  // chứ không gọi thẳng `mountTreeView`: phiên, quyền và cây đều phải lấy
  // lại, và `khoiTao()` là chỗ duy nhất biết thứ tự làm những việc ấy.
  if (!phien.daDangNhap) {
    mountDangNhap(containerEl, () => mountKhoiDong(containerEl));
    return false;
  }

  // Kết cục 2 — đăng nhập được nhưng chưa ai thêm vào gia phả nào.
  if (!phien.docDuoc) {
    hienManHinhKhongCoQuyen(containerEl, phien);
    return false;
  }

  // Kết cục 3 — mở thẳng sơ đồ.
  mountTreeView(containerEl);
  return true;
}

// ============================================================
// Các màn hình
// ============================================================

function hienManHinhCho(el) {
  el.innerHTML = '';
  // ⚠ Câu "Google có thể hỏi bạn cấp quyền" của bản Apps Script đã BỎ, và đó
  //   là một trong những thứ đáng giá nhất của cả lần chuyển nhà: màn hình
  //   *"Google chưa xác minh ứng dụng này"* — chỗ nhiều người trong họ dừng
  //   lại vì thấy chữ "không an toàn" — không còn tồn tại nữa.
  el.append(khung([
    tieuDe('Đang mở gia phả…'),
  ]));
}

/**
 * Đăng nhập được nhưng chưa ai thêm vào gia phả nào.
 *
 * ⚠ Đây KHÔNG phải màn hình lỗi, dù nó trông giống. Người rơi vào đây đã gõ
 *   đúng mật khẩu; việc còn thiếu nằm ở phía người quản lý, không ở phía họ.
 *   Nên câu chữ nói rõ phải nhắn cho ai, và **không** hiện lỗi kỹ thuật thô.
 */
function hienManHinhKhongCoQuyen(el, phien) {
  el.innerHTML = '';

  // ⚠ ĐỨNG ĐẦU MỌI NHÁNH (b110). Người rơi vào đây **có đủ quyền** — họ có
  //   chân trong cây, có khi còn là Quản trị hệ thống. Cái thiếu không phải
  //   quyền mà là cái cây: nó vừa bị xoá. Để nhánh nào bên dưới nuốt mất ca
  //   này là nói với một quản trị viên rằng họ "chưa được cấp quyền xem" —
  //   sai hẳn, và họ sẽ đi tìm người cấp quyền cho mình.
  //
  // ⚠ Chủ dự án chốt hình dạng của màn hình này (09/09/2026): *"nếu người nào
  //   đang có chân trong cây này thì nhận thông báo cây đã bị xoá bởi… vậy
  //   không lo màn hình trắng"*. Nên nó phải kể ĐÍCH DANH — tên cây, ai xin,
  //   ai duyệt. Một câu "gia phả đã bị xoá" trống không thì người đọc vẫn
  //   phải đi hỏi vòng quanh, tức vẫn là một ngõ cụt, chỉ lịch sự hơn.
  if (phien.trangThai === 'daxoa') {
    el.append(khung([
      tieuDe('Gia phả này đã bị xoá'),
      doan('“' + (phien.tenCay || 'Gia phả bạn đang mở') + '”' +
           (phien.maCay ? ' (' + phien.maCay + ')' : '') +
           ' đã được đưa vào thùng rác' +
           (phien.daXoaLuc ? ' lúc ' + stampNow(new Date(phien.daXoaLuc)) : '')
           + '.'),
      phien.emailXinXoa
        ? doan('Người xin xoá: ' + phien.emailXinXoa +
               (phien.emailDuyet ? ' — Quản trị hệ thống duyệt: ' +
                                   phien.emailDuyet : '') + '.')
        : null,
      phien.lyDo ? doan('Lý do: “' + phien.lyDo + '”') : null,
      doan(phien.laQuanTriHeThong
        ? 'Còn phục hồi được trong 30 ngày. Bạn là Quản trị hệ thống — mở ' +
          'trang Quản trị, khu Gia phả, khối Thùng rác.'
        : 'Còn phục hồi được trong 30 ngày. Nếu đây là nhầm lẫn, nhắn cho ' +
          'Quản trị hệ thống. Muốn sang gia phả khác thì mở trang Quản trị.'),
      veNutQuanTri(),
      phien.email ? nhoMo('Bạn đang đăng nhập bằng: ' + phien.email) : null,
    ]));
    return;
  }

  // ⚠ ĐỨNG TRƯỚC nhánh 'cho' — cả hai đều là dòng approved=false, nhưng
  //   người ĐƯỢC MỜI (b107) chưa nộp đơn nào và cần bấm Nhận/Từ chối NGAY
  //   TẠI ĐÂY, không phải mở trang Quản trị mới thấy. `luoc-do/14-loi-moi.sql`
  //   mục 6b — trước b108, nhánh 'cho' bên dưới nuốt luôn ca này và nói sai
  //   hẳn chuyện đang xảy ra ("đơn đang chờ duyệt").
  if (phien.trangThai === 'duocmoi') {
    el.append(khung([
      tieuDe('Bạn được mời vào gia phả'),
      doan((phien.tenCay || 'Một gia phả') + ' mời bạn vào, với vai ' +
           (vaiTroBangChu(phien.moiVai) || phien.moiVai || 'xem') + '.'),
      doan('Người mời: ' + (phien.emailNguoiMoi || '(không rõ)')),
      veKhoiNhanLoiMoi(el, phien),
      phien.email ? nhoMo('Bạn đang đăng nhập bằng: ' + phien.email) : null,
    ]));
    return;
  }

  // Đã nộp đơn rồi thì không có việc gì để làm ngoài chờ — hiện nút "Xin vào"
  // lần nữa chỉ khiến người ta bấm mãi và tưởng nút hỏng.
  if (phien.trangThai === 'cho') {
    el.append(khung([
      tieuDe('Đơn của bạn đang chờ duyệt'),
      doan('Bạn đã xin vào cây gia phả ' + (phien.tenHo || '') + '. ' +
           'Quản trị viên sẽ xem và duyệt.'),
      doan('Duyệt xong thì mở lại trang này là thấy sơ đồ, không phải làm gì thêm.'),
      nhoMo('Sốt ruột thì nhắn cho ' + (phien.nguoiQuanLy || '') + '.'),
      phien.email ? nhoMo('Bạn đang đăng nhập bằng: ' + phien.email) : null,
    ]));
    return;
  }

  // ⚠ Máy chủ này có nhiều gia phả, mà người đang đứng đây chưa có chân ở cây
  //   nào — nên KHÔNG có cây nào để xin vào bằng một cú bấm. Nói thật thay vì
  //   hiện một nút xin vào cây do máy chủ đoán hộ; trước 05/09/2026 nó đoán,
  //   và đoán bằng `limit 1` không `order by`.
  if (phien.trangThai === 'nhieucay') {
    el.append(khung([
      tieuDe('Bạn chưa được cấp quyền xem'),
      doan('Máy chủ này đang có ' + (phien.soCay || 'nhiều') + ' cây gia phả, ' +
           'và bạn chưa có chân trong cây nào.'),
      doan('Hãy nhắn cho ' + (phien.nguoiQuanLy || 'người quản lý') +
           ' để được thêm vào đúng cây của bạn.'),
      phien.email ? nhoMo('Bạn đang đăng nhập bằng: ' + phien.email) : null,
    ]));
    return;
  }

  el.append(khung([
    tieuDe('Bạn chưa được cấp quyền xem'),
    doan('Bạn chưa được cấp quyền xem cây gia phả ' + (phien.tenHo || '') + '.'),
    doan('Bấm nút dưới đây để xin vào. Quản trị viên duyệt xong thì bạn xem được.'),
    veKhoiXinVao(el, phien),
    nhoMo('Hoặc nhắn thẳng cho ' + (phien.nguoiQuanLy || '') + '.'),
    phien.email ? nhoMo('Bạn đang đăng nhập bằng: ' + phien.email) : null,
  ]));
}

/**
 * Hai nút "Nhận" / "Từ chối" cho lời mời — chữ ký thứ hai của b107.
 *
 * ⚠ Cả hai đường đều nạp lại TỪ ĐẦU (`mountKhoiDong(el)`), không tự vẽ màn
 *   hình kế tiếp tại đây. Trạng thái thật đã đổi ở máy chủ (nhận thì có chân
 *   trong cây, từ chối thì dòng biến mất) và `mountKhoiDong` là chỗ DUY NHẤT
 *   biết thứ tự hỏi lại phiên, quyền, cây — đúng lý lẽ đã ghi ở màn hình đăng
 *   nhập ngay phía trên.
 */
function veKhoiNhanLoiMoi(el, phien) {
  const hop = document.createElement('div');
  hop.style.cssText = 'display:flex;gap:10px;margin:16px 0';

  const nutNhan = document.createElement('button');
  nutNhan.type = 'button';
  nutNhan.textContent = 'Nhận lời mời';
  nutNhan.style.cssText =
    'flex:1;min-height:44px;font:inherit;font-size:15px;font-weight:600;' +
    'border-radius:9px;cursor:pointer;background:#2a2622;color:#fffdf9;' +
    'border:1px solid #2a2622';

  const nutTuChoi = document.createElement('button');
  nutTuChoi.type = 'button';
  nutTuChoi.textContent = 'Từ chối';
  nutTuChoi.style.cssText =
    'flex:1;min-height:44px;font:inherit;font-size:15px;font-weight:600;' +
    'border-radius:9px;cursor:pointer;background:#fffdf9;color:#2a2622;' +
    'border:1px solid #c8bfb2';

  const bao = document.createElement('p');
  bao.style.cssText = 'margin:10px 0 0;font-size:13px;line-height:1.5;color:#8a3a2a';

  const khoaCa = (khoa) => { nutNhan.disabled = khoa; nutTuChoi.disabled = khoa; };

  nutNhan.addEventListener('click', async () => {
    khoaCa(true);
    nutNhan.textContent = 'Đang nhận…';
    const kq = await nhanLoiMoi(phien.treeId);
    if (!kq || !kq.ok) {
      khoaCa(false);
      nutNhan.textContent = 'Nhận lời mời';
      bao.textContent = (kq && kq.loi) || 'Không nhận được lời mời. Thử lại sau.';
      return;
    }
    mountKhoiDong(el);
  });

  nutTuChoi.addEventListener('click', async () => {
    khoaCa(true);
    nutTuChoi.textContent = 'Đang từ chối…';
    const kq = await tuChoiLoiMoi(phien.treeId);
    if (!kq || !kq.ok) {
      khoaCa(false);
      nutTuChoi.textContent = 'Từ chối';
      bao.textContent = (kq && kq.loi) || 'Không từ chối được. Thử lại sau.';
      return;
    }
    mountKhoiDong(el);
  });

  hop.append(nutNhan, nutTuChoi);
  const boc = document.createElement('div');
  boc.append(hop, bao);
  return boc;
}

/**
 * Ô lời nhắn + nút "Xin vào gia phả".
 *
 * ⚠ Ô lời nhắn không phải trang trí. Admin nhìn hàng chờ chỉ thấy một địa chỉ
 *   email, mà email thì không nói được người ấy là ai trong họ — `hoangnam92@`
 *   là cháu ông nào? Một dòng tự giới thiệu biến việc duyệt từ đoán mò thành
 *   đọc. Vẫn để trống được: bắt buộc điền thì người ngại gõ sẽ gõ bừa.
 */
function veKhoiXinVao(el, phien) {
  const hop = document.createElement('div');
  hop.style.cssText = 'margin:16px 0';

  const o = document.createElement('textarea');
  o.rows = 2;
  o.maxLength = 500;
  o.placeholder = 'Bạn là ai trong họ? (không bắt buộc) — ví dụ: cháu nội cụ Bắc, con ông Hùng';
  o.style.cssText =
    'width:100%;box-sizing:border-box;padding:10px;font:inherit;font-size:14px;' +
    'border:1px solid #d8d0c6;border-radius:9px;background:#fffdf9;resize:vertical';

  const nut = document.createElement('button');
  nut.type = 'button';
  nut.textContent = 'Xin vào gia phả';
  nut.style.cssText =
    'margin-top:10px;width:100%;min-height:44px;font:inherit;font-size:15px;' +
    'font-weight:600;border-radius:9px;cursor:pointer;' +
    'background:#2a2622;color:#fffdf9;border:1px solid #2a2622';

  const bao = document.createElement('p');
  bao.style.cssText = 'margin:10px 0 0;font-size:13px;line-height:1.5';

  nut.addEventListener('click', async () => {
    nut.disabled = true;
    nut.textContent = 'Đang gửi…';
    const kq = await xinVaoCay(o.value, phien.treeId);
    if (!kq || !kq.ok) {
      nut.disabled = false;
      nut.textContent = 'Xin vào gia phả';
      bao.style.color = '#8a3a2a';
      bao.textContent = (kq && kq.loi) || 'Không gửi được đơn. Thử lại sau.';
      return;
    }
    // Vẽ lại cả màn hình thay vì sửa vài chữ tại chỗ: trạng thái đã đổi thật,
    // và màn hình "đang chờ" là màn hình khác hẳn, không phải màn hình này bớt
    // đi một nút.
    hienManHinhKhongCoQuyen(el, { ...phien, trangThai: 'cho' });
  });

  hop.append(o, nut, bao);
  return hop;
}

/** Lỗi mạng hoặc máy chủ — kèm nút Thử lại. */
function hienManHinhLoi(el, loi) {
  el.innerHTML = '';
  const nut = document.createElement('button');
  nut.textContent = 'Thử lại';
  nut.style.cssText = 'margin-top:16px;padding:10px 20px;font-size:16px;' +
                      'border:1px solid #c8bfb2;border-radius:8px;' +
                      'background:#fff;cursor:pointer';
  nut.addEventListener('click', () => mountKhoiDong(el));

  el.append(khung([
    tieuDe('Không mở được gia phả'),
    doan('Kiểm tra kết nối mạng rồi thử lại.'),
    nhoMo(String(loi && loi.message || loi)),
    nut,
  ]));
}

// ============================================================
// Vài mẩu DOM dùng chung. Không thư viện, không bước build.
// ============================================================

function khung(phanTu) {
  const d = document.createElement('div');
  d.style.cssText = 'max-width:' + rongHop(520, 680) + ';' +
                    'margin:0 auto;padding:32px 24px;' +
                    'font-family:system-ui,sans-serif;color:#2a2622;' +
                    'line-height:1.6';
  phanTu.filter(Boolean).forEach(x => d.append(x));
  return d;
}

function tieuDe(chu) {
  const h = document.createElement('h1');
  h.textContent = chu;
  h.style.cssText = 'font-size:20px;margin:0 0 12px';
  return h;
}

function doan(chu) {
  const p = document.createElement('p');
  p.textContent = chu;
  p.style.margin = '0 0 10px';
  return p;
}

/**
 * Nút sang trang Quản trị, khu Gia phả.
 *
 * ⚠ Có nút này thì màn hình *"gia phả nằm trong thùng rác"* mới là một lối
 *   đi chứ không phải một ngõ cụt — đúng lý lẽ đã dùng khi thêm nút
 *   *Mở trang Quản trị* vào Cài đặt ở b103 (gỡ khối Duyệt đi mà quên nút là
 *   lấy mất lối vào DUY NHẤT của cả trang ấy).
 */
function veNutQuanTri() {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = 'Mở trang Quản trị';
  b.style.cssText =
    'margin:14px 0 0;padding:9px 16px;border-radius:7px;font:inherit;' +
    'cursor:pointer;border:1px solid #2a2622;background:#2a2622;color:#fffdf9';
  b.addEventListener('click', () => {
    window.location.href = 'QuanTri.html#gia-pha';
  });
  return b;
}

function nhoMo(chu) {
  const p = document.createElement('p');
  p.textContent = chu;
  p.style.cssText = 'margin:16px 0 0;font-size:13px;color:#8a8078';
  return p;
}
