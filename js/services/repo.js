// ============================================================
// giapha-supabase · js/services/repo.js
// Vai trò  : Nạp/lưu cây gia phả, dựng chỉ mục, giữ trạng thái phiên.
// Lớp      : services — được gọi bởi: pages · gọi: services/sb,
//            services/hinh-dang, utils, state
// Phụ thuộc: services/sb.js, services/hinh-dang.js, utils/graph.js, state.js
// Phiên bản: 0.2.0 · Cập nhật: 05/09/2026 11:09
// ============================================================
//
// ═══ RANH GIỚI ĐỔI KHO LƯU TRỮ ═══
//
// File này và `sb.js` là **hai file duy nhất** phải viết lại khi đổi Drive
// sang Supabase. `domains/` và `pages/` không đổi một dòng.
//
// Đó không phải may mắn — luật phân lớp `config → utils → services →
// domains → pages` của `CLAUDE.md` mục 5 sinh ra chính là để hôm nay đỡ được
// việc này. `BAT-DAU.md` mục 1 nói thẳng: *"Ngày nào thấy mình đang sửa
// `domains/` là ngày phải dừng lại hỏi vì sao."*
//
// ═══ NHỮNG CHỮ KÝ HÀM Ở ĐÂY LÀ HỢP ĐỒNG, KHÔNG PHẢI CHI TIẾT ═══
//
// `khoiTao` · `napCay` · `luuCay(apDung, moTa)` · `suaDuoc` · `docDuoc` giữ
// **đúng** hình dạng của bản Apps Script. Mười ba file trong `pages/` gọi
// chúng. Đổi một tham số ở đây là đổi mười ba file kia — và mười ba file kia
// là phần đã chạy đúng suốt 84 bước.
//
// ═══ CHỖ DUY NHẤT KHÁC HÌNH SO VỚI BẢN CŨ ═══
//
// `state.headRevisionId` (chuỗi vân tay của Google Drive) đổi thành
// `state.revision` (số nguyên của bảng `trees`). Cùng vai trò: biết có ai vừa
// sửa trước mình hay không. Khác chỗ: số ấy là của ta, tăng bên trong cùng
// một giao dịch với lần ghi, nên không có khe hở giữa lúc kiểm và lúc ghi —
// khe hở mà cơ chế trên Drive buộc phải sống chung.

import * as sb from './sb.js';
import { rapCay, soSanh, coGiDeGhi } from './hinh-dang.js';
import { state, notify } from '../state.js';
import { buildIndex } from '../utils/graph.js';
import { DATA_VERSION } from '../config.js';

/**
 * Gọi khi mở app: lấy danh tính và quyền, rồi nạp cây.
 *
 * ⚠ Có BA kết cục, không phải hai như bản Apps Script. Trên nền Google, người
 *   dùng bao giờ cũng đã đăng nhập sẵn — chỉ hỏi "có quyền đọc file không".
 *   Ở đây thêm kết cục thứ ba: **chưa đăng nhập**. `pages/khoi-dong.js` nhìn
 *   cờ `daDangNhap` để mở màn hình đăng nhập, chứ không mở màn hình
 *   "bạn chưa được cấp quyền" — hai câu ấy nói với hai người khác nhau, và
 *   nói nhầm thì người ta đi tìm người quản lý trong khi chỉ cần gõ mật khẩu.
 *
 * @returns {Promise<object>} chính là phiên máy chủ trả về
 */
export async function khoiTao() {
  const phien = await sb.layPhien();
  state.phien = phien;

  if (!phien.daDangNhap) return phien;   // chưa đăng nhập
  if (!phien.docDuoc)    return phien;   // đăng nhập rồi nhưng chưa ở cây nào

  await napCay();
  state.focusPersonId = chonNguoiTrungTam(phien);

  // Công tắc *Hiện hàng ngày giỗ*, nhớ riêng cho từng cây của từng người.
  // ⚠ Trước 05/09/2026 nó không được lưu ở đâu cả — tắt trình duyệt là mất.
  state.hienNgayGio = phien.hienNgayGio === true;

  return phien;
}

