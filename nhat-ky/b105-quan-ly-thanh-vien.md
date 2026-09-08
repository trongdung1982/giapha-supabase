# b105 — Thành viên & quyền, tầng máy chủ

*08/09/2026 · 16:34 → 18:02 · Claude Code CLI (Opus 5)*

> Bước này bắt đầu bằng việc **chủ dự án bác bỏ một quyết định của b104**, và
> phần lớn giá trị của nó nằm ở chỗ ấy chứ không nằm ở sáu hàm SQL.

---

## 1. Làm gì

| File | Việc |
|---|---|
| `luoc-do/13-quan-ly-thanh-vien.sql` | **mới, 885 dòng.** 6 hàm quản trị + 2 hàm hỏi nhỏ, cộng di dời dữ liệu quyền |
| `luoc-do/12-tao-cay.sql` | **0.2.0** — người dựng cây nhận `quan_tri`, thôi nhận `quan_tri_he_thong` |
| `luoc-do/08-kiem-duyet.sql` | thêm cảnh báo *"dán lại file này thì phải dán lại `13`"*. **Mã không đổi** |
| `di-doi/sinh-sql-di-doi.mjs` | **0.2.0** — cấp `quan_tri`, tự đặt `trees.chu_so_huu` |
| `kiem-thu/kiem-quan-ly-thanh-vien.mjs` | **mới — 55 phép, 6 kiểm chứng ngược** |
| `kiem-thu/kiem-di-doi.mjs` · `kiem-tao-cay.mjs` | sửa hai phép ghim vào hành vi cũ |
| `../kiem-thu/ban-thu-sql/do-b105.mjs` | **mới, ngoài repo — 53 phép, 4 kiểm chứng ngược** |
| `../kiem-thu/ban-thu-sql/chay.mjs` | **0.3.0** — thêm `12`; `13` **cố ý không thêm** |
| `THIET-KE-NHIEU-CAY.md` · `CHI-DAN.md` | mục 7 sửa lại, mục 11.3 mới; bảng định tuyến |

**Sáu hàm**: `ds_thanh_vien` · `doi_vai_thanh_vien` · `gan_nguoi_cho_thanh_vien`
· `dat_tin_cay_thanh_vien` · `go_thanh_vien` · `doi_chu_cay`.
**Hai hàm hỏi nhỏ**: `la_chinh_minh` · `la_chu_cay`.

✓ **Chủ dự án đã dán và xác nhận đạt, 08/09/2026.**

---

## 2. Vì sao — phần đáng giữ nhất

### 2.1 · Cái sai của b104 không nằm ở kết luận, nó nằm ở chỗ chữa

Sáng 08/09, b104 cấp người dựng cây vai `quan_tri_he_thong` trong
`tree_members`, lệch khỏi `THIET-KE-NHIEU-CAY.md` mục 7 và mục 11. Lý do tôi
ghi lúc ấy nghe rất có lý:

> `co_the_quan_tri()` chỉ nhận đúng một vai là `quan_tri_he_thong`, mà
> `duyet_thanh_vien()` gác bằng hàm ấy. Cấp `quan_tri` thì người dựng cây
> **không duyệt được đơn xin vào cây của chính mình**.

Chiều hôm ấy chủ dự án bác bỏ:

> *"tôi nghĩ rằng không ai được chỉ định quyền cho chính mình. mặc định người
> tạo cây thì có quyền quản trị với cây đó."*

**Triệu chứng tôi mô tả là có thật. Chỗ tôi chữa thì sai.** Người dựng cây
không duyệt được đơn không phải vì họ mang vai thấp — mà vì **hàm quyết quyền
đang hỏi nhầm chỗ**: nó hỏi *mã vai*, trong khi thứ nó cần biết là *ai là chủ
cây*. Tôi nâng vai để triệu chứng biến mất, và làm thế là kéo một mã vai mang
chữ *"hệ thống"* vào một bảng chỉ nói chuyện từng cây.

