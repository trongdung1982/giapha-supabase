# Bước 104 — Tạo gia phả mới

*08/09/2026 16:15*

## Việc đã làm

- `luoc-do/12-tao-cay.sql` (mới): ràng buộc `unique` trên `trees.tree_code`,
  và hàm `tao_gia_pha_moi(p_ten, p_ma_cay, p_note)` — `security definer`, đẻ
  `trees` + `tree_members` trong **một giao dịch**, hàng rào quyền
  `duoc_tao_cay()` đứng trước mọi phép kiểm hình dạng.
- `services/sb.js` 0.6.0: hàm `taoGiaPhaMoi()` gọi RPC. `services/repo.js`
  0.3.0: `taoGiaPhaMoi()` thôi trả `'chualam'`, dùng lại `sinhMaCay()` của
  `utils/id.js` để gợi ý mã.
- `js/pages/quan-tri/khu-gia-pha.js` 0.4.0: nút *+ Dựng gia phả mới*, hộp
  nhập tên/mã/ghi chú, mã tự gợi ý rồi thôi tự điền khi người dùng gõ tay,
  dựng xong có đường sang `index.html` để thêm người đầu tiên.
- **Quy tắc mã cây đổi** (`utils/id.js` 1.3.0, chủ dự án chốt): phần phân
  biệt từ 4 ký tự xen kẽ chữ–số (`NTBK7R3`) sang **3 chữ số** (`NPG473`).
- Sửa hai câu trong `import-export.js` còn nói "Google Drive" cho đường dựng
  cây — nay ghi đúng "máy chủ".
- Cập nhật `THIET-KE-NHIEU-CAY.md` (vai cấp cho người dựng cây) và
  `KIEN-TRUC.md` (mục 6 — bỏ "Dựng gia phả mới" khỏi danh sách chưa làm).
- Đo: `kiem-thu/ban-thu-sql/do-b104.mjs` (ngoài repo) **38/38 ĐẠT**, 3 phép
  kiểm chứng ngược. `kiem-thu/kiem-tao-cay.mjs` (mới, trong repo) **33/33**.

## VÌ SAO chọn cách này

**Vai cấp cho người dựng cây là `quan_tri_he_thong`, không phải `quan_tri`
như `THIET-KE-NHIEU-CAY.md` mục 7 đã viết.** Ba phép đo dẫn tới chỗ lệch:
`co_the_quan_tri()` của `08-kiem-duyet.sql` chỉ nhận đúng một vai
(`quan_tri_he_thong`), mà `duyet_thanh_vien()`/`tu_choi_thanh_vien()` đều
gác bằng hàm ấy — cấp `quan_tri` thì người dựng cây **không duyệt được đơn
xin vào cây của chính mình**, đúng chỗ b104 sinh ra để mở. Hai cây đang chạy
và bộ sinh SQL di dời của b100 đều đã cấp `quan_tri_he_thong`. Không phải lỗ
hổng: vai ấy trong `tree_members` là quyền **theo cây** — mọi nơi hỏi nó đều
qua `vai_tro(p_tree)`. Quản trị toàn hệ thống đọc ở chỗ khác hẳn
(`tai_khoan.la_quan_tri_he_thong`). Đã đo: `do-b104.mjs` HR4, người vừa dựng
cây riêng đọc cây `NTB` ra 0 dòng.

**Bàn thử SQL tại chỗ hoá ra CÓ trên máy này** — `KE-HOACH.md` b103 ghi
ngược (PostgreSQL 17.11, cổng 5433). Nhờ đó đo được hai việc b103 chưa đo:
đường nâng cấp `11-quyen-he-thong.sql` từ 0.2.0 (bản máy chủ thật đang chạy,
lấy từ `git show <commit>:...`) lên 0.3.1 — trót lọt, kèm phép kiểm chứng
ngược là bản 0.3.0 lên cùng nền ném đúng `42P13`; và đường **nửa vời** —
sáng 08/09 lần dán 0.3.0 ném lỗi giữa chừng nên máy chủ thật có thể đang ở
trạng thái hàm mới đã vào mà `ds_gia_pha()` còn bản cũ — 0.3.1 chữa được cả
hai đường.

**Đổi mã cây từ 4 ký tự xen kẽ sang 3 chữ số, theo yêu cầu chủ dự án**, và
đo ra một lỗ hổng thật trước khi đổi: bộ đếm mã tìm `[PUMS]` + từ 4 chữ số
trở lên. Mã cây 4 số mà viết tắt kết thúc bằng P/U/M/S (rất dễ gặp với tên
Việt: *Phúc, Phú, Sơn, Minh, Uyên*) tự khớp khuôn mã bản ghi — thử với
`LVS1234` thì bộ đếm nguồn nhảy từ `S0003` lên `S1235`. Ba số thì không bao
giờ đủ dài để khớp. Vá bằng cấu trúc, không bằng lời dặn — đúng tinh thần
bản cũ chỉ đổi cách làm. Hai mã đã cấp (`NTB`, `NPGQ8C9`) giữ nguyên: mã đã
cấp thì không đổi.

