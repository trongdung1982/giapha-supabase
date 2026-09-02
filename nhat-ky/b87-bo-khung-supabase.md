# Bước 87 — Dựng bộ khung app gia phả trên nền Supabase

*03/09/2026 06:42 · Claude Code CLI · nhánh Supabase, bước đầu tiên*

---

## Đã làm gì

- **Lược đồ Postgres** — `luoc-do/`, bốn file chạy theo số thứ tự: 12 bảng,
  luật RLS chỉ cấp quyền ĐỌC, hàm `luu_cay()` làm cửa ghi duy nhất, một khung
  nhìn gom mã đã dùng.
- **Tầng `services/` viết mới cả bốn file** — `sb.js` (cầu nối Supabase),
  `hinh-dang.js` (dòng ⇄ cây, và so hai cây ra khác biệt), `repo.js` (viết
  lại, **giữ nguyên chữ ký hàm**), `tuong-thich.js` (giàn giáo tạm).
- **`domains/` chép nguyên cả mười file, không sửa một dòng.**
- Màn hình đăng nhập email + mật khẩu; `khoi-dong.js` thêm nhánh thứ ba.
- `vendor/supabase.js` 2.114.0 (UMD, MIT) chép vào repo, không nạp từ CDN.
- `kiem-thu/kiem-hinh-dang.mjs` — 14 phép, chạy bằng Node, **14/14 đạt**.
- Chuyển toàn bộ vào `supabase/` = gốc repo mới `giapha-supabase`; dựng khung
  tài liệu mới (`CHI-DAN` · `KIEN-TRUC` · `DU-LIEU` · `KE-HOACH` · `nhat-ky/`).

---

## VÌ SAO chọn cách này

### 1. Vì sao `repo.js` ráp dòng Postgres trở lại thành hình JSON cũ

Đây là quyết định đắt nhất của cả bước, và nó quyết định mọi thứ còn lại.

Lối "tự nhiên" là để `pages/` đọc thẳng bảng Postgres — mỗi màn hình một truy
vấn, đúng kiểu một app web bình thường. Lối ấy **hỏng ở chỗ không ai nhìn
thấy trước**: `domains/layout.js` (1.19.0, luật vẽ đã chốt tới b86, bộ kiểm
51.250 phép so trên 214 sơ đồ) nhận vào một object `tree` và trả ra toạ độ.
Nó không biết gì về mạng, và **chính vì thế nó kiểm được**. Cho nó ăn dữ liệu
lấy về theo từng mẩu là biến một hàm thuần thành một hàm bất đồng bộ, và vứt
đi toàn bộ giá trị của bộ kiểm ấy.

Nên hình dữ liệu trong trình duyệt **phải giữ nguyên**. Cái giá là
`hinh-dang.rapCay()` — chừng 80 dòng đổi tên trường. Cái mua được là mười file
`domains/` và hai mươi màn hình không phải đụng tới.

Số đo cuối bước: `domains/` **0 file sửa**.

### 2. Vì sao gửi KHÁC BIỆT chứ không gửi cả cây

681 người là dữ liệu bé; gửi tất rồi ghi đè cho xong thì ít mã hơn nhiều, và
đó là lựa chọn tôi cân nhắc đầu tiên.

Nó hỏng vì **phân quyền, không phải vì tốc độ**. Ghi đè cả cây là chạm vào mọi
dòng ở mỗi lần lưu; người biên tập chỉ được cấp quyền sửa chi Giáp sẽ bị máy
chủ từ chối ngay, vì trong đống ấy có cả chi Ất. Tức là lối "gửi cả cây" **giết
chết đúng lý do của cả cuộc chuyển nhà** — `BAT-DAU.md` mục 2 nêu giới hạn theo
chi là điều thứ nhất mà nền Drive không làm được.

Cái bẫy kéo theo, và nó tinh vi hơn nhiều: phép so hai cây **không được** dùng
`JSON.stringify`. Hai object cùng nội dung mà khác thứ tự khoá cho ra hai chuỗi
khác nhau — và điều đó xảy ra **thật** ở đây, vì bản ghi ráp từ cơ sở dữ liệu
có thứ tự khoá theo bảng tên, còn bản ghi `domains/person.js` vừa dựng thì theo
mã nguồn của nó. Dùng `stringify` thì mỗi lần lưu ghi lại toàn bộ 681 người;
app **vẫn chạy đúng hàng tháng**, rồi ngày bật giới hạn theo nhánh là mọi lần
lưu của mọi người đều bị từ chối. Bộ kiểm có một phép gác đúng chỗ này:
*"cây ráp từ dòng và cây đọc từ file là MỘT"*.

