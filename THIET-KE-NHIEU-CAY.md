# THIẾT KẾ — Nhiều gia phả trong một phần mềm

*Lập 05/09/2026 · Chốt trước khi viết dòng mã đầu tiên*

> **Tên file cố định, không có `_Vxx`** — lịch sử để git giữ.
>
> Nguồn: yêu cầu chủ dự án 05/09/2026, cộng ba câu chủ dự án chốt trong cùng
> phiên, cộng phép đo trên `02-rls.sql` · `06` · `07` · `08` · `01-bang.sql`.
>
> **Đọc file này khi**: đụng vào quyền cấp hệ thống, danh sách gia phả, tạo
> cây mới, hoặc mã người xuyên cây. **Không đọc khi** chỉ sửa cách vẽ sơ đồ.
>
> Trang Quản trị có tài liệu riêng: `THIET-KE-QUAN-TRI.md`. File này nói về
> **tầng dưới nó** — cái mà bốn khu của trang ấy sẽ đứng lên trên.

---

## 0. Ba câu chủ dự án đã chốt — 05/09/2026

| Câu | Chốt |
|---|---|
| Quản trị toàn hệ thống nhìn tới đâu trên cây nhà khác? | **Đọc VÀ SỬA được mọi cây** |
| Đăng nhập xong thấy danh sách cây nào? | **Mọi cây — nhưng CHỦ CÂY tự bật/tắt cho người lạ thấy tên cây mình** |
| Người dựng cây mới thì mã cũ của họ xử lý sao? | **Cây mới cấp mã riêng, thêm một cột trỏ về cây cũ** |

⚠ Câu thứ nhất **lật một luật đã ghi thành chữ** trong `KE-HOACH.md`:
*"không có siêu quản trị toàn hệ thống… không ai thấy cây mình không có tên
trong đó"*. Từ nay câu ấy hết đúng, và mọi chỗ chép lại nó phải sửa. Ghi ở đây
để người đọc sau không tưởng là mã đi chệch tài liệu.

---

## 1. Ba tầng quyền — trước đây chỉ có hai

Chủ dự án phân biệt *"quyền được xem"* khác *"quyền được truy cập cây"*. Đó là
một tầng mới, và nó dựng lại cả bảng quyền:

| Tầng | Thấy được gì | Ai có |
|---|---|---|
| **1 · Thấy tên** | Tên cây · mã cây · chủ sở hữu · số người. **Không một dòng nội dung nào** | Mọi tài khoản đã đăng nhập, với những cây chủ cây bật công tắc cho thấy |
| **2 · Truy cập** | Toàn bộ nội dung cây: 681 con người, hôn nhân, ảnh | Có dòng `tree_members` **đã duyệt** · hoặc cây ấy là **cây mặc định** · hoặc quản trị toàn hệ thống |
| **3 · Sửa** | Ghi được | Vai `sua` + đã gắn mã người + trong **phạm vi trực hệ** · hoặc hai hạng quản trị của cây · hoặc quản trị toàn hệ thống |

Tầng 1 là chỗ **duy nhất** trong cả dự án mà một người không có chân trong cây
vẫn nhận về một thứ gì đó. Nó tồn tại vì một lý do rất cụ thể: **để xin được
quyền thì phải biết là có cái để xin.** Không có tầng này, người muốn vào phải
hỏi nhau ngoài phần mềm.

⚠ **Tầng 1 lộ địa chỉ email của chủ cây** cho mọi tài khoản đã đăng nhập. Đó
là cái giá, và nó **chính là công dụng** — email là đường liên hệ để xin quyền.
Chủ cây không muốn thì tắt công tắc, cây biến mất khỏi danh sách người lạ.
Nói thẳng ở đây để sau này không ai phát hiện ra rồi coi là lỗi.

---

## 2. Quản trị toàn hệ thống — chèn ở ĐÂU, và vì sao chỉ hai chỗ

### Phát hiện làm cho việc này rẻ

Đo trên bốn file SQL: **mọi hàm quyết quyền đều hỏi đúng một hàm** —
`vai_tro(p_tree)`. Cây phả hệ của chúng:

```
                       vai_tro(p_tree)          ← đọc tree_members
                             │
        ┌──────────┬─────────┼──────────┬──────────────┐
   co_the_sua  co_the_sua_  co_the_   co_the_kiem_   ghi_thang
        │        nguoi      quan_tri     duyet
        │          │
        │     pham_vi_sua

   la_thanh_vien(p_tree)     ← ĐỌC THẲNG tree_members, KHÔNG qua vai_tro
```

Nên **hai chỗ sửa, không phải mười một**:

```sql
-- Chỗ 1 — vai_tro(): quản trị toàn hệ thống mang vai cao nhất ở MỌI cây
select case
  when public.la_quan_tri_he_thong() then 'quan_tri_he_thong'
  else (select role from public.tree_members
         where tree_id = p_tree and user_id = auth.uid())
end;

-- Chỗ 2 — la_thanh_vien(): nó không đi qua vai_tro(), phải sửa riêng
```

Sáu hàm còn lại **tự đúng theo**, không phải chạm vào. Đó là phần thưởng của
việc b87 → b97 luôn gom câu trả lời về một chỗ.

### ⚠ Ba cái bẫy của chính chỗ sửa ấy

