# KẾ HOẠCH — nhánh Supabase

*Cập nhật 04/09/2026 17:00 · Bước gần nhất: **b95***

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

**Việc kế tiếp: b94/b95 — kiểm duyệt nội dung** (việc 4), và **duyệt đăng ký
tài khoản** (việc 5, chủ dự án chốt cuối buổi 04/09).

⚠ *Hôm nay dữ liệu trong bảng là dữ liệu giả và app chưa có người dùng nào, nên
không có gì khẩn ở đây — thứ tự các bước là vì đúng trình tự, không phải vì
đang có rủi ro nào treo trên đầu.*

**Hai mươi việc đã đóng** — đếm theo đúng số dòng của bảng ngay dưới, đừng
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
| **Luật phân quyền TRỰC HỆ — chốt, cài, bộ kiểm 57 phép** | **b93** | ✓ **04/09/2026** — ⚠ chủ dự án chưa dán |

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

## Việc kế tiếp — ĐÚNG THỨ TỰ NÀY

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

⚠ **Chưa ai MỞ APP xem cây 59 người ấy vẽ ra đúng chưa.** Bảng đối chiếu chứng
minh dữ liệu vào đủ, không chứng minh app đọc ra và vẽ được. Đó là việc bấm
tay, thuộc phép thử H9 ngay dưới.

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
4. **Ghi thẳng vào REST bị chặn** — kể cả với vai `chu`. ⚠ Thử bằng trình
   duyệt KHÔNG chứng minh được điều này, vì app luôn đi qua `luu_cay()`.
   Muốn biết cửa sau có khoá không thì phải thật sự đẩy thử cửa sau.
5. `revision` chặn ghi đè khi hai người sửa cùng lúc

Bắt buộc đứng **trước** khi viết bất cứ tài liệu nào mô tả phân quyền như đã
chạy.

⚠ `PHAN-QUYEN_V03` ghi ba vòng kiểm chứng của bản Drive. **Chúng không áp dụng
được cho RLS** — cơ chế khác hẳn, chưa kiểm chứng lần nào trong dự án này. Bắt
đầu lại từ số 0.

</details>

### 4. Kiểm duyệt nội dung (b94 + b95) — ĐÃ CHỐT THIẾT KẾ, CHƯA VIẾT

Chủ dự án chốt 04/09/2026, sau khi luật trực hệ đã xong: **mọi nội dung sửa
đều gắn cờ tạm, admin duyệt rồi mới thành chính thức.**

Ba điều chủ dự án nói rõ, và cả ba đổi thiết kế so với bản nháp đầu của tôi:

1. **Dữ liệu chưa duyệt VẪN GHI THẲNG vào Supabase.** Không dựng kho chờ
   riêng. App chạy bình thường; admin lúc nào rảnh thì vào xem — đạt thì
   nhận chính thức, không đạt thì xoá.
2. **Trang duyệt là một trang HTML ĐỘC LẬP**, ngoài trang vẽ sơ đồ, duyệt
   dạng **bảng**.
3. **Hai hạng admin**: một hạng can thiệp được hệ thống, một hạng chỉ kiểm duyệt.

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
| `chu` | ghi thẳng | ✓ | ✓ |
| `admin` *(kiểm duyệt)* | ghi thẳng | ✓ | ✗ |
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

- **b94** — tầng máy chủ: cột mới, `luu_cay()` chụp `truoc` và đặt cờ,
  `duyet_thay_doi()` / `tu_choi_thay_doi()`. Admin duyệt tạm bằng SQL.
- **b95** — `duyet.html`: trang độc lập, bảng, mỗi dòng một lần Lưu.

### 5. Đăng ký tài khoản phải QUA DUYỆT — ✓ MÃ XONG 04/09/2026 (b95), CHỜ DÁN

**Đã viết:** `luoc-do/07-duyet-dang-ky.sql` (bốn hàm mới, `approved` nay gác cả
quyền đọc) · `services/sb.js` 0.2.0 · màn hình *"Xin vào gia phả"* và *"Đơn của
bạn đang chờ duyệt"* trong `pages/khoi-dong.js` 0.9.0 · khối **Đơn chờ duyệt**
trong màn Cài đặt (`pages/settings.js` 1.25.0) · bộ kiểm
`kiem-thu/kiem-duyet-dang-ky.mjs` **40 phép, đạt 40**, có kiểm chứng ngược.

⚠ **Còn lại đúng một thao tác: dán `07-duyet-dang-ky.sql`.** Từng bước ở
`HUONG-DAN-PHAN-QUYEN.md` mục 7. Chưa dán thì màn hình xin vào bấm sẽ báo lỗi
vì hàm chưa tồn tại ở máy chủ.

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
| ~~Hai file SQL phân quyền chưa ai dán~~ — ✓ **đã dán 04/09/2026 13:20**, đối chiếu khớp | `HUONG-DAN-PHAN-QUYEN.md` |
| ⚠ **Chưa có màn hình duyệt thành viên** — duyệt bằng `update` trong SQL Editor | `HUONG-DAN-PHAN-QUYEN.md` mục 3 |
| ⚠ **Tài khoản thử `thu-h9@…` chưa dọn** — đang gắn `P0012`, đã duyệt | `nhat-ky/b94-phep-thu-h9.md` |
| ⚠ **`07-duyet-dang-ky.sql` chưa ai dán** — mã xong, hàng chờ chưa chạy | `HUONG-DAN-PHAN-QUYEN.md` mục 7 |
| ⚠ **Bộ bất biến bố cục đang gác nhầm nhánh** — xem ngay dưới bảng | `/kiem-tra` phép 9 |
| ⚠ **Sao lưu KHÔNG chép ảnh** — chỉ liệt kê. Ảnh vẫn nằm đúng một chỗ | `KIEN-TRUC.md` mục 7 |
| ⚠ **Chưa ai thử KHÔI PHỤC từ file sao lưu** — có file khác với khôi phục được | `sao-luu/HUONG-DAN-SAO-LUU.md` |
| ⚠ **Chưa bấm thử app trên cây 681 người** — bộ kiểm chạy trên cây 59 người, và lỗi `vn` của b89 lộ ra ở app thật chứ không lộ ở bộ kiểm | `nhat-ky/b89` |
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
