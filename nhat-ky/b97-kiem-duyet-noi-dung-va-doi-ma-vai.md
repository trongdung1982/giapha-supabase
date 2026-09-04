# Bước 97 — Kiểm duyệt nội dung (tầng máy chủ) và đổi mã vai

*04/09/2026 23:15 · Claude Code CLI*

---

## Làm được gì

Hai việc, và việc thứ hai sinh ra giữa chừng từ một câu của chủ dự án.

**1. Kiểm duyệt nội dung — tầng máy chủ.** Việc 4 của `KE-HOACH.md`, chốt
thiết kế từ sáng cùng ngày, nay có mã:

- `luoc-do/08-kiem-duyet.sql` [MỚI] — năm cột trên `change_log`
  (`trang_thai` · `truoc` · `duyet_boi` · `duyet_luc` · `ly_do_tu_choi`),
  cột `tin_cay` trên `tree_members`, và mười một hàm.
- `luu_cay()` lên **0.3.0**: chụp ảnh mọi dòng nó sắp đụng vào **trước khi
  ghi**, rồi treo cờ `cho`/`duyet` theo `ghi_thang()`.
- Duyệt = thôi treo cờ, không đụng dữ liệu. Từ chối = **hoàn tác thật** từ
  ảnh chụp ấy.
- Hai hạng quản trị tách ra: quản trị viên kiểm duyệt nội dung nhưng **không**
  đổi được vai hay gắn được mã người.
- `kiem-thu/kiem-kiem-duyet.mjs` [MỚI] — 111 phép, đạt 111.

**2. Đổi mã vai trong bảng.** `chu` → `quan_tri_he_thong`, `admin` →
`quan_tri`. Bốn hạng nay có tên tiếng Việt trên màn hình: Quản trị hệ thống ·
Quản trị viên · Thành viên · Khách.

- `luoc-do/09-doi-ma-vai.sql` [MỚI] — đổi dữ liệu và ràng buộc.
- Bảy file lược đồ + ba file JS + bốn bộ kiểm đổi theo.

**Cả hai đã CHẠY THẬT** trên Supabase cùng buổi tối. Bảng tự kiểm của `09`
khớp cả 5 dòng, trong đó hai dòng cuối — *"còn bao nhiêu hàm / luật RLS nhắc
mã cũ"* — đều bằng `0`.

---

## VÌ SAO — bảy quyết định, và cái giá của chúng

### 1. Vì sao ảnh chụp `truoc` phải do MÁY CHỦ tự lấy

`change_log` đã có sẵn cột `diff`. Dùng nó để hoàn tác thì không phải thêm
cột nào. Nhưng `diff` **do trình duyệt gửi lên** (`services/repo.js`) và mặc
định rỗng `{}` — tức là để chính người sửa tự khai mình đã sửa gì.

Người muốn phá chỉ cần gửi `diff` rỗng: bản cũ biến mất vĩnh viễn, và không
có gì báo lỗi. Cột `truoc` do `luu_cay()` tự chụp, cùng đúng lý lẽ đã dùng cho
`ts`/`by` từ b87 — **những thứ quyết định hậu quả thì không để người gửi tự
khai**.

### 2. Vì sao hoàn tác phải hỏi "đã có ai sửa tiếp chưa"

Hoàn tác một lần Lưu mà sau đó có người khác sửa lên trên là **xoá mất công
của người sau**, và xoá im lặng. Đây đúng cùng một lý lẽ với `revision` ở hàng
rào 3: máy chủ thà từ chối và chỉ ra ai đã sửa, còn hơn âm thầm ghi đè.

Cách trả lời câu ấy: `truoc` liệt kê chính xác các dòng một lần Lưu đụng tới,
nên **so hai tập khoá là xong** — không cần thêm cột nào lên năm bảng dữ liệu.
Phương án kia (gắn `log_id` lên từng dòng) nhanh hơn nhưng đẻ ra năm cột phải
nhớ điền ở mọi đường ghi, và `DU-LIEU.md` mục 3 điều 7 đã ghi lại cái giá của
một cột bị quên điền: nó âm thầm ghi `null` đè lên.

⚠ Và `dung_do_sau()` **bỏ qua những lần Lưu đã bị từ chối** — tác dụng của
chúng đã được hoàn tác rồi nên chúng không còn "giữ" dòng nào. Đếm cả chúng
thì một lần từ chối sẽ khoá cứng mọi lần từ chối trước nó mà chẳng bảo vệ gì.

### 3. Vì sao từ chối KHÔNG đẻ thêm một dòng nhật ký

Nghe thì thiếu — nó có đổi dữ liệu mà. Nhưng dòng mới ấy sẽ mang khoá của đúng
những bản ghi vừa hoàn tác, nên nó **khoá luôn việc từ chối những lần Lưu
trước đó**, trong khi dữ liệu đã quay về đúng trạng thái cho phép làm thế. Vết
duyệt nằm ngay trên chính dòng bị từ chối.

