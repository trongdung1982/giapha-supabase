// ============================================================
// giapha-supabase · kiem-thu/kiem-sao-luu.mjs
// Vai trò  : Kiểm `sao-luu/SaoLuu.gs` — mã trigger sao lưu chạy trên Apps
//            Script — bằng cách chạy CHÍNH file ấy trong Node, với một
//            Supabase giả và một Google Drive giả.
// Chạy     : cd supabase/kiem-thu && node kiem-sao-luu.mjs
// Phiên bản: 0.2.0 · Cập nhật: 04/09/2026 00:04
// ============================================================
//
// ═══ VÌ SAO BÀI KIỂM NÀY TỒN TẠI ═══
//
// Bản sao lưu là thứ **không ai nhìn cho tới ngày cần tới**. Một trigger chạy
// nền mỗi ngày, ghi ra một file mà không ai mở, và mọi kiểu hỏng của nó đều
// im lặng: đọc thiếu một bảng, phân trang bỏ sót từ dòng 1001, khoá bị lọt
// vào file, dọn nhầm bản cuối cùng còn lại. Cả bốn kiểu ấy đều cho ra một
// file trông rất bình thường.
//
// ⚠ Bài kiểm ĐỌC THẲNG `sao-luu/SaoLuu.gs` rồi chạy nó, chứ không chép lại
//   logic sang JavaScript. Chép lại là kiểm một bản sao — bản sao ấy đúng
//   không nói gì về bản thật. Apps Script chạy V8 nên cùng một mã chạy được
//   trong Node; thứ duy nhất phải giả là bảy đối tượng của Google.
//
// Bài kiểm KHÔNG cần mạng, KHÔNG cần Supabase, KHÔNG cần tài khoản Google.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const DAY = dirname(fileURLToPath(import.meta.url));
const FILE_GS = resolve(DAY, '../sao-luu/SaoLuu.gs');
const FILE_SQL = resolve(DAY, '../luoc-do/01-bang.sql');

const NGUON_GS = readFileSync(FILE_GS, 'utf8');

// Bốn giá trị giả, đúng khuôn thật. Từ bản 0.2.0 sao lưu không dùng khoá bí
// mật nữa mà đăng nhập bằng email + mật khẩu rồi đọc bằng phiếu — nên thứ
// **không được lọt** vào file sao lưu nay là mật khẩu và phiếu, chứ không còn
// là khoá. Phép 5 đi tìm đúng ba chuỗi này trong bản sao lưu sinh ra.
const KHOA_CONG_KHAI_THU = 'sb_publishable_KHOA_GIA_KHONG_CO_THAT_0123';
const EMAIL_THU  = 'sao-luu@thunghiem.test';
const MAT_KHAU_THU = 'mat-khau-gia-khong-co-that-0123456789';
const PHIEU_THU = 'eyJhbGciOiJIUzI1NiJ9.PHIEU_GIA_KHONG_CO_THAT.chu-ky-gia';

// Khoá bí mật giả — chỉ dùng cho phép 10, nơi phải chứng minh rằng dán nhầm
// nó vào ô khoá công khai thì bị chặn ngay, không gọi mạng lần nào.
const KHOA_BI_MAT_THU = 'sb_secret_KHOA_GIA_KHONG_CO_THAT_0123456789';
const URL_THU = 'https://thunghiem.supabase.co';
const LUC_THU = new Date('2026-09-03T10:30:00Z');   // 17:30 giờ Việt Nam

let dat = 0;
let hong = 0;

// ============================================================
// GIẢ LẬP BẢY ĐỐI TƯỢNG CỦA GOOGLE
// ============================================================

