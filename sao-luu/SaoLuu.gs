// ============================================================
// giapha-supabase · sao-luu/SaoLuu.gs
// Vai trò  : Trigger Apps Script chạy nền — chép toàn bộ cơ sở dữ liệu
//            Supabase ra một file JSON trên Google Drive, mỗi ngày một lần.
//            Kiêm luôn việc GIỮ SỐNG: gói miễn phí Supabase tự tạm dừng sau
//            7 ngày không có yêu cầu nào, và mỗi lần sao lưu là một yêu cầu.
// Lớp      : ngoài bậc thang phân lớp của app — mã này chạy trên máy chủ
//            Google, không nằm trong trình duyệt, không import file nào của repo.
// Phụ thuộc: Script Properties — SUPABASE_URL · KHOA_BI_MAT (bắt buộc),
//            THU_MUC_DRIVE · SO_BAN_GIU (tuỳ chọn)
// Phiên bản: 0.1.0 · Cập nhật: 03/09/2026 17:30
// ============================================================
//
// ⚠ ĐÂY KHÔNG PHẢI dự án Apps Script cũ. Dự án cũ (`giapha/gas/`) vẫn đang
//   phục vụ app mà người trong họ dùng hằng ngày và ĐÃ ĐÓNG BĂNG. File này
//   thuộc một dự án Apps Script RIÊNG, chỉ chạy nền, không có web app, không
//   có ai bấm vào.
//
// ⚠ KHOÁ BÍ MẬT KHÔNG NẰM TRONG FILE NÀY, và không được phép nằm ở đây.
//   Repo `giapha-supabase` để Public, nên mọi chữ trong file này đều đi lên
//   mạng — kể cả sau khi xoá, vì lịch sử git giữ lại. Khoá cất ở
//   **Script Properties**, xem `HUONG-DAN-SAO-LUU.md` bước 3.
//
// VÌ SAO SAO LƯU PHẢI DÙNG KHOÁ BÍ MẬT, chứ không dùng một tài khoản thường:
//   `luoc-do/02-rls.sql` cho mỗi người chỉ đọc được phần của mình ở hai bảng
//   (`user_settings`, `branch_access`). Một tài khoản thường đi sao lưu sẽ
//   chép thiếu đúng những dòng ấy — và **thiếu trong im lặng**, vì Postgres
//   không báo lỗi, nó chỉ trả về ít dòng hơn. Khoá bí mật vượt RLS nên chép
//   được đủ. Đó là đúng vai của nó, và cũng là lý do nó không được rời khỏi
//   Script Properties.

// ------------------------------------------------------------
// Danh sách bảng và cột dùng để sắp thứ tự khi đọc theo trang
// ------------------------------------------------------------
// ⚠ Phải khớp ĐÚNG danh sách bảng của `luoc-do/01-bang.sql` — không thiếu,
//   không thừa. `kiem-thu/kiem-sao-luu.mjs` phép 1 đọc thẳng file SQL ấy và
//   so với bảng dưới đây, nên ngày ai đó thêm một bảng mà quên sao lưu nó thì
//   bộ kiểm đỏ ngay, chứ không phải phát hiện vào ngày cần khôi phục.
//
// Vì sao phải nêu cột sắp thứ tự: đọc theo trang (`limit`/`offset`) mà không
// sắp thứ tự thì Postgres không hứa hai trang liên tiếp không trùng nhau và
// không bỏ sót. Với 681 người thì một trang là đủ và lỗi ấy không bao giờ lộ
// ra — cho tới ngày `change_log` vượt một nghìn dòng. Cột nêu ở đây là khoá
// chính của từng bảng, tức thứ tự luôn xác định.
var THU_TU_DOC = {
  trees:          'id',
  tree_members:   'tree_id,user_id',
  branches:       'tree_id,id',
  branch_access:  'tree_id,user_id,branch_id',
  persons:        'tree_id,id',
  unions:         'tree_id,id',
  union_children: 'tree_id,union_id,person_id',
  media:          'tree_id,id',
  sources:        'tree_id,id',
  change_log:     'id',
  imports:        'id',
  user_settings:  'user_id,tree_id'
};

