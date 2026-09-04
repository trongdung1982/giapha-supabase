# b93 — Luật phân quyền TRỰC HỆ, và câu hỏi treo 11 ngày đã có trả lời

*04/09/2026 · phiên Claude Code CLI · viết xong 04/09/2026 13:10*

---

## Làm được gì

1. **Di dời dữ liệu (H5) chạy thật** — chủ dự án dán
   `tai-lieu/di-doi-NTB-20260904.sql`, bảng đối chiếu khớp **7/7 dòng**
   (59 người · 25 hôn nhân · 36 quan hệ con · 13 mục nhật ký). Mở app trên
   `nguyentrongbac.io.vn` thấy sơ đồ vẽ ra — tức dữ liệu **vào đủ và ra được**.
2. **Chốt luật phân quyền**, đóng câu hỏi *"chi/nhánh định nghĩa thế nào"*
   treo từ 24/08/2026.
3. Viết `luoc-do/06-quyen-truc-he.sql` và viết lại hàng rào 4 của
   `03-ham-luu-cay.sql`.
4. Bộ kiểm `kiem-thu/kiem-quyen-truc-he.mjs` — **57 phép, đạt 57**.
5. `HUONG-DAN-PHAN-QUYEN.md` cho chủ dự án.
6. Ghi thiết kế **kiểm duyệt nội dung (b94 + b95)** vào `KE-HOACH.md` — chốt
   xong, chưa viết một dòng mã nào.

---

## VÌ SAO

### Vì sao không đi đường "chia chi/nhánh"

Câu hỏi treo từ 24/08/2026 là *"chi/nhánh tính theo tổ tiên chung ở đời nào?
theo trưởng chi nào?"*. Chủ dự án trả lời bằng một luật **khác hẳn**: tài
khoản gắn với một mã người, admin duyệt, rồi sửa được người **cùng huyết
thống** với mình.

Điều đầu tiên phải làm không phải là viết mã, mà là **tra xem app đã có sẵn
định nghĩa "huyết thống" chưa**. Có — `domains/bloodline.js`. Và đọc nó ra thì
lộ ngay một chuyện: **nó không tính huyết thống.** Chính file ấy ghi ở đầu:

> *"tên `bloodline` không còn đúng nghĩa, tập vẽ là **huyết thống trong phạm
> vi k**, không phải toàn bộ huyết thống"*

Nó là hàm **vẽ**, không phải hàm **quyền**. Nó cố ý kéo vợ/chồng vào (nút biên
— không cùng huyết thống chút nào) và cố ý cắt họ hàng xa ngoài phạm vi (vẫn
cùng huyết thống). Dùng nó làm luật quyền là sai **cả hai chiều**. Nếu không
đọc mà cứ gọi vào, sẽ có một hệ thống phân quyền trông rất hợp lý và sai âm
thầm — đúng kiểu lỗi không ai phát hiện ra.

### Vì sao ĐO trước khi thiết kế, và ba con số đã lật ngược phương án

Luật quyền là thứ **sai mà không ai thấy**: nới rộng một chút thì mọi thứ vẫn
chạy êm, chỉ là có người sửa được hồ sơ mà lẽ ra không. Nên trước khi viết một
dòng SQL, viết một script Node đếm trên **cây thật Nguyễn Phúc 681 người**.

Ba con số, và cả ba đều ngược với trực giác:

| Cách hiểu "cùng huyết thống" | Trung vị sửa được | % tài khoản sửa quá nửa cây | Sửa được vợ/chồng mình |
|---|---|---|---|
| Đầy đủ *(mọi hậu duệ của mọi tổ tiên)* | **555 / 681** | **81 %** | **2/133 cặp** |
| + vợ/chồng, không giới hạn đời | 681 | 81 % | 133/133 |
| Lên tối đa 3 đời + vợ/chồng | 47 | 11 % | 133/133 |
| **Trực hệ + vợ/chồng** *(luật đã chốt)* | **27** | — | 133/133 |

Hai điều con số ấy nói ra, mà ngồi nghĩ thì không ra:

