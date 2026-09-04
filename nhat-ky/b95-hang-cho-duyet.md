# b95 — Đăng ký xếp hàng chờ, admin duyệt mới vào được

*04/09/2026 · phiên Claude Code CLI · viết xong 04/09/2026 17:05*

---

## Làm được gì

1. `luoc-do/07-duyet-dang-ky.sql` — bốn hàm mới, và **`approved` từ nay gác cả
   quyền ĐỌC** chứ không chỉ quyền sửa.
2. Màn hình **"Xin vào gia phả"** (có ô tự giới thiệu) và **"Đơn của bạn đang
   chờ duyệt"** — `pages/khoi-dong.js` 0.9.0.
3. Khối **"Đơn chờ duyệt (n)"** trong màn Cài đặt, chỉ `chu`/`admin` thấy —
   `pages/settings.js` 1.25.0. Mỗi đơn: duyệt kèm mã người, hoặc từ chối.
4. `services/sb.js` 0.2.0 — bốn hàm gọi máy chủ, và `layPhien()` thôi tự suy
   quyền sửa.
5. Bộ kiểm `kiem-thu/kiem-duyet-dang-ky.mjs` — **40 phép, đạt 40**, đã kiểm
   chứng ngược.
6. `HUONG-DAN-PHAN-QUYEN.md` mục 6 và 7 cho chủ dự án.

**Chưa dán vào Supabase.** Đó là thao tác duy nhất còn lại.

---

## VÌ SAO

### Vì sao `approved` phải gác cả quyền đọc, không chỉ quyền sửa

Trước bước này, có tên trong `tree_members` là **đọc được cả gia phả** —
`approved` (b93) chỉ chặn đường sửa. Nếu giữ nguyên như thế mà thêm nút "Xin
vào gia phả", thì bấm nút xong là xem được tất cả, admin duyệt hay không cũng
vậy. Hàng chờ chỉ còn là một cái nhãn.

Nên `la_thanh_vien()` — hàm mà **cả chín policy đọc** đều đi qua — nay đòi
`approved`. Sửa đúng một chỗ là xong, và đó là món lời của quyết định b87: gom
câu hỏi *"người này có chân trong cây không"* vào một hàm thay vì chép điều
kiện ra chín chỗ.

### Vì sao có ba vai đi tắt, và vì sao `sao_luu` là vai dễ quên nhất

`chu`, `admin`, `sao_luu` không bao giờ phải chờ.

- `chu` — khoá chủ ra ngoài nhà mình là hỏng kiểu không ai cứu được: không còn
  ai có quyền mở khoá cho ai nữa.
- `admin` — chủ dự án cấp tay, không đi qua hàng chờ bao giờ.
- `sao_luu` — **vai máy**, chạy hằng đêm từ Apps Script. Không có người ngồi
  sau để bấm nút xin vào. Quên nó là sao lưu **thất bại im lặng**, đúng cái
  kiểu hỏng b94 vừa ghi lại hai lần trong một ngày.

Bộ kiểm có hẳn ba phép riêng cho ba vai này, và phép `sao_luu` đã được thử
cho đỏ trước khi tin.

### Vì sao lệnh bật `approved` cho thành viên cũ phải đứng TRƯỚC

File này đổi nghĩa `la_thanh_vien()`. Mọi dòng đang có trong `tree_members`
hôm nay đều mang `approved = false` — kể cả dòng của chủ dự án. Đổi hàm trước
khi bật cờ là **chính chủ dự án bị khoá ngoài gia phả của mình**, và không còn
ai đủ quyền mở khoá.

Thứ tự chạy của SQL chính là thứ tự dòng trong file, không có gì khác quyết
định nó. Nên bộ kiểm đo **vị trí trong văn bản**: lệnh `update` phải nằm trước
`create or replace function public.la_thanh_vien`. Nghe thô sơ, nhưng nó gác
đúng thứ thật sự quyết định hỏng hay không.

⚠ Kèm một chốt an toàn: lệnh ấy chỉ đụng dòng có `xin_luc is null` — tức dòng
**không** qua hàng chờ. Thiếu điều kiện này thì dán lại file lần thứ hai là
duyệt sạch mọi đơn đang xếp hàng.

### Vì sao vai phải đóng cứng trong thân `xin_vao_cay()`

Người lạ không tự `insert` vào `tree_members` được — RLS chặn, phép thử H9 đã
đo chính đòn ấy và nhận `403`. Nên phải mở một cửa `security definer`.

Cửa ấy là chỗ nguy hiểm nhất của cả bước: nó ghi bằng quyền của chủ hàm. Điều
duy nhất phân biệt **một cửa** với **một lỗ hổng** là vai và cờ được viết chết
trong thân hàm — `role = 'xem'`, `approved = false` — chứ không lấy từ tham số
người gọi truyền vào. Bộ kiểm gác đúng câu ấy.