**1 · Quên `la_thanh_vien()` là sinh ra trạng thái mâu thuẫn nhất có thể có:**
quản trị toàn hệ thống **sửa được mà không đọc được**. `luu_cay()` cho qua vì
nó hỏi `co_the_sua()`, còn RLS chặn vì nó hỏi `la_thanh_vien()`. Triệu chứng
sẽ là *"bấm Lưu báo thành công mà màn hình trống"* — mất nửa buổi mới lần ra.

**2 · Hàm `la_quan_tri_he_thong()` phải viết dạng KHẲNG ĐỊNH và bọc
`coalesce(…, false)`.** Đây đúng cái bẫy `null` đã mở một lỗ leo quyền thật
ngày 04/09 (b94) mà 57 phép kiểm tự động báo xanh. Bảng `tai_khoan` có thể
chưa có dòng cho người ấy → `select … ` trả `null` → `case` không nhận nhánh
nào → nếu viết phủ định là lọt.

**3 · Sửa `vai_tro()` là sửa NỀN MÓNG của toàn bộ hệ thống quyền.** Không có
hàm nào trong dự án được nhiều chỗ dựa vào hơn nó. Bước làm việc này **bắt
buộc** có: bộ kiểm với kiểm chứng ngược *(bẻ gãy mã có chủ ý, xác nhận bài
kiểm bắt được)*, và một phép thử gọi thẳng REST như H9 — vì chỉ REST mới
chứng minh được hàng rào đứng vững khi người ta đi cửa sau.

### Quản trị toàn hệ thống sửa thì có phải xếp hàng kiểm duyệt không?

**Không.** `ghi_thang()` đã có sẵn nhánh `vai_tro in ('quan_tri_he_thong',
'quan_tri') → true`, nên khi `vai_tro()` trả vai ấy thì việc này tự đúng.
Nhưng lần Lưu vẫn **ghi đủ vào `change_log`** như mọi người — không có đường
ghi nào không để lại vết, kể cả của người quyền cao nhất.

---

## 3. Cây mặc định — và một chỗ rò rỉ suýt bỏ sót

Chủ dự án: *"quản trị hệ thống có thể chọn 1 cây mặc định cho mọi tài khoản có
thể xem, có thể chọn không có cây mặc định nào."*

Cách rẻ nhất trông như thế này — và **nó sai**:

```sql
-- ❌ ĐỪNG LÀM THẾ NÀY
la_thanh_vien(p_tree) := (có dòng tree_members) or p_tree = cay_mac_dinh()
```

Vì `la_thanh_vien()` đang gác **mười** bảng, trong đó có ba bảng **không phải
nội dung gia phả**:

| Bảng | Mở cho người lạ nghĩa là gì |
|---|---|
| `tree_members` | Lộ **email của cả họ** cùng vai trò từng người |
| `change_log` | Lộ ai sửa gì lúc nào — nhật ký kiểm toán |
| `imports` | Sổ nhập liệu |

Cây mặc định là để **cho người ta xem gia phả**, không phải để phát danh bạ.

### Đường đúng: tách làm hai hàm

```sql
co_the_xem_cay(p_tree)   -- = la_thanh_vien(p_tree) or p_tree = cay_mac_dinh()
                         -- gác: persons · unions · union_children · media · sources · trees
la_thanh_vien(p_tree)    -- giữ nguyên nghĩa cũ
                         -- gác: tree_members · change_log · imports · user_settings
```

⚠ **Bẫy NULL trong `co_the_xem_cay` (đo được 06/09/2026):** Khi `cay_mac_dinh()`
trả về `null` (chưa cấu hình cây mặc định), phép so sánh `p_tree = null` cho ra
`null`. Trong SQL, `false OR null` cho ra `null` chứ không cho ra `false`! Vì vậy
thân hàm `co_the_xem_cay` bắt buộc phải bọc `coalesce(..., false)` và canh
`(cay_mac_dinh() IS NOT NULL AND p_tree = cay_mac_dinh())`, nếu không hàm sẽ trả
`null` cho người lạ. Đã kiểm chứng tại `kiem-thu/ban-thu-sql/kich-ban-kiem-b102.sql`.

⚠ **Người vào bằng cửa cây mặc định không có vai** (`vai_tro()` trả `null`),
nên `co_the_sua()` trả `false` — họ xem, không sửa. Đúng ý chủ dự án, và đúng
mà không cần thêm một câu `if` nào.

### Chỗ lưu

Cây mặc định là **cấu hình cấp hệ thống, không thuộc cây nào** — đúng như
"ai được tạo cây mới". `trees` không phải chỗ của nó: đặt cờ `la_mac_dinh` lên
`trees` thì không có gì ngăn hai cây cùng bật cờ.

```sql
create table public.cau_hinh (
  chi_mot_dong  boolean primary key default true check (chi_mot_dong),
  cay_mac_dinh  uuid references public.trees(id) on delete set null,
  cap_nhat_luc  timestamptz not null default now(),
  cap_nhat_boi  text not null default ''
);
```

Mẹo `boolean primary key check (chi_mot_dong)` làm bảng **không thể có dòng
thứ hai** — rẻ hơn một trigger, và cơ sở dữ liệu tự canh. `on delete set null`
trả lời sẵn câu *"xoá cây đang là cây mặc định thì sao"*: không còn cây mặc
định, không phải một khoá ngoại gãy.

---

## 4. Bảng mới và cột mới — toàn bộ

### Bảng `tai_khoan` — tầng người, không thuộc cây nào

