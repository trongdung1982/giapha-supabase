// ============================================================
// giapha-supabase · kiem-thu/kiem-quan-ly-thanh-vien.mjs
// Vai trò  : Gác bước b105 — `luoc-do/13-quan-ly-thanh-vien.sql`, chỗ vá của
//            `12-tao-cay.sql`, và luật "không ai đặt quyền cho chính mình".
// Chạy     : cd supabase/kiem-thu && node kiem-quan-ly-thanh-vien.mjs
// Phiên bản: 0.1.0 · Cập nhật: 08/09/2026 17:21
// ============================================================
//
// ═══ BÀI KIỂM NÀY ĐỨNG Ở ĐÂU ═══
//
// Nó **không chạy SQL** — nó đọc văn bản file. Phần chạy thật là
// `kiem-thu/ban-thu-sql/do-b105.mjs` (ngoài repo, cần Postgres tại chỗ):
// 53 phép, mượn danh nghĩa tài khoản, có bốn phép kiểm chứng ngược.
//
// Hai bài kiểm gác hai thứ khác nhau, và cần cả hai:
//
//   • `do-b105.mjs` chứng minh **máy chủ chặn đúng** — nó thử leo thang thật.
//     Nhưng nó chỉ đo cái nó nghĩ ra để đo: một cửa leo thang thứ sáu mà tôi
//     chưa nghĩ tới sẽ không có phép nào hỏi.
//   • File này gác **hình dạng của mã**: đủ năm cửa cùng hỏi một hàm, thứ tự
//     ba câu di dời, `grant`/`revoke`, và — đắt nhất — nó **quét cả thư mục**
//     hỏi *"còn file nào ĐẶT vai `quan_tri_he_thong` vào bảng không"*.
//
// ⚠ Phép quét cả thư mục sinh ra từ bài học 04/09/2026 (b97): đổi mã vai `chu`
//   → `quan_tri_he_thong` phải dán lại NĂM file, và **danh sách viết tay không
//   trả lời được câu ấy — vì file bị quên cũng là file không có trong danh
//   sách**. Xem PHẦN F.
//
// ⚠ Luật đã ghi ở `kiem-nhieu-cay.mjs`: **đừng hỏi đúng chữ, hãy hỏi đúng điều.**

import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const DAY = dirname(fileURLToPath(import.meta.url));
const doc = (p) => readFileSync(resolve(DAY, p), 'utf8');

const SQL_13 = boGhiChu(doc('../luoc-do/13-quan-ly-thanh-vien.sql'));
const SQL_12 = boGhiChu(doc('../luoc-do/12-tao-cay.sql'));

let dat = 0, hong = 0;

// Năm cửa phải cùng hỏi một hàm. Viết ra đây một lần, dùng ở hai phần.
const NAM_CUA = ['doi_vai_thanh_vien', 'gan_nguoi_cho_thanh_vien',
                 'dat_tin_cay_thanh_vien', 'go_thanh_vien', 'doi_chu_cay'];

const SAU_HAM = [...NAM_CUA, 'ds_thanh_vien', 'la_chinh_minh', 'la_chu_cay',
                 'co_the_quan_tri', 'ds_tai_khoan'];

// ============================================================
// PHẦN A — ba câu di dời, và THỨ TỰ của chúng
// ============================================================
console.log('\nPHẦN A — di dời dữ liệu quyền');