/**
 * Đọc cây, ráp lại thành hình JSON cũ, dựng chỉ mục tra cứu.
 * Ném lỗi nếu máy chủ từ chối hoặc dữ liệu hỏng — `pages/khoi-dong.js` bắt và
 * hiện màn hình lỗi kèm nút Thử lại.
 */
export async function napCay() {
  const treeId = state.phien && state.phien.treeId;
  if (!treeId) throw new Error('Chưa biết đang mở gia phả nào.');

  const kq = await sb.layDong(treeId);
  if (!kq)    throw new Error('Máy chủ không trả về gì khi đọc cây gia phả.');
  if (!kq.ok) throw new Error(kq.loi || 'Máy chủ từ chối trả cây gia phả.');

  const cay = kiemPhienBan(rapCay(kq.dong));

  state.treeId   = treeId;
  state.tree     = cay;
  state.index    = buildIndex(cay);
  state.revision = cay.tree.revision;

  // Bản Apps Script còn một cờ `daLocNguoiConSong` — máy chủ cắt chi tiết
  // người còn sống trước khi trả cây cho người chỉ có quyền xem. Trên nền này
  // **chưa làm**: `02-rls.sql` lọc theo DÒNG, còn việc ấy phải lọc theo CỘT.
  // Đừng đặt lại cờ ấy về `true` cho tới khi có luật thật đứng sau nó.
  state.daLocNguoiConSong = false;

  console.log(
    '[repo] nạp cây: ' + state.index.personById.size + ' người, ' +
    state.index.unionById.size + ' hôn nhân, revision ' + state.revision);

  canhBaoThieuUid(cay);
  return cay;
}

/**
 * Chọn người đứng giữa sơ đồ, theo thứ tự ưu tiên.
 *
 * Mỗi bước đều kiểm người đó CÒN trong chỉ mục hay không. Giá trị lưu ở
 * `user_settings` là một mã chép từ lúc trước; người đó có thể đã bị xoá từ
 * lâu. Không kiểm thì sơ đồ mở ra trống trơn mà không báo gì.
 */
function chonNguoiTrungTam(phien) {
  const con = (id) => !!(id && state.index && state.index.personById.has(id));

  if (con(phien.nguoiTrungTamMacDinh)) return phien.nguoiTrungTamMacDinh;

  const goc = state.tree && state.tree.tree && state.tree.tree.rootPersonId;
  if (con(goc)) return goc;

  const dau = state.index && state.index.personById.keys().next();
  return (dau && !dau.done) ? dau.value : null;
}

/**
 * Lưu cây.
 *
 * ⚠ KHÔNG nhận sẵn một cây đã sửa, mà nhận HÀM SỬA. Luật này chốt 17/08/2026
 * và vẫn nguyên giá trị: *giao diện chỉ đổi SAU khi máy chủ xác nhận*. Nếu
 * nơi gọi sửa thẳng vào `state.tree` rồi mới gọi lưu, thì lúc máy chủ từ chối
 * — hết quyền, xung đột, mất mạng — màn hình đã hiện một điều không đúng sự
 * thật, và không còn bản gốc nào để lùi về.
 *
 * Cách làm: nhân đôi cây, cho `apDung` sửa trên BẢN SAO, **so hai bản** rồi
 * gửi đúng phần khác biệt. Máy chủ gật thì bản sao mới trở thành `state.tree`.
 * Máy chủ lắc thì `state.tree` chưa hề bị đụng vào.
 *
 * Xung đột thì CỐ Ý KHÔNG cập nhật `state.revision`. Nghe có vẻ tiện — "cập
 * nhật rồi lưu lại là xong" — nhưng đó chính là ghi đè mất bản của người kia,
 * tức tự tay làm đúng cái việc mà cả cơ chế này sinh ra để chặn. Đường ra duy
 * nhất là nạp lại cây.
 *
 * @param {function(object):void} apDung  sửa trên bản sao cây; không trả về gì
 * @param {{action?:string, target?:string, note?:string, diff?:object}} [moTa]
 *        `ts` và `by` do máy chủ điền, gửi lên cũng bỏ qua.
 * @returns {Promise<{ok:boolean, lyDo:string|null, loi:string|null,
 *                    revision?:number}>}
 */
