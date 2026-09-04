# b94 — Phép thử H9: phân quyền chạy thật, và một lỗ hổng chỉ lộ ra khi đẩy cửa

*04/09/2026 · phiên Claude Code CLI · viết xong 04/09/2026 15:00*

---

## Làm được gì

1. **Hai file SQL phân quyền đã dán thật** (13:20) sau khi gỡ một lỗi `42P13`.
2. **Phép thử H9 chạy xong cả năm hàng rào**, đo bằng cách gọi thẳng REST của
   Supabase từ máy, không qua trình duyệt. **Năm trên năm đạt.**
3. **Bắt được một lỗ hổng leo quyền thật** trong `duyet_thanh_vien()`, vá, và
   chứng minh vá kín bằng cách đánh lại đúng đòn ấy.
4. Bộ kiểm `kiem-quyen-truc-he.mjs` **57 → 59 phép**, hai phép mới sinh ra từ
   chính lỗ hổng ấy.
5. Nút **Đăng xuất** — `pages/settings.js` 1.24.0. Hàm đã có từ b87, chưa nút
   nào gọi.
6. Ghi thiết kế **duyệt đăng ký tài khoản** vào `KE-HOACH.md` việc 5.

---

## VÌ SAO

### Vì sao lỗ hổng không lộ ra ở 57 phép kiểm, mà lộ ra ở lần gọi thật đầu tiên

`duyet_thanh_vien()` mở đầu bằng:

```sql
if public.vai_tro(p_tree) not in ('chu', 'admin') then  -- chặn
```

Đọc bằng mắt thì đúng. Chạy thì thủng: với người **ngoài cây**, `vai_tro()`
trả `null`, và `null not in (…)` cho ra **`null`** chứ không cho ra `true`.
`if` chỉ nhận `true`, nên nó bỏ qua cửa và đi thẳng xuống lệnh `update`.

Người ngoài cây không tự duyệt cho mình được — họ chưa có dòng nào để `update`
tìm thấy. Nhưng **duyệt được cho tài khoản khác** nếu biết email: gắn mã người
tuỳ ý, bật `approved`. Mà project đang bật tự đăng ký, nên "người ngoài cây"
không phải một vai hiếm — nó là bất kỳ ai.

Điều đáng nói không phải cái lỗi, mà là **dự án đã biết trước cái bẫy này**.
`co_the_sua_nguoi()` có hẳn một đoạn ghi chú về nó từ b87, b93 chép lại nguyên
văn lời cảnh báo. Chỗ kia viết dạng khẳng định (`in`, `=`) nên `null` rơi về
`else false` và chặn đúng. **Một chữ `not` là đủ lật ngược tất cả.**

Đã soát lại toàn bộ `luoc-do/`: đây là chỗ **duy nhất** dùng dạng phủ định.

### Vì sao bộ kiểm báo xanh trên đúng cái mã thủng ấy — bài học đắt hơn lỗi

Phép kiểm cũ đi hỏi *"có viết đúng chữ `not in ('chu','admin')` không"*. Mã
thủng viết **đúng y như thế**. Nên 57 phép đạt 57, trong khi cửa mở toang.

**Bài kiểm đòi đúng chữ vẫn có thể kiểm sai điều.** Phép mới không hỏi có chữ
gì, mà hỏi *"đã bọc `null` chưa"* — thứ thật sự quyết định cửa đóng hay mở.
Thêm một phép quét cả file tìm mọi chỗ hỏi vai trò bằng phủ định mà quên bọc.

Và **đã kiểm chứng ngược**: đặt lại mã hỏng như cũ → đúng 2 phép mới báo HỎNG;
khôi phục → 59/59. Một bài kiểm chưa bao giờ thấy đỏ là một bài kiểm chưa ai
biết nó có chạy hay không.

### Vì sao phải đẩy thử cửa sau, không được suy ra từ mã

`KE-HOACH.md` việc 3 ghi sẵn: *"ghi thẳng REST bị chặn — thử bằng trình duyệt
KHÔNG chứng minh được, vì app luôn đi qua `luu_cay()`"*. Đúng, và hôm nay mới
có người thật sự đẩy.

Cách đẩy: lấy khoá công khai trong `js/cau-hinh.js` (khoá ấy vốn để lộ, đó là
thiết kế), đăng nhập bằng REST như một trình duyệt, rồi gọi thẳng vào bảng.
Không cần trình duyệt, không cần app, không cần quyền gì đặc biệt — tức đúng
tư thế của người muốn đi cửa sau.

