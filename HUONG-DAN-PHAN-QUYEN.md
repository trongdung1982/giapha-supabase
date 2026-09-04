# Hướng dẫn phân quyền — dành cho chủ dự án

*Cập nhật 04/09/2026 12:45 · Luật trực hệ, chốt 04/09/2026*

> File này viết cho người **không lập trình**. Mỗi bước ghi rõ bấm gì, và
> ghi rõ **nhìn thấy gì thì biết là xong**.
>
> Luật này thay hẳn ý tưởng "chia chi/nhánh" treo từ 24/08/2026. Vì sao đổi,
> và các con số dẫn tới quyết định: `luoc-do/06-quyen-truc-he.sql` mục 1.

---

## 1. Luật, nói bằng tiếng thường

Một tài khoản muốn **sửa** gia phả thì phải qua hai cửa:

1. **Gắn với một người cụ thể** trong gia phả — "tài khoản này là ông A, mã `P0012`".
2. **Được quản trị viên duyệt.**

Qua đủ hai cửa rồi thì người ấy sửa được **trực hệ** của mình:

| Hướng | Sửa được ai |
|---|---|
| **Lên** | Bố mẹ, ông bà, cụ, kỵ… — **chỉ đường thẳng**, không sang bác/chú/cô/dì |
| **Xuống** | Toàn bộ con, cháu, chắt… không giới hạn đời |
| **Cộng** | Vợ/chồng của những người trên — sửa được **và thêm mới được** |

Chưa gắn mã, hoặc chưa được duyệt → **chỉ xem**, và xem được **toàn bộ** gia phả.

**Ba điều nên biết trước khi có người thắc mắc:**

- **Không ai sửa được anh chị em ruột của mình.** Em ruột không phải tổ tiên,
  cũng không phải con cháu. Muốn sửa thì nhờ bố (bố là trực hệ của cả hai),
  hoặc nhờ quản trị viên. Đây là điều bạn đã biết và vẫn chọn — không phải lỗi.
- **Luật chạy hai chiều.** Con cháu sửa được hồ sơ của bạn, vì bạn nằm trong
  đường trực hệ của họ. Nhờ vậy hồ sơ các cụ đã mất vẫn có người chăm.
- **Quản trị viên sửa được tất cả**, và gắn được cho **nhiều tài khoản**.

---

## 2. Cài đặt lần đầu — dán HAI file, đúng thứ tự

⚠ **Phải dán cả hai.** Dán file thứ nhất mà quên file thứ hai thì
**không ai lưu được gì nữa** — kể cả bạn. (Đó là cố ý: hỏng đằng cấm chứ
không hỏng đằng cho qua. Dán nốt file thứ hai là hết.)

**Bước 1.** Mở Supabase → bảng bên trái chọn **SQL Editor** → nút **New query**.

**Bước 2.** Mở file `supabase/luoc-do/06-quyen-truc-he.sql` bằng Notepad →
`Ctrl+A` → `Ctrl+C` → dán vào ô SQL Editor → bấm **Run**.

*Xong đúng khi:* hiện một bảng 3 dòng, cột `gia_tri` khớp cột `mong_doi`:

| muc | gia_tri | mong_doi |
|---|---|---|
| cot moi | 2 | 2 |
| vai admin nhan duoc | co | co |
| ham pham_vi_sua | 1 | 1 |

**Bước 3.** Bấm **New query** lần nữa. Mở `supabase/luoc-do/03-ham-luu-cay.sql`
→ `Ctrl+A` → `Ctrl+C` → dán → **Run**.

*Xong đúng khi:* hiện `Success. No rows returned`.

---

## 3. Gắn và duyệt một tài khoản

Vẫn ở **SQL Editor** → **New query**. Dán đoạn dưới, **sửa ba chỗ in đậm**
rồi Run:

```sql
select public.duyet_thanh_vien(
  (select id from public.trees where tree_code = 'NTB'),
  'nguoi-can-duyet@gmail.com',   -- email tài khoản
  'P0012',                       -- mã người trong gia phả
  true                           -- true = duyệt, false = gỡ duyệt
);
```

*Xong đúng khi:* trả về `{"ok": true, ...}`.

Nếu trả về `{"ok": false, "loi": "..."}` thì câu `loi` nói thẳng vấn đề —
thường là **tài khoản chưa được thêm vào gia phả**, hoặc **gõ sai mã người**.

⚠ **Một người trong gia phả chỉ gắn được với một tài khoản.** Gắn `P0012` cho
người thứ hai thì cơ sở dữ liệu từ chối. Đó là chủ ý: nếu không, hai người
cùng nhận mình là một cụ và cả hai cùng sửa được trực hệ của cụ, mà không có
gì bất thường hiện lên màn hình.

### Cấp quyền quản trị viên cho ai đó

```sql
update public.tree_members
   set role = 'admin'
 where tree_id = (select id from public.trees where tree_code = 'NTB')
   and user_id = (select id from auth.users where email = 'nguoi-do@gmail.com');
```

Quản trị viên **không cần gắn mã người** — họ sửa được cả cây.

---

## 4. Xem hiện ai đang có quyền gì

```sql
select m.email, m.role, m.person_id, m.approved,
       coalesce(p.names->0->>'given', '') as ten_nguoi_duoc_gan
  from public.tree_members m
  left join public.persons p
    on p.tree_id = m.tree_id and p.id = m.person_id
 where m.tree_id = (select id from public.trees where tree_code = 'NTB')
 order by m.role, m.email;
```

Đọc bảng ấy: `approved = false` **hoặc** `person_id` trống → người đó **chỉ xem
được**, dù cột `role` ghi `sua`.

---

## 5. Khi có người báo "tôi không sửa được"

Hỏi họ **câu báo lỗi hiện trên màn hình**, rồi tra bảng này:

| Câu họ thấy | Nghĩa là | Cách gỡ |
|---|---|---|
| *"chưa được gắn với một người trong gia phả, hoặc quản trị viên chưa duyệt"* | Chưa qua cửa 1 hoặc cửa 2 | Làm mục 3 |
| *"Người P00xx không thuộc trực hệ của bạn"* | Đúng luật, không phải lỗi | Nhờ người khác trong trực hệ, hoặc nhờ quản trị viên |
| *"Hôn nhân U00xx ngoài trực hệ của bạn"* | Họ đang cố thêm/bớt con của một cặp không thuộc trực hệ họ | Như trên |
| *"Bạn chỉ có quyền xem gia phả này"* | Vai là `xem` | Đổi `role` sang `sua` rồi làm mục 3 |
| *"Người khác vừa sửa gia phả trong lúc bạn đang mở"* | Không liên quan phân quyền | Tải lại trang rồi sửa lại |

---

## 6. Điều chưa làm, đừng mô tả như đã có

- **Chưa có màn hình duyệt trong app.** Duyệt bằng SQL ở mục 3. Hàm
  `duyet_thanh_vien()` viết sẵn để màn hình ấy mai kia gọi vào.
- **Chưa ai kiểm chứng luật này trên Supabase thật.** Bộ kiểm
  `kiem-thu/kiem-quyen-truc-he.mjs` (57 phép) soi cấu trúc file SQL và chạy
  mô hình luật trên hai cây thật — nhưng nó **không chạy SQL**. Lần bạn bấm
  Run là lần chạy đầu tiên.
- **Người chỉ có quyền xem vẫn xem được mọi thứ**, kể cả chi tiết người còn
  sống. Việc giấu bớt còn nằm ở `KIEN-TRUC.md` mục 6.
