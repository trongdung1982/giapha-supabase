# b109b — Ô tìm/gợi ý cho form Mời và ô gắn mã người

*09/09/2026 12:39 · Claude Code CLI (Opus 5)*

Nửa sau của b109, tách ra ngay đầu phiên trước vì nó cần một hàm SQL mới và
một câu thiết kế phải bàn trước.

---

## Làm được gì

- `luoc-do/15-tim-kiem.sql` 0.1.0 — cột `tai_khoan.ho_ten`, và năm hàm:
  `dat_ho_ten_tai_khoan` · `bo_dau` · `ten_day_du` · `tim_tai_khoan` ·
  `tim_nguoi_trong_cay`. Cộng **dán đè ba hàm đọc** của `13`/`14`.
- `js/pages/quan-tri/o-goi-y.js` 0.1.0 **(file mới)** — một ô gợi ý dùng cho
  **cả ba chỗ** đang gõ tay mù, kèm hai khuôn dòng chữ dùng chung.
- Ba cầu nối ở `sb.js` 0.10.0, và nối vào ba màn hình.
- `kiem-thu/do-b109b.mjs` **(mới, ngoài repo)** — 36 phép đo hàng rào.
- `kiem-thu/do-goi-y.mjs` + `do-goi-y.html` **(mới, ngoài repo)** — đo bố cục
  bằng `getBoundingClientRect()`, thứ ảnh chụp không trả lời được.

---

## VÌ SAO

### Vì sao KHÔNG hạ quyền `ds_tai_khoan_he_thong()`

Câu treo từ b109 là: ô email lọc bằng hàm nào? Hàm ấy **chỉ Quản trị hệ thống
gọi được**, nên chủ cây thường sẽ không có gợi ý nào. Ba đường, và hai đường
bị chính phép đo loại:

1. **Hạ quyền hàm ấy** — nó trả **12 cột** gồm cờ quyền, cờ được tạo cây, lần
   đăng nhập gần nhất, số cây làm chủ. Ô gợi ý cần đúng **hai chữ**. Và nó
   **không có tham số lọc**: mỗi lần gõ một chữ là tải cả sổ đăng ký về trình
   duyệt rồi lọc tại chỗ — đúng thứ `THIET-KE-QUAN-TRI.md` khu 2 đã cấm.
2. **Dùng lại `ds_tai_khoan()` của `13`** — chủ cây gọi được, nhưng nó chỉ trả
   tài khoản **đã có chân** trong cây mình quản trị. Người sắp được mời, theo
   định nghĩa, chưa có chân trong cây ấy. Hàm ấy đúng cho việc *gắn người*,
   sai hẳn cho việc *mời*.
3. **Hàm tìm riêng** — chọn cái này.

### Vì sao ô gợi ý email KHÔNG phải là mở sổ đăng ký

Tôi vào phiên với nỗi lo "gõ 3 chữ ra 8 email là mở danh bạ cho mọi chủ cây",
và **đo lại thì nỗi lo ấy dùng sai thước**:

- `js/pages/dang-nhap.js` ghi rõ *"trang này không tự đăng ký được"*. **Mọi
  tài khoản đều do chủ dự án tạo tay.** Sổ này là một DANH BẠ do một người
  lập, không phải cái chợ ai vào cũng được — đúng hình dạng danh bạ tổ chức mà
  Google Workspace, Slack, Microsoft 365 cho mọi thành viên tìm tự do.
- Ai gọi được hàm này thì **hôm nay đã có sẵn một cái máy dò email**:
  `moi_vao_cay()` trả ba câu khác nhau cho *"chưa có tài khoản nào"*, *"đã có
  tên trong gia phả rồi"*, *"đang chờ nhận lời"*. Gõ thử từng email là biết.

Nên hàm mới gác bằng **đúng hàng rào của nút nó phục vụ** — `co_the_quan_tri()`,
y câu `moi_vao_cay()` hỏi. Nó **không thêm quyền nào; nó đổi tốc độ.** Chỗ
phải trả giá là tốc độ, và ba chốt chặn nằm ở đó: tối thiểu 2 ký tự, trần 8
dòng, không trả một cờ quyền nào. Chủ dự án chốt chấp nhận.

### Vì sao phải thêm cột `ho_ten` — chủ dự án chọn phương án B

Chủ dự án hỏi thẳng: *"có thể tìm tương đối không? phần mềm lớn họ làm thế
nào — theo email hay tên (có mở ngoặc email)?"*

Tra ra: phần mềm lớn không có một khuôn, họ có **hai**, chọn theo *vòng*.
Trong tổ chức (Workspace · Slack · Notion · Figma) thì gõ tên hoặc email ra
`Tên (email)`. Ngoài tổ chức (Drive chia sẻ ra ngoài · **GitHub mời vào
repo**) thì **không gợi ý gì**, phải gõ đủ địa chỉ — GitHub còn chặt hơn, tìm
người theo email **chỉ khớp khi trùng khít cả địa chỉ**.

