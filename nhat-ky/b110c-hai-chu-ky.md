# b110c — Lỗ hổng HAI CHỮ KÝ: bốn cửa ghi được vào một lời mời chưa ai nhận

*10/09/2026 07:00 → 08:18*

---

## Chủ dự án bấm thử trên máy chủ thật và bắt được

> *"mời tài khoản khach@io.vn vào làm thành viên, sau đó vào kiểm duyệt thêm
> được người này luôn và có thể đổi quyền cho tài khoản này mà không đợi
> khach@io.vn đồng ý."*

Đúng. Và nặng hơn vẻ ngoài.

## Làm gì

- `luoc-do/18-hai-chu-ky.sql` — hàm `la_loi_moi_cho_nhan()`, bốn cửa của
  `13`/`08` tự từ chối, `la_thanh_vien()` thu hẹp đường tắt, `ds_thanh_vien()`
  trả thêm `moi_luc`·`moi_vai`, `ds_cho_duyet()` thôi đếm lời mời.
- `sb.js` 0.15.0 · `khu-thanh-vien.js` 0.9.0 — màn hình phân biệt ba trạng thái.
- `kiem-thu/ban-thu-sql/do-b110c.mjs` *(ngoài repo)* — 48 phép, 7 lỗ hổng tái
  hiện giữ làm chứng, 3 kiểm chứng ngược.
- `kiem-trang-quan-tri.mjs` 214 → **237** (PHẦN K + G17–G19).

**Bốn cửa thủng, đo được:**

| Cửa | Ghi vào | Hậu quả |
|---|---|---|
| `duyet_thanh_vien()` | `approved` | khách đọc **59 người** dù chưa bấm gì |
| `doi_vai_thanh_vien()` | `role` | khách đọc **59 người NGAY LÚC ẤY** |
| `gan_nguoi_cho_thanh_vien()` | `person_id` | đặt trước phạm vi sửa |
| `dat_tin_cay_thanh_vien()` | `tin_cay` | cấp trước quyền bỏ kiểm duyệt |

---

## VÌ SAO

### 1. Cửa nặng nhất KHÔNG phải cửa chủ dự án bấm

Chủ dự án mô tả đường *"vào kiểm duyệt thêm được người này luôn"* — tức
`duyet_thanh_vien()`. Nhưng đo ra thì **`doi_vai_thanh_vien()` nặng hơn**:

- `duyet_thanh_vien()` cần một người đủ thẩm quyền **cố ý bấm Duyệt**;
- `doi_vai_thanh_vien()` chỉ cần bấm **Đổi vai** — một việc trông vô hại — và
  hậu quả tới **ngay lúc ấy**, không đợi ai bấm gì thêm.

Vì `la_thanh_vien()` có đường tắt: `role in ('quan_tri_he_thong','quan_tri',
'sao_luu')` **không hỏi `approved`**. Đặt vai lên dòng lời mời là mở cây.

**Nếp:** khi chủ dự án báo một đường, đi tìm **cả họ** những đường cùng hình
dạng. Ba cửa còn lại không ai bấm mà vẫn thủng.

### 2. Vì sao thiết kế NHÌN THẤY cái bẫy mà vẫn sập — phần đáng giữ nhất

`THIET-KE-NHIEU-CAY.md` mục 11.4 mô tả cái bẫy **chính xác từng chữ**, và còn
dựng hẳn cột `moi_vai` riêng để lời mời không chạm vào cột `role`.

Chỗ sai là **phạm vi của bản vá**: nó canh `moi_vao_cay()`. Bốn hàm của `13`
đã tồn tại từ trước, ghi vào đúng những cột ấy, và **không ai đi hỏi lại**.
Cột `moi_vai` chặn một đường và để ngỏ bốn đường bên cạnh.

> **HÀNG RÀO PHẢI GÁC CỘT, KHÔNG GÁC HÀM.** Viết xong một cơ chế bảo vệ thì
> câu hỏi tiếp theo không phải *"tôi đã chặn hàm này chưa"* mà là **"còn hàm
> nào khác ghi vào cùng những cột này?"**

Câu này đứng cạnh hai câu đã có của dự án: *chạy lại không phải là nâng cấp*,
và *hỏi hàm quyết quyền không phải là đo hàng rào*.

### 3. Vá HAI LỚP, vì một lớp không đủ tin

**Lớp 1** — bốn cửa hỏi `la_loi_moi_cho_nhan()` rồi từ chối.
**Lớp 2** — `la_thanh_vien()` thu hẹp đường tắt cho đúng dòng `moi_boi is null`.

