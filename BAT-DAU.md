# BẮT ĐẦU — App Gia phả trên nền Supabase

*Phiên bản 1.2.0 · Lập 02/09/2026 11:35 · Cập nhật 03/09/2026 · Claude Code CLI*

> **File này là chỗ đứng của phiên ĐẦU TIÊN làm nhánh Supabase.**
>
> **V1.2 (03/09/2026): bộ khung ĐÃ DỰNG XONG, và file này thôi làm chỗ đứng
> hằng ngày.** Từ nay nó là **chứng cứ gốc** — vì sao chuyển nhà, đã chốt
> những gì — và không sửa nữa trừ khi có quyết định mới.
>
> **Chỗ đứng hằng ngày nay là `CHI-DAN.md`** (bảng định tuyến, 80 dòng).
> Từ đó đi tiếp: `KIEN-TRUC.md` · `DU-LIEU.md` · `KE-HOACH.md` ·
> `nhat-ky/INDEX.md`. Chủ dự án cần bấm tay thì mở `HUONG-DAN-DUNG-BANG.md`.
>
> ⚠ Khung dựng xong **không phải app chạy được**: chưa có project Supabase nào
> nhận bốn file SQL, chưa ai đăng nhập được. **`KIEN-TRUC.md` mục 6** kể đúng
> những gì còn dở — đừng đọc mục nào khác mà bỏ nó.
>
> **V1.1 thêm mục 6 — số đo về VẼ SƠ ĐỒ.** Bản Apps Script đóng băng ở bước 84,
> nhưng phần VẼ vẫn chạy tiếp tới **bước 86** (02/09/2026): luật ba khối nay là
> luật đệ quy, và lần đầu có số đo về sức tải. Toàn bộ phần ấy nằm ở `domains/`
> nên **mang nguyên sang nền Supabase**, không sửa một dòng. Mục 6 ghi lại để
> phiên đầu nhánh mới khỏi phải đo lại — và khỏi đo sai.

---

## 1. Chuyện gì vừa xảy ra

Ngày **02/09/2026**, sau bước 84, chủ dự án quyết **đóng băng bản Apps Script +
Google Drive** và dựng lại app trên **Supabase**, tên miền
**`nguyentrongbac.io.vn`**, tài khoản Google **`trongdung1982@gmail.com`**.

Bản cũ **vẫn chạy được nguyên vẹn** và vẫn là bản đang phục vụ người trong họ.
Mốc đóng băng:

| | |
|---|---|
| Thẻ git | **`bang-apps-script-2026-09-02`** (đã đẩy lên GitHub) |
| Commit | `f1473a3` |
| Bộ kiểm lúc đóng băng | 66/66 ĐẠT · bất biến bố cục 47.281 phép, 0 HỎNG |

⚠ **Đây KHÔNG phải một bản viết lại từ đầu.** Luật phân lớp
`config → utils → services → domains → pages` sinh ra chính là để đổi tầng lưu
trữ mà không phải đụng nghiệp vụ. Nếu làm đúng thì `domains/` và `pages/` gần
như giữ nguyên, và chỗ phải viết lại là `services/gas.js` + `services/repo.js`.
**Ngày nào thấy mình đang sửa `domains/` là ngày phải dừng lại hỏi vì sao.**

---

## 2. Vì sao chuyển — lý do thật, không phải vì Supabase mới hơn

Hai điều `CLAUDE.md` mục 11 bắt phải nói thẳng là **chưa làm được**, và chúng
**không thể** làm được trên nền Drive:

- **Giới hạn Editor theo chi/nhánh.** Trên Drive, phân quyền do Google thực thi
  ở tầng file — chia sẻ file là chia sẻ cả cây, không có nửa vời.
- **Chặn Editor sửa tay file JSON ngoài app.** Ai có quyền sửa file thì mở
  Drive ra sửa thẳng được, app không đứng chắn ở giữa.

Supabase mở được cả hai bằng **Row Level Security** — luật viết trong cơ sở dữ
liệu, máy chủ thi hành, app không phải tin ai cả.

