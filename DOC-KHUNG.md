# giapha-supabase — Bộ khung app gia phả trên nền Supabase

*Phiên bản 1.0.0 · Lập 02/09/2026 23:10 · Claude Code CLI*

> Đây là **bộ khung**, không phải app đã chạy. Mã đã viết xong và mọi `import`
> đã nối được, nhưng **chưa có dòng nào chạy trên một project Supabase thật**.
> Mục 7 kể đúng những gì còn dở; đừng đọc mục nào khác mà bỏ mục ấy.

---

## 1. Nguyên tắc gốc — chỉ HAI file phải viết lại

`supabase/BAT-DAU.md` mục 1 nói thẳng:

> *"Đây KHÔNG phải một bản viết lại từ đầu. Nếu làm đúng thì `domains/` và
> `pages/` gần như giữ nguyên, và chỗ phải viết lại là `services/gas.js` +
> `services/repo.js`. Ngày nào thấy mình đang sửa `domains/` là ngày phải
> dừng lại hỏi vì sao."*

Khung này giữ đúng điều đó. Đếm chính xác:

| Thư mục | Số file | Đã sửa |
|---|---|---|
| `js/domains/` | 10 | **0** |
| `js/utils/` | 7 | 1 (`image.js` — đổi cách dựng đường dẫn ảnh) |
| `js/pages/` | 20 | 2 sửa (`khoi-dong.js`) + 1 mới (`dang-nhap.js`) + 7 file đổi **một dòng `import`** |
| `js/services/` | 4 | **viết mới cả bốn** |
| `js/` gốc | 4 | `state.js` sửa nhẹ, `cau-hinh.js` mới |

Mấu chốt nằm ở một câu: **`services/repo.js` giữ nguyên chữ ký hàm công khai**
(`khoiTao` · `napCay` · `luuCay(apDung, moTa)` · `suaDuoc` · `docDuoc`), và bên
trong nó **ráp các dòng Postgres trở lại đúng hình `state.tree` cũ**. Nhờ thế
`buildIndex`, `bloodline`, `layout`, `render` và hai mươi màn hình không hề
biết dữ liệu đã đổi nhà.

---

## 2. Bản đồ thư mục

Trên máy là `Claude_Code/supabase/`; trên GitHub là **gốc** của repo
`giapha-supabase`. Hai chỗ ấy là một — không có thư mục con nào ở giữa, nên
`index.html` nằm ngay gốc và địa chỉ app là
`https://trongdung1982.github.io/giapha-supabase/`.

⚠ **Toàn bộ thông tin dự án của nhánh Supabase nằm trong thư mục này**, kể cả
tài liệu — chủ dự án chốt 03/09/2026: *"tôi muốn làm sạch, mọi thông tin dự án
đều nằm ở supabase"*. Repo `giapha` cũ giữ nguyên bản Apps Script đang chạy,
không đụng tới.

```
supabase/  (= gốc repo giapha-supabase)
├── index.html                  ← TRANG THẬT (không còn vỏ Apps Script)
├── robots.txt                  ← chặn công cụ tìm kiếm (bước H7)
├── DOC-KHUNG.md                ← file này
├── HUONG-DAN-DUNG-BANG.md      ← từng bước cho chủ dự án
├── BAT-DAU.md                  ← vì sao chuyển nhà, và đã chốt những gì
├── KE-HOACH-HA-TANG-Supabase_V01.md
│
├── luoc-do/                    ← SQL, dán vào Supabase SQL Editor
│   ├── 01-bang.sql             ← 12 bảng + kho ảnh
│   ├── 02-rls.sql              ← luật ĐỌC + 4 hàm quyết quyền
│   ├── 03-ham-luu-cay.sql      ← CỬA GHI DUY NHẤT
│   └── 04-view-ma-da-dung.sql  ← mã đã dùng, cho utils/id.js
│
├── kiem-thu/
│   └── kiem-hinh-dang.mjs      ← 14 phép, chạy bằng Node, không cần mạng
│
└── js/
    ├── cau-hinh.js             ← ⚠ FILE DUY NHẤT SỬA TAY (thay gas/Config.gs)
    ├── config.js               ← hằng số hiển thị, chép nguyên
    ├── state.js                ← headRevisionId → revision
    ├── app.js
    ├── utils/                  ← chép nguyên, trừ image.js
    ├── domains/                ← CHÉP NGUYÊN CẢ MƯỜI FILE
    ├── pages/                  ← chép nguyên + dang-nhap.js
    ├── services/
    │   ├── sb.js               ← cầu nối duy nhất xuống Supabase
    │   ├── hinh-dang.js        ← dòng ⇄ cây, và so hai cây ra khác biệt
    │   ├── repo.js             ← viết lại, giữ nguyên chữ ký
    │   └── tuong-thich.js      ← ⚠ giàn giáo tạm, đích đến là XOÁ
    └── vendor/
        ├── supabase.js         ← 2.114.0, MIT, chép nguyên vào repo
        └── xlsx.mjs            ← 0.20.3, chép sang từ bản cũ
```

