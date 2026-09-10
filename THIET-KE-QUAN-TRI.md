# THIẾT KẾ — Trang Quản trị (`QuanTri.html`)

*Cập nhật 09/09/2026 (b110b) · Chốt trước khi viết dòng mã đầu tiên*

> **Tên file cố định, không có `_Vxx`** — lịch sử để git giữ.
>
> Nguồn: bản thiết kế của ChatGPT (05/09/2026, chủ dự án đặt hàng) + ba phép
> đo trên chính mã nguồn mà ChatGPT không có cách nào biết. Chỗ nào bản này
> **khác** bản của ChatGPT đều ghi rõ *vì sao*, ở ngay chỗ ấy.

> ⚠ **BỔ SUNG 05/09/2026 — đọc `THIET-KE-NHIEU-CAY.md` cùng file này.** Chủ dự
> án chốt ba câu về nhiều gia phả trong cùng ngày, và chúng đổi ba chỗ ở đây:
> **khu 1** to hơn hẳn *(chủ sở hữu · xin quyền · cây mặc định · công tắc cho
> người lạ thấy tên)*; **khu 2** thêm cột *Mã tài khoản*; **bảng quyền mục 5**
> thêm một hạng đứng trên tất cả — *quản trị toàn hệ thống*, đọc và sửa được
> mọi cây. Chỗ nào hai file nói khác nhau thì **`THIET-KE-NHIEU-CAY.md` đúng**,
> vì nó viết sau.

---

## 1. Ba câu hỏi tách ba màn hình

Cách chia không dựa vào *"ai được phép"* mà dựa vào *"đang trả lời câu hỏi gì"*:

| Màn hình | Trả lời câu hỏi |
|---|---|
| **Cài đặt** *(lớp phủ trên `index.html`)* | *Sơ đồ của tôi hiện ra thế nào?* + việc biên tập **trên cây đang mở** |
| **`QuanTri.html`** | *Tôi quản lý con người, kiểm duyệt và an toàn dữ liệu thế nào?* |

Ranh giới thật sự nằm ở một chỗ kỹ thuật, không phải ở quyền: **`QuanTri.html`
cố ý KHÔNG nạp cây gia phả.** Đó là lý do số 2 khiến nó là trang riêng — người
duyệt không cần một dòng nào trong 681 người ấy. Mọi quyết định dưới đây bám
theo ranh giới ấy.

---

## 2. Mười khối Cài đặt đi đâu — và ba khối KHÔNG dời được

⚠ **Đây là chỗ khác bản của ChatGPT nhiều nhất.** ChatGPT dựng một khu *"Dữ
liệu gia phả"* trong `QuanTri.html` để chứa khối 1, 6, 7. Đo lại trên mã thì
khu ấy **không dựng được** mà không phá ranh giới ở mục 1:

| Khối | Nó `import` gì | Hệ quả |
|---|---|---|
| **1 · Quản lý gia phả** | `state.tree` + `domains/person.js` | cần **cả cây trong bộ nhớ** |
| **6 · Xuất ảnh PNG · In khổ lớn** | `xuatAnhPNG(svgEl, state.tree)` | cần **chính phần tử SVG đang vẽ** — không có sơ đồ thì không có gì để chụp |
| **7 · Nhập dữ liệu** | `state` + `domains/gedcom.js` + `domains/excel.js` | có **chế độ bổ sung vào cây đang mở** |

Nên bảng chia đôi là thế này:

