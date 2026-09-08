// ============================================================
// giapha-supabase · js/pages/quan-tri/khung.js
// Vai trò  : Khung điều hướng bốn khu của trang Quản trị — thanh trái trên
//            máy tính, hàng thẻ ngang trên điện thoại. Mỗi lần vẽ một khu.
// Lớp      : pages — được phép gọi mọi lớp dưới
// Phụ thuộc: services/sb, pages/dang-nhap,
//            pages/quan-tri/khu-kiem-duyet · khu-gia-pha
// Phiên bản: 0.2.0 · Cập nhật: 08/09/2026 11:35
// ============================================================
//
// ═══ BA LUẬT CỦA KHUNG NÀY, VÀ VÌ SAO ═══
//
//   1. **Thanh điều hướng CHÍNH LÀ dashboard.** Hai con số cần nhìn — số đơn
//      chờ duyệt và số thay đổi chờ kiểm duyệt — nằm ngay cạnh chỗ bấm để xử
//      lý chúng. Không có dãy ô số riêng ở đầu trang: cùng một con số hiện ở
//      hai nơi thì có ngày lệch nhau, và lúc ấy không biết tin chỗ nào.
//      Ở đây mỗi số tồn tại đúng một chỗ.
//
//   2. **Mỗi lần chỉ vẽ MỘT khu, và chỉ khu ấy gọi máy chủ.** Nối tiếp đúng
//      lý lẽ đã dựng nên trang này (`khu-kiem-duyet.js` đầu file): mở khu
//      Thành viên thì không có cớ gì gọi hàng chờ kiểm duyệt. Mở trang lần
//      đầu chỉ tốn hai lời gọi đếm cho hai con số trên thanh.
//
//   3. **Khu đang mở ghi vào `#` của địa chỉ** — `QuanTri.html#kiem-duyet`.
//      Tải lại trang về đúng chỗ cũ, gửi link cho nhau được, nút Back của
//      trình duyệt chạy đúng. Khoảng mười dòng mã, KHÔNG cần router.
//
// ═══ MỘT DANH SÁCH KHU, HAI CÁCH VẼ — KHÔNG PHẢI HAI BỘ MÃ ═══
//
// Trên điện thoại thanh trái thành hàng thẻ ngang ở đầu trang. Chỗ đổi nằm
// TRỌN trong `@media` của `QuanTri.html`; file này vẽ đúng một danh sách và
// không hỏi màn hình rộng bao nhiêu. Thêm một nhánh `if (window.innerWidth…)`
// vào đây là bắt đầu có hai bộ mã, và hai bộ mã thì có ngày lệch nhau.
//
// ⚠ **Ngôn ngữ hình lấy nguyên của `veThanhLoc()`** trong `khu-kiem-duyet.js`
//   — cùng bo góc, cùng nền `#2a2622` khi đang chọn. Trang này đã có sẵn một
//   hàng thẻ như thế từ b98; đẻ thêm kiểu thứ hai là để người dùng học hai
//   lần cùng một thứ.
//
// ⚠ **Không dùng ngăn kéo hamburger.** Nó phải đẻ ra lớp phủ, nút đóng, bẫy
//   phím — mà app này chưa có chỗ nào dùng, đến `confirm()` cũng không dùng.

import { layPhien, dsChoDuyet, demChoKiemDuyet } from '../../services/sb.js';
import { mountDangNhap } from '../dang-nhap.js';
import { mountKhuKiemDuyet } from './khu-kiem-duyet.js';
import { mountKhuGiaPha } from './khu-gia-pha.js';

/**
 * Bốn khu, đúng thứ tự trên thanh. `ma` là chuỗi đi vào `#` của địa chỉ nên
 * nó là **giao kèo với người dùng** — đổi một chữ là mọi link đã gửi đi hỏng.
 *
 * `chuaLam` là câu nói thẳng khu ấy làm ở bước nào. Không vẽ bảng trống: bảng
 * trống nói "không có dữ liệu", mà sự thật là "chưa ai viết màn hình này".
 */
