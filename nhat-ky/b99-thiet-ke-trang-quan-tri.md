# Bước 99 — Thiết kế trang Quản trị, và bốn phát hiện về nhiều cây

*05/09/2026 09:00 → 10:22 · Claude Code CLI (Opus 5)*

**Phiên này không sửa một dòng mã nào.** Sản phẩm là tài liệu, và bốn phép đo
trên mã có sẵn. Ghi lại vì phần *"vì sao"* của phiên này dài hơn phần *"làm
gì"* rất nhiều.

---

## Làm gì

1. Soạn tin nhắn đặt hàng ChatGPT thiết kế trang Quản trị — **hai lần**, lần
   đầu hỏng.
2. Rà bản thiết kế ChatGPT trả về, giữ phần đúng, bác ba chỗ bằng phép đo.
3. Viết `THIET-KE-QUAN-TRI.md` — thiết kế chốt, 354 dòng.
4. Viết lại mục *Việc kế tiếp* của `KE-HOACH.md` thành **b99 → b104**, mỗi
   bước một phiên, mỗi bước có *Làm · Sản phẩm · Điểm dừng*.
5. Trả lời câu hỏi cuối phiên của chủ dự án về **nhiều cây gia phả** — và đo
   ra ba lỗi cùng một câu chưa ai trả lời.

---

## Vì sao

### Vì sao nhờ ChatGPT thiết kế, và cái giá của lần đầu hỏng

Chủ dự án chọn ChatGPT vì *"việc này cần có thiết kế trước mà chatgpt thiết kế
tốt"*. Đúng — và cách đặt hàng thì phải học một lần mới biết.

**Lần đầu: liệt kê 10 file đính kèm, ~5.000 dòng. ChatGPT tràn ngữ cảnh ngay.**

**Lần hai: rút thành một tài liệu 323 dòng tự đủ, không đính kèm gì.** Cách
rút, và nó là cái nếp đáng giữ:

| Nguồn | Rút thành |
|---|---|
| `settings.js` 1429 dòng | bảng 10 dòng — mỗi khối một câu *nó làm gì thật* |
| `08-kiem-duyet.sql` 842 dòng | bảng 22 hàm — tên, tham số, kiểu trả về, ai gọi được |
| `sb.js` 666 dòng | danh sách 24 tên hàm |
| `01-bang.sql` 346 dòng | 4 bảng liên quan, **chỉ tên cột** |
| 4 file tài liệu | 12 ràng buộc + những luật đã chốt |

**Nguyên tắc rút: không chép một dòng mã nào.** Người thiết kế không cần đọc mã
— họ cần biết *cái gì đang có* và *cái gì bị cấm*. Rút 16 lần mà không mất cái
nào cần cho việc thiết kế.

Và thêm một câu vào đầu tin nhắn: *"bạn đang cầm bản thiếu, đọc rồi nói cần
thêm file nào, đừng đoán bù chỗ thiếu."* Không có câu ấy thì nó tự bịa tên cột
và tên hàm — loại lỗi tốn cả buổi mới phát hiện.

### Vì sao bác ba chỗ trong bản ChatGPT trả về

Bản của nó dùng được, và ba chỗ sai đều sai **vì nó không thể biết**, không
phải vì nó ẩu. Ghi lại cả ba vì mỗi cái là một bài học khác nhau.

**1 · Khu *"Dữ liệu gia phả"* không dựng được.** Nó dồn khối 1 (Danh sách
người), 6 (Xuất ảnh) và 7 (Nhập) sang `QuanTri.html`. Đo trên mã:

```
person-list.js   → state.tree + domains/person.js       cần CẢ CÂY
export-image.js  → xuatAnhPNG(svgEl, state.tree)        cần chính SVG ĐANG VẼ
import-export.js → state + có chế độ bổ sung vào cây đang mở
```

Dời chúng là buộc `QuanTri.html` nạp cả cây — **phá đúng lý do #2 khiến nó là
trang riêng**. Riêng xuất ảnh thì không dời được kiểu gì: không có sơ đồ thì
không có gì để chụp.