**Một — "cùng huyết thống" gần như không chặn gì.** Cả họ chung một cụ tổ, nên
hễ là con cháu cụ tổ thì cùng huyết thống với gần hết mọi người. 552/681 tài
khoản sửa được trên 500 người. Nhóm duy nhất bị chặn là **dâu và rể** (20
người chỉ sửa được chính mình). Giữa chi này với chi kia: **không chặn gì cả**
— tức đúng cái mà cả câu hỏi treo 11 ngày sinh ra để giải quyết thì nó không
giải quyết.

**Hai — và nó chặn nhầm ngay chỗ ruột thịt nhất.** Vợ chồng không cùng huyết
thống với nhau, nên **131/133 cặp mà chồng không sửa nổi hồ sơ vợ mình**, cũng
không thêm được vợ mới. Đây không phải lỗi cài đặt — đây là hệ quả thẳng của
chữ "huyết thống". Vì thế vế *"cộng vợ/chồng"* trong luật cuối cùng **bắt buộc
phải có**, không phải cho tiện.

Chủ dự án xem con số rồi thu hẹp thành **trực hệ**: lên chỉ đường thẳng, xuống
toàn bộ con cháu, cộng vợ/chồng. Trung vị 27 người — đúng cỡ một nhánh gia
đình.

### Vì sao chấp nhận "không ai sửa được anh chị em ruột"

Đo được: **0/514 người**. Em ruột không phải tổ tiên, cũng không phải con cháu.
Đã hỏi thẳng chủ dự án, có kèm con số *"vá thì trung vị 27 → 34, rất rẻ"*, và
chủ dự án **vẫn chọn trực hệ nghiêm ngặt**. Đường ra là nhờ bố (bố là trực hệ
của cả hai) hoặc nhờ admin.

Ghi lại đây vì một lý do cụ thể: bộ kiểm có một phép **khẳng định anh chị em
ruột nằm NGOÀI phạm vi**. Ngày nào phép ấy "tự nhiên đạt ngược lại" thì luật
đã bị nới ở đâu đó mà không ai ghi lại.

### Vì sao trực hệ phủ rộng hơn con số 27 nghe có vẻ

Trực hệ **chạy hai chiều**: tôi sửa được tổ tiên tôi, và con cháu tôi cũng sửa
được **tôi** — vì tôi nằm trong tập tổ tiên của chúng. Nhờ vậy hồ sơ một cụ đã
mất được cả đường con, cháu, chắt chăm, không phụ thuộc vào việc cụ có tài
khoản hay không. Đây là tính chất mà phương án "giới hạn 3 đời" không có được
chắc bằng, và nó có bộ kiểm riêng canh.

### Vì sao phải canh CẠNH quan hệ, không chỉ canh NGƯỜI

Đây là chỗ khó nhất của cả bước, và là chỗ suýt thủng.

Phạm vi sửa **mọc ra từ chính các cạnh quan hệ**. Nên có một đường leo quyền
chỉ mất hai lần bấm Lưu:

> Tôi khai cụ tổ là bố tôi → cụ tổ thành tổ tiên trực hệ của tôi → lần lưu sau
> tôi sửa được cụ tổ.

Không sinh ra một dòng lỗi nào. Hàng rào 4 vì thế canh **sáu chỗ** — người,
hôn nhân, quan hệ cha mẹ–con, mỗi thứ cả chiều thêm lẫn chiều xoá — và **tính
phạm vi trên dữ liệu CŨ**, trước khi ghi. Tính trên dữ liệu mới thì cạnh vừa
khai ra đã tự cấp quyền cho chính nó.

Bản cũ của hàng rào này đã ghi sẵn nguyên tắc ấy cho luật nhánh: *"sửa nhánh
là một cách sửa người"*. Với luật trực hệ câu ấy còn đúng hơn nữa. **Khung
đúng có sẵn đáng giá hơn mã đúng có sẵn** — mã phải viết lại, khung thì không.

