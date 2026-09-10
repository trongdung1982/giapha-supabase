// ============================================================
// giapha-supabase · js/domains/so-sanh.js
// Vai trò  : Xếp phẳng kết quả `chiTietKiemDuyet()` (services/sb.js) thành
//            bảng kiểu Excel — Người · Trường · Trước · Sau · Loại — cho màn
//            hình Duyệt mở rộng một dòng.
// Lớp      : domains — được gọi bởi: pages · được phép gọi: utils, config
// Phụ thuộc: utils/text.js (fullName), utils/date.js (formatDate)
// Phiên bản: 0.1.0 · Cập nhật: 10/09/2026 (b111)
// ============================================================
//
// ═══ VÌ SAO FILE MỚI, KHÔNG NHÉT VÀO `hinh-dang.js` ═══
//
// `hinh-dang.js` là service — nó đổi qua lại giữa DÒNG Postgres và HÌNH CÂY
// mà `domains/` chờ đợi (`BAT-DAU.md` mục 1: `domains/` không được sửa, và
// mười file ấy không biết chữ `photo_file_id`). File này làm việc khác hẳn:
// nó nhận NGUYÊN VĂN hai dòng Postgres (`truoc`/`sau`, snake_case, thẳng từ
// RPC) rồi so ra bảng hiển thị — không đổi hình, không ráp cây, không chạm
// mạng. Đó là việc của `domains/`, và nó không cần biết `services/sb.js` tồn
// tại — tham số vào chỉ là JSON thô mà `pages/quan-tri/khu-kiem-duyet.js` đã
// đọc được từ RPC.
//
// ═══ QUY ƯỚC "TRƯỜNG KHÔNG ĐỔI THÌ KHÔNG VẼ DÒNG" ═══
//
// `KE-HOACH.md` b111 chốt: chỉ những Ô THẬT SỰ ĐỔI mới lên bảng. Một lần Lưu
// sửa một trường trong sáu bản ghi bị đụng thì bảng chỉ có MỘT dòng, không
// phải sáu × hai mươi cột.
//
// ⚠ Không dùng `JSON.stringify` để so — cùng bẫy `hinh-dang.js` đã ghi lại:
//   hai object cùng nội dung khác thứ tự khoá cho ra hai chuỗi khác nhau.
//
// ═══ "TRƯỚC/SAU" LÀ GÌ KHI BẢN GHI KHÔNG TỒN TẠI ═══
//
// `truoc: null` = bản ghi CHƯA TỪNG có (lần Lưu này tạo mới) — mọi trường coi
// như đổi từ "(trống)". `sau: null` = bản ghi NAY KHÔNG CÒN trong bảng (đã bị
// xoá cứng bởi một *Dọn thùng rác* SAU lần Lưu này) — mọi trường coi như đổi
// thành "(đã xoá)". Cả hai ca đều hợp lệ, không phải lỗi dữ liệu.

import { fullName } from '../utils/text.js';
import { formatDate } from '../utils/date.js';

// ============================================================
// NHÃN LOẠI BẢN GHI, VÀ TRƯỜNG CỦA TỪNG LOẠI
// ============================================================
// Khoá đúng tên khối JSON `chi_tiet_kiem_duyet()` trả về
// (`19-kiem-duyet-chi-tiet.sql`). Danh sách trường đúng thứ tự cột của
// `luoc-do/01-bang.sql`, trừ `tree_id`/`id` (khoá, không phải trường đổi).

const NHAN_LOAI = {
  nguoi: 'Người', honnhan: 'Hôn nhân', con: 'Quan hệ cha mẹ – con',
  anh: 'Ảnh', nguon: 'Nguồn', cay: 'Thông tin chung của gia phả',
};

const TRUONG = {
  nguoi: {
    uid: 'Mã neo', names: 'Họ tên', sex: 'Giới tính', birth: 'Ngày sinh',
    death: 'Ngày mất', burial_place: 'Nơi an táng', title: 'Chức tước',
    occupation: 'Nghề nghiệp', education: 'Học vấn', religion: 'Tôn giáo',
    residence: 'Nơi ở', nationality: 'Dân tộc', living: 'Còn sống',
    photo_file_id: 'Ảnh đại diện', note: 'Ghi chú', deleted: 'Đã xoá',
    vn: 'Đời · Chi · ngày giỗ', meta: 'Thông tin hệ thống', branch_id: 'Chi/nhánh',
  },
  honnhan: {
    uid: 'Mã neo', partners: 'Vợ/chồng', partner_order: 'Thứ tự trên sơ đồ',
    ranks: 'Thứ bậc (cả/thứ)', status: 'Tình trạng hôn nhân',
    marriage: 'Ngày cưới', note: 'Ghi chú', deleted: 'Đã xoá',
  },
  con: { relation: 'Quan hệ', ord: 'Thứ tự con' },
  anh: {
    subject_id: 'Của ai/cặp nào', drive_file_id: 'Ảnh (bản nhỏ)',
    drive_file_id_lon: 'Ảnh (bản lớn)', caption: 'Chú thích', year: 'Năm',
    deleted: 'Đã xoá', meta: 'Thông tin hệ thống',
  },
  nguon: { title: 'Tên nguồn', author: 'Tác giả', note: 'Ghi chú' },
  cay: { name: 'Tên gia phả', root_person_id: 'Người trung tâm mặc định', note: 'Ghi chú' },
};

