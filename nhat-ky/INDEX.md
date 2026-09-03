# NHẬT KÝ — nhánh Supabase

*Bắt đầu từ bước 87 · Cập nhật 03/09/2026 06:42*

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

*Cột "Nội dung một dòng": **một câu, tối đa 110 ký tự**. Nói bước ấy làm được
cái gì, không nói vì sao. Đây là dòng để người đọc quyết định có mở file bước
hay không, chỉ vậy thôi.*

---

## Đính chính giữa các bước

Bảng này ghi **bước cũ nào đã nói sai**, và bước nào sửa lại. Nó **không phải
mục lục** — cắt cụt là mất đúng phần khiến nó có giá trị.

| Câu đã nói sai | Ở bước | Sửa ở bước | Sự thật |
|---|---|---|---|
| *(chưa có)* | | | |

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
