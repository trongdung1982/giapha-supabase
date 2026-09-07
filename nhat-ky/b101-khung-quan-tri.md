# b101 — Khung điều hướng trang Quản trị, bốn khu

*07/09/2026 20:10*

---

## Việc đã làm

1. **Rà bản thử của Antigravity** trong `codex/giapha-supabase-b101/` — AGY đã
   dựng sẵn b101→b105 ngoài repo, chủ dự án đã bấm thử và duyệt bản b101 hôm
   06/09. Phiên này chỉ tích hợp **b101**, bốn bước kia để lại nguyên chỗ cũ.
2. **Đổi tên** `js/pages/quan-tri.js` → `js/pages/quan-tri/khu-kiem-duyet.js`,
   và `mountQuanTri()` → `mountKhuKiemDuyet()`.
3. **File mới `js/pages/quan-tri/khung.js`** — thanh bốn khu, khu đang mở ghi
   vào `#` địa chỉ, hai con số đếm trên thanh.
4. **File mới `quan-tri.css`** — bố cục khung; `@media 680px` đổi thanh trái
   thành hàng thẻ ngang.
5. **Bộ kiểm** `kiem-trang-quan-tri.mjs` thêm PHẦN F (16 phép) và ba phép kiểm
   chứng ngược — **71 đạt, 0 hỏng**.
6. **Bản giả để nhìn bằng mắt** — `kiem-thu/xem-khung-quan-tri.mjs` (mới) chụp
   bốn ảnh `kq-0..3.png`; `sb-gia.mjs` và `trang-quan-tri-gia.html` trỏ sang
   khung mới. Ba chỗ hỏng chỉ ảnh chụp mới bắt được (xem dưới).
7. **Đẩy lên GitHub** — commit `041b2a5`, Pages dựng xong, ba file mới trả 200.
8. **Chủ dự án bấm thử trên app thật** (`nguyentrongbac.io.vn/QuanTri.html`) —
   bốn mục, `F5`, nút Back, điện thoại: **đạt cả bốn**.

---

## Vì sao chọn cách này

### Vì sao đổi tên `quan-tri.js`, dù AGY đề nghị giữ nguyên

Bản thử của AGY để `khung-b101.js` gọi thẳng `../quan-tri.js`. Ít việc hơn, ít
rủi ro gãy import hơn — và đúng cho một bản thử.

Nhưng sau b101 còn ba khu nữa, và cả ba sẽ nằm trong `js/pages/quan-tri/`. Để
một file `quan-tri.js` đứng ngoài cạnh chính thư mục `quan-tri/` là dựng sẵn
một chỗ để đọc nhầm: hai đường dẫn khác nhau một dấu gạch chéo, cùng nói về
cùng một trang. `KE-HOACH.md` đã ghi tên `khu-kiem-duyet.js` từ b99; chủ dự án
chốt theo kế hoạch.

Cái giá phải trả là ba đường dẫn `import` trong chính file ấy phải lùi một bậc
(`../services/` → `../../services/`). Bộ kiểm bắt được nếu sai — file không nạp
được thì `readFileSync` ném lỗi ngay dòng đầu.

### Vì sao CSS nằm ở file riêng, không nhúng vào `QuanTri.html`

Lần đầu tôi nhúng thẳng vào khối `<style>` sẵn có của `QuanTri.html` — nhất
quán với `index.html`, và không thêm file nào lên mạng.

Rồi đến lúc dựng bản giả để nhìn bằng mắt thì luật ấy tự bẻ chính nó.
`kiem-thu/trang-quan-tri-gia.html` nằm **ngoài repo** (mọi file thả vào
`supabase/` đều đi lên mạng) và nó không phải là `QuanTri.html` — nên nó không
có khối `<style>` kia. Hai đường đi tiếp:

- chép CSS sang bản giả → **hai bản**, và hai bản thì có ngày lệch nhau. Lúc
  ấy cái nhìn thấy trong ảnh chụp không còn nói được gì về trang thật.
- tách CSS ra `quan-tri.css`, cả hai trang cùng nạp → **một nguồn**.

Chọn cách hai. Đây là cùng một lý lẽ đã dựng nên `sb-gia.mjs`: bản giả chỉ có
giá trị khi nó chạy đúng cái mã của app, không phải một bản sao của nó.