→ Bốn khu, không phải năm. Và **Cài đặt xuống 6 khối chứ không xuống 3** — ít
hơn chủ dự án đặt hàng, phải nói thẳng chứ không được im.

**2 · Nó bác thanh điều hướng bằng một câu nhầm nghĩa.** Nó viết *"`QuanTri.html`
vốn là tài liệu cuộn được, đừng phá"*. Nhưng câu ấy trong chính file nói về
việc trang **không dùng `position:fixed; inset:0`** như `index.html` — tức nói
về *cách trang cuộn*, không nói về *cách đi lại giữa các khu*. `position:
sticky` giữ được cả hai.

Bài học: **một câu trích đúng vẫn có thể dùng sai chỗ.** Phải mở file gốc ra
đọc xem câu ấy đang nói về cái gì.

**3 · Nó bác "Dashboard tổng quan" hơi rộng tay.** Lý lẽ của nó đúng với dãy ô
số ở đầu trang: số nằm một chỗ, việc nằm chỗ khác, và cùng một con số hiện ở
hai nơi thì có ngày lệch nhau.

Nhưng nó **gộp hai loại số khác hẳn nhau**:

- *số việc phải làm* (3 đơn chờ · 18 thay đổi chờ) — nó tự nhận là cần, chỉ
  đòi dời vào tiêu đề khu. Tức nó không bỏ, nó dời chỗ.
- *số đo sức khoẻ dữ liệu* (681 người · 273 hôn nhân) — nó bảo là trang trí.
  **Trong dự án này thì không.** Cả dự án kiểm chứng bằng bảng đối chiếu số
  đếm: di dời 04/09 khớp 7/7 dòng và chính bảng ấy **là** phép kiểm;
  `09-doi-ma-vai.sql` hỏi thẳng máy chủ *"còn bao nhiêu hàm nhắc mã cũ"*.

→ Giải bằng cách **đặt số vào chính mục điều hướng**: không ô trang trí nào,
không mất số nào, mỗi số chỉ tồn tại đúng một chỗ. Còn số đo sức khoẻ thì về
khu Sao lưu, đứng cạnh *"lần sao lưu gần nhất"* — chỗ duy nhất nó trả lời một
câu hỏi thay vì chỉ đứng đó.

**Chỗ nó dừng lại và xin thêm dữ liệu thì đọc mã là trả lời được.** Nó viết
*"cần xem SQL hiện có trước khi thiết kế `chi_tiet_kiem_duyet`"* vì
`change_log` có `truoc` mà không có `sau`. Đọc `03-ham-luu-cay.sql` khối *chụp
ảnh*: `truoc` có hình `{persons:[{id, cu}], …}` với `cu` là cả dòng cũ. Nên
**không cần cột `sau`** — giá trị *sau* chính là dòng hiện tại, và điều đó chỉ
đúng khi chưa ai đụng tiếp, mà `dung_do_sau()` đã trả lời sẵn câu ấy.

### Vì sao kế hoạch xếp khung điều hướng (b99) TRƯỚC quản lý thành viên

ChatGPT xếp *"đau nhất trước"* — thành viên & quyền lên số 1, vì nó xoá nhiều
câu SQL tay nhất. Đúng về giá trị, nhưng b99 phải đứng trước nó vì **b99 không
đẻ ra SQL nào** mà chứng minh được cả khung. Sai khung thì sai lúc chưa có gì
xây lên trên. Từ b100 trở đi mới theo đúng thứ tự "đau nhất trước" của nó.

---

## Đã thử mà hỏng

**Gửi 10 file đính kèm cho ChatGPT.** Tràn ngữ cảnh ngay lập tức, không nhận
được câu trả lời nào. Nếp rút ra ở mục *Vì sao* trên.

**Đo phép 6 của `/kiem-tra` bằng `head -6`.** Báo 28 file "thiếu dòng Phiên
bản" — sai hết. Dòng `Vai trò` của nhiều file xuống hai dòng, đẩy `Phiên bản`
xuống dòng 7. Đo lại bằng `head -14`: **49/49 đạt**.