function dungMoiTruong(kichBan = {}) {
  const duLieu = kichBan.duLieu || {};
  const nguoiDung = kichBan.nguoiDung || [];
  const khoAnh = kichBan.khoAnh || {};
  const maLoi = kichBan.maLoi || 0;

  const nhatKy = { goi: [], thu: [], log: [] };

  // ---- Supabase giả -------------------------------------------------
  const UrlFetchApp = {
    fetch(url, opt) {
      nhatKy.goi.push(url);
      if (maLoi) return traLoi(maLoi, '{"message":"gia vo hong"}');

      const u = new URL(url);
      const duong = u.pathname;

      // ---- Cửa đăng nhập: đổi email + mật khẩu lấy phiếu ----
      // Phải đứng TRƯỚC phép kiểm phiếu bên dưới — lúc gọi cửa này thì đương
      // nhiên chưa có phiếu nào để mà kiểm.
      if (duong === '/auth/v1/token') {
        if (opt.headers.apikey !== KHOA_CONG_KHAI_THU) {
          return traLoi(401, '{"message":"khoa cong khai sai"}');
        }
        const gui = JSON.parse(opt.payload);
        if (gui.email !== EMAIL_THU || gui.password !== MAT_KHAU_THU) {
          return traLoi(400, '{"error":"invalid_grant"}');
        }
        return traLoi(200, JSON.stringify({ access_token: PHIEU_THU }));
      }

      // Khoá công khai nói "khách của project nào", phiếu nói "đã đăng nhập
      // là ai". Supabase đòi cả hai, và RLS chỉ đọc được `auth.uid()` từ phiếu.
      if (opt.headers.apikey !== KHOA_CONG_KHAI_THU ||
          opt.headers.Authorization !== 'Bearer ' + PHIEU_THU) {
        return traLoi(401, '{"message":"thieu khoa hoac phieu"}');
      }

      // ---- Danh sách tài khoản: nay là một hàm SQL, không còn Admin API ----
      // Phải đứng TRƯỚC nhánh `/rest/v1/` chung, kẻo bị bắt nhầm thành một
      // bảng tên `rpc/ds_tai_khoan`.
      if (duong === '/rest/v1/rpc/ds_tai_khoan') {
        return traLoi(200, JSON.stringify(nguoiDung));
      }

      if (duong.startsWith('/rest/v1/')) {
        const bang = duong.slice('/rest/v1/'.length);
        const hang = duLieu[bang] || [];
        if (opt.headers.Prefer === 'count=exact') {
          return traLoi(200, JSON.stringify(hang.slice(0, 1)),
                        { 'content-range': '0-0/' + hang.length });
        }
        const gioiHan = Number(u.searchParams.get('limit'));
        const bo = Number(u.searchParams.get('offset')) || 0;
        return traLoi(200, JSON.stringify(hang.slice(bo, bo + gioiHan)));
      }

      if (duong.startsWith('/storage/v1/object/list/')) {
        const than = JSON.parse(opt.payload);
        const muc = khoAnh[than.prefix] || [];
        return traLoi(200, JSON.stringify(
          muc.slice(than.offset, than.offset + than.limit)));
      }

      return traLoi(404, '{"message":"khong co duong nay"}');
    }
  };

  function traLoi(ma, chu, dau = {}) {
    return {
      getResponseCode: () => ma,
      getContentText: () => chu,
      getHeaders: () => dau
    };
  }

  // ---- Google Drive giả ---------------------------------------------
  function taoFile(ten, noiDung) {
    return {
      _ten: ten, _noiDung: noiDung, _thungRac: false,
      getName() { return this._ten; },
      getSize() { return this._noiDung.length; },
      setTrashed(v) { this._thungRac = v; }
    };
  }
  function taoThuMuc(ten) {
    const tep = [];
    return {
      _ten: ten, _tep: tep,
      createFile(t, n) { const f = taoFile(t, n); tep.push(f); return f; },
      getFiles() {
        const con = tep.filter((f) => !f._thungRac);
        let i = 0;
        return { hasNext: () => i < con.length, next: () => con[i++] };
      }
    };
  }
  const thuMucCo = kichBan.thuMuc || taoThuMuc('Sao luu gia pha (Supabase)');
  const DriveApp = {
    getFoldersByName() {
      let xong = false;
      return { hasNext: () => !xong, next: () => { xong = true; return thuMucCo; } };
    },
    createFolder(t) { return taoThuMuc(t); },
    getFolderById() { return thuMucCo; }
  };

  // ---- Script Properties giả -----------------------------------------
  const kho = Object.assign({
    SUPABASE_URL: URL_THU,
    KHOA_CONG_KHAI: KHOA_CONG_KHAI_THU,
    EMAIL_SAO_LUU: EMAIL_THU,
    MAT_KHAU_SAO_LUU: MAT_KHAU_THU
  }, kichBan.thuocTinh || {});
  const PropertiesService = {
    getScriptProperties: () => ({
      getProperty: (k) => (k in kho ? kho[k] : null),
      setProperty: (k, v) => { kho[k] = v; }
    })
  };

  // ---- Còn lại --------------------------------------------------------
  const MailApp = {
    sendEmail(den, tieuDe, than) { nhatKy.thu.push({ den, tieuDe, than }); }
  };
  const Session = { getEffectiveUser: () => ({ getEmail: () => 'thu@thu.thu' }) };
  const Logger = { log: (x) => nhatKy.log.push(String(x)) };

  const lich = [];
  const ScriptApp = {
    newTrigger(ham) {
      return { timeBased: () => ({
        everyDays: () => ({ atHour: () => ({ create() { lich.push(ham); } }) })
      }) };
    },
    getProjectTriggers: () => lich.map((h, i) => ({
      getHandlerFunction: () => h, _i: i
    })),
    deleteTrigger: (t) => { lich.splice(lich.indexOf(t.getHandlerFunction()), 1); }
  };

  const Utilities = {
    formatDate(d, _tz, khuon) {
      // Giờ Việt Nam = UTC+7. Đủ dùng cho bài kiểm; Apps Script làm thật.
      const v = new Date(d.getTime() + 7 * 3600 * 1000);
      const hai = (n) => String(n).padStart(2, '0');
      const Y = v.getUTCFullYear(), M = hai(v.getUTCMonth() + 1);
      const D = hai(v.getUTCDate()), h = hai(v.getUTCHours());
      const p = hai(v.getUTCMinutes());
      if (khuon === 'yyyy-MM-dd-HHmm') return `${Y}-${M}-${D}-${h}${p}`;
      return `${D}/${M}/${Y} ${h}:${p}`;
    }
  };

  // Đồng hồ đứng yên, để tên file sinh ra là con số đoán trước được.
  const NgayThat = Date;
  function NgayGia(...a) { return a.length ? new NgayThat(...a) : new NgayThat(LUC_THU); }
  NgayGia.now = () => LUC_THU.getTime();

  const ten = ['UrlFetchApp', 'DriveApp', 'PropertiesService', 'MailApp',
               'Session', 'Logger', 'ScriptApp', 'Utilities', 'Date'];
  const gia = [UrlFetchApp, DriveApp, PropertiesService, MailApp,
               Session, Logger, ScriptApp, Utilities, NgayGia];

  const nap = new Function(...ten, NGUON_GS + `
    return { kiemTraKetNoi, saoLuuNgay, datLichSaoLuu, goLichSaoLuu,
             gomSaoLuu_, docBang_, docKhoAnh_, donBanCu_, docCauHinh_,
             THU_TU_DOC, KHUON_TEN_FILE };
  `);

  return { api: nap(...gia), nhatKy, thuMuc: thuMucCo, kho, lich, taoThuMuc, taoFile };
}

