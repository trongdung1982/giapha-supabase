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
  when public.la_quan_tri_toan_he_thong() then 'quan_tri_he_thong'
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

**2 · Hàm `la_quan_tri_toan_he_thong()` phải viết dạng KHẲNG ĐỊNH và bọc
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
  quan_tri_toan_he_thong  boolean not null default false,
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
| `chu_so_huu` | `uuid references auth.users(id)` | Người dựng cây. Hiện trong danh sách, và là người mặc định mang vai `quan_tri_he_thong` của cây |
| `cho_nguoi_la_thay_ten` | `boolean not null default false` | Công tắc tầng 1. **Mặc định TẮT** — cây đã có phải do chủ bật, không tự nhiên phơi ra |

⚠ `default false` là quyết định có chủ ý: cây `NTBK7R3` và cây `NPGQ8C9` đang
có sẽ **không** tự hiện cho người lạ sau khi chạy file SQL. Muốn hiện thì chủ
bật tay. Mặc định mở là kiểu hỏng không ai để ý cho tới khi đã muộn.

### Cột thêm vào `persons` — mục 6

### Hàm mới

| Hàm | Trả về | Ghi chú |
|---|---|---|
| `la_quan_tri_toan_he_thong()` | `boolean` | `coalesce(…, false)`. Nền của tất cả |
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

## 11. ⚠ Một câu còn phải chốt: TÊN GỌI

Sau đợt này sẽ có **hai thứ khác hẳn nhau cùng tên "quản trị hệ thống"**:

| Mã trong bảng | Nghĩa thật | Tên đang hiện |
|---|---|---|
| `tree_members.role = 'quan_tri_he_thong'` | Người quản trị **một cây** | "Quản trị hệ thống" |
| `tai_khoan.quan_tri_toan_he_thong` | Người quản trị **cả phần mềm** | *(chưa có tên)* |

Nhầm hai thứ này là nhầm nguy hiểm — một bên sửa được một cây, một bên sửa
được mọi cây.

**Đề xuất, và nó KHÔNG đổi mã trong bảng** *(đổi mã vai lần trước tốn 5 file,
b97)*: chỉ đổi **chữ hiển thị** trong `settings.js` hàm `vaiTroBangChu()` —
một chỗ duy nhất:

- `quan_tri_he_thong` → **"Quản trị gia phả"**
- `quan_tri` → **"Kiểm duyệt viên"** *(giữ nguyên cũng được)*
- vai mới cấp hệ thống → **"Quản trị toàn hệ thống"**

⚠ Chủ dự án phải chốt trước khi viết file SQL, vì tên vai mới sẽ đóng cứng vào
tên cột `tai_khoan.quan_tri_toan_he_thong`.
