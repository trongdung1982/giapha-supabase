# b111 — Bảng phẳng TRƯỚC/SAU khi mở rộng một dòng chờ duyệt

*10/09/2026 14:20*

## Việc đã làm

- `luoc-do/19-kiem-duyet-chi-tiet.sql` — hàm `chi_tiet_kiem_duyet(p_tree, p_id)`.
  Đọc lại `change_log.truoc` (đã có sẵn từ `08`), rồi với mỗi bản ghi bị đụng
  tra thêm dòng **hiện tại** trong bảng thật làm "sau". Không thêm cột nào lên
  `change_log`. Trả kèm `biKhoa` — cùng câu trả lời `dung_do_sau()` đã tính
  cho `tu_choi_thay_doi()`, để màn hình biết sớm có ai đã sửa tiếp hay chưa.
- `js/domains/so-sanh.js` (**file MỚI** — không sửa dòng nào trong mười file
  `domains/` cũ, đúng luật `BAT-DAU.md` mục 1). Hàm thuần `bangPhang(banGhi)`
  xếp kết quả trên thành mảng `{loai, nhanLoai, nguoi, truong, truoc, sau}`,
  chỉ giữ những Ô THẬT SỰ ĐỔI (áp `CLAUDE.md` mục 7: trường trống ở cả hai
  đầu không ra dòng).
- `js/services/sb.js` 0.16.0 — thêm `chiTietKiemDuyet(treeId, id)`, một RPC
  mỏng, cùng nếp `dsKiemDuyet()`.
- `js/pages/quan-tri/khu-kiem-duyet.js` 0.3.0 — mỗi dòng hàng chờ có thêm nút
  "Xem chi tiết", tải một lần, vẽ bảng phẳng ngay dưới dòng. Nếu `biKhoa` có
  giá trị thì khoá luôn nút "Từ chối" kèm lý do hiện ngay trong bảng — không
  đợi người duyệt bấm rồi mới nghe máy chủ từ chối.
- Bộ đo mới: `kiem-thu/ban-thu-sql/do-b111.mjs` (ngoài repo, ở `Claude_Code/
  kiem-thu/ban-thu-sql/`) — 21 phép trên bàn thử Postgres tại chỗ. `supabase/
  kiem-thu/kiem-so-sanh.mjs` — 23 phép Node cho `so-sanh.js`, không cần
  Supabase.
- `/kiem-tra` chạy lại: đạt cả 9 phép (10 file `domains/` vẫn khớp md5 với
  `giapha/`, vì `so-sanh.js` là file thứ 11 chỉ riêng nhánh này).
- Đẩy GitHub: `trongdung1982/giapha-supabase` nhánh `main`, commit `e0a169d`.
- Chủ dự án đã tự dán `19-kiem-duyet-chi-tiet.sql` lên Supabase thật.

## Vì sao chọn cách này

