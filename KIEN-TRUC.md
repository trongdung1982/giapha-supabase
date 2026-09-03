# KIẾN TRÚC — app gia phả trên nền Supabase

*Lập 03/09/2026 · Nhánh Supabase · thay cho `DOC-KHUNG.md`*

> **Đọc file này khi**: mới vào nhánh Supabase lần đầu, hoặc sắp đụng vào
> `services/`, hoặc sắp "dọn dẹp" một chỗ trông có vẻ thừa.
>
> **Mục 6 — "Còn dở" — là mục quan trọng nhất.** Đừng đọc mục nào khác mà bỏ
> nó, và đừng mô tả những thứ trong đó như đã làm xong.

---

## 1. Nguyên tắc gốc — chỉ HAI file phải viết lại

`BAT-DAU.md` mục 1 nói thẳng:

> *"Nếu làm đúng thì `domains/` và `pages/` gần như giữ nguyên, và chỗ phải
> viết lại là `services/gas.js` + `services/repo.js`. Ngày nào thấy mình đang
> sửa `domains/` là ngày phải dừng lại hỏi vì sao."*

**Đã nghiệm thu 03/09/2026.** Đếm chính xác sau khi chuyển xong:

| Thư mục | Số file | Đã sửa |
|---|---|---|
| `js/domains/` | 10 | **0** |
| `js/utils/` | 7 | 1 — `image.js`, đổi cách dựng đường dẫn ảnh |
| `js/pages/` | 21 | 1 sửa · 1 mới · 7 file đổi **một dòng `import`** |
| `js/services/` | 4 | viết mới cả bốn |
| `js/` gốc | 4 | `state.js` sửa nhẹ · `cau-hinh.js` mới |

Mấu chốt nằm ở một câu: **`services/repo.js` giữ nguyên chữ ký hàm công khai**
(`khoiTao` · `napCay` · `luuCay(apDung, moTa)` · `suaDuoc` · `docDuoc`), và bên
trong nó **ráp các dòng Postgres trở lại đúng hình `state.tree` cũ**. Nhờ thế
`buildIndex`, `bloodline`, `layout`, `render` và hai mươi màn hình không hề
biết dữ liệu đã đổi nhà.

---

## 2. Bản đồ thư mục

Trên máy là `Claude_Code/supabase/`; trên GitHub là **gốc** repo
`trongdung1982/giapha-supabase`. Hai chỗ ấy là một — không có thư mục con nào
ở giữa, nên địa chỉ app là `https://trongdung1982.github.io/giapha-supabase/`.

```
supabase/  (= gốc repo giapha-supabase)
├── CHI-DAN.md              ← đọc đầu mỗi phiên. Trần cứng 80 dòng
├── KIEN-TRUC.md            ← file này
├── DU-LIEU.md              ← lược đồ bảng + luật dữ liệu
├── KE-HOACH.md             ← đang làm gì, còn treo gì
├── HUONG-DAN-DUNG-BANG.md  ← cho chủ dự án, không phải cho AI
├── BAT-DAU.md              ← vì sao chuyển nhà (chứng cứ gốc, không sửa)
├── KE-HOACH-HA-TANG-Supabase_V01.md   ← các bước H1–H10
├── index.html · robots.txt · .gitignore
│
├── nhat-ky/
│   ├── INDEX.md            ← một dòng một bước + bảng Đính chính
│   └── bXX-*.md            ← mỗi bước một file, không bao giờ sửa lại
│
├── luoc-do/                ← SQL, dán tay vào Supabase, chạy theo số thứ tự
├── kiem-thu/               ← bài kiểm chạy bằng Node, không cần mạng
└── js/
    ├── cau-hinh.js         ← ⚠ file DUY NHẤT chủ dự án sửa tay
    ├── config.js · state.js · app.js
    ├── utils/ · domains/ · pages/
    ├── services/
    │   ├── sb.js           ← cầu nối duy nhất xuống Supabase
    │   ├── hinh-dang.js    ← dòng ⇄ cây, và so hai cây ra khác biệt
    │   ├── repo.js         ← viết lại, giữ nguyên chữ ký
    │   └── tuong-thich.js  ← ⚠ giàn giáo tạm, đích đến là XOÁ
    └── vendor/             ← thư viện người khác, chép nguyên, KHÔNG sửa
```

---

## 3. Cửa ghi duy nhất — điều khác hẳn bản Drive

```
ĐỌC  →  cơ sở dữ liệu tự lọc theo quyền (policy trong 02-rls.sql)
GHI  →  KHÔNG một policy insert/update/delete nào. Cửa duy nhất là luu_cay()
```

Vì sao khắt khe thế, khi cấp quyền ghi từng dòng nghe đã đủ?

