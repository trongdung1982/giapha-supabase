# b103 — Khu Gia phả, và Cài đặt gọn lại

*08/09/2026 06:55 · Claude Code CLI (Opus 5)*

---

## Làm được gì

- `luoc-do/11-quyen-he-thong.sql` lên **0.3.0**: hàm mới
  `dat_cho_nguoi_la_thay_ten(p_tree, p_cho)`; `ds_gia_pha()` thêm cột
  `toi_la_chu` và một nhánh cho người **đang chờ duyệt**; bảng tự kiểm 16 → 18.
- `kiem-thu/ban-thu-sql/do-b103.mjs` *(ngoài repo)* — **22/22 ĐẠT**, kèm
  **3/3 phép kiểm chứng ngược**.
- `js/pages/quan-tri/khu-gia-pha.js` **mới** — khu 1 chạy thật: bảng mọi cây
  người ta THẤY được, nút Chọn / Xin quyền, công tắc *cho người lạ thấy tên*,
  ô đặt cây mặc định (chỉ Quản trị hệ thống).
- `sb.js` 0.5.0: `layPhien()` biết Quản trị hệ thống và cửa cây mặc định;
  `layDanhSachGiaPha()` đi qua RPC; ba cửa mới.
- `settings.js` 1.30.0: gỡ hai khối đã có chỗ nhận, thêm dòng *Mã tài khoản*
  và nút *Mở trang Quản trị*.
- `config.js` 0.21.0 nhận `vaiTroBangChu()`; `khung.js` 0.2.0 nối khu 1.
- Hai bộ kiểm cập nhật: `kiem-kiem-duyet` 112/112, `kiem-trang-quan-tri` 73/73.

---

## VÌ SAO

### 1. Vì sao sửa thẳng file `11` chứ không đẻ ra file `12-vá-11.sql`

b103 phải đổi `ds_gia_pha()` — một hàm đã dán lên máy chủ thật hôm qua. Hai
đường: viết một file mới chỉ chứa phần vá, hay sửa tại chỗ rồi nhờ dán lại cả
file.

Chọn đường thứ hai, và nó có một điều kiện phải **đo trước** chứ không được
đoán: file `11` có dán lại được lần thứ hai không. Đã đo trên bàn thử — chạy
nó hai lần liên tiếp, lần hai chỉ ra bốn dòng `NOTICE` và không một lỗi nào.
Mọi câu trong file đều `if not exists` / `or replace` / `drop … if exists`.

Đường thứ nhất nghe an toàn hơn nhưng để lại một cái bẫy: file `11` trong repo
sẽ giữ **bản cũ** của `ds_gia_pha()`, và ngày nào có người dán lại `11` sau khi
đã dán `12` thì hàm lùi về bản cũ — im lặng, không báo gì. Đó đúng là kiểu hỏng
mà dự án này đã gặp ở `03-ham-luu-cay.sql` và đã chọn cách chữa: sửa tại chỗ,
nâng số phiên bản, dán lại. Nay ghi câu ấy vào ngay đầu file `11` để lần sau
không phải đo lại.

### 2. Vì sao `toi_la_chu` phải là một CỘT của máy chủ

Bản Antigravity biết chủ cây bằng cách so chuỗi ngay trong trình duyệt:
`c.emailChu.toLowerCase() === phien.email.toLowerCase()`.

Nó **không phải lỗ hổng** — máy chủ vẫn chặn ở `dat_cho_nguoi_la_thay_ten()`.
Nhưng nó sai theo hướng khó thấy hơn: cây chưa gán `chu_so_huu` thì `email_chu`
là `null`, và **chủ cây thật không thấy công tắc của chính mình** mà không có
gì giải thích. Một hàng rào sai theo hướng "chặn nhầm người có quyền" thì không
ai báo lỗi, người ta chỉ lặng lẽ nghĩ là app hỏng.