Lớp hai tồn tại vì đúng cái vừa xảy ra: **có ngày ai đó viết cửa thứ năm và
quên lớp một**. Phép `KC1` chứng minh hai lớp độc lập thật — bẻ lớp một ra
(cho `doi_vai` ghi được `role`), lớp hai **vẫn giữ cây đóng**.

### 4. Sửa `la_thanh_vien()` — hàm mà tài liệu ghi "ĐỪNG SỬA"

Cả `CHI-DAN.md` lẫn mục 11.6 đều cấm, và lời cấm ấy có thật: b102 sửa gọn một
dòng ở hàm này và **bản sao lưu đêm ra file rỗng, không báo lỗi**, mất nửa
buổi mới lần ra.

Nên tôi **thu hẹp, không bỏ**: thêm `moi_boi is null` vào nhánh đường tắt. Mọi
dòng hợp lệ đi qua y như cũ — `sao_luu` (`moi_boi` trống), `quan_tri` do
`tao_gia_pha_moi()` sinh ra (`moi_boi` trống), người đã bấm Nhận (`approved`
true, nhánh đầu nhận).

Và **nợ ấy phải trả bằng một phép đo**, không bằng một lời hứa: `K6` mượn danh
nghĩa tài khoản `sao_luu` sau khi vá và đọc ra **đủ 59 người**.

### 5. Máy chủ chặn là đủ AN TOÀN, chưa đủ ĐÚNG LUẬT NHÀ

Sau lớp 1 + lớp 2 thì không ai vào cây được nữa. Nhưng ba tấm lọc cây vẫn vẽ
chữ *"Đang chờ"* và nút *Xét đơn* lên dòng lời mời — tức **mời người ta bấm
một thứ chắc chắn bị từ chối**. Chủ dự án cấm đúng chuyện ấy 08/09/2026:
*"nút chuyển sang màu xám và ở trạng thái khoá, không cần cho bấm vào rồi đi
giải thích."*

⚠⚠ **Và đây là chỗ đau nhất của bước này:** `khu-thanh-vien.js` **đã ghi sẵn
lời thú nhận** trong một khối chú thích từ b109c —

> *"`ds_thanh_vien()` không trả `moi_luc`, nên ở tấm lọc cây KHÔNG phân biệt
> được đơn xin vào với lời mời chưa nhận."*

Nó nói thật thay vì đoán bừa, và điều đó đúng. Nhưng **chính chỗ ấy là đường
chủ dự án đi vào.**

> **Nếp: một khối chú thích nói "chỗ này chưa phân biệt được" là một VIỆC PHẢI
> LÀM, không phải một lời giải thích đã xong.** Viết ra rồi để đấy là dán nhãn
> lên một cái lỗ thay vì lấp nó.

### 6. Con số trên thanh điều hướng cũng sai

`ds_cho_duyet()` đếm mọi dòng `approved = false`, **kể cả lời mời**. Nên con
số nói *"có đơn phải duyệt"* trong khi không có — và nó **dẫn người quản trị
đi tìm một cái nút mà bấm**, đúng cái nút mở ra lỗ hổng. Nay chỉ đếm đơn xin
vào, ở cả hai đầu (máy chủ và trình duyệt) để hai con số không lệch.

---

## Đã thử mà hỏng

### HR3 báo ĐẠT trên một hàm không có hàng rào nào

Phép đo `gan_nguoi_cho_thanh_vien()` bản đầu dùng mã `P0012` → ĐẠT. Nhưng đọc
thân hàm thì nó **không hỏi `moi_boi` một chữ nào**: nó bị chặn bởi chỉ mục
`unique (tree_id, person_id)` vì `P0012` đã gắn cho tài khoản khác. Thử lại
bằng một mã còn trống thì nó ghi được.

**Nếp:** phép đo chặn-được phải dùng dữ liệu mà **không ràng buộc nào khác**
chặn hộ. Suýt đóng bước với một cửa còn thủng và một dòng ✓ trên màn hình.

### Phép đo chạy lần hai ra kết quả khác lần đầu

Lần đầu 7 lỗ hổng tái hiện, lần hai còn 3 — vì `18` của lần trước còn sót trên
bàn thử. **Một phép đo không chạy lại được là một phép đo không tin được.** Vá
bằng cách cho chính nó dán lại `08` và `11` để dựng nền chưa vá.

### Bảng đếm "HỎNG 7" đọc nhầm thành bản vá tuột

