# DỮ LIỆU — bảng Postgres và những luật hay bị làm sai

*Lập 03/09/2026 · Nhánh Supabase*

> **Đọc file này khi**: đụng vào lược đồ bảng, thêm/bớt trường, viết truy vấn,
> hoặc sắp sửa `services/hinh-dang.js`.
>
> **Không đọc khi** chỉ sửa giao diện hay cách vẽ — phần ấy không biết dữ liệu
> nằm ở đâu, và đó là chủ ý.
>
> File này **tách riêng khỏi `KIEN-TRUC.md`** vì lược đồ đổi theo nhịp khác hẳn
> quy tắc kiến trúc. Để chung thì mỗi lần thêm một trường lại phải nạp cả bản
> hiến pháp — đúng lời khuyên ở `khoi-tao-du-an-moi v2.md`.

---

## 1. Hình dữ liệu tồn tại ở HAI nơi, và phải phân biệt cho rõ

```
   Postgres                    hinh-dang.js                trình duyệt
   ────────                    ────────────                ───────────
   12 bảng                 ⇄   rapCay()  /  boCay()   ⇄    một object `tree`
   snake_case                                              camelCase
   photo_file_id                                           photoFileId
   ord                                                     order
```

**`services/hinh-dang.js` là chỗ DUY NHẤT biết cả hai lối viết.** Không có chỗ
thứ hai, và đó là chủ ý. Ngày nào thấy chữ `photo_file_id` xuất hiện trong
`domains/` hay `pages/` là ngày ranh giới này đã vỡ.

Hình `tree` trong trình duyệt **giống hệt** file `giapha-json` của bản Drive.
Nhờ thế mà `domains/` không phải sửa một dòng nào khi chuyển nhà. Khuôn đầy đủ
của hình ấy: `tai-lieu/CAU-TRUC-DU-LIEU_V06.md` mục *"File dữ liệu"* — vẫn
đúng nguyên, đừng chép lại vào đây.

---

## 2. Mười hai bảng

File dựng: `luoc-do/01-bang.sql`. Bảng dưới đây chỉ nói **vai**, không chép
lại từng cột.

| Bảng | Vai | Ghi chú |
|---|---|---|
| `trees` | Một dòng một gia phả. Chứa `revision` — số chống ghi đè | Thay khối `"tree": {…}` đầu file JSON |
| `tree_members` | **Ai được vào cây nào** — vai `chu`/`admin`/`sua`/`xem`/`sao_luu`, cộng `person_id` + `approved` | Thay danh sách chia sẻ Drive · xem mục 2b |
| `branches` | Chi/nhánh | ⚠ **TỪ NAY KHÔNG DÙNG** — luật trực hệ thay chỗ, xem mục 2b |
| `branch_access` | Ai được sửa nhánh nào | ⚠ **TỪ NAY KHÔNG DÙNG** — xem mục 2b |
| `persons` | Một dòng một người | Khoá chính `(tree_id, id)` |
| `unions` | Một dòng một cuộc hôn nhân | `partners` là **mảng** |
| `union_children` | Quan hệ cha mẹ–con | Bảng THẬT, không phải jsonb |
| `media` | Ảnh | `drive_file_id` nay là đường dẫn kho Supabase |
| `sources` | Nguồn tư liệu | |
| `change_log` | Nhật ký thay đổi | Không ai ghi thẳng được, chỉ `luu_cay()` |
| `imports` | Sổ nhập GEDCOM / Excel | Chỉ mọc thêm |
| `user_settings` | Cài đặt riêng từng người | Bảng DUY NHẤT trình duyệt ghi thẳng |

### 2b. Phân quyền sửa: luật TRỰC HỆ *(chốt 04/09/2026)*

Tài khoản muốn sửa phải **gắn với một mã người** (`tree_members.person_id`) và
**được admin duyệt** (`approved`). Duyệt rồi thì sửa được **trực hệ** của người
ấy: lên chỉ đường thẳng — bố mẹ, ông bà, cụ, **không** rẽ ngang sang bác/chú;
xuống toàn bộ con cháu; cộng vợ/chồng của những người ấy. Chưa gắn → chỉ xem.

