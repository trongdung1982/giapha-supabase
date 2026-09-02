// ============================================================
// giapha-supabase · js/services/hinh-dang.js
// Vai trò  : Đổi qua lại giữa DÒNG Postgres và hình CÂY mà domains/ chờ đợi.
//            Ráp dòng thành cây, và so hai cây ra danh sách phép ghi.
// Lớp      : services — được gọi bởi: services/repo · gọi: utils/date
// Phụ thuộc: utils/date.js
// Phiên bản: 0.1.0 · Cập nhật: 02/09/2026 22:45
// ============================================================
//
// ═══ FILE NÀY LÀ CHỖ DUY NHẤT HAI THẾ GIỚI GẶP NHAU ═══
//
//   Postgres  →  `photo_file_id`, `burial_place`, `ord`      (snake_case)
//   domains/  →  `photoFileId`,   `burialPlace`,  `order`    (camelCase)
//
// Không có chỗ thứ hai nào biết cả hai lối viết, và đó là chủ ý. Ngày nào
// thấy chữ `photo_file_id` xuất hiện trong `pages/` hay `domains/` là ngày
// ranh giới này đã vỡ.
//
// Hàm ở đây đều là **hàm thuần**: không gọi mạng, không chạm DOM, không đọc
// `state`. Nhờ thế chúng kiểm được bằng một bài kiểm chạy trong Node, không
// cần Supabase thật — và đó là điều kiện để dám tin vào chúng.

import { stampNow } from '../utils/date.js';

// ============================================================
// BẢNG TÊN — nguồn chân lý duy nhất cho việc đổi tên trường
// ============================================================
// Khoá là tên trong trình duyệt, giá trị là tên cột. Trường nào hai bên gọi
// giống nhau thì viết `null` cho gọn — đọc bảng này là đọc được toàn bộ chỗ
// khác biệt, không phải dò trong mã.

const TEN_PERSON = {
  id: null, uid: null, names: null, sex: null, birth: null, death: null,
  burialPlace: 'burial_place',
  title: null, occupation: null, education: null, religion: null,
  residence: null, nationality: null,
  living: null,
  photoFileId: 'photo_file_id',
  note: null, deleted: null, vn: null, meta: null,
  // ⚠ `branchId` KHÔNG có trong `CAU-TRUC-DU-LIEU_V06` — nó là cột riêng của
  //   nền Supabase, dùng để RLS giới hạn người biên tập theo chi. Nó vẫn phải
  //   đi theo bản ghi qua trình duyệt và quay về nguyên vẹn: bỏ nó ra khỏi
  //   hình cây thì mỗi lần lưu sẽ ghi `null` đè lên, tức là **âm thầm gỡ mọi
  //   người ra khỏi nhánh của họ**. Không có gì báo lỗi khi điều đó xảy ra.
  branchId: 'branch_id',
};

const TEN_UNION = {
  id: null, uid: null, partners: null,
  partnerOrder: 'partner_order',
  ranks: null, status: null, marriage: null, note: null, deleted: null,
  // `children` KHÔNG nằm đây — nó là bảng riêng, xem `rapCon`/`soSanhCon`.
};

const TEN_MEDIA = {
  id: null,
  subjectId: 'subject_id',
  driveFileId: 'drive_file_id',
  driveFileIdLon: 'drive_file_id_lon',
  caption: null, year: null, deleted: null, meta: null,
};

const TEN_SOURCE = { id: null, title: null, author: null, note: null };

/** Tên cột của một trường. */
const cot = (bang, khoa) => bang[khoa] || khoa;

/** Một dòng Postgres → một bản ghi hình camelCase. */
function veCay(bang, dong) {
  const ra = {};
  for (const khoa of Object.keys(bang)) ra[khoa] = dong[cot(bang, khoa)];
  return ra;
}

/** Một bản ghi camelCase → một dòng hình snake_case. */
function veBang(bang, banGhi) {
  const ra = {};
  for (const khoa of Object.keys(bang)) {
    const v = banGhi[khoa];
    ra[cot(bang, khoa)] = v === undefined ? null : v;
  }
  return ra;
}

// ============================================================
// DÒNG  →  CÂY
// ============================================================