```sql
create table public.tai_khoan (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  ma_ngan                 text not null unique,   -- 'TK7Q3M' — hiện cho người dùng đọc
  la_quan_tri_he_thong    boolean not null default false,
  duoc_tao_cay            boolean not null default false,
  tao_luc                 timestamptz not null default now()
);
```

Bảng này trả lời **ba** câu mà `tree_members` không trả lời được, vì cả ba đều
không thuộc về cây nào:

1. Ai là quản trị toàn hệ thống?
2. Ai được **dựng cây mới**? — chủ dự án: *"phải xin phép và được cấp quyền
   mới tạo được"*. Đây chính là chỗ cấp phép ấy.
3. **Mã ngắn của tài khoản** — chủ dự án: *"danh sách tài khoản cần hiển thị
   id của người để người đó biết mình là ai, có thể tìm đúng người để chỉ định
   (tên người trùng nhiều)"*.

⚠ **Vì sao không dùng thẳng `auth.users.id`.** Nó là uuid 36 ký tự
(`a3f2…-…-…`) — không ai đọc qua điện thoại cho nhau được, và gõ nhầm một ký
tự thì gán quyền cho người khác. `TK7Q3M` sáu ký tự đọc được, và `unique` bắt
buộc nên không đụng nhau.

⚠ **Mọi tài khoản phải có dòng ở đây**, kể cả người vừa đăng ký, nếu không thì
họ không có mã ngắn để ai chỉ định. Cần một trigger `after insert on
auth.users`. Đây là chỗ **duy nhất** trong dự án đụng vào schema `auth` —
phải viết ra và phải có phép kiểm, vì nó chạy ngoài tầm mắt.

### Cột thêm vào `trees`

| Cột | Kiểu | Để làm gì |
|---|---|---|
| `chu_so_huu` | `uuid references auth.users(id)` | Người dựng cây. Hiện trong danh sách, và là người mặc định mang vai `quan_tri` (Quản trị gia phả) của cây |
| `cho_nguoi_la_thay_ten` | `boolean not null default false` | Công tắc tầng 1. **Mặc định TẮT** — cây đã có phải do chủ bật, không tự nhiên phơi ra |

⚠ `default false` là quyết định có chủ ý: cây `NTBK7R3` và cây `NPGQ8C9` đang
có sẽ **không** tự hiện cho người lạ sau khi chạy file SQL. Muốn hiện thì chủ
bật tay. Mặc định mở là kiểu hỏng không ai để ý cho tới khi đã muộn.

### Cột thêm vào `persons` — mục 6

### Hàm mới

| Hàm | Trả về | Ghi chú |
|---|---|---|
| `la_quan_tri_he_thong()` | `boolean` | `coalesce(…, false)`. Nền của tất cả |
| `cay_mac_dinh()` | `uuid` | Đọc `cau_hinh`, có thể `null` |
| `co_the_xem_cay(p_tree)` | `boolean` | Gác 6 bảng nội dung — mục 3 |
| `duoc_tao_cay()` | `boolean` | `tai_khoan.duoc_tao_cay` hoặc quản trị toàn hệ thống |
| `ds_gia_pha()` | `table(...)` | Danh sách cây cho màn hình chọn — mục 5 |
| `tao_gia_pha_moi(p_ten, p_ma_cay, p_note)` | `jsonb` | Mục 7 |
| `ma_tai_khoan_cua_toi()` | `text` | Cho màn hình Cài đặt hiện *"Mã tài khoản của bạn"* |
| `dat_cay_mac_dinh(p_tree)` | `jsonb` | Chỉ quản trị toàn hệ thống. `null` = không có cây mặc định |

### Hàm phải SỬA

| Hàm | Sửa gì | Rủi ro |
|---|---|---|
| `vai_tro(p_tree)` | Thêm nhánh quản trị toàn hệ thống | ⚠⚠ **Nền móng.** Mục 2 |
| `la_thanh_vien(p_tree)` | Thêm nhánh quản trị toàn hệ thống | ⚠⚠ Quên là sinh trạng thái *sửa được mà không đọc được* |
| 6 luật RLS đọc | `la_thanh_vien` → `co_the_xem_cay` trên `trees`·`persons`·`unions`·`union_children`·`media`·`sources` | ⚠ Đổi nhầm bảng `tree_members` là lộ email cả họ |
| `xin_vao_cay(p_tree)` | Bỏ *"có từ hai cây trở lên thì từ chối"* — nay là chuyện thường | Đang tự chặn khi có cây thứ hai |
| 8 chỗ `coalesce(p_tree, … limit 1)` | Bắt truyền `p_tree` tường minh | Hỏng 3, mục 8 |

---

## 5. Màn hình danh sách gia phả

Đây là **khu 1** của `THIET-KE-QUAN-TRI.md`, nay biết rõ phải hiện gì:

| Cột | Nguồn |
|---|---|
| Gia phả | `trees.name` |
| Mã | `trees.tree_code` |
| Chủ sở hữu | email của `trees.chu_so_huu` |
| Số người | đếm `persons` chưa xoá |
| Vai của tôi | `vai_tro()` — hoặc *"chưa có quyền"* |
| Trạng thái | **Đang mở** · Truy cập được · **Cây mặc định** · Chưa có quyền |
| Thao tác | **Chọn** *(nếu truy cập được)* · **Xin quyền** *(nếu chưa)* · **Đã nộp đơn ngày…** |

