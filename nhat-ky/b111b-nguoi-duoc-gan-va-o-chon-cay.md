# b111b — Cột *Người được gắn* bấm được, và ô chọn cây

*10/09/2026 17:03 · nhánh Supabase · mã xong, **`20` đã dán cả hai máy chủ**,
chưa bấm thử điểm dừng*

---

## Chủ dự án đặt gì

Ba việc, nêu 10/09/2026 khi đi tìm chỗ gắn mã người cho chính tài khoản mình:

1. Tấm **Toàn hệ thống** thêm cột *Người được gắn*, bấm vào sửa được.
2. Tấm **Tất cả** — cột ấy đã có thì cũng phải bấm sửa được.
3. Dòng *"Đang xét quyền trong: …"* đang khoá cứng vào cây đang mở → đổi
   thành **nút chọn cây**, chọn cây nào thì bảng bên dưới đổi theo cây ấy.

Cộng một câu hỏi thiết kế `KE-HOACH.md` để lại chưa trả lời, và một việc lớn
hơn hẳn mà chủ dự án nêu cùng lúc.

---

## Hai câu hỏi trả lời TRƯỚC khi viết dòng mã đầu tiên

### Câu 1 — cột xuyên cây thì sửa mã người cho cây nào?

Đây là câu `KE-HOACH.md` ghi *"trả lời câu này trước, đừng chỉnh sửa khi chưa
rõ"*. **Không cần hỏi chủ dự án**, vì đường đã có sẵn hình mẫu ngay cạnh nó:

Cột **Vai trò** ở tấm *Toàn hệ thống* cũng là một dòng tóm tắt xuyên cây, và
từ b109c nó **bấm ra bảng theo từng cây** rồi mới sửa ở đó. Cột *Người được
gắn* đi y hệt. Nên câu trả lời là **cột xuyên cây không bao giờ là chỗ sửa**:

> Nó hiện tóm tắt và mở ra bảng theo từng cây; chỗ sửa nằm trong bảng ấy, nơi
> tên cây đứng ngay bên cạnh ô đang sửa.

Cái hay của lời đáp này là **câu hỏi tự tan** — không phải đẻ ra hộp thoại
*"bạn muốn sửa cho cây nào?"*, vì lúc người ta bấm thì đã đứng trên một dòng
có tên cây rồi. Luật 5a (*không màn hình nào ngầm định cây đang mở*) giữ
nguyên mà không tốn thêm một cú bấm nào. Chép vào `THIET-KE-QUAN-TRI.md` mục
**5b điều ②**.

### Câu 2 — "chỗ đề xuất tự gắn mã người cho chính mình" là cái gì?

Câu này **phải hỏi**, vì ba cách đọc dẫn tới ba việc khác hẳn nhau, và một
trong ba phá một luật đã dựng kỹ. Luật hiện hành: không ai tự gắn mã người
cho mình — cửa thứ HAI trong bảy cửa của *không-tự-đặt-quyền-cho-mình*, vì
tự gắn mình vào một cụ tổ là mở `pham_vi_sua()` ra cả một nhánh.

Chủ dự án chọn: **đơn đề xuất, người khác duyệt.** Giữ nguyên luật, giữ
nguyên hai chữ ký, và mở đúng cái đường đang thiếu. Thành **b111c**, viết
sẵn vào `KE-HOACH.md` — không làm trong phiên này.

Chủ dự án cũng chọn để việc *"người thêm mới có thể đã có ở cây khác"* lại
cho **b113** (`persons.noi_ve`) như kế hoạch cũ, thay vì gộp vào đây.

---

## Làm gì

### Máy chủ — `luoc-do/20-nguoi-duoc-gan.sql` (mới)

`ds_tai_khoan_he_thong()` trả thêm hai cột:

- `nguoi_gan` — mảng jsonb `{treeId, tenCay, maCay, maNguoi, ten}`, **trần 3
  phần tử**, sắp theo tên cây;
- `so_cay_gan` — số **đầy đủ**.

