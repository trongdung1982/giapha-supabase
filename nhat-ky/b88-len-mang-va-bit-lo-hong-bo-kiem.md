# Bước 88 — Đưa nhánh Supabase lên mạng, và bịt hai lỗ hổng trong bộ kiểm

*03/09/2026 08:35 · Claude Code CLI · nhánh Supabase*

> Tiếp ngay sau b87 trong cùng một buổi. Tách ra làm bước riêng vì b87 đã
> commit và **đã đẩy lên GitHub** — sửa đè một bản ghi đã công khai là viết
> lại lịch sử, thứ `nhat-ky/INDEX.md` cấm ngay ở đầu file.

---

## Đã làm gì

- **Đẩy được lên GitHub.** Chủ dự án mời `ntdungs.notion` làm collaborator;
  4 commit lên `main`, app **chạy thật** ở
  `https://trongdung1982.github.io/giapha-supabase/`.
- **Thêm hai phép vào `/kiem-tra`** — phép 2b (đếm màn hình còn dựa vào giàn
  giáo) và phép 9 (so md5 hai bản `domains/`).
- **Viết lại `/ket-thuc`** thành hai khối theo nhánh.
- **Viết lại `CLAUDE.md` mục 10** — hai kho tài liệu, hai quy ước.
- Rà lại lượt 35 của Antigravity *(xem mục "Rà lại việc AI phụ tá")*.

---

## VÌ SAO

### 1. Vì sao phép 9 phải tồn tại, và vì sao nó là thứ dễ mất nhất

Đây là phát hiện đáng giá nhất của bước này, và **tôi không đi tìm nó** — nó
lộ ra khi đang rà đường dẫn chết trong tài liệu.

Bộ bất biến bố cục — 66 phép, **51.250 phép so trên 214 sơ đồ**, thứ bảo vệ
`domains/layout.js`, phần đắt nhất của cả dự án — nằm ở `Claude_Code/kiem-thu/`,
**ngoài repo mới**. Và **58 trong 142 file của nó `import` từ `../giapha/js/`**,
tức nó đang đo bản **đã đóng băng**, không đo nhánh đang làm.

Hôm nay điều đó vẫn an toàn, và tôi đã đo để chắc: hai bản `domains/` giống
nhau **bit-với-bit, 10/10 file** (`utils/` chỉ khác `image.js`, đúng thiết kế).

Nhưng đó là một **sự trùng hợp, không phải một cơ chế**. Ngày ai đó sửa
`supabase/js/domains/`, bộ kiểm ấy **vẫn chạy xanh** — nó đang đo một file
khác. 51.250 phép so thôi bảo vệ nhánh mới mà **không có gì báo**.

Đây đúng loại hỏng mà cả dự án này sợ nhất: không đỏ, không lỗi, chỉ là một
tấm lưới an toàn lặng lẽ thôi đỡ.

Phép 9 không sửa được gốc — nó chỉ nói *"hai bản đã lệch"*. Nhưng nó biến một
sự cố im lặng thành một câu báo, và nó nổ đúng vào lúc cần: lúc ai đó vừa sửa
`domains/`. Mà theo `BAT-DAU.md` mục 1 thì ngày ấy đằng nào cũng phải dừng lại
hỏi vì sao.

⚠ Đã ghi rõ vào `KE-HOACH.md`: gặp lỗi phép 9 thì **đừng "sửa" bằng cách chép
đè một bên lên bên kia**. Làm thế là bịt miệng phép kiểm chứ không phải trả
lời nó.

### 2. Vì sao phép 2b đếm giàn giáo thay vì cấm giàn giáo

`services/tuong-thich.js` là thứ tạm, đích đến là xoá. Cách "đúng" là cấm hẳn
việc thêm chỗ gọi mới — nhưng cấm thì không đo được, và một luật không đo được
là một luật sẽ bị quên.

Nên thay vì cấm, đếm: **hôm nay 7 file**, và con số ấy **chỉ được giảm**. Tăng
là dấu hiệu ai đó đang xây tiếp lên giàn giáo thay vì tháo nó — thứ mà nếu
không đếm thì không ai để ý, cho tới lúc gỡ ra không nổi nữa.

