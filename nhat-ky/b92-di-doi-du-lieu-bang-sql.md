# b92 — Di dời dữ liệu bằng một file SQL dán tay

*04/09/2026 10:25 · Nhánh Supabase*

---

## Việc đã làm

1. **Ghi nhận sao lưu đã chạy thật** (chủ dự án làm trước phiên này, 04/09/2026
   08:33). Bản đầu tiên: `tai-lieu/tailieu-Supabase/giapha-sao-luu-2026-09-04-0833.json`.
   Không phải kiểm lại gì — chính nội dung file ấy là chứng cứ, xem mục *"Đọc
   một file sao lưu thay cho ba phép kiểm"* bên dưới.
2. **Viết `di-doi/sinh-sql-di-doi.mjs`** — đọc file `giapha-json` của bản Apps
   Script, điền `uid` còn thiếu, rồi sinh **một file `.sql`** để chủ dự án dán
   vào Supabase → SQL Editor.
3. **Viết `kiem-thu/kiem-di-doi.mjs`** — 46 phép, bóc ngược dữ liệu ra khỏi
   chính file SQL sinh ra rồi ráp lại bằng `rapCay()` để so với cây nguồn.
4. **Sinh file thật**: `tai-lieu/di-doi-NTB-20260904.sql` — 59 người · 25 hôn
   nhân · 36 quan hệ con · 13 mục nhật ký.
5. **Viết `di-doi/HUONG-DAN-DI-DOI.md`** — sáu bước bấm tay cho chủ dự án.

---

## VÌ SAO

### 1. Vì sao không đi đường GEDCOM — câu hỏi của chủ dự án

Đầu phiên tôi đã tuyên bố sẽ viết một script Node tự đăng nhập vào Supabase.
Chủ dự án chặn lại bằng đúng câu đáng hỏi:

> *"việc di dời dữ liệu chỉ cần nhập file gedcom xuất từ app nên gas thôi chứ?
> tại sao phải code lại?"*

Câu ấy đúng ở chỗ quan trọng nhất — **đừng viết mã cho việc đã có sẵn đường**
— nên phải tra tài liệu trước khi trả lời, chứ không được bảo vệ kế hoạch cũ.
Tra xong thì ra hai điều:

**(a) GEDCOM là khuôn HẸP HƠN dữ liệu của app.** Nó sinh ra để đi sang *phần
mềm khác*. Ở đây hai đầu là **cùng một app, cùng một khuôn JSON**, nên bắt dữ
liệu chui qua nó rồi phình lại là mất mát tự nguyện. Theo
`CAU-TRUC-DU-LIEU_V06` mục *Ánh xạ GEDCOM* và ghi chú đầu `domains/gedcom.js`,
sáu thứ rơi lại:

| Rơi mất | Hậu quả |
|---|---|
| `changeLog` | Mất **danh sách mã đã dùng**. `utils/id.js` sẽ cấp lại mã của người cũ cho người mới — nó tự gọi đây là *"kiểu hỏng tệ nhất trong gia phả: không có gì báo lỗi, chỉ là mọi câu chuyện cũ về mã ấy lặng lẽ dính sang một người khác"* |
| Bản ghi cờ `deleted` | Luật 2 của đường xuất: không xuất. Cả thùng rác biến mất |
| `meta` | Ai tạo, ai sửa lần cuối, lúc nào |
| `imports` | Sổ nhập — bảng ánh xạ uid của các lần nhập trước |
| Ảnh | Luật 3 của đường nhập: *"Ảnh KHÔNG nhập"*, cố ý |
| `rootPersonId` | Người trung tâm mặc định |

Cộng một bẫy im lặng: **mặc định xuất là ẩn chi tiết người còn sống**. Quên bỏ
chọn thì ngày sinh, ghi chú, tên phụ, ngày giỗ của mọi người đang sống mất
sạch, và file `.ged` vẫn trông hoàn toàn bình thường.

**(b) Đường ấy hôm nay còn chưa chạy được.** Nhập `.ged` để *tạo gia phả mới*
gọi `repo.taoGiaPhaMoi()` (`pages/import-export.js:891`), mà bản Supabase của
hàm ấy còn trả `lyDo: 'chualam'`. Chế độ *bổ sung vào cây đang mở* thì bắt
buộc khai tay ≥ 1 điểm neo và chưa ai bấm thử trên app thật lần nào.

Nói cách khác: đi đường GEDCOM là **viết thêm mã** (`taoGiaPhaMoi`) để **mất
thêm dữ liệu**. Đó là câu trả lời, và nó chỉ có được sau khi đọc tài liệu.

### 2. Nhưng câu hỏi ấy vẫn đúng — nên bỏ bớt ở chỗ khác