Phần tái hiện lỗ hổng *phải* hỏng. Nhưng một phép đo kết thúc bằng *"HỎNG 7"*
thì lần chạy sau không ai phân biệt được **chứng cứ** với **hồi quy**. Tách
thành bộ đếm thứ hai (`loHong()`), in riêng, kèm câu giải thích.

### `18` không dán được: `cannot remove parameter defaults`

`08` khai `ds_cho_duyet(p_tree uuid default null)`, bản mới bắt truyền tường
minh. Phải `drop function` trước — đúng như `10` đã phải làm. Và `drop` **xoá
cả quyền gọi**, nên phải `grant` lại; quên là khu Tài khoản đọc ra mảng rỗng
và người dùng thấy *"không có đơn nào"* — một lời nói dối trông y hệt sự thật.

### ⚠ Và chỗ ấy để lộ một lỗi thứ hai, không thuộc lỗ hổng này

`08` giữ **bản CŨ** của `ds_cho_duyet()`:
`coalesce(p_tree, (select id from public.trees limit 1))` — đúng **Hỏng 3** của
mục 8, thứ `10-sua-nhieu-cay.sql` đã chữa 05/09.

Nghĩa là **dán lại `08` làm sống lại Hỏng 3**, im lặng, và với hai cây thì nó
*duyệt nhầm hàng chờ của cây khác*. Không ai ghi chuyện ấy ở đâu cả. Từ nay
`18` là bản đứng cuối cho hàm ấy, nên chuỗi `08` → `18` chữa luôn cả hai.

---

## Còn treo

- ⏳ **`18-hai-chu-ky.sql` CHƯA DÁN.** Đây là việc chặn, và nó chặn một lỗ
  hổng đang mở trên máy chủ thật.
- ⏳ **Dọn vết:** bản vá đóng cửa nhưng **không tự dọn** dòng đã lọt qua. Dòng
  của `khach@io.vn` đang ở trạng thái sai — mục 9 cuối file `18` có hai câu
  SQL, câu đầu chỉ đọc.
- ⏳ `15` bản 0.2.0 vẫn chưa dán.
- Chưa ai bấm thử vòng xin xoá → duyệt → phục hồi cây trên app.

---

## Câu hỏi thứ hai của chủ dự án — đã đo, KHÔNG có vi phạm

> *"ngoài quyền quản trị hệ thống, một người chỉ có quyền quản trị gia phả,
> xem khi được gắn 1 cây cụ thể, hệ thống hiện tại có vi phạm không, có ai có
> quyền mà không gắn với cây không?"*

`do-b110c.mjs` phần 6, Q1–Q13. Người ngoài đọc **0 người**, **0 dòng**
`tree_members`, `vai_tro()` trả `null`, cả ba hàm `co_the_*()` trả `false`.
Vai `quan_tri` cây A **không** mang sang cây B.

Đúng **ba** thứ đứng ngoài `tree_members`, cả ba đã chốt từ trước:

| Thứ | Phạm vi |
|---|---|
| **Quản trị hệ thống** | đọc và sửa mọi cây — ngoại lệ chốt 05/09 |
| **Được dựng cây** | **không mẩu quyền nào** trên cây đang có (Q9·Q10) |
| **Cây mặc định** | đọc được đúng một cây; không sửa, không thấy thành viên |

⚠ **Cây mặc định là cửa duy nhất trong cả dự án** mà một người không có dòng
`tree_members` nào vẫn đọc được nội dung một cây. Có chủ ý, nhưng là thứ dễ
quên nhất khi trả lời *"ai đọc được cây này?"*. Tắt bằng
`cau_hinh.cay_mac_dinh = null`.

---

## File đã đụng tới

**Mới**
- `luoc-do/18-hai-chu-ky.sql`
- `kiem-thu/ban-thu-sql/do-b110c.mjs` *(ngoài repo)*

**Sửa**
- `js/services/sb.js` → 0.15.0
- `js/pages/quan-tri/khu-thanh-vien.js` → 0.9.0
- `kiem-thu/kiem-trang-quan-tri.mjs` → 0.6.0, 214 → 237 phép
- `kiem-thu/sb-gia.mjs` *(ngoài repo)* — thêm dòng lời mời `khach@io.vn`
- `CHI-DAN.md` · `KE-HOACH.md` · `DU-LIEU.md` ·
  `THIET-KE-QUAN-TRI.md` · `THIET-KE-NHIEU-CAY.md` *(mục 11.8 + cảnh báo 11.4)*

**Chép nguyên / xoá:** không có.