`BAT-DAU.md` mục 2 nêu hai điều bản Drive không làm được, và điều thứ hai là
*"chặn Editor sửa tay file JSON ngoài app"*. Nếu bảng `persons` có policy cho
insert/update, người biên tập mở `curl` ghi thẳng vào REST API — không qua app,
không kiểm tra hợp lệ, không sinh `change_log`, không tăng `revision`. Điều
thứ hai **vẫn chưa làm được**, chỉ đổi chỗ từ Drive sang REST.

Đóng hẳn đường ghi rồi mở đúng một cửa thì `change_log` và `revision` thành
thứ **không thể vòng qua**, chứ không phải thứ app tử tế thì mới ghi.

⚠ **Cái giá:** `luu_cay()` buộc phải `security definer`, tức chạy vượt RLS.
Toàn bộ phép kiểm quyền dồn vào một hàm — một lỗi trong đó là thủng toàn bộ,
và thủng im lặng, không có lớp thứ hai đứng sau đỡ. Vì thế **phép thử H9 là
bắt buộc**: hai tài khoản thật, mỗi tài khoản một nhánh, xác nhận bằng mắt.

---

## 4. Ba vết sẹo có chủ ý — đừng "sửa" lẻ

Cả ba là chỗ **tên gọi nói dối về nội dung**. Cả ba cố ý giữ, vì sửa chúng
nghĩa là chạm vào `domains/`.

| Vết | Nói dối chỗ nào | Vì sao giữ |
|---|---|---|
| Cột `drive_file_id`, trường `driveFileId` | Không còn Drive nào; giá trị nay là đường dẫn kho Supabase | `domains/media.js`, `gedcom.js`, `excel.js` và bảy màn hình đọc/ghi trường này ở hơn ba mươi chỗ |
| Hàm `driveThumbUrl()` | Dựng URL Supabase, và **bỏ qua tham số `size`** | Tám chỗ gọi, một trong đó là `domains/render.js` |
| File `services/tuong-thich.js` | Là giàn giáo, không phải kiến trúc | Bảy màn hình còn `import` những lệnh của Apps Script |

Đổi tên cả ba là **một việc riêng**, một phiên riêng, có bước đổi dữ liệu và
có bộ kiểm chạy lại. Đừng để nó lẻn vào một lần sửa khác.

⚠ `/kiem-tra` có một phép đếm số màn hình còn dựa vào `tuong-thich.js` —
**mốc 03/09/2026 là 7**. Con số ấy chỉ được giảm. Tăng là dấu hiệu ai đó đang
xây tiếp lên giàn giáo thay vì tháo nó.

---

## 5. Thư viện nạp bằng thẻ `<script>`, không bằng `import`

Supabase **không phát hành bản ES Module một file**. Bản duy nhất chạy thẳng
trong trình duyệt không qua bước build là bản UMD, và nó đặt biến toàn cục
`window.supabase`.

Ba đường, hai đường đầu hỏng ở chỗ khác nhau:

| Đường | Hỏng ở đâu |
|---|---|
| `dist/module/index.js` | Tên gói trần, trình duyệt không tra được. Muốn chạy phải có bước build — thứ `CLAUDE.md` mục 3 cấm |
| `esm.sh` / jsdelivr `+esm` | Chạy được, nhưng là file **đã bị biến đổi** bởi máy chủ người khác. Không có bản gốc để đối chiếu MD5 |
| **`dist/umd/supabase.js`** ✓ | File Supabase tự dựng và tự phát hành. CDN chỉ chuyển phát nguyên bản |

Cái giá dồn hết vào **một chỗ**: `services/sb.js` đọc `window.supabase` thay
vì `import`. Đó cũng chính là file đã được giao làm ranh giới với thế giới bên
ngoài — nên nó không tạo ra chỗ rò rỉ mới, chỉ làm ranh giới sẵn có dày thêm
một dòng.

⚠ Thẻ `<script src="js/vendor/supabase.js">` phải đứng **trước**
`<script type="module" src="js/app.js">`. Đổi chỗ là app hỏng, và hỏng bằng một
câu lỗi không nói gì về nguyên nhân.

Chi tiết và cách nâng cấp: `js/vendor/DOC-VENDOR.md`.

---

## 6. ⚠ CÒN DỞ — đừng mô tả như đã có

**Chưa chạy thật một lần nào.** Chưa có project Supabase nào nhận bốn file SQL,
chưa ai đăng nhập được, chưa có cây nào mở ra.

Thứ **đã** kiểm được, và chỉ thế:

| Bộ kiểm | Kết quả | Chứng minh được gì |
|---|---|---|
| `kiem-thu/kiem-hinh-dang.mjs` | **14/14 đạt** trên gia phả 59 người | Logic thuần đổi hình dữ liệu |
| Đồ thị `import` | **47/47** nối được | App nạp được, không thiếu module |
| `/kiem-tra` | đạt cả 8 phép | Không vi phạm phân lớp |