Nếp rút ra, và nó tổng quát hơn một dòng SQL: **khi phải nâng quyền cho một
thứ để nó chạy được, hãy nghi ngờ chính cái hàng rào chứ đừng nghi ngờ cái
quyền.** Hàng rào hỏi sai câu thì mọi cách chữa ở phía "quyền" đều là nới ra.

### 2.2 · Gốc rễ: một chữ mang hai nghĩa, và nó có ngày sinh

| Chữ `quan_tri_he_thong` nằm ở đâu | Nghĩa |
|---|---|
| `tai_khoan.la_quan_tri_he_thong` *(b102)* | Quản trị hệ thống **thật** — mọi cây |
| `tree_members.role` *(b97)* | Chủ của **đúng một** cây |

Hai nghĩa ấy **trùng nhau hồi b97** (04/09) vì lúc đó hệ thống có đúng một
cây: "chủ cây" và "quản trị hệ thống" là cùng một người, đặt chung một tên
không ai thấy vướng. b102 (07/09) tách chúng ra, **nhưng cái tên trong bảng
thì không ai đổi.** b104 vấp vào đúng khe hở ba ngày tuổi ấy.

Đây là loại nợ không hiện ra trong `git diff` nào: không dòng mã nào sai vào
ngày nó được viết, chỉ có nghĩa của một chuỗi trôi đi dưới chân nó.

### 2.3 · Vì sao neo vào CỘT, không neo vào VAI

`co_the_quan_tri()` nay là:

```sql
select public.la_quan_tri_he_thong()
    or coalesce((select t.chu_so_huu = auth.uid()
                   from public.trees t where t.id = p_tree), false);
```

Được bốn thứ, và ba trong số đó không phải mục tiêu ban đầu:

1. **Mỗi cây có ĐÚNG MỘT người đổi được quyền.** Không có cảnh hai quản trị hạ
   vai lẫn nhau, cũng không có cảnh người được mời phụ việc chiếm cây.
2. **Chủ cây không tự phong mình được** — họ đã là chủ, và cột ấy chỉ
   `doi_chu_cay()` đổi được.
3. **`tree_members` chỉ còn ba vai đọc lên hiểu ngay**: quản trị gia phả ·
   thành viên · khách.
4. **Ràng buộc của bảng nay TỪ CHỐI mã `quan_tri_he_thong`** — nên chuyện một
   chữ hai nghĩa không tái hiện được. Đây là phần đắt nhất của bước, và nó
   không sửa một hàm nào: nó biến một điều cấm ghi trong tài liệu (mà ai cũng
   có thể quên) thành một điều **cơ sở dữ liệu không cho làm**.

### 2.4 · Luật "không tự đặt quyền cho mình" phải gác NĂM cửa, không một cửa

Chủ dự án nói *"quy tắc không được đặt quyền cho chính bản thân"*. Nếu đọc
lướt thì đó là một câu về **đổi vai**. Đo kỹ thì nó là câu về năm cửa, và hai
trong số đó không ai gọi là "quyền":

| Cửa | Tự làm cho mình thì leo thang kiểu gì |
|---|---|
| `doi_vai_thanh_vien` | tự nâng vai — cửa hiển nhiên |
| **`gan_nguoi_cho_thanh_vien`** | tự gắn mình vào một cụ tổ → `pham_vi_sua()` mở ra **cả cây** |
| **`dat_tin_cay_thanh_vien`** | tự bật *tin cậy* → **ghi thẳng, bỏ qua kiểm duyệt** |
| `go_thanh_vien` | vô hại, nhưng chặn để luật chỉ có một câu |
| `doi_chu_cay` | tự nhận cây của người khác về tên mình |

Hai cửa in đậm là chỗ đáng tiền: chúng **không đổi một chữ nào trong cột
`role`**, không có gì trên màn hình đổi màu, và người đọc mã đi tìm chữ
*"quyền"* sẽ không dừng lại ở chúng.

**Luật không có ngoại lệ, kể cả cho Quản trị hệ thống.** Họ đã có mọi quyền ở
mọi cây qua cờ `tai_khoan`, nên chặn họ tự trỏ vào mình không lấy đi khả năng
nào — chỉ lấy đi đúng một đường: tự nhận cây của người khác. Và:

