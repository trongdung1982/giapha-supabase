// ============================================================
// giapha-supabase · js/pages/quan-tri/khu-thanh-vien.js
// Vai trò  : Khu 2 của trang Quản trị — danh sách TÀI KHOẢN có tên trong gia
//            phả đang mở, cộng năm việc đổi quyền và hai việc duyệt đơn.
// Lớp      : pages — được phép gọi mọi lớp dưới
// Phụ thuộc: services/sb, config
// Phiên bản: 0.1.0 · Cập nhật: 08/09/2026 20:20
// ============================================================
//
// ═══ CHỮ "TÀI KHOẢN", KHÔNG PHẢI "THÀNH VIÊN" ═══
//
// Bảng dưới máy chủ tên là `tree_members` và hàm tên `ds_thanh_vien`, nhưng
// thứ liệt kê ở đây là **tài khoản đăng nhập**, không phải người trong sơ đồ
// gia phả. Hai cột khác hẳn nhau và nhầm chúng là hiểu sai cả khu này:
//
//   · `userId`  → tài khoản trong phần mềm. **Vai trò gắn vào đây.**
//   · `maNguoi` → mã người trong cây (`P0012`), có thể trống. Chỉ dùng để tính
//                 phạm vi sửa trực hệ khi vai là `sua`.
//
// Nghĩa là chủ cây phong `quan_tri` cho một tài khoản bất kỳ — người ấy không
// cần có mặt trong gia phả, không cần là con cháu trong họ. Chủ dự án nhắc
// thẳng chỗ này 08/09/2026; `luoc-do/13` mục 7 ghi nguyên văn.
//
// ═══ AI ĐỔI ĐƯỢC QUYỀN — VÀ VÌ SAO KHU NÀY CÓ HAI HẠNG NGƯỜI XEM ═══
//
// `THIET-KE-NHIEU-CAY.md` mục 11.3, chốt 08/09/2026:
//
//   · **Quản trị hệ thống** (cờ `tai_khoan`) — đổi được ở mọi cây.
//   · **Chủ cây** (cột `trees.chu_so_huu`) — đổi được ở cây mình.
//   · **Quản trị gia phả** (`quan_tri` được phong) — **chỉ sửa + duyệt NỘI
//     DUNG. Không đổi quyền, và không duyệt đơn xin vào cây** — nhận một người
//     vào cây là cấp quyền ĐỌC, đó là đổi quyền chứ không phải kiểm một lần Lưu.
//
// Hạng thứ ba vẫn **thấy** bảng này (máy chủ gác `ds_thanh_vien` bằng
// `co_the_kiem_duyet`, cố ý — `02-rls.sql` vốn đã cho mọi thành viên đọc
// `tree_members`, gác chặt hơn ở đó là diễn kịch). Nên khu này phải phân biệt
// *xem được* với *đổi được*, và câu trả lời cho vế thứ hai hỏi máy chủ bằng
// `coTheQuanTri()` — **không suy từ `phien.vaiTro`**: chủ cây nhận quyền qua
// một CỘT, không qua mã vai, nên mọi phép suy trong trình duyệt đều khoá tay
// đúng người có quyền nhất.
//
// ⚠ **Ẩn / mờ nút KHÔNG phải hàng rào.** Hàng rào nằm trong thân bảy hàm SQL
//   của `13`. Ở đây mờ nút chỉ để không mời người ta bấm một thứ chắc chắn bị
//   từ chối — `THIET-KE-QUAN-TRI.md` mục 5 câu cuối.
//
// ═══ HAI NHỊP, VÀ VÌ SAO MỜ SẴN NÚT TRÊN DÒNG CỦA CHÍNH MÌNH ═══
//
// Năm cửa đổi quyền đều từ chối khi người bị tác động **chính là người đang
// gọi** — luật *"không ai đặt quyền cho chính mình"*, không ngoại lệ, kể cả
// Quản trị hệ thống. Hai cửa trong đó không ai gọi là "quyền" mà vẫn là leo
// thang: tự **gắn mã người** cho mình vào một cụ tổ mở `pham_vi_sua()` ra cả
// cây; tự bật **ghi thẳng** là tự bỏ qua kiểm duyệt.
//
// Nên dòng của chính mình phải **mờ sẵn kèm một câu lý do**, đừng để bấm rồi
// mới nhận câu từ chối. Mờ chứ không ẩn: ẩn thì người ta đi tìm, và không có
// gì dạy họ luật ấy tồn tại.
//
// ⚠ **Không `alert()`, không `confirm()`.** Cả app chưa có chỗ nào dùng
//   (`khung.js` đầu file). Việc hỏng thì nói ngay tại dòng nó hỏng.

import {
  layPhien, coTheQuanTri, dsThanhVien,
  doiVaiThanhVien, ganNguoiChoThanhVien, datTinCayThanhVien,
  goThanhVien, doiChuCay, duyetThanhVien, tuChoiThanhVien,
} from '../../services/sb.js';
import { vaiTroBangChu } from '../../config.js';