// ============================================================
// DỮ LIỆU GIẢ
// ============================================================

function cayGia({ soNguoi = 5, soNhatKy = 3 } = {}) {
  const cay = '00000000-0000-4000-8000-000000000001';
  const d = {
    trees: [{ id: cay, tree_code: 'THU', name: 'Cây thử', revision: 7 }],
    tree_members: [{ tree_id: cay, user_id: 'u1', role: 'quan_tri_he_thong' }],
    branches: [],
    branch_access: [],
    persons: [],
    unions: [],
    union_children: [],
    media: [],
    sources: [],
    change_log: [],
    imports: [],
    user_settings: [{ user_id: 'u1', tree_id: cay, focus_person_id: 'P0001' }]
  };
  for (let i = 1; i <= soNguoi; i++) {
    d.persons.push({ tree_id: cay, id: 'P' + String(i).padStart(4, '0'),
                     names: [{ type: 'chinh', full: 'Người ' + i }] });
  }
  for (let i = 1; i <= soNhatKy; i++) {
    d.change_log.push({ id: i, tree_id: cay, action: 'sua', target: 'P0001' });
  }
  return d;
}

// ============================================================
// CÁC PHÉP KIỂM
// ============================================================

console.log('KIỂM SAO LƯU — chạy thẳng sao-luu/SaoLuu.gs trong Node\n');

