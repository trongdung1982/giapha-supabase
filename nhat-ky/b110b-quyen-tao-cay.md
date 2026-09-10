# b110b — Quyền dựng cây tách riêng · không đâu ngầm định cây

*09/09/2026 23:30 → 10/09/2026 00:40*

---

## Chủ dự án đặt hàng

> *"vì một người chủ cây gia phả có thể tạo nhiều cây gia phả vì vậy khi gán
> quyền, không nên ngầm định gán quyền cho cây đang hoạt động mà cần luôn luôn
> xác định người nào, cây nào, quyền gì. riêng quản trị hệ thống, khi gán
> quyền quản trị hệ thống cho người khác mới không cần chọn cây cần áp dụng.
> quyền tạo cây cần tách riêng khỏi quyền quản trị gia phả, ở các bảng có liên
> quan đến tài khoản cần thêm 1 cột quyền tạo cây gia phả, muốn gán quyền cho
> ai thì tích vào là xong, đây là đặc quyền của tài khoản quản trị hệ thống."*

## Làm gì

- `luoc-do/17-quyen-tao-cay.sql` — hàm `dat_duoc_tao_cay(p_user, p_bat)`,
  **cửa thứ BẢY** của luật *không ai tự đặt quyền cho mình*.
- `sb.js` 0.14.0 — `datDuocTaoCay()`, và `layPhien()` mang thêm `tenCay`·`maCay`.
- `khu-tai-khoan-he-thong.js` 0.5.0 — cột **Tạo gia phả** (ô tích, một nhịp);
  hàng *Quyền dựng gia phả* trong bảng sâu; form Mời thôi chọn sẵn cây.
- `khu-thanh-vien.js` 0.8.0 — `veBangViec()`/`veXetDon()` nhận **đối tượng
  cây** thay cho `treeId` trần; `dongCay()` đứng đầu mọi bảng việc.
- `khu-gia-pha.js` 0.7.1 — chỉ đổi chữ trong hộp *Dựng gia phả mới*.
- `kiem-thu/ban-thu-sql/do-b110b.mjs` *(ngoài repo)* — 29 phép, 12 hàng rào,
  3 kiểm chứng ngược.
- `kiem-trang-quan-tri.mjs` 190 → **214** (PHẦN J + G14–G16).

---

## VÌ SAO

### 1. Cột `duoc_tao_cay` có từ b102 mà không hàm nào đặt được

Bảy bước liền, đường duy nhất cấp quyền dựng cây là mở SQL Editor gõ `update`
tay. Không ai để ý, vì `ds_tai_khoan_he_thong()` **vẫn trả cột ấy về đều đặn**
— chỉ là không màn hình nào đọc.

**Một cột đọc được mà không ghi được là kiểu thiếu không có triệu chứng.** Nó
không ném lỗi, không để lại chỗ trống trên màn hình, và bảng tự kiểm của `11`
vẫn báo cột tồn tại. Chỉ có người đi tìm cái nút mới phát hiện ra không có nút.

### 2. Vì sao phải TÁCH quyền dựng cây khỏi vai Quản trị gia phả

Đây là phần đắt nhất của yêu cầu, và nó không hiển nhiên. Gộp hai hạng lại mở
một đường leo thang **không ai nhìn thấy**:

> Người được phong Quản trị gia phả của cây A mà dựng được cây riêng thì trong
> cây riêng ấy **họ là chủ cây** — tức tự cấp cho mình đúng cái quyền đổi
> quyền mà `13` mục 8 dựng cả một luật để chặn.

Không có triệu chứng nào trên màn hình. Nó chỉ lộ ra khi ai đó đọc lại bảng
`trees` và hỏi *"cây này ở đâu ra?"*.

### 3. Chỗ sửa THẬT của luật "luôn nói rõ cây nào" là CHỮ KÝ HÀM

Bản đầu tôi định sửa câu chữ: thêm tên cây vào mấy dòng giải thích. Sai hướng.

`veBangViec(t, treeId, …)` nhận một chuỗi uuid, và **một chuỗi uuid không tự
nói nó là cây nào**. Nên mọi nơi gọi đều đứng trước cùng một cám dỗ: truyền
cây đang mở rồi để màn hình tự bịa một cái nhãn. Bản 0.7.0 đã bịa đúng như
thế — chuỗi `'Gia phả đang mở'` viết cứng trong mã.

Đổi tham số thành `{treeId, ten, maCay}` thì **lời gọi thiếu tên cây không
viết ra được nữa**. Đó là khác biệt giữa một quy ước và một hàng rào.

### 4. Ô tích MỘT NHỊP, khác năm việc kia

Chủ dự án đặt hàng đúng chữ *"tích vào là xong"*. Năm việc của `13` đều hai
nhịp, nên phải nói rõ vì sao chỗ này khác — và lý do phải là lý do thật, không
phải chiều ý:

> Bấm nhầm ở đây cho người ta dựng một cây **rỗng của riêng họ**, không đụng
> một dòng nào của gia phả nào đang có, và tích lại một cái là xong. Nhịp thứ
> hai để dành cho việc **lùi lại không được**.

Cùng lý lẽ ấy quyết luôn: ô tích **không** gọi `napLai()`. Vẽ lại cả khu sau
mỗi cú tích là cuộn màn hình về đầu và đóng bảng sâu đang mở — người đang cấp
quyền cho ba người liền phải mở lại ba lần.

### 5. KHÔNG có phép "không tắt được người cuối cùng"

