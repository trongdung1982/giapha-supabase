# Bước 90 — Sao lưu (H8): trigger Apps Script chép Supabase ra Drive

*03/09/2026 19:15 · Nhánh Supabase · Claude Code CLI*

---

## Làm được cái gì

- **`sao-luu/SaoLuu.gs`** — mã Apps Script chạy nền. Mỗi đêm ~2 giờ: đọc 12
  bảng cộng danh sách tài khoản qua REST API Supabase, ghi thành **một file
  JSON trên Google Drive**. Giữ 30 bản gần nhất **cộng một bản cho mỗi tháng
  đã qua**. Gửi thư khi hỏng, và khi số dòng tụt hơn một nửa.
- **`sao-luu/HUONG-DAN-SAO-LUU.md`** — 7 bước cho chủ dự án, tên nút chính xác.
- **`kiem-thu/kiem-sao-luu.mjs`** — 29 phép, chạy chính file `.gs` trong Node.
- Cùng lúc, việc **giữ sống** cũng xong: gói miễn phí Supabase tự tạm dừng sau
  7 ngày không có yêu cầu nào, và mỗi lần sao lưu là một yêu cầu.

⚠ **Chưa ai dựng nó lên, nên vẫn CHƯA CÓ bản sao lưu nào.** Phần còn lại là
việc bấm tay của chủ dự án, khoảng 20 phút.

---

## VÌ SAO chọn cách này

### 1. Vì sao là một dự án Apps Script MỚI, không phải dự án cũ

`KE-HOACH-HA-TANG-Supabase_V01.md` bước H8 viết nguyên văn: *"Thu hẹp Apps
Script: **gỡ deploy dạng web app**, viết hai trigger"*. Làm đúng câu ấy hôm nay
là **tắt app của cả họ**.

Câu ấy viết **24/08/2026**. Lúc đó cả kế hoạch giả định bản Apps Script sẽ được
thay hẳn khi bản Supabase xong. Nhưng ngày 02/09 chủ dự án chốt **đóng băng bản
Apps Script mà vẫn để nó chạy tiếp** — nó vẫn là bản người trong họ đang dùng
hằng ngày. Giả định nền của câu H8 hết đúng từ hôm ấy, mà không ai quay lại sửa
câu.

Nếp rút ra, và nó rộng hơn bước này: **một kế hoạch viết trước quyết định thì
câu chữ của nó có thể đã chết mà không ai đánh dấu.** Không phải đọc kế hoạch
rồi làm theo — phải hỏi *"giả định của câu này còn đúng không"*. Ở đây câu hỏi
ấy tiết kiệm được nguyên một sự cố.

### 2. Vì sao đọc bằng KHOÁ BÍ MẬT, không bằng một tài khoản thường

Cách nghe an toàn hơn là tạo một tài khoản riêng cho việc sao lưu, cấp vai
`chu`, rồi đăng nhập bằng email + mật khẩu như mọi người. Không phải đụng tới
khoá bí mật lần nào.

Nó **sai**, và sai theo kiểu tệ nhất. `luoc-do/02-rls.sql` có hai bảng mà mỗi
người **chỉ đọc được phần của mình**: `user_settings` (`user_id = auth.uid()`)
và `branch_access`. Một tài khoản đi sao lưu, dù là `chu`, vẫn không thấy dòng
`user_settings` của người khác.

Và Postgres **không báo lỗi** khi điều đó xảy ra. Nó chỉ trả về ít dòng hơn.
Bản sao lưu sẽ chạy xanh mỗi đêm, file trông đầy đủ, `dem.persons` khớp — chỉ
có mấy bảng nhỏ là thiếu, và không ai biết cho tới ngày khôi phục.

Khoá bí mật vượt RLS nên chép được đủ. Cái giá là **phải có chỗ cất nó thật
sự kín**, và Script Properties của Apps Script đúng là chỗ ấy: nằm trong tài
khoản Google của chủ dự án, không nằm trong repo Public, không đi theo `git`.

Hệ quả: `docCauHinh_()` có một phép kiểm **ngược hẳn** với phép kiểm trong
`js/cau-hinh.js`. Ở đó, khoá bí mật là thứ tuyệt đối không được có; ở đây nó
là thứ bắt buộc phải có. Dán nhầm khoá công khai vào đây thì hỏng đúng kiểu
đoạn trên — nên bắt ngay từ hình dạng chuỗi, trước khi chạm mạng lần nào.