Về 0 thì xoá `tuong-thich.js` và bỏ luôn phép này. Một phép kiểm biết trước
ngày mình chết là một phép kiểm tử tế.

### 3. Vì sao `/ket-thuc` tách hai khối thay vì viết chung

Hai nhánh có hai cơ chế nhật ký **ngược nhau ở đúng chỗ nguy hiểm**: nhánh cũ
*sinh lại cả file mang số mới*, nhánh mới *chỉ thêm một dòng*. Viết chung một
quy trình rồi chú thích *"nhánh nào thì làm khác đi ở bước 4"* là mời gọi đúng
cái sai mà `NK-INDEX` V62 đã mắc.

Tách hẳn hai khối thì mỗi lần chỉ đọc một khối, và bước 4 của khối A mở đầu
bằng ⛔ **KHÔNG sinh lại file** — không có cách nào đọc nhầm.

### 4. Vì sao `CLAUDE.md` mục 10 phải nói "hai kho, hai quy ước"

Sau b87 có một mâu thuẫn nằm im: `CLAUDE.md` bảo *"sửa tài liệu thì tạo bản
`_Vxx` mới"*, còn khung mới thì tên file cố định. File ấy **đọc mỗi phiên**,
nên mâu thuẫn ở đó không phải một chỗ khó chịu — nó là một cái bẫy đặt sẵn cho
mọi phiên sau.

Nay mục 10 là một bảng hai cột, và **có cột "vì sao khác"**: `supabase/` là
repo git nên `git log -p` cho lịch sử tốt hơn 15 bản nằm cạnh nhau;
`tai-lieu/` là bản sao Knowledge Base, nơi không có lịch sử phiên bản. Không
có cột ấy thì sớm muộn ai đó "thống nhất lại cho gọn" và làm hỏng một trong
hai.

---

## Đã thử mà hỏng

**1. Đẩy lần đầu bị `403 denied to ntdungsnotion`.** Không phải lỗi kỹ thuật:
máy giữ đăng nhập của một tài khoản GitHub, repo thuộc tài khoản khác. Đã ghi
thành một cảnh báo riêng trong `CLAUDE.md` mục 4 để phiên sau gặp lỗi ấy khỏi
đi tìm nhầm chỗ.
→ Gỡ bằng cách chủ dự án mời tài khoản kia làm collaborator — **không** đổi
thông tin đăng nhập của máy, vì làm thế sẽ hỏng đường đẩy vào repo cũ.

**2. GitHub Pages trả 404 cho mọi đường dẫn ngay sau khi đẩy.** Suýt kết luận
là cấu hình Pages sai. Thật ra chỉ là Pages chưa dựng xong — đợi 25 giây rồi
hỏi lại thì tất cả trả 200.
→ Nếp: **sau lần đẩy đầu tiên vào một repo mới, 404 không có nghĩa là hỏng.**
Đợi rồi hỏi lại trước khi đi sửa cấu hình. (`api.github.com/…/pages` trả 404
kể cả khi Pages đang chạy — endpoint ấy cần xác thực, đừng dùng nó để kết luận.)

**3. Script Node kiểm đường dẫn chết viết bằng `node -e` bị hỏng cú pháp.**
Dấu chéo ngược trong `replace(/\\/g, '/')` bị lớp vỏ bash nuốt mất một cấp.
→ Đã có trong ký ức từ trước và vẫn dính lại: **script nhiều dấu nháy thì viết
ra FILE, đừng nhét vào `node -e` hay heredoc.** Viết ra file thì chạy được ngay.

**4. `python` in ra tiếng Việt là gãy giữa chừng** (`cp1252 codec can't
encode`). Kết quả đo trước dòng in hỏng vẫn đúng và vẫn đọc được — nhưng suýt
mất nếu phép đo nằm sau. Chạy lại với `PYTHONIOENCODING=utf-8`.

**5. Kiểm đường dẫn chết ra 29 cảnh báo, gần hết là dương tính giả.** Bộ kiểm
cũ (142 file `.mjs`) và `DOC-TRUOC.md` nằm ở `Claude_Code/kiem-thu/`, chỗ mà
script của tôi không tra tới; `form-nen.js` thì là một file **dự định làm
trong tương lai**, nhắc trong chú thích chứ chưa tồn tại.
→ Nếp: **một bộ kiểm ra toàn cảnh báo giả sẽ bị bỏ qua rất nhanh.** Nhưng
chính lần lọc thủ công 29 cảnh báo ấy là lúc lộ ra chuyện bộ kiểm gác nhầm
nhánh — nên lần này cái "ồn" đã trả công.

