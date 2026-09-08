# b106 — Khu Tài khoản: bảng, ba tấm lọc, năm việc đổi quyền

*09/09/2026 06:49 · nối tiếp phiên bị tắt máy giữa chừng*

## Bước này bắt đầu từ một phiên chết dở

Máy thứ hai đang viết b106 thì bị tắt. Phiên này mở ra thấy sáu file chưa ghim
vào git, hai bộ kiểm đã sửa theo, và **không có gì nói cho biết nó đã xong hay
chưa**. Việc đầu tiên vì thế không phải viết mã mà là **đọc lại chính mình**:
chạy đủ mười bộ kiểm, chạy `/kiem-tra`, rồi mới dám ghim.

Nếp rút ra, và nó đáng giá hơn cả bước này: **cái quyết định được "đã xong hay
chưa" là bộ kiểm và bảng điểm dừng trong `KE-HOACH.md`, không phải trí nhớ của
phiên trước.** Nhờ có hai thứ ấy mà một phiên chết dở nối lại được trong mười
phút thay vì phải đọc lại 817 dòng để đoán.

## Làm được gì

- `js/pages/quan-tri/khu-thanh-vien.js` **MỚI** — danh sách tài khoản của cây
  đang mở, ba tấm lọc *Đang chờ · Đã duyệt · Tất cả*, năm việc đổi quyền hai
  nhịp, cộng duyệt/từ chối đơn xin vào cây.
- `js/services/sb.js` — 7 cửa gọi sang `luoc-do/13`.
- `js/pages/quan-tri/khung.js` 0.3.0 — nối khu 2. Chữ trên thanh là **Tài
  khoản**, còn mã trong `#` giữ nguyên `thanh-vien`.
- `js/pages/settings.js` 1.31.0 — gỡ khối *Đơn chờ duyệt*, nay là khu 2.

## VÌ SAO

### Vì sao chữ "Tài khoản", không phải "Thành viên"

Bảng dưới máy chủ tên `tree_members`, hàm tên `ds_thanh_vien`, nhưng thứ liệt
kê ra là **tài khoản đăng nhập** — không phải người trong sơ đồ gia phả. Hai
cột khác hẳn nhau: vai trò gắn vào `user_id`, còn `person_id` chỉ để tính phạm
vi sửa trực hệ. Chủ cây phong quản trị cho một tài khoản bất kỳ; người ấy
không cần có mặt trong gia phả, không cần là con cháu trong họ.

Giữ mã cũ mà đổi chữ hiển thị là chọn có chủ ý: đổi mã trong `#` địa chỉ làm
hỏng mọi đường link đã gửi đi, để lấy về đúng một chữ không ai nhìn thấy.

### Vì sao hỏi máy chủ câu quyền, không suy từ `phien.vaiTro`

Từ b105, chủ cây nhận quyền qua **một cột** (`trees.chu_so_huu`), không qua mã
vai. Mọi phép suy trong trình duyệt vì thế khoá tay đúng người có quyền nhất.
Nên khu này gọi `coTheQuanTri()` hỏi thẳng máy chủ. Bộ kiểm có một phép bẻ gãy
canh riêng chỗ này.

### Vì sao phân biệt *xem được* với *đổi được*

Máy chủ cố ý cho **mọi thành viên** đọc danh sách (`ds_thanh_vien` gác bằng
`co_the_kiem_duyet`, không phải `co_the_quan_tri`) — vì `02-rls.sql` vốn đã mở
bảng `tree_members` cho họ, gác chặt hơn ở tầng trên chỉ là diễn kịch. Nên khu
này phải trả lời hai câu khác nhau, và câu thứ hai mới là câu quyết định nút.

## Đã thử mà hỏng

### 1. Bảng việc nằm TRONG bảng — hỏng, và bộ kiểm không thấy

Bản đầu mở bảng việc thành một dòng ẩn ngay dưới dòng vừa bấm. Đọc mã thì hợp
lý. Nhưng ô ấy nằm trong cái bảng `min-width:860px`, nên **việc thứ ba trở đi
rơi ra ngoài mép màn hình**. Chủ dự án đổi được vai (việc 1), gỡ được tài khoản
(việc 4), rồi hỏi *"bật tắt tin cậy ở đâu?"* — việc 3 nằm ngay đó, chỉ là không
nhìn thấy.

**121 phép kiểm đều xanh trong khi màn hình không dùng được.** Bộ kiểm chỉ đọc
chữ trong mã; nó không biết cái gì rơi ra ngoài mép. Đây là lần thứ hai dự án
này trả giá cho đúng bài học ấy.

Điều đáng nói hơn: máy thứ hai **đã biết** — nó viết sẵn khối chú thích *"bảng
việc đứng ngoài bảng, đo trên ảnh 390px"* và tạo sẵn biến chứa, rồi tắt máy
trước khi đổ gì vào. Chú thích mô tả thiết kế đúng, mã thì vẫn làm kiểu cũ.
**Chú thích không phải mã.** Một file có chú thích nói ngược với mã là file
nguy hiểm hơn file không có chú thích, vì người đọc sau tin vào chú thích.

### 2. Nút mở ra rồi mới giải thích — chủ dự án bác bỏ

Bản đầu cho bấm *Sửa quyền* trên dòng của chính mình, mở ra, rồi hiện câu
*"không ai đặt quyền cho chính mình được"*. Nguyên văn chủ dự án:

> *"nút chuyển sang màu xám và ở trạng thái khóa, không cần cho bấm vào rồi đi
> giải thích."*

Đúng. Nếu **mọi** việc bên trong đều bị máy chủ từ chối thì cái nút mở ra chỉ
để nói *"đừng bấm"*. Nay nút khoá sẵn ở hai loại dòng: dòng của chính mình, và
mọi dòng khi người xem không đổi được quyền. Lý do nằm sẵn trên màn hình mà
không phải bấm gì — huy hiệu *Bạn* ở cột đầu, và câu nhắc ở đầu khu.

### 3. Cờ `tin_cay` mang tên "Ghi thẳng" — đúng nghĩa, sai chỗ tìm

*Ghi thẳng* mô tả đúng cái nó làm. Nhưng chủ dự án đi tìm chữ **"tin cậy"**
(tên cột, và là chữ họ dùng khi nói) nên không thấy. Nay trên màn hình gọi là
**Tin cậy**; chữ "ghi thẳng" ở lại trong câu giải thích, nơi nó nói ra **hậu
quả** của việc bật. Tên thì lấy chữ người dùng đi tìm, mô tả thì lấy chữ nói
đúng việc.

## Còn treo

- Chủ dự án mới nghiệm thu bằng mắt **bốn** trong sáu việc của điểm dừng:
  thấy danh sách · đổi được vai · gỡ được tài khoản *(đã dọn `thu-h9@…`)* ·
  và xác nhận nút khoá đúng. **Chưa xác nhận**: gắn được mã người, và đăng
  nhập bằng tài khoản vai `sua` để xem `pham_vi_sua()` phản ánh đúng.
- Cài đặt còn **7 khối**, về 6 ở b111 khi khu Sao lưu xong.

## File đã đụng

**Mới**
- `js/pages/quan-tri/khu-thanh-vien.js` *(0.2.0)*

**Sửa**
- `js/services/sb.js` — 7 cửa mới
- `js/pages/quan-tri/khung.js` *(0.3.0)*
- `js/pages/settings.js` *(1.31.0)* — gỡ khối Đơn chờ duyệt
- `kiem-thu/kiem-trang-quan-tri.mjs` — 121 phép
- `kiem-thu/kiem-duyet-dang-ky.mjs` — 40 phép