// ---- 1. Danh sách bảng khớp lược đồ ---------------------------------
{
  const sql = readFileSync(FILE_SQL, 'utf8');
  const trongSql = [...sql.matchAll(/create table if not exists public\.(\w+)/g)]
    .map((m) => m[1]).sort();
  const { api } = dungMoiTruong();
  const trongGs = Object.keys(api.THU_TU_DOC).sort();
  const thieu = trongSql.filter((t) => !trongGs.includes(t));
  const thua = trongGs.filter((t) => !trongSql.includes(t));
  kiem('mọi bảng của 01-bang.sql đều được sao lưu, không thừa bảng nào',
       thieu.length === 0 && thua.length === 0 && trongSql.length === 12,
       `sql=${trongSql.length} gs=${trongGs.length}` +
       (thieu.length ? ' · THIẾU: ' + thieu.join(',') : '') +
       (thua.length ? ' · THỪA: ' + thua.join(',') : ''));
}

// ---- 2. Phân trang: bảng vượt một nghìn dòng -------------------------
{
  const duLieu = cayGia({ soNguoi: 5, soNhatKy: 2500 });
  const { api, nhatKy } = dungMoiTruong({ duLieu });
  const doc = api.docBang_(api.docCauHinh_(), 'change_log');
  const ma = new Set(doc.map((r) => r.id));
  const soGoi = nhatKy.goi.filter((u) => u.includes('/change_log')).length;
  kiem('đọc đủ 2500 dòng qua 3 trang, không sót không trùng',
       doc.length === 2500 && ma.size === 2500 && doc[0].id === 1 &&
       doc[2499].id === 2500 && soGoi === 3,
       `đọc ${doc.length} dòng · ${ma.size} mã khác nhau · ${soGoi} lượt gọi`);
}

// ---- 3. Bản sao lưu có đủ mọi phần -----------------------------------
{
  const duLieu = cayGia({ soNguoi: 681, soNhatKy: 40 });
  const { api } = dungMoiTruong({
    duLieu,
    nguoiDung: [{ id: 'u1', email: 'a@b.c', created_at: 'x' }],
    khoAnh: { '': [{ name: 'cay1', id: null }],
              'cay1/': [{ name: 'M0001-nho.jpg', id: 'o1',
                          metadata: { size: 4000 }, updated_at: 'y' }] }
  });
  const ban = api.gomSaoLuu_(api.docCauHinh_());
  const thieuBang = Object.keys(api.THU_TU_DOC).filter((t) => !(t in ban.bang));
  kiem('file sao lưu chứa đủ 12 bảng + tài khoản + kho ảnh',
       thieuBang.length === 0 && Array.isArray(ban.nguoiDung) &&
       ban.khoAnh && Array.isArray(ban.khoAnh.tep),
       thieuBang.length ? 'thiếu ' + thieuBang.join(',') : 'đủ');

  kiem('số đếm khớp đúng số dòng có thật',
       ban.dem.persons === 681 && ban.dem.change_log === 40 &&
       ban.dem.trees === 1 && ban.dem.nguoiDung === 1 && ban.dem.anh === 1,
       `persons=${ban.dem.persons} change_log=${ban.dem.change_log} ` +
       `nguoiDung=${ban.dem.nguoiDung} anh=${ban.dem.anh}`);

  kiem('kho ảnh đi xuống hai bậc, đếm tệp chứ không đếm thư mục',
       ban.khoAnh.tep.length === 1 &&
       ban.khoAnh.tep[0].ten === 'cay1/M0001-nho.jpg' &&
       ban.khoAnh.tongByte === 4000,
       JSON.stringify(ban.khoAnh.tep));

  // ⚠ Phép đáng giá nhất trong bài: thứ mở được cửa KHÔNG được có mặt trong
  //   thứ ghi ra Drive. Bản sao lưu bị chia sẻ nhầm mà mang theo mật khẩu hay
  //   phiếu thì người nhận đăng nhập được vào cơ sở dữ liệu SỐNG.
  //
  //   Từ bản 0.2.0 danh sách thứ phải canh dài ra: mật khẩu và phiếu đăng
  //   nhập, chứ không chỉ khoá. Vẫn canh cả `sb_secret_` để bắt trường hợp ai
  //   đó quay lại cách cũ mà quên bài kiểm này.
  const chu = JSON.stringify(ban);
  const loLot = [
    ['mật khẩu', MAT_KHAU_THU],
    ['phiếu đăng nhập', PHIEU_THU],
    ['khoá bí mật', 'sb_secret_']
  ].filter(([, v]) => chu.includes(v)).map(([t]) => t);
  kiem('mật khẩu · phiếu · khoá bí mật KHÔNG lọt vào nội dung bản sao lưu',
       loLot.length === 0,
       loLot.length ? 'CÓ LỌT: ' + loLot.join(', ') : 'sạch');
}