⚠ **Một điều dễ đọc nhầm, phải ghi lại:** hai đòn ghi thẳng REST trả về **HTTP
200 kèm danh sách rỗng**, không phải mã lỗi. Trông như *thành công*. Thật ra
RLS lọc sạch trước khi lệnh chạm tới dòng nào — không dòng nào khớp thì không
dòng nào đổi. Chỉ khi **thêm dòng mới** nó mới trả `403` thẳng thừng. Cách duy
nhất biết chắc là **đọc lại dữ liệu**, và đã đọc lại: `P0012` nguyên vẹn,
không người nào trong 59 người mang dấu vết phép thử.

### Vì sao vá xong thì SQL Editor mất một đường tắt, và đó là đúng

`06-quyen-truc-he.sql` mục 8 từng quảng cáo hàm này *"dùng được từ SQL Editor
ngay"*. Sau khi vá thì **không** — SQL Editor không mang danh nghĩa tài khoản
nào, `auth.uid()` rỗng, nên với hàm ấy nó chính là "người ngoài".

Nghĩa là **"dùng được từ SQL Editor" chưa bao giờ là tính năng, nó là triệu
chứng**: nó chạy được đúng vì cái lỗ hổng. Đã sửa cả hai chỗ tài liệu nói câu
ấy (`06` mục 8, `HUONG-DAN-PHAN-QUYEN.md` mục 3), thay bằng một câu `update`
có `exists` chặn gõ nhầm mã người.

---

## Năm hàng rào — số đo

**Hàng rào 1 — người ngoài cây.** Tài khoản `thu-h9` chưa có chân trong cây,
đọc tám bảng: `trees` `persons` `unions` `union_children` `tree_members`
`change_log` `media` `sources` → **0 dòng, cả tám**. Không thấy cả tên gia phả.

**Hàng rào 4 — cửa sau.** Cùng tài khoản ấy:

| Đòn | Máy chủ trả |
|---|---|
| thêm người mới vào `persons` | `403 · new row violates row-level security policy` |
| **tự thêm mình vào `tree_members` vai `chu`** | `403` |
| gọi thẳng `luu_cay()` | *"Bạn chỉ có quyền xem gia phả này, không sửa được."* |
| gọi `duyet_thanh_vien()` tự duyệt | **lọt cửa quyền** → lỗ hổng, đã vá |

Sau khi vá, đánh lại hai đòn duyệt (tự duyệt cho mình, và duyệt cho tài khoản
khác): cả hai nhận *"Chỉ chủ gia phả hoặc quản trị viên mới duyệt được thành
viên."* Đòn thứ hai cố ý đặt giá trị trùng khớp trạng thái đang có, nên kể cả
còn thủng cũng không đổi gì của tài khoản sao lưu.

**Hàng rào 2 — vai `sua`, chưa gắn mã.** Đọc: `persons` 59 · `unions` 25 ·
`union_children` 36 · `change_log` 13 — khớp từng con số với bảng đối chiếu của
lần di dời. Ghi: `luu_cay()` trả `lyDo: chuaduyet` kèm câu tiếng Việt nói rõ
đang chờ duyệt chứ không phải app hỏng; hai đòn ghi thẳng REST đổi **0 dòng**.

**Hàng rào 3 — đã gắn `P0012` và duyệt.** Gọi `co_the_sua_nguoi()` trên 12 người:

| Người | Quan hệ với P0012 | Kết quả |
|---|---|---|
| `P0012` | chính mình | `true` |
| `P0003` `P0004` | bố mẹ | `true` |
| `P0001` `P0002` | ông bà | `true` |
| `P0020` | vợ | `true` |
| `P0021` `P0022` | hai con | `true` |
| `P0013` `P0014` | **hai em gái ruột** | `false` |
| `P0040` `P0055` | nhánh khác | `false` |

**Khớp tuyệt đối** với mô hình `kiem-quyen-truc-he.mjs` tính trên cùng cây.