Lợi thêm: bỏ được màn hình *"Google chưa xác minh ứng dụng này"* mà mỗi người
trong họ phải vượt qua ở lần đầu.

---

## 3. Đã chốt

| Việc | Quyết định | Ai chốt |
|---|---|---|
| **Cách lưu dữ liệu** | **Bảng Postgres thật** — mỗi người một dòng, mỗi hôn nhân một dòng. Không giữ lối "một file JSON" | Chủ dự án, 02/09/2026 |
| Nơi làm | Thư mục `supabase/` trong `Claude_Code/` — **mọi thứ**, cả mã lẫn tài liệu | Chủ dự án, 02 và 03/09/2026 |
| Cách làm | **Bàn như một dự án mới**, phát triển trên nền hiện tại | Chủ dự án |
| **Repo GitHub** | **`giapha-supabase`** — repo MỚI, để Public. `supabase/` trên máy chính là GỐC repo ấy | Chủ dự án, 03/09/2026 |
| **Địa chỉ app** | `https://trongdung1982.github.io/giapha-supabase/` | Chủ dự án, 03/09/2026 |
| **Project Supabase** | `https://hrmwkpnvenezeyhqmmrw.supabase.co`, tài khoản `trongdung1982@gmail.com` | Chủ dự án, 03/09/2026 |
| **Cách đăng nhập** | **Email + mật khẩu**. Không đụng Google Cloud Console — xem mục 4.1, câu hỏi ấy nay coi như đã trả lời bằng cách đi vòng | Claude Code, 02/09/2026 |

⚠ **`supabase/` KHÔNG còn là một thư mục ghi chú — nó là gốc của một repo
GitHub Public.** Mọi file thả vào đây đều đi lên mạng, và lịch sử git giữ lại
cả bản đã xoá sau này. Muốn để thứ gì lại trên máy thôi thì thêm tên nó vào
`.gitignore` — `Thông tin tài khoản.txt` đã được xử lý như thế.

⚠ **Lý do cũ bắt repo để Public đã hết hiệu lực.** `CLAUDE.md` mục 3 viết
*"Repo GitHub phải để Public, nếu không Apps Script không nạp được module"* —
nền này không còn Apps Script. Nhưng kết luận vẫn thế, chỉ đổi lý do: GitHub
Pages trên tài khoản miễn phí chỉ phục vụ repo Public.

⚠ Chọn bảng Postgres là **chọn cả cái giá của nó**: phải nghĩ kỹ lược đồ trước
khi chạy, và phải viết lại tầng đọc/ghi. Lối "bê nguyên file JSON vào Storage"
đã bị loại **có chủ ý** — nó chuyển nhà xong mà vẫn còn nguyên hai điều chưa làm
được ở mục 2, tức mất đúng lý do để chuyển.

---

## 4. Chưa chốt — phải hỏi trước khi làm

### 4.1 Cách đăng nhập ⚠ đụng vào luật bất di bất dịch

`CLAUDE.md` mục 3: *"Không dùng Google Cloud Console. Tài khoản chủ dự án không
tạo được project ở đó. **Mọi phương án cần OAuth Client ID đều bị loại.**"*

Mà **"Đăng nhập bằng Google" trên Supabase bắt buộc phải có OAuth Client ID tạo
trong Google Cloud Console.** Nên hoặc luật ấy phải đổi, hoặc bỏ đăng nhập
Google. Hai đường:

| Đường | Cần Google Cloud Console? | Đổi lại |
|---|---|---|
| Mã gửi qua email (Supabase tự lo) | **Không** | Mỗi lần đăng nhập lại phải mở hộp thư |
| Đăng nhập bằng Google | **Có** | Bấm một cái là vào |

⚠ **Chưa ai thử** xem `trongdung1982@gmail.com` có tạo được project trong Google
Cloud Console không. Luật cũ viết cho tài khoản cũ. **Đo trước khi kết luận** —
nếp (38).

### 4.2 Nơi đặt trang web cho `nguyentrongbac.io.vn`

Chủ dự án: *"chưa quyết, bàn sau"*. Không chặn gì — làm được ở bước cuối.
Hai đường đã nêu: giữ GitHub Pages rồi trỏ tên miền vào (ít việc nhất, nhưng
repo phải để Public), hoặc chuyển sang Cloudflare Pages (repo để Private được).

