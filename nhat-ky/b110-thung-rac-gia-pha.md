# b110 — Xoá gia phả: hai chữ ký + thùng rác 30 ngày

*09/09/2026 · nhánh Supabase*

## Chủ dự án chốt gì

Câu treo của b110 — *"ai gọi `don_thung_rac()`"* — được trả lời ngay đầu phiên:

> *"dọn thùng rác chỉ có quản trị hệ thống, bấm tay, có chọn hàng loạt"*

Ba vế, và vế thứ nhì loại hẳn đường thứ hai mà `THIET-KE-NHIEU-CAY.md` mục
11.6 để ngỏ (nối vào trigger Apps Script chạy đêm). **Một việc phá dữ liệu
không chạy lúc không có ai ngồi xem.** Vế thứ ba quyết hình dạng tham số:
`don_thung_rac(p_ds uuid[])` nhận cả loạt, không nhận từng cây một.

## Làm được gì

| Sản phẩm | |
|---|---|
| `luoc-do/16-thung-rac-cay.sql` **0.2.0** | 5 cột trên `trees` · 1 ràng buộc · 8 hàm · sửa `co_the_xem_cay()` và `co_the_sua()` · `ds_gia_pha()` lên 18 cột · bảng tự kiểm 11 mục |
| `js/services/sb.js` **0.13.0** | 5 cửa mới + `tinThungRac()` nội bộ; `layDanhSachGiaPha()` đọc thêm 4 cột |
| `js/pages/quan-tri/khu-gia-pha.js` **0.7.0** | cột *Xoá* · khối **Thùng rác** có ô tích chọn hàng loạt |
| `js/pages/khoi-dong.js` **0.12.0** | trạng thái `daxoa` — lời nhắn kể đích danh tên cây, người xin, người duyệt |
| `kiem-thu/ban-thu-sql/do-b110.mjs` *(ngoài repo)* | **62/62 ĐẠT**, 5 phép kiểm chứng ngược |
| `kiem-thu/kiem-trang-quan-tri.mjs` | 154 → **190 phép**, PHẦN F2 mới |

✓ **ĐÃ DÁN CẢ HAI SUPABASE — 09/09/2026**, chủ dự án xác nhận bảng tự kiểm
11 mục đạt cả. ⏳ Nhưng **chưa ai bấm thử** — xem mục *Điểm dừng* cuối file.

## ⚠⚠ Phần đáng giữ nhất: thiết kế chỉ đúng nguy hiểm nhưng chỉ SAI đường vá

`THIET-KE-NHIEU-CAY.md` mục 11.6 viết hẳn một khối cảnh báo, và khối ấy đúng
về đích:

> *"`co_the_xem_cay()` — thêm điều kiện 'chưa vào thùng rác' vào đây. An toàn.
> `la_thanh_vien()` — ĐỪNG ĐỘNG VÀO […] bản sao lưu PHẢI tiếp tục chép cây
> đang nằm trong thùng rác."*

Làm đúng từng chữ câu ấy thì hỏng, và hỏng im lặng. Đo mới ra: `SaoLuu.gs`
chép chín bảng, trong đó **sáu bảng nội dung** (`trees` · `persons` ·
`unions` · `union_children` · `media` · `sources`) gác bằng **chính
`co_the_xem_cay()`** — `11` mục 16 đã đổi chúng sang hàm ấy từ b102. Nên:

> tài khoản `sao_luu` đọc cây trong thùng rác ra **0 dòng `persons`**, file
> sao lưu đêm vẫn sinh ra, vẫn đủ chín bảng, chỉ thiếu đúng cái cây đang mong
> manh nhất — và **không có gì báo lỗi**.

Ba mươi ngày trong thùng rác chính là ba mươi ngày dữ liệu ấy chỉ còn bản sao
lưu làm đường lùi. Để nó không có bản sao nào là hỏng đúng lúc không được
phép hỏng.