/**
 * Ráp các mảng dòng thô của `sb.layDong()` thành đúng object mà
 * `repo.nangCapNeuCan()` và `utils/graph.buildIndex()` chờ đợi.
 *
 * ⚠ Kết quả phải giống hệt hình một file `giapha-json` đọc từ Drive. Đó không
 *   phải sở thích: `domains/` và `pages/` đọc hình ấy ở hàng trăm chỗ, và cả
 *   cuộc chuyển nhà này đứng được là nhờ chúng không phải biết mình đang đọc
 *   dữ liệu từ đâu ra.
 *
 * @param {object} dong  { tree, persons, unions, children, media, sources,
 *                         imports, maNhatKy }
 */
export function rapCay(dong) {
  const t = dong.tree;

  // Con gom theo hôn nhân trước, để khỏi quét lại cả mảng cho từng union —
  // 681 người mà quét lồng nhau là 661 × 700 phép so cho một việc đáng lẽ
  // chỉ tốn một vòng.
  const conTheoUnion = new Map();
  for (const c of dong.children || []) {
    if (!conTheoUnion.has(c.union_id)) conTheoUnion.set(c.union_id, []);
    conTheoUnion.get(c.union_id).push({
      personId: c.person_id,
      relation: c.relation,
      order:    c.ord,          // `order` là từ khoá SQL nên trong bảng tên `ord`
    });
  }
  for (const ds of conTheoUnion.values()) {
    ds.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  return {
    format:  'giapha-json',
    version: t.data_version,

    tree: {
      id:           t.id,
      treeCode:     t.tree_code,
      name:         t.name,
      rootPersonId: t.root_person_id || '',
      note:         t.note || '',
      createdAt:    dauThoiGian(t.created_at),
      updatedAt:    dauThoiGian(t.updated_at),
      updatedBy:    t.updated_by || '',
      revision:     t.revision,
    },

    persons: (dong.persons || []).map((r) => veCay(TEN_PERSON, r)),

    unions: (dong.unions || []).map((r) => ({
      ...veCay(TEN_UNION, r),
      children: conTheoUnion.get(r.id) || [],
    })),

    media:   (dong.media   || []).map((r) => veCay(TEN_MEDIA, r)),
    sources: (dong.sources || []).map((r) => veCay(TEN_SOURCE, r)),

    // ⚠⚠ `changeLog` Ở ĐÂY KHÔNG PHẢI LỊCH SỬ — đừng hiện nó lên màn hình.
    //
    // Nó chỉ chứa `{ target }`, không có ngày, không có người sửa, không có
    // giá trị cũ/mới. Nó tồn tại vì đúng một lý do: `utils/id.js` quét
    // `changeLog` để không cấp lại một mã đã từng dùng — và nó chỉ đọc tới
    // `target` cùng các KHOÁ của `diff`, không bao giờ đọc giá trị.
    //
    // Lịch sử thật nằm nguyên trong bảng `change_log` dưới cơ sở dữ liệu.
    // Ngày nào làm màn hình xem lịch sử thì đọc thẳng bảng ấy qua `sb.js`,
    // ĐỪNG mở rộng chỗ này — nó được nạp ở mọi lần mở app.
    changeLog: (dong.maNhatKy || []).map((ma) => ({ target: ma, diff: {} })),

    imports: (dong.imports || []).map((r) => ({
      at: dauThoiGian(r.at), by: r.by_email, file: r.file,
      source: r.source, sourceName: r.source_name, exporter: r.exporter,
      counts: r.counts || {}, map: r.map || [],
    })),
  };
}

/** ISO của Postgres → `dd/mm/yyyy HH:mm`, khuôn duy nhất của cả dự án. */
function dauThoiGian(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : stampNow(d);
}

// ============================================================
// CÂY  →  DÒNG   (chiều ngược của `rapCay`)
// ============================================================

/**
 * Rã một cây hình JSON ra thành các mảng dòng snake_case.
 *
 * Hai chỗ dùng, và cả hai đều đáng để hàm này tồn tại:
 *
 * 1. **Script di dời** — đọc `giapha-nguyen-trong-bac.json` rồi đổ vào
 *    Postgres. Không có hàm này thì script ấy phải chép lại bảng tên một lần
 *    nữa, và bản chép thứ hai bao giờ cũng là bản quên sửa.
 *
 * 2. **Bài kiểm khứ hồi** — `boCay()` rồi `rapCay()` phải ra lại đúng cây ban
 *    đầu. Đó là cách duy nhất chứng minh bảng tên không sót trường nào mà
 *    không cần dựng một Supabase thật. Sót một trường thì dữ liệu của trường
 *    ấy im lặng biến mất ở lần lưu đầu tiên — không có lỗi nào báo.
 *
 * @param {object} cay     hình JSON như `rapCay` trả về
 * @param {string} treeId  mã cây (uuid) để gắn vào mọi dòng
 */
export function boCay(cay, treeId) {
  const children = [];
  for (const u of cay.unions || []) {
    if (!u || !u.id) continue;
    for (const c of u.children || []) {
      if (!c || !c.personId) continue;
      children.push({
        tree_id: treeId, union_id: u.id, person_id: c.personId,
        relation: c.relation || 'birth',
        ord: Number.isFinite(c.order) ? c.order : 1,
      });
    }
  }

  const gan = (bang, ds) => (ds || []).map((b) => ({ tree_id: treeId, ...veBang(bang, b) }));

  return {
    tree: {
      id:             treeId,
      tree_code:      cay.tree.treeCode,
      name:           cay.tree.name,
      root_person_id: cay.tree.rootPersonId || null,
      note:           cay.tree.note || '',
      data_version:   cay.version,
      revision:       cay.tree.revision || 0,
      updated_by:     cay.tree.updatedBy || '',
    },
    persons:  gan(TEN_PERSON, cay.persons),
    unions:   gan(TEN_UNION,  cay.unions),
    children,
    media:    gan(TEN_MEDIA,  cay.media),
    sources:  gan(TEN_SOURCE, cay.sources),
    imports: (cay.imports || []).map((e) => ({
      tree_id: treeId, by_email: e.by || '', file: e.file || '',
      source: e.source || '', source_name: e.sourceName || '',
      exporter: e.exporter || '', counts: e.counts || {}, map: e.map || [],
    })),
    // Nhật ký chỉ mang theo phần `utils/id.js` cần — xem `04-view-ma-da-dung.sql`.
    changeLog: (cay.changeLog || []).map((m) => ({
      tree_id: treeId, action: m.action || 'migrate', target: m.target || '',
      note: m.note || '', diff: m.diff || {}, by_email: m.by || '',
    })),
  };
}

// ============================================================
// CÂY  →  KHÁC BIỆT
// ============================================================

/**
 * So cây trước và cây sau, trả về đúng những gì phải ghi.
 *
 * ⚠ **Vì sao không gửi cả cây lên rồi ghi đè hết.** 681 người là dữ liệu bé,
 *   gửi tất cho xong thì đơn giản hơn nhiều. Nhưng ghi đè cả cây nghĩa là
 *   chạm vào MỌI dòng ở mỗi lần lưu — và người biên tập chỉ được cấp quyền
 *   sửa chi Giáp sẽ bị máy chủ từ chối ngay, vì trong đống ấy có cả chi Ất.
 *   Tức là lối "gửi cả cây" giết chết đúng điều mà cả cuộc chuyển sang
 *   Supabase sinh ra để làm được. Khác biệt tồn tại vì PHÂN QUYỀN.
 *
 * ⚠ `xoa` là xoá THẬT. Xoá thường trong app là đặt cờ `deleted = true`, và
 *   bản ghi ấy đi vào `luu` như mọi sửa đổi khác. Chỉ *Dọn thùng rác*
 *   (`domains/purge.js`) mới làm bản ghi biến mất khỏi mảng, và chỉ nó mới
 *   sinh ra `xoa`.
 *
 * @param {object} cu   `state.tree` — cây máy chủ đang giữ
 * @param {object} moi  bản sao đã sửa
 * @returns {object} ops — hình dạng khớp tham số `p_ops` của hàm `luu_cay()`
 */
export function soSanh(cu, moi) {
  return {
    tree:     soSanhKhoiCay(cu.tree, moi.tree),
    persons:  soSanhMang(TEN_PERSON, cu.persons, moi.persons),
    unions:   soSanhMang(TEN_UNION,  cu.unions,  moi.unions),
    children: soSanhCon(cu.unions, moi.unions),
    media:    soSanhMang(TEN_MEDIA,  cu.media,   moi.media),
    sources:  soSanhMang(TEN_SOURCE, cu.sources, moi.sources),
    imports:  themMoi(cu.imports, moi.imports),
  };
}

/** Có gì để ghi không. Không có thì `repo` khỏi tốn một vòng mạng. */
export function coGiDeGhi(ops) {
  if (ops.tree) return true;
  if (ops.imports && ops.imports.length) return true;
  for (const ten of ['persons', 'unions', 'children', 'media', 'sources']) {
    const o = ops[ten];
    if (o && (o.luu.length || o.xoa.length)) return true;
  }
  return false;
}

function soSanhKhoiCay(cu, moi) {
  if (!cu || !moi) return null;
  const doi = cu.name !== moi.name
           || (cu.rootPersonId || '') !== (moi.rootPersonId || '')
           || (cu.note || '')         !== (moi.note || '');
  if (!doi) return null;
  return {
    name: moi.name,
    root_person_id: moi.rootPersonId || null,
    note: moi.note || '',
  };
}

function soSanhMang(bang, dsCu, dsMoi) {
  const cu  = theoMa(dsCu);
  const luu = [];
  const xoa = [];

  for (const banGhi of dsMoi || []) {
    if (!banGhi || !banGhi.id) continue;
    const truoc = cu.get(banGhi.id);
    if (!truoc || !bangNhau(truoc, banGhi, Object.keys(bang))) {
      luu.push(veBang(bang, banGhi));
    }
    cu.delete(banGhi.id);
  }
  // Còn sót lại trong `cu` nghĩa là bản ghi đã rời khỏi mảng — xoá thật.
  for (const ma of cu.keys()) xoa.push(ma);

  return { luu, xoa };
}

/**
 * Con là bảng riêng nên phải so theo CẶP (hôn nhân, người), không so theo
 * union. So theo union thì đổi một đứa con là ghi lại cả nhà — và với giới
 * hạn theo nhánh thì "cả nhà" có thể nằm ngoài phần được sửa.
 */
function soSanhCon(dsCu, dsMoi) {
  const bam = (u, c) => u + '|' + c;
  const trai = (ds) => {
    const m = new Map();
    for (const u of ds || []) {
      if (!u || !u.id || !Array.isArray(u.children)) continue;
      for (const c of u.children) {
        if (!c || !c.personId) continue;
        m.set(bam(u.id, c.personId), {
          union_id: u.id, person_id: c.personId,
          relation: c.relation || 'birth',
          ord: Number.isFinite(c.order) ? c.order : 1,
        });
      }
    }
    return m;
  };

  const cu  = trai(dsCu);
  const moi = trai(dsMoi);
  const luu = [];
  const xoa = [];

  for (const [khoa, dong] of moi) {
    const truoc = cu.get(khoa);
    if (!truoc || truoc.relation !== dong.relation || truoc.ord !== dong.ord) {
      luu.push(dong);
    }
  }
  for (const [khoa, dong] of cu) {
    if (!moi.has(khoa)) xoa.push({ union_id: dong.union_id, person_id: dong.person_id });
  }
  return { luu, xoa };
}

/**
 * Sổ nhập chỉ mọc thêm, không bao giờ sửa hay xoá — nên lấy phần đuôi là đủ.
 * So từng mục thì tốn mà không mua được gì: `map` của một lần nhập GEDCOM có
 * thể là bảy trăm dòng.
 */
function themMoi(cu, moi) {
  const soCu = Array.isArray(cu) ? cu.length : 0;
  const ds   = Array.isArray(moi) ? moi : [];
  return ds.slice(soCu).map((e) => ({
    file: e.file || '', source: e.source || '',
    source_name: e.sourceName || '', exporter: e.exporter || '',
    counts: e.counts || {}, map: e.map || [],
  }));
}

function theoMa(ds) {
  const m = new Map();
  for (const b of ds || []) if (b && b.id) m.set(b.id, b);
  return m;
}

/**
 * So hai bản ghi trên đúng những trường sẽ được ghi xuống.
 *
 * ⚠ KHÔNG dùng `JSON.stringify(a) === JSON.stringify(b)`. Hai object cùng nội
 *   dung mà khác thứ tự khoá cho ra hai chuỗi khác nhau — và điều đó xảy ra
 *   thật ở đây: bản ghi ráp từ cơ sở dữ liệu có thứ tự khoá theo bảng tên,
 *   còn bản ghi `domains/person.js` vừa dựng có thứ tự theo mã nguồn của nó.
 *   Dùng `stringify` thì mỗi lần lưu sẽ ghi lại toàn bộ 681 người, và giới
 *   hạn theo nhánh sẽ chặn mọi lần lưu của mọi người biên tập.
 */
function bangNhau(a, b, khoas) {
  for (const k of khoas) {
    if (!sauBangNhau(a[k], b[k])) return false;
  }
  return true;
}

function sauBangNhau(a, b) {
  if (a === b) return true;
  // `null` và `undefined` là một: cột rỗng đọc về thành `null`, còn bản ghi
  // trình duyệt vừa dựng thì đơn giản là không có khoá ấy.
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!sauBangNhau(a[i], b[i])) return false;
    return true;
  }

  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!sauBangNhau(a[k], b[k])) return false;
  }
  return true;
}