| # | Khối | Đi đâu | Lý do |
|---|---|---|---|
| 1 | Quản lý gia phả *(danh sách người · gia đình)* | **Ở LẠI Cài đặt** | Biên tập **trên cây đang mở**. Dời đi là buộc trang Quản trị nạp cả cây |
| 2 | Người trung tâm mặc định | **Ở LẠI Cài đặt** | Tuỳ chọn cá nhân, lưu riêng từng tài khoản |
| 3 | Hiển thị | **Ở LẠI Cài đặt** | Thuần tuý trình bày |
| 4 | Gia phả *(chọn cây khác)* | **→ Quản trị, khu 1** | Chỉ cần `services`, **không cần cây**. Và đổi cây là việc vài tháng một lần, hậu quả rộng — không nên nằm chỗ tay chạm qua |
| 5 | Sao lưu & khôi phục | **→ Quản trị, khu 4** | Chỉ cần `services`. Vận hành dữ liệu cấp hệ thống |
| 6 | Xuất dữ liệu | **Ở LẠI Cài đặt** | Xuất ảnh là *chụp cái tôi đang nhìn*. **Không dời được** |
| 7 | Nhập dữ liệu | **Ở LẠI Cài đặt** | Chế độ bổ sung cần cây đang mở |
| 8 | Duyệt nội dung | **→ Quản trị, khu 3** | Đã ở đó rồi |
| 9 | Đơn chờ duyệt | **→ Quản trị, khu 2** | Cùng bảng `tree_members` với danh sách thành viên — gộp làm một |
| 10 | Tài khoản và quyền | **TÁCH ĐÔI** | Phần *"tài khoản của tôi"* + nút **Đăng xuất** ở lại Cài đặt. Phần *quản lý quyền người khác* → Quản trị khu 2 |

**Cài đặt từ 10 khối xuống còn 6**, và sáu khối ở lại đều đúng loại: *tuỳ chọn
của tôi* và *làm việc trên cây tôi đang mở*.

⚠ **Nói thẳng: đây ít hơn chủ dự án mong.** Câu đặt hàng là *"quản lý thì nên
đưa hết vào quản trị"*. Ba khối phải ở lại vì lý do kỹ thuật, không phải vì
lười. Muốn dời chúng thật thì phải trả lời trước một câu khác hẳn: *có chấp
nhận cho `QuanTri.html` nạp cả cây không?* — và nếu có thì lý do #2 khiến nó
là trang riêng biến mất, phải xét lại cả kiến trúc hai trang.

---

## 3. Điều hướng — thanh trái trên máy tính, hàng thẻ trên điện thoại

Chủ dự án chốt 05/09/2026. ⚠ **Khác bản ChatGPT**, bản ấy chọn một trang cuộn
dài không có điều hướng.

Lý lẽ ChatGPT đưa ra để bác thanh trái — *"`QuanTri.html` vốn là tài liệu cuộn
được, đừng phá"* — **nhầm hai thứ**. Câu ấy trong `QuanTri.html` nói về việc
trang không dùng `position:fixed; inset:0` như `index.html`, tức nói về **cách
trang cuộn**, không nói về **cách đi lại giữa các khu**. Thanh trái dùng
`position: sticky` thì trang vẫn cuộn y như cũ.

```
┌──────────────────┬────────────────────────────────┐
│ QUẢN TRỊ         │                                │
│                  │   Thành viên & quyền           │
│ ▸ Gia phả        │   ─────────────────────        │
│ ▸ Thành viên  ③ │   [bảng]                       │
│ ▸ Kiểm duyệt ⑱ │                                │
│ ▸ Sao lưu        │                                │
│                  │                                │
│ ← Về sơ đồ       │                                │
└──────────────────┴────────────────────────────────┘
```

### Ba luật của khung điều hướng

**1 · Thanh điều hướng CHÍNH LÀ dashboard.** Hai con số cần nhìn — số đơn chờ
duyệt và số thay đổi chờ kiểm duyệt — nằm ngay cạnh chỗ bấm để xử lý chúng.

> ChatGPT bác *"Dashboard tổng quan"* và nó **đúng** với dãy ô số ở đầu trang:
> số nằm một chỗ, việc nằm chỗ khác, và cùng một con số hiện ở hai nơi thì có
> ngày lệch nhau — lúc ấy không biết tin chỗ nào. Nhưng nó bác hơi rộng tay.
> Đặt số vào chính mục điều hướng thì **giữ được cả hai**: không có ô trang
> trí nào, mà cũng không mất con số nào, và mỗi số chỉ tồn tại đúng một chỗ.

**2 · Mỗi lần chỉ vẽ MỘT khu, và chỉ khu ấy gọi máy chủ.** Nối tiếp đúng lý lẽ
đã dựng nên trang này: mở khu Thành viên thì không có cớ gì gọi hàng chờ kiểm
duyệt. Mở trang lần đầu chỉ tốn **hai** lời gọi đếm cho hai con số trên thanh.

