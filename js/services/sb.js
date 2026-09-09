// ============================================================
// giapha-supabase · js/services/sb.js
// Vai trò  : Cầu nối duy nhất xuống Supabase. Bọc thư viện supabase-js
//            thành những hàm mang đúng hình dạng mà repo.js và pages/ chờ.
// Lớp      : services — được gọi bởi: services/repo, pages/dang-nhap,
//            pages/settings, pages/form-anh, pages/quan-tri · gọi: cau-hinh
// Phụ thuộc: cau-hinh.js, vendor/supabase.js (nạp bằng thẻ <script>)
// Phiên bản: 0.12.0 · Cập nhật: 09/09/2026 17:10 (b109d)
//            0.12.0 `layPhien()` đọc thêm `hoTen` — họ tên của TÀI KHOẢN đang
//            đăng nhập (không phải người trong sơ đồ). Đọc thẳng bảng
//            `tai_khoan` bằng RLS `for select … using (user_id = auth.uid())`
//            của `11` mục 1, KHÔNG qua hàm `security definer` nào — luật ấy
//            đã cho một người đọc đúng dòng của chính mình từ trước b109d,
//            chỉ chưa ai hỏi tới.
//            0.11.0 `dsTaiKhoanHeThong()` đọc thêm `vaiCaoNhat` — vai cao
//            nhất tài khoản ấy đang có ở ĐÂU ĐÓ. ⚠ Một dòng TÓM TẮT, không
//            phải câu trả lời đầy đủ: quyền ở app này gắn với TỪNG cây.
//            0.10.0 ba cửa TÌM KIẾM của `15-tim-kiem.sql`: `timTaiKhoan()` ·
//            `timNguoiTrongCay()` · `datHoTenTaiKhoan()`. Và `dsThanhVien()`
//            với `dsCayCuaTaiKhoan()` nay nhận được TÊN người thật ở
//            `tenNguoi` — trước b109b hai hàm SQL sau lưng chúng đọc nhầm
//            `vn->>'name'` (luôn null) nên trường ấy luôn bằng mã người.
//            0.9.0 bốn cửa TOÀN HỆ THỐNG của `14-loi-moi.sql` mục 7–10:
//            `dsTaiKhoanHeThong()` · `dsCayCuaTaiKhoan()` ·
//            `datQuanTriHeThong()` · `xoaTaiKhoan()`. Tới b108 cả bốn hàm SQL
//            ấy đã dán trên máy chủ mà chưa có cầu nối nào — xem khối cuối file.
//            0.8.0 `moiVaoCay()` · `nhanLoiMoi()` · `tuChoiLoiMoi()` — chiều
//            NGƯỢC của xin vào (`luoc-do/14-loi-moi.sql`). `layDanhSachGiaPha()`
//            đọc thêm `duocMoi`/`moiVai`/`emailNguoiMoi`; `layPhien()` mang
//            thêm bốn trường ấy khi `trangThai === 'duocmoi'`.
//            0.7.0 (b106) bảy cửa của `luoc-do/13-quan-ly-thanh-vien.sql` —
//            xem khối *QUẢN LÝ TÀI KHOẢN CỦA MỘT CÂY* ở cuối file.
//            0.6.0 (b104) thêm `taoGiaPhaMoi()` — cửa dựng gia phả mới.
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
 *   laQuanTriHeThong:boolean, maNgan:string, hoTen:string,
 *   nguoiTrungTamMacDinh:string|null, hienNgayGio:boolean,
 *   tenHo:string, nguoiQuanLy:string,
 *   trangThai?:string, soCay?:number,
 *   tenCay?:string, maCay?:string, moiVai?:string, emailNguoiMoi?:string,
 *   loi:string|null}>}
 */