Hai cột chứ không một, và đó là chỗ dễ làm ẩu nhất. Một con số trần trụi là
đúng thứ `15` mục 5b đã cảnh báo với `vai_cao_nhat`: *"nói một nửa sự thật mà
trông như cả sự thật"*. Người quản trị nhìn cột này để nhận ra *"à, tài khoản
này chính là cụ Bắc"* — một chữ "2" không nói được câu ấy.

Vì sao phải hỏi máy chủ chứ không ghép ở trình duyệt: `ds_cay_cua_tai_khoan()`
trả lời được, nhưng nó hỏi **một** tài khoản một lần. Vẽ ba chục dòng bằng nó
là ba chục vòng mạng cho một cái cột.

### Trình duyệt

- `sb.js` 0.17.0 — đọc hai trường mới. `Array.isArray` chứ không `|| []`: máy
  chủ chưa dán `20` trả `undefined`, và nơi nhận đọc `.length` ngay.
- `khu-thanh-vien.js` 0.10.0 — ô chọn cây; cột *Người được gắn* bấm được;
  ba mẩu mới xuất ra cho file bên cạnh dùng lại (`veONguoiGan`, `tieuDeGan`,
  `bangGanNguoi`).
- `khu-tai-khoan-he-thong.js` 0.6.0 — cột mới; ô *Người được gắn* trong bảng
  theo từng cây bấm được.

---

## Vì sao ô chọn cây làm như thế, không làm cách khác

**Nó KHÔNG đổi cây đang mở của app.** Cám dỗ là gọi luôn `chonGiaPha()` cho
"nhất quán". Nhưng khu 1 đổi cây người ta đang *làm việc* (sơ đồ, biên tập,
ảnh), còn ô này đổi cây người ta đang *xét quyền*. Gộp lại là để một cú bấm
trông như lọc một cái bảng lại im lặng đổi cả phiên — và sơ đồ ở tab bên cạnh
nhảy sang cây khác mà không ai bảo gì. Nhãn của ô tự khai: *"chỉ đổi bảng dưới
đây, không đổi gia phả đang mở"*.

**Lọc bằng `coTheXem` của MÁY CHỦ, không suy vai ở trình duyệt.** Cám dỗ thứ
hai: chỉ liệt kê cây mình làm chủ hay quản trị. Sai, và sai đúng chỗ đã có
lời cảnh báo — **chủ cây nhận quyền qua một CỘT** (`trees.chu_so_huu`), Quản
trị hệ thống qua một **CỜ**, nên phép suy từ `vaiCuaToi` khoá tay đúng hai
hạng người có quyền nhất. `co_the_xem` là câu trả lời của `co_the_xem_cay()`,
đã tính cả hai thứ ấy.

**Một cây thì vẽ CHỮ, không vẽ ô chọn.** Một danh sách thả xuống có đúng một
mục là cái nút mời bấm rồi chẳng đưa đi đâu, và nó nói sai một câu: rằng có
thứ để chọn.

**Bấm ô người mở đúng MỘT việc, không mở cả bảng năm việc.** Bấm vào cột A mà
ra bảng làm được cả năm chuyện là mời người ta đổi vai trong lúc họ đang định
gắn mã người.

---

## Ba chỗ hỏng dò ra dọc đường

### 1. `15-tim-kiem.sql` đánh rơi quyền gọi của hai hàm

`15` mục 5 **`drop` rồi dựng lại** `ds_tai_khoan_he_thong()` và
`ds_cay_cua_tai_khoan()`, nhưng mục 6 của nó chỉ cấp quyền cho ba hàm MỚI.

`drop function` **xoá cả `grant`**, và mặc định của Postgres là EXECUTE cấp
cho `public` — tức mọi vai, kể cả `anon`. Nên từ lúc dán `15` tới nay hai hàm
ấy gọi được bằng khoá `anon` công khai.