Nhưng đo tiếp thì gặp chỗ chặn thật: **tài khoản trong app này chưa có tên.**
`tai_khoan` đúng năm cột; tên chỉ tồn tại khi đã gắn vào người trong một cây.
Mà người hay được mời nhất — tài khoản vừa cấp, chưa gắn vào đâu — chính là
người **không có tên ở đâu để mượn**. Không có cột này thì ô gợi ý email chỉ
hiện được tám dòng email na ná nhau, tức làm xong mà không giải quyết được
đúng cái đau.

Chủ dự án chọn **B** (thêm cột), và thêm một câu: *"bổ sung hiện mã người như
mấy phần mềm gia phả để chắc chắn đúng người"*. Nên dòng gợi ý người mang
khuôn của Ancestry · MyHeritage · Gramps: **tên, năm sinh–mất trong ngoặc, mã
đứng cuối như một cái nhãn**, cộng câu *"đã gắn cho ai"*.

### Vì sao KHÔNG thêm `unaccent` / `pg_trgm`

Bỏ dấu là 95% cái đau (`nguyen tr` → `Nguyễn Trọng`), và `bo_dau()` mười dòng
bằng `translate()` thuần làm được, chép đúng bảng chữ của `js/utils/text.js`.
Chịu lỗi **gõ sai chữ thật** (`hnug` → `hùng`) mới cần `pg_trgm` — mà thêm thư
viện thì luật bắt hỏi trước. Chưa thêm: danh bạ vài chục người, và cửa ấy
không đóng lại — ngày nào cần thì chỉ sửa bên trong hai hàm tìm, hình dạng
chúng trả về không đổi.

### Vì sao KHÔNG dùng `like` một chỗ nào

Chuỗi người ta gõ đi thẳng vào mẫu khớp, mà `%` và `_` là ký tự đại diện của
`like`. **Gõ đúng một chữ `%` là lấy về tám dòng đầu của cả danh bạ**, không
cần biết gì thêm. `position()` không có ký tự đại diện nào để lợi dụng, nên
chuyện ấy *không tồn tại* thay vì phải nhớ thoát chuỗi cho đúng. Hai phép HR7
và HR8 canh đúng chỗ này.

### Vì sao một ô gợi ý cho ba chỗ, không chép ba bản

Ba ô hỏi ba câu khác nhau nhưng **cư xử giống hệt nhau**. Chép ba bản thì hôm
nay giống nhau và lệch dần từ lần sửa thứ hai — đúng lý lẽ b109 đã dùng để
KHÔNG chép năm hàm việc của `13`. `o-goi-y.js` **không biết Supabase là gì**;
nơi gọi truyền hàm `tim` vào.

---

## ⚠⚠ HAI LỖI ĐANG CHẠY, BẮT ĐƯỢC TRÊN ĐƯỜNG

### 1. Cột "Người được gắn" chưa bao giờ hiện được một cái tên nào

`ds_thanh_vien()` (`13` mục 7) và `ds_cay_cua_tai_khoan()` (`14` mục 9) lấy
tên người bằng `coalesce(p.vn->>'name', p.id, '')`. Đo trên 740 bản ghi thật
của bàn thử: **`vn->>'name'` là null ở cả 740 dòng.** Cột `vn` giữ thứ khác
(`{"gio": "30/05", "generation": 6}`); tên thật nằm ở mảng `names`:

```
[{"type":"chinh","surname":"Nguyễn","middle":"Phúc","given":"Hiền"}]
```

Nên hai hàm ấy luôn rơi xuống nhánh `p.id`, và màn hình — `khu-thanh-vien.js`
có sẵn phép `if (t.tenNguoi && t.tenNguoi !== t.maNguoi)` — thấy tên trùng mã
nên **giấu luôn đi**. Không ai báo lỗi vì màn hình trông vẫn "đúng", chỉ
thiếu. Đây là loại hỏng nguy hiểm nhất: một phép phòng thủ viết đúng đang
che một lỗi ở tầng dưới.

`15` mục 3b thêm `ten_day_du()` chép đúng luật `fullName()` của
`js/utils/text.js`, và dán đè cả hai hàm.

### 2. Huy hiệu đè lên email

Huy hiệu *Quản trị hệ thống* là `span` **inline** có `padding`. Khi ô hẹp lại
đủ để nó xuống dòng, **nền của nó tràn lên đè chữ ở dòng trên** — không phải
lỗi trình duyệt, đó là cách hộp inline vỡ qua hai dòng. Có sẵn từ b109; b109b
thêm dòng họ tên vào cùng ô nên nó lộ ra. Sửa: `display:inline-block`.

⚠ **Ảnh 1280px không đủ phân giải để phân biệt "đè" với "sát nhau".** Tôi nhìn
ảnh hai lần và không quyết được. Chỉ `getBoundingClientRect()` mới trả lời —
đó là lý do có `do-goi-y.mjs`, và nó là công cụ đọng lại của bước này.

---

## Đã thử mà hỏng

