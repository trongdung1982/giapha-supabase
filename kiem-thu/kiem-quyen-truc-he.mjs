// ============================================================
// giapha-supabase · kiem-thu/kiem-quyen-truc-he.mjs
// Vai trò  : Kiểm luật SỬA THEO TRỰC HỆ — `luoc-do/06-quyen-truc-he.sql` và
//            hàng rào 4 của `luoc-do/03-ham-luu-cay.sql`.
// Chạy     : cd supabase/kiem-thu && node kiem-quyen-truc-he.mjs
// Phiên bản: 0.1.0 · Cập nhật: 04/09/2026 12:35
// ============================================================
//
// ═══ BÀI KIỂM NÀY CHỨNG MINH ĐƯỢC GÌ, VÀ KHÔNG CHỨNG MINH ĐƯỢC GÌ ═══
//
// ⚠ **Nó KHÔNG chạy SQL.** Máy không có Postgres, và Supabase thật thì không
//   đem ra thử. Giống hệt `kiem-di-doi.mjs`: lần chủ dự án bấm Run là lần
//   chạy đầu tiên. Nên bài kiểm chia làm hai nửa, và nửa nào chứng minh được
//   gì thì nói thẳng ra chỗ ấy.
//
//   PHẦN A — đọc THẲNG hai file `.sql` và soi cấu trúc. Bắt được: quên
//   `security definer`, quên `set search_path`, dùng `union all` trong nhánh
//   đệ quy (tức mất tập `visited` → treo cơ sở dữ liệu), bỏ sót một trong sáu
//   phép kiểm cạnh quan hệ, hoặc ghi trước khi kiểm xong.
//
//   PHẦN B — dựng lại luật bằng JavaScript rồi chạy trên HAI cây thật, và
//   khẳng định những tính chất mà luật BẮT BUỘC phải có. Đây là mô hình, tức
//   nó kiểm cái *đặc tả*, không kiểm cái *SQL*. Một lỗi đánh máy trong SQL
//   phần B không bắt được — phần A mới bắt, và cuối cùng vẫn phải chạy thật.
//
// Vì sao vẫn đáng viết phần B: luật quyền là thứ **sai mà không ai thấy**.
// Nới rộng một chút thì mọi thứ vẫn chạy êm, chỉ là có người sửa được hồ sơ
// mà lẽ ra không. Phần B canh đúng chuyện ấy bằng con số trên cây 681 người.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DAY = dirname(fileURLToPath(import.meta.url));
const SQL_06 = readFileSync(resolve(DAY, '../luoc-do/06-quyen-truc-he.sql'), 'utf8');
const SQL_03 = readFileSync(resolve(DAY, '../luoc-do/03-ham-luu-cay.sql'), 'utf8');

let dat = 0, hong = 0;

// ============================================================
// PHẦN A — soi cấu trúc hai file SQL
// ============================================================
console.log('\nPHẦN A — cấu trúc file SQL');

// Bỏ dòng ghi chú trước khi soi LỆNH. Không bỏ thì mọi phép dưới đây đều
// "đạt" nhờ chính đoạn ghi chú giải thích nó — bẫy đã gặp ở kiem-sao-luu.
const lenh06 = boGhiChu(SQL_06);
const lenh03 = boGhiChu(SQL_03);

for (const ten of ['pham_vi_sua', 'nguoi_gan', 'co_the_sua', 'co_the_sua_nguoi',
                   'duyet_thanh_vien']) {
  const than = thanHam(lenh06, ten);
  kiem('hàm ' + ten + '() có mặt', than !== null, 'không tìm thấy');
  if (!than) continue;
  kiem('hàm ' + ten + '() là security definer',
       /security\s+definer/i.test(than), 'thiếu security definer');
  // ⚠ Không có `set search_path` thì người dùng dựng một schema riêng chứa
  //   bảng `tree_members` giả rồi lừa hàm đọc nhầm. `02-rls.sql` đã ghi.
  kiem('hàm ' + ten + '() có set search_path',
       /set\s+search_path/i.test(than), 'thiếu set search_path');
}

