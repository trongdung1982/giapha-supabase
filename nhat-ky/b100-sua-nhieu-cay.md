# b100 — Ba lỗi nhiều cây, và nạp cây Nguyễn Phúc Giáo

*05/09/2026 14:52*

---

## Việc đã làm

1. **Thiết kế chốt NHIỀU CÂY** — ba câu chủ dự án trả lời, ghi thành `THIET-KE-NHIEU-CAY.md`
2. **Sửa ba lỗi chỉ lộ ra khi có cây thứ hai**
3. **Sinh SQL di dời gia phả Nguyễn Phúc Giáo** (NPGQ8C9, 681 người) — `tai-lieu/di-doi-NPG-20260905.sql`
4. **Bộ kiểm mới** — `kiem-nhieu-cay.mjs` (35 phép) + `thu-nhieu-cay.sql` (16 phép chạy thật)
5. **Bàn thử SQL tại chỗ nay dựng hai cây**, tái hiện được lỗi nhiều cây
6. **Đẩy lên GitHub** — repo `trongdung1982/giapha-supabase`, nhánh `main`, commit `877a008..f478f1a`

---

## Vì sao chọn cách này

### Hỏng 1 — `chonGiaPha()` xoá sạch `user_settings` của mọi cây

Mã cũ "biết đang mở cây nào" bằng cách *chỉ giữ lại dòng của cây đang mở* trong
`user_settings`. Đổi cây là chạy `delete … where tree_id != cây_mới` — xoá sạch
`nguoi_trung_tam` của mọi cây còn lại.

Sửa bằng cách đảo chiều: mỗi dòng tự mang cờ `dang_mo = true/false`. Đổi cây là
cập nhật cờ, không xoá dòng. `chonGiaPha()` thôi delete.

### Hỏng 2 — `hienNgayGio` không lưu theo cây

Cột `hien_ngay_gio` chưa có trong bảng `user_settings`. Cờ này nằm trong bộ nhớ
trình duyệt, mất khi tắt tab. Thêm cột, nhớ riêng theo từng cây.

### Hỏng 3 — Tám chỗ tự chọn cây bằng `limit 1` không `order by`

Tám hàm trong `sb.js` / `repo.js` / `settings.js` / `khoi-dong.js` làm giả
việc nhận `tree_id` tường minh: chúng gọi một truy vấn `limit 1` không có
`order by`, PostgreSQL trả về bất kỳ hàng nào. Một cây thì may mắn — hai cây là
cờ may hết.

Sửa theo nguyên tắc: **ba hàm phải được nói rõ hỏi về cây nào**. Bỏ hẳn phép
đoán. Hàm nào chưa có `tree_id` thì báo lỗi sớm, không tự đoán im lặng.

### Sinh SQL phải tự dựng cây, không giả định cây đã có sẵn

Bộ sinh SQL cũ (`sinh-sql-di-doi.mjs`) đòi cây phải có trên máy chủ trước. Cây
NPGQ8C9 chưa có — nên file SQL di dời đầu ra sẽ `insert` vào `persons` của cây
không tồn tại → toàn bộ giao dịch tự huỷ.

Sửa: SQL di dời tự dựng cây bằng một nhánh `insert into trees … on conflict do
nothing`, đồng thời chèn người quản trị vào `tree_members` trong cùng một khối.
Lý do gộp chung: `trees` trơ trọi là cây không ai vào được — kể cả người vừa
dựng — vì RLS chặn từ tầng máy chủ.

### Bài kiểm phải thu hẹp chứ không nới rộng

Hai phép gác cũ trong `kiem-di-doi.mjs` nói "file di dời không được đụng
`tree_members`" và "mọi câu xoá đứng trước mọi câu chèn". Cả hai bị vi phạm
một cách **cố ý** bởi nhánh dựng cây kèm người quản trị.

Không nới phép kiểm cho xanh — thu hẹp đúng điều chúng thật sự gác: **chỉ được
chèn vào `tree_members`, không sửa không xoá, và chỉ trong nhánh dựng cây mới** —
cây đã có thì không chạm tới. Nguyên tắc cũ giữ nguyên; định nghĩa viết sai.

---

## Đã thử mà hỏng

*(Không có thất bại lớn trong bước này — bản báo cáo Claude Code không ghi ca
nào hỏng phải làm lại.)*

---

## Còn treo

- **Ba file chưa dán vào máy chủ thật** — chủ dự án cần làm theo đúng thứ tự:
  1. `supabase/luoc-do/10-sua-nhieu-cay.sql` — bảng 9 dòng, phải ĐẠT cả 9
  2. `tai-lieu/di-doi-NPG-20260905.sql` — bảng 7 dòng, hai cột số phải bằng nhau
  3. `supabase/kiem-thu/thu-nhieu-cay.sql` — dòng cuối phải là TẤT CẢ 16 PHÉP ĐẠT
  (Hướng dẫn chi tiết: `supabase/di-doi/HUONG-DAN-DI-DOI.md`, mục LẦN THỨ HAI)
- **Điểm dừng bấm tay**: mở app → Cài đặt → Gia phả → chọn Nguyễn Phúc Giáo
  (phải vẽ ra 681 người) → đặt người trung tâm cho mỗi cây → đổi qua đổi lại ba
  lần → người trung tâm của cả hai cây phải còn nguyên
- **Tên gọi** (`THIET-KE-NHIEU-CAY.md` mục 11) chủ dự án chưa chốt — chặn b102,
  không chặn b101

---

## File đã đụng tới

**MỚI:**
- `supabase/THIET-KE-NHIEU-CAY.md`
- `supabase/luoc-do/10-sua-nhieu-cay.sql`
- `supabase/kiem-thu/thu-nhieu-cay.sql`
- `supabase/kiem-thu/kiem-nhieu-cay.mjs`
- `tai-lieu/di-doi-NPG-20260905.sql` *(ngoài repo, chứa gia phả)*

**SỬA:**
- `supabase/js/services/sb.js` → 0.4.0
- `supabase/js/services/repo.js` → 0.2.0
- `supabase/js/pages/settings.js` → 1.29.0
- `supabase/js/pages/khoi-dong.js` → 0.10.0
- `supabase/kiem-thu/kiem-di-doi.mjs` → 46 → 47 phép (thu hẹp hai phép gác)
- `supabase/kiem-thu/sinh-sql-di-doi.mjs` *(ngoài repo)*
- `supabase/CHI-DAN.md`
- `supabase/KE-HOACH.md`
- `supabase/THIET-KE-QUAN-TRI.md`
- `supabase/di-doi/HUONG-DAN-DI-DOI.md`

---

## Số đo

| Bộ kiểm | Kết quả |
|---|---|
| `10-sua-nhieu-cay.sql` bảng tự kiểm | 9/9 đạt trên bàn thử |
| Bảng đối chiếu di dời NPG | 7/7 dòng khớp |
| `thu-nhieu-cay.sql` — chạy thật trên hai cây | 16/16 đạt |
| `kiem-nhieu-cay.mjs` | 35/35 đạt |
| `kiem-di-doi.mjs` | 46 → 47/47 đạt |
| Năm bộ kiểm cũ | 19 · 59 · 40 · 111 · 33 · 49 — đạt hết |
| `/kiem-tra` | 9/9 phép đạt |

---

## Ghi chú kỹ thuật nhỏ

- `CHI-DAN.md` nay 79/80 dòng — **lần thêm sau phải dời thứ gì đó ra**, không
  được thêm thẳng vào.
- Commit `877a008..f478f1a` gồm cả commit b99 chưa đẩy hôm trước.
