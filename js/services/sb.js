// ============================================================
// giapha-supabase · js/services/sb.js
// Vai trò  : Cầu nối duy nhất xuống Supabase. Bọc thư viện supabase-js
//            thành những hàm mang đúng hình dạng mà repo.js và pages/ chờ.
// Lớp      : services — được gọi bởi: services/repo, pages/dang-nhap,
//            pages/settings, pages/form-anh · gọi: cau-hinh
// Phụ thuộc: cau-hinh.js, vendor/supabase.js (nạp bằng thẻ <script>)
// Phiên bản: 0.1.0 · Cập nhật: 02/09/2026 22:45
// ============================================================
//
// ĐÂY LÀ RANH GIỚI GIỮA TRÌNH DUYỆT VÀ MÁY CHỦ — đúng vai `services/gas.js`
// đóng trên bản Apps Script. **Không file nào khác được chạm vào
// `window.supabase`.** Luật này là thứ đã cứu cả cuộc chuyển nhà lần này:
// nhờ nó mà `domains/` và `pages/` không phải đổi một dòng, và nhờ nó mà lần
// đổi kho tiếp theo (nếu có) cũng chỉ tốn hai file.
//
// ⚠ **Thư viện nạp bằng thẻ `<script>` chứ không bằng `import`.** Supabase
//   không phát hành bản ES Module một file; bản duy nhất chạy được thẳng
//   trong trình duyệt không qua bước build là bản UMD, và bản UMD đặt biến
//   toàn cục `window.supabase`. Dự án **không có bước build** (`CLAUDE.md`
//   mục 3), nên đây là đường duy nhất. Chi tiết ở `vendor/DOC-VENDOR.md`.

import {
  SUPABASE_URL, SUPABASE_KHOA_CONG_KHAI, KHO_ANH,
  TEN_HO, NGUOI_QUAN_LY, thieuCauHinh,
} from '../cau-hinh.js';

// ============================================================
// Máy khách — dựng một lần, dùng lại
// ============================================================

let khach = null;

/** Có nối được xuống Supabase không. Đối xứng với `gas.coMayChu()`. */
export function coKetNoi() {
  return !!layKhach();
}

/**
 * Máy khách Supabase. Trả `null` khi chưa nạp được thư viện hoặc chưa điền
 * cấu hình — nơi gọi tự lo phần giải thích, đừng ném lỗi ở đây.
 */
function layKhach() {
  if (khach) return khach;
  if (typeof window === 'undefined' || !window.supabase) return null;
  if (thieuCauHinh()) return null;

  khach = window.supabase.createClient(SUPABASE_URL, SUPABASE_KHOA_CONG_KHAI, {
    auth: {
      // Giữ phiên trong localStorage và tự làm mới thẻ trước khi hết hạn.
      // Không có hai dòng này thì đóng tab là phải đăng nhập lại, và người
      // trong họ sẽ bỏ cuộc trước khi kịp xem sơ đồ.
      persistSession:   true,
      autoRefreshToken: true,
    },
  });
  return khach;
}

/** Câu lỗi cho người đọc, không phải cho lập trình viên. */
function cauLoi(e) {
  if (!e) return 'Không rõ lỗi.';
  const m = String(e.message || e);
  if (/Failed to fetch|NetworkError/i.test(m)) {
    return 'Không nối được tới máy chủ. Kiểm tra mạng rồi thử lại.';
  }
  if (/Invalid login credentials/i.test(m)) {
    return 'Email hoặc mật khẩu không đúng.';
  }
  if (/Email not confirmed/i.test(m)) {
    return 'Tài khoản chưa xác nhận. Mở hộp thư và bấm đường liên kết ' +
           'Supabase vừa gửi, rồi đăng nhập lại.';
  }
  return m;
}

// ============================================================
// ĐĂNG NHẬP
// ============================================================
//
// ⚠ **Email + mật khẩu, không phải "Đăng nhập bằng Google".**
//   `CLAUDE.md` mục 3 loại mọi phương án cần OAuth Client ID, mà đăng nhập
//   Google trên Supabase bắt buộc phải có Client ID tạo trong Google Cloud
//   Console. `KE-HOACH-HA-TANG-Supabase_V01.md` đã chốt email + mật khẩu vì
//   đúng lý do ấy.
//
//   `BAT-DAU.md` mục 4.1 để ngỏ khả năng luật kia đã lỗi thời (chưa ai thử
//   xem tài khoản mới có tạo được project trong Console không). Nếu sau này
//   thử được và muốn thêm đăng nhập Google, thì **thêm đúng một hàm ở đây**
//   (`signInWithOAuth`) — không có chỗ nào khác phải sửa.