**3 · Khu đang mở ghi vào `#` của địa chỉ** — `QuanTri.html#thanh-vien`. Tải
lại trang về đúng chỗ cũ, gửi link cho nhau được, nút Back của trình duyệt
chạy đúng. Khoảng 10 dòng mã, **không cần router**.

### Trên điện thoại

Thanh trái thành **hàng thẻ ngang** ở đầu trang, tên rút ngắn:
`Gia phả · Thành viên · Kiểm duyệt · Sao lưu`.

⚠ **Không phải sáng tạo mới — `quan-tri.js` đã có sẵn đúng hàng thẻ ấy.** Hàm
`veThanhLoc()` vẽ ba tấm lọc *Chờ duyệt · Đã nhận · Đã gạt*, và `toMauLoc()`
tô đậm cái đang chọn. Dùng lại đúng ngôn ngữ hình ấy.

**Một danh sách khu, hai cách vẽ đổi bằng `@media`, KHÔNG phải hai bộ mã.**

⚠ **Không dùng ngăn kéo hamburger.** Nó phải đẻ ra lớp phủ, nút đóng, bẫy phím
— mà app này chưa có chỗ nào dùng, đến `confirm()` cũng không dùng.

---

## 4. Bốn khu

### Khu 1 — Gia phả

| | |
|---|---|
| **Mục đích** | Biết đang làm việc trên cây nào, và đổi sang cây khác |
| **Ai vào được** | Mọi người đã đăng nhập và có chân trong ít nhất một cây |
| **Dữ liệu** | `layDanhSachGiaPha()` — đã có sẵn |
| **Cột** | Gia phả · Mã · Ghi chú · Phiên bản · Cập nhật. Cây đang mở đánh dấu rõ |
| **Thao tác** | **Chọn gia phả**. Không có nút xoá gia phả |
| **Rỗng** | *"Bạn chưa có chân trong gia phả nào."* |
| **Lỗi** | *"Không tải được danh sách gia phả."* + nút **Thử lại**. ⚠ Không biến lỗi thành danh sách rỗng |

*Nút **Tạo gia phả mới** để sau — cần một hàm máy chủ chưa viết, xem mục 6.*

### Khu 2 — Thành viên & quyền

Đây là khu **xoá được nhiều câu SQL tay nhất**, nên nó làm trước.

| | |
|---|---|
| **Mục đích** | Thay hẳn việc mở SQL Editor để xem và sửa `tree_members` |
| **Ai vào được** | `quan_tri_he_thong` đầy đủ · `quan_tri` **chỉ xem** · hai vai kia không. **Máy chủ quyết** |
| **Dữ liệu** | Cần hàm mới `ds_thanh_vien()` — xem mục 6 |
| **Cột** | Email · Người được gắn *(mã + tên)* · Vai trò · Đã duyệt · Tin cậy · Tham gia |
| **Rỗng** | *"Chưa có thành viên nào trong gia phả này."* |
| **Lỗi** | *"Không tải được danh sách thành viên."* + **Thử lại** |

**Ba tấm lọc, dùng lại `veThanhLoc()`:** `Đang chờ duyệt` · `Đã duyệt` · `Tất cả`.

⚠⚠ **BA TRẠNG THÁI, KHÔNG PHẢI HAI — sửa 10/09/2026 (b110c).** Một dòng chưa
duyệt có thể là **đơn xin vào** (chờ NGƯỜI QUẢN TRỊ bấm) hoặc **lời mời** (chờ
CHÍNH NGƯỜI ẤY bấm Nhận). Bản trước gộp cả hai thành chữ *"Đang chờ"* kèm nút
*Xét đơn*, và bấm nút ấy trên một lời mời là **đưa người ta vào cây khi họ chưa
đồng ý** — lỗ hổng chủ dự án bắt được, xem `THIET-KE-NHIEU-CAY.md` mục **11.8**.

Nay: dòng lời mời mang huy hiệu *Được mời — chờ họ bấm Nhận*, **không có nút
nào**, và cột Vai trò hiện vai họ **sẽ** nhận (`moi_vai`) chứ không phải `xem`.
Con số trên tấm lọc *Đang chờ* đếm **đơn xin vào**, không đếm lời mời — nó nói
*"còn bao nhiêu việc BẠN phải bấm"*, đúng luật 1 của mục 3.