// ---- 4. Chạy trọn một lần sao lưu ------------------------------------
{
  const { api, thuMuc, nhatKy, kho } = dungMoiTruong({ duLieu: cayGia() });
  api.saoLuuNgay();
  const tep = [...duyet(thuMuc)];
  kiem('ghi đúng một file, tên mang dấu thời gian đoán trước được',
       tep.length === 1 && tep[0].getName() === 'giapha-sao-luu-2026-09-03-1730.json',
       tep.length ? tep[0].getName() : '(không có file nào)');

  const doc = JSON.parse(tep[0]._noiDung);
  kiem('file đọc lại được bằng JSON.parse và mang đúng nhãn khuôn',
       doc.khuon === 'giapha-sao-luu' && doc.nguon === URL_THU &&
       doc.taoLucVn === '03/09/2026 17:30',
       `${doc.khuon} · ${doc.taoLucVn}`);

  kiem('lần đầu chưa có số cũ để so → không gửi thư cảnh báo nào',
       nhatKy.thu.length === 0, `${nhatKy.thu.length} thư`);

  kiem('số đếm được nhớ lại để lần sau so',
       JSON.parse(kho.DEM_LAN_TRUOC).persons === 5, kho.DEM_LAN_TRUOC);
}

// ---- 5. Sụt giảm dữ liệu -> hét lên, nhưng VẪN ghi -------------------
{
  const truoc = { persons: 681, change_log: 40 };
  const { api, thuMuc, nhatKy } = dungMoiTruong({
    duLieu: cayGia({ soNguoi: 5, soNhatKy: 40 }),
    thuocTinh: { DEM_LAN_TRUOC: JSON.stringify(truoc) }
  });
  api.saoLuuNgay();
  const tep = [...duyet(thuMuc)];
  kiem('681 → 5 người: có gửi thư cảnh báo',
       nhatKy.thu.length === 1 && /ít dữ liệu hơn/.test(nhatKy.thu[0].tieuDe),
       nhatKy.thu.map((t) => t.tieuDe).join(' | ') || '(không thư)');
  kiem('sụt giảm vẫn GHI file — không từ chối sao lưu',
       tep.length === 1, `${tep.length} file`);
  kiem('bảng không sụt (change_log 40 → 40) không bị nhắc trong thư',
       nhatKy.thu.length === 1 && nhatKy.thu[0].than.includes('persons') &&
       !nhatKy.thu[0].than.includes('change_log'),
       (nhatKy.thu[0] || {}).than ? 'đúng phần nhắc' : '(không thư)');
}

// ---- 6. Không sụt thì im lặng ----------------------------------------
{
  const { api, nhatKy } = dungMoiTruong({
    duLieu: cayGia({ soNguoi: 681 }),
    thuocTinh: { DEM_LAN_TRUOC: JSON.stringify({ persons: 680, change_log: 3 }) }
  });
  api.saoLuuNgay();
  kiem('681 người sau 680 người: không thư, không ồn',
       nhatKy.thu.length === 0, `${nhatKy.thu.length} thư`);
}

