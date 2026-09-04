// ============================================================
// giapha-supabase · js/app-quan-tri.js
// Vai trò  : Điểm khởi động của trang QuanTri.html — trang duyệt nội dung.
// Lớp      : pages
// Phụ thuộc: pages/quan-tri
// Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 23:35
// ============================================================
//
// Đối xứng `js/app.js`, và cố ý giữ mỏng đúng như thế: một điểm khởi động chỉ
// làm hai việc — tìm chỗ để vẽ, và giao lại cho màn hình.
//
// ⚠ **Hai trang, hai điểm khởi động, KHÔNG chung một file.** Nhập chung rồi rẽ
//   nhánh theo địa chỉ trang thì trang duyệt sẽ kéo theo cả `tree-view.js` và
//   mọi thứ nó `import` — tức cả bộ vẽ sơ đồ — về máy người chỉ định đọc một
//   cái bảng.

import { mountQuanTri } from './pages/quan-tri.js';

async function main() {
  const el = document.getElementById('app');
  if (!el) {
    console.error('[quan-tri] không tìm thấy phần tử #app trong QuanTri.html');
    return;
  }
  await mountQuanTri(el);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  // Module tải xong sau khi DOM đã sẵn sàng thì sự kiện trên không bắn nữa.
  main();
}