⚠ **Gộp "Đơn chờ duyệt" vào đây, không làm khu riêng.** Cả hai đọc cùng một
bảng `tree_members`; khác nhau đúng một cột `approved`. Hai màn hình cho một
bảng là hai chỗ để lệch nhau.

**Bốn thao tác mỗi dòng, đều hai nhịp** *(bấm lần đầu nút đổi chữ và đổi màu,
bấm lần nữa mới chạy — không `confirm()`)*:

| Thao tác | Vì sao phải hai nhịp |
|---|---|
| Đổi vai | Đổi được cả quyền duyệt của người khác |
| Gắn / đổi mã người | **Đổi thẳng `pham_vi_sua()`** — gắn nhầm là mở quyền sửa cho cả một nhánh |
| Bật / tắt `tin_cay` | Đổi chính sách kiểm duyệt của người ấy |
| Gỡ khỏi gia phả | Không cứu lại được bằng một cú bấm |

⚠ **Máy chủ từ chối thì nói thật, đừng tự sửa màn hình cho giống thành công:**
*"Không thực hiện được. Quyền hoặc dữ liệu đã đổi trên máy chủ."* + **Tải lại**.

#### Tấm lọc thứ tư — *Toàn hệ thống* *(b109, 09/09/2026)*

Ba tấm trên hỏi **"ai có quyền gì trong CÂY ĐANG MỞ"**. Tấm thứ tư hỏi câu
ngược lại: **"phần mềm này có những tài khoản nào, và mỗi tài khoản đứng ở đâu
trong TỪNG cây"** — nên nó liệt kê cả người đăng ký rồi bỏ đấy, thứ mà
`ds_thanh_vien()` theo định nghĩa không bao giờ thấy. Chỉ **Quản trị hệ thống**
thấy tấm này, và hàng rào nằm trong chính câu truy vấn của
`ds_tai_khoan_he_thong()`.

| | |
|---|---|
| **Mã ở đâu** | `js/pages/quan-tri/khu-tai-khoan-he-thong.js` — **file riêng**, không viết thêm vào `khu-thanh-vien.js`. Hai chế độ, hai câu hỏi, hai bảng khác cột |
| **Nối bằng gì** | `khu-thanh-vien.js` nạp nó bằng `import()` **động**; nó `import` ngược lại để dùng năm việc của `13`. Tĩnh cả hai chiều là **vòng import**, và vòng import trong ES Modules gốc không ném lỗi lúc nạp — nó để một hàm thành `undefined`, chỉ vỡ lúc ai đó bấm đúng nút ấy |
| **Cột** | Tài khoản *(+ huy hiệu QTHT / Bạn)* · Mã tài khoản · Vai trò · **Tạo gia phả** *(ô tích, b110b)* · Số cây *(kèm dòng nhỏ "n chờ · n mời")* · Xác nhận email · Đăng ký · Đăng nhập gần nhất |
| **Bảng sâu, năm việc** | ① họ tên · ② bật/tắt cờ Quản trị hệ thống · ③ **ô tích Quyền dựng gia phả** *(b110b)* · ④ bảng các cây + năm việc của `13` theo từng dòng *(hoặc Duyệt/Từ chối nếu là đơn đang chờ)* · ⑤ mời thẳng vào một cây · ⑥ xoá hẳn tài khoản, gõ lại email |
| **⚠ Hai việc KHÔNG hỏi cây** | Cờ Quản trị hệ thống và ô tích Quyền dựng gia phả là cờ ở tầng **tài khoản** — chúng đứng cạnh nhau, TRƯỚC mọi việc theo cây, và nhãn của chúng tự khai *"cả hệ thống, không chọn cây"*. Mọi việc còn lại phải gọi tên cây, xem mục 5a |
| **Khoá trên dòng của chính mình** | Ba việc: cờ QTHT · mời · xoá. Cộng nút mở năm việc trong bảng cây. **Khoá sẵn kèm lý do, không mở ra rồi mới giải thích** |
| **⚠ Lời mời không có nút** | Dòng *"được mời"* không có thao tác nào — nhận hộ người khác là bỏ mất chữ ký thứ hai |