### Vì sao đổi ý nghĩa tham số mà giữ nguyên chữ ký hàm

`co_the_sua_nguoi(uuid, text)`: tham số hai xưa là mã **nhánh**, nay là mã
**người**. Chữ ký không đổi, nên bản `luu_cay()` cũ **vẫn gọi được** — nhưng
truyền `branch_id`, mà `branch_id` của mọi người đều `null`. Kết quả: **không
ai lưu được gì.**

Đó là **cố ý**. Hai hướng hỏng, và phải chọn hướng an toàn:

- Quên dán lại `03` mà hệ thống vẫn chạy → phân quyền **im lặng không có hiệu
  lực**, không ai biết.
- Quên dán lại `03` thì **hỏng to ngay lập tức** → không thể không nhận ra,
  và dán nốt file thứ hai là hết.

Hỏng đằng cấm, không hỏng đằng cho qua.

### Vì sao bộ kiểm chia làm hai nửa, và nói thẳng nửa nào chứng minh được gì

Máy không có Postgres, Supabase thật thì không đem ra thử. Nên:

- **Phần A** đọc thẳng hai file `.sql` và soi cấu trúc — bắt được quên
  `security definer`, quên `set search_path`, dùng `union all` trong nhánh đệ
  quy (mất tập `visited` → **treo cơ sở dữ liệu**, không phải chạy chậm), bỏ
  sót một trong sáu phép kiểm cạnh.
- **Phần B** dựng lại luật bằng JavaScript rồi chạy trên hai cây thật, khẳng
  định các tính chất bắt buộc.

Phần B kiểm cái **đặc tả**, không kiểm cái **SQL**. Một lỗi đánh máy trong SQL
phần B không bắt được. Viết rõ điều đó ở đầu file thay vì để người sau tưởng
57 phép đạt là SQL đã đúng.

### Vì sao dừng lại, không viết tiếp b94

Cuối phiên chủ dự án chốt thêm một tầng: **mọi nội dung sửa đều gắn cờ tạm,
admin duyệt rồi mới thành chính thức**. Đã ghi thiết kế vào `KE-HOACH.md`
nhưng **không viết mã**, vì b94 sẽ sửa tiếp đúng hàm `luu_cay()` mà b93 vừa
sửa — tức là lớp thứ ba xây lên một nền **chưa ai bấm thử lần nào**.
`CLAUDE.md` mục 8: *"phép thử 20 phút đã cứu hàng tuần đi sai đường"*, ba lần
trong dự án này.

---

## Đã thử mà hỏng

**1. Định dùng `computeVisibleSet()` của `bloodline.js` làm luật quyền.** Hỏng
vì nó là hàm vẽ, không phải hàm quyền — chi tiết ở trên. *Nếp rút ra:* tên hàm
nói một đằng, ghi chú đầu file nói một nẻo thì **tin ghi chú**. Nó được viết
bởi người vừa chứng minh cái tên là sai.

**2. Bộ kiểm báo 10 phép hỏng ở lần chạy đầu.** Nguyên nhân: cắt dòng ghi chú
*trước* khi đi tìm mốc `HÀNG RÀO 4` — mà mốc ấy **chính là một dòng ghi chú**.
*Nếp rút ra:* cắt lát theo văn bản gốc, rồi mới bỏ ghi chú **trong** lát.

**3. Ba phép nữa hỏng vì biểu thức dò của chính bài kiểm sai** — mã thật viết
`p_ops->'persons'->'xoa'`, bài kiểm dò `persons->'xoa'`. *Nếp rút ra:* phép
kiểm hỏng thì nghi bài kiểm trước, đừng nghi mã ngay.

**4. Ba lần liên tiếp câu `assert` của script sửa file bị sai**, vì đếm nhầm số
lần một chuỗi xuất hiện. Cả ba lần script **từ chối ghi** thay vì ghi bừa —
đúng cái nó sinh ra để làm. *Nếp rút ra:* `assert` trước khi ghi đè rẻ hơn dò
lại một file đã hỏng.