Đây là lỗ hổng b102 lặp lại ở hàm bên cạnh sau năm ngày, và lần này khác một
chỗ đáng ghi: **lời cảnh báo đã có sẵn, và nó trỏ vào hàm KHÔNG PHẢI chỗ
hỏng.** Một câu để nhớ, cùng họ với hai câu cũ (*hỏi hàm quyết quyền không
phải là đo hàng rào* — b102; *chạy lại không phải là nâng cấp* — b103):

> **Đọc lời cảnh báo không thay được việc đo.**

Cách vá: `co_the_xem_cay()` mang một lối riêng cho vai `sao_luu`
(`la_may_sao_luu()`). *Thùng rác đóng cửa với người, không đóng cửa với máy
sao lưu.* Phép **KC2** của `do-b110.mjs` bẻ đúng lối ấy đi và đòi thấy con số
0 — không có phép ấy thì HR8 chỉ chứng minh phép đo chạy.

## Hai hàm bị sửa, và vì sao chỉ hai

| Hàm | Vì sao | Có lối cho `sao_luu` không |
|---|---|---|
| `co_the_xem_cay()` | gác 6 bảng nội dung | **có** |
| `co_the_sua()` | gác cả 3 cửa ghi | **không** — máy sao lưu chỉ đọc |

`co_the_sua()` là chỗ duy nhất phải sửa để khoá chiều ghi, và đó là kết quả
đo: `luu_cay()` hỏi nó ở hàng rào đầu (`03` dòng 115), hai luật RLS kho ảnh
(`ghi_anh` · `xoa_anh`) cũng hỏi nó. **Ba cửa ghi, một câu hỏi.**

Không đụng `la_thanh_vien()` (gác `tree_members` · `change_log` · `imports` ·
`user_settings` — bốn bảng sao lưu vẫn phải chép) và không đụng `vai_tro()`
(`05-sao-luu.sql` dùng nó ở luật đọc `user_settings` và luật liệt kê kho ảnh).

## Ba chỗ lệch khỏi thiết kế, mỗi chỗ một lý do đo được

**1. `duyet_xoa_cay()` KHÔNG cấm người vừa xin tự duyệt.** Nếp `13`/`14` —
*"không ai tự đặt quyền cho mình"* — canh việc một người **tự nâng** quyền
mình. Việc ở đây ngược chiều: người ta tự bỏ đi thứ mình đang có, trên chính
cây mình đứng tên. Cấm đi thì hệ thống hôm nay **không xoá được cây nào** —
chủ dự án là Quản trị hệ thống duy nhất và đứng tên cả hai cây. Đúng bài học
`xoa_tai_khoan()` của b107: *một hàng rào mà lối đi qua nó không tồn tại thì
nó không phải hàng rào, nó là cái kẹt.* Cái giữ an toàn ở đây là hai **nhịp**
và một quãng chờ, không phải hai **người**.

**2. ~~`ds_gia_pha()` thêm nhánh `or la_thanh_vien(t.id)`~~ — CHỦ DỰ ÁN BÁC BỎ
NGAY TRONG PHIÊN, và chỗ tôi sai đáng ghi hơn chỗ tôi đúng.**

Bản 0.1.0 để cây vừa vào thùng rác **ở lại** trong danh sách của thành viên,
kèm một dấu hiệu — lý lẽ: không thì nó biến mất không lời giải thích. Chủ dự
án đọc xong trả lời:

> *"không hiện cây trong thùng rác. nếu người nào đang có chân trong cây này
> thì nhận thông báo cây đã bị xoá bởi… vậy không lo màn hình trắng"*

Đúng, và cái sai của tôi là sai về **tầng**: tôi lo màn hình trắng — một vấn
đề của người dùng — rồi chữa bằng cách **nới một hàng rào**. Một cây đã đóng
mà vẫn nằm trong bảng chọn là mời người ta bấm vào thứ không mở được; cái dấu
hiệu tôi thêm chỉ làm dịu triệu chứng chứ không trả lời câu hỏi *"chuyện gì
vừa xảy ra"*. Câu trả lời đúng nằm ở tầng khác hẳn: **một lời nhắn**.

