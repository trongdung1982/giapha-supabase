# b89 — Chạy thật lần đầu, và tên miền `nguyentrongbac.io.vn`

*03/09/2026 17:04 · Claude Code CLI*

> Bước này là lần đầu tiên app trên nền Supabase **được người thật bấm vào**.
> Mọi bước trước nó, kể cả b88 *"đã lên mạng"*, đều chỉ chứng minh rằng mã tải
> về được — không chứng minh rằng nó chạy.

---

## Việc đã làm

1. **Máy chủ thử tại chỗ** — `kiem-thu/may-chu-tai-cho.mjs` (ngoài repo) và
   nút bấm đúp `BAT-MAY-CHU-THU.bat`. Mở app qua `http://127.0.0.1:8080/`.
2. **Sửa lỗi đầu tiên của lần chạy thật** — `null value in column "vn" of
   relation "persons" violates not-null constraint` khi thêm người mới.
3. **Thêm phép kiểm số 4** vào `kiem-hinh-dang.mjs`, đọc thẳng danh sách cột
   `not null` từ `luoc-do/01-bang.sql`. Bộ kiểm từ 14 lên **19 phép**.
4. **Gắn tên miền `nguyentrongbac.io.vn`** — H6 đóng. HTTPS chạy, chứng chỉ
   Let's Encrypt hạn 02/12/2026, `Enforce HTTPS` đã bật.
5. **Cài `gh` CLI** lên máy `LapASUS`, đăng nhập bằng `trongdung1982`.
6. **`MAY-THU-HAI.md`** — cài gì trên máy còn lại.

---

## VÌ SAO

### 1. Vì sao `default` của Postgres không cứu được cột `vn`

Đây là phần đáng giá nhất của cả bước, vì cái sai nằm đúng chỗ ai cũng tưởng
đã an toàn. `01-bang.sql` khai:

```sql
vn jsonb not null default '{}'::jsonb,
```

Nhìn dòng ấy thì kết luận tự nhiên là *"thiếu `vn` thì Postgres tự điền `{}`"*.
**Sai, và sai vì hai lý do chồng lên nhau:**

1. `default` chỉ áp cho cột **vắng mặt** trong câu `insert`. Gửi `null` tường
   minh thì nó không áp — mà `veBang()` đổi mọi khoá thiếu thành `null`.
2. Bỏ khoá ra cho vắng mặt **cũng không cứu**, vì `luu_cay()` đi qua
   `jsonb_populate_recordset(null::public.persons, …)`. Với hàm ấy, khoá thiếu
   trong JSON cho ra `null` chứ không cho ra `default`.

Nói cách khác: **`not null default` trong lược đồ là HÀNG RÀO, không phải chỗ
điền hộ.** Chỗ điền hộ phải nằm ở `services/hinh-dang.js` — đúng chỗ mà tài
liệu file ấy vẫn tự gọi là *"chỗ duy nhất hai thế giới gặp nhau"*.

Sửa ở đó chứ không sửa ở SQL còn vì một lý do thứ hai: **script di dời H5 cũng
đi qua `boCay()`**. Vá ở JavaScript là vá cả hai đường ghi cùng lúc; vá ở SQL
thì chỉ vá đường qua `luu_cay()`.

Và đã khai mặc định cho **cả bốn bảng**, không chỉ `persons`. Cùng cái sai nằm
sẵn ở `unions` (`ranks`, `partner_order`, `marriage`) — chỉ là chưa ai chạm
tới nó. Sửa một bảng rồi đợi ba bảng kia hỏng lần lượt là ba lần sửa cho một
nguyên nhân.

### 2. Vì sao phép so phải so DÒNG SẼ GHI XUỐNG

Sửa xong mục 1 thì **phép kiểm số 2 của bộ kiểm đỏ lên** — phép *"cây ráp từ
dòng và cây đọc từ file là MỘT"*. Đó không phải nhiễu, mà là bộ kiểm làm đúng
việc của nó.

Lý do: cây đọc từ một **file JSON sao lưu** không có khoá `vn`, còn cây ráp từ
Postgres thì có `vn: {}`. So hai bản ghi thô thì chúng "khác nhau", nên mỗi
lần **khôi phục từ file sao lưu** sẽ ghi lại toàn bộ 681 người. Ngày bật giới
hạn biên tập theo chi, mọi lần khôi phục sẽ bị máy chủ từ chối — vì trong đống
ghi lại ấy có cả người thuộc chi khác.