> *Một luật không ngoại lệ thì kiểm được; một luật có một ngoại lệ thì phải
> kiểm cả ngoại lệ, và ngoại lệ là chỗ lỗ hổng hay nằm.*

### 2.5 · Duyệt ĐƠN XIN VÀO CÂY không phải là "duyệt nội dung"

Chủ dự án chốt: `quan_tri` **được chủ cây phong** chỉ có sửa dữ liệu và duyệt
nội dung. Chỗ dễ xếp nhầm là **duyệt đơn xin vào cây**: nó nằm cạnh màn hình
kiểm duyệt, dùng chung chữ "duyệt", nhưng **nhận một người vào cây là cấp
quyền ĐỌC**, không phải kiểm một lần sửa. Nên nó nằm ở cột "đổi quyền", tức
chỉ chủ cây làm được.

Bảng b97 vì thế **vốn đúng** — tôi đã đề xuất lật nó vì hiểu sai lời chủ dự
án, và lời đính chính của chủ dự án phục hồi nó nguyên vẹn.

### 2.6 · Bàn giao gia phả — chức năng bị bỏ sót

Trước bước này `chu_so_huu` là **vĩnh viễn**: chỉ `tao_gia_pha_moi()` đặt một
lần, không hàm nào đổi. Chủ cây muốn giao lại cho con cháu thì không có đường
nào ngoài SQL Editor. Chủ dự án nêu ra, và nó đúng là một lỗ trong thiết kế.

Ba câu ghi của `doi_chu_cay()` **không tách rời được**, và câu thứ hai là bẫy:

1. `trees.chu_so_huu` sang người mới
2. **người mới phải CÓ dòng `tree_members`** — thiếu là chủ mới **sửa được mà
   không đọc được** (`co_the_quan_tri()` cho qua vì nó hỏi `chu_so_huu`; RLS
   chặn vì nó hỏi `la_thanh_vien()`). Triệu chứng: *"bấm Lưu báo thành công mà
   màn hình trống"*
3. chủ cũ **ở lại làm `quan_tri`**, không bị gỡ — bàn giao không phải đuổi đi,
   và người vừa giao cây thường là người duy nhất còn biết dữ liệu trong đó

---

## 3. Đã thử mà hỏng

### 3.1 · Bàn thử bắt được `chu_so_huu` RỖNG — trước khi ai kịp dán

Bản nháp đầu của `13` định neo `co_the_quan_tri()` vào `trees.chu_so_huu` và
tin rằng `11-quyen-he-thong.sql` đã điền cột ấy. Bàn thử trả lời: **cả hai cây
đều `null`.**

Nguyên nhân: `11` mục 5 gán theo email **cắm cứng** `trongdung1982@gmail.com`.
Trên máy chủ thật câu ấy trúng; trên bàn thử (`chu@thu.local`) nó không gán
được gì — **và không một câu lỗi nào**. Neo một hàng rào vào cột ấy mà không
gán trước thì kết quả là *"không ai duyệt được đơn nữa"*, và triệu chứng chỉ
lộ ra khi đã có người nộp đơn — có thể hàng tuần sau.

→ `13` mục 1 **suy chủ cây từ chính bảng `tree_members`** (ai đang mang vai
chủ cây thì người ấy là chủ), không hỏi email, và **`raise exception` DỪNG
HẲN** nếu còn cây không có chủ. Nguồn ấy đúng trên mọi máy chủ, và nó là nguồn
duy nhất còn nói được sự thật sau khi mục 2 xoá mã vai đi.

### 3.2 · Ba lỗi trong chính phép đo — cả ba đều "đỏ vì lý do sai"

Lần chạy đầu `do-b105.mjs` cho **39/52**. Không phép nào trong số hỏng là lỗi
của SQL:

| Chỗ hỏng | Nguyên nhân |
|---|---|
| 11 phép | `'nhan=' \|\| <boolean>` cho ra `true`/`false`, còn `psql -t -A` in cột boolean là `t`/`f`. Trộn hai dạng |
| **HR10** | thử ràng buộc bằng `insert` mang `user_id` bịa → vấp **khoá ngoại** trước khi chạm ràng buộc vai |
| **KC1** | bẻ gãy `la_chinh_minh()` rồi thử ở cửa `doi_vai` **của chủ cây** — hàng rào *"không hạ vai chủ cây"* chặn trước, che mất chỗ vừa bẻ |

