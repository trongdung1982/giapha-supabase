# Dựng bảng trên Supabase — từng bước

*Phiên bản 1.0.0 · Lập 02/09/2026 23:10*

> Hướng dẫn này viết cho **chủ dự án**, không phải cho lập trình viên. Mỗi
> bước ghi rõ bấm vào đâu, và ghi cả **cách tự kiểm** xem bước ấy đã xong
> chưa. Làm đúng thứ tự từ trên xuống; đừng nhảy cóc.
>
> Tất cả làm trong trình duyệt trên `supabase.com`. **Không cần cài gì**,
> không cần dùng cửa sổ lệnh.

---

## Trước khi bắt đầu

Cần có: tài khoản Supabase (`trongdung1982@gmail.com`) và một project đã tạo.

⚠ **Nếu chưa có project:** vào `supabase.com` → **New project** → đặt tên
(ví dụ `gia-pha`) → chọn vùng **Southeast Asia (Singapore)** → đặt một mật
khẩu cơ sở dữ liệu và **cất nó ở chỗ an toàn** (Supabase không cho xem lại).
Đợi chừng hai phút cho project dựng xong.

---

## Bước 1 — Chạy bốn file SQL

Trong project Supabase, cột trái có một biểu tượng **SQL Editor**
(hình `>_`). Bấm vào đó.

Làm **bốn lần**, mỗi lần một file, **đúng thứ tự này**:

| Lần | Mở file này trên máy | Chép toàn bộ nội dung |
|---|---|---|
| 1 | `supabase/luoc-do/01-bang.sql` | dán vào ô soạn → bấm **Run** |
| 2 | `supabase/luoc-do/02-rls.sql` | dán vào ô soạn → bấm **Run** |
| 3 | `supabase/luoc-do/03-ham-luu-cay.sql` | dán vào ô soạn → bấm **Run** |
| 4 | `supabase/luoc-do/04-view-ma-da-dung.sql` | dán vào ô soạn → bấm **Run** |

Mỗi lần nhớ **xoá sạch ô soạn** trước khi dán file tiếp theo.

⚠ **Thứ tự quan trọng.** File 02 nhắc tới bảng mà file 01 dựng ra; chạy 02
trước là báo lỗi *"relation does not exist"*. Gặp lỗi ấy nghĩa là nhảy cóc —
quay lại chạy file trước.

**Tự kiểm:** sau mỗi lần Run, khung dưới phải hiện **Success. No rows
returned** (chữ xanh). Hiện chữ đỏ thì **dừng lại**, chép nguyên câu lỗi và
đưa cho Claude Code — đừng chạy tiếp file sau.

**Tự kiểm cả bốn:** cột trái → biểu tượng **Table Editor** (hình cái bảng).
Phải thấy đủ **12 bảng**: `branch_access`, `branches`, `change_log`,
`imports`, `media`, `persons`, `sources`, `tree_members`, `trees`,
`union_children`, `unions`, `user_settings`.

Thiếu bảng nào là file 01 chưa chạy trọn.

---

## Bước 2 — Cấu hình  ✅ ĐÃ XONG, không phải làm gì

Bác đã đưa hai giá trị này ngày 03/09/2026 và Claude Code đã điền sẵn vào
`supabase/js/cau-hinh.js`:

| | |
|---|---|
| Project URL | `https://hrmwkpnvenezeyhqmmrw.supabase.co` |
| Publishable key | `sb_publishable_tPNW…` |

**Tự kiểm:** mở `supabase/js/cau-hinh.js` bằng Notepad, xem hai dòng
`SUPABASE_URL` và `SUPABASE_KHOA_CONG_KHAI` không còn chữ `ĐIỀN VÀO ĐÂY` nào.

⚠ **Chỉ phải quay lại bước này khi đổi sang project Supabase khác.** Lúc ấy:
Project Settings (bánh răng, dưới cùng) → **API Keys** → chép **Project URL**
và **Publishable key**.

⚠⚠ Ngay bên cạnh có một khoá tên **Secret key** (`sb_secret_…`). **TUYỆT ĐỐI
không chép khoá đó.** Nó vượt qua toàn bộ phân quyền, và repo GitHub để
Public — dán nhầm nó vào mã là đưa chìa khoá cả gia phả lên mạng cho cả thế
giới, và lịch sử git giữ lại cả sau khi xoá. Khoá đúng có chữ
**publishable**, khoá sai có chữ **secret**.

*(App tự kiểm điều này: dán nhầm khoá bí mật thì màn hình hiện một câu cảnh
báo bằng tiếng Việt thay vì chạy tiếp.)*

---

## Bước 3 — Tạo tài khoản đầu tiên (của chính bạn)

Cột trái → **Authentication** → nút **Add user** → **Create new user**.

- Email: `trongdung1982@gmail.com`
- Password: đặt một mật khẩu, **cất ở chỗ an toàn**
- Bật **Auto Confirm User** ✓ *(không bật thì phải đi mở hộp thư xác nhận)*

Bấm **Create user**.

