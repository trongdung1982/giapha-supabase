# CHỈ DẪN — đọc file này đầu mỗi phiên

*Nhánh Supabase · cập nhật 09/09/2026 (b110)*

⚠ **TRẦN CỨNG 80 DÒNG.** Vượt là dấu hiệu có thứ đứng nhầm chỗ — chuyển ra
file riêng, **đừng nới trần**. `MUC-LUC` của nhánh cũ phình tới 590 dòng vì
không ai đặt trần cho nó, và một file phải đọc mỗi phiên mà dài 590 dòng thì
nó chính là thứ nó sinh ra để tránh.

## Việc hôm nay → đọc file nào

| Sắp làm gì | Đọc |
|---|---|
| **Bất cứ việc gì** | `KE-HOACH.md` — đang ở đâu, việc kế tiếp |
| Mới vào nhánh này lần đầu | + `KIEN-TRUC.md` **cả file** |
| Đụng `services/` | `KIEN-TRUC.md` mục 1, 3 · `DU-LIEU.md` mục 1, 6 |
| Đổi lược đồ bảng, thêm/bớt trường | `DU-LIEU.md` **cả file** · `luoc-do/` |
| **Mời vào cây · cờ QT hệ thống · xoá tài khoản · xoá gia phả** | ⚠ `THIET-KE-NHIEU-CAY.md` mục **11.4** *(vào cây cần HAI chữ ký)* · **11.5** *(cờ QTHT)* · **11.6** *(xoá cây: chủ xin — QTHT duyệt — thùng rác 30 ngày)* · `luoc-do/14-loi-moi.sql` · **`16-thung-rac-cay.sql`** ⚠ *mục 11.6 nói **sai đường vá**: sửa `co_the_xem_cay()` mà không chừa lối cho vai `sao_luu` là sao lưu đêm ra file THIẾU cây trong thùng rác, không báo lỗi — sáu bảng nội dung gác bằng chính hàm ấy. Đọc khối đầu `16` trước khi đụng. Và ĐỪNG sửa `la_thanh_vien()`* |
| Đụng phân quyền, RLS | ⚠ `THIET-KE-NHIEU-CAY.md` mục **11.3** *(bảng 5 hạng — chốt 08/09)* · `luoc-do/13-quan-ly-thanh-vien.sql` *(ai đổi được quyền · luật KHÔNG tự đặt quyền cho mình)* · `DU-LIEU.md` mục 2 + **2a** + **2b** · `11-quyen-he-thong.sql` ⚠ *(cờ quyền: CHỈ luật đọc)* · `06` · `07` · `02-rls.sql` |
| **Ai là "quản trị"?** — trước khi gõ chữ ấy | ⚠ Ba hạng khác nhau: **Quản trị hệ thống** = cờ `tai_khoan` · **Chủ cây** = cột `trees.chu_so_huu` · **Quản trị gia phả** = `tree_members.role='quan_tri'`, **chỉ sửa + duyệt nội dung, KHÔNG đổi quyền**. Mã `quan_tri_he_thong` **không** đặt vào `tree_members` được nữa |
| Đụng kiểm duyệt nội dung, hoàn tác | `luoc-do/08-kiem-duyet.sql` · `03-ham-luu-cay.sql` khối *chụp ảnh* · `kiem-thu/thu-hoan-tac.sql` |
| **Đụng nhiều cây · quyền cấp hệ thống · tạo cây · mã xuyên cây** | ⚠ `THIET-KE-NHIEU-CAY.md` **trước tiên** |
| **Đụng trang `QuanTri.html` — bất cứ khu nào** | ⚠ `THIET-KE-QUAN-TRI.md` **trước tiên** · `js/pages/quan-tri/` · `quan-tri.css` *(chỗ DUY NHẤT biết bề ngang màn hình)* · ô gợi ý: `o-goi-y.js` + `luoc-do/15-tim-kiem.sql` · ⚠ **nhìn bằng mắt trước khi báo xong**: `node ../kiem-thu/xem-khung-quan-tri.mjs` (12 ảnh) — 154 phép văn bản từng xanh suốt trong lúc cột nút rơi khỏi mép. ⚠ Ảnh 1280px KHÔNG phân giải nổi "đè lên nhau" với "sát nhau" — đo bằng `node ../kiem-thu/do-goi-y.mjs` |
| Bàn thử SQL tại chỗ · phép ĐO hàng rào · tên/mã vai trò | `../kiem-thu/ban-thu-sql/` *(ngoài repo, CÓ trên máy này)* — `do-b102`→`do-b110` ⚠ tiếng Việt vào psql phải đi bằng `-f`, không `-c` · tên vai: `config.js` hàm `vaiTroBangChu()` |
| Duyệt/gắn tài khoản, hỏi "sao tôi không sửa được" | `HUONG-DAN-PHAN-QUYEN.md` |
| Đụng cách VẼ sơ đồ | `../tai-lieu/QUY-TAC-VE_V14.md` · `BAT-DAU.md` mục 6 |
| Đụng ảnh | `KIEN-TRUC.md` mục 7 ⚠ có câu chưa chốt |
| Đụng sao lưu, trigger Apps Script | `sao-luu/SaoLuu.gs` · `luoc-do/05-sao-luu.sql` · `kiem-thu/kiem-sao-luu.mjs` |
| Đụng di dời dữ liệu vào bảng | `di-doi/HUONG-DAN-DI-DOI.md` · `di-doi/sinh-sql-di-doi.mjs` |
| Thêm/nâng cấp thư viện | `js/vendor/DOC-VENDOR.md` — và **hỏi chủ dự án trước** |
| Xuất/nhập GEDCOM, Excel | `../tai-lieu/CAU-TRUC-DU-LIEU_V06.md` mục *Ánh xạ GEDCOM* |
| Hướng dẫn chủ dự án bấm gì | `HUONG-DAN-DUNG-BANG.md` |
| Mở app tại chỗ, cài máy thứ hai, dùng `gh` | `../MAY-THU-HAI.md` *(ngoài repo)* |
| Muốn biết vì sao chuyển nhà | `BAT-DAU.md` (chứng cứ gốc, không sửa) |

