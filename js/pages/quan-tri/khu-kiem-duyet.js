// ============================================================
// giapha-supabase · js/pages/quan-tri/khu-kiem-duyet.js
// Vai trò  : Khu KIỂM DUYỆT của trang Quản trị — bảng hàng chờ, mỗi dòng
//            một lần Lưu. Nhận chính thức, hoặc từ chối và hoàn tác.
// Lớp      : pages — được phép gọi mọi lớp dưới
// Phụ thuộc: services/sb, domains/so-sanh, pages/dang-nhap, utils/date
// Phiên bản: 0.3.0 · Cập nhật: 10/09/2026 (b111) — "Xem chi tiết" mở ra bảng
//            phẳng TRƯỚC/SAU (`chiTietKiemDuyet()` + `domains/so-sanh.js`),
//            và khoá sẵn nút Từ chối kèm lý do khi có ai đã sửa tiếp.
// ============================================================
//
// ═══ VÌ SAO NÓ LÀ MỘT TRANG RIÊNG, KHÔNG PHẢI MỘT KHỐI TRONG CÀI ĐẶT ═══
//
// Chủ dự án chốt 04/09/2026: *"trang duyệt là một trang HTML độc lập, ngoài
// trang vẽ sơ đồ, duyệt dạng bảng"*. Ba lý do khiến điều ấy đúng chứ không
// phải sở thích:
//
//   1. **Việc khác nhau, nhịp khác nhau.** Vẽ sơ đồ là việc của cả họ, làm
//      mỗi ngày. Duyệt là việc của hai người, làm mỗi tuần một lần, ngồi
//      trước máy tính và đọc từng dòng.
//   2. **Trang sơ đồ nạp CẢ CÂY** — 59 người hôm nay, 681 người trên cây thật
//      của chủ dự án. Người duyệt không cần một dòng nào trong số đó; hàng chờ
//      là một câu hỏi tới `change_log`, không tới `persons`.
//   3. **Bảng cần bề ngang.** Nhét bảng vào lớp phủ Cài đặt (rộng tối đa
//      520px) là ép năm cột vào chỗ của hai.
//
// ═══ AI ĐƯỢC VÀO, VÀ AI QUYẾT ĐIỀU ẤY ═══
//
// **Máy chủ quyết.** Trang này hỏi `co_the_kiem_duyet()` rồi mới vẽ bảng, và
// cả bốn hàm nó gọi đều tự kiểm quyền lần nữa trong thân hàm ở Postgres. Phép
// hỏi ở đây chỉ để hiện một câu giải thích tử tế thay vì một cái bảng trống —
// nó KHÔNG phải hàng rào. Ai gõ thẳng địa chỉ `QuanTri.html` cũng mở được
// trang, và cũng chỉ nhận về mảng rỗng nếu không phải quản trị.
//
// Cùng luật với `settings.js` khối *Đơn chờ duyệt*: app không tự lọc, và vì
// thế app không thể lọc sai.
//
// ═══ NGƯỜI DUYỆT NHÌN VÀO ĐÂU MÀ QUYẾT ═══
//
// Cột **Việc** là câu `note` do chính màn hình sửa viết ra lúc bấm Lưu — *"Sửa
// hồ sơ Nguyễn Văn A bằng form nhập liệu"*, *"Thêm người con Nguyễn Thị B vào
// U0007"*. Cột **Đụng** đếm số bản ghi lần Lưu ấy chạm vào.
//
// ═══ b111 — "XEM CHI TIẾT" LÀ MỘT VÒNG GỌI RIÊNG ═══
//
// `ds_kiem_duyet()` (mục trên) vẫn KHÔNG trả cột `truoc` — đúng luật cũ,
// không đổi. Bấm "Xem chi tiết" mới gọi `chiTietKiemDuyet()`
// (`19-kiem-duyet-chi-tiet.sql`), và `domains/so-sanh.js` xếp kết quả ấy
// thành bảng phẳng Người · Trường · Trước · Sau — chỉ những Ô THẬT SỰ ĐỔI.
//
// ⚠ Xem theo Ô, nhưng DUYỆT VẪN THEO LẦN LƯU — bảng chi tiết không có nút
//   nhận riêng từng ô. Hai nút Duyệt/Từ chối vẫn đứng nguyên chỗ cũ.
//
// ⚠ Nếu ai đó đã sửa tiếp lên đúng những bản ghi này SAU lần Lưu đang xem,
//   `biKhoa` báo về và nút Từ chối bị khoá NGAY — kèm lý do hiện ra trong
//   bảng chi tiết, không đợi người duyệt bấm rồi mới nghe máy chủ từ chối.