/** Đăng nhập. Trả về { ok, loi, email }. */
export async function dangNhap(email, matKhau) {
  const k = layKhach();
  if (!k) return { ok: false, loi: thieuCauHinh() || 'Chưa nạp được thư viện Supabase.' };

  const { data, error } = await k.auth.signInWithPassword({
    email: String(email || '').trim(),
    password: String(matKhau || ''),
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  return { ok: true, loi: null, email: data.user && data.user.email };
}

/** Đăng xuất. Xoá phiên khỏi máy này, không đụng gì tới máy khác. */
export async function dangXuat() {
  const k = layKhach();
  if (!k) return { ok: true };
  const { error } = await k.auth.signOut();
  return error ? { ok: false, loi: cauLoi(error) } : { ok: true, loi: null };
}

/** Xin Supabase gửi thư đặt lại mật khẩu. */
export async function quenMatKhau(email) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { error } = await k.auth.resetPasswordForEmail(
    String(email || '').trim(),
    { redirectTo: window.location.href });
  return error ? { ok: false, loi: cauLoi(error) } : { ok: true, loi: null };
}

/** Người đang đăng nhập, hoặc `null`. Không gọi mạng — đọc phiên trong máy. */
export async function nguoiDangNhap() {
  const k = layKhach();
  if (!k) return null;
  const { data } = await k.auth.getUser();
  return (data && data.user) || null;
}

// ============================================================
// PHIÊN — danh tính, quyền, và cây đang chọn
// ============================================================

/**
 * Đối xứng đúng `gas.layPhien()`, để `pages/khoi-dong.js` gần như không đổi.
 *
 * ⚠ Khác một chỗ, và chỗ ấy quan trọng: bản Apps Script luôn BIẾT người dùng
 *   là ai (Google đã đăng nhập sẵn), chỉ không chắc có quyền đọc file hay
 *   không. Ở đây có thêm trạng thái thứ ba: **chưa đăng nhập**. Nên phiên trả
 *   thêm cờ `daDangNhap` — `khoi-dong.js` nhìn cờ ấy để mở màn hình đăng nhập
 *   thay vì màn hình "bạn chưa được cấp quyền".
 *
 * @returns {Promise<{daDangNhap:boolean, email:string, vaiTro:string|null,
 *   docDuoc:boolean, suaDuoc:boolean, treeId:string|null,
 *   nguoiTrungTamMacDinh:string|null, tenHo:string, nguoiQuanLy:string,
 *   loi:string|null}>}
 */
export async function layPhien() {
  const nen = {
    daDangNhap: false, email: '', vaiTro: null,
    docDuoc: false, suaDuoc: false, treeId: null,
    nguoiTrungTamMacDinh: null,
    tenHo: TEN_HO, nguoiQuanLy: NGUOI_QUAN_LY, loi: null,
  };

  const thieu = thieuCauHinh();
  if (thieu) return { ...nen, loi: thieu };

  const k = layKhach();
  if (!k) return { ...nen, loi: 'Chưa nạp được thư viện Supabase (vendor/supabase.js).' };

  const nguoi = await nguoiDangNhap();
  if (!nguoi) return nen;                       // chưa đăng nhập — không phải lỗi

  // Người này là thành viên của những cây nào. Row Level Security đã lọc sẵn:
  // câu truy vấn này KHÔNG có `where user_id = …` mà vẫn chỉ trả về phần của
  // người đang gọi. Đó là cả điểm của cuộc chuyển nhà — app không tự lọc, và
  // vì thế app không thể lọc sai.
  const { data: ds, error } = await k
    .from('tree_members')
    .select('tree_id, role')
    .eq('user_id', nguoi.id);

  if (error) {
    return { ...nen, daDangNhap: true, email: nguoi.email, loi: cauLoi(error) };
  }
  if (!ds || !ds.length) {
    // Đăng nhập được nhưng chưa ai thêm vào cây nào. Đây là ca thường gặp
    // nhất với người mới, và phải nói rõ phải làm gì — không hiện lỗi thô.
    return { ...nen, daDangNhap: true, email: nguoi.email };
  }

  const treeId = await cayDangChon(k, nguoi.id, ds);
  const vaiTro = (ds.find((m) => m.tree_id === treeId) || ds[0]).role;

  return {
    ...nen,
    daDangNhap: true,
    email:   nguoi.email || '',
    vaiTro,
    docDuoc: true,
    suaDuoc: vaiTro === 'chu' || vaiTro === 'sua',
    treeId,
    nguoiTrungTamMacDinh: await nguoiTrungTamMacDinh(k, nguoi.id, treeId),
  };
}

/**
 * Cây nào đang mở. Thay cho lựa chọn cất trong `PropertiesService` của Apps
 * Script — cùng tính chất: riêng theo tài khoản, không ảnh hưởng người khác.
 */
async function cayDangChon(k, userId, ds) {
  const { data } = await k
    .from('user_settings')
    .select('tree_id')
    .eq('user_id', userId);

  const daChon = (data || []).map((r) => r.tree_id);
  const hop = ds.find((m) => daChon.includes(m.tree_id));
  // Không có lựa chọn nào còn hợp lệ thì lấy cây đầu tiên, để màn hình không
  // trắng trơn. Cùng lý lẽ với `repo.chonNguoiTrungTam` của bản cũ.
  return hop ? hop.tree_id : ds[0].tree_id;
}

async function nguoiTrungTamMacDinh(k, userId, treeId) {
  const { data } = await k
    .from('user_settings')
    .select('focus_person_id')
    .eq('user_id', userId).eq('tree_id', treeId)
    .maybeSingle();
  return (data && data.focus_person_id) || null;
}

/** Ghi người trung tâm mặc định của riêng người đang đăng nhập. */
export async function datNguoiTrungTamMacDinh(treeId, personId) {
  const k = layKhach();
  const nguoi = await nguoiDangNhap();
  if (!k || !nguoi) return { ok: false, loi: 'Chưa đăng nhập.' };

  const { error } = await k.from('user_settings').upsert({
    user_id: nguoi.id, tree_id: treeId, focus_person_id: personId,
  });
  return error ? { ok: false, loi: cauLoi(error) } : { ok: true, loi: null };
}

/** Xoá giá trị đã đặt, quay về gốc cây ghi trong file. */
export async function xoaNguoiTrungTamMacDinh(treeId) {
  return datNguoiTrungTamMacDinh(treeId, null);
}

// ============================================================
// ĐỌC CÂY
// ============================================================

/**
 * Đọc TOÀN BỘ cây, mỗi bảng một lần gọi, chạy song song.
 *
 * ⚠ **`.limit()` mặc định của Supabase là 1.000 dòng.** Cây 681 người lọt,
 *   nhưng gia phả Nguyễn Phúc mà chủ dự án đang dùng để đo có lúc vượt — và
 *   khi vượt thì **không có lỗi nào cả**, chỉ đơn giản là mất người ở cuối.
 *   Đó là kiểu hỏng tệ nhất: sơ đồ vẫn vẽ, vẫn đẹp, chỉ thiếu vài chi. Nên
 *   `.range(0, GIOI_HAN)` được viết ra tường minh và kiểm số dòng trả về.
 *
 * @returns {Promise<{ok:boolean, loi:string|null, dong:object|null}>}
 *          `dong` là các mảng THÔ theo tên cột snake_case. Việc ráp chúng
 *          thành hình cây JSON là của `services/hinh-dang.js`, không phải
 *          của file này.
 */
const GIOI_HAN = 20000;

export async function layDong(treeId) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.', dong: null };

  const bang = (ten) => k.from(ten).select('*').eq('tree_id', treeId).range(0, GIOI_HAN);

  try {
    const [cay, persons, unions, children, media, sources, imports, maNhatKy] =
      await Promise.all([
        k.from('trees').select('*').eq('id', treeId).maybeSingle(),
        bang('persons'), bang('unions'), bang('union_children'),
        bang('media'), bang('sources'),
        k.from('imports').select('*').eq('tree_id', treeId)
          .order('at', { ascending: true }).range(0, GIOI_HAN),
        // Chỉ MÃ, không phải cả nhật ký — xem `04-view-ma-da-dung.sql` để
        // biết vì sao thứ này phải nạp ở mọi lần mở app, và vì sao nó lại
        // được rút gọn tới mức chỉ còn một cột.
        k.from('v_ma_nhat_ky').select('ma').eq('tree_id', treeId).range(0, GIOI_HAN),
      ]);

    for (const kq of [cay, persons, unions, children, media, sources,
                      imports, maNhatKy]) {
      if (kq.error) return { ok: false, loi: cauLoi(kq.error), dong: null };
    }
    if (!cay.data) {
      return { ok: false, loi: 'Không đọc được gia phả này. Có thể bạn đã ' +
                              'bị gỡ khỏi danh sách người được xem.', dong: null };
    }
    for (const [ten, kq] of [['persons', persons], ['unions', unions],
                             ['union_children', children]]) {
      if (kq.data && kq.data.length > GIOI_HAN - 1) {
        return { ok: false, dong: null, loi:
          'Bảng ' + ten + ' vượt quá ' + GIOI_HAN + ' dòng nên bản đọc về ' +
          'chắc chắn còn THIẾU. Không mở gia phả với dữ liệu thiếu — nâng ' +
          'GIOI_HAN trong js/services/sb.js rồi thử lại.' };
      }
    }

    return {
      ok: true, loi: null,
      dong: {
        tree:     cay.data,
        persons:  persons.data  || [],
        unions:   unions.data   || [],
        children: children.data || [],
        media:    media.data    || [],
        sources:  sources.data  || [],
        imports:  imports.data  || [],
        maNhatKy: (maNhatKy.data || []).map((r) => r.ma),
      },
    };
  } catch (e) {
    return { ok: false, loi: cauLoi(e), dong: null };
  }
}

