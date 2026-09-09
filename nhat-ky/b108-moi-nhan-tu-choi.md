# b108 — Mời vào gia phả chạy thật: Nhận/Từ chối ngay màn hình khởi động

*09/09/2026 08:55*

## Việc đã làm

- Chủ dự án dán `luoc-do/14-loi-moi.sql` (bản 0.1.0, viết ở b107) lên **cả
  hai Supabase**. Vá thêm bản **0.2.0** trong chính phiên này (mục 6b): thêm
  nhánh `duocmoi` vào `trang_thai_cua_toi()` — hàm màn hình khởi động của app
  thường gọi, khác hẳn `ds_gia_pha()` mà trang Quản trị dùng.
- `sb.js` 0.8.0: ba hàm mới `moiVaoCay()` · `nhanLoiMoi()` · `tuChoiLoiMoi()`;
  `layDanhSachGiaPha()` đọc thêm ba cột `duocMoi`/`moiVai`/`emailNguoiMoi`;
  `layPhien()` mang thêm bốn trường khi `trangThai === 'duocmoi'`.
- `khoi-dong.js` 0.11.0: nhánh `duocmoi` đứng TRƯỚC nhánh `cho` — người được
  mời mở app thường thấy ngay nút Nhận/Từ chối, không phải tự mò vào trang
  Quản trị.
- `khu-gia-pha.js` 0.5.0 → 0.5.1: cột **Mời** (chủ cây · Quản trị hệ thống)
  gọi `moiVaoCay()` qua một form tại chỗ (email · mã người · vai); cột *Cây
  làm việc* thêm nhánh `duocMoi` — Nhận/Từ chối thay cho Xin quyền.
- Chủ dự án bấm thử **trên máy chủ thật** (không phải bàn thử): xác nhận cả
  hai chiều Nhận/Từ chối chạy đúng, và nút Mời hoạt động. Đo ra một chỗ thiếu
  (ô mã người) — vá ngay trong phiên (0.5.1).
- Thêm 2 phép đo HR5g/h vào `kiem-thu/ban-thu-sql/do-b107.mjs` (ngoài repo)
  cho nhánh `duocmoi` — **61/61 ĐẠT**.

## VÌ SAO chọn cách này

**Vì sao vá `trang_thai_cua_toi()` thay vì chỉ sửa `ds_gia_pha()`.** Hai hàm
phục vụ hai màn hình khác hẳn nhau: `ds_gia_pha()` nuôi trang Quản trị
(`QuanTri.html`), `trang_thai_cua_toi()` nuôi màn hình khởi động của app
THƯỜNG (`index.html`, nơi cả dòng họ mở mỗi ngày). b107 chỉ sửa hàm đầu, và
điểm dừng thật của b108 ("mời một tài khoản thật → đăng nhập, thấy lời mời")
đòi hỏi đúng chỗ họ **thật sự đăng nhập** — tức app thường — phải biết nói
"được mời", không phải "đơn đang chờ duyệt". Đây chính là câu "Còn hở, cố ý"
ghi lại ở `KE-HOACH.md` từ b107.

**Vì sao nhánh `duocmoi` đứng TRƯỚC nhánh `cho`, ở cả hai file (SQL và
`khoi-dong.js`).** Một dòng `tree_members` chưa duyệt (`approved=false`) có
thể là ĐƠN XIN VÀO hoặc LỜI MỜI — chỉ khác nhau ở `moi_luc is not null`. Đặt
nhầm thứ tự (kiểm `cho` trước) thì nhánh `duocmoi` không bao giờ chạy tới,
đúng kiểu lỗi "viết đúng mã, sai thứ tự if" mà mắt thường không bắt được nếu
không đọc kỹ.

**Vì sao vá bằng cách sửa `14-loi-moi.sql` tại chỗ (bump 0.1.0 → 0.2.0) thay
vì đẻ file `15` mới.** Đây là đúng một tính năng ("mời vào gia phả"), chỉ
thiếu một hàm nó lẽ ra phải sửa cùng lúc. Tách ra file riêng thì hai file
luôn phải dán cùng nhau mà không có gì nhắc — rủi ro y hệt bài học `06→07→08`
đã ghi ở đầu `14`. Bù lại, đã thêm rõ cảnh báo "dán lại `10` thì bắt buộc dán
lại `14`" vào đầu file, đúng khuôn cảnh báo đã có sẵn cho `11`.

**Vì sao đo bằng tay trên bàn thử trước khi đẩy vào `do-b107.mjs`.** Muốn
chắc hàm mới không tự lộ ra lỗi kiểu RLS-chặn-câu-truy-vấn-của-chính-phép-đo
(bài học đã ghi sẵn ngay trong `do-b107.mjs`, hằng số `NTB` không được là câu
`select` lồng). Đo tay bắt được đúng bẫy ấy một lần nữa (xem mục dưới) trước
khi viết thành phép tự động.