⚠ **`ds_gia_pha()` phải là hàm `security definer`, KHÔNG mở RLS trên `trees`.**
RLS lọc theo **dòng**; việc này cần lọc theo **cột** — người lạ thấy tên cây
nhưng không được thấy `root_person_id`, `note`, `revision`. Đúng cùng lý lẽ đã
ghi ở `THIET-KE-QUAN-TRI.md` mục 7.9 về việc giấu người còn sống.

Nút **Xin quyền** gọi `xin_vao_cay(p_tree, loi_nhan)` — hàm đã có từ b95,
không đẻ bảng mới, không đẻ màn hình mới. Chỉ phải gỡ chỗ nó tự từ chối khi hệ
thống có nhiều hơn một cây.

---

## 6. Mã người xuyên cây — cột `noi_ve`

### Bài toán chủ dự án nêu

Ông `NTBK7R3_P0013` dựng cây cho bên nhà vợ, mã cây mới là `LBT…`. Trong cây
mới ông ấy phải nối được về cây cũ.

### Cách chốt

```sql
alter table public.persons add column noi_ve text not null default '';
-- 'NTBK7R3_P0013' — mã người ở cây kia, nguyên văn
```

Trong cây `LBT9X2` ông ấy là `LBT9X2_P0001`, `noi_ve = 'NTBK7R3_P0013'`.
App hiện một dòng dưới hồ sơ: *"Người này cũng có trong gia phả Nguyễn Trọng
Bác"* + nút nhảy sang — **nút chỉ hiện nếu người đang xem truy cập được cây
kia**, nếu không thì hiện chữ mà không hiện nút.

### Vì sao KHÔNG chép nguyên mã cũ sang cây mới

Chép nguyên thì hai cây có hai bản ghi mang cùng một mã, và chúng **lệch nhau
dần**: sửa ngày mất ở cây này, cây kia không biết. Rồi phải trả lời tiếp — ai
sửa được? xoá bên này thì bên kia sao? Đó là bài toán đồng bộ hai chiều giữa
hai cây **hai chủ khác nhau, hai chính sách kiểm duyệt khác nhau**. Dự án này
không có chỗ chứa nó, và nhu cầu thật chỉ là *nối được khi cần* — tức **liên
kết**, không phải **dùng chung bản ghi**.

### ⚠ Cái bẫy đã có sẵn lời cảnh báo, phải áp ngay

`DU-LIEU.md` mục 3 điều 7 kể chuyện `branch_id`: **một cột không có tên trong
bảng `TEN_PERSON` của `hinh-dang.js` thì mỗi lần lưu sẽ bị ghi `null` đè lên,
và không có gì báo lỗi khi điều đó xảy ra.** `noi_ve` là đúng loại cột ấy.

Nên bước làm việc này phải có một phép kiểm: **lưu một vòng rồi đọc lại,
`noi_ve` còn nguyên**. Không có phép kiểm ấy thì cột này sẽ âm thầm rỗng.

### Chưa làm trong đợt này

Nối **quan hệ** giữa hai cây (ông A ở cây này là con ông B ở cây kia) — đó là
đồ thị bắc qua hai cây, và `pham_vi_sua()` sẽ phải đi theo. Chưa ai cần. Cột
`noi_ve` nói *"cùng một con người"*, không nói *"cùng một gia đình"*.

---

## 7. Tạo cây mới

`repo.taoGiaPhaMoi()` hôm nay trả `lyDo: 'chualam'`.

```
duoc_tao_cay()  →  tao_gia_pha_moi(p_ten, p_ma_cay, p_note)
                        ├── insert trees (chu_so_huu = auth.uid())
                        └── insert tree_members (role='quan_tri_he_thong',
                                                  approved=true)
                            ── TRONG CÙNG MỘT GIAO DỊCH
```

⚠⚠ **CHỖ NÀY ĐÃ SAI MỘT LẦN, VÀ CÁCH SAI ĐÁNG GIỮ LẠI.**

Bản b104 (sáng 08/09/2026) đổi vai ấy từ `quan_tri` thành `quan_tri_he_thong`,
lý do ghi là *"`co_the_quan_tri()` chỉ nhận một vai, cấp `quan_tri` thì người
dựng cây không duyệt được đơn của cây mình"*. **Chủ dự án bác bỏ ngay chiều
hôm ấy**, và câu bác nói là câu đúng:

> *"không ai được chỉ định quyền cho chính mình. mặc định người tạo cây thì có
> quyền quản trị với cây đó."*

Cái sai không nằm ở kết luận mà ở **chỗ chữa**: tôi chữa triệu chứng (nâng
vai) thay vì chữa nguyên nhân (hàm hỏi nhầm chỗ). b105 chữa nguyên nhân —
`co_the_quan_tri()` nay neo vào **cột `trees.chu_so_huu`**, không neo vào mã
vai. Chủ cây vì thế mang vai `quan_tri` mà vẫn duyệt được đơn của cây mình.

**Vai cấp cho người dựng cây là `quan_tri`.** Xem `luoc-do/13-quan-ly-thanh-vien.sql`.