kiem('gán chu_so_huu bằng cách SUY TỪ tree_members',
     /set\s+chu_so_huu\s*=\s*\(\s*select\s+tm\.user_id[\s\S]{0,220}?tree_members/i.test(SQL_13),
     'thiếu — không suy được chủ cây thì mục 4 neo vào một cột rỗng');

// ⚠ Không hỏi "có gán chu_so_huu không" mà hỏi "có gán bằng EMAIL CẮM CỨNG
//   không". `11-quyen-he-thong.sql` gán theo `trongdung1982@gmail.com`, và
//   đúng chỗ ấy làm cột đứng `null` trên bàn thử mà không câu lỗi nào. Chép
//   lại cách ấy sang `13` là chép lại đúng cái bẫy.
kiem('KHÔNG gán chu_so_huu theo email cắm cứng',
     !/chu_so_huu[\s\S]{0,200}?@gmail\.com/i.test(SQL_13),
     'đang cắm cứng email — máy chủ nào email khác thì cột đứng rỗng, lặng lẽ');

kiem('DỪNG HẲN nếu còn cây không có chủ',
     /raise\s+exception[\s\S]{0,200}?chu_so_huu|chu_so_huu\s+is\s+null[\s\S]{0,400}?raise\s+exception/i
       .test(SQL_13),
     'thiếu — cây không chủ là cây không ai duyệt được đơn, và không báo lỗi');

kiem('hạ vai quan_tri_he_thong → quan_tri trong tree_members',
     /update\s+public\.tree_members[\s\S]{0,120}?set\s+role\s*=\s*'quan_tri'[\s\S]{0,120}?where\s+role\s*=\s*'quan_tri_he_thong'/i
       .test(SQL_13),
     'thiếu — mã cũ còn trong bảng thì ràng buộc mới sẽ ném lỗi');

kiem('ràng buộc role MỚI không còn nhận quan_tri_he_thong',
     /add\s+constraint\s+tree_members_role_check[\s\S]{0,160}?check\s*\(\s*role\s+in\s*\([^)]*\)/i
       .test(SQL_13)
     && !/add\s+constraint\s+tree_members_role_check[\s\S]{0,160}?quan_tri_he_thong/i
       .test(SQL_13),
     'ràng buộc còn nhận mã cũ — một chữ vẫn mang hai nghĩa được');

// ⚠⚠ THỨ TỰ LÀ MỘT PHẦN CỦA PHÉP KIỂM, không phải chi tiết trình bày.
//    Thu hẹp ràng buộc TRƯỚC khi hạ vai là câu `alter` ném lỗi ngay trên dữ
//    liệu đang có. Hạ vai TRƯỚC khi gán chủ là xoá mất nguồn duy nhất còn suy
//    ra được ai là chủ. Cả hai đều hỏng theo kiểu không cứu được bằng cách
//    chạy lại.
const iGan  = viTri(SQL_13, /set\s+chu_so_huu\s*=/i);
const iHa   = viTri(SQL_13, /where\s+role\s*=\s*'quan_tri_he_thong'/i);
const iRang = viTri(SQL_13, /add\s+constraint\s+tree_members_role_check/i);

kiem('gán chu_so_huu đứng TRƯỚC hạ vai', iGan < iHa,
     'hạ vai trước là xoá mất nguồn duy nhất suy ra được ai là chủ cây');
kiem('hạ vai đứng TRƯỚC thu hẹp ràng buộc', iHa < iRang,
     'thu hẹp trước là câu alter ném lỗi ngay trên dữ liệu đang có');

// ============================================================
// PHẦN B — co_the_quan_tri() đổi nghĩa
// ============================================================
console.log('\nPHẦN B — neo quyền quản trị vào chu_so_huu');

const thanCTQT = thanHam(SQL_13, 'co_the_quan_tri');

kiem('có định nghĩa lại co_the_quan_tri()', !!thanCTQT,
     'thiếu — chủ cây mang vai quan_tri sẽ KHÔNG duyệt được đơn của cây mình');

kiem('co_the_quan_tri() hỏi cột chu_so_huu',
     /chu_so_huu/i.test(thanCTQT || ''),
     'không neo vào cột chủ cây thì nó vẫn là bản cũ');

kiem('co_the_quan_tri() KHÔNG còn so với mã vai quan_tri_he_thong',
     !/=\s*'quan_tri_he_thong'/i.test(thanCTQT || ''),
     'còn hỏi mã vai — mà mã ấy nay không nằm trong bảng nữa');

// ⚠ Bẫy `null` đã mở một lỗ leo quyền thật ngày 04/09 (b94) mà 57 phép kiểm
//   tự động báo xanh: `false or null` cho ra `null`, không cho ra `false`.
kiem('co_the_quan_tri() bọc coalesce(…, false)',
     /coalesce\s*\([\s\S]{0,160}?false\s*\)/i.test(thanCTQT || ''),
     'thiếu coalesce — hàm gác cửa trả null là đúng bẫy b94');

kiem('co_the_quan_tri() vẫn nhận Quản trị hệ thống',
     /la_quan_tri_he_thong\s*\(\s*\)/i.test(thanCTQT || ''),
     'thiếu — Quản trị hệ thống mất quyền quản trị ở mọi cây');

kiem('co_the_quan_tri() là security definer',
     /security\s+definer/i.test(thanCTQT || ''),
     'không có thì hàm chạy bằng quyền người gọi và RLS chặn nó đọc trees');

// ============================================================
// PHẦN C — LUẬT KHÔNG AI ĐẶT QUYỀN CHO CHÍNH MÌNH
// ============================================================
// ⚠⚠ PHẦN QUAN TRỌNG NHẤT FILE. Chặn cửa "đổi vai" mà quên bốn cửa kia thì
//    luật vẫn hở, và bốn phép còn lại vẫn báo xanh. Hai cửa ngầm dễ quên nhất:
//      · gắn mã người cho mình vào một cụ tổ → pham_vi_sua() mở ra CẢ CÂY
//      · bật tin_cay cho mình → ghi thẳng, bỏ qua hàng chờ kiểm duyệt
console.log('\nPHẦN C — không ai đặt quyền cho chính mình (5 cửa)');

kiem('có hàm la_chinh_minh()', !!thanHam(SQL_13, 'la_chinh_minh'),
     'thiếu — luật không có chỗ trả lời, mỗi hàm sẽ tự chép một bản');

kiem('la_chinh_minh() so với auth.uid()',
     /auth\.uid\s*\(\s*\)/i.test(thanHam(SQL_13, 'la_chinh_minh') || ''),
     'không hỏi ai đang gọi thì nó không trả lời được câu nào');

for (const ten of NAM_CUA) {
  const than = thanHam(SQL_13, ten);
  kiem('cửa `' + ten + '` hỏi la_chinh_minh()',
       /la_chinh_minh\s*\(/i.test(than || ''),
       'CÒN ĐƯỜNG TỰ NÂNG QUYỀN qua cửa này');
}

// Không ngoại lệ cho Quản trị hệ thống: nếu có nhánh `if la_quan_tri_he_thong`
// đứng TRƯỚC phép hỏi la_chinh_minh trong doi_chu_cay thì luật có ngoại lệ.
{
  const t = thanHam(SQL_13, 'doi_chu_cay') || '';
  kiem('doi_chu_cay() KHÔNG mở ngoại lệ cho Quản trị hệ thống',
       viTri(t, /la_chinh_minh/i) < viTri(t, /update\s+public\.trees/i),
       'luật có ngoại lệ — và ngoại lệ là chỗ lỗ hổng hay nằm');
}

// ============================================================
// PHẦN D — trần quyền, chủ cây, tài khoản sao lưu
// ============================================================
console.log('\nPHẦN D — trần quyền và ba thứ bất khả xâm phạm');

{
  const t = thanHam(SQL_13, 'doi_vai_thanh_vien') || '';

  kiem('doi_vai_thanh_vien() có trần: chỉ quan_tri · sua · xem',
       /not\s+in\s*\(\s*'quan_tri'\s*,\s*'sua'\s*,\s*'xem'\s*\)/i.test(t),
       'mất trần — cấp được vai bất kỳ, kể cả mã hệ thống');

  kiem('doi_vai_thanh_vien() chặn hạ vai CHỦ CÂY',
       /la_chu_cay\s*\(/i.test(t),
       'người được phong quan_tri sẽ hạ được chủ cây rồi chiếm cây');

  kiem('doi_vai_thanh_vien() chặn đụng tài khoản sao_luu',
       /'sao_luu'/i.test(t),
       'đổi vai tài khoản sao lưu là hỏng sao lưu đêm LẶNG LẼ — file vẫn có, chỉ rỗng');
}

{
  const t = thanHam(SQL_13, 'go_thanh_vien') || '';
  kiem('go_thanh_vien() chặn gỡ CHỦ CÂY', /la_chu_cay\s*\(/i.test(t),
       'gỡ được chủ cây là chiếm được cây');
  kiem('go_thanh_vien() chặn gỡ tài khoản sao_luu', /'sao_luu'/i.test(t),
       'gỡ nó là bản sao lưu đêm ra file rỗng');
}

{
  const t = thanHam(SQL_13, 'gan_nguoi_cho_thanh_vien') || '';
  kiem('gan_nguoi_cho_thanh_vien() kiểm mã người CÓ THẬT trong cây',
       /from\s+public\.persons[\s\S]{0,160}?tree_id\s*=\s*p_tree/i.test(t),
       'không kiểm thì gắn được mã bịa, và pham_vi_sua() trả về rỗng lặng lẽ');
  kiem('gan_nguoi_cho_thanh_vien() bắt lỗi trùng mã người',
       /unique_violation/i.test(t),
       'một mã người chỉ gắn cho một tài khoản — thiếu thì người bấm nhận mã lỗi Postgres');
}

// ============================================================
// PHẦN E — bàn giao gia phả
// ============================================================
console.log('\nPHẦN E — bàn giao gia phả');

{
  const t = thanHam(SQL_13, 'doi_chu_cay') || '';

  kiem('doi_chu_cay() đổi cột chu_so_huu',
       /update\s+public\.trees\s+set\s+chu_so_huu/i.test(t),
       'thiếu — không bàn giao được gì');

  // ⚠⚠ Bẫy lớn nhất của hàm này, cùng họ với bẫy `la_thanh_vien()` mà
  //    THIET-KE-NHIEU-CAY.md mục 2 cảnh báo: chủ mới SỬA được mà KHÔNG ĐỌC
  //    được. Triệu chứng là "bấm Lưu báo thành công mà màn hình trống".
  kiem('doi_chu_cay() chèn dòng tree_members cho chủ MỚI',
       /insert\s+into\s+public\.tree_members/i.test(t),
       'chủ mới sẽ SỬA được mà KHÔNG ĐỌC được — mất nửa buổi mới lần ra');

  kiem('dòng ấy chịu được trường hợp chủ mới ĐÃ có chân trong cây',
       /on\s+conflict\s*\(\s*tree_id\s*,\s*user_id\s*\)\s*do\s+update/i.test(t),
       'thiếu on conflict — bàn giao cho người đã ở trong cây sẽ ném lỗi trùng khoá');

  kiem('chủ CŨ ở lại làm quan_tri, không bị gỡ',
       /update\s+public\.tree_members[\s\S]{0,200}?v_chu_cu/i.test(t),
       'bàn giao không phải đuổi đi — và chủ cũ thường là người duy nhất còn biết dữ liệu');

  kiem('doi_chu_cay() là plpgsql (ba câu ghi trong MỘT giao dịch)',
       /language\s+plpgsql/i.test(t),
       'tách rời ba câu ghi là để lại một cây nửa vời không ai sửa được');
}

// ============================================================
// PHẦN F — QUÉT CẢ THƯ MỤC: còn file nào ĐẶT vai cũ vào bảng không
// ============================================================
// ⚠⚠ Phép đắt nhất của bài kiểm này, và nó sinh ra từ b97 (04/09/2026): đổi
//    mã vai phải dán lại NĂM file, và **danh sách viết tay không trả lời được
//    câu "còn sót file nào không" — vì file bị quên cũng là file không có
//    trong danh sách**.
//
// ⚠ Hỏi đúng điều, không hỏi đúng chữ: mã `quan_tri_he_thong` **vẫn được
//   phép** xuất hiện khắp nơi trong `role in (…)` (vô hại) và trong tên hàm
//   `la_quan_tri_he_thong()` (thứ khác hẳn). Cái bị cấm là **ĐẶT nó vào
//   `tree_members.role`** — tức trong một câu `insert into tree_members` hay
//   một câu `set role =`.
console.log('\nPHẦN F — quét cả thư mục tìm chỗ còn ĐẶT vai cũ');

{
  const gocLuoc = resolve(DAY, '../luoc-do');
  const gocDiDoi = resolve(DAY, '../di-doi');
  const soi = [];

  for (const f of readdirSync(gocLuoc).filter((x) => x.endsWith('.sql'))) {
    // ⚠ `09-doi-ma-vai.sql` là file DI DỜI của b97: việc của nó đúng là ĐẶT mã
    //   `quan_tri_he_thong` vào bảng, và nó chỉ chạy trên máy chủ chưa có `13`.
    //   Bỏ qua có tên, không bỏ qua bằng cách nới lỏng phép soi cho mọi file.
    if (f === '09-doi-ma-vai.sql') continue;
    soi.push([join(gocLuoc, f), 'luoc-do/' + f]);
  }
  for (const f of readdirSync(gocDiDoi).filter((x) => x.endsWith('.mjs'))) {
    soi.push([join(gocDiDoi, f), 'di-doi/' + f]);
  }

  const banAn = [];
  for (const [duong, ten] of soi) {
    const noi = boGhiChu(readFileSync(duong, 'utf8'))
      .split('\n').filter((d) => !/^\s*\/\//.test(d)).join('\n');
    for (const khoi of khoiGhiVaoThanhVien(noi)) {
      if (/quan_tri_he_thong/i.test(khoi)) { banAn.push(ten); break; }
    }
  }

  kiem('không file nào còn ĐẶT vai quan_tri_he_thong vào tree_members',
       banAn.length === 0,
       'còn ở: ' + banAn.join(', ') + ' — máy chủ đã chạy `13` sẽ ném lỗi ràng buộc');

  kiem('đã soi ít nhất 12 file (phép quét có thật sự chạy)',
       soi.length >= 12,
       'chỉ soi được ' + soi.length + ' file — phép quét không đo gì');
}

// ============================================================
// PHẦN G — `12-tao-cay.sql` đã vá
// ============================================================
console.log('\nPHẦN G — 12-tao-cay.sql cấp đúng vai');

{
  const t = thanHam(SQL_12, 'tao_gia_pha_moi') || '';
  kiem('tao_gia_pha_moi() cấp vai quan_tri',
       /'quan_tri'\s*,\s*coalesce\s*\(\s*v_email/i.test(t),
       'còn bản 0.1.0 — nút Tạo sẽ ném lỗi ràng buộc ngay lần dựng cây đầu tiên');
  kiem('tao_gia_pha_moi() KHÔNG cấp vai quan_tri_he_thong',
       !/'quan_tri_he_thong'/i.test(t),
       'vai hệ thống không sống trong bảng này');
  kiem('tao_gia_pha_moi() vẫn đặt chu_so_huu = auth.uid()',
       /chu_so_huu[\s\S]{0,200}?auth\.uid\s*\(\s*\)/i.test(t),
       'thiếu — cây mới không có chủ, và `13` sẽ DỪNG HẲN ở lần chạy sau');
}

// ============================================================
// PHẦN H — grant / revoke
// ============================================================
console.log('\nPHẦN H — cấp quyền gọi hàm');

for (const ten of SAU_HAM) {
  kiem('`' + ten + '` được grant cho authenticated',
       new RegExp('grant\\s+execute\\s+on\\s+function\\s+public\\.' + ten + '\\s*\\(')
         .test(SQL_13),
       'không cấp thì trình duyệt gọi ra lỗi quyền');
}
kiem('có revoke … from public, anon',
     (SQL_13.match(/revoke\s+all\s+on\s+function[\s\S]{0,120}?from\s+public\s*,\s*anon/gi) || [])
       .length >= 8,
     'thiếu revoke — mở rộng bề mặt tấn công mà không đổi lấy gì');

// ============================================================
// PHẦN Z — KIỂM CHỨNG NGƯỢC: bài kiểm này có thật sự bắt được không
// ============================================================
// ⚠ Không có phần này thì "n/n ĐẠT" chỉ chứng minh bài kiểm chạy được, không
//   chứng minh nó đo được gì. Đưa mã HỎNG có chủ ý vào chính những phép soi
//   ở trên và đòi chúng nói HỎNG.
console.log('\nPHẦN Z — kiểm chứng ngược (bài kiểm tự soi mình)');

{
  // Z1 · một hàm quên hỏi la_chinh_minh() thì PHẦN C phải bắt.
  const gay1 = 'create or replace function public.go_thanh_vien(p_tree uuid, p_user uuid)\n'
    + 'returns jsonb language plpgsql as $$ begin\n'
    + '  if not public.co_the_quan_tri(p_tree) then return null; end if;\n'
    + '  delete from public.tree_members; return null;\nend; $$;\n';
  kiem('Z1 · bắt được hàm quên hỏi la_chinh_minh()',
       !/la_chinh_minh\s*\(/i.test(thanHam(gay1, 'go_thanh_vien') || ''),
       'phép soi PHẦN C mù — nó sẽ báo xanh cho một cửa leo thang mở toang');

  // Z2 · ràng buộc còn nhận mã cũ thì PHẦN A phải bắt.
  const gay2 = 'alter table public.tree_members add constraint tree_members_role_check\n'
    + "  check (role in ('quan_tri_he_thong', 'quan_tri', 'sua', 'xem', 'sao_luu'));\n";
  kiem('Z2 · bắt được ràng buộc còn nhận quan_tri_he_thong',
       /add\s+constraint\s+tree_members_role_check[\s\S]{0,160}?quan_tri_he_thong/i.test(gay2),
       'phép soi PHẦN A mù — một chữ vẫn mang hai nghĩa được');

  // Z3 · doi_chu_cay() thiếu insert thì PHẦN E phải bắt.
  const gay3 = 'create or replace function public.doi_chu_cay(p_tree uuid, p_user_moi uuid)\n'
    + 'returns jsonb language plpgsql as $$ begin\n'
    + '  update public.trees set chu_so_huu = p_user_moi where id = p_tree;\n'
    + '  return null;\nend; $$;\n';
  kiem('Z3 · bắt được doi_chu_cay() thiếu insert tree_members',
       !/insert\s+into\s+public\.tree_members/i.test(thanHam(gay3, 'doi_chu_cay') || ''),
       'phép soi PHẦN E mù — chủ mới sửa được mà không đọc được');

  // Z4 · phép quét PHẦN F phải bắt được một câu insert đặt vai cũ.
  const gay4 = "insert into public.tree_members (tree_id, user_id, role)\n"
    + "values (v_tree, auth.uid(), 'quan_tri_he_thong');\n";
  kiem('Z4 · phép quét thư mục bắt được câu insert đặt vai cũ',
       khoiGhiVaoThanhVien(gay4).some((k) => /quan_tri_he_thong/i.test(k)),
       'phép quét PHẦN F mù — nó sẽ bỏ lọt đúng thứ nó sinh ra để tìm');

  // Z5 · và nó KHÔNG được bắt nhầm một câu `role in (…)` vô hại.
  const lanh = "select 1 from public.tree_members\n"
    + " where role in ('quan_tri_he_thong', 'quan_tri', 'sao_luu');\n";
  kiem('Z5 · phép quét KHÔNG bắt nhầm câu `role in (…)` vô hại',
       khoiGhiVaoThanhVien(lanh).length === 0,
       'bắt nhầm — bài kiểm sẽ báo đỏ ở 6 file đang hoàn toàn đúng');

  // ⚠ Z6 giữ lại đúng cái sai lần chạy đầu 08/09/2026: phép soi báo đỏ chính
  //   câu di dời của `13`, vì mã cũ nằm ở vế ĐIỀU KIỆN chứ không ở vế GHI.
  const diDoi = "update public.tree_members\n"
    + "   set role = 'quan_tri'\n where role = 'quan_tri_he_thong';\n";
  kiem('Z6 · phép quét KHÔNG bắt nhầm chính câu di dời của `13`',
       !khoiGhiVaoThanhVien(diDoi).some((k) => /quan_tri_he_thong/i.test(k)),
       'bắt nhầm — phép soi không phân biệt được "ghi cái gì" với "tìm cái gì"');
}

// ============================================================
console.log('\n— ĐẠT ' + dat + ' · HỎNG ' + hong + ' —');
if (hong) console.log('\n✗ Đừng đưa file SQL cho chủ dự án dán khi còn phép HỎNG.');
process.exitCode = hong ? 1 : 0;

// ============================================================
// BỘ ĐỒ NGHỀ
// ============================================================

function kiem(ten, dieuKien, chiTiet) {
  if (dieuKien) { dat++; console.log('  ĐẠT  ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + '  →  ' + chiTiet); }
}

/** Bỏ mọi dòng ghi chú `--` để phép soi không "đạt" nhờ chính lời giải thích. */
function boGhiChu(sql) {
  return sql.split('\n').filter((d) => !/^\s*--/.test(d)).join('\n');
}

/** Thân của một hàm SQL: từ `create … function <ten>` tới dấu `$$;` đóng. */
function thanHam(sql, ten) {
  const re = new RegExp('create\\s+or\\s+replace\\s+function\\s+public\\.' + ten + '\\b');
  const i = (sql || '').search(re);
  if (i < 0) return null;
  const j = sql.indexOf('$$;', i);
  return j < 0 ? sql.slice(i) : sql.slice(i, j + 3);
}

/** Vị trí khớp đầu tiên, hoặc một số rất lớn khi không khớp. */
function viTri(s, re) {
  const i = (s || '').search(re);
  return i < 0 ? Number.MAX_SAFE_INTEGER : i;
}

/**
 * Nhặt ra những khối SQL **GHI XUỐNG** `tree_members.role`.
 *
 * ⚠ Đây là chỗ "hỏi đúng điều, đừng hỏi đúng chữ" thành mã. Mã
 * `quan_tri_he_thong` xuất hiện hợp lệ ở rất nhiều nơi — trong `role in (…)`
 * của sáu hàm, và trong tên `la_quan_tri_he_thong()` là thứ khác hẳn. Cái bị
 * cấm chỉ là ĐẶT nó vào bảng. Nên phép soi cắt ra đúng hai loại câu:
 *
 *   · `insert into … tree_members …` cho tới dấu `;`
 *   · `set role = …` cho tới dấu `;`
 *
 * ⚠⚠ VÀ PHẢI CẮT Ở `where`, KHÔNG CHỈ Ở `;`. Lần chạy đầu 08/09/2026 phép
 * soi này báo đỏ chính `13`, vì câu di dời của nó là
 *
 *     update tree_members set role = 'quan_tri' where role = 'quan_tri_he_thong';
 *
 * — chữ cũ nằm ở vế ĐIỀU KIỆN, còn thứ được GHI XUỐNG là `'quan_tri'`. Một
 * phép soi không phân biệt được "ghi cái gì" với "tìm cái gì" thì nó báo đỏ
 * đúng cái file sinh ra để dọn, và cách chữa dễ dãi — thêm một ngoại lệ theo
 * tên file — sẽ làm nó mù luôn với file thật sự sai sau này.
 *
 * Phép soi Z4/Z5/Z6 chứng minh nó bắt đúng câu ghi, không bắt nhầm câu
 * `role in (…)`, và không bắt nhầm chính câu di dời.
 */
function khoiGhiVaoThanhVien(sql) {
  const ra = [];
  const s = sql || '';

  /** Cắt từ vị trí `i` tới dấu `;` hoặc chữ `where` — cái nào tới trước. */
  const cat = (i) => {
    const conLai = s.slice(i);
    const jCham = conLai.indexOf(';');
    const mWhere = /\bwhere\b/i.exec(conLai);
    const het = Math.min(
      jCham < 0 ? conLai.length : jCham,
      mWhere ? mWhere.index : conLai.length);
    return conLai.slice(0, het);
  };

  let m;
  const reIns = /insert\s+into\s+(?:public\.)?tree_members\b/gi;
  while ((m = reIns.exec(s)) !== null) ra.push(cat(m.index));

  const reSet = /\bset\s+role\s*=/gi;
  while ((m = reSet.exec(s)) !== null) ra.push(cat(m.index));

  return ra;
}