**Một lỗ hổng thật thứ hai, tìm ra khi so hai khuôn mã cây.** Ràng buộc của
`01-bang.sql` (`tree_code_hop_le`) nhận gạch dưới và số mở đầu; khuôn của
`utils/id.js` (`KHUON_MA_CAY`) thì không nhận cả hai. Mã lọt qua khe ấy
(`LE_BN`, `1LE`) làm `maCayCuaCay()` coi như cây không có mã, nên người thêm
mới trong cây đó nhận mã đời cũ không tiền tố — lặng lẽ. Hàng rào ở
`12-tao-cay.sql` nay đi theo khuôn hẹp của `utils/id.js`, có phép kiểm canh
(PHẦN B của `kiem-tao-cay.mjs`).

**`kiem-tao-cay.mjs` bỏ chú thích trước khi soi văn bản** — ba phép đầu
HỎNG oan vì đi tìm sự vắng mặt của `chualam`/`duoc_tao_cay`/`confirm()` mà
cả ba chuỗi ấy có mặt trong chính những dòng chú thích giải thích vì sao
chúng không được dùng. Thêm `boGhiChuJs()` (chỉ cắt dòng mở đầu bằng
`//`/`/*`/`*`, không đụng `//` giữa dòng để không cắt nhầm `https://`).

## Đã thử mà hỏng

- **`taoCay()` trong `do-b104.mjs` gọi hàm hai lần** (lần hai để nhặt luôn
  `lyDo` khi từ chối) — với người CÓ quyền, lần thứ hai dựng thật một cây
  thứ hai, làm phép đếm số cây sai 3 → 4. Sửa: gọi đúng một lần, đo `lyDo`
  riêng ở nhánh chắc chắn thua (HR5).
- **Kỳ vọng sai `HR3d`: nghĩ mã người luôn mang tiền tố mã cây** (mong đợi
  `LEBN_P0001`, đo ra `P0001`). Đọc dữ liệu di dời (`P0001…P0681`, không mã
  nào có tiền tố) rồi kết luận về hành vi app là **đo nhầm vật**: bảng đó
  chứa mã ĐỜI CŨ giữ nguyên từ di dời, không phải mã app sinh ra. Sửa dữ
  liệu thử để gửi mã có tiền tố như app thật gửi, và ghi lại bài học vào cả
  ba nơi (SQL, phép đo, README trong đầu file) để không ai lặp lại.
- **`/kiem-tra` phép 6 quét `head -8`** khi rà tay các file — bốn file có
  dòng `Phiên bản` ở dòng 9–11 (vì `Lớp`/`Phụ thuộc` dài) bị báo thiếu oan.
  Không phải lỗi mã, chỉ là lỗi phép rà thủ công; bộ kiểm thật của
  `/kiem-tra` không giới hạn số dòng.

## Còn treo

- ⚠ `js/pages/chon-gia-pha.js` vẫn không còn lối vào nào (từ b103) — chưa
  xoá, chờ chủ dự án cho phép.
- `kiem-thu/kiem-ma-cay.mjs` (ngoài repo) vẫn đo bản `giapha/js/utils/id.js`
  — nhánh đóng băng, không đổi theo b104. Từ hôm nay hai bản `utils/id.js`
  **lệch nhau lần đầu** (chỉ ở `phanPhanBiet()`). Bản mới do `kiem-tao-cay.mjs`
  PHẦN D gác. Không sửa `kiem-ma-cay.mjs` vì nó không thuộc repo này.
- b105 (Thành viên & quyền, tầng máy chủ) là việc kế tiếp theo `KE-HOACH.md`.
- Chưa ai bấm thử trên app thật: hai file SQL đã dán (chủ dự án xác nhận),
  nhưng nút *Dựng gia phả mới* chưa ai bấm trên `nguyentrongbac.io.vn`.

## File đã đụng

**Mới:** `luoc-do/12-tao-cay.sql` · `kiem-thu/kiem-tao-cay.mjs` ·
`../kiem-thu/ban-thu-sql/do-b104.mjs` *(ngoài repo)*.

**Sửa:** `js/services/sb.js` 0.6.0 · `js/services/repo.js` 0.3.0 ·
`js/pages/quan-tri/khu-gia-pha.js` 0.4.0 · `js/pages/import-export.js`
1.7.1 · `js/utils/id.js` 1.3.0 · `THIET-KE-NHIEU-CAY.md` · `KIEN-TRUC.md`.