Cả ba chạy trong Node, **không đụng mạng** — nên chúng **không** chứng minh SQL
chạy được hay RLS chặn đúng.

**Giới hạn theo nhánh chưa có hiệu lực.** Bảng `branches` và `branch_access` đã
dựng, hai hàng rào trong `luu_cay()` đã đứng đúng chỗ, nhưng hàm
`co_the_sua_nguoi()` còn **bỏ qua** tham số nhánh và trả lời như bản Drive.
Chưa viết đủ được vì **chưa ai định nghĩa "chi/nhánh"**. Đoán bừa một quy tắc
rồi để RLS thi hành là cách tệ nhất: sai thì không ai thấy, người ta chỉ thấy
*"không sửa được ông nội mình"* mà không hiểu vì sao.

**Chưa có bản sao lưu nào.** Trên Drive, mỗi lần ghi thành công app tự cất một
bản. Ở đây cơ chế ấy chưa dựng lại — đây là bước **H8**, một trigger Apps Script
chạy nền đọc REST API rồi ghi JSON ra Drive. **Việc gấp nhất trong danh sách**,
không phải việc để dành.

**Bốn màn hình chưa mở được** — mọi hàm chúng gọi đều ném lỗi có câu chữ đàng
hoàng, **không giả vờ thành công**:

| Màn hình | Vì sao |
|---|---|
| Sao lưu | Xem trên |
| Dựng gia phả mới | Cần một hàm `security definer` nữa, chưa viết |
| Bỏ chọn gia phả | Nền này **không có** "gia phả mặc định" để quay về |
| Mở quyền xem ảnh | Không còn nỗi khổ ấy — kho Supabase một luật cho cả kho |

**Giấu chi tiết người còn sống với người chỉ có quyền xem** — chưa làm. RLS lọc
theo **dòng**; việc này phải lọc theo **cột**. `state.daLocNguoiConSong` giữ
nguyên trong mã nhưng **luôn `false`**.

**Lỗi trên điện thoại đi theo.** `BAT-DAU.md` mục 5 việc 1: chọn số đời không
tự vẽ lại sơ đồ trên điện thoại. `pages/tree-view.js` chép nguyên sang, nên lỗi
ấy chép nguyên theo. Chưa đo, chưa biết gốc.

**Tên miền `nguyentrongbac.io.vn` đã gắn 03/09/2026** — DNS ở BKNS trỏ bốn bản
ghi `A` về GitHub Pages, `www` là `CNAME`, file `CNAME` nằm ở gốc repo. Cả
`www` lẫn địa chỉ cũ `trongdung1982.github.io/giapha-supabase/` đều `301` về
tên miền mới. Chứng chỉ Let's Encrypt cấp cho `CN=nguyentrongbac.io.vn`, hạn
tới 02/12/2026, GitHub tự gia hạn.

⚠ **Còn một ô chưa tích: Settings → Pages → *Enforce HTTPS*.** Đo 03/09/2026:
`http://nguyentrongbac.io.vn` vẫn trả thẳng `200` chứ không đẩy sang `https`,
tức ai gõ thiếu chữ `s` thì mật khẩu đăng nhập đi qua đường không mã hoá.
Việc này phải bấm tay trong giao diện GitHub — máy này không có `gh` CLI.

---

## 7. ⚠ CHƯA CHỐT — Ảnh: kho công khai hay kho kín

`01-bang.sql` hiện dựng kho ảnh `public = true`. **Đây là quyết định về riêng
tư mà chủ dự án chưa được hỏi**, nên nó phải nằm ở đây chứ không nằm im trong
một dòng SQL.

| | Kho công khai *(đang chọn)* | Kho kín |
|---|---|---|
| Ai xem được | Ai có đường dẫn | Chỉ người đã đăng nhập, và chỉ trong một giờ |
| Đường dẫn | Đoán trước được → `utils/image.js` dựng thẳng | Phải **xin chữ ký** cho từng tấm |
| Sơ đồ 661 ô | Vẽ xong là xong | Một vòng mạng nữa xin 661 chữ ký, và xin lại khi hết hạn |
| Mã phải sửa | Không | `utils/image.js` phải chạm `state` → phá một luật phân lớp |

Đường dẫn mang uuid nên không đoán mò ra được. Nhưng **"khó đoán" không phải
"được bảo vệ"**, và phải nói thẳng như thế: dữ liệu gia phả thì RLS canh thật,
còn ảnh thì không.

Câu hỏi cho chủ dự án: *ảnh chân dung trong họ có cần kín bằng dữ liệu không,
hay để công khai theo đường dẫn khó đoán là chấp nhận được?*