### 3. Vì sao đóng hẳn đường ghi rồi mở đúng một cửa

Cấp quyền ghi từng dòng qua RLS nghe đã đủ. Nó không đủ.

`BAT-DAU.md` mục 2 nêu hai điều bản Drive không làm được, điều thứ hai là
*"chặn Editor sửa tay file JSON ngoài app"*. Nếu bảng `persons` có policy cho
insert/update thì người biên tập mở `curl` ghi thẳng vào REST API của Supabase
— không qua app, không kiểm tra hợp lệ, không sinh `change_log`, không tăng
`revision`. Điều thứ hai **vẫn chưa làm được**, chỉ đổi chỗ từ Drive sang REST.

Đóng hẳn thì `change_log` và `revision` thành thứ **không thể vòng qua**, chứ
không phải thứ app tử tế thì mới ghi.

⚠ Cái giá phải nói ra: `luu_cay()` buộc phải `security definer`, tức chạy vượt
RLS. Toàn bộ phép kiểm quyền dồn vào một hàm; một lỗi trong đó là thủng toàn
bộ, và thủng im lặng. Vì thế phép thử H9 (hai tài khoản thật) là **bắt buộc**,
không phải tuỳ chọn.

### 4. Vì sao giữ ba cái tên nói dối

`drive_file_id` / `driveThumbUrl()` / `tuong-thich.js` đều mang tên của một nền
không còn tồn tại. Sửa tên thì đúng hơn, nhưng cả ba đều dẫn vào `domains/` —
`media.js`, `gedcom.js`, `excel.js` và bảy màn hình đọc trường `driveFileId` ở
hơn ba mươi chỗ; `driveThumbUrl` có tám chỗ gọi, một trong đó là `render.js`.

Đổi tên là một việc riêng, một phiên riêng, có bước đổi dữ liệu và bộ kiểm
chạy lại. Để nó lẻn vào lần chuyển nhà này là trộn hai việc mà khi hỏng thì
không biết hỏng vì cái nào.

Đổi lại, cả ba được ghi to ra ở `KIEN-TRUC.md` mục 4 thay vì giấu đi, và
`/kiem-tra` có thêm một phép **đếm số màn hình còn dựa vào giàn giáo** — mốc
hôm nay 7, chỉ được giảm. Không đếm thì không ai để ý, cho tới lúc gỡ không nổi.

### 5. Vì sao khung tài liệu mới bỏ `_Vxx`

Đo khung cũ trước khi thiết kế: `MUC-LUC` tới **V84, 590 dòng**; 15 bản còn
giữ ngốn 1.436 KB. `NK-INDEX` V81, 15 bản, 972 KB. `KE-HOACH` V54, 14 bản,
736 KB. Ba file, **3,1 MB** cho gần như cùng một nội dung chép đi chép lại.

Nguyên nhân gốc chỉ có một: `_Vxx` buộc **sinh lại toàn bộ file** mỗi lần sửa
một dòng. Sinh lại thủ công thì cắt nhầm — có ghi lại thật, V62 cắt mất bảng
*Đính chính*, V63 phải sửa. Sinh lại thì không ai dám xoá bớt nên chỉ phình ra.

`_Vxx` có lý do thật của nó: `tai-lieu/` là bản sao Knowledge Base trên
claude.ai, **nơi không có lịch sử phiên bản**. Nhưng `supabase/` là một repo
git — git đã cho lịch sử và `git diff`, thứ tốt hơn hẳn 15 bản nằm cạnh nhau.
Nên trên nhánh mới, `_Vxx` mất lý do tồn tại, và `tai-lieu/` giữ nguyên quy
ước cũ vì lý do cũ vẫn đúng ở đó.

Ba thay đổi, mỗi cái chữa đúng một bệnh đã đo được: tên file cố định (chữa
phình) · `INDEX.md` chỉ thêm dòng (chữa cắt nhầm **ở gốc** — không có bước sinh
lại thì không có chỗ để cắt nhầm) · `CHI-DAN.md` trần cứng 80 dòng (chữa bệnh
"file đọc mỗi phiên dài 590 dòng").

---

## Đã thử mà hỏng

**1. Định đặt mã ở `giapha/sb/`.** Tôi hỏi chủ dự án nơi đặt mã và đưa ba lựa
chọn, nhưng **không nhắc rằng `BAT-DAU.md` mục 3 đã chốt "nơi làm: thư mục
`supabase/`"**. Chủ dự án chọn ngược lại điều đã chốt, rồi phát hiện ra khi
đọc báo cáo. Phải chuyển toàn bộ và sửa lại mọi đường dẫn nội bộ.
→ Nếp rút ra: **hỏi một câu mà tài liệu đã trả lời thì phải nói rõ tài liệu
trả lời gì**, đừng đưa lựa chọn trống.