### 3. Vì sao chép thô từng bảng, không ghi ra hình `tree`

Hình `tree` mà trình duyệt dùng thì dễ đọc hơn và app mở thẳng được. Nhưng
`DU-LIEU.md` mục 7 nói rõ: `rapCay()` nạp một mảng `changeLog` **rút gọn** —
chỉ còn trường `target`, không ngày, không người sửa, không giá trị cũ/mới.

Khôi phục từ hình ấy là **mất sạch lịch sử ai sửa gì lúc nào**, im lặng. Bản
sao lưu phải trả lại đúng thứ đã có, nên nó chép thô: mỗi khoá trong `bang` là
tên một bảng Postgres, mỗi dòng giữ đúng tên cột. Đổ ngược được, không phải
đoán. Muốn xem nó dưới hình `tree` thì đưa qua `rapCay()`; chiều ngược lại thì
không có.

### 4. Vì sao sụt giảm dữ liệu thì VẪN ghi, nhưng KHÔNG dọn

Ba lựa chọn, và hai lựa chọn đầu đều hỏng:

| Cách | Hỏng ở đâu |
|---|---|
| Từ chối ghi khi thấy dữ liệu tụt | Nếu là tụt thật (dọn thùng rác) thì tự tay bỏ mất bản sao lưu của ngày ấy — và của mọi ngày sau, vì nó vẫn tụt |
| Ghi rồi dọn như thường | Nếu dữ liệu vừa mất thật thì bản cũ là thứ duy nhất cứu được, và ta vừa dọn nó đi |
| **Ghi, hét lên, và không dọn** ✓ | Không mất gì ở cả hai ca. Cái giá là thư mục phình ra cho tới khi người ta xem |

Ngưỡng chọn *"tụt quá một nửa, và bảng cũ phải có ít nhất 10 dòng"*. Vế thứ
hai để cây mới dựng (1 → 0 người) không hét ầm lên vô cớ.

### 5. Vì sao giữ thêm một bản cho mỗi tháng

Chỉ giữ 30 bản gần nhất thì một hỏng hóc không ai nhận ra trong 31 ngày là mất
hẳn. Mà kiểu hỏng nguy hiểm nhất trong gia phả đúng là kiểu **không ai nhận
ra** — `DU-LIEU.md` mục 7 nói về việc cấp lại một mã đã dùng: *"không có gì báo
lỗi, chỉ là mọi câu chuyện cũ về mã ấy lặng lẽ dính sang một người khác."*

Một bản mỗi tháng là mười hai file một năm. Rẻ tới mức không đáng bàn, so với
thứ nó cứu.

### 6. Vì sao bộ kiểm CHẠY file `.gs` chứ không chép lại logic

Bản sao lưu là thứ **không ai nhìn cho tới ngày cần tới**. Mọi kiểu hỏng của nó
đều im lặng và đều cho ra một file trông rất bình thường.

Cách quen thuộc là viết lại logic ấy bằng JavaScript rồi kiểm bản viết lại.
Nhưng bản viết lại đúng thì **không nói gì về bản thật** — hai bản sẽ trôi khác
nhau, và bản được kiểm không phải bản chạy mỗi đêm.

Apps Script chạy V8, nên cùng một mã chạy được trong Node. `kiem-sao-luu.mjs`
đọc thẳng `SaoLuu.gs`, nạp bằng `new Function`, và tiêm vào chín đối tượng giả
(`UrlFetchApp` · `DriveApp` · `PropertiesService` · `MailApp` · `Session` ·
`ScriptApp` · `Logger` · `Utilities` · cả `Date` để đồng hồ đứng yên). Thứ
được kiểm là **file sẽ dán vào Apps Script**, từng byte.

Phép đáng giá nhất trong 29 phép: **phân trang**. Với 681 người lỗi bỏ sót từ
dòng 1001 không bao giờ lộ ra — cho tới ngày `change_log` vượt một nghìn dòng,
tức đúng lúc gia phả đã có dữ liệu thật. Bài kiểm dựng một bảng 2.500 dòng nên
bắt được hôm nay.

Phép đáng giá thứ hai: **khoá bí mật không được lọt vào file sao lưu**. Bản sao
lưu bị chia sẻ nhầm mà mang theo khoá thì người nhận cầm luôn chìa khoá vượt
mọi phân quyền của cơ sở dữ liệu **đang sống**.