// ---- 7. Nghi ngờ thì KHÔNG dọn bản cũ --------------------------------
{
  const moi = dungMoiTruong();
  const thuMuc = moi.taoThuMuc('cu');
  for (let i = 1; i <= 40; i++) {
    thuMuc.createFile('giapha-sao-luu-2026-0' + (i <= 20 ? '1' : '2') +
                      '-' + String((i % 28) + 1).padStart(2, '0') +
                      '-0200.json', '{}');
  }
  const { api } = dungMoiTruong({
    duLieu: cayGia({ soNguoi: 5 }), thuMuc,
    thuocTinh: { DEM_LAN_TRUOC: JSON.stringify({ persons: 681 }) }
  });
  const truoc = [...duyet(thuMuc)].length;
  api.saoLuuNgay();
  const sau = [...duyet(thuMuc)].length;
  kiem('sụt giảm đáng ngờ thì bỏ qua bước dọn, không xoá bản cũ nào',
       sau === truoc + 1, `${truoc} file → ${sau} file`);
}

// ---- 8. Dọn bản cũ: giữ N gần nhất + một bản mỗi tháng ----------------
{
  const moi = dungMoiTruong();
  const thuMuc = moi.taoThuMuc('cu');
  // 5 tháng, mỗi tháng 10 bản.
  for (const thang of ['05', '06', '07', '08', '09']) {
    for (let ngay = 1; ngay <= 10; ngay++) {
      thuMuc.createFile('giapha-sao-luu-2026-' + thang + '-' +
                        String(ngay).padStart(2, '0') + '-0200.json', '{}');
    }
  }
  thuMuc.createFile('so-tay-cua-toi.txt', 'khong phai ban sao luu');

  const daXoa = moi.api.donBanCu_(thuMuc, 12);
  const con = [...duyet(thuMuc)].map((f) => f.getName());
  const conSaoLuu = con.filter((t) => t.startsWith('giapha-sao-luu-'));
  const thangCon = new Set(conSaoLuu.map((t) => t.slice(15, 22)));

  // 12 bản gần nhất phủ tháng 09 (10 bản) và hai bản cuối tháng 08.
  // Ngoài ra giữ thêm một bản cho mỗi tháng 07, 06, 05 → 15 bản.
  kiem('giữ 12 bản gần nhất cộng một bản cho mỗi tháng cũ',
       conSaoLuu.length === 15 && daXoa === 35 && thangCon.size === 5,
       `còn ${conSaoLuu.length} bản · ${thangCon.size} tháng · xoá ${daXoa}`);
  kiem('file không phải bản sao lưu thì không đụng tới',
       con.includes('so-tay-cua-toi.txt'), con.join(' '));
  kiem('bản mới nhất luôn còn',
       conSaoLuu.includes('giapha-sao-luu-2026-09-10-0200.json'),
       conSaoLuu.slice(0, 3).join(' '));
}

// ---- 9. Máy chủ hỏng -> ném lỗi, gửi thư, KHÔNG ghi file dở ----------
{
  const { api, thuMuc, nhatKy } = dungMoiTruong({
    duLieu: cayGia(), maLoi: 500
  });
  let daNem = false;
  try { api.saoLuuNgay(); } catch (e) { daNem = true; }
  kiem('máy chủ trả 500: ném lỗi tiếp cho Google ghi sổ',
       daNem, daNem ? 'có ném' : 'NUỐT LỖI');
  kiem('máy chủ trả 500: gửi thư báo hỏng',
       nhatKy.thu.length === 1 && /SAO LƯU HỎNG/.test(nhatKy.thu[0].tieuDe),
       nhatKy.thu.map((t) => t.tieuDe).join(' | ') || '(không thư)');
  kiem('máy chủ trả 500: KHÔNG để lại file sao lưu dở dang',
       [...duyet(thuMuc)].length === 0, `${[...duyet(thuMuc)].length} file`);
}