Không phải lỗ hổng dữ liệu: hàng rào thật nằm TRONG thân hai hàm
(`where public.la_quan_tri_he_thong()`), nên `anon` gọi được và nhận về mảng
rỗng. Nhưng đó là một cửa đáng lẽ đã đóng mà nay lại mở, và luật của `07` mục
8 nói thẳng: `revoke` đứng trước mọi `grant`.

`20` vá. Và phép **HR1** của `do-b111b.mjs` đo **TRƯỚC** khi dán `20` rằng
`anon` gọi được — không có phép ấy thì Q8 chỉ chứng minh `revoke` chạy, không
chứng minh nó vá một chỗ đang hở.

> **Luật rút ra, đắt hơn chỗ hỏng này:** file nào dựng lại một hàm đã có thì
> phải chép theo cả dòng `grant` của nó.

### 2. Bàn thử bác một câu tôi bịa trong chú thích SQL

Bản nháp đầu của `20` chú thích rằng `person_id` có hai hình dạng của cùng
một trạng thái *"chưa gắn"* — `''` và `null` — nên `nullif` là để dọn dòng
bẩn. Bàn thử bác ngay ở lần chạy đầu: khoá ngoại `tree_members_person_fk`
(`06` mục 3) trỏ `(tree_id, person_id)` sang `persons(tree_id, id)`, nên `''`
**bị từ chối ngay lúc ghi**. Trạng thái *"chưa gắn"* chỉ có một hình dạng duy
nhất là `null`.

Giữ `nullif` (không tốn gì, còn đúng cả khi khoá ngoại bị gỡ) nhưng **sửa lại
chú thích cho đúng sự thật**, và giữ phép Q5 để gác chiều ngược.

Phép Q5 ấy lại sập một bẫy thứ hai: nó đọc `r.ok` để biết câu lệnh có hỏng
không, nhưng **`psql` tắt `ON_ERROR_STOP` thì in câu lỗi ra stderr mà vẫn
thoát mã 0**. Phải đọc `r.loi`. Cùng họ với bài học `-c` nuốt tiếng Việt:
`psql` báo hỏng bằng **chữ**, không bằng **mã**.

### 3. ⚠⚠ Bộ ảnh đã trắng từ b111 mà không ai biết

Chụp lại 17 tấm ảnh sau khi sửa mã: **cả 17 ra nền trơn.** Đúng triệu chứng
b110b từng gặp, và `CHI-DAN.md` đã ghi sẵn lời cảnh báo sau lần ấy — *"thêm
cửa vào `sb.js` thì thêm cả ở đó"*.

Nguyên nhân **không phải b111b**: `kiem-thu/sb-gia.mjs` thiếu cửa
`chiTietKiemDuyet()` mà **b111 thêm vào `sb.js` hôm qua**. `khu-kiem-duyet.js`
`import` tên ấy; bản đồ nhập của trang giả bẻ đường sang file giả; một
`import` tên không có ném `SyntaxError` **lúc nạp mô-đun** — tức trước khi một
dòng nào kịp vẽ. Không phải khu Kiểm duyệt hỏng: **cả trang hỏng**, kể cả khu
Tài khoản chẳng liên quan gì.

Bù cửa ấy là xong triệu chứng. Nhưng chữa triệu chứng hai lần là dấu hiệu
phải chữa gốc, nên vá thêm:

**`trang-quan-tri-gia.html` nay bắt `error` và `unhandledrejection`, in ra một
khối chữ đỏ ngay đầu trang.** Chrome headless không có chỗ nào in
`console.error` ra cho người chụp đọc; một trang trắng không nói được nó trắng
vì sao, một khối chữ đỏ thì nói. Ảnh chụp lần sau sẽ mang theo câu lỗi.

---

## Nhìn bằng mắt

Bộ ảnh lên **22 tấm** — thêm 5 cảnh cho b111b, và một đường mới cho trang giả.

