# b102 — Tầng quyền cấp hệ thống, và hai lỗ hổng phép đo bắt được

*07/09/2026 · Claude Code · nhánh Supabase*

---

## Việc của bước này

`KE-HOACH.md` gọi b102 là **bước nguy hiểm nhất của cả dự án cho tới nay**, vì
nó sửa `vai_tro()` — hàm nền móng mà mọi luật quyền đều hỏi. Antigravity đã
dựng sẵn `11-quyen-he-thong.sql` trong `codex/` (ngoài repo) và chủ dự án đã
dán nó lên **Supabase Staging** và xác nhận bảng tự kiểm 12/12 ĐẠT.

Việc của phiên này vì thế **không phải viết mới**, mà là:

> rà lại rồi tích hợp — và rà bằng phép **đo**, không bằng đọc lướt lời khai.

Kết quả: file chạy đúng, bốn hàng rào đứng vững, **nhưng có hai lỗ hổng mà cả
bảng tự kiểm 12 dòng lẫn kịch bản kiểm của AGY đều báo xanh.**

---

## Hai lỗ hổng, và vì sao chúng đi lọt

### Lỗ hổng 1 — ai cũng tự đặt mình thành Quản trị hệ thống

Bảng `tai_khoan` giữ hai cờ quyền: `la_quan_tri_he_thong` và `duoc_tao_cay`.
Bản 0.1.0 gác nó bằng luật này:

```sql
create policy rieng_tai_khoan on public.tai_khoan
  for all to authenticated
  using      (user_id = auth.uid())
  with check (user_id = auth.uid());
```

`for all` gồm cả `update`. Nghĩa là một tài khoản bất kỳ gửi đúng một lệnh

```
PATCH /rest/v1/tai_khoan?user_id=eq.<chính mình>
{"la_quan_tri_he_thong": true}
```

là thành Quản trị hệ thống của **toàn bộ hệ thống** — đọc và ghi được mọi cây.

**Đo được** (`do-b102.mjs` mục ĐÒN 1): một tài khoản không có chân ở cây nào,
sau đúng một câu `update`, đọc **59 người**, **5 dòng `tree_members`** (tức
email của cả họ), và `duoc_tao_cay()` trả `true`.

Vì sao nó lọt, và đây mới là phần đáng ghi: **luật ấy không phải viết ẩu, nó
là một khuôn đúng bị chép sang chỗ sai.** `02-rls.sql` mục 4 có luật
`rieng_user_settings` với hình dạng giống hệt từng chữ. Ở đó nó đúng — bảng ấy
giữ cỡ chữ với màu nền, và chính nó là chỗ *"bảng DUY NHẤT trình duyệt ghi
thẳng"*. Chép sang bảng giữ cờ quyền thì cùng một hình dạng đổi hẳn nghĩa.
Đọc mã không thấy được điều đó: hai luật trông y như nhau.

### Lỗ hổng 2 — sao lưu đêm sẽ ra file rỗng, không báo lỗi

Bản 0.1.0 viết lại `la_thanh_vien()` thành:

```sql
or exists (select 1 from tree_members
            where tree_id = p_tree and user_id = auth.uid()
              and approved = true)
```

Bản đang chạy (`07-duyet-dang-ky.sql` mục 3) là:

```sql
and (approved or role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu'))
```

Mệnh đề `or role in (…)` biến mất. `07` viết hẳn một khối chú thích giải thích
vì sao ba vai ấy phải đi tắt, và câu cuối của khối ấy là: *"Quên vai này là
sao lưu **thất bại im lặng**."*

**Đo được** (mục ĐÒN 2): tài khoản mang vai `sao_luu` với `approved = false`
đọc **0 dòng** `persons`. Bản sao lưu hằng đêm sẽ chạy xong, ghi ra một file
JSON hợp lệ, rỗng, và không có gì báo lỗi.

Hôm nay dòng `sao_luu` trên máy chủ thật đang có `approved = true` nên chưa ai
gặp. Cái mất là **lưới an toàn** mà `07` cố ý căng ra — nó chỉ có việc đúng vào
ngày người ta quên.

---

## Điều thứ ba: một thứ TRÔNG như lỗ hổng mà không phải

`ds_gia_pha()` trả `email_chu` ra cho cả người lạ. Tôi đã đặt phép đo với kỳ
vọng *"phải giấu"* và nó báo HỎNG.

`THIET-KE-NHIEU-CAY.md` mục *Ba tầng nhìn thấy* nói ngược lại, và nói rõ:

