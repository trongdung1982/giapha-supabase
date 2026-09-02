// ============================================================
// giapha-supabase · js/cau-hinh.js
// Vai trò  : FILE DUY NHẤT chủ dự án sửa tay. Thay cho gas/Config.gs.
// Lớp      : config — không gọi file nào khác
// Phụ thuộc: (không)
// Phiên bản: 0.1.0 · Cập nhật: 02/09/2026 22:45
// ============================================================
//
// ⚠ **Chỉ sửa những dòng có chữ ĐIỀN VÀO ĐÂY.** Mọi thứ khác trong thư mục
//   `supabase/` là mã, không phải cấu hình.
//
// Trên bản Apps Script, vai trò này do `gas/Config.gs` đóng. Từ nay là file
// này — cùng một luật: một file, sửa tay, và mỗi lần sửa phải báo lại dòng
// nào đổi, giá trị cũ → giá trị mới (`CLAUDE.md` mục 9).

// ------------------------------------------------------------
// 1. ĐỊA CHỈ PROJECT SUPABASE
// ------------------------------------------------------------
// Lấy ở: supabase.com → mở project → bánh răng **Project Settings** →
//        **API Keys**. Chép đúng hai giá trị:
//
//   Project URL       →  dán vào SUPABASE_URL
//   Publishable key   →  dán vào SUPABASE_KHOA_CONG_KHAI
//
// ⚠ **Đừng bao giờ chép `Secret key` (chuỗi `sb_secret_…`).** Nó nằm ngay bên
//   cạnh, tên gần giống, và nó **vượt qua toàn bộ phân quyền** — kể cả Row
//   Level Security. Repo này để Public, nên dán nhầm khoá ấy vào đây là đưa
//   chìa khoá cả gia phả lên mạng cho cả thế giới.
//   Nhận ra bằng chính chuỗi: đúng là `sb_publishable_…`, sai là `sb_secret_…`.
//
// Khoá công khai nằm trong mã trang là **bình thường và đúng thiết kế** — nó
// chỉ nói *"tôi là khách của project này"*, còn ai xem được gì thì Row Level
// Security quyết, ở tầng máy chủ. Đó là cả lý do dự án chuyển sang đây.
//
// ⚠ Supabase đã ĐỔI TÊN loại khoá này (2025): trước là *"anon public"*, một
//   chuỗi `eyJ…` rất dài; nay là *"Publishable key"*, chuỗi `sb_publishable_…`
//   ngắn hơn nhiều. **Hai thứ này là một vai**, và app nhận cả hai. Tài liệu
//   Supabase cũ trên mạng vẫn gọi tên cũ — đừng tưởng mình đang cầm nhầm khoá.

export const SUPABASE_URL = 'https://hrmwkpnvenezeyhqmmrw.supabase.co';

export const SUPABASE_KHOA_CONG_KHAI =
  'sb_publishable_tPNWAhaspw9dEAOrXDTw0Q_Mu-qr1-g';

// ------------------------------------------------------------
// 2. CHỮ HIỆN TRÊN MÀN HÌNH
// ------------------------------------------------------------
// Dùng ở màn hình từ chối, khi một người chưa được cấp quyền mở app. Câu chữ
// phải nói rõ người ta PHẢI LÀM GÌ, không hiện lỗi kỹ thuật thô.

export const TEN_HO        = 'họ Nguyễn Trọng Bắc';
export const NGUOI_QUAN_LY = 'trongdung1982@gmail.com';

// ------------------------------------------------------------
// 3. KHO ẢNH
// ------------------------------------------------------------
// Tên kho (bucket) trong Supabase Storage. `01-bang.sql` dựng sẵn kho tên
// `anh`; đổi tên ở đây thì phải đổi cả trong file SQL ấy.
export const KHO_ANH = 'anh';

// ------------------------------------------------------------
// Kiểm nhanh — để lỗi hiện ra bằng tiếng người, ngay lúc mở app
// ------------------------------------------------------------
// Không có khối này thì quên điền sẽ hỏng ở tận trong thư viện Supabase, với
// một câu lỗi tiếng Anh không nói được là thiếu cái gì.
export function thieuCauHinh() {
  const chuaDien = (v) => !v || v === 'ĐIỀN VÀO ĐÂY';
  if (chuaDien(SUPABASE_URL) || chuaDien(SUPABASE_KHOA_CONG_KHAI)) {
    return 'Chưa điền địa chỉ Supabase. Mở file js/cau-hinh.js và điền ' +
           'hai giá trị SUPABASE_URL và SUPABASE_KHOA_CONG_KHAI.';
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(SUPABASE_URL)) {
    return 'SUPABASE_URL trông không đúng khuôn. Phải có dạng ' +
           'https://xxxxxxxx.supabase.co — không có dấu / ở cuối, ' +
           'không kèm đường dẫn nào phía sau.';
  }

  // ⚠ Phép kiểm ĐÁNG GIÁ NHẤT trong cả file. Khoá bí mật tự khai vai trò của
  //   nó ngay trong chuỗi, nên bắt được ở đây là bắt được TRƯỚC khi nó bị đẩy
  //   lên một repo Public — chỗ mà lấy xuống cũng không xoá được dấu vết,
  //   vì lịch sử git giữ lại tất.
  //   Bắt cả hai tên: `sb_secret_` (kiểu mới) và `service_role` (kiểu cũ).
  if (/^sb_secret_|service_role/.test(SUPABASE_KHOA_CONG_KHAI)) {
    return 'Khoá đang điền là KHOÁ BÍ MẬT (secret / service_role) — nó vượt ' +
           'qua mọi phân quyền và TUYỆT ĐỐI không được để trong mã. Quay lại ' +
           'Project Settings → API Keys và chép đúng dòng "Publishable key".';
  }

  // Nhận cả hai đời khoá công khai: `sb_publishable_…` (từ 2025) và `eyJ…`
  // (khoá "anon public" đời cũ, vẫn còn hiệu lực trên project lập trước đó).
  if (!/^(sb_publishable_|eyJ)/.test(SUPABASE_KHOA_CONG_KHAI)) {
    return 'Khoá không đúng khuôn. Khoá công khai của Supabase bắt đầu bằng ' +
           '"sb_publishable_" (bản mới) hoặc "eyJ" (bản cũ).';
  }
  return null;
}
