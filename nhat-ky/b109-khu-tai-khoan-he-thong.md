# b109 — Khu Tài khoản: tấm lọc *Toàn hệ thống* + bảng sâu

*09/09/2026 11:35*

## Đã làm

- `sb.js` 0.9.0: bốn cầu nối còn thiếu xuống bốn hàm SQL đã dán sẵn từ
  b107–b108 mà chưa có màn hình nào gọi — `dsTaiKhoanHeThong` ·
  `dsCayCuaTaiKhoan` · `datQuanTriHeThong` · `xoaTaiKhoan`.
- File mới `khu-tai-khoan-he-thong.js` 0.1.0: tấm lọc thứ tư của khu Tài
  khoản, chỉ Quản trị hệ thống thấy. Vẽ sổ đăng ký bảy cột (kể cả người chưa
  vào gia phả nào), và bảng sâu theo từng tài khoản với bốn việc: xem/sửa
  từng cây (gọi lại năm việc của `13`) · mời thẳng vào một cây · bật/tắt cờ
  Quản trị hệ thống · xoá hẳn tài khoản.
- `khu-thanh-vien.js` 0.3.0: thêm tấm lọc thứ tư vào hàng lọc có sẵn; sáu hàm
  việc (`veBangViec`, `viecDoiVai`, …) đổi tham số từ nhận cả `phien` sang
  nhận thẳng `treeId` — không đổi hành vi, chỉ đổi hình dạng, để file mới gọi
  lại được chúng theo TỪNG cây thay vì chỉ cây đang mở.
- `14-loi-moi.sql` 0.2.1: thêm `drop function if exists` trước hai hàm trả
  bảng (`ds_tai_khoan_he_thong`, `ds_cay_cua_tai_khoan`) — bài học 42P13.
  Không đổi hành vi, không bắt buộc dán lại bản đã có trên máy chủ.
- `kiem-trang-quan-tri.mjs` 0.4.0: PHẦN I mới (33 phép), cộng G12/G13 bẻ gãy
  có chủ ý hai thứ dễ hỏng nhất của bước này — chép việc sang bản thứ hai,
  và vòng import tĩnh hai chiều. 121 → 154 phép, tất cả đạt.
- Vá hai thứ bắt gặp trên đường, ngoài repo:
  - `kiem-thu/sb-gia.mjs` (bản giả `sb.js` để nhìn bằng mắt) thiếu ba cửa
    Mời của b108 (`moiVaoCay`/`nhanLoiMoi`/`tuChoiLoiMoi`) — trang giả đã
    TRẮNG HẲN từ hôm qua mà không ai biết, vì thiếu một tên `import` là lỗi
    lúc nối, trước khi dòng mã đầu tiên chạy. Vá lên 0.3.0, thêm dữ liệu giả
    cho bốn cửa mới.
  - `trang-quan-tri-gia.html` + `xem-khung-quan-tri.mjs`: thêm cơ chế `?bam=`
    — bấm lần lượt nhiều nút, mỗi nút CHỜ nó xuất hiện rồi mới bấm (khác
    `?mo=` cũ, chỉ bấm một nút ngay). Cần vì chuỗi thao tác của b109 đi qua
    nhiều nhịp có gọi máy chủ ở giữa (đổi tấm lọc → nạp mô-đun động → đọc
    bảng cây), hẹn giờ cố định là chụp hụt.
- Chủ dự án bấm thử trên máy chủ thật (Supabase thật, qua máy chủ tại chỗ
  phục vụ file) — xác nhận đạt: bấm một tài khoản trong tấm lọc Toàn hệ
  thống, đúng số cây, cả bốn việc chạy.

## VÌ SAO chọn cách này

**Chia b109 làm hai ngay đầu phiên**, thay vì làm trọn cả việc chủ dự án đã
liệt kê (gồm cả ô tìm/gợi ý cho form Mời). Ô tìm/gợi ý cần một hàm SQL MỚI ở
máy chủ, và hàm ấy mở một khe qua đúng ranh giới `THIET-KE-QUAN-TRI.md` mục 1
— *"`QuanTri.html` cố ý KHÔNG nạp cây gia phả"*. Trộn nó vào cùng phiên với
phần thuần trình duyệt là vừa phải bàn thiết kế vừa phải vẽ bảng, và không có
điểm dừng rõ ràng nào ở giữa. Chủ dự án đồng ý chia, phần còn lại đứng tên
**b109b**.

**File mới thay vì viết thêm vào `khu-thanh-vien.js`.** Khu đó đã 908 dòng.
Ba tấm lọc đầu và tấm thứ tư trả lời hai câu khác hẳn nhau — *"ai có quyền
trong CÂY NÀY"* và *"sổ đăng ký của cả phần mềm"* — nên chúng gọi hàm khác,
vẽ bảng khác cột. Tách file thì mỗi file còn đọc được; cái giá là thêm một
file đi lên mạng (repo Public) và `khung.js` phải nạp đúng chỗ. Chủ dự án
chọn phương án này khi được hỏi.

