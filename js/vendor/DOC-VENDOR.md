# sb/js/vendor — thư viện của người khác, chép nguyên vào repo

*Cập nhật: 02/09/2026 22:45*

Thư mục này **không phải mã của dự án**. Mọi file trong đây chép nguyên xi từ
nơi phát hành chính chủ, **không sửa một dấu chấm**. Vì thế chúng không mang
khối ghi chú sáu dòng của `CLAUDE.md` mục 6, và không nằm trong bậc thang phân
lớp `config → utils → services → domains → pages`.

Luật của thư mục này, đúng ba dòng — chép nguyên từ `giapha/js/vendor/`:

1. **Không sửa file trong đây.** Cần đổi hành vi thì bọc thêm một lớp ở
   `services/` hoặc `utils/`, đừng vá vào thư viện.
2. **Ghim cố định một phiên bản**, ghi rõ ở bảng dưới kèm mã băm MD5. Muốn
   nâng cấp thì tải bản mới, thay file, cập nhật bảng, chạy lại bộ kiểm.
3. **Không thêm thư viện mới nếu chưa hỏi chủ dự án** (`CLAUDE.md` mục 9), và
   chỉ thêm thứ có giấy phép cho phép chép lại. Repo này để **Public**, nên
   mỗi file trong đây là một bản phát hành lại ra công chúng.

---

## Đang có gì

| File | Thư viện | Bản | Giấy phép | Lấy về |
|---|---|---|---|---|
| `supabase.js` | supabase-js (bản UMD) | `2.114.0` | MIT (`LICENSE-supabase-js.txt`) | 02/09/2026, từ `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.114.0/dist/umd/supabase.js` |
| `xlsx.mjs` | SheetJS Community Edition | `0.20.3` | Apache-2.0 (`LICENSE-SheetJS.txt`) | 01/09/2026, từ `https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs` |

`supabase.js` — MD5 `4a66e4886ef0a4461f6556268319709a`, 212.884 byte.
`xlsx.mjs` — MD5 `10c762efb03b37765bec8aa19538e04c`, 1.008.308 byte
(chép sang từ `giapha/js/vendor/`, cùng bit).

---

## Vì sao là bản UMD chứ không phải ES Module

Cả dự án chạy ES Modules gốc và không có bước build, nên đáng lẽ phải lấy bản
ESM. **Supabase không phát hành bản ESM một file.** Gói npm có thư mục
`dist/module/` viết bằng cú pháp ESM, nhưng nó `import` từ sáu gói con
(`@supabase/auth-js`, `postgrest-js`, `realtime-js`, `storage-js`,
`functions-js`, `node-fetch`) bằng tên trần — trình duyệt không tra được tên
trần, và tra được thì cũng là sáu chục file lẻ.

Ba đường, và hai đường đầu đều hỏng ở chỗ khác nhau:

| Đường | Hỏng ở đâu |
|---|---|
| `dist/module/index.js` | Tên gói trần, trình duyệt không tra được. Muốn chạy phải có bước build — thứ `CLAUDE.md` mục 3 cấm |
| `esm.sh` / jsdelivr `+esm` | Cho ra một file ESM chạy được, nhưng đó là file **đã bị biến đổi** bởi máy chủ của người khác. Vi phạm thẳng luật 1 của thư mục này: *"chép nguyên xi từ nơi phát hành chính chủ"*. Không có bản gốc nào để đối chiếu MD5 |
| **`dist/umd/supabase.js`** ✓ | Đây là file Supabase **tự dựng và tự phát hành** trong gói npm. jsdelivr chỉ chuyển phát nguyên bản, không đụng vào. Đối chiếu MD5 được. Cái giá: nó đặt biến toàn cục `window.supabase` và phải nạp bằng thẻ `<script>` thường |

Cái giá của đường thứ ba dồn hết vào **một chỗ duy nhất**: `services/sb.js`
đọc `window.supabase` thay vì `import`. Đó cũng chính là file đã được giao
làm ranh giới với thế giới bên ngoài, nên nó không tạo ra một chỗ rò rỉ mới —
chỉ làm cái ranh giới sẵn có dày thêm một dòng.

⚠ Thẻ `<script src="js/vendor/supabase.js">` trong `sb/index.html` phải đứng
**trước** `<script type="module" src="js/app.js">`. Script thường chạy xong
mới tới lượt module, nên thứ tự ấy bảo đảm biến toàn cục đã có mặt. Đổi chỗ
hai thẻ là app hỏng — và hỏng bằng một câu lỗi không nói gì về nguyên nhân.

## Cái giá phải trả về dung lượng

212.884 byte, GitHub Pages tự nén gzip còn chừng 55–60 KB. **Chưa đo trên
Pages thật** — con số ấy suy từ tỷ lệ của `xlsx.mjs` (1.008.308 → 257.031,
đo thật 01/09/2026), chưa phải phép đo. Đo lại ở lần đẩy đầu tiên.

Khác `xlsx.mjs` một chỗ quan trọng: SheetJS chỉ tải khi người dùng bấm nhập
Excel (`import()` động). File này **nạp ở mọi lần mở app**, vì đăng nhập cần
nó. Không có cách nào lười hơn.

## Cách nâng cấp khi cần

1. Mở `https://registry.npmjs.org/@supabase/supabase-js/latest`, tìm số bản mới.
2. Tải hai file:
   `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@<bản>/dist/umd/supabase.js`
   và `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@<bản>/LICENSE`.
3. Đè lên `supabase.js` và `LICENSE-supabase-js.txt` trong thư mục này.
4. Sửa bảng "Đang có gì" ở trên: số bản, mã băm MD5, ngày lấy về.
5. Đăng nhập thử, mở một gia phả, sửa một cái tên rồi lưu. Không chạy được
   thì trả lại bản cũ, **đừng cố sửa mã dự án cho vừa bản mới**.

⚠ Bản `2.x` sang `3.x` (nếu có) là đổi lớn, không phải nâng cấp — đọc ghi chú
phát hành trước, đừng thay file rồi mới xem chuyện gì xảy ra.
