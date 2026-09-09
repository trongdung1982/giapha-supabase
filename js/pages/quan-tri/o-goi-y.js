// ============================================================
// giapha-supabase · js/pages/quan-tri/o-goi-y.js
// Vai trò  : Ô gõ vài chữ → hiện danh sách khớp. Một bản dùng cho CẢ BA chỗ
//            đang gõ tay mù: email ở form Mời, mã người ở form Mời, và mã
//            người ở khu Tài khoản.
// Lớp      : pages — được gọi bởi: pages/quan-tri/* · được phép gọi: services
// Phụ thuộc: (không) — nơi gọi truyền hàm tìm vào, file này không biết
//            Supabase là gì
// Phiên bản: 0.1.0 · Cập nhật: 09/09/2026 12:40
// ============================================================
//
// ═══ VÌ SAO MỘT BẢN CHO BA CHỖ ═══
//
// Ba ô ấy hỏi ba câu khác nhau nhưng CƯ XỬ giống hệt nhau: chờ người ta ngừng
// gõ, hỏi máy chủ, vẽ danh sách, đi bằng phím mũi tên, chọn thì điền vào ô.
// Chép ba bản thì hôm nay chúng giống nhau, và lệch dần từ lần sửa thứ hai —
// đúng lý lẽ b109 đã dùng để KHÔNG chép năm hàm việc của `13`.
//
// File này **không biết gì về dữ liệu**. Nơi gọi truyền vào một hàm `tim` và
// một hàm `ve`; đổi nguồn dữ liệu không phải sửa file này.
//
// ═══ BA CÁI BẪY ĐÃ TÍNH TRƯỚC ═══
//
//  1. **Danh sách phải nổi trên `body`, không nằm trong ô cha.** Cả ba chỗ gọi
//     đều ở trong một cái bảng có `min-width` và cuộn ngang được. Thả danh
//     sách vào trong ấy là nó bị cắt ở mép bảng, hoặc tệ hơn: nó làm bảng
//     phình ra và đẩy cột nút rơi khỏi mép màn hình — đúng ba chỗ hỏng mà
//     b106 và b109 đều chỉ nhìn bằng mắt mới thấy. Nên `position:fixed`, gắn
//     thẳng vào `document.body`, toạ độ đo bằng `getBoundingClientRect()`.
//
//  2. **Câu trả lời về CHẬM hơn câu hỏi sau.** Gõ `ngu` rồi gõ tiếp thành
//     `nguyen`: hai lời gọi chạy song song, và không có gì bảo đảm cái nào về
//     trước. Không đánh số thì có lúc danh sách của `ngu` đè lên danh sách của
//     `nguyen` — người ta thấy kết quả của chữ mình vừa xoá. Mỗi lời gọi mang
//     một số thứ tự; chỉ số MỚI NHẤT được vẽ.
//
//  3. **`blur` xảy ra TRƯỚC `click`.** Đóng danh sách ở `blur` thì cú bấm vào
//     một dòng gợi ý không bao giờ tới nơi. Nên chọn bằng `mousedown` +
//     `preventDefault()`: ô chữ không mất tiêu điểm, và cú bấm chạy.

/** Bao lâu sau khi ngừng gõ thì mới hỏi máy chủ (mili giây). */
const CHO_GO = 180;

/** Dưới ngần này ký tự thì không hỏi. Máy chủ cũng gác, đây chỉ đỡ cho nó. */
const TOI_THIEU = 2;

/**
 * Gắn ô gợi ý vào một `<input>` đã có sẵn.
 *
 * @param {HTMLInputElement} oNhap
 * @param {object} tuyChon
 * @param {(chuoi: string) => Promise<Array>} tuyChon.tim   hỏi máy chủ
 * @param {(muc: any) => {chinh: string, phu: string, mo?: boolean}} tuyChon.ve
 *        hai dòng chữ của một gợi ý; `mo: true` thì vẽ mờ (chọn được, nhưng
 *        báo trước là sẽ vướng)
 * @param {(muc: any) => string} tuyChon.giaTri  điền gì vào ô khi chọn
 * @param {(muc: any) => void} [tuyChon.khiChon] chạy thêm gì sau khi chọn
 * @returns {() => void} gọi để gỡ hẳn ô gợi ý (dọn cả bộ nghe toàn cục)
 */
