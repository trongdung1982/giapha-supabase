# KẾ HOẠCH — nhánh Supabase

*Cập nhật 10/09/2026 · Bước gần nhất: **b110d** · Việc kế tiếp: **b111***

> ✓ **b109 XONG, chạy thật.** Tấm lọc *Toàn hệ thống* + bảng sâu + bốn việc
> — chủ dự án đã bấm thử trên máy chủ thật, đạt: đúng số cây, cả bốn việc
> chạy. Không dán SQL — bốn hàm ấy đã nằm sẵn trên cả hai máy chủ từ b107–b108.
>
> b109 chia đôi ngay đầu phiên: nửa sau — **b109b**, ô tìm/gợi ý cho form
> Mời — chưa bắt đầu, và nó cần bàn thiết kế trước vì đụng ranh giới
> *"QuanTri.html không nạp cây gia phả"*.

> **Đây là file đổi nhanh nhất trong khung.** Tên file cố định, không có
> `_Vxx` — lịch sử để git giữ. Muốn biết kế hoạch tuần trước thế nào thì
> `git log -p KE-HOACH.md`, đừng đẻ ra bản thứ hai.
>
> ⚠ **`tai-lieu/KE-HOACH_V54.md` nói về nhánh Apps Script**, không nói về
> nhánh này. Đừng lấy việc còn treo của nó làm việc kế tiếp ở đây.

---

## Đang ở đâu

> ✓ **10/09/2026 — LỖ HỔNG "HAI CHỮ KÝ" ĐÃ VÁ, ĐÃ DÁN, ĐÃ DỌN VẾT (b110c → b110d).**
> Chủ dự án bấm thử và bắt được: mời một tài khoản vào cây rồi **tự duyệt và
> tự đổi vai hộ họ**, không cần họ đồng ý. Đo ra **bốn cửa** thủng. Bản vá
> `luoc-do/18-hai-chu-ky.sql` đã dán lên máy chủ thật.
>
> ⚠ **Dán xong, bảng tự kiểm của chính `18` báo nhầm ở HAI phép** (b110d):
> phép 10 so sai kiểu dữ liệu nên không bao giờ xanh được dù hàm đúng; phép
> 13 và câu dọn ở mục 9 lại **lệch điều kiện với nhau** nên cùng bỏ sót vết
> thật. Đo trên bàn thử bằng cách gieo lại đúng hình dạng vết rồi cho cả bản
> cũ lẫn bản mới của phép kiểm chạy qua — bản cũ "ĐẠT" sai, bản mới HỎNG
> đúng. Cả ba phép đã sửa trong `18` (không đụng hàm nghiệp vụ).
>
> Vết thật tìm thấy trên máy chủ: `khach@io.vn` đã sửa được ở vai `sua` trên
> hai cây dù chưa bấm Nhận lời mời. Chủ dự án đã dán câu dọn — xác nhận
> `Success. No rows returned`, sạch. Chi tiết: `nhat-ky/b110c-hai-chu-ky.md`
> và `nhat-ky/b110d-vet-phep-kiem-sai.md`.

**CẢ CHUỖI ĐÃ THÔNG.** 03/09/2026: bốn file SQL đã chạy thật, tài khoản tạo
được, đăng nhập được, **và thêm được người mới** — tức trình duyệt ghi xuống
Postgres qua `luu_cay()` và dữ liệu nằm lại trong bảng. Đây là lần đầu tiên
điều đó xảy ra; mọi dòng trước ngày này chỉ là thiết kế chưa ai bấm thử.

**SAO LƯU ĐÃ CHẠY THẬT — 04/09/2026 08:33.** Chủ dự án dựng xong dự án Apps
Script sao lưu, tạo tài khoản `sao-luu@nguyentrongbac.io.vn` mang vai `sao_luu`,
và bản sao lưu đầu tiên nằm trên Drive:
`tai-lieu/tailieu-Supabase/giapha-sao-luu-2026-09-04-0833.json`. Chính file ấy
là chứng cứ `luoc-do/05-sao-luu.sql` đã chạy — trong đó có dòng
`tree_members.role = 'sao_luu'` và danh sách tài khoản, hai thứ chỉ đọc được
sau khi file SQL ấy mở đúng ba chỗ RLS.

**DI DỜI DỮ LIỆU ĐÃ CHẠY THẬT — 04/09/2026 11:28.** Chủ dự án dán
`tai-lieu/di-doi-NTB-20260904.sql` vào SQL Editor và bảng đối chiếu cuối file
khớp **cả 7/7 dòng**: `persons` 59 · `unions` 25 · `union_children` 36 ·
`change_log` 13 · `media`/`sources`/`imports` 0. Tức gia phả của bản Apps Script
nay nằm trong Postgres, giữ nguyên `uid`, giữ nguyên `ts`/`by` của nhật ký, và
người trung tâm `P0012` có thật trong bảng.

**CÂU HỎI TREO TỪ 24/08/2026 ĐÃ CÓ TRẢ LỜI — 04/09/2026.** Chủ dự án chốt
luật phân quyền, và nó **không phải "chia chi/nhánh"**: tài khoản muốn sửa
phải **gắn với một mã người** và **được admin duyệt**, rồi sửa được **trực hệ**
của người ấy — lên chỉ đường thẳng (bố mẹ, ông bà, cụ), xuống toàn bộ con
cháu, cộng vợ/chồng. Chưa gắn thì chỉ xem. Vai admin cấp cho nhiều tài khoản.

Mã đã viết xong (b93): `luoc-do/06-quyen-truc-he.sql` + hàng rào 4 của
`03-ham-luu-cay.sql` viết lại, bộ kiểm `kiem-quyen-truc-he.mjs` 57 phép đạt.

**HAI FILE SQL ĐÃ DÁN THẬT — 04/09/2026 13:20.** Lần dán đầu vấp lỗi `42P13`
(`create or replace` không đổi được tên tham số `p_branch` → `p_person`); thêm
một dòng `drop function` là qua. Đã đối chiếu trên máy chủ và khớp cả hai:
`co_the_sua_nguoi` nhận `(p_tree uuid, p_person text)`, và `luu_cay()` đang
gọi `pham_vi_sua()`. **Luật trực hệ từ giờ có hiệu lực thật, không còn là mã
nằm trong file.** Chưa ai đi thử — đó là việc 3.

**PHÉP THỬ H9 ĐÃ XONG — 04/09/2026, năm hàng rào đạt cả năm.** Đo bằng cách gọi
thẳng REST của Supabase, không qua trình duyệt — cách duy nhất chứng minh được
hàng rào "ghi thẳng cửa sau bị chặn". Và phép thử **bắt được một lỗ hổng leo
quyền thật** mà 57 phép kiểm tự động không thấy; đã vá và đánh lại đúng đòn ấy
để chứng minh vá kín. Số đo ở `nhat-ky/b94-phep-thu-h9.md`.

**MÀN HÌNH DUYỆT ĐÃ DÙNG THẬT — 04/09/2026 tối.** Chủ dự án bấm Duyệt cho đơn
của `thu-h9`, và mở app xem cây 59 người: vẽ ra đúng. Hai chỗ hở cuối cùng của
b96 và của H5 khép lại ở đây, và cả hai đều là loại chỉ người bấm mới đóng
được — không bộ kiểm nào thay thế.

**KIỂM DUYỆT NỘI DUNG, TẦNG MÁY CHỦ — VIẾT XONG 04/09/2026 (b97).**
`luoc-do/08-kiem-duyet.sql` mới, cộng `luu_cay()` viết lại lên 0.3.0. Bộ kiểm
`kiem-thu/kiem-kiem-duyet.mjs` **111 phép, đạt 111**, có bốn phép kiểm chứng
ngược.

**BỐN HẠNG NGƯỜI, ĐẶT TÊN LẠI — 04/09/2026.** Chủ dự án chốt cách gọi:
**Quản trị hệ thống** · **Quản trị viên** · **Thành viên** · **Khách**.
Màn hình Cài đặt trước đây in thẳng mã trong bảng ra cho người trong họ đọc;
nay đi qua `vaiTroBangChu()` trong `settings.js` 1.27.0.

**VÀ MÃ `chu` ĐÃ ĐỔI THÀNH `quan_tri_he_thong`.** Ban đầu tôi chỉ đổi chữ trên
màn hình và giữ nguyên mã trong bảng; chủ dự án trả lời *"mình nhìn chữ chu rất
không thích"*, nên đổi nốt. Cái giá của việc đổi, đo được: mã cũ nằm ở **11 hàm,
2 luật RLS, 1 ràng buộc và chính dữ liệu** — tức phải dán lại năm file chứ
không phải một. Đó là hậu quả của việc tên vai nằm rải thành chữ viết thẳng ở
mỗi nơi gọi, thay vì gọn vào một chỗ — ghi lại để lần sau biết.

File di dời: `luoc-do/09-doi-ma-vai.sql`. Bộ kiểm nay có một phép **đọc cả thư
mục** `luoc-do/` và `js/` để hỏi *"còn file nào sót mã cũ không"* — danh sách
viết tay không trả lời được câu ấy, vì file bị quên cũng là file không có trong
danh sách.

**SÁU FILE SQL ĐÃ DÁN THẬT — 04/09/2026 23:00.** Chủ dự án chạy đúng thứ tự
`09` → `05` → `06` → `07` → `08` → `03`. Bảng đối chiếu của `09` **khớp cả 5
dòng**, và hai dòng đáng tiền nhất — *"còn bao nhiêu HÀM / LUẬT RLS nhắc mã
cũ"* — đều bằng **0**. Đó là chứng cứ không sót file nào, và nó hỏi thẳng máy
chủ chứ không hỏi trí nhớ của ai.

**HOÀN TÁC ĐÃ CHẠY THẬT — 05/09/2026.** Chủ dự án dán
`kiem-thu/thu-hoan-tac.sql` vào SQL Editor: **17/17 đạt**, `revision 10 → 14`,
59 người không đổi, hai dòng nhật ký của phép thử tự dọn. Cả hai nhánh của
đường hoàn tác đều đúng — trả **giá trị cũ** về (A5) và **lấy người mới đi**
(B3). Trước đó nó chỉ được bộ kiểm soi bằng văn bản, và *"có mã hoàn tác"*
khác *"hoàn tác được"* đúng như khoảng cách giữa *"có file sao lưu"* và
*"khôi phục được"* — khoảng cách ấy nay đã đóng ở phía kiểm duyệt.

**b98 ĐÃ XONG 05/09/2026 — trang duyệt `QuanTri.html` + HOÀN TÁC chạy thật.**
Cả sáu việc của giai đoạn cũ nay đều xong.

**GIAI ĐOẠN MỚI CHỐT 05/09/2026 — MỞ RỘNG `QuanTri.html` THÀNH TRANG QUẢN TRỊ.**
Chủ dự án: *"trang QuanTri.html có tiềm năng mà chưa khai thác hết… cài đặt chỉ
chứa thông tin về hiển thị sơ đồ, còn quản lý thì nên đưa hết vào quản trị"*.

Thiết kế chốt ở **`THIET-KE-QUAN-TRI.md`** — đọc file ấy trước khi làm bất cứ
bước nào từ b100 trở đi. Nguồn: bản thiết kế ChatGPT đặt hàng 05/09/2026, cộng
ba phép đo trên mã mà ChatGPT không có cách nào biết.

⚠ **Ba khối KHÔNG dời được khỏi Cài đặt**, và đó là kết quả đo chứ không phải
lười: *Quản lý gia phả* cần `state.tree`, *Xuất ảnh PNG* cần chính phần tử SVG
đang vẽ (`xuatAnhPNG(svgEl, state.tree)`), *Nhập dữ liệu* có chế độ bổ sung vào
cây đang mở. Dời chúng là buộc `QuanTri.html` nạp cả cây — phá đúng lý do #2
khiến nó là trang riêng. Cài đặt vì thế xuống **6 khối**, không xuống 3.

⚠ *Hôm nay dữ liệu trong bảng là dữ liệu giả và app chưa có người dùng nào, nên
không có gì khẩn ở đây — thứ tự các bước là vì đúng trình tự, không phải vì
đang có rủi ro nào treo trên đầu.*

**NHIỀU GIA PHẢ — BA CÂU CHỐT 05/09/2026, VÀ MỘT LUẬT CŨ BỊ LẬT.**
Chủ dự án mở một mặt trận thứ hai ngay trong phiên b99: cho người trong họ dựng
cây riêng *(phải xin phép mới được)*, phân biệt **"được xem"** với **"được truy
cập"**, và xin nạp luôn cây **Nguyễn Phúc Giáo — 681 người**. Ba câu đã chốt:

| Câu | Chốt |
|---|---|
| Quản trị toàn hệ thống nhìn tới đâu trên cây nhà khác? | **Đọc VÀ SỬA được mọi cây** |
| Đăng nhập xong thấy danh sách cây nào? | **Mọi cây — nhưng CHỦ CÂY tự bật/tắt cho người lạ thấy tên cây mình** |
| Người dựng cây mới thì mã cũ của họ xử lý sao? | **Cây mới cấp mã riêng + một cột trỏ về cây cũ** |

⚠ **Câu thứ nhất LẬT một luật đã ghi thành chữ ở chính file này** — mục *Nhiều
cây gia phả* bên dưới từng viết *"không có siêu quản trị toàn hệ thống"*. Từ
05/09/2026 câu ấy hết đúng. Gặp nó ở đâu trong lịch sử git thì đọc kèm ngày.

Thiết kế chốt ở **`THIET-KE-NHIEU-CAY.md`**. Phát hiện làm cho việc này rẻ hơn
vẻ ngoài của nó: **mọi hàm quyết quyền đều hỏi đúng một hàm `vai_tro()`**, nên
"quản trị toàn hệ thống ở mọi cây" chèn được ở **hai chỗ**, không phải mười
một. Cái giá đi kèm: hai chỗ ấy là **nền móng**, nên b102 là bước nguy hiểm
nhất của cả dự án cho tới nay.

