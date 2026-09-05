-- ============================================================
-- giapha-supabase · kiem-thu/thu-nhieu-cay.sql
-- Vai trò  : ĐO BA CHỖ HỎNG CỦA NHIỀU CÂY trên cơ sở dữ liệu thật — bằng
--            cách dựng đúng tình cảnh sinh ra chúng: HAI cây cùng lúc, một
--            người có chân ở cả hai, và một cài đặt riêng trên mỗi cây.
-- Chạy ở   : Supabase → SQL Editor → New query → dán CẢ FILE → Run.
--            Chạy SAU `luoc-do/10-sua-nhieu-cay.sql` và SAU file di dời cây
--            thứ hai — không có cây thứ hai thì không đo được gì.
-- Phiên bản: 0.1.0 · Cập nhật: 05/09/2026 11:09
-- ============================================================
--
-- ═══ VÌ SAO PHẢI CÓ FILE NÀY ═══
--
-- Cả ba chỗ hỏng đều **không có triệu chứng với một cây**, nên không bộ kiểm
-- đọc-văn-bản nào bắt được chúng: mã cũ viết đúng khuôn, đúng cú pháp, và
-- chạy đúng suốt từ b87 tới hôm nay. Cái sai nằm ở chỗ *"đúng khi chỉ có một
-- cây"* — mà điều kiện ấy không viết ở đâu cả.
--
-- Nên phép đo phải dựng đúng điều kiện làm chúng lộ ra. Đó là cùng lý lẽ đã
-- dùng cho `thu-hoan-tac.sql`: *"có mã hoàn tác"* khác *"hoàn tác được"*.
--
-- ⚠ **Phép 6 là KIỂM CHỨNG NGƯỢC** — nó dựng lại đúng hành vi cũ (`delete`
--   sạch rồi chèn lại) và đòi phép 2 phải bắt được. Không có nó thì mọi dòng
--   ĐẠT ở trên chỉ chứng minh *"hôm nay không hỏng"*, chứ không chứng minh
--   *"bài kiểm này nhìn thấy được cái hỏng"*.
--
-- ═══ NÓ ĐỘNG VÀO GÌ ═══
--
-- Chỉ bảng `user_settings` của **đúng một tài khoản**, và trả lại nguyên trạng
-- ở cuối. Không đụng một dòng gia phả nào: không `persons`, không `unions`,
-- không `change_log`, không `tree_members`.
--
-- Cả file nằm trong một giao dịch ngầm của SQL Editor. Ném lỗi giữa chừng là
-- không có gì được ghi.

drop table if exists thu_nhieu_cay_kq;
create temporary table thu_nhieu_cay_kq (
  stt   integer,
  phep  text,
  duoc  text,
  mong  text
);

do $thu$
declare
  v_uid    uuid;
  v_email  text;
  v_cay_a  uuid;      -- cây thứ nhất
  v_cay_b  uuid;      -- cây thứ hai
  v_ma_a   text;
  v_ma_b   text;
  v_luu    jsonb;     -- bản chụp `user_settings` để trả lại nguyên trạng
  v_n      integer;
  v_txt    text;