**Đừng đọc cả thư mục.** Đọc theo bảng trên. Đặc biệt: đừng mở mọi file trong
`nhat-ky/` cùng lúc — mở `nhat-ky/INDEX.md` trước, nó có một dòng cho mỗi bước
đủ để quyết định có mở file bước hay không.

## Ba điều phải biết trước khi gõ dòng đầu tiên

1. **`domains/` không được sửa.** Cả mười file chép nguyên từ bản Apps Script.
   Thấy mình đang sửa `domains/` là dừng lại hỏi vì sao — `BAT-DAU.md` mục 1.
2. **Chỉ `services/sb.js` được chạm `window.supabase`.** Không file nào khác.
3. **Đã chạy thật, và phân quyền đã kiểm chứng.** 59 người vào bảng 04/09
   11:28; luật trực hệ dán 13:20, phép thử H9 **5/5 hàng rào đạt** (b94);
   hàng chờ duyệt dán chiều 04/09, người đang chờ đọc **0 dòng** (b96) — đo
   bằng REST, không qua trình duyệt. `KIEN-TRUC.md` mục 6: còn gì dở.
   ⚠ **Máy chủ thật nay có HAI cây** (b100), khung Quản trị bốn khu (b101),
   tầng quyền hệ thống + tạo cây mới đã dán cả hai Supabase (b102–b104); mã
   cây nay **3 chữ số** (`NPG473`). `13` đã dán 08/09 (b105), khu Tài khoản
   chạy 08/09 (b106); `14` đã dán, **b108·b109·b109b chạy thật 09/09**. ⏳ **`15`
   bản 0.2.0 CHƯA DÁN** (cột `vai_cao_nhat`) — tự kiểm phải ra 13 ĐẠT.
   ✓ **`16` (thùng rác cây, b110) ĐÃ DÁN cả hai 09/09** — tự kiểm 11 mục đạt.
   ⏳ Nhưng **chưa ai bấm thử** vòng xin → duyệt → phục hồi trên app.
   Chuỗi dán lại: `11`/`10` → `14` → **`16`** · và `13`/`14` → `15`.
   Quên `16` sau khi dán `11`/`14` là **cây trong thùng rác mở lại cho cả họ**.

## Quy ước khung tài liệu này

- **Tên file CỐ ĐỊNH, không có `_Vxx`.** Lịch sử để git giữ. Muốn xem bản cũ
  thì `git log -p <file>`, đừng đẻ ra bản thứ hai.
  *(Khác `tai-lieu/` — thư mục ấy giữ quy ước `_Vxx` vì nó là bản sao Knowledge
  Base trên claude.ai, nơi không có lịch sử phiên bản.)*
- **`nhat-ky/INDEX.md` chỉ được THÊM DÒNG, không bao giờ sinh lại cả file.**
  Nhánh cũ từng cắt nhầm mất bảng *Đính chính* đúng vì sinh lại (V62 hỏng,
  V63 sửa). Không có bước sinh lại thì không có chỗ để cắt nhầm.
- Mỗi bước một file `nhat-ky/bXX-*.md`, **viết xong không sửa lại nữa**. Phần
  *"vì sao"* dài hơn phần *"làm gì"* — cái "làm gì" đọc mã là ra, cái "vì sao"
  mất đi thì không đoán lại được.

- ⚠ Mọi file thả vào `supabase/` **đều đi lên mạng**, và lịch sử git giữ lại
  cả bản đã xoá sau này. Hỏi câu ấy trước khi thêm file.
  *(Bảng so `supabase/` với `../tai-lieu/` ở `CLAUDE.md` mục 10 — mọi phiên
  đều đọc sẵn file ấy, giữ bản thứ hai ở đây là hai chỗ để lệch nhau.)*

## Lệnh

`/khoi-tao` mở phiên · `/kiem-tra` rà trước khi báo xong · `/ket-thuc` đóng phiên.
Không báo hoàn thành khi chưa chạy `/kiem-tra`.
