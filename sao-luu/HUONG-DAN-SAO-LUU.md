# HƯỚNG DẪN DỰNG BẢN SAO LƯU TỰ ĐỘNG

*Lập 03/09/2026 17:30 · Nhánh Supabase · dành cho CHỦ DỰ ÁN, không phải cho AI*

> Làm một lần, khoảng 20 phút. Sau đó mỗi đêm máy tự chạy, không phải bấm gì nữa.
>
> **Việc này làm TRƯỚC khi nhập dữ liệu thật.** Nhập gia phả thật vào một hệ
> thống chưa có sao lưu là việc không sửa lại được.

---

## Nó làm gì, nói bằng một đoạn

Mỗi đêm khoảng 2 giờ sáng, Google tự chạy một đoạn mã. Đoạn mã ấy đọc **toàn
bộ** cơ sở dữ liệu gia phả trên Supabase — mọi người, mọi cuộc hôn nhân, mọi
dòng nhật ký sửa đổi, cả danh sách ai được vào app — rồi ghi tất cả thành **một
file trên Google Drive** của bạn. Giữ 30 bản gần nhất, cộng thêm một bản cho
mỗi tháng đã qua.

Nó còn làm một việc thứ hai, âm thầm nhưng quan trọng: **giữ cho Supabase khỏi
tự tạm dừng.** Gói miễn phí tự ngủ sau 7 ngày không ai đụng tới. Mỗi lần sao
lưu là một lần đụng tới, nên chừng nào việc này còn chạy thì app không tự tắt.

---

## Trước khi bắt đầu — hai điều cần biết

**1. Đây KHÔNG phải dự án Apps Script cũ.** Dự án cũ vẫn đang chạy app mà người
trong họ dùng hằng ngày. **Đừng mở nó ra, đừng dán gì vào nó.** Ta sẽ tạo một
dự án Apps Script hoàn toàn mới, trống trơn, chỉ để làm việc sao lưu.

**2. Dùng tài khoản Google nào thì file sao lưu nằm trong Drive của tài khoản
ấy.** Nên đăng nhập Google bằng `trongdung1982@gmail.com` trước khi bắt đầu.

---

## Bước 1 — Lấy khoá bí mật của Supabase

1. Mở `https://supabase.com`, đăng nhập, bấm vào project gia phả.
2. Cột trái, cuối cùng: bánh răng **Project Settings**.
3. Bấm **API Keys**.
4. Tìm mục **Secret keys** *(không phải "Publishable key" — đó là khoá khác)*.
5. Bấm biểu tượng con mắt để hiện khoá ra, rồi bấm biểu tượng chép.

Khoá đúng là một chuỗi **bắt đầu bằng `sb_secret_`**.

> ⚠ **Khoá này mở được mọi thứ và bỏ qua mọi phân quyền.** Từ giờ tới hết bước
> 4, nó nằm trong bộ nhớ tạm của máy. **Đừng dán nó vào chat, vào email, vào
> Notepad, vào file nào trong thư mục dự án.** Chỗ duy nhất được dán là ô ở
> bước 4. Lỡ dán nhầm đâu đó thì quay lại đúng màn hình này bấm **Revoke** rồi
> tạo khoá mới — khoá cũ chết ngay, không sao cả.

---

## Bước 2 — Tạo dự án Apps Script mới

1. Mở `https://script.google.com`.
2. Góc trái trên, bấm nút **New project** *(hoặc "Dự án mới")*.
3. Trên cùng có chữ **Untitled project** — bấm vào, gõ đè thành:
   `Sao luu gia pha Supabase`, bấm **Rename**.

---

## Bước 3 — Dán mã vào

1. Giữa màn hình có một ô soạn thảo, trong đó sẵn mấy dòng
   `function myFunction() { }`. Bấm vào ô ấy, nhấn **Ctrl + A** rồi **Delete**
   để xoá sạch.
2. Trên máy, mở file:
   `Claude_Code\supabase\sao-luu\SaoLuu.gs`
   *(bấm chuột phải → Open with → Notepad)*.
   Hoặc mở trên mạng:
   `https://github.com/trongdung1982/giapha-supabase/blob/main/sao-luu/SaoLuu.gs`