Ba việc theo sau, và việc thứ hai là chỗ 0.1.0 tự chặn đường mình:

- `ds_gia_pha()` gỡ nhánh ấy. Cây trong thùng rác nay chỉ Quản trị hệ thống
  thấy, qua nhánh `la_quan_tri_he_thong()` vốn đã có — đủ cho khu Thùng rác.
- **Thêm cột `da_xoa_boi`.** Bản 0.1.0 *cố ý* không có nó, lý lẽ: *"ai duyệt
  thì `change_log` ghi, đẻ thêm cột là đẻ thêm chỗ để hai bản lệch nhau"*. Lý
  lẽ ấy đúng **khi không ai cần đọc cái tên đó trên màn hình**. Nay có: câu
  thông báo phải kể đích danh, mà thành viên **không đọc được `change_log`**.
  Bắt một lời nhắn đi lục nhật ký kiểm toán là sai tầng.
- **Thêm `tin_thung_rac(p_tree)`.** Sau khi gỡ nhánh trên, thành viên không
  còn *đường nào* đọc ra tên cây mình vừa mất — `ds_gia_pha()` không trả, RLS
  `doc_trees` cũng đóng. Hàm này mở đúng khe hẹp ấy: tên cây, ngày xoá, email
  người xin và người duyệt. Không một dòng `persons` nào.
  ⚠ Nó là `security definer` nên **tự gác**: phải có chân trong cây hoặc mang
  cờ Quản trị hệ thống. Thiếu mệnh đề ấy là người lạ dò được tên mọi gia phả
  từng bị xoá kèm email hai người liên quan — cùng hình dạng Bẫy 3 của `11`.
  HR10f canh đúng chỗ đó.

**3. Thêm trạng thái `daxoa` ở màn hình khởi động.** Đây là chỗ suýt
bỏ sót, và tìm ra bằng cách đọc `trang_thai_cua_toi()` chứ không bằng chạy
thử. `layPhien()` đặt `docDuoc: true` **cứng** cho ai có dòng `tree_members`
— "có chân trong cây" từng đủ để kết luận đọc được, và từ b110 thì không còn
đủ. Không vá thì người có đủ quyền, kể cả Quản trị hệ thống, mở app ra thấy
**một sơ đồ trống không một chữ giải thích** — đúng kiểu hỏng
`THIET-KE-QUAN-TRI.md` gọi tên: *"Lưu báo thành công mà màn hình trống"*.

## ⚠ Ảnh trong kho không cascade

`media` là bảng Postgres nên nó đi theo `delete from trees`. **File ảnh thì
không** — chúng nằm trong kho `anh` của Supabase Storage, Postgres không với
tới. Nên `don_thung_rac()` đọc `media` **trước** khi xoá và trả `dsAnh`; màn
hình gọi `xoaAnhThat()` ngay sau. Bỏ bước này là để lại file mồ côi vĩnh
viễn, không ai còn đường tìm ra chúng nữa.

## ⚠ `change_log` đi theo, khác hẳn `xoa_tai_khoan()`

Ở b107 nhật ký ở lại vì nó nói về NGƯỜI (`by_email` là chữ, không khoá ngoại).
Ở đây nhật ký nói về CÂY, và cái cây đang bị xoá — giữ lại là giữ những dòng
không ai đọc được nữa. Nói ra vì nó **không lấy lại được**, và bản sao lưu đêm
là bản duy nhất còn giữ nó.

## Ba lỗi của chính phép đo, bắt được trong lúc chạy

**a. Bảng `persons` không có cột `en`.** Khối gieo kê thêm cột ấy, cả khối ném
lỗi ở dòng đó dưới `ON_ERROR_STOP`, và **tám phép sau đo trên một bàn thử
thiếu cây thử** — trong đó HR13 báo `0` thay vì `2`, trông y như một lỗi thật
của `don_thung_rac()`.

