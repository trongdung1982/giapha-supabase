# Bước 98 — trang duyệt nội dung `QuanTri.html`, và HOÀN TÁC chạy thật lần đầu

*05/09/2026 08:06*

## Việc đã làm

- **Trang duyệt nội dung**, tên `QuanTri.html` (chủ dự án chọn 04/09/2026,
  thay cho `duyet.html` trong kế hoạch cũ):
  - `QuanTri.html` + `js/app-quan-tri.js` — trang và điểm khởi động riêng,
    không kéo theo bộ vẽ sơ đồ.
  - `js/pages/quan-tri.js` 0.1.0 — bảng hàng chờ, ba tấm lọc (Chờ duyệt / Đã
    nhận / Đã gạt), mỗi dòng một lần Lưu, nút Duyệt và Gạt đi. Hỏi máy chủ
    `co_the_kiem_duyet()` trước khi vẽ, không tự suy từ `vaiTro`.
  - `js/services/sb.js` 0.2.1 → 0.3.0 — năm cửa mới:
    `coTheKiemDuyet` · `dsKiemDuyet` · `demChoKiemDuyet` · `duyetThayDoi` ·
    `tuChoiThayDoi`.
  - `js/pages/settings.js` 1.27.0 → 1.28.0 — khối "Duyệt nội dung (n)", đường
    vào trang, chỉ hiện cho hai vai quản trị.
  - `kiem-thu/kiem-trang-quan-tri.mjs` — 49 phép, đạt 49, gồm 5 phép kiểm
    chứng ngược (bẻ gãy mã có chủ ý rồi xác nhận bài kiểm bắt được).
  - `HUONG-DAN-PHAN-QUYEN.md` — thêm mục 6b, hướng dẫn bấm từng bước.

- **Nhìn bằng mắt trước khi giao**: dựng `kiem-thu/sb-gia.mjs` +
  `kiem-thu/trang-quan-tri-gia.html` ở `Claude_Code/` (ngoài repo, dùng import
  map để mã app chạy nguyên bản, không sửa gì để chiều bài kiểm), chụp Chrome
  headless ở 1100px và 500px. Bắt được hai lỗi bố cục mà bất biến không bắt
  được: hai nút Duyệt/Gạt xếp chồng làm mỗi dòng cao thêm 44px, và trên điện
  thoại cột "Việc" — cột duy nhất người duyệt đọc — bị bóp còn ~100px, chữ rơi
  mỗi dòng một từ. Cả hai đã sửa.

- **Đo HOÀN TÁC thật** — việc chặn còn lại của b97:
  - `kiem-thu/thu-hoan-tac.sql` — một file dán một lần vào SQL Editor, tự
    đóng vai một Thành viên bấm Lưu (treo cờ chờ), rồi đóng vai Quản trị bấm
    Gạt, rồi đọc lại bảng xem dữ liệu có quay về đúng bản cũ không. Hai
    nhánh: sửa một ô (phải trả giá trị cũ về) và thêm người mới (phải lấy
    người ấy đi). Tự dọn ở cuối, kể cả khi hoàn tác hỏng. Cả file là một giao
    dịch — vấp lỗi giữa chừng là Postgres trả lại toàn bộ.
  - **Chạy lần đầu 05/09/2026 vấp `tree_members_person_uniq`** — xem mục
    "Đã thử mà hỏng" dưới. Sửa xong, chạy lại **17/17 đạt trên máy chủ
    thật**: `revision 10 → 14`, 59 người không đổi, hai dòng nhật ký của phép
    thử tự dọn, vai trò tài khoản trả về đúng `quan_tri_he_thong`.

- **Bàn thử SQL tại chỗ** — `kiem-thu/ban-thu-sql/` ở `Claude_Code/` (ngoài
  repo): cài PostgreSQL 17.11 bằng `winget` (cổng 5433), dựng
  `00-gia-supabase.sql` giả lập `auth`/`storage`/ba vai của Supabase (kể cả
  `auth.uid()`/`auth.jwt()` chép đúng định nghĩa đọc `request.jwt.claims`),
  rồi `chay.mjs` dựng lại cả cơ sở dữ liệu — lược đồ `01`→`09` đúng thứ tự dán
  tay, 59 người thật từ `tai-lieu/di-doi-NTB-20260904.sql` — và chạy file SQL
  cần thử lên đó.

## VÌ SAO chọn cách này

**Vì sao trang riêng, không phải một khối trong Cài đặt.** Chủ dự án chốt
04/09/2026: việc khác nhau (vẽ sơ đồ mỗi ngày, duyệt mỗi tuần), trang sơ đồ
nạp cả cây còn hàng chờ chỉ là một câu hỏi tới `change_log`, và bảng cần bề
ngang mà lớp phủ Cài đặt (tối đa 600px) không cho.

**Vì sao dựng bản giả để nhìn bằng mắt, thay vì tin bộ kiểm văn bản.** Bộ kiểm
đọc chữ chứng minh được mã đúng khuôn, không chứng minh được bảng đọc nổi.
Ba bằng chứng trong dự án này đã dạy điều đó (`kiem-bo-tri-hinh-phai-nhin-bang-mat`
trong ký ức): bất biến bắt được "sai", không bắt được "hợp lệ mà xấu". Dùng
import map thay vì sửa mã app để nó "biết mình đang bị kiểm" — sửa mã cho vừa
bài kiểm là làm bài kiểm nói dối về mã thật.

