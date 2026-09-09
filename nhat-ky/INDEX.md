# NHẬT KÝ — nhánh Supabase

*Bắt đầu từ bước 87 · Cập nhật 08/09/2026 16:15*

> ⚠ **FILE NÀY CHỈ ĐƯỢC THÊM DÒNG. Không bao giờ sinh lại cả file.**
>
> Nhánh cũ dùng quy ước `NK-INDEX_Vxx`: mỗi lần thêm một bước là sinh lại toàn
> bộ file mang số mới. Cách ấy đã hỏng một lần có ghi lại — **V62 cắt nhầm hai
> bảng** *Hai nhánh, một dãy số* và *Đính chính giữa các bước*, tưởng chúng là
> mục lục nên thu gọn, mất đúng phần có giá trị nhất; V63 phải sửa lại.
>
> Ở đây không có bước "sinh lại", nên không có chỗ để cắt nhầm. Thêm một bước
> = thêm **một dòng** vào bảng dưới. Lịch sử để git giữ.

---

## Một dãy số, hai nhánh

Số bước **đi tiếp**, không đánh lại từ đầu. Quyết định của b00–b86 vẫn là nền
của app mới — `domains/` chép nguyên sang, luật vẽ chép nguyên sang.

| Bước | Nhánh | Nhật ký nằm ở |
|---|---|---|
| b00 – b86 | Apps Script *(đã đóng băng 02/09/2026)* | `../../tai-lieu/NK-INDEX_V81.md` và `../../tai-lieu/NK-Bxx_V01.md` |
| b87 → | **Supabase** | thư mục này |

⚠ Thư mục `tai-lieu/` **cố ý nằm ngoài repo** này (chủ dự án chốt 03/09/2026).
Ai tải repo về từ GitHub sẽ không có 87 file nhật ký cũ — đó là chuyện bình
thường, không phải thiếu sót.

---

## Các bước