Rồi lần sau còn một phép nữa, và nó là chỗ khó chịu nhất:

| **HR10, lần hai** | `psql` **thoát mã 0 dù câu lệnh ném lỗi** khi không bật `ON_ERROR_STOP`. Ràng buộc đã chặn đúng; chỉ mã thoát nói dối |

**"Đỏ vì lý do sai" nguy hiểm hơn "xanh oan"**, và đây là nếp đáng giữ nhất
của mục này: một phép đo báo đỏ trông như nó đã bắt được cái gì đó, nên người
đọc đi sửa **mã** thay vì sửa **phép đo**. Ngày 08/09 sáng, b103 đã mất một
vòng vì đúng chuyện này (14/20 với ba phép hỏng hoàn toàn bịa do lỗi mã hoá
`psql -c`).

Hai câu để nhớ, nối tiếp hai câu của b102 và b104:
- b102: *hỏi hàm quyết quyền không phải là đo hàng rào*
- b104: *chạy lại không phải là nâng cấp*
- **b105: mã thoát của công cụ không phải câu trả lời của máy chủ** — và
  **một phép kiểm chứng ngược bị hàng rào KHÁC che thì nó không chứng minh
  gì cả.**

### 3.3 · Bộ kiểm báo đỏ vì chính lời giải thích của mã

`kiem-di-doi.mjs` cấm file di dời đụng vào `auth.users`. Bản nháp của tôi nối
vào `auth.users` để lấy `created_at` → bắt đúng. Tôi sửa bằng cách sắp thứ tự
theo `tai_khoan.tao_luc`, tức **tôn trọng luật thay vì nới luật**.

Nhưng rồi phép ấy **vẫn đỏ** — vì câu chú thích tôi viết để giải thích *"sắp
thứ tự bằng `tao_luc`, KHÔNG bằng `auth.users`"* có chứa đúng chuỗi bị cấm.
Một bài kiểm hỏng vì lời giải thích của mã là bài kiểm **đo văn bản chứ không
đo mã** — đúng cái `kiem-tao-cay.mjs` đã ghi thành luật cho phía JS từ b104.
→ Phép ấy nay soi trên bản đã bỏ chú thích.

Chuyện y hệt xảy ra lần thứ hai trong ngày, ở `kiem-quan-ly-thanh-vien.mjs`
PHẦN F: phép quét cả thư mục báo đỏ **chính `13`**, vì câu di dời của nó là
`set role='quan_tri' where role='quan_tri_he_thong'` — mã cũ nằm ở vế **điều
kiện**, không ở vế **ghi**. Cách chữa dễ dãi là thêm ngoại lệ theo tên file;
làm thế là làm phép quét mù luôn với file thật sự sai sau này. → Phép soi cắt
ở `where`, và **Z6** giữ lại đúng cái sai ấy làm phép kiểm chứng ngược.

### 3.4 · `08-kiem-duyet.sql` là mìn hẹn giờ, và tôi suýt để nguyên

`08` còn giữ `co_the_quan_tri()` bản cũ (hỏi mã vai). Nó **phải** còn, vì file
ấy còn chạy đúng trên máy chủ chưa có `13` — `chay.mjs` dựng bàn thử theo đúng
đường ấy. Nhưng ai dán lại `08` sau này mà quên `13` là **chủ cây mất sạch
quyền quản trị**, lặng lẽ.

→ Ghi cảnh báo vào **cả hai** file. `13` liệt kê ba file cũ (`08` · `09` ·
`12`) mà dán lại thì phải dán lại `13`. Cùng khuôn cảnh báo `06`/`07`/`08` đã
có từ b97: **thứ tự dán là một phần của lược đồ, không phải chi tiết thao tác.**

### 3.5 · Và một lỗi thao tác của chính tôi

