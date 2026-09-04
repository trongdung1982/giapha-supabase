# KẾ HOẠCH — nhánh Supabase

*Cập nhật 04/09/2026 11:28 · Bước gần nhất: **b92***

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

**SAO LƯU ĐÃ CHẠY THẬT — 04/09/2026 08:33.** Chủ dự án dựng xong dự án Apps
Script sao lưu, tạo tài khoản `sao-luu@nguyentrongbac.io.vn` mang vai `sao_luu`,
và bản sao lưu đầu tiên nằm trên Drive:
`tai-lieu/tailieu-Supabase/giapha-sao-luu-2026-09-04-0833.json`. Chính file ấy
là chứng cứ `luoc-do/05-sao-luu.sql` đã chạy — trong đó có dòng
`tree_members.role = 'sao_luu'` và danh sách tài khoản, hai thứ chỉ đọc được
sau khi file SQL ấy mở đúng ba chỗ RLS.

**DI DỜI DỮ LIỆU ĐÃ CHẠY THẬT — 04/09/2026 11:28.** Chủ dự án dán
`tai-lieu/di-doi-NTB-20260904.sql` vào SQL Editor và bảng đối chiếu cuối file
khớp **cả 7/7 dòng**: `persons` 59 · `unions` 25 · `union_children` 36 ·
`change_log` 13 · `media`/`sources`/`imports` 0. Tức gia phả của bản Apps Script
nay nằm trong Postgres, giữ nguyên `uid`, giữ nguyên `ts`/`by` của nhật ký, và
người trung tâm `P0012` có thật trong bảng.

**Việc kế tiếp là PHÉP THỬ H9 — phân quyền RLS thật**, xem việc 3 ngay dưới.
Giờ mới thử được, vì tới hôm nay mới có dữ liệu thật để thử trên.

⚠ *Hôm nay dữ liệu trong bảng là dữ liệu giả và app chưa có người dùng nào, nên
không có gì khẩn ở đây — thứ tự các bước là vì đúng trình tự, không phải vì
đang có rủi ro nào treo trên đầu.*

**Mười chín việc đã đóng** — đếm theo đúng số dòng của bảng ngay dưới, đừng
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
| **Mã sao lưu (H8) viết xong, bộ kiểm 29 phép** | **b90** | ✓ **03/09/2026** |
| **Sao lưu bỏ hẳn khoá bí mật — vai `sao_luu`, bộ kiểm 33 phép** | **b91** | ✓ **04/09/2026** |
| `gh` CLI + tự kiểm trên máy thứ hai `LapAMD` | b91 | ✓ **04/09/2026** |
| **Sao lưu CHẠY THẬT — `05-sao-luu.sql` chạy, tài khoản sao lưu tạo, có file trên Drive** | **b91** | ✓ **04/09/2026 08:33** |
| **Bộ sinh SQL di dời (H5) + bộ kiểm 46 phép** | **b92** | ✓ **04/09/2026** |
| **Di dời dữ liệu CHẠY THẬT — bảng đối chiếu khớp 7/7 dòng** | **b92** | ✓ **04/09/2026 11:28** |

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

### 1. Sao lưu (H8) — ✓ XONG 04/09/2026

Chủ dự án dựng xong và **bản sao lưu đầu tiên đã có thật**:
`tai-lieu/tailieu-Supabase/giapha-sao-luu-2026-09-04-0833.json`.

File ấy tự nó chứng minh ba điều cùng lúc, nên không cần kiểm lại:
`luoc-do/05-sao-luu.sql` đã chạy (có dòng `role = 'sao_luu'`), tài khoản
`sao-luu@nguyentrongbac.io.vn` đọc được mọi bảng, và hàm `ds_tai_khoan()`
trả về danh sách tài khoản — thứ chỉ file SQL ấy mở đường.

⚠ Còn nguyên hai chỗ hở, ghi ở bảng *Còn treo*: **chưa ai thử KHÔI PHỤC** từ
file sao lưu, và **sao lưu không chép ảnh**, chỉ liệt kê.

⚠ Đừng "sửa lại cho gọn" bản 0.2.0 bằng cách đưa khoá bí mật trở lại. Lý do
đầy đủ ở `nhat-ky/b91` và đầu `luoc-do/05-sao-luu.sql`: Supabase chặn khoá
`sb_secret_…` khi `User-Agent` giống trình duyệt, mà Apps Script luôn gửi đúng
thứ ấy và Google không cho đổi. Ba phép trong `kiem-thu/kiem-sao-luu.mjs` canh
điều này.