Cách sửa đúng là đổi **câu hỏi**: không hỏi *"hai bản ghi có giống nhau không"*
mà hỏi *"ghi xuống có làm đổi dòng nào không"*. Tức so `veBang(cũ)` với
`veBang(mới)`. Câu hỏi thứ hai mới là câu đáng hỏi, và nó tự xử luôn cả ba
trường hợp `undefined` / `null` / giá trị mặc định.

Đây là lần thứ hai trong dự án một phép kiểm đỏ lên **chỉ ra một lỗi thật mà
không ai đang tìm**. Ghi lại để lần sau đừng vội chỉnh bài kiểm cho nó xanh.

### 3. Vì sao phép kiểm mới đọc thẳng file SQL

Danh sách cột `not null` **chép tay được** — mười tám cái tên, năm phút. Nhưng
bản chép tay chỉ đúng tới ngày ai đó thêm một cột `not null` mới vào lược đồ,
và đó đúng là ngày cần bộ kiểm đỏ. Nên `cotBatBuoc()` đọc thẳng
`01-bang.sql` bằng biểu thức chính quy.

Kèm theo là **một phép kiểm của phép kiểm**: đếm số cột đọc được, đòi
`persons >= 15`. Không có nó thì biểu thức chính quy hỏng sẽ trả về danh sách
rỗng, và phép quét sẽ "đạt" mà chẳng kiểm gì cả — **một bộ kiểm xanh vì không
kiểm gì còn tệ hơn không có bộ kiểm**, vì nó mua được lòng tin mà không trả
lại gì.

### 4. Vì sao chứng minh phép kiểm bắt được lỗi cũ

Viết xong phép kiểm rồi thấy nó xanh thì **chưa biết gì cả** — nó xanh vì mã
đã đúng, hay xanh vì nó không kiểm gì? Nên đã hoàn nguyên đúng một dòng của
`veBang()` về hành vi cũ, chạy lại: **3 phép đỏ**. Khôi phục: 19/19.

Nếp: phép kiểm mới viết ra phải được nhìn thấy đỏ ít nhất một lần trước khi
tin nó.

### 5. Vì sao máy chủ thử là Node thuần và nằm ngoài repo

`npx http-server` là một dòng lệnh, nhưng `CLAUDE.md` mục 3 nói không npm.
Node có sẵn `node:http`, đủ dùng, và không kéo theo một cây phụ thuộc nào.

Đặt ngoài repo vì `supabase/` để Public: mọi file thả vào đó đều lên mạng, và
một công cụ chỉ chạy trên máy thì không có lý do lên mạng. Máy chủ chỉ nghe
`127.0.0.1`, không mở ra mạng nội bộ.

⚠ Bảng MIME **phải có `.mjs`**. Thiếu nó sinh ra loại lỗi tệ nhất: chạy trên
GitHub Pages thì được (Pages tự khai đúng), chạy tại chỗ thì không — và người
ta sẽ đi tìm nguyên nhân ở chỗ khác.

### 6. Vì sao DNS phải xong TRƯỚC khi đẩy file `CNAME`

Đặt tên miền cho GitHub Pages khi DNS còn chỉ về nhà đăng ký cũ thì Pages lập
tức chuyển hướng `trongdung1982.github.io` sang tên miền mới — mà tên miền mới
lúc ấy chưa tới được Pages. Kết quả: **app tắt ở cả hai chỗ** cho tới khi DNS
xong, tức có thể vài giờ.

Làm đúng thứ tự thì không có khoảng trống nào: đo DNS trên ba máy chủ tên
(`8.8.8.8`, `1.1.1.1`, và chính `ns1.bkdns.vn`) thấy đủ bốn bản ghi `A`, rồi
mới đẩy `CNAME`. Sau khi đẩy, Pages nhận sau khoảng một phút *(đo: hai vòng
404 rồi 200)*, chứng chỉ có ngay vòng kiểm đầu tiên.

Một chi tiết nhỏ đã suýt hỏng: git trên máy này đổi `LF` thành `CRLF`. File
`CNAME` mang `\r` ở cuối thì Pages đọc thành một tên miền không tồn tại. Đã
kiểm bằng `git show HEAD:CNAME | od -c` — chỉ có `\n`. **Kiểm byte, không
kiểm bằng mắt.**

### 7. Vì sao cài `gh` chứ không viết hướng dẫn bấm tay

Việc bật *Enforce HTTPS* nằm trong giao diện web, và lần đầu đã phải viết
hướng dẫn cho chủ dự án bấm. Đó là một **loại** vướng, không phải một vướng:
đổi cài đặt repo, đọc trạng thái build sau mỗi lần đẩy, xem repo còn Public
không — tất cả đều vướng như thế. Cài `gh` một lần là gỡ cả loại.