export async function layPhien() {
  const nen = {
    daDangNhap: false, email: '', vaiTro: null,
    docDuoc: false, suaDuoc: false, treeId: null,
    laQuanTriHeThong: false, maNgan: '', hoTen: '',
    nguoiTrungTamMacDinh: null, hienNgayGio: false,
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
  //
  // ⚠ BỐN câu hỏi đi CÙNG MỘT LƯỢT (b103, +1 ở b109d). Ba câu sau thuộc tầng
  //   người, không thuộc cây nào: có phải Quản trị hệ thống không, mã ngắn của
  //   tài khoản là gì, và họ tên đã điền (nếu có). Hỏi nối tiếp thì mỗi lần mở
  //   app tốn thêm ba vòng mạng cho ba mẩu tin nhỏ xíu — mà `layPhien()` chạy
  //   ở đầu MỌI trang.
  //
  // ⚠ `hoTen` đọc THẲNG bảng `tai_khoan`, không qua hàm `security definer`
  //   nào — luật RLS `for select … using (user_id = auth.uid())` của `11`
  //   mục 1 đã cho một người đọc đúng dòng của chính mình từ trước, khác hẳn
  //   `dsTaiKhoanHeThong()` vốn chỉ Quản trị hệ thống gọi được.
  const [{ data: ds, error }, { data: coQuyenHT }, { data: maTk }, { data: hangTk }] =
    await Promise.all([
      k.from('tree_members').select('tree_id, role').eq('user_id', nguoi.id),
      k.rpc('la_quan_tri_he_thong'),
      k.rpc('ma_tai_khoan_cua_toi'),
      k.from('tai_khoan').select('ho_ten').eq('user_id', nguoi.id).maybeSingle(),
    ]);

  const laQuanTriHeThong = Boolean(coQuyenHT);
  const maNgan = maTk || '';
  const hoTen = (hangTk && hangTk.ho_ten) || '';
  const nenNguoi = { ...nen, laQuanTriHeThong, maNgan, hoTen };

  if (error) {
    return { ...nenNguoi, daDangNhap: true, email: nguoi.email, loi: cauLoi(error) };
  }

  // ⚠ QUẢN TRỊ HỆ THỐNG ĐI TRƯỚC, và phải đứng trước nhánh "không có chân"
  //   ngay dưới. Từ 05/09/2026 vai ấy **đọc và sửa được mọi cây**, kể cả cây
  //   họ không có một dòng `tree_members` nào — mà đúng cảnh ấy lại rơi thẳng
  //   vào nhánh "chưa được duyệt" bên dưới nếu để thứ tự ngược lại. Triệu
  //   chứng khi sai: người có quyền cao nhất hệ thống nhìn thấy màn hình
  //   *"bạn đang chờ được duyệt"*.
  if (laQuanTriHeThong) {
    const treeId = (ds && ds.length)
      ? await cayDangChon(k, nguoi.id, ds)
      : await cayDauTien(k);
    return {
      ...nenNguoi,
      daDangNhap: true,
      email: nguoi.email || '',
      vaiTro: 'quan_tri_he_thong',
      docDuoc: true,
      suaDuoc: true,
      trangThai: 'daduyet',
      treeId,
      ...(treeId ? await caiDatCay(k, nguoi.id, treeId) : {}),
    };
  }

  if (!ds || !ds.length) {
    // ⚠ CỬA CÂY MẶC ĐỊNH (b102, dùng thật từ b103). Hệ thống có thể mở sẵn
    //   MỘT cây cho người chưa có chân ở đâu cả — họ vào xem được, không sửa
    //   được, và không thấy danh sách thành viên. Hàng rào nằm ở Postgres
    //   (`co_the_xem_cay()`), câu này chỉ hỏi máy chủ xem cửa ấy có mở không.
    const { data: cayMacDinh } = await k.rpc('cay_mac_dinh');
    if (cayMacDinh) {
      return {
        ...nenNguoi,
        daDangNhap: true,
        email: nguoi.email || '',
        vaiTro: 'xem',
        docDuoc: true,
        suaDuoc: false,
        trangThai: 'daduyet',
        treeId: cayMacDinh,
        ...(await caiDatCay(k, nguoi.id, cayMacDinh)),
      };
    }

    // Đăng nhập được nhưng chưa đọc được cây nào. Đây là ca thường gặp nhất
    // với người mới, và phải nói rõ phải làm gì — không hiện lỗi thô.
    //
    // ⚠ Từ `07-duyet-dang-ky.sql`, KHÔNG đọc được không còn đồng nghĩa với
    //   chưa nộp đơn: người đã xếp hàng cũng thấy đúng con số không ở đây, vì
    //   `approved` nay gác cả quyền đọc. Hai người ấy cần nghe hai câu khác
    //   hẳn nhau — một người phải bấm nút, một người chỉ phải chờ — nên phải
    //   hỏi máy chủ thêm một câu nữa.
    //
    // ⚠ Lấy CẢ `treeId` chứ không chỉ lấy `trangThai` (đổi 05/09/2026): nút
    //   "Xin vào gia phả" phải nói rõ xin vào cây nào, và người ở màn hình
    //   này là đúng người **không đọc được bảng `trees`** nên không có đường
    //   nào khác để biết mã cây.
    const tt = await trangThaiCuaToi();
    return {
      ...nenNguoi,
      daDangNhap: true,
      email: nguoi.email,
      trangThai: tt.trangThai,
      treeId: tt.treeId || null,
      soCay: tt.soCay,
      // b108: chỉ có nghĩa khi trangThai === 'duocmoi' — màn hình khởi động
      // đọc bốn thứ này để vẽ câu hỏi Nhận/Từ chối, không gọi thêm máy chủ.
      tenCay: tt.tenCay,
      maCay: tt.maCay,
      moiVai: tt.moiVai,
      emailNguoiMoi: tt.emailNguoiMoi,
    };
  }

  const treeId = await cayDangChon(k, nguoi.id, ds);
  const vaiTro = (ds.find((m) => m.tree_id === treeId) || ds[0]).role;

  return {
    ...nenNguoi,
    daDangNhap: true,
    email:   nguoi.email || '',
    vaiTro,
    docDuoc: true,
    // ⚠ HỎI MÁY CHỦ, không tự suy từ `vaiTro`. Bản cũ viết
    //   `vaiTro === 'quan_tri_he_thong' || vaiTro === 'sua'` và câu ấy nay sai hai đường:
    //   bỏ sót vai `quan_tri` (b93), và cho `sua` chưa được duyệt tưởng mình sửa
    //   được — giao diện mở nút Sửa rồi máy chủ mới chặn ở lúc bấm Lưu.
    //   `co_the_sua()` là chỗ DUY NHẤT trả lời câu này; hỏi nó thì không bao
    //   giờ có hai câu trả lời khác nhau cho cùng một người.
    suaDuoc: await coTheSua(treeId),
    trangThai: 'daduyet',
    treeId,
    ...(await caiDatCay(k, nguoi.id, treeId)),
  };
}

/** Máy chủ trả lời: người đang đăng nhập có sửa được cây này không. */
async function coTheSua(treeId) {
  const k = layKhach();
  if (!k) return false;
  const { data, error } = await k.rpc('co_the_sua', { p_tree: treeId });
  return !error && data === true;
}

/**
 * Cây nào đang mở. Thay cho lựa chọn cất trong `PropertiesService` của Apps
 * Script — cùng tính chất: riêng theo tài khoản, không ảnh hưởng người khác.
 */
// ⚠ Đọc CỜ `dang_mo`, không đọc "có dòng hay không" (đổi 05/09/2026, b100).
//   Bản trước hỏi *"người này có dòng nào trong `user_settings` không"* và
//   dùng chính sự có mặt của dòng làm câu trả lời cho "đang mở cây nào". Vì
//   câu ấy chỉ có MỘT đáp án cho mỗi người, `chonGiaPha()` phải xoá sạch mọi
//   dòng rồi chèn lại một dòng — tức **xoá người trung tâm mặc định của mọi
//   cây** mỗi lần đổi cây. Với một cây thì không ai thấy; với hai cây thì mất
//   mỗi lần. `luoc-do/10-sua-nhieu-cay.sql` mục 1 kể đầy đủ.
async function cayDangChon(k, userId, ds) {
  const { data } = await k
    .from('user_settings')
    .select('tree_id, dang_mo')
    .eq('user_id', userId).eq('dang_mo', true);

  const daChon = (data || []).map((r) => r.tree_id);
  const hop = ds.find((m) => daChon.includes(m.tree_id));
  // Không có lựa chọn nào còn hợp lệ thì lấy cây đầu tiên, để màn hình không
  // trắng trơn. Cùng lý lẽ với `repo.chonNguoiTrungTam` của bản cũ.
  return hop ? hop.tree_id : ds[0].tree_id;
}

/**
 * Cây đầu tiên theo tên, dành riêng cho Quản trị hệ thống KHÔNG có chân ở cây
 * nào — họ đọc và sửa được mọi cây, nên "cây đang mở" của họ không suy ra
 * được từ `tree_members` như mọi người khác.
 *
 * ⚠ Trả `null` khi hệ thống chưa có cây nào. Nơi gọi phải chịu được `null`:
 *   một hệ thống mới dựng thì đúng là chưa có cây, và đó không phải lỗi.
 */
async function cayDauTien(k) {
  const { data } = await k.from('trees').select('id').order('name').limit(1);
  return (data && data[0] && data[0].id) || null;
}

/**
 * Cài đặt của MỘT người trên MỘT cây. Một lần gọi lấy cả hai giá trị — chúng
 * nằm cùng một dòng, và hỏi hai lần là hai vòng mạng cho cùng một dòng ấy.
 */
async function caiDatCay(k, userId, treeId) {
  const { data } = await k
    .from('user_settings')
    .select('focus_person_id, hien_ngay_gio')
    .eq('user_id', userId).eq('tree_id', treeId)
    .maybeSingle();
  return {
    nguoiTrungTamMacDinh: (data && data.focus_person_id) || null,
    hienNgayGio: !!(data && data.hien_ngay_gio),
  };
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
 * Những gia phả người đang đăng nhập THẤY được — không phải chỉ những cây họ
 * có chân. Ba tầng nhìn thấy của `THIET-KE-NHIEU-CAY.md` đều ra ở đây:
 * cây mình là thành viên · cây chủ nó đã bật công tắc cho người lạ thấy tên ·
 * cây mình đã nộp đơn và đang chờ.
 *
 * ⚠ **MỘT lời gọi RPC, không phải một vòng lặp gọi mạng.** Bản trước (tới
 *   b102) đọc `tree_members` rồi đếm `persons` và `unions` cho TỪNG cây —
 *   với hai cây là năm vòng mạng, và nó lớn dần theo số cây. Nay `ds_gia_pha()`
 *   trả về đủ mọi thứ trong một lượt.
 *
 * ⚠ Và quan trọng hơn tốc độ: câu cũ **không thể** trả về cây người ta chưa
 *   có chân, vì nó đi từ `tree_members`. Không có `ds_gia_pha()` thì màn hình
 *   "Xin quyền" không có gì để vẽ.
 *
 * ⚠ Hàm máy chủ là `security definer` và lọc theo CỘT, không mở RLS trên
 *   `trees`. Nó cố ý trả `email_chu` cho cả người lạ — đó là đường liên hệ để
 *   xin quyền, không phải chỗ hở. `luoc-do/11-quyen-he-thong.sql` mục 15.
 */
export async function layDanhSachGiaPha() {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.', ds: [] };

  const { data, error } = await k.rpc('ds_gia_pha');
  if (error) return { ok: false, loi: cauLoi(error), ds: [] };

  // `fileId` và `tenFile` là tên cũ từ thời file JSON trên Drive. Giữ nguyên
  // vì `settings.js` và `repo.js` đang đọc đúng hai tên ấy — đổi tên trường ở
  // đây là sửa lan sang hai file không liên quan gì tới b103.
  const ds = (data || []).map((r) => ({
    fileId: r.id, ten: r.ten, tenFile: r.tree_code,
    treeCode: r.tree_code,
    emailChu: r.email_chu || '',
    soNguoi: Number(r.so_nguoi) || 0,
    vaiCuaToi: r.vai_cua_toi || null,
    coTheXem: Boolean(r.co_the_xem),
    suaDuoc: Boolean(r.co_the_sua_du_lieu),
    daNopDon: Boolean(r.da_nop_don),
    choNguoiLaThayTen: Boolean(r.cho_nguoi_la_thay_ten),
    toiLaChu: Boolean(r.toi_la_chu),
    // Ba cột b107/b108 — xem `luoc-do/14-loi-moi.sql` mục 6.
    duocMoi: Boolean(r.duoc_moi),
    moiVai: r.moi_vai || null,
    emailNguoiMoi: r.email_nguoi_moi || '',
  }));
  return { ok: true, loi: null, ds };
}

/**
 * Mã cây mặc định của cả hệ thống, hoặc `null` khi không đặt cây nào.
 *
 * Đây là công tắc CẤP HỆ THỐNG (chỉ Quản trị hệ thống đổi được), khác hẳn
 * `datChoNguoiLaThayTen()` ngay dưới — cái kia là công tắc của từng chủ cây.
 */
export async function layCayMacDinh() {
  const k = layKhach();
  if (!k) return null;
  const { data, error } = await k.rpc('cay_mac_dinh');
  if (error) return null;
  return data || null;
}

/** Đặt (hoặc bỏ, khi `treeId` là `null`) cây mặc định cho người lạ xem. */
export async function datCayMacDinh(treeId) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('dat_cay_mac_dinh', { p_tree: treeId || null });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (data && data.ok === false) {
    return { ok: false, loi: data.lyDo || 'Không đặt được cây mặc định.' };
  }
  return { ok: true, loi: null };
}

/**
 * Bật/tắt công tắc "cho người lạ thấy tên cây này".
 *
 * ⚠ Bật KHÔNG mở nội dung cây — chỉ mở tên, mã, số người và email chủ cây.
 *   Đã đo: người lạ thấy tên cây mà đọc `persons` vẫn ra 0 dòng
 *   (`kiem-thu/ban-thu-sql/do-b103.mjs`, hàng rào 2).
 */
export async function datChoNguoiLaThayTen(treeId, cho) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('dat_cho_nguoi_la_thay_ten', {
    p_tree: treeId, p_cho: !!cho,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (data && data.ok === false) {
    return { ok: false, loi: data.lyDo || 'Không đổi được công tắc.' };
  }
  return { ok: true, loi: null };
}

/**
 * Dựng một gia phả MỚI, rỗng, và người gọi thành quản trị của nó.
 *
 * @param {string} ten    tên gia phả, có dấu
 * @param {string} maCay  mã cây — chữ hoa không dấu, mở đầu bằng chữ cái
 * @param {string} note   ghi chú, có thể bỏ trống
 * @returns {Promise<{ok:boolean, cay:{fileId:string,ten:string,maCay:string}|null,
 *                    loi:string|null}>}
 *
 * ⚠ **KHÔNG hỏi trước xem người này có quyền không.** Đường đúng là cứ gọi và
 *   để máy chủ trả lời — `luoc-do/12-tao-cay.sql` hỏi `duoc_tao_cay()` ngay
 *   câu đầu. Đó là điểm dừng b104 viết thành chữ: *"một tài khoản không được
 *   cấp bấm vào thì bị MÁY CHỦ từ chối, không phải bị JavaScript giấu nút"*.
 *   Hỏi trước rồi ẩn nút là dựng phân quyền bằng JavaScript —
 *   `THIET-KE-NHIEU-CAY.md` mục 10 điều 6 cấm đúng việc ấy.
 *
 * ⚠ Hai câu `insert` (`trees` và `tree_members`) nằm trong CÙNG một giao dịch
 *   ở máy chủ. Không có đường nào từ đây đẻ ra một cây thiếu dòng thành viên —
 *   thứ sẽ là một cây không ai vào được, kể cả người vừa tạo.
 */
export async function taoGiaPhaMoi(ten, maCay, note = '') {
  const k = layKhach();
  if (!k) return { ok: false, cay: null, loi: 'Chưa nối được máy chủ.' };

  const { data, error } = await k.rpc('tao_gia_pha_moi', {
    p_ten: String(ten == null ? '' : ten),
    p_ma_cay: String(maCay == null ? '' : maCay),
    p_note: String(note == null ? '' : note),
  });
  if (error) return { ok: false, cay: null, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return {
      ok: false, cay: null,
      loi: (data && data.lyDo) || 'Không dựng được gia phả mới.',
    };
  }

  const c = data.cay || {};
  // `fileId` là tên cũ từ thời file JSON trên Drive — giữ nguyên vì `repo.js`
  // và hai màn hình cũ đang đọc đúng tên ấy. Cùng lý do đã ghi ở
  // `layDanhSachGiaPha()`.
  return {
    ok: true, loi: null,
    cay: { fileId: c.id, ten: c.ten || '', maCay: c.maCay || '' },
  };
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

  // ⚠ **KHÔNG `delete` gì cả** (đổi 05/09/2026, b100). Bản trước xoá sạch mọi
  //   dòng `user_settings` của người này rồi chèn lại một dòng, vì nó dùng
  //   *sự vắng mặt của những dòng khác* để nói "đang mở cây nào". Cái giá là
  //   người trung tâm mặc định của MỌI cây bị cuốn theo mỗi lần đổi cây.
  //
  //   Nay việc ấy là một CỜ trên chính dòng ấy, và hai câu lệnh (tắt cờ cũ,
  //   bật cờ mới) gói trong một giao dịch ở máy chủ — trình duyệt không phải
  //   giữ đúng thứ tự qua hai vòng mạng.
  const { data, error } = await k.rpc('dat_cay_dang_mo', { p_tree: treeId });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (data && data.ok === false) return { ok: false, loi: data.loi || 'Không đổi được gia phả.' };
  return { ok: true, loi: null };
}

/**
 * Bật/tắt hàng NGÀY GIỖ, nhớ riêng cho từng cây của từng người.
 *
 * ⚠ Là cài đặt **theo cây**, không phải theo người: một cây đã nhập đủ ngày
 *   giỗ và một cây chưa nhập ngày nào thì muốn hai lựa chọn khác nhau. Trước
 *   05/09/2026 công tắc này **không lưu ở đâu cả** — tắt trình duyệt là mất.
 */
export async function datHienNgayGio(treeId, bat) {
  const k = layKhach();
  const nguoi = await nguoiDangNhap();
  if (!k || !nguoi) return { ok: false, loi: 'Chưa đăng nhập.' };

  const { error } = await k.from('user_settings').upsert({
    user_id: nguoi.id, tree_id: treeId, hien_ngay_gio: !!bat,
  });
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
// Xếp hàng chờ duyệt — `luoc-do/07-duyet-dang-ky.sql`
// ============================================================
//
// Bốn hàm này đều là `rpc`, không phải `from(…)`, và đó là điều bắt buộc chứ
// không phải sở thích: người chưa được duyệt **không đọc được dòng của chính
// mình** trong `tree_members` — `approved` nay gác cả quyền đọc. Nên mọi câu
// hỏi về trạng thái đơn phải đi qua một hàm `security definer` chỉ nói về
// người đang gọi.

/**
 * Nộp đơn xin vào gia phả. Máy chủ đóng cứng vai `xem` và cờ chưa duyệt —
 * người gọi không chọn được vai của mình.
 *
 * ⚠ `treeId` bỏ trống thì máy chủ chỉ tự chọn hộ khi hệ thống có ĐÚNG MỘT
 *   cây; nhiều cây thì nó từ chối kèm câu chỉ đường. Đó là chủ ý — xem
 *   `luoc-do/10-sua-nhieu-cay.sql` mục 4e.
 *
 * @param {string} [loiNhan] người nộp tự giới thiệu, để admin biết đây là ai
 * @param {string|null} [treeId] xin vào cây nào
 * @returns {Promise<{ok:boolean, trangThai?:string, xinLuc?:string, loi?:string}>}
 */
export async function xinVaoCay(loiNhan = '', treeId = null) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('xin_vao_cay', {
    p_tree: treeId || null, p_loi_nhan: String(loiNhan || ''),
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  return data || { ok: false, loi: 'Máy chủ không trả lời.' };
}

/**
 * Trạng thái của chính người đang đăng nhập:
 * `chuadangnhap` · `chuanop` · `cho` · `duocmoi` · `daduyet` · `nhieucay`.
 *
 * ⚠ `nhieucay` là trạng thái MỚI (05/09/2026): người chưa có chân ở cây nào,
 *   mà máy chủ lại có nhiều cây — nên không có cây nào để nói về. Trước đó
 *   máy chủ đoán bừa một cây và trả lời như thể chắc chắn.
 *
 * ⚠ `duocmoi` là trạng thái MỚI (b108): một dòng `approved=false` có thể là
 *   ĐƠN XIN VÀO hoặc LỜI MỜI (từ b107) — hai người ấy cần nghe hai câu khác
 *   hẳn nhau. Kèm theo là `tenCay` · `maCay` · `moiVai` · `moiLuc` ·
 *   `emailNguoiMoi`, đủ để màn hình vẽ câu hỏi Nhận/Từ chối mà không phải
 *   gọi thêm máy chủ. `luoc-do/14-loi-moi.sql` mục 6b.
 *
 * Trả `chuadangnhap` khi hỏi hụt, chứ không ném lỗi: chỗ gọi nó là màn hình
 * từ chối, và một màn hình từ chối mà tự nó vỡ thì người dùng không còn đường
 * nào để đi tiếp.
 */
export async function trangThaiCuaToi(treeId = null) {
  const k = layKhach();
  if (!k) return { trangThai: 'chuadangnhap' };
  const { data, error } = await k.rpc('trang_thai_cua_toi', { p_tree: treeId || null });
  if (error || !data) return { trangThai: 'chuadangnhap' };
  return data;
}

// ============================================================
// Mời vào gia phả — chiều NGƯỢC của "xin vào" (b107/b108)
// `luoc-do/14-loi-moi.sql`
// ============================================================

/**
 * Mời một tài khoản (theo email) vào gia phả. Chỉ chủ cây và Quản trị hệ
 * thống mời được — máy chủ tự hỏi `co_the_quan_tri()`, hàm này không hỏi
 * trước, đúng luật đã ghi ở `taoGiaPhaMoi()`.
 *
 * ⚠ Không cú bấm nào đưa được người vào cây: đây chỉ là "chữ ký thứ nhất",
 *   người kia phải tự bấm Nhận (`nhanLoiMoi`) mới thật sự vào.
 *
 * @param {string} treeId
 * @param {string} email
 * @param {string} [vai] 'quan_tri' · 'sua' · 'xem' (mặc định)
 * @param {string} [maNguoi] mã người gắn sẵn, có thể bỏ trống
 */
export async function moiVaoCay(treeId, email, vai = 'xem', maNguoi = '') {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('moi_vao_cay', {
    p_tree: treeId, p_email: String(email || ''), p_vai: vai,
    p_ma_nguoi: maNguoi ? String(maNguoi) : null,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  return data || { ok: false, loi: 'Máy chủ không trả lời.' };
}

/** Chữ ký thứ hai — nhận lời mời. Vai lấy từ `moi_vai` máy chủ đã ghi sẵn. */
export async function nhanLoiMoi(treeId) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('nhan_loi_moi', { p_tree: treeId });
  if (error) return { ok: false, loi: cauLoi(error) };
  return data || { ok: false, loi: 'Máy chủ không trả lời.' };
}

/** Từ chối lời mời — xoá dòng, không đánh dấu (`change_log` mới là nhật ký). */
export async function tuChoiLoiMoi(treeId) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('tu_choi_loi_moi', { p_tree: treeId });
  if (error) return { ok: false, loi: cauLoi(error) };
  return data || { ok: false, loi: 'Máy chủ không trả lời.' };
}

/** Đơn đang xếp hàng. Không phải `quan_tri_he_thong`/`quan_tri` thì máy chủ trả mảng rỗng. */
export async function dsChoDuyet(treeId) {
  const k = layKhach();
  // ⚠ Thiếu `treeId` thì KHÔNG gọi. Trước 05/09/2026 máy chủ tự đoán một cây
  //   bằng `limit 1` không `order by` — với nhiều cây là duyệt nhầm hàng chờ
  //   của nhà khác, im lặng. Nay hàm máy chủ bắt buộc có `p_tree`.
  if (!k || !treeId) return [];
  const { data, error } = await k.rpc('ds_cho_duyet', { p_tree: treeId });
  return error ? [] : (data || []);
}

/** Duyệt một đơn: gắn mã người và bật cờ. Hàm máy chủ có từ b93. */
export async function duyetThanhVien(treeId, email, personId) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('duyet_thanh_vien', {
    p_tree: treeId, p_email: email, p_person_id: personId || null, p_duyet: true,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  return data || { ok: false, loi: 'Máy chủ không trả lời.' };
}

/** Gạt một đơn đi. Chỉ đụng được vào đơn đang chờ, không đụng thành viên thật. */
export async function tuChoiThanhVien(treeId, email) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('tu_choi_thanh_vien', {
    p_tree: treeId, p_email: email,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  return data || { ok: false, loi: 'Máy chủ không trả lời.' };
}

// ============================================================
// Kiểm duyệt nội dung — `luoc-do/08-kiem-duyet.sql`
// ============================================================
//
// Năm cửa cho `QuanTri.html` (b98). Cả năm đều là `rpc`, không phải
// `from('change_log')`, và đó là điều bắt buộc chứ không phải sở thích:
// `02-rls.sql` cho mọi thành viên ĐỌC `change_log` nhưng không cho ai GHI, nên
// đổi `trang_thai` chỉ đi được qua một hàm `security definer`. Cũng chính vì
// thế mà phép kiểm quyền nằm trong thân hàm ở máy chủ chứ không nằm ở đây —
// app không tự lọc, và vì thế app không thể lọc sai.

/**
 * Máy chủ trả lời: người đang đăng nhập có kiểm duyệt được cây này không.
 * Đối xứng `coTheSua()` ở trên, và cùng lý lẽ: **hỏi máy chủ, đừng suy từ
 * `vaiTro`**. Suy ở trình duyệt thì mỗi lần thêm một vai là phải nhớ sửa mọi
 * chỗ suy — mà quên một chỗ thì giao diện mở nút rồi máy chủ mới chặn.
 */
export async function coTheKiemDuyet(treeId) {
  const k = layKhach();
  if (!k) return false;
  const { data, error } = await k.rpc('co_the_kiem_duyet', { p_tree: treeId || null });
  return !error && data === true;
}

/**
 * Hàng chờ nội dung. Không phải quản trị thì máy chủ trả mảng rỗng.
 *
 * ⚠ **Không trả về cột `truoc`** — xem `08-kiem-duyet.sql` mục 9. Bảng chỉ
 *   cần biết một lần Lưu đụng vào BAO NHIÊU dòng, không cần cả bản ghi cũ,
 *   mà bản ghi cũ thì có thể rất nặng.
 *
 * @param {string} treeId
 * @param {string|null} trangThai `'cho'` · `'duyet'` · `'tu_choi'` · `null` = tất cả
 * @param {number} gioiHan
 * @returns {Promise<Array<{id:number, ts:string, by_email:string, action:string,
 *   target:string, note:string, revision:number, trang_thai:string,
 *   so_nguoi:number, so_honnhan:number, so_quanhe:number}>>}
 */
export async function dsKiemDuyet(treeId, trangThai = 'cho', gioiHan = 200) {
  const k = layKhach();
  if (!k || !treeId) return [];
  const { data, error } = await k.rpc('ds_kiem_duyet', {
    p_tree: treeId,
    p_trang_thai: trangThai === undefined ? 'cho' : trangThai,
    p_gioi_han: gioiHan,
  });
  return error ? [] : (data || []);
}

/** Đếm nhanh cho cái nhãn "Chờ duyệt (n)". Hỏng thì trả 0, không ném lỗi. */
export async function demChoKiemDuyet(treeId) {
  const k = layKhach();
  if (!k || !treeId) return 0;
  const { data, error } = await k.rpc('dem_cho_kiem_duyet', { p_tree: treeId });
  return error ? 0 : (Number(data) || 0);
}

/**
 * Nhận một lần Lưu làm chính thức. Không đụng một dòng dữ liệu nào — dữ liệu
 * đã nằm trong bảng từ lúc người ta bấm Lưu; duyệt chỉ là thôi treo cờ.
 */
export async function duyetThayDoi(treeId, id) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('duyet_thay_doi', {
    p_tree: treeId, p_id: id,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  return data || { ok: false, loi: 'Máy chủ không trả lời.' };
}

/**
 * Gạt một lần Lưu đi **và hoàn tác** dữ liệu về ảnh chụp `truoc`.
 *
 * ⚠ Máy chủ từ chối hoàn tác trong bốn ca, và mỗi ca trả về một `lyDo` riêng
 *   kèm câu tiếng Việt đã viết sẵn ở `loi` — `dabisuatiep` · `keotheo` ·
 *   `khongcoanhchup` · `vuongkhoangoai`. Nơi gọi **in thẳng `loi` ấy ra**,
 *   đừng tự chế câu khác: chỉ máy chủ mới biết ai đã sửa tiếp và sửa lúc nào.
 */
export async function tuChoiThayDoi(treeId, id, lyDo = '') {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('tu_choi_thay_doi', {
    p_tree: treeId, p_id: id, p_ly_do: String(lyDo || ''),
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  return data || { ok: false, loi: 'Máy chủ không trả lời.' };
}

// ============================================================
// QUẢN LÝ TÀI KHOẢN CỦA MỘT CÂY — `luoc-do/13-quan-ly-thanh-vien.sql`
// ============================================================
//
// ⚠ **HAI BỘ CHỮ, CỐ Ý.** Tên hàm ở đây chép ĐÚNG tên hàm SQL
//   (`ds_thanh_vien` → `dsThanhVien`), còn màn hình gọi thứ này là **tài
//   khoản**. Không phải quên thống nhất:
//     · Trong mã, một cái tên khớp 1–1 với máy chủ thì đọc lời gọi RPC là biết
//       nó chạm hàm nào — bẫy số 1 của `kiem-trang-quan-tri.mjs` (tên tham số
//       lệch chữ ký) chỉ bắt được nhờ cặp tên ấy đứng cạnh nhau.
//     · Trên màn hình, chữ *"thành viên"* nói sai chuyện: vai gắn cho **tài
//       khoản đăng nhập**, không gắn cho người trong sơ đồ. Chủ dự án nhắc
//       thẳng chỗ này 08/09/2026, và `13` mục 7 ghi lại nguyên văn.
//
// ⚠ **Bảy hàm này KHÔNG phải hàng rào.** Hàng rào nằm trong thân từng hàm SQL,
//   và luật *"không ai đặt quyền cho chính mình"* gác **năm cửa** ở đó —
//   `THIET-KE-NHIEU-CAY.md` mục 11.3. Chỗ này chỉ chuyển lời từ chối về đúng
//   nguyên văn máy chủ viết.
//
// ⚠ **`13` trả khoá `loi`, không phải `lyDo`.** Khác `dat_cay_mac_dinh()` và
//   `dat_cho_nguoi_la_thay_ten()` ở trên — hai hàm ấy của `11` dùng `lyDo`.
//   Đọc nhầm khoá thì màn hình hiện câu chung chung *"Không đổi được"* trong
//   khi máy chủ vừa nói rõ vì sao, và đó đúng là loại hỏng câm: có chữ, chỉ
//   sai chữ. Hàm `noiTuChoi()` dưới đây đọc cả hai để không ai phải nhớ.

/** Đọc câu từ chối của máy chủ, chấp cả hai khoá `loi` và `lyDo`. */
function noiTuChoi(data, macDinh) {
  if (!data) return macDinh;
  return data.loi || data.lyDo || macDinh;
}

/**
 * Máy chủ trả lời: người đang đăng nhập có **đổi được quyền** trong cây này
 * không — tức Quản trị hệ thống, hoặc chủ của chính cây ấy.
 *
 * ⚠ Khác hẳn `coTheKiemDuyet()` ngay trên, và đây là chỗ dễ lẫn nhất của cả
 *   b105: người mang vai `quan_tri` **được phong** kiểm duyệt được nội dung
 *   nhưng KHÔNG đổi được quyền của ai. Hai câu hỏi khác nhau, hai hàm khác
 *   nhau ở máy chủ (`co_the_kiem_duyet` · `co_the_quan_tri`).
 *
 * ⚠ Và vẫn đúng luật cũ: **hỏi máy chủ, đừng suy từ `vaiTro`**. Suy ở trình
 *   duyệt thì chủ cây — người nhận quyền qua cột `trees.chu_so_huu` chứ không
 *   qua mã vai — sẽ bị chính màn hình của mình khoá tay.
 */
export async function coTheQuanTri(treeId) {
  const k = layKhach();
  if (!k || !treeId) return false;
  const { data, error } = await k.rpc('co_the_quan_tri', { p_tree: treeId });
  return !error && data === true;
}

/**
 * Danh sách TÀI KHOẢN có tên trong một gia phả — cả người đã duyệt lẫn người
 * đang xếp hàng chờ. Không đủ quyền thì máy chủ trả mảng rỗng.
 *
 * ⚠ **`laChinhToi` tính ở ĐÂY, không tính ở màn hình.** Năm cửa đổi quyền đều
 *   từ chối khi người bị tác động chính là người đang gọi, nên màn hình phải
 *   mờ sẵn nút trên dòng của mình — mà muốn thế thì phải biết "mình" là dòng
 *   nào. So bằng `user_id` của phiên đăng nhập, KHÔNG so bằng email: email là
 *   thứ đổi được và thứ trùng nhau được, `user_id` thì không.
 *
 * ⚠ `laChuCay` là **cột của máy chủ**, không phải phép so ở đây. Cùng lý lẽ đã
 *   trả giá ở b103 với `toiLaChu`: cây chưa gán `chu_so_huu` thì mọi phép suy
 *   trong trình duyệt đều ra "không ai là chủ", lặng lẽ.
 */
export async function dsThanhVien(treeId) {
  const k = layKhach();
  if (!k || !treeId) return { ok: false, loi: 'Chưa nối được máy chủ.', ds: [] };

  const [{ data, error }, nguoi] = await Promise.all([
    k.rpc('ds_thanh_vien', { p_tree: treeId }),
    nguoiDangNhap(),
  ]);
  if (error) return { ok: false, loi: cauLoi(error), ds: [] };

  const toi = (nguoi && nguoi.id) || null;
  const ds = (data || []).map((r) => ({
    userId: r.user_id,
    email: r.email || '',
    maNgan: r.ma_ngan || '',
    vai: r.vai || '',
    daDuyet: Boolean(r.approved),
    maNguoi: r.person_id || '',
    tenNguoi: r.ten_nguoi || '',
    tinCay: Boolean(r.tin_cay),
    laChuCay: Boolean(r.la_chu_cay),
    laChinhToi: Boolean(toi && r.user_id === toi),
    xinLuc: r.xin_luc || null,
    loiNhan: r.loi_nhan || '',
    thamGia: r.added_at || null,
  }));
  return { ok: true, loi: null, ds };
}

/**
 * Đổi vai của một tài khoản trong cây. Trần quyền cấp được là `quan_tri` —
 * máy chủ chặn, không phải danh sách ở màn hình chặn.
 */
export async function doiVaiThanhVien(treeId, userId, vai) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('doi_vai_thanh_vien', {
    p_tree: treeId, p_user: userId, p_vai: String(vai || ''),
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return { ok: false, loi: noiTuChoi(data, 'Không đổi được vai trò.') };
  }
  return { ok: true, loi: null, vaiCu: data.vaiCu || '', vaiMoi: data.vaiMoi || '' };
}

/**
 * Gắn mã người trong sơ đồ cho một tài khoản. `maNguoi` rỗng là **gỡ gắn**.
 *
 * ⚠ Đây là cửa leo thang không ai nghĩ tới khi nghe chữ "đổi quyền": gắn một
 *   tài khoản vào cụ tổ đời trên cùng là mở `pham_vi_sua()` ra cả cây, không
 *   đổi một chữ vai nào. `13` mục 9 chặn "tự làm cho mình" đúng vì thế.
 */
export async function ganNguoiChoThanhVien(treeId, userId, maNguoi) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const ma = String(maNguoi == null ? '' : maNguoi).trim();
  const { data, error } = await k.rpc('gan_nguoi_cho_thanh_vien', {
    p_tree: treeId, p_user: userId, p_person: ma || null,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return { ok: false, loi: noiTuChoi(data, 'Không gắn được mã người.') };
  }
  return { ok: true, loi: null, maNguoi: data.maNguoi || '' };
}

/**
 * Bật/tắt **ghi thẳng** (`tin_cay`) cho một tài khoản: lần Lưu của họ thành
 * chính thức ngay, không qua hàng chờ kiểm duyệt.
 */
export async function datTinCayThanhVien(treeId, userId, bat) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('dat_tin_cay_thanh_vien', {
    p_tree: treeId, p_user: userId, p_bat: !!bat,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return { ok: false, loi: noiTuChoi(data, 'Không đổi được chế độ ghi thẳng.') };
  }
  return { ok: true, loi: null, tinCay: Boolean(data.tinCay) };
}

/**
 * Gỡ một tài khoản khỏi gia phả. Chỉ xoá dòng `tree_members` — **không đụng
 * `auth.users`**, tài khoản ấy vẫn đăng nhập được và vẫn xin vào lại được.
 */
export async function goThanhVien(treeId, userId) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('go_thanh_vien', {
    p_tree: treeId, p_user: userId,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return { ok: false, loi: noiTuChoi(data, 'Không gỡ được tài khoản.') };
  }
  return { ok: true, loi: null, email: data.email || '' };
}

/**
 * **Bàn giao gia phả** — chuyển cột `trees.chu_so_huu` sang một tài khoản
 * khác. Chủ cũ ở lại làm `quan_tri`, chủ mới nhận cả cột ấy lẫn một dòng
 * `tree_members`, cả ba câu trong cùng một giao dịch ở máy chủ.
 *
 * ⚠ Đây là việc **không có nút hoàn tác**: sau khi bàn giao, người vừa giao
 *   không còn quyền giao ngược lại — chỉ chủ mới (hoặc Quản trị hệ thống)
 *   làm được. Nơi gọi phải nói rõ điều ấy TRƯỚC khi bấm nhịp thứ hai.
 */
export async function doiChuCay(treeId, userIdMoi) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('doi_chu_cay', {
    p_tree: treeId, p_user_moi: userIdMoi,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return { ok: false, loi: noiTuChoi(data, 'Không bàn giao được gia phả.') };
  }
  return { ok: true, loi: null, emailMoi: data.emailMoi || '' };
}

// ============================================================
// TOÀN HỆ THỐNG — sổ đăng ký · cờ Quản trị hệ thống · xoá tài khoản (b109)
// ============================================================
//
// Bốn cửa của `luoc-do/14-loi-moi.sql` mục 7–10. Cả bốn **chỉ Quản trị hệ
// thống gọi được**, và câu ấy hỏi ở MÁY CHỦ, trong thân từng hàm SQL. Bốn hàm
// dưới đây cố ý **không hỏi trước** — hỏi trước là dựng chỗ trả lời thứ hai
// cho một câu đã có chỗ trả lời, và chỗ thứ hai ấy nằm trong trình duyệt, nơi
// F12 sửa được. Cùng luật đã ghi ở `taoGiaPhaMoi()` và `moiVaoCay()`.
//
// ⚠ `dsTaiKhoanHeThong()` khác `dsThanhVien()` ở trên đúng một chữ mà khác hẳn
//   về nghĩa: hàm kia trả về những tài khoản có chân trong MỘT cây — nó phục
//   vụ việc gắn người trong cây ấy. Hàm này trả về **cả sổ đăng ký của phần
//   mềm**, gồm cả người tạo tài khoản rồi bỏ đấy, không dính tới cây nào.

/**
 * Mọi tài khoản đã đăng ký. Không phải Quản trị hệ thống thì máy chủ trả về
 * mảng rỗng — `where public.la_quan_tri_he_thong()` ngay trong câu truy vấn.
 *
 * ⚠ `laChinhToi` tính ở ĐÂY, đúng chỗ `dsThanhVien()` tính, và vì đúng lý do
 *   ấy: hai cửa `dat_quan_tri_he_thong()` và `xoa_tai_khoan()` đều từ chối khi
 *   người bị tác động là người đang gọi, nên màn hình phải mờ sẵn nút trên
 *   dòng của mình. So bằng `user_id`, KHÔNG so bằng email.
 */
export async function dsTaiKhoanHeThong() {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.', ds: [] };

  const [{ data, error }, nguoi] = await Promise.all([
    k.rpc('ds_tai_khoan_he_thong'),
    nguoiDangNhap(),
  ]);
  if (error) return { ok: false, loi: cauLoi(error), ds: [] };

  const toi = (nguoi && nguoi.id) || null;
  const ds = (data || []).map((r) => ({
    userId: r.user_id,
    email: r.email || '',
    // ⚠ Tên của TÀI KHOẢN (`15-tim-kiem.sql` mục 1), không phải tên người
    //   trong sơ đồ. Tài khoản chưa gắn vào ai vẫn có tên này.
    hoTen: r.ho_ten || '',
    // ⚠ Vai cao nhất trong MỌI cây — `15-tim-kiem.sql` mục 5b. Cùng một người
    //   có thể là chủ cây A và chỉ xem được cây B, nên trường này là một dòng
    //   TÓM TẮT. Màn hình phải mở được bảng theo từng cây ngay từ nó; hiện nó
    //   mà không cho xem chi tiết là nói một nửa sự thật trông như cả sự thật.
    vaiCaoNhat: r.vai_cao_nhat || '',
    maNgan: r.ma_ngan || '',
    laQuanTriHeThong: Boolean(r.la_quan_tri_he_thong),
    duocTaoCay: Boolean(r.duoc_tao_cay),
    // Ba con số khác nhau và KHÔNG gộp được: chân thật · đơn đang chờ · lời
    // mời chưa nhận. Gộp lại là mất đúng thứ khu này sinh ra để nói.
    soCay: Number(r.so_cay) || 0,
    soCho: Number(r.so_cho) || 0,
    soMoi: Number(r.so_moi) || 0,
    soCayLamChu: Number(r.so_cay_lam_chu) || 0,
    taoLuc: r.tao_luc || null,
    dangNhapGanNhat: r.dang_nhap_gan_nhat || null,
    daXacNhanEmail: Boolean(r.da_xac_nhan_email),
    laChinhToi: Boolean(toi && r.user_id === toi),
  }));
  return { ok: true, loi: null, ds };
}

/**
 * Một dòng cho mỗi cây mà tài khoản này dính tới, ở bất kỳ trạng thái nào
 * trong ba trạng thái của `tree_members`: thành viên thật · đơn đang chờ ·
 * lời mời chưa nhận.
 *
 * ⚠ Phân biệt ba trạng thái bằng `daDuyet` và `moiLuc`, KHÔNG bằng `moiBoi`:
 *   `moi_boi` khai `on delete set null`, nên xoá tài khoản người mời sẽ biến
 *   một lời mời thành một thứ trông y hệt đơn xin vào. `14` mục 1 ghi rõ, và
 *   đó là chỗ dễ viết sai nhất của cả file ấy vì nó chỉ lộ ra khi có người bị
 *   xoá tài khoản — tức không bao giờ lộ ra trong lúc kiểm.
 */
export async function dsCayCuaTaiKhoan(userId) {
  const k = layKhach();
  if (!k || !userId) return { ok: false, loi: 'Chưa nối được máy chủ.', ds: [] };

  const { data, error } = await k.rpc('ds_cay_cua_tai_khoan', { p_user: userId });
  if (error) return { ok: false, loi: cauLoi(error), ds: [] };

  const ds = (data || []).map((r) => ({
    treeId: r.tree_id,
    ten: r.ten || '',
    maCay: r.tree_code || '',
    vai: r.vai || '',
    daDuyet: Boolean(r.approved),
    moiLuc: r.moi_luc || null,
    moiVai: r.moi_vai || '',
    maNguoi: r.person_id || '',
    tenNguoi: r.ten_nguoi || '',
    tinCay: Boolean(r.tin_cay),
    laChuCay: Boolean(r.la_chu_cay),
    thamGia: r.added_at || null,
  }));
  return { ok: true, loi: null, ds };
}

/**
 * Bật/tắt cờ `tai_khoan.la_quan_tri_he_thong` — **cửa thứ sáu** của luật
 * *không ai tự đặt quyền cho mình* (`THIET-KE-NHIEU-CAY.md` mục 11.5).
 *
 * ⚠ Máy chủ còn một phép mà năm cửa kia không cần: **không tắt được người
 *   cuối cùng**. Hai Quản trị hệ thống tắt lẫn nhau về không là khoá cả nhà
 *   rồi vứt chìa — sửa lại chỉ còn đường dán SQL tay.
 */
export async function datQuanTriHeThong(userId, bat) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('dat_quan_tri_he_thong', {
    p_user: userId, p_bat: !!bat,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return { ok: false, loi: noiTuChoi(data, 'Không đặt được cờ Quản trị hệ thống.') };
  }
  return { ok: true, loi: null, bat: Boolean(data.bat) };
}

/**
 * **Xoá hẳn một tài khoản** — `delete from auth.users`. Việc duy nhất trong
 * cả phần mềm phá huỷ một lối đăng nhập, và không có nút hoàn tác.
 *
 * ⚠ Bảy cửa gác nằm ở máy chủ, kể cả phép so `emailXacNhan`. Đừng so ở đây:
 *   người bấm gõ lại email từ một danh sách TOÀN HỆ THỐNG nơi hai dòng trông
 *   na ná nhau, nên phép so ấy phải hỏi chính hàng sắp bị xoá, không hỏi cái
 *   ô chữ mà màn hình vừa vẽ ra.
 *
 * ⚠ `chuMoi` để trống nghĩa là **người đang bấm nút nhận những cây tài khoản
 *   kia đang làm chủ**, và việc sang tên chạy trong cùng giao dịch với lệnh
 *   xoá — cây không bao giờ tồn tại ở trạng thái không chủ.
 *
 * @param {string} userId
 * @param {string} emailXacNhan  email gõ lại, phải khớp hàng sắp xoá
 * @param {string} [chuMoi]      tài khoản nhận cây; trống = người đang bấm
 */
export async function xoaTaiKhoan(userId, emailXacNhan, chuMoi = '') {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('xoa_tai_khoan', {
    p_user: userId,
    p_email_xac_nhan: String(emailXacNhan || ''),
    p_chu_moi: chuMoi || null,
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return { ok: false, loi: noiTuChoi(data, 'Không xoá được tài khoản.') };
  }
  return {
    ok: true, loi: null,
    email: data.email || '',
    soChanDaGo: Number(data.soChanDaGo) || 0,
    soCayDaChuyen: Number(data.soCayDaChuyen) || 0,
    emailChuMoi: data.emailChuMoi || '',
  };
}

// ============================================================
// BA CỬA TÌM KIẾM — `luoc-do/15-tim-kiem.sql`
// ============================================================
//
// ⚠ CẢ HAI HÀM TÌM LỌC Ở MÁY CHỦ, KHÔNG LỌC Ở ĐÂY. Đừng bao giờ "cho tiện"
//   bằng cách gọi `dsTaiKhoanHeThong()` một lần rồi lọc trong trình duyệt:
//   hàm ấy chỉ Quản trị hệ thống gọi được (chủ cây sẽ không có gợi ý nào), nó
//   trả cả cờ quyền và giờ đăng nhập (ô gợi ý chỉ cần hai chữ), và nó không
//   có tham số lọc nên mỗi lần gõ một chữ là tải cả sổ đăng ký về máy.
//   `THIET-KE-QUAN-TRI.md` khu 2 đã cấm đúng đường ấy.
//
// ⚠ MÁY CHỦ TRẢ VỀ RỖNG KHÔNG PHẢI LÀ LỖI. Người không quản trị cây thì hai
//   hàm SQL trả 0 dòng thay vì báo lỗi — hàng rào nằm trong chính câu truy
//   vấn. Nên nơi gọi không được vẽ câu "Không tải được"; ô gợi ý trống là
//   trạng thái hợp lệ.

/**
 * Gợi ý TÀI KHOẢN cho ô email của form Mời. Trả tối đa 8 dòng.
 *
 * Gác bằng đúng hàng rào của `moiVaoCay()` — chủ cây và Quản trị hệ thống.
 * Gõ dưới 2 ký tự thì máy chủ trả rỗng, nên nơi gọi không cần tự đếm.
 *
 * `trangThai` nói người này đang đứng ở đâu TRONG CÂY ĐANG HỎI, để dòng gợi ý
 * nói trước vì sao một email sẽ bị từ chối thay vì để bấm xong mới biết:
 *   `chua` · `thanh_vien` · `cho_duyet` · `da_moi` · `chinh_minh`
 */
export async function timTaiKhoan(treeId, chuoi) {
  const k = layKhach();
  if (!k || !treeId) return { ok: false, loi: 'Chưa nối được máy chủ.', ds: [] };

  const { data, error } = await k.rpc('tim_tai_khoan', {
    p_tree: treeId, p_chuoi: String(chuoi || ''),
  });
  if (error) return { ok: false, loi: cauLoi(error), ds: [] };

  const ds = (data || []).map((r) => ({
    userId: r.user_id,
    email: r.email || '',
    hoTen: r.ho_ten || '',
    // ⚠ Vai cao nhất trong MỌI cây — `15-tim-kiem.sql` mục 5b. Cùng một người
    //   có thể là chủ cây A và chỉ xem được cây B, nên trường này là một dòng
    //   TÓM TẮT. Màn hình phải mở được bảng theo từng cây ngay từ nó; hiện nó
    //   mà không cho xem chi tiết là nói một nửa sự thật trông như cả sự thật.
    vaiCaoNhat: r.vai_cao_nhat || '',
    maNgan: r.ma_ngan || '',
    maNguoi: r.person_id || '',
    tenNguoi: r.ten_nguoi || '',
    trangThai: r.trang_thai || 'chua',
  }));
  return { ok: true, loi: null, ds };
}

/**
 * Gợi ý NGƯỜI TRONG CÂY cho ô mã người. Trả tối đa 10 dòng.
 *
 * ⚠ Hàm này KHÔNG phá ranh giới *"QuanTri.html cố ý không nạp cây gia phả"*
 *   (`THIET-KE-QUAN-TRI.md` mục 1): nó lọc ở máy chủ và trả về mười dòng bốn
 *   chữ, không nạp 681 người về rồi lọc tại chỗ. Ngày ai đó thấy mình sắp
 *   viết `layCayGiaPha()` trong `pages/quan-tri/` thì dừng lại đọc mục ấy.
 *
 * `ganChoEmail` là thứ phải hiện ngay lúc chọn: gắn nhầm mã người là đổi
 * thẳng `pham_vi_sua()`, tức mở quyền sửa cho cả một nhánh.
 */
export async function timNguoiTrongCay(treeId, chuoi) {
  const k = layKhach();
  if (!k || !treeId) return { ok: false, loi: 'Chưa nối được máy chủ.', ds: [] };

  const { data, error } = await k.rpc('tim_nguoi_trong_cay', {
    p_tree: treeId, p_chuoi: String(chuoi || ''),
  });
  if (error) return { ok: false, loi: cauLoi(error), ds: [] };

  const ds = (data || []).map((r) => ({
    maNguoi: r.id || '',
    ten: r.ten || '',
    namSinh: r.nam_sinh || '',
    namMat: r.nam_mat || '',
    gioi: r.gioi || 'U',
    ganChoEmail: r.gan_cho_email || '',
  }));
  return { ok: true, loi: null, ds };
}

/**
 * Đặt HỌ TÊN cho một tài khoản. Chỉ Quản trị hệ thống, máy chủ gác.
 *
 * ⚠ Đây KHÔNG phải tên người trong sơ đồ gia phả — nó là tên để nhận mặt một
 *   tài khoản trong ô gợi ý, và một tài khoản có thể chưa gắn vào người nào.
 *   Hai thứ khác nhau, đừng đồng bộ chúng với nhau.
 */
export async function datHoTenTaiKhoan(userId, hoTen) {
  const k = layKhach();
  if (!k) return { ok: false, loi: 'Chưa nối được máy chủ.' };
  const { data, error } = await k.rpc('dat_ho_ten_tai_khoan', {
    p_user: userId, p_ho_ten: String(hoTen || ''),
  });
  if (error) return { ok: false, loi: cauLoi(error) };
  if (!data || data.ok !== true) {
    return { ok: false, loi: noiTuChoi(data, 'Không đặt được họ tên.') };
  }
  return { ok: true, loi: null, hoTen: data.hoTen || '' };
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
// một trong bốn việc còn dở ghi ở `KIEN-TRUC.md` mục 6.
//
// **Dựng gia phả mới** (`gas.taoFileDuLieuMoi`). Trên Postgres việc này là
// `insert into trees` + `insert into tree_members`, và nó phải là một hàm
// `security definer` nữa vì `02-rls.sql` không cấp quyền ghi vào `trees`.
// Chưa viết.