/**
 * Ba tấm lọc. Lọc ở TRÌNH DUYỆT, không gọi lại máy chủ — cả ba nhìn cùng một
 * danh sách, khác nhau đúng một cột `approved`, và danh sách ấy đếm bằng chục
 * chứ không bằng nghìn. Gọi lại một vòng mạng cho mỗi lần bấm tấm lọc là trả
 * tiền mạng để lấy về đúng những dòng vừa có trong tay.
 */
const LOC = [
  { ma: 'cho',    chu: 'Đang chờ' },
  { ma: 'duyet',  chu: 'Đã duyệt' },
  { ma: 'tatca',  chu: 'Tất cả' },
];

/** Trần quyền cấp được cho tài khoản khác — `13` mục 8 chặn phần còn lại. */
const VAI_CAP_DUOC = ['quan_tri', 'sua', 'xem'];

// ⚠ Mở ra là thấy **Tất cả**, không phải "Đang chờ" như khu Kiểm duyệt. Hai
//   khu trả lời hai câu khác nhau: bên kia là một HÀNG CHỜ, mở ra để xử lý cho
//   hết; bên này là một DANH SÁCH, mở ra để biết ai đang có quyền gì. Lọc sẵn
//   thành một khúc là giấu mất câu trả lời chính, và người mới vào không biết
//   mình đang nhìn một phần.
let locDangXem = 'tatca';

// ============================================================
// Cửa vào
// ============================================================

/**
 * Vẽ khu Tài khoản & quyền.
 *
 * @param {HTMLElement} el     thân trang, đã dọn sạch
 * @param {object} [phienVao]  kết quả `sb.layPhien()`; thiếu thì tự hỏi
 */
export async function mountKhuThanhVien(el, phienVao) {
  el.innerHTML = '';

  const h = document.createElement('h2');
  h.className = 'qt-tua';
  h.textContent = 'Tài khoản & quyền';

  const dan = document.createElement('p');
  dan.textContent =
    'Những tài khoản đăng nhập có tên trong gia phả đang mở. Vai trò gắn cho ' +
    'TÀI KHOẢN, không gắn cho người trong sơ đồ — một tài khoản có thể quản ' +
    'trị gia phả mà không có mặt trong họ.';
  dan.style.cssText = 'margin:0 0 16px;color:#6a625a;line-height:1.5';

  const than = document.createElement('div');
  than.textContent = 'Đang đọc danh sách…';
  than.style.cssText = 'color:#8a8078';

  el.append(h, dan, than);

  const phien = phienVao || await layPhien();
  if (phien.loi) {
    than.innerHTML = '';
    than.style.cssText = '';
    than.append(veLoi(phien.loi, () => mountKhuThanhVien(el, null)));
    return;
  }

  if (!phien.treeId) {
    than.innerHTML = '';
    than.style.cssText = '';
    const r = document.createElement('div');
    r.className = 'qt-chua-lam';
    r.textContent =
      'Bạn chưa mở gia phả nào, nên chưa có danh sách tài khoản để xem. ' +
      'Sang khu Gia phả chọn một cây làm việc trước.';
    than.append(r);
    return;
  }

  await nap(than, phien);
}

