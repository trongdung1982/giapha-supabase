# b109e — dòng danh tính hiện ở CẢ BỐN tấm lọc, không riêng *Toàn hệ thống*

*09/09/2026 17:12 · nhánh Supabase · Claude Code CLI (Sonnet)*

Vòng thứ năm trong cùng ngày. Chủ dự án bấm thử b109d ngay sau khi nhận báo
cáo, và chỉ ra một chỗ thiếu nhất quán trong vòng vài phút — không phải một
việc mới, mà là hoàn tất đúng việc b109d mới làm một nửa.

---

## Việc đã làm

**Dòng danh tính** (*"Bạn đang đăng nhập bằng …"*, b109d thêm cho riêng tấm
*Toàn hệ thống*) nay hiện ở **cả bốn tấm lọc**: *Đang chờ · Đã duyệt · Tất cả ·
Toàn hệ thống*. Tách thành hai `<p>` độc lập:

- **Dòng danh tính** — cố định, không đổi theo tấm lọc đang mở.
- **Câu dẫn theo tấm lọc** (`DAN_CAY`) — vẫn hiện ở ba tấm cây, **ẩn hẳn**
  (`display:none`, không chỉ để trống) ở *Toàn hệ thống*.

Không đụng SQL, không đụng `layPhien()` — `hoTen` đã đọc được từ b109d.

---

## Vì sao — phần đáng đọc

### Vì sao đây không phải "sửa thêm cho đẹp" mà là hoàn tất đúng lý do đã nêu ở b109d

Lý do b109d viện dẫn cho tấm *Toàn hệ thống*: cờ Quản trị hệ thống có thể cấp
cho nhiều tài khoản, và đây là màn hình sửa được cờ ấy cho người khác — nhầm
tài khoản đang đăng nhập là nhầm chỗ nguy hiểm nhất.

Nhưng **ba tấm cây** (*Đang chờ · Đã duyệt · Tất cả*) mở **cùng một bảng việc
năm nút** — đổi vai, gắn người, tin cậy, gỡ, bàn giao — với đúng loại hậu quả
tương tự: đổi quyền của một tài khoản trong một cây cụ thể. Rủi ro "nhầm ai
đang cầm chuột" không hề nhỏ hơn ở ba tấm này. Viết lý do đúng rồi chỉ áp
dụng nó cho một phần tư màn hình là để lý do ấy đứng sai chỗ — bug không nằm
ở logic mà ở phạm vi.

Nếp: **khi một lý do bảo vệ được viện dẫn, kiểm lại xem lý do ấy có áp dụng ở
những nơi khác chưa được sửa hay không**, trước khi coi việc đã xong.

### Vì sao tách thành hai `<p>`, không gộp một câu

Danh tính không đổi theo tấm lọc; `DAN_CAY` thì có (và với *Toàn hệ thống* nó
biến mất hẳn). Gộp chung một câu buộc câu ấy phải viết lại mỗi khi MỘT trong
hai nửa đổi — trong khi tách ra thì mỗi nửa tự quản lý vòng đời của mình,
đúng cách `oGioiThieu` đã làm từ trước với `DAN_CAY`/`DAN_HE_THONG`.

### Vì sao ẩn bằng `display:none`, không phải để `textContent = ''`

Một `<p>` rỗng vẫn ăn `margin-bottom:16px` của nó — để trống mà không ẩn thì
tấm *Toàn hệ thống* có một khoảng trắng vô cớ ngay dưới dòng danh tính, chỗ
lẽ ra bảng phải bắt đầu ngay. Đo bằng ảnh `kq-7.png`: sau khi ẩn, bảng bắt
đầu sát ngay dưới dòng danh tính, không còn khoảng hở.

---

## Đã thử mà hỏng

Không có gì hỏng — cùng loại thay đổi nhỏ như b109d.

---

## Đã đo

| Phép | Kết quả |
|---|---|
| `kiem-trang-quan-tri.mjs` | **154/154 ĐẠT** |
| `/kiem-tra` (bốn phép chạy tay: 1 · 2 · 2b · 9) | ĐẠT, `domains/` 0 file khác, mốc `tuong-thich` vẫn 7 |
| `xem-khung-quan-tri.mjs` → `kq-4.png` (tab *Tất cả*) | Dòng danh tính + `DAN_CAY` cùng hiện, đúng thứ tự |
| `xem-khung-quan-tri.mjs` → `kq-7.png` (tab *Toàn hệ thống*) | Chỉ còn dòng danh tính, không khoảng trắng thừa |

**Chưa ai bấm thử trên máy chủ thật.**

---

## Còn treo

- Chủ dự án bấm thử cả bốn tấm lọc trên máy chủ thật.
- `settings.js` vẫn gọi vai trò là **Quyền** — treo từ b109c.
- `ds_thanh_vien()` không trả `moi_luc` — treo từ b109c.
- b110 — xoá gia phả hai chữ ký + thùng rác 30 ngày.

---

## File đã đụng tới

**Sửa** *(trong repo)*

- `js/pages/quan-tri/khu-thanh-vien.js` → 0.7.0
