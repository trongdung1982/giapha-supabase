# b107 — Mời vào gia phả, cờ Quản trị hệ thống, xoá tài khoản

*09/09/2026 06:49 · tầng máy chủ · đo 59/59 trên bàn thử · CHƯA DÁN*

## Làm được gì

`luoc-do/14-loi-moi.sql` — 3 cột trên `tree_members` (`moi_boi` · `moi_luc` ·
`moi_vai`) và **8 hàm**:

| Hàm | Việc |
|---|---|
| `moi_vao_cay` | chủ cây / Quản trị hệ thống ngỏ lời |
| `loi_moi_cua_toi` · `nhan_loi_moi` · `tu_choi_loi_moi` | người được mời quyết định |
| `dat_quan_tri_he_thong` | bật/tắt cờ toàn hệ thống |
| `ds_tai_khoan_he_thong` · `ds_cay_cua_tai_khoan` | khu Tài khoản nhìn toàn hệ thống |
| `xoa_tai_khoan` | xoá hẳn một tài khoản, và chuyển chủ những cây nó đang giữ |

Cộng dán đè `ds_gia_pha()` để thêm ba cột lời mời.

## VÌ SAO

### Vì sao ba trạng thái trên một bảng, không đẻ bảng `loi_moi`

Chủ dự án chốt: *"quyền vào gia phả hay không là quyền mỗi người."* Nghĩa là
vào cây cần **hai chữ ký** — một bên ngỏ lời, một bên nhận. Hôm nay đã có một
chiều (xin → duyệt); bước này thêm chiều ngược (mời → nhận).

Cả hai chiều trả lời đúng một câu: *tài khoản này đứng ở đâu trong cây này*.
Nên chúng ở chung một bảng, khác nhau đúng một cột `moi_luc`. Đây là lần thứ
hai dự án dùng lý lẽ ấy — lần đầu là hàng chờ đăng ký
(`THIET-KE-QUAN-TRI.md` mục 7 điều 3): **hai bảng cho một quan hệ là hai chỗ
để lệch nhau.**

### ⚠ Vì sao vai được mời phải nằm ở cột RIÊNG — cái bẫy đắt nhất bước này

`la_thanh_vien()` cho vào cây khi `approved` **hoặc** vai nằm trong
`('quan_tri_he_thong','quan_tri','sao_luu')`. Mệnh đề đi tắt ấy `07` cố ý đặt
vào và b102 đã trả giá để giữ nó.

Hậu quả: **một lời mời ghi vai `quan_tri` thẳng vào cột `role` sẽ mở cả gia phả
ra ngay lúc mời**, trước khi người kia bấm gì — phá đúng luật vừa chốt.

Nên vai được mời nằm ở `moi_vai`; `role` giữ `xem` tới lúc nhận. Cách này
**không đụng một dòng nào** của hàm nền móng.

Và tôi không tin lời mình vừa viết: phép KC2 **cố tình viết lại kiểu sai** rồi
đo — cây mở ra thật, 59 người hiện hết. Đó mới là bằng chứng cách đúng đang
chặn, chứ không phải "trông có vẻ chặn".

### Vì sao nhận lời mời KHÔNG phá luật "không ai tự đặt quyền cho mình"

Nhìn qua thì người ta tự đặt `approved = true` cho dòng của chính mình. Ranh
giới nằm ở ba chỗ, và cả ba kiểm được: chỉ lật đúng cột `approved`, chỉ lật
khi dòng có `moi_luc` (tức có người đủ thẩm quyền đã ký trước), và vai lấy từ
`moi_vai` — thứ **người mời** chọn. Hàm không nhận tham số vai, nên không có
gì để nâng.

### Vì sao xoá tài khoản thì CHUYỂN CHỦ CÂY, không đòi họ bàn giao

Xem mục *Đã thử mà hỏng* — đây là chỗ chủ dự án bác bỏ bản đầu.

## Đã thử mà hỏng

### 1. Bắt tài khoản sắp bị xoá tự bàn giao cây — chủ dự án bác bỏ ngay

Bản đầu **từ chối** xoá một tài khoản đang làm chủ cây, bắt bàn giao trước.
Lý lẽ nghe xuôi: `trees.chu_so_huu` khai `on delete set null`, xoá chủ là cây
mất chủ trong im lặng. Nguyên văn chủ dự án:

> *"tài khoản bị xóa thường có vi phạm nhất định, yêu cầu họ bàn giao là không
> khả thi. vì vậy xoá thì chỉ định người làm chủ cây, mặc định tài khoản quản
> trị hệ thống thực hiện thao tác xoá sẽ là chủ cây."*

**Nếp rút ra: một hàng rào mà lối đi qua nó nằm trong tay chính người đang bị
đuổi thì không phải hàng rào.** Nó chỉ đổi *"cây mất chủ"* thành *"không xoá
được tài khoản hỏng"* — dời cái kẹt sang chỗ khác rồi gọi đó là an toàn.

Nay cây sang tên **trong cùng giao dịch với lệnh xoá**, mặc định cho người bấm
nút. Không có khoảnh khắc nào cây tồn tại mà không có chủ.

### 2. Nói một câu về lược đồ mà chưa mở lược đồ ra xem

