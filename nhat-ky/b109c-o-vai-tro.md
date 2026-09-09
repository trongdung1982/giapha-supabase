# b109c — ô Vai trò bấm được, và bảng dài thôi đẩy mọi thứ xuống sâu

*09/09/2026 16:32 · nhánh Supabase · Claude Code CLI (Opus)*

Vòng thứ ba trong cùng một ngày với b109 và b109b. Cả ba vòng đều bắt đầu bằng
chủ dự án **bấm thử bản vừa xong trên máy chủ thật** rồi nói ra cái vướng —
không vòng nào bắt đầu từ một bản kế hoạch.

---

## Việc đã làm

1. **Cột *Quyền* đổi tên thành *Vai trò*** ở tấm lọc *Toàn hệ thống*.
2. **Bấm ô Vai trò mở một bảng HAI CỘT** — *gia phả · vai trò* — chứ không mở
   cả bảng sâu như ô Tài khoản nữa. Bấm tiếp vào một vai trò là vào thẳng bảng
   sửa quyền của đúng cây ấy.
3. **Ô Vai trò ở ba tấm lọc cây cũng bấm được**, mở cùng cái bảng ấy.
4. **Bảng dài quá tám dòng thì tự cuộn trong khung**, tiêu đề cột dính lại.
5. **Câu dẫn của tấm *Toàn hệ thống* rút còn một dòng.**
6. Công cụ đo mới: `kiem-thu/do-cuon-bang.mjs` + `.html`, và `?nhieu=30` ở
   `sb-gia.mjs` để sổ giả dài ra được.

**Không đụng SQL.** Cả bước này chạy trên đúng ba hàm đã dán ở b109b.

---

## Vì sao — phần đáng đọc

### Vì sao ô Vai trò không mở bảng sâu nữa

b109b làm ô Vai trò bấm được, nhưng nó mở **đúng cái bảng sâu mà ô Tài khoản
mở**. Nghĩa là hai chỗ bấm cạnh nhau làm một việc — và cái thứ hai chỉ tồn tại
để nói *"vai trò còn có chi tiết"*, rồi giao chi tiết ấy cho một bảng năm việc
dài hơn màn hình.

Chủ dự án nói thẳng cái đáng có: *"bấm cột quyền thì hiện ra bảng một bên là
tên cây, 1 bên là quyền tương ứng. tiếp tục bấm vào quyền thì có thể chỉnh
sửa."* Đó là một **đường đi ngắn nhất tới việc sửa quyền**, còn bảng sâu là
đường đi tới *mọi thứ về tài khoản này*. Hai câu hỏi khác nhau thì hai chỗ bấm,
và mỗi chỗ trả đúng câu của mình.

### Vì sao bảng ấy nằm ở `khu-thanh-vien.js`, không ở `khu-tai-khoan-he-thong.js`

Về nghĩa thì nó thuộc file kia: *"một người đứng ở đâu trong từng cây"* là câu
hỏi của sổ đăng ký. Nhưng `khu-tai-khoan-he-thong.js` **`import` tĩnh**
`khu-thanh-vien.js` (để dùng lại năm việc của `13`), nên chiều ngược lại chỉ đi
được bằng `import()` động. Bắt một cú bấm chờ tải cả mô-đun sổ đăng ký để vẽ
một bảng hai cột là đắt vô cớ — và với người **không** phải Quản trị hệ thống
thì đó còn là tải đúng cái mô-đun họ không có cửa dùng.

Đặt ở `khu-thanh-vien.js` thì cả hai bên `import` tĩnh theo chiều đã có, không
đẻ thêm vòng nào.

### Vì sao chủ cây thường chỉ thấy MỘT dòng, và vì sao không hạ hàng rào

`ds_cay_cua_tai_khoan()` có `where public.la_quan_tri_he_thong()` ngay trong
thân (`14` mục 9, `15` mục 5b). Chủ cây A gọi nó sẽ nhận về **mảng rỗng**.

Đường dễ là hạ hàng rào ấy xuống cho `co_the_quan_tri()`. Không làm, vì câu hỏi
*"tài khoản này còn có chân ở cây nào khác"* **không phải việc của chủ cây A** —
đó là dữ liệu của những cây khác, và chủ cây A không có quyền ở đó. Nên với họ,
bảng hai cột dựng đúng một dòng **từ dữ liệu đã có sẵn trong tay**, không gọi
máy chủ thêm lần nào, kèm một câu nói ra vì sao chỉ có một dòng.

⚠ Cạm bẫy đã tránh được ở đây: **gọi hàm rồi vẽ ra "chưa dính cây nào"**. Đó là
bịa một câu trả lời từ một lời từ chối, và nó sẽ trông đúng mãi mãi.

### Vì sao cắt chiều cao bảng, chứ không kéo bảng việc lên trên

Chủ dự án: *"khi danh sách tài khoản dài thì bảng thông tin ở dưới sẽ bị đẩy
xuống thật sâu ở dưới, phải kéo rất nhiều?"* Đúng, và nó là hậu quả trực tiếp
của quyết định b106 — bảng việc phải đứng **ngoài** bảng, nếu không nửa phải
của nó rơi khỏi mép màn hình điện thoại.

Ba đường, chọn đường thứ ba:

| Đường | Vì sao bỏ |
|---|---|
| Nhét lại thành `<tr>` ẩn dưới dòng vừa bấm | Đúng cái lỗi b106 đã đo được và đã sửa |
| Kéo bảng việc lên **trên** bảng | Hỏng ngược lại: bấm dòng cuối thì phải cuộn NGƯỢC lên |
| **Cắt chiều cao bảng, cho nó tự cuộn** | Bảng việc luôn nằm ngay dưới khung, cách 14px đo được |

Chỉ cắt từ **dòng thứ chín** trở đi. Bốn dòng mà nhốt trong khung cuộn là đẻ ra
một thanh cuộn thứ hai chẳng để làm gì, và trên điện thoại `62vh` chỉ đủ bốn
năm dòng — cắt sớm là làm hỏng đúng màn hình chật nhất.

### Vì sao câu dẫn rút ngắn

Câu dẫn của tấm *Toàn hệ thống* đã **sai hai lần liên tiếp** vì cùng một lý do:
nó mô tả *người ta bấm vào đâu*, mà chỗ bấm thì đổi mỗi vòng. b109 để lại chữ
"Bấm Mở" sau khi nút Mở bị bỏ; b109b liệt kê bốn việc trong bảng sâu — bốn việc
tự hiện ra ngay khi mở, không cần ai giới thiệu.

Chủ dự án cắt còn đúng phần **không đoán được từ màn hình**: một dòng gồm những
gì, và tấm lọc này khác ba tấm kia ở chỗ nào. Chỗ bấm để chú thích nhỏ dưới
tiêu đề cột nói — nó đứng ngay trên chính chỗ bấm, nên nó không thể lạc hậu mà
không ai thấy.

---

## Đã thử mà hỏng

**Đọc ảnh chụp ra "sticky hỏng" trong khi nó chạy đúng.** Ảnh `kq-15` cho thấy
bảng ba chục dòng mất tiêu đề cột, và tôi đọc ngay ra *"`position:sticky` trên
`th` bị `border-collapse:collapse` vô hiệu hoá"* — một chuyện có thật, có tài
liệu, và **sai ở đây**.

Đo thì: `position` = `sticky`, lệch giữa đỉnh `th` và đỉnh khung = **0px**, ô
cuộn đứng yên ở `scrollTop = 0`. Thứ trôi là **cả trang**, do
`scrollIntoView()` kéo bảng việc vừa mở vào tầm nhìn, nên đỉnh bảng — kèm tiêu
đề dính vào nó — bị đẩy lên trên mép ảnh.

Nếp rút ra, và nó là nếp thứ hai cùng loại trong hai ngày: **một tấm ảnh có thể
do hai nguyên nhân hoàn toàn khác nhau sinh ra.** Ảnh nói *"trông sai"*, nó
không nói *"sai ở đâu"*. Nửa giờ suýt mất vào việc đi sửa một thứ không hỏng.
`do-cuon-bang.html` nay giữ luôn câu đo ấy để lần sau không phải suy đoán lại.

---

## Đã đo

| Phép | Kết quả |
|---|---|
| `supabase/kiem-thu/kiem-trang-quan-tri.mjs` | **154/154 ĐẠT** |
| `/kiem-tra` — chín phép phân lớp | **9/9 ĐẠT**, `domains/` 0 file khác |
| `kiem-thu/do-cuon-bang.mjs` *(mới)* | 5 câu sạch — bảng tự cuộn · tiêu đề dính · bảng việc cách đáy 14px |
| `kiem-thu/do-goi-y.mjs` | 0 cặp đè · 0 thứ rơi khỏi mép · ô gợi ý đúng chỗ |
| `kiem-thu/xem-khung-quan-tri.mjs` | 17 ảnh, đã nhìn bằng mắt |

**Chưa ai bấm thử trên máy chủ thật** — bàn thử không có ai bấm nút.

---

## Còn treo

- Chủ dự án bấm thử cột *Vai trò* ở cả hai tấm lọc trên máy chủ thật.
- `settings.js` vẫn gọi thứ này là **Quyền** ở màn hình Cài đặt của mỗi người.
  Chưa đổi, vì chủ dự án chỉ nói tới hai tấm lọc của khu Quản trị — nhưng đây
  là một chỗ hai màn hình gọi cùng một thứ bằng hai tên, và luật ấy vừa được
  dùng để biện minh cho chính việc đổi tên lần này.
- `ds_thanh_vien()` không trả `moi_luc`, nên ở ba tấm lọc cây **không phân biệt
  được** *đơn xin vào* với *lời mời chưa nhận*. Bảng hai cột ở đấy vì thế chỉ
  dám ghi "Đang chờ". Sửa được, nhưng phải dán lại SQL.

---

## File đã đụng tới

**Sửa** *(trong repo)*

- `js/pages/quan-tri/khu-thanh-vien.js` → 0.5.0
- `js/pages/quan-tri/khu-tai-khoan-he-thong.js` → 0.4.0

**Mới** *(ngoài repo — `Claude_Code/kiem-thu/`)*

- `do-cuon-bang.mjs` · `do-cuon-bang.html`

**Sửa** *(ngoài repo)*

- `sb-gia.mjs` → 0.6.0 *(`?nhieu=30`)*
- `xem-khung-quan-tri.mjs` *(năm cảnh mới: kq-12 → kq-16)*