var SO_DONG_MOI_TRANG = 1000;
var TEN_THU_MUC_MAC_DINH = 'Sao luu gia pha (Supabase)';
var SO_BAN_GIU_MAC_DINH = 30;
var KHUON_TEN_FILE = 'giapha-sao-luu-';

// ============================================================
// BA VIỆC CHỦ DỰ ÁN BẤM — không có việc thứ tư
// ============================================================

/**
 * Kiểm tra kết nối. KHÔNG ghi gì vào Drive, không đụng vào bản sao lưu nào.
 * Chạy hàm này trước tiên: nó nói được ngay là khoá đúng chưa, và mỗi bảng
 * hiện có bao nhiêu dòng.
 */
function kiemTraKetNoi() {
  var cauHinh = docCauHinh_();
  var dong = ['Kết nối tới: ' + cauHinh.url, ''];
  var tong = 0;
  Object.keys(THU_TU_DOC).forEach(function (bang) {
    var n = demDong_(cauHinh, bang);
    tong += n;
    dong.push('  ' + bang + ': ' + n + ' dòng');
  });
  var nguoi = docNguoiDung_(cauHinh);
  dong.push('  (tài khoản đăng nhập): ' + nguoi.length + ' người');
  dong.push('');
  dong.push('Tổng cộng ' + tong + ' dòng dữ liệu gia phả.');
  var ket = dong.join('\n');
  Logger.log(ket);
  return ket;
}

/**
 * Chép toàn bộ cơ sở dữ liệu ra một file JSON trên Drive. Đây là hàm mà
 * trigger hằng ngày gọi; chủ dự án cũng bấm tay được bất cứ lúc nào.
 */
function saoLuuNgay() {
  var cauHinh = null;
  try {
    cauHinh = docCauHinh_();
    var banSao = gomSaoLuu_(cauHinh);

    // ⚠ Cảnh báo sụt giảm phải chạy TRƯỚC khi ghi, nhưng KHÔNG được chặn việc
    //   ghi. Dữ liệu ít đi có thể là thật (dọn thùng rác), nên từ chối ghi là
    //   tự tay bỏ mất bản sao lưu của một ngày. Việc đúng là ghi, rồi hét lên.
    var loiCanhBao = soVoiLanTruoc_(banSao.dem);

    var thuMuc = layThuMuc_(cauHinh);
    var ten = KHUON_TEN_FILE + cauHinh.dauThoiGian + '.json';
    var file = thuMuc.createFile(ten, JSON.stringify(banSao, null, 1),
                                 'application/json');

    nhoDemLanNay_(banSao.dem);

    // ⚠ Nghi ngờ thì KHÔNG dọn. Nếu dữ liệu vừa mất thật, bản cũ đang là thứ
    //   duy nhất cứu được — dọn nó đi đúng lúc ấy là hỏng không sửa lại được.
    var daXoa = loiCanhBao ? 0 : donBanCu_(thuMuc, cauHinh.soBanGiu);

    if (loiCanhBao) {
      guiThu_('[Gia phả] ⚠ Bản sao lưu hôm nay ít dữ liệu hơn hẳn lần trước',
              loiCanhBao + '\n\nFile vẫn đã được ghi: ' + ten +
              '\nVà bản sao lưu cũ CHƯA bị dọn — lần này bỏ qua bước dọn.');
    }

    var ketQua = 'Đã ghi ' + ten + ' (' + file.getSize() + ' byte). ' +
                 'Xoá ' + daXoa + ' bản cũ.';
    Logger.log(ketQua);
    return ketQua;

  } catch (loi) {
    // Trigger chạy nền: hỏng mà không ai biết là kiểu hỏng tệ nhất của cả cơ
    // chế này — người ta chỉ phát hiện vào đúng ngày cần khôi phục.
    guiThu_('[Gia phả] ⛔ SAO LƯU HỎNG',
            'Bản sao lưu hằng ngày không chạy được.\n\n' +
            'Lỗi: ' + (loi && loi.message ? loi.message : String(loi)) + '\n\n' +
            'Mở script.google.com → dự án sao lưu → bấm chạy hàm ' +
            '`kiemTraKetNoi` để xem hỏng ở đâu.');
    throw loi;   // ném tiếp để Google cũng ghi vào sổ lỗi của trigger
  }
}