export async function luuCay(apDung, moTa) {
  if (!state.tree) {
    return tuChoi('chuanapcay', 'Chưa nạp được gia phả nên chưa lưu được gì.');
  }
  if (!suaDuoc()) {
    return tuChoi('khongcoquyen',
      'Bạn chỉ có quyền xem gia phả, không sửa được. ' +
      'Cần sửa thì nhờ người quản lý đổi quyền cho tài khoản của bạn.');
  }

  // Nhân đôi bằng JSON: cây vốn là dữ liệu JSON thuần, không hàm, không Date,
  // không tham chiếu vòng — nên phép này an toàn.
  const banNhap = JSON.parse(JSON.stringify(state.tree));
  if (typeof apDung === 'function') apDung(banNhap);

  const ops = soSanh(state.tree, banNhap);

  // Mở form rồi bấm Lưu mà không sửa gì phải là một việc KHÔNG xảy ra chuyện
  // gì cả — không một vòng mạng, không một dòng nhật ký, không tăng số bản
  // ghi. Bản Drive không phân biệt được điều này; ở đây thì phân biệt được,
  // vì ta đang cầm trong tay đúng danh sách những gì đã đổi.
  if (!coGiDeGhi(ops)) {
    return { ok: true, lyDo: 'khongdoigi', loi: null, revision: state.revision };
  }

  let kq;
  try {
    kq = await sb.luuCay(state.treeId, state.revision, ops, moTa || null);
  } catch (e) {
    return tuChoi('khongnoiduoc',
      'Không gọi được máy chủ nên chưa lưu được. ' +
      (e && e.message ? e.message : String(e)));
  }

  if (!kq)    return tuChoi('khongtraloi', 'Máy chủ không trả về gì khi lưu.');
  if (!kq.ok) return kq;   // máy chủ đã viết sẵn câu giải thích trong kq.loi

  // Từ đây trở xuống mới được đụng vào state.
  //
  // ⚠ KHÔNG nạp lại cây từ máy chủ ở đây, dù nghe có vẻ chắc chắn hơn. Nạp
  //   lại là một vòng mạng nữa cho mỗi lần sửa một ô, và nó vứt đi bản đã
  //   đúng đang nằm sẵn trong tay. Máy chủ vừa gật nghĩa là bản sao này CHÍNH
  //   LÀ thứ vừa được ghi xuống.
  banNhap.tree.revision  = kq.revision;
  banNhap.tree.updatedAt = (kq.tree && kq.tree.updated_at) || banNhap.tree.updatedAt;
  banNhap.tree.updatedBy = (kq.tree && kq.tree.updated_by) || banNhap.tree.updatedBy;

  // Mục nhật ký mới, ở dạng rút gọn đúng như lúc nạp — chỉ đủ cho
  // `utils/id.js` không cấp lại mã. Xem lời cảnh báo ở `hinh-dang.rapCay`.
  if (moTa && moTa.target) {
    if (!Array.isArray(banNhap.changeLog)) banNhap.changeLog = [];
    banNhap.changeLog.push({ target: moTa.target, diff: moTa.diff || {} });
  }

  state.tree     = banNhap;
  state.index    = buildIndex(banNhap);
  state.revision = kq.revision;
  state.dirty    = false;
  notify();

  console.log('[repo] đã lưu: revision ' + kq.revision + ' · ' + tomTat(ops));
  return kq;
}

/** Một câu ngắn kể lần ghi vừa rồi đụng vào bao nhiêu dòng. */
function tomTat(ops) {
  const phan = [];
  for (const ten of ['persons', 'unions', 'children', 'media', 'sources']) {
    const o = ops[ten];
    if (!o) continue;
    if (o.luu.length) phan.push(ten + ' +' + o.luu.length);
    if (o.xoa.length) phan.push(ten + ' -' + o.xoa.length);
  }
  return phan.length ? phan.join(', ') : 'chỉ khối thông tin cây';
}

/** Lời từ chối của chính trình duyệt, cùng khuôn với kết quả máy chủ trả về. */
function tuChoi(lyDo, loi) {
  return { ok: false, lyDo, loi, revision: null };
}