Dùng `cd supabase` trong một lệnh Bash, thư mục làm việc dính lại sang lệnh
sau, `chay.mjs` báo `MODULE_NOT_FOUND`. Đúng cái đã được nhắc **hai lần cùng
một ngày** trước đó: mọi file đều nằm trong dự án nên không bao giờ cần `cd`.

---

## 4. `13` cố ý KHÔNG nằm trong `chay.mjs`

Chỗ này dễ bị "sửa cho đủ bộ" nhất, nên ghi rõ: `chay.mjs` chạy `01`→`12` rồi
dừng. Nếu nó chạy luôn `13` thì bàn thử **luôn ở trạng thái đã di dời**, và
`do-b105.mjs` sẽ đo một lần *chạy lại* thay vì đo *đường di dời*.

Đó đúng bẫy b103 sập sáng cùng ngày. Và `do-b105.mjs` mục 0 đi thêm một bước:
nó **ĐÒI** trạng thái trước khi di dời phải đúng là trạng thái máy chủ thật
(còn dòng `quan_tri_he_thong`, còn ràng buộc cũ, còn hàm cũ) và **thoát ngay**
nếu không — vì phép đo trên một nền đã sạch là *đạt rỗng*.

---

## 5. Còn treo

- **Màn hình chưa có.** Sáu hàm hôm nay chỉ gọi được từ SQL Editor. Khu Thành
  viên là **b106**.
- **`quan_tri` được phong vẫn THẤY khối *Đơn chờ duyệt*** trong Cài đặt, bấm
  Duyệt thì máy chủ từ chối. **Không phải lỗi mới** — trước b105 họ cũng không
  duyệt được. b106 giấu nút đi.
- **Đổi quyền không để lại vết.** `change_log` chỉ ghi thay đổi *nội dung gia
  phả*; đổi vai, gắn mã người, bật tin cậy, bàn giao cây đều không có nhật ký.
  Cố ý chưa làm — nhét dòng phi-gia-phả vào `change_log` là đụng vào hàng chờ
  kiểm duyệt và đường hoàn tác. Cần một bảng riêng, chưa ai xin.
- **Chưa ai bấm thử trên app** — bước này không đẻ ra màn hình nào để bấm.
- **`js/pages/chon-gia-pha.js` vẫn không có lối vào nào** (treo từ b103).

---

## 6. File đã đụng tới

**Mới**
- `luoc-do/13-quan-ly-thanh-vien.sql`
- `kiem-thu/kiem-quan-ly-thanh-vien.mjs`
- `nhat-ky/b105-quan-ly-thanh-vien.md`
- `../kiem-thu/ban-thu-sql/do-b105.mjs` *(ngoài repo)*

**Sửa**
- `luoc-do/12-tao-cay.sql` → 0.2.0
- `luoc-do/08-kiem-duyet.sql` *(chỉ thêm khối cảnh báo, mã không đổi)*
- `di-doi/sinh-sql-di-doi.mjs` → 0.2.0
- `kiem-thu/kiem-di-doi.mjs` · `kiem-thu/kiem-tao-cay.mjs`
- `THIET-KE-NHIEU-CAY.md` *(mục 7 viết lại · mục 11.3 mới)*
- `CHI-DAN.md` *(bảng định tuyến — vẫn đúng trần 80 dòng)*
- `KE-HOACH.md` · `nhat-ky/INDEX.md` · `../PHOI-HOP-AI.md`
- `../kiem-thu/ban-thu-sql/chay.mjs` → 0.3.0 *(ngoài repo)*

**Chép nguyên / Xoá**: không có.

---

## 7. Số đo

| Phép | Kết quả |
|---|---|
| `do-b105.mjs` — đo hàng rào thật, mượn danh nghĩa tài khoản | **53/53 ĐẠT**, 4 kiểm chứng ngược |
| `kiem-quan-ly-thanh-vien.mjs` | **55/55 ĐẠT**, 6 kiểm chứng ngược |
| Chín bộ kiểm cũ | **506 phép, 0 hỏng** |
| `/kiem-tra` | **đạt cả 9 phép** *(gồm phép 9: 10/10 file `domains/` giống hệt bản Apps Script)* |
