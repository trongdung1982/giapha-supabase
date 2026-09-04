# HƯỚNG DẪN DI DỜI DỮ LIỆU — bản Apps Script → Supabase

*Lập 04/09/2026 · Cho chủ dự án, không phải cho AI*

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

## Phần dành cho AI — sinh lại file SQL

Chủ dự án không cần đọc mục này.

```
cd supabase/di-doi
node sinh-sql-di-doi.mjs --file ../../tai-lieu/giapha-nguyen-trong-bac.json --ma-cay NTB
```

Mặc định ghi ra `tai-lieu/di-doi-<MÃ CÂY>-<ngày>.sql` — **ngoài repo, cố ý**.
`--ra <đường dẫn>` đổi chỗ ghi; ghi vào trong `supabase/` thì có cảnh báo
nhưng không bị chặn.

Bộ kiểm: `cd supabase/kiem-thu && node kiem-di-doi.mjs` — **46 phép**. Nó bóc
ngược dữ liệu ra khỏi chính file SQL sinh ra rồi so lại với cây nguồn, nên nó
đo đúng những byte sẽ đi tới máy chủ. Nó **không** chạy SQL — máy không có
Postgres.
