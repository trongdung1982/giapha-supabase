# Hướng dẫn phân quyền — dành cho chủ dự án

*Cập nhật 04/09/2026 22:20 · Luật trực hệ + hàng chờ duyệt + kiểm duyệt nội dung*

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
| vai quan tri nhan duoc | co | co |
| ham pham_vi_sua | 1 | 1 |

**Bước 3.** Bấm **New query** lần nữa. Mở `supabase/luoc-do/03-ham-luu-cay.sql`
→ `Ctrl+A` → `Ctrl+C` → dán → **Run**.

*Xong đúng khi:* hiện `Success. No rows returned`.

---

## 3. Gắn và duyệt một tài khoản

Vẫn ở **SQL Editor** → **New query**. Dán đoạn dưới, **sửa hai chỗ có ghi chú**
rồi Run:

```sql
update public.tree_members
   set person_id = 'P0012',      -- mã người trong gia phả
       approved  = true          -- true = duyệt, false = gỡ duyệt
 where tree_id = (select id from public.trees where tree_code = 'NTB')
   and lower(email) = lower('nguoi-can-duyet@gmail.com')   -- email tài khoản
   and exists (select 1 from public.persons p
                where p.tree_id = tree_members.tree_id
                  and p.id = 'P0012');

select email, role, coalesce(person_id, '(chua gan)') as ma, approved
  from public.tree_members
 order by role;
```

*Xong đúng khi:* bảng in ra ở dưới có đúng dòng ấy mang mã người và `approved`
bằng `true`.

**Không đổi gì cả** thì một trong hai điều sau sai, và dòng `exists` cố ý làm
nó không đổi thay vì gắn bừa: email không có trong gia phả này, hoặc mã người
gõ sai. Đối chiếu bằng mục 4 ngay dưới.

⚠ **Vì sao dùng `update` chứ không gọi hàm `duyet_thanh_vien()`.** Hàm ấy có
thật và vẫn dùng được — nhưng chỉ khi người gọi **đang đăng nhập** bằng tài
khoản `quan_tri_he_thong`, tức từ màn hình duyệt trong app. *(Tới 04/09/2026 nó nhận cả
`quan_tri`; `08-kiem-duyet.sql` mục 4 thu hẹp lại — xem cuối mục 3 này.)* Cửa sổ SQL
Editor không mang danh nghĩa tài khoản nào cả, nên với hàm ấy nó là *"người
ngoài"* và bị từ chối.

Bản đầu của hàm **không** từ chối — và đó chính là lỗ hổng phép thử H9 bắt được
ngày 04/09/2026: cửa kiểm quyền không đóng với người ngoài, nên ai cũng duyệt
được cho tài khoản khác. Vá xong thì SQL Editor mất luôn đường tắt ấy. Đổi lại
là đúng, và `update` ở trên làm được y hệt việc cần làm.

⚠ **Một người trong gia phả chỉ gắn được với một tài khoản.** Gắn `P0012` cho
người thứ hai thì cơ sở dữ liệu từ chối. Đó là chủ ý: nếu không, hai người
cùng nhận mình là một cụ và cả hai cùng sửa được trực hệ của cụ, mà không có
gì bất thường hiện lên màn hình.

### Cấp quyền quản trị viên cho ai đó

```sql
update public.tree_members
   set role = 'quan_tri'
 where tree_id = (select id from public.trees where tree_code = 'NTB')
   and user_id = (select id from auth.users where email = 'nguoi-do@gmail.com');
```

Quản trị viên **không cần gắn mã người** — họ sửa được cả cây.

⚠ **`quan_tri` KHÔNG phải "chủ thứ hai" nữa** *(đổi 04/09/2026,
`08-kiem-duyet.sql` mục 4)*. Chủ dự án chốt tách hai hạng:

| Hạng | Mã trong bảng | Sửa dữ liệu | Duyệt nội dung | Nhận người vào cây · gắn mã người |
|---|---|---|---|---|
| **Quản trị hệ thống** | `quan_tri_he_thong` | ghi thẳng | ✓ | ✓ |
| **Quản trị viên** | `quan_tri` | ghi thẳng | ✓ | ✗ |
| **Thành viên** | `sua` | theo trực hệ, chờ duyệt | ✗ | ✗ |
| **Khách** | `xem` | ✗ | ✗ | ✗ |

Nghĩa là **quản trị viên** là người kiểm duyệt nội dung, không phải người
quản trị hệ thống.

⚠ **Bốn tên trên là cách gọi chốt 04/09/2026**, và mã `chu` đã được đổi thành
`quan_tri_he_thong` cùng ngày — bạn sẽ không còn gặp chữ `chu` ở đâu nữa. Việc
đổi ấy làm bằng `luoc-do/09-doi-ma-vai.sql`; xem mục 8.

Chỗ dịch mã sang tên hiển thị nằm ở `js/pages/settings.js` hàm
`vaiTroBangChu()`, và chỉ có một chỗ ấy.

**Cụ thể quản trị viên mất gì:** ba hàm `duyet_thanh_vien()`,
`tu_choi_thanh_vien()`, `ds_cho_duyet()` từ nay chỉ quản trị hệ thống gọi được
— khối *"Đơn chờ duyệt"* trong màn Cài đặt cũng vậy, máy chủ trả về rỗng cho
quản trị viên.

Lý do: hai hàm đầu **đổi được ai có quyền gì**. Một người kiểm duyệt nội dung
không cần tới chúng, mà có chúng thì họ tự cấp được quyền sửa cho bất kỳ ai.

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

