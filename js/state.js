// ============================================================
// giapha-supabase · js/state.js
// Vai trò  : Trạng thái dùng chung toàn app. CHỈ lớp pages được ghi.
// Lớp      : (đặc biệt) — chỉ đọc/ghi dữ liệu, không chứa logic
// Phụ thuộc: config
// Phiên bản: 0.6.0 · Cập nhật: 02/09/2026 22:45
// ============================================================
import { DEFAULT_SCOPE } from './config.js';

const MAC_DINH = {
  tree:           null,   // cây ở hình JSON cũ, do hinh-dang.rapCay() ráp lại
  index:          null,   // chỉ mục tra cứu, dựng bởi utils/graph.buildIndex
  treeId:         null,   // mã cây (uuid) đang mở

  // Số bản ghi của cây, đọc từ cột `trees.revision`.
  //
  // ⚠ Thay cho `headRevisionId` của bản Drive — cùng vai trò *"biết có ai vừa
  // sửa trước mình không"*, nhưng chắc chắn hơn hẳn: Drive buộc phải hỏi vân
  // tay rồi mới ghi, và giữa hai việc ấy luôn có một khe hở. Ở đây số này
  // được đọc và tăng bên trong CÙNG một giao dịch với lần ghi, nên không còn
  // khe hở nào — xem `luoc-do/03-ham-luu-cay.sql`, hàng rào 3.
  revision:       null,

  focusPersonId:  null,
  scope:          { ...DEFAULT_SCOPE },
  dirty:          false,  // có thay đổi chưa lưu hay không
  phien:          null,   // kết quả sb.layPhien(), xem services/sb.js

  // Có vẽ dâu/rể (nút biên) hay không. KHÔNG nằm trong `scope`: đây là bộ lọc
  // HẬU KỲ chạy sau computeVisibleSet, thuộc tuỳ chọn hiển thị chứ không thuộc
  // thuật toán — layout.js không cần biết nó tồn tại (QUY-TAC-VE §1).
  // Công tắc bật/tắt nằm cuối cột nút dưới trái của pages/tree-view.js.
  showInLaws: true,

  // Có vẽ hàng NGÀY GIỖ dưới mỗi ô hay không (bước 28).
  //
  // ⚠ Khác `showInLaws` một chỗ quan trọng: cái kia đổi AI được vẽ, cái này
  // đổi CHIỀU CAO Ô. Bật lên là mọi ô cao thêm một hàng chữ, kể cả ô của người
  // còn sống và người chưa ai điền ngày giỗ — luật "ô cao bằng nhau" không cho
  // ô co theo nội dung. Vì thế MẶC ĐỊNH TẮT.
  hienNgayGio: false,

  // Máy chủ có cắt chi tiết người còn sống trước khi trả cây hay không.
  // Giữ riêng để không lẫn "bị ẩn" với "gia phả còn thiếu" — hai thứ trông
  // giống hệt nhau trên màn hình mà kết luận ngược nhau.
  //
  // ⚠ Trên nền Supabase cờ này LUÔN `false`, vì việc ấy **chưa làm**. RLS lọc
  // theo DÒNG (ai thấy người nào), còn giấu ngày sinh của người còn sống là
  // lọc theo CỘT — một cơ chế khác, chưa viết. Giữ nguyên cờ ở đây để
  // `pages/` không phải đổi, nhưng đừng bật nó lên khi chưa có luật đứng sau.
  daLocNguoiConSong: false,
};

export const state = { ...MAC_DINH, scope: { ...DEFAULT_SCOPE } };

const nguoiNghe = new Set();

/** Đặt lại toàn bộ trạng thái về mặc định. */
export function resetState() {
  Object.assign(state, MAC_DINH, { scope: { ...DEFAULT_SCOPE } });
  notify();
}

/** Đăng ký hàm chạy khi state đổi. Trả về hàm huỷ đăng ký. */
export function subscribe(fn) {
  nguoiNghe.add(fn);
  return () => nguoiNghe.delete(fn);
}

/** Báo cho các subscriber biết state vừa đổi. */
export function notify() {
  for (const fn of nguoiNghe) {
    try {
      fn(state);
    } catch (e) {
      // Một người nghe hỏng không được làm chết những người còn lại.
      console.error('[state] lỗi trong subscriber:', e);
    }
  }
}
