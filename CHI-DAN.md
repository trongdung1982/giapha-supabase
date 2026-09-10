# CHỈ DẪN — đọc file này đầu mỗi phiên

*Nhánh Supabase · cập nhật 10/09/2026 (b111b)*

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
| **Mời vào cây · cờ QT hệ thống · xoá tài khoản · xoá gia phả** | ⚠ `THIET-KE-NHIEU-CAY.md` mục **11.4** *(vào cây cần HAI chữ ký — và mục **11.8**: luật ấy ĐÃ TỪNG THỦNG ở bốn cửa, vá bằng `18`)* · **11.5** *(cờ QTHT)* · **11.6** *(xoá cây: chủ xin — QTHT duyệt — thùng rác 30 ngày)* · `luoc-do/14-loi-moi.sql` · **`16-thung-rac-cay.sql`** ⚠ *mục 11.6 nói **sai đường vá**: sửa `co_the_xem_cay()` mà không chừa lối cho vai `sao_luu` là sao lưu đêm ra file THIẾU cây trong thùng rác, không báo lỗi — sáu bảng nội dung gác bằng chính hàm ấy. Đọc khối đầu `16` trước khi đụng. Và ĐỪNG sửa `la_thanh_vien()`* |
| Đụng phân quyền, RLS | ⚠ `THIET-KE-NHIEU-CAY.md` mục **11.3** *(bảng 5 hạng — chốt 08/09)* · `luoc-do/13-quan-ly-thanh-vien.sql` *(ai đổi được quyền · luật KHÔNG tự đặt quyền cho mình)* · `DU-LIEU.md` mục 2 + **2a** + **2b** · `11-quyen-he-thong.sql` ⚠ *(cờ quyền: CHỈ luật ĐỌC)* · **`17`** *(cửa 7: cờ `duoc_tao_cay`)* · ⚠ **`18-hai-chu-ky.sql`** *(bốn cửa KHÔNG ghi được vào lời mời chưa nhận — đây là bản đứng CUỐI của `duyet_thanh_vien` · `doi_vai` · `gan_nguoi` · `dat_tin_cay` · `la_thanh_vien` · `ds_thanh_vien` · `ds_cho_duyet`)* · `06` · `07` · `02-rls.sql` |
| **Ai là "quản trị"?** — trước khi gõ chữ ấy | ⚠ Ba hạng khác nhau: **Quản trị hệ thống** = cờ `tai_khoan` · **Chủ cây** = cột `trees.chu_so_huu` · **Quản trị gia phả** = `tree_members.role='quan_tri'`, **chỉ sửa + duyệt nội dung, KHÔNG đổi quyền**. Mã `quan_tri_he_thong` **không** đặt vào `tree_members` được nữa. ⚠ **Quyền DỰNG cây là hạng thứ tư** = cờ `tai_khoan.duoc_tao_cay`, **tách hẳn** khỏi ba hạng trên (b110b) |
| Đụng kiểm duyệt nội dung, hoàn tác | `luoc-do/08-kiem-duyet.sql` · `03-ham-luu-cay.sql` khối *chụp ảnh* · `kiem-thu/thu-hoan-tac.sql` · bảng TRƯỚC/SAU: `luoc-do/19-kiem-duyet-chi-tiet.sql` + `js/domains/so-sanh.js` (b111) |
| **Đụng nhiều cây · quyền cấp hệ thống · tạo cây · mã xuyên cây** | ⚠ `THIET-KE-NHIEU-CAY.md` **trước tiên** |
| **Đụng trang `QuanTri.html` — bất cứ khu nào** | ⚠ `THIET-KE-QUAN-TRI.md` **trước tiên** · `js/pages/quan-tri/` · `quan-tri.css` *(chỗ DUY NHẤT biết bề ngang màn hình)* · ô gợi ý: `o-goi-y.js` + `luoc-do/15-tim-kiem.sql` · ⚠ **nhìn bằng mắt trước khi báo xong**: `node ../kiem-thu/xem-khung-quan-tri.mjs` (22 ảnh) — 154 phép văn bản từng xanh suốt trong lúc cột nút rơi khỏi mép. ⚠⚠ **THÊM CỬA VÀO `sb.js` THÌ THÊM CẢ Ở `kiem-thu/sb-gia.mjs`** — thiếu một tên là `SyntaxError` lúc nạp mô-đun, tức **CẢ BỘ ẢNH ra nền trơn**, kể cả khu chẳng liên quan. Đã xảy ra HAI lần: b110b (thiếu sáu cửa) và b111 (thiếu `chiTietKiemDuyet`, trắng suốt tới b111b mà không ai biết). Từ b111b `trang-quan-tri-gia.html` in lỗi ra **chữ đỏ đầu trang** — thấy chữ đỏ thì đọc nó, đừng đi sửa bố cục. ⚠ **Không màn hình nào được ngầm định "cây đang mở"** — mọi chỗ gán quyền phải gọi tên cây (b110b); khu Tài khoản nay có **ô chọn cây** riêng, KHÔNG dính cây đang mở của app (b111b); ngoại lệ duy nhất là hai cờ cấp tài khoản. ⚠ Ảnh 1280px KHÔNG phân giải nổi "đè lên nhau" với "sát nhau" — đo bằng `node ../kiem-thu/do-goi-y.mjs` |
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
3. **Đã chạy thật, và phân quyền đã kiểm chứng.** 59 người vào bảng 04/09;
   luật trực hệ + hàng chờ duyệt đo bằng REST, **5/5 hàng rào đạt** (b94,
   b96). Máy chủ thật nay có **HAI cây**, mã cây **3 chữ số** (`NPG473`),
   khung Quản trị bốn khu. `KIEN-TRUC.md` mục 6: còn gì dở.
   ⚠ **File SQL nào đã dán, file nào chưa — hỏi `KE-HOACH.md`.** Không giữ
   bản thứ hai ở đây: nó đổi mỗi bước, và hai chỗ ghi là hai chỗ để lệch nhau.
   ⚠ **Chuỗi dán lại:** `11`/`10`→`14`→`16`→`18` · `13`/`14`→`15`→`20`→`18` ·
   `08`→`18`. Quên là mở lại đúng lỗ hổng "hai chữ ký" của b110c.
   ⚠ **`drop function` XOÁ CẢ `grant`.** Dựng lại một hàm đã có thì chép theo
   cả dòng `grant` của nó, không thì nó lặng lẽ rơi về mặc định Postgres *ai
   cũng gọi được, kể cả `anon`* — `15` đã vấp, `20` vá.

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