Và `on conflict **do nothing**`, không phải `do update`: người đã là thành
viên thật mà lỡ bấm nút xin vào lần nữa thì `do update` sẽ **hạ vai họ xuống
`xem`**. Một chữ, và nó biến cái nút thành cái bẫy.

### Vì sao ô "bạn là ai trong họ" không phải trang trí

Admin nhìn hàng chờ chỉ thấy một địa chỉ email. `hoangnam92@gmail.com` là cháu
ông nào? Không có câu trả lời thì duyệt thành đoán mò — mà duyệt sai ở đây là
gắn nhầm mã người, tức cấp cho người ta quyền sửa hồ sơ một nhánh không phải
của họ.

Một dòng tự giới thiệu biến việc ấy thành đọc. Vẫn để trống được: bắt buộc
điền thì người ngại gõ sẽ gõ bừa, và một ô đầy chữ vô nghĩa còn tệ hơn ô trống.

### Vì sao `layPhien()` thôi tự suy quyền sửa

Câu cũ: `suaDuoc: vaiTro === 'chu' || vaiTro === 'sua'`. Nay sai hai đường —
bỏ sót vai `admin` (thêm ở b93), và cho người `sua` **chưa được duyệt** tưởng
mình sửa được: giao diện mở nút Sửa, người ta gõ xong một hồ sơ, bấm Lưu, rồi
mới bị máy chủ chặn.

Nay hỏi thẳng `co_the_sua()` — hàm máy chủ vốn đã là chỗ **duy nhất** trả lời
câu ấy. Hỏi nó thì không bao giờ có hai câu trả lời khác nhau cho cùng một
người. Đây cũng chính là luật *"app không tự lọc, và vì thế app không thể lọc
sai"* mà `KIEN-TRUC.md` đặt ra từ đầu, áp thêm một chỗ nữa.

### Vì sao KHÔNG tắt tự đăng ký

Câu hỏi treo từ đầu buổi. Nay tự trả lời: hàng chờ chặn ở **chỗ đứng trong gia
phả**, không phải chỗ đứng trong `auth.users`. Người lạ đăng ký xong vẫn không
thấy một chữ nào — H9 hàng rào 1 đã đo, 0 dòng trên cả tám bảng.

Tắt đăng ký thì sạch hơn một chút nhưng người trong họ mất đường tự xin vào,
và admin quay lại việc tạo tay từng tài khoản — đúng thứ chủ dự án muốn bỏ khi
nói *"đăng ký → xếp hàng"*. Rác trong `auth.users` là cái giá, và nó rẻ.

---

## Đã thử mà hỏng

Không có gì hỏng đáng ghi trong bước này. Nhưng có một việc **cố ý làm cho
hỏng**: sau khi bộ kiểm báo 40/40, đặt lại ba lỗi vào file SQL — bỏ vai
`sao_luu`, đổi `do nothing` thành `do update`, gỡ điều kiện `xin_luc is null`
— rồi chạy lại. Đúng **3 phép báo đỏ**, đúng ba phép ấy. Khôi phục → 40/40.

Đó là nếp rút ra từ b94 và từ nay làm mỗi lần: **một bài kiểm chưa bao giờ
thấy đỏ là một bài kiểm chưa ai biết nó có chạy hay không.**

---

## Còn treo

- ⚠ **`07-duyet-dang-ky.sql` chưa dán.** Chưa dán thì nút "Xin vào gia phả"
  bấm sẽ báo lỗi — hàm chưa tồn tại ở máy chủ.
- ⚠ **Chưa ai đi thử luồng này bằng người thật.** Tài khoản `thu-h9` giữ lại
  đúng để làm việc ấy: gỡ duyệt nó là có ngay một người "đang chờ".
- **b95 kiểm duyệt NỘI DUNG** (`KE-HOACH.md` việc 4) vẫn chưa viết dòng nào —
  đừng lẫn với bước này: đây duyệt *người*, kia duyệt *nội dung sửa*.
- Người chỉ có quyền xem vẫn xem được mọi thứ, kể cả chi tiết người còn sống.

---

## File đã đụng tới

| File | Đổi gì |
|---|---|
| `luoc-do/07-duyet-dang-ky.sql` | **mới** — bốn hàm, `approved` gác quyền đọc, hai cột `xin_luc`/`loi_nhan` |
| `kiem-thu/kiem-duyet-dang-ky.mjs` | **mới** — 40 phép |
| `js/services/sb.js` | 0.1.0 → **0.2.0**: bốn hàm mới; `suaDuoc` hỏi máy chủ; trả `trangThai` |
| `js/pages/khoi-dong.js` | 0.8.0 → **0.9.0**: kết cục thứ ba, nút xin vào |
| `js/pages/settings.js` | 1.24.0 → **1.25.0**: khối Đơn chờ duyệt |
| `HUONG-DAN-PHAN-QUYEN.md` | mục 6 (cách làm việc) + mục 7 (dán file) |
| `DU-LIEU.md` · `CHI-DAN.md` · `KE-HOACH.md` | cập nhật theo |
