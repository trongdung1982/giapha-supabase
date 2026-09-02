# KẾ HOẠCH HẠ TẦNG — Chuyển sang Supabase

*Phiên bản 1.0.0 · Cập nhật: 24/08/2026*

> File này là một **TRỤC RIÊNG**, độc lập với `KE-HOACH_Vxx.md`. `KE-HOACH`
> đếm **giai đoạn theo tính năng** (1 và 2 đã đóng, 3 đang chạy, 5 đã có chủ
> cho `vn.generation`/`vn.branch`). File này đếm theo **đợt hạ tầng**, không
> mang số giai đoạn, để không bao giờ đụng số với trục kia dù bên nào chạy
> tới đâu.
>
> ⚠ **CHƯA KÍCH HOẠT.** Đây là kế hoạch cho tương lai, không phải việc đang
> làm. Xem "Điều kiện kích hoạt" ngay dưới đây trước khi bắt đầu bất cứ bước
> nào trong file này.

---

## Điều kiện kích hoạt

Không bắt đầu bước nào của file này cho tới khi ứng dụng hiện tại
(Apps Script + GitHub Pages + Drive JSON) đạt trạng thái **hoàn thiện**.

*(Đây là giả định của Claude để có một mốc cụ thể — cần chủ dự án xác nhận
hoặc sửa lại, xem mục "Việc phải hỏi" bên dưới.)*

- `KE-HOACH` chính đã đóng hết **Giai đoạn 3**.
- Bảng "Còn treo" của `KE-HOACH` không còn mục nào thuộc loại chặn tính năng
  cốt lõi (mục "Không chặn gì" thì được phép còn).
- App đã dùng thật với **dữ liệu thật** của dòng họ (không còn dữ liệu giả),
  ổn định qua ít nhất một chu kỳ sử dụng.

Cho tới lúc đạt mốc trên, `HIEN-PHAP` (bản đang hiệu lực tại thời điểm đó)
vẫn là luật duy nhất áp dụng cho công việc hằng ngày. File này **không sửa
đổi gì** tới `HIEN-PHAP` hiện hành — việc đó chỉ làm ở bước H10.

---

## Vì sao cần đợt hạ tầng này

Bốn nhu cầu mới, nằm ngoài phạm vi kiến trúc GAS + Drive hiện tại:

1. **Tên miền riêng `nguyentrongbac.io.vn`.** Apps Script không hỗ trợ ánh xạ
   tên miền riêng thật sự (kiểm chứng qua tra cứu 24/08/2026) — chỉ có hai
   cách né, cả hai đều hỏng: redirect thì mất tên miền trên thanh địa chỉ sau
   khi vào app; nhúng iframe thì giữ được tên miền nhưng Google chặn nhúng
   luồng đăng nhập tài khoản Google trong iframe, đúng chỗ quan trọng nhất.
2. **Phải đăng nhập mới xem được** — dữ liệu riêng tư của dòng họ.
3. **Không để công cụ tìm kiếm index trang.**
4. **Phân quyền THẬT theo nhánh/chi** — điều `PHAN-QUYEN_V03` đã nói thẳng là
   chưa làm được với cơ chế Drive-sharing hiện tại, và giai đoạn 3 của
   `KE-HOACH` chính cũng đã xác nhận không giải quyết.

---

## Quyết định đã chốt qua thảo luận