---

## Rà lại việc AI phụ tá — lượt 35 (Antigravity)

`/khoi-tao` bắt: lượt cuối là Antigravity thì phải rà lại **bằng phép đo**, và
*"AGY khai script chạy xong là chưa kiểm"*. Phiên này tôi không chạy
`/khoi-tao` nên rà bù ở đây.

AGY chuyển `tai-lieu/HUONG-DAN-SU-DUNG_V01.md` sang `.docx`. Tự kiểm của họ:
*"script chạy thành công (mã thoát 0), file ~46.3 KB"* — đúng loại tự kiểm mà
lệnh đã nói trước là không tính.

Mở file ra đo:

| Điều AGY khai | Đo được | Kết |
|---|---|---|
| File `.docx` hợp lệ, ~46.3 KB | 46.305 byte, zip lành, 17 mục, có `word/document.xml`, 15.255 ký tự chữ, tiếng Việt nguyên vẹn | ✓ |
| *"Phân cấp tiêu đề Heading 1, 2, 3, 4 rõ ràng"* | **0 đoạn nào dùng kiểu Heading.** Kiểu duy nhất được dùng là `ListBullet` × 73 | ✗ **sai** |
| *"Bảng biểu (FAQ, danh mục)"* — số nhiều | **1 bảng** | ✗ sai |
| Định dạng đẹp | 175 chỗ chữ đậm, 46 chỗ đặt cỡ chữ, 48 chỗ đặt màu, 9 ô có nền | ✓ |

**Kết luận công bằng: file DÙNG ĐƯỢC, nhưng lời khai sai về cơ chế.** Tiêu đề
làm bằng **định dạng trực tiếp** (đậm + cỡ + màu) chứ không bằng kiểu Heading.
Mở trong Word thì **trông vẫn đúng** — nên với mục đích đọc, in, gửi cho người
trong họ thì không sao.

Cái mất, và chỉ mất khi cần tới: không có khung điều hướng bên trái, không tự
sinh được mục lục, và đổi kiểu chữ một lần cho cả tài liệu thì không được —
phải sửa tay 175 chỗ.

⚠ Không sửa gì. Đây là tài liệu của nhánh cũ, và chủ dự án chưa nói cần mục
lục tự động. Ghi lại để ngày nào cần thì biết phải làm gì.

---

## Còn treo

Không có việc nào phát sinh thêm từ bước này. Danh sách đầy đủ ở `KE-HOACH.md`.
Ba thứ chặn, theo thứ tự:

1. **Chạy bốn file SQL** — chủ dự án làm. Cả bộ khung đứng trên giả định
   rằng chúng chạy được, mà chưa ai kiểm.
2. **Phép thử ba mốc** — sau đó.
3. **Sao lưu (H8)** — trước khi có dữ liệu thật.

Và hai câu chủ dự án chưa trả lời: kho ảnh công khai hay kín · định nghĩa
"chi/nhánh".

---

## File đã đụng tới

**Sửa — trong repo:**
`KE-HOACH.md` (thêm mục *Bộ bất biến bố cục đang gác nhầm nhánh*).

**Sửa — ngoài repo** *(nằm ở `Claude_Code/`, không theo `git push`)*:
`../CLAUDE.md` (mục 10 viết lại · mục 1 lời mở · mục 3 luật vendor) ·
`../.claude/commands/kiem-tra.md` (thêm phép 2b và 9) ·
`../.claude/commands/ket-thuc.md` (viết lại thành hai khối) ·
`../.claude/commands/khoi-tao.md` (tách hai nhánh) ·
`../PHOI-HOP-AI.md` (lượt 36).

**Mới:** file này · một dòng trong `nhat-ky/INDEX.md`.

**Chỉ đọc, không sửa:** `tai-lieu/HUONG-DAN-SU-DUNG_V01.docx` (rà lại việc AGY).

⚠ Repo `giapha` (bản Apps Script) **không đụng một byte** — `git status` trống
suốt cả phiên.