Luật này đã có sẵn trong `sb.js` từ b93, viết ở chỗ `suaDuoc`: *hỏi máy chủ,
đừng tự suy từ `vaiTro`*. Chỗ ấy nói về quyền sửa; đây là cùng một luật áp cho
quyền đứng tên. Thêm một cột vào `ds_gia_pha()` là hai dòng SQL, và nó dập tắt
cả một loại câu hỏi "vì sao tôi không thấy nút".

### 3. Vì sao KHÔNG gỡ khối *Đơn chờ duyệt*, dù kế hoạch b103 bảo gỡ

`KE-HOACH.md` mục b103 viết: *"Gỡ khối Gia phả và Đơn chờ duyệt khỏi
`settings.js`"*. Làm đúng câu ấy thì từ hôm nay tới **b106** không còn đường
nào duyệt đơn xin vào cây.

Và b103 vừa làm cho việc ấy tệ hơn chứ không nhẹ đi: khu 1 mới dựng **nút Xin
quyền**, tức từ nay đơn sẽ NHIỀU HƠN trước. Dời một cánh cửa đi trước khi mở
cánh cửa mới là nhốt người ta ở giữa.

Nên luật đi theo là: **khối trong Cài đặt chỉ được gỡ khi khu bên kia đã viết
xong**, không phải khi kế hoạch nói tới nó. Theo đó b103 gỡ đúng hai khối:

| Khối | Khu nhận | Viết xong khi nào | b103 làm gì |
|---|---|---|---|
| Gia phả | khu 1 `#gia-pha` | **b103, hôm nay** | gỡ |
| Duyệt nội dung | khu 3 `#kiem-duyet` | b98 | gỡ |
| Đơn chờ duyệt | khu 2 `#thanh-vien` | **b106, chưa** | **để lại** |
| Sao lưu | khu 4 `#sao-luu` | **b108, chưa** | **để lại** |

Cài đặt vì thế xuống **8 khối**, không xuống 6. Con số 6 của kế hoạch vẫn đúng
— nó chỉ đúng ở b108, không đúng hôm nay.

### 4. Vì sao `vaiTroBangChu()` dời xuống `config.js`

Khu 1 phải in tên vai trong cột *Vai của tôi*. Hàm dịch tên đang nằm trong
`settings.js`, và bản Antigravity giải quyết bằng cách **chép nó sang file
mới** — hai bản chép của cùng một bảng tên.

Dự án này đã trả giá cho đúng chuyện ấy ngày 04/09: mã vai `chu` nằm rải thành
chữ viết thẳng ở **11 hàm, 2 luật RLS, 1 ràng buộc**, nên đổi tên nó phải dán
lại năm file SQL. Bài học ghi ở `KE-HOACH.md` là *"tên vai nằm rải thay vì gọn
vào một chỗ"*. Chép thêm bản thứ hai là đi đúng lại con đường ấy, chỉ ở tầng
JavaScript.

`config` là lớp đúng: `CLAUDE.md` mục 5 định nghĩa nó là *"hằng số hiển thị"*,
mà bảng tên bốn hạng người chính là thế. Và bộ kiểm nay canh **cả hai chiều**:
`config.js` phải có hàm, `settings.js` phải KHÔNG còn bản chép.

### 5. Vì sao cột `email_chu` vẫn đi ra cho người lạ

Vì đó là **đường liên hệ để xin quyền**, đã chốt ở `THIET-KE-NHIEU-CAY.md` mục
*Ba tầng nhìn thấy*. Phép đo `do-b103.mjs` cố ý **KỲ VỌNG thấy email** — ai đọc
mã rồi tưởng là lỗ hổng và vá đi sẽ làm phép đo đỏ ngay, và đọc được lý do tại
chỗ. Đó là cách rẻ nhất để một quyết định cũ tự bảo vệ mình.