async function nap(than, phien) {
  // Hai câu hỏi đi cùng lượt — chúng không phụ thuộc nhau.
  const [kq, duocDoiQuyen] = await Promise.all([
    dsThanhVien(phien.treeId),
    coTheQuanTri(phien.treeId),
  ]);

  than.innerHTML = '';
  than.style.cssText = '';

  const napLai = () => nap(than, phien);

  if (!kq.ok) {
    than.append(veLoi(kq.loi || 'Không đọc được danh sách tài khoản.', napLai));
    return;
  }

  const ds = kq.ds || [];

  // ⚠ Danh sách RỖNG ở đây gần như luôn nghĩa là *"máy chủ không cho bạn
  //   đọc"*, không phải *"gia phả không có ai"*: mọi cây đều có ít nhất dòng
  //   của chủ nó. Nói đúng chuyện ấy, đừng vẽ một cái bảng trống — bảng trống
  //   nói "không có dữ liệu" và người đọc đi tìm lỗi ở chỗ khác.
  if (!ds.length) {
    const r = document.createElement('div');
    r.className = 'qt-chua-lam';
    r.textContent =
      'Máy chủ không trả về tài khoản nào. Khu này dành cho người quản trị ' +
      'gia phả; tài khoản của bạn xem và sửa gia phả bình thường ở trang ' +
      'chính. Cần đổi thì nhắn cho ' + (phien.nguoiQuanLy || 'người quản lý') + '.';
    than.append(r);
    return;
  }

  if (!duocDoiQuyen) than.append(veNhacChiXem());

  than.append(veThanhLoc(ds, () => napLai(), (moi) => {
    locDangXem = moi;
    napLai();
  }));

  const hienRa = ds.filter(hopLoc);
  if (!hienRa.length) {
    const r = document.createElement('div');
    r.className = 'qt-chua-lam';
    r.textContent = locDangXem === 'cho'
      ? 'Không có ai đang chờ duyệt.'
      : 'Không có tài khoản nào ở mục này.';
    than.append(r);
    return;
  }

  // ⚠ BẢNG VIỆC ĐỨNG NGOÀI BẢNG, và đó là kết quả ĐO chứ không phải sở thích.
  //   Bản đầu mở nó thành một dòng `<tr>` ngay dưới dòng vừa bấm — đọc mã thì
  //   hợp lý, và trên máy tính 1280px trông đẹp. Ảnh chụp 390px cho thấy nó
  //   hỏng: ô mở rộng nằm TRONG cái bảng `min-width:860px`, nên nửa phải của
  //   mọi câu giải thích bị cắt, và muốn đọc phải kéo ngang từng dòng một.
  //   Đúng loại lỗi bất biến văn bản không bắt được — hợp lệ, mà không dùng
  //   được. Đứng ngoài thì nó rộng đúng bằng khu, ở cả hai bề ngang màn hình.
  const oViec = document.createElement('div');

  const khung = veBang(hienRa, phien, duocDoiQuyen, napLai, oViec);
  than.append(khung);

  // ⚠ Nói ra CHỈ KHI nó đúng, và ĐO để biết nó đúng — chép đúng cách
  //   `khu-kiem-duyet.js` làm. Nút mở bảng việc nằm ở cột cuối, tức nó là thứ
  //   đầu tiên biến mất khi màn hình hẹp; không nói thì người cầm điện thoại
  //   tưởng khu này chỉ để đọc. Ảnh chụp 390px bắt được đúng chỗ này (b106).
  if (khung.scrollWidth > khung.clientWidth + 4) {
    const n = document.createElement('div');
    n.textContent =
      'Màn hình hẹp hơn bảng — kéo ngang trong bảng để thấy cột thao tác ở cuối dòng.';
    n.style.cssText = 'margin-top:8px;font-size:12px;color:#8a8078;line-height:1.5';
    than.append(n);
  }

  than.append(oViec);
}

function hopLoc(t) {
  if (locDangXem === 'cho') return !t.daDuyet;
  if (locDangXem === 'duyet') return t.daDuyet;
  return true;
}

/**
 * Câu nói thẳng cho người mang vai `quan_tri` **được phong**: xem được, không
 * đổi được. Đây là món nợ b105 trả ở đây — trước bước này họ thấy khối *Đơn
 * chờ duyệt* trong Cài đặt, bấm Duyệt rồi mới nghe máy chủ từ chối.
 */
function veNhacChiXem() {
  const hop = document.createElement('div');
  hop.style.cssText =
    'margin-bottom:14px;padding:11px 13px;border:1px solid #e2d5bf;' +
    'border-radius:9px;background:#faf6ee;color:#7a5a28;font-size:13px;' +
    'line-height:1.55';
  hop.textContent =
    'Bạn xem được danh sách này nhưng không đổi được quyền của ai, và cũng ' +
    'không duyệt được đơn xin vào gia phả — nhận một người vào cây là cấp ' +
    'quyền đọc, việc ấy thuộc chủ gia phả. Bạn vẫn sửa và duyệt nội dung bình thường.';
  return hop;
}

// ============================================================
// Ba tấm lọc
// ============================================================

/** Ngôn ngữ hình lấy nguyên của `veThanhLoc()` trong khu Kiểm duyệt. */
function veThanhLoc(ds, _napLai, doiLoc) {
  const hang = document.createElement('div');
  hang.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px';

  const soCho = ds.filter((t) => !t.daDuyet).length;

  for (const l of LOC) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.loc = l.ma;
    // Số trong ngoặc chỉ mọc ở tấm "Đang chờ", và chỉ khi khác 0 — đúng luật
    // `CLAUDE.md` mục 7. Một cái "(0)" nói *có việc đấy* trong khi không có.
    b.textContent = (l.ma === 'cho' && soCho) ? l.chu + ' (' + soCho + ')' : l.chu;
    const dangChon = l.ma === locDangXem;
    b.style.cssText =
      'padding:8px 14px;font:inherit;font-size:13px;border-radius:9px;' +
      'cursor:pointer;touch-action:manipulation;' +
      'border:1px solid ' + (dangChon ? '#2a2622' : '#e6e0d8') + ';' +
      'background:' + (dangChon ? '#2a2622' : '#faf8f5') + ';' +
      'color:' + (dangChon ? '#fffdf9' : '#2a2622') + ';' +
      'font-weight:' + (dangChon ? '600' : '400');
    b.addEventListener('click', () => {
      if (locDangXem === l.ma) return;
      doiLoc(l.ma);
    });
    hang.append(b);
  }
  return hang;
}