3. Trong Notepad: **Ctrl + A**, rồi **Ctrl + C**.
4. Quay lại Apps Script, bấm vào ô soạn thảo, **Ctrl + V**.
5. Bấm biểu tượng **đĩa mềm** (Save) trên thanh công cụ.

---

## Bước 4 — Cất hai giá trị cấu hình

1. Cột trái, bấm bánh răng **Project Settings**.
2. Kéo xuống cuối, mục **Script Properties**.
3. Bấm **Add script property**. Điền:
   - **Property**: `SUPABASE_URL`
   - **Value**: `https://hrmwkpnvenezeyhqmmrw.supabase.co`
4. Bấm **Add script property** lần nữa. Điền:
   - **Property**: `KHOA_BI_MAT`
   - **Value**: dán khoá đã chép ở bước 1 *(chuỗi `sb_secret_…`)*
5. Bấm **Save script properties**.

> Đây là chỗ riêng tư thật: nó nằm trong tài khoản Google của bạn, không nằm
> trong repo GitHub, không ai khác đọc được.

**Hai giá trị tuỳ chọn**, chỉ thêm nếu muốn:

| Property | Value | Để làm gì |
|---|---|---|
| `SO_BAN_GIU` | `30` | Giữ bao nhiêu bản gần nhất. Không điền thì mặc định 30 |
| `THU_MUC_DRIVE` | mã thư mục Drive | Chỉ định thư mục sẵn có. Không điền thì tự tạo thư mục `Sao luu gia pha (Supabase)` ở gốc Drive |

---

## Bước 5 — Chạy thử lần đầu, và cho phép

1. Cột trái, bấm biểu tượng **`<>` Editor** để về màn hình mã.
2. Trên thanh công cụ có ô chọn hàm — chọn **`kiemTraKetNoi`**.
3. Bấm **Run**.

**Lần đầu Google sẽ hỏi quyền.** Đây là màn hình bình thường, không phải lỗi:

1. Hiện bảng **Authorization required** → bấm **Review permissions**.
2. Chọn tài khoản Google của bạn.
3. Hiện màn hình chữ đỏ **"Google hasn't verified this app"** —
   **đây là mã do chính bạn vừa dán vào, không phải của người lạ.**
   Bấm chữ nhỏ **Advanced** ở góc dưới trái.
4. Bấm dòng **Go to Sao luu gia pha Supabase (unsafe)**.
5. Bấm **Allow**.

Xong, phần dưới màn hình hiện **Execution log**. Bạn phải thấy đại khái:

```
Kết nối tới: https://hrmwkpnvenezeyhqmmrw.supabase.co

  trees: 1 dòng
  tree_members: 1 dòng
  persons: 3 dòng
  ...
```

**Nếu thấy chữ đỏ** thì đọc câu tiếng Việt trong đó — nó nói thẳng phải làm gì.
Hai câu hay gặp nhất:

| Câu lỗi | Nghĩa là |
|---|---|
| *"Khoá bị từ chối…"* | Chép nhầm khoá ở bước 1. Quay lại lấy đúng dòng **Secret key** |
| *"KHOA_BI_MAT đang là khoá CÔNG KHAI…"* | Chép nhầm dòng **Publishable key** ngay bên cạnh |

---

## Bước 6 — Sao lưu thật một lần

1. Ô chọn hàm, đổi sang **`saoLuuNgay`**.
2. Bấm **Run**.
3. Execution log hiện: `Đã ghi giapha-sao-luu-2026-09-03-1745.json (… byte).`
4. Mở `https://drive.google.com`, tìm thư mục **`Sao luu gia pha (Supabase)`**.
   File phải nằm trong đó.

**Mở file ấy ra nhìn một lần** — đừng bỏ qua bước này. Bấm đúp, Drive hiện nội
dung dạng chữ. Ngay đầu file có khối `"dem"`, đọc được bằng mắt:

```
"dem": {
  "persons": 3,
  "unions": 1,
  ...
}
```

Con số `persons` ở đó phải khớp với số người đang có trong app. Nếu khớp thì
bản sao lưu là thật, không phải một file rỗng trông giống thật.

---