// ============================================================
// CỬA VÀO
// ============================================================

/**
 * @param {object} banGhi  `chiTietKiemDuyet(...).banGhi` — nguyên văn từ RPC.
 * @returns {Array<{loai:string, nhanLoai:string, nguoi:string, truong:string,
 *   truoc:string, sau:string}>}
 */
export function bangPhang(banGhi) {
  const ra = [];
  if (!banGhi) return ra;

  for (const loai of ['nguoi', 'honnhan', 'anh', 'nguon']) {
    for (const bg of banGhi[loai] || []) xepMotBanGhi(ra, loai, nhanBanGhi(loai, bg), bg.truoc, bg.sau);
  }
  for (const bg of banGhi.con || []) {
    xepMotBanGhi(ra, 'con', nhanCon(bg), bg.truoc, bg.sau);
  }
  if (banGhi.cay) {
    xepMotBanGhi(ra, 'cay', NHAN_LOAI.cay, banGhi.cay.truoc, banGhi.cay.sau);
  }
  return ra;
}

// ============================================================
// TỪNG BẢN GHI — RA TỪNG DÒNG Ô
// ============================================================

function xepMotBanGhi(ra, loai, nhanNguoi, truoc, sau) {
  const truong = TRUONG[loai];
  for (const khoa of Object.keys(truong)) {
    const gTruoc = truoc ? truoc[khoa] : undefined;
    const gSau   = sau   ? sau[khoa]   : undefined;
    if (bangNhau(gTruoc, gSau)) continue;
    ra.push({
      loai, nhanLoai: NHAN_LOAI[loai], nguoi: nhanNguoi, truong: truong[khoa],
      truoc: hienGiaTri(khoa, gTruoc), sau: hienGiaTri(khoa, gSau),
    });
  }
}

/** Tên hiển thị của MỘT bản ghi người/hôn nhân/ảnh/nguồn — ưu tiên `sau`. */
function nhanBanGhi(loai, bg) {
  const dong = bg.sau || bg.truoc;
  if (!dong) return bg.id;
  if (loai === 'nguoi') {
    const ten = fullName({ names: dong.names });
    return ten ? ten + ' (' + bg.id + ')' : bg.id;
  }
  if (loai === 'honnhan') {
    const doiTac = Array.isArray(dong.partners) && dong.partners.length
      ? dong.partners.join(' + ') : '';
    return 'Hôn nhân ' + bg.id + (doiTac ? ' (' + doiTac + ')' : '');
  }
  return bg.id;
}

function nhanCon(bg) {
  return 'Con ' + bg.personId + ' trong hôn nhân ' + bg.unionId;
}

// ============================================================
// SO SÁNH VÀ HIỂN THỊ MỘT GIÁ TRỊ
// ============================================================

/**
 * Trống theo đúng luật `CLAUDE.md` mục 7: "trường trống thì KHÔNG vẽ hàng
 * đó, không ghi 'Không rõ'". Áp cho cả object — ngày trống mặc định
 * `{iso:null,raw:'',place:''}` phải đếm là trống, không phải "có ba khoá".
 */
function rong(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.values(v).every(rong);
  return false;
}

/** `dd/mm/yyyy` cho ba khối ngày; tên đầy đủ cho `names`; còn lại đọc thẳng. */
function hienGiaTri(khoa, v) {
  if (rong(v)) return '';
  if (khoa === 'names') return fullName({ names: v });
  if (khoa === 'birth' || khoa === 'death' || khoa === 'marriage') return formatDate(v);
  if (typeof v === 'boolean') return v ? 'Có' : 'Không';
  if (Array.isArray(v)) return v.join(' · ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/**
 * So hai giá trị TRÊN DÒNG POSTGRES (không phải hình domains/). Hai giá trị
 * cùng TRỐNG (dù một bên `undefined` do bản ghi vắng mặt, bên kia `''`/`[]`
 * do cột có giá trị mặc định) coi là BẰNG NHAU — nếu không, mọi trường trống
 * của một bản ghi MỚI TẠO sẽ ra một dòng "trống → trống", đúng cái luật mục 7
 * cấm.
 */
function bangNhau(a, b) {
  if (a === b) return true;
  if (rong(a) && rong(b)) return true;
  if (rong(a) || rong(b)) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!bangNhau(a[i], b[i])) return false;
    return true;
  }

  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!bangNhau(a[k], b[k])) return false;
  }
  return true;
}