| Bước | Ngày | Nội dung một dòng | File |
|---|---|---|---|
| 87 | 03/09/2026 | Dựng bộ khung app trên Supabase: 12 bảng, một cửa ghi, tầng services viết lại; `domains/` không sửa dòng nào | `b87-bo-khung-supabase.md` |
| 88 | 03/09/2026 | App lên mạng thật ở GitHub Pages; thêm phép kiểm bắt bộ bất biến bố cục đang gác nhầm nhánh | `b88-len-mang-va-bit-lo-hong-bo-kiem.md` |
| 89 | 03/09/2026 | Chạy thật lần đầu: thêm được người mới; tên miền riêng có HTTPS; bộ kiểm lên 19 phép | `b89-chay-that-va-ten-mien.md` |
| 90 | 03/09/2026 | Mã sao lưu (H8): trigger Apps Script chép 12 bảng ra Drive mỗi đêm, kiêm giữ sống. Chưa ai dựng | `b90-sao-luu-ra-drive.md` |
| 91 | 04/09/2026 | Sao lưu bỏ hẳn khoá bí mật: vai `sao_luu` chỉ-đọc + đăng nhập thường; bộ kiểm 33 phép | `b91-sao-luu-bo-khoa-bi-mat.md` |
| 92 | 04/09/2026 | Sinh một file SQL dán tay để di dời 59 người vào bảng, giữ nguyên nhật ký; bộ kiểm 46 phép | `b92-di-doi-du-lieu-bang-sql.md` |
| 93 | 04/09/2026 | Luật sửa theo TRỰC HỆ thay hẳn ý tưởng chia chi/nhánh; gắn ID + admin duyệt; bộ kiểm 57 phép | `b93-quyen-truc-he.md` |
| 94 | 04/09/2026 | Phép thử H9: cả 5 hàng rào RLS đạt trên máy chủ thật; bắt và vá một lỗ hổng leo quyền; nút Đăng xuất | `b94-phep-thu-h9.md` |
| 95 | 04/09/2026 | Đăng ký xếp hàng chờ: approved gác cả quyền đọc, màn hình xin vào, khối duyệt trong Cài đặt; 40 phép | `b95-hang-cho-duyet.md` |
| 96 | 04/09/2026 | Hàng chờ chạy thật: người đang chờ đọc được 0 dòng trên cả 6 bảng; 4 hàm mới đo trên máy chủ | `b96-hang-cho-chay-that.md` |
| 97 | 04/09/2026 | Kiểm duyệt nội dung ở máy chủ: mỗi lần Lưu treo cờ, từ chối thì hoàn tác. Đổi mã vai. Đã chạy thật | `b97-kiem-duyet-noi-dung-va-doi-ma-vai.md` |
| 98 | 05/09/2026 | Trang duyệt QuanTri.html; HOÀN TÁC chạy thật lần đầu trên máy chủ, 17/17 đạt; bàn thử SQL tại chỗ | `b98-trang-duyet-va-hoan-tac-that.md` |
| 99 | 05/09/2026 | Thiết kế chốt trang Quản trị 4 khu, kế hoạch b99→b104; đo ra 3 lỗi khi có nhiều cây gia phả | `b99-thiet-ke-trang-quan-tri.md` |
| 100 | 05/09/2026 | Sửa 3 lỗi nhiều cây; sinh SQL di dời cây Nguyễn Phúc Giáo 681 người; bộ kiểm mới 35+16 phép | `b100-sua-nhieu-cay.md` |
| 101 | 07/09/2026 | Trang Quản trị thành khung 4 khu: thanh điều hướng, khu ghi vào # địa chỉ, hai con số đếm | `b101-khung-quan-tri.md` |
| 102 | 07/09/2026 | Tầng quyền hệ thống: rà bản AGY, đo ra 2 lỗ hổng (leo quyền · sao lưu rỗng), vá, đã dán | `b102-tang-quyen-he-thong.md` |
| 103 | 08/09/2026 | Khu Gia phả chạy: thấy cả cây mình chưa có chân, xin quyền, công tắc cho người lạ thấy tên | `b103-khu-gia-pha.md` |
| 104 | 08/09/2026 | Tạo gia phả mới chạy thật; đổi mã cây sang 3 chữ số; vá khe hở khuôn mã cây | `b104-tao-gia-pha-moi.md` |
| 105 | 08/09/2026 | 6 hàm quản lý tài khoản của một cây, gồm bàn giao cây; luật không ai tự đặt quyền cho mình | `b105-quan-ly-thanh-vien.md` |
| 106 | 09/09/2026 | Khu Tài khoản chạy: bảng, ba tấm lọc, năm việc đổi quyền; dời khối Đơn chờ duyệt khỏi Cài đặt | `b106-khu-tai-khoan.md` |
| 107 | 09/09/2026 | Mời vào gia phả, cờ Quản trị hệ thống, xoá tài khoản — 8 hàm máy chủ, đo 59/59, chưa dán | `b107-moi-vao-gia-pha.md` |
| 108 | 09/09/2026 | Mời vào gia phả CHẠY THẬT: Nhận/Từ chối ngay màn hình khởi động; vá `trang_thai_cua_toi()` | `b108-moi-nhan-tu-choi.md` |
| 109 | 09/09/2026 | Khu Tài khoản Toàn hệ thống + bảng sâu, chạy thật; bộ kiểm 154 phép; vá trang giả bị trắng | `b109-khu-tai-khoan-he-thong.md` |
| 109b | 09/09/2026 | Ô gợi ý email/mã người ở ba màn hình; cột `ho_ten` và cột Quyền; vá cột tên luôn hiện mã | `b109b-o-goi-y.md` |
| 109c | 09/09/2026 | Ô Vai trò mở bảng hai cột *cây · vai trò*, bấm tiếp là sửa; bảng dài tự cuộn trong khung | `b109c-o-vai-tro.md` |
| 109d | 09/09/2026 | Câu dẫn tấm Toàn hệ thống nói CHÍNH MÌNH đang đăng nhập bằng ai; `layPhien()` thêm `hoTen` | `b109d-cau-dan-dang-nhap.md` |

*Cột "Nội dung một dòng": **một câu, tối đa 110 ký tự**. Nói bước ấy làm được
cái gì, không nói vì sao. Đây là dòng để người đọc quyết định có mở file bước
hay không, chỉ vậy thôi.*

---

## Đính chính giữa các bước

