# KẾ HOẠCH — nhánh Supabase

*Cập nhật 03/09/2026 · Bước gần nhất: **b87***

> **Đây là file đổi nhanh nhất trong khung.** Tên file cố định, không có
> `_Vxx` — lịch sử để git giữ. Muốn biết kế hoạch tuần trước thế nào thì
> `git log -p KE-HOACH.md`, đừng đẻ ra bản thứ hai.
>
> ⚠ **`tai-lieu/KE-HOACH_V54.md` nói về nhánh Apps Script**, không nói về
> nhánh này. Đừng lấy việc còn treo của nó làm việc kế tiếp ở đây.

---

## Đang ở đâu

**Bộ khung đã dựng xong (b87, 03/09/2026). Chưa chạy thật một lần nào.**

Đếm theo đúng số dòng của bảng dưới, đừng chép lại con số của lần trước —
`KE-HOACH_V54` từng đứng nguyên ở *"bảy"* rồi *"hai mươi"* trong khi bảng cứ
dài thêm.

| Việc | Bước | Chốt |
|---|---|---|
| Lược đồ Postgres 12 bảng + RLS + cửa ghi duy nhất | b87 | ✓ |
| `services/sb.js` · `hinh-dang.js` · `repo.js` viết lại | b87 | ✓ |
| Màn hình đăng nhập email + mật khẩu | b87 | ✓ |
| Thư viện supabase-js chép vào `vendor/` | b87 | ✓ |
| Bộ kiểm `kiem-hinh-dang.mjs` — 14/14 đạt | b87 | ✓ |
| Chuyển sang repo `giapha-supabase`, dựng khung tài liệu | b87 | ✓ |

---

## Việc kế tiếp — ĐÚNG THỨ TỰ NÀY

Ba việc đầu **phải xong trước** khi làm bất cứ việc nào từ 4 trở đi. Cả bộ
khung đang đứng trên một giả định chưa ai kiểm: **rằng bốn file SQL chạy được.**

### 1. ⛔ CHẶN — mời `ntdungsnotion` vào repo *(chủ dự án làm)*

Máy này giữ đăng nhập GitHub của `ntdungsnotion`; repo mới thuộc
`trongdung1982`. Đẩy lên báo `403`. Ba bước ở `HUONG-DAN-DUNG-BANG.md`.
Ba commit đang nằm trên máy, chưa lên mạng.

### 2. Chạy bốn file SQL *(chủ dự án làm)*

`luoc-do/01` → `02` → `03` → `04`, đúng thứ tự. Từng bước ở
`HUONG-DAN-DUNG-BANG.md` bước 1.

### 3. Phép thử 20 phút — cả chuỗi có thông không

Tạo tài khoản + một cây thử, mở app, đi qua **ba mốc**:

1. hiện ô đăng nhập *(không phải trang trắng, không phải chữ đỏ)*
2. gõ email + mật khẩu → vào được
3. sơ đồ mở ra **trống** — đúng, vì cây còn rỗng

Dừng ở mốc nào thì báo đúng mốc ấy: ba mốc hỏng vì ba nguyên nhân khác hẳn
nhau. Đây đúng tinh thần `CLAUDE.md` mục 8 — *"việc nào chưa chắc thì làm phép
thử nhỏ trước khi xây lên trên"*.

### 4. Sao lưu (H8) — TRƯỚC khi có dữ liệu thật

Trigger Apps Script chạy nền: đọc REST API Supabase, ghi JSON ra Drive. Cũng
là trigger giữ cho gói miễn phí khỏi tự tạm dừng sau 7 ngày.

⚠ Làm **trước** bước 5, không phải sau. Nhập dữ liệu thật vào một hệ thống
chưa có sao lưu là việc không sửa lại được.

### 5. Script di dời dữ liệu (H5)

`hinh-dang.boCay()` đã làm sẵn phần khó — script chỉ còn đọc file JSON, gọi
nó, đổ vào bảng, kèm bước đối chiếu số bản ghi trước/sau. Nhớ điền `uid` cho
mọi bản ghi ngay tại đây *(xem `repo.canhBaoThieuUid()` để biết vì sao không
để app tự điền)*.

### 6. Phép thử H9 — phân quyền THẬT