// ---- 10. Khoá sai bị chặn trước khi chạm mạng ------------------------
{
  // ⚠ PHÉP NÀY ĐÃ ĐẢO CHIỀU Ở BẢN 0.2.0. Trước: dán khoá CÔNG KHAI vào ô khoá
  //   bí mật là lỗi. Nay ngược lại — sao lưu không dùng khoá bí mật nữa, nên
  //   dán khoá BÍ MẬT vào là lỗi. Để nó ở đây còn có việc thứ hai: ngày ai đó
  //   định "cho gọn" bằng cách quay lại khoá bí mật, phép này đỏ ngay.
  const a = dungMoiTruong({
    thuocTinh: { KHOA_CONG_KHAI: KHOA_BI_MAT_THU }
  });
  let loiA = '';
  try { a.api.saoLuuNgay(); } catch (e) { loiA = e.message; }
  kiem('dán nhầm khoá BÍ MẬT: chặn ngay, không gọi mạng lần nào',
       /khoá BÍ MẬT/i.test(loiA) && a.nhatKy.goi.length === 0,
       `${a.nhatKy.goi.length} lượt gọi · ${loiA.slice(0, 45)}`);

  const b = dungMoiTruong({ thuocTinh: { KHOA_CONG_KHAI: '' } });
  let loiB = '';
  try { b.api.saoLuuNgay(); } catch (e) { loiB = e.message; }
  kiem('chưa điền khoá: câu lỗi chỉ đúng chỗ phải mở',
       /Script\s*\n?\s*Properties/.test(loiB) || /Script Properties/.test(loiB),
       loiB.slice(0, 60));

  // Thiếu mật khẩu cũng phải chặn tại chỗ. Không có phép này thì thiếu mật
  // khẩu sẽ đi tới tận cửa đăng nhập rồi mới hỏng, với câu lỗi của Supabase
  // chứ không phải câu lỗi tiếng Việt chỉ đúng ô phải điền.
  const mk = dungMoiTruong({ thuocTinh: { MAT_KHAU_SAO_LUU: '' } });
  let loiMk = '';
  try { mk.api.saoLuuNgay(); } catch (e) { loiMk = e.message; }
  kiem('thiếu mật khẩu: chặn trước khi gọi mạng, câu lỗi nêu đủ bốn ô',
       /MAT_KHAU_SAO_LUU/.test(loiMk) && mk.nhatKy.goi.length === 0,
       `${mk.nhatKy.goi.length} lượt gọi · ${loiMk.slice(0, 45)}`);

  // Sai mật khẩu thì hỏng ở cửa đăng nhập — và câu lỗi phải nói đúng chỗ ấy,
  // không được đổ cho bảng hay cho RLS.
  const sai = dungMoiTruong({ thuocTinh: { MAT_KHAU_SAO_LUU: 'sai-mat-khau' } });
  let loiSai = '';
  try { sai.api.saoLuuNgay(); } catch (e) { loiSai = e.message; }
  kiem('sai mật khẩu: câu lỗi chỉ vào tài khoản sao lưu, không đổ cho bảng',
       /đăng nhập/i.test(loiSai) && /EMAIL_SAO_LUU|MAT_KHAU_SAO_LUU/.test(loiSai),
       loiSai.slice(0, 60));

  const c = dungMoiTruong({ thuocTinh: { SUPABASE_URL: 'https://x.supabase.co/' } });
  c.api.saoLuuNgay();
  kiem('địa chỉ thừa dấu / ở cuối vẫn chạy, không đẻ ra //rest',
       c.nhatKy.goi.every((u) => !u.includes('.co//')),
       c.nhatKy.goi[0] || '(không gọi)');
}

// ---- 11. kiemTraKetNoi chỉ nhìn, không ghi ---------------------------
{
  const { api, thuMuc, nhatKy } = dungMoiTruong({
    duLieu: cayGia({ soNguoi: 681, soNhatKy: 40 }),
    nguoiDung: [{ id: 'u1', email: 'a@b.c' }]
  });
  const ket = api.kiemTraKetNoi();
  kiem('kiemTraKetNoi đếm đúng mà KHÔNG ghi file, KHÔNG gửi thư',
       /persons: 681/.test(ket) && /change_log: 40/.test(ket) &&
       [...duyet(thuMuc)].length === 0 && nhatKy.thu.length === 0,
       `${[...duyet(thuMuc)].length} file · ${nhatKy.thu.length} thư`);
  kiem('đếm bằng header content-range, không tải cả bảng về',
       nhatKy.goi.filter((u) => u.includes('/persons')).length === 1 &&
       nhatKy.goi.some((u) => u.includes('/persons?select=*&limit=1')),
       nhatKy.goi.find((u) => u.includes('/persons')) || '(không gọi)');
}

