# Bước 91 — Sao lưu bỏ hẳn khoá bí mật, chuyển sang vai `sao_luu` chỉ-đọc

*04/09/2026 06:08 · Nhánh Supabase · máy `LapAMD`*

---

## Làm gì

- Cài `gh` CLI trên máy thứ hai (`LapAMD`), đăng nhập `trongdung1982`; cập
  nhật `MAY-THU-HAI.md` 1.0.0 → 1.2.0.
- Dựng sao lưu thật lần đầu **và thất bại** — xem phần *"Đã thử mà hỏng"*.
- Viết `luoc-do/05-sao-luu.sql`: thêm vai `sao_luu` chỉ-đọc, mở đúng ba chỗ
  RLS từng chặn, thêm hàm `ds_tai_khoan()`, thêm luật liệt kê kho ảnh.
- `sao-luu/SaoLuu.gs` 0.1.0 → 0.2.0: thêm `dangNhap_()`, đổi `goiTho_` sang
  khoá công khai + phiếu, đổi `docNguoiDung_` sang gọi hàm SQL, **đảo chiều**
  phép kiểm khoá trong `docCauHinh_()`.
- `kiem-thu/kiem-sao-luu.mjs` 29 → **33 phép**, tất cả đạt.
- Viết lại `sao-luu/HUONG-DAN-SAO-LUU.md` — 7 bước thành 9 bước.

## VÌ SAO — phần đáng đọc nhất của bước này

### Bức tường: hai luật đụng nhau, không bên nào nhường

Sao lưu bản 0.1.0 dùng **khoá bí mật**, và lý lẽ chọn nó hoàn toàn đúng:
`02-rls.sql` cho mỗi người chỉ đọc phần của mình ở `user_settings` và
`branch_access`, nên một tài khoản thường đi sao lưu sẽ chép thiếu **trong im
lặng** — Postgres không báo lỗi, nó chỉ trả về ít dòng hơn.

Nhưng lúc dựng thật thì không chạy nổi, và mất một buổi mới hiểu vì sao:

- **Supabase chặn khoá `sb_secret_…` khi `User-Agent` trông giống trình
  duyệt.** Câu lỗi nguyên văn:
  `{"message":"Forbidden use of secret API key in browser"}`.
- **Apps Script luôn gửi** `Mozilla/5.0 (compatible; Google-Apps-Script; …)`,
  và **Google không cho đổi** dòng ấy. Đây là giới hạn nền tảng, đã tra tài
  liệu để chắc, không phải thứ sửa được bằng mã.

Nghĩa là `sb_secret_…` **không bao giờ** dùng được từ Apps Script — dù khoá
đúng, dù `curl.exe` gọi được `200 OK` từ chính máy ấy.

### Vì sao KHÔNG đi đường vòng bằng khoá `service_role` đời cũ

Đường vòng có sẵn: khoá `eyJ…` không có phép kiểm này. Chủ dự án đã được đề
nghị đúng thứ tự *"chạy tạm bằng `eyJ` tối nay, làm đường bền sau"* — và
**bác bỏ**, chọn làm đường bền ngay. Đúng, vì:

- Supabase **khai tử khoá `service_role` cuối 2026**, còn khoảng ba tháng.
- Dùng nó là hẹn trước ngày hỏng, ngay vào lúc dữ liệu thật vừa vào bảng.

Và một điều nữa, ghi lại vì tôi đã suýt lấy nó làm áp lực sai chỗ: **app đang
xây dựng, chưa có người dùng, dữ liệu toàn là giả.** Nên "chưa có sao lưu"
không phải việc khẩn — không có gì để mất. Đúng lúc ấy thì thứ đáng chọn là
**làm cho bền**, không phải làm cho nhanh.

### Cách giải: đừng tìm chìa vạn năng, hãy mở đúng ổ khoá