**2. Bộ kiểm đồ thị `import` báo hàng chục lỗi giả.** Regex bắt `import … from`
nuốt trọn các khối chú thích dài giữa hai lệnh import, nên "tên export cần
đến" hoá ra là cả đoạn văn tiếng Việt. Sửa bằng cách **bóc chú thích trước khi
dò**. Mã dự án này chú thích rất dày — mọi công cụ quét mã ở đây phải tính
trước điều đó.

**3. Định lấy supabase-js bản ESM từ `esm.sh` hoặc jsdelivr `+esm`.** Bỏ, vì
đó là file **đã bị máy chủ người khác biến đổi**, không có bản gốc để đối chiếu
MD5 — vi phạm thẳng luật 1 của `vendor/`. Quay về bản UMD do chính Supabase
dựng và phát hành, chấp nhận cái giá là `sb.js` phải đọc `window.supabase`.

**4. Hai lỗ hổng trong SQL, bắt được khi đọc lại chứ không phải khi viết.**
- `if v_rev_thuc <> p_revision` — trong SQL `5 <> null` ra `null` chứ không ra
  `true`, nên một lần gọi thiếu tham số **đi thẳng qua hàng rào chống ghi đè**.
- `co_the_sua_nguoi()` — với người ngoài cây, `vai_tro()` trả `null`, và
  `null <> 'sua'` cũng ra `null`, nên họ rơi xuống nhánh `else true`: hàm quyết
  quyền trả lời *"được sửa"* cho đúng người không có quyền gì.

  → Nếp rút ra: **trong SQL, mọi phép so với một giá trị có thể `null` phải có
  nhánh `is null` riêng.** Cả hai lỗi đều không lộ ra khi thử bằng app, vì app
  luôn gửi đủ tham số và luôn gọi sau khi đã qua hàng rào khác.

**5. Đẩy lên GitHub bị từ chối `403`.** Máy giữ đăng nhập của `ntdungsnotion`,
repo mới thuộc `trongdung1982`. Chưa gỡ được — chờ chủ dự án mời tài khoản kia
làm collaborator. Ba commit nằm sẵn trên máy.

---

## Còn treo

Danh sách đầy đủ ở `KIEN-TRUC.md` mục 6 và `KE-HOACH.md`. Ba thứ gấp nhất:

1. **Chưa chạy thật một lần nào** — bốn file SQL chưa ai chạy. Cả bộ khung
   đứng trên giả định ấy.
2. **Chưa có bản sao lưu nào** (H8). Đừng nhập dữ liệu thật trước khi có.
3. **Giới hạn theo nhánh chưa chạy** — chờ chủ dự án định nghĩa "chi/nhánh".

---

## File đã đụng tới

**Mới:** `luoc-do/01-bang.sql` · `02-rls.sql` · `03-ham-luu-cay.sql` ·
`04-view-ma-da-dung.sql` · `js/cau-hinh.js` · `js/services/sb.js` ·
`hinh-dang.js` · `repo.js` · `tuong-thich.js` · `js/pages/dang-nhap.js` ·
`js/vendor/supabase.js` · `LICENSE-supabase-js.txt` · `DOC-VENDOR.md` ·
`index.html` · `robots.txt` · `.gitignore` · `kiem-thu/kiem-hinh-dang.mjs` ·
`CHI-DAN.md` · `KIEN-TRUC.md` · `DU-LIEU.md` · `KE-HOACH.md` ·
`HUONG-DAN-DUNG-BANG.md` · `nhat-ky/INDEX.md` · file này.

**Sửa:** `js/state.js` (`headRevisionId` → `revision`) · `js/utils/image.js`
(đường dẫn ảnh) · `js/config.js` (khối ghi chú) · `js/app.js` ·
`js/pages/khoi-dong.js` (nhánh đăng nhập) · bảy file `pages/` đổi một dòng
`import` · `BAT-DAU.md` (lên 1.2.0) · `../CLAUDE.md` (lên 1.3.0) ·
`../.claude/commands/khoi-tao.md` · `kiem-tra.md`.

**Chép nguyên, không sửa:** cả mười file `js/domains/` · sáu trong bảy file
`js/utils/` · mười chín trong hai mươi file `js/pages/`.

**Xoá:** `config.example.json` (rác của lần lập repo, chủ dự án xác nhận) ·
`DOC-KHUNG.md` (tách thành `CHI-DAN` + `KIEN-TRUC` + `DU-LIEU`).

⚠ Repo `giapha` (bản Apps Script) **không đụng một byte** — `git status` trống
suốt cả phiên.