Chủ dự án hỏi *"tại sao phải code lại"*, và ý đằng sau là **ít mã hơn**. Đường
GEDCOM không đáp được, nhưng script Node đăng nhập cũng không phải câu trả lời
tốt. Nên bỏ nó, đổi sang **sinh một file SQL để dán tay**. Ba lý do:

1. **Không cần mật khẩu.** Script đăng nhập cần mật khẩu một tài khoản có
   quyền sửa — thêm một chỗ nữa để mật khẩu đi lạc, đổi lấy một việc chỉ làm
   **đúng một lần**.
2. **Trung thực hơn, không phải tiện hơn.** Đi qua `luu_cay()` thì `ts` và `by`
   của nhật ký **bị máy chủ ghi đè** thành người đang chạy script — đó là hàng
   rào cuối của `03-ham-luu-cay.sql`, và nó đúng cho app. Nhưng ở đây nó biến
   13 mục nhật ký của bản Apps Script thành 13 mục mang tên người chạy script,
   ngày hôm nay. Ghi thẳng vào bảng giữ được nguyên văn cả ngày lẫn người sửa.
3. **Thao tác chủ dự án đã biết.** Đã dán 5 file SQL vào SQL Editor. Đây là
   việc cũ, không phải việc mới.

⚠ **Ghi thẳng vào bảng là cố ý phá lệ "cửa ghi duy nhất".** Phải nói thẳng ra
chứ không giấu. Nó chỉ được phép vì ba điều cùng đúng: việc làm **một lần** ·
do **chính chủ dự án** dán tay · **ngoài app**, không có đường nào từ trình
duyệt tới đó. Ngày nào thấy app gọi tới `di-doi/` là ngày ranh giới đã vỡ.

### 3. Vì sao file SQL tra cây theo `tree_code`, không nhận uuid

Mã cây thật là một chuỗi uuid 36 ký tự. Bắt chủ dự án chép tay nó là dựng ra
một cái sai không có gì bắt được: **dán nhầm uuid của cây khác** thì file chạy
trơn tru và đổ 59 người vào nhầm gia phả.

Nên file SQL nhận `tree_code = 'NTB'` — chuỗi ngắn, đọc được — rồi tự tra uuid
ra. Còn dòng dữ liệu thì mang mã cây **giả** lúc sinh, và
`public.gan_ma_cay()` (đã có sẵn từ `03-ham-luu-cay.sql`) ghi đè mã thật lúc
chạy. Bài kiểm có một phép canh đúng chỗ này: **không dòng nào được mang sẵn
`tree_id`**.

### 4. Vì sao bài kiểm phải BÓC NGƯỢC dữ liệu ra khỏi file SQL

Cách dễ là kiểm giá trị trả về của `boCay()` rồi tin rằng phần ghép chuỗi
không làm hỏng gì. Cách ấy đo **một hàm ở giữa đường**, không đo thứ sẽ đi tới
máy chủ. Giữa hai chỗ ấy còn ba bước có thể mất dữ liệu im lặng: bỏ `tree_id`,
`JSON.stringify`, và ghép vào giữa hai dấu rào đô-la.

Nên bài kiểm đọc **chính file SQL sinh ra**, bóc bảy khối JSON ra bằng biểu
thức chính quy, `JSON.parse` lại, ráp thành cây bằng `rapCay()` — đúng hàm mà
`services/sb.layDong()` sẽ dùng sau khi dữ liệu nằm trong bảng — rồi
`soSanh()` **hai chiều** với cây nguồn. Cả hai chiều rỗng nghĩa là: *dán file
này vào cơ sở dữ liệu xong, app đọc lên sẽ thấy đúng cây nguồn.*

Hai chiều chứ không một, vì `soSanh(cũ, mới)` chỉ nhìn những gì có trong cây
**mới**: một người thừa trong file SQL mà nguồn không có sẽ không hiện ra ở
chiều thuận.

### 5. Vì sao phần đối chiếu nằm TRONG file SQL, không nằm ở bài kiểm

Bài kiểm chạy trên máy tôi, trước khi dán. Nó không biết được chuyện gì xảy ra
lúc Postgres nuốt file. Nên file SQL tự mang theo phần đếm lại từng bảng, và
`raise exception` khi lệch — mà cả khối là **một giao dịch**, nên lệch một con
số là huỷ sạch, cơ sở dữ liệu giữ nguyên như trước khi bấm Run.

Nhờ thế mới dám giao cho chủ dự án chạy một file **chưa ai chạy thử bao giờ**:
cái giá của việc nó hỏng là **không có gì xảy ra cả**.

