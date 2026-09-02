// ============================================================
// giapha-supabase · js/services/tuong-thich.js
// Vai trò  : Giàn giáo tạm. Giữ nguyên hình những lệnh mà bảy màn hình đang
//            gọi từ `services/gas.js`, để chúng chạy được trên nền Supabase
//            mà chưa phải sửa.
// Lớp      : services — được gọi bởi: pages · gọi: services/sb, state
// Phụ thuộc: services/sb.js, state.js, utils/image.js
// Phiên bản: 0.1.0 · Cập nhật: 02/09/2026 22:45
// ============================================================
//
// ═══ FILE NÀY LÀ GIÀN GIÁO, KHÔNG PHẢI KIẾN TRÚC ═══
//
// Nó tồn tại vì một lý do hẹp: bảy file trong `pages/` viết
// `import … from '../services/gas.js'`, mà `gas.js` không còn tồn tại trên
// nền này. Thiếu một module là **cả app không nạp được**, không phải một màn
// hình hỏng — nên phải có một cái gì đó đứng đúng chỗ ấy ngay từ đầu.
//
// Ba loại hàm nằm chung trong đây, và phải phân biệt cho rõ:
//
//   ✓ CHẠY THẬT   — đã có đường tương đương trên Supabase, chỉ đổi lối gọi
//   ⚠ ĐỔI HÌNH    — chạy được nhưng ý nghĩa khác bản cũ, đọc chú thích
//   ⛔ CHƯA LÀM    — ném lỗi có câu chữ đàng hoàng, KHÔNG trả về giả vờ thành công
//
// ⛔ quan trọng hơn cả. Một hàm chưa làm mà trả `{ ok: true }` cho êm chuyện
// là kiểu hỏng tệ nhất trong app này: màn hình báo *"đã sao lưu"* trong khi
// chưa có bản sao lưu nào, và người ta chỉ biết vào đúng ngày cần tới nó.
//
// ⚠ **Đích đến là XOÁ HẲN file này.** Mỗi màn hình được rà lại thì gọi thẳng
//   `services/sb.js` với chữ ký đúng, và bớt một mục ở đây. Còn dòng nào
//   trong file này là còn một màn hình chưa được rà.

import * as sb from './sb.js';
import { state } from '../state.js';

/** Cây đang mở. Ném lỗi thay vì gửi `undefined` xuống máy chủ. */
function maCay() {
  if (!state.treeId) {
    throw new Error('Chưa mở gia phả nào nên chưa làm được việc này.');
  }
  return state.treeId;
}

function chuaLam(ten, vaSao) {
  return () => {
    throw new Error('Chức năng "' + ten + '" chưa làm xong trên nền Supabase. '
                    + vaSao);
  };
}

// ============================================================
// ✓ CHẠY THẬT
// ============================================================

/** Có nối được xuống máy chủ không. */
export const coMayChu = sb.coKetNoi;

/** Ghi người trung tâm mặc định của riêng người đang đăng nhập. */
export function datNguoiTrungTamMacDinh(personId) {
  return sb.datNguoiTrungTamMacDinh(maCay(), personId);
}

/** Xoá giá trị đã đặt, quay về gốc cây. */
export function xoaNguoiTrungTamMacDinh() {
  return sb.xoaNguoiTrungTamMacDinh(maCay());
}

/** Danh sách gia phả người đang đăng nhập mở được. */
export const layDanhSachGiaPha = sb.layDanhSachGiaPha;

/** Đổi sang một gia phả khác. Nơi gọi phải NẠP LẠI CÂY sau khi hàm này gật. */
export const chonGiaPha = sb.chonGiaPha;

// ============================================================
// ⚠ ĐỔI HÌNH
// ============================================================

/**
 * Tải một tấm ảnh lên kho.
 *
 * ⚠ **Vẫn nhận base64 dù Supabase nhận Blob thẳng.** Hai chỗ gọi
 * (`form-anh.js`, `person-edit.js`) đang cầm sẵn chuỗi base64 do
 * `utils/image.compressImage()` trả về, nên đổi ở đây là đổi cả hai màn hình.
 * Giàn giáo này giải mã ngược base64 về Blob rồi mới gửi — tốn một lần chép
 * bộ nhớ cho mỗi tấm, và đó là cái giá tạm thời phải chịu.
 *
 * Khi rà lại hai màn hình ấy: `compressImage` vốn đã dựng Blob **trước khi**
 * mã hoá base64. Nơi gọi chỉ việc dừng sớm một bước, rồi gọi thẳng
 * `sb.taiAnh(treeId, blob, ten)` — bỏ được cả bước mã hoá lẫn bước giải mã,
 * và bỏ luôn 33% dung lượng mà base64 phình ra.
 *
 * ⚠ `fileId` trả về nay là **đường dẫn trong kho** (`<tree_id>/<tên>.jpg`),
 * không phải mã file Drive. Nó được cất vào `media.driveFileId` — tên trường
 * còn chữ "drive" là một vết sẹo có chủ ý, xem `luoc-do/01-bang.sql` mục 7.
 *
 * @returns {Promise<{ok:boolean, fileId:string, loi:string|null}>}
 */
export async function taiAnh(base64, tenFile) {
  let blob;
  try {
    blob = base64ThanhBlob(base64);
  } catch (e) {
    return { ok: false, fileId: '', loi: 'Ảnh hỏng, không đọc ra được nội dung.' };
  }
  const kq = await sb.taiAnh(maCay(), blob, tenFile);
  return { ok: kq.ok, fileId: kq.duongDan || '', loi: kq.loi };
}

/** Xoá CẢ LOẠT ảnh — bước cuối của một lần *Dọn thùng rác*. */
export const xoaAnhThat = sb.xoaAnhThat;