export function ganGoiY(oNhap, { tim, ve, giaTri, khiChon }) {
  let bang = null;         // phần tử danh sách, chỉ tồn tại khi đang mở
  let ds = [];
  let dang = -1;           // dòng đang trỏ tới, -1 = chưa trỏ đâu
  let dongHo = null;
  let soLuot = 0;          // bẫy 2 — số thứ tự lời gọi

  // ------------------------------------------------------------
  // Vẽ
  // ------------------------------------------------------------

  function dong() {
    if (bang) { bang.remove(); bang = null; }
    ds = [];
    dang = -1;
  }

  function datCho() {
    if (!bang) return;
    const h = oNhap.getBoundingClientRect();
    bang.style.left = h.left + 'px';
    bang.style.top = (h.bottom + 2) + 'px';
    bang.style.width = Math.max(h.width, 240) + 'px';
  }

  function veBang() {
    if (!bang) {
      bang = document.createElement('div');
      bang.style.cssText =
        'position:fixed;z-index:9999;max-height:246px;overflow-y:auto;' +
        'background:#fffdf9;border:1px solid #c9c0b4;border-radius:8px;' +
        'box-shadow:0 6px 18px rgba(42,38,34,.16);font-size:12px;' +
        'color:#2a2622';
      document.body.append(bang);
    }
    bang.innerHTML = '';

    ds.forEach((muc, i) => {
      const { chinh, phu, mo } = ve(muc);

      const d = document.createElement('div');
      d.style.cssText =
        'padding:7px 10px;cursor:pointer;border-bottom:1px solid #f0ebe3;' +
        (i === dang ? 'background:#f2ece2;' : '') +
        (mo ? 'opacity:.62;' : '');

      const c1 = document.createElement('div');
      c1.textContent = chinh;
      c1.style.cssText = 'font-weight:600';

      d.append(c1);
      if (phu) {
        const c2 = document.createElement('div');
        c2.textContent = phu;
        c2.style.cssText = 'font-size:11px;color:#6a625a;margin-top:1px';
        d.append(c2);
      }

      // ⚠ `mousedown` + `preventDefault`, KHÔNG `click` — bẫy 3 ở đầu file.
      d.addEventListener('mousedown', (e) => { e.preventDefault(); chon(i); });
      d.addEventListener('mouseenter', () => { dang = i; veBang(); });

      bang.append(d);
    });

    datCho();
  }

  function chon(i) {
    const muc = ds[i];
    if (!muc) return;
    oNhap.value = giaTri(muc);
    dong();
    if (khiChon) khiChon(muc);
    oNhap.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ------------------------------------------------------------
  // Hỏi máy chủ
  // ------------------------------------------------------------

  async function hoi() {
    const chuoi = oNhap.value.trim();
    if (chuoi.length < TOI_THIEU) { dong(); return; }

    const luot = ++soLuot;
    let kq;
    try {
      kq = await tim(chuoi);
    } catch (e) {
      // ⚠ Ô gợi ý im lặng khi hỏng, và đó là chủ ý: nó là thứ giúp cho tiện,
      //   không phải thứ người ta đang làm. Ném một dải chữ đỏ lên giữa lúc
      //   ai đó đang gõ dở là làm phiền chứ không phải báo tin. Ô vẫn gõ tay
      //   được, và nút Mời vẫn nói thật nếu email sai.
      kq = [];
    }
    if (luot !== soLuot) return;      // bẫy 2 — câu trả lời đã cũ

    ds = Array.isArray(kq) ? kq : [];
    dang = -1;
    if (ds.length === 0) { dong(); return; }
    veBang();
  }

  // ------------------------------------------------------------
  // Nghe
  // ------------------------------------------------------------

  function khiGo() {
    if (dongHo) clearTimeout(dongHo);
    dongHo = setTimeout(hoi, CHO_GO);
  }

  function khiPhim(e) {
    if (!bang || ds.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      dang = (dang + 1) % ds.length;
      veBang();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      dang = (dang <= 0 ? ds.length : dang) - 1;
      veBang();
    } else if (e.key === 'Enter') {
      // Chỉ nuốt phím Enter khi người ta ĐANG trỏ vào một dòng. Không trỏ vào
      // đâu mà vẫn nuốt là chặn mất đường gõ tay xong bấm Enter.
      if (dang >= 0) { e.preventDefault(); chon(dang); }
    } else if (e.key === 'Escape') {
      dong();
    }
  }

  const khiRoi = () => dong();
  const khiCuon = () => { if (bang) datCho(); };

  oNhap.addEventListener('input', khiGo);
  oNhap.addEventListener('keydown', khiPhim);
  oNhap.addEventListener('blur', khiRoi);
  // `true` = bắt ở pha bắt giữ, để nghe được cả những khối cuộn bên trong.
  window.addEventListener('scroll', khiCuon, true);
  window.addEventListener('resize', khiCuon);

  return function go() {
    if (dongHo) clearTimeout(dongHo);
    dong();
    oNhap.removeEventListener('input', khiGo);
    oNhap.removeEventListener('keydown', khiPhim);
    oNhap.removeEventListener('blur', khiRoi);
    window.removeEventListener('scroll', khiCuon, true);
    window.removeEventListener('resize', khiCuon);
  };
}

// ============================================================
// HAI KHUÔN DÒNG — để ba nơi gọi nói giống nhau
// ============================================================
//
// ⚠ Chữ trên dòng gợi ý là thứ người ta đọc để quyết "đúng người chưa", nên
//   nó phải nằm MỘT CHỖ. Rải ba bản ở ba file là ba chỗ để lệch nhau, và cái
//   lệch ấy không có phép kiểm nào bắt được — cả ba đều "hiện ra được".

/** Chữ cho một dòng tài khoản. Có tên thì tên đứng trước, email xuống dưới. */
export function dongTaiKhoan(m) {
  const noi = {
    chinh_minh: 'chính bạn — không tự mời mình được',
    thanh_vien: 'đã có tên trong gia phả này',
    cho_duyet: 'đang có đơn xin vào — duyệt đơn ấy, đừng mời lại',
    da_moi: 'đã mời rồi, đang chờ nhận lời',
  }[m.trangThai] || '';

  const duoi = [m.email, noi].filter(Boolean).join('  ·  ');

  return {
    chinh: m.hoTen || m.email,
    phu: m.hoTen ? duoi : noi,
    // Bốn trạng thái kia đều bị `moi_vao_cay()` từ chối. Vẫn cho chọn — người
    // ta có thể đang tra cứu chứ không phải đang mời — nhưng vẽ mờ để biết
    // trước, đúng luật "khoá sẵn kèm lý do, không mở ra rồi mới giải thích".
    mo: m.trangThai !== 'chua',
  };
}

/**
 * Chữ cho một dòng người trong sơ đồ. Khuôn chép của phần mềm gia phả:
 * **tên, năm sinh–mất trong ngoặc, mã đứng cuối như một cái nhãn**.
 *
 * ⚠ Năm trống thì KHÔNG vẽ cặp ngoặc rỗng — luật dữ liệu của dự án:
 *   trường trống thì không vẽ hàng ấy, không ghi "Không rõ", không hiện `...`.
 */
export function dongNguoi(m) {
  const nam = (m.namSinh || m.namMat)
    ? '(' + (m.namSinh || '?') + '–' + (m.namMat || '') + ')'
    : '';

  const phu = [m.maNguoi, nam,
    m.ganChoEmail ? 'đã gắn cho ' + m.ganChoEmail : '']
    .filter(Boolean).join('  ·  ');

  return { chinh: m.ten, phu, mo: Boolean(m.ganChoEmail) };
}