Khác hẳn `tree_members`: bảng ấy lộ email **của cả họ**, không phải của một
người tự nguyện đứng tên. Phép đo canh riêng điều đó — người lạ đọc
`tree_members` của cây công khai vẫn ra **0 dòng**.

### 6. Vì sao phép đo phải đọc lại CỘT, không đọc cờ `ok`

Hàm công tắc trả về `{ok: true}`. Nếu chỉ hỏi cờ ấy thì bản đầu (codex/, 07/09)
**qua hết**: nó chạy `update … where id = p_tree` rồi trả `ok:true` bất kể có
dòng nào đổi hay không — mã cây gõ sai vẫn báo lưu xong.

Nên `batCongTac()` gọi hàm dưới danh nghĩa người dùng, rồi **đọc lại giá trị
cột** bằng `postgres` trong cùng giao dịch, và so cả cặp `ok|cột`. Cờ `ok` là
lời KHAI của hàm; giá trị cột là SỰ THẬT. Cùng một câu đã học ở b102 — *hỏi hàm
quyết quyền không phải là đo hàng rào* — chỉ đổi chỗ áp dụng.

---

## Đã thử mà hỏng

### a. Khôi phục hàm bằng `pg_get_functiondef()` rồi chạy qua `psql -c`

Ba đòn kiểm chứng ngược bẻ gãy hàm rồi phải trả lại nguyên trạng. Cách đầu:
đọc định nghĩa gốc bằng `pg_get_functiondef()`, chạy lại nó sau khi đo xong.

**Hỏng, và hỏng âm thầm.** Định nghĩa hàm chứa tiếng Việt, mà `psql.exe` trên
Windows đọc tham số `-c` theo bảng mã ANSI của hệ (cp1252) chứ **không** theo
`PGCLIENTENCODING`. Câu khôi phục ném `invalid byte sequence for encoding
"UTF8"`, phép đo không đọc mã lỗi ấy, và **mọi phép đo sau đó chạy trên một bàn
thử còn nguyên vết bẻ gãy**.

Kết quả: 14/20 với ba phép HỎNG hoàn toàn bịa — *"người lạ bật được công tắc
cây người khác"*, đúng cái nghe như một lỗ hổng an ninh nghiêm trọng. Mất một
vòng đi tìm lỗ hổng không có thật.

**Nếp rút ra: tiếng Việt đi vào psql phải đi bằng FILE (`-f`), không đi bằng
dòng lệnh (`-c`).** `-f` đọc theo `PGCLIENTENCODING` nên không dính. Nay
`khoiPhuc()` chạy lại chính `11-quyen-he-thong.sql`, và **thoát ngay** nếu
không khôi phục được — im lặng đi tiếp là cách hỏng đắt nhất. Các `sql()` khác
trong file cố ý chỉ dùng chữ không dấu.

### b. Đòn bẻ gãy có chữ ký lệch thì không bẻ được gì cả

Sau khi thêm cột `toi_la_chu`, đòn 1 vẫn dựng bản bẻ gãy theo chữ ký cũ.
Postgres từ chối `create or replace` khi kiểu trả về đổi — nên hàm **không hề
bị bẻ**, phép đo thấy mọi thứ bình thường, và tự báo *"phép đo mù"*.

Nghĩa là một đòn kiểm chứng ngược có thể **hỏng theo hướng báo mình vô dụng**
trong khi nó vẫn tinh. Nay đòn 1 kiểm mã trả về của lệnh bẻ gãy và **dừng cả
phép đo** nếu không áp được — thà đứng lại còn hơn đo một thứ không tồn tại.

### c. Gỡ khối *Duyệt nội dung* suýt lấy đi lối vào trang Quản trị

Khối ấy chứa nút `window.location.href = 'QuanTri.html'` — và đó là **đường vào
duy nhất**. Gỡ khối là gỡ cả cửa, mà màn hình vẫn trông bình thường.