// ============================================================
// Bảng
// ============================================================

function veBang(ds, phien, duocDoiQuyen, napLai, oViec) {
  // Bảng rộng phải tự cuộn TRONG khung của nó, không kéo phình cả lưới hai cột
  // của trang. Cùng cách hai khu kia làm.
  const khung = document.createElement('div');
  khung.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';

  const bang = document.createElement('table');
  bang.style.cssText =
    'width:100%;min-width:860px;border-collapse:collapse;font-size:13px;' +
    'background:#fffdf9;border:1px solid #e6e0d8;border-radius:10px';

  bang.append(veDauBang());

  const ruot = document.createElement('tbody');
  for (const t of ds) veMotDong(ruot, t, phien, duocDoiQuyen, napLai);
  bang.append(ruot);

  khung.append(bang);
  return khung;
}

function veDauBang() {
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #e6e0d8;background:#faf8f5';

  const cot = [
    ['Tài khoản', ''],
    // ⚠ Cột này có việc thật, không phải trang trí: hai người trong họ trùng
    //   tên là chuyện thường ở gia phả, và mã ngắn là thứ chỉ đúng một tài
    //   khoản mà không phải đọc email lên. Màn Cài đặt hiện đúng mã ấy cho
    //   từng người tự đọc (`settings.js`, khối *Tài khoản và quyền*).
    ['Mã tài khoản', ''],
    ['Người được gắn', ''],
    ['Vai trò', ''],
    ['Ghi thẳng', 'text-align:center'],
    ['Tham gia', ''],
    ['', 'text-align:right'],
  ];
  for (const [chu, them] of cot) {
    const th = document.createElement('th');
    th.textContent = chu;
    th.style.cssText =
      'padding:9px 10px;text-align:left;font-weight:600;color:#6a625a;' +
      'font-size:12px;white-space:nowrap;' + them;
    tr.append(th);
  }
  thead.append(tr);
  return thead;
}

/**
 * Một dòng, cộng một dòng thứ hai **ẩn sẵn** ngay dưới nó để mở bảng việc.
 *
 * ⚠ Vì sao mở rộng xuống dưới chứ không nhồi năm nút vào cột cuối: ba trong
 *   năm việc cần một ô nhập hoặc một ô chọn đứng cạnh nút. Nhồi hết vào một ô
 *   bảng thì trên điện thoại chúng xếp chồng thành một cột hẹp không đọc nổi,
 *   còn trên máy tính thì bảng phình ngang tới mức phải cuộn mới thấy cột đầu.
 */
function veMotDong(ruot, t, phien, duocDoiQuyen, napLai) {
  const tr = document.createElement('tr');
  tr.style.cssText = 'border-bottom:1px solid #f2eee8;vertical-align:top';

  // — Tài khoản: email + huy hiệu —
  const oTk = o('', 'padding:10px;color:#2a2622;word-break:break-all');
  const email = document.createElement('span');
  email.textContent = t.email || '(không rõ email)';
  email.style.fontWeight = '600';
  oTk.append(email);
  if (t.laChuCay) oTk.append(huyHieu('Chủ gia phả', true));
  if (t.laChinhToi) oTk.append(huyHieu('Bạn', false));
  if (!t.daDuyet) oTk.append(huyHieu('Đang chờ', false));

  const oMa = o(t.maNgan || '—',
    'padding:10px;font-family:ui-monospace,monospace;font-size:12px;color:#5b4533');

  // Trường trống thì KHÔNG vẽ chữ thay thế kiểu "Không rõ" — `CLAUDE.md` mục 7.
  // Ở đây dấu gạch là *"chưa gắn"*, một trạng thái hợp lệ và có thật, nên nó
  // được nói ra; nhưng tên người thì chỉ hiện khi có.
  const oNguoi = o('', 'padding:10px;color:#2a2622');
  if (t.maNguoi) {
    const ma = document.createElement('span');
    ma.textContent = t.maNguoi;
    ma.style.cssText = 'font-family:ui-monospace,monospace;font-size:12px;color:#5b4533';
    oNguoi.append(ma);
    if (t.tenNguoi && t.tenNguoi !== t.maNguoi) {
      const ten = document.createElement('div');
      ten.textContent = t.tenNguoi;
      ten.style.cssText = 'font-size:12px;color:#6a625a';
      oNguoi.append(ten);
    }
  } else {
    oNguoi.textContent = 'chưa gắn';
    oNguoi.style.color = '#8a8078';
    oNguoi.style.fontStyle = 'italic';
  }

  // `nowrap`: tên vai dài nhất là *Thành viên họ tộc*, và để nó gãy làm hai
  //   dòng thì cột Vai trò cao gấp đôi mọi cột khác trên cùng một hàng — đo
  //   bằng ảnh chụp 1280px, không đoán.
  const oVai = o(vaiTroBangChu(t.vai) || t.vai || '', 'padding:10px;white-space:nowrap');

  const oTin = o(t.tinCay ? 'Có' : 'Không',
    'padding:10px;text-align:center;color:' + (t.tinCay ? '#2f6b3a' : '#8a8078'));

  // Người đang chờ thì mốc đáng đọc là lúc họ NỘP ĐƠN, không phải lúc dòng
  // được tạo — hai mốc ấy trùng nhau hôm nay, nhưng câu chữ phải nói đúng cái
  // người duyệt cần biết.
  const oLuc = o(gioVietNam(t.daDuyet ? t.thamGia : (t.xinLuc || t.thamGia)),
    'padding:10px;color:#6a625a;font-size:12px;white-space:nowrap');

  const oThao = o('', 'padding:10px;text-align:right');

  tr.append(oTk, oMa, oNguoi, oVai, oTin, oLuc, oThao);
  ruot.append(tr);

  // — Dòng mở rộng —
  const trPhu = document.createElement('tr');
  trPhu.style.display = 'none';
  const oPhu = document.createElement('td');
  oPhu.colSpan = 7;
  oPhu.style.cssText = 'padding:0 10px 14px;background:#faf8f5';
  trPhu.append(oPhu);
  ruot.append(trPhu);

  const bMo = nut(t.daDuyet ? 'Sửa quyền' : 'Xét đơn', false);
  bMo.addEventListener('click', () => {
    const dangMo = trPhu.style.display !== 'none';
    trPhu.style.display = dangMo ? 'none' : '';
    bMo.textContent = dangMo
      ? (t.daDuyet ? 'Sửa quyền' : 'Xét đơn')
      : 'Thu lại';
    if (!dangMo && !oPhu.childNodes.length) {
      oPhu.append(t.daDuyet
        ? veBangViec(t, phien, duocDoiQuyen, napLai)
        : veXetDon(t, phien, duocDoiQuyen, napLai));
    }
  });
  oThao.append(bMo);
}