/**
 * Đặt lịch chạy tự động: mỗi ngày một lần, khoảng 2 giờ sáng.
 * Bấm lại nhiều lần cũng an toàn — lịch cũ bị gỡ trước khi đặt lịch mới.
 */
function datLichSaoLuu() {
  goLichSaoLuu();
  ScriptApp.newTrigger('saoLuuNgay').timeBased().everyDays(1).atHour(2).create();
  var ket = 'Đã đặt lịch: mỗi ngày một lần, khoảng 2 giờ sáng.';
  Logger.log(ket);
  return ket;
}

/** Gỡ lịch chạy tự động. Sao lưu bấm tay vẫn chạy được. */
function goLichSaoLuu() {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'saoLuuNgay') {
      ScriptApp.deleteTrigger(t);
      n++;
    }
  });
  Logger.log('Đã gỡ ' + n + ' lịch cũ.');
  return n;
}

// ============================================================
// GOM BẢN SAO LƯU
// ============================================================

/**
 * Đọc mọi thứ và dựng thành object sẽ ghi ra file.
 *
 * Hình file là **bản chép thô từng bảng**, không phải hình `tree` mà trình
 * duyệt dùng. Lý do: bản sao lưu phải trả lại ĐÚNG thứ đã có. Hình `tree`
 * cắt `change_log` xuống còn mỗi trường `target` (`DU-LIEU.md` mục 7), tức
 * khôi phục từ nó là mất sạch lịch sử ai sửa gì lúc nào. Muốn xem bản sao
 * lưu dưới hình `tree` thì đưa nó qua `hinh-dang.rapCay()`; chiều ngược lại
 * thì không có.
 */
function gomSaoLuu_(cauHinh) {
  var bang = {};
  var dem = {};
  Object.keys(THU_TU_DOC).forEach(function (ten) {
    var dong = docBang_(cauHinh, ten);
    bang[ten] = dong;
    dem[ten] = dong.length;
  });

  var nguoiDung = docNguoiDung_(cauHinh);
  dem.nguoiDung = nguoiDung.length;

  var khoAnh = docKhoAnh_(cauHinh);
  dem.anh = khoAnh.tep.length;

  return {
    khuon: 'giapha-sao-luu',
    phienBanKhuon: 1,
    taoLuc: cauHinh.taoLuc,
    taoLucVn: cauHinh.taoLucVn,
    nguon: cauHinh.url,
    // ⚠ ĐIỀU FILE NÀY KHÔNG CHỨA, và phải nói ra chứ không để người khôi phục
    //   tự phát hiện: mật khẩu. Supabase không cho đọc mật khẩu ra dù bằng
    //   khoá bí mật (nó chỉ giữ bản băm). Khôi phục sang một project khác thì
    //   mọi người phải đặt lại mật khẩu — dữ liệu gia phả về đủ, đường vào thì
    //   không.
    khongChua: 'Mật khẩu tài khoản (Supabase không cho đọc) và tệp ảnh gốc ' +
               '(chỉ có danh sách trong khoAnh).',
    dem: dem,
    bang: bang,
    nguoiDung: nguoiDung,
    khoAnh: khoAnh
  };
}

// ============================================================
// ĐỌC TỪ SUPABASE
// ============================================================

/** Đọc trọn một bảng, đi theo trang cho tới hết. */
function docBang_(cauHinh, ten) {
  var tatCa = [];
  var offset = 0;
  for (;;) {
    var url = cauHinh.url + '/rest/v1/' + ten +
              '?select=*&order=' + encodeURIComponent(THU_TU_DOC[ten]) +
              '&limit=' + SO_DONG_MOI_TRANG + '&offset=' + offset;
    var trang = goi_(cauHinh, url, 'đọc bảng ' + ten);
    if (!trang.length) break;
    tatCa = tatCa.concat(trang);
    if (trang.length < SO_DONG_MOI_TRANG) break;
    offset += SO_DONG_MOI_TRANG;
  }
  return tatCa;
}