Bảng này ghi **bước cũ nào đã nói sai**, và bước nào sửa lại. Nó **không phải
mục lục** — cắt cụt là mất đúng phần khiến nó có giá trị.

| Câu đã nói sai | Ở bước | Sửa ở bước | Sự thật |
|---|---|---|---|
| `KIEN-TRUC.md` mục 6 mở đầu bằng *"Chưa chạy thật một lần nào"* | b87 | b90 | Đúng cho tới b88. Từ 03/09/2026 (b89) SQL đã chạy, đăng nhập được, thêm được người mới. Thứ **thật sự** chưa kiểm chứng lần nào là **phân quyền RLS** (H9) |
| `KIEN-TRUC.md` mục 6 ghi *"Còn một ô chưa tích: Enforce HTTPS"* | b88 | b90 | Đã tích cuối ngày 03/09/2026; đo lại `http://` trả `301` sang `https://` |
| `KE-HOACH-HA-TANG-Supabase_V01.md` bước H8: *"gỡ deploy dạng web app"* | *(24/08/2026, trước b87)* | b90 | Giả định nền của câu ấy chết ngày 02/09 khi chốt **giữ bản Apps Script chạy tiếp** cho người trong họ. Gỡ deploy là tắt app của cả họ — H8 làm bằng một dự án Apps Script **mới, riêng** |
| `HUONG-DAN-SAO-LUU.md` bước 1: *"chép **Secret key** (`sb_secret_…`)"* | b90 | b91 | Khoá ấy **không bao giờ** dùng được từ Apps Script: Supabase chặn nó khi `User-Agent` giống trình duyệt, mà Apps Script luôn gửi `Mozilla/5.0 (compatible; Google-Apps-Script; …)` và Google không cho đổi. Bản 0.2.0 bỏ hẳn khoá bí mật, dùng vai `sao_luu` |
| `KE-HOACH.md` việc H9: *"hai tài khoản, mỗi tài khoản một **nhánh**"* — và cả câu hỏi treo *"chi/nhánh định nghĩa thế nào"* | b87 → b92 | b93 | Luật chốt 04/09/2026 **không có nhánh nào cả**: quyền đi theo **trực hệ**, tính thẳng từ đồ thị quan hệ. Bảng `branches`/`branch_access` dựng từ `01-bang.sql` từ nay không dùng. Phép thử H9 đúng là *hai tài khoản gắn với hai người ở hai đầu cây* |
| `06-quyen-truc-he.sql` mục 8: *"dùng được từ **SQL Editor** ngay"* | b93 | b94 | Chỉ chạy được vì lỗ hổng `null` trong chính hàm ấy. Vá xong thì SQL Editor là "người ngoài" và bị từ chối — duyệt tay bằng `update`, xem `HUONG-DAN-PHAN-QUYEN.md` mục 3 |
| `b95-hang-cho-duyet.md` mục *Còn treo*: *"`07-duyet-dang-ky.sql` chưa dán"* | b95 | b96 | Chủ dự án dán ngay trong cùng phiên, 04/09/2026 chiều, tự kiểm khớp 4/4. Đã đo hết mốc A→C của luồng xin vào; còn nửa cuối là chủ dự án bấm Duyệt trên màn hình Cài đặt |
| Mọi bước gọi vai bằng mã **`chu`** và **`admin`** | b87 → b96 | b97 | Hai mã ấy **không còn tồn tại** từ 04/09/2026 tối: `chu` → `quan_tri_he_thong`, `admin` → `quan_tri` (`09-doi-ma-vai.sql`, đã chạy thật). Đọc nhật ký cũ thì thay ngầm hai chữ ấy. Tên cho người đọc: Quản trị hệ thống · Quản trị viên · Thành viên · Khách |
| `08-kiem-duyet.sql` 0.1.1 mục *TÊN GỌI*: *"Mã trong bảng KHÔNG đổi theo… trả cái giá ấy để được mấy chữ trên màn hình là không đáng"* | b97 | b97 | Sai **trong cùng buổi**. Lý lẽ hụt một vế: mã vai không chỉ nằm trong bảng — nó hiện trên màn hình Cài đặt, trong câu báo lỗi máy chủ, và trong mọi đoạn SQL chủ dự án phải dán tay. *"Chỉ nằm trong cơ sở dữ liệu"* là mô tả của người đọc mã, không phải của người dùng app |
| `KE-HOACH.md` mục b102: hàm tên **`la_quan_tri_toan_he_thong`** | b99 | b102 | `THIET-KE-NHIEU-CAY.md` mục 11 chốt 05/09/2026: **không đẻ thêm mã `quan_tri_toan_he_thong`**, dùng đúng `quan_tri_he_thong` đã có. Tên thật là `la_quan_tri_he_thong()`. Và dòng *"Phải chốt trước: tên gọi"* của b102 đã hết hiệu lực từ 05/09 — mục 11 mở đầu bằng "✓ ĐÃ CHỐT" |
| `11-quyen-he-thong.sql` 0.1.0: bảng tự kiểm 12/12 ĐẠT, và `kich-ban-kiem-b102.sql` 12/12 ĐẠT | *(AGY, 07/09/2026)* | b102 | Cả hai **đo sai vật**. Bảng tự kiểm chỉ hỏi *"thứ này có tồn tại không"*, không hỏi *"nó có chặn được không"*. Kịch bản kiểm tự định nghĩa lại lược đồ trong chính nó, và chạy bằng `postgres` — superuser đi vòng qua mọi RLS. Bản 0.1.0 mang **hai lỗ hổng**: ai cũng tự đặt mình thành Quản trị hệ thống, và sao lưu đêm ra file rỗng |
| `THIET-KE-NHIEU-CAY.md` mục 7: người dựng cây nhận vai **`quan_tri`** | b100 | b104 | Đo mới ra: `co_the_quan_tri()` của `08-kiem-duyet.sql` chỉ nhận đúng vai `quan_tri_he_thong`, mà `duyet_thanh_vien()`/`tu_choi_thanh_vien()` đều gác bằng hàm ấy — cấp `quan_tri` thì người dựng cây **không duyệt được đơn xin vào cây của chính mình**. `12-tao-cay.sql` cấp `quan_tri_he_thong`; không phải lỗ hổng vì vai ấy trong `tree_members` là quyền THEO CÂY, khác hẳn cờ `tai_khoan.la_quan_tri_he_thong` (toàn hệ thống) |
| `KE-HOACH.md` b103: *"máy đang dùng chưa cài PostgreSQL, bàn thử nằm ở máy kia"* | b103 | b104 | Sai — bàn thử SQL tại chỗ CÓ trên máy này (PostgreSQL 17.11, cổng 5433). Chỉ chưa ai kiểm lại trước khi viết câu ấy. Nhờ đo lại mà b104 chứng minh được đường nâng cấp thật (0.2.0 → 0.3.1, dựng nền bằng `git show`) và đường nửa vời do lần dán sáng 08/09 vấp giữa chừng |
| `12-tao-cay.sql` 0.1.0 + `THIET-KE-NHIEU-CAY.md` mục 7: *"vai cấp cho người dựng cây là `quan_tri_he_thong`, đo mới ra chứ không phải đổi ý"* | b104 | **b105** | Sai, và chủ dự án bác bỏ ngay chiều cùng ngày: *"không ai được chỉ định quyền cho chính mình; mặc định người tạo cây thì có quyền quản trị với cây đó."* Triệu chứng b104 mô tả là thật (chủ cây không duyệt được đơn của cây mình) nhưng **chỗ chữa thì sai**: nguyên nhân là `co_the_quan_tri()` hỏi MÃ VAI, trong khi thứ nó cần biết là AI LÀ CHỦ CÂY. b105 neo hàm ấy vào cột `trees.chu_so_huu`; vai cấp cho người dựng cây trở lại đúng `quan_tri`, và ràng buộc bảng nay TỪ CHỐI mã `quan_tri_he_thong` nên chuyện một chữ hai nghĩa không tái hiện được |
| `08-kiem-duyet.sql` mục 4: bảng hai hạng quản trị ngụ ý `quan_tri` là hạng bị *thu hẹp* | b97 | b105 | Bảng ấy **vốn đúng** — `quan_tri` chỉ sửa + duyệt nội dung, không đổi quyền. Chỗ thiếu là nó không nói ai mới đổi được quyền: hồi b97 hệ thống có một cây nên "chủ cây" ẩn trong mã vai. b105 tách ra thành cột `trees.chu_so_huu`. ⚠ Và `08` vẫn giữ `co_the_quan_tri()` bản CŨ (cố ý, để chạy đúng trên máy chủ chưa có `13`) — **dán lại `08` thì bắt buộc dán lại `13`** |
| `khu-thanh-vien.js` khối chú thích của `nap()`: *"BẢNG VIỆC ĐỨNG NGOÀI BẢNG, và đó là kết quả ĐO"* | b106 *(bản chưa ghim)* | **b106** | Chú thích nói đúng thiết kế, **mã thì vẫn làm kiểu cũ** — máy thứ hai tắt giữa chừng, đã tạo sẵn biến chứa mà chưa đổ gì vào. Bảng việc vẫn mở trong ô `colSpan` của cái bảng `min-width:860px`, nên việc thứ ba trở đi rơi khỏi mép màn hình; chủ dự án sửa được vai, gỡ được tài khoản, mà vẫn hỏi *"bật tắt tin cậy ở đâu?"*. 121 phép kiểm xanh suốt. **Chú thích không phải mã** — file có chú thích nói ngược với mã nguy hiểm hơn file không chú thích |
| b107 bản đầu: `xoa_tai_khoan()` **từ chối** xoá tài khoản đang làm chủ cây, đòi bàn giao trước | b107 *(cùng phiên)* | **b107** | Chủ dự án bác bỏ ngay: *"tài khoản bị xóa thường có vi phạm nhất định, yêu cầu họ bàn giao là không khả thi."* Triệu chứng mô tả là thật (`trees.chu_so_huu` khai `on delete set null`) nhưng chỗ chữa sai: **một hàng rào mà lối đi qua nó nằm trong tay chính người đang bị đuổi thì không phải hàng rào**. Nay cây sang tên trong cùng giao dịch với lệnh xoá |
| `13` mục 7 và `14` mục 9: tên người lấy bằng `coalesce(p.vn->>'name', p.id, '')` | b105 · b107 | **b109b** | `vn->>'name'` là **null ở cả 740 bản ghi** — `vn` giữ `{"gio":…, "generation":…}`, tên thật nằm ở mảng `names`. Nên cột *"Người được gắn (mã + tên)"* của khu Thành viên **chưa bao giờ hiện được một cái tên nào**: nó rơi xuống mã, rồi `khu-thanh-vien.js` thấy tên trùng mã nên giấu luôn. Không ai báo vì màn hình trông vẫn đúng, chỉ thiếu — một phép phòng thủ viết đúng đang che một lỗi ở tầng dưới. `15-tim-kiem.sql` mục 3b thêm `ten_day_du()` và dán đè cả hai hàm |
| b107, cùng ngày: *"xoá tài khoản thì xoá cả dấu vết người ấy trong `change_log`"* | b107 | **b107** | Sai, và suy từ trực giác về chữ *cascade* thay vì mở lược đồ. `change_log` giữ `by_email` là CHỮ và `user_id` là uuid rời, **không có khoá ngoại** tới `auth.users` — lịch sử ai sửa gì còn nguyên sau khi xoá tài khoản. Phép HR15m của `do-b107.mjs` nay canh đúng chỗ ấy

---

## Quy tắc giữ nhật ký gọn

- Mỗi bước một file. Bước là **một phiên làm việc có điểm dừng**.
- File bước nào chỉ ghi việc bước đó. Không nhắc lại bối cảnh chung.
- Phần **"vì sao"** dài hơn phần "làm gì". Cái "làm gì" đọc mã là ra; cái
  "vì sao" mất đi thì không đoán lại được.
- **Viết xong không sửa lại nữa.** Sau này thấy nó sai thì thêm một dòng vào
  bảng *Đính chính* ở trên, đừng sửa đè lịch sử.
- Bảng *Các bước* vượt 40 dòng thì gộp các bước của giai đoạn đã đóng thành
  một dòng tổng kết.