⚠ **Khu này KHÔNG phá ranh giới mục 1** — kể cả sau b109b. Ô *mã người* ở
form Mời nay CÓ gợi ý, nhưng nó đi bằng `tim_nguoi_trong_cay()`: một hàm
`security definer` **lọc ở máy chủ, trần 10 dòng**, gác bằng
`co_the_quan_tri()`. Trang này vẫn không giữ một danh sách người nào trong bộ
nhớ. Ngày nào có ai thấy mình sắp nạp cả cây về "cho tiện lọc" thì dừng lại
đọc lại mục 1 — cây thật có 681 người.

### Khu 3 — Kiểm duyệt

Giữ nguyên bản chất và gần như nguyên giao diện hiện có (`quan-tri.js` 0.1.0).
Ba tấm lọc, mỗi dòng một **lần bấm Lưu**, hai nút *Duyệt* và *Từ chối và hoàn tác*.

**Thêm đúng một thứ: mở rộng một dòng để xem TRƯỚC/SAU.**

⚠ ChatGPT dừng lại ở đây và nói *"cần xem SQL hiện có trước khi thiết kế"*. Đã
đọc `03-ham-luu-cay.sql` khối *chụp ảnh*, nên trả lời được:

`change_log.truoc` có hình:

```
{ persons:        [ {id: 'P0012', cu: {…cả dòng cũ…} }, … ],
  unions:         [ {id, cu}, … ],
  union_children: [ {id, cu}, … ],
  media:          [ … ],  sources: [ … ],
  tree:           {name, root_person_id, note}  hoặc null,
  imports_moi:    [ … ] }
```

`cu` là **cả dòng cũ**, hoặc `null` nếu lần Lưu ấy vừa đẻ ra bản ghi.

Nên **không cần thêm cột `sau`** vào `change_log`. Giá trị *sau* chính là **dòng
hiện tại trong bảng** — và điều đó chỉ đúng khi chưa lần Lưu nào sau đó đụng
vào, mà `dung_do_sau()` đã trả lời sẵn câu ấy. Hàm chi tiết phải gọi nó và:

- **chưa ai đụng** → hiện *trước → sau* bình thường;
- **đã có người đụng** → hiện đúng câu *"Người sau đã sửa tiếp, cột SAU dưới
  đây là trạng thái hôm nay chứ không phải kết quả của lần Lưu này"*, và nút
  hoàn tác phải mờ đi kèm lý do.

⚠ **Không nhồi `truoc` vào `ds_kiem_duyet()`.** Nó nặng; chỉ lấy khi người dùng
mở một dòng. Thiết kế hiện tại đúng, đừng "sửa cho gọn".

**Rỗng:** *"Không có mục nào đang chờ kiểm duyệt."* — với hai lọc kia thì
*"Chưa có lần Lưu nào ở trạng thái này."* Không vẽ bảng trống.

### Khu 4 — Sao lưu & khôi phục

| | |
|---|---|
| **Ai vào được** | **Chỉ `quan_tri_he_thong`.** Không cho `quan_tri` |
| **Hiện gì** | Lần sao lưu gần nhất *(ngày giờ · tên file · dung lượng · đạt/hỏng)* |

**Và khối *Số đếm đối chiếu*** — đây là chỗ mấy con số ChatGPT gạt đi tìm được
việc thật để làm:

```
Hôm nay          Bản sao lưu 05/09 03:00
persons     681       681
unions      273       273
union_children  412   412
tree_members  42       42
change_log   1.284   1.281      ← lệch 3, đúng: sau khi sao lưu có 3 lần Lưu
```

⚠ **Đây không phải trang trí, nó là con chim hoàng yến trong hầm mỏ.** Cả dự
án này kiểm chứng bằng bảng đối chiếu số đếm — di dời dữ liệu 04/09 khớp *7/7
dòng*, và chính bảng ấy **là** phép kiểm; `09-doi-ma-vai.sql` cũng thế. Ngày
nào `persons` đọc ra 640 là biết ngay, chứ không đợi tới lúc ai đó mở sơ đồ
thấy thiếu ông nội mình.

Giá phải trả: **một hàm RPC rẻ** trả 5 con số. Không phá luật *"trang Quản trị
không nạp cả cây"* — nó trả năm số, không trả 681 dòng.

