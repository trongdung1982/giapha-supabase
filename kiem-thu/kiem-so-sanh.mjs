// ============================================================
// giapha-supabase · kiem-thu/kiem-so-sanh.mjs
// Vai trò  : Kiểm `domains/so-sanh.js` — hàm THUẦN xếp phẳng kết quả
//            `chiTietKiemDuyet()` thành bảng Người · Trường · Trước · Sau.
//            Không cần Supabase, không cần mạng.
// Chạy     : cd supabase/kiem-thu && node kiem-so-sanh.mjs
// Phiên bản: 0.1.0 · Cập nhật: 10/09/2026 (b111)
// ============================================================
//
// ═══ BA CÂU HỎI ═══
//
// 1. **Trường không đổi có bị lọt vào bảng không?** Đây là câu quan trọng
//    nhất — chép nguyên `truoc` sang `sau` mà bảng vẫn ra một dòng thì người
//    duyệt đọc một trang toàn "khác nhau" trong khi chẳng có gì đổi thật.
// 2. **`null` do bản ghi CHƯA TỪNG CÓ / ĐÃ BỊ XOÁ có xử lý đúng không?** Đây
//    là hai ca đặc biệt `19-kiem-duyet-chi-tiet.sql` cố tình để `truoc`/`sau`
//    là `null` — không phải lỗi dữ liệu.
// 3. **Tên hiển thị của bản ghi (cột "Người") có đúng không?** Người thì lấy
//    họ tên, hôn nhân thì kèm mã hai vợ chồng, con thì kèm cả union lẫn person.

import { bangPhang } from '../js/domains/so-sanh.js';

let dat = 0;
let hong = 0;

function kiem(ten, dung, chiTiet) {
  if (dung) { dat++; console.log('  ĐẠT  ' + ten); }
  else { hong++; console.log('  HỎNG ' + ten + (chiTiet ? '\n        ' + chiTiet : '')); }
}

// ============================================================
// 1. TRƯỜNG KHÔNG ĐỔI — bảng phải RỖNG
// ============================================================
console.log('\n=== 1. Trường không đổi → không vẽ dòng ===\n');
{
  const dong = {
    id: 'P0020', uid: 'u1', names: [{ type: 'chinh', given: 'Lan', surname: 'Nguyễn' }],
    sex: 'F', birth: { iso: '1982', raw: '1982', place: '' },
    death: { iso: null, raw: '', place: '' }, burial_place: '', title: '',
    occupation: 'Giáo viên', education: '', religion: '', residence: '',
    nationality: '', living: true, photo_file_id: '', note: '', deleted: false,
    vn: {}, meta: { updatedBy: 'ai_do' }, branch_id: null,
  };
  const banGhi = { nguoi: [{ id: 'P0020', truoc: dong, sau: { ...dong } }] };
  const ra = bangPhang(banGhi);
  kiem('1.1 · hai dòng y hệt nhau → bảng rỗng', ra.length === 0,
    'ra ' + ra.length + ' dòng: ' + JSON.stringify(ra));
}

// ============================================================
// 2. MỘT TRƯỜNG ĐỔI — đúng MỘT DÒNG
// ============================================================
console.log('\n=== 2. Sửa một trường → đúng một dòng ===\n');
{
  const cu = {
    id: 'P0020', uid: '', names: [{ type: 'chinh', given: 'Lan', surname: 'Nguyễn' }],
    sex: 'F', birth: { iso: null, raw: '', place: '' }, death: { iso: null, raw: '', place: '' },
    burial_place: '', title: '', occupation: 'Giáo viên', education: '',
    religion: '', residence: '', nationality: '', living: true,
    photo_file_id: '', note: '', deleted: false, vn: {}, meta: {}, branch_id: null,
  };
  const moi = { ...cu, occupation: 'Nghỉ hưu' };
  const ra = bangPhang({ nguoi: [{ id: 'P0020', truoc: cu, sau: moi }] });

  kiem('2.1 · đúng một dòng', ra.length === 1, JSON.stringify(ra));
  if (ra.length === 1) {
    kiem('2.2 · loại đúng "nguoi"', ra[0].loai === 'nguoi');
    kiem('2.3 · trường đúng "Nghề nghiệp"', ra[0].truong === 'Nghề nghiệp', ra[0].truong);
    kiem('2.4 · trước đúng "Giáo viên"', ra[0].truoc === 'Giáo viên', ra[0].truoc);
    kiem('2.5 · sau đúng "Nghỉ hưu"', ra[0].sau === 'Nghỉ hưu', ra[0].sau);
    // `fullName()` (utils/text.js) ghép [surname, middle, given] — thứ tự
    // tiếng Việt, không phải thứ tự khoá trong object.
    kiem('2.6 · cột Người có tên đầy đủ kèm mã', ra[0].nguoi === 'Nguyễn Lan (P0020)', ra[0].nguoi);
  }
}