Hai tài khoản đi hai đường, và đó là **cố ý**:

| Đường | Tài khoản | Vì sao |
|---|---|---|
| `git push` | `ntdungsnotion` | đang chạy tốt, không có lý do đụng |
| `gh api` | `trongdung1982` | chỉ chủ repo mới đổi được Settings |

Lúc `gh auth login` đã chọn **No** ở câu *"Authenticate Git with your GitHub
credentials?"* chính để giữ nguyên đường thứ nhất.

---

## Đã thử mà hỏng

**Chrome headless để tự nhìn màn hình đăng nhập** — thoát mã 21, không kết
xuất được DOM. Đúng cái đã ghi trong ký ức (*"Chrome từ chối quyền Quản trị"*).
Nếp cũ vẫn đúng: **mốc 1 phải chủ dự án nhìn bằng mắt**, đừng hứa thay.

**`node -e` với biểu thức chính quy nhiều dấu gạch chéo ngược** — trả về danh
sách rỗng, tưởng biểu thức sai. Thật ra `node -e` nuốt mất phần thoát. Cùng
một nếp đã ghi cho heredoc: **file mã dài hoặc nhiều dấu nháy thì viết ra file
thật rồi chạy**, đừng gõ thẳng vào dòng lệnh. Cách xác nhận cuối cùng lại là
thứ tốt hơn: biến nó thành một phép kiểm nằm trong chính bộ kiểm.

**Sửa nửa vời ở `veBang()` rồi tưởng xong** — bộ kiểm đỏ ở phép 2 mới lộ ra
chỗ so sánh cũng phải đổi. Nếu lúc ấy chỉ chạy app thấy "thêm người được rồi"
là đã đóng bước với một lỗi khôi phục sao lưu nằm im trong mã.

---

## Còn treo

| Việc | Ghi ở đâu |
|---|---|
| **Sao lưu (H8)** — chưa có gì, phải xong TRƯỚC khi nhập dữ liệu thật | `KE-HOACH.md` việc 2 |
| Script di dời dữ liệu (H5) | `KE-HOACH.md` việc 3 |
| **Phân quyền RLS chưa ai kiểm chứng** — chưa thử hai tài khoản bao giờ | `KE-HOACH.md` việc 4 |
| Hai câu chủ dự án chưa trả lời: ảnh kho công khai/kín · định nghĩa "chi" | `KE-HOACH.md` |
| Bộ bất biến bố cục vẫn gác nhánh Apps Script | `KE-HOACH.md` cuối file |
| Bốn màn hình chưa mở được | `KIEN-TRUC.md` mục 6 |

⚠ **Chưa đo trên cây 681 người.** Bộ kiểm chạy trên cây thử 59 người. Lỗi `vn`
vừa rồi lộ ra ở app thật chứ không lộ ở bộ kiểm — vì bộ kiểm khi ấy chỉ so cây
với cây, không có ai bấm nút *Thêm người*.

---

## File đã đụng tới

**Mới — trong repo:**
- `CNAME`
- `nhat-ky/b89-chay-that-va-ten-mien.md`

**Mới — ngoài repo** *(nằm trong Dropbox, không lên mạng)*:
- `../kiem-thu/may-chu-tai-cho.mjs`
- `../BAT-MAY-CHU-THU.bat`
- `../MAY-THU-HAI.md`

**Sửa — trong repo:**
- `js/services/hinh-dang.js` — 0.1.0 → **0.2.0**: bảng `MAC_DINH_*` cho bốn
  bảng; `veBang()` nhận thêm tham số mặc định; `soSanhMang()` so dòng sẽ ghi
- `kiem-thu/kiem-hinh-dang.mjs` — 0.1.0 → **0.2.0**: phép 4, 14 → 19 phép
- `KE-HOACH.md` · `KIEN-TRUC.md` · `CHI-DAN.md` · `HUONG-DAN-DUNG-BANG.md`
  *(thêm bước 6 gắn tên miền)* · `nhat-ky/INDEX.md`

**Sửa — ngoài repo:**
- `../CLAUDE.md` — bảng hai đường ra GitHub; thêm ba dòng vào bản đồ thư mục

**Không đụng:** `js/domains/` *(10/10 file vẫn giống bản Apps Script
bit-với-bit)*, `luoc-do/*.sql`, `js/cau-hinh.js`.