import { layPhien, coTheKiemDuyet, dsKiemDuyet, demChoKiemDuyet,
         duyetThayDoi, tuChoiThayDoi, chiTietKiemDuyet } from '../../services/sb.js';
import { bangPhang } from '../../domains/so-sanh.js';
import { mountDangNhap } from '../dang-nhap.js';
import { stampNow } from '../../utils/date.js';

/** Ba tấm lọc, đúng ba giá trị `change_log.trang_thai` cho phép. */
const LOC = [
  { ma: 'cho',     chu: 'Chờ duyệt' },
  { ma: 'duyet',   chu: 'Đã nhận' },
  { ma: 'tu_choi', chu: 'Đã từ chối' },
];

let locDangXem = 'cho';

// ============================================================
// Cửa vào
// ============================================================

/**
 * Mở trang Duyệt nội dung.
 *
 * Bốn kết cục, đúng bốn màn hình khác hẳn nhau — trộn hai cái bất kỳ là gửi
 * người ta đi làm một việc không phải việc của họ:
 *
 *   chưa đăng nhập        → màn hình đăng nhập
 *   đăng nhập, chưa vào cây nào → nói rõ, và chỉ đường về trang chính
 *   vào được nhưng không phải quản trị → nói rõ trang này của ai
 *   quản trị              → bảng hàng chờ
 *
 * @param {HTMLElement} containerEl
 */
export async function mountKhuKiemDuyet(containerEl) {
  veKhungChu(containerEl, 'Đang mở trang duyệt…');

  let phien;
  try {
    phien = await layPhien();
  } catch (loi) {
    veLoiNangNe(containerEl, String((loi && loi.message) || loi));
    return;
  }

  if (phien.loi) { veLoiNangNe(containerEl, phien.loi); return; }

  // Đăng nhập xong thì chạy LẠI từ đầu hàm này, không gọi thẳng phần vẽ bảng:
  // phiên và quyền đều phải lấy lại. Cùng cách `khoi-dong.js` làm.
  if (!phien.daDangNhap) {
    mountDangNhap(containerEl, () => mountKhuKiemDuyet(containerEl));
    return;
  }

  if (!phien.docDuoc) {
    veKhungChu(containerEl,
      'Bạn chưa được cấp quyền xem gia phả ' + (phien.tenHo || '') + '.',
      'Mở trang chính để xin vào, hoặc nhắn cho ' + (phien.nguoiQuanLy || '') + '.');
    return;
  }

  if (!(await coTheKiemDuyet(phien.treeId))) {
    veKhungChu(containerEl,
      'Trang này dành cho quản trị viên.',
      'Tài khoản ' + (phien.email || '') + ' xem và sửa gia phả bình thường ở ' +
      'trang chính, nhưng không duyệt nội dung của người khác. Cần đổi thì ' +
      'nhắn cho ' + (phien.nguoiQuanLy || '') + '.');
    return;
  }

  veTrang(containerEl, phien);
}

// ============================================================
// Màn hình chính
// ============================================================

function veTrang(el, phien) {
  el.innerHTML = '';

  const trang = document.createElement('div');
  // ⚠ KHÔNG đặt lề, trần bề ngang hay khoảng đệm ở đây (bỏ b101). Khu này
  //   từng là cả một trang nên nó tự căn giữa mình trong 1000px; nay nó
  //   nằm trong ô bên phải của khung bốn khu, và khung đã lo đúng việc ấy.
  //   Để lại thì tựa khu Kiểm duyệt thụt vào so với tựa ba khu kia —
  //   lệch 18px, đủ để nhìn thấy khi bấm qua lại, và không có phép bất
  //   biến nào bắt được.
  trang.style.cssText = 'color:#2a2622;line-height:1.5';

  const than = document.createElement('div');   // chỗ bảng sẽ mọc ra
  const nhanLoc = new Map();                    // ma -> phần tử nút, để đổi chữ

  const napLai = () => napBang(than, nhanLoc, phien);

  trang.append(veDau(phien, napLai));
  trang.append(veThanhLoc(nhanLoc, napLai));
  trang.append(than);
  el.append(trang);

  napLai();
}