const KHU = [
  { ma: 'gia-pha',    chu: 'Gia phả' },
  { ma: 'thanh-vien', chu: 'Thành viên',
    chuaLam: 'Khu này làm ở bước b105 và b106 — đổi vai, gắn mã người, ' +
             'duyệt đơn xin vào cây.' },
  { ma: 'kiem-duyet', chu: 'Kiểm duyệt' },
  { ma: 'sao-luu',    chu: 'Sao lưu',
    chuaLam: 'Khu này làm ở bước b108 — xem bản sao lưu và số đếm đối chiếu.' },
];

// ============================================================
// Cửa vào
// ============================================================

/**
 * Mở trang Quản trị.
 *
 * Ba kết cục trước khi thấy được cái khung, đúng ba màn hình khác hẳn nhau:
 *
 *   · **Chưa cấu hình / mất mạng** → câu lỗi kèm lối về sơ đồ.
 *   · **Chưa đăng nhập**           → màn hình đăng nhập, xong thì quay lại đây.
 *   · **Đã đăng nhập**             → khung bốn khu.
 *
 * ⚠ **Không có kết cục "không đủ quyền".** Trang này KHÔNG phải hàng rào —
 *   hàng rào nằm ở Postgres. Ai gõ thẳng địa chỉ cũng mở được khung, và cũng
 *   chỉ nhận về mảng rỗng nếu máy chủ không cho. Cùng luật với
 *   `khu-kiem-duyet.js`: app không tự lọc, và vì thế app không thể lọc sai.
 */
export async function mountKhung(appEl) {
  appEl.textContent = 'Đang mở trang Quản trị…';

  const phien = await layPhien();
  if (phien.loi) return veCanhBao(appEl, phien.loi);
  if (!phien.daDangNhap) return mountDangNhap(appEl, () => mountKhung(appEl));

  appEl.innerHTML = '';

  const khung = document.createElement('div');
  khung.className = 'qt-khung';

  const thanh = document.createElement('aside');
  thanh.className = 'qt-thanh';

  const nhan = document.createElement('h1');
  nhan.className = 'qt-nhan';
  nhan.textContent = 'QUẢN TRỊ';

  const dieuHuong = document.createElement('nav');
  dieuHuong.className = 'qt-dieu-huong';
  dieuHuong.setAttribute('aria-label', 'Các khu quản trị');

  /** `ma` khu → nút của nó. Giữ lại để tô đậm và để gắn con số đếm. */
  const nutTheoMa = new Map();

  for (const khu of KHU) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'qt-nut';
    b.dataset.khu = khu.ma;

    const chu = document.createElement('span');
    chu.textContent = khu.chu;
    b.append(chu);

    // Đổi `#` chứ không tự vẽ lại — để nút Back của trình duyệt và cú bấm
    // vào nút này đi qua đúng một đường, là `hashchange`.
    b.addEventListener('click', () => { window.location.hash = khu.ma; });

    nutTheoMa.set(khu.ma, b);
    dieuHuong.append(b);
  }

  const veSoDo = document.createElement('a');
  veSoDo.className = 'qt-ve-so-do';
  veSoDo.href = 'index.html';
  veSoDo.textContent = '← Về sơ đồ';

  thanh.append(nhan, dieuHuong, veSoDo);

  const than = document.createElement('section');
  than.className = 'qt-than';

  khung.append(thanh, than);
  appEl.append(khung);

  const veKhuDangMo = () => veKhu(than, nutTheoMa, phien);
  window.addEventListener('hashchange', veKhuDangMo);
  veKhuDangMo();

  napSoDem(phien.treeId, nutTheoMa);
}

// ============================================================
// Vẽ một khu
// ============================================================

/**
 * Đọc `#` rồi vẽ đúng khu ấy.
 *
 * ⚠ `#` lạ — gõ nhầm, hay link cũ từ trước khi đổi tên khu — thì về khu đầu
 *   và **sửa luôn thanh địa chỉ** bằng `replaceState`. Không dùng
 *   `location.hash = …` ở đây: gán vào nó đẻ ra một `hashchange` nữa, tức
 *   vẽ hai lần; và nó thêm một mục vào lịch sử, khiến nút Back quay về đúng
 *   cái `#` hỏng vừa bỏ đi.
 */