Phép kiểm PHẦN E của `kiem-trang-quan-tri.mjs` bắt được ngay, vì khi đổi chiều
nó tôi giữ lại đúng câu hỏi cũ dưới dạng mới: *dời khối đi thì đường vào mới ở
đâu*. Đã thêm nút *Mở trang Quản trị* vào khối **Tài khoản và quyền**, và nút
ấy **không hỏi vai trò** — khu 1 phục vụ đúng người CHƯA có quyền, ẩn nút theo
vai là khoá cửa của chính người cần nó nhất.

### d. Một regex quét quá rộng

Phép kiểm mới *"khu Gia phả không còn câu chưa làm"* dùng
`/'gia-pha'[\s\S]{0,120}chuaLam/` — 120 ký tự bất kể ranh giới, nên nó vớ luôn
`chuaLam` của **mục sau** và báo hỏng oan. Đổi thành `[^}]*` để dừng ở dấu `}`
của chính mục ấy. Lại là thước đo sai, không phải vật đo sai — lần thứ ba
trong phiên.

---

## Còn treo

- ⚠ **Chưa ai bấm thử trên app.** Cả hai tầng đều đã đo, nhưng đo là máy chủ và
  bộ kiểm tự nói về mình. Cái chưa có là một người mở trình duyệt, đăng nhập
  bằng tài khoản không có chân ở cây nào, và bấm Xin quyền. Đúng loại kiểm
  chứng chỉ người bấm mới đóng được — b96 và b101 đã dạy hai lần.
- ⚠ **`11-quyen-he-thong.sql` 0.3.0 chưa dán.** Máy chủ thật đang chạy 0.2.0,
  chưa có hàm công tắc và chưa có cột `toi_la_chu`. Khu 1 mở ra sẽ báo lỗi cho
  tới khi chủ dự án dán lại file.
- `js/pages/chon-gia-pha.js` **nay không còn lối vào nào** — nút mở nó nằm
  trong khối Gia phả vừa gỡ. File còn nguyên trong repo, chưa xoá (xoá file
  phải hỏi chủ dự án). Nó là màn hình thời Drive, còn nói về `Config.gs` và
  `FILE_ID`; b104 dựng màn hình tạo cây mới trong khu 1 sẽ thay nốt phần cuối
  cùng của nó, và lúc ấy hỏi chủ dự án cho xoá.
- Cài đặt còn **8 khối**, về 6 ở b108.
- b104 và b105 chưa động tới. Bản Antigravity của chúng vẫn nằm nguyên trong
  `codex/`, chờ rà bằng phép đo.

---

## File đã đụng

**Mới**

- `supabase/js/pages/quan-tri/khu-gia-pha.js`
- `supabase/nhat-ky/b103-khu-gia-pha.md`
- `kiem-thu/ban-thu-sql/do-b103.mjs` *(ngoài repo)*

**Sửa**

- `supabase/luoc-do/11-quyen-he-thong.sql` 0.2.0 → **0.3.0**
- `supabase/js/services/sb.js` 0.4.0 → **0.5.0**
- `supabase/js/pages/settings.js` 1.29.1 → **1.30.0**
- `supabase/js/config.js` 0.20.0 → **0.21.0**
- `supabase/js/pages/quan-tri/khung.js` 0.1.0 → **0.2.0**
- `supabase/kiem-thu/kiem-kiem-duyet.mjs` *(PHẦN I đọc `config.js`)*
- `supabase/kiem-thu/kiem-trang-quan-tri.mjs` *(PHẦN E đổi chiều, PHẦN F đếm lại)*
- `supabase/KE-HOACH.md` · `supabase/nhat-ky/INDEX.md` · `PHOI-HOP-AI.md`

**Chép nguyên**: không có. Bản Antigravity trong `codex/` được đọc để lấy ý,
không chép một file nào — bốn chỗ đã lệch hẳn, ghi ở mục *VÌ SAO*.

**Xoá**: không có.