/** Tiêu đề, dòng danh tính, và nút Tải lại. */
function veDau(phien, napLai) {
  const hop = document.createElement('div');
  hop.style.cssText =
    'display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;' +
    'justify-content:space-between;margin-bottom:16px';

  const trai = document.createElement('div');

  const h = document.createElement('h1');
  h.textContent = 'Duyệt nội dung';
  h.style.cssText = 'font-size:20px;margin:0 0 4px';
  trai.append(h);

  const phu = document.createElement('div');
  phu.textContent = [phien.tenHo, phien.email].filter(Boolean).join('  ·  ');
  phu.style.cssText = 'font-size:12px;color:#8a8078';
  trai.append(phu);

  const nTai = nut('Tải lại', false, () => napLai());
  nTai.style.width = 'auto';

  hop.append(trai, nTai);
  return hop;
}

/**
 * Ba tấm lọc. Số trong ngoặc chỉ mọc ở tấm "Chờ duyệt" — hai tấm kia là lịch
 * sử, đếm chúng chẳng nói lên điều gì phải làm.
 */
function veThanhLoc(nhanLoc, napLai) {
  const hang = document.createElement('div');
  hang.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px';

  for (const l of LOC) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = l.chu;
    b.dataset.loc = l.ma;
    b.style.cssText =
      'padding:8px 14px;font:inherit;font-size:13px;border-radius:9px;' +
      'cursor:pointer;touch-action:manipulation';
    b.addEventListener('click', () => {
      if (locDangXem === l.ma) return;
      locDangXem = l.ma;
      toMauLoc(nhanLoc);
      napLai();
    });
    nhanLoc.set(l.ma, b);
    hang.append(b);
  }

  toMauLoc(nhanLoc);
  return hang;
}

function toMauLoc(nhanLoc) {
  for (const [ma, b] of nhanLoc) {
    b.style.background  = ma === locDangXem ? '#2a2622' : '#faf8f5';
    b.style.color       = ma === locDangXem ? '#fffdf9' : '#2a2622';
    b.style.border      = '1px solid ' + (ma === locDangXem ? '#2a2622' : '#e6e0d8');
    b.style.fontWeight  = ma === locDangXem ? '600' : '400';
  }
}

// ⚠ Khu này KHÔNG còn tự vẽ lối *← Về sơ đồ gia phả* ở chân (bỏ b101).
//   Từ khi nó nằm trong khung bốn khu, thanh điều hướng đã có sẵn một lối
//   về, và hai lối cạnh nhau trên cùng một màn hình chỉ khiến người ta
//   phải chọn giữa hai thứ giống hệt nhau. Ảnh `kiem-thu/kq-1.png` chụp
//   đúng lúc còn cả hai.

// ============================================================
// Bảng
// ============================================================

/**
 * Đọc hàng chờ rồi vẽ lại cả bảng.
 *
 * ⚠ **Vẽ lại cả bảng sau mỗi lần bấm, không sửa một dòng tại chỗ.** Duyệt hay
 *   từ chối đều đổi con số trên tấm lọc, và từ chối còn đổi cả dữ liệu mà
 *   khác đang nói về — một lần Lưu sau đó vừa mới bị chặn vì "đã bị sửa tiếp"
 *   có thể hoàn tác được ngay sau khi lần này bị từ chối. Giữ bảng cũ trên
 *   hình là để người duyệt quyết định dựa trên một bức tranh đã cũ.
 */