### Vì sao khung không được hỏi màn hình rộng bao nhiêu

Thiết kế chốt *"một danh sách khu, hai cách vẽ đổi bằng `@media`, KHÔNG phải
hai bộ mã"*. Ở đây điều đó thành một luật kiểm được: `khung.js` không được
chứa `innerWidth` hay `matchMedia`.

Lý do không phải là thẩm mỹ. Một nhánh `if (window.innerWidth < 680)` hôm nay
đúng, và lệch dần từ lần sửa thứ hai trở đi — vì không có gì bắt hai chỗ ấy
phải sửa cùng nhau. Đặt trọn chỗ biết bề ngang vào `quan-tri.css` thì chỉ có
đúng một chỗ để sửa.

### Vì sao `#` lạ phải sửa bằng `replaceState`, không gán lại `location.hash`

Gõ nhầm `#linh-tinh` thì khung về khu đầu và sửa luôn thanh địa chỉ. Cách viết
tự nhiên là `window.location.hash = khu.ma` — và nó sai hai lần:

1. Gán vào `location.hash` **đẻ ra một `hashchange` nữa**, tức vẽ khu hai lần.
2. Nó **thêm một mục vào lịch sử**, nên nút Back quay về đúng cái `#` hỏng vừa
   bỏ đi — người dùng bấm Back và thấy mình bị đẩy tới lui.

`history.replaceState` không làm cả hai. Phép G8 trong bộ kiểm bẻ đúng chỗ ấy
rồi kiểm lại.

### Ba chỗ hỏng chỉ ảnh chụp mới bắt được

Bộ kiểm đọc văn bản báo xanh cả 71 phép trong khi màn hình còn ba lỗi. Đây là
đúng cái ký ức *"kiểm bố trí hình phải nhìn bằng mắt"* nói — bất biến bắt
"không sai", không bắt "hình xấu nhưng hợp lệ":

1. **Hai lối *← Về sơ đồ* trên cùng một màn hình.** Khu Kiểm duyệt vốn là cả
   một trang nên nó tự vẽ lối về ở chân; nay thanh điều hướng cũng có một cái.
   Người dùng phải chọn giữa hai thứ giống hệt nhau. Bỏ cái ở chân.
2. **Tựa khu Kiểm duyệt thụt vào 18px** so với tựa ba khu kia. Cùng nguyên
   nhân: nó từng tự căn giữa mình trong `max-width:1000px` với lề riêng. Bỏ
   cả trần lẫn lề — ô bên phải của khung đã lo đúng việc ấy.
3. **Giờ trong ghi chú đầu file sai.** Tôi ghi 19:45 / 20:10 / 20:20 theo mạch
   chuyện trong phiên; đồng hồ máy là 19:33. Đọc bằng lệnh `date` rồi sửa cả
   bảy file. Đúng cái ký ức *"đọc đồng hồ bằng lệnh date"* đã cảnh báo, và là
   lần thứ ba.

Hai lỗi đầu đều **nảy sinh từ chính việc nhúng**: một màn hình vốn là cả trang
nay thành một khu, nên mọi thứ nó tự lo cho mình lúc còn là trang đều thành
thừa. Đó là thứ cần soát mỗi lần đưa một khu nữa vào khung — b103 và b106 sẽ
gặp lại y hệt.

### Vì sao KHÔNG làm nút "Tông màu" và 10 phối màu trong phiên này

Bản thử của AGY có thêm một bộ chọn 10 phong cách phối màu (258 dòng JS + 597
dòng CSS), và chủ dự án đã bấm thử duyệt hôm 06/09.

Nó không nằm trong điểm dừng b101. Khung là **nền cho b103 → b108**: sai ở đây
thì mọi khu xây lên trên đều sai theo, và không có gì báo lỗi. Trộn thêm 855
dòng trang trí vào cùng một điểm dừng là làm cho điểm dừng ấy khó kiểm.

Chủ dự án chốt để lại. Mã vẫn nằm nguyên trong `codex/`, không mất.

---

## Đã thử mà hỏng