> Tầng 1 lộ địa chỉ email của chủ cây cho mọi tài khoản đã đăng nhập. Đó là
> cái giá, và **nó chính là công dụng** — email là đường liên hệ để xin quyền.

Nên chỗ sai là **kỳ vọng của tôi**, không phải mã. Đã lật kỳ vọng lại và giữ
phép đo ở đó, để lần sau ai định "vá" thì nó cãi lại. Ghi vào đây vì nó là
bằng chứng cho một luật của `CLAUDE.md`: đọc tài liệu trước, đừng đoán.

Khác `tree_members` (bẫy 3) ở chỗ nào: bảng ấy lộ email **của cả họ**; đây là
email của **một người tự nguyện đứng tên chủ cây**, và chủ cây tắt công tắc
là cây biến khỏi danh sách.

---

## Vì sao hai lỗ hổng ấy đi qua được cả hai lớp kiểm của AGY

Đây là phần đáng giữ nhất của bước này. Cả hai lớp kiểm đều **đo sai vật**.

### Bảng tự kiểm 12 dòng cuối file SQL

Mười hai dòng đều hỏi *"thứ này có tồn tại không"*: bảng có chưa, cột có chưa,
hàm có chưa, trigger có chưa. Không dòng nào hỏi *"nó có chặn được không"*.
Một luật RLS viết hớ hênh vẫn **tồn tại** đủ để cả 12 dòng báo ĐẠT.

### `kich-ban-kiem-b102.sql` — hai chỗ làm nó không đo được thứ nó tưởng

1. **Nó tự định nghĩa lại lược đồ trong chính nó.** `create table if not
   exists tai_khoan`, `create or replace function la_quan_tri_he_thong`… nằm
   ngay trong file kiểm. Tức nó kiểm **bản chép trong đầu nó**, không kiểm
   `11-quyen-he-thong.sql`. Sửa file SQL thật mà quên sửa file kiểm thì file
   kiểm vẫn xanh.

2. **Nó chạy bằng `postgres`, tức superuser — và superuser đi vòng qua mọi
   RLS.** Mọi phép đo *"người lạ có đọc được không"* đều đọc được hết. Nó
   ra ĐẠT vì nó hỏi **HÀM** (`co_the_xem_cay()` trả `false` — đúng), chứ
   không hỏi **BẢNG** (`select … from persons` — vẫn ra 59 dòng).

   Hàm trả `false` mà bảng vẫn đưa dữ liệu ra thì hàng rào không tồn tại.

Bài học viết thành một câu: **hỏi hàm quyết quyền không phải là đo hàng rào.**
Đây đúng là điều phép thử H9 (04/09) đã dạy một lần — nó bắt được lỗ hổng leo
quyền mà 57 phép kiểm tự động không thấy, vì nó gọi thẳng REST. Lần này lỗ
hổng cùng loại, và lại lọt qua đúng vì cùng lý do.

### Và một chỗ BÀN THỬ đang nói dối

`kiem-thu/ban-thu-sql/00-gia-supabase.sql` dựng lại schema `auth`, `storage`,
ba vai — nhưng **không cấp quyền bảng cho vai `authenticated`**. Supabase thật
thì có (`grant all on all tables in schema public to anon, authenticated,
service_role` cộng `alter default privileges`).

Hệ quả: trên bàn thử, một luật ghi hớ hênh vẫn "an toàn" vì thiếu `grant` chặn
hộ — còn trên máy chủ thật thì nó thủng. `do-b102.mjs` bước 1 dựng lại đúng
thế cấp quyền ấy trước khi đo. Không có bước đó thì **phép đo LEO QUYỀN ra
kết quả sai theo hướng dễ chịu** — báo an toàn, trong khi thật ra đang thủng.

---

## Đã làm