Hai tài khoản email khác nhau, mỗi tài khoản một nhánh, xác nhận **bằng mắt**
là không sửa được nhánh kia. Bắt buộc đứng **sau** bước 2 và 5, và **trước**
khi viết bất cứ tài liệu nào mô tả phân quyền như đã chạy.

⚠ `PHAN-QUYEN_V03` ghi ba vòng kiểm chứng của bản Drive. **Chúng không áp dụng
được cho RLS** — cơ chế khác hẳn, chưa kiểm chứng lần nào trong dự án này. Bắt
đầu lại từ số 0.

### 7. Gắn tên miền `nguyentrongbac.io.vn` (H6)

---

## ⚠ Hai câu chủ dự án phải trả lời

Cả hai đang chặn việc thật, không phải câu hỏi cho vui.

**1. Ảnh: kho công khai hay kho kín?** Chi tiết và bảng đánh đổi ở
`KIEN-TRUC.md` mục 7. Hiện để công khai — đường dẫn khó đoán, nhưng "khó đoán"
không phải "được bảo vệ".

**2. "Chi/nhánh" định nghĩa thế nào?** Theo tổ tiên chung ở đời nào? theo
trưởng chi nào? `KE-HOACH-HA-TANG-Supabase_V01.md` hỏi câu này từ 24/08/2026.
Chưa có câu trả lời thì **giới hạn người biên tập theo chi vẫn chưa chạy** —
tức một trong hai lý do chính của cả cuộc chuyển nhà vẫn còn treo.

---

## Còn treo — không chặn gì, nhưng đừng quên

| Việc | Ghi ở đâu |
|---|---|
| ⚠ **Bộ bất biến bố cục đang gác nhầm nhánh** — xem ngay dưới bảng | `/kiem-tra` phép 9 |
| Bốn màn hình chưa mở được (sao lưu · dựng gia phả mới · bỏ chọn · quyền ảnh) | `KIEN-TRUC.md` mục 6 |
| Giấu chi tiết người còn sống với người chỉ có quyền xem | `KIEN-TRUC.md` mục 6 |
| Lỗi điện thoại: chọn số đời không tự vẽ lại | `BAT-DAU.md` mục 5 |
| Tháo giàn giáo `tuong-thich.js` — mốc 7 file, chỉ được giảm | `KIEN-TRUC.md` mục 4 |
| Đổi tên ba vết sẹo (`driveFileId` · `driveThumbUrl` · `tuong-thich`) | `KIEN-TRUC.md` mục 4 |
| Đợt 7 của phép tách `person-edit.js` — treo từ b48 | `BAT-DAU.md` mục 5 |
| Chế độ **bổ sung** của nhập Excel — có phép đo, chưa ai bấm thử trên app thật | `BAT-DAU.md` mục 5 |
| Chưa mở file `.ged` xuất ra bằng một phần mềm gia phả thật | `BAT-DAU.md` mục 5 |

### ⚠ Bộ bất biến bố cục đang gác nhầm nhánh

Bộ kiểm 66 phép / 51.250 phép so trên 214 sơ đồ — thứ bảo vệ `domains/layout.js`,
phần đắt nhất của cả dự án — nằm ở `Claude_Code/kiem-thu/`, **ngoài repo này**.
Và **58 trong 142 file của nó `import` từ `../giapha/js/`**, tức bản đã đóng băng.

Hôm nay vẫn an toàn: đo 03/09/2026, hai bản `domains/` giống nhau **bit-với-bit,
10/10 file**. Nhưng đó là một sự trùng hợp, không phải một cơ chế.

Ngày ai đó sửa `supabase/js/domains/`, bộ kiểm ấy **vẫn chạy xanh** — nó đang đo
một file khác. `/kiem-tra` phép 9 là thứ duy nhất bắt được, và nó chỉ báo *"hai
bản đã lệch"*, không thay được cho việc trỏ bộ kiểm sang đúng chỗ.

Ba đường, chưa chọn: (a) thêm biến môi trường chọn gốc cho 58 file kiểm;
(b) chép bộ kiểm vào `supabase/kiem-thu/`; (c) để nguyên và sống bằng phép 9.
**Chỉ phải quyết khi thật sự cần sửa `domains/`** — mà theo `BAT-DAU.md` mục 1
thì ngày ấy đằng nào cũng phải dừng lại hỏi vì sao.