/**
 * Xoá MỘT ảnh. Bản cũ cho vào thùng rác Drive nên còn lấy lại được;
 * ⚠ ở đây là **xoá hẳn khỏi kho, không có thùng rác nào**.
 */
export function xoaAnhThu(duongDan) {
  return sb.xoaAnhThat([duongDan]);
}

// ============================================================
// ⛔ CHƯA LÀM
// ============================================================

// --- Sao lưu (`pages/backup.js`) ---
//
// Trên Drive, sao lưu là chép một file JSON sang thư mục khác. Ở đây không
// còn "một file" nào để chép. `KE-HOACH-HA-TANG-Supabase_V01.md` bước **H8**
// đã giao việc này cho Apps Script chạy nền: một trigger định kỳ đọc REST API
// của Supabase rồi ghi file JSON ra Drive — tức bản sao lưu nằm NGOÀI
// Supabase, đúng tinh thần "sao lưu độc lập".
//
// ⚠ Cho tới lúc ấy, **gia phả trên Supabase chưa có bản sao lưu nào.** Đây là
//   việc gấp nhất trong danh sách còn dở, không phải việc để dành.

const LY_DO_SAO_LUU =
  'Sao lưu trên nền Supabase làm bằng một trigger Apps Script chạy nền ' +
  '(bước H8 của kế hoạch hạ tầng), chưa viết.';

export const layDanhSachSaoLuu = chuaLam('Danh sách bản sao lưu', LY_DO_SAO_LUU);
export const saoLuuNgay        = chuaLam('Sao lưu ngay',          LY_DO_SAO_LUU);
export const xemBanSaoLuu      = chuaLam('Xem bản sao lưu',       LY_DO_SAO_LUU);
export const khoiPhucSaoLuu    = chuaLam('Khôi phục sao lưu',     LY_DO_SAO_LUU);

// --- Dựng gia phả mới (`pages/chon-gia-pha.js`) ---
export const taoFileDuLieuMoi = chuaLam('Dựng gia phả mới',
  'Trên Postgres việc này cần một hàm security definer trong cơ sở dữ liệu, ' +
  'vì 02-rls.sql cố ý không cấp cho trình duyệt quyền ghi vào bảng trees.');

// --- Bỏ chọn gia phả (`pages/chon-gia-pha.js`) ---
//
// ⚠ Bản Drive có một "gia phả mặc định" ghi cứng trong `Config.gs`, nên *bỏ
//   chọn* có nghĩa: xoá lựa chọn riêng đi và quay về cây mặc định ấy. Nền này
//   **không có cây mặc định** — mỗi người thấy đúng những cây họ được thêm
//   vào, và cây đầu tiên trong danh sách đóng vai ấy. Nên hàm này không còn
//   việc gì để làm, và giả vờ làm được là nói dối về một thứ không tồn tại.
export const boChonGiaPha = chuaLam('Bỏ chọn gia phả',
  'Nền Supabase không có "gia phả mặc định" để quay về — mỗi người chỉ thấy ' +
  'những gia phả họ được thêm vào. Dùng nút chọn gia phả thay cho nút này.');

// --- Quyền chia sẻ ảnh trên Drive ---
//
// ⚠ Ba hàm này KHÔNG có bản tương đương, và đó là tin tốt chứ không phải
//   thiếu sót. Chúng sinh ra để đối phó với một nỗi khổ riêng của Drive: ảnh
//   chỉ hiện được khi file đã mở quyền "bất kỳ ai có đường liên kết", nên app
//   phải đi hỏi quyền từng tấm rồi xin mở. Kho Supabase không có nỗi khổ ấy —
//   quyền là quyền của cả kho, đặt một lần ở `01-bang.sql`.
export const trangThaiQuyenAnh = chuaLam('Kiểm quyền ảnh',
  'Nền Supabase không phân quyền theo từng tấm ảnh — cả kho một luật.');
export const moQuyenXemAnh = chuaLam('Mở quyền xem ảnh',
  'Nền Supabase không phân quyền theo từng tấm ảnh — cả kho một luật.');
export const layAnhBase64 = chuaLam('Đọc ảnh qua máy chủ',
  'Đường vòng này sinh ra vì Drive chặn ảnh chưa mở quyền. Kho Supabase ' +
  'trả ảnh thẳng cho thẻ <img>, không cần đường vòng.');

// ============================================================
// Mẩu dùng chung
// ============================================================

/**
 * Chuỗi base64 → Blob.
 *
 * ⚠ Chuyển theo TỪNG KHỐI 8KB chứ không một lần. `String.fromCharCode(...ds)`
 *   trên một mảng 400.000 phần tử là 400.000 tham số cho một lần gọi hàm —
 *   trình duyệt ném `RangeError: Maximum call stack size exceeded`, và nó chỉ
 *   ném với ảnh LỚN, tức chỉ hỏng ở bản 1600px dùng để in, tức chỉ hỏng đúng
 *   lúc không ai đang ngồi thử.
 */
function base64ThanhBlob(base64, mime = 'image/jpeg') {
  const chuoi = String(base64 || '').replace(/^data:[^,]*,/, '');
  const nhiPhan = atob(chuoi);
  const khoi = [];
  const CO_KHOI = 8192;

  for (let i = 0; i < nhiPhan.length; i += CO_KHOI) {
    const lat = new Uint8Array(Math.min(CO_KHOI, nhiPhan.length - i));
    for (let j = 0; j < lat.length; j++) lat[j] = nhiPhan.charCodeAt(i + j);
    khoi.push(lat);
  }
  return new Blob(khoi, { type: mime });
}
