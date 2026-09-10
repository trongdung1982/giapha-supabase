# Bước 110d — hai phép tự kiểm của `18` tự nói dối, và một vết thật trên máy chủ

*10/09/2026 12:07*

## Đã làm

- Chủ dự án dán `18-hai-chu-ky.sql` lên máy chủ thật. Bảng tự kiểm báo
  **12/13 ĐẠT, phép 10 HỎNG**.
- Đo lại trên bàn thử: phép 10 tự nó sai, không phải hàm sai. Nó so
  `pg_get_function_identity_arguments(...) = 'uuid'`, nhưng hàm trả về kèm
  TÊN tham số (`'p_tree uuid'`), nên vế so không bao giờ đúng được — bất kể
  hàm vá đúng hay sai.
- Sửa phép 10: hỏi thẳng thứ cần hỏi — `pronargdefaults = 0` (hàm không còn
  nhận `default`, tức bắt truyền `p_tree` tường minh).
- Kiểm chứng ngược trên bàn thử: dán lại `08` (bản cũ, còn `default null`)
  đè lên → phép 10 HỎNG trở lại đúng như phải thế. Tức phép sửa xong canh
  được thật, không xanh vì lỏng.
- Đưa chủ dự án một câu SQL chỉ-đọc để xác nhận trên máy chủ thật. Câu ấy
  phát hiện **2 dòng đã bị lỗ hổng chạm vào thật**: `khach@io.vn` mang
  `role='sua'`, `approved=true` trên cả hai cây (Nguyễn Phúc Giáo, thử H9),
  trong khi chỉ mới được *mời* ở vai `xem`/`sua` tương ứng (`moi_vai`).
- Phát hiện tiếp: **phép 13** của `18` (dò "còn dòng lời mời nào mang vết
  không") và **câu dọn ở mục 9** đều **bỏ sót đúng hai dòng ấy** — phép 13
  hỏi `approved=false` (dòng đã bị bật `true` thì lọt lưới), câu dọn hỏi
  y hệt vậy nên chạy xong sẽ báo `UPDATE 0`.
- Sửa cả hai để hỏi đúng câu: `moi_boi is not null and (approved or role <>
  'xem')`. Đo trên bàn thử bằng cách gieo lại đúng hai dòng vết: phép 13 bản
  cũ báo "ĐẠT" (đúng cái đã lừa chúng ta), bản mới báo HỎNG; câu dọn cũ
  `UPDATE 0`, câu dọn mới `UPDATE 2` và `moi_vai` sống sót nguyên vẹn qua
  câu dọn (thử riêng một dòng có `moi_vai='sua'`).
- Chủ dự án dán câu dọn lên máy chủ thật: `Success. No rows returned` —
  đúng kỳ vọng, hai dòng vết đã sạch.

## VÌ SAO chọn cách này

Việc quan trọng nhất trong bước này không phải là sửa SQL — là **không tin
một phép kiểm chỉ vì nó báo HỎNG hay báo ĐẠT**. Bài học của b102 (*"hỏi hàm
quyết quyền không phải là đo hàng rào"*) và b104 (*"chạy lại không phải là
nâng cấp"*) lặp lại ở đây dưới một dạng mới: **một phép kiểm hẹp hơn thứ nó
canh thì tệ hơn không có phép kiểm** — vì nó phát ra giấy chứng nhận sạch
trong khi có vết thật.

Cách xác minh là đo, không phải đọc mã: gieo lại chính hình dạng vết đã tìm
thấy trên máy chủ thật vào bàn thử, cho bản kiểm CŨ chạy qua nó (phải "ĐẠT"
sai), rồi cho bản MỚI chạy qua (phải HỎNG đúng). Không làm bước kiểm chứng
ngược này thì không có gì phân biệt được "tôi sửa đúng" với "tôi đổi công
thức cho thuận mắt".

Cũng vì thế, khi chủ dự án báo *"No rows returned"*, tôi không hỏi lại xác
nhận thêm — câu dò sau câu dọn tự nó đã là bằng chứng đủ: nếu câu dọn không
chạy hoặc chạy sai, câu dò phải ra 2 dòng, không phải 0.

## Đã thử mà hỏng

- Bản đầu của câu xác nhận gửi cho chủ dự án dùng tiếng Việt có dấu ngoặc
  kép và gạch dài trong chuỗi văn bản của câu lệnh SQL — Supabase SQL Editor
  ném `42601: syntax error`. Viết lại bản thuần ASCII, không chuỗi văn bản
  tiếng Việt nào trong câu lệnh, chạy sạch. Nếp rút ra: câu SQL gửi cho chủ
  dự án dán tay thì giữ ASCII thuần, để ghi chú giải thích ở tin nhắn, không
  ở trong câu lệnh.

## Còn treo

- Không còn gì treo từ vụ lỗ hổng hai chữ ký (b110c → b110d): đã vá, đã dán,
  đã dọn vết, đã xác nhận sạch.
- Việc kế tiếp theo `KE-HOACH.md`: **b111** — chưa đọc chi tiết mô tả trong
  phiên này.

## File đã đụng tới

- **Sửa**: `supabase/luoc-do/18-hai-chu-ky.sql` — phép 10 (đổi phép so sánh
  chuỗi sang `pronargdefaults = 0`), phép 13 (đổi điều kiện dò vết cho khớp
  với câu dọn ở mục 9), câu dọn ở mục 9 (đổi điều kiện `where` cho khớp với
  câu dò phía trên nó). Không đổi bất kỳ hàm nghiệp vụ nào — các hàm đã dán
  hôm nay (bước 110c) vẫn đúng nguyên trạng.
- Không có file *mới* / *chép nguyên* / *xoá* trong bước này.

⚠ Bàn thử SQL tại chỗ (`kiem-thu/ban-thu-sql/`, ngoài repo) là công cụ dùng
để đo trong bước này — không đụng file nào trong đó.
