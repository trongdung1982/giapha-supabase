-- ============================================================
-- giapha-supabase · luoc-do/01-bang.sql
-- Vai trò  : Dựng toàn bộ bảng của gia phả trên Postgres (Supabase).
-- Chạy ở   : Supabase → SQL Editor → dán → Run. Chạy TRƯỚC 02-rls.sql.
-- Phiên bản: 0.1.0 · Cập nhật: 02/09/2026 22:45
-- ============================================================
--
-- BA ĐIỀU PHẢI BIẾT TRƯỚC KHI ĐỌC FILE NÀY
--
-- 1. **Mã người vẫn là `P0001` / `NTBK7R3_P0060`, không phải uuid.** Cả
--    `domains/` lẫn `pages/` tra cứu nhau bằng đúng những chuỗi ấy ở hàng trăm
--    chỗ. Đổi sang uuid là sửa `domains/` — đúng việc `supabase/BAT-DAU.md`
--    mục 1 bảo phải dừng lại hỏi vì sao. Nên khoá chính là **cặp**
--    `(tree_id, id)`: một dòng một người, mà mã vẫn nguyên chữ cũ.
--
-- 2. **Những khối con vẫn để `jsonb`** — `names`, `birth`, `death`, `vn`,
--    `meta`, `ranks`. Tách chúng thành bảng riêng thì được gì? Không truy vấn
--    nào của app cần lọc theo `names[].type` hay theo `birth.raw`. Mà mất thì
--    mất `domains/person.js` nguyên vẹn. Cái RLS cần là **một dòng cho mỗi
--    người** — có rồi. Chuẩn hoá sâu hơn là trả giá mà không mua được gì.
--
-- 3. **Con thì KHÔNG để jsonb** (`union_children` là bảng thật). Đây là quan
--    hệ cha mẹ–con, thứ duy nhất trong cả lược đồ mà máy chủ thật sự cần đi
--    theo được — truy vấn đệ quy để biết một người thuộc nhánh nào, tức là
--    thứ cả cuộc chuyển nhà này sinh ra để làm.
--
-- ⚠ Chạy file này lần thứ hai là AN TOÀN (`if not exists` khắp nơi), nhưng nó
--   KHÔNG sửa bảng đã có sang hình mới. Đổi lược đồ thì viết file `04-…sql`
--   riêng, đừng sửa file này rồi chạy lại.

-- gen_random_uuid() nằm trong pgcrypto; Supabase bật sẵn, để đây cho chắc.
create extension if not exists pgcrypto;

-- ============================================================
-- 1. CÂY GIA PHẢ
-- ============================================================
-- Thay cho khối `"tree": {…}` ở đầu file JSON, cộng thêm `revision` — số
-- chống ghi đè. Trên Drive vai ấy do `headRevisionId` của Google đóng; ở đây
-- là một số nguyên của chính ta, tăng 1 mỗi lần ghi thành công.

create table if not exists public.trees (
  id              uuid primary key default gen_random_uuid(),
  tree_code       text        not null,          -- 'NTBK7R3' — tiền tố mã MỚI
  name            text        not null,
  root_person_id  text,                          -- người trung tâm mặc định
  note            text        not null default '',
  data_version    integer     not null default 1, -- khớp DATA_VERSION ở config.js
  revision        integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      text        not null default '',
  constraint tree_code_hop_le check (tree_code ~ '^[A-Z0-9_]+$')
);