**5. Lần đầu chủ dự án bấm Run `06-quyen-truc-he.sql` thì Postgres từ chối:**
`42P13: cannot change name of input parameter "p_branch"`. Nguyên nhân:
`create or replace function` cho đổi **thân** hàm nhưng không cho đổi **tên
tham số** — mà đổi tên `p_branch` → `p_person` chính là chủ ý của bước này.
Sửa bằng một dòng `drop function if exists public.co_the_sua_nguoi(uuid, text);`
đặt ngay trước lệnh tạo (đã soát: không policy RLS nào phụ thuộc hàm ấy, nên
drop an toàn). Supabase SQL Editor bọc cả file trong một giao dịch nên lần
chạy hỏng **không để lại gì**; dán lại toàn file là xong.
*Nếp rút ra:* đổi tên tham số của một hàm đã tồn tại thì luôn phải `drop`
trước — và soát phụ thuộc trước khi drop, đừng drop mù.

---

## Còn treo

- ⚠ **Hai file SQL chưa ai dán** — `06-quyen-truc-he.sql` rồi
  `03-ham-luu-cay.sql`, đúng thứ tự. Chưa dán thì luật này **chưa tồn tại**.
  *(Lần dán đầu 04/09/2026 13:14 hỏng vì lỗi `42P13`, đã sửa file — xem
  "Đã thử mà hỏng" mục 5. Phải dán lại từ đầu.)*
- ⚠ **Chưa ai kiểm chứng trên Postgres thật.** Lần chủ dự án bấm Run là lần
  chạy đầu tiên — y như b92.
- ⚠ **Chưa có màn hình duyệt thành viên.** Duyệt bằng SQL; hàm
  `duyet_thanh_vien()` đã viết sẵn làm cửa cho màn hình mai kia.
- ⚠ **Phép thử H9 chưa làm** — năm hàng rào, ba cái đầu chưa thử lần nào.
  Riêng "ghi thẳng REST bị chặn" thì **thử bằng trình duyệt không chứng minh
  được**, vì app luôn đi qua `luu_cay()`.
- ⚠ **b94/b95 chốt thiết kế, chưa viết.** Xem `KE-HOACH.md` việc 4.
- `branches` / `branch_access` / `persons.branch_id` từ nay **không dùng** —
  giữ lại, chưa xoá (xoá bảng phải hỏi trước).

---

## File đã đụng tới

**Mới**

- `supabase/luoc-do/06-quyen-truc-he.sql`
- `supabase/kiem-thu/kiem-quyen-truc-he.mjs`
- `supabase/HUONG-DAN-PHAN-QUYEN.md`
- `supabase/nhat-ky/b93-quyen-truc-he.md` *(file này)*

**Sửa**

- `supabase/luoc-do/03-ham-luu-cay.sql` — hàng rào 4 viết lại, hàng rào 2 tách
  lời cho người chưa được duyệt, đầu file cảnh báo phải dán lại
- `supabase/DU-LIEU.md` — mục 2b mới; `branches`/`branch_access` đánh dấu
  không dùng
- `supabase/KE-HOACH.md` — đóng H5 và câu hỏi treo 24/08; thêm việc 4 (b94/b95)
- `supabase/nhat-ky/INDEX.md` — thêm một dòng, thêm một đính chính
- `CLAUDE.md` *(ngoài repo)* — mục 9 sửa câu *"đẩy mã lên GitHub là deploy
  thật, người trong họ thấy ngay"*: sai với nhánh Supabase, chủ dự án đã nhắc
  hai lần
- `.claude/settings.json` *(ngoài repo)* — nới danh sách lệnh Bash cho phép

**Chép nguyên** — không có.

**Xoá** — không có.

**Ngoài repo, không lưu lại:** ba script đo trong thư mục tạm
(`do-huyet-thong.mjs`, `do-bien-the.mjs`, `do-truc-he.mjs`). Con số chúng sinh
ra đã chép vào đầu `06-quyen-truc-he.sql` và vào file này; bản thân script là
đồ dùng một lần.