Chỗ sai của 0.1.0 không phải "chọn nhầm loại khoá" mà là **hình dạng của lời
giải**: nó đi tìm một cái chìa vượt qua được toàn bộ phân quyền, trong khi
việc thật sự cần chỉ là đọc thêm ba chỗ.

`05-sao-luu.sql` mở đúng ba chỗ ấy, không hơn một ly:

| Chỗ RLS từng chặn | Mở thế nào |
|---|---|
| `branch_access` | thêm `sao_luu` vào vế `vai_tro(tree_id) in (…)` |
| `user_settings` | thêm một `policy` SELECT **riêng**, không đụng luật `for all` cũ |
| `auth.users` | hàm `ds_tai_khoan()` `security definer`, thay cửa Admin API |
| *(+ liệt kê kho ảnh)* | `policy` SELECT trên `storage.objects` |

Rồi `SaoLuu.gs` **đăng nhập bằng email + mật khẩu** với khoá công khai — loại
khoá sinh ra để lộ, không bị phép kiểm trình duyệt chặn, không có hạn dùng.

### Vì sao cách mới CHẶT HƠN, không phải đánh đổi

Đây là điều dễ hiểu ngược, nên viết rõ: nghe thì "hạ từ khoá bí mật xuống tài
khoản thường" giống như nới lỏng. Thật ra ngược lại.

- Khoá bí mật **vượt toàn bộ RLS**: cầm nó là đọc được **và ghi được** mọi
  thứ, ở mọi cây, mãi mãi.
- Vai `sao_luu` thì `co_the_sua()` = `role in ('chu','sua')` → `false`, mà cửa
  ghi duy nhất `luu_cay()` hỏi đúng hàm ấy. Nên nó **không ghi được một dòng
  nào**, kể cả khi mật khẩu lọt ra ngoài.
- `co_the_sua_nguoi()` cũng rơi vào `when vai_tro <> 'sua' then false`. Đã đọc
  kỹ thân hàm để chắc nó **không** rơi xuống `else true` — chính file
  `02-rls.sql` cảnh báo về cái bẫy ấy, và vai mới không dính.
- Thu quyền lại bằng một câu `delete from tree_members where role='sao_luu'`.

### Vì sao ba phép kiểm mới, và chúng canh cái gì

Ba phép thêm vào không kiểm "chạy đúng không" — chúng canh **thiết kế khỏi bị
đảo ngược** bởi người sau (kể cả tôi ở phiên sau):

1. *dán nhầm khoá BÍ MẬT → chặn ngay, không gọi mạng lần nào* — phép này ở bản
   cũ có nghĩa **ngược lại**, và việc nó đảo chiều chính là chỗ dễ bị "sửa lại
   cho giống cũ" nhất.
2. *không còn LỆNH gọi `/auth/v1/admin/`* — cửa ấy bắt buộc khoá bí mật; còn
   sót một lượt gọi là cả thiết kế vô nghĩa.
3. *thiếu mật khẩu → chặn trước khi chạm mạng* — để câu lỗi là tiếng Việt chỉ
   đúng ô phải điền, không phải câu lỗi của Supabase.