// ============================================================
// Bảng việc của một tài khoản ĐÃ DUYỆT — năm việc, đều hai nhịp
// ============================================================

function veBangViec(t, phien, duocDoiQuyen, napLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'display:flex;flex-direction:column;gap:12px;padding:12px 0 2px;' +
    'border-top:1px solid #ece6dd';

  // Vì sao nút mờ — nói MỘT lần ở đầu bảng việc, thay vì nhắc lại năm lần.
  const vuong = lyDoVuong(t, duocDoiQuyen);
  if (vuong) hop.append(dongNhac(vuong));

  hop.append(viecDoiVai(t, phien, duocDoiQuyen, napLai));
  hop.append(viecGanNguoi(t, phien, duocDoiQuyen, napLai));
  hop.append(viecTinCay(t, phien, duocDoiQuyen, napLai));
  hop.append(viecGo(t, phien, duocDoiQuyen, napLai));
  hop.append(viecBanGiao(t, phien, duocDoiQuyen, napLai));
  return hop;
}

/**
 * Một câu giải thích vì sao dòng này bị khoá tay. Ba lý do, và chúng không
 * loại trừ nhau — chọn lý do NẶNG NHẤT để nói, vì nói cả ba thì người đọc
 * phải tự xếp hạng.
 */
function lyDoVuong(t, duocDoiQuyen) {
  if (!duocDoiQuyen) {
    return 'Bạn không đổi được quyền trong gia phả này — việc ấy thuộc chủ gia phả ' +
           'và Quản trị hệ thống.';
  }
  if (t.laChinhToi) {
    return 'Đây là dòng của chính bạn. Không ai đặt quyền cho chính mình được — ' +
           'luật này không có ngoại lệ, kể cả Quản trị hệ thống, và nó gác cả ' +
           'việc tự gắn mã người lẫn việc tự bật ghi thẳng. Nhờ một quản trị khác làm.';
  }
  if (t.vai === 'sao_luu') {
    return 'Đây là tài khoản sao lưu tự động. Đổi vai hay gỡ nó là bản sao lưu ' +
           'đêm ra file rỗng mà không báo lỗi.';
  }
  return '';
}

/** Đổi vai — trần là `quan_tri`, và chủ cây thì không hạ vai được. */
function viecDoiVai(t, phien, duocDoiQuyen, napLai) {
  const khoa = !duocDoiQuyen || t.laChinhToi || t.laChuCay || t.vai === 'sao_luu';

  const chon = document.createElement('select');
  chon.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;min-width:190px';
  for (const v of VAI_CAP_DUOC) {
    const m = document.createElement('option');
    m.value = v;
    m.textContent = vaiTroBangChu(v);
    chon.append(m);
  }
  chon.value = VAI_CAP_DUOC.includes(t.vai) ? t.vai : 'xem';
  chon.disabled = khoa;

  const bao = dongBao();
  const b = nutHaiNhip('Đổi vai', 'Bấm lần nữa để đổi vai', khoa, async () => {
    const kq = await doiVaiThanhVien(phien.treeId, t.userId, chon.value);
    return xong(kq, bao, napLai, 'Không đổi được vai trò.');
  });

  const ghi = t.laChuCay && duocDoiQuyen && !t.laChinhToi
    ? 'Chủ gia phả không hạ vai được. Muốn đổi chủ thì dùng Bàn giao gia phả bên dưới.'
    : 'Quyền cao nhất cấp được cho tài khoản khác là Quản trị gia phả.';

  return hangViec('Vai trò', [chon, b], ghi, bao);
}