async function napBang(than, nhanLoc, phien) {
  than.innerHTML = '';
  than.append(veLoiNhan('Đang đọc hàng chờ…', false));

  const [ds, soCho] = await Promise.all([
    dsKiemDuyet(phien.treeId, locDangXem),
    demChoKiemDuyet(phien.treeId),
  ]);

  const nCho = nhanLoc.get('cho');
  if (nCho) nCho.textContent = soCho ? 'Chờ duyệt (' + soCho + ')' : 'Chờ duyệt';

  than.innerHTML = '';

  if (!ds.length) {
    than.append(veLoiNhan(
      locDangXem === 'cho'
        ? 'Không có gì đang chờ duyệt.'
        : 'Chưa có mục nào ở mục này.', false));
    return;
  }

  // Bảng rộng hơn màn hình điện thoại thì CUỘN NGANG trong khung của nó, chứ
  // không co chữ lại: năm cột bóp vào 360px thì cột "Việc" — cột duy nhất
  // người duyệt thật sự đọc — còn ba chữ một dòng.
  //
  // ⚠ Con số 820px đo bằng ảnh chụp, không đoán. Bản đầu để 660px, và nó
  //   "đúng" theo nghĩa bảng vẫn cuộn được — nhưng bốn cột cố định ăn hết
  //   546px, nên cột Việc còn đúng 100px và chữ rơi mỗi dòng một từ. Đây
  //   chính là loại lỗi bất biến không bắt được: hợp lệ, mà không đọc nổi.
  const khung = document.createElement('div');
  khung.style.cssText = 'overflow-x:auto;-webkit-overflow-scrolling:touch';

  const bang = document.createElement('table');
  bang.style.cssText =
    'width:100%;min-width:820px;border-collapse:collapse;font-size:13px';

  bang.append(veDauBang());

  const ruot = document.createElement('tbody');
  for (const d of ds) veMotDong(ruot, d, phien, () => napBang(than, nhanLoc, phien));
  bang.append(ruot);

  khung.append(bang);
  than.append(khung);

  // Nói ra CHỈ KHI nó đúng, và đo để biết nó đúng: trên máy tính bảng vừa
  // màn hình nên câu này không mọc. Hai nút Duyệt / Từ chối nằm ở cột cuối,
  // tức chúng là thứ đầu tiên biến mất khi màn hình hẹp — không nói thì
  // người cầm điện thoại tưởng trang này chỉ để đọc.
  if (khung.scrollWidth > khung.clientWidth + 4) {
    than.append(veLoiNhan(
      'Màn hình hẹp hơn bảng — kéo ngang trong bảng để thấy hai nút ' +
      'Duyệt và Từ chối ở cột cuối.', false));
  }
}

function veDauBang() {
  const dau = document.createElement('thead');
  const hang = document.createElement('tr');
  // Cột "Việc" không có bề ngang cố định — nó nhận phần còn lại — nhưng có
  // bề ngang TỐI THIỂU, để nó không phải là cột chịu thiệt khi bảng bị ép.
  for (const [chu, rong] of [['Lúc', 'width:132px'], ['Ai sửa', 'width:150px'],
                             ['Việc', 'min-width:250px'], ['Đụng', 'width:92px'],
                             ['', 'width:172px']]) {
    const o = document.createElement('th');
    o.textContent = chu;
    o.style.cssText =
      'text-align:left;padding:6px 8px;font-size:11px;font-weight:600;' +
      'letter-spacing:.04em;color:#8a8078;border-bottom:1px solid #e6e0d8;' + rong;
    hang.append(o);
  }
  dau.append(hang);
  return dau;
}

/**
 * Một lần Lưu — một dòng, cộng một dòng phụ nằm ngay dưới để đựng ô lý do và
 * câu trả lời của máy chủ.
 *
 * ⚠ Dòng phụ là `<tr>` riêng chứ không phải một `<div>` nhét trong ô cuối:
 *   nhét vào ô thì nó bị bó trong 150px, mà câu từ chối của máy chủ dài tới
 *   hai dòng chữ (*"…đã sửa tiếp lên đúng những bản ghi này lúc 21:40
 *   04/09/2026…"*), và câu ấy chính là thứ người duyệt cần đọc kỹ nhất.
 */