---

## 3. Lược đồ: ba quyết định và cái giá của chúng

**Mã người vẫn là `P0001`, không phải uuid.** Khoá chính là cặp
`(tree_id, id)`. Đổi sang uuid thì đẹp hơn về mặt cơ sở dữ liệu, nhưng
`domains/` và `pages/` tra cứu nhau bằng đúng những chuỗi ấy ở hàng trăm chỗ —
tức là sửa `domains/`, tức là điều BAT-DAU cấm.

**Khối con vẫn để `jsonb`** — `names`, `birth`, `death`, `vn`, `meta`, `ranks`.
Không truy vấn nào cần lọc theo `names[].type`. Cái RLS cần là *một dòng cho
mỗi người*, và đã có. Chuẩn hoá sâu hơn là trả giá mà không mua được gì.

**Con thì KHÔNG để jsonb** — `union_children` là bảng thật. Đây là quan hệ duy
nhất mà máy chủ thật sự cần đi theo được, vì truy vấn đệ quy "người này thuộc
nhánh nào" chính là thứ cả cuộc chuyển nhà sinh ra để làm.

⚠ Cái giá đã chấp nhận: `unions.partners` là **mảng** `text[]`, nên Postgres
không bắt buộc được khoá ngoại trên từng phần tử. Một mã người chết trong
`partners` sẽ không bị cơ sở dữ liệu chặn. Đường đọc của app vốn đã chịu được
điều đó — nhưng phải biết là đang chấp nhận, không phải quên.

---

## 4. Cửa ghi duy nhất — điều khác hẳn bản Drive

```
ĐỌC  →  cơ sở dữ liệu tự lọc theo quyền (policy trong 02-rls.sql)
GHI  →  KHÔNG một policy insert/update/delete nào. Cửa duy nhất là luu_cay()
```

Vì sao khắt khe thế, khi cấp quyền ghi từng dòng nghe đã đủ?

`BAT-DAU.md` mục 2 nêu hai điều bản Drive không làm được, và điều thứ hai là
*"chặn Editor sửa tay file JSON ngoài app"*. Nếu bảng `persons` có policy cho
insert/update, người biên tập mở `curl` ra ghi thẳng vào REST API của Supabase
— không qua app, không kiểm tra hợp lệ, không sinh `change_log`, không tăng
`revision`. Điều thứ hai vẫn chưa làm được, chỉ đổi chỗ từ Drive sang REST.

Đóng hẳn đường ghi rồi mở đúng một cửa thì `change_log` và `revision` thành
thứ **không thể vòng qua**, chứ không phải thứ app tử tế thì mới ghi.

⚠ **Cái giá:** `luu_cay()` buộc phải `security definer`, tức chạy vượt RLS.
Toàn bộ phép kiểm quyền dồn vào một hàm; một lỗi trong đó là thủng toàn bộ,
và thủng im lặng. Vì thế **phép thử H9 là bắt buộc**: hai tài khoản thật, mỗi
tài khoản một nhánh, xác nhận bằng mắt là không sửa được nhánh kia.

### Chống ghi đè