### 6. Đọc một file sao lưu thay cho ba phép kiểm

Chủ dự án chỉ báo *"đã sao lưu thành công"* kèm đường dẫn file. Mở file ấy ra
đọc thì nó tự trả lời ba câu mà lẽ ra phải đi hỏi:

- có dòng `tree_members.role = 'sao_luu'` → **`05-sao-luu.sql` đã chạy** (vai
  ấy không tồn tại trong `01-bang.sql`);
- có mảng `nguoiDung` 2 tài khoản → **hàm `ds_tai_khoan()` chạy được**, tức
  đúng bản mã 0.2.0 chứ không phải 0.1.0;
- có khối `khoAnh` → **chính sách liệt kê kho ảnh đã mở**.

Nên hai dòng *Còn treo* của `KE-HOACH.md` (*"`05-sao-luu.sql` CHƯA chạy"* và
*"Apps Script đang mang mã 0.1.0"*) đã gỡ được mà không cần hỏi thêm câu nào.
**Nếp rút ra: bằng chứng thường nằm sẵn trong thứ người ta vừa đưa cho mình.**

---

## Đã thử mà hỏng

**1. Kế hoạch đầu phiên sai hướng, và chủ dự án bắt được trước khi tôi viết
dòng mã nào.** Tôi đã đọc xong bối cảnh và tuyên bố *"bắt đầu viết script
Node"*. Cái hỏng không phải ở phương án — script ấy chạy được — mà ở chỗ **tôi
chưa tra đường GEDCOM trước khi loại nó**. Nếp: trước khi viết mã cho một việc,
hỏi *"app đã có sẵn đường nào làm việc này chưa"*, và tra tài liệu để trả lời,
không trả lời bằng trí nhớ.

**2. Một phép kiểm đỏ vì chính nó viết sai, không phải vì mã sai.** Phép *"uid
có sẵn KHÔNG bị tính lại đè lên"* dựng một cây thử có **đúng một người**, gán
sẵn uid cho người ấy, rồi đòi `dienUid()` trả về `1`. Nhưng cây ấy không còn
ai thiếu uid, nên câu trả lời đúng là `0`. Mã không sai; phép kiểm đo một con
số mà bối cảnh của nó không thể sinh ra. Sửa bằng cách thêm người thứ hai chưa
có uid — giờ phép kiểm đo được **cả hai vế**: người cũ giữ nguyên, người mới
được điền. **Nếp: một phép kiểm đếm số phải có dữ liệu để con số ấy khác 0.**

---

## Còn treo

- ⚠ **Chưa ai dán `tai-lieu/di-doi-NTB-20260904.sql`.** Cho tới lúc ấy, cây
  trên Supabase vẫn chỉ có một người thử.
- ⚠ **Bộ kiểm KHÔNG chạy SQL.** Máy không có Postgres (`psql`, `docker`,
  `pg_ctl` đều không có), Supabase thật thì không đem ra thử. Lần chủ dự án
  bấm Run là lần chạy đầu tiên của file ấy.
- ⚠ **Chưa ai thử KHÔI PHỤC** từ file sao lưu — có file khác với khôi phục được.
- ⚠ **Sao lưu không chép ảnh**, chỉ liệt kê.
- Việc kế tiếp sau khi dán xong: **phép thử H9 — phân quyền THẬT**, hai tài
  khoản, hai nhánh, xác nhận bằng mắt.

---

## File đã đụng tới

**Mới:**
- `di-doi/sinh-sql-di-doi.mjs` — bộ sinh, chạy bằng Node trên máy làm việc
- `di-doi/HUONG-DAN-DI-DOI.md` — sáu bước bấm tay cho chủ dự án
- `kiem-thu/kiem-di-doi.mjs` — 46 phép
- `../tai-lieu/di-doi-NTB-20260904.sql` — **ngoài repo, cố ý**: nó chứa toàn
  bộ gia phả, mà repo này để Public

**Sửa:**
- `KE-HOACH.md` — mục *Đang ở đâu*, bảng việc đã đóng (16 → 18 dòng), viết lại
  việc 1 và 2, gỡ hai dòng *Còn treo* đã xong
- `KIEN-TRUC.md` mục 6 — sao lưu *"chưa ai dựng"* → **đã chạy thật**; thêm
  đoạn về di dời; bảng bộ kiểm thêm `kiem-di-doi.mjs`, sửa 29 → 33 phép
- `CHI-DAN.md` — thêm một dòng định tuyến cho di dời (70 dòng, còn trong trần 80)
- `nhat-ky/INDEX.md` — thêm một dòng

**Không đụng:** `js/` — không một file mã nào của app bị sửa trong phiên này.