Phép 2 lúc đầu viết sai: nó soi cả **dòng ghi chú**, nên đỏ chỉ vì
`docNguoiDung_` có nhắc lại tên cửa cũ để kể vì sao bỏ nó. Sửa thành lọc bỏ
dòng ghi chú trước khi soi — đúng quy ước `/kiem-tra` (*"chú thích nhắc tên thì
không tính"*). Nhưng phép soi **khoá** thì cố ý **không** lọc ghi chú: repo để
Public, nên một cái khoá nằm trong ghi chú vẫn là khoá đã lên mạng.

## Đã thử mà hỏng

| Thử gì | Hỏng thế nào | Nếp rút ra |
|---|---|---|
| Dán khoá `sb_secret_…` vào `KHOA_BI_MAT`, chạy `kiemTraKetNoi` | `Khoá bị từ chối` | Câu lỗi **tự nó dẫn sai đường**: nó bảo đi kiểm khoá, mà khoá đúng |
| Xoá property, dán lại thật cẩn thận | Vẫn y nguyên | Lặp lại một thao tác đã đúng không phải là chẩn đoán |
| `curl` trong PowerShell | `Cannot bind parameter 'Headers'` | PowerShell có `curl` riêng (alias `Invoke-WebRequest`). Phải gõ **`curl.exe`** |
| `curl.exe` từ chính máy ấy | **`200 OK`** | Đây là lúc bài toán đổi hẳn: khoá đúng, máy vào được — vậy khác biệt nằm ở *người gọi* |
| Đặt tên hàm dò lỗi là `doLoi_` | Không hiện trong ô chọn hàm | Apps Script **giấu mọi hàm kết thúc bằng `_`** khỏi ô chọn. Hàm để bấm tay thì đừng có gạch dưới ở cuối |

**Nếp lớn nhất của cả bước:** khi một câu lỗi chỉ vào cấu hình mà cấu hình
kiểm mãi vẫn đúng, thì **đừng kiểm lại lần thứ ba** — hãy chạy cùng một lệnh
gọi từ **một chỗ khác** (ở đây là `curl.exe` trên máy thật). Chênh lệch giữa
hai chỗ mới là dữ kiện, chứ lặp lại ở một chỗ thì không sinh thêm thông tin
nào. Ba vòng thử đầu tiên đã mất trắng vì làm ngược điều này.

**Nếp thứ hai:** câu lỗi đoán mò về nguyên nhân thì **tai hại hơn câu lỗi thô**.
`goiTho_` bản cũ ánh xạ mọi mã 401/403 thành *"kiểm KHOA_BI_MAT có bắt đầu
bằng sb_secret_ không"* mà **không in thân phản hồi** — trong khi thân phản hồi
của Supabase nói thẳng `Forbidden use of secret API key in browser`. Bản 0.2.0
luôn in kèm câu máy chủ nói.

## Còn treo

- **Chưa ai dựng sao lưu lên thật.** Mã và SQL xong, chủ dự án chưa chạy —
  khoảng 30 phút, 9 bước ở `HUONG-DAN-SAO-LUU.md`. Không gấp: dữ liệu còn giả.
- **`05-sao-luu.sql` chưa chạy trên Supabase thật.** Viết theo lược đồ đã đọc
  kỹ, bộ kiểm không chạm được SQL. Lỗi cột `vn` ở b89 đã cho thấy SQL chỉ
  chứng minh được bằng cách chạy.
- Chưa ai thử **khôi phục** từ file sao lưu.
- Sao lưu vẫn **không chép ảnh**, chỉ liệt kê.
- Dự án Apps Script chủ dự án tạo tối 03/09 đang mang **mã 0.1.0** và property
  `KHOA_BI_MAT`. Phải dán lại mã mới và sửa lại bốn property.

## File đã đụng tới

**Mới**

- `supabase/luoc-do/05-sao-luu.sql`
- `supabase/nhat-ky/b91-sao-luu-bo-khoa-bi-mat.md`

**Sửa**

- `supabase/sao-luu/SaoLuu.gs` — 0.1.0 → 0.2.0
- `supabase/kiem-thu/kiem-sao-luu.mjs` — 0.1.0 → 0.2.0, 29 → 33 phép
- `supabase/sao-luu/HUONG-DAN-SAO-LUU.md` — viết lại, 9 bước
- `supabase/KE-HOACH.md` — mục 1 viết lại, thêm dòng b91, gỡ mục hạn chót 2026
- `supabase/DU-LIEU.md` — mục 8 thêm vai `sao_luu` kèm chú thích
- `supabase/nhat-ky/INDEX.md` — thêm một dòng
- `CLAUDE.md`, `MAY-THU-HAI.md` *(ngoài repo)* — máy `LapAMD` đã cài xong

**Chép nguyên / xoá:** không có.