| Việc | Chỗ |
|---|---|
| Tích hợp file SQL của AGY vào repo, vá hai lỗ hổng | `luoc-do/11-quyen-he-thong.sql` **0.2.0** |
| `rieng_tai_khoan` `for all` → **`for select`** | mục 1 |
| `la_thanh_vien()` trả lại mệnh đề ba vai đi tắt | mục 9 |
| Bảng tự kiểm 12 → **16 dòng**, thêm 4 dòng hỏi *"nó có chặn được không"* | mục 17 |
| Hai dòng tự kiểm cũ thôi báo đỏ giả trên bàn thử (nhánh `BỎ QUA`) | mục 17 dòng 6·7 |
| `grant execute` cho 7 hàm mới — sáu file trước đều viết, file này thiếu | mục 16 |
| `chu_so_huu` chỉ gán cho **hai cây kê đích danh**, không quét `is null` | mục 5 |
| `tk.duoc_tao_cay` — bỏ tên trần trùng tên hàm | mục 11 |
| **Phép đo mới, 29 phép** — mượn danh nghĩa bằng `set local role authenticated` | `kiem-thu/ban-thu-sql/do-b102.mjs` *(ngoài repo)* |
| Bàn thử nay tự chạy `11` ở bước cuối | `kiem-thu/ban-thu-sql/chay.mjs` |

### Số đo

**29/29 ĐẠT**, gồm:

| Nhóm | Số phép | Đo cái gì |
|---|---|---|
| Hàng rào 1 | 4 | Quản trị hệ thống đọc **và GHI THẬT** (`luu_cay()`) được cây mình không có chân |
| Hàng rào 2 | 3 | Người lạ, không có cây mặc định: `persons` · `trees` · `tree_members` đều **0 dòng** |
| Hàng rào 3 | 4 | Qua cửa cây mặc định: đọc được **59 người**, nhưng `tree_members` · `change_log` · cây khác đều **0** |
| Hàng rào 4 | 5 | Ghi bị từ chối cả bốn đường: hàm quyết quyền · `luu_cay()` · ghi thẳng `persons` · `trees` · `cau_hinh` |
| ĐÒN 1 · 2 · 3 | 10 | Ba đòn đánh vào chỗ hở |
| **Kiểm chứng ngược** | **3** | Dựng lại đúng hai lỗ hổng cũ trong một giao dịch bị huỷ, và **đòi thấy chúng thủng** |

Ba phép cuối là thứ khiến 26 phép kia có nghĩa. Một bộ kiểm báo xanh có hai
cách: vật được đo đúng, hoặc thước đo hỏng. Kiểm chứng ngược loại bỏ cách thứ
hai — và trong phiên này nó không thừa chút nào: **lần chạy đầu, 21/21 phép
báo HỎNG trong khi hàng rào đứng vững**, vì hàm đọc kết quả nhặt nhầm dòng
`BEGIN` của psql làm câu trả lời. Sai ở thước đo, không sai ở vật được đo.

---

## Câu "chưa chốt" hoá ra đã chốt

`KE-HOACH.md` ghi b102 có một việc *"Phải chốt trước: Tên gọi —
`THIET-KE-NHIEU-CAY.md` mục 11"*. Mở ra thì mục ấy mở đầu bằng
**"✓ ĐÃ CHỐT (05/09/2026)"**: bốn tên hiển thị đã định, và có một câu quyết
định thẳng vào b102:

> **Không đẻ thêm mã `quan_tri_toan_he_thong`** — giữ nguyên và dùng đúng mã
> `quan_tri_he_thong` đã có.

AGY làm đúng câu ấy: hàm tên `la_quan_tri_he_thong()`. Chính `KE-HOACH.md`
mục b102 mới là chỗ còn ghi tên cũ `la_quan_tri_toan_he_thong`. Đã sửa.

---

## Còn treo sau bước này

- ⚠ **Máy chủ THẬT chưa có gì.** File `11` bản 0.2.0 chưa ai dán. Bản 0.1.0
  đang nằm trên **Staging** và **mang cả hai lỗ hổng** — dán đè bản 0.2.0 lên
  Staging là vá được, vì `create or replace` và `drop policy if exists`.
- ⚠ **b103 → b105 của AGY vẫn ngoài repo.** Đã soi lướt `12-tao-cay.sql` và
  `13-quan-ly-thanh-vien.sql`: **không file nào thêm luật ghi**, nên lỗ hổng
  loại này không lặp lại ở đó. Chưa rà kỹ, chưa đo.
- `13-quan-ly-thanh-vien.sql` cho phép đặt vai thành `quan_tri_he_thong` trong
  `tree_members`. Với `vai_tro()` mới thì đó vẫn là vai **của một cây**, không
  phải cờ hệ thống — nhưng hai thứ trùng tên là chỗ chờ sẵn để hiểu nhầm. Xem
  lại ở b105.
- `do-b102.mjs` nằm **ngoài repo** vì nó cần bàn thử Postgres tại chỗ, đúng
  chỗ `kich-ban-kiem-b102.sql` đang nằm.
