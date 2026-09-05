# HƯỚNG DẪN DI DỜI DỮ LIỆU — bản Apps Script → Supabase

*Lập 04/09/2026 · Bổ sung 05/09/2026 (cây thứ hai) · Cho chủ dự án, không phải cho AI*

> **Việc này làm gì:** đổ toàn bộ gia phả từ file JSON của bản Apps Script vào
> bảng Postgres trên Supabase. Bạn chỉ phải **dán một file và bấm Run** —
> không cần cài gì thêm, không gõ lệnh.
>
> **Mất bao lâu:** khoảng 5 phút.

---

## Trước khi bắt đầu — ba điều phải biết

**1. File SQL này XOÁ SẠCH dữ liệu gia phả đang có của cây `NTB` rồi đổ bản
mới vào.** Hôm nay trong đó chỉ có một người thử (`NTB_P0001` — *Nguyễn văn
một*), nên không mất gì. Nhưng nếu về sau bạn đã nhập dữ liệu thật rồi thì
**đừng chạy lại file này**.

**2. Sai một chỗ là nó tự huỷ sạch, không để lại nửa vời.** Cả file nằm trong
một giao dịch, và cuối file có phần đếm lại từng bảng. Đếm không khớp là mọi
thứ quay về đúng như trước khi bấm Run. Không có trạng thái "đổ được một nửa".

**3. Nó KHÔNG đụng vào:** tên gia phả · danh sách người được vào (`tree_members`)
· tài khoản đăng nhập · kho ảnh · lịch sao lưu. Chỉ dữ liệu gia phả của đúng
cây `NTB`.

> ⚠ **Chưa ai chạy file này trên Postgres thật.** Máy làm việc không có
> Postgres để thử trước, nên lần bạn bấm Run là lần chạy đầu tiên. Điều đó
> **không rủi ro** đúng vì điều số 2 ở trên: hỏng cú pháp thì không một dòng
> nào được ghi. Nhưng nói ra để bạn không bất ngờ nếu nó báo lỗi.

---

## File cần dán

```
D:\TrongDung\Dropbox\share\webapp\Gia_pha\Claude_Code\tai-lieu\di-doi-NTB-20260904.sql
```

Nó chứa **59 người · 25 hôn nhân · 36 quan hệ con · 13 mục nhật ký** — đúng
bằng file `tai-lieu/giapha-nguyen-trong-bac.json`.

⚠ **File này nằm ngoài repo, và phải nằm ngoài repo.** Nó chứa toàn bộ gia
phả; repo `giapha-supabase` để Public. Đừng chép nó vào thư mục `supabase/`.

---

## Sáu bước

### Bước 1 — Mở file SQL

Mở bằng **Notepad** (bấm chuột phải vào file → *Open with* → *Notepad*).

### Bước 2 — Chép toàn bộ

Bấm vào giữa cửa sổ Notepad, rồi **Ctrl+A** (chọn hết) → **Ctrl+C** (chép).

⚠ Phải chép **hết**, kể cả mấy dòng cuối. File dài nhưng phần lớn là một dòng
rất dài chứa dữ liệu — đừng cuộn tay rồi bôi đen, dùng Ctrl+A.

### Bước 3 — Mở SQL Editor trên Supabase

1. Vào `supabase.com`, đăng nhập, mở project gia phả.
2. Cột trái, bấm biểu tượng **SQL Editor** (hình `>_`).
3. Bấm nút **New query** ở góc trên.

### Bước 4 — Dán và chạy

Bấm vào ô soạn thảo → **Ctrl+V** → bấm nút **Run** (góc dưới bên phải, hoặc
Ctrl+Enter).

### Bước 5 — Đọc kết quả

**Chạy đúng** thì bảng kết quả hiện ra như thế này:

| bang | mong_doi | so_dong |
|---|---|---|
| change_log | 13 | 13 |
| imports | 0 | 0 |
| media | 0 | 0 |
| persons | 59 | 59 |
| sources | 0 | 0 |
| union_children | 36 | 36 |
| unions | 25 | 25 |

**Hai cột `mong_doi` và `so_dong` phải giống hệt nhau ở mọi dòng.** Nếu lệch
một số bất kỳ thì báo lại ngay, đừng làm tiếp — nhưng thực ra chuyện ấy không
xảy ra được, vì phần đếm bên trong đã huỷ sạch trước khi tới bảng này.

### Bước 6 — Mở app kiểm bằng mắt

Vào `https://nguyentrongbac.io.vn`, đăng nhập bằng tài khoản của bạn.