function veMotDong(ruot, d, phien, napLai) {
  const hang = document.createElement('tr');
  hang.style.cssText = 'border-bottom:1px solid #f0ebe4;vertical-align:top';

  hang.append(o(gioVietNam(d.ts), 'color:#6a625a;white-space:nowrap'));
  hang.append(o(d.by_email || '(không rõ)', 'word-break:break-all'));

  const oViec = document.createElement('td');
  oViec.style.cssText = 'padding:8px;line-height:1.45';
  const dongViec = document.createElement('div');
  dongViec.textContent = viecGi(d);
  oViec.append(dongViec);
  hang.append(oViec);

  hang.append(o(dungVao(d), 'color:#6a625a;white-space:nowrap'));

  const oCuoi = document.createElement('td');
  oCuoi.style.cssText = 'padding:8px';
  hang.append(oCuoi);

  // Dòng phụ THỨ NHẤT — bảng chi tiết TRƯỚC/SAU (b111), gấp/mở độc lập với
  // dòng phụ thứ hai bên dưới. Tách riêng vì hai nội dung KHÁC NHAU và có
  // thể cùng mở một lúc: chi tiết là để ĐỌC, còn ô lý do là để BẤM Từ chối.
  const phuChiTiet = document.createElement('tr');
  const oPhuChiTiet = document.createElement('td');
  oPhuChiTiet.colSpan = 5;
  oPhuChiTiet.style.cssText = 'padding:0 8px 10px';
  phuChiTiet.append(oPhuChiTiet);
  phuChiTiet.hidden = true;

  // Gán lại ở khối nút Duyệt/Từ chối bên dưới (chỉ tồn tại khi `trang_thai
  // === 'cho'`) — `taiChiTiet()` gọi hàm này để khoá nút Từ chối NGAY khi
  // biết có người đã sửa tiếp, không đợi người duyệt tự bấm rồi mới hay.
  let khoaTuChoiKemLyDo = null;

  let daTaiChiTiet = false;
  const nChiTiet = document.createElement('button');
  nChiTiet.type = 'button';
  nChiTiet.textContent = 'Xem chi tiết ▾';
  nChiTiet.style.cssText =
    'margin-top:4px;padding:0;border:0;background:none;font:inherit;' +
    'font-size:12px;color:#6a625a;text-decoration:underline;cursor:pointer';
  nChiTiet.addEventListener('click', async () => {
    if (phuChiTiet.hidden) {
      phuChiTiet.hidden = false;
      nChiTiet.textContent = 'Ẩn chi tiết ▴';
      if (!daTaiChiTiet) {
        daTaiChiTiet = true;
        await taiChiTiet(oPhuChiTiet, d, phien, (bk) => khoaTuChoiKemLyDo && khoaTuChoiKemLyDo(bk));
      }
    } else {
      phuChiTiet.hidden = true;
      nChiTiet.textContent = 'Xem chi tiết ▾';
    }
  });
  oViec.append(nChiTiet);

  const phu = document.createElement('tr');
  const oPhu = document.createElement('td');
  oPhu.colSpan = 5;
  oPhu.style.cssText = 'padding:0 8px 10px';
  phu.append(oPhu);
  phu.hidden = true;

  ruot.append(hang, phuChiTiet, phu);

  // Đã xử lý rồi thì không còn nút Duyệt/Từ chối — chỉ một nhãn nói nó đã đi
  // đường nào. "Xem chi tiết" vẫn còn, để soát lại một lần Lưu đã xong.
  if (d.trang_thai !== 'cho') {
    oCuoi.append(veNhanTrangThai(d.trang_thai));
    return;
  }

  const bao = (chu, laLoi) => {
    oPhu.innerHTML = '';
    oPhu.append(veLoiNhan(chu, laLoi));
    phu.hidden = false;
  };

  // Hai nút NẰM NGANG, không xếp chồng: xếp chồng thì mỗi dòng cao thêm 44px,
  // và một hàng chờ mười lăm mục biến thành một trang phải cuộn ba lần. Đo
  // bằng ảnh chụp 04/09/2026 — bất biến không bắt được kiểu "hợp lệ mà xấu".
  const hangNut = document.createElement('div');
  hangNut.style.cssText = 'display:flex;gap:6px';

  const nDuyet = nut('Duyệt', true, async () => {
    doiNut(false);
    bao('Đang duyệt…', false);
    const kq = await duyetThayDoi(phien.treeId, d.id);
    if (!kq || !kq.ok) {
      doiNut(true);
      bao((kq && kq.loi) || 'Không duyệt được.', true);
      return;
    }
    napLai();
  });

  const nTuChoi = nut('Từ chối', false, () => moKhoiTuChoi(oPhu, phu, d, phien, doiNut, bao, napLai));
  nTuChoi.style.color = '#8a3a2a';

  function doiNut(batDuoc) {
    nDuyet.disabled = !batDuoc;
    nTuChoi.disabled = !batDuoc;
    for (const b of [nDuyet, nTuChoi]) {
      b.style.opacity = batDuoc ? '1' : '0.45';
      b.style.cursor = batDuoc ? 'pointer' : 'not-allowed';
    }
  }

  khoaTuChoiKemLyDo = (bk) => {
    nTuChoi.disabled = true;
    nTuChoi.style.opacity = '0.45';
    nTuChoi.style.cursor = 'not-allowed';
    nTuChoi.title = 'Đã bị sửa tiếp bởi ' + (bk.byEmail || 'người khác')
      + ' — xem trong bảng chi tiết ở trên.';
  };

  hangNut.append(nDuyet, nTuChoi);
  oCuoi.append(hangNut);
}