/** Người đang dùng có sửa được không. Lấy từ phiên, KHÔNG tự suy từ email. */
export function suaDuoc() {
  return !!(state.phien && state.phien.suaDuoc);
}

/** Người đang dùng có đọc được không. */
export function docDuoc() {
  return !!(state.phien && state.phien.docDuoc);
}

// ============================================================
// Kiểm tra dữ liệu sau khi nạp
// ============================================================

/**
 * Từ chối thẳng dữ liệu MỚI HƠN app.
 *
 * Mở ra rồi lưu đè sẽ nuốt mất những trường mà app đời này chưa biết đến.
 * Thà không mở còn hơn mở rồi làm mất dữ liệu — và trên Postgres thì mất
 * theo kiểu tệ hơn Drive: `hinh-dang.veBang()` chỉ chép những cột nó biết
 * tên, nên cột mới sẽ bị ghi `null` đè lên mà không có gì kêu.
 */
function kiemPhienBan(cay) {
  const v = Number(cay.version);
  if (!Number.isFinite(v)) {
    throw new Error('Gia phả không ghi số phiên bản dữ liệu.');
  }
  if (v > DATA_VERSION) {
    throw new Error('Dữ liệu là phiên bản ' + v + ', mới hơn app ' +
                    '(phiên bản ' + DATA_VERSION + '). Tải lại trang để lấy ' +
                    'bản app mới trước khi mở.');
  }
  return cay;
}

/**
 * KÊU LÊN khi có bản ghi thiếu `uid`, nhưng **không tự điền**.
 *
 * Bản Apps Script tự điền ngay lúc nạp (`repo.themUidNeuThieu`), và ở đó việc
 * ấy đúng: cả cây là một file, điền xong thì lần lưu sau ghi cả file nên uid
 * xuống đĩa cùng chuyến.
 *
 * Ở đây thì KHÔNG, và cái bẫy nằm đúng chỗ đó: lần lưu sau chỉ gửi phần khác
 * biệt, mà khác biệt tính bằng cách so với `state.tree` — chính là bản đã
 * được điền. Tức uid mới sẽ **không bao giờ** được gửi lên. Mỗi lần mở app
 * lại điền lại, mỗi lần đều thành công, và không ai biết là chúng chưa từng
 * xuống tới cơ sở dữ liệu.
 *
 * Nên chỗ đúng để điền uid là **script di dời dữ liệu**, chạy một lần, ghi
 * thẳng vào bảng. Hàm này chỉ đứng canh xem việc ấy đã làm chưa.
 */
function canhBaoThieuUid(cay) {
  let thieu = 0;
  for (const ten of ['persons', 'unions']) {
    for (const b of cay[ten] || []) if (b && b.id && !b.uid) thieu++;
  }
  if (thieu) {
    console.warn('[repo] ' + thieu + ' bản ghi chưa có uid. Chạy script di ' +
                 'dời để điền, đừng để app tự điền — xem canhBaoThieuUid().');
  }
}

// ============================================================
// CHƯA LÀM
// ============================================================

/**
 * Dựng một gia phả MỚI. **Chưa làm trên nền Supabase.**
 *
 * Bản Drive dựng ba thư mục và một file rồi phải đi TÌM lại cây vừa tạo, vì
 * `gas.taoFileDuLieuMoi()` không trả về gì và Drive đánh chỉ mục có độ trễ.
 * Cả đoạn ấy biến mất ở đây: trên Postgres việc này là hai câu `insert` trong
 * một giao dịch, và nó trả về ngay mã cây vừa tạo.
 *
 * Nhưng nó phải là một hàm `security definer` trong cơ sở dữ liệu, vì
 * `02-rls.sql` cố ý không cấp cho trình duyệt quyền ghi vào `trees`. Hàm ấy
 * chưa viết — xem `KIEN-TRUC.md` mục 6.
 */
export async function taoGiaPhaMoi() {
  return {
    ok: false, moi: null, lyDo: 'chualam',
    loi: 'Chức năng dựng gia phả mới chưa làm xong trên nền Supabase. ' +
         'Hiện phải tạo bằng tay trong Supabase, hoặc dùng script di dời.',
  };
}