Thi hành ở hai chỗ, và **chỉ** hai chỗ: `pham_vi_sua()` trong
`luoc-do/06-quyen-truc-he.sql` tính tập người, hàng rào 4 của
`03-ham-luu-cay.sql` thi hành nó. Lý do chọn luật này, kèm con số đo trên cây
thật 681 người, nằm ở đầu file `06`.

⚠ **Phạm vi mọc ra từ chính các CẠNH quan hệ**, nên cạnh phải được canh chặt
như người. Khai một người ngoài phạm vi làm bố mình là tự cấp quyền sửa người
ấy — hàng rào 4 chặn ở sáu chỗ, và bỏ sót chỗ nào cũng mở lại đúng đường ấy.

⚠ **Không ai sửa được anh chị em ruột của mình** (0/514 người trên cây 681).
Đã biết và đã chấp nhận; đường ra là nhờ bố hoặc nhờ admin.

⚠ **Từ `07-duyet-dang-ky.sql` (04/09/2026), `approved` gác CẢ QUYỀN ĐỌC.**
Trước đó nó chỉ gác quyền sửa, nên ai có tên trong `tree_members` là xem được
cả gia phả. Nay người vừa nộp đơn có dòng trong bảng nhưng **không đọc được
một chữ nào** — nếu không thì "xếp hàng chờ" chẳng chặn được gì.

Ba vai đi tắt, không bao giờ phải chờ: `chu` (khoá chủ ra ngoài nhà mình là
hỏng kiểu không ai cứu được), `admin` (chủ dự án cấp tay), và `sao_luu` — vai
máy chạy hằng đêm, không có người ngồi sau để bấm nút, nên rơi vào trạng thái
chờ là **sao lưu thất bại im lặng**.

Hai cột đi kèm: `xin_luc` (null = được thêm tay, không qua hàng chờ) và
`loi_nhan` (người nộp tự giới thiệu — admin nhìn hàng chờ chỉ thấy email, mà
email không nói được `hoangnam92@` là cháu ông nào).

### Ba quyết định về lược đồ, và cái giá

**Mã người vẫn là `P0001`, không phải uuid.** Khoá chính là **cặp**
`(tree_id, id)`. `domains/` và `pages/` tra cứu nhau bằng đúng những chuỗi ấy
ở hàng trăm chỗ; đổi sang uuid là sửa `domains/`.

**Khối con vẫn để `jsonb`** — `names`, `birth`, `death`, `vn`, `meta`, `ranks`.
Không truy vấn nào cần lọc theo `names[].type`. Cái RLS cần là *một dòng cho
mỗi người*, và đã có. Chuẩn hoá sâu hơn là trả giá mà không mua được gì.

**Con thì KHÔNG để jsonb.** `union_children` là bảng thật, vì đây là quan hệ
duy nhất máy chủ cần **đi theo được** — truy vấn đệ quy *"người này thuộc
nhánh nào"* chính là thứ cả cuộc chuyển nhà sinh ra để làm.

⚠ **Cái giá đã chấp nhận:** `unions.partners` là mảng `text[]`, nên Postgres
không bắt buộc được khoá ngoại trên từng phần tử. Mã người chết trong
`partners` sẽ **không** bị cơ sở dữ liệu chặn. Đường đọc của app vốn chịu được
điều đó — nhưng phải biết là đang chấp nhận, không phải quên.

---

## 3. Bảy điều hay bị làm sai

Sáu điều đầu chép từ `tai-lieu/CAU-TRUC-DU-LIEU_V06.md` vì chúng **vẫn đúng
nguyên** trên Postgres. Điều thứ bảy là điều mới của nền này.

**1. `partners` là mảng, không phải `husband`/`wife`.**
Hôn nhân đồng giới phải chạy được. Chỉ ánh xạ về `HUSB`/`WIFE` lúc xuất GEDCOM.
⚠ `partners` có thể chỉ có **MỘT** phần tử — `U0024`, `U0026` là ca thật (cha
nhận con nuôi, không có vợ trong gia phả). Đừng viết `partners[0] && partners[1]`
ở bất cứ đâu.

**2. `partner_order` ≠ `ranks`.** Cái trước là chỗ đứng trái/phải trên sơ đồ,
người dùng hoán đổi được. Cái sau là thứ bậc vợ cả (1) / vợ thứ (2), một sự
thật về gia đình. Không gộp.
⚠ Và `ranks` (object theo người) không phải `rank` (một số cho cả cặp) — trường
`rank` đã bỏ từ b46.