// ============================================================
// GHI CÂY
// ============================================================

/**
 * Gọi hàm `luu_cay()` trong cơ sở dữ liệu — **cửa ghi duy nhất**.
 *
 * Không có đường ghi thứ hai, và đó không phải quy ước lập trình mà là điều
 * cơ sở dữ liệu thi hành: `02-rls.sql` không cấp cho trình duyệt một `policy`
 * insert/update/delete nào trên bảng dữ liệu gia phả. Người biên tập mở
 * `curl` ra gõ thẳng vào REST API cũng bị Postgres từ chối.
 *
 * @param {string} treeId
 * @param {number} revision  số bản ghi trình duyệt tưởng đang là mới nhất
 * @param {object} ops       khác biệt, do `hinh-dang.soSanh()` sinh ra
 * @param {object} moTa      { action, target, note, diff } — `ts`/`by` máy chủ điền
 */
export async function luuCay(treeId, revision, ops, moTa) {
  const k = layKhach();
  if (!k) return { ok: false, lyDo: 'khongnoiduoc', loi: 'Chưa nối được máy chủ.' };

  const { data, error } = await k.rpc('luu_cay', {
    p_tree_id:  treeId,
    p_revision: revision,
    p_ops:      ops,
    p_mo_ta:    moTa || {},
  });
  if (error) return { ok: false, lyDo: 'maychutuchoi', loi: cauLoi(error) };
  return data;
}