Nhắc lại cho khỏi hiểu nhầm: vai trong `tree_members` là quyền **theo cây**
(mọi nơi hỏi nó đều qua `vai_tro(p_tree)`). Quản trị **toàn hệ thống** đọc ở
chỗ khác hẳn — cờ `tai_khoan.la_quan_tri_he_thong`. Bản b104 không phải lỗ
hổng rò rỉ (đã đo: `do-b104.mjs` HR4, người dựng cây riêng đọc cây `NTB` ra
**0 dòng**); nó sai vì **một chữ mang hai nghĩa**. Từ b105 mã
`quan_tri_he_thong` **không đặt vào `tree_members` được nữa** — ràng buộc của
bảng từ chối nó, nên chuyện ấy không tái hiện được.

⚠ **Hai câu `insert` ấy không được tách rời.** Đẻ ra một `trees` mà không có
dòng `tree_members` là đẻ ra một cây **không ai vào được, kể cả người vừa tạo**
— và vì RLS chặn, chính người ấy cũng không xoá được nó. Chỉ dọn được bằng SQL
Editor.

⚠ **`p_ma_cay` phải kiểm trùng.** Ràng buộc `tree_code_hop_le` chỉ canh chữ
hoa/số/gạch dưới, **không** canh trùng. Hai cây cùng `tree_code` thì mã người
`NTBK7R3_P0013` hết là duy nhất và cột `noi_ve` ở mục 6 trỏ vào chỗ mập mờ.
→ Thêm `unique` trên `trees.tree_code` trong cùng file SQL này.

Cây mới sinh ra **rỗng**, chưa có người nào. Người tạo tự thành quản trị của
cây, rồi thêm người đầu tiên bằng màn hình thường.

---

## 8. Ba lỗi phải sửa TRƯỚC khi có cây thứ hai

Đo ở b99, chép lại đây vì chúng chặn đúng việc này:

| | Lỗi | Sửa ở đâu |
|---|---|---|
| **Hỏng 1** | `chonGiaPha()` `delete().eq('user_id',…)` xoá sạch `user_settings` → **đổi cây là mất người trung tâm mặc định của mọi cây** | `sb.js` · tách *"đang mở cây nào"* ra khỏi `user_settings` |
| **Hỏng 2** | `state.hienNgayGio` không lưu ở đâu — tắt trình duyệt là mất | `user_settings`, **sau khi** gỡ Hỏng 1 |
| **Hỏng 3** | `coalesce(p_tree, (select id from trees limit 1))` × 8, không `order by` → hỏi nhầm cây, im lặng | `07` và `08` — bắt truyền `p_tree` tường minh |

⚠ **Hỏng 3 nguy hiểm hơn vẻ ngoài của nó khi có quản trị toàn hệ thống.**
Hôm nay nó chỉ hiện sai số. Nhưng người mang vai mới có quyền ở **mọi** cây,
nên một hàm chọn nhầm cây sẽ **duyệt nhầm hàng chờ của cây khác** — và duyệt
xong thì không có gì báo là đã nhầm.

---

## 9. Kiểm duyệt trình bày dạng bảng phẳng

Chủ dự án: *"nên thiết kế theo bảng excel phẳng có trình bày để biết nội dung
thêm mới, chỉnh sửa theo các phần mềm thông dụng hay làm."*

**Dữ liệu đã đủ, không đổi bảng nào.** `change_log.truoc` giữ **cả dòng cũ**
của mọi bản ghi bị đụng; giá trị *sau* là dòng hiện tại trong bảng.

```
Người              Trường        Trước          Sau           Loại
P0012 Nguyễn Văn A ngày sinh     1948           12/03/1948    sửa
P0012 Nguyễn Văn A nơi ở         (trống)        Hà Nội        thêm
P0684 Nguyễn Thị B —             —              —             THÊM MỚI
```

Ba luật của cách trình bày này:

1. **Xem theo Ô, nhưng DUYỆT theo lần Lưu.** `THIET-KE-QUAN-TRI.md` mục 7.7
   đã chốt: đơn vị duyệt là một lần bấm Lưu. Cho nhận từng ô thì phải trả lời
   *"nhận nửa lần Lưu thì `revision` thành bao nhiêu"* — không có câu trả lời
   rẻ. Bảng phẳng là **cách nhìn**, không phải cách duyệt.
2. **Trường trống thì không vẽ dòng ấy** — `CLAUDE.md` mục 7. Một lần Lưu đụng
   ba trường thì bảng có ba dòng, không phải bốn mươi dòng toàn dấu gạch.
3. **Chỗ so sánh nằm ở đâu**: hàm làm phẳng là hàm thuần trên hai object
   người → thuộc `domains` về phân lớp. Nhưng `domains/` **không được sửa**
   (10 file chép nguyên từ bản Apps Script). → Thêm **file mới**
   `domains/so-sanh.js`, không sửa file cũ; `/kiem-tra` phép 9 vẫn so đúng 10
   file kia. Quyết định này phải nhắc lại ở bước làm.

Nút **xuất CSV** của bảng phẳng: làm được rẻ, nhưng chưa ai xin. Để sau.

---

## 10. Những gì cố ý KHÔNG làm

1. **Không đẻ bảng `membership_requests`.** Hàng chờ vẫn là
   `tree_members.approved = false` — `THIET-KE-QUAN-TRI.md` mục 7.3.
2. **Không mở RLS trên `trees` cho người lạ.** Lọc cột phải bằng hàm
   `security definer`, mục 5.
3. **Không cho quản trị toàn hệ thống bỏ qua `change_log`.** Quyền cao nhất
   vẫn để lại vết.