⚠ **KHÔNG vẽ nút "Khôi phục" khi máy chủ chưa khôi phục được.** Đây là chỗ
ChatGPT nói đúng và phải giữ nguyên: *"không giả vờ giải quyết bằng giao diện"*.
Hôm nay chưa ai thử khôi phục lần nào — có file sao lưu **không** đồng nghĩa
khôi phục được. Khu này ban đầu chỉ **hiện trạng thái**, và nói thẳng một câu:
*"Sao lưu không chép nội dung ảnh, chỉ ghi tên và dung lượng."*

---

## 5. Bảng quyền

| Thao tác | `quan_tri_he_thong` | `quan_tri` | `sua` | `xem` |
|---|:---:|:---:|:---:|:---:|
| Mở `QuanTri.html` | ✓ | ✓ | ✓ | ✓ |
| Khu 1 · xem danh sách gia phả | ✓ | ✓ | ✓ | ✓ |
| Khu 1 · chọn gia phả | ✓ | ✓ | ✓ | ✓ |
| Khu 2 · xem thành viên | ✓ | ✓ | ✗ | ✗ |
| Khu 2 · đổi vai | ✓ | ✗ | ✗ | ✗ |
| Khu 2 · gắn / đổi mã người | ✓ | ✗ | ✗ | ✗ |
| Khu 2 · bật / tắt `tin_cay` | ✓ | ✗ | ✗ | ✗ |
| Khu 2 · duyệt / từ chối đơn vào họ | ✓ | ✗ | ✗ | ✗ |
| Khu 2 · ⚠ duyệt một **LỜI MỜI** chưa ai nhận | ✗ | ✗ | ✗ | ✗ |
| Khu 2 · gỡ thành viên | ✓ | ✗ | ✗ | ✗ |
| Khu 3 · xem hàng chờ | ✓ | ✓ | ✗ | ✗ |
| Khu 3 · xem chi tiết trước/sau | ✓ | ✓ | ✗ | ✗ |
| Khu 3 · duyệt · từ chối và hoàn tác | ✓ | ✓ | ✗ | ✗ |
| Khu 4 · xem trạng thái sao lưu | ✓ | ✗ | ✗ | ✗ |
| Khu 2 · bật/tắt cờ **Quản trị hệ thống** | ✓ | ✗ | ✗ | ✗ |
| Khu 2 · tích **Quyền dựng gia phả** *(b110b)* | ✓ | ✗ | ✗ | ✗ |

Vai máy `sao_luu` **không dùng giao diện** — nó là script chạy đêm, không có
người ngồi sau để bấm nút.

## 5a. Luật gọi tên cây — chốt 09/09/2026 (b110b)

> *"khi gán quyền, không nên ngầm định gán quyền cho cây đang hoạt động mà cần
> luôn luôn xác định người nào, cây nào, quyền gì."* — chủ dự án

**Không màn hình nào của trang này được ngầm định "cây đang mở".** Một người
có thể dựng nhiều cây, nên câu *"sửa quyền của X"* mà không nói cây nào là một
câu chưa đủ nghĩa — và với nhiều cây thì nó là đổi quyền nhầm chỗ, im lặng.

Chỗ thi hành luật này **không phải câu chữ mà là chữ ký hàm**:

```
veBangViec(t, treeId, …)   →   veBangViec(t, cay, …)
veXetDon  (t, treeId, …)   →   veXetDon  (t, cay, …)
                                cay = { treeId, ten, maCay }
```

Chừng nào tham số còn là `treeId` trần thì nơi gọi còn phải tự bịa một cái
nhãn, và bản 0.7.0 đã bịa đúng như thế (`'Gia phả đang mở'`). Kèm theo:

- mỗi bảng việc mở đầu bằng `dongCay()` — *"Gia phả bị tác động: <tên> · <mã>"*;
- tiêu đề khung và câu giải thích của mỗi việc gọi đúng tên cây ấy;
- ba tấm lọc cây có một dòng *"Đang xét quyền trong: …"* dưới dòng danh tính;
- ô chọn gia phả ở form **Mời** mở ra ở mục trống, nút Gửi khoá tới khi chọn.