---

## Đã thử mà hỏng

**Bộ kiểm xanh 29/29 ngay lần chạy đầu** — và đó là dấu hiệu đáng ngờ, không
phải dấu hiệu tốt. Theo nếp của b89, phải chứng minh nó không phải đồ trang trí.

Phá hoại mã có chủ ý **sáu chỗ**, mỗi chỗ một kiểu hỏng thật:

| Phá hoại | Kết quả |
|---|---|
| Bỏ bảng `user_settings` khỏi danh sách sao lưu | ĐỎ 1 phép |
| Bỏ phân trang, chỉ đọc trang đầu | ĐỎ 1 phép — đọc 1000/2500 dòng |
| Để khoá bí mật lọt vào file sao lưu | ĐỎ 1 phép |
| Bỏ luật giữ một bản mỗi tháng | ĐỎ 1 phép — còn 2 tháng thay vì 5 |
| Nuốt lỗi thay vì ném tiếp | ĐỎ 3 phép |
| Dọn bản cũ ngay cả khi nghi ngờ mất dữ liệu | ĐỎ 1 phép — 40 file → 30 |

Khôi phục nguyên bản: xanh lại 29/29.

**Một chỗ suýt viết sai, bắt được lúc đọc lại chứ không phải lúc chạy.** Bản
đầu gửi thư cảnh báo với câu *"Bản sao lưu cũ KHÔNG bị xoá"* — trong khi mã đã
gọi `donBanCu_()` ngay phía trên và đã xoá thật. Thư nói dối, và nói dối đúng
lúc người ta cần tin nó nhất. Sửa cả hai: bỏ hẳn bước dọn khi có cảnh báo, rồi
mới sửa câu chữ. Nếp: **câu chữ trong thư báo động cũng là một lời hứa của mã,
phải kiểm như kiểm mã.**

---

## Còn treo

1. **Chủ dự án chưa dựng dự án Apps Script** — cho tới lúc ấy vẫn là *không có
   bản sao lưu nào*. Từng bước ở `sao-luu/HUONG-DAN-SAO-LUU.md`.
2. **Sao lưu KHÔNG chép ảnh**, chỉ liệt kê tên và dung lượng. Ảnh vẫn nằm đúng
   một chỗ duy nhất. Chưa có ảnh thật nên chưa mất gì; con số `dem.anh` trong
   file sao lưu chính là số tấm chưa được chép đi đâu. Chép ảnh phải chia nhỏ
   theo từng lần chạy — trigger Apps Script chỉ có 6 phút.
3. **Chưa ai thử KHÔI PHỤC.** Có file sao lưu khác với khôi phục được; chuyện
   thứ hai chỉ chứng minh được bằng cách đổ ngược vào một project trống.
4. **Không sao lưu được mật khẩu.** Supabase chỉ giữ bản băm. Khôi phục sang
   project khác thì mọi người phải đặt lại mật khẩu — dữ liệu về đủ, đường vào
   thì không.
5. **Chưa kiểm chứng được việc giữ sống**, và không có cách nào kiểm nhanh: bằng
   chứng duy nhất là sau 8 ngày project vẫn chưa tạm dừng.

---

## File đã đụng tới

**Mới**
- `supabase/sao-luu/SaoLuu.gs` — 0.1.0
- `supabase/sao-luu/HUONG-DAN-SAO-LUU.md`
- `supabase/kiem-thu/kiem-sao-luu.mjs` — 0.1.0
- `supabase/nhat-ky/b90-sao-luu-ra-drive.md` *(file này)*

**Sửa**
- `supabase/KE-HOACH.md` — thêm dòng b90; viết lại việc 1; thêm 2 mục còn treo
- `supabase/KIEN-TRUC.md` — mục 2 thêm `sao-luu/`; mục 6 viết lại phần sao lưu
  và **sửa hai chỗ đã cũ từ b89** (*"chưa chạy thật lần nào"* và *"Enforce
  HTTPS còn treo"*); mục 7 thêm phần ảnh không được sao lưu
- `supabase/CHI-DAN.md` — thêm một dòng định tuyến (69 dòng, trần 80)

**Chép nguyên / xoá**: không có.

**Đã `git push`** trước khi viết nhật ký này: commit `6a96789`, nhánh `main`.
Lần đẩy ấy mang theo cả `32bb6a6` (b89) — commit ấy trước nay chưa lên mạng.
