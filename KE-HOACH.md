# KẾ HOẠCH — nhánh Supabase

*Cập nhật 03/09/2026 17:50 · Bước gần nhất: **b90***

> **Đây là file đổi nhanh nhất trong khung.** Tên file cố định, không có
> `_Vxx` — lịch sử để git giữ. Muốn biết kế hoạch tuần trước thế nào thì
> `git log -p KE-HOACH.md`, đừng đẻ ra bản thứ hai.
>
> ⚠ **`tai-lieu/KE-HOACH_V54.md` nói về nhánh Apps Script**, không nói về
> nhánh này. Đừng lấy việc còn treo của nó làm việc kế tiếp ở đây.

---

## Đang ở đâu

**CẢ CHUỖI ĐÃ THÔNG.** 03/09/2026: bốn file SQL đã chạy thật, tài khoản tạo
được, đăng nhập được, **và thêm được người mới** — tức trình duyệt ghi xuống
Postgres qua `luu_cay()` và dữ liệu nằm lại trong bảng. Đây là lần đầu tiên
điều đó xảy ra; mọi dòng trước ngày này chỉ là thiết kế chưa ai bấm thử.

**Mười bốn việc đã đóng** — đếm theo đúng số dòng của bảng ngay dưới, đừng
chép lại con số của lần trước (`KE-HOACH_V54` từng đứng nguyên ở *"bảy"* rồi *"hai
mươi"* trong khi bảng cứ dài thêm).

| Việc | Bước | Chốt |
|---|---|---|
| Lược đồ Postgres 12 bảng + RLS + cửa ghi duy nhất | b87 | ✓ |
| `services/sb.js` · `hinh-dang.js` · `repo.js` viết lại | b87 | ✓ |
| Màn hình đăng nhập email + mật khẩu | b87 | ✓ |
| Thư viện supabase-js chép vào `vendor/` | b87 | ✓ |
| Bộ kiểm `kiem-hinh-dang.mjs` — 14/14 đạt | b87 | ✓ |
| Chuyển sang repo `giapha-supabase`, dựng khung tài liệu | b87 | ✓ |
| **Đẩy lên GitHub, Pages phục vụ thật** | **b88** | ✓ **03/09/2026** |
| `/kiem-tra` thêm phép 2b và 9; `/ket-thuc` tách hai nhánh | b88 | ✓ |
| **Bốn file SQL chạy thật · đăng nhập · thêm người mới** | **b89** | ✓ **03/09/2026** |
| Máy chủ thử tại chỗ (`kiem-thu/may-chu-tai-cho.mjs`, ngoài repo) | b89 | ✓ |
| **Tên miền `nguyentrongbac.io.vn` chạy, có HTTPS (H6)** | **b89** | ✓ **03/09/2026 15:57** |
| Sửa lỗi cột `not null` nhận `null`; bộ kiểm 14 → 19 phép | b89 | ✓ |
| `gh` CLI trên máy `LapASUS` + `MAY-THU-HAI.md` | b89 | ✓ |
| **Mã sao lưu (H8) viết xong, bộ kiểm 29 phép** | **b90** | ✓ **03/09/2026** — ⚠ chủ dự án chưa dựng |

**Địa chỉ thật của app từ 03/09/2026: `https://nguyentrongbac.io.vn`.** Chứng
chỉ Let's Encrypt hạn 02/12/2026, `Enforce HTTPS` đã bật nên `http://` bị đẩy
sang `https://`. Địa chỉ cũ `trongdung1982.github.io/giapha-supabase/` và
`www.` đều `301` về đây, nên link cũ không ai bị lạc.

**Lỗi đầu tiên của lần chạy thật, và nó đáng ghi lại.** Thêm người mới báo
`null value in column "vn" … violates not-null`. Nguyên nhân không nằm ở chỗ
ai cũng đoán: lược đồ CÓ `default '{}'` cho cột ấy, nhưng `default` không áp
khi giá trị `null` được gửi tường minh, và `luu_cay()` đi qua
`jsonb_populate_recordset` — nơi khoá thiếu trong JSON cũng cho ra `null` chứ
không cho ra `default`. Tức **`default` trong SQL là hàng rào, không phải chỗ
điền hộ**; chỗ điền hộ phải là `services/hinh-dang.js`. Đã sửa, và bộ kiểm
nay đọc thẳng danh sách cột `not null` từ `01-bang.sql` để bắt lại (19/19).

---

## Việc kế tiếp — ĐÚNG THỨ TỰ NÀY

*(Việc "mời `ntdungsnotion` vào repo" đã xong 03/09/2026 — đẩy được, Pages
chạy. Cách gỡ ghi ở `CLAUDE.md` mục 4 phòng khi gặp lại `403`.)*

### 1. Sao lưu (H8) — ⚠ CÒN MỘT VIỆC CHỦ DỰ ÁN PHẢI BẤM TAY

**Mã đã viết và đã kiểm** (b90, 03/09/2026): `sao-luu/SaoLuu.gs` chép 12 bảng
+ danh sách tài khoản ra một file JSON trên Drive mỗi đêm, giữ 30 bản gần nhất
cộng một bản mỗi tháng, gửi thư khi hỏng và khi dữ liệu tụt hơn một nửa. Bộ
kiểm `kiem-thu/kiem-sao-luu.mjs` chạy chính file `.gs` ấy trong Node với
Supabase giả và Drive giả: **29/29 đạt**, và sáu phép phá hoại có chủ ý đều
làm nó đỏ.

**Nhưng chưa ai dựng nó lên, nên vẫn CHƯA CÓ bản sao lưu nào.** Việc còn lại
là của chủ dự án, khoảng 20 phút, từng bước ở `sao-luu/HUONG-DAN-SAO-LUU.md`:
tạo dự án Apps Script mới → dán mã → dán khoá bí mật vào Script Properties →
chạy `kiemTraKetNoi` → `saoLuuNgay` → `datLichSaoLuu`.

⚠ **Bước 2 (di dời dữ liệu) không được bắt đầu trước khi việc ấy chạy xong** —
nhập dữ liệu thật vào một hệ thống chưa có sao lưu là việc không sửa lại được.

⚠ Đây là dự án Apps Script **MỚI, RIÊNG**. `KE-HOACH-HA-TANG_V01` bước H8 viết
*"gỡ deploy dạng web app"* — câu ấy có từ 24/08, trước khi chốt giữ bản Apps
Script chạy tiếp cho người trong họ. Gỡ deploy hôm nay là tắt app của cả họ.

### 2. Script di dời dữ liệu (H5)

`hinh-dang.boCay()` đã làm sẵn phần khó — script chỉ còn đọc file JSON, gọi
nó, đổ vào bảng, kèm bước đối chiếu số bản ghi trước/sau. Nhớ điền `uid` cho
mọi bản ghi ngay tại đây *(xem `repo.canhBaoThieuUid()` để biết vì sao không
để app tự điền)*.

### 3. Phép thử H9 — phân quyền THẬT

Hai tài khoản email khác nhau, mỗi tài khoản một nhánh, xác nhận **bằng mắt**
là không sửa được nhánh kia. Bắt buộc đứng **sau bước 2** (có dữ liệu thật để
thử), và **trước** khi viết bất cứ tài liệu nào mô tả phân quyền như đã chạy.

⚠ `PHAN-QUYEN_V03` ghi ba vòng kiểm chứng của bản Drive. **Chúng không áp dụng
được cho RLS** — cơ chế khác hẳn, chưa kiểm chứng lần nào trong dự án này. Bắt
đầu lại từ số 0.

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
| ⚠ **Sao lưu KHÔNG chép ảnh** — chỉ liệt kê. Ảnh vẫn nằm đúng một chỗ | `KIEN-TRUC.md` mục 7 |
| ⚠ **Chưa ai thử KHÔI PHỤC từ file sao lưu** — có file khác với khôi phục được | `sao-luu/HUONG-DAN-SAO-LUU.md` |
| ⚠ **Chưa bấm thử app trên cây 681 người** — bộ kiểm chạy trên cây 59 người, và lỗi `vn` của b89 lộ ra ở app thật chứ không lộ ở bộ kiểm | `nhat-ky/b89` |
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