**3. Ngày lưu song song `iso` và `raw`.** `raw` là nguyên văn người dùng gõ:
*"khoảng 1948"*, *"tháng 3 năm Mậu Tý"*. `parseLooseDate` chỉ **gợi ý** `iso`,
không bao giờ ghi đè `raw`.

**4. Con thuộc `union`, không thuộc `person`.** Không có `father_id`/`mother_id`.
Con nuôi vẫn giữ liên kết với cha mẹ ruột, tức thuộc HAI union.

**5. `photo_file_id` là CON TRỎ, `media` là KHO.** Kho giữ mọi tấm từng gắn,
kể cả tấm đã thôi làm đại diện. Chỉ `domains/media.js` được ghi hai trường ấy,
và luôn ghi cùng nhau.

**6. `ts` và `by` của nhật ký do MÁY CHỦ điền.** Trình duyệt gửi lên
`{ action, target, note, diff }` và **chỉ thế**.
⚠ Trên nền này luật ấy được **thi hành thật**: `luu_cay()` lấy email từ JWT,
và không có đường ghi nào khác vào `change_log`. Trên Drive nó chỉ là quy ước.

**7. ⚠ MỚI — `branch_id` phải đi theo bản ghi và quay về nguyên vẹn.**
`branchId` không có trong `CAU-TRUC-DU-LIEU_V06`; nó là cột riêng của nền
Supabase, dùng để RLS giới hạn người biên tập theo chi. Bỏ nó ra khỏi hình cây
thì mỗi lần lưu sẽ ghi `null` đè lên, tức **âm thầm gỡ mọi người ra khỏi nhánh
của họ** — và không có gì báo lỗi khi điều đó xảy ra. Nó nằm trong bảng tên
`TEN_PERSON` của `hinh-dang.js` đúng vì lý do này.

---

## 4. Xoá là ĐẶT CỜ

Không có xoá cứng ở đường thường. Xoá là `deleted = true`, và bản ghi đi vào
`ops.persons.luu` như mọi sửa đổi khác.

Chỉ **Dọn thùng rác** (`domains/purge.js`) mới làm bản ghi biến mất khỏi mảng,
và chỉ nó mới sinh ra `ops.persons.xoa` — đường xoá thật duy nhất.

⚠ Xoá một người **KHÔNG đụng một chữ nào vào `unions`**. Lý do thật không phải
"đường đọc đã lọc rồi", mà là: **hoàn tác phải trả lại ĐÚNG thứ đã có.** Gỡ mã
khỏi mảng thì lúc khôi phục phải nhớ người ấy đứng ở union nào, thứ mấy trong
hàng anh em, đẻ hay nuôi — tức phải chép một bản sao thứ hai của mối nối, và
bản sao ấy sẽ trôi khác bản gốc.

---

## 5. Chống ghi đè — khác Drive ở một chỗ quan trọng

| | Drive | Postgres |
|---|---|---|
| Cái so | `headRevisionId` (chuỗi vân tay Google) | `trees.revision` (số nguyên của ta) |
| Cách so | hỏi metadata → rồi mới ghi | `select … for update` → tăng, **trong cùng một giao dịch** |
| Khe hở giữa hỏi và ghi | **có** | **không** |

⚠ Xung đột thì **cố ý KHÔNG cập nhật `state.revision`**. Nghe thì tiện — *"cập
nhật rồi lưu lại là xong"* — nhưng đó chính là ghi đè mất bản của người kia,
tức tự tay làm đúng cái việc cơ chế này sinh ra để chặn. Đường ra duy nhất là
nạp lại cây.

---

## 6. Gửi KHÁC BIỆT, không gửi cả cây — và vì sao

Gửi cả cây rồi ghi đè hết thì đơn giản hơn nhiều; 681 người là dữ liệu bé.

Nhưng ghi đè cả cây là chạm vào **mọi** dòng ở mỗi lần lưu, nên người chỉ được
cấp quyền sửa chi Giáp sẽ bị máy chủ từ chối ngay vì trong đống ấy có cả chi
Ất. Lối "gửi cả cây" **giết chết đúng lý do của cả cuộc chuyển nhà**.