**Ngoại lệ, và chỉ có hai** — hai cờ ở tầng tài khoản (mục 4, khu 2). Chúng
không hỏi cây nào vì câu ấy không có câu trả lời, và nhãn của chúng phải tự
khai điều đó.

---

⚠ **Mọi ô trong bảng này là mô tả hành vi máy chủ, KHÔNG phải hàng rào.** App
hỏi máy chủ chỉ để hiện một câu giải thích tử tế thay vì một cái bảng trống.
Ai gõ thẳng địa chỉ cũng mở được trang, và cũng chỉ nhận về mảng rỗng.
**Không có `if (vaiTro === …)` nào quyết định bảo mật.**

---

## 6. Hàm máy chủ còn thiếu

### Chắc chắn cần — `luoc-do/10-quan-ly-thanh-vien.sql`

| Hàm | Tham số | Trả về | Ai gọi được |
|---|---|---|---|
| `ds_thanh_vien` | `p_tree` | `table(user_id, email, role, person_id, person_name, approved, tin_cay, xin_luc, loi_nhan, added_at)` | 2 hạng quản trị |
| `doi_vai_thanh_vien` | `p_tree, p_user_id, p_role` | `jsonb` | chỉ `quan_tri_he_thong` |
| `gan_nguoi_cho_thanh_vien` | `p_tree, p_user_id, p_person_id` | `jsonb` | chỉ `quan_tri_he_thong` |
| `dat_tin_cay_thanh_vien` | `p_tree, p_user_id, p_tin_cay` | `jsonb` | chỉ `quan_tri_he_thong` |
| `go_thanh_vien` | `p_tree, p_user_id` | `jsonb` | chỉ `quan_tri_he_thong` |

Bốn điều mỗi hàm phải tự canh trong thân hàm:

1. Người gọi đúng vai — **hỏi `co_the_quan_tri()`**, đừng viết lại phép kiểm.
2. ⚠ **`null not in (…)` cho ra `null`, không cho ra `true`.** Đúng cái bẫy đã
   mở một lỗ leo quyền thật trong `duyet_thanh_vien()` ngày 04/09 — bộ kiểm 57
   phép báo xanh trên chính cái mã thủng ấy. Mọi phép kiểm vai phải hỏi `null`
   trước.
3. Vai mới phải thuộc tập hợp lệ, và **không cho đặt `sao_luu` từ giao diện**.
4. `go_thanh_vien` **chỉ xoá dòng trong `tree_members`**, tuyệt đối không đụng
   `auth.users`.

### ✓ ĐÃ CÓ — `luoc-do/15-tim-kiem.sql` (b109b, 09/09/2026)

| Hàm | Tham số | Trả về | Ai gọi được |
|---|---|---|---|
| `tim_tai_khoan` | `p_tree, p_chuoi` | `table(user_id, email, ho_ten, ma_ngan, person_id, ten_nguoi, trang_thai)`, **trần 8 dòng** | `co_the_quan_tri()` — đúng hàng rào của `moi_vao_cay()` |
| `tim_nguoi_trong_cay` | `p_tree, p_chuoi` | `table(id, ten, nam_sinh, nam_mat, gioi, gan_cho_email)`, **trần 10 dòng** | `co_the_quan_tri()` |
| `dat_ho_ten_tai_khoan` | `p_user, p_ho_ten` | `jsonb` | chỉ Quản trị hệ thống |
| `bo_dau` · `ten_day_du` | `text` · `jsonb` | `text` | ai cũng gọi được — hàm thuần, không đọc bảng |

Ba điều file ấy canh, và cả ba đều có phép đo mượn danh nghĩa
(`kiem-thu/ban-thu-sql/do-b109b.mjs`, 36 phép):

1. **Gác bằng đúng hàng rào của nút nó phục vụ.** Quản trị gia phả *được
   phong* KHÔNG dò được danh bạ — họ cũng không mời được ai.
2. **Không `like` một chỗ nào**, chỉ `position()`. Một chữ `%` trong ô gõ mà
   đi vào mẫu `like` là lấy về tám dòng đầu của cả danh bạ.
3. **Trần số dòng nằm trong hàm**, không ở trình duyệt.

### ✓ ĐÃ CÓ — `luoc-do/17-quyen-tao-cay.sql` (b110b, 09/09/2026)