**b. Phép đo không tự dọn vết của mình.** Phần 8 đưa NTB vào thùng rác để đo
kiểm chứng ngược rồi không lấy ra, nên **lần chạy thứ hai đo trên vết của lần
thứ nhất** và HR3 báo HỎNG hoàn toàn bịa. Đã thêm ba dòng dọn ở đầu phần 2;
nay chạy hai lần liên tiếp đều 62/62.

**c. Một biểu thức quét LỐ sang hàm kế tiếp.** Phép kiểm mới *"`ds_gia_pha()`
không còn nhánh `la_thanh_vien`"* viết
`ds_gia_pha[\s\S]*?la_thanh_vien` và **báo HỎNG trên một file đúng**: dấu
`*?` tuy lười vẫn chạy tiếp qua hết thân hàm để bắt chữ `la_thanh_vien` nằm
trong `tin_thung_rac()` ở mục 5b ngay sau đó. Đã thêm hàm `thanHamSql()` cắt
lấy thân hàm rồi mới tìm.

⚠ Lỗi này đáng chú ý vì nó hỏng theo hướng **khó chịu** (báo động giả), tức
hướng dễ phát hiện. Cùng biểu thức ấy mà đặt ngược lại — đi tìm một chữ *phải
có* — thì nó sẽ báo ĐẠT nhờ bắt được chữ ở hàm bên cạnh, và không ai biết.

Cùng họ với bài học `do-b105` ngày 08/09: **thứ mình dùng để đo cũng hỏng
được, và nó hỏng theo kiểu trông y như lỗi của thứ đang bị đo.**

## Đã đo bằng cách nào

- `do-b110.mjs` — **62/62 ĐẠT**, 14 hàng rào + 5 phép kiểm chứng ngược. Chạy
  hai lần liên tiếp cùng kết quả.
- Bảng tự kiểm của `16` — **11 mục**, ĐẠT cả (mục *"chưa cây nào lỡ vào thùng
  rác"* báo đúng cây còn sót của lần đo, tức nó đang làm việc).
- `kiem-trang-quan-tri.mjs` — **190/190**. Đã bẻ gãy có chủ ý **hai** chỗ và
  xác nhận bộ kiểm bắt được cả hai: mệnh đề `la_may_sao_luu` (189 đạt, 1
  hỏng) và nhánh `la_thanh_vien` dán trở lại vào `ds_gia_pha()` (189 đạt, 1
  hỏng). Cả hai lần đều trả file về nguyên vẹn, đối chiếu bằng `diff`.
- `/kiem-tra` — **đạt cả 9 phép**, `domains/` vẫn khớp md5 10/10.

## ⏳ Điểm dừng — SQL đã dán, vòng bấm thử chưa đi

✓ Dán xong cả hai Supabase 09/09/2026, tự kiểm 11 mục đạt cả.

⚠ **"Tự kiểm đạt" chưa phải "điểm dừng đóng", và b102 đã trả giá để dạy câu
ấy:** bảng tự kiểm 12/12 từng báo xanh trong lúc bất cứ ai cũng tự đặt được
mình thành Quản trị hệ thống. Bảng ấy hỏi *hình dạng*, và nó là máy chủ tự nói
về mình. Phép đo 62/62 mạnh hơn nhiều — nó đo hàng rào, mượn danh nghĩa tài
khoản thật — nhưng vẫn chạy trên **bàn thử**, không phải Supabase thật, và
không có ai bấm nút.

Còn thiếu đúng một thứ: một người đi đủ vòng: **xin xoá một cây thử
→ cây vẫn dùng được bình thường trong lúc chờ → duyệt → không ai đọc được nữa
→ phục hồi → đọc lại đủ 59 người.** Chỉ người bấm mới đóng được điểm dừng
này, đúng như b96 · b101 · b103 đã dạy.

⚠ **Không đem cây thật ra thử.** Dựng một cây mới bằng nút *+ Dựng gia phả
mới* rồi thử trên nó.
