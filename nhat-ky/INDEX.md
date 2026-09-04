# NHẬT KÝ — nhánh Supabase

*Bắt đầu từ bước 87 · Cập nhật 04/09/2026 18:45*

> ⚠ **FILE NÀY CHỈ ĐƯỢC THÊM DÒNG. Không bao giờ sinh lại cả file.**
>
> Nhánh cũ dùng quy ước `NK-INDEX_Vxx`: mỗi lần thêm một bước là sinh lại toàn
> bộ file mang số mới. Cách ấy đã hỏng một lần có ghi lại — **V62 cắt nhầm hai
> bảng** *Hai nhánh, một dãy số* và *Đính chính giữa các bước*, tưởng chúng là
> mục lục nên thu gọn, mất đúng phần có giá trị nhất; V63 phải sửa lại.
>
> Ở đây không có bước "sinh lại", nên không có chỗ để cắt nhầm. Thêm một bước
> = thêm **một dòng** vào bảng dưới. Lịch sử để git giữ.

---

## Một dãy số, hai nhánh

Số bước **đi tiếp**, không đánh lại từ đầu. Quyết định của b00–b86 vẫn là nền
của app mới — `domains/` chép nguyên sang, luật vẽ chép nguyên sang.

| Bước | Nhánh | Nhật ký nằm ở |
|---|---|---|
| b00 – b86 | Apps Script *(đã đóng băng 02/09/2026)* | `../../tai-lieu/NK-INDEX_V81.md` và `../../tai-lieu/NK-Bxx_V01.md` |
| b87 → | **Supabase** | thư mục này |

⚠ Thư mục `tai-lieu/` **cố ý nằm ngoài repo** này (chủ dự án chốt 03/09/2026).
Ai tải repo về từ GitHub sẽ không có 87 file nhật ký cũ — đó là chuyện bình
thường, không phải thiếu sót.

---

## Các bước

| Bước | Ngày | Nội dung một dòng | File |
|---|---|---|---|
| 87 | 03/09/2026 | Dựng bộ khung app trên Supabase: 12 bảng, một cửa ghi, tầng services viết lại; `domains/` không sửa dòng nào | `b87-bo-khung-supabase.md` |
| 88 | 03/09/2026 | App lên mạng thật ở GitHub Pages; thêm phép kiểm bắt bộ bất biến bố cục đang gác nhầm nhánh | `b88-len-mang-va-bit-lo-hong-bo-kiem.md` |
| 89 | 03/09/2026 | Chạy thật lần đầu: thêm được người mới; tên miền riêng có HTTPS; bộ kiểm lên 19 phép | `b89-chay-that-va-ten-mien.md` |
| 90 | 03/09/2026 | Mã sao lưu (H8): trigger Apps Script chép 12 bảng ra Drive mỗi đêm, kiêm giữ sống. Chưa ai dựng | `b90-sao-luu-ra-drive.md` |
| 91 | 04/09/2026 | Sao lưu bỏ hẳn khoá bí mật: vai `sao_luu` chỉ-đọc + đăng nhập thường; bộ kiểm 33 phép | `b91-sao-luu-bo-khoa-bi-mat.md` |
| 92 | 04/09/2026 | Sinh một file SQL dán tay để di dời 59 người vào bảng, giữ nguyên nhật ký; bộ kiểm 46 phép | `b92-di-doi-du-lieu-bang-sql.md` |
| 93 | 04/09/2026 | Luật sửa theo TRỰC HỆ thay hẳn ý tưởng chia chi/nhánh; gắn ID + admin duyệt; bộ kiểm 57 phép | `b93-quyen-truc-he.md` |
| 94 | 04/09/2026 | Phép thử H9: cả 5 hàng rào RLS đạt trên máy chủ thật; bắt và vá một lỗ hổng leo quyền; nút Đăng xuất | `b94-phep-thu-h9.md` |
| 95 | 04/09/2026 | Đăng ký xếp hàng chờ: approved gác cả quyền đọc, màn hình xin vào, khối duyệt trong Cài đặt; 40 phép | `b95-hang-cho-duyet.md` |
| 96 | 04/09/2026 | Hàng chờ chạy thật: người đang chờ đọc được 0 dòng trên cả 6 bảng; 4 hàm mới đo trên máy chủ | `b96-hang-cho-chay-that.md` |
| 97 | 04/09/2026 | Kiểm duyệt nội dung ở máy chủ: mỗi lần Lưu treo cờ, từ chối thì hoàn tác. Đổi mã vai. Đã chạy thật | `b97-kiem-duyet-noi-dung-va-doi-ma-vai.md` |

*Cột "Nội dung một dòng": **một câu, tối đa 110 ký tự**. Nói bước ấy làm được
cái gì, không nói vì sao. Đây là dòng để người đọc quyết định có mở file bước
hay không, chỉ vậy thôi.*

---

## Đính chính giữa các bước

Bảng này ghi **bước cũ nào đã nói sai**, và bước nào sửa lại. Nó **không phải
mục lục** — cắt cụt là mất đúng phần khiến nó có giá trị.