/** Gắn / đổi / gỡ mã người. Để trống là GỠ, và đó là lựa chọn hợp lệ. */
function viecGanNguoi(t, phien, duocDoiQuyen, napLai) {
  const khoa = !duocDoiQuyen || t.laChinhToi;

  const oNhap = document.createElement('input');
  oNhap.type = 'text';
  oNhap.value = t.maNguoi || '';
  oNhap.placeholder = 'P0012 — để trống là gỡ gắn';
  oNhap.disabled = khoa;
  oNhap.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;font-family:ui-monospace,monospace;min-width:190px';

  const bao = dongBao();
  const b = nutHaiNhip('Lưu mã người', 'Bấm lần nữa để lưu', khoa, async () => {
    const kq = await ganNguoiChoThanhVien(phien.treeId, t.userId, oNhap.value);
    return xong(kq, bao, napLai, 'Không gắn được mã người.');
  });

  return hangViec('Mã người trong sơ đồ', [oNhap, b],
    'Mã này quyết định người ấy sửa được những ai: bản thân, tổ tiên đường ' +
    'thẳng, toàn bộ con cháu, cộng vợ/chồng. Để trống thì chỉ xem. ' +
    'Một mã chỉ gắn cho MỘT tài khoản.', bao);
}

/** Bật / tắt ghi thẳng — cửa leo thang sắc nhất, nên nói thẳng nó làm gì. */
function viecTinCay(t, phien, duocDoiQuyen, napLai) {
  const khoa = !duocDoiQuyen || t.laChinhToi;
  const bat = !t.tinCay;

  const bao = dongBao();
  const b = nutHaiNhip(
    bat ? 'Bật ghi thẳng' : 'Tắt ghi thẳng',
    'Bấm lần nữa để ' + (bat ? 'bật' : 'tắt'),
    khoa,
    async () => {
      const kq = await datTinCayThanhVien(phien.treeId, t.userId, bat);
      return xong(kq, bao, napLai, 'Không đổi được chế độ ghi thẳng.');
    });

  return hangViec('Ghi thẳng', [b],
    'Đang ' + (t.tinCay ? 'BẬT' : 'TẮT') + '. Bật thì mỗi lần người này bấm ' +
    'Lưu là thành chính thức ngay, không qua hàng chờ kiểm duyệt.', bao);
}

/** Gỡ khỏi gia phả — chỉ xoá dòng trong cây, không xoá tài khoản. */
function viecGo(t, phien, duocDoiQuyen, napLai) {
  const khoa = !duocDoiQuyen || t.laChinhToi || t.laChuCay || t.vai === 'sao_luu';

  const bao = dongBao();
  const b = nutHaiNhip('Gỡ khỏi gia phả', 'Bấm lần nữa để gỡ', khoa, async () => {
    const kq = await goThanhVien(phien.treeId, t.userId);
    return xong(kq, bao, napLai, 'Không gỡ được tài khoản.');
  }, true);

  return hangViec('Gỡ khỏi gia phả', [b],
    'Gỡ xong người này đọc 0 dòng của gia phả. Tài khoản của họ vẫn còn, vẫn ' +
    'đăng nhập được, và vẫn xin vào lại được.', bao);
}

/**
 * Bàn giao gia phả. Việc **không có nút hoàn tác** — sau khi giao, người vừa
 * giao không giao ngược lại được; chỉ chủ mới (hoặc Quản trị hệ thống) làm
 * được. Nên câu cảnh báo phải đứng TRƯỚC nhịp thứ hai, không đứng sau.
 */
function viecBanGiao(t, phien, duocDoiQuyen, napLai) {
  const khoa = !duocDoiQuyen || t.laChinhToi || t.laChuCay || t.vai === 'sao_luu';

  const bao = dongBao();
  const b = nutHaiNhip('Bàn giao gia phả cho tài khoản này',
    'Bấm lần nữa để bàn giao — không hoàn tác được', khoa, async () => {
      const kq = await doiChuCay(phien.treeId, t.userId);
      return xong(kq, bao, napLai, 'Không bàn giao được gia phả.');
    }, true);

  return hangViec('Bàn giao gia phả', [b],
    'Người này thành chủ gia phả và nhận toàn bộ quyền đổi quyền. Bạn ở lại ' +
    'làm Quản trị gia phả — vẫn sửa và duyệt nội dung, nhưng thôi đổi được ' +
    'quyền của ai. Không có đường quay lại từ phía bạn.', bao);
}