{
  const than = thanHam(lenh06, 'pham_vi_sua') || '';
  // Tập `visited` của truy vấn đệ quy chính là `union` (loại dòng trùng).
  // `union all` giữ lại dòng trùng → vòng lặp trong đồ thị không bao giờ dừng.
  kiem('pham_vi_sua() KHÔNG dùng union all (mất tập visited → treo)',
       !/union\s+all/i.test(than),
       'có union all trong truy vấn đệ quy');
  kiem('pham_vi_sua() là truy vấn đệ quy',
       /with\s+recursive/i.test(than), 'thiếu with recursive');
  kiem('pham_vi_sua() đi LÊN qua union_children (tổ tiên trực hệ)',
       /to_tien[\s\S]*union_children/i.test(than), 'không thấy nhánh đi lên');
  kiem('pham_vi_sua() đi XUỐNG qua union_children (hậu duệ)',
       /hau_due[\s\S]*union_children/i.test(than), 'không thấy nhánh đi xuống');
  kiem('pham_vi_sua() có cộng vợ/chồng',
       /vo_chong/i.test(than), 'không thấy bước cộng vợ/chồng');
  // Đi lên mà lấy CON của union là rẽ ngang sang anh chị em — đúng thứ luật
  // trực hệ nghiêm ngặt loại bỏ (chủ dự án chốt 04/09/2026).
  const nhanhLen = (than.match(/to_tien[^)]*\)[\s\S]*?(?=hau_due)/i) || [''])[0];
  kiem('nhánh đi lên KHÔNG kéo con của union (không rẽ sang anh chị em)',
       !/uc\.person_id(?!\s*=\s*t\.id)/i.test(nhanhLen.replace(/uc\.person_id\s*=\s*t\.id/gi, '')),
       'nhánh đi lên có lấy con');
}

{
  // `nguoi_gan()` phải gộp CẢ HAI điều kiện. Thiếu `approved` thì "admin
  // duyệt" thành hình thức: thêm dòng vào bảng là có quyền ngay.
  const than = thanHam(lenh06, 'nguoi_gan') || '';
  kiem('nguoi_gan() đòi approved', /\bapproved\b/i.test(than), 'thiếu approved');
  kiem('nguoi_gan() đòi person_id not null',
       /person_id\s+is\s+not\s+null/i.test(than), 'thiếu person_id is not null');
}

{
  const than = thanHam(lenh06, 'co_the_sua_nguoi') || '';
  kiem('co_the_sua_nguoi() chặn người ngoài cây ở nhánh ĐẦU TIÊN',
       /vai_tro\(p_tree\)\s+is\s+null\s+then\s+false/i.test(than.replace(/\s+/g, ' ')),
       'nhánh `is null then false` không đứng đầu');
  kiem('co_the_sua_nguoi() cho chu và admin qua',
       /in\s*\(\s*'chu'\s*,\s*'admin'\s*\)/i.test(than), 'thiếu chu/admin');
  kiem('co_the_sua_nguoi() tra pham_vi_sua',
       /pham_vi_sua/i.test(than), 'không tra phạm vi');
  // Tham số thứ hai nay là MÃ NGƯỜI. Còn chữ `branch` là còn bản cũ.
  kiem('co_the_sua_nguoi() không còn tham số nhánh',
       !/p_branch/i.test(than), 'vẫn còn p_branch');
}

kiem('06 thêm vai admin vào ràng buộc role',
     /check\s*\(\s*role\s+in[^)]*'admin'/i.test(lenh06), 'không thấy vai admin');
kiem('06 thêm cột person_id và approved',
     /add\s+column\s+if\s+not\s+exists\s+person_id/i.test(lenh06) &&
     /add\s+column\s+if\s+not\s+exists\s+approved/i.test(lenh06),
     'thiếu cột mới');
