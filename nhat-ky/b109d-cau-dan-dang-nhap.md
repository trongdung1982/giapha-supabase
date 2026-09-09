# b109d — câu dẫn tấm *Toàn hệ thống* nói CHÍNH MÌNH đang đăng nhập bằng ai

*09/09/2026 17:00 · nhánh Supabase · Claude Code CLI (Sonnet)*

Vòng thứ tư trong cùng ngày với b109/b109b/b109c. Lại bắt đầu bằng chủ dự án
**bấm thử bản vừa xong trên máy chủ thật** rồi đổi ý một câu — không phải một
lỗi, mà là nhìn thấy màn hình rồi nhận ra câu dẫn đang nói sai thứ đáng nói.

---

## Việc đã làm

1. **Câu dẫn của tấm *Toàn hệ thống* đổi hẳn nội dung**: không còn mô tả khu
   này liệt kê những gì (*"Tên, email, mã tài khoản của MỌI tài khoản…"*), mà
   nói **CHÍNH tài khoản đang đăng nhập là ai** — họ tên, email, mã ngắn.
2. **`layPhien()` mang thêm trường `hoTen`** — họ tên của TÀI KHOẢN đang đăng
   nhập (không phải người trong sơ đồ gia phả). Đọc thẳng bảng `tai_khoan`
   qua luật RLS có sẵn từ `11-quyen-he-thong.sql`, không thêm hàm SQL nào.

**Không đụng SQL.** Trường `hoTen` đọc được nhờ luật RLS `for select … using
(user_id = auth.uid())` đã có từ `11`, chỉ là chưa ai hỏi tới trước b109d.

---

## Vì sao — phần đáng đọc

### Vì sao câu dẫn cũ bị bỏ, dù nó vừa được viết lại cẩn thận ở b109c

b109c đã sửa câu dẫn một lần trong ngày, và sửa đúng: cắt bớt phần thừa, giữ
lại phần không đoán được từ màn hình. Bản ấy không sai về mặt kỹ thuật — nó mô
tả đúng khu này liệt kê gì.

Nhưng sau khi bấm thử trên máy chủ thật, chủ dự án nhận ra một câu hỏi khác
quan trọng hơn: **đang đăng nhập bằng tài khoản nào?** Lý do có thật và cụ
thể — cờ Quản trị hệ thống có thể cấp cho **nhiều** tài khoản, và tấm lọc
*Toàn hệ thống* là màn hình DUY NHẤT sửa được cờ ấy cho người khác. Một người
quản trị mở nhầm phiên, hoặc dùng chung máy với người khác, mà không để ý
đang đăng nhập bằng ai — bấm nhầm ở đúng màn hình này là hậu quả nặng nhất
trong cả app: cấp hoặc rút quyền hệ thống cho sai người.

Đây không phải "đổi ý ngẫu nhiên" — nó là một câu hỏi **chỉ nảy ra khi nhìn
thấy chính màn hình thật**, đúng loại phát hiện mà ba vòng trước (b109,
b109b, b109c) đều bắt đầu từ cùng một cách: bấm thử rồi nói ra cái vướng.

### Vì sao đọc thẳng bảng `tai_khoan`, không viết hàm `security definer` mới

`11-quyen-he-thong.sql` mục 1 đã đặt luật:

```sql
create policy rieng_tai_khoan on public.tai_khoan
  for select to authenticated
  using (user_id = auth.uid());
```

Nghĩa là **bất kỳ ai đã đăng nhập đọc được đúng dòng của chính mình** trong
bảng `tai_khoan` — không cần đi qua hàm nào cả, RLS tự lọc. Đây là luật đã có
sẵn từ trước b109d, y hệt cách `ma_tai_khoan_cua_toi()` và
`caiDatCay()`/`user_settings` đang làm. Viết một hàm `security definer` mới
chỉ để đọc một cột của chính dòng mình là dựng thêm một cửa cho một việc RLS
đã mở sẵn.

### Vì sao gộp vào cùng một `Promise.all()` với ba câu hỏi cũ

`layPhien()` chạy ở đầu **mọi trang**, không riêng gì khu Quản trị. Ba câu hỏi
cũ (thành viên cây nào, có phải Quản trị hệ thống, mã ngắn) đã đi cùng một
lượt từ b103 — thêm câu thứ tư nối tiếp sau đó là thêm một vòng mạng cho
*mọi lần mở app*, kể cả những trang không bao giờ dùng tới `hoTen`. Gộp vào
`Promise.all()` sẵn có thì chi phí thêm là 0 vòng mạng, chỉ thêm một câu hỏi
song song.

### Vì sao trống thì bỏ hẳn dòng, không phải "Bạn: (chưa đặt tên)"

`danHeThong()` ghép `hoTen`, `email`, `maNgan` bằng dấu `·`, và bỏ hẳn phần
nào rỗng thay vì điền chữ giữ chỗ. Đúng `CLAUDE.md` mục 7 — trường trống thì
không vẽ hàng đó, không ghi "Không rõ". Trên thực tế `email` gần như không
bao giờ rỗng ở đây (người đọc được màn hình này đã đăng nhập), nhưng `hoTen`
có thể rỗng nếu Quản trị hệ thống ấy chưa tự điền tên cho chính mình — câu
vẫn đọc được, chỉ ngắn hơn một chút.

---

## Đã thử mà hỏng

Không có gì hỏng lần này — thay đổi nhỏ, một trường dữ liệu, một câu chữ.

---

## Đã đo

| Phép | Kết quả |
|---|---|
| `supabase/kiem-thu/kiem-trang-quan-tri.mjs` | **154/154 ĐẠT** |
| `/kiem-tra` — chín phép phân lớp | **9/9 ĐẠT**, `domains/` 0 file khác, mốc `tuong-thich` vẫn 7 |
| `kiem-thu/xem-khung-quan-tri.mjs` → `kq-7.png` | Nhìn bằng mắt: *"Bạn đang đăng nhập bằng Nguyễn Trọng Dũng · trongdung1982@gmail.com · mã TK7Q2."* |

**Chủ dự án đã bấm thử bản trước (b109c) trên máy chủ thật** — b109d là phản
hồi trực tiếp của lần bấm đó. Bản thân b109d chưa ai bấm thử.

---

## Còn treo

- Chủ dự án bấm thử câu dẫn mới trên máy chủ thật.
- `settings.js` vẫn gọi vai trò là **Quyền** (chưa đổi — chỉ khu Quản trị đã
  đổi sang *Vai trò* ở b109c). Vẫn treo từ b109c.
- `ds_thanh_vien()` không trả `moi_luc`, ba tấm lọc cây không phân biệt được
  *đơn xin vào* với *lời mời chưa nhận*. Vẫn treo từ b109c.
- b110 — xoá gia phả hai chữ ký + thùng rác 30 ngày (`16-thung-rac-cay.sql`).

---

## File đã đụng tới

**Sửa** *(trong repo)*

- `js/services/sb.js` → 0.12.0 *(`layPhien()` thêm `hoTen`)*
- `js/pages/quan-tri/khu-thanh-vien.js` → 0.6.0 *(`danHeThong(phien)` thay `DAN_HE_THONG`)*

**Sửa** *(ngoài repo — `Claude_Code/kiem-thu/`)*

- `sb-gia.mjs` → 0.7.0 *(`layPhien()` giả thêm `hoTen`)*
