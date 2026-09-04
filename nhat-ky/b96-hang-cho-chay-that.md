# b96 — Hàng chờ duyệt chạy thật, đo hết một vòng

*04/09/2026 18:39 · phiên Claude Code CLI*

---

## Làm được gì

1. Chủ dự án dán `luoc-do/07-duyet-dang-ky.sql` — **tự kiểm khớp 4/4**, trong
   đó dòng đáng lo nhất `thanh vien cu bi khoa ngoai oan` bằng **0**.
2. Đo **bốn hàm mới** trên máy chủ thật bằng tài khoản `thu-h9`.
3. Đi **hết một vòng luồng xin vào** bằng REST: người lạ → nộp đơn → xếp hàng.
   Ba mốc, đo bằng số, không suy từ mã.
4. Chưa đi nốt nửa cuối: chủ dự án bấm **Duyệt** trên màn hình Cài đặt.

---

## VÌ SAO

### Vì sao vẫn phải đo lại dù bộ kiểm đã 40/40

`kiem-duyet-dang-ky.mjs` đọc **văn bản** file SQL. Nó bắt được cấu trúc sai,
thứ tự sai, vai để hở — nhưng nó không chạy một câu SQL nào. Đúng cái ranh
giới b94 đã trả giá để học: **57 phép báo xanh trên một cửa quyền mở toang.**

Nên nửa còn lại phải đo bằng cách gọi thật. Và lần này nó xác nhận một chỗ mà
bài kiểm văn bản chỉ *tin* chứ không *biết*: gọi `xin_vao_cay()` bằng một tài
khoản **đã là thành viên** thì vai của họ có bị hạ xuống `xem` không. Không —
vẫn `sua`, vẫn gắn `P0012`, vẫn đã duyệt. Nếu viết `do update` thay vì
`do nothing`, cái nút "Xin vào gia phả" sẽ là một cái bẫy đặt sẵn cho chính
những người đã ở trong nhà.

### Vì sao con số đáng giá nhất là con số ZERO ở mốc C

Người **đang xếp hàng** có dòng trong `tree_members`. Trước bước b95, có dòng
là đọc được cả gia phả. Nên câu hỏi thật của cả thiết kế nằm ở đúng đây, và
câu trả lời phải là số không — không phải "ít", không phải "chỉ tên":

| `trees` | `persons` | `unions` | `union_children` | `tree_members` | `change_log` |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |

Không thấy cả tên gia phả, không thấy cả **dòng của chính mình**. Hai đòn thêm
cho chắc: tự bật cờ `approved` cho mình → 0 dòng đổi; tự mở hàng chờ xem ai
đang đợi → rỗng.

### Vì sao xoá dòng thành viên chứ không gỡ cờ duyệt

Muốn thử luồng thì phải có một **người lạ**, mà `thu-h9` lúc ấy đã là thành
viên đầy đủ. Hai đường: hạ `approved` xuống `false`, hoặc xoá hẳn dòng.

Chọn xoá, vì hạ cờ chỉ dựng lại được mốc C — *đang chờ*. Nó bỏ qua mốc A
(*chưa nộp đơn*) và bỏ qua chính lệnh `insert` trong `xin_vao_cay()`, tức bỏ
qua cái cửa `security definer` duy nhất mà người lạ chạm được. Cửa ấy là chỗ
nguy hiểm nhất của cả bước b95; thử luồng mà không đi qua nó thì thử cái vỏ.

### Vì sao nửa cuối phải để chủ dự án tự bấm

`ds_cho_duyet()` và `duyet_thanh_vien()` chỉ trả lời cho `chu`/`admin`, và tôi
không có mật khẩu tài khoản ấy — cũng không nên có. Nhưng lý do chính không
phải kỹ thuật: **màn hình duyệt là thứ chỉ người dùng thật mới đánh giá được.**
Tôi gọi hàm thì luôn "chạy được"; còn khối "Đơn chờ duyệt" có đủ để một người
không lập trình nhìn vào là biết bấm gì hay không, chỉ có chủ dự án trả lời.

---

## Đã thử mà hỏng

Không có gì hỏng ở bước này — cả bốn hàm và cả ba mốc đều ra đúng dự đoán
ngay lần gọi đầu.

Đáng ghi vì nó **khác hẳn b94**: hôm ấy lần gọi thật đầu tiên lộ ra một lỗ
hổng leo quyền. Khác nhau ở chỗ b95 được viết **sau** khi đã trả giá cho cái
bẫy `null`, nên mọi cửa quyền của file `07` viết dạng bọc sẵn ngay từ đầu, và
bộ kiểm hỏi *"đã bọc null chưa"* thay vì hỏi có đúng chữ. Bài học b94 đi thẳng
vào mã b95 chứ không nằm lại trong nhật ký.

---

## Còn treo

- ⚠ **Nửa cuối luồng chưa ai đi**: chủ dự án mở app (phải `Ctrl`+`F5` vì mã
  mới vừa lên Pages) → **⚙ Cài đặt** → khối *"Đơn chờ duyệt (1)"* → điền
  `P0012` → **Duyệt**. Đơn của `thu-h9` **đang nằm chờ trong hàng**, gửi lúc
  04/09/2026 18:36.
- ⚠ **Tài khoản `thu-h9` giữ lại theo yêu cầu chủ dự án** (mật khẩu yếu). Dọn
  khi nào không cần thử nữa.
- **b95 kiểm duyệt NỘI DUNG** (`KE-HOACH.md` việc 4) chưa viết dòng nào. Đừng
  lẫn với `b95-hang-cho-duyet.md` — file ấy duyệt *người*, việc kia duyệt
  *nội dung sửa*.
- Người chỉ có quyền xem vẫn xem được mọi thứ, kể cả chi tiết người còn sống.

---

## File đã đụng tới

**Sửa:**

| File | Đổi gì |
|---|---|
| `nhat-ky/INDEX.md` | thêm dòng b96 + một dòng *Đính chính* cho b95 |
| `KE-HOACH.md` | việc 5 đóng nốt phần máy chủ; *Còn treo* bớt dòng "chưa dán" |
| `CHI-DAN.md` | mục 3 — `07-duyet-dang-ky.sql` nay đã dán |
| `../PHOI-HOP-AI.md` | ghi lượt |

**Mới:** `nhat-ky/b96-hang-cho-chay-that.md` *(file này)*

**Không đụng mã.** Bước này chỉ đo — không sửa một dòng JS hay SQL nào, và đó
là điều đáng nói: mã của b95 chạy đúng ngay lần đầu trên máy chủ thật.