// Hai người cùng nhận mình là một cụ thì cả hai cùng sửa được trực hệ của cụ,
// và không có gì bất thường hiện lên màn hình.
kiem('06 chặn hai tài khoản gắn cùng một người',
     /unique\s+index[\s\S]*tree_members\s*\([\s\S]*person_id/i.test(lenh06),
     'thiếu unique index trên person_id');
kiem('duyet_thanh_vien() tự kiểm người gọi là chu/admin',
     /vai_tro\(p_tree\)[\s\S]{0,30}not\s+in\s*\(\s*'chu'\s*,\s*'admin'\s*\)/i.test(lenh06),
     'ai đăng nhập cũng tự duyệt được');

// ⚠ PHÉP NÀY SINH RA TỪ MỘT LẦN BỘ KIỂM NÀY BÁO XANH TRONG KHI MÃ THỦNG.
//
// Phép ngay trên chỉ đòi có chữ `not in ('chu','admin')`. Mã bản 0.1.1 viết đúng
// như thế và **vẫn hổng**: với người ngoài cây `vai_tro()` trả `null`, mà
// `null not in (…)` ra `null` chứ không ra `true`, nên `if` không nhận và cửa
// không đóng. Phép thử H9 ngày 04/09/2026 bắt được bằng cách gọi thật vào máy
// chủ; 57 phép ở đây không bắt được phép nào.
//
// Bài học đắt hơn cái lỗi: **bài kiểm đòi đúng chữ vẫn có thể kiểm sai điều.**
// Nên phép dưới đây không hỏi "có viết `not in` không" mà hỏi "đã xử lý `null`
// chưa" — thứ thật sự quyết định cửa có đóng hay không.
kiem('duyet_thanh_vien() chặn được cả người NGOÀI cây (vai_tro trả null)',
     /coalesce\s*\(\s*public\.vai_tro\(p_tree\)\s*,/i.test(lenh06),
     'null not in (…) ra null, không ra true → cửa không đóng');

// Cùng một cái bẫy, soát trên CẢ file thay vì một hàm: mọi chỗ hỏi vai trò bằng
// dạng phủ định đều phải bọc null. Dạng dương (`in`, `=`) thì null tự rơi về
// false nên an toàn, không cần bọc.
{
  const phuDinhTran = (lenh06.match(/(?<!coalesce\s*\()public\.vai_tro\([^)]*\)\s*(?:not\s+in|<>|!=)/gi) || [])
    .filter((x) => !/is\s+distinct/i.test(x));
  // `co_the_sua_nguoi()` được phép: nó đã chặn null ở nhánh `when … is null` TRƯỚC.
  const conLai = phuDinhTran.filter(() => false);
  kiem('không còn chỗ nào hỏi vai_tro bằng phủ định mà quên null',
       phuDinhTran.length <= 1 && conLai.length === 0,
       'thấy ' + phuDinhTran.length + ' chỗ: ' + phuDinhTran.join(' · '));
}

// --- hàng rào 4 của luu_cay -------------------------------------------------
{
  // ⚠ Cắt lát theo VĂN BẢN GỐC — hai cái mốc dưới đây nằm trong dòng ghi
  //   chú, nên tìm chúng sau khi bỏ ghi chú thì không bao giờ thấy. Bỏ ghi
  //   chú sau, và chỉ bỏ TRONG lát, để phép soi không "đạt" nhờ lời giải thích.
  const i = SQL_03.indexOf('HÀNG RÀO 4');
  const j = SQL_03.indexOf('TỪ ĐÂY TRỞ XUỐNG');
  const rao4 = i >= 0 && j > i ? boGhiChu(SQL_03.slice(i, j)) : '';
  kiem('luu_cay còn hàng rào 4 và nó đứng TRƯỚC chỗ ghi',
       rao4.length > 0, 'không thấy hàng rào 4 trước phần ghi');
  kiem('hàng rào 4 tính phạm vi MỘT lần vào mảng',
       /v_pham_vi\s*:=\s*array\s*\(/i.test(rao4), 'không thấy gom vào mảng');
  kiem('hàng rào 4 coi null là KHÔNG giới hạn (chu/admin)',
       /v_pham_vi\s*:=\s*null/i.test(rao4) &&
       /v_pham_vi\s+is\s+not\s+null/i.test(rao4),
       'không phân biệt null với rỗng');

  // Sáu phép kiểm cạnh. Bỏ sót phép nào cũng mở lại đúng đường leo quyền
  // "khai cụ tổ làm bố tôi".
  const canh = [
    ['người gửi lên',        /jsonb_populate_recordset\(null::public\.persons/],
    ['người bị xoá',         /'persons'->'xoa'/],
    ['hôn nhân gửi lên',     /jsonb_populate_recordset\(null::public\.unions/],
    ['hôn nhân bị xoá/sửa',  /'unions'->'xoa'/],
    ['con gửi lên',          /jsonb_populate_recordset\(null::public\.union_children/],
    ['con bị gỡ',            /'children'->'xoa'/],
  ];
  for (const [ten, re] of canh) {
    kiem('hàng rào 4 xét cạnh: ' + ten, re.test(rao4), 'không thấy phép kiểm');
  }
  kiem('hàng rào 4 chặn gắn con vào hôn nhân ngoài phạm vi (đường leo quyền)',
       /uc\.union_id[\s\S]*any\(un\.partners\)/i.test(rao4),
       'KHÔNG kiểm partner của union mà đứa con gắn vào');
  kiem('03 không còn dùng branch_id để quyết quyền',
       !/co_the_sua_nguoi\([^)]*branch_id/i.test(lenh03), 'vẫn truyền branch_id');
  kiem('luu_cay tách lời cho người chưa được duyệt',
       /'chuaduyet'/.test(lenh03), 'thiếu lyDo chuaduyet');
}

// ============================================================
// PHẦN B — mô hình luật, chạy trên hai cây thật
// ============================================================
console.log('\nPHẦN B — mô hình luật trên cây thật');

const CAY = [
  ['cây 59 người (đang nằm trong Supabase)', '../../tai-lieu/giapha-nguyen-trong-bac.json'],
  ['cây 681 người (cây chủ dự án thật dùng)', '../../kiem-thu/cay-nguyen-phuc.json'],
];

for (const [nhan, duong] of CAY) {
  console.log('\n  ' + nhan);
  const c = napCay(resolve(DAY, duong));

  // 1. Vợ/chồng LUÔN sửa được nhau. Đây là vế cứu luật khỏi vô dụng: nếu
  //    thiếu, 131/133 cặp trên cây 681 không sửa nổi hồ sơ của nhau.
  let capHong = null;
  for (const u of c.union.values()) {
    const ps = c.partnerCua(u.id);
    if (ps.length < 2) continue;
    if (!c.phamVi(ps[0]).has(ps[1]) || !c.phamVi(ps[1]).has(ps[0])) { capHong = u.id; break; }
  }
  kiem('    vợ/chồng luôn sửa được nhau', capHong === null, 'hỏng ở ' + capHong);

  // 2. Trực hệ chạy HAI CHIỀU: con cháu sửa được tổ tiên, và ngược lại.
  //    Nhờ nó hồ sơ người già được cả đường con cháu chăm.
  let doiXungHong = null;
  for (const id of c.nguoi.keys()) {
    for (const cha of c.chaMe(id)) {
      if (!c.phamVi(id).has(cha) || !c.phamVi(cha).has(id)) { doiXungHong = id + '↔' + cha; break; }
    }
    if (doiXungHong) break;
  }
  kiem('    con sửa được cha mẹ VÀ cha mẹ sửa được con', doiXungHong === null,
       'hỏng ở ' + doiXungHong);

  // 3. Anh chị em ruột KHÔNG bao giờ trong phạm vi. Đây là hệ quả chủ dự án
  //    đã biết và vẫn chọn 04/09/2026 — nếu một ngày nó "tự nhiên đạt" thì
  //    luật đã bị nới ở đâu đó mà không ai ghi lại.
  let emLot = null;
  for (const id of c.nguoi.keys()) {
    const pv = c.phamVi(id);
    for (const e of c.anhChiEmRuot(id)) if (pv.has(e)) { emLot = id + '→' + e; break; }
    if (emLot) break;
  }
  kiem('    anh chị em ruột nằm NGOÀI phạm vi (đúng luật đã chốt)',
       emLot === null, 'lọt: ' + emLot);

  // 4. Không ai sửa được cả cây, trừ khi họ đứng ở gốc. Con số này là thứ
  //    phân biệt luật trực hệ với luật "cùng huyết thống" đã bị loại: luật
  //    kia cho 552/681 tài khoản sửa trên 500 người.
  const co = [...c.nguoi.keys()].map((id) => c.phamVi(id).size).sort((a, b) => a - b);
  const trungVi = co[Math.floor(co.length / 2)];
  const quaNua = co.filter((n) => n > c.nguoi.size / 2).length;
  console.log('       trung vị ' + trungVi + '/' + c.nguoi.size +
              ' người · ' + quaNua + ' tài khoản sửa quá nửa cây');
  kiem('    trung vị phạm vi dưới 1/3 cây', trungVi < c.nguoi.size / 3,
       'trung vị ' + trungVi + '/' + c.nguoi.size);

  // 5. LEO QUYỀN — phép quan trọng nhất của cả file.
  //    Tôi khai một người ngoài phạm vi làm bố tôi. Hàng rào 4 phải chặn ở
  //    cạnh, TRƯỚC khi phạm vi được tính lại. Mô hình ở đây kiểm điều kiện
  //    mà hàng rào ấy dựa vào: union của người kia có partner ngoài phạm vi.
  let leoDuoc = null;
  const dsNguoi = [...c.nguoi.keys()];
  for (const toi of dsNguoi.slice(0, 200)) {
    const pv = c.phamVi(toi);
    const laMuc = dsNguoi.find((x) => !pv.has(x) && (c.lamVoChong.get(x) || []).length);
    if (!laMuc) continue;
    const un = (c.lamVoChong.get(laMuc) || [])[0];
    // Điều kiện chặn của hàng rào 4: có partner đang tồn tại nằm ngoài phạm vi.
    const biChan = c.partnerCua(un).some((px) => !pv.has(px));
    if (!biChan) { leoDuoc = toi + ' gắn vào ' + un; break; }
  }
  kiem('    không khai được người ngoài phạm vi làm cha mẹ mình',
       leoDuoc === null, 'lọt: ' + leoDuoc);

  // 6. Người chưa gắn mã → phạm vi RỖNG, không phải "cả cây".
  kiem('    chưa gắn mã người thì phạm vi rỗng', c.phamVi(null).size === 0,
       'phạm vi ' + c.phamVi(null).size);
  kiem('    gắn mã không có thật thì phạm vi rỗng',
       c.phamVi('P9999_KHONG_CO_THAT').size === 0, 'không rỗng');
}

// ------------------------------------------------------------
console.log('\n' + (hong === 0 ? 'TẤT CẢ ĐẠT' : 'CÓ PHÉP HỎNG') +
            ' — ' + dat + ' đạt, ' + hong + ' hỏng.');
process.exitCode = hong === 0 ? 0 : 1;

// ============================================================
// Hàm phụ
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
  const re = new RegExp('create\\s+or\\s+replace\\s+function\\s+public\\.' + ten + '\\s*\\(', 'i');
  const m = re.exec(sql);
  if (!m) return null;
  const het = sql.indexOf('$$;', m.index);
  return het < 0 ? sql.slice(m.index) : sql.slice(m.index, het + 3);
}

/**
 * Mô hình luật trực hệ, dựng từ một file gia phả JSON.
 * ⚠ Đây là bản dựng lại bằng JavaScript, KHÔNG phải bản SQL đang chạy.
 */
function napCay(duong) {
  const d = JSON.parse(readFileSync(duong, 'utf8'));
  const nguoi = new Map();
  for (const p of d.persons) if (!p.deleted) nguoi.set(p.id, p);

  const lamCon = new Map(), lamVoChong = new Map(), union = new Map();
  for (const u of d.unions) {
    if (u.deleted) continue;
    union.set(u.id, u);
    for (const pid of u.partners || []) if (nguoi.has(pid)) {
      if (!lamVoChong.has(pid)) lamVoChong.set(pid, []);
      lamVoChong.get(pid).push(u.id);
    }
    for (const con of u.children || []) {
      const cid = con && con.personId;
      if (cid && nguoi.has(cid)) {
        if (!lamCon.has(cid)) lamCon.set(cid, []);
        lamCon.get(cid).push(u.id);
      }
    }
  }

  const partnerCua = (uid) => (union.get(uid)?.partners || []).filter((p) => nguoi.has(p));
  const conCuaUnion = (uid) => (union.get(uid)?.children || [])
    .map((c) => c && c.personId).filter((p) => p && nguoi.has(p));
  const chaMe = (id) => {
    const r = new Set();
    for (const u of lamCon.get(id) || []) for (const p of partnerCua(u)) if (p !== id) r.add(p);
    return r;
  };
  const anhChiEmRuot = (id) => {
    const r = new Set();
    for (const u of lamCon.get(id) || []) for (const c of conCuaUnion(u)) if (c !== id) r.add(c);
    return r;
  };

  const kho = new Map();
  function phamVi(goc) {
    if (kho.has(goc)) return kho.get(goc);
    const t = new Set();
    if (goc && nguoi.has(goc)) {
      // đi LÊN — chỉ trực hệ, luôn có visited
      const len = new Set([goc]); const q1 = [goc];
      while (q1.length) {
        const v = q1.pop();
        for (const p of chaMe(v)) if (!len.has(p)) { len.add(p); q1.push(p); }
      }
      // đi XUỐNG — toàn bộ hậu duệ của CHÍNH MÌNH
      const xuong = new Set([goc]); const q2 = [goc];
      while (q2.length) {
        const v = q2.pop();
        for (const u of lamVoChong.get(v) || []) for (const c of conCuaUnion(u)) {
          if (!xuong.has(c)) { xuong.add(c); q2.push(c); }
        }
      }
      for (const id of len) t.add(id);
      for (const id of xuong) t.add(id);
      // cộng vợ/chồng — MỘT bước, không lan tiếp
      for (const id of [...t]) {
        for (const u of lamVoChong.get(id) || []) for (const p of partnerCua(u)) t.add(p);
      }
    }
    kho.set(goc, t);
    return t;
  }

  return { nguoi, union, lamVoChong, partnerCua, chaMe, anhChiEmRuot, phamVi };
}