### 4.3 Những thứ phiên đầu phải quyết trong kế hoạch

- **Lược đồ bảng** — `persons` · `unions` · `children` · `media` · `sources`,
  và `tree_id` nằm ở đâu. Đọc `tai-lieu/CAU-TRUC-DU-LIEU_V06.md` trước.
- **Ảnh đi đâu.** Nay ở Drive, và app dựa vào việc Drive tự cắt ảnh theo
  `sz=w…` ở **năm chỗ**. Supabase có cắt ảnh nhưng **nằm ở gói trả phí** —
  `config.js` đã lường trước điều này và lưu sẵn **hai bản mỗi tấm** (nhỏ 400px
  cho màn hình, lớn 1600px để in), nên không kẹt. Đừng vô tình quay lại lối
  "một file to rồi nhờ máy chủ cắt".
- **`changeLog` và dấu vân tay chống ghi đè** — Postgres có khoá thật, khác hẳn
  cơ chế "đọc rồi so vân tay" của bản Drive.
- **Đưa dữ liệu sang.** ⚠ Dữ liệu hiện nay **toàn bộ là GIẢ** (xem `CLAUDE.md`
  mục 9) — dữ liệu thật chưa nhập. Đây là **thời điểm rẻ nhất để đổi lược đồ**,
  vì không có gì thật để mất.
- **Không có bước build** — ràng buộc này **giữ nguyên**. Thư viện Supabase
  phải chép vào `giapha/js/vendor/` như SheetJS đã làm ở b79, không nạp từ CDN.

---

## 5. Năm việc bản cũ còn dở — ĐỪNG chép lại

Ghi trong lời thẻ `bang-apps-script-2026-09-02`, chép lại đây cho khỏi phải tra:

1. ⛔ **Lỗi trên điện thoại: chọn số đời không tự vẽ lại sơ đồ** (máy tính không
   bị). Chưa đo, chưa biết gốc. ⚠ Nếu bản Supabase dùng lại `pages/tree-view.js`
   thì **lỗi này đi theo**. Nên đo và sửa sớm.
2. Chế độ **bổ sung** của nhập Excel — có phép đo xanh nhưng chủ dự án chưa bấm
   thử trên app thật.
3. Chưa mở file `.ged` xuất ra bằng một phần mềm gia phả thật (mới mở Notepad).
4. Chưa giới hạn được Editor theo chi/nhánh → **Supabase giải quyết**.
5. Chưa chặn được Editor sửa tay file JSON ngoài app → **Supabase giải quyết**.

Và một việc dọn mã treo từ b48: **đợt 7 của phép tách `person-edit.js`**.

---

## 6. Số đo về VẼ SƠ ĐỒ — mang nguyên sang nền mới

> Đo 02/09/2026 sau bước 86, bằng `kiem-thu/do-suc-tai.mjs` (Chrome thật) và
> `kiem-thu/do-chang-layout.mjs`. Phần vẽ nằm trọn ở `domains/layout.js` +
> `domains/render.js`, tức **lớp không đụng tới khi đổi tầng lưu trữ** — nên
> mọi con số dưới đây đúng nguyên trên nền Supabase.

### 6.1 App vẽ TOÀN BỘ sơ đồ, không vẽ theo khung nhìn

`renderTree()` duyệt hết `layout.nodes`, `links`, `stubs` và sinh thẻ SVG cho
từng cái; **không có cơ chế bỏ qua phần ngoài màn hình**. Zoom không vẽ lại —
`tree-view.js` chỉ đổi hai thuộc tính `width`/`height`, `viewBox` giữ nguyên.

Hệ quả về kích thước lớn hơn cảm giác: cây 681 người ở nấc *Không giới hạn* ra
một tấm SVG **59.571 × 2.322 px** với **7.482 thẻ**.

⚠ **Nền mới thừa hưởng nguyên điều này** nếu dùng lại `render.js` /
`tree-view.js`. Đổi Drive sang Supabase **không** làm nó nhẹ đi một chút nào —
đây là chuyện của lớp `domains`, không phải của lớp `services`.