// ============================================================
// 3. NGƯỜI MỚI — `truoc` là null
// ============================================================
console.log('\n=== 3. Người mới (truoc = null) ===\n');
{
  const moi = {
    id: 'P9001', uid: '', names: [{ type: 'chinh', given: 'Người mới' }],
    sex: 'U', birth: { iso: null, raw: '', place: '' }, death: { iso: null, raw: '', place: '' },
    burial_place: '', title: '', occupation: '', education: '', religion: '',
    residence: '', nationality: '', living: true, photo_file_id: '', note: '',
    deleted: false, vn: {}, meta: {}, branch_id: null,
  };
  const ra = bangPhang({ nguoi: [{ id: 'P9001', truoc: null, sau: moi }] });

  // Chỉ những trường có GIÁ TRỊ THẬT ở "sau" mới ra dòng — `names`/`sex`/
  // `living` là những trường không rỗng ở người mới này.
  kiem('3.1 · có dòng cho "Họ tên"', ra.some((d) => d.truong === 'Họ tên'));
  const dHoTen = ra.find((d) => d.truong === 'Họ tên');
  kiem('3.2 · trước của "Họ tên" là rỗng (bản ghi chưa từng tồn tại)',
    dHoTen && dHoTen.truoc === '', dHoTen && JSON.stringify(dHoTen.truoc));
  kiem('3.3 · sau của "Họ tên" đúng tên mới', dHoTen && dHoTen.sau === 'Người mới',
    dHoTen && dHoTen.sau);

  const dConSong = ra.find((d) => d.truong === 'Còn sống');
  kiem('3.4 · "Còn sống" đổi từ rỗng → Có', dConSong && dConSong.truoc === '' && dConSong.sau === 'Có',
    dConSong && JSON.stringify(dConSong));

  // `occupation` rỗng ở người mới (chuỗi `''`) so với "chưa từng tồn tại"
  // (`undefined`) — cả hai đều TRỐNG theo luật mục 7, nên KHÔNG được ra dòng.
  // Ra dòng ở đây là đúng cái luật ấy cấm: một hàng "rỗng → rỗng" chẳng nói
  // lên điều gì mà còn làm loãng những dòng thật sự đáng đọc.
  kiem('3.5 · "Nghề nghiệp" (rỗng cả hai đầu) KHÔNG ra dòng',
    !ra.some((d) => d.truong === 'Nghề nghiệp'));
}

// ============================================================
// 4. HÔN NHÂN BỊ XOÁ — `sau` là null
// ============================================================
console.log('\n=== 4. Hôn nhân bị xoá (sau = null) ===\n');
{
  const cu = {
    id: 'U0099', uid: '', partners: ['P0001', 'P0002'], partner_order: ['P0001', 'P0002'],
    ranks: {}, status: 'married', marriage: { iso: '2000-01-01', raw: '01/01/2000', place: '' },
    note: '', deleted: false,
  };
  const ra = bangPhang({ honnhan: [{ id: 'U0099', truoc: cu, sau: null }] });

  kiem('4.1 · cột Người dùng dữ liệu TRƯỚC khi sau là null',
    ra.length > 0 && ra[0].nguoi === 'Hôn nhân U0099 (P0001 + P0002)', ra[0] && ra[0].nguoi);

  const dTrangThai = ra.find((d) => d.truong === 'Tình trạng hôn nhân');
  kiem('4.2 · trạng thái đổi "married" → rỗng',
    dTrangThai && dTrangThai.truoc === 'married' && dTrangThai.sau === '',
    dTrangThai && JSON.stringify(dTrangThai));

  const dNgayCuoi = ra.find((d) => d.truong === 'Ngày cưới');
  kiem('4.3 · ngày cưới đổi "01/01/2000" → rỗng',
    dNgayCuoi && dNgayCuoi.truoc === '01/01/2000' && dNgayCuoi.sau === '',
    dNgayCuoi && JSON.stringify(dNgayCuoi));
}

// ============================================================
// 5. CON — cột Người kèm cả hai mã
// ============================================================
console.log('\n=== 5. Quan hệ cha mẹ – con ===\n');
{
  const ra = bangPhang({
    con: [{ unionId: 'U0007', personId: 'P0033',
            truoc: { relation: 'birth', ord: 1 }, sau: { relation: 'adopted', ord: 1 } }],
  });
  kiem('5.1 · đúng một dòng (chỉ "Quan hệ" đổi, "Thứ tự con" không đổi)',
    ra.length === 1, JSON.stringify(ra));
  kiem('5.2 · cột Người nói rõ cả union lẫn person',
    ra[0] && ra[0].nguoi === 'Con P0033 trong hôn nhân U0007', ra[0] && ra[0].nguoi);
  kiem('5.3 · loại đúng nhãn tiếng Việt',
    ra[0] && ra[0].nhanLoai === 'Quan hệ cha mẹ – con', ra[0] && ra[0].nhanLoai);
}

// ============================================================
// 6. KHỐI CÂY — không có mảng, chỉ một object
// ============================================================
console.log('\n=== 6. Thông tin chung của cây ===\n');
{
  const ra = bangPhang({
    cay: { truoc: { name: 'Tên cũ', root_person_id: 'P0001', note: '' },
           sau:   { name: 'Tên mới', root_person_id: 'P0001', note: '' } },
  });
  kiem('6.1 · đúng một dòng (chỉ tên đổi)', ra.length === 1, JSON.stringify(ra));
  kiem('6.2 · cột Người là nhãn cố định của khối cây',
    ra[0] && ra[0].nguoi === 'Thông tin chung của gia phả', ra[0] && ra[0].nguoi);
}

// ============================================================
// 7. BANGHI RỖNG/THIẾU — không được ném lỗi
// ============================================================
console.log('\n=== 7. Đầu vào rỗng — không ném lỗi ===\n');
{
  kiem('7.1 · banGhi null → mảng rỗng', Array.isArray(bangPhang(null)) && bangPhang(null).length === 0);
  kiem('7.2 · banGhi {} → mảng rỗng', bangPhang({}).length === 0);
  kiem('7.3 · con/nguoi/honnhan là mảng rỗng vẫn chạy', bangPhang({ nguoi: [], honnhan: [] }).length === 0);
}

// ============================================================
console.log('\n' + '='.repeat(60));
console.log(hong === 0 ? '  — ĐẠT ' + dat + ' · HỎNG 0 —' : '  — ĐẠT ' + dat + ' · HỎNG ' + hong + ' —');
console.log('='.repeat(60) + '\n');
process.exit(hong === 0 ? 0 : 1);