`state.headRevisionId` (vân tay Drive) → `state.revision` (số nguyên của bảng
`trees`). Cùng vai trò, nhưng chắc hơn hẳn: Drive buộc phải hỏi vân tay rồi
mới ghi, và giữa hai việc luôn có một khe hở. Ở đây số ấy được đọc bằng
`select … for update` và tăng **bên trong cùng một giao dịch** với lần ghi.

### Vì sao gửi KHÁC BIỆT chứ không gửi cả cây

Gửi cả cây rồi ghi đè hết thì đơn giản hơn nhiều — 681 người là dữ liệu bé.
Nhưng ghi đè cả cây là chạm vào **mọi** dòng ở mỗi lần lưu, nên người chỉ được
cấp quyền sửa chi Giáp sẽ bị từ chối ngay vì trong đống ấy có cả chi Ất.

**Khác biệt tồn tại vì phân quyền, không phải vì tốc độ.** Ai định "đơn giản
hoá" bằng cách gửi cả cây thì đang gỡ bỏ đúng lý do của cuộc chuyển nhà.

---

## 5. ⚠ CHƯA CHỐT — Ảnh: kho công khai hay kho kín

`01-bang.sql` hiện dựng kho ảnh với `public = true`. **Đây là một quyết định
về riêng tư mà chủ dự án chưa được hỏi**, nên nó phải nằm ở đây chứ không
nằm im trong một dòng SQL.

| | Kho công khai *(đang chọn)* | Kho kín |
|---|---|---|
| Ai xem được | Ai có đường dẫn | Chỉ người đã đăng nhập, và chỉ trong một giờ |
| Đường dẫn | Đoán trước được → `utils/image.js` dựng thẳng | Phải **xin chữ ký** cho từng tấm |
| Sơ đồ 661 ô | Vẽ xong là xong | Một vòng mạng nữa xin 661 chữ ký, và xin lại khi hết hạn |
| Mã phải sửa | Không | `utils/image.js` phải đọc được một kho chữ ký → `utils` phải chạm `state`, phá một luật phân lớp |

Đường dẫn mang uuid nên không đoán mò ra được. Nhưng **"khó đoán" không phải
"được bảo vệ"**, và phải nói thẳng như thế: dữ liệu gia phả thì RLS canh thật,
còn ảnh thì không.

Câu hỏi cho chủ dự án: *ảnh chân dung trong họ có cần kín bằng dữ liệu không,
hay để công khai theo đường dẫn khó đoán là chấp nhận được?*

---

## 6. Ba vết sẹo có chủ ý — đừng "sửa" lẻ

Cả ba đều là chỗ tên gọi nói dối về nội dung. Cả ba đều **cố ý giữ**, vì sửa
chúng nghĩa là chạm vào `domains/`.

| Vết | Nói dối chỗ nào | Vì sao giữ |
|---|---|---|
| Cột `drive_file_id`, trường `driveFileId` | Không còn Drive nào; giá trị nay là đường dẫn trong kho Supabase | `domains/media.js`, `gedcom.js`, `excel.js` và bảy màn hình đọc/ghi trường này ở hơn ba mươi chỗ |
| Hàm `driveThumbUrl()` | Dựng URL Supabase, và **bỏ qua tham số `size`** | Tám chỗ gọi, một trong đó là `domains/render.js` |
| File `services/tuong-thich.js` | Là giàn giáo, không phải kiến trúc | Bảy màn hình còn `import` những lệnh của Apps Script |

Đổi tên cả ba là **một việc riêng**, một phiên riêng, có bước đổi dữ liệu và
có bộ kiểm chạy lại. Đừng để nó lẻn vào một lần sửa khác.

---

## 7. Còn dở — ĐỪNG mô tả như đã có

**Chưa chạy thật một lần nào.** Chưa có project Supabase nào nhận những file
SQL này, chưa ai đăng nhập được, chưa có cây nào mở ra. Thứ đã kiểm là:
`kiem-thu/kiem-hinh-dang.mjs` **14/14 đạt** trên gia phả 59 người, và toàn bộ
47 file trong đồ thị `import` đều nối được. Cả hai đều chạy trong Node, không
đụng mạng — nên chúng chứng minh phần logic thuần, **không** chứng minh SQL
chạy được hay RLS chặn đúng.