## 6. Hàng chờ duyệt — cách làm việc từ nay

*(Cần dán `luoc-do/07-duyet-dang-ky.sql` một lần. Xem mục 7.)*

Người trong họ **tự xin vào**, bạn không phải đi thêm tay từng người nữa:

1. Họ tự đăng ký tài khoản, đăng nhập.
2. Màn hình hiện **"Bạn chưa được cấp quyền xem"** kèm ô tự giới thiệu và
   nút **Xin vào gia phả**. Bấm xong, đơn vào hàng chờ.
3. Bạn mở app → nút **⚙ Cài đặt** → khối **"Đơn chờ duyệt (n)"**. Mỗi đơn
   hiện email, lời họ tự giới thiệu, giờ gửi.
4. Điền **mã người** trong gia phả rồi bấm **Duyệt** — họ vào xem được, và
   sửa được trực hệ của mã ấy. **Để trống mã** thì họ chỉ xem, không sửa gì.
5. Không phải người trong họ thì bấm **Từ chối** (hỏi lại một nhịp rồi mới xoá).

⚠ **Người đang chờ không xem được gì cả.** Không phải "xem được nhưng không
sửa" — là không thấy một chữ nào, kể cả tên gia phả. Đó là chỗ khác quan
trọng nhất so với trước ngày 04/09/2026.

⚠ **Tài khoản Supabase thì vẫn ai cũng tự đăng ký được.** Cái được kiểm soát
chặt là **chỗ đứng trong gia phả**, không phải chỗ đứng trong danh sách tài
khoản. Người lạ đăng ký xong vẫn không thấy gì — phép thử H9 đã đo: **0 dòng
trên cả tám bảng**.

---

## 7. Cài đặt hàng chờ — dán một file

**SQL Editor** → **New query** → dán cả `luoc-do/07-duyet-dang-ky.sql` → **Run**.

*Xong đúng khi* bảng cuối có 4 dòng, cột `gia_tri` khớp `mong_doi` — đặc biệt
dòng cuối **`thanh vien cu bi khoa ngoai oan` phải bằng `0`**.

⚠ Dán **cả file một lần**, đừng cắt từng khối chạy riêng: trong đó có một lệnh
bật quyền cho những người đã là thành viên từ trước, và nó **phải chạy trước**
lệnh đổi luật ngay dưới. Chạy lệch thứ tự là chính bạn bị khoá ngoài app.

---

## 8. Đổi mã vai — dán SÁU file, đúng thứ tự

*(Làm một lần, 04/09/2026. Xong rồi thì bỏ qua mục này.)*

Mã `chu` đã đổi thành `quan_tri_he_thong`. Mã ấy nằm rải ở **11 hàm, 2 luật
phân quyền, 1 ràng buộc và chính dữ liệu**, nên phải dán lại gần hết —
không có cách nào một file làm xong.

Vẫn ở **SQL Editor**. Mỗi bước: bấm **New query** → mở file bằng Notepad →
`Ctrl+A` → `Ctrl+C` → dán → **Run**.

| Bước | File |
|---|---|
| 1 | `luoc-do/09-doi-ma-vai.sql` |
| 2 | `luoc-do/05-sao-luu.sql` |
| 3 | `luoc-do/06-quyen-truc-he.sql` |
| 4 | `luoc-do/07-duyet-dang-ky.sql` |
| 5 | `luoc-do/08-kiem-duyet.sql` |
| 6 | `luoc-do/03-ham-luu-cay.sql` |

⚠ **Đừng đảo bước 2 và 3.** File `05` đặt lại danh sách vai hợp lệ mà **thiếu
`quan_tri`** — nó ra đời trước vai ấy; `06` mới thêm vào. Làm 06 trước rồi 05 là
tự tay bỏ mất vai quản trị viên.

⚠ **Giữa chừng app sẽ từ chối bạn.** Sau bước 1, dữ liệu đã mang mã mới còn
các hàm vẫn hỏi mã cũ. Đó là quãng bình thường, không phải hỏng — dán nốt là
hết. Và bạn **không bao giờ bị khoá thật**: SQL Editor không đi qua phân
quyền, câu quay về bản cũ nằm ngay đầu file `09`.

*Xong đúng khi:* làm hết bước 6, quay lại tab của bước 1, bôi đen khối `select`
cuối file `09` rồi Run. Năm dòng hiện ra phải khớp cột `mong_doi`, và
**hai dòng cuối phải là `0`** — chúng đếm xem còn chỗ nào trên máy chủ đang
nói mã cũ. Khác `0` nghĩa là còn sót một file chưa dán.

---

## 9. Điều chưa làm, đừng mô tả như đã có

- **Chưa có trang duyệt NỘI DUNG.** Khối "Đơn chờ duyệt" ở mục 6 duyệt
  *người*, không duyệt *nội dung sửa*. Máy chủ đã làm xong phần của nó
  (`08-kiem-duyet.sql`); trang `duyet.html` là việc b98, chưa viết. Trong lúc
  chờ, nội dung sửa của thành viên vẫn hiện ra bình thường cho cả họ —
  **đó là chủ ý**, không phải chỗ hỏng.
- **Chưa ai thử HOÀN TÁC thật.** Đường từ chối một lần Lưu mới chỉ được bộ
  kiểm soi bằng văn bản, chưa chạy trên Postgres lần nào.
- **Người chỉ có quyền xem vẫn xem được mọi thứ**, kể cả chi tiết người còn
  sống. Việc giấu bớt còn nằm ở `KIEN-TRUC.md` mục 6.