/** Đếm số dòng mà không tải cả bảng về. Dùng cho `kiemTraKetNoi`. */
function demDong_(cauHinh, ten) {
  var url = cauHinh.url + '/rest/v1/' + ten + '?select=*&limit=1';
  var res = goiTho_(cauHinh, url, 'đếm bảng ' + ten, { Prefer: 'count=exact' });
  // PostgREST trả tổng số ở header `content-range`, khuôn `0-0/681`.
  var dai = String(res.getHeaders()['content-range'] ||
                   res.getHeaders()['Content-Range'] || '');
  var sau = dai.split('/')[1];
  return sau && sau !== '*' ? Number(sau) : 0;
}

/**
 * Danh sách tài khoản đăng nhập. Không đọc được qua REST thường — `auth.users`
 * không nằm trong schema mà PostgREST phục vụ — nên phải đi cửa Admin API.
 *
 * Vì sao phải sao lưu cả danh sách này: `tree_members.user_id` trỏ vào
 * `auth.users(id)`. Khôi phục bảng `tree_members` mà không có danh sách người
 * thì mọi dòng phân quyền trỏ vào hư không, và không có gì báo lỗi — chỉ là
 * chẳng ai vào được app.
 */
function docNguoiDung_(cauHinh) {
  var tatCa = [];
  var trang = 1;
  for (;;) {
    var url = cauHinh.url + '/auth/v1/admin/users?page=' + trang +
              '&per_page=' + SO_DONG_MOI_TRANG;
    var duLieu = goi_(cauHinh, url, 'đọc danh sách tài khoản');
    var ds = Array.isArray(duLieu) ? duLieu : (duLieu.users || []);
    ds.forEach(function (u) {
      tatCa.push({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at
      });
    });
    if (ds.length < SO_DONG_MOI_TRANG) break;
    trang++;
  }
  return tatCa;
}

/**
 * Liệt kê tệp trong kho ảnh. **Chỉ liệt kê, không tải ảnh về** — xem
 * `KE-HOACH.md` phần còn treo. Danh sách này tồn tại để lỗ hổng ấy ĐO ĐƯỢC:
 * mở file sao lưu ra là biết đang có bao nhiêu tấm ảnh chưa được chép đi đâu.
 *
 * Đường dẫn trong kho theo quy ước `<tree_id>/<media_id>-nho.jpg`, tức đúng
 * hai bậc, nên chỉ cần liệt kê hai bậc.
 */
function docKhoAnh_(cauHinh) {
  var tep = [];
  var tongByte = 0;
  var thuMuc = lietKeKho_(cauHinh, '');
  thuMuc.forEach(function (muc) {
    if (muc.id) return;                 // id === null nghĩa là thư mục
    lietKeKho_(cauHinh, muc.name + '/').forEach(function (t) {
      if (!t.id) return;
      var co = (t.metadata && t.metadata.size) || 0;
      tongByte += co;
      tep.push({ ten: muc.name + '/' + t.name, byte: co, capNhat: t.updated_at });
    });
  });
  return { kho: cauHinh.khoAnh, tep: tep, tongByte: tongByte };
}

function lietKeKho_(cauHinh, tienTo) {
  var ra = [];
  var offset = 0;
  for (;;) {
    var url = cauHinh.url + '/storage/v1/object/list/' + cauHinh.khoAnh;
    var trang = goi_(cauHinh, url, 'liệt kê kho ảnh', {
      prefix: tienTo,
      limit: SO_DONG_MOI_TRANG,
      offset: offset,
      sortBy: { column: 'name', order: 'asc' }
    });
    if (!trang.length) break;
    ra = ra.concat(trang);
    if (trang.length < SO_DONG_MOI_TRANG) break;
    offset += SO_DONG_MOI_TRANG;
  }
  return ra;
}

/** Gọi một địa chỉ, trả về JSON đã phân tích. `than` có thì gửi POST. */
function goi_(cauHinh, url, viec, than) {
  var res = goiTho_(cauHinh, url, viec, null, than);
  var chu = res.getContentText();
  try {
    return JSON.parse(chu);
  } catch (e) {
    throw new Error('Máy chủ trả về thứ không phải JSON khi ' + viec + ': ' +
                    chu.slice(0, 200));
  }
}