// ============================================================
// Xét đơn của một tài khoản ĐANG CHỜ
// ============================================================

/**
 * Duyệt đơn thuộc nhóm **đổi quyền**, không thuộc "duyệt nội dung": nhận một
 * người vào cây là cấp quyền ĐỌC. Nên nó gác bằng đúng `coTheQuanTri()` như
 * năm việc trên, chứ không bằng `coTheKiemDuyet()`.
 */
function veXetDon(t, phien, duocDoiQuyen, napLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'display:flex;flex-direction:column;gap:12px;padding:12px 0 2px;' +
    'border-top:1px solid #ece6dd';

  if (t.loiNhan) {
    const ln = document.createElement('div');
    ln.textContent = '“' + t.loiNhan + '”';
    ln.style.cssText =
      'font-size:13px;line-height:1.55;color:#2a2622;padding:9px 11px;' +
      'background:#fffdf9;border:1px solid #ece6dd;border-radius:8px';
    hop.append(ln);
  }

  if (!duocDoiQuyen) {
    hop.append(dongNhac(
      'Bạn không duyệt được đơn xin vào gia phả — nhận một người vào cây là ' +
      'cấp quyền đọc, việc ấy thuộc chủ gia phả và Quản trị hệ thống.'));
  }

  const oNhap = document.createElement('input');
  oNhap.type = 'text';
  oNhap.placeholder = 'P0012 — để trống thì người này chỉ xem';
  oNhap.disabled = !duocDoiQuyen;
  oNhap.style.cssText =
    'padding:6px 9px;border:1px solid #dcd5cb;border-radius:7px;background:#fff;' +
    'font:inherit;font-size:13px;font-family:ui-monospace,monospace;min-width:220px';

  const bao = dongBao();

  const bDuyet = nutHaiNhip('Duyệt', 'Bấm lần nữa để duyệt', !duocDoiQuyen,
    async () => {
      const kq = await duyetThanhVien(phien.treeId, t.email, oNhap.value.trim());
      return xong(kq, bao, napLai, 'Không duyệt được đơn.');
    });

  const bTuChoi = nutHaiNhip('Từ chối', 'Bấm lần nữa để từ chối', !duocDoiQuyen,
    async () => {
      const kq = await tuChoiThanhVien(phien.treeId, t.email);
      return xong(kq, bao, napLai, 'Không từ chối được đơn.');
    }, true);

  hop.append(hangViec('Mã người trong sơ đồ', [oNhap],
    'Duyệt mà không gắn mã thì người ấy vào xem được nhưng không sửa được gì ' +
    '— để trống là một lựa chọn hợp lệ, không phải thiếu sót.', null));
  hop.append(hangViec('Quyết định', [bDuyet, bTuChoi],
    'Từ chối là XOÁ đơn, không phải đánh dấu. Người ấy nộp lại được.', bao));
  return hop;
}

// ============================================================
// Mấy mẩu dùng chung
// ============================================================

/**
 * Một việc: nhãn · mấy thứ để bấm · một câu giải thích · chỗ báo kết quả.
 *
 * Câu giải thích KHÔNG phải trang trí. Cả năm việc ở đây đều đổi thứ người
 * dùng không nhìn thấy hậu quả ngay — quyền đọc, phạm vi sửa, đường đi qua
 * kiểm duyệt — nên chỗ duy nhất nói ra hậu quả là dòng chữ này.
 */
function hangViec(nhanChu, dsPhanTu, giaiThich, bao) {
  const hop = document.createElement('div');

  const nhan = document.createElement('div');
  nhan.textContent = nhanChu;
  nhan.style.cssText = 'font-size:12px;font-weight:600;color:#6a625a;margin-bottom:5px';
  hop.append(nhan);

  const hang = document.createElement('div');
  hang.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center';
  for (const p of dsPhanTu) hang.append(p);
  hop.append(hang);

  if (giaiThich) {
    const g = document.createElement('div');
    g.textContent = giaiThich;
    g.style.cssText =
      'margin-top:5px;font-size:12px;line-height:1.5;color:#8a8078;max-width:720px';
    hop.append(g);
  }
  if (bao) hop.append(bao);
  return hop;
}

/**
 * Nút hai nhịp: bấm lần đầu đổi chữ và đổi màu, bấm lần nữa mới chạy.
 *
 * ⚠ **Không `confirm()`**, và không phải vì sở thích: trên điện thoại hộp
 *   thoại ấy hiện ra ở một chỗ chẳng liên quan gì tới nút vừa bấm. App này
 *   không dùng nó ở đâu cả.
 *
 * ⚠ Nhịp một tự huỷ sau 6 giây. Một cái nút đứng ở trạng thái *"bấm lần nữa"*
 *   vô thời hạn là cái bẫy: người ta cuộn đi, quay lại, bấm một cái tưởng là
 *   nhịp đầu — và việc chạy luôn.
 */