Phải thấy: **sơ đồ có người**, người trung tâm là **Nguyễn Trọng Dũng
(`P0012`)** — người trung tâm mặc định ghi sẵn trong file nguồn — và danh sách
người có **59 người** (không bản ghi nào nằm trong thùng rác).

⚠ Nếu app còn hiện cây cũ thì bấm **Ctrl+F5** (tải lại bỏ qua bộ nhớ đệm).

---

## Nếu nó báo lỗi

Mọi câu lỗi đều bắt đầu bằng chữ dễ đọc, và **không có gì được ghi khi có lỗi**.

| Câu lỗi bắt đầu bằng | Nghĩa là | Làm gì |
|---|---|---|
| `Không có gia phả nào mang tree_code = NTB` | Cây trên Supabase mang mã khác | Mở **Table Editor** → bảng `trees` → xem cột `tree_code`, rồi báo lại mã đúng |
| `Thiếu hàm gan_ma_cay` | Chưa chạy `luoc-do/03-ham-luu-cay.sql` | Chạy file ấy trước |
| `Cây trên Supabase là data_version …` | Hai bên khác đời dữ liệu | Dừng, báo lại |
| `Bảng … đổ vào N dòng nhưng đếm lại được M` | Có gì đó chặn bớt dòng | Dừng, chép nguyên câu lỗi báo lại |
| `syntax error` | Dán thiếu, thường do không dùng Ctrl+A | Chép lại từ đầu, đủ cả file |

---

## Sau khi xong

**Chạy sao lưu một lần ngay.** Mở dự án Apps Script sao lưu → chạy `saoLuuNgay`.
Bản sao lưu gần nhất (`giapha-sao-luu-2026-09-04-0833.json`) là bản **trước**
khi di dời, chỉ có một người thử — nó không cứu được gì nếu về sau cần lùi lại.

Việc còn lại của phần dữ liệu: **phép thử phân quyền H9** — hai tài khoản khác
nhau, mỗi tài khoản một nhánh, xác nhận bằng mắt là không sửa được nhánh kia.
Việc ấy phải làm **sau** bước này vì nó cần dữ liệu thật để thử.

---

# LẦN THỨ HAI — nạp cây Nguyễn Phúc Giáo *(05/09/2026)*

*Mục này viết riêng cho lần nạp cây thứ hai. Phần trên là lần nạp cây NTB,
đã xong 04/09/2026 — giữ lại làm chứng.*

## Bạn sắp dán BA file, theo đúng thứ tự này

| Thứ tự | File | Nó làm gì | Mất bao lâu |
|---|---|---|---|
| **1** | `supabase\luoc-do-sua-nhieu-cay.sql` | Sửa ba chỗ hỏng **chỉ lộ ra khi có hai cây**. Không đụng dữ liệu gia phả | vài giây |
| **2** | `tai-lieu\di-doi-NPG-20260905.sql` | Dựng cây **Nguyễn Phúc Giáo** và đổ **681 người** vào | khoảng 1 phút |
| **3** | `supabase\kiem-thu	hu-nhieu-cay.sql` | Đo lại xem hai cây có thật sự sống chung được không | vài giây |

⚠ **Thứ tự này quan trọng.** File 1 phải chạy TRƯỚC file 2: ba chỗ hỏng ấy
nằm im suốt từ đầu dự án, và cái đánh thức chúng dậy chính là **sự có mặt của
cây thứ hai**. Sửa sau là sửa trong lúc đang có triệu chứng.

## Ba việc file 1 sửa, nói bằng tiếng thường

**Một.** Hôm nay đổi sang cây khác là **mất người trung tâm mặc định của mọi
cây** — kể cả cây vừa chuyển sang. Với một cây thì không ai thấy, vì xoá xong
lại đặt đúng cây ấy.

**Hai.** Công tắc *"Hiện hàng ngày giỗ"* trong Cài đặt **không được lưu ở
đâu cả**. Tắt trình duyệt là mất. Từ nay nó nhớ, và nhớ **riêng cho từng cây**.

**Ba.** Vài màn hình đếm số *(đơn chờ duyệt, thay đổi chờ kiểm duyệt)* đang tự
chọn một cây bất kỳ khi không được nói rõ hỏi về cây nào. Với một cây thì luôn
đúng; với hai cây thì có thể **hiện số của cây kia, và duyệt nhầm hàng chờ của
cây kia** — mà không báo gì.

## Làm thế nào

Cách dán y hệt phần trên: **Notepad → Ctrl+A → Ctrl+C → Supabase → SQL Editor
→ New query → Ctrl+V → Run**. Làm lần lượt ba file.

### Sau file 1 — đọc bảng kết quả

Bạn sẽ thấy một bảng **9 dòng**, cột phải phải là **ĐẠT** cả chín. Có một dòng
`LỖI` thì **dừng lại, đừng dán file 2**, và bảo tôi biết dòng nào.