// ============================================================
// DANH SÁCH GIA PHẢ
// ============================================================

/**
 * Những gia phả người đang đăng nhập mở được.
 *
 * Số người và số cặp đếm bằng một lần gọi riêng cho mỗi cây (`head: true` —
 * chỉ xin con số, không tải dòng nào). Với vài cây thì rẻ; ngày nào danh sách
 * dài tới hàng chục thì đổi sang một khung nhìn (view) trong cơ sở dữ liệu,
 * đừng nhân số lần gọi lên.
 */
export async function layDanhSachGiaPha() {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.', ds: [] };

  const nguoi = await nguoiDangNhap();
  if (!nguoi) return { ok: false, loi: 'Chưa đăng nhập.', ds: [] };

  const { data, error } = await k
    .from('tree_members')
    .select('role, tree_id, trees(id, name, tree_code, revision, updated_at)')
    .eq('user_id', nguoi.id);
  if (error) return { ok: false, loi: cauLoi(error), ds: [] };

  const ds = [];
  for (const m of data || []) {
    const t = m.trees;
    if (!t) continue;
    const [sn, sc] = await Promise.all([dem(k, 'persons', t.id), dem(k, 'unions', t.id)]);
    ds.push({
      fileId: t.id, ten: t.name, tenFile: t.tree_code,
      soNguoi: sn, soCap: sc, revision: t.revision,
      suaDuoc: m.role === 'chu' || m.role === 'sua',
      doiLuc: t.updated_at,
    });
  }
  return { ok: true, loi: null, ds };
}

async function dem(k, bang, treeId) {
  const { count } = await k.from(bang)
    .select('id', { count: 'exact', head: true })
    .eq('tree_id', treeId).eq('deleted', false);
  return count || 0;
}

/**
 * Đổi sang một gia phả khác. Lựa chọn ghi vào `user_settings`, riêng theo
 * tài khoản.
 *
 * ⚠ Nơi gọi phải NẠP LẠI CÂY sau khi hàm này gật — `state.tree`,
 *   `state.index` và `state.revision` đang giữ cây cũ, và ghi tiếp bằng số
 *   bản ghi của cây cũ lên cây mới là đúng thứ cơ chế chống ghi đè sinh ra
 *   để chặn. Luật này chép nguyên từ `gas.chonGiaPha` và vẫn đúng nguyên.
 */