// ============================================================
// b111 — BẢNG PHẲNG TRƯỚC/SAU
// ============================================================

/**
 * Gọi `chiTietKiemDuyet()`, xếp phẳng bằng `domains/so-sanh.js`, rồi vẽ.
 * Gọi ĐÚNG MỘT LẦN mỗi dòng (bên gọi tự nhớ `daTaiChiTiet`) — không phải vì
 * tốn kém, mà vì dữ liệu của một lần Lưu ĐÃ QUA không đổi nữa, tải lại chỉ
 * tốn một vòng mạng vô ích. Cột SAU vẫn luôn là trạng thái HÔM NAY (đọc thẳng
 * bảng thật), nên nó cứ đúng dù có ai sửa tiếp sau khi bảng này đã vẽ.
 *
 * @param {HTMLElement} noiVe   `oPhuChiTiet` — nơi vẽ bảng
 * @param {object} d            dòng đang mở (từ `dsKiemDuyet()`)
 * @param {object} phien
 * @param {(bk:{id:number,byEmail:string,ts:string})=>void} khiBiKhoa
 *   gọi lại NGAY nếu máy chủ báo có người đã sửa tiếp — để khoá nút Từ chối
 *   sớm, kèm lý do, thay vì để người duyệt bấm rồi mới nghe từ chối.
 */
async function taiChiTiet(noiVe, d, phien, khiBiKhoa) {
  noiVe.innerHTML = '';
  noiVe.append(veLoiNhan('Đang tải chi tiết…', false));

  const kq = await chiTietKiemDuyet(phien.treeId, d.id);
  noiVe.innerHTML = '';

  if (!kq || !kq.ok) {
    noiVe.append(veLoiNhan((kq && kq.loi) || 'Không tải được chi tiết.', true));
    return;
  }

  if (kq.biKhoa) {
    khiBiKhoa(kq.biKhoa);
    noiVe.append(veLoiNhan(
      (kq.biKhoa.byEmail || 'Người khác') + ' đã sửa tiếp lên đúng những bản ghi '
      + 'này lúc ' + gioVietNam(kq.biKhoa.ts) + '. Không hoàn tác được lần Lưu này '
      + 'nữa — nút Từ chối đã tắt.', true));
  }

  const dong = bangPhang(kq.banGhi);
  if (!dong.length) {
    noiVe.append(veLoiNhan(
      'Không có ô nào còn khác nhau giữa trước và sau (hoặc lần Lưu này quá cũ, '
      + 'không có ảnh chụp để so).', false));
    return;
  }

  const khung = document.createElement('div');
  khung.style.cssText = 'overflow-x:auto;margin-top:6px';

  const bang = document.createElement('table');
  bang.style.cssText = 'width:100%;min-width:560px;border-collapse:collapse;font-size:12px';

  const dau = document.createElement('thead');
  const hangDau = document.createElement('tr');
  for (const chu of ['Loại', 'Người', 'Trường', 'Trước', 'Sau']) {
    const th = document.createElement('th');
    th.textContent = chu;
    th.style.cssText =
      'text-align:left;padding:5px 8px;font-size:10px;font-weight:600;' +
      'letter-spacing:.04em;color:#8a8078;border-bottom:1px solid #e6e0d8;' +
      'background:#faf8f5';
    hangDau.append(th);
  }
  dau.append(hangDau);
  bang.append(dau);

  const than = document.createElement('tbody');
  for (const r of dong) {
    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom:1px solid #f0ebe4';
    tr.append(o(r.nhanLoai, 'color:#8a8078;white-space:nowrap'));
    tr.append(o(r.nguoi, ''));
    tr.append(o(r.truong, ''));
    tr.append(o(r.truoc, 'color:#8a3a2a'));
    tr.append(o(r.sau, 'color:#2a6a3a'));
    than.append(tr);
  }
  bang.append(than);
  khung.append(bang);
  noiVe.append(khung);
}

