# CHỈ DẪN — đọc file này đầu mỗi phiên

*Nhánh Supabase · cập nhật 04/09/2026 16:45*

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
| Đụng phân quyền, RLS | `DU-LIEU.md` mục 2 + **2b** · `luoc-do/06-quyen-truc-he.sql` · `07-duyet-dang-ky.sql` · `02-rls.sql` |
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
3. **Đã chạy thật, và phân quyền đã kiểm chứng.** Sao lưu ra Drive 04/09
   08:33; 59 người vào bảng 04/09 11:28; luật trực hệ dán 04/09 13:20; phép
   thử H9 xong 04/09, **5/5 hàng rào đạt** (b94) — đo bằng cách gọi thẳng
   REST, không qua trình duyệt. Thứ **chưa** dán: `07-duyet-dang-ky.sql`
   (xếp hàng chờ duyệt, b95). `KIEN-TRUC.md` mục 6 kể những gì còn dở.

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

## Hai thư mục, đừng lẫn

| | `supabase/` *(đây)* | `../tai-lieu/` |
|---|---|---|
| Là gì | Repo `giapha-supabase`, **Public** | Bản sao Knowledge Base, **ngoài repo** |
| Chứa | App mới: mã, lược đồ, tài liệu nhánh Supabase | Dùng chung hai nhánh: luật vẽ, ánh xạ GEDCOM, nhật ký b00–b86 |
| Tên file | cố định | `_Vxx`, luôn đọc bản số lớn nhất |

⚠ Mọi file thả vào `supabase/` **đều đi lên mạng**, và lịch sử git giữ lại cả
bản đã xoá sau này. Hỏi câu ấy trước khi thêm file.

## Lệnh

`/khoi-tao` mở phiên · `/kiem-tra` rà trước khi báo xong · `/ket-thuc` đóng phiên.
Không báo hoàn thành khi chưa chạy `/kiem-tra`.
