// ============================================================
// giapha-supabase · js/app.js
// Vai trò  : Điểm khởi động phía trình duyệt.
// Lớp      : pages
// Phụ thuộc: pages/khoi-dong
// Phiên bản: 0.4.0 · Cập nhật: 02/09/2026 22:45
// ============================================================

import { mountKhoiDong } from './pages/khoi-dong.js';

/**
 * Khởi động:
 *   1. Mở màn hình chờ
 *   2. repo.khoiTao() — lấy danh tính, quyền, và cây
 *   3. Chưa đăng nhập  -> màn hình đăng nhập
 *   4. Chưa có quyền   -> màn hình giải thích, dừng
 *   5. Có quyền        -> mở tree-view
 */
async function main() {
  const el = document.getElementById('app');
  if (!el) {
    console.error('[app] không tìm thấy phần tử #app trong index.html');
    return;
  }
  await mountKhoiDong(el);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  // Module tải xong sau khi DOM đã sẵn sàng thì sự kiện trên không bắn nữa.
  main();
}