| Hạng mục | Quyết định | Vì sao |
|---|---|---|
| Nhà cung cấp | **Supabase** | Không đụng Google Cloud Console dù có lưu ảnh (Firebase bắt gói Blaze + thẻ thanh toán từ 03/02/2026 cho Cloud Storage); Postgres hợp mô hình người–hôn nhân–quan hệ hơn Firestore; mã nguồn mở, tự host được nếu cần — Firebase không có đường đó. Tài chính lành tại thời điểm tra cứu: Series F 500 triệu USD tháng 6/2026, định giá 10,5 tỷ USD, doanh thu tăng 70→170 triệu USD/năm. |
| Đăng nhập | **Email + mật khẩu** | Client ID và link gửi email đều đã bị loại. Đăng nhập Google có thể thêm SAU như lựa chọn phụ — Console nay không còn là rào cản — nhưng không phải việc của đợt đầu. |
| Hosting mặt tiền | **Giữ GitHub Pages**, thêm bản ghi CNAME trỏ `nguyentrongbac.io.vn` | Thư viện Supabase gọi bằng `<script>` thẳng từ trình duyệt — không cần Node.js/CLI mới, giữ nguyên quy trình "sửa file, đẩy GitHub". |
| Chặn index | `robots.txt` (Disallow toàn bộ) + `<meta name="robots" content="noindex, nofollow">` mọi trang | Biện pháp chuẩn, các công cụ tìm kiếm nghiêm túc tôn trọng. Riêng tư thật nằm ở chỗ dữ liệu không nằm trong file tĩnh. |
| Vai trò Apps Script | Thu hẹp còn hai việc chạy nền, không còn là mặt tiền | Xem mục riêng bên dưới. |
| Dữ liệu | Tách JSON một khối thành bảng quan hệ (người, hôn nhân/partners, quan hệ cha mẹ–con) + cột đánh dấu nhánh/chi | Bắt buộc để RLS lọc theo dòng. |

---

## Vai trò mới của Apps Script — không bỏ hẳn

| Việc cũ | Còn giữ? |
|---|---|
| Xác thực người dùng | ✗ Chuyển hẳn sang Supabase Auth |
| Phục vụ dữ liệu chính | ✗ Chuyển hẳn sang Supabase Postgres + RLS |
| Mặt tiền ứng dụng | ✗ Chuyển hẳn sang GitHub Pages |
| **Giữ sống gói miễn phí Supabase** | ✓ Trigger định kỳ 3–4 ngày, gọi một endpoint bất kỳ để tránh bị tự tạm dừng sau 7 ngày không hoạt động |
| **Sao lưu độc lập ngoài Supabase** | ✓ Trigger định kỳ đọc REST API Supabase (khóa dịch vụ lưu trong `Config.gs`), ghi ra file JSON trên Drive — đúng tinh thần các bản `giapha-*_sao-luu-*.json` đã có sẵn |

Vì không còn phục vụ web app công khai, **cấu hình triển khai
"Thực thi bằng: Người dùng truy cập ứng dụng web"** không còn cần thiết —
script mới chạy bằng trigger, không cần deploy dạng web app, không cần cấp
quyền truy cập kiểu cũ. Phần lớn nội dung mục 3 và mục 11 của `HIEN-PHAP_V05`
(cấu hình triển khai, ba việc luôn phải xin phép liên quan tới web app) sẽ hết
áp dụng cho vai trò mới, hẹp hơn nhiều này.

---

## Các bước triển khai (đề xuất thứ tự, đặt tên H để không trùng số bước của `KE-HOACH` chính)

| Bước | Việc | Đầu ra |
|---|---|---|
| **H1** | Thiết kế lược đồ quan hệ — bảng `persons`, `unions` (partners), `parent_child`, cột `branch_id`. Ánh xạ từ `CAU-TRUC-DU-LIEU_V04`, giữ đúng các quy ước đã có: không `husband`/`wife`, `iso`+`raw` song song, `deleted`+`changeLog` thay xoá cứng, và tương đương `visited` khi duyệt bằng truy vấn đệ quy SQL. | Bản `CAU-TRUC-DU-LIEU` mới, song song bản JSON cho tới khi di dời xong |
| **H2** | Tạo project Supabase. Viết chính sách RLS theo nhánh, và bảng `user_branch_access` (ai được cấp quyền ở nhánh nào) | Project Supabase sống, RLS nháp |
| **H3** | Viết `services/supabase.js` — lớp cầu nối duy nhất tới thư viện Supabase, giữ đúng tinh thần "chỉ một file được gọi ra ngoài" mà `gas.js` đang giữ | File mã mới, đúng vị trí lớp `services` |
| **H4** | Màn hình đăng nhập (email + mật khẩu), lớp `pages`. Không hiện bất kỳ dữ liệu nào cho tới khi có phiên hợp lệ | Màn hình đăng nhập |
| **H5** | Script di dời một lần: đọc JSON hiện tại, ghi vào bảng Postgres qua Supabase, kèm bước đối chiếu số lượng bản ghi trước/sau | Dữ liệu thật nằm trong Supabase, có đối chiếu |
| **H6** | Gắn tên miền: CNAME `nguyentrongbac.io.vn` → GitHub Pages, chờ HTTPS tự cấp | Tên miền riêng chạy được |
| **H7** | `robots.txt` + thẻ `noindex` trên mọi trang | Không lộ trong kết quả tìm kiếm |
| **H8** | Thu hẹp Apps Script: gỡ deploy dạng web app, viết hai trigger (giữ sống + sao lưu) | GAS chỉ còn chạy nền |
| **H9** | Kiểm chứng phân quyền RLS bằng phép thử THẬT — ít nhất hai tài khoản email khác nhau, mỗi tài khoản chỉ được cấp một nhánh, xác nhận không thấy nhánh khác. Lặp lại đúng tinh thần "ba phép thử thật" đã làm với GAS trước khi tin | Bằng chứng phân quyền hoạt động đúng, không chỉ tin theo thiết kế |
| **H10** | Viết `HIEN-PHAP` bản mới phản ánh kiến trúc đã đổi; viết `PHAN-QUYEN` bản mới mô tả RLS đã kiểm chứng | `HIEN-PHAP_V06` (hoặc số kế tiếp tại thời điểm đó), `PHAN-QUYEN` bản mới |

