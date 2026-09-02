// ============================================================
// giapha-supabase · js/pages/khoi-dong.js
// Vai trò  : Màn hình mở đầu — chờ máy chủ trả danh tính và quyền,
//            báo lỗi rõ ràng nếu người dùng chưa đăng nhập hoặc chưa có quyền.
// Lớp      : pages
// Phụ thuộc: services/repo, pages/dang-nhap, pages/tree-view
// Phiên bản: 0.8.0 · Cập nhật: 02/09/2026 22:45
// ============================================================
//
// ⚠ **ĐỔI SO VỚI BẢN APPS SCRIPT: có thêm một kết cục thứ ba.**
//
// Trên nền Google, người mở app bao giờ cũng đã đăng nhập sẵn — câu hỏi duy
// nhất là "có được chia sẻ file không". Ở đây có ba câu, và phải trả lời đúng
// câu, vì chúng dẫn tới ba việc khác hẳn nhau:
//
//   chưa đăng nhập            → mở màn hình đăng nhập  (người dùng tự làm được)
//   đăng nhập, chưa ở cây nào → nhờ người quản lý thêm (phải nhắn cho ai đó)
//   đọc được                  → mở sơ đồ
//
// Trộn hai câu đầu là gửi người ta đi tìm người quản lý trong khi họ chỉ cần
// gõ mật khẩu — hoặc ngược lại, bắt họ gõ đi gõ lại một mật khẩu vốn đã đúng.

import * as repo from '../services/repo.js';
import { mountDangNhap } from './dang-nhap.js';
import { mountTreeView } from './tree-view.js';
import { rongHop } from '../config.js';

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
  el.append(khung([
    tieuDe('Bạn chưa được cấp quyền xem'),
    doan('Bạn chưa được cấp quyền xem cây gia phả ' + (phien.tenHo || '') + '.'),
    doan('Liên hệ ' + (phien.nguoiQuanLy || '') + ' để được thêm vào.'),
    phien.email ? nhoMo('Bạn đang đăng nhập bằng: ' + phien.email) : null,
  ]));
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

function nhoMo(chu) {
  const p = document.createElement('p');
  p.textContent = chu;
  p.style.cssText = 'margin:16px 0 0;font-size:13px;color:#8a8078';
  return p;
}