`dat_quan_tri_he_thong()` có phép ấy. Cờ này thì không, và đó là chủ ý: tắt
hết Quản trị hệ thống là khoá cả nhà rồi vứt chìa; tắt hết `duoc_tao_cay` thì
Quản trị hệ thống **vẫn dựng được cây** qua nhánh khác của `duoc_tao_cay()`.
Thêm một phép đếm ở đó là thêm một câu từ chối không bảo vệ điều gì.

---

## Đã thử mà hỏng

### HR3 báo ĐẠT trên một hàm không có hàng rào nào

Phép đo `gan_nguoi_cho_thanh_vien()` bản đầu dùng mã `P0012` và báo ĐẠT. Đọc
thân hàm thì nó **không hỏi `moi_boi` một chữ nào** — nó bị chặn bởi chỉ mục
`unique (tree_id, person_id)` vì `P0012` đã gắn cho tài khoản khác.

*(Chuyện này xảy ra ở b110c, chép sang đây vì nếp rút ra áp cho cả hai bước.)*

**Nếp:** một phép đo chặn-được phải dùng dữ liệu mà **không ràng buộc nào
khác** chặn hộ. Cùng họ với bài học b94 — một phép xanh trên mã thủng.

### Bảng tự kiểm suýt đo sai lần nữa

Phép "cột `duoc_tao_cay` đổi THẬT" đọc lại bảng dưới danh nghĩa Quản trị hệ
thống và ra `(KHÔNG CHẠY ĐƯỢC)`. Không phải hàm hỏng: RLS của `tai_khoan` là
`using (user_id = auth.uid())`, nên **không ai đọc được dòng của người khác**.
Câu hỏi ở đó là *"cột có đổi thật không"*, không phải *"ai đọc được cột"* —
phải chạy bằng `postgres`. Đúng họ với `do-b105`.

### ⚠⚠ 17 tấm ảnh ra nền trơn suốt một bước, không ai báo

Chạy `xem-khung-quan-tri.mjs` thì **cả 17 ảnh** ra nền trơn không một chữ.
Không phải lỗi của b110b: từ **b110**, `kiem-thu/sb-gia.mjs` thiếu sáu cửa
thùng rác mà `khu-gia-pha.js` `import`.

ES Modules **không tha một `import` thiếu** — cả mô-đun ném `SyntaxError` ngay
lúc nạp, `mountKhung()` không chạy, và trang chỉ còn màu nền của CSS. Trông y
hệt một trang chưa vẽ xong.

**Vì sao nó đứng im cả một bước:** bộ bất biến văn bản không mở trình duyệt
nên nó xanh suốt; còn phép *"nhìn bằng mắt"* thì có công cụ nhưng **không ai
nhìn**. Một công cụ chỉ có giá trị bằng số lần nó thật sự được chạy.

**Nếp:** thêm một cửa vào `sb.js` thì thêm cả ở `sb-gia.mjs`, cùng lúc. Đã ghi
thành một dòng cảnh báo ở `CHI-DAN.md`.

### `kq-5.png` chụp một cái bảng trơn từ b106

Dòng đầu bảng là dòng của chính người đang đăng nhập, nút *Sửa quyền* ở đó
khoá sẵn từ b106 — nên `?mo=Sửa quyền` bấm vào một nút `disabled` và không mở
gì. Tấm ảnh ấy thôi đo được thứ nó sinh ra để đo, và cũng không ai để ý. Đổi
sang `Sửa quyền#2`.

### Ba lần rewrap `CHI-DAN.md` mà không giảm được dòng nào

Trần cứng 80 dòng. Tôi sửa ba lần liền, lần nào cũng thay N dòng bằng N dòng
rồi ngạc nhiên vì `wc -l` không đổi. **Muốn bớt một dòng thì phải bớt CHỮ**,
không phải xuống dòng chỗ khác.

---

## Còn treo

- ⏳ `15` bản 0.2.0 vẫn **chưa dán** (cột `vai_cao_nhat`).
- Ô tích *Tạo gia phả* chưa ai bấm thử trên máy chủ thật *(đóng ở b110c —
  chủ dự án dán `17` và cấp quyền cho `thu-h9@nguyentrongbac.io.vn` sáng
  10/09, đã dựng được cây mới)*.

---

## File đã đụng tới

**Mới**
- `luoc-do/17-quyen-tao-cay.sql`
- `kiem-thu/ban-thu-sql/do-b110b.mjs` *(ngoài repo)*

**Sửa**
- `js/services/sb.js` → 0.14.0
- `js/pages/quan-tri/khu-thanh-vien.js` → 0.8.0
- `js/pages/quan-tri/khu-tai-khoan-he-thong.js` → 0.5.0
- `js/pages/quan-tri/khu-gia-pha.js` → 0.7.1 *(chỉ đổi chữ)*
- `kiem-thu/kiem-trang-quan-tri.mjs` → 0.5.0, 190 → 214 phép
- `kiem-thu/sb-gia.mjs` *(ngoài repo)* — thêm 6 cửa thiếu của b110
- `kiem-thu/xem-khung-quan-tri.mjs` *(ngoài repo)* — `kq-5` đổi mục tiêu
- `CHI-DAN.md` · `KE-HOACH.md` · `DU-LIEU.md` ·
  `THIET-KE-QUAN-TRI.md` · `THIET-KE-NHIEU-CAY.md` *(mục 11.7)*

**Chép nguyên / xoá:** không có.