function nutHaiNhip(chuDau, chuHoi, khoa, chay, nguyHiem) {
  const b = nut(chuDau, false);
  if (nguyHiem) b.style.color = '#8a3a2a';
  b.disabled = !!khoa;
  if (khoa) {
    b.style.opacity = '0.45';
    b.style.cursor = 'not-allowed';
  }

  let daHoi = false;
  let hen = 0;

  const veDauLai = () => {
    daHoi = false;
    b.textContent = chuDau;
    b.style.borderColor = '#dcd5cb';
    b.style.fontWeight = '400';
    if (hen) { clearTimeout(hen); hen = 0; }
  };

  b.addEventListener('click', async () => {
    if (b.disabled) return;
    if (!daHoi) {
      daHoi = true;
      b.textContent = chuHoi;
      b.style.borderColor = '#c98f80';
      b.style.fontWeight = '600';
      hen = setTimeout(veDauLai, 6000);
      return;
    }
    if (hen) { clearTimeout(hen); hen = 0; }
    b.disabled = true;
    b.textContent = 'Đang chạy…';
    const xongRoi = await chay();
    if (xongRoi) return;          // đã gọi napLai — cả bảng vẽ lại, nút này đi theo
    b.disabled = false;
    veDauLai();
  });

  return b;
}

/**
 * Xử lý một câu trả lời của máy chủ.
 *
 * ⚠ **Máy chủ từ chối thì in NGUYÊN VĂN câu của nó**, đừng chế câu khác: chỉ
 *   máy chủ mới biết đây là "chủ gia phả không hạ vai được" hay "mã ấy đã gắn
 *   cho tài khoản khác rồi". Cùng luật đã ghi ở `tuChoiThayDoi()` trong `sb.js`.
 *
 * @returns {boolean} `true` khi đã gọi `napLai()` — nơi gọi thôi động vào nút.
 */
function xong(kq, bao, napLai, cauMacDinh) {
  if (kq && kq.ok) { napLai(); return true; }
  bao.textContent = (kq && kq.loi) || cauMacDinh;
  bao.style.color = '#a83220';
  return false;
}

function dongBao() {
  const d = document.createElement('div');
  d.style.cssText = 'margin-top:6px;font-size:12px;line-height:1.45;min-height:0';
  return d;
}

function dongNhac(chu) {
  const d = document.createElement('div');
  d.textContent = chu;
  d.style.cssText =
    'padding:9px 11px;border:1px solid #e2d5bf;border-radius:8px;' +
    'background:#faf6ee;color:#7a5a28;font-size:12px;line-height:1.5';
  return d;
}

function o(chu, css) {
  const td = document.createElement('td');
  if (chu) td.textContent = chu;
  td.style.cssText = css;
  return td;
}

function huyHieu(chu, dam) {
  const s = document.createElement('span');
  s.textContent = chu;
  s.style.cssText =
    'margin-left:7px;font-size:11px;font-weight:500;padding:2px 7px;border-radius:10px;' +
    'white-space:nowrap;' +
    (dam ? 'background:#2a2622;color:#fffdf9'
         : 'background:#f3ece1;color:#7a5a28;border:1px solid #e2d5bf');
  return s;
}

function nut(chu, dam) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = chu;
  b.style.cssText =
    'padding:6px 12px;border-radius:6px;font:inherit;font-size:12px;cursor:pointer;' +
    // `nowrap`: cột thao tác hẹp, và không có dòng này thì *Sửa quyền* gãy
    // thành hai dòng — ảnh chụp 1280px của b106 bắt đúng chỗ ấy.
    'touch-action:manipulation;white-space:nowrap;' +
    (dam ? 'border:1px solid #2a2622;background:#2a2622;color:#fffdf9'
         : 'border:1px solid #dcd5cb;background:#fffdf9;color:#2a2622');
  return b;
}

function veLoi(chu, thuLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'padding:14px 16px;border:1px solid #f1c0b9;background:#fdf2f0;' +
    'border-radius:9px;color:#8a3a2a';

  const p = document.createElement('div');
  p.textContent = chu;

  const b = nut('Thử lại', false);
  b.style.cssText += ';margin-top:8px';
  b.addEventListener('click', thuLai);

  hop.append(p, b);
  return hop;
}

/** `dd/mm/yyyy HH:mm` — khuôn thời gian duy nhất của dự án. */
function gioVietNam(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const hai = (n) => String(n).padStart(2, '0');
  return hai(d.getDate()) + '/' + hai(d.getMonth() + 1) + '/' + d.getFullYear() +
         ' ' + hai(d.getHours()) + ':' + hai(d.getMinutes());
}