| Câu đã nói sai | Ở bước | Sửa ở bước | Sự thật |
|---|---|---|---|
| `KIEN-TRUC.md` mục 6 mở đầu bằng *"Chưa chạy thật một lần nào"* | b87 | b90 | Đúng cho tới b88. Từ 03/09/2026 (b89) SQL đã chạy, đăng nhập được, thêm được người mới. Thứ **thật sự** chưa kiểm chứng lần nào là **phân quyền RLS** (H9) |
| `KIEN-TRUC.md` mục 6 ghi *"Còn một ô chưa tích: Enforce HTTPS"* | b88 | b90 | Đã tích cuối ngày 03/09/2026; đo lại `http://` trả `301` sang `https://` |
| `KE-HOACH-HA-TANG-Supabase_V01.md` bước H8: *"gỡ deploy dạng web app"* | *(24/08/2026, trước b87)* | b90 | Giả định nền của câu ấy chết ngày 02/09 khi chốt **giữ bản Apps Script chạy tiếp** cho người trong họ. Gỡ deploy là tắt app của cả họ — H8 làm bằng một dự án Apps Script **mới, riêng** |
| `HUONG-DAN-SAO-LUU.md` bước 1: *"chép **Secret key** (`sb_secret_…`)"* | b90 | b91 | Khoá ấy **không bao giờ** dùng được từ Apps Script: Supabase chặn nó khi `User-Agent` giống trình duyệt, mà Apps Script luôn gửi `Mozilla/5.0 (compatible; Google-Apps-Script; …)` và Google không cho đổi. Bản 0.2.0 bỏ hẳn khoá bí mật, dùng vai `sao_luu` |
| `KE-HOACH.md` việc H9: *"hai tài khoản, mỗi tài khoản một **nhánh**"* — và cả câu hỏi treo *"chi/nhánh định nghĩa thế nào"* | b87 → b92 | b93 | Luật chốt 04/09/2026 **không có nhánh nào cả**: quyền đi theo **trực hệ**, tính thẳng từ đồ thị quan hệ. Bảng `branches`/`branch_access` dựng từ `01-bang.sql` từ nay không dùng. Phép thử H9 đúng là *hai tài khoản gắn với hai người ở hai đầu cây* |
| `06-quyen-truc-he.sql` mục 8: *"dùng được từ **SQL Editor** ngay"* | b93 | b94 | Chỉ chạy được vì lỗ hổng `null` trong chính hàm ấy. Vá xong thì SQL Editor là "người ngoài" và bị từ chối — duyệt tay bằng `update`, xem `HUONG-DAN-PHAN-QUYEN.md` mục 3 |
| `b95-hang-cho-duyet.md` mục *Còn treo*: *"`07-duyet-dang-ky.sql` chưa dán"* | b95 | b96 | Chủ dự án dán ngay trong cùng phiên, 04/09/2026 chiều, tự kiểm khớp 4/4. Đã đo hết mốc A→C của luồng xin vào; còn nửa cuối là chủ dự án bấm Duyệt trên màn hình Cài đặt |
| Mọi bước gọi vai bằng mã **`chu`** và **`admin`** | b87 → b96 | b97 | Hai mã ấy **không còn tồn tại** từ 04/09/2026 tối: `chu` → `quan_tri_he_thong`, `admin` → `quan_tri` (`09-doi-ma-vai.sql`, đã chạy thật). Đọc nhật ký cũ thì thay ngầm hai chữ ấy. Tên cho người đọc: Quản trị hệ thống · Quản trị viên · Thành viên · Khách |
| `08-kiem-duyet.sql` 0.1.1 mục *TÊN GỌI*: *"Mã trong bảng KHÔNG đổi theo… trả cái giá ấy để được mấy chữ trên màn hình là không đáng"* | b97 | b97 | Sai **trong cùng buổi**. Lý lẽ hụt một vế: mã vai không chỉ nằm trong bảng — nó hiện trên màn hình Cài đặt, trong câu báo lỗi máy chủ, và trong mọi đoạn SQL chủ dự án phải dán tay. *"Chỉ nằm trong cơ sở dữ liệu"* là mô tả của người đọc mã, không phải của người dùng app |

---

## Quy tắc giữ nhật ký gọn

- Mỗi bước một file. Bước là **một phiên làm việc có điểm dừng**.
- File bước nào chỉ ghi việc bước đó. Không nhắc lại bối cảnh chung.
- Phần **"vì sao"** dài hơn phần "làm gì". Cái "làm gì" đọc mã là ra; cái
  "vì sao" mất đi thì không đoán lại được.
- **Viết xong không sửa lại nữa.** Sau này thấy nó sai thì thêm một dòng vào
  bảng *Đính chính* ở trên, đừng sửa đè lịch sử.
- Bảng *Các bước* vượt 40 dòng thì gộp các bước của giai đoạn đã đóng thành
  một dòng tổng kết.