function goiTho_(cauHinh, url, viec, themDau, than) {
  var dau = {
    apikey: cauHinh.khoa,
    Authorization: 'Bearer ' + cauHinh.khoa
  };
  if (themDau) Object.keys(themDau).forEach(function (k) { dau[k] = themDau[k]; });

  var chonLua = { method: than ? 'post' : 'get', headers: dau,
                  muteHttpExceptions: true };
  if (than) {
    chonLua.contentType = 'application/json';
    chonLua.payload = JSON.stringify(than);
  }

  var res = UrlFetchApp.fetch(url, chonLua);
  var ma = res.getResponseCode();
  if (ma >= 200 && ma < 300) return res;

  // ⚠ Câu lỗi KHÔNG được chép lại `url` nguyên văn, và tuyệt đối không chép
  //   khoá — thư báo lỗi đi qua Gmail và nằm lại trong sổ lỗi của Apps Script.
  var giaiThich = ma === 401 || ma === 403
    ? 'Khoá bị từ chối. Mở Project Settings → Script Properties, kiểm ' +
      'KHOA_BI_MAT có đúng là chuỗi bắt đầu bằng "sb_secret_" không.'
    : ma === 404
      ? 'Không tìm thấy. Có thể bảng chưa dựng — bốn file trong luoc-do/ đã ' +
        'chạy đủ chưa?'
      : 'Máy chủ trả mã ' + ma + '.';
  throw new Error('Hỏng khi ' + viec + '. ' + giaiThich);
}

// ============================================================
// GHI RA DRIVE
// ============================================================

function layThuMuc_(cauHinh) {
  if (cauHinh.thuMucId) return DriveApp.getFolderById(cauHinh.thuMucId);
  var co = DriveApp.getFoldersByName(TEN_THU_MUC_MAC_DINH);
  if (co.hasNext()) return co.next();
  return DriveApp.createFolder(TEN_THU_MUC_MAC_DINH);
}

/**
 * Dọn bản cũ. Giữ `soBanGiu` bản gần nhất, VÀ giữ vĩnh viễn một bản cho mỗi
 * tháng (bản muộn nhất còn lại của tháng ấy).
 *
 * Vì sao có vế thứ hai: chỉ giữ 30 bản gần nhất thì một hỏng hóc không ai
 * nhận ra trong 31 ngày là mất hẳn — mà kiểu hỏng nguy hiểm nhất trong gia
 * phả đúng là kiểu không ai nhận ra (`DU-LIEU.md` mục 7 nói về cấp lại mã đã
 * dùng: "không có gì báo lỗi, chỉ là mọi câu chuyện cũ lặng lẽ dính sang một
 * người khác"). Một bản mỗi tháng là mười hai file một năm — rẻ tới mức không
 * đáng bàn, so với thứ nó cứu.
 */
function donBanCu_(thuMuc, soBanGiu) {
  var ds = [];
  var it = thuMuc.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    var ten = f.getName();
    if (ten.indexOf(KHUON_TEN_FILE) === 0) ds.push({ ten: ten, file: f });
  }
  // Tên file mang dấu thời gian `yyyy-MM-dd-HHmm` nên xếp theo chữ cái là xếp
  // đúng theo thời gian. Không đọc ngày sửa file của Drive: chép file hay khôi
  // phục từ thùng rác đều làm ngày ấy nhảy lung tung.
  ds.sort(function (a, b) { return a.ten < b.ten ? 1 : a.ten > b.ten ? -1 : 0; });

  var thangDaGiu = {};
  var daXoa = 0;
  ds.forEach(function (m, i) {
    var thang = m.ten.slice(KHUON_TEN_FILE.length, KHUON_TEN_FILE.length + 7);
    if (i < soBanGiu) { thangDaGiu[thang] = true; return; }
    if (!thangDaGiu[thang]) { thangDaGiu[thang] = true; return; }
    m.file.setTrashed(true);
    daXoa++;
  });
  return daXoa;
}

// ============================================================
// CẢNH BÁO
// ============================================================

/**
 * So số dòng lần này với lần trước. Trả về câu cảnh báo, hoặc `null` nếu bình
 * thường. Số lần trước cất trong Script Properties chứ không đọc lại file sao
 * lưu cũ — đọc một file vài megabyte mỗi ngày chỉ để lấy mấy con số là phí,
 * và nó thêm một chỗ hỏng được.
 */