function veKhu(than, nutTheoMa, phien) {
  const maHash = window.location.hash.slice(1);
  const khu = KHU.find((k) => k.ma === maHash) || KHU[0];
  if (maHash !== khu.ma) window.history.replaceState(null, '', '#' + khu.ma);

  for (const [ma, b] of nutTheoMa) {
    const dangMo = ma === khu.ma;
    b.classList.toggle('dang-mo', dangMo);
    // `aria-current="page"` là cách trình đọc màn hình biết mục nào đang mở.
    // Tô đậm bằng màu thì người không nhìn thấy màu không biết mình đang đâu.
    if (dangMo) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  }

  than.innerHTML = '';
  // ⚠ Khu Gia phả nhận `phien` vì nó phải biết ba điều mà chỉ phiên có: cây
  //   nào đang mở, người này có phải Quản trị hệ thống không, và email của
  //   họ. Ba khu kia tự hỏi máy chủ lấy dữ liệu của mình nên không cần.
  if (khu.ma === 'gia-pha') mountKhuGiaPha(than, phien);
  else if (khu.ma === 'kiem-duyet') mountKhuKiemDuyet(than);
  else veKhuChuaLam(than, khu);
}

/** Khu chưa viết: nói thẳng nó làm ở bước nào, không vẽ bảng trống. */
function veKhuChuaLam(el, khu) {
  const h = document.createElement('h2');
  h.className = 'qt-tua';
  h.textContent = khu.chu;

  const hop = document.createElement('div');
  hop.className = 'qt-chua-lam';
  hop.textContent = khu.chuaLam;

  el.append(h, hop);
}

// ============================================================
// Hai con số trên thanh
// ============================================================

/**
 * Gắn số đơn chờ duyệt và số thay đổi chờ kiểm duyệt vào chính hai nút ấy.
 *
 * ⚠ **Hỏng thì im lặng, và đó là cố ý.** Không phải quản trị thì hai hàm này
 *   trả về mảng rỗng và số 0 — đúng như thiết kế, không phải lỗi. Còn nếu
 *   mạng hỏng thật thì khu người ta bấm vào sẽ tự nói ra; báo lỗi ở đây chỉ
 *   là chặn một cái khung vốn vẫn dùng được vì một con số trang trí.
 *
 * ⚠ **Số 0 thì không vẽ gì cả**, đúng luật `CLAUDE.md` mục 7: trường trống
 *   thì không vẽ hàng đó. Một cái huy hiệu "0" nói *"có việc đấy"* trong khi
 *   sự thật là không có việc nào.
 */
async function napSoDem(treeId, nutTheoMa) {
  if (!treeId) return;
  try {
    const [dsDon, soKiemDuyet] = await Promise.all([
      dsChoDuyet(treeId),
      demChoKiemDuyet(treeId),
    ]);
    themSo(nutTheoMa.get('thanh-vien'), Array.isArray(dsDon) ? dsDon.length : 0,
           'đơn chờ duyệt');
    themSo(nutTheoMa.get('kiem-duyet'), Number(soKiemDuyet) || 0,
           'thay đổi chờ kiểm duyệt');
  } catch (_) {
    // Xem khối ghi chú ngay trên.
  }
}

function themSo(nut, so, nghiaLa) {
  if (!nut || !so) return;
  const huy = document.createElement('span');
  huy.className = 'qt-so';
  huy.textContent = String(so);
  // Con số trần không nói nó đếm cái gì. Trình đọc màn hình đọc câu này.
  huy.setAttribute('aria-label', so + ' ' + nghiaLa);
  nut.append(huy);
}

// ============================================================
// Không mở được trang
// ============================================================

function veCanhBao(el, chu) {
  el.innerHTML = '';

  const hop = document.createElement('div');
  hop.className = 'qt-canh-bao';

  const h = document.createElement('h1');
  h.textContent = 'Không mở được trang Quản trị';

  const p = document.createElement('p');
  p.textContent = chu;

  const a = document.createElement('a');
  a.href = 'index.html';
  a.textContent = '← Về sơ đồ gia phả';

  hop.append(h, p, a);
  el.append(hop);
}
