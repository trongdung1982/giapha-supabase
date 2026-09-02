// ============================================================
// giapha-supabase · js/pages/dang-nhap.js
// Vai trò  : Màn hình đăng nhập bằng email và mật khẩu.
// Lớp      : pages
// Phụ thuộc: services/sb, config
// Phiên bản: 0.1.0 · Cập nhật: 02/09/2026 22:45
// ============================================================
//
// ⚠ **Màn hình này KHÔNG có nút "Đăng ký".** Đó là chủ ý, không phải thiếu
//   sót. Gia phả là dữ liệu riêng của một dòng họ; ai được vào là do chủ dự
//   án quyết, không phải do người ta tự ghi tên. Người mới được thêm bằng
//   tay trong Supabase (Authentication → Add user), rồi thêm một dòng vào
//   bảng `tree_members`. Xem `DOC-KHUNG.md` mục "Thêm một người trong họ".
//
//   Nếu ngày nào mở đăng ký tự do thì phải nhớ: `02-rls.sql` cho **mọi**
//   người đã đăng nhập gọi được `layPhien()`. Họ chưa thấy được gia phả nào
//   — nhưng họ đã ở trong hệ thống.
//
// ⚠ **Email + mật khẩu, không phải "Đăng nhập bằng Google".** `CLAUDE.md`
//   mục 3 loại mọi phương án cần OAuth Client ID, và đăng nhập Google trên
//   Supabase bắt buộc phải có Client ID tạo trong Google Cloud Console.
//   `BAT-DAU.md` mục 4.1 để ngỏ khả năng luật ấy nay đã lỗi thời — chưa ai
//   thử xem tài khoản mới có tạo được project trong Console không. Ngày nào
//   thử được, thêm một nút ở đây và một hàm ở `services/sb.js`; không có chỗ
//   thứ ba phải sửa.

import * as sb from '../services/sb.js';
import { rongHop } from '../config.js';

/**
 * Mở màn hình đăng nhập.
 *
 * @param {HTMLElement} containerEl
 * @param {function():void} khiXong  gọi sau khi đăng nhập thành công; nơi gọi
 *        chịu trách nhiệm khởi động lại app từ đầu (`mountKhoiDong`).
 */