4. **Không đồng bộ hai chiều giữa hai cây.** Mục 6.
5. **Không nối quan hệ cha–con bắc qua hai cây.** Mục 6, phần cuối.
6. **Không dựng phân quyền bằng JavaScript.** Máy chủ là hàng rào duy nhất;
   app hỏi chỉ để hiện một câu tử tế thay vì một bảng trống.
7. **Không đổi mã người sang uuid.** `BAT-DAU.md` mục 1.
8. **Không cho tạo cây mới từ màn hình Cài đặt** — nó thuộc trang Quản trị,
   khu 1.

---

## 11. ✓ ĐÃ CHỐT: TÊN GỌI VÀ KIẾN TRÚC MÃ VAI (05/09/2026)

Chủ dự án đã chốt dứt khoát quyết định về tên gọi hiển thị và nguyên tắc phân quyền ở Lượt 48:

### 1. Hệ thống tên gọi hiển thị chính thức 4 vai
Chỉ đổi chữ tiếng Việt hiển thị trên giao diện (trong `settings.js` hàm `vaiTroBangChu()`), giữ nguyên mã vai kỹ thuật:

| Mã trong bảng | Tên hiển thị chính thức | Ý nghĩa / Phạm vi |
|---|---|---|
| `quan_tri_he_thong` | **Quản trị hệ thống** | Siêu quản trị của cả hệ thống phần mềm |
| `quan_tri` | **Quản trị gia phả** | Người quản trị, kiểm duyệt dữ liệu của một cây/chi cụ thể |
| `sua` | **Thành viên họ tộc** | Con cháu trong họ, sửa thông tin trong phạm vi trực hệ |
| `xem` | **Khách** | Người chỉ có quyền xem dữ liệu |
| `sao_luu` | **Tài khoản sao lưu** | Tài khoản chuyên dụng để chạy sao lưu tự động |

*(Đã cập nhật vào `settings.js` 1.29.1)*.

### 2. Kiến trúc mã vai và phân định loại tài khoản
- **Không đẻ thêm mã `quan_tri_toan_he_thong`**: Giữ nguyên và dùng đúng mã `quan_tri_he_thong` đã có trong hệ thống.
- **Phân biệt rạch ròi Loại tài khoản và Quyền trên từng cây**:
  + Tài khoản Quản trị hệ thống (`quan_tri_he_thong`) là vai trò quản trị tối cao của toàn hệ thống phần mềm.
  + Quyền thao tác dữ liệu gia phả gắn liền với từng cây: Người tạo cây nào thì có vai Quản trị gia phả (`quan_tri`) của cây đó; sang cây khác của người khác thì không mặc nhiên có quyền can thiệp nếu không được chủ cây kia phân quyền.
- Thiết kế chi tiết cấu trúc bảng tài khoản cấp hệ thống ở b102 do Claude Code quyết định kỹ thuật ở phiên sau, bám sát đúng nguyên tắc này.

### 3. ✓ CHỐT THÊM 08/09/2026 (b105) — ai đổi được quyền, và luật không ngoại lệ

Chủ dự án chốt dứt điểm sau khi bác bỏ chỗ lệch của b104:

| Hạng | Nhận ra bằng | Sửa dữ liệu | Duyệt nội dung | Đổi vai · gắn mã người · bật tin cậy · **duyệt đơn xin vào cây** |
|---|---|---|---|---|
| **Quản trị hệ thống** | cờ `tai_khoan.la_quan_tri_he_thong` | ✓ mọi cây | ✓ | ✓ mọi cây |
| **Chủ cây** *(người tạo)* | cột `trees.chu_so_huu` | ✓ cây mình | ✓ | ✓ **chỉ cây mình**, cấp tối đa `quan_tri` |
| **Quản trị gia phả** (`quan_tri`) | `tree_members.role` | ✓ | ✓ | **✗** |
| **Thành viên họ tộc** (`sua`) | `tree_members.role` | trực hệ, qua hàng chờ | ✗ | ✗ |
| **Khách** (`xem`) | `tree_members.role` | ✗ | ✗ | ✗ |

Nguyên văn chủ dự án:

> *"vai trò quản trị, mặc định người tạo cây thì có quyền quản trị với cây đó,
> có đủ các quyền sửa dữ liệu, duyệt nội dung, đổi vai và gắn thành viên cho
> tài khoản trong hệ thống. việc đổi vai thì quyền tối đa cấp cho tài khoản
> khác là quản trị và áp dụng cho cây mình tạo. quy tắc không được đặt quyền
> cho chính bản thân để không bao giờ có thể leo thang quyền, chiếm quyền cao
> hơn trong hệ thống."*
>
> *"người quản trị được chủ cây gán, chỉ có quyền sửa, duyệt nội dung, không
> có quyền thay đổi quyền của người khác."*

**Ba điều rút ra, và cả ba đều đã thành mã ở `luoc-do/13`:**

1. **Duyệt ĐƠN XIN VÀO CÂY nằm ở cột phải, không nằm ở "duyệt nội dung".**
   Nhận một người vào cây là **cấp quyền đọc**, không phải kiểm một lần sửa.
   Nên `quan_tri` được mời phụ việc duyệt nội dung nhưng **không** duyệt đơn.

2. **Mỗi cây chỉ ĐÚNG MỘT người đổi được quyền, và người ấy không đổi được
   quyền của chính mình.** Nhờ vậy không có cảnh hai quản trị hạ vai lẫn nhau,
   cũng không có cảnh người được mời phụ việc chiếm cây. Chủ cây
   (`trees.chu_so_huu`) **không ai hạ vai hay gỡ được**, kể cả Quản trị hệ thống.