**Heredoc Bash nuốt `\n` trong chuỗi Python.** Script sửa bộ kiểm dùng
`"console.log('\\nPHẦN C…')"` — trong file `.mjs` đó là hai ký tự `\` + `n`,
nhưng qua heredoc nó thành một dấu xuống dòng thật, nên phép so chuỗi trượt.

Chữa bằng cách ghi script ra file rồi chạy file — đúng nếp `heredoc-bash-hong-
voi-file-dai` đã ghi. Thêm một nếp nữa cho lần sau: **trong Python, viết `\n`
văn bản bằng `chr(92) + 'n'`**, không dựa vào việc đếm dấu chéo ngược qua ba
lớp nháy.

Điều cứu được phiên này là mọi script sửa hàng loạt đều **gom lỗi vào một danh
sách rồi mới ghi file** — trượt một phép thì không phép nào được ghi. Nếu ghi
dần từng phép thì lần trượt ấy đã cắt nát bộ kiểm và làm mất luôn năm phép sửa
đúng trước nó, đúng ca `python-cp1252-tren-may-nay`.

---

## Còn treo

- **Bốn bước b102→b105 của AGY vẫn nằm ngoài repo**, trong `codex/`. Chủ dự án
  đã dán SQL của cả bốn lên **Supabase Staging** (`uheeqpjfpprxjdqgcevf`) và
  xác nhận đạt, nhưng **máy chủ thật chưa có gì**, và repo chính chưa nhận một
  dòng nào. Đây là việc lớn nhất đang chờ.
- **Cột *Việc* trong khu Kiểm duyệt còn sơ sài** — chủ dự án nêu 07/09/2026.
  Đó đúng là việc của **b107** (bảng phẳng TRƯỚC/SAU). Không vá câu `note` cho
  dài ra: nó viết lúc Lưu nên chỉ đoán được những gì màn hình sửa biết khi ấy,
  và b107 sẽ khiến nó thành thừa.
- **Ba khu còn lại hiện câu "chưa làm"** — Gia phả (b103), Thành viên (b105 ·
  b106), Sao lưu (b108).
- **Bộ bất biến bố cục vẫn gác nhánh Apps Script.** Không đổi ở bước này; hai
  bản `domains/` vẫn giống nhau bit-với-bit (10/10).

---

## File đã đụng tới

### Mới — trong repo `supabase/`

| File | Là gì |
|---|---|
| `js/pages/quan-tri/khung.js` | Khung bốn khu, `#` địa chỉ, hai con số đếm |
| `quan-tri.css` | Bố cục khung; `@media 680px` đổi sang hàng thẻ ngang |

### Đổi tên

| Từ | Thành |
|---|---|
| `js/pages/quan-tri.js` | `js/pages/quan-tri/khu-kiem-duyet.js` |

### Sửa — trong repo

| File | Sửa gì |
|---|---|
| `js/pages/quan-tri/khu-kiem-duyet.js` | ba đường dẫn `import` lùi một bậc · `mountQuanTri` → `mountKhuKiemDuyet` · "Gạt đi" → "Từ chối" ở mọi chỗ hiển thị, ghi chú và tên biến nội bộ · bỏ `veChan()` · bỏ trần bề ngang và lề |
| `js/app-quan-tri.js` | trỏ sang `pages/quan-tri/khung.js` |
| `QuanTri.html` | nạp `quan-tri.css` · tựa thành *"Quản trị — Gia phả"* |
| `kiem-thu/kiem-trang-quan-tri.mjs` | PHẦN F 16 phép · ba phép kiểm chứng ngược · ba hàm phụ · đọc CSS từ file riêng |

### Sửa — ngoài repo (`Claude_Code/kiem-thu/`, không lên mạng)

| File | Sửa gì |
|---|---|
| `xem-khung-quan-tri.mjs` | **mới** — chụp `kq-0..3.png` ở 1280px và 390px |
| `sb-gia.mjs` | thêm `dsChoDuyet()` giả — con số thứ hai trên thanh |
| `trang-quan-tri-gia.html` | nạp `quan-tri.css` thật · import `khung.js` · đổi chữ |

### Không đụng

`js/domains/` (cả mười file) · `js/services/` · `luoc-do/` · `js/cau-hinh.js`.
Bước này **không sinh một dòng SQL nào** và không chạm cơ sở dữ liệu.