Rồi ghi thật qua `luu_cay()`: sửa mẹ `P0003` → `ok: true`, revision 2→3, đọc
lại thấy đúng chữ vừa ghi. Sửa em gái `P0013` → *"Người P0013 không thuộc trực
hệ của bạn nên bạn không sửa được. Nhờ quản trị viên nếu cần."* — `lyDo:
ngoaiphamvi`. Trả `note` của `P0003` về nguyên trạng sau khi đo.

**Hàng rào 5 — `revision` chặn ghi đè.** Revision thật là 4; gửi `p_revision`
2 và 3 → cả hai `lyDo: xungdot` kèm *"Người khác vừa sửa gia phả trong lúc bạn
đang mở."*; gửi 4 → `ok: true`. Dọn lại ngay sau đó.

---

## Đã thử mà hỏng

**1. Lần dán `06` đầu tiên trượt vì `42P13`** — `create or replace function`
không đổi được **tên** tham số (`p_branch` → `p_person`), chỉ đổi được thân
hàm. Thêm `drop function if exists` trước lệnh tạo là qua; đã soát trước rằng
không policy RLS nào phụ thuộc hàm ấy. Supabase SQL Editor bọc cả file trong
một giao dịch nên lần trượt **không để lại gì**.

**2. Đăng nhập tài khoản thử trượt lần đầu** — `invalid_credentials`. Không
phải lỗi hệ thống: mật khẩu gõ nhầm một chữ số. Đáng ghi vì câu lỗi ấy **không**
phân biệt được "sai mật khẩu" với "email không tồn tại", nên đừng đi tìm nguyên
nhân ở chỗ khác trước khi hỏi lại người gõ.

**3. Tài khoản sao lưu biến mất khỏi gia phả giữa phiên.** Bảng thành viên đang
3 dòng còn 2. Nguyên nhân: chủ dự án xoá nhầm tài khoản trong **Authentication →
Users**, mà `tree_members.user_id` khai `on delete cascade` — **xoá một tài
khoản là xoá luôn chỗ đứng của người ấy trong gia phả, im lặng, không hỏi lại.**

⚠ Và tài khoản tạo lại **mang UID mới**, nên dòng cũ không tự nhận lại được dù
email y hệt. Phải cấp vai lại bằng tay. Mật khẩu lần này trùng mật khẩu cũ nên
dự án Apps Script sao lưu không phải sửa — **nếu đặt mật khẩu khác thì sao lưu
sẽ đăng nhập trượt và thất bại im lặng**, đúng kiểu hỏng nguy hiểm nhất.

---

## Còn treo

- ⚠ **Tài khoản `thu-h9@nguyentrongbac.io.vn` vẫn đang gắn `P0012` và đã
  duyệt.** Nó là tài khoản thử, mật khẩu yếu. **Phải gỡ hoặc xoá.**
- `change_log` giữ **4 dòng** mang ghi chú `H9 …` của tài khoản thử, revision
  3→6. Cố ý để lại: nhật ký ghi đúng những gì đã xảy ra là chuyện tốt.
- ⚠ **Project đang bật tự đăng ký** (`disable_signup: false`). Chưa mở cửa nào
  — hàng rào 1 vừa chứng minh — nhưng đẻ rác trong `auth.users`. Xem
  `KE-HOACH.md` việc 5.
- ⚠ **Chưa có màn hình duyệt thành viên.** Duyệt bằng `update` trong SQL Editor.
- **b95 / kiểm duyệt nội dung** chưa viết dòng mã nào.

---

## File đã đụng tới

| File | Đổi gì |
|---|---|
| `luoc-do/06-quyen-truc-he.sql` | 0.1.0 → **0.1.2**: thêm `drop function`, vá lỗ hổng `null`, sửa ghi chú mục 8, thêm dòng tự kiểm thứ tư |
| `kiem-thu/kiem-quyen-truc-he.mjs` | 57 → **59 phép**: sửa phép cũ kiểm sai điều, thêm hai phép về `null` |
| `js/pages/settings.js` | 1.23.0 → **1.24.0**: nút Đăng xuất; sửa câu sai về "danh sách chia sẻ Google Drive" |
| `HUONG-DAN-PHAN-QUYEN.md` | mục 3 đổi từ gọi hàm sang `update`, kèm lý do |
| `KE-HOACH.md` | việc 3 đóng; thêm việc 5 (duyệt đăng ký) và việc 6 (nút Đăng xuất) |
| `nhat-ky/b93-quyen-truc-he.md` | thêm mục 5 "Đã thử mà hỏng" — lỗi `42P13` |