**Khác biệt tồn tại vì phân quyền, không phải vì tốc độ.** Ai định "đơn giản
hoá" bằng cách gửi cả cây thì đang gỡ bỏ đúng điều app này chuyển sang Supabase
để làm được.

⚠ Hệ quả kéo theo, và nó tinh vi: `hinh-dang.bangNhau()` **không được** so
bằng `JSON.stringify`. Hai object cùng nội dung mà khác thứ tự khoá cho ra hai
chuỗi khác nhau — và điều đó xảy ra thật, vì bản ghi ráp từ cơ sở dữ liệu có
thứ tự khoá theo bảng tên, còn bản ghi `domains/person.js` vừa dựng thì theo mã
nguồn của nó. Dùng `stringify` thì mỗi lần lưu ghi lại toàn bộ 681 người, app
**vẫn chạy đúng hàng tháng**, rồi ngày bật giới hạn theo nhánh là mọi lần lưu
của mọi người đều bị từ chối. `kiem-thu/kiem-hinh-dang.mjs` có một phép gác
đúng chỗ này.

---

## 7. `changeLog` trong trình duyệt KHÔNG phải lịch sử

`rapCay()` nạp một mảng `changeLog` rút gọn — chỉ có `{ target }`, không ngày,
không người sửa, không giá trị cũ/mới.

Nó tồn tại vì **đúng một lý do**: `utils/id.js` quét `changeLog` để không cấp
lại một mã đã từng dùng. *"Cấp lại một mã đã dùng là kiểu hỏng tệ nhất trong
gia phả: không có gì báo lỗi, chỉ là mọi câu chuyện cũ về mã ấy lặng lẽ dính
sang một người khác."*

Cắt bớt thì không được — cắt đúng chỗ chứa mã lớn nhất là dựng lại đúng cái
hỏng ấy. Nên thay vì cắt, `luoc-do/04-view-ma-da-dung.sql` rút theo chiều khác:
**chỉ trả về danh sách mã**, bỏ hết phần còn lại.

⚠ **Đừng hiện mảng ấy lên màn hình**, và đừng mở rộng nó — nó nạp ở mọi lần mở
app. Lịch sử thật nằm nguyên trong bảng `change_log`; ngày nào làm màn hình xem
lịch sử thì đọc thẳng bảng ấy qua `sb.js`.

---

## 8. Giá trị hợp lệ

Ràng buộc `check` đã viết trong `luoc-do/01-bang.sql`; đây là bản tra nhanh.

| Trường | Giá trị |
|---|---|
| `persons.sex` | `M` · `F` · `U` |
| `unions.status` | `married` · `divorced` · `widowed` · `unknown` |
| `union_children.relation` | `birth` · `adopted` · `step` · `foster` · `thua_tu` |
| `tree_members.role` | `chu` · `sua` · `xem` · `sao_luu` ⁽¹⁾ |
| `imports.source` | `GEDCOM` · `EXCEL` |
| `trees.tree_code` | chữ HOA, chữ số, gạch dưới. Gạch nối `-` thì GEDCOM 7.0 không nhận |
| `names[].type` | `chinh` · `huy` · `tu` · `thuy` · `phap_danh` · `thuong_goi` · `khac` |

⁽¹⁾ **`sao_luu` không phải một người** — nó là vai của tài khoản máy dùng khi đi
chép dữ liệu hằng đêm, thêm vào `luoc-do/05-sao-luu.sql` (04/09/2026). Vai này
**đọc được mọi dòng nhưng không ghi được dòng nào**: `co_the_sua()` chỉ nhận
`chu` và `sua`, mà cửa ghi duy nhất `luu_cay()` hỏi đúng hàm ấy. Đừng gán vai
này cho người thật, và đừng đưa nó vào màn hình chọn quyền của app.

⚠ Sáu trường thông dụng (`title`, `occupation`, `education`, `religion`,
`residence`, `nationality`) **cố ý không có danh sách chọn** — gia phả cũ chép
bằng chữ của người chép, ép vào danh sách là bắt người nhập chọn cái gần đúng
rồi quên mất chữ gốc. Cái giá: *"Phật giáo"* và *"đạo Phật"* máy không biết là
một. Chấp nhận.

⚠ `nationality` là **DÂN TỘC**, không phải quốc tịch.