**Vì sao phải đo hoàn tác bằng cách chạy thật, không tin bộ kiểm văn bản của
b97.** `kiem-kiem-duyet.mjs` tự nói rõ trong ghi chú đầu file: nó không chạy
SQL, không chứng minh câu SQL *chạy được*, chỉ chứng minh nó *viết đúng
khuôn*. Trang `QuanTri.html` vừa đặt một nút đỏ lên đúng đường ấy, nên khoảng
cách giữa "có mã hoàn tác" và "hoàn tác được" từ nay có hậu quả thật — đúng
loại khoảng cách giữa "có file sao lưu" và "khôi phục được" mà dự án đã từng
nhắc.

**Vì sao mượn danh nghĩa tài khoản bằng `set_config('request.jwt.claims', …,
true)` thay vì đăng nhập thật.** SQL Editor không mang danh nghĩa ai —
`auth.uid()` rỗng — và b94 đã đo đúng điều đó. `set_config` với `is_local =
true` đặt giá trị chỉ trong phạm vi giao dịch hiện tại, đúng những gì
PostgREST làm khi nhận một JWT thật. Không phải lỗ hổng: ai vào được SQL
Editor thì vốn đã có toàn quyền.

**Vì sao cài hẳn PostgreSQL trên máy thay vì chỉ tin bộ kiểm văn bản mãi mãi.**
Một lần vấp thật (xem mục dưới) đủ để thấy: đọc mã kỹ tới đâu cũng không thay
được việc chạy nó. Từ nay mọi file SQL chạy qua bàn thử trước khi tới tay chủ
dự án — đổi thứ tự "hỏng ở đâu" từ *dữ liệu thật của cả dòng họ* sang *một
bản sao trên máy*.

## Đã thử mà hỏng

**`thu-hoan-tac.sql` bản đầu chọn "người đem ra thử" là gốc cây
(`trees.root_person_id`).** Chạy thật lần đầu (chủ dự án dán) vấp:

```
ERROR: 23505: duplicate key value violates unique constraint "tree_members_person_uniq"
DETAIL: Key (tree_id, person_id)=(ae0c44f5-…, P0012) already exists.
```

**Lý do hỏng:** `P0012` là gốc cây — và cũng là người **dễ đã có tài khoản
gắn vào nhất**. Tài khoản thử `thu-h9@nguyentrongbac.io.vn` của b94 đang giữ
đúng người ấy, chưa ai dọn (đã ghi ở "Còn treo" từ b94). Ràng buộc
`tree_members_person_uniq` (mỗi người chỉ gắn được một tài khoản) nổ ngay khi
phép thử đòi gắn quản trị hệ thống vào cùng người.

**Nếp rút ra:** chọn "gốc cây" cho một phép thử tưởng là lựa chọn an toàn
(chắc chắn có thật, chắc chắn nằm trong trực hệ của mọi người) — thật ra nó
là lựa chọn **tệ nhất**, đúng vì lý do khiến nó có vẻ an toàn: người quan
trọng nhất cây là người dễ đã bị chiếm dụng nhất. Bản sửa không đụng
`person_id` nếu tài khoản đã gắn ai, và nếu chưa gắn thì tự tìm một người
**chưa ai gắn** (`not exists (select 1 from tree_members where person_id =
p.id)`).

**Không mất gì** — cả file là một lệnh `do`, Postgres trả lại toàn bộ giao
dịch khi vấp lỗi giữa chừng. Đây chính là lớp bảo vệ số 4 đã viết sẵn trong
ghi chú đầu file, và nó chạy đúng như thiết kế ngay trong lần vấp đầu tiên.

## Còn treo

- ⚠ **Trang duyệt chưa xem được TRƯỚC/SAU từng ô.** `ds_kiem_duyet()` không
  trả cột `truoc` (nó nặng), nên người duyệt đọc câu `note` và số bản ghi bị
  đụng, không đọc được giá trị cũ/mới từng ô.
- ⚠ **Tài khoản thử `thu-h9@nguyentrongbac.io.vn` vẫn đang giữ `P0012` và đã
  duyệt.** Treo từ b94, và chính nó là nguyên nhân của lần vấp ở mục trên.
  Đáng gỡ.
- Chưa bấm thử app trên cây 681 người thật (mốc cũ từ b89).
- Bàn thử SQL tại chỗ (`kiem-thu/ban-thu-sql/`) chứng minh SQL chạy đúng,
  KHÔNG chứng minh trình duyệt/PostgREST đi đúng cửa — nó không có bộ đăng
  nhập thật.

## File đã đụng tới

**Mới:**
- `supabase/QuanTri.html`
- `supabase/js/app-quan-tri.js`
- `supabase/js/pages/quan-tri.js`
- `supabase/kiem-thu/kiem-trang-quan-tri.mjs`
- `supabase/kiem-thu/thu-hoan-tac.sql`
- `Claude_Code/kiem-thu/sb-gia.mjs` *(ngoài repo)*
- `Claude_Code/kiem-thu/trang-quan-tri-gia.html` *(ngoài repo)*
- `Claude_Code/kiem-thu/ban-thu-sql/00-gia-supabase.sql` *(ngoài repo)*
- `Claude_Code/kiem-thu/ban-thu-sql/10-gieo-cay.sql` *(ngoài repo)*
- `Claude_Code/kiem-thu/ban-thu-sql/20-gieo-thanh-vien.sql` *(ngoài repo)*
- `Claude_Code/kiem-thu/ban-thu-sql/chay.mjs` *(ngoài repo)*

**Sửa:**
- `supabase/js/services/sb.js` (0.2.1 → 0.3.0)
- `supabase/js/pages/settings.js` (1.27.0 → 1.28.0)
- `supabase/HUONG-DAN-PHAN-QUYEN.md`
- `supabase/KE-HOACH.md`
- `Claude_Code/MAY-THU-HAI.md` *(ngoài repo)*

**Chép nguyên:** (không có)

**Xoá:** (không có)
