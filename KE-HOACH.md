# KẾ HOẠCH — nhánh Supabase

*Cập nhật 08/09/2026 · Bước gần nhất: **b105** (đã dán) · Việc kế tiếp: **b106***

> **Đây là file đổi nhanh nhất trong khung.** Tên file cố định, không có
> `_Vxx` — lịch sử để git giữ. Muốn biết kế hoạch tuần trước thế nào thì
> `git log -p KE-HOACH.md`, đừng đẻ ra bản thứ hai.
>
> ⚠ **`tai-lieu/KE-HOACH_V54.md` nói về nhánh Apps Script**, không nói về
> nhánh này. Đừng lấy việc còn treo của nó làm việc kế tiếp ở đây.

---

## Đang ở đâu

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

**Năm mươi mốt việc đã đóng** — đếm theo đúng số dòng của bảng ngay dưới, đừng
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
trống. Đây là nền cho b103 → b108, nên nó đứng trước mọi khu.

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

## Việc kế tiếp — b100 → b109, MỘT PHIÊN MỘT BƯỚC

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
>    khi kế hoạch nói tới nó.** Cài đặt vì thế xuống **8 khối**, về 6 ở b108.
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

### b107 — Kiểm duyệt: bảng phẳng TRƯỚC/SAU

| | |
|---|---|
| **Làm** | `chi_tiet_kiem_duyet(p_tree, p_id)` · `domains/so-sanh.js` **(file MỚI, không sửa 10 file cũ)** · mở rộng một dòng thành **bảng phẳng kiểu Excel**: `Người · Trường · Trước · Sau · Loại` |
| **Sản phẩm** | File SQL + bộ kiểm + màn hình mở rộng dòng |
| **Điểm dừng** | Chọn một lần Lưu thật, thấy đúng từng ô *trước → sau*, trường không đổi thì **không vẽ dòng**. Rồi dựng cảnh xung đột: Lưu A, Lưu B đụng cùng bản ghi → cột SAU nói rõ đó là trạng thái hôm nay, nút hoàn tác mờ kèm lý do |
| **Đã trả lời sẵn** | Không cần thêm cột `sau`. `truoc` có hình `{persons:[{id,cu}],…}`, còn *sau* chính là dòng hiện tại |
| **⚠ Giữ nguyên** | Xem theo **ô**, duyệt theo **lần Lưu**. Không cho nhận từng ô |

### b108 — Khu Sao lưu + Số đếm đối chiếu

| | |
|---|---|
| **Làm** | `dem_du_lieu(p_tree)` · `khu-sao-luu.js` — trạng thái lần sao lưu gần nhất + bảng đối chiếu 5 con số |
| **Sản phẩm** | Khu 4 ở trạng thái **chỉ đọc**, và nói thẳng *"sao lưu không chép nội dung ảnh"* |
| **Điểm dừng** | Số trên màn hình khớp với số đếm được trong file sao lưu đêm gần nhất |
| **⚠ Không làm** | **Không vẽ nút Khôi phục.** Máy chủ chưa khôi phục được, vẽ nút là giả vờ giải quyết bằng giao diện |

### b109 — Mã người xuyên cây

| | |
|---|---|
| **Làm** | `persons.noi_ve` · thêm tên cột vào bảng `TEN_PERSON` của `hinh-dang.js` · ô nhập trong màn hồ sơ · dòng *"Người này cũng có trong gia phả …"* + nút nhảy sang **chỉ khi người xem truy cập được cây kia** |
| **Sản phẩm** | File SQL nhỏ + bộ kiểm + màn hình |
| **Điểm dừng** | Lưu một vòng rồi đọc lại, `noi_ve` **còn nguyên** — đúng phép kiểm mà cột `branch_id` từng cần |
| **⚠ Bẫy** | Cột không có tên trong `TEN_PERSON` thì mỗi lần lưu ghi `null` đè lên, **và không có gì báo lỗi** — `DU-LIEU.md` mục 3 điều 7 |
| **Đứng cuối vì** | Chưa ai dựng cây thứ ba. Cột này chỉ có việc khi có người dựng cây cho bên nhà họ |

### Sau b109 — chưa đặt số, chưa chốt

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

| Việc | Ghi ở đâu |
|---|---|
| ⚠⚠ **CHỦ DỰ ÁN PHẢI DÁN `11-quyen-he-thong.sql` bản 0.2.0.** Máy chủ thật chưa có gì; **Staging đang giữ bản 0.1.0 MANG HAI LỖ HỔNG** (leo quyền · sao lưu rỗng) — dán đè lên là vá. Chưa dán thì b103 chưa bắt đầu được | `nhat-ky/b102-tang-quyen-he-thong.md` |
| ⚠ **b103 → b105 của Antigravity vẫn nằm NGOÀI repo**, trong `codex/`, mới chỉ dán lên Staging. Đã soi lướt: `12` và `13` **không thêm luật ghi nào**, nên lỗ hổng loại b102 không lặp ở đó — nhưng chưa rà kỹ, chưa đo | `PHOI-HOP-AI.md` mục *Đề nghị cho Claude Code* |
| ~~Hai file SQL phân quyền chưa ai dán~~ — ✓ **đã dán 04/09/2026 13:20**, đối chiếu khớp | `HUONG-DAN-PHAN-QUYEN.md` |
| ⚠ **Chưa có màn hình quản lý thành viên** — đổi vai, gắn mã người, gỡ đều bằng `update` trong SQL Editor → **b105 · b106** *(sửa 07/09: dòng cũ ghi b101 · b102, sai — b101 chỉ dựng khung)* | `THIET-KE-QUAN-TRI.md` khu 2 |
| ⚠ **Tài khoản thử `thu-h9@…` chưa dọn** — đang gắn `P0012`, đã duyệt → dọn ở **b106**, bằng chính màn hình mới *(sửa 07/09: dòng cũ ghi b102, sai — b102 chỉ đụng SQL)* | `nhat-ky/b94-phep-thu-h9.md` |
| ⚠ **Cờ `tin_cay` chưa có màn hình** — bật bằng `update` trong SQL Editor → **b106** *(sửa 07/09: dòng cũ ghi b102)* | `luoc-do/08-kiem-duyet.sql` mục 3 |
| ⚠ **Duyệt nội dung chưa xem được TRƯỚC/SAU từng ô** → **b107** *(sửa 07/09: dòng cũ ghi b103, lạc hậu từ lúc chuỗi bước viết lại 05/09)*. Chủ dự án nêu lại 07/09 khi nhìn cột *Việc* trên app thật | `THIET-KE-QUAN-TRI.md` khu 3 |
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