| Ảnh | Nhìn cái gì |
|---|---|
| kq-17 | Tấm *Tất cả*: bấm ô người của dòng thứ HAI → mở đúng MỘT việc, gọi tên cây |
| kq-18 | Tấm *Toàn hệ thống*: cột xuyên cây → bảng từng cây → ô người của dòng cây → chỗ sửa. **Đây là chuỗi trả lời câu 1** |
| kq-19 | Cùng chuỗi ấy ở 390px |
| kq-20 | **Đổi cây ở ô chọn** — bảng đổi hẳn sang danh sách cây họ Lê |
| kq-21 | Đổi cây XONG rồi mới bấm ô người → khung nói *"trong Gia phả họ Lê · LEK3P8"*, không lẻn về cây đang mở |

⚠ `?bam=` chỉ bấm được `<button>`, mà ô chọn cây là `<select>`. Nên trang giả
mọc thêm `?chonCay=<mã cây>` (lái ô chọn rồi bắn `change`) và `?bamSau=`.
Không có đường ấy thì thứ đáng nhìn nhất của cả bước — *bảng CÓ đổi theo cây
được chọn hay không* — không lọt vào tấm ảnh nào, mà nó lại đúng là loại lỗi
bất biến văn bản không bắt được.

⚠ `sb-gia.mjs` cũng phải sửa để đo được: `dsThanhVien()` trước đây **bỏ qua
`treeId`** và trả cùng một mảng cho mọi cây. Với ba tấm lọc cũ thì không sao —
chúng chỉ hỏi đúng cây đang mở. Nhưng với ô chọn cây thì ảnh trước và sau khi
đổi **giống hệt nhau**, tức cái nhìn thấy không phân biệt nổi *"đổi cây chạy
đúng"* với *"ô chọn chẳng nối vào đâu"*.

---

## Đo được gì

- `ban-thu-sql/do-b111b.mjs` — **32/32 ĐẠT**, gồm 2 phép kiểm chứng ngược
  (HR1a/HR1b: chứng minh cửa `anon` đang hở TRƯỚC khi vá).
- `/kiem-tra` — **đạt cả 9 phép**. `domains/` 10/10 file còn khớp md5 với bản
  Apps Script; `so-sanh.js` chỉ có ở Supabase, đúng chủ ý của b111.
- 22 ảnh, nhìn bằng mắt.

## Đã dán, và những gì việc dán ấy đóng lại

✓ **10/09/2026 ~17:00 — chủ dự án dán `20-nguoi-duoc-gan.sql`, bảng tự kiểm
10 mục ĐẠT hết.** Kéo theo ba món nợ đóng cùng lúc:

1. Cột *Người được gắn* ở tấm *Toàn hệ thống* có dữ liệu thật.
2. **Cửa `anon` của hai hàm `15` dựng lại đã đóng.** Nó hở từ 09/09 tới nay.
3. **Món nợ `15` 0.2.0 trả xong** — `20` mang theo cột `vai_cao_nhat`, nên
   cột *Vai trò* của tấm ấy thôi trống trơn trên máy chủ thật. Không phải dán
   `15` nữa.

⚠ Từ nay `20` là **bản đứng cuối** của `ds_tai_khoan_he_thong()`. Dán lại
`14` hay `15` là phải dán lại `20` ngay sau — `CHI-DAN.md` mục 3 giữ chuỗi ấy.

## Còn treo

- ⏳ **Chưa bấm thử điểm dừng của b111b**: tự gắn mã người cho MỘT TÀI KHOẢN
  KHÁC từ cả hai tấm, và đổi cây ở ô chọn mà không rời trang.
- ⏳ **Vẫn chưa bấm thử điểm dừng của b111** (bảng phẳng TRƯỚC/SAU). Đường
  thử không đổi: mời một email thứ hai vào cây, gắn mã người cho tài khoản
  ấy, rồi đăng nhập bằng nó để Lưu một sửa đổi thật.
- Cùng một email thứ hai ấy còn cần cho **b111c**: luật hai chữ ký nghĩa là
  đường *duyệt đề xuất* chỉ bấm thử hết được khi có **hai** Quản trị hệ thống.