**Sáu mươi bảy việc đã đóng** *(đếm lại 10/09/2026, b110d — 67 dòng)* — đếm
theo đúng số dòng của bảng ngay dưới, đừng
chép lại con số của lần trước (`KE-HOACH_V54` từng đứng nguyên ở *"bảy"* rồi *"hai
mươi"* trong khi bảng cứ dài thêm).

| Việc | Bước | Chốt |
|---|---|---|
| Lược đồ Postgres 12 bảng + RLS + cửa ghi duy nhất | b87 | ✓ |
| `services/sb.js` · `hinh-dang.js` · `repo.js` viết lại | b87 | ✓ |
| Màn hình đăng nhập email + mật khẩu | b87 | ✓ |
| Thư viện supabase-js chép vào `vendor/` | b87 | ✓ |
| Bộ kiểm `kiem-hinh-dang.mjs` — 14/14 đạt | b87 | ✓ |
| Chuyển sang repo `giapha-supabase`, dựng khung tài liệu | b87 | ✓ |
| **Đẩy lên GitHub, Pages phục vụ thật** | **b88** | ✓ **03/09/2026** |
| `/kiem-tra` thêm phép 2b và 9; `/ket-thuc` tách hai nhánh | b88 | ✓ |
| **Bốn file SQL chạy thật · đăng nhập · thêm người mới** | **b89** | ✓ **03/09/2026** |
| Máy chủ thử tại chỗ (`kiem-thu/may-chu-tai-cho.mjs`, ngoài repo) | b89 | ✓ |
| **Tên miền `nguyentrongbac.io.vn` chạy, có HTTPS (H6)** | **b89** | ✓ **03/09/2026 15:57** |
| Sửa lỗi cột `not null` nhận `null`; bộ kiểm 14 → 19 phép | b89 | ✓ |
| `gh` CLI trên máy `LapASUS` + `MAY-THU-HAI.md` | b89 | ✓ |
| **Mã sao lưu (H8) viết xong, bộ kiểm 29 phép** | **b90** | ✓ **03/09/2026** |
| **Sao lưu bỏ hẳn khoá bí mật — vai `sao_luu`, bộ kiểm 33 phép** | **b91** | ✓ **04/09/2026** |
| `gh` CLI + tự kiểm trên máy thứ hai `LapAMD` | b91 | ✓ **04/09/2026** |
| **Sao lưu CHẠY THẬT — `05-sao-luu.sql` chạy, tài khoản sao lưu tạo, có file trên Drive** | **b91** | ✓ **04/09/2026 08:33** |
| **Bộ sinh SQL di dời (H5) + bộ kiểm 46 phép** | **b92** | ✓ **04/09/2026** |
| **Di dời dữ liệu CHẠY THẬT — bảng đối chiếu khớp 7/7 dòng** | **b92** | ✓ **04/09/2026 11:28** |
| **Luật phân quyền TRỰC HỆ — chốt, cài, bộ kiểm 57 phép** | **b93** | ✓ **04/09/2026 13:20** — đã dán |
| **Phép thử H9 CHẠY THẬT — 5/5 hàng rào RLS, bắt và vá một lỗ hổng leo quyền** | **b94** | ✓ **04/09/2026** |
| Nút Đăng xuất trong màn Cài đặt | b94 | ✓ 04/09/2026 |
| **Hàng chờ duyệt: `approved` gác cả quyền đọc, màn hình xin vào, khối duyệt** | **b95** | ✓ **04/09/2026** |
| **Hàng chờ CHẠY THẬT — người đang chờ đọc 0 dòng trên cả 6 bảng** | **b96** | ✓ **04/09/2026** |
| **Màn hình Duyệt dùng thật · cây 59 người vẽ đúng trong app** | **b96** | ✓ **04/09/2026 tối** |
| **Kiểm duyệt nội dung, tầng máy chủ — `08` + `luu_cay()` 0.3.1, bộ kiểm 111 phép** | **b97** | ✓ **04/09/2026** — đã dán |
| **Hai hạng quản trị tách ra — `quan_tri` chỉ kiểm duyệt, không đổi được quyền** | **b97** | ✓ **04/09/2026** — đã dán |
| **Đổi MÃ VAI — `chu`→`quan_tri_he_thong`, `admin`→`quan_tri`; 4 hạng có tên tiếng Việt** | **b97** | ✓ **04/09/2026 23:00** — đã dán |
| **Thiết kế chốt trang Quản trị 4 khu + kế hoạch b100→b105; đo ra 3 lỗi khi có nhiều cây** | **b99** | ✓ **05/09/2026** |
| **Thiết kế chốt NHIỀU CÂY — 3 câu chủ dự án chốt, `THIET-KE-NHIEU-CAY.md`** | **b100** | ✓ **05/09/2026** |
| **Ba lỗi nhiều cây sửa xong — `10-sua-nhieu-cay.sql` + 4 file JS** | **b100** | ✓ **05/09/2026 16:35** — đã dán, 9/9 ĐẠT |
| **Cây Nguyễn Phúc Giáo 681 người — SQL di dời sinh xong, chạy đúng trên bàn thử** | **b100** | ✓ **05/09/2026 16:35** — đã dán, bảng 7 dòng khớp, 16/16 ĐẠT ⚠ xem ghi chú FK |
| **Bộ sinh SQL di dời TỰ DỰNG CÂY kèm người quản trị; bộ kiểm 46 → 47 phép** | **b100** | ✓ **05/09/2026** |
| **Hai bộ kiểm mới: `kiem-nhieu-cay.mjs` 35 phép · `thu-nhieu-cay.sql` 16 phép chạy thật** | **b100** | ✓ **05/09/2026** |
| **Bàn thử SQL tại chỗ nay dựng HAI cây, nên tái hiện được lỗi nhiều cây** | **b100** | ✓ **05/09/2026** |
| **Trang Quản trị thành khung BỐN KHU — bấm thử trên app thật, đạt cả bốn điểm dừng** | **b101** | ✓ **07/09/2026** — đã đẩy `041b2a5` |
| **Tầng quyền cấp hệ thống — `11-quyen-he-thong.sql` 0.2.0, bốn hàng rào 16/16** | **b102** | ✓ **07/09/2026** — đã dán CẢ HAI Supabase |
| **Rà bản AGY bằng phép ĐO: bắt được 2 lỗ hổng mà 12/12 tự kiểm báo xanh** | **b102** | ✓ **07/09/2026** |
| **Phép đo mượn danh nghĩa tài khoản (`set local role authenticated`) — 29/29, có 3 phép kiểm chứng ngược** | **b102** | ✓ **07/09/2026** |
| **Khu Gia phả — thấy cả cây mình chưa có chân, xin quyền, công tắc cho người lạ thấy tên** | **b103** | ✓ **08/09/2026** — đã dán |
| **`11` lên 0.3.1 — `dat_cho_nguoi_la_thay_ten()` · cột `toi_la_chu` · nhánh cho người đang chờ · `drop function` trước `ds_gia_pha()`** | **b103** | ✓ **08/09/2026** — đã dán *(lần dán đầu ném 42P13, vá xong dán lại đạt)* |
| **Phép đo `do-b103.mjs` — 22/22 ĐẠT, 3/3 kiểm chứng ngược** | **b103** | ✓ **08/09/2026** |
| **`vaiTroBangChu()` dời xuống `config.js` — một bảng tên, không hai bản chép** | **b103** | ✓ **08/09/2026** |
| **Tạo gia phả mới — `12-tao-cay.sql`, `tao_gia_pha_moi()` một giao dịch, nút + Dựng** | **b104** | ✓ **08/09/2026** — đã dán |
| **Bàn thử SQL tại chỗ đo lại đường nâng cấp `11` (0.2.0→0.3.1) và đường nửa vời** | **b104** | ✓ **08/09/2026** |
| **Phép đo `do-b104.mjs` — 38/38 ĐẠT, 3 kiểm chứng ngược** | **b104** | ✓ **08/09/2026** |
| **Quy tắc mã cây đổi sang 3 chữ số, vá lỗ hổng bộ đếm mã** | **b104** | ✓ **08/09/2026** |
| **Quản lý tài khoản của một cây — `13`, 6 hàm; luật KHÔNG ai tự đặt quyền cho mình (5 cửa)** | **b105** | ✓ **08/09/2026** — đã dán |
| **Vai chủ cây neo vào cột `trees.chu_so_huu`; mã `quan_tri_he_thong` bị cấm khỏi `tree_members`** | **b105** | ✓ **08/09/2026** — đã dán |
| **Bàn giao gia phả (`doi_chu_cay`) — chức năng bị bỏ sót, chủ dự án bổ sung** | **b105** | ✓ **08/09/2026** — đã dán |
| **Phép đo `do-b105.mjs` — 53/53 ĐẠT, 4 kiểm chứng ngược · bộ kiểm `kiem-quan-ly-thanh-vien.mjs` 55/55** | **b105** | ✓ **08/09/2026** |
| **Xoá gia phả hai chữ ký + thùng rác 30 ngày — `16-thung-rac-cay.sql` 0.2.0** | **b110** | ✓ **09/09/2026** — đã dán cả hai |
| **Lối riêng cho vai `sao_luu` — sao lưu đêm vẫn chép được cây trong thùng rác** | **b110** | ✓ **09/09/2026** — thiết kế chỉ sai đường vá, đo mới ra |
| **Cây trong thùng rác biến khỏi danh sách; thành viên nhận lời nhắn `tin_thung_rac()`** | **b110** | ✓ **09/09/2026** — chủ dự án chốt, bác bỏ bản 0.1.0 |
| **Phép đo `do-b110.mjs` — 62/62 ĐẠT, 5 kiểm chứng ngược · `kiem-trang-quan-tri.mjs` 154 → 190** | **b110** | ✓ **09/09/2026** |
| **Quyền DỰNG CÂY tách khỏi vai Quản trị gia phả — `17-quyen-tao-cay.sql`, cửa thứ BẢY** | **b110b** | ✓ **10/09/2026** — đã dán cả hai |
| **Ô tích *Tạo gia phả* trong sổ đăng ký tài khoản (một nhịp, chủ dự án đặt hàng)** | **b110b** | ✓ **09/09/2026** |
| **Không màn hình nào ngầm định "cây đang mở" — `veBangViec/veXetDon` nhận đối tượng cây** | **b110b** | ✓ **09/09/2026** |
| **Phép đo `do-b110b.mjs` — 29/29 ĐẠT, 3 kiểm chứng ngược · `kiem-trang-quan-tri.mjs` 190 → 214** | **b110b** | ✓ **09/09/2026** |
| **⚠ `kiem-thu/sb-gia.mjs` thiếu 6 cửa của b110 → 17 ảnh chụp ra NỀN TRƠN suốt một bước** | **b110b** | ✓ **09/09/2026** — vá, và ghi vào `CHI-DAN` |
| **LỖ HỔNG vá xong: bốn cửa ghi được vào LỜI MỜI chưa ai nhận — `18-hai-chu-ky.sql`** | **b110c** | ✓ **10/09/2026** — đã dán |
| **Lớp hai: `la_thanh_vien()` thu hẹp đường tắt theo vai, sao lưu đêm còn nguyên** | **b110c** | ✓ **10/09/2026** — đã dán |
| **Màn hình phân biệt LỜI MỜI với ĐƠN XIN VÀO — `ds_thanh_vien()` trả `moi_luc`** | **b110c** | ✓ **10/09/2026** — đã dán |
| **Hỏng 3 sống lại khi dán lại `08` (`ds_cho_duyet` đoán cây bằng `limit 1`) — chốt lại ở `18`** | **b110c** | ✓ **10/09/2026** — đã dán |
| **Phép đo `do-b110c.mjs` — 48/48 ĐẠT, 7 lỗ hổng tái hiện, 3 kiểm chứng ngược · `kiem-trang-quan-tri.mjs` 214 → 237** | **b110c** | ✓ **10/09/2026** |
| **Hai phép tự kiểm của `18` tự sai (phép 10 so kiểu dữ liệu sai; phép 13 lệch điều kiện với câu dọn) — sửa cả hai** | **b110d** | ✓ **10/09/2026** |
| **Vết thật trên máy chủ: `khach@io.vn` sửa được 2 cây dù chưa nhận lời mời — dò ra, dọn sạch** | **b110d** | ✓ **10/09/2026** — xác nhận `0 rows` |

**Địa chỉ thật của app từ 03/09/2026: `https://nguyentrongbac.io.vn`.** Chứng
chỉ Let's Encrypt hạn 02/12/2026, `Enforce HTTPS` đã bật nên `http://` bị đẩy
sang `https://`. Địa chỉ cũ `trongdung1982.github.io/giapha-supabase/` và
`www.` đều `301` về đây, nên link cũ không ai bị lạc.

**Lỗi đầu tiên của lần chạy thật, và nó đáng ghi lại.** Thêm người mới báo
`null value in column "vn" … violates not-null`. Nguyên nhân không nằm ở chỗ
ai cũng đoán: lược đồ CÓ `default '{}'` cho cột ấy, nhưng `default` không áp
khi giá trị `null` được gửi tường minh, và `luu_cay()` đi qua
`jsonb_populate_recordset` — nơi khoá thiếu trong JSON cũng cho ra `null` chứ
không cho ra `default`. Tức **`default` trong SQL là hàng rào, không phải chỗ
điền hộ**; chỗ điền hộ phải là `services/hinh-dang.js`. Đã sửa, và bộ kiểm
nay đọc thẳng danh sách cột `not null` từ `01-bang.sql` để bắt lại (19/19).

---

**TRANG QUẢN TRỊ NAY LÀ KHUNG BỐN KHU — 07/09/2026.** Chủ dự án bấm thử trên
app thật (`nguyentrongbac.io.vn/QuanTri.html`): bấm qua lại bốn mục, `F5` về
đúng khu, nút Back đi ngược đúng thứ tự, điện thoại thành hàng thẻ ngang —
**đạt cả bốn**. Ba khu chưa viết nói thẳng chúng làm ở bước nào, không vẽ bảng
trống. Đây là nền cho b103 → b112, nên nó đứng trước mọi khu.

⚠ **Antigravity đã dựng sẵn b102 → b105 trong `codex/`, NGOÀI repo.** Chủ dự
án đã dán SQL cả bốn lên **Supabase Staging** và xác nhận đạt. Nhưng **máy chủ
thật chưa có gì**, và `supabase/` chưa nhận một dòng nào của bốn bước ấy. Việc
của Claude Code từ đây là **rà lại rồi tích hợp**, không phải viết mới — và rà
bằng phép **đo**, không bằng đọc lướt lời khai.

**VÀ CÂU TRÊN VỪA TỰ CHỨNG MINH — 07/09/2026 (b102).** Rà bản `11` của AGY
bằng phép đo, không bằng đọc: file chạy đúng, bốn hàng rào đứng vững, **nhưng
mang hai lỗ hổng mà bảng tự kiểm 12/12 và kịch bản kiểm của AGY đều báo xanh.**

Một: luật RLS của bảng `tai_khoan` viết `for all`, nên **ai cũng tự đặt mình
thành Quản trị hệ thống** bằng một lệnh `PATCH` vào dòng của chính mình — đo
được, người lạ đọc 59 người và email cả họ. Hai: `la_thanh_vien()` bị viết gọn
làm mất mệnh đề ba vai đi tắt của `07`, nên **sao lưu đêm sẽ ra file rỗng mà
không báo lỗi**. Cả hai đã vá, `11-quyen-he-thong.sql` **0.2.0**, đo lại
**29/29 ĐẠT** kèm ba phép kiểm chứng ngược.

Vì sao hai lớp kiểm cũ không thấy, và câu này đáng dán lên tường: **hỏi hàm
quyết quyền không phải là đo hàng rào.** Bảng tự kiểm chỉ hỏi *"thứ này có tồn
tại không"*; kịch bản kiểm chạy bằng `postgres`, mà superuser đi vòng qua mọi
RLS — nên nó hỏi HÀM (`co_the_xem_cay()` trả `false`, đúng) chứ không hỏi BẢNG
(`select … from persons` vẫn ra 59 dòng). Đúng bài học H9 ngày 04/09, lặp lại
y hệt sau ba ngày.

✓ **BẢN 0.2.0 ĐÃ DÁN CẢ HAI SUPABASE — 07/09/2026 tối.** Máy chủ thật nay có
tầng quyền cấp hệ thống; và Staging thôi mang hai lỗ hổng của bản 0.1.0.

**KHU GIA PHẢ VIẾT XONG — 08/09/2026 (b103).** Khu 1 của trang
Quản trị nay chạy thật trong mã: người đăng nhập thấy **cả những cây mình chưa
có chân** (cây nào chủ nó đã bật công tắc), bấm Xin quyền nộp được đơn, chủ cây
bật/tắt được công tắc, Quản trị hệ thống đặt được cây mặc định. Phép đo
`do-b103.mjs` **22/22 ĐẠT** kèm **3/3 kiểm chứng ngược**.

✓ **`11-quyen-he-thong.sql` ĐÃ DÁN — 08/09/2026, chủ dự án dán cả hai
Supabase.** Từng chặn b104; nay hết chặn.

**LẦN DÁN ĐẦU HỎNG — 08/09/2026 sáng, và chỗ hỏng đáng ghi lại.** Chủ dự án dán
0.3.0 lên máy chủ thật, Supabase ném:

```
ERROR: 42P13: cannot change return type of existing function
DETAIL: Row type defined by OUT parameters is different.
HINT:  Use DROP FUNCTION ds_gia_pha() first
```

`ds_gia_pha()` bản 0.3.0 có **11 cột** (thêm `toi_la_chu`), bản 0.2.0 đang chạy
có **10**. Postgres không cho `create or replace` đổi danh sách cột trả về —
phải `drop` trước. Đã vá: **0.3.1** thêm `drop function if exists
public.ds_gia_pha();` ngay trước câu `create`, không kèm `cascade` (không gì
phụ thuộc hàm này ngoài `sb.js` gọi RPC; có thứ phụ thuộc thì phải ném lỗi cho
người dán biết, không được lặng lẽ kéo theo). Bảng tự kiểm lên **19 mục**.

⚠ **Bài học, và nó lớn hơn một câu SQL thiếu: "dán lại được" KHÔNG bằng "nâng
cấp được".** Phép đo của b103 chạy file `11` hai lần liên tiếp và báo sạch —
nhưng bàn thử dựng từ cơ sở dữ liệu **trống**, nên cả hai lần đều là 0.3.0
chồng lên 0.3.0. Đường thật là 0.2.0 → 0.3.0, và **không phép đo nào đi qua
đường ấy**. Cùng họ với bài học b102 (*hỏi hàm không phải là đo hàng rào*):
lần này là *chạy lại không phải là nâng cấp*. Bàn thử muốn đo đường thứ hai
thì phải dựng nền bằng bản CŨ — `git show <commit>:luoc-do/11-…sql` — rồi mới
chồng bản mới lên. Mục **19** của bảng tự kiểm sinh ra để bắt đúng chỗ này: nó
hỏi *hình dạng* hàm, không hỏi hàm *có tồn tại* như mục 10 (mục 10 báo ĐẠT cả
khi máy chủ còn giữ hàm 10 cột).

✓ **Bản 0.3.1 ĐÃ chạy qua bàn thử, 08/09/2026 (b104)** — câu trên nói sai:
bàn thử SQL tại chỗ CÓ trên máy này (PostgreSQL 17.11, cổng 5433), chỉ chưa
ai kiểm lại trước khi viết. `do-b104.mjs` dựng đúng nền 0.2.0 bằng
`git show <commit>:...` rồi chồng 0.3.1 lên — trót lọt, kèm phép kiểm chứng
ngược (bản 0.3.0 lên cùng nền ném đúng `42P13`). Và đo thêm đường **nửa
vời**: lần dán sáng nay ném lỗi giữa chừng nên máy chủ thật có thể đang ở
trạng thái hàm mới đã vào mà `ds_gia_pha()` còn bản cũ — 0.3.1 chữa được cả
hai đường.

⚠ **Và một luật mới, rút từ chính bước này:** *khối trong Cài đặt chỉ được gỡ
khi khu bên trang Quản trị đã viết xong* — không phải khi kế hoạch nói tới nó.
Làm đúng chữ của b103 thì từ hôm nay tới b106 không còn đường nào duyệt đơn,
đúng lúc nút Xin quyền mới dựng làm cho đơn nhiều hơn.

---

## Việc kế tiếp — b100 → b113, MỘT PHIÊN MỘT BƯỚC

⚠ **Chuỗi này viết lại 05/09/2026** sau khi chủ dự án chốt ba câu về **nhiều
gia phả**. Chuỗi cũ (b100→b105, chỉ nói trang Quản trị) vẫn còn nguyên trong
`git log -p KE-HOACH.md`; nó không sai, nó chỉ **thiếu tầng dưới**.

Hai tài liệu thiết kế, đọc theo việc:

| Sắp làm | Đọc |
|---|---|
| Quyền cấp hệ thống · danh sách cây · tạo cây · mã xuyên cây | **`THIET-KE-NHIEU-CAY.md`** |
| Bốn khu của `QuanTri.html` | **`THIET-KE-QUAN-TRI.md`** |

Thứ tự vẫn theo **"đau nhất trước"**, nhưng nay có thêm một luật thứ hai:
**việc nào đụng `vai_tro()` thì đứng sau việc không đụng.** `vai_tro()` là nền
móng của toàn bộ hệ thống quyền — sai ở đó thì mọi thứ xây bên trên đều sai
theo, và không có gì báo lỗi.

### ~~b100~~ — Ba lỗi nhiều cây, và nạp cây thứ hai · ✓ **XONG 05/09/2026**

> **Đã làm:** `luoc-do/10-sua-nhieu-cay.sql` *(9 phép tự kiểm, đạt cả 9 trên
> bàn thử)* · `sb.js` 0.4.0 · `repo.js` 0.2.0 · `settings.js` 1.29.0 ·
> `khoi-dong.js` 0.10.0 · bộ sinh SQL di dời nay **tự dựng cây kèm người quản
> trị** · `tai-lieu/di-doi-NPG-20260905.sql` *(681 người, khớp 7/7 dòng trên
> bàn thử)* · hai bộ kiểm mới.
>
> ✓ **ĐÃ CHẠY TRÊN MÁY CHỦ THẬT VÀ KIỂM CHỨNG BẰNG TAY (05/09/2026 21:38).**
> Ba file đã dán trên Supabase thật, bảng đối chiếu khớp 7/7 dòng (681 người),
> 16/16 phép thử đạt. Điểm dừng kiểm chứng bằng tay: chủ dự án đã đổi qua đổi
> lại giữa hai cây (NTB và NPGQ8C9), người trung tâm mặc định của cả hai cây
> được giữ nguyên vẹn. Điểm dừng b100 hoàn thành trọn vẹn.


| | |
|---|---|
| **Làm** | Gỡ Hỏng 1 *(`chonGiaPha()` xoá sạch `user_settings`)* · Hỏng 2 *(`hienNgayGio` không lưu)* · Hỏng 3 *(8 chỗ `coalesce(… limit 1)`)* · rồi sinh SQL di dời cho `tai-lieu/giapha-nguyen-phuc-giao.json` |
| **Sản phẩm** | `sb.js` sửa · `luoc-do/10-sua-nhieu-cay.sql` · file SQL di dời cây **NPGQ8C9, 681 người · 189 hôn nhân** · bộ kiểm |
| **Điểm dừng** | Chủ dự án dán hai file, bảng đối chiếu khớp **cả 7/7 dòng** như lần di dời 04/09. Rồi **đổi qua đổi lại giữa hai cây ba lần**, và người trung tâm mặc định của **cả hai** cây còn nguyên |
| **⚠ Hệ quả tức thì** | `xin_vao_cay()` đang tự từ chối khi hệ thống có **từ hai cây trở lên** — nạp cây thứ hai là chạm đúng chỗ ấy. Phải bắt truyền `p_tree` tường minh trong cùng bước này |
| **Vì sao đứng đầu** | Chủ dự án xin nạp cây này; và ba lỗi kia **chỉ lộ ra khi có cây thứ hai**, nên sửa sau là sửa trong lúc đang có triệu chứng |

### ~~b101~~ — Khung điều hướng trang Quản trị · ✓ **XONG 07/09/2026**

> **Đã làm:** `js/pages/quan-tri/khung.js` *(mới)* · `quan-tri.css` *(mới)* ·
> `js/pages/quan-tri.js` → `js/pages/quan-tri/khu-kiem-duyet.js` *(đổi tên,
> chủ dự án chốt)* · `app-quan-tri.js` · `QuanTri.html` ·
> `kiem-thu/kiem-trang-quan-tri.mjs` **71 đạt, 0 hỏng** *(thêm PHẦN F 16 phép
> và ba phép kiểm chứng ngược)* · `kiem-thu/xem-khung-quan-tri.mjs` *(ngoài
> repo, chụp bốn ảnh để nhìn bằng mắt)*.
>
> ✓ **ĐÃ ĐẨY LÊN GITHUB VÀ CHỦ DỰ ÁN BẤM THỬ TRÊN APP THẬT (07/09/2026).**
> Commit `041b2a5`. Bốn mục bấm qua lại · `F5` về đúng khu · nút Back đi
> ngược đúng thứ tự · điện thoại thành hàng thẻ ngang: **đạt cả bốn**.
>
> ⚠ **Ba lỗi chỉ ảnh chụp bắt được**, bộ kiểm văn bản báo xanh cả 71 phép:
> hai lối *← Về sơ đồ* trùng nhau · tựa khu Kiểm duyệt thụt vào 18px ·
> giờ trong ghi chú đầu file ghi theo mạch chuyện chứ không theo đồng hồ.
> Hai lỗi đầu **nảy sinh từ chính việc nhúng** một màn hình vốn là cả trang
> vào một khu — b103 và b106 sẽ gặp lại y hệt. `nhat-ky/b101`.
>
> ⚠ **KHÔNG làm** nút *Tông màu* và 10 phối màu của bản thử AGY — không nằm
> trong điểm dừng b101, chủ dự án chốt để lại. Mã còn nguyên trong `codex/`.


| | |
|---|---|
| **Làm** | Thanh trái *(máy tính)* + hàng thẻ ngang *(điện thoại)* dùng lại `veThanhLoc()` · khu đang mở ghi vào `#` địa chỉ · hai con số đếm trên thanh · chuyển khu Kiểm duyệt hiện có vào nguyên vẹn |
| **Sản phẩm** | `js/pages/quan-tri/khung.js` + `khu-kiem-duyet.js` *(đổi tên từ `quan-tri.js` — **hỏi chủ dự án trước**)* |
| **Điểm dừng** | Mở trên máy tính và trên điện thoại, bấm qua lại 4 mục, `F5` về đúng khu. Ba khu chưa làm hiện đúng câu *"chưa làm"*, không hiện bảng trống |
| **SQL** | Không đụng |

Vẫn đứng sớm vì nó **không đẻ ra SQL nào** mà chứng minh được cả khung — sai
thì sai lúc chưa có gì xây lên trên.

### ~~b102~~ — ⚠⚠ Tầng quyền cấp hệ thống · ✓ **XONG 07/09/2026, ĐÃ DÁN**

**Bước nguy hiểm nhất của cả dự án cho tới nay.** Nó sửa `vai_tro()`.

> **Đã làm:** rà bản AGY rồi tích hợp — `luoc-do/11-quyen-he-thong.sql`
> **0.2.0** *(vào repo, vá hai lỗ hổng)* · `kiem-thu/ban-thu-sql/do-b102.mjs`
> *(ngoài repo, **29/29 ĐẠT**, có 3 phép kiểm chứng ngược)* · bàn thử
> `chay.mjs` nay tự chạy `11` ở bước cuối · `DU-LIEU.md` mục **2a** mới.
>
> ⚠⚠ **PHÉP ĐO BẮT ĐƯỢC HAI LỖ HỔNG mà bảng tự kiểm 12/12 và kịch bản kiểm
> của AGY đều báo xanh.** Đây là phần đáng giữ nhất của bước:
>
> 1. **Ai cũng tự đặt mình thành Quản trị hệ thống.** Luật `rieng_tai_khoan`
>    viết `for all`, tức gồm cả `update`. Một lệnh `PATCH` vào dòng của chính
>    mình là xong. Đo được: người lạ tự bật cờ rồi đọc **59 người** và **5
>    dòng `tree_members`** — email cả họ. Nguyên nhân không phải viết ẩu: đó
>    là khuôn `rieng_user_settings` **đúng ở chỗ nó đứng**, chép sang bảng giữ
>    cờ quyền thì đổi hẳn nghĩa. Đọc mã không thấy — hai luật giống hệt nhau.
> 2. **Sao lưu đêm sẽ ra file rỗng, không báo lỗi.** `la_thanh_vien()` bị viết
>    gọn thành `and approved = true`, làm mất mệnh đề ba vai đi tắt của `07`
>    (`quan_tri_he_thong` · `quan_tri` · `sao_luu`). Đo được: tài khoản
>    `sao_luu` với `approved = false` đọc **0 dòng**.
>
> **Vì sao cả hai lớp kiểm cũ không thấy:** bảng tự kiểm chỉ hỏi *"thứ này có
> tồn tại không"*, không hỏi *"nó có chặn được không"*; còn kịch bản kiểm chạy
> bằng `postgres` — **superuser đi vòng qua mọi RLS** — nên nó hỏi HÀM
> (`co_the_xem_cay()` trả `false`, đúng) chứ không hỏi BẢNG (`select … from
> persons` vẫn ra 59 dòng). Một câu để nhớ: **hỏi hàm quyết quyền không phải
> là đo hàng rào.** Đúng bài học của H9 ngày 04/09, lặp lại y hệt.
>
> ⚠ Và **bàn thử đang nói dối một chỗ**: `00-gia-supabase.sql` không cấp quyền
> bảng cho vai `authenticated`, còn Supabase thật thì có. Nên luật ghi hớ hênh
> trên bàn thử vẫn "an toàn" nhờ thiếu `grant` chặn hộ. `do-b102.mjs` bước 1
> dựng lại đúng thế cấp quyền ấy trước khi đo.
>
> ✓ **Câu "phải chốt trước" hoá ra đã chốt từ 05/09.** `THIET-KE-NHIEU-CAY.md`
> mục 11 mở đầu bằng "✓ ĐÃ CHỐT", và chốt luôn: **không đẻ thêm mã
> `quan_tri_toan_he_thong`**. Tên hàm đúng là `la_quan_tri_he_thong()` — dòng
> "Làm" dưới đây trước ghi sai, đã sửa.
>
> ✓ **ĐÃ DÁN CẢ HAI SUPABASE — 07/09/2026 tối, chủ dự án xác nhận.** Máy chủ
> thật lẫn Staging đều đang chạy bản 0.2.0. b103 bắt đầu được.
>
> ⚠ **Chưa ai bấm thử trên app.** Bảng tự kiểm nói lược đồ đúng, phép đo nói
> hàng rào đứng — cả hai đều là máy chủ tự nói về mình. Cái chưa có là một
> người đăng nhập bằng trình duyệt và mở được cây mình không có chân. Đó là
> loại kiểm chứng chỉ người bấm mới đóng được, đúng như b96 và b101 đã dạy;
> b103 sẽ đi qua nó vì khu Gia phả chính là màn hình dùng `ds_gia_pha()`.

| | |
|---|---|
| **Làm** | `luoc-do/11-quyen-he-thong.sql` — bảng `tai_khoan` *(+ trigger trên `auth.users`)* · bảng `cau_hinh` · `trees.chu_so_huu` · `trees.cho_nguoi_la_thay_ten` · hàm `la_quan_tri_he_thong` · `cay_mac_dinh` · `co_the_xem_cay` · `duoc_tao_cay` · `ma_tai_khoan_cua_toi` · `dat_cay_mac_dinh` · `ds_gia_pha` · **sửa `vai_tro()` và `la_thanh_vien()`** · 6 luật RLS đọc đổi sang `co_the_xem_cay` |
| **Sản phẩm** | File SQL + phép đo có **kiểm chứng ngược** và **mượn danh nghĩa tài khoản** kiểu H9 |
| **Điểm dừng** | Bốn hàng rào đo được: ① quản trị toàn hệ thống đọc **và ghi** được cây mình không có chân · ② người lạ **không** đọc được cây không phải cây mặc định · ③ người vào bằng cửa cây mặc định **đọc được `persons` nhưng KHÔNG đọc được `tree_members`** · ④ người vào bằng cửa ấy ghi bị từ chối — **đạt cả bốn, 16/16 phép** |
| **⚠ Bẫy 1** | Quên sửa `la_thanh_vien()` → quản trị toàn hệ thống **sửa được mà không đọc được**. Triệu chứng: *"Lưu báo thành công mà màn hình trống"* |
| **⚠ Bẫy 2** | `la_quan_tri_he_thong()` phải viết dạng **khẳng định** + `coalesce(…, false)`. Đúng bẫy `null` đã mở lỗ leo quyền 04/09 mà 57 phép kiểm báo xanh |
| **⚠ Bẫy 3** | Đổi nhầm luật RLS của `tree_members` sang `co_the_xem_cay` là **lộ email cả họ** cho mọi tài khoản |
| **⚠ Bẫy 4** *(mới, đo mới ra)* | Bảng `tai_khoan` giữ **cờ quyền**, nên nó **chỉ được có luật ĐỌC**. Đừng chép khuôn `rieng_user_settings` sang đây |
| **Không phải lỗ hổng** | `ds_gia_pha()` trả `email_chu` cho cả người lạ là **cố ý** — `THIET-KE-NHIEU-CAY.md` mục *Ba tầng nhìn thấy*: email là đường liên hệ để xin quyền. Đừng "vá" |

### ~~b103~~ — Khu Gia phả, và Cài đặt gọn lại · ✓ **XONG 08/09/2026**

> **Đã làm:** `luoc-do/11-quyen-he-thong.sql` **0.3.0** *(hàm
> `dat_cho_nguoi_la_thay_ten`, cột `toi_la_chu`, nhánh cho người đang chờ
> duyệt, tự kiểm 16 → 18)* · `js/pages/quan-tri/khu-gia-pha.js` *(mới)* ·
> `sb.js` 0.5.0 · `settings.js` 1.30.0 · `config.js` 0.21.0 · `khung.js` 0.2.0 ·
> `kiem-thu/ban-thu-sql/do-b103.mjs` *(ngoài repo, **22/22 ĐẠT**, 3/3 kiểm
> chứng ngược)*. Hai bộ kiểm cập nhật: 112/112 và 73/73.
>
> ✓ **ĐÃ DÁN — 08/09/2026, chủ dự án dán cả hai Supabase cùng lúc với `12`
> của b104.**
>
> ⚠ **Chưa ai bấm thử khu Gia phả trên app.** Cả hai tầng đã đo, nhưng đo là
> máy chủ và bộ kiểm tự nói về mình. Điểm dừng thật của b103 — một người
> không có chân ở cây nào bấm được Xin quyền — chỉ người bấm mới đóng được.
>
> **Bốn chỗ lệch khỏi bản Antigravity**, mỗi chỗ một lý do đo được:
>
> 1. **`toi_la_chu` thành CỘT của máy chủ.** Bản AGY so email ngay trong trình
>    duyệt. Không phải lỗ hổng — nhưng cây chưa gán `chu_so_huu` thì chủ cây
>    thật KHÔNG thấy công tắc của chính mình, và không gì giải thích.
> 2. **Khối *Đơn chờ duyệt* Ở LẠI Cài đặt**, dù dòng "Làm" dưới đây bảo gỡ.
>    Khu Thành viên nhận nó là b106, chưa viết — gỡ bây giờ là cắt đường duyệt
>    đơn đúng lúc b103 vừa dựng thêm nút Xin quyền, tức làm đơn nhiều hơn.
>    **Luật rút ra: khối chỉ được gỡ khi khu bên kia đã viết xong, không phải
>    khi kế hoạch nói tới nó.** Cài đặt vì thế xuống **8 khối**, về 6 ở b112.
> 3. **Thêm nút *Mở trang Quản trị*.** Gỡ khối Duyệt nội dung đã lấy đi lối vào
>    DUY NHẤT của trang ấy; phép kiểm PHẦN E bắt được tại chỗ.
> 4. **`vaiTroBangChu()` xuống `config.js`.** Bản AGY chép nó thành bản thứ
>    hai — đúng con đường đã trả giá 04/09 với mã vai `chu`.
>
> ⚠ **Một bài học về công cụ, đắt hơn vẻ ngoài:** `psql.exe` trên Windows đọc
> tham số `-c` theo cp1252, **không** theo `PGCLIENTENCODING`. Câu khôi phục
> hàm chứa tiếng Việt ném lỗi mã hoá, phép đo không đọc mã lỗi ấy, và các phép
> sau chạy trên bàn thử **còn nguyên vết bẻ gãy**: 14/20 với ba phép hỏng hoàn
> toàn bịa, một trong số đó nghe y như lỗ hổng an ninh. **Tiếng Việt vào psql
> phải đi bằng FILE (`-f`), không bằng dòng lệnh (`-c`).**
>
> ⚠ `js/pages/chon-gia-pha.js` nay **không còn lối vào nào** — nút mở nó nằm
> trong khối Gia phả vừa gỡ. Chưa xoá (xoá file phải hỏi chủ dự án). Nó là màn
> hình thời Drive, còn nói về `Config.gs` và `FILE_ID`; b104 thay nốt phần cuối
> của nó, lúc ấy hỏi chủ dự án cho xoá.

| | |
|---|---|
| **Làm** | `ds_gia_pha()` *(hàm `security definer`, lọc theo CỘT)* · `khu-gia-pha.js` — danh sách cây · chủ sở hữu · vai của tôi · nút **Chọn** / **Xin quyền** · công tắc *cho người lạ thấy tên* · ô chọn **cây mặc định** *(chỉ quản trị toàn hệ thống)*. Gỡ khối **Gia phả** và **Đơn chờ duyệt** khỏi `settings.js` |
| **Sản phẩm** | Khu 1 chạy thật · `settings.js` từ 10 khối xuống **6** |
| **Điểm dừng** | Đăng nhập bằng một tài khoản **không có chân trong cây nào**: thấy đúng danh sách cây đã bật công tắc, bấm Xin quyền nộp được đơn, và **không mở được nội dung cây nào**. Đặt cây mặc định rồi thử lại: mở được đúng một cây ấy |
| **⚠ Không làm** | Không mở RLS trên `trees`. Lọc cột bằng hàm, không bằng RLS |

### ~~b104~~ — Tạo gia phả mới · ✓ **XONG 08/09/2026**

> **Đã làm:** `luoc-do/12-tao-cay.sql` *(mới)* — ràng buộc `unique` trên
> `trees.tree_code`, hàm `tao_gia_pha_moi(p_ten, p_ma_cay, p_note)` đẻ
> `trees` + `tree_members` trong một giao dịch · `sb.js` 0.6.0 · `repo.js`
> 0.3.0 *(thôi trả `'chualam'`)* · `khu-gia-pha.js` 0.4.0 *(nút + Dựng gia
> phả mới)* · `kiem-thu/ban-thu-sql/do-b104.mjs` *(ngoài repo, **38/38 ĐẠT**,
> 3 kiểm chứng ngược)* · `kiem-thu/kiem-tao-cay.mjs` *(mới, **33/33**)*.
>
> ✓ **ĐÃ DÁN CẢ HAI SUPABASE — 08/09/2026, chủ dự án xác nhận.**
>
> ⚠ **Quy tắc mã cây đổi, chủ dự án chốt cùng bước này**: phần phân biệt từ
> 4 ký tự xen kẽ chữ–số (`NTBK7R3`) sang **3 chữ số** (`NPG473`). Vá luôn một
> lỗ hổng đo được: mã cây 4 số mà viết tắt kết thúc bằng P/U/M/S tự khớp
> khuôn mã bản ghi, làm bộ đếm mã nhảy vọt — `utils/id.js` 1.3.0. Hai mã đã
> cấp (`NTB`, `NPGQ8C9`) giữ nguyên.
>
> ⚠ **Vai cấp cho người dựng cây là `quan_tri_he_thong`, LỆCH khỏi
> `THIET-KE-NHIEU-CAY.md` mục 7** (viết `quan_tri`) — xem dòng Đính chính
> trong `nhat-ky/INDEX.md`. Lý do: `co_the_quan_tri()` chỉ nhận
> `quan_tri_he_thong`, cấp vai kia thì người dựng cây không duyệt được đơn
> của chính cây mình.
>
> ⚠ **Bàn thử SQL tại chỗ hoá ra CÓ trên máy này** — nhờ đó đo được đường
> nâng cấp thật của `11` (0.2.0 → 0.3.1, dựng nền bằng `git show`) và đường
> **nửa vời** do lần dán sáng 08/09 vấp giữa chừng. Xem dòng Đính chính.
>
> ⚠ **Chưa ai bấm thử trên app.** Đo bằng bàn thử SQL, chưa ai bấm nút *+ Dựng
> gia phả mới* trên `nguyentrongbac.io.vn`.

### ~~b105~~ — Thành viên & quyền, tầng máy chủ · ✓ **XONG 08/09/2026, ĐÃ DÁN**

> **Đã làm:** `luoc-do/13-quan-ly-thanh-vien.sql` *(mới, 885 dòng — **SÁU**
> hàm, không phải năm: thêm `doi_chu_cay`)* · `12-tao-cay.sql` **0.2.0** ·
> `08-kiem-duyet.sql` *(thêm cảnh báo, mã không đổi)* ·
> `di-doi/sinh-sql-di-doi.mjs` **0.2.0** ·
> `kiem-thu/kiem-quan-ly-thanh-vien.mjs` *(mới, **55/55**, 6 kiểm chứng ngược)* ·
> `kiem-thu/ban-thu-sql/do-b105.mjs` *(ngoài repo, **53/53**, 4 kiểm chứng ngược)*.
>
> ⚠⚠ **BƯỚC NÀY MỞ ĐẦU BẰNG VIỆC CHỦ DỰ ÁN BÁC BỎ b104**, và đó là phần đáng
> giữ nhất. b104 cấp người dựng cây vai `quan_tri_he_thong`; chủ dự án chốt
> lại: *"không ai được chỉ định quyền cho chính mình. mặc định người tạo cây
> thì có quyền quản trị với cây đó."*
>
> Triệu chứng b104 mô tả là thật, nhưng **chỗ chữa thì sai**: nguyên nhân
> không phải vai quá thấp, mà là `co_the_quan_tri()` **hỏi MÃ VAI trong khi
> thứ nó cần biết là AI LÀ CHỦ CÂY**. Một câu để nhớ: *khi phải nâng quyền cho
> một thứ để nó chạy được, hãy nghi ngờ cái hàng rào chứ đừng nghi ngờ cái
> quyền.*
>
> **Luật chốt** *(bảng đầy đủ ở `THIET-KE-NHIEU-CAY.md` mục 11.3)*: Quản trị
> hệ thống = cờ `tai_khoan` · **Chủ cây = cột `trees.chu_so_huu`** · Quản trị
> gia phả (`quan_tri`) **chỉ sửa + duyệt nội dung, KHÔNG đổi quyền**. Duyệt
> **đơn xin vào cây** thuộc nhóm "đổi quyền", không thuộc "duyệt nội dung" —
> nhận một người vào cây là cấp quyền ĐỌC.
>
> ⚠ **Luật "không tự đặt quyền cho mình" gác NĂM cửa, không một cửa.** Hai cửa
> ngầm không ai gọi là "quyền": tự **gắn mã người** cho mình vào một cụ tổ →
> `pham_vi_sua()` mở ra cả cây; tự bật **`tin_cay`** → ghi thẳng, bỏ qua kiểm
> duyệt. **Không ngoại lệ, kể cả Quản trị hệ thống.**
>
> ⚠ **Ràng buộc `tree_members.role` nay TỪ CHỐI mã `quan_tri_he_thong`** — nên
> chuyện một chữ hai nghĩa (chủ MỘT cây · quản trị TOÀN hệ thống) không tái
> hiện được. **Dán lại `08`, `09` hoặc `12` thì phải dán lại `13` ngay sau.**
>
> ⚠ **Bàn thử bắt được `chu_so_huu` RỖNG trước khi ai kịp dán.** `11` gán cột
> ấy theo email **cắm cứng** `trongdung1982@gmail.com`; máy chủ nào email khác
> thì cột đứng `null` **không một câu lỗi nào**, và neo hàng rào vào đó là
> *"không ai duyệt được đơn nữa"*. → `13` suy chủ cây từ chính `tree_members`
> và **DỪNG HẲN** nếu còn cây không chủ.
>
> ⚠ **Ba lỗi trong chính phép đo**, cả ba đều *"đỏ vì lý do sai"* — nguy hiểm
> hơn *"xanh oan"*, vì đỏ trông như đã bắt được cái gì đó nên người đọc đi sửa
> MÃ thay vì sửa PHÉP ĐO. Nối tiếp hai câu cũ: b102 *hỏi hàm không phải là đo
> hàng rào* · b104 *chạy lại không phải là nâng cấp* · **b105 mã thoát của
> công cụ không phải câu trả lời của máy chủ**, và **một phép kiểm chứng ngược
> bị hàng rào KHÁC che thì nó không chứng minh gì cả**.
>
> ⚠ **`13` CỐ Ý không nằm trong `chay.mjs`** — chạy nó ở đó là bàn thử luôn ở
> trạng thái đã di dời, và phép đo sẽ đo *chạy lại* thay vì đo *di dời*. Đúng
> bẫy b103. `do-b105.mjs` mục 0 còn **ĐÒI** nền trước khi di dời phải đúng
> trạng thái máy chủ thật, và thoát ngay nếu không.
>
> ⚠ **Chưa ai bấm thử trên app** — bước này không đẻ ra màn hình nào để bấm.
> Và **đổi quyền không để lại vết**: `change_log` chỉ ghi thay đổi nội dung gia
> phả. Cần một bảng nhật ký riêng, chưa ai xin.

| | |
|---|---|
| **Làm** | `luoc-do/13-quan-ly-thanh-vien.sql` — **6** hàm: `ds_thanh_vien` · `doi_vai_thanh_vien` · `gan_nguoi_cho_thanh_vien` · `dat_tin_cay_thanh_vien` · `go_thanh_vien` · **`doi_chu_cay`** *(bàn giao — chủ dự án bổ sung 08/09)*. Cộng 2 hàm hỏi nhỏ `la_chinh_minh` · `la_chu_cay` |
| **Điểm dừng** | ✓ Bộ kiểm xanh, chạy qua bàn thử SQL tại chỗ, **và chủ dự án đã dán, xác nhận đạt 08/09/2026** |

### b106 — Thành viên & quyền, màn hình

| | |
|---|---|
| **Làm** | `khu-thanh-vien.js` — bảng, ba tấm lọc *(Đang chờ · Đã duyệt · Tất cả)*, **năm** thao tác hai nhịp *(thêm **Bàn giao gia phả**)*. Cột **Mã tài khoản** để chỉ đúng người khi tên trùng · màn Cài đặt hiện *"Mã tài khoản của bạn"* |
| **Sản phẩm** | Khu 2 chạy thật, **và tài khoản thử `thu-h9@…` được dọn bằng chính màn hình ấy** |
| **Điểm dừng** | Sáu việc đo được: thấy tài khoản · thấy `P0012` · đổi được vai · gắn được mã khác · bật/tắt `tin_cay` · gỡ được. Rồi đăng nhập lại bằng một tài khoản `sua` và xác nhận `pham_vi_sua()` phản ánh đúng |
| **⚠ Nợ b105 phải trả ở đây** | Người mang vai `quan_tri` **được phong** vẫn THẤY khối *Đơn chờ duyệt* trong Cài đặt, bấm Duyệt thì máy chủ từ chối — **giấu nút đi**. *(Không phải lỗi mới: trước b105 họ cũng không duyệt được.)* Và dùng chữ **"tài khoản"**, đừng dùng "thành viên" — vai gắn cho tài khoản đăng nhập, không gắn cho người trong sơ đồ |
| **⚠ Bẫy** | Năm cửa đổi quyền đều từ chối khi người bị tác động **chính là người đang gọi**. Màn hình phải mờ sẵn nút trên dòng của chính mình, đừng để bấm rồi mới nhận câu từ chối |

Bước này **xoá sổ mục 3 của `HUONG-DAN-PHAN-QUYEN.md`** — chỗ hôm nay bảo chủ
dự án gõ `update` trong SQL Editor.

### ~~b107~~ — Mời vào gia phả, tầng máy chủ · ✓ **XONG 09/09/2026, CHỜ DÁN**

Chủ dự án đặt ba việc cùng lúc 08/09/2026, và cả ba đều quy về một luật —
`THIET-KE-NHIEU-CAY.md` mục **11.4** và **11.5**, đọc trước khi động vào:

> *"quyền vào gia phả hay không là quyền mỗi người nên quản trị hệ thống cũng
> chỉ có thể mời người vào gia phả rồi để người dùng quyết định có vào hay
> không."*

| | |
|---|---|
| **Làm** | `luoc-do/14-loi-moi.sql` — 3 cột (`moi_boi` · `moi_luc` · `moi_vai`) + **8 hàm**: `moi_vao_cay` · `loi_moi_cua_toi` · `nhan_loi_moi` · `tu_choi_loi_moi` · `dat_quan_tri_he_thong` · `ds_tai_khoan_he_thong` · `ds_cay_cua_tai_khoan` · **`xoa_tai_khoan`**. Và dán đè `ds_gia_pha()` để thêm 3 cột lời mời |
| **Điểm dừng** | ✓ `kiem-thu/ban-thu-sql/do-b107.mjs` **59/59 ĐẠT**, gồm 3 phép bẻ gãy có chủ ý. ⏳ Còn chờ chủ dự án dán vào máy chủ thật |
| **Xoá tài khoản — 6 cửa gác** | Chỉ Quản trị hệ thống · không phải chính mình · gõ lại đúng email · không giao cây cho chính người sắp bị xoá · không xoá tài khoản `sao_luu` · không xoá Quản trị hệ thống cuối cùng. ⚠ **Đính chính**: `change_log` KHÔNG có khoá ngoại tới `auth.users`, nên nhật ký ai sửa gì **vẫn còn** sau khi xoá — câu ngược lại nói hôm 08/09 là sai |
| **⚠ Chủ dự án bác bỏ bản đầu, cùng ngày** | Bản đầu **từ chối** xoá tài khoản đang làm chủ cây, đòi họ bàn giao trước. Nguyên văn: *"tài khoản bị xóa thường có vi phạm nhất định, yêu cầu họ bàn giao là không khả thi. vì vậy xoá thì chỉ định người làm chủ cây, mặc định tài khoản quản trị hệ thống thực hiện thao tác xoá sẽ là chủ cây."* Bài học: **một hàng rào mà lối đi qua nó nằm trong tay chính người đang bị đuổi thì không phải hàng rào** — nó chỉ đổi "cây mất chủ" thành "không xoá được tài khoản hỏng" |
| **Nay xoá thế nào** | Cây sang tên **trong cùng giao dịch với lệnh xoá**, mặc định cho người bấm nút, hoặc một tài khoản khác nếu chỉ định. Chủ mới nhận cả dòng `tree_members` — bài học `doi_chu_cay()`: thiếu nó là *sửa được mà không đọc được*. Cây không bao giờ tồn tại ở trạng thái không chủ |
| **⚠ Bàn thử nói dối ở đây** | Supabase thật còn `auth.identities` · `sessions` · `refresh_tokens` trỏ về `auth.users`; bàn thử chỉ dựng mỗi `auth.users`. Phép HR15 chứng minh **luật gác đúng**, KHÔNG chứng minh lệnh xoá chạy trót lọt trên máy chủ thật. Lần dán thật là lần đầu biết điều đó |
| **⚠ Cái bẫy đã đo được** | `la_thanh_vien()` cho vào cây khi `approved` **hoặc** vai ∈ (`quan_tri_he_thong`,`quan_tri`,`sao_luu`). Ghi vai được mời thẳng vào `role` là **mở cây ra ngay lúc mời**. Nên có cột `moi_vai` riêng; `role` giữ `xem` tới lúc nhận. Phép KC2 tái hiện đúng cái bẫy ấy để chứng minh HR5 đo thật |
| **⚠ Bẫy của phép ĐO, không phải của mã** | Câu `select id from trees where tree_code='NTB'` lồng trong khối mượn danh nghĩa **cũng đi qua RLS** — người ngoài không thấy cây nên hàm nhận `p_tree = null`. 5 phép HỎNG bịa ở lần chạy đầu. Mã cây phải hỏi một lần bằng `postgres` rồi cắm hằng số |
| **✓ Đã sửa, b108** | `trang_thai_cua_toi()` của `07` không biết trạng thái *"được mời"* — người được mời mà mở app thường sẽ nhận câu "đơn đang chờ", sai hẳn chuyện đang xảy ra. Vá ở `14-loi-moi.sql` mục 6b (0.2.0), đo 61/61 trên bàn thử, dán thật 09/09 |

### ✓ b108 — Mời vào gia phả (khu Gia phả), MÀN HÌNH — XONG 09/09/2026

| | |
|---|---|
| **Làm** | Khu Gia phả: cột **Mời** *(chủ cây và Quản trị hệ thống thấy)*, gọi `moi_vao_cay()` với email + mã người + vai. Dòng cây mình **được mời** hiện *Nhận · Từ chối* thay cho *Xin quyền*, cả ở khu Gia phả lẫn màn hình khởi động của app thường (`khoi-dong.js`) |
| **Điểm dừng — ĐẠT, chạy thật** | Mời một tài khoản thật → tài khoản ấy đăng nhập, **thấy lời mời**, và **chưa đọc được cây**; bấm Nhận thì đọc được, vai đúng bằng vai được mời. Chủ dự án xác nhận cả hai chiều (Nhận/Từ chối) chạy đúng trên máy chủ thật |
| **File đụng tới** | `luoc-do/14-loi-moi.sql` 0.2.0 (mục 6b) · `sb.js` 0.8.0 · `khoi-dong.js` 0.11.0 · `khu-gia-pha.js` 0.5.1 |
| **⚠ Nhớ từ b106** | Bảng việc đứng NGOÀI bảng, không nhét vào ô `colSpan` — cái bảng `min-width:860px` cắt mất việc thứ ba trở đi, và 121 phép kiểm văn bản không bắt được. Khu mới đông cột hơn nên bẫy này còn sắc hơn |
| **Chủ dự án bấm thử, đo ra hai việc còn thiếu** | ① Form Mời thiếu ô **mã người trong sơ đồ** dù `moi_vao_cay()` đã nhận tham số ấy từ đầu — vá ngay trong phiên (0.5.1). ② Ô email và ô mã người cần **tìm/gợi ý thật** (gõ vài chữ, hiện danh sách khớp), không phải ô gõ tay mù — dời sang b109, việc lớn hơn, cần hàm tìm kiếm mới ở máy chủ |

### ✓ b109 — Khu Tài khoản: tấm lọc *Toàn hệ thống* + bảng sâu — XONG, chạy thật 09/09/2026

⚠ **Chia đôi ngay đầu phiên, chủ dự án chốt.** Nửa sau (ô tìm/gợi ý cho form
Mời) thành **b109b** — nó cần một hàm SQL mới và một câu thiết kế phải bàn
trước, trộn vào đây là một phiên không có điểm dừng.

| | |
|---|---|
| **Làm** | `sb.js` 0.9.0: bốn cầu nối còn thiếu của `14` — `dsTaiKhoanHeThong` · `dsCayCuaTaiKhoan` · `datQuanTriHeThong` · `xoaTaiKhoan`. **File mới** `khu-tai-khoan-he-thong.js` 0.1.0: sổ đăng ký bảy cột + bảng sâu theo từng cây + bốn việc. `khu-thanh-vien.js` 0.3.0: tấm lọc thứ tư, và sáu hàm việc đổi tham số `phien` → `treeId` |
| **KHÔNG dán SQL** | Bốn hàm ấy đã nằm sẵn trên cả hai máy chủ từ b107–b108, chỉ chưa có màn hình nào gọi. Cả bước này là mã trình duyệt |
| **Điểm dừng — ĐẠT, chạy thật** | Chủ dự án bấm một tài khoản trong tấm lọc *Toàn hệ thống* trên máy chủ thật → đúng số cây, làm được cả bốn việc |
| **Năm việc của `13` được DÙNG LẠI, không chép** | Chúng vốn chỉ đọc `phien.treeId`, nên đổi tham số thành `treeId` là đủ để gọi lại theo TỪNG CÂY. Bộ kiểm có một phép canh đúng chỗ này (PHẦN I) và một phép bẻ gãy nó (G13) — chép sang bản thứ hai thì hôm nay hai bản giống hệt nhau, và lệch dần từ lần sửa thứ hai |
| **Vì sao file mới, không viết thêm vào `khu-thanh-vien.js`** | Hai chế độ trả lời hai câu khác nhau — *"ai có quyền trong CÂY NÀY"* và *"sổ đăng ký của cả phần mềm"*. Chủ dự án chọn tách file. Nối bằng `import()` **động** một chiều: file mới `import` ngược lại để dùng năm việc, tĩnh cả hai chiều là một vòng import, mà vòng import trong ES Modules gốc **không ném lỗi lúc nạp** — nó để một hàm thành `undefined` và chỉ vỡ lúc ai đó bấm đúng nút ấy |
| **⚠ Ba chỗ hỏng chỉ NHÌN mới thấy** | ① bảng `min-width:980px` làm **cột nút Mở rơi khỏi mép ngay trên màn hình 1280** — khu chỉ rộng ~925px vì thanh trái ăn 230px; hạ xuống 880. ② ô mã người 180px cắt mất chữ cuối lời gợi ý. ③ dòng *"được mời"* có một nút mờ ghi đúng câu cột bên cạnh vừa nói. **154 phép văn bản xanh suốt trong lúc cả ba chỗ ấy còn nguyên** — đúng bài học b106, và lần này bộ ảnh chụp bắt được trước khi chủ dự án phải bấm |
| **Hai chỗ khoá còn thiếu, cũng do nhìn ra** | Dòng của chính mình: nút *Sửa quyền* trong bảng cây, và cả việc *Mời* — `moi_vao_cay()` từ chối tự mời (đường leo thang hai cú bấm), nên khoá sẵn thay vì để bấm rồi nhận câu từ chối |
| **Vá thêm hai thứ bắt gặp trên đường** | `kiem-thu/sb-gia.mjs` (ngoài repo) **thiếu ba cửa Mời của b108** → trang giả để nhìn bằng mắt đã TRẮNG từ hôm qua mà không ai biết; nay 0.3.0. Và `14-loi-moi.sql` 0.2.1 thêm `drop function if exists` trước hai hàm trả bảng — bài học 42P13, **không đổi hành vi, không bắt buộc dán lại hôm nay** |
| **File đụng tới** | `sb.js` 0.9.0 · `khu-thanh-vien.js` 0.3.0 · `khu-tai-khoan-he-thong.js` 0.1.0 *(mới)* · `luoc-do/14-loi-moi.sql` 0.2.1 · `kiem-thu/kiem-trang-quan-tri.mjs` 0.4.0 *(154 phép)* · `../kiem-thu/sb-gia.mjs` 0.3.0 · `../kiem-thu/xem-khung-quan-tri.mjs` *(12 ảnh, kq-7→kq-11 là của bước này)* |

### ✓ b109b — Ô tìm/gợi ý thật cho form Mời — XONG, SQL đã dán cả hai máy chủ

| | |
|---|---|
| **Làm** | Ô **email** và ô **mã người** ở form Mời — cả ở `khu-gia-pha.js` lẫn ở bảng sâu mới — phải gõ vài chữ là hiện danh sách khớp |
| **⚠ Phải bàn TRƯỚC khi viết** | Mã người cần **hàm tìm kiếm MỚI** ở máy chủ, và nó đụng đúng ranh giới *"`QuanTri.html` cố ý KHÔNG nạp cây gia phả"* (`THIET-KE-QUAN-TRI.md` mục 1). Phải là **tìm có lọc, giới hạn số dòng, `security definer` gác đúng quyền xem cây** — không phải nạp danh sách người về rồi lọc trong trình duyệt. Bộ kiểm PHẦN I có một phép canh đúng chỗ này |
| **✓ Câu đã trả lời — 09/09/2026** | **Viết hàm tìm riêng**, không hạ quyền `ds_tai_khoan_he_thong()`. Ba phép đo loại hai đường kia: hàm ấy trả 12 cột gồm cờ quyền và không có tham số lọc; còn `ds_tai_khoan()` của `13` chỉ thấy người ĐÃ có chân trong cây — mà người sắp được mời thì theo định nghĩa chưa có. Hàm mới gác bằng đúng `co_the_quan_tri()` của `moi_vao_cay()`: ai mời được thì hôm nay đã có sẵn máy dò email qua ba câu từ chối khác nhau của hàm ấy, nên nó **không thêm quyền, chỉ đổi tốc độ** — và tốc độ bị chặn bằng tối thiểu 2 ký tự, trần 8 dòng, không trả cờ quyền nào |
| **Chủ dự án chốt thêm: PHƯƠNG ÁN B** | Thêm cột `tai_khoan.ho_ten`, vì **một tài khoản trong app này chưa có tên** — tên chỉ tồn tại khi đã gắn vào người trong một cây, mà người hay được mời nhất là người vừa cấp tài khoản, chưa gắn vào đâu. Không có cột ấy thì ô gợi ý email chỉ hiện được tám dòng email na ná nhau. Kèm yêu cầu: **hiện cả mã người như phần mềm gia phả để chắc chắn đúng người** |
| **Làm gì** | `luoc-do/15-tim-kiem.sql` 0.1.0 *(cột `ho_ten` · `dat_ho_ten_tai_khoan` · `bo_dau` · `ten_day_du` · `tim_tai_khoan` · `tim_nguoi_trong_cay`, cộng dán đè ba hàm đọc)* · `sb.js` 0.10.0 *(ba cầu nối)* · **file mới** `js/pages/quan-tri/o-goi-y.js` 0.1.0 · `khu-gia-pha.js` 0.6.0 · `khu-thanh-vien.js` 0.4.0 · `khu-tai-khoan-he-thong.js` 0.2.0 |
| **⚠⚠ LỖI ĐANG CHẠY, ĐO ĐƯỢC TRÊN ĐƯỜNG** | `ds_thanh_vien()` (`13`) và `ds_cay_cua_tai_khoan()` (`14`) lấy tên người bằng `p.vn->>'name'` — đo trên 740 bản ghi thật: **null ở cả 740 dòng**. Tên thật nằm ở mảng `names`. Nên cột *"Người được gắn (mã + tên)"* của khu Thành viên **chưa bao giờ hiện được một cái tên nào**; nó rơi xuống mã, rồi màn hình thấy tên trùng mã nên giấu luôn. Không ai báo vì màn hình trông vẫn "đúng", chỉ thiếu. `15` mục 3b thêm `ten_day_du()` và dán đè cả hai hàm |
| **⚠ Chỗ hỏng thứ hai, chỉ NHÌN mới thấy** | Huy hiệu *Quản trị hệ thống* là `span` **inline** có `padding`: khi ô hẹp lại đủ để nó xuống dòng, nền của nó tràn lên **đè chữ email ở dòng trên**. Có sẵn từ b109, chỉ lộ ra khi b109b thêm dòng họ tên vào cùng ô. Sửa: `display:inline-block`. ⚠ Ảnh 1280px **không đủ phân giải** để phân biệt "đè" với "sát nhau" — phải đo bằng `getBoundingClientRect()`, và đó là lý do có `kiem-thu/do-goi-y.mjs` |
| **Đã đo** | Bàn thử SQL: bảng tự kiểm **13/13 ĐẠT** · `do-b109b.mjs` **40/40 ĐẠT** (22 hàng rào + 3 phép kiểm chứng ngược), chạy hai lần cùng kết quả. Trình duyệt: `/kiem-tra` **9/9** · `kiem-trang-quan-tri.mjs` **154/154** · `do-goi-y.mjs` ba câu sạch (0 cặp đè nhau · 0 thứ rơi khỏi mép · danh sách gợi ý mở đúng chỗ, nằm trọn trong cửa sổ) · 13 ảnh nhìn bằng mắt |
| **✓ Đã dán 09/09/2026** | Chủ dự án dán `15` bản **0.1.0** lên cả hai Supabase, tự kiểm ĐẠT. Đã điền đủ họ tên. Bấm thử: bật/tắt cờ Quản trị hệ thống chạy; ô tìm người để mời **hiện đúng tên và email** |
| **Chủ dự án đặt thêm hai việc, làm luôn trong phiên (0.2.0)** | ① Cột **Quyền** trong tấm lọc *Toàn hệ thống* — hiện vai **cao nhất**, bấm được để xem chi tiết theo từng cây *(vì quyền gắn với từng cây, một dòng tóm tắt mà không mở được đường xuống chi tiết là bắt người ta tin một nửa sự thật)*. ② **Bỏ cột nút riêng**, gộp chỗ bấm vào chính ô Tài khoản, kèm chú thích nhỏ dưới tiêu đề cột |
| **✓ Đã dán bản 0.2.0 — 09/09/2026** | Chủ dự án dán lại `15` (thêm cột `vai_cao_nhat` cho `ds_tai_khoan_he_thong()`) trên cả hai Supabase, **tự kiểm 13 dòng ĐẠT** |
| **Điểm dừng** | ✓ Gõ 2–3 chữ vào ô email/mã người → thấy gợi ý đúng, không phải gõ hết |

### ✓ b109c — Ô Vai trò mở bảng *cây · vai trò*; bảng dài tự cuộn — MÃ XONG

Vòng thứ ba trong cùng ngày, và cũng bắt đầu bằng chủ dự án **bấm thử bản
trước trên máy chủ thật**. Không đụng SQL.

| | |
|---|---|
| **Chủ dự án đặt bốn việc** | ① Bấm ô Vai trò thì hiện **bảng một bên tên cây, một bên vai trò**, bấm tiếp vào vai trò là **sửa được**. ② Cột *Quyền* đổi tên thành **Vai trò** cho khớp cột cùng nghĩa ở tấm *Tất cả* — và ô Vai trò ở tấm ấy cũng phải mở được bảng tương tự. ③ **Danh sách dài thì bảng thông tin ở dưới bị đẩy xuống thật sâu, phải kéo rất nhiều.** ④ Câu dẫn của tấm *Toàn hệ thống* rút gọn |
| **⚠ Vì sao ô Vai trò không mở bảng sâu nữa** | b109b cho nó mở **đúng cái bảng sâu mà ô Tài khoản mở** — hai chỗ bấm cạnh nhau làm một việc. Nay tách: ô Vai trò là **đường ngắn nhất tới việc sửa quyền**, ô Tài khoản là đường tới mọi thứ về tài khoản ấy. Hai câu hỏi, hai chỗ bấm |
| **⚠ Vì sao bảng hai cột nằm ở `khu-thanh-vien.js`** | Về nghĩa nó thuộc file sổ đăng ký, nhưng file ấy `import` **tĩnh** `khu-thanh-vien.js`; chiều ngược chỉ đi được bằng `import()` động. Bắt một cú bấm chờ tải cả mô-đun sổ đăng ký để vẽ một bảng hai cột là đắt vô cớ — với người **không** phải Quản trị hệ thống thì còn là tải đúng cái họ không có cửa dùng |
| **⚠ Hàng rào giữ nguyên, KHÔNG hạ** | `ds_cay_cua_tai_khoan()` gác bằng `la_quan_tri_he_thong()`. Chủ cây A gọi nó nhận **mảng rỗng** — và đúng thế, vì *"người này còn chân ở cây nào khác"* là dữ liệu của cây khác. Với họ, bảng dựng **một dòng từ dữ liệu đã có trong tay**, không gọi máy chủ, kèm câu nói ra vì sao chỉ một dòng. ⚠ Cạm bẫy đã tránh: gọi hàm rồi vẽ *"chưa dính cây nào"* — đó là **bịa một câu trả lời từ một lời từ chối** |
| **⚠ Vì sao cắt chiều cao bảng** | Bảng việc đứng **ngoài** bảng (b106, có lý do đo được), nên nó nằm sau dòng cuối. Ba chục dòng là bấm dòng thứ hai rồi cuộn qua hai mươi tám dòng. Nhét lại thành `<tr>` ẩn = làm lại lỗi b106; kéo bảng việc lên trên = hỏng ngược khi bấm dòng cuối. Chọn: **cắt `62vh`, cho bảng tự cuộn, tiêu đề cột dính**. Chỉ cắt từ **dòng thứ chín** — bốn dòng mà nhốt trong khung cuộn là đẻ thanh cuộn thừa, và trên điện thoại `62vh` chỉ đủ bốn năm dòng |
| **⚠ Câu dẫn đã sai HAI LẦN liên tiếp** | Vì nó mô tả *người ta bấm vào đâu*, mà chỗ bấm đổi mỗi vòng: b109 để lại chữ "Bấm Mở" sau khi nút Mở bị bỏ; b109b liệt kê bốn việc tự hiện ra ngay khi mở. Nay rút còn phần **không đoán được từ màn hình**; chỗ bấm để chú thích nhỏ dưới tiêu đề cột nói — nó đứng ngay trên chính chỗ bấm nên không lạc hậu lặng lẽ được |
| **⚠ Ảnh chụp lừa được một lần** | `kq-15` cho thấy bảng mất tiêu đề cột → tôi đọc ra *"sticky hỏng vì `border-collapse:collapse`"*, một chuyện có thật và **sai ở đây**. Đo: `position` = sticky, lệch 0px, ô cuộn đứng yên. Thứ trôi là **cả trang**, do `scrollIntoView()` kéo bảng việc vào tầm nhìn. **Một tấm ảnh, hai nguyên nhân khác hẳn nhau** — ảnh nói "trông sai", không nói "sai ở đâu" |
| **Đã đo** | `/kiem-tra` **9/9** *(`domains/` 0 file khác)* · `kiem-trang-quan-tri.mjs` **154/154** · **`do-cuon-bang.mjs` (mới)** năm câu sạch: bảng tự cuộn · tiêu đề dính lệch 0px · bảng việc cách đáy khung **14px** · ô cuộn không tự trôi · `do-goi-y.mjs` ba câu sạch · **17 ảnh nhìn bằng mắt** |
| **File đụng tới** | `khu-thanh-vien.js` 0.5.0 · `khu-tai-khoan-he-thong.js` 0.4.0 · *(ngoài repo)* `kiem-thu/do-cuon-bang.mjs` + `.html` **mới** · `sb-gia.mjs` 0.6.0 *(`?nhieu=30`)* · `xem-khung-quan-tri.mjs` *(17 ảnh, kq-12→kq-16 là của bước này)* |
| **✓ Điểm dừng** | Chủ dự án bấm ô Vai trò trên máy chủ thật — và trong lúc bấm, đổi ý một câu, dẫn thẳng sang b109d |

### ✓ b109d — Câu dẫn tấm *Toàn hệ thống* nói CHÍNH MÌNH đang đăng nhập bằng ai — MÃ XONG

Vòng thứ tư trong cùng ngày. Không đụng SQL — trường mới đọc qua RLS đã có
sẵn từ `11-quyen-he-thong.sql`.

| | |
|---|---|
| **Chủ dự án bấm thử b109c, đổi ý một câu** | Câu dẫn của tấm *Toàn hệ thống* (vừa viết lại ở b109c) đổi hẳn nội dung: không còn mô tả khu này liệt kê gì, mà nói **tên, email, mã tài khoản của CHÍNH người đang đăng nhập** |
| **⚠ Vì sao đáng đổi** | Cờ Quản trị hệ thống có thể cấp cho **nhiều** tài khoản, và đây là màn hình DUY NHẤT sửa được cờ ấy cho người khác — nhầm tài khoản đang đăng nhập ở đúng màn hình này là hậu quả nặng nhất trong cả app |
| **Làm gì** | `sb.js` 0.12.0 *(`layPhien()` thêm `hoTen`, đọc thẳng bảng `tai_khoan` qua RLS `for select … using (user_id = auth.uid())` của `11` mục 1 — KHÔNG hàm `security definer` mới)* · `khu-thanh-vien.js` 0.6.0 *(`danHeThong(phien)` thay hằng số `DAN_HE_THONG`)* |
| **Đã đo** | `kiem-trang-quan-tri.mjs` **154/154** · `/kiem-tra` **9/9** · ảnh `kq-7.png` nhìn bằng mắt: *"Bạn đang đăng nhập bằng Nguyễn Trọng Dũng · trongdung1982@gmail.com · mã TK7Q2."* |
| **File đụng tới** | `sb.js` 0.12.0 · `khu-thanh-vien.js` 0.6.0 · *(ngoài repo)* `sb-gia.mjs` 0.7.0 |
| **✓ Điểm dừng** | Chủ dự án bấm thử ngay, và chỉ ra bất nhất trong vài phút — dẫn thẳng sang b109e |

### ✓ b109e — Dòng danh tính hiện Ở CẢ BỐN tấm lọc — MÃ XONG

Vòng thứ năm trong ngày. Không đụng SQL — `hoTen` đã đọc được từ b109d.

| | |
|---|---|
| **Chủ dự án chỉ ra** | *"bạn mới sửa ở tab toàn hệ thống, tab đang chờ, đã duyệt, tất cả chưa sửa"* — dòng danh tính chỉ hiện ở tấm *Toàn hệ thống* |
| **⚠ Vì sao đây là hoàn tất, không phải việc mới** | Lý do b109d viện dẫn — nhầm tài khoản đang đăng nhập khi đổi quyền — **áp dụng y hệt** ở ba tấm cây: cả ba đều mở được cùng bảng việc năm nút (đổi vai, gắn người, tin cậy, gỡ, bàn giao). Viết đúng lý do rồi chỉ áp dụng cho một phần tư màn hình là để lý do ấy đứng sai chỗ |
| **Làm gì** | Tách thành hai `<p>` độc lập: dòng danh tính (cố định, mọi tấm lọc) + `DAN_CAY` (chỉ ba tấm cây, **ẩn hẳn** bằng `display:none` ở *Toàn hệ thống* — không chỉ để trống, vì `<p>` rỗng vẫn ăn `margin-bottom` để lại khoảng trắng vô cớ) |
| **Đã đo** | `kiem-trang-quan-tri.mjs` **154/154** · bốn phép `/kiem-tra` chạy tay · ảnh `kq-4.png` (tab Tất cả, hai dòng cùng hiện) và `kq-7.png` (tab Toàn hệ thống, không khoảng trắng thừa) nhìn bằng mắt |
| **File đụng tới** | `khu-thanh-vien.js` 0.7.0 |
| **⏳ Điểm dừng** | Chủ dự án bấm thử cả bốn tấm lọc trên máy chủ thật |

### ✓ b110 — Xoá gia phả: hai chữ ký + thùng rác 30 ngày · **MÃ XONG 09/09/2026**

> ✓ **Câu treo đã có trả lời.** Chủ dự án chốt đầu phiên: *"dọn thùng rác chỉ
> có quản trị hệ thống, bấm tay, có chọn hàng loạt"* — loại hẳn đường nối vào
> trigger Apps Script chạy đêm, và quyết hình dạng tham số
> `don_thung_rac(p_ds uuid[])`.
>
> **Đã làm:** `luoc-do/16-thung-rac-cay.sql` **0.2.0** *(⚠ số **16**, không
> phải 15 — b109b đã lấy số ấy)* · `sb.js` 0.13.0 · `khu-gia-pha.js` 0.7.0 ·
> `khoi-dong.js` 0.12.0 · `kiem-thu/ban-thu-sql/do-b110.mjs` *(ngoài repo,
> **62/62 ĐẠT**, 5 phép kiểm chứng ngược)* · `kiem-trang-quan-tri.mjs`
> 154 → **190 phép** (PHẦN F2 mới).
>
> ⚠⚠ **THIẾT KẾ CHỈ ĐÚNG NGUY HIỂM NHƯNG CHỈ SAI ĐƯỜNG VÁ — phần đáng giữ
> nhất của bước.** Mục 11.6 viết *"sửa `co_the_xem_cay()` là an toàn, đừng
> động `la_thanh_vien()`, vì sao lưu PHẢI chép được cây trong thùng rác"*.
> Làm đúng từng chữ thì **hỏng**: sáu bảng nội dung `SaoLuu.gs` chép đều gác
> bằng chính `co_the_xem_cay()` (`11` mục 16 đã đổi từ b102). Đo được: tài
> khoản `sao_luu` đọc cây trong thùng rác ra **0 dòng `persons`** — file sao
> lưu đêm vẫn sinh, vẫn đủ chín bảng, thiếu đúng cái cây mong manh nhất, và
> **không có gì báo lỗi**. Ba mươi ngày ấy là ba mươi ngày không có bản sao.
>
> Vá bằng lối riêng cho vai `sao_luu` (`la_may_sao_luu()`): *thùng rác đóng
> cửa với người, không đóng cửa với máy sao lưu*. Phép **KC2** bẻ đúng lối ấy
> đi và đòi thấy con số 0.
>
> **Một câu để nhớ, nối tiếp hai câu cũ** (*hỏi hàm quyết quyền không phải là
> đo hàng rào* — b102; *chạy lại không phải là nâng cấp* — b103):
> **đọc lời cảnh báo không thay được việc đo.**
>
> **Hai hàm bị sửa, và chỉ hai:** `co_the_xem_cay()` khoá ĐỌC *(có lối cho
> `sao_luu`)*, `co_the_sua()` khoá GHI *(không lối cho ai)*. `co_the_sua()`
> gác cả ba cửa ghi — `luu_cay()` hàng rào đầu, và hai luật RLS kho ảnh.
> KHÔNG đụng `la_thanh_vien()`, KHÔNG đụng `vai_tro()`.
>
> **Ba chỗ lệch khỏi thiết kế:**
> 1. **`duyet_xoa_cay()` không cấm người vừa xin tự duyệt.** Nếp "không tự
>    đặt quyền cho mình" canh việc tự NÂNG quyền; đây ngược chiều. Cấm đi thì
>    hôm nay **không xoá được cây nào** — chủ dự án là QTHT duy nhất và đứng
>    tên cả hai cây. Đúng bài học `xoa_tai_khoan()` b107.
> 2. ~~**`ds_gia_pha()` thêm `or la_thanh_vien(t.id)`**~~ — **chủ dự án bác
>    bỏ ngay trong phiên**, và chỗ tôi sai đáng ghi hơn chỗ tôi đúng. Nguyên
>    văn: *"không hiện cây trong thùng rác. nếu người nào đang có chân trong
>    cây này thì nhận thông báo cây đã bị xoá bởi… vậy không lo màn hình
>    trắng"*. Tôi lo màn hình trắng — vấn đề của người dùng — rồi chữa bằng
>    cách **nới một hàng rào**; câu trả lời đúng nằm ở tầng khác: một **lời
>    nhắn**. Bản **0.2.0** gỡ nhánh ấy, thêm cột `da_xoa_boi` *(0.1.0 cố ý
>    không có — nhưng lời nhắn phải kể đích danh, mà thành viên không đọc
>    được `change_log`)*, và thêm hàm **`tin_thung_rac()`** ⚠ *`security
>    definer` nên tự gác: phải có chân trong cây hoặc mang cờ QTHT — thiếu là
>    người lạ dò được tên mọi gia phả đã xoá kèm email. HR10f canh.*
> 3. **Trạng thái `daxoa` ở màn hình khởi động** — chỗ suýt bỏ sót.
>    `layPhien()` đặt `docDuoc: true` **cứng** cho ai có dòng `tree_members`;
>    từ b110 "có chân" không còn đủ để kết luận "đọc được". Không vá thì người
>    có đủ quyền, kể cả QTHT, mở app ra thấy **sơ đồ trống không một chữ**.
>    Màn hình kể tên cây, ngày xoá, người xin và người duyệt.
>
> ⚠ **Ảnh trong kho KHÔNG cascade.** `media` đi theo, file ảnh trong Storage
> thì không. `don_thung_rac()` đọc `media` TRƯỚC khi xoá và trả `dsAnh`; màn
> hình gọi `xoaAnhThat()` ngay sau.
>
> ⚠ **`change_log` ĐI THEO**, khác hẳn `xoa_tai_khoan()` của b107 (ở đó nhật
> ký nói về NGƯỜI và ở lại). Không lấy lại được — bản sao lưu đêm là bản duy
> nhất còn giữ.
>
> ✓ **ĐÃ DÁN CẢ HAI SUPABASE — 09/09/2026, chủ dự án xác nhận bảng tự kiểm
> 11 mục đạt cả.**
>
> ⏳ **Điểm dừng VẪN CHƯA ĐÓNG, và phân biệt này không phải câu nệ chữ:**
> bảng tự kiểm hỏi *"thứ này có đúng hình dạng không"* — nó là máy chủ tự nói
> về mình, đúng thứ b102 đã trả giá để học (bảng tự kiểm 12/12 báo xanh trong
> lúc ai cũng tự đặt mình thành Quản trị hệ thống). Cái chưa có là một người
> đi hết vòng **xin → chờ → duyệt → phục hồi** bằng trình duyệt, và nhìn thấy
> lời nhắn *"đã bị xoá bởi…"* bằng mắt. Loại kiểm chứng ấy chỉ người bấm mới
> đóng được — b96 · b101 · b103 đều đã dạy.
> ⚠ **Dựng một cây mới để thử, đừng đem cây thật ra.**
>
> ⚠⚠ **CHUỖI DÁN LẠI DÀI THÊM MỘT NẤC:**
> `11`/`10` → `14` → **`16`** · và `13`/`14` → `15`.
> Dán lại `11` hoặc `14` mà quên `16` thì **cây trong thùng rác mở lại cho cả
> họ đọc**, không báo lỗi.

Chủ dự án chốt 09/09/2026, đọc `THIET-KE-NHIEU-CAY.md` mục **11.6** trước.
*"chủ cây có quyền yêu cầu xoá cây do mình tạo ra"* — chữ **yêu cầu** là nghĩa
đen: chủ cây xin, Quản trị hệ thống duyệt.

| | |
|---|---|
| **Làm** | `luoc-do/16-thung-rac-cay.sql` — ⚠ **số 16, không phải 15**: b109b đã lấy số 15 (`15-tim-kiem.sql`, dán 09/09/2026). — 5 cột trên `trees` + 8 hàm: `xin_xoa_cay` · `huy_xin_xoa_cay` · `duyet_xoa_cay` · `phuc_hoi_cay` · `don_thung_rac` · `trong_thung_rac` · `la_may_sao_luu` · `tin_thung_rac`. Cộng màn hình: cột *Xoá* ở khu Gia phả, khối **Thùng rác** (chỉ QTHT), và màn hình khởi động báo cây đã bị xoá bởi ai |
| **Điểm dừng** | Xin xoá một cây thử → cây **vẫn dùng được bình thường** trong lúc chờ → duyệt → không ai đọc được nữa → phục hồi → đọc lại được đủ 59 người |
| **⚠ Đơn xin xoá KHÔNG khoá cây** | Đơn còn có thể bị từ chối, và trong lúc chờ thì cả dòng họ vẫn đang dùng. Khoá sớm là biến một lá đơn thành một lệnh |
| **⚠⚠ Chỗ khó nằm ở tầng nền móng** | ~~Thêm điều kiện *"chưa vào thùng rác"* vào `co_the_xem_cay()` — **an toàn**~~ — **CÂU NÀY SAI, đo mới ra.** Sáu bảng nội dung `SaoLuu.gs` chép đều gác bằng chính `co_the_xem_cay()`, nên làm đúng chữ ấy là sao lưu đêm ra file **thiếu đúng cây trong thùng rác**, không báo lỗi. Phải chừa lối riêng cho vai `sao_luu` (`la_may_sao_luu()`). Phần **KHÔNG động `la_thanh_vien()`** thì vẫn đúng và vẫn phải giữ |
| **Vì sao không xoá cứng ngay** | `CLAUDE.md` mục 7 — *"Không xoá cứng"*. Và **chưa ai từng thử KHÔI PHỤC từ bản sao lưu đêm** (treo từ 04/09), nên hôm nay sao lưu chưa phải đường lùi đã kiểm chứng |
| ~~**Phải hỏi chủ dự án**~~ ✓ **ĐÃ TRẢ LỜI 09/09/2026** | *"dọn thùng rác chỉ có quản trị hệ thống, bấm tay, có chọn hàng loạt"* — loại hẳn đường trigger Apps Script chạy đêm, và quyết hình dạng tham số `don_thung_rac(p_ds uuid[])` |
| ✓ **Chốt thêm cùng ngày** | *"không hiện cây trong thùng rác. nếu người nào đang có chân trong cây này thì nhận thông báo cây đã bị xoá bởi… vậy không lo màn hình trắng"* — bản 0.1.0 làm ngược lại và bị bác bỏ. Xem khối ✓ đầu mục |

### ✓ b110b — Quyền dựng cây tách riêng · không đâu ngầm định cây · **MÃ XONG 09/09/2026**

> **Chủ dự án đặt hàng, nguyên văn:** *"vì một người chủ cây gia phả có thể tạo
> nhiều cây gia phả vì vậy khi gán quyền, không nên ngầm định gán quyền cho cây
> đang hoạt động mà cần luôn luôn xác định người nào, cây nào, quyền gì… quyền
> tạo cây cần tách riêng khỏi quyền quản trị gia phả… muốn gán quyền cho ai thì
> tích vào là xong, đây là đặc quyền của tài khoản quản trị hệ thống."*
>
> **Đã làm:** `luoc-do/17-quyen-tao-cay.sql` 0.1.0 · `sb.js` 0.14.0 ·
> `khu-thanh-vien.js` 0.8.0 · `khu-tai-khoan-he-thong.js` 0.5.0 ·
> `khu-gia-pha.js` 0.7.1 · `kiem-thu/ban-thu-sql/do-b110b.mjs` *(ngoài repo,
> **29/29 ĐẠT**, 3 kiểm chứng ngược)* · `kiem-trang-quan-tri.mjs` 190 → **214**.
>
> ⚠ **CỘT `duoc_tao_cay` CÓ TỪ b102 MÀ KHÔNG HÀM NÀO ĐẶT ĐƯỢC.** Bảy bước
> liền, đường duy nhất cấp quyền dựng cây là mở SQL Editor gõ `update` tay —
> và không ai để ý, vì `ds_tai_khoan_he_thong()` vẫn trả cột ấy về đều đặn, chỉ
> là không màn hình nào đọc. Một cột đọc được mà không ghi được là kiểu thiếu
> không có triệu chứng.
>
> ⚠ **Chỗ sửa THẬT của luật "luôn nói rõ cây nào" là chữ ký hàm, không phải câu
> chữ.** `veBangViec(t, treeId, …)` → `veBangViec(t, cay, …)`. Chừng nào tham
> số còn là uuid trần thì nơi gọi còn phải tự bịa một cái nhãn, và bản 0.7.0 đã
> bịa đúng như thế: chuỗi `'Gia phả đang mở'`. Đổi hình dạng tham số thì lời
> gọi thiếu tên cây **không viết ra được nữa** — và `kiem-trang-quan-tri.mjs`
> PHẦN J gác lại đúng câu ấy (G15 bẻ ra để chứng minh phép ấy có đo thật).
>
> ⚠⚠ **BẮT ĐƯỢC MỘT LỖI CÂM CỦA b110, KHÔNG THUỘC BƯỚC NÀY.**
> `kiem-thu/sb-gia.mjs` thiếu sáu cửa thùng rác mà `khu-gia-pha.js` `import`.
> ES Modules không tha một `import` thiếu: cả mô-đun ném `SyntaxError`,
> `mountKhung()` không chạy, và **cả 17 tấm ảnh của `xem-khung-quan-tri.mjs`
> ra nền trơn không một chữ** — im lặng, suốt một bước. Bộ bất biến văn bản
> không mở trình duyệt nên nó xanh suốt; phép "nhìn bằng mắt" thì có nhìn
> nhưng không ai nhìn. Đã vá, và ghi thành một dòng cảnh báo ở `CHI-DAN.md`.
>
> ⚠ Cũng vì thế `kq-5.png` đổi mục tiêu sang nút *Sửa quyền* thứ **hai**: dòng
> đầu bảng là dòng của chính người đang đăng nhập, nút ở đó khoá sẵn từ b106,
> nên tấm ảnh ấy chụp một cái bảng trơn và thôi đo được thứ nó sinh ra để đo.
>
> ⏳ **Điểm dừng:** chủ dự án dán `luoc-do/17-quyen-tao-cay.sql` vào **cả hai**
> Supabase, đọc bảng tự kiểm 8 mục, rồi bấm thử ô tích *Tạo gia phả* trên một
> tài khoản khác.

### ⚠ b110c — Lỗ hổng HAI CHỮ KÝ · **MÃ XONG 10/09/2026, CHƯA DÁN**

> **Chủ dự án bấm thử trên máy chủ thật và bắt được, nguyên văn:** *"mời tài
> khoản khach@io.vn vào làm thành viên, sau đó vào kiểm duyệt thêm được người
> này luôn và có thể đổi quyền cho tài khoản này mà không đợi khach@io.vn đồng
> ý."*
>
> **Đúng, và nặng hơn vẻ ngoài.** Tái hiện được **bốn cửa** trên bàn thử:
> `duyet_thanh_vien` · `doi_vai_thanh_vien` · `gan_nguoi_cho_thanh_vien` ·
> `dat_tin_cay_thanh_vien`. Cửa nặng nhất là **đổi vai** — nó đặt `role` vào
> dòng lời mời, và `la_thanh_vien()` mở cây ra **ngay lúc ấy**, không đợi cả
> nút Duyệt. Đo: khách chưa bấm gì đọc đủ **59 người**.
>
> **Đã làm:** `luoc-do/18-hai-chu-ky.sql` 0.1.0 · `sb.js` 0.15.0 ·
> `khu-thanh-vien.js` 0.9.0 · `kiem-thu/ban-thu-sql/do-b110c.mjs` *(ngoài
> repo, **48/48 ĐẠT**, 7 lỗ hổng tái hiện làm chứng, 3 kiểm chứng ngược)* ·
> `kiem-trang-quan-tri.mjs` 214 → **237** (PHẦN K + G17–G19).
>
> ⚠⚠ **VÌ SAO THIẾT KẾ NHÌN THẤY CÁI BẪY MÀ VẪN SẬP.** Mục 11.4 mô tả cái bẫy
> chính xác và dựng hẳn cột `moi_vai` để tránh — nhưng nó chỉ canh
> `moi_vao_cay()`. Bốn hàm của `13` đã tồn tại từ trước và ghi vào đúng những
> cột ấy; không ai đi hỏi lại *"còn hàm nào khác ghi vào `role` và `approved`
> không?"*. **Hàng rào phải gác CỘT, không gác HÀM** — câu này đứng cạnh
> *chạy lại không phải là nâng cấp* và *hỏi hàm quyết quyền không phải là đo
> hàng rào*.
>
> ⚠ Vá bằng **hai lớp**, và `KC1` chứng minh chúng độc lập: bẻ lớp một ra thì
> lớp hai vẫn giữ cây đóng. Lớp hai là `la_thanh_vien()` — hàm mà cả `CHI-DAN`
> lẫn mục 11.6 đều ghi *"đừng sửa"*. Nó **thu hẹp**, không bỏ, và `K6` đo đúng
> đường sao lưu: tài khoản `sao_luu` vẫn đọc đủ 59 người sau khi vá.
>
> ⚠ **Máy chủ chặn là đủ AN TOÀN, chưa đủ ĐÚNG LUẬT NHÀ.** Ba tấm lọc cây vẫn
> vẽ chữ *"Đang chờ"* và nút *Xét đơn* lên dòng lời mời, vì `ds_thanh_vien()`
> không trả `moi_luc`. `khu-thanh-vien.js` đã **ghi sẵn lời thú nhận ấy** trong
> một khối chú thích từ b109c — và chính chỗ ấy là đường chủ dự án đi vào. Bài
> học: một khối chú thích nói *"chỗ này chưa phân biệt được"* là một việc phải
> làm, không phải một lời giải thích đã xong.
>
> ⚠ **Bắt thêm một chỗ hỏng thứ hai, không thuộc lỗ hổng này.** `08` định
> nghĩa `ds_cho_duyet()` bản CŨ — `coalesce(p_tree, … limit 1)`, đúng **Hỏng 3**
> mà `10` đã chữa 05/09. Dán lại `08` là mở lại, im lặng, và với hai cây thì nó
> *duyệt nhầm hàng chờ của cây khác*. `18` nay là bản đứng cuối cho hàm ấy.
>
> ✓ **Câu hỏi thứ hai của chủ dự án đã đo xong** (`do-b110c.mjs` Q1–Q13):
> **không có vi phạm**. Đúng ba thứ đứng ngoài `tree_members`, cả ba đã chốt
> từ trước: cờ **Quản trị hệ thống** · cờ **được dựng cây** *(không kèm một
> mẩu quyền nào trên cây đang có)* · và **cây mặc định** *(đọc được đúng một
> cây, không sửa, không thấy danh sách thành viên)*.
>
> ⏳ **Điểm dừng:** chủ dự án dán `18` vào **cả hai** Supabase, đọc bảng tự
> kiểm 13 mục, rồi bấm thử lại đúng đường đã bắt được lỗi — mời một tài khoản,
> thử Duyệt và thử Đổi vai, cả hai phải bị từ chối.
>
> ⚠ Và đọc mục 9 cuối file `18`: bản vá **không tự dọn** những dòng đã lọt qua
> lỗ hổng. Nếu đã lỡ bấm trên `khach@io.vn` thì chạy tay hai câu ở đó.

### b111 — Kiểm duyệt: bảng phẳng TRƯỚC/SAU

| | |
|---|---|
| **Làm** | `chi_tiet_kiem_duyet(p_tree, p_id)` · `domains/so-sanh.js` **(file MỚI, không sửa 10 file cũ)** · mở rộng một dòng thành **bảng phẳng kiểu Excel**: `Người · Trường · Trước · Sau · Loại` |
| **Sản phẩm** | File SQL + bộ kiểm + màn hình mở rộng dòng |
| **Điểm dừng** | Chọn một lần Lưu thật, thấy đúng từng ô *trước → sau*, trường không đổi thì **không vẽ dòng**. Rồi dựng cảnh xung đột: Lưu A, Lưu B đụng cùng bản ghi → cột SAU nói rõ đó là trạng thái hôm nay, nút hoàn tác mờ kèm lý do |
| **Đã trả lời sẵn** | Không cần thêm cột `sau`. `truoc` có hình `{persons:[{id,cu}],…}`, còn *sau* chính là dòng hiện tại |
| **⚠ Giữ nguyên** | Xem theo **ô**, duyệt theo **lần Lưu**. Không cho nhận từng ô |

### b112 — Khu Sao lưu + Số đếm đối chiếu

| | |
|---|---|
| **Làm** | `dem_du_lieu(p_tree)` · `khu-sao-luu.js` — trạng thái lần sao lưu gần nhất + bảng đối chiếu 5 con số |
| **Sản phẩm** | Khu 4 ở trạng thái **chỉ đọc**, và nói thẳng *"sao lưu không chép nội dung ảnh"* |
| **Điểm dừng** | Số trên màn hình khớp với số đếm được trong file sao lưu đêm gần nhất |
| **⚠ Không làm** | **Không vẽ nút Khôi phục.** Máy chủ chưa khôi phục được, vẽ nút là giả vờ giải quyết bằng giao diện |

### b113 — Mã người xuyên cây

| | |
|---|---|
| **Làm** | `persons.noi_ve` · thêm tên cột vào bảng `TEN_PERSON` của `hinh-dang.js` · ô nhập trong màn hồ sơ · dòng *"Người này cũng có trong gia phả …"* + nút nhảy sang **chỉ khi người xem truy cập được cây kia** |
| **Sản phẩm** | File SQL nhỏ + bộ kiểm + màn hình |
| **Điểm dừng** | Lưu một vòng rồi đọc lại, `noi_ve` **còn nguyên** — đúng phép kiểm mà cột `branch_id` từng cần |
| **⚠ Bẫy** | Cột không có tên trong `TEN_PERSON` thì mỗi lần lưu ghi `null` đè lên, **và không có gì báo lỗi** — `DU-LIEU.md` mục 3 điều 7 |
| **Đứng cuối vì** | Chưa ai dựng cây thứ ba. Cột này chỉ có việc khi có người dựng cây cho bên nhà họ |

### Sau b113 — chưa đặt số, chưa chốt

Nhập GEDCOM/Excel qua máy chủ · **khôi phục thật** *(việc nguy hiểm nhất, và
phải kiểm chứng bằng vòng `sao lưu → đổi dữ liệu → khôi phục → dữ liệu quay
đúng trạng thái cũ`, không phải bằng việc có file JSON)* · nối **quan hệ** bắc
qua hai cây *(cột `noi_ve` chỉ nói "cùng một con người", không nói "cùng một
gia đình")*.

---

## Việc của giai đoạn TRƯỚC — đã đóng, giữ làm chứng

*(Việc "mời `ntdungsnotion` vào repo" đã xong 03/09/2026 — đẩy được, Pages
chạy. Cách gỡ ghi ở `CLAUDE.md` mục 4 phòng khi gặp lại `403`.)*

### 1. Sao lưu (H8) — ✓ XONG 04/09/2026

Chủ dự án dựng xong và **bản sao lưu đầu tiên đã có thật**:
`tai-lieu/tailieu-Supabase/giapha-sao-luu-2026-09-04-0833.json`.

File ấy tự nó chứng minh ba điều cùng lúc, nên không cần kiểm lại:
`luoc-do/05-sao-luu.sql` đã chạy (có dòng `role = 'sao_luu'`), tài khoản
`sao-luu@nguyentrongbac.io.vn` đọc được mọi bảng, và hàm `ds_tai_khoan()`
trả về danh sách tài khoản — thứ chỉ file SQL ấy mở đường.

⚠ Còn nguyên hai chỗ hở, ghi ở bảng *Còn treo*: **chưa ai thử KHÔI PHỤC** từ
file sao lưu, và **sao lưu không chép ảnh**, chỉ liệt kê.

⚠ Đừng "sửa lại cho gọn" bản 0.2.0 bằng cách đưa khoá bí mật trở lại. Lý do
đầy đủ ở `nhat-ky/b91` và đầu `luoc-do/05-sao-luu.sql`: Supabase chặn khoá
`sb_secret_…` khi `User-Agent` giống trình duyệt, mà Apps Script luôn gửi đúng
thứ ấy và Google không cho đổi. Ba phép trong `kiem-thu/kiem-sao-luu.mjs` canh
điều này.

### 2. Di dời dữ liệu (H5) — ✓ XONG 04/09/2026 11:28

Chủ dự án đã dán `tai-lieu/di-doi-NTB-20260904.sql`. Bảng đối chiếu cuối file
khớp cả 7 dòng, nên **không cần kiểm lại bằng cách khác** — chính bảng ấy là
phép kiểm, và cả khối nằm trong một giao dịch: lệch một con số là tự huỷ sạch.

| bảng | mong đợi | đếm được |
|---|---|---|
| `persons` | 59 | 59 |
| `unions` | 25 | 25 |
| `union_children` | 36 | 36 |
| `change_log` | 13 | 13 |
| `media` · `sources` · `imports` | 0 | 0 |

✓ **ĐÃ MỞ APP XEM — 04/09/2026, cây 59 người vẽ ra đúng.** Chủ dự án tự xác
nhận. Đây là mảnh cuối của H5: bảng đối chiếu chứng minh dữ liệu vào đủ, còn
việc này chứng minh app đọc ra và vẽ được.

Phần dưới đây giữ lại vì nó ghi *vì sao* làm theo đường này — đọc `git log -p`
thì không thấy lý do, chỉ thấy kết quả.

#### Vì sao KHÔNG đi đường GEDCOM, và không viết script đăng nhập

Chủ dự án hỏi đúng câu 04/09/2026: *"chỉ cần nhập file GEDCOM xuất từ app trên
GAS thôi chứ?"*. Hai câu trả lời, cả hai đều đáng giữ lại:

**GEDCOM là khuôn HẸP HƠN dữ liệu của app.** Nó sinh ra để đi sang *phần mềm
khác*; ở đây hai đầu là cùng một app, cùng một khuôn JSON. Đi vòng qua nó là
tự nguyện làm mất sáu thứ: `changeLog` (tức **mã đã dùng** — `utils/id.js` sẽ
cấp lại mã cũ cho người mới, không có gì báo lỗi) · bản ghi cờ `deleted` (luật
2 đường xuất) · `meta` · sổ nhập `imports` · ảnh (luật 3 đường nhập, cố ý
không nhập) · `rootPersonId`. Cộng một bẫy im lặng: mặc định xuất **ẩn chi
tiết người còn sống**. Và trên nền này đường ấy còn chưa chạy được —
nhập-để-tạo-cây-mới gọi `repo.taoGiaPhaMoi()`, hàm còn trả `lyDo: 'chualam'`.

**Bản nháp đầu là một script Node tự đăng nhập rồi gọi `luu_cay()`. Bỏ.** Nó
cần mật khẩu một tài khoản có quyền sửa, đổi lấy một việc chỉ làm một lần. Và
đi qua `luu_cay()` thì `ts`/`by` của nhật ký **bị máy chủ ghi đè** thành người
chạy script; ghi thẳng vào bảng giữ được nguyên văn ngày và người sửa của bản
Apps Script — **trung thực hơn**, không phải tiện hơn.

⚠ Ghi thẳng vào bảng là **cố ý phá lệ "cửa ghi duy nhất"**, chỉ được phép vì
đây là việc một lần, do chính chủ dự án dán tay, ngoài app. Không có đường nào
từ trình duyệt tới đó. Ngày nào thấy app gọi tới `di-doi/` là ranh giới đã vỡ.

#### Ba điều bộ kiểm chứng minh được, và một điều nó không

`kiem-thu/kiem-di-doi.mjs` — **46 phép**, và nó **bóc ngược dữ liệu ra khỏi
chính file SQL sinh ra** rồi ráp lại bằng `rapCay()` để so với cây nguồn. Tức
nó đo đúng những byte sẽ đi tới máy chủ, không đo giá trị trả về của một hàm ở
giữa đường. Chứng minh được: không sót trường nào (`soSanh` hai chiều đều
rỗng) · uid điền đủ và tính lại được · nhật ký giữ nguyên `ts` và `by` · mọi
câu `delete`/`update` đều giới hạn bằng `v_tree`.

⚠ **Nó KHÔNG chạy SQL** — máy không có Postgres, Supabase thật thì không đem
ra thử. Lần chủ dự án bấm Run là lần chạy đầu tiên. Điều đó không rủi ro vì cả
khối nằm trong một giao dịch có phần đếm lại ở cuối: sai một con số là huỷ
sạch, cơ sở dữ liệu giữ nguyên như trước.

⚠ **File `.sql` chứa TOÀN BỘ gia phả nên nằm ngoài repo** (`tai-lieu/`). Repo
`giapha-supabase` để Public, và lịch sử git giữ lại cả bản đã xoá sau này.

### 3. Phép thử H9 — phân quyền THẬT — ✓ XONG 04/09/2026, 5/5 hàng rào đạt

**Đo bằng cách gọi thẳng REST của Supabase từ máy, không qua trình duyệt** —
đó là cách duy nhất chứng minh được hàng rào 4. Số đo đầy đủ ở
`nhat-ky/b94-phep-thu-h9.md`.

| Hàng rào | Kết quả |
|---|---|
| 1 · người ngoài cây không đọc được gì | ✓ 0 dòng trên cả 8 bảng |
| 2 · vai `sua` chưa duyệt: đọc đủ, ghi bị từ chối | ✓ đọc 59/25/36/13, ghi 0 dòng |
| 3 · đã duyệt: sửa được trực hệ, không sửa được ngoài | ✓ 8 `true` / 4 `false`, khớp mô hình |
| 4 · ghi thẳng REST bị chặn | ✓ `403` khi thêm dòng, 0 dòng đổi khi sửa |
| 5 · `revision` chặn ghi đè | ✓ `lyDo: xungdot` |

⚠ **Phép thử bắt được một lỗ hổng leo quyền thật** trong `duyet_thanh_vien()`:
với người ngoài cây `vai_tro()` trả `null`, mà `null not in (…)` ra `null` chứ
không ra `true`, nên cửa kiểm quyền không đóng. Đã vá (`06` bản 0.1.2) và đánh
lại đúng đòn ấy để chứng minh vá kín. **Bộ kiểm 57 phép đã báo xanh trên chính
cái mã thủng ấy** — nay 59 phép, hai phép mới hỏi `null` thay vì hỏi đúng chữ.

⚠ **Còn phải dọn:** tài khoản thử `thu-h9@nguyentrongbac.io.vn` vẫn đang gắn
`P0012` và đã duyệt.

<details><summary>Câu chữ cũ của mục này (giữ làm chứng)</summary>

### 3-cũ. Phép thử H9 — phân quyền THẬT

⚠ **Câu chữ cũ của mục này đã sai từ 04/09/2026** và giữ lại đây làm chứng:
nó nói *"mỗi tài khoản một nhánh"*, mà luật chốt lại không có nhánh nào cả.
Phép thử đúng là **hai tài khoản gắn với hai người ở hai đầu cây**, xác nhận
**bằng mắt** rằng người này không sửa được người ngoài trực hệ của mình.

Năm hàng rào cần xác nhận, và ba cái đầu chưa ai thử lần nào:

1. Người **ngoài cây** → không đọc được một dòng nào
2. Vai `sua` **chưa gắn mã / chưa duyệt** → đọc đủ, `luu_cay()` từ chối
3. Đã gắn và duyệt → sửa được trực hệ, **không** sửa được người ngoài trực hệ
4. **Ghi thẳng vào REST bị chặn** — kể cả với vai `quan_tri_he_thong`. ⚠ Thử bằng trình
   duyệt KHÔNG chứng minh được điều này, vì app luôn đi qua `luu_cay()`.
   Muốn biết cửa sau có khoá không thì phải thật sự đẩy thử cửa sau.
5. `revision` chặn ghi đè khi hai người sửa cùng lúc

Bắt buộc đứng **trước** khi viết bất cứ tài liệu nào mô tả phân quyền như đã
chạy.

⚠ `PHAN-QUYEN_V03` ghi ba vòng kiểm chứng của bản Drive. **Chúng không áp dụng
được cho RLS** — cơ chế khác hẳn, chưa kiểm chứng lần nào trong dự án này. Bắt
đầu lại từ số 0.

</details>

### 4. Kiểm duyệt nội dung — ✓ TẦNG MÁY CHỦ XONG VÀ ĐÃ CHẠY THẬT (b97)

**Xong 04/09/2026.** `luoc-do/08-kiem-duyet.sql` (0.1.2) và `luu_cay()` lên
0.3.1. Bộ kiểm `kiem-thu/kiem-kiem-duyet.mjs` **111 phép, đạt 111**, trong đó
bốn phép kiểm chứng ngược — bẻ gãy mã có chủ ý rồi xác nhận bài kiểm bắt được.
Còn lại: `duyet.html` (b98).

✓ **HOÀN TÁC đã chạy thật 05/09/2026** — `kiem-thu/thu-hoan-tac.sql` dán vào
SQL Editor, 17/17 đạt. Trước đó bộ kiểm chỉ soi văn bản, không chạy SQL.

#### Sáu file đã dán, đúng thứ tự này — giữ lại phòng khi phải dựng lại

Việc đổi mã vai (mục ngay dưới) làm danh sách dài ra, nên gần hết lược đồ phải
chạy lại. Chủ dự án dán xong 04/09/2026 lúc 23:00:

    1. luoc-do/09-doi-ma-vai.sql   ← đổi dữ liệu + ràng buộc
    2. luoc-do/05-sao-luu.sql      ← 2 luật RLS + ds_tai_khoan()
    3. luoc-do/06-quyen-truc-he.sql
    4. luoc-do/07-duyet-dang-ky.sql
    5. luoc-do/08-kiem-duyet.sql
    6. luoc-do/03-ham-luu-cay.sql  ← bản 0.3.1

⚠ **05 phải đứng trước 06.** `05` đặt lại ràng buộc vai **thiếu `quan_tri`**
(nó có trước khi vai ấy ra đời), `06` mới thêm vào. Đảo hai file là tự tay bỏ
vai quản trị viên khỏi danh sách hợp lệ.

Dán lại `07` và `08` an toàn: cả hai có chốt chống chạy-lần-hai, nên không đơn
nào đang xếp hàng bị duyệt bừa.

**Cách biết đã dán đủ, và nó không dựa vào trí nhớ của ai:** hai dòng cuối bảng
tự kiểm của `09` hỏi thẳng máy chủ *"còn bao nhiêu HÀM / LUẬT RLS nhắc mã cũ"*.
Đo 23:00 ngày 04/09: cả hai bằng **0**. Bỏ sót một file thì con số ấy khác 0,
chứ không phải chờ tới ngày ai đó bấm Lưu mới lộ.

⚠ **Dán lại RIÊNG `06` hay `07` sau này sẽ âm thầm mở rộng `quan_tri` trở lại** —
`08` mục 8 định nghĩa lại ba hàm của hai file ấy cho hẹp hơn. Dán lại chúng
thì dán lại cả `08`.

Chủ dự án chốt 04/09/2026, sau khi luật trực hệ đã xong: **mọi nội dung sửa
đều gắn cờ tạm, admin duyệt rồi mới thành chính thức.**

Ba điều chủ dự án nói rõ, và cả ba đổi thiết kế so với bản nháp đầu của tôi:

1. **Dữ liệu chưa duyệt VẪN GHI THẲNG vào Supabase.** Không dựng kho chờ
   riêng. App chạy bình thường; admin lúc nào rảnh thì vào xem — đạt thì
   nhận chính thức, không đạt thì xoá.
2. **Trang duyệt là một trang HTML ĐỘC LẬP**, ngoài trang vẽ sơ đồ, duyệt
   dạng **bảng**.
3. **Hai hạng quản trị**: một hạng can thiệp được hệ thống, một hạng chỉ kiểm duyệt.

⚠ **Hệ quả đã chấp nhận:** dữ liệu sai vẫn hiện ra cho cả họ cho tới khi admin
dọn. Cách này bảo vệ gia phả bằng cách **sửa sau**, không phải **chặn trước**.
Đổi lại, người đóng góp thấy ngay việc mình làm — đó là lý do chọn nó.

⚠ **Và nó nuốt trọn cái lỗ hổng leo quyền** mà hàng rào 4 của b93 sinh ra để
chặn: khai bừa ai đó làm bố mình thì cũng chỉ là một đề nghị chờ duyệt. Từ
b94, **admin duyệt là hàng rào thật, trực hệ chỉ còn là bộ lọc** giúp admin
đỡ phải đọc những đề nghị chắc chắn bị từ chối. Đừng mô tả ngược lại.

#### Vai, sau b94

| Vai | Sửa dữ liệu | Duyệt nội dung | Đổi vai · gắn thành viên |
|---|---|---|---|
| `quan_tri_he_thong` | ghi thẳng | ✓ | ✓ |
| `quan_tri` *(kiểm duyệt)* | ghi thẳng | ✓ | ✗ |
| `sua` + cờ `tin_cay` | ghi thẳng | ✗ | ✗ |
| `sua` | **ghi, treo cờ chờ** | ✗ | ✗ |
| `xem` | ✗ | ✗ | ✗ |

`tin_cay` là cột mới trên `tree_members`, admin bật cho người chịu trách nhiệm
ghi chép một chi. Mặc định `false` — tức mặc định ai cũng phải chờ duyệt, đúng
như chủ dự án chọn.

#### Cột mới, và một cái bẫy phải tránh

Đơn vị kiểm duyệt là **một lần bấm Lưu**, không phải một ô dữ liệu — nên nó
gắn vào `change_log`, bảng vốn đã có sẵn một dòng cho mỗi lần Lưu.

| Cột thêm vào `change_log` | Để làm gì |
|---|---|
| `trang_thai` `'cho'`/`'duyet'`/`'tu_choi'` | hàng đợi |
| **`truoc` jsonb** | **ảnh chụp các dòng bị đụng, do MÁY CHỦ tự lấy trước khi ghi** |
| `duyet_boi` · `duyet_luc` · `ly_do_tu_choi` | vết duyệt |

⚠ **KHÔNG dùng `change_log.diff` để hoàn tác.** Nó do **trình duyệt** gửi lên
(`services/repo.js` dòng 194) và mặc định rỗng `{}`. Dựa vào nó để hoàn tác là
để chính người sửa tự khai mình đã sửa gì — người muốn phá chỉ cần gửi `diff`
rỗng là bản cũ biến mất vĩnh viễn. Cột `truoc` phải do `luu_cay()` tự chụp,
cùng lý lẽ với việc `ts`/`by` bị bỏ qua và lấy lại từ JWT.

⚠ **Luật hoàn tác:** chỉ hoàn tác được khi bản ghi **chưa bị lần Lưu nào sau
đó đụng vào**. Bị đụng rồi mà vẫn hoàn tác thì xoá mất công của người sau. Máy
chủ phải từ chối và chỉ ra ai đã sửa tiếp, chứ không âm thầm ghi đè — cùng
đúng cái lý lẽ của hàng rào 3 (`revision`).

#### Chia việc

⚠ Bản đầu của mục này đặt tên hai bước là *b94* và *b95*. Hai số ấy đã bị việc
khác lấy mất trong cùng ngày 04/09 (phép thử H9 và hàng chờ đăng ký), nên việc
này lùi xuống **b97 · b98**. Ghi lại để đọc nhật ký khỏi lạc.

- **b97** — ✓ **XONG 04/09/2026**, tầng máy chủ: năm cột mới trên `change_log`
  + `tin_cay`, `luu_cay()` 0.3.0 chụp `truoc` và đặt cờ, `duyet_thay_doi()` /
  `tu_choi_thay_doi()`, `ds_kiem_duyet()`, và hai hạng quản trị tách ra.
  Admin duyệt tạm bằng SQL cho tới khi có màn hình. **Chưa dán.**
- **b98** — ✓ **XONG 05/09/2026**, tên chốt là `QuanTri.html` (không phải
  `duyet.html` như dự tính ban đầu). Trang độc lập, bảng, mỗi dòng một lần
  Lưu, 49 phép kiểm. Và **HOÀN TÁC đã chạy thật trên máy chủ, 17/17 đạt** —
  việc chặn còn lại từ b97 nay đã đóng.

### 5. Đăng ký tài khoản phải QUA DUYỆT — ✓ XONG 04/09/2026 (b95 + b96)

**Đã viết:** `luoc-do/07-duyet-dang-ky.sql` (bốn hàm mới, `approved` nay gác cả
quyền đọc) · `services/sb.js` 0.2.0 · màn hình *"Xin vào gia phả"* và *"Đơn của
bạn đang chờ duyệt"* trong `pages/khoi-dong.js` 0.9.0 · khối **Đơn chờ duyệt**
trong màn Cài đặt (`pages/settings.js` 1.25.0) · bộ kiểm
`kiem-thu/kiem-duyet-dang-ky.mjs` **40 phép, đạt 40**, có kiểm chứng ngược.

**ĐÃ DÁN VÀ ĐÃ ĐO — 04/09/2026 chiều (b96).** Tự kiểm khớp 4/4, và đo hết
mốc A→C của luồng xin vào bằng REST: người **đang xếp hàng** đọc được **0 dòng
trên cả sáu bảng** — không thấy cả tên gia phả, không thấy cả dòng của chính
mình. Tự bật cờ duyệt cho mình: 0 dòng đổi. Tự mở hàng chờ: rỗng.

✓ **NỬA CUỐI ĐÃ ĐI — 04/09/2026.** Chủ dự án bấm Duyệt trên màn hình Cài đặt,
đơn của `thu-h9` được nhận. Câu chữ cũ của mục này giữ lại ngay dưới vì nó tả
đúng đường đi, phòng khi cần chỉ lại cho người khác.

Chủ dự án mở app (`Ctrl`+`F5`) → **⚙ Cài đặt**
→ khối *"Đơn chờ duyệt (1)"* → điền `P0012` → **Duyệt**. Đơn của `thu-h9`
đang nằm chờ, gửi lúc 04/09/2026 18:36. Đó cũng là lần đầu màn hình duyệt
được dùng thật — nếu nó khó hiểu chỗ nào thì chỉ lúc ấy mới biết.

⚠ **Câu hỏi "có tắt tự đăng ký không" nay đã tự trả lời: KHÔNG cần.** Hàng chờ
chặn ở chỗ đúng — chỗ đứng trong gia phả, không phải chỗ đứng trong
`auth.users`. Người lạ đăng ký xong vẫn không thấy gì (H9 hàng rào 1 đã đo).
Rác trong `auth.users` là cái giá, và nó rẻ.

<details><summary>Thiết kế ban đầu (giữ làm chứng)</summary>

### 5-cũ. Đăng ký tài khoản phải QUA DUYỆT — chủ dự án chốt 04/09/2026

Câu của chủ dự án: *"việc tạo tài khoản không được phép tràn lan, phải kiểm
soát chặt. cơ chế => đăng ký tài khoản => xếp hàng chờ, đợi admin vào duyệt
mới tạo tài khoản thành công."*

⚠ **Đo được 04/09/2026: project đang BẬT tự đăng ký** (`disable_signup: false`,
đọc từ `/auth/v1/settings`). Bất kỳ ai biết địa chỉ Supabase đều tạo được một
tài khoản. Việc ấy hôm nay **chưa mở cửa nào** — không có tên trong
`tree_members` thì Row Level Security chặn sạch, và đó chính là hàng rào 1 của
H9. Nhưng nó **đẻ rác trong `auth.users`** và người đăng ký thì không hiểu vì
sao mình vào rồi mà không thấy gì.

Ba việc, và hai trong ba đã có sẵn nền:

| Cần gì | Đã có gì | Còn phải làm |
|---|---|---|
| Chỗ xếp hàng | cột `tree_members.approved` (b93) | hàm `xin_vao_cay()` `security definer` để người mới tự chèn được đúng MỘT dòng `role='xem', approved=false` |
| Admin duyệt | hàm `duyet_thanh_vien()` (b93) | hàm `ds_cho_duyet()` + màn hình |
| Người chờ thấy gì | (chưa có) | màn hình *"Đơn của bạn đang chờ duyệt"* thay cho màn từ chối trống trơn |

**Không đẻ bảng mới.** Hàng chờ nằm ngay trong `tree_members` với
`approved = false` — cùng một bảng trả lời *"ai có chân trong cây này"*, nên
không có hai nguồn sự thật phải khớp nhau.

**Gộp với b95.** `duyet.html` vốn đã là trang duyệt nội dung; thêm một bảng
thứ hai *"Thành viên chờ duyệt"* vào đúng trang ấy rẻ hơn nhiều so với dựng
trang thứ hai, và admin chỉ phải nhớ một địa chỉ.

⚠ **Còn một câu chưa trả lời:** có tắt hẳn tự đăng ký không? Tắt thì sạch
tuyệt đối nhưng admin phải tạo tay từng tài khoản (và người trong họ không tự
xin vào được). Không tắt thì giữ đúng cơ chế "xếp hàng" chủ dự án mô tả. Ngả
theo **không tắt** — vì chính chủ dự án nói *"đăng ký → xếp hàng"*, tức có
bước đăng ký.

</details>

### 6. Nút Đăng xuất — ✓ XONG 04/09/2026 13:40

Chủ dự án báo giao diện sơ đồ không có đường ra. Hàm `sb.dangXuat()` đã có sẵn
từ b87 nhưng **chưa nút nào gọi**. Thêm vào cuối khối *"Tài khoản và quyền"*
của màn hình Cài đặt (`pages/settings.js`), hai nhịp để khỏi bấm nhầm.

Sửa kèm một câu SAI ở cùng khối: nó nói *"quyền do danh sách chia sẻ trên
Google Drive quyết định"* — câu của bản Apps Script, trên nền này Drive không
còn dính dáng gì.

---

## ⚠ NHIỀU CÂY GIA PHẢ — ba chỗ hỏng đo được, ba câu nay đã chốt

Chủ dự án hỏi cuối phiên b98: *"app có nhiều cây gia phả khác nhau, cơ chế quản
lý trong Supabase thế nào?"*. Đo trên mã thật, không đoán.

### Phần ĐÃ ĐÚNG và không phải sửa

`trees` mỗi cây một dòng. `tree_members` khoá `(tree_id, user_id)` — nên **vai
trò là thuộc tính của CẶP (người, cây), không phải của người**. Một người có
thể là quản trị hệ thống ở cây A và chỉ là khách ở cây B.

⚠ **ĐOẠN DƯỚI ĐÂY ĐÃ BỊ LẬT NGÀY 05/09/2026** — chủ dự án chốt là **có** quản
trị toàn hệ thống, đọc và sửa được mọi cây. Giữ nguyên chữ cũ làm chứng cứ về
điều gì đúng cho tới hôm ấy; đường đi mới ở `THIET-KE-NHIEU-CAY.md` mục 2.

Luật RLS `doc_trees ... using (la_thanh_vien(id))` (`02-rls.sql` dòng 162) trả
lời trọn câu *"ai xem được toàn bộ cây, ai chỉ xem được vài cây"*: **không có
siêu quản trị toàn hệ thống.** Không ai thấy cây mình không có tên trong đó, kể
cả `quan_tri_he_thong` của cây khác. `layDanhSachGiaPha()` vì thế không có câu
`where` lọc quyền nào — RLS lọc sẵn, và app không lọc thì app không lọc sai.

### ⚠ Hỏng 1 — `user_settings` đang gánh hai nghĩa mâu thuẫn

Bảng dựng theo khoá `(user_id, tree_id)` + `focus_person_id`, tức **mỗi cây một
dòng, mỗi cây một người trung tâm riêng**. Nhưng `sb.chonGiaPha()` lại
`delete().eq('user_id', …)` **xoá sạch mọi dòng** rồi chèn đúng một dòng, để
dùng chính bảng ấy trả lời câu *"đang mở cây nào"*.

**Hậu quả đo được: đổi cây là xoá người trung tâm mặc định của MỌI cây**, kể cả
cây vừa chuyển sang. Hôm nay chỉ có một cây nên không ai thấy; có cây thứ hai
là mất mỗi lần đổi.

Đường sửa: tách hai nghĩa ra. *"Đang mở cây nào"* là **một** giá trị cho mỗi
người → thuộc về một dòng riêng *(cột mới `dang_mo` trên một bảng cấp người,
hoặc `localStorage`)*. `user_settings` trả về đúng nghĩa gốc: cài đặt **của
người này trên cây này**, mỗi cây một dòng, không xoá nhau.

### ⚠ Hỏng 2 — công tắc *Hiển thị* không lưu ở đâu cả

`state.hienNgayGio` khai `false` ở `state.js:41` và **không đọc/ghi
`user_settings` cũng không `localStorage`**. Tắt trình duyệt là mất. Đây không
phải lỗi của nhiều cây — nó hỏng ngay cả với một cây, chỉ chưa ai báo.

Chỗ đúng của nó là `user_settings`, cùng dòng với `focus_person_id` — nhưng chỉ
sau khi Hỏng 1 được gỡ, nếu không nó cũng bị xoá theo mỗi lần đổi cây.

### ⚠ Hỏng 3 — `limit 1` không có `order by`, 8 chỗ

`coalesce(p_tree, (select id from public.trees limit 1))` xuất hiện ở
`07-duyet-dang-ky.sql` (3 chỗ) và `08-kiem-duyet.sql` (5 chỗ). Không có
`order by` thì Postgres trả cây **nào tuỳ ý**.

Với một cây thì luôn đúng. Với nhiều cây, `ds_cho_duyet()`,
`dem_cho_kiem_duyet()`, `ds_kiem_duyet()`, `trang_thai_cua_toi()` có thể trả
lời về **một cây khác cây đang mở**, và trả lời im lặng.

⚠ **Không rò rỉ dữ liệu** — `co_the_quan_tri()` vẫn canh theo đúng cái `v_tree`
ấy, nên người ta chỉ thấy cây mình có quyền. Nhưng **hiện sai con số và duyệt
nhầm hàng chờ**. Đường sửa: bỏ `coalesce`, bắt nơi gọi truyền `p_tree` tường
minh — `state.phien.treeId` luôn có sẵn.

### ~~Câu chủ dự án phải trả lời~~: AI ĐƯỢC TẠO CÂY MỚI — **CHỐT 05/09/2026**

`repo.taoGiaPhaMoi()` còn trả `lyDo: 'chualam'`, nên hôm nay **không ai tạo
được cây mới từ app** — phải dựng tay trong Supabase.

⚠ Đây là **quyền duy nhất không thuộc về cây nào**, nên `tree_members` không
trả lời được: bảng ấy chỉ nói *"trong cây X, người này là gì"*, không nói
*"người này có được đẻ ra cây Y chưa tồn tại không"*.

**Chủ dự án chọn đường CHẶT HƠN**: *"tôi không khoá việc cho phép người trong
họ tạo cây, nhưng phải xin phép và được cấp quyền mới tạo được"*. Nên phải dựng
bảng cấp người thật — `tai_khoan`, cột `duoc_tao_cay`. Cùng bảng ấy trả lời nốt
hai câu khác cũng không thuộc cây nào: *ai là quản trị toàn hệ thống*, và *mã
ngắn của tài khoản* để chỉ đúng người khi tên trùng.

Giữ lại một nửa đề xuất cũ vì nó vẫn đúng: **người tạo tự động thành
`quan_tri_he_thong` của cây vừa tạo**, và hai câu `insert` phải nằm trong cùng
một giao dịch — đẻ ra `trees` trơ trọi là đẻ ra cây không ai vào được, kể cả
người vừa tạo. Chi tiết: `THIET-KE-NHIEU-CAY.md` mục 4 và mục 7.

---

## ⚠ Hai câu chủ dự án phải trả lời

Cả hai đang chặn việc thật, không phải câu hỏi cho vui.

**1. Ảnh: kho công khai hay kho kín?** Chi tiết và bảng đánh đổi ở
`KIEN-TRUC.md` mục 7. Hiện để công khai — đường dẫn khó đoán, nhưng "khó đoán"
không phải "được bảo vệ".

**2. ~~"Chi/nhánh" định nghĩa thế nào?~~ — ĐÃ TRẢ LỜI 04/09/2026.** Và câu
trả lời là *không chia chi*: luật đi theo **trực hệ**, tính thẳng từ đồ thị
quan hệ. Không ai phải liệt kê chi, không ai phải bảo trì danh sách ấy khi có
người mới sinh. Bảng `branches`/`branch_access` dựng từ `01-bang.sql` **từ nay
không dùng** — xem `06-quyen-truc-he.sql` mục 2.

Trước khi chốt đã đo trên cây thật 681 người, và chính con số loại bỏ phương
án nghe hợp lý hơn: hiểu *"cùng huyết thống"* theo nghĩa đầy đủ thì **552/681
tài khoản sửa được trên 500 người** (cả họ chung một cụ tổ), và **131/133 cặp
vợ chồng không sửa nổi hồ sơ của nhau**. Luật trực hệ cho trung vị **27 người**.

---

## Còn treo — không chặn gì, nhưng đừng quên

*Đếm ngày 10/09/2026 (b110c): bảng có **36 dòng**, trong đó **12 đã đóng**
(gạch ngang, giữ làm chứng) — còn **24 việc treo thật**. Đếm lại bằng số dòng
mỗi lần `/ket-thuc`, đừng chép con số của lần trước.*

| Việc | Ghi ở đâu |
|---|---|
| ⚠⚠ **CHẶN — `18-hai-chu-ky.sql` chưa dán.** Lỗ hổng hai chữ ký đang MỞ trên máy chủ thật: mời ai vào cây rồi tự duyệt và tự đổi vai hộ họ. Dán xong còn phải **dọn vết** (mục 9 cuối file `18`) vì bản vá không tự sửa dòng đã lọt qua | `nhat-ky/b110c-hai-chu-ky.md` |
| ⚠ **HỎI CHỦ DỰ ÁN: `15-tim-kiem.sql` bản 0.2.0 đã dán chưa?** Hai tài liệu nói ngược nhau — bảng này ghi *"đã dán cả hai, 09/09"*, còn `CHI-DAN.md` ghi *"CHƯA DÁN"*. **Không tự chọn một bên**: đoán sai theo chiều "đã dán" là để cột `vai_cao_nhat` vắng mặt mà không ai biết; đoán sai theo chiều kia là dán thừa một file `drop function`. Hỏi rồi sửa chỗ sai, và ghi một dòng Đính chính | `CHI-DAN.md` · bảng này |
| ~~`15-tim-kiem.sql` chưa dán~~ — ✓ **đã dán cả hai Supabase, bản 0.2.0, tự kiểm ĐẠT** (09/09/2026). ⚠ Vẫn giữ luật: nó **dán đè ba hàm đọc** của `13`/`14`, nên **dán lại `13` hoặc `14` thì bắt buộc dán lại `15`** | `nhat-ky/b109b-o-goi-y.md` |
| ~~`14-loi-moi.sql` chưa dán~~ — ✓ **đã dán cả hai Supabase**, b108 chạy thật 09/09 | `nhat-ky/b107-moi-vao-gia-pha.md` |
| ⚠ **Hai việc của điểm dừng b106 chưa nghiệm thu bằng mắt**: gắn được mã người · đăng nhập bằng vai `sua` xem `pham_vi_sua()` đúng chưa | `nhat-ky/b106-khu-tai-khoan.md` |
| ⚠ **Ai gọi `don_thung_rac()`** — nút bấm tay hay trigger Apps Script đêm? Chưa hỏi chủ dự án; hỏi ở b110 | `THIET-KE-NHIEU-CAY.md` mục 11.6 |
| ⚠ **`settings.js` vẫn gọi thứ này là *Quyền*** ở màn hình Cài đặt của mỗi người, trong khi khu Quản trị đã đổi hết sang **Vai trò** (b109c). Chủ dự án chỉ nói tới hai tấm lọc, nên chưa đụng — nhưng chính luật *"hai màn hình gọi một thứ bằng hai tên"* là lý do đổi tên lần này | `nhat-ky/b109c-o-vai-tro.md` |
| ⚠ **`ds_thanh_vien()` không trả `moi_luc`**, nên ở ba tấm lọc cây **không phân biệt được** *đơn xin vào* với *lời mời chưa nhận* — bảng hai cột ở đó chỉ dám ghi "Đang chờ". Sửa được nhưng phải dán lại SQL, để dồn vào lần dán kế tiếp | `nhat-ky/b109c-o-vai-tro.md` |
| ⚠⚠ **CHỦ DỰ ÁN PHẢI DÁN `11-quyen-he-thong.sql` bản 0.2.0.** Máy chủ thật chưa có gì; **Staging đang giữ bản 0.1.0 MANG HAI LỖ HỔNG** (leo quyền · sao lưu rỗng) — dán đè lên là vá. Chưa dán thì b103 chưa bắt đầu được | `nhat-ky/b102-tang-quyen-he-thong.md` |
| ⚠ **b103 → b105 của Antigravity vẫn nằm NGOÀI repo**, trong `codex/`, mới chỉ dán lên Staging. Đã soi lướt: `12` và `13` **không thêm luật ghi nào**, nên lỗ hổng loại b102 không lặp ở đó — nhưng chưa rà kỹ, chưa đo | `PHOI-HOP-AI.md` mục *Đề nghị cho Claude Code* |
| ~~Hai file SQL phân quyền chưa ai dán~~ — ✓ **đã dán 04/09/2026 13:20**, đối chiếu khớp | `HUONG-DAN-PHAN-QUYEN.md` |
| ~~Chưa có màn hình quản lý thành viên~~ — ✓ **XONG b106 (09/09/2026)**: khu Tài khoản làm cả năm việc, xoá sổ mục 3 của `HUONG-DAN-PHAN-QUYEN.md` | `nhat-ky/b106-khu-tai-khoan.md` |
| ~~Tài khoản thử `thu-h9@…` chưa dọn~~ — ✓ **XONG 08/09/2026**, chủ dự án gỡ bằng chính màn hình mới | `nhat-ky/b106-khu-tai-khoan.md` |
| ~~Cờ `tin_cay` chưa có màn hình~~ — ✓ **XONG b106**; trên màn hình gọi là **Tin cậy**, không phải "Ghi thẳng" | `nhat-ky/b106-khu-tai-khoan.md` |
| ⚠ **Duyệt nội dung chưa xem được TRƯỚC/SAU từng ô** → **b111** *(sửa 07/09: dòng cũ ghi b103, lạc hậu từ lúc chuỗi bước viết lại 05/09; sửa lại 09/09 vì b109 mới chen vào đẩy số — xem b108)*. Chủ dự án nêu lại 07/09 khi nhìn cột *Việc* trên app thật | `THIET-KE-QUAN-TRI.md` khu 3 |
| ~~NHIỀU CÂY: `chonGiaPha()` xoá người trung tâm mặc định của mọi cây~~ — ✓ sửa ở b100, **đã dán 05/09/2026 21:38** | `luoc-do/10-sua-nhieu-cay.sql` mục 1 |
| ~~NHIỀU CÂY: công tắc Hiển thị không lưu ở đâu~~ — ✓ sửa ở b100, **đã dán 05/09/2026 21:38** | `luoc-do/10-sua-nhieu-cay.sql` mục 2 |
| ~~NHIỀU CÂY: `limit 1` không `order by` ở 8 chỗ~~ — ✓ sửa ở b100, **đã dán 05/09/2026 21:38** | `luoc-do/10-sua-nhieu-cay.sql` mục 4 |
| ⚠ **Chưa ai tạo được cây mới** — ai được tạo đã chốt 05/09 → **b104** | `THIET-KE-NHIEU-CAY.md` mục 7 |
| ~~Cây Nguyễn Phúc Giáo 681 người~~ — ✓ **đã dán 05/09/2026 21:38**, khớp 7/7 dòng, chủ dự án đổi qua lại giữa hai cây | `di-doi/HUONG-DAN-DI-DOI.md` mục *LẦN THỨ HAI* |
| ⚠ **`xin_vao_cay()` vẫn từ chối khi có nhiều cây mà không nói rõ cây nào** — cố ý, gỡ ở **b103** | `luoc-do/10-sua-nhieu-cay.sql` mục 4e |
| ~~Chưa bấm thử app trên HAI cây~~ — ✓ chủ dự án đổi qua đổi lại giữa NTB và NPGQ8C9, người trung tâm mặc định của cả hai còn nguyên *(05/09)* | `di-doi/HUONG-DAN-DI-DOI.md` mục *LẦN THỨ HAI* |
| ⚠ **Tên gọi chưa chốt**: hai thứ khác hẳn nhau cùng tên *"quản trị hệ thống"* | `THIET-KE-NHIEU-CAY.md` mục 11 |
| ~~Chưa ai thử HOÀN TÁC thật~~ — ✓ **đã chạy trên máy chủ thật 05/09/2026, 17/17 đạt** | `kiem-thu/thu-hoan-tac.sql` |
| ⚠ **Bộ bất biến bố cục đang gác nhầm nhánh** — xem ngay dưới bảng | `/kiem-tra` phép 9 |
| ⚠ **Sao lưu KHÔNG chép ảnh** — chỉ liệt kê. Ảnh vẫn nằm đúng một chỗ | `KIEN-TRUC.md` mục 7 |
| ⚠ **Chưa ai thử KHÔI PHỤC từ file sao lưu** — có file khác với khôi phục được | `sao-luu/HUONG-DAN-SAO-LUU.md` |
| ⚠ **Chưa bấm thử app trên cây 681 người** — cây ấy nay có thật trên máy chủ; lỗi `vn` của b89 lộ ra ở app thật chứ không lộ ở bộ kiểm | `nhat-ky/b89` |
| Bốn màn hình chưa mở được (sao lưu · dựng gia phả mới · bỏ chọn · quyền ảnh) | `KIEN-TRUC.md` mục 6 |
| Giấu chi tiết người còn sống với người chỉ có quyền xem | `KIEN-TRUC.md` mục 6 |
| Lỗi điện thoại: chọn số đời không tự vẽ lại | `BAT-DAU.md` mục 5 |
| Tháo giàn giáo `tuong-thich.js` — mốc 7 file, chỉ được giảm | `KIEN-TRUC.md` mục 4 |
| Đổi tên ba vết sẹo (`driveFileId` · `driveThumbUrl` · `tuong-thich`) | `KIEN-TRUC.md` mục 4 |
| Đợt 7 của phép tách `person-edit.js` — treo từ b48 | `BAT-DAU.md` mục 5 |
| Chế độ **bổ sung** của nhập Excel — có phép đo, chưa ai bấm thử trên app thật | `BAT-DAU.md` mục 5 |
| Chưa mở file `.ged` xuất ra bằng một phần mềm gia phả thật | `BAT-DAU.md` mục 5 |

### ⚠ Bộ bất biến bố cục đang gác nhầm nhánh

Bộ kiểm 66 phép / 51.250 phép so trên 214 sơ đồ — thứ bảo vệ `domains/layout.js`,
phần đắt nhất của cả dự án — nằm ở `Claude_Code/kiem-thu/`, **ngoài repo này**.
Và **58 trong 142 file của nó `import` từ `../giapha/js/`**, tức bản đã đóng băng.

Hôm nay vẫn an toàn: đo 03/09/2026, hai bản `domains/` giống nhau **bit-với-bit,
10/10 file**. Nhưng đó là một sự trùng hợp, không phải một cơ chế.

Ngày ai đó sửa `supabase/js/domains/`, bộ kiểm ấy **vẫn chạy xanh** — nó đang đo
một file khác. `/kiem-tra` phép 9 là thứ duy nhất bắt được, và nó chỉ báo *"hai
bản đã lệch"*, không thay được cho việc trỏ bộ kiểm sang đúng chỗ.

Ba đường, chưa chọn: (a) thêm biến môi trường chọn gốc cho 58 file kiểm;
(b) chép bộ kiểm vào `supabase/kiem-thu/`; (c) để nguyên và sống bằng phép 9.
**Chỉ phải quyết khi thật sự cần sửa `domains/`** — mà theo `BAT-DAU.md` mục 1
thì ngày ấy đằng nào cũng phải dừng lại hỏi vì sao.