-- ============================================================
-- 2. AI ĐƯỢC VÀO CÂY NÀO
-- ============================================================
-- Thay cho **danh sách chia sẻ của Google Drive**. `PHAN-QUYEN_V03` mở đầu
-- bằng câu "app không giữ bảng phân quyền riêng" — từ đây câu ấy hết đúng, và
-- đó là chủ ý: Drive không phân được quyền nhỏ hơn cả file, nên muốn giới hạn
-- theo chi thì bảng này bắt buộc phải có.
--
-- `email` chép lại lúc mời chỉ để HIỆN LÊN màn hình ("liên hệ … để được thêm
-- vào"). Không bao giờ dùng nó để quyết quyền — quyền đi theo `user_id`.

create table if not exists public.tree_members (
  tree_id  uuid not null references public.trees(id) on delete cascade,
  user_id  uuid not null references auth.users(id)   on delete cascade,
  role     text not null check (role in ('chu', 'sua', 'xem')),
  email    text not null default '',
  added_at timestamptz not null default now(),
  primary key (tree_id, user_id)
);

create index if not exists tree_members_user_idx
  on public.tree_members (user_id);

-- ============================================================
-- 3. CHI / NHÁNH  ⚠ QUY TẮC CHIA CHƯA CHỐT
-- ============================================================
-- `KE-HOACH-HA-TANG-Supabase_V01.md` mục "Việc phải hỏi chủ dự án" hỏi thẳng:
-- chi/nhánh tính theo tổ tiên chung ở đời nào? theo trưởng chi nào? **Chưa có
-- câu trả lời**, nên bảng dựng sẵn mà chưa ai điền, và hàm quyết quyền ở
-- `02-rls.sql` hiện BỎ QUA cột `branch_id` (xem `co_the_sua_nguoi`).
--
-- Dựng sẵn chứ không đợi, vì thêm một cột vào bảng 700 dòng thì rẻ, còn đổi
-- khoá chính thì không.

create table if not exists public.branches (
  tree_id        uuid not null references public.trees(id) on delete cascade,
  id             text not null,                  -- 'CHI_GIAP'
  name           text not null,                  -- 'Chi Giáp'
  root_person_id text,                           -- người đứng đầu chi
  note           text not null default '',
  primary key (tree_id, id)
);

-- Ai được sửa nhánh nào. Vắng dòng = không được sửa nhánh ấy.
-- ⚠ Bảng này chỉ có nghĩa với người `role = 'sua'`. Người `'chu'` sửa cả cây,
--   người `'xem'` không sửa gì — hai vai ấy không tra bảng này.
create table if not exists public.branch_access (
  tree_id   uuid not null,
  user_id   uuid not null references auth.users(id) on delete cascade,
  branch_id text not null,
  primary key (tree_id, user_id, branch_id),
  foreign key (tree_id, branch_id)
    references public.branches(tree_id, id) on delete cascade
);

-- ============================================================
-- 4. NGƯỜI
-- ============================================================
-- Từng trường ánh xạ 1–1 với `CAU-TRUC-DU-LIEU_V06.md` mục "File dữ liệu".
-- Tên cột là **snake_case**; hình trong trình duyệt là **camelCase**. Chỗ
-- duy nhất hai lối viết gặp nhau là `services/hinh-dang.js` — không có chỗ
-- thứ hai, và đó là chủ ý.

create table if not exists public.persons (
  tree_id       uuid    not null references public.trees(id) on delete cascade,
  id            text    not null,
  uid           text    not null default '',     -- neo bền, nhập về thì GIỮ NGUYÊN VĂN
  names         jsonb   not null default '[]'::jsonb,
  sex           text    not null default 'U' check (sex in ('M', 'F', 'U')),
  birth         jsonb   not null default '{"iso":null,"raw":"","place":""}'::jsonb,
  death         jsonb   not null default '{"iso":null,"raw":"","place":""}'::jsonb,
  burial_place  text    not null default '',

  -- Sáu trường thông dụng của gia phả Việt. Chuỗi tự do, KHÔNG danh sách chọn
  -- (CAU-TRUC-DU-LIEU_V06 nói rõ vì sao). Trống thì thẻ không vẽ hàng ấy.
  title         text    not null default '',
  occupation    text    not null default '',
  education     text    not null default '',
  religion      text    not null default '',
  residence     text    not null default '',
  nationality   text    not null default '',     -- DÂN TỘC, không phải quốc tịch

  living        boolean not null default true,
  photo_file_id text    not null default '',     -- CON TRỎ tới ảnh đại diện
  note          text    not null default '',
  deleted       boolean not null default false,  -- xoá MỀM, xem mục 6 tài liệu
  vn            jsonb   not null default '{}'::jsonb,
  meta          jsonb   not null default '{}'::jsonb,

  branch_id     text,                            -- ⚠ chưa dùng, xem mục 3
  primary key (tree_id, id),
  foreign key (tree_id, branch_id)
    references public.branches(tree_id, id) on delete set null
);

-- Sơ đồ luôn hỏi "những người CHƯA xoá của cây này", không bao giờ hỏi cả bảng.
create index if not exists persons_song_idx
  on public.persons (tree_id) where deleted = false;

create index if not exists persons_branch_idx
  on public.persons (tree_id, branch_id);

-- ============================================================
-- 5. HÔN NHÂN
-- ============================================================
-- ⚠ `partners` là MẢNG, không phải hai cột `husband`/`wife`. Hai lý do, cả
--   hai đều là ca thật trong dữ liệu đang dùng: hôn nhân đồng giới phải chạy
--   được, và `partners` có thể chỉ có MỘT phần tử (U0024, U0026 — người cha
--   nhận con nuôi, không có vợ trong gia phả).
--
-- ⚠ `partner_order` ≠ `ranks`. Cái trước là chỗ đứng trái/phải trên sơ đồ,
--   người dùng hoán đổi được. Cái sau là thứ bậc vợ cả (1) / vợ thứ (2), một
--   sự thật về gia đình. Gộp hai thứ ấy là lỗi đã được cảnh báo bằng chữ ở ba
--   tài liệu khác nhau.
--
-- ⚠ Và `ranks` (object theo người) không phải `rank` (một số cho cả cặp).
--   Trường `rank` đã bỏ từ b46.
--
-- Cái giá của việc để `partners` là mảng: Postgres KHÔNG bắt buộc được khoá
-- ngoại trên từng phần tử mảng. Mã người chết trong `partners` sẽ không bị
-- cơ sở dữ liệu chặn. Đường ĐỌC của app vốn đã chịu được điều đó
-- (`layout.js` chỉ nhận partner nằm trong tập hiển thị), nên chấp nhận —
-- nhưng phải biết là đang chấp nhận.

create table if not exists public.unions (
  tree_id       uuid    not null references public.trees(id) on delete cascade,
  id            text    not null,
  uid           text    not null default '',
  partners      text[]  not null default '{}',
  partner_order text[]  not null default '{}',
  ranks         jsonb   not null default '{}'::jsonb,   -- { "P0002": 2 }
  status        text    not null default 'unknown'
                  check (status in ('married','divorced','widowed','unknown')),
  marriage      jsonb   not null default '{"iso":null,"raw":"","place":""}'::jsonb,
  note          text    not null default '',
  deleted       boolean not null default false,
  primary key (tree_id, id)
);

create index if not exists unions_song_idx
  on public.unions (tree_id) where deleted = false;

-- ============================================================
-- 6. CON  — bảng THẬT, không phải jsonb
-- ============================================================
-- `CAU-TRUC-DU-LIEU_V06` điều dễ sai số 4: **con thuộc `union`, không thuộc
-- `person`.** Không có `fatherId`/`motherId`. Một đứa con nuôi vẫn giữ liên
-- kết với cha mẹ ruột, tức thuộc HAI union — gắn thẳng vào person thì không
-- diễn tả nổi.
--
-- Cột tên `ord` chứ không `order`: `order` là từ khoá SQL, viết đâu cũng phải
-- bọc ngoặc kép. Trong trình duyệt trường ấy vẫn tên `order` — `hinh-dang.js`
-- đổi qua lại.

create table if not exists public.union_children (
  tree_id   uuid    not null,
  union_id  text    not null,
  person_id text    not null,
  relation  text    not null default 'birth'
              check (relation in ('birth','adopted','step','foster','thua_tu')),
  ord       integer not null default 1,
  primary key (tree_id, union_id, person_id),
  foreign key (tree_id, union_id)  references public.unions(tree_id, id)  on delete cascade,
  foreign key (tree_id, person_id) references public.persons(tree_id, id) on delete cascade
);

create index if not exists union_children_person_idx
  on public.union_children (tree_id, person_id);

-- ============================================================
-- 7. ẢNH
-- ============================================================
-- ⚠ Tên cột vẫn là `drive_file_id` dù không còn Drive nào cả. Đây là một VẾT
--   SẸO CÓ CHỦ Ý: `domains/media.js`, `domains/gedcom.js`, `domains/excel.js`
--   và bảy màn hình đọc/ghi trường `driveFileId` ở hơn ba mươi chỗ. Đổi tên
--   là sửa `domains/` — việc mà `BAT-DAU.md` mục 1 bảo phải dừng lại hỏi vì
--   sao. Giá trị bên trong nay là **đường dẫn trong Supabase Storage**
--   (`<tree_id>/<media_id>-nho.jpg`), không phải mã file Drive.
--
--   Muốn đổi tên cho đúng thì đó là một việc RIÊNG, có bước đổi dữ liệu và có
--   bộ kiểm chạy lại — đừng nhét vào lần chuyển nhà này.
--
-- ⚠ HAI BẢN MỖI TẤM (`…_lon`), không phải một file to rồi nhờ kho cắt nhỏ.
--   `config.js` đã chốt điều này từ 01/09/2026, và chốt CHÍNH VÌ ngày hôm
--   nay: dịch vụ cắt ảnh của Supabase nằm ở gói trả phí. Đừng quay lại lối cũ.

create table if not exists public.media (
  tree_id           uuid    not null references public.trees(id) on delete cascade,
  id                text    not null,
  subject_id        text    not null,             -- mã NGƯỜI (P…) hoặc HÔN NHÂN (U…)
  drive_file_id     text    not null default '',  -- bản NHỎ 400px — xem cảnh báo trên
  drive_file_id_lon text    not null default '',  -- bản LỚN 1600px, để in
  caption           text    not null default '',
  year              integer,
  deleted           boolean not null default false,
  meta              jsonb   not null default '{}'::jsonb,
  primary key (tree_id, id)
);

create index if not exists media_subject_idx
  on public.media (tree_id, subject_id) where deleted = false;

-- ============================================================
-- 8. NGUỒN
-- ============================================================
create table if not exists public.sources (
  tree_id uuid not null references public.trees(id) on delete cascade,
  id      text not null,
  title   text not null default '',
  author  text not null default '',
  note    text not null default '',
  primary key (tree_id, id)
);

-- ============================================================
-- 9. NHẬT KÝ THAY ĐỔI
-- ============================================================
-- ⚠ `ts` và `by` do MÁY CHỦ điền, không bao giờ lấy của trình duyệt. Đây là
--   luật cũ (`CAU-TRUC-DU-LIEU_V06` điều dễ sai số 6) và trên Postgres nó
--   được thi hành THẬT: `luu_cay()` lấy email từ JWT, còn thứ trình duyệt gửi
--   lên chỉ có `{ action, target, note, diff }`.
--
-- Không ai được ghi thẳng vào bảng này — `02-rls.sql` không cấp quyền insert
-- cho bất kỳ ai. Chỉ `luu_cay()` ghi được.

create table if not exists public.change_log (
  id       bigserial primary key,
  tree_id  uuid        not null references public.trees(id) on delete cascade,
  ts       timestamptz not null default now(),
  by_email text        not null default '',
  user_id  uuid,
  action   text        not null,
  target   text        not null default '',
  note     text        not null default '',
  diff     jsonb       not null default '{}'::jsonb,
  revision integer     not null default 0
);

create index if not exists change_log_tree_idx
  on public.change_log (tree_id, id desc);

-- ============================================================
-- 10. SỔ NHẬP
-- ============================================================
-- Mỗi lần trộn một file `.ged` hay `.xlsx` vào cây ghi MỘT dòng, giữ bảng ánh
-- xạ "bản ghi nào trong file là bản ghi nào trong cây". Nhờ nó, nhập lại lần
-- hai cùng một file thì nhận ra người cũ thay vì đẻ ra bản trùng.

create table if not exists public.imports (
  id          bigserial primary key,
  tree_id     uuid        not null references public.trees(id) on delete cascade,
  at          timestamptz not null default now(),
  by_email    text        not null default '',
  file        text        not null default '',
  source      text        not null default '' check (source in ('', 'GEDCOM', 'EXCEL')),
  source_name text        not null default '',
  exporter    text        not null default '',
  counts      jsonb       not null default '{}'::jsonb,
  map         jsonb       not null default '[]'::jsonb
);

create index if not exists imports_tree_idx
  on public.imports (tree_id, at desc);

-- ============================================================
-- 11. CÀI ĐẶT RIÊNG CỦA TỪNG NGƯỜI
-- ============================================================
-- Thay cho `PropertiesService.getUserProperties()` của Apps Script. Giữ đúng
-- tính chất cũ: người chỉ có quyền XEM vẫn lưu được cài đặt của mình, và
-- người biên tập KHÔNG đọc được cài đặt của người khác.

create table if not exists public.user_settings (
  user_id         uuid not null references auth.users(id) on delete cascade,
  tree_id         uuid not null references public.trees(id) on delete cascade,
  focus_person_id text,                            -- người trung tâm mặc định
  primary key (user_id, tree_id)
);

-- ============================================================
-- 12. KHO ẢNH
-- ============================================================
-- ⚠ `public = true` là một QUYẾT ĐỊNH VỀ RIÊNG TƯ, chưa được chủ dự án chốt.
--   Xem `KIEN-TRUC.md` mục 7 "Ảnh: kho công khai hay kho kín". Tóm tắt: kho
--   công khai cho đường dẫn đoán trước được, nên `utils/image.js` dựng được
--   URL mà không phải gọi máy chủ — 661 ô trên sơ đồ là 661 tấm, và xin chữ
--   ký cho từng tấm là một vòng mạng nữa mỗi lần vẽ. Đổi lại, ai biết đường
--   dẫn thì xem được ảnh, dù không vào được dữ liệu.
--   Đường dẫn mang uuid nên không đoán mò ra được; nhưng "khó đoán" không
--   phải "được bảo vệ", và phải nói thẳng như thế.
insert into storage.buckets (id, name, public)
values ('anh', 'anh', true)
on conflict (id) do nothing;