**Vì sao thêm ô "Mã người trong sơ đồ" vào form Mời ngay trong phiên, không
để dồn sang b109.** `moi_vao_cay()`/`moiVaoCay()` đã nhận tham số này từ b107
— thiếu nó ở màn hình là bỏ sót một tham số máy chủ đã có sẵn, không phải
việc mới cần thiết kế. Khác hẳn "ô tìm/gợi ý thật" (autocomplete) — cái đó
cần một hàm tìm kiếm MỚI ở máy chủ và đụng đúng ranh giới kiến trúc
`THIET-KE-QUAN-TRI.md` mục 1 ("`QuanTri.html` cố ý KHÔNG nạp cây gia phả"),
nên dời sang b109 để bàn kỹ hình dạng hàm trước khi viết.

## Đã thử mà hỏng

- **Phép thử tay đầu tiên dùng UUID `44444444-...` cho tài khoản mời** —
  trùng với tài khoản mẫu `qtri@thu.local` đã gieo sẵn trong bàn thử
  (`do-b107.mjs`), nên `insert` báo `0 rows` (đụng khoá chính) và
  `moi_vao_cay()` báo "chưa có tài khoản" vì tìm sai email. Không phải lỗi
  của mã — đổi sang UUID `59595959-...` chưa dùng ở đâu là hết. **Nếp rút
  ra:** bàn thử này đã có SẴN năm tài khoản mẫu cố định
  (`chu`/`thuh9`/`thanhvien`/`qtri`/`duocmoi`@thu.local) — kiểm trước khi bịa
  UUID mới cho phép thử tay, đừng đoán một dải số "chắc còn trống".
- **Phép thử tay thứ hai gọi `nhan_loi_moi((select id from trees where
  tree_code='NTB'))` dưới danh nghĩa `role authenticated` của chính người
  được mời** — báo "Không có lời mời nào", dù dòng mời có thật. Nguyên nhân:
  câu `select` con ấy chạy DƯỚI DANH NGHĨA người được mời, đi qua RLS của
  bảng `trees` — người chưa nhận lời chưa đọc được `trees`, nên câu con trả
  `null`, hàm nhận `p_tree = null`. **Đúng y hệt cái bẫy đã ghi sẵn trong
  chú thích đầu `do-b107.mjs`** ("MÃ CÂY PHẢI LÀ HẰNG SỐ, KHÔNG PHẢI CÂU
  SELECT LỒNG VÀO") — tôi đọc chú thích ấy, hiểu nó, rồi vẫn viết đúng cái
  bẫy nó cảnh báo khi viết phép thử tay ngoài file `.mjs`. **Nếp rút ra:**
  bài học không tự động áp dụng chỉ vì đã đọc — phải áp lại thủ công mỗi lần
  viết phép thử mới, kể cả phép thử "chỉ để kiểm tra nhanh".

## Còn treo

- **b109 — Khu Tài khoản Toàn hệ thống + bảng sâu, cộng ô tìm/gợi ý thật cho
  Mời.** `ds_tai_khoan_he_thong()` và `ds_cay_cua_tai_khoan()` đã có sẵn ở
  `14`, chưa hàm nào lộ ra màn hình. Ô tìm/gợi ý cho mã người cần một hàm
  tìm kiếm MỚI (tìm theo tên/mã trong một cây cụ thể) — đụng đúng ranh giới
  "`QuanTri.html` không nạp cây gia phả", phải bàn hình dạng hàm trước khi
  viết. Xem `KE-HOACH.md` mục b109.
- Chuỗi bước sau b108 dồn thêm một nấc: xoá gia phả (từng là b109) nay là
  **b110**, kiểm duyệt bảng phẳng → **b111**, khu Sao lưu → **b112**, mã
  người xuyên cây → **b113**. Đã sửa cả `KE-HOACH.md` và nhãn số bước sai
  trong `THIET-KE-NHIEU-CAY.md` mục 6 (từng ghi nhầm "(b108)").
- Câu hỏi treo từ b109 cũ (nay b110): ai gọi `don_thung_rac()` — nút bấm tay
  hay trigger Apps Script đêm? Chưa hỏi chủ dự án.

## File đã đụng tới

**Sửa:**
- `supabase/luoc-do/14-loi-moi.sql` — 0.1.0 → 0.2.0, thêm mục 6b
  (`trang_thai_cua_toi()` nhánh `duocmoi`) + dòng tự kiểm thứ 6.
- `supabase/js/services/sb.js` — 0.7.0 → 0.8.0.
- `supabase/js/pages/khoi-dong.js` — 0.10.0 → 0.11.0.
- `supabase/js/pages/quan-tri/khu-gia-pha.js` — 0.4.0 → 0.5.1.
- `supabase/KE-HOACH.md` — đóng mục b108, tách b109 mới, dồn số b110→b113.
- `supabase/CHI-DAN.md` — cập nhật dòng trạng thái mục 3 (vẫn 80 dòng).
- `supabase/THIET-KE-NHIEU-CAY.md` — sửa hai nhãn số bước sai (mục 6, và một
  chỗ trong đoạn "ai gọi `don_thung_rac()`").

**Ngoài repo (không lên git, xem `CLAUDE.md` bảng thư mục):**
- `Claude_Code/kiem-thu/ban-thu-sql/do-b107.mjs` — 0.1.0 → 0.2.0, thêm phép
  HR5g/h cho nhánh `duocmoi`.