3. **Luật "không tự đặt quyền cho mình" phải gác NĂM cửa, không riêng cửa vai.**
   Hai cửa ngầm, không ai nghĩ tới khi nghe chữ *"đổi quyền"*:
   - **gắn mã người** cho mình vào một cụ tổ → `pham_vi_sua()` mở ra **cả cây**;
   - **bật `tin_cay`** cho mình → ghi thẳng, **bỏ qua hàng chờ kiểm duyệt**.

   Luật **không có ngoại lệ**, kể cả cho Quản trị hệ thống — họ đã có mọi quyền
   ở mọi cây qua cờ `tai_khoan`, nên chặn họ tự trỏ vào mình không lấy đi khả
   năng nào. *Một luật không ngoại lệ thì kiểm được; một luật có một ngoại lệ
   thì phải kiểm cả ngoại lệ, và ngoại lệ là chỗ lỗ hổng hay nằm.*

**Và một chức năng bị bỏ sót, chủ dự án bổ sung cùng ngày: BÀN GIAO GIA PHẢ.**
Trước b105 `chu_so_huu` là vĩnh viễn — chỉ `tao_gia_pha_moi()` đặt một lần,
không hàm nào đổi. Nay có `doi_chu_cay(p_tree, p_user_moi)`: chủ cũ ở lại làm
`quan_tri`, chủ mới nhận cột `chu_so_huu` **và** một dòng `tree_members` trong
cùng một giao dịch — thiếu dòng ấy là chủ mới *sửa được mà không đọc được*.


### 4. ✓ CHỐT 08/09/2026 (b107) — VÀO CÂY LÀ QUYỀN CỦA MỖI NGƯỜI

Nguyên văn chủ dự án:

> *"quyền vào gia phả hay không là quyền mỗi người nên quản trị hệ thống cũng
> chỉ có thể mời người vào gia phả rồi để người dùng quyết định có vào hay
> không."*

**Không đường nào đưa được một tài khoản vào cây bằng một cú bấm.** Vào cây
luôn cần **hai chữ ký**: một bên ngỏ lời, một bên nhận. Hôm nay đã có một
chiều — người ta *xin*, quản trị *duyệt*. b107 thêm chiều ngược lại — quản trị
*mời*, người ta *nhận*. Luật này **không có ngoại lệ cho Quản trị hệ thống**:
họ mời được vào mọi cây, nhưng không nhận hộ ai.

**Ba trạng thái, một bảng `tree_members`** — không đẻ bảng mới, đúng
`THIET-KE-QUAN-TRI.md` mục 7 điều 3:

| Dòng | Nghĩa | Đọc được cây? |
|---|---|---|
| `moi_boi` trống · `approved=false` | **đơn xin vào** — người ta gõ cửa | không |
| `moi_boi` có · `approved=false` | **lời mời** — mình gõ cửa nhà người ta | **không** |
| `approved=true` | thành viên thật | có |

⚠ **CÁI BẪY, đo được trong mã đang chạy, không phải suy đoán.** `la_thanh_vien()`
của `11-quyen-he-thong.sql` cho vào cây khi `approved` **hoặc** vai nằm trong
`('quan_tri_he_thong','quan_tri','sao_luu')` — mệnh đề đi tắt ấy `07` cố ý đặt
vào và b102 đã trả giá một lần để giữ nó. Nghĩa là **một lời mời ghi sẵn vai
`quan_tri` vào cột `role` sẽ mở cây ra ngay lúc mời**, trước khi người kia bấm
gì. Đúng thứ luật trên cấm.

Nên lời mời giữ vai được mời ở **cột riêng `moi_vai`**; cột `role` của dòng ấy
là `xem` cho tới lúc người ta nhận, và lúc nhận mới chép sang. Cách này **không
đụng vào `la_thanh_vien()`** — hàm nền móng mà mọi hàm quyết quyền đều hỏi, và
là chỗ b102 đã chứng minh sửa gọn một dòng thì sao lưu đêm ra file rỗng.

**Nhận lời mời KHÔNG vi phạm luật "không tự đặt quyền cho mình"** (mục 3),
và ranh giới nằm ở chỗ này: người nhận chỉ lật được đúng cột `approved`, trên
đúng dòng của mình, và **chỉ khi dòng ấy có `moi_boi`** — tức có người đủ
thẩm quyền đã ký trước. Họ không đổi được `moi_vai`, không đổi được `person_id`,
không bật được `tin_cay`. Ai tự tạo dòng mời cho mình thì `moi_boi` là chính
họ, và hàm nhận từ chối đúng chỗ ấy.

### 5. ✓ CHỐT 08/09/2026 (b107) — CỜ QUẢN TRỊ HỆ THỐNG BẬT ĐƯỢC TRÊN MÀN HÌNH

Chủ dự án chốt: **có nút bật/tắt cờ `tai_khoan.la_quan_tri_he_thong`, nhưng
không ai trỏ vào chính mình.** Trước b107 cột ấy không có hàm nào đặt — cố ý,
vì đó đúng là lỗ hổng b102 bắt được (*ai cũng tự đặt mình thành Quản trị hệ
thống*).