H1–H2 làm song song được. H9 bắt buộc đứng sau H5 và H2 (cần dữ liệu và RLS
thật để thử), và bắt buộc đứng trước H10 (không viết hiến pháp mới cho một
cơ chế chưa kiểm chứng).

---

## Việc phải hỏi chủ dự án trước khi bắt đầu bước nào

- **Định nghĩa "nhánh/chi" dùng để lọc RLS** — theo tổ tiên chung ở đời nào?
  theo trưởng chi nào? Cần quy tắc rõ trước khi thiết kế bảng ở H1.
- **Có làm thêm Đăng nhập Google song song email/mật khẩu ở đợt này**, hay để
  hẳn đợt sau?
- **Xác nhận lại mốc "hoàn thiện"** ở mục Điều kiện kích hoạt có đúng ý chủ
  dự án không — Claude chỉ đang suy đoán từ trạng thái `KE-HOACH` hiện tại.

---

## Điều phải nói thẳng, không được che

- **Ba vòng kiểm chứng phân quyền của `PHAN-QUYEN_V03` không áp dụng được cho
  hệ thống mới.** RLS là cơ chế khác hẳn, chưa được kiểm chứng thực tế lần
  nào trong dự án này — phải bắt đầu lại từ số 0 ở bước H9, kể cả khi kế
  hoạch này được viết kỹ.
- **Đây là viết lại toàn bộ tầng dữ liệu và xác thực, không phải một bản vá
  lên kiến trúc cũ.** Đừng mô tả như một nâng cấp nhỏ khi báo cáo tiến độ.
- **Tình hình tài chính Supabase (mục "Quyết định đã chốt") có hạn dùng.**
  Đây là ảnh chụp tại 24/08/2026 — tra cứu lại trước khi thật sự bắt đầu đợt
  này, nhất là nếu mốc "hoàn thiện" của app GAS còn cách xa về thời gian.
- **Gói miễn phí Supabase tự tạm dừng sau 7 ngày không hoạt động.** Nếu quên
  gắn trigger giữ sống (H8), người dùng sẽ gặp lỗi khó hiểu mà không rõ
  nguyên nhân.

---

## Liên hệ với các tài liệu khác

- Khi đợt này thật sự kích hoạt: tạo `HIEN-PHAP` bản mới (H10) phản ánh kiến
  trúc mới — **không sửa trước**, vì `HIEN-PHAP` hiện hành vẫn là luật sống
  cho công việc hằng ngày trên GAS cho tới lúc đó.
- `CAU-TRUC-DU-LIEU_V04.md` cần một bản mới mô tả lược đồ bảng quan hệ (H1),
  chạy song song bản JSON hiện tại cho tới khi di dời xong (H5).
- `PHAN-QUYEN_V03.md` cần một bản mới sau khi RLS được kiểm chứng thật (H9).
- File này nên được thêm một dòng vào `MUC-LUC`, xem gợi ý cuối phiên.