### 6.2 Ngưỡng giật — đếm theo Ô TRÊN SƠ ĐỒ, không theo người trong file

| Sơ đồ | Số ô | Số thẻ SVG | `computeLayout` | `renderTree` | Một cú zoom |
|---|---|---|---|---|---|
| bac 59 · 2 đời *(dùng hằng ngày)* | 10 | 154 | 1ms | 2ms | 0,3ms |
| **phuc 681 · không giới hạn** | **661** | **7.482** | **10ms** | **67ms** | **6,5ms** |
| bịa 1000 người | 668 | 10.350 | 26ms | 62ms | 9,6ms |
| bịa 1500 người | 1.001 | 15.512 | 72ms | 101ms | 15,2ms |
| bịa 2000 người | 1.333 | 20.666 | 135ms | 128ms | 19,7ms |
| bịa 3000 người | 2.001 | 31.014 | 400ms | 304ms | 32,7ms |
| bịa 4000 người | 2.668 | 41.348 | 740ms | 345ms | 70,3ms |

- **dưới ~1.000 ô** — mượt, không cảm nhận được gì.
- **~1.500 ô** — đổi người trung tâm mất ~0,2 giây: thấy một nhịp khựng.
- **~2.000 ô** — ~0,4 giây mỗi lần vẽ lại; zoom 20ms, chớm giật.
- **~2.700 ô trở lên** — hơn 1 giây mỗi lần vẽ; zoom 70ms ≈ **14 khung/giây**,
  giật rõ.

⚠ **Số người trong file KHÔNG phải cái quyết định.** Ở nấc mặc định 2 đời, sơ đồ
chỉ 4–20 ô dù file có 681 hay 6.000 người. Gia phả của họ, ở ca nặng nhất
(661 ô), nằm gọn trong vùng mượt.

⚠ Đo bằng Chrome `--headless=new --disable-gpu`, tức **không có tăng tốc phần
cứng** — đây là **cận TRÊN**, máy thật nhanh hơn. Con số bền nhất không phải
mili-giây mà là **số thẻ SVG**: nó không đổi theo máy.

### 6.3 Nút cổ chai KHÔNG nằm ở chỗ ai cũng đoán

Bấm giờ từng chặng của `computeLayout`:

| Chặng | 681 thật | bịa 2000 | bịa 4000 |
|---|---|---|---|
| `datMoiKhoi` *(đặt khối — chỗ trông có vẻ đắt nhất)* | 9ms (36%) | 6ms (3%) | 11ms (**1%**) |
| **`canChumConVaoGiua`** | 0ms | **226ms (89%)** | **1.103ms (95%)** |
| ba chặng còn lại cộng lại | ~1ms | ~1ms | ~2ms |
| số lần gọi `deChoNay` *(phép dò chỗ trống từng 4px)* | **0** | **0** | **0** |

Phép dò chỗ trống — thứ trông đắt nhất khi đọc mã — **không chạy lần nào**, và
`datMoiKhoi` chiếm 1% ở ca nặng nhất. Toàn bộ đường cong chậm dần nằm ở
`canChumConVaoGiua()`: nó gọi `deLenNhau()` quét **mọi người trong sơ đồ** cho
mỗi lần dịch.

> **Nếu ngày nào cần làm nhanh, sửa đúng chỗ ấy, chừng hai chục dòng:** xếp ô
> theo HÀNG một lần trước, rồi `deLenNhau()` chỉ hỏi hàng của mình thay vì quét
> cả sơ đồ. **Đừng** viết lại phép đặt khối để mong nhanh hơn — số đo nói nó
> không phải chỗ tốn.

### 6.4 Xuất PDF nhiều trang: vẽ TỪNG TỜ, và đó là ràng buộc của TRÌNH DUYỆT

`xuatPdfNhieuTrang()` lặp hàng × cột; mỗi tờ nhân bản SVG, đặt `viewBox` đúng ô
lưới của tờ ấy rồi mới rasterise thành JPEG đúng cỡ trang. **Không** dựng một
tấm khổng lồ rồi cắt.