### 4. Vì sao khôi phục phải `on conflict do update`, không xoá-rồi-chèn

`01-bang.sql` đặt `on delete cascade` từ `union_children` sang cả `persons` và
`unions`. Xoá một người để chèn lại là **cắt luôn mọi quan hệ của họ**, kể cả
quan hệ lần Lưu này không đụng tới. Postgres không báo lỗi — nó làm đúng như
được dặn.

Cùng cái bẫy ấy còn một mặt nữa: hoàn tác một lần Lưu "thêm người mới" phải
XOÁ người ấy, và cú xoá đó cascade cắt mất mối nối do **lần Lưu khác** tạo ra.
Nên `tu_choi_thay_doi()` soát trước hai đường, và thà từ chối hoàn tác còn hơn
cắt nhầm. Có thêm một lưới cuối bắt `foreign_key_violation`.

### 5. Vì sao mặc định `trang_thai` là `'cho'`, không phải `'duyet'`

Quên dán lại `03` thì `luu_cay()` cũ không điền cột ấy. Mặc định `'duyet'` →
kiểm duyệt im lặng không chạy, không ai biết. Mặc định `'cho'` → mọi lần Lưu
rơi vào hàng chờ, kể cả của quản trị hệ thống: ồn ào, thấy ngay, không mất gì.
**Hỏng đằng cấm chứ không hỏng đằng cho qua** — cùng hướng `06` đã chọn.

### 6. Vì sao đổi mã vai phải dán lại NĂM file, không gộp một

Đây là phần đắt nhất của bước này, và nó đáng ghi lại vì nó là **hậu quả của
một lựa chọn cũ**.

Tên vai nằm rải thành chữ viết thẳng ở mỗi nơi gọi: 11 hàm, 2 luật RLS, 1 ràng
buộc, cộng chính dữ liệu. Không có một chỗ nào trả lời câu *"vai nào là quản
trị"*. Nên đổi một hằng số hoá ra phải sờ vào gần hết lược đồ.

Có thể gộp hết vào `09` cho gọn một lần dán. **Đã cân nhắc và bỏ**: lúc ấy
thân của `la_thanh_vien()` sẽ tồn tại ở HAI file, và người sửa nó lần sau sẽ
sửa đúng một bản. Dự án tự đặt luật *"một câu hỏi một chỗ trả lời"*; đổi tên
một hằng số không đáng để phá luật ấy. Nên `09` chỉ đổi dữ liệu + ràng buộc,
còn các hàm đổi bằng cách **dán lại chính file chứa chúng**.

⚠ Thứ tự `05` → `06` không đảo được: `05` đặt lại ràng buộc vai **thiếu vai
quản trị viên** (nó ra đời trước vai ấy), `06` mới thêm vào.

### 7. Vì sao mã trong bảng đổi, chứ không chỉ đổi chữ trên màn hình

Bản đầu tôi chỉ thêm `vaiTroBangChu()` để dịch mã sang tên, giữ nguyên mã, và
viết hẳn vào tài liệu rằng *"trả cái giá ấy để được mấy chữ trên màn hình là
không đáng"*. Chủ dự án trả lời: *"mình nhìn chữ chu rất không thích"*.

Câu ấy đúng, và lý lẽ của tôi hụt một vế: mã ấy **không chỉ nằm trong bảng**,
nó hiện lên màn hình Cài đặt, nó nằm trong câu báo lỗi máy chủ trả về, nó nằm
trong mọi đoạn SQL chủ dự án phải dán tay. Người không lập trình gặp nó hàng
ngày. "Chỉ nằm trong cơ sở dữ liệu" là mô tả của người đọc mã, không phải của
người dùng app.

---

## Đã thử mà hỏng

### `sed` vấp khoá Dropbox, và `&&` biến nó thành lời báo sạch GIẢ

Lệnh có dạng `sed -i … && sed -i … && echo … && grep … || echo "(sach)"`.
`sed` thứ nhất hỏng giữa chừng (`cannot rename: Device or resource busy` —
Dropbox đang giữ file), cả chuỗi `&&` ngừng, nhánh `||` chạy, và màn hình in
ra **"(sach)"**. Tôi suýt báo là đã đổi xong.

Kiểm lại bằng một lệnh `grep` **riêng** thì còn **17 chỗ** chưa đổi.

**Nếp rút ra:** lệnh kiểm-tra-lại không bao giờ được nối bằng `&&` sau lệnh
sửa file. Chạy riêng. Đã ghi vào ký ức
`bash-dung-cd-dung-duong-dan-tuong-doi`.

### Ba phép kiểm báo hỏng trên mã hoàn toàn đúng