**Không thêm cột `sau` lên `change_log`.** `sau` chính là dòng đang nằm
trong bảng hôm nay — đọc lại là đủ, không có gì phải lưu thêm. Cách này còn
cho một tác dụng phụ đúng ý: nếu có người sửa tiếp SAU lần Lưu đang xem, cột
SAU tự động phản ánh đúng trạng thái mới nhất (không phải trạng thái tại lúc
lần Lưu này diễn ra) — đúng điểm dừng chủ dự án đặt ra ("cột SAU nói rõ đó là
trạng thái hôm nay").

**`so-sanh.js` không thêm bảng nhãn trường vào `config.js`.** Nhãn tiếng Việt
cho từng cột Postgres (`occupation` → "Nghề nghiệp"…) chỉ dùng ở đúng một
màn hình, nên đặt làm hằng số cục bộ trong chính file mới — không sửa file
nào khác, đúng luật "dựng bản gọn nhất trước".

**"Xem chi tiết" là một dòng `<tr>` RIÊNG với dòng lý do từ chối**, không
dùng chung một `<tr>`. Hai nội dung khác nhau và có thể cùng mở một lúc:
xem chi tiết là để ĐỌC, ô lý do là để BẤM Từ chối. Gộp chung thì bấm "Xem chi
tiết" xong muốn Từ chối sẽ xoá mất bảng đang đọc.

**Chỉ tải chi tiết MỘT LẦN mỗi dòng, lúc bấm, không tải trước cho mọi
dòng.** `ds_kiem_duyet()` (mục mã cũ) cố ý không trả `truoc` vì nó nặng —
tải trước cho toàn bảng là đi ngược đúng lý do ấy.

## Đã thử mà hỏng

**Bàn thử SQL: quên `grant` cho vai `authenticated`.** `00-gia-supabase.sql`
không cấp quyền bảng như Supabase thật tự cấp sẵn — thiếu dòng `grant` thì
mọi `luu_cay()` ném "permission denied for table trees", không liên quan gì
tới b111. Nếp cũ (đã có ở `do-b107.mjs`) nhưng bản đầu của `do-b111.mjs` quên
chép lại.

**`jsonb_populate_recordset` với JSON thiếu trường → cột `null`, không phải
default.** Gọi `luu_cay()` bằng tay (không qua trình duyệt) mà chỉ gửi
`{id, occupation}` thì mọi cột `not null` khác nhận `null` thẳng, ném lỗi
ràng buộc — đúng bẫy `hinh-dang.js` đã ghi ("BẢNG MẶC ĐỊNH"). Phải đọc nguyên
dòng thật rồi chỉ đổi một trường trước khi gửi.

**Nhúng JSON thẳng vào chuỗi SQL mà không escape dấu nháy đơn.** `P0020`
mang một ghi chú dài có dấu nháy đơn thật (`di-doi-NTB-20260904.sql`) — nhúng
`JSON.stringify(...)` vào giữa `'…'::jsonb` không escape thì câu SQL đứt
giữa chuỗi, và triệu chứng ("máy chủ trả 'true' nhưng không ghi gì") trông
y hệt lỗi hoàn toàn khác: hoá ra là do **truyền nhầm tham số** cho `nhuAi()`
khiến `commit;` không bao giờ được thêm vào — kịch bản tự đọc lại chính dòng
nó vừa ghi TRONG CÙNG một giao dịch nên vẫn thấy `ok:true`, rồi lặng lẽ
`rollback`. Sửa bằng hàm `jsonbLit()` escape dấu nháy, và bỏ tham số thừa.

**`x is null` hỏi SQL NULL, không hỏi JSON null.** `'null'::jsonb is null`
tự nó đã ra `false` — phép đo Q4.1/Q5.1 viết sai kiểu hỏi, không phải hàm SQL
sai. Sửa bằng `jsonb_typeof(x) = 'null'`, đúng quy ước `03`/`08` đã dùng.

**Nếp rút ra: mọi phép SQL đo qua tài khoản mượn danh (`nhuAi`/`hoi`) phải
ĐÚNG đi qua `hoi(...)`, không được gọi thẳng bằng `sql(...)`** — gọi thẳng là
chạy dưới vai `postgres`, không có `auth.uid()`, nên mọi hàm hỏi quyền
(`co_the_kiem_duyet()`) đều thấy "không ai đăng nhập" và trả `false` một
cách hợp lệ, làm phép đo tưởng nhầm là hàm SQL hỏng.

## Còn treo

**Chưa bấm thử điểm dừng thật của b111** trên Supabase thật ("chọn một lần
Lưu thật, thấy đúng từng ô trước → sau"; "dựng cảnh xung đột, nút hoàn tác
mờ kèm lý do"). Đi tìm cách tạo một lần Lưu "chờ duyệt" thật thì lộ ra
**b111b** — xem `KE-HOACH.md`.

**b111b — mới, chủ dự án nêu khi thử b111**: khu "Tài khoản & quyền" thiếu
chỗ TỰ gắn mã người cho chính mình (cố ý khoá, đúng luật), và tab Toàn hệ
thống chưa có cột "Người được gắn", và dòng "Đang xét quyền trong: …" đang
khoá cứng vào cây đang mở thay vì cho chọn cây. Chi tiết đầy đủ, kèm câu hỏi
thiết kế cần trả lời trước khi viết mã, đã ghi trong `KE-HOACH.md`.

## File đã đụng tới

- **Mới**: `luoc-do/19-kiem-duyet-chi-tiet.sql` · `js/domains/so-sanh.js` ·
  `kiem-thu/kiem-so-sanh.mjs` · `../kiem-thu/ban-thu-sql/do-b111.mjs`
  (ngoài repo)
- **Sửa**: `js/services/sb.js` (0.15.0 → 0.16.0) · `js/pages/quan-tri/
  khu-kiem-duyet.js` (0.2.0 → 0.3.0) · `KE-HOACH.md`
- **Chép nguyên**: không có
- **Xoá**: không có