**Tự kiểm:** danh sách Users hiện đúng một dòng với email của bạn. Chép lấy
**User UID** ở dòng đó — một chuỗi dài kiểu `a1b2c3d4-...`. Bước 4 cần nó.

---

## Bước 4 — Tạo một gia phả thử và cho mình quyền chủ

Quay lại **SQL Editor**, dán đoạn dưới đây, **sửa một chỗ** rồi Run:

```sql
-- Sửa 'DÁN-USER-UID-VÀO-ĐÂY' thành User UID chép ở bước 3.
with cay_moi as (
  insert into public.trees (tree_code, name, root_person_id)
  values ('NTB', 'Họ Nguyễn Trọng Bắc', null)
  returning id
)
insert into public.tree_members (tree_id, user_id, role, email)
select cay_moi.id, 'DÁN-USER-UID-VÀO-ĐÂY'::uuid, 'chu',
       'trongdung1982@gmail.com'
  from cay_moi;
```

**Tự kiểm:** Table Editor → bảng `trees` có đúng một dòng; bảng `tree_members`
có đúng một dòng với `role` = `chu`.

⚠ Cây này còn **rỗng, chưa có người nào**. Đưa dữ liệu thật vào là việc của
script di dời (bước H5), làm sau.

---

## Bước 5 — Mở thử app

App nằm ở `Claude_Code/supabase/`. Nó **chưa được đẩy lên GitHub**, nên có
hai đường:

**Đường A — đẩy lên GitHub rồi mở qua mạng** *(giống người trong họ sẽ dùng)*.
Nhờ Claude Code đẩy vào repo `giapha-supabase`; sau chừng một phút mở
`https://trongdung1982.github.io/giapha-supabase/`.

⚠ Repo `giapha-supabase` **phải để Public** — GitHub Pages trên tài khoản miễn
phí chỉ phục vụ repo Public. Và trong Settings → Pages phải chọn nhánh
`main`, thư mục `/ (root)`.

**Đường B — mở tại chỗ để thử nhanh.** ⚠ **Không bấm đúp vào `index.html`** —
mở kiểu ấy trình duyệt chặn ES Modules và app không chạy, kèm một câu lỗi
chẳng nói gì. Phải mở qua một địa chỉ `http://`. Nhờ Claude Code dựng máy chủ
thử tại chỗ.

**Tự kiểm — ba mốc, theo đúng thứ tự:**

1. Hiện ô **Đăng nhập** (chứ không phải trang trắng, không phải chữ đỏ).
2. Gõ email và mật khẩu ở bước 3 → vào được.
3. Vì cây còn rỗng nên sơ đồ **chưa vẽ ra người nào** — đó là **đúng**, không
   phải hỏng.

Dừng ở mốc nào thì báo đúng mốc ấy. Ba mốc hỏng vì ba nguyên nhân khác hẳn
nhau, và biết dừng ở đâu là đã đi được nửa đường tìm ra nguyên nhân.

---

## Thêm một người trong họ, sau này

Không có nút "Đăng ký" trên app — **cố ý**. Gia phả là dữ liệu riêng; ai được
vào là do bạn quyết. Ba bước:

1. **Authentication** → **Add user** → email của người ấy, đặt mật khẩu tạm,
   bật **Auto Confirm User** → chép **User UID**.
2. **SQL Editor**, dán và Run *(sửa hai chỗ trong dấu nháy)*:

   ```sql
   insert into public.tree_members (tree_id, user_id, role, email)
   select id, 'USER-UID-CỦA-NGƯỜI-ẤY'::uuid, 'xem', 'email-cua-ho@gmail.com'
     from public.trees limit 1;
   ```

   Đổi `'xem'` thành `'sua'` nếu muốn người ấy sửa được gia phả.
3. Nhắn cho họ địa chỉ app, email và mật khẩu tạm. Bảo họ đổi mật khẩu bằng
   nút **Quên mật khẩu?** trên màn hình đăng nhập.

⚠ **Không còn màn hình "Google chưa xác minh ứng dụng này".** Đây là thứ đáng
giá nhất mà lần đổi nền mang lại cho người trong họ: không còn ai phải bấm qua
một cảnh báo có chữ *"không an toàn"* nữa.

---

## Ba điều phải biết, không được che

**Gói miễn phí Supabase tự tạm dừng sau 7 ngày không ai dùng.** Lúc ấy người
trong họ mở app sẽ gặp một lỗi khó hiểu. Cách chặn là một trigger Apps Script
gọi vào đó mỗi vài ngày — **chưa làm** (bước H8).

**Chưa có bản sao lưu nào.** Trên Drive, mỗi lần ghi thành công app tự cất một
bản. Trên nền này cơ chế ấy chưa dựng lại. Đừng nhập dữ liệu thật vào trước
khi có sao lưu.

**Giới hạn người biên tập theo chi/nhánh chưa chạy.** Bảng đã dựng sẵn và chỗ
kiểm đã đứng đúng chỗ, nhưng luật còn trống vì chưa ai định nghĩa "chi/nhánh"
nghĩa là gì. Hiện ai có vai `sua` thì sửa được cả cây — **đúng bằng bản cũ**.