Lý do là **trần canvas 268.435.456 điểm ảnh** (đo ở `kiem-thu/do-canvas-lon.mjs`).
Vượt trần thì Chrome **không báo lỗi** — canvas vẫn nhận đúng cỡ rồi trả ảnh
trắng. Đây là giới hạn của trình duyệt, **không** liên quan gì tới Drive hay
Supabase: nền mới thừa hưởng y nguyên.

### 6.5 Chỗ nền mới THẬT SỰ đổi: ảnh

Sơ đồ 661 ô là 661 thẻ `<image>`. Nay ảnh lấy từ Drive; nền mới lấy từ Supabase
Storage. Số thẻ không đổi, nhưng **đường mạng thì đổi** — và mục 4.3 đã chốt lưu
sẵn hai bản mỗi tấm (nhỏ 400px cho màn hình, lớn 1600px để in) đúng vì chuyện
này. Giữ nguyên quyết định ấy.

### 6.6 Luật vẽ đã chốt tới đâu

Bản đóng băng ghi *"tới bước 84"*, nhưng phần VẼ chạy tiếp tới **bước 86**:

- **b85** — luật BA KHỐI: tổ tiên mỗi người né sang phía đối diện bạn đời.
- **b86** — luật BA KHỐI là luật **ĐỆ QUY**: quanh MỖI cặp lại chia ba khối con,
  và **cặp đứng GIỮA hai khối tổ tiên của mình**. Đo trên ảnh Quick Family Tree
  xác nhận đây là luật của phần mềm mẫu (lệch nửa pixel).

Tài liệu: **`tai-lieu/QUY-TAC-VE_V14.md`** (bản mới nhất) và `NK-B86_V01.md`.
`layout.js` ở **1.19.0**. Bộ kiểm: 66/66 đạt · 51.250 phép so trên 214 sơ đồ.

### 6.7 Hai cái bẫy khi ĐO trong Chrome — đã dính, đừng dính lại

| Cờ | Chuyện xảy ra |
|---|---|
| `--virtual-time-budget` | **Đóng băng đồng hồ.** Mọi phép đo trả về đúng **0ms** — trông như *"nhanh tới mức không đo được"*, thật ra là *"chưa đo lần nào"* |
| `--dump-dom` | **Kết xuất ngay khi `load` xong rồi THOÁT.** Kịch bản đo còn đang chạy thì Chrome đã đóng; treo đủ 10 phút rồi báo hết giờ |

Cách đúng, `do-suc-tai.mjs` đang dùng: **bỏ cả hai cờ**, để trang tự gửi kết quả
về máy chủ giả bằng `fetch` POST, Node đợi đúng cú POST ấy.

---

## 7. Đọc gì trước khi lập kế hoạch

| File | Vì sao |
|---|---|
| `tai-lieu/CAU-TRUC-DU-LIEU_V06.md` | Lược đồ hiện nay — gốc để dựng bảng Postgres |
| `tai-lieu/KIEN-TRUC-GOOGLE_V01.md` | Bản Drive/Apps Script **đang** làm gì, để biết phải thay những gì |
| `tai-lieu/PHAN-QUYEN_V03.md` | Phân quyền hiện nay, và đúng hai chỗ nó không với tới được |
| `tai-lieu/HIEN-PHAP_V07.md` | Luật gốc của dự án — kiểm xem luật nào còn đúng trên nền mới |
| `giapha/js/services/gas.js` · `repo.js` | Hai file phải viết lại. Đọc để biết `domains/` đang **mong đợi** gì |
| `giapha/js/vendor/DOC-VENDOR.md` | Luật chép thư viện vào repo — áp cho cả thư viện Supabase |
| **`tai-lieu/QUY-TAC-VE_V14.md`** | Luật VẼ, đã chốt tới bước 86. Nằm ở `domains/` nên **mang nguyên sang** — chỉ đọc khi đụng vào cách vẽ |
| **Mục 6 ngay trên** | Số đo sức tải và hai cái bẫy khi đo. Đọc trước khi ai đó định "tối ưu" phần vẽ |
