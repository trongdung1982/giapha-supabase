# Lệnh khởi tạo dự án phần mềm mới (dùng với Claude Projects)

> **Cách dùng:** Tạo Project mới trên claude.ai → mở chat đầu tiên trong Project đó → điền phần [1] bên dưới → gửi toàn bộ nội dung này (kể cả phần "Bối cảnh") làm tin nhắn đầu tiên.

---

## Bối cảnh (giữ nguyên khi gửi)

Mình sẽ dùng bạn (Claude) qua tính năng Projects + Knowledge Base của claude.ai để xây phần mềm này lâu dài, qua nhiều phiên chat khác nhau — không làm xong trong 1 lần. Ở một dự án trước, mình từng gặp 2 vấn đề muốn tránh ngay từ đầu lần này:

1. **Gộp quá nhiều logic vào vài file lớn dùng chung cho cả app** — về sau khó tách, mỗi lần sửa phải nạp cả file lớn vào ngữ cảnh, dễ tràn ngữ cảnh khi debug qua nhiều vòng trong 1 chat.
2. **Không có tài liệu "kim chỉ nam"** khiến mỗi phiên chat mới phải giải thích lại kiến trúc từ đầu, và dễ sửa sót khi một thay đổi nghiệp vụ phải chạm nhiều file cùng lúc.

Vì vậy, ngay từ bước khởi tạo này, hãy:
- Chia kiến trúc theo **domain nghiệp vụ** (mỗi domain 1 file riêng), không gộp theo tầng kỹ thuật chung chung.
- Dùng **ES Modules** (`<script type="module">`, `import`/`export`) ngay từ đầu — không dùng nhiều thẻ `<script src="...">` rời rạc phải tự nhớ đúng thứ tự load.
- Phân lớp một chiều: `config → services → utils → pages`. Lớp dưới không bao giờ gọi ngược lên lớp trên.
- Tạo sẵn 1 file hướng dẫn để mọi phiên chat sau này (kể cả khi không còn nhớ cuộc trò chuyện này) đều nắm được toàn bộ quy tắc.

## [1] Thông tin dự án (mình điền trước khi gửi)

- **Phần mềm dùng để:** ...
- **Người dùng chính / các vai trò trong hệ thống:** ...
- **Luồng nghiệp vụ chính** (mô tả theo từng bước, càng cụ thể càng giúp chia domain đúng):
  1. ...
  2. ...
- **Backend dự kiến:** [Supabase / khác / chưa chắc — nhờ Claude tư vấn]
- **Ràng buộc khác** (không dùng bundler? chạy trên hosting tĩnh? cần chạy offline?...): ...

## [2] Việc cần bạn làm — theo đúng 2 bước, đừng viết code vội ở bước 1

**Bước 1 — Phân tích trước, chưa code:**
Dựa vào luồng nghiệp vụ ở mục [1], đề xuất:
- Danh sách các domain/module nghiệp vụ (mỗi domain sẽ là 1 file riêng ở bước sau)
- Cấu trúc thư mục tương ứng theo nguyên tắc phân lớp `config → services → utils → pages` hoặc config → utils → services → domains → pages tùy tình huống
- Danh sách các trang/màn hình chính của phần mềm

Trình bày để mình xác nhận hoặc chỉnh sửa — **chưa tạo file thật ở bước này.**

**Bước 2 — Sau khi mình xác nhận, tạo 2 nhóm file để mình tải lên Knowledge Base của Project:**

**a) Bốn file tài liệu nền tảng** — tách riêng vì tốc độ thay đổi khác nhau (thứ ít đổi và thứ hay đổi để ở file khác nhau, để cập nhật 1 thứ không phải động vào cả file lớn):

- **`HIEN-PHAP.md`** — những điều LUÔN ĐÚNG, hiếm khi đổi: sơ đồ kiến trúc, quy ước đặt tên file tài liệu trong đó có hậu tố _Vxx và luôn đọc bản có số lớn nhất, quy ước ghi chú phiên bản ở đầu mỗi file Vxx và dấu thời gian dd/mm/yyyy HH:mm, cảnh báo khi ngữ cảnh chạm đến giới hạn bộ nhớ và cần chuyển hội thoại mới, nguyên tắc phân lớp `config → services → utils → pages`, checklist "1 thay đổi nghiệp vụ thường chạm những đâu", và nguyên tắc làm việc theo từng chat (mỗi chat 1 việc có điểm dừng; gom đủ thông tin lỗi trước khi báo; tự rà lại bằng grep sau khi sửa; cập nhật lại Knowledge Base ngay khi file thay đổi thật). **Giữ file này ngắn gọn** — đây là phần cần có mặt ổn định trong mọi câu trả lời.
- **`KE-HOACH.md`** — kế hoạch/đặc tả tính năng đang làm ở giai đoạn hiện tại, sẽ cập nhật thường xuyên theo tiến độ thật.
- **`NHAT-KY.md`** — nhật ký từng bước đã hoàn thành, liệt kê theo thời gian dạng *"Bước X — ngày... — đã làm gì — vì sao"*. File này dự kiến dài dần theo thời gian — định kỳ tóm gọn các bước đã xa, giữ chi tiết đầy đủ cho các bước gần đây hoặc xem xét tách mỗi bước 1 file nhật ký để cần xem nhật ký bước nào thì mở đúng bước đó.
- **`MUC-LUC.md`** — liệt kê toàn bộ file đang có trong Knowledge Base (kể cả code), mỗi dòng 1-2 câu mô tả vai trò + lần cập nhật gần nhất.
- ** Tùy tình huống xem xét thêm tách thêm CAU-TRUC-DU-LIEU.md khỏi HIEN-PHAP.md vì schema có thể đổi theo nhịp khác hẳn quy tắc kiến trúc, để chung thì mỗi lần thêm một trường lại phải nạp cả hiến pháp

**b) Bộ file "xương sống" (skeleton) ban đầu:**
Đúng cấu trúc thư mục đã thống nhất ở Bước 1, mỗi file domain có sẵn khung (tên hàm, `export`, comment mô tả nhiệm vụ) nhưng **chưa cần đầy đủ logic** — mục tiêu là xác nhận đúng khung trước khi viết chi tiết ở các chat sau.

## [3] Lưu ý khi thực hiện

- Nếu thông tin ở mục [1] chưa đủ rõ để chia domain hợp lý, hãy hỏi lại trước, đừng đoán.
- Mục tiêu của phiên chat này là **dựng đúng khung**, không phải hoàn thiện sản phẩm — logic chi tiết từng phần sẽ làm ở các chat riêng sau, theo đúng nguyên tắc "1 chat 1 việc" đã nêu trong file hướng dẫn.
- thiết kế file nền tảng sao cho bạn đọc ít tài liệu nhất mỗi phiên làm việc để tiết kiệm token.