### 2. Di dời dữ liệu (H5) — ✓ XONG 04/09/2026 11:28

Chủ dự án đã dán `tai-lieu/di-doi-NTB-20260904.sql`. Bảng đối chiếu cuối file
khớp cả 7 dòng, nên **không cần kiểm lại bằng cách khác** — chính bảng ấy là
phép kiểm, và cả khối nằm trong một giao dịch: lệch một con số là tự huỷ sạch.

| bảng | mong đợi | đếm được |
|---|---|---|
| `persons` | 59 | 59 |
| `unions` | 25 | 25 |
| `union_children` | 36 | 36 |
| `change_log` | 13 | 13 |
| `media` · `sources` · `imports` | 0 | 0 |

⚠ **Chưa ai MỞ APP xem cây 59 người ấy vẽ ra đúng chưa.** Bảng đối chiếu chứng
minh dữ liệu vào đủ, không chứng minh app đọc ra và vẽ được. Đó là việc bấm
tay, thuộc phép thử H9 ngay dưới.

Phần dưới đây giữ lại vì nó ghi *vì sao* làm theo đường này — đọc `git log -p`
thì không thấy lý do, chỉ thấy kết quả.

#### Vì sao KHÔNG đi đường GEDCOM, và không viết script đăng nhập

Chủ dự án hỏi đúng câu 04/09/2026: *"chỉ cần nhập file GEDCOM xuất từ app trên
GAS thôi chứ?"*. Hai câu trả lời, cả hai đều đáng giữ lại:

**GEDCOM là khuôn HẸP HƠN dữ liệu của app.** Nó sinh ra để đi sang *phần mềm
khác*; ở đây hai đầu là cùng một app, cùng một khuôn JSON. Đi vòng qua nó là
tự nguyện làm mất sáu thứ: `changeLog` (tức **mã đã dùng** — `utils/id.js` sẽ
cấp lại mã cũ cho người mới, không có gì báo lỗi) · bản ghi cờ `deleted` (luật
2 đường xuất) · `meta` · sổ nhập `imports` · ảnh (luật 3 đường nhập, cố ý
không nhập) · `rootPersonId`. Cộng một bẫy im lặng: mặc định xuất **ẩn chi
tiết người còn sống**. Và trên nền này đường ấy còn chưa chạy được —
nhập-để-tạo-cây-mới gọi `repo.taoGiaPhaMoi()`, hàm còn trả `lyDo: 'chualam'`.

**Bản nháp đầu là một script Node tự đăng nhập rồi gọi `luu_cay()`. Bỏ.** Nó
cần mật khẩu một tài khoản có quyền sửa, đổi lấy một việc chỉ làm một lần. Và
đi qua `luu_cay()` thì `ts`/`by` của nhật ký **bị máy chủ ghi đè** thành người
chạy script; ghi thẳng vào bảng giữ được nguyên văn ngày và người sửa của bản
Apps Script — **trung thực hơn**, không phải tiện hơn.

⚠ Ghi thẳng vào bảng là **cố ý phá lệ "cửa ghi duy nhất"**, chỉ được phép vì
đây là việc một lần, do chính chủ dự án dán tay, ngoài app. Không có đường nào
từ trình duyệt tới đó. Ngày nào thấy app gọi tới `di-doi/` là ranh giới đã vỡ.

#### Ba điều bộ kiểm chứng minh được, và một điều nó không

`kiem-thu/kiem-di-doi.mjs` — **46 phép**, và nó **bóc ngược dữ liệu ra khỏi
chính file SQL sinh ra** rồi ráp lại bằng `rapCay()` để so với cây nguồn. Tức
nó đo đúng những byte sẽ đi tới máy chủ, không đo giá trị trả về của một hàm ở
giữa đường. Chứng minh được: không sót trường nào (`soSanh` hai chiều đều
rỗng) · uid điền đủ và tính lại được · nhật ký giữ nguyên `ts` và `by` · mọi
câu `delete`/`update` đều giới hạn bằng `v_tree`.

⚠ **Nó KHÔNG chạy SQL** — máy không có Postgres, Supabase thật thì không đem
ra thử. Lần chủ dự án bấm Run là lần chạy đầu tiên. Điều đó không rủi ro vì cả
khối nằm trong một giao dịch có phần đếm lại ở cuối: sai một con số là huỷ
sạch, cơ sở dữ liệu giữ nguyên như trước.

⚠ **File `.sql` chứa TOÀN BỘ gia phả nên nằm ngoài repo** (`tai-lieu/`). Repo
`giapha-supabase` để Public, và lịch sử git giữ lại cả bản đã xoá sau này.

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