| Hàm | Tham số | Trả về | Ai gọi được |
|---|---|---|---|
| `dat_duoc_tao_cay` | `p_user, p_bat` — ⚠ **KHÔNG có `p_tree`** | `jsonb` | chỉ Quản trị hệ thống, và **không cho tự trỏ vào mình** |

Cờ này là **cửa thứ bảy** của luật *không ai tự đặt quyền cho mình*, và nó ở
tầng TÀI KHOẢN — `THIET-KE-NHIEU-CAY.md` mục **11.7** kể vì sao nó phải tách
khỏi vai Quản trị gia phả. Đo: `ban-thu-sql/do-b110b.mjs`, 29 phép, 3 kiểm
chứng ngược.

### Cần cho khu 3 và khu 4

| Hàm | Trả về | Ghi chú |
|---|---|---|
| `chi_tiet_kiem_duyet(p_tree, p_id)` | `jsonb` gồm `truoc`, `sau`, và kết quả `dung_do_sau()` | Xem cách dựng `sau` ở khu 3 |
| `dem_du_lieu(p_tree)` | `jsonb` — 5 con số đếm | Cho khối *Số đếm đối chiếu* |

### Chưa chốt, đừng viết vội

- `tao_gia_pha_moi()` — cây mới phải sinh ra **kèm người quản lý**, không được
  đẻ ra một `trees` trơ trọi không ai vào được.
- Nhập GEDCOM/Excel — file có thể lớn, RPC dạng JSON chưa chắc hợp. Và khối
  nhập đang ở lại `index.html` (mục 2), nên chưa cần.
- Khôi phục — Apps Script mới là hệ thống sao lưu thật. **Một RPC SQL không đọc
  được Google Drive**, đừng thiết kế như thể đọc được.

---

## 7. Những gì cố ý KHÔNG làm

1. **Không có dãy ô số ở đầu trang.** Số nằm cạnh việc — trên chính mục điều hướng.
2. **Không đẻ bảng "nhật ký hoạt động" riêng.** `change_log` đã là nhật ký kiểm toán.
3. **Không đẻ bảng `membership_requests`.** Hàng chờ là `tree_members.approved = false`.
4. **Không đụng `branches` / `branch_access`.** Luật trực hệ đã thay chỗ.
5. **Không dựng phân quyền bằng JavaScript.** Máy chủ là hàng rào duy nhất.
6. **Không nhồi `truoc` vào `ds_kiem_duyet()`.**
7. **Không cho sửa từng ô trong màn kiểm duyệt.** Đơn vị là **một lần bấm Lưu**.
8. **Không dựng kho chờ.** Luật đã chốt: ghi thật trước, treo cờ sau.
9. **Không giấu người còn sống trong phiên này.** Bài toán khác — RLS lọc theo
   *dòng*, việc ấy phải lọc theo *cột*. ⚠ Và tuyệt đối **không giải bằng cách
   tải hết về rồi để JavaScript che** — như thế dữ liệu đã lọt xuống trình duyệt.
10. **Không SPA, không router, không framework, không thư viện UI.**
11. **Không dời khối 1, 6, 7 khỏi Cài đặt** — mục 2 nói vì sao.

---

## 8. Hình mã

```
QuanTri.html
    └── js/app-quan-tri.js          ← điểm khởi động, giữ mỏng
            └── js/pages/quan-tri/
                    khung.js        ← thanh điều hướng · `#` địa chỉ · hai con số
                    khu-gia-pha.js
                    khu-thanh-vien.js
                    khu-kiem-duyet.js   ← `quan-tri.js` hiện nay chuyển vào
                    khu-sao-luu.js
                        └── services/sb.js
```

⚠ **Mỗi khu một file, không dồn cả trang vào một JS.** `settings.js` đã phình
tới 1429 dòng vì đi đường ngược lại, và chính điều đó đẻ ra việc xẻ đôi hôm nay.

⚠ **`quan-tri.js` hiện nay ĐỔI TÊN thành `khu-kiem-duyet.js`** — đây là **đổi
tên file mã**, việc phải hỏi chủ dự án trước (`CLAUDE.md` mục 9). Hỏi ở bước
b100, đừng tự làm.