export function mountDangNhap(containerEl, khiXong) {
  containerEl.innerHTML = '';

  const oEmail   = oNhap('email',    'Email',    'email');
  const oMatKhau = oNhap('password', 'Mật khẩu', 'current-password');
  const nut      = document.createElement('button');
  const loi      = document.createElement('p');
  const quen     = document.createElement('button');

  nut.type = 'submit';
  nut.textContent = 'Đăng nhập';
  nut.style.cssText = 'width:100%;margin-top:18px;padding:12px 20px;' +
    'font-size:16px;border:1px solid #c8bfb2;border-radius:8px;' +
    'background:#fff;cursor:pointer';

  loi.style.cssText = 'margin:14px 0 0;color:#c62828;font-size:14px;min-height:1px';
  loi.hidden = true;

  quen.type = 'button';
  quen.textContent = 'Quên mật khẩu?';
  quen.style.cssText = 'margin-top:14px;padding:0;border:0;background:none;' +
    'color:#6a625a;font-size:13px;text-decoration:underline;cursor:pointer';

  const form = document.createElement('form');
  form.append(oEmail.boc, oMatKhau.boc, nut, loi, quen);

  // `<form>` chứ không phải hai ô rời cạnh một cái nút: bàn phím điện thoại
  // mới hiện được phím **Đi** ở góc, và trình quản lý mật khẩu của trình
  // duyệt mới nhận ra đây là chỗ để lưu. Hai thứ ấy quyết định người trong họ
  // có chịu dùng app hay không, nhiều hơn bất cứ điều gì khác trên màn hình.
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    keLoi(null);
    dat(false, 'Đang đăng nhập…');

    const kq = await sb.dangNhap(oEmail.o.value, oMatKhau.o.value);

    if (!kq.ok) {
      dat(true, 'Đăng nhập');
      keLoi(kq.loi);
      oMatKhau.o.focus();
      oMatKhau.o.select();
      return;
    }
    if (typeof khiXong === 'function') khiXong();
  });

  quen.addEventListener('click', async () => {
    const email = String(oEmail.o.value || '').trim();
    if (!email) { keLoi('Gõ email vào ô trên trước, rồi bấm lại.'); return; }

    quen.disabled = true;
    const kq = await sb.quenMatKhau(email);
    quen.disabled = false;

    // ⚠ Câu trả lời CỐ Ý giống nhau dù email có tồn tại hay không. Nói
    //   "không có tài khoản nào dùng email này" là biến màn hình đăng nhập
    //   thành một cỗ máy dò xem ai có mặt trong dòng họ.
    keLoi(kq.ok
      ? null
      : kq.loi);
    if (kq.ok) {
      loi.hidden = false;
      loi.style.color = '#2a2622';
      loi.textContent = 'Nếu email này có tài khoản, thư đặt lại mật khẩu ' +
                        'vừa được gửi. Mở hộp thư và làm theo hướng dẫn.';
    }
  });

  containerEl.append(khung([
    tieuDe('Gia phả'),
    doan('Đăng nhập bằng email và mật khẩu chủ dự án đã cấp cho bạn.'),
    form,
    nhoMo('Chưa có tài khoản thì liên hệ người quản lý gia phả — trang này ' +
          'không tự đăng ký được.'),
  ]));

  oEmail.o.focus();

  function dat(baatDuoc, chu) {
    nut.disabled = !baatDuoc;
    nut.textContent = chu;
  }
  function keLoi(chu) {
    loi.hidden = !chu;
    loi.style.color = '#c62828';
    loi.textContent = chu || '';
  }
}

// ============================================================
// Vài mẩu DOM. Không thư viện, không bước build.
// ============================================================

function oNhap(kieu, nhan, tuDien) {
  const boc = document.createElement('label');
  boc.style.cssText = 'display:block;margin-top:14px';

  const chu = document.createElement('span');
  chu.textContent = nhan;
  chu.style.cssText = 'display:block;font-size:13px;color:#6a625a;margin-bottom:5px';

  const o = document.createElement('input');
  o.type = kieu;
  o.required = true;
  // `autocomplete` đúng tên là thứ khiến trình quản lý mật khẩu điền hộ. Gõ
  // sai một chữ ở đây thì không có lỗi nào cả — chỉ là không bao giờ tự điền.
  o.autocomplete = tuDien;
  o.style.cssText = 'width:100%;box-sizing:border-box;padding:11px 12px;' +
    'font-size:16px;border:1px solid #c8bfb2;border-radius:8px;background:#fff';
  // ⚠ 16px chứ không nhỏ hơn: Safari trên iPhone TỰ PHÓNG TO cả trang khi
  //   người dùng bấm vào một ô chữ nhỏ hơn 16px, và không tự thu lại.

  boc.append(chu, o);
  return { boc, o };
}

function khung(phanTu) {
  const d = document.createElement('div');
  d.style.cssText = 'max-width:' + rongHop(360, 420) + ';' +
                    'margin:0 auto;padding:48px 24px;' +
                    'font-family:system-ui,sans-serif;color:#2a2622;' +
                    'line-height:1.6';
  phanTu.filter(Boolean).forEach((x) => d.append(x));
  return d;
}

function tieuDe(chu) {
  const h = document.createElement('h1');
  h.textContent = chu;
  h.style.cssText = 'font-size:20px;margin:0 0 12px';
  return h;
}

function doan(chu) {
  const p = document.createElement('p');
  p.textContent = chu;
  p.style.margin = '0 0 10px';
  return p;
}

function nhoMo(chu) {
  const p = document.createElement('p');
  p.textContent = chu;
  p.style.cssText = 'margin:20px 0 0;font-size:13px;color:#8a8078';
  return p;
}