### Sau file 2 — đọc bảng đối chiếu

Bảng **7 dòng**, hai cột số phải **bằng nhau từng dòng**:

```
persons        681   681
unions         189   189
union_children 549   549
media            1     1
sources          0     0
imports          0     0
change_log       3     3
```

Lệch một dòng là **mọi thứ tự huỷ**, cơ sở dữ liệu giữ nguyên như trước khi
bấm Run — không có trạng thái "đổ được một nửa".

### Sau file 3 — đọc dòng cuối

Dòng cuối cùng phải ghi **`TẤT CẢ 16 PHÉP ĐẠT`**.

⚠ File 3 **có ghi vào cơ sở dữ liệu** — không có cách nào đo thật mà không ghi
thật. Nhưng nó chỉ đụng **cài đặt riêng của một tài khoản** *(người trung tâm
mặc định, công tắc ngày giỗ)*, và **trả lại nguyên trạng ở cuối**. Không đụng
một dòng gia phả nào.

## Rồi mở app và bấm thử — đây mới là điểm dừng thật

Ba việc, làm đúng thứ tự:

1. Mở `https://nguyentrongbac.io.vn` → **Cài đặt** → khối **Gia phả** → chọn
   **Nguyễn Phúc Giáo**. Sơ đồ phải vẽ ra với **681 người**.
2. Đặt một người trung tâm mặc định cho cây này. Rồi **đổi về cây Nguyễn Trọng
   Bác**, đặt một người trung tâm mặc định khác. Rồi **đổi qua đổi lại ba
   lần**.
3. **Người trung tâm mặc định của CẢ HAI cây phải còn nguyên.** Đây chính là
   thứ hỏng trước hôm nay — và là lý do phải bấm tay chứ không tin bảng số.

Thử thêm nếu tiện: bật công tắc *Hiện hàng ngày giỗ* ở một cây, **tắt trình
duyệt, mở lại** — nó phải còn bật, và cây kia phải vẫn tắt.

## Một điều cây mới KHÁC cây cũ, nói trước để bạn không bất ngờ

Cây Nguyễn Phúc Giáo dùng mã người **không có tiền tố**: `P0001`…`P0681`,
trong khi cây Nguyễn Trọng Bác có cả `NTBK7R3_P0060`. Cả hai đều **đúng** —
luật chốt 29/08/2026 là *mã đang có để nguyên, chỉ mã sinh MỚI mang tiền tố*.
Nên người bạn thêm vào cây Nguyễn Phúc Giáo từ nay sẽ mang mã `NPGQ8C9_P0682`.

## Ai vào được cây mới

File 2 gắn **mọi tài khoản đang là quản trị hệ thống ở một cây nào đó** làm
quản trị của cây mới. Hôm nay đó là tài khoản của bạn — nên bạn mở được ngay,
không phải làm gì thêm. Người khác muốn vào thì vẫn phải xin và được duyệt như
cũ.

---

## Phần dành cho AI — sinh lại file SQL

Chủ dự án không cần đọc mục này.

```
node supabase/di-doi/sinh-sql-di-doi.mjs --file tai-lieu/giapha-nguyen-trong-bac.json --ma-cay NTB
node supabase/di-doi/sinh-sql-di-doi.mjs --file tai-lieu/giapha-nguyen-phuc-giao.json --ma-cay NPGQ8C9 --ra tai-lieu/di-doi-NPG-20260905.sql
```

⚠ Từ 05/09/2026 bộ sinh **tự dựng cây nếu `tree_code` chưa có trên máy chủ**,
và gắn luôn người quản trị trong cùng khối. Trước đó nó dừng lại với câu
*"Không có gia phả nào mang tree_code = …"*, tức phải vào Table Editor tạo tay
một dòng `trees` trước — và tạo tay thì rất dễ quên `tree_members`, mà quên nó
là đẻ ra một cây **không ai mở được, kể cả người vừa tạo**.

Mặc định ghi ra `tai-lieu/di-doi-<MÃ CÂY>-<ngày>.sql` — **ngoài repo, cố ý**.
`--ra <đường dẫn>` đổi chỗ ghi; ghi vào trong `supabase/` thì có cảnh báo
nhưng không bị chặn.

Bộ kiểm: `node supabase/kiem-thu/kiem-di-doi.mjs` — **47 phép**. Nó bóc
ngược dữ liệu ra khỏi chính file SQL sinh ra rồi so lại với cây nguồn, nên nó
đo đúng những byte sẽ đi tới máy chủ. Nó **không** chạy SQL — máy không có
Postgres.