Tôi bảo *"xoá tài khoản thì xoá cả dấu vết trong nhật ký thay đổi"*. **Sai.**
`change_log` giữ `by_email` là chữ và `user_id` là uuid rời, **không có khoá
ngoại** tới `auth.users` — lịch sử ai sửa gì còn nguyên. Một lệnh `grep` là ra;
tôi suy từ trực giác về từ "cascade" thay vì đọc.

Nếp: câu nào nói về lược đồ thì mở lược đồ ra, kể cả khi nghe hiển nhiên. Nay
có phép HR15m canh đúng chỗ ấy.

### 3. Gọi một hàm trigger như hàm thường

`dat_quan_tri_he_thong` gọi `tao_ma_ngan_tai_khoan()` để sinh mã ngắn. Nó là
**hàm trigger**; Postgres ném `trigger functions can only be called as
triggers` và cả cửa ấy hỏng. **Bảng tự kiểm cuối file SQL vẫn báo 5/5 ĐẠT** —
vì nó chỉ hỏi *"hàm có tồn tại không"*, đúng khoảng cách b102 đã đo ra. Bàn
thử tại chỗ bắt được.

### 4. Bản nháp làm rơi mất mệnh đề `where` của `ds_gia_pha()`

Tôi viết lại thân hàm theo danh sách cột thay vì chép của `11`, và làm rơi cả
khối `where`. Hàm là `security definer`, nên bản ấy để **mọi tài khoản đăng
nhập đọc được tên, mã và số người của MỌI gia phả** trên máy chủ. Bắt được lúc
đối chiếu với bản gốc trước khi chạy.

Nếp: **dán đè một hàm đang chạy thì chép nguyên thân nó rồi mới thêm**, đừng
viết lại từ danh sách cột. Nay có phép HR14 canh riêng.

### 5. Phép ĐO tự đi qua đúng hàng rào nó đang đo

`do-b105.mjs` viết mã cây thành câu `select ... from trees where tree_code`
lồng vào khối mượn danh nghĩa, và chạy đúng — vì mọi nhân vật của nó đều thấy
cây ấy. Ở b107 thì không: hai nhân vật chính là **người ngoài** và **người
chưa nhận lời mời**, mà câu `select` ấy chạy dưới danh nghĩa họ, tức đi qua
RLS. Họ không thấy cây → hàm nhận `p_tree = null` → **5 phép HỎNG hoàn toàn
bịa**, và cả 5 trông y như lỗi thật.

Nếp, cùng họ với *"psql `-c` nuốt tiếng Việt"*: **thứ mình dùng để đo cũng đi
qua đúng hàng rào mình đang đo.** Hỏi mã cây một lần bằng `postgres`, rồi cắm
hằng số.

### 6. Thêm tham số có mặc định KHÔNG thay hàm cũ

`xoa_tai_khoan` từ 2 lên 3 tham số. `create or replace` đẻ ra **bản nạp
chồng**, giữ nguyên bản cũ, và mọi lời gọi 2 tham số sau đó ném
`function ... is not unique`. Phải `drop` bản cũ trước.

### 7. Tôi lại suy giờ thay vì đọc đồng hồ

Tôi viết *"giờ đã 00:20"* để giải thích vì sao dừng, trong khi đồng hồ là
**06:49**. Suy từ mạch chuyện trong phiên, đúng lỗi đã mắc hai lần trước. Lý
do dừng vẫn đúng (không sửa tầng nền móng ở cuối một phiên dài), chỉ con số là
bịa. Nếp cũ, nhắc lại: **giờ giấc thì chạy `date`.**

## Còn treo

- ⏳ **`14-loi-moi.sql` CHƯA DÁN vào máy chủ thật.** Bảng tự kiểm cuối file
  phải ra **8 dòng ĐẠT**.
- ⚠ **Chỗ bàn thử nói dối:** Supabase thật còn `auth.identities`,
  `auth.sessions`, `auth.refresh_tokens` trỏ về `auth.users`; bàn thử chỉ dựng
  mỗi `auth.users`. Phép HR15 chứng minh **luật gác đúng**, KHÔNG chứng minh
  lệnh xoá chạy trót lọt trên máy chủ thật. Lần bấm nút xoá đầu tiên là lần
  đầu điều đó được biết.
- `trang_thai_cua_toi()` của `07` chưa biết trạng thái *"được mời"* — người
  được mời mà bấm *Xin quyền* sẽ nghe câu "đơn đang chờ". Sửa ở b108.
- **Đã chốt thiết kế, chưa viết mã:** xoá gia phả — chủ cây xin, Quản trị hệ
  thống duyệt, thùng rác 30 ngày. `THIET-KE-NHIEU-CAY.md` mục 11.6, làm ở b109.
  Còn một câu phải hỏi chủ dự án: **ai gọi `don_thung_rac()`** — nút bấm tay
  hay trigger Apps Script chạy đêm.

## File đã đụng

**Mới**
- `luoc-do/14-loi-moi.sql` *(0.1.0)*
- `../kiem-thu/ban-thu-sql/do-b107.mjs` *(ngoài repo — 59/59, 3 phép bẻ gãy)*

**Sửa**
- `THIET-KE-NHIEU-CAY.md` — thêm mục 11.4 · 11.5 · 11.6
- `KE-HOACH.md` — b107 · b108 · b109 mới; ba bước cũ lùi thành b110–b112
- `CHI-DAN.md` — dòng định tuyến mới; sửa câu *"`13` chưa dán"* đã lạc hậu từ
  b104; gọn lại đúng trần 80 dòng