function soVoiLanTruoc_(dem) {
  var kho = PropertiesService.getScriptProperties();
  var thoChu = kho.getProperty('DEM_LAN_TRUOC');
  if (!thoChu) return null;
  var truoc;
  try { truoc = JSON.parse(thoChu); } catch (e) { return null; }

  var loi = [];
  Object.keys(truoc).forEach(function (bang) {
    var cu = Number(truoc[bang]) || 0;
    var moi = Number(dem[bang]) || 0;
    if (cu >= 10 && moi < cu / 2) {
      loi.push('  ' + bang + ': ' + cu + ' → ' + moi + ' dòng');
    }
  });
  if (!loi.length) return null;
  return 'Số dòng tụt hơn một nửa so với lần sao lưu trước:\n\n' +
         loi.join('\n') + '\n\n' +
         'Có thể là thật (ai đó dọn thùng rác), có thể là dữ liệu đã mất. ' +
         'Mở app kiểm bằng mắt trước khi để bản sao lưu cũ bị dọn đi.';
}

function nhoDemLanNay_(dem) {
  PropertiesService.getScriptProperties()
    .setProperty('DEM_LAN_TRUOC', JSON.stringify(dem));
}

function guiThu_(tieuDe, than) {
  try {
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), tieuDe, than);
  } catch (e) {
    Logger.log('Không gửi được thư: ' + e);   // không để việc gửi thư làm hỏng sao lưu
  }
}

// ============================================================
// CẤU HÌNH
// ============================================================

/**
 * Đọc Script Properties và kiểm ngay tại chỗ. Thiếu hay sai thì phải hỏng ở
 * đây, bằng một câu tiếng Việt nói rõ phải làm gì — chứ không hỏng ở tận
 * trong một lệnh gọi mạng với mã 401 không giải thích gì.
 */
function docCauHinh_() {
  var kho = PropertiesService.getScriptProperties();
  var url = (kho.getProperty('SUPABASE_URL') || '').trim().replace(/\/+$/, '');
  var khoa = (kho.getProperty('KHOA_BI_MAT') || '').trim();

  if (!url || !khoa) {
    throw new Error('Chưa điền cấu hình. Mở Project Settings → Script ' +
      'Properties và thêm hai dòng: SUPABASE_URL và KHOA_BI_MAT. ' +
      'Hướng dẫn từng bước ở sao-luu/HUONG-DAN-SAO-LUU.md.');
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) {
    throw new Error('SUPABASE_URL trông không đúng khuôn. Phải có dạng ' +
      'https://xxxxxxxx.supabase.co — không có dấu / ở cuối.');
  }
  // ⚠ Phép kiểm ngược với phép kiểm trong `js/cau-hinh.js`, và ngược có chủ ý.
  //   Ở đó khoá bí mật là thứ TUYỆT ĐỐI không được có; ở đây nó là thứ bắt
  //   buộc phải có. Dán nhầm khoá công khai vào đây thì RLS sẽ lọc bớt dòng và
  //   bản sao lưu thiếu dữ liệu MÀ VẪN CHẠY XANH — kiểu hỏng tệ nhất. Nên bắt
  //   ngay từ hình dạng chuỗi.
  if (/^sb_publishable_/.test(khoa)) {
    throw new Error('KHOA_BI_MAT đang là khoá CÔNG KHAI (sb_publishable_…). ' +
      'Sao lưu bằng khoá ấy sẽ thiếu dòng mà không báo lỗi. Lấy đúng dòng ' +
      '"Secret key" ở Project Settings → API Keys.');
  }
  if (!/^sb_secret_|^eyJ/.test(khoa)) {
    throw new Error('KHOA_BI_MAT không đúng khuôn. Khoá bí mật của Supabase ' +
      'bắt đầu bằng "sb_secret_" (bản mới) hoặc "eyJ" (khoá service_role đời cũ).');
  }

  var bay = new Date();
  return {
    url: url,
    khoa: khoa,
    khoAnh: (kho.getProperty('KHO_ANH') || 'anh').trim(),
    thuMucId: (kho.getProperty('THU_MUC_DRIVE') || '').trim(),
    soBanGiu: Number(kho.getProperty('SO_BAN_GIU')) || SO_BAN_GIU_MAC_DINH,
    taoLuc: bay.toISOString(),
    taoLucVn: Utilities.formatDate(bay, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'),
    dauThoiGian: Utilities.formatDate(bay, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd-HHmm')
  };
}