// ---- 12. Đặt lịch hai lần vẫn chỉ một lịch ---------------------------
{
  const { api, lich } = dungMoiTruong();
  api.datLichSaoLuu();
  api.datLichSaoLuu();
  kiem('bấm đặt lịch hai lần không đẻ ra hai trigger chạy chồng nhau',
       lich.length === 1 && lich[0] === 'saoLuuNgay', `${lich.length} lịch`);
  api.goLichSaoLuu();
  kiem('gỡ lịch thì gỡ sạch', lich.length === 0, `${lich.length} lịch`);
}

// ---- 13. Mã nguồn không cất khoá thật --------------------------------
{
  // Canh cả khoá lẫn mật khẩu: từ bản 0.2.0 thứ nguy hiểm nhất có thể bị dán
  //   nhầm vào file này là MẬT KHẨU của tài khoản sao lưu, không phải khoá.
  const nghi = NGUON_GS.match(
    /sb_secret_[A-Za-z0-9_-]{8,}|sb_publishable_[A-Za-z0-9_-]{8,}|eyJ[A-Za-z0-9_-]{20,}/g);
  kiem('SaoLuu.gs không chứa khoá thật nào — repo này để Public',
       nghi === null, nghi ? nghi.join(' ') : 'sạch');

  // Bốn tên thuộc tính phải xuất hiện đủ trong mã, kèm dòng `Phụ thuộc` ở đầu
  // file. Thiếu một cái là hướng dẫn và mã đã lệch nhau.
  const thieuTen = ['SUPABASE_URL', 'KHOA_CONG_KHAI', 'EMAIL_SAO_LUU',
                    'MAT_KHAU_SAO_LUU'].filter((t) => !NGUON_GS.includes(t));
  kiem('mã nêu đủ bốn tên thuộc tính mà hướng dẫn bảo điền',
       thieuTen.length === 0, thieuTen.join(',') || 'đủ bốn');

  // ⚠ Không được còn LỆNH GỌI nào tới cửa Admin API: nó bắt buộc khoá bí mật,
  //   nên còn sót một lượt gọi tới đó là cả thiết kế 0.2.0 vô nghĩa.
  //
  //   Phải bỏ dòng ghi chú ra trước khi soi, theo đúng quy ước của
  //   `/kiem-tra`: *"chú thích nhắc tên thì KHÔNG tính — chỉ lệnh thật mới
  //   tính"*. `docNguoiDung_` cố ý nhắc lại cửa cũ để kể vì sao bỏ nó, và một
  //   phép kiểm cấm người ta viết ghi chú là một phép kiểm sai.
  //
  //   ⚠ Ngược lại, phép soi khoá bên trên KHÔNG được bỏ ghi chú: repo để
  //   Public, nên một cái khoá nằm trong ghi chú vẫn là khoá đã lên mạng.
  const dongLenh = NGUON_GS.split('\n')
    .filter((d) => !/^\s*(\/\/|\*|\/\*)/.test(d))
    .join('\n');
  kiem('không còn LỆNH gọi /auth/v1/admin/ — cửa ấy bắt buộc khoá bí mật',
       !dongLenh.includes('/auth/v1/admin'),
       dongLenh.includes('/auth/v1/admin') ? 'VẪN CÒN' : 'sạch');
}

// ------------------------------------------------------------
console.log('\n' + (hong === 0 ? 'TẤT CẢ ĐẠT' : 'CÓ PHÉP HỎNG') +
            ' — ' + dat + ' đạt, ' + hong + ' hỏng.');
process.exitCode = hong === 0 ? 0 : 1;

// ------------------------------------------------------------
function kiem(ten, dieuKien, chiTiet) {
  if (dieuKien) { dat++; console.log('  ĐẠT  ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + '  →  ' + chiTiet); }
}

function* duyet(thuMuc) {
  const it = thuMuc.getFiles();
  while (it.hasNext()) yield it.next();
}