begin
  -- ══ 0. CẦN HAI CÂY, VÀ MỘT NGƯỜI CÓ CHÂN Ở CẢ HAI ══
  select count(*) into v_n from public.trees;
  if v_n < 2 then
    raise exception 'Máy chủ mới có % cây. Bài kiểm này đo cái chỉ hỏng khi có TỪ HAI CÂY trở lên — nạp cây thứ hai trước đã.', v_n;
  end if;

  select tm.user_id, tm.email into v_uid, v_email
    from public.tree_members tm
   where tm.role = 'quan_tri_he_thong'
   group by tm.user_id, tm.email
  having count(distinct tm.tree_id) >= 2
   limit 1;

  if v_uid is null then
    raise exception 'Không có tài khoản nào là quản trị hệ thống ở từ hai cây trở lên. Bài kiểm cần một người đứng được ở cả hai cây.';
  end if;

  select tm.tree_id into v_cay_a from public.tree_members tm
   where tm.user_id = v_uid and tm.role = 'quan_tri_he_thong'
   order by tm.tree_id limit 1;
  select tm.tree_id into v_cay_b from public.tree_members tm
   where tm.user_id = v_uid and tm.role = 'quan_tri_he_thong'
     and tm.tree_id <> v_cay_a
   order by tm.tree_id limit 1;

  select tree_code into v_ma_a from public.trees where id = v_cay_a;
  select tree_code into v_ma_b from public.trees where id = v_cay_b;

  -- Mượn danh nghĩa người ấy, chỉ trong giao dịch này. Giải thích đầy đủ ở
  -- `thu-hoan-tac.sql` — cùng một mẹo, cùng một lý do.
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_uid::text, 'email', v_email,
                      'role', 'authenticated')::text, true);

  if auth.uid() is distinct from v_uid then
    raise exception 'Không mượn được danh nghĩa tài khoản trong SQL Editor. Bài kiểm này không chạy được ở đây.';
  end if;

  insert into thu_nhieu_cay_kq values
    (0, 'máy chủ nhận ra người gọi', coalesce(auth.uid()::text, '(rỗng)'), v_uid::text);

  -- Chụp lại `user_settings` của người này để trả về nguyên trạng ở cuối.
  select coalesce(jsonb_agg(to_jsonb(us)), '[]'::jsonb) into v_luu
    from public.user_settings us where us.user_id = v_uid;

  -- ══ 1. DỰNG TÌNH CẢNH: mỗi cây một người trung tâm riêng ══
  insert into public.user_settings (user_id, tree_id, focus_person_id)
  values (v_uid, v_cay_a, 'THU_A')
      on conflict (user_id, tree_id) do update set focus_person_id = 'THU_A';
  insert into public.user_settings (user_id, tree_id, focus_person_id)
  values (v_uid, v_cay_b, 'THU_B')
      on conflict (user_id, tree_id) do update set focus_person_id = 'THU_B';

  select count(*) into v_n from public.user_settings
   where user_id = v_uid and focus_person_id in ('THU_A', 'THU_B');
  insert into thu_nhieu_cay_kq values
    (1, 'dựng được hai cài đặt, mỗi cây một dòng', v_n::text, '2');

  -- ══ 2. HỎNG 1 — đổi cây KHÔNG được xoá cài đặt của cây kia ══
  -- Đây là phép đắt nhất của cả file. Bản trước 05/09/2026 trượt đúng ở đây:
  -- `chonGiaPha()` gọi `delete().eq('user_id', …)`, và sau lời gọi này thì cả
  -- 'THU_A' lẫn 'THU_B' đều biến mất.
  perform public.dat_cay_dang_mo(v_cay_a);
  perform public.dat_cay_dang_mo(v_cay_b);
  perform public.dat_cay_dang_mo(v_cay_a);

  select count(*) into v_n from public.user_settings
   where user_id = v_uid and focus_person_id in ('THU_A', 'THU_B');
  insert into thu_nhieu_cay_kq values
    (2, 'đổi cây BA LẦN, hai người trung tâm còn nguyên', v_n::text, '2');

  select focus_person_id into v_txt from public.user_settings
   where user_id = v_uid and tree_id = v_cay_b;
  insert into thu_nhieu_cay_kq values
    (3, 'người trung tâm của cây KHÔNG mở vẫn đúng giá trị', coalesce(v_txt, '(mất)'), 'THU_B');

  -- ══ 3. Đúng MỘT cây đang mở, và đúng cây vừa chọn ══
  select count(*) into v_n from public.user_settings
   where user_id = v_uid and dang_mo;
  insert into thu_nhieu_cay_kq values
    (4, 'đúng một cây mang cờ đang mở', v_n::text, '1');

  insert into thu_nhieu_cay_kq values
    (5, 'cây đang mở là cây vừa chọn',
     coalesce(public.cay_dang_mo()::text, '(rỗng)'), v_cay_a::text);

  -- ══ 4. KIỂM CHỨNG NGƯỢC — bẻ gãy có chủ ý ══
  -- Dựng lại đúng hành vi cũ và đòi phép 2 phải bắt được. Nếu sau khi xoá
  -- sạch mà số vẫn là 2 thì phép 2 đang đo một thứ khác, và mọi dòng ĐẠT ở
  -- trên đều vô giá trị.
  delete from public.user_settings where user_id = v_uid;
  select count(*) into v_n from public.user_settings
   where user_id = v_uid and focus_person_id in ('THU_A', 'THU_B');
  insert into thu_nhieu_cay_kq values
    (6, 'KIỂM CHỨNG NGƯỢC: làm theo lối cũ thì mất cài đặt', v_n::text, '0');

  -- ══ 5. HỎNG 3 — hàm hỏi về ĐÚNG cây được hỏi ══
  -- Trả lại một chút cài đặt để hai phép cuối có chỗ đứng.
  perform public.dat_cay_dang_mo(v_cay_a);

  insert into thu_nhieu_cay_kq values
    (7, 'đếm hàng chờ của cây A khớp số đếm thẳng trên bảng',
     public.dem_cho_kiem_duyet(v_cay_a)::text,
     (select count(*)::text from public.change_log
       where tree_id = v_cay_a and trang_thai = 'cho'));

  insert into thu_nhieu_cay_kq values
    (8, 'đếm hàng chờ của cây B khớp số đếm thẳng trên bảng',
     public.dem_cho_kiem_duyet(v_cay_b)::text,
     (select count(*)::text from public.change_log
       where tree_id = v_cay_b and trang_thai = 'cho'));

  -- ⚠ Phép này chỉ có nghĩa khi hai cây có số hàng chờ KHÁC nhau. Bằng nhau
  --   thì một hàm hỏi nhầm cây vẫn cho ra số đúng — nên nói thẳng ra là phép
  --   9 hôm nay không phân biệt được gì, thay vì để nó khoe một chữ ĐẠT rỗng.
  insert into thu_nhieu_cay_kq
  select 9, 'hai cây có số hàng chờ khác nhau (điều kiện để phép 7-8 có nghĩa)',
         case when a.n = b.n then 'bằng nhau (' || a.n || ') — phép 7-8 KHÔNG phân biệt được'
              else 'khác nhau (' || a.n || ' và ' || b.n || ')' end,
         case when a.n = b.n then 'bằng nhau (' || a.n || ') — phép 7-8 KHÔNG phân biệt được'
              else 'khác nhau (' || a.n || ' và ' || b.n || ')' end
    from (select count(*) n from public.change_log where tree_id = v_cay_a and trang_thai = 'cho') a,
         (select count(*) n from public.change_log where tree_id = v_cay_b and trang_thai = 'cho') b;

  -- ══ 6. `trang_thai_cua_toi()` không đoán bừa nữa ══
  insert into thu_nhieu_cay_kq values
    (10, 'trạng thái của tôi: đã duyệt',
     public.trang_thai_cua_toi() ->> 'trangThai', 'daduyet');

  insert into thu_nhieu_cay_kq values
    (11, 'trạng thái của tôi trả về ĐÚNG cây đang mở, không phải cây tuỳ ý',
     public.trang_thai_cua_toi() ->> 'treeId', v_cay_a::text);

  insert into thu_nhieu_cay_kq values
    (12, 'hỏi rõ cây B thì trả lời về cây B',
     public.trang_thai_cua_toi(v_cay_b) ->> 'treeId', v_cay_b::text);

  -- ══ 7. Công tắc ngày giỗ: riêng theo từng cây ══
  update public.user_settings set hien_ngay_gio = true
   where user_id = v_uid and tree_id = v_cay_a;
  insert into public.user_settings (user_id, tree_id, hien_ngay_gio)
  values (v_uid, v_cay_b, false)
      on conflict (user_id, tree_id) do update set hien_ngay_gio = false;

  insert into thu_nhieu_cay_kq values
    (13, 'công tắc ngày giỗ của cây A bật',
     (select hien_ngay_gio::text from public.user_settings
       where user_id = v_uid and tree_id = v_cay_a), 'true');
  insert into thu_nhieu_cay_kq values
    (14, 'công tắc ngày giỗ của cây B vẫn tắt — riêng theo cây',
     (select hien_ngay_gio::text from public.user_settings
       where user_id = v_uid and tree_id = v_cay_b), 'false');

  -- ══ 8. TRẢ LẠI NGUYÊN TRẠNG ══
  -- ⚠ Phải xoá TRƯỚC rồi mới chèn lại bản chụp: chỉ số duy nhất của cờ
  --   `dang_mo` từ chối hai dòng cùng bật, và bản chụp có thể mang một dòng
  --   đang bật.
  delete from public.user_settings where user_id = v_uid;
  insert into public.user_settings
  select * from jsonb_populate_recordset(null::public.user_settings, v_luu);

  select count(*) into v_n from public.user_settings where user_id = v_uid;
  insert into thu_nhieu_cay_kq values
    (15, 'đã trả lại nguyên trạng cài đặt của tài khoản thử',
     v_n::text, jsonb_array_length(v_luu)::text);

  raise notice 'Đo xong trên hai cây: % và %.', v_ma_a, v_ma_b;
end;
$thu$;

-- ============================================================
-- KẾT QUẢ
-- ============================================================
select stt,
       phep,
       duoc  as "đo được",
       mong  as "phải là",
       case when duoc is not distinct from mong then 'ĐẠT' else 'LỖI' end as ket_qua
  from thu_nhieu_cay_kq
 order by stt;

select case when count(*) filter (where duoc is distinct from mong) = 0
            then 'TẤT CẢ ' || count(*) || ' PHÉP ĐẠT'
            else 'CÓ ' || count(*) filter (where duoc is distinct from mong)
                 || '/' || count(*) || ' PHÉP LỖI — đọc bảng trên' end as tong_ket
  from thu_nhieu_cay_kq;