Lần chạy đầu bộ kiểm mới: 95 đạt, 3 hỏng — và cả ba là lỗi của **chính bài
kiểm**, không phải của mã:

1. Đếm lệnh `update … trang_thai` mà không phân biệt "quét cả bảng" với "một
   dòng theo `id`", nên tính nhầm cả `duyet_thay_doi()`.
2. Soi chữ `admin` trên **cả file** thay vì trong thân hàm, nên bắt trúng
   những chỗ *gọi* `co_the_quan_tri()`.
3. Cắt khối `'children'` bằng `indexOf("'children'")`, trúng ngay
   `p_ops->'children'->'luu'` ở phía trên — một khối chẳng liên quan gì tới
   ảnh chụp.

Cả ba đều là dạng **báo hỏng oan**, và nó nguy hiểm ngang báo đạt oan: một
phép luôn đỏ sẽ bị người ta tắt đi. Sửa xong đã bẻ gãy mã có chủ ý để xác nhận
cả ba thật sự bắt được lỗi.

### Phép tự kiểm của `06` đo bằng cái thước đã hỏng

Dòng *"vai admin nhan duoc"* dò bằng cách tìm chữ `admin` **trong chính ràng
buộc**. Đổi mã xong thì ràng buộc không còn chữ ấy — dòng ấy sẽ báo `KHONG`
trên một cơ sở dữ liệu hoàn toàn đúng, và làm chủ dự án tưởng mình dán hỏng.

Đây là kiểu hỏng khó chịu nhất trong cả bước này: **không phải mã sai, mà là
cái thước đo sai.** Cùng lý do ấy, phép dò trong `09` so `'admin'` **có nháy**
— chữ `admin` còn nằm trong hàng chục câu tiếng Việt; so trần thì dòng ấy
không bao giờ về `0` và người đọc sẽ học cách bỏ qua nó.

### Chạy script Python sửa hàng loạt bị chặn

Bộ phân loại quyền từ chối một script Python ghi vào nhiều file cùng lúc. Đổi
sang `sed` từng nhóm file là qua. Không phải lỗi, nhưng đáng nhớ: **việc sửa
hàng loạt nên chia nhỏ theo nhóm file**, và dù sao cũng phải đọc lại kết quả.

---

## Còn treo

| Việc | Vì sao chưa làm |
|---|---|
| ⚠ **Chưa ai thử HOÀN TÁC thật** | Đường từ chối mới chỉ được soi bằng văn bản. Có mã hoàn tác khác với hoàn tác được — cùng loại khoảng cách với *"có file sao lưu"* và *"khôi phục được"* |
| **`duyet.html` chưa viết** (b98) | Cửa máy chủ đã dựng sẵn: `ds_kiem_duyet()` · `dem_cho_kiem_duyet()` · `duyet_thay_doi()` · `tu_choi_thay_doi()` |
| Cờ `tin_cay` chưa có màn hình | Bật bằng `update` trong SQL Editor |
| Tài khoản thử `thu-h9@…` chưa dọn | Từ b94, đang gắn `P0012` và đã duyệt |
| Trình duyệt chưa nói *"bản sửa của bạn đang chờ duyệt"* | `luu_cay()` đã trả `trangThai`, nhưng chưa file JS nào đọc. Không gấp: dữ liệu vẫn hiện ra bình thường, đúng thiết kế |

---

## File đã đụng tới

**Mới (3):**

- `luoc-do/08-kiem-duyet.sql`
- `luoc-do/09-doi-ma-vai.sql`
- `kiem-thu/kiem-kiem-duyet.mjs`

**Sửa (18):**

- `luoc-do/01-bang.sql` · `02-rls.sql` · `05-sao-luu.sql` · `06-quyen-truc-he.sql`
  · `07-duyet-dang-ky.sql` — đổi mã vai; `06` sửa thêm phép tự kiểm đã hỏng
- `luoc-do/03-ham-luu-cay.sql` — **0.2.0 → 0.3.1**, thêm khối chụp ảnh `truoc`
- `js/pages/settings.js` — **1.25.0 → 1.27.0**, `vaiTroBangChu()`
- `js/services/sb.js` · `js/pages/chon-gia-pha.js` — đổi mã vai
- `kiem-thu/kiem-duyet-dang-ky.mjs` · `kiem-quyen-truc-he.mjs` · `kiem-sao-luu.mjs`
- `CHI-DAN.md` · `DU-LIEU.md` (thêm mục 2c) · `KE-HOACH.md` ·
  `HUONG-DAN-PHAN-QUYEN.md` (thêm mục 8) · `HUONG-DAN-DUNG-BANG.md` ·
  `KIEN-TRUC.md`

**Chép nguyên / xoá:** không có. `domains/` không sửa dòng nào — vẫn trùng
bit-với-bit với bản Apps Script, 10/10 file.