| Thử gì | Hỏng thế nào | Nếp rút ra |
|---|---|---|
| HR15 dựng cảnh xoá mềm bằng danh nghĩa **chủ cây** | psql in `UPDATE 0` — RLS chặn ghi thẳng vào `persons` với mọi người, đường ghi duy nhất là `luu_cay()`. Cảnh chưa bao giờ được dựng, phép đo báo lỗi của chính nó | **Thứ dùng để DỰNG CẢNH cũng đi qua hàng rào đang đo.** Dựng cảnh thì mượn quyền cao nhất; chỉ phép ĐO mới mượn danh nghĩa người thật. Cùng họ với bài học "mã cây phải là hằng số" của b107 |
| KC2 ghi sẵn chuỗi mong đợi **sau khi bẻ gãy** | Đoán sai: `translate()` với chuỗi sau ngắn hơn thì **xoá hẳn** ký tự thừa, nên bản gãy ra `nguyễn trọng bac` chứ không phải `nguyễn trọng bác` | Phép kiểm chứng ngược phải hỏi *"kết quả có còn ĐÚNG không"*, đừng đoán trước **hình dạng của một cái hỏng** — đó là tự đẻ thêm một chỗ để sai |
| Chạy `do-b109b.mjs` lần thứ hai | HR11c/HR11d đỏ: lời mời của lần trước đã `commit` thật. Hai phép đỏ trông y như lỗi của `15` | **Một phép đo chỉ đúng ở lần chạy đầu tiên thì không phải phép đo.** Dọn cảnh trước khi dựng |
| Bản giả `sb-gia.mjs` khớp chuỗi thô | Gõ `nguyen` không ra `Nguyễn` → phép đo báo *"ô gợi ý không mở"*, một lỗi hoàn toàn bịa. Mất 20 phút | Bản giả phải **cư xử** giống máy chủ thật, không chỉ **có mặt** giống. Máy chủ lọc sau khi bỏ dấu thì bản giả cũng phải bỏ dấu |

---

## Còn treo

- ⏳ **Chủ dự án dán `15-tim-kiem.sql`** — đụng bảng `tai_khoan` (thêm cột) và
  định nghĩa lại 5 hàm. Dán **sau** `13` và `14`. Tự kiểm phải ra **12 ĐẠT**.
- ⏳ **Chưa bấm thử trên máy chủ thật.** Bàn thử không có PostgREST, không có
  bộ đăng nhập, không có ai bấm nút.
- **Chủ dự án phải điền họ tên** cho những tài khoản đã cấp từ trước, ở khu
  *Toàn hệ thống* → Mở → *Họ tên*. Chưa điền thì ô gợi ý email chỉ hiện email.
- Chưa cho người ta **tự sửa tên mình** — cố ý, vì chưa có màn hình nào đi qua
  cửa ấy. Mở một cửa chưa có màn hình là mở một cửa không ai nhìn.
- Tài khoản `sao_luu` vẫn hiện trong gợi ý email. Vô hại, chỉ hơi nhiễu.
- ⚠ **b110 nay là `16-thung-rac-cay.sql`**, không phải `15` — số 15 đã dùng.

---

## File đã đụng tới

**Mới**
- `supabase/luoc-do/15-tim-kiem.sql` 0.1.0
- `supabase/js/pages/quan-tri/o-goi-y.js` 0.1.0
- `kiem-thu/ban-thu-sql/do-b109b.mjs` 0.1.0 *(ngoài repo)*
- `kiem-thu/do-goi-y.mjs` + `kiem-thu/do-goi-y.html` 0.1.0 *(ngoài repo)*

**Sửa**
- `supabase/js/services/sb.js` → 0.10.0
- `supabase/js/pages/quan-tri/khu-gia-pha.js` → 0.6.0
- `supabase/js/pages/quan-tri/khu-thanh-vien.js` → 0.4.0 *(gồm vá `huyHieu`)*
- `supabase/js/pages/quan-tri/khu-tai-khoan-he-thong.js` → 0.2.0
- `supabase/CHI-DAN.md` *(vẫn đúng 80/80 dòng)* · `KE-HOACH.md` ·
  `THIET-KE-QUAN-TRI.md` *(khu 2 + mục 6)* · `DU-LIEU.md` *(cột `ho_ten`)*
- `kiem-thu/sb-gia.mjs` → 0.4.0 *(ngoài repo)*

**Không đụng**: `domains/` — 10/10 file vẫn giống `giapha/` bit-với-bit.

---

## Đã đo

| Phép | Kết quả |
|---|---|
| Bảng tự kiểm `15-tim-kiem.sql` | **11/11 ĐẠT** *(12 sau khi thêm phép cột `ho_ten`)* |
| `do-b109b.mjs` — 18 hàng rào + 3 kiểm chứng ngược | **36/36 ĐẠT**, chạy hai lần cùng kết quả |
| `/kiem-tra` | **9/9 ĐẠT** |
| `kiem-trang-quan-tri.mjs` | **154/154 ĐẠT** |
| `do-goi-y.mjs` | 0 cặp đè nhau · 0 thứ rơi khỏi mép · gợi ý mở đúng chỗ, nằm trọn trong cửa sổ |
| Nhìn bằng mắt | 12 ảnh `kq-*.png` + `kq-goi-y.png` |