**Giới hạn theo nhánh chưa có hiệu lực.** Bảng `branches` và `branch_access`
đã dựng, hai hàng rào trong `luu_cay()` đã đứng đúng chỗ, nhưng hàm
`co_the_sua_nguoi()` còn **bỏ qua** tham số nhánh và trả lời như bản Drive.
Không viết đủ được vì chưa ai định nghĩa "chi/nhánh" —
`KE-HOACH-HA-TANG-Supabase_V01.md` hỏi câu ấy từ 24/08/2026. Đoán bừa một quy
tắc rồi để RLS thi hành là cách tệ nhất: sai thì không ai thấy, người ta chỉ
thấy "không sửa được ông nội mình".

**Chưa có bản sao lưu nào.** Trên Drive, sao lưu là chép một file JSON. Ở đây
không còn "một file" để chép; việc này là bước **H8** — một trigger Apps Script
chạy nền đọc REST API rồi ghi JSON ra Drive. Chưa viết. Đây là việc **gấp
nhất** trong danh sách, không phải việc để dành.

**Bốn màn hình chưa mở được** — mọi hàm chúng gọi đều ném lỗi có câu chữ đàng
hoàng, không giả vờ thành công:

| Màn hình | Vì sao |
|---|---|
| Sao lưu (`backup.js`) | Xem trên |
| Dựng gia phả mới | Cần một hàm `security definer` nữa, chưa viết |
| Bỏ chọn gia phả | Nền này **không có** "gia phả mặc định" để quay về |
| Mở quyền xem ảnh | Không còn nỗi khổ ấy — kho Supabase một luật cho cả kho |

**Giấu chi tiết người còn sống với người chỉ có quyền xem** — chưa làm.
`AN_NGUOI_CON_SONG_VOI_NGUOI_XEM` của `Config.gs` không có bản tương đương:
RLS lọc theo **dòng**, việc này phải lọc theo **cột**. `state.daLocNguoiConSong`
giữ nguyên trong mã nhưng **luôn `false`**.

**Lỗi trên điện thoại đi theo.** `BAT-DAU.md` mục 5 việc 1: chọn số đời không
tự vẽ lại sơ đồ trên điện thoại. `pages/tree-view.js` chép nguyên sang, nên
lỗi ấy chép nguyên theo. Chưa đo, chưa biết gốc.

**Chưa gắn tên miền, chưa có `robots.txt`.** Thẻ `noindex` đã có trong
`index.html` (bước H7 làm một nửa); `robots.txt` phải nằm ở gốc repo, chưa đặt.

---

## 8. Việc tiếp theo, theo thứ tự

1. **Chạy bốn file SQL** trên project Supabase thật, theo đúng số thứ tự.
   Xem `HUONG-DAN-DUNG-BANG.md`.
2. **Điền `js/cau-hinh.js`** — Project URL và anon key.
3. **Tạo một tài khoản và một cây thử**, đăng nhập, mở sơ đồ. Đây là phép thử
   nhỏ 20 phút mà `CLAUDE.md` mục 8 nói tới: nó trả lời câu *"cả chuỗi có
   thông không"* trước khi ai xây gì lên trên.
4. **Script di dời** — `hinh-dang.boCay()` đã làm sẵn phần khó; script chỉ
   còn việc đọc file JSON, gọi nó, rồi đổ vào bảng, kèm bước đối chiếu số bản
   ghi trước/sau (bước H5).
5. **Hỏi chủ dự án hai câu**: kho ảnh công khai hay kín (mục 5), và định
   nghĩa chi/nhánh (mục 7).
6. **Sao lưu (H8)** — trước khi có dữ liệu thật, không phải sau.
7. **Phép thử H9** — hai tài khoản thật, giới hạn theo nhánh, xác nhận bằng
   mắt. Bắt buộc đứng trước khi viết `PHAN-QUYEN` bản mới.

⚠ Bước 1–3 phải xong trước khi làm bất cứ bước nào từ 4 trở đi. Cả khung này
đứng trên một giả định chưa ai kiểm: rằng bốn file SQL chạy được.