## Bước 7 — Đặt lịch tự động

1. Ô chọn hàm, đổi sang **`datLichSaoLuu`**.
2. Bấm **Run**.
3. Execution log hiện: `Đã đặt lịch: mỗi ngày một lần, khoảng 2 giờ sáng.`

Xong. Từ đêm nay máy tự chạy.

> Bấm lại hàm này nhiều lần cũng không sao — nó gỡ lịch cũ trước khi đặt lịch
> mới, nên không bao giờ có hai lịch chạy chồng nhau.

---

## Về sau

### Kiểm xem nó còn chạy không

`script.google.com` → mở dự án → cột trái bấm biểu tượng **đồng hồ**
(**Executions**). Danh sách mỗi đêm một dòng, cột **Status** phải là
**Completed**. Không thấy dòng nào mới trong hai ngày là có chuyện.

### Ba loại thư có thể tới

| Tiêu đề thư | Nghĩa là | Làm gì |
|---|---|---|
| **⛔ SAO LƯU HỎNG** | Đêm qua không sao lưu được | Mở dự án, chạy `kiemTraKetNoi`, đọc câu lỗi |
| **⚠ Bản sao lưu hôm nay ít dữ liệu hơn hẳn lần trước** | Số người tụt hơn một nửa | Mở app kiểm bằng mắt. Có thể là thật (bạn vừa dọn thùng rác), có thể là mất dữ liệu. **Lần ấy máy KHÔNG dọn bản cũ**, nên bản cũ còn nguyên để cứu |
| Thư của Google về "failure" | Google báo trigger lỗi | Cùng nguyên nhân với thư ⛔ |

### Muốn dừng hẳn

Chạy hàm **`goLichSaoLuu`**. Lịch tự động tắt; sao lưu bấm tay vẫn chạy được.

---

## ⚠ Ba điều bản sao lưu này KHÔNG làm — nói thẳng để không ai tưởng nhầm

**1. Không chứa mật khẩu.** Supabase không cho đọc mật khẩu ra, kể cả bằng khoá
bí mật. File có danh sách ai có tài khoản (email, ngày tạo), nhưng nếu phải
dựng lại hệ thống thì mọi người sẽ phải **đặt lại mật khẩu**. Dữ liệu gia phả
về đủ; đường vào thì không.

**2. Không chép ảnh về.** File chỉ **liệt kê** ảnh đang có — tên và dung lượng.
Ảnh gốc vẫn chỉ nằm một chỗ duy nhất là kho Supabase. Hôm nay chưa có tấm ảnh
thật nào nên chưa mất gì, nhưng ngày bắt đầu gắn ảnh thì đây thành lỗ hổng
thật. Mở file sao lưu, tìm dòng `"anh":` trong khối `"dem"` — con số ấy chính
là số tấm ảnh **chưa được chép đi đâu cả**.

**3. Chưa ai thử KHÔI PHỤC từ file này.** Có file sao lưu chưa phải là có khả
năng khôi phục — hai chuyện khác nhau, và chuyện thứ hai chỉ chứng minh được
bằng cách làm thử một lần trên một project Supabase trống. Việc ấy chưa làm.

---

## Nếu phải khôi phục

File JSON có khuôn thế này:

```
{
  "khuon": "giapha-sao-luu",
  "taoLucVn": "03/09/2026 17:30",
  "dem":  { "persons": 681, ... },        ← số dòng từng bảng, để đối chiếu
  "bang": { "trees": [...], "persons": [...], ... },   ← chép thô từng bảng
  "nguoiDung": [ ... ],                   ← ai có tài khoản
  "khoAnh":    { "tep": [ ... ] }         ← danh sách ảnh (không có ảnh)
}
```

Mỗi khoá trong `bang` là **tên một bảng Postgres**, và mỗi dòng bên trong giữ
**đúng tên cột** của bảng ấy. Nghĩa là đổ ngược lại được, không phải đoán.

**Đừng tự làm việc này một mình** — nói với Claude Code, đưa file, và bảo dựng
script đổ ngược. Đổ nhầm thứ tự bảng thì Postgres từ chối giữa chừng và để lại
một cơ sở dữ liệu nửa vời.