⚠ **Nếp: một phép kiểm báo hàng loạt lỗi cùng một kiểu thì nghi phép kiểm
trước, đừng nghi mã.** 28 file cùng hỏng một chỗ thì xác suất cao là thước đo
sai, không phải 28 người cùng quên.

**Chạy `cd supabase/js` rồi gọi song song một lệnh dùng đường dẫn từ gốc.** Thư
mục làm việc của Bash giữ nguyên giữa các lần gọi, nên lệnh thứ hai chạy sai
chỗ. Nếp cũ đã ghi trong ký ức mà vẫn vấp: **đừng `cd`, dùng đường dẫn tương
đối từ gốc dự án.**

---

## Còn treo

Bốn phát hiện về **nhiều cây gia phả**, đo cuối phiên, ghi đầy đủ ở
`KE-HOACH.md` mục *NHIỀU CÂY GIA PHẢ*:

| | Cái gì | Nặng nhẹ |
|---|---|---|
| Hỏng 1 | `chonGiaPha()` `delete().eq('user_id', …)` xoá sạch `user_settings` → **đổi cây là xoá người trung tâm mặc định của mọi cây** | lộ ra khi có cây thứ hai |
| Hỏng 2 | `state.hienNgayGio` không lưu ở đâu — không `user_settings`, không `localStorage`. Tắt trình duyệt là mất | **hỏng ngay với một cây**, chưa ai báo |
| Hỏng 3 | `coalesce(p_tree, (select id from public.trees limit 1))` — 8 chỗ, không `order by` → hỏi nhầm cây, im lặng | không rò rỉ dữ liệu; hiện sai số |
| Chưa chốt | **Ai được tạo cây mới?** `taoGiaPhaMoi()` còn trả `lyDo:'chualam'` | câu chủ dự án phải trả lời |

⚠ Hỏng 1 và Hỏng 2 **dính nhau**: chỗ đúng của công tắc *Hiển thị* là
`user_settings`, nhưng đưa vào đó trước khi gỡ Hỏng 1 thì nó cũng bị xoá theo
mỗi lần đổi cây.

Về câu *"ai được tạo cây mới"*: đây là **quyền duy nhất không thuộc về cây
nào**, nên `tree_members` không trả lời được — bảng ấy chỉ nói *"trong cây X
người này là gì"*. Đề xuất **không đẻ bảng mới**: ai đang là
`quan_tri_he_thong` của ít nhất MỘT cây thì tạo được cây mới, và người tạo tự
thành `quan_tri_he_thong` của cây vừa tạo.

Còn một việc phải hỏi trước khi làm b99: thiết kế đặt `pages/quan-tri.js` **đổi
tên** thành `pages/quan-tri/khu-kiem-duyet.js` — `CLAUDE.md` mục 9 bắt hỏi
trước khi đổi tên file mã.

---

## File đã đụng

**Mới**

- `supabase/THIET-KE-QUAN-TRI.md` — 354 dòng, thiết kế chốt
- `supabase/nhat-ky/b99-thiet-ke-trang-quan-tri.md` — file này
- `Claude_Code/TIN-NHAN-CHATGPT-TRANG-QUAN-TRI.md` *(ngoài repo)* — bản tóm
  tắt đặt hàng, dùng xong xoá được
- `Claude_Code/thiet_ket-cua_chatgpt.md` *(ngoài repo)* — bản ChatGPT trả về,
  chủ dự án lưu lại

**Sửa**

- `supabase/KE-HOACH.md` — mục *Việc kế tiếp* viết lại thành b99→b104; thêm
  mục *NHIỀU CÂY GIA PHẢ*; bảng *Còn treo* thêm 4 dòng, sửa 3 dòng
- `supabase/CHI-DAN.md` — thêm dòng định tuyến trỏ `THIET-KE-QUAN-TRI.md`;
  **76/80 dòng**, chưa chạm trần
- `supabase/nhat-ky/INDEX.md` — thêm một dòng

**Không đụng dòng mã nào.** `/kiem-tra` đạt cả 9 phép, trong đó phép 9 xác nhận
hai bản `domains/` vẫn giống bit-với-bit, 10/10 file.