/**
 * Ô lý do + hai nút. Đây là nhịp thứ nhất của phép hỏi lại hai nhịp — app này
 * không dùng `confirm()` ở bất cứ đâu, và trên điện thoại hộp thoại ấy hiện ra
 * ở một chỗ chẳng liên quan gì tới nút vừa bấm.
 *
 * ⚠ Chữ trên nút xác nhận nói thẳng **"và hoàn tác"**. Từ chối một lần Lưu
 *   phải là bỏ qua nó — máy chủ trả dữ liệu về đúng ảnh chụp trước lúc Lưu,
 *   và người bấm phải biết điều ấy TRƯỚC khi bấm, không phải sau.
 */
function moKhoiTuChoi(oPhu, phu, d, phien, doiNut, bao, napLai) {
  oPhu.innerHTML = '';
  phu.hidden = false;

  const hop = document.createElement('div');
  hop.style.cssText =
    'margin-top:8px;padding:10px 11px;border:1px solid #f0d8d0;border-radius:9px;' +
    'background:#fbf0ec';

  const nhac = document.createElement('div');
  nhac.textContent =
    'Từ chối thì dữ liệu quay về đúng như trước lần Lưu này. Việc của người ' +
    'sửa sau đó (nếu có) sẽ chặn phép hoàn tác lại — máy chủ sẽ nói rõ.';
  nhac.style.cssText = 'font-size:12px;line-height:1.5;color:#8a3a2a';

  const oLyDo = document.createElement('textarea');
  oLyDo.rows = 2;
  oLyDo.maxLength = 500;
  oLyDo.placeholder = 'Lý do từ chối? (không bắt buộc) — câu này lưu lại trong nhật ký';
  oLyDo.style.cssText =
    'margin-top:8px;width:100%;box-sizing:border-box;padding:8px 10px;font:inherit;' +
    'font-size:13px;border:1px solid #e0c8c0;border-radius:8px;background:#fffdf9;' +
    'resize:vertical';

  const hangNut = document.createElement('div');
  hangNut.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px';

  const nXacNhan = nut('Từ chối và hoàn tác', true, async () => {
    nXacNhan.disabled = true;
    nThoi.disabled = true;
    doiNut(false);
    nXacNhan.textContent = 'Đang hoàn tác…';
    const kq = await tuChoiThayDoi(phien.treeId, d.id, oLyDo.value);
    if (!kq || !kq.ok) {
      // Máy chủ đã viết sẵn câu tiếng Việt cho cả bốn ca từ chối hoàn tác
      // (`dabisuatiep` · `keotheo` · `khongcoanhchup` · `vuongkhoangoai`).
      // In thẳng câu ấy — chỉ nó mới biết ai đã sửa tiếp và sửa lúc nào.
      doiNut(true);
      bao((kq && kq.loi) || 'Không từ chối được.', true);
      return;
    }
    napLai();
  });
  nXacNhan.style.cssText += ';background:#8a3a2a;border-color:#8a3a2a';
  nXacNhan.style.width = 'auto';

  const nThoi = nut('Thôi', false, () => { oPhu.innerHTML = ''; phu.hidden = true; });
  nThoi.style.width = 'auto';

  hangNut.append(nXacNhan, nThoi);
  hop.append(nhac, oLyDo, hangNut);
  oPhu.append(hop);
  oLyDo.focus();
}