export async function chonGiaPha(treeId) {
  const k = layKhach();
  const nguoi = await nguoiDangNhap();
  if (!k || !nguoi) return { ok: false, loi: 'Chưa đăng nhập.' };

  // Xoá lựa chọn cũ rồi ghi lựa chọn mới: `user_settings` khoá theo
  // (user_id, tree_id) nên "đang chọn cây nào" phải là dòng DUY NHẤT có mặt.
  await k.from('user_settings').delete().eq('user_id', nguoi.id);
  const { error } = await k.from('user_settings')
    .upsert({ user_id: nguoi.id, tree_id: treeId });
  return error ? { ok: false, loi: cauLoi(error) } : { ok: true, loi: null };
}

// ============================================================
// ẢNH
// ============================================================

/**
 * Tải một tấm ảnh lên kho.
 *
 * ⚠ Nhận **Blob**, không nhận chuỗi base64. Bản Apps Script phải dùng base64
 *   vì `google.script.run` chỉ chuyển được kiểu đơn giản; ở đây không còn rào
 *   ấy, và gửi Blob thẳng tiết kiệm đúng 33% đường truyền mà base64 phình ra.
 *   `utils/image.js` vốn đã dựng được Blob trước khi mã hoá base64 — nơi gọi
 *   chỉ việc dừng lại sớm một bước.
 *
 * @returns {Promise<{ok:boolean, loi:string|null, duongDan:string}>}
 *          `duongDan` là thứ đem cất vào `media.driveFileId`. Tên trường ấy
 *          vẫn còn chữ "drive" — xem lời giải thích ở `01-bang.sql` mục 7.
 */
export async function taiAnh(treeId, blob, tenFile) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.', duongDan: '' };

  const duongDan = treeId + '/' + tenFile;
  const { error } = await k.storage.from(KHO_ANH)
    .upload(duongDan, blob, { contentType: blob.type || 'image/jpeg', upsert: true });
  if (error) return { ok: false, loi: cauLoi(error), duongDan: '' };
  return { ok: true, loi: null, duongDan };
}

/**
 * Xoá CẢ LOẠT ảnh — bước cuối của một lần *Dọn thùng rác*.
 * Gọi SAU khi máy chủ đã gật cho lần ghi: bản ghi mất rồi thì file mới chắc
 * chắn không còn ai trỏ tới.
 */
export async function xoaAnhThat(dsDuongDan) {
  const k = layKhach();
  if (!k) return { ok: false, soXoa: 0, soHong: 0 };
  const ds = (dsDuongDan || []).filter(Boolean);
  if (!ds.length) return { ok: true, soXoa: 0, soHong: 0 };

  const { data, error } = await k.storage.from(KHO_ANH).remove(ds);
  if (error) return { ok: false, soXoa: 0, soHong: ds.length, loi: cauLoi(error) };
  return { ok: true, soXoa: (data || []).length, soHong: ds.length - (data || []).length };
}

// ============================================================
// CHƯA LÀM — đừng mô tả như đã có
// ============================================================
//
// **Sao lưu** (`gas.layDanhSachSaoLuu` · `saoLuuNgay` · `xemBanSaoLuu` ·
// `khoiPhucSaoLuu`). Trên Drive, sao lưu là chép một file JSON sang thư mục
// khác. Ở đây không còn "một file" nào để chép, nên cơ chế phải khác hẳn, và
// `KE-HOACH-HA-TANG-Supabase_V01.md` bước **H8** đã giao việc ấy cho Apps
// Script chạy nền: một trigger định kỳ đọc REST API rồi ghi file JSON ra
// Drive. Chưa làm.
//
// `pages/backup.js` đang import bốn hàm ấy qua `services/tuong-thich.js` — file đó
// không còn tồn tại trong `supabase/`, nên **màn hình Sao lưu chưa mở được**. Đó là
// một trong bốn việc còn dở ghi ở `DOC-KHUNG.md` mục 7.
//
// **Dựng gia phả mới** (`gas.taoFileDuLieuMoi`). Trên Postgres việc này là
// `insert into trees` + `insert into tree_members`, và nó phải là một hàm
// `security definer` nữa vì `02-rls.sql` không cấp quyền ghi vào `trees`.
// Chưa viết.