**`import()` động một chiều, không phải tĩnh hai chiều.** File mới cần dùng
lại năm việc của `13` (`veBangViec`, `viecDoiVai`, …) — đó là chủ ý, "không
hàm việc nào phải viết mới" chính là điều làm bước này nhỏ. Nhưng dùng lại
nghĩa là file mới phải `import` từ `khu-thanh-vien.js`; nếu chiều ngược lại
(file cũ nạp file mới) cũng là `import` tĩnh thì đó là một vòng, và vòng
import trong ES Modules gốc không ném lỗi lúc nạp — nó để một hàm thành
`undefined` và chỉ vỡ ra lúc ai đó bấm đúng nút gọi hàm ấy. Dùng `import()`
động ở chiều nạp-vào (chỉ khi người dùng thật sự mở tấm lọc thứ tư) cắt đứt
vòng, và còn có lợi thứ hai: không tải một file chỉ một hạng người dùng được
cho tất cả người quản trị gia phả.

**`duocDoiQuyen: true` cứng khi gọi lại năm việc của `13`, không hỏi lại
từng cây.** `co_the_quan_tri()` trả `true` cho Quản trị hệ thống ở MỌI cây,
mà chỉ Quản trị hệ thống mở được tấm lọc này — hỏi lại là N vòng mạng để
nhận N lần cùng một câu trả lời đã biết trước. Hàng rào thật nằm trong thân
bảy hàm SQL của `13`, không nằm ở cờ này; cờ chỉ để mờ nút cho lịch sự.

**Sáu dòng dữ liệu giả trong `sb-gia.mjs`, mỗi dòng một ca bố cục dễ vỡ** —
tiếp tục đúng lối đã dùng cho `TAI_KHOAN` ở b106: đủ ba con số · email dài
chưa xác nhận chưa đăng nhập · chính người xem mang cờ QTHT · tài khoản sao
lưu bị từ chối xoá · đăng ký rồi bỏ đấy 0 cây · đang làm chủ một cây. Không
dựng đủ sáu ca thì ảnh chụp không bắt được gì cả — một dòng thì mọi cột đều
"trông ổn".

## Đã thử mà hỏng

- **Bảng ngoài để `min-width:980px`.** Ảnh chụp 1280px đầu tiên (kq-7) cho
  thấy cột nút *Mở* rơi khỏi mép — khu chỉ rộng ~925px thật sự vì thanh trái
  ăn mất 230px, con số 1280 trên giấy không nói ra điều đó. Hạ xuống 880 thì
  vừa. **Nếp rút ra: đo bằng ảnh chụp đúng bề ngang, đừng suy từ con số cửa
  sổ** — đã ghi ở memory, và đây là lần thứ N nó lặp lại đúng cách b106 từng
  gặp.
- **Nút mờ "Chờ họ bấm Nhận" trên dòng lời mời.** Viết thêm một nút disabled
  để "nhất quán" với cột thao tác — ảnh chụp cho thấy nó thừa: cột *Đứng ở
  đâu* ngay bên cạnh đã nói đúng câu ấy. Bỏ nút, để ô thao tác trống.
- **154 phép văn bản đều xanh trong lúc cả ba chỗ hỏng bố cục trên còn
  nguyên.** Không phép nào trong PHẦN I bắt được — đúng giới hạn đã ghi ở
  đầu `kiem-trang-quan-tri.mjs`: bộ này gác "không sai", không gác "xấu
  nhưng hợp lệ". Chỉ bộ ảnh chụp mới bắt được, và phải NHÌN, không phải chạy
  bất biến rồi tin.
- **Trang giả trắng hẳn không một câu lỗi**, phát hiện khi định dùng nó để
  kiểm b109: `sb-gia.mjs` vẫn ở 0.2.0, thiếu ba cửa Mời b108 đã thêm hôm
  qua. `import` một tên không tồn tại là lỗi lúc NỐI mô-đun — xảy ra trước
  dòng mã đầu tiên, nên màn hình trắng hoàn toàn, console có lỗi nhưng
  không ai nhìn console. Đúng chuyện `sb-gia.mjs` đã tự cảnh báo trong ghi
  chú đầu file của chính nó ("thiếu chúng thì trang giả KHÔNG MỞ ĐƯỢC") —
  và nó vẫn xảy ra, vì phiên trước quên cập nhật file ngoài repo.

## Còn treo

- **b109b — ô tìm/gợi ý thật cho form Mời.** Cần bàn hình dạng một hàm tìm
  kiếm mới ở máy chủ trước khi viết (tìm có lọc · giới hạn số dòng ·
  `security definer` gác đúng quyền xem cây), và một câu chưa trả lời: ô
  email lọc trong `ds_tai_khoan_he_thong()`, chỉ Quản trị hệ thống gọi được
  — chủ cây thường sẽ không có gợi ý nào, hạ quyền hay viết hàm riêng?
- b110 (thùng rác cây), b111 (kiểm duyệt trước/sau), b112, b113 — chưa động,
  đã có kế hoạch ở `KE-HOACH.md`.

## File đã đụng tới

**Sửa:** `sb.js` · `khu-thanh-vien.js` · `luoc-do/14-loi-moi.sql` ·
`kiem-thu/kiem-trang-quan-tri.mjs` · `CHI-DAN.md` · `KE-HOACH.md` ·
`THIET-KE-QUAN-TRI.md`.

**Mới:** `js/pages/quan-tri/khu-tai-khoan-he-thong.js`.

**Ngoài repo, sửa** *(không đi lên mạng theo `git push` của nhánh này)*:
`../kiem-thu/sb-gia.mjs` · `../kiem-thu/trang-quan-tri-gia.html` ·
`../kiem-thu/xem-khung-quan-tri.mjs`.

**Chép nguyên:** không có.

**Xoá:** không có.