Luật năm cửa của mục 3 nay là **sáu cửa**, và cửa thứ sáu là cửa cao nhất hệ
thống. Nó gác đúng cùng một câu: `p_user = auth.uid()` thì từ chối, không
ngoại lệ. Nhờ vậy không ai leo thang được — muốn thành Quản trị hệ thống thì
phải có một Quản trị hệ thống khác phong cho.

⚠ **Không chặn được việc hạ nốt người cuối cùng.** Nếu hệ thống chỉ còn một
Quản trị hệ thống, người ấy không tự tắt cờ mình được (luật trên), nhưng hai
người thì tắt lẫn nhau về không được. Phép đo b107 phải có một phép cho chuyện
ấy, và câu trả lời là **đếm trước khi tắt**: còn đúng một cờ đang bật thì hàm
từ chối. Khoá cả nhà rồi vứt chìa là hỏng theo kiểu chỉ sửa được bằng SQL tay.

### 6. ✓ CHỐT 09/09/2026 (b108) — XOÁ GIA PHẢ: HAI CHỮ KÝ + THÙNG RÁC 30 NGÀY

Chủ dự án chốt: *"chủ cây có quyền yêu cầu xoá cây do mình tạo ra"* — và chữ
**yêu cầu** là nghĩa đen: **chủ cây xin, Quản trị hệ thống duyệt.** Cùng khuôn
hai chữ ký đã dùng cho việc vào cây (mục 11.4), và dùng ở đây vì đây là việc
phá nhiều dữ liệu nhất trong cả hệ thống.

Xoá là **đánh dấu, không xoá cứng** — giữ 30 ngày rồi mới dọn. Đúng luật nhà
đã có từ đầu: `CLAUDE.md` mục 7, *"Không xoá cứng. Xoá là đặt cờ `deleted` và
ghi `changeLog`"*. Luật ấy viết cho một người trong sơ đồ; một cây 681 người
thì lý do còn mạnh hơn, và mạnh nhất ở chỗ này: **chưa ai từng thử KHÔI PHỤC
từ bản sao lưu đêm** (`KE-HOACH.md`, còn treo từ 04/09). Nghĩa là hôm nay bản
sao lưu **chưa phải** đường lùi đã kiểm chứng, nên thùng rác phải là đường lùi
thật sự.

**Bốn trạng thái của một cây:**

| `xin_xoa_luc` | `da_xoa_luc` | Nghĩa | Ai đọc được cây |
|---|---|---|---|
| trống | trống | bình thường | như hôm nay |
| **có** | trống | **đang xin xoá** | ⚠ **vẫn như hôm nay** |
| có | **có** | **trong thùng rác** | không ai |
| — | có, quá 30 ngày | dọn được | không ai |

⚠ **Dòng thứ hai là chỗ dễ làm sai nhất.** Một lá đơn xin xoá **không được**
khoá cây lại: đơn còn chờ duyệt, có thể bị từ chối, và trong lúc chờ thì cả
dòng họ vẫn đang dùng. Khoá sớm là biến một lá đơn thành một lệnh.

⚠⚠ **CHỖ KHÓ THẬT SỰ, VÀ NÓ NẰM Ở TẦNG NỀN MÓNG — đọc trước khi viết dòng đầu.**

Cây trong thùng rác phải **không ai đọc được**, và việc ấy phải do máy chủ thi
hành, không phải do màn hình giấu đi (`THIET-KE-QUAN-TRI.md` mục 7 điều 5).
Tức phải sửa hàm quyết quyền. Nhưng có **hai** hàm, và chúng không giống nhau:

- **`co_the_xem_cay()`** — gác nội dung gia phả (`persons`, `unions`…).
  Thêm điều kiện *"chưa vào thùng rác"* vào đây. An toàn.
- **`la_thanh_vien()`** — gác `tree_members`, `change_log`, `imports`,
  `user_settings`. ⚠ **ĐỪNG ĐỘNG VÀO.** Sửa gọn một dòng ở hàm này chính là
  lỗ hổng b102: bản sao lưu đêm ra file rỗng, **không báo lỗi**, và mất nửa
  buổi mới lần ra. Và ở đây còn một lý do thứ hai, mạnh hơn: **bản sao lưu
  PHẢI tiếp tục chép cây đang nằm trong thùng rác** — nếu không thì đúng 30
  ngày ấy là 30 ngày dữ liệu không có bản sao nào, ngay lúc nó mong manh nhất.

Nói cách khác: **thùng rác đóng cửa với người, không đóng cửa với máy sao lưu.**

**Năm việc phải viết** (`luoc-do/15-thung-rac-cay.sql`):
`xin_xoa_cay(p_tree, p_ly_do)` · `huy_xin_xoa_cay(p_tree)` ·
`duyet_xoa_cay(p_tree)` *(Quản trị hệ thống — đặt `da_xoa_luc`)* ·
`phuc_hoi_cay(p_tree)` *(lấy khỏi thùng rác)* ·
`don_thung_rac()` *(xoá cứng cây quá 30 ngày — và đây là chỗ DUY NHẤT trong cả
phần mềm được phép `delete from public.trees`)*.

⚠ Ai gọi `don_thung_rac()` thì **chưa chốt**. Không có cron trong Supabase gói
đang dùng; hai đường: nút trong khu Sao lưu để bấm tay, hoặc nối vào trigger
Apps Script chạy đêm đã có (`sao-luu/SaoLuu.gs`). Hỏi chủ dự án ở b108, đừng
tự chọn — đường thứ hai làm một việc phá dữ liệu chạy tự động lúc không ai
ngồi xem.
