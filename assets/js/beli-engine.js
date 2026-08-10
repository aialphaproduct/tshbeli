/**
 * Engine than so hoc chay ngay trong trinh duyet.
 * Sinh tu dong tu tshbeli-api/src/numerology.js - dung sua tay o day.
 */
(function (global) {
'use strict';

/**
 * Beli — engine thần số học (bản dựng lại bằng JavaScript).
 *
 * Quy ước hai cột kết quả:
 *   - "Dọc"  (bài học)   : rút gọn từng thành phần trước rồi mới cộng, giữ số master.
 *   - "Ngang" (tiềm năng): cộng thô toàn bộ rồi mới rút gọn.
 *
 * Số hiển thị theo chuỗi rút gọn đầy đủ, ví dụ 37 -> "37/10/1".
 */

const MASTERS = new Set([11, 22, 33]);
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/** Bỏ dấu tiếng Việt, viết hoa, chỉ giữ A-Z và khoảng trắng. */
function unmark(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Giá trị Pythagore của một chữ cái: A=1..I=9, J=1..R=9, S=1..Z=8. */
function letterValue(ch) {
  const code = ch.charCodeAt(0) - 65;
  if (code < 0 || code > 25) return 0;
  return (code % 9) + 1;
}

function digitSum(n) {
  let s = 0;
  for (const d of String(Math.abs(n))) {
    if (d >= '0' && d <= '9') s += Number(d);
  }
  return s;
}

/** Rút gọn về một chữ số, nhưng dừng lại ở số master (11, 22, 33). */
function reduceMaster(n) {
  let v = Math.abs(Number(n) || 0);
  while (v > 9 && !MASTERS.has(v)) v = digitSum(v);
  return v;
}

/** Rút gọn triệt để về một chữ số (không giữ master). */
function reduceFull(n) {
  let v = Math.abs(Number(n) || 0);
  while (v > 9) v = digitSum(v);
  return v;
}

/** Chuỗi rút gọn đầy đủ: 37 -> "37/10/1", 8 -> "8". */
function chain(n) {
  let v = Math.abs(Number(n) || 0);
  const parts = [v];
  while (v > 9) {
    v = digitSum(v);
    parts.push(v);
  }
  return parts.join('/');
}

/** Giá trị cuối của một chuỗi "37/10/1" -> 1. */
function chainLast(s) {
  const parts = String(s).split('/');
  return Number(parts[parts.length - 1]);
}

// ---------------------------------------------------------------- tên gọi

/** Tách tên thành các từ đã bỏ dấu. */
function words(name) {
  const u = unmark(name);
  return u ? u.split(' ') : [];
}

/** Tổng giá trị các chữ cái của một từ. */
function wordSum(word, filter) {
  let s = 0;
  for (const ch of word) {
    if (filter && !filter(ch)) continue;
    s += letterValue(ch);
  }
  return s;
}

/**
 * Y chỉ được tính là nguyên âm khi trong từ không có nguyên âm nào khác.
 * Ví dụ: "MY", "LY" -> Y là nguyên âm; "DUYEN", "YEN" -> Y là phụ âm.
 */
function vowelTest(word) {
  const hasPlainVowel = [...word].some((c) => VOWELS.has(c));
  return hasPlainVowel
    ? (ch) => VOWELS.has(ch)
    : (ch) => VOWELS.has(ch) || ch === 'Y';
}

const KIND_ALL = 'all';
const KIND_VOWEL = 'vowel';
const KIND_CONSONANT = 'consonant';

/**
 * Tính một chỉ số từ tên: trả về { doc, ngang } dạng số thô.
 *   ngang = tổng toàn bộ chữ cái
 *   doc   = tổng của (rút gọn-giữ-master từng từ)
 * @param {string} kind KIND_ALL | KIND_VOWEL | KIND_CONSONANT
 */
function nameIndex(name, kind = KIND_ALL) {
  const ws = words(name);
  let ngang = 0;
  let doc = 0;
  for (const w of ws) {
    let filter = null;
    if (kind === KIND_VOWEL) {
      filter = vowelTest(w);
    } else if (kind === KIND_CONSONANT) {
      const isV = vowelTest(w);
      filter = (ch) => !isV(ch);
    }
    const s = wordSum(w, filter);
    ngang += s;
    doc += reduceMaster(s);
  }
  return { doc, ngang };
}

/**
 * Nhóm chỉ số tính trên "họ + tên", tức từ đầu và từ cuối của họ tên đầy đủ:
 *   - Tương tác  : chỉ nguyên âm
 *   - Phát triển : chỉ phụ âm
 *   - Nội tâm    : toàn bộ chữ cái
 *
 * doc = rút gọn tổng thô, vẫn giữ số master.
 */
function hoVaTenIndex(hoVaTen, kind) {
  const ws = words(hoVaTen);
  if (!ws.length) return { doc: 0, ngang: 0 };
  const picked = ws.length === 1 ? [ws[0]] : [ws[0], ws[ws.length - 1]];
  let ngang = 0;
  for (const w of picked) {
    let filter = null;
    if (kind === KIND_VOWEL) {
      filter = vowelTest(w);
    } else if (kind === KIND_CONSONANT) {
      const isV = vowelTest(w);
      filter = (ch) => !isV(ch);
    }
    ngang += wordSum(w, filter);
  }
  return { doc: reduceMaster(ngang), ngang };
}

/** Điểm bảo mật = số chữ cái trong họ tên đầy đủ. */
function diemBaoMat(hoVaTen) {
  return unmark(hoVaTen).replace(/\s/g, '').length;
}

/** Vị trí chữ cái trong bảng chữ cái: A=1..Z=26. */
function alphaPos(ch) {
  const code = ch.charCodeAt(0) - 64;
  return code >= 1 && code <= 26 ? code : 0;
}

/**
 * Cân bằng = tổng chữ cái đầu của mỗi từ trong họ tên.
 *   doc   dùng giá trị Pythagore (A=1..I=9, J=1...)
 *   ngang dùng vị trí bảng chữ cái (A=1..Z=26)
 */
function canBang(hoVaTen) {
  const initials = words(hoVaTen).map((w) => w[0]).filter(Boolean);
  // Dọc rút gọn vị trí bảng chữ cái đúng một lượt, giữ số master (K=11, V=22).
  // Vì vậy S=19 cho ra 10 chứ không rút tiếp thành 1.
  const docTerms = initials.map((ch) => {
    const p = alphaPos(ch);
    if (MASTERS.has(p)) return p;
    return p > 9 ? digitSum(p) : p;
  });
  const ngangTerms = initials.map(alphaPos);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  return {
    doc: { bieuThuc: docTerms.join(' + '), ketQua: chain(sum(docTerms)) },
    ngang: { bieuThuc: ngangTerms.join(' + '), ketQua: chain(sum(ngangTerms)) },
  };
}

// ---------------------------------------------------------------- ngày sinh

/**
 * Đường đời.
 *   ngang = ngày + tháng + tổng-chữ-số(năm)
 *   doc   = master(ngày) + master(tháng) + master(tổng-chữ-số(năm))
 */
function duongDoi(d, m, y) {
  const ys = digitSum(y);
  return {
    ngang: d + m + ys,
    doc: reduceMaster(d) + reduceMaster(m) + reduceMaster(ys),
  };
}

/** Thái độ = ngày + tháng. */
function thaiDo(d, m) {
  return {
    ngang: d + m,
    doc: reduceMaster(d) + reduceMaster(m),
  };
}

/** Tư duy hợp lý = ngày sinh + tên thường gọi. */
function tuDuyHopLy(d, tenThuongGoi) {
  const t = nameIndex(tenThuongGoi);
  return {
    ngang: d + t.ngang,
    doc: reduceMaster(d) + reduceMaster(t.ngang),
  };
}

/** Các chữ số 1-9 không xuất hiện trong họ tên đầy đủ. */
function thieu(hoVaTen) {
  const present = new Set();
  for (const ch of unmark(hoVaTen).replace(/\s/g, '')) {
    present.add(letterValue(ch));
  }
  const missing = [];
  for (let i = 1; i <= 9; i++) if (!present.has(i)) missing.push(i);
  return missing;
}

/** Biểu đồ: đếm số lần xuất hiện của từng chữ số 1-9. */
function emptyChart() {
  const c = {};
  for (let i = 1; i <= 9; i++) c[i] = [];
  return c;
}

/** Biểu đồ ngày sinh: các chữ số của dd/mm/yyyy (bỏ số 0). */
function bieuDoNgaySinh(d, m, y) {
  const chart = emptyChart();
  const digits = `${String(d).padStart(2, '0')}${String(m).padStart(2, '0')}${y}`;
  for (const ch of digits) {
    const n = Number(ch);
    if (n >= 1 && n <= 9) chart[n].push(String(n));
  }
  return chart;
}

/** Biểu đồ ngày sinh + tên: cộng thêm giá trị từng chữ cái của tên. */
function bieuDoNgaySinhVaTen(d, m, y, name) {
  const chart = bieuDoNgaySinh(d, m, y);
  for (const ch of unmark(name).replace(/\s/g, '')) {
    const v = letterValue(ch);
    if (v >= 1 && v <= 9) chart[v].push(String(v));
  }
  return chart;
}

/**
 * Ma trận tâm lý = ô vuông Pythagore.
 * Gồm các chữ số của ngày sinh cộng với chữ số của 4 số phụ trợ:
 *   N1 = tổng mọi chữ số ngày sinh
 *   N2 = tổng chữ số của N1
 *   N3 = N1 - 2 x (chữ số đầu của ngày)
 *   N4 = tổng chữ số của N3
 */
function maTranTamLy(d, m, y) {
  const chart = emptyChart();
  const dateDigits = `${String(d).padStart(2, '0')}${String(m).padStart(2, '0')}${y}`;
  const n1 = digitSum(dateDigits);
  const n2 = digitSum(n1);
  const n3 = n1 - 2 * Number(String(d)[0]);
  const n4 = digitSum(n3);
  const all = dateDigits + String(n1) + String(n2) + String(n3) + String(n4);
  for (const ch of all) {
    const n = Number(ch);
    if (n >= 1 && n <= 9) chart[n].push(String(n));
  }
  return chart;
}

// ---------------------------------------------------------------- đỉnh cao

/**
 * Bốn đỉnh (tuổi đỉnh cao) và giá trị từng đỉnh.
 * Đỉnh 1 kết thúc ở tuổi 36 - reduceFull(đường đời).
 */
function bonDinh(d, m, y, duongDoiFinal) {
  const age1 = 36 - reduceFull(duongDoiFinal);
  const ages = [age1, age1 + 9, age1 + 18, age1 + 27];
  const nam = ages.map((a) => String(y + a));

  // Giá trị bốn đỉnh dùng ngày/tháng thô và tổng chữ số của năm.
  const ys = digitSum(y);
  const p1 = d + m;
  const p2 = d + ys;
  const p3 = p1 + p2;
  const p4 = m + ys;
  return { nam, ages, dinh: [p1, p2, p3, p4] };
}

/** Bốn thử thách, bản rút gọn (cột kết quả). */
function bonThuThach(d, m, y) {
  const rd = reduceFull(d);
  const rm = reduceFull(m);
  const ry = reduceFull(digitSum(y));
  const t1 = Math.abs(rm - rd);
  const t2 = Math.abs(rd - ry);
  const t3 = Math.abs(t1 - t2);
  const t4 = Math.abs(rm - ry);
  return [t1, t2, t3, t4];
}

/** Bốn thử thách, bản thô (cột Ngang). */
function bonThuThachNgang(d, m, y) {
  const ys = digitSum(y);
  const t1 = Math.abs(m - d);
  const t2 = Math.abs(d - ys);
  const t3 = Math.abs(t1 - t2);
  const t4 = Math.abs(m - ys);
  return [t1, t2, t3, t4];
}

// ---------------------------------------------------------------- chu kỳ

/**
 * Năm / tháng / ngày cá nhân.
 *
 * Năm cá nhân bám theo ngày hôm nay thật của máy chủ: nếu sinh nhật trong năm
 * nay đã qua thì lấy năm nay, chưa qua thì lùi một năm. Còn tháng và ngày cá
 * nhân mới dùng "ngày hiện tại" do người dùng chọn trên giao diện.
 *
 * @param {{nam:number, thang:number, ngay:number}} today ngày hôm nay
 */
function chuKyCaNhan(d, m, today, currentMonth, currentDate) {
  const passed =
    today.thang > m || (today.thang === m && today.ngay >= d);
  const yearUsed = passed ? today.nam : today.nam - 1;
  const ys = digitSum(yearUsed);

  const namNgang = d + m + ys;
  // Bản gốc rút gọn phần năm theo modulo 9 (nên tổng chữ số bằng 9 sẽ thành 0).
  const namDoc = reduceMaster(d) + reduceMaster(m) + (ys % 9);

  // Tháng cá nhân giữ số master ở phần năm cá nhân, nhưng rút triệt để phần tháng.
  const thangNgang = namNgang + currentMonth;
  const thangDoc = reduceMaster(namDoc) + reduceFull(currentMonth);

  // Ngày cá nhân thì ngược lại: phần ngày giữ số master, phần tháng rút triệt để.
  const ngayNgang = thangNgang + currentDate;
  const ngayDoc = reduceFull(thangDoc) + reduceMaster(currentDate);

  return {
    nam: { doc: namDoc, ngang: namNgang },
    thang: { doc: thangDoc, ngang: thangNgang },
    ngay: { doc: ngayDoc, ngang: ngayNgang },
  };
}

// ---------------------------------------------------------------- tổng hợp

/**
 * Tính toàn bộ bản đồ cuộc đời.
 * @param {{hoVaTen:string, tenThuongGoi:string, ngay:number, thang:number,
 *          nam:number, currentDate:number, currentMonth:number,
 *          currentYear:number}} input
 */
function tinhBanDo(input) {
  const d = Number(input.ngay);
  const m = Number(input.thang);
  const y = Number(input.nam);
  const cd = Number(input.currentDate);
  const cm = Number(input.currentMonth);
  const today = input.today || (() => {
    const n = new Date();
    return { nam: n.getFullYear(), thang: n.getMonth() + 1, ngay: n.getDate() };
  })();
  const ho = input.hoVaTen || '';
  const ten = input.tenThuongGoi || '';

  const dd = duongDoi(d, m, y);
  const sm = nameIndex(ho, KIND_ALL);            // sứ mệnh lớn (họ tên đầy đủ)
  const smNho = nameIndex(ten, KIND_ALL);        // sứ mệnh nhỏ (tên thường gọi)
  const lhLon = nameIndex(ho, KIND_VOWEL);       // linh hồn lớn
  const lhNho = nameIndex(ten, KIND_VOWEL);      // linh hồn nhỏ
  const ncLon = nameIndex(ho, KIND_CONSONANT);   // nhân cách lớn
  const ncNho = nameIndex(ten, KIND_CONSONANT);  // nhân cách nhỏ
  const cb = canBang(ho);
  const noiTam = hoVaTenIndex(ho, KIND_ALL);
  const tuongTac = hoVaTenIndex(ho, KIND_VOWEL);
  const phatTrien = hoVaTenIndex(ho, KIND_CONSONANT);
  const dbm = diemBaoMat(ho);

  const ddDocVal = reduceMaster(dd.doc);
  const smDocVal = reduceMaster(sm.doc);

  const ketNoiDoc = Math.abs(reduceFull(dd.doc) - reduceFull(sm.doc));
  const ketNoiNgang = Math.abs(dd.ngang - sm.ngang);

  const truongThanhDoc = ddDocVal + smDocVal;
  const truongThanhNgang = dd.ngang + sm.ngang;

  const tdhl = tuDuyHopLy(d, ten);
  const td = thaiDo(d, m);
  const thieuArr = thieu(ho);
  const ck = chuKyCaNhan(d, m, today, cm, cd);
  const dinh = bonDinh(d, m, y, dd.ngang);
  const tt = bonThuThach(d, m, y);
  const ttN = bonThuThachNgang(d, m, y);

  return {
    result: true,
    message: '',

    duongDoi_Doc: chain(dd.doc),
    duongDoi_Ngang: chain(dd.ngang),

    suMenhLon_Doc: chain(sm.doc),
    suMenhLon_Ngang: chain(sm.ngang),

    ketNoi_Doc: ketNoiDoc,
    ketNoi_Ngang: chain(ketNoiNgang),

    truongThanh_Doc: chain(truongThanhDoc),
    truongThanh_Ngang: chain(truongThanhNgang),

    linhHonNho_Doc: chain(lhNho.doc),
    linhHonNho_Ngang: chain(lhNho.ngang),
    linhHonLon_Doc: chain(lhLon.doc),
    linhHonLon_Ngang: chain(lhLon.ngang),

    nhanCachNho_Doc: chain(ncNho.doc),
    nhanCachNho_Ngang: chain(ncNho.ngang),
    nhanCachLon_Doc: chain(ncLon.doc),
    nhanCachLon_Ngang: chain(ncLon.ngang),

    soMenhNho_Doc: chain(smNho.doc),
    soMenhNho_Ngang: chain(smNho.ngang),

    ngaySinh_Doc: chain(d),
    ngaySinh_ChiSo: String(reduceFull(d)),

    tuDuyHopLy_Doc: chain(tdhl.doc),
    tuDuyHopLy_Ngang: chain(tdhl.ngang),

    thieu: thieuArr.join(' - '),
    phanHoiTiemThuc_Doc: 9 - thieuArr.length,

    thaiDo_Doc: chain(td.doc),
    thaiDo_Ngang: chain(td.ngang),

    namCaNhan_Doc: chain(ck.nam.doc),
    namCaNhan_Ngang: chain(ck.nam.ngang),
    thangCaNhan_Doc: chain(ck.thang.doc),
    thangCaNhan_Ngang: chain(ck.thang.ngang),
    ngayCaNhan_Doc: chain(ck.ngay.doc),
    ngayCaNhan_Ngang: chain(ck.ngay.ngang),

    bonNamDinhCao: dinh.nam,
    bonDinhGiaiDoanCuocDoi_Ngang: dinh.dinh.map(chain),
    bonThuThach: tt.map(String),
    thuThach1_Ngang: chain(ttN[0]),
    thuThach2_Ngang: chain(ttN[1]),
    thuThach4_Ngang: chain(ttN[3]),

    canBang_Doc: cb.doc,
    canBang_Ngang: cb.ngang,

    diemBaoMat: chain(dbm),
    diemBaoMat_ChiSo: String(reduceFull(dbm)),

    noiTam: String(reduceFull(noiTam.doc)),
    noiTam_Doc: chain(noiTam.doc),
    noiTam_Ngang: chain(noiTam.ngang),

    tuongTac: String(reduceFull(tuongTac.doc)),
    tuongTac_Doc: chain(tuongTac.doc),
    tuongTac_Ngang: chain(tuongTac.ngang),

    // Ô tóm tắt của Phát triển chỉ giữ lại số 22; 11 và 33 vẫn rút tiếp.
    phatTrien: String(phatTrien.doc === 22 ? 22 : reduceFull(phatTrien.doc)),
    phatTrien_Doc: chain(phatTrien.doc),
    phatTrien_Ngang: chain(phatTrien.ngang),

    bieuDoNgaySinh: bieuDoNgaySinh(d, m, y),
    bieuDoNgaySinh_ThuongGoi: bieuDoNgaySinhVaTen(d, m, y, ten),
    bieuDoNgaySinh_DayDu: bieuDoNgaySinhVaTen(d, m, y, ho),
    maTranTamLy: maTranTamLy(d, m, y),
  };
}

global.BeliEngine = { tinhBanDo: tinhBanDo };
})(window);