// ============================================================
// Mấy mẩu dùng chung
// ============================================================

/** Ô của bảng. */
function o(chu, themCss) {
  const td = document.createElement('td');
  td.textContent = chu;
  td.style.cssText = 'padding:8px;' + (themCss || '');
  return td;
}

/**
 * Câu kể việc. `note` do chính màn hình sửa viết ra và là câu duy nhất người
 * đọc hiểu được; `action` + `target` chỉ là lưới đỡ cho những dòng nhật ký cũ
 * không có `note` (13 dòng di dời sang từ bản Apps Script).
 */
function viecGi(d) {
  const n = String(d.note || '').trim();
  if (n) return n;
  return [d.action, d.target].filter(Boolean).join(' ') || '(không ghi chú)';
}

/** "3 người · 1 cặp · 2 quan hệ" — bỏ hẳn phần bằng không, đúng luật chung. */
function dungVao(d) {
  const phan = [];
  if (d.so_nguoi)   phan.push(d.so_nguoi + ' người');
  if (d.so_honnhan) phan.push(d.so_honnhan + ' cặp');
  if (d.so_quanhe)  phan.push(d.so_quanhe + ' quan hệ');
  return phan.join(' · ');
}

function veNhanTrangThai(tt) {
  const d = document.createElement('div');
  d.textContent = tt === 'duyet' ? 'Đã nhận'
                : tt === 'tu_choi' ? 'Đã từ chối và hoàn tác'
                : tt;
  d.style.cssText = 'font-size:12px;color:#8a8078';
  return d;
}

/** `dd/mm/yyyy HH:mm` — khuôn thời gian duy nhất của dự án (`utils/date.js`). */
function gioVietNam(iso) {
  if (!iso) return 'không rõ';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? 'không rõ' : stampNow(d);
}

function nut(chu, chinh, chay) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = chu;
  b.style.cssText =
    'width:100%;min-height:38px;padding:7px 12px;font-size:13px;font-family:inherit;' +
    'border-radius:9px;cursor:pointer;touch-action:manipulation;line-height:1.35;' +
    (chinh
      ? 'background:#2a2622;color:#fffdf9;border:1px solid #2a2622;font-weight:600'
      : 'background:#faf8f5;color:#2a2622;border:1px solid #e6e0d8');
  b.addEventListener('click', chay);
  return b;
}

function veLoiNhan(chu, laLoi) {
  const d = document.createElement('div');
  d.textContent = chu;
  d.style.cssText =
    'margin-top:10px;padding:9px 11px;font-size:12px;line-height:1.5;border-radius:8px;' +
    (laLoi
      ? 'color:#8a3a2a;background:#fbf0ec;border:1px solid #f0d8d0'
      : 'color:#8a8078;background:#faf8f5;border:1px solid #f0ebe4');
  return d;
}

/** Màn hình một câu — chờ, hoặc từ chối tử tế. Luôn có đường về trang chính. */
function veKhungChu(el, tieuDe, giaiThich) {
  el.innerHTML = '';
  const d = document.createElement('div');
  d.style.cssText =
    'max-width:560px;margin:0 auto;padding:32px 24px;' +
    'font-family:system-ui,sans-serif;color:#2a2622;line-height:1.6';

  const h = document.createElement('h1');
  h.textContent = tieuDe;
  h.style.cssText = 'font-size:20px;margin:0 0 12px';
  d.append(h);

  if (giaiThich) {
    const p = document.createElement('p');
    p.textContent = giaiThich;
    p.style.margin = '0 0 10px';
    d.append(p);
  }

  el.append(d);
}

/** Mạng hỏng hoặc máy chủ từ chối — kèm nút Thử lại. */
function veLoiNangNe(el, cauLoi) {
  veKhungChu(el, 'Không mở được trang duyệt', cauLoi);
  const b = nut('Thử lại', false, () => mountKhuKiemDuyet(el));
  b.style.width = 'auto';
  b.style.marginTop = '12px';
  el.firstChild.append(b);
}
