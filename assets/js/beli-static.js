/**
 * Lớp đệm cho bản tĩnh.
 *
 * Hai việc:
 *   1. transferData -> tính ngay trong trình duyệt bằng beli-engine.js,
 *      không gọi máy chủ.
 *   2. save_base64_image -> tải ảnh thẳng về máy thay vì lưu lên máy chủ.
 *
 * Chặn ở tầng XMLHttpRequest chứ không phải jQuery.ajax, vì trang nạp nhiều
 * bản jQuery (bản cục bộ 3.7.1 và bản CDN 3.2.1) và mã tra cứu giữ tham chiếu
 * tới bản cũ trong closure, nên vá jQuery.ajax sẽ trượt.
 */
(function () {
  var TRANSFER = '/wp-json/readerinfo/v1/transferData';
  var SAVE_IMAGE = '/wp-json/readerinfo/v1/save_base64_image';

  // ---------------------------------------------------------- quyền mặc định

  // Trang "Tra cứu cặp đôi" mở thẳng được, trong khi phần xác thực chỉ có ở
  // trang chủ. Khi chưa có quyền thì xin quyền khách từ máy chủ, để gói thành
  // viên vẫn do máy chủ quyết định chứ không phải trình duyệt tự đặt.
  function xinQuyenKhach() {
    try {
      if (localStorage.getItem('userType')) return;
    } catch (e) {
      return;
    }
    fetch((window.BELI_API_BASE || '') + '/wp-json/readerinfo/v1/getDataInit', { method: 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.result) return;
        localStorage.setItem('userType', 'khach');
        localStorage.setItem('typeMapSearchList', d.listTypeMapSearch || '');
      })
      .catch(function () { /* mất mạng thì thôi */ });
  }

  // Trang chủ gọi localStorage.clear() lúc ready nên phải chạy sau đó.
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('readerInfoAuthenticateFormPopup')) xinQuyenKhach();
  });

  // ---------------------------------------------------------- nút "Bỏ Qua" luôn vào được ngay

  // Bản gốc (beli-auth.js) gọi ajax getDataInit KHÔNG có timeout khi bấm "Bỏ
  // Qua"; nếu Cloudflare Worker chậm/từ chối/mất mạng, ajax treo vô thời hạn
  // và popup đứng im mãi — không bấm gì được nữa. Vá thêm một trình lắng
  // nghe: bấm là mở khoá giao diện ngay bằng dữ liệu mặc định, không đợi máy
  // chủ. Nếu máy chủ trả lời kịp, hàm gốc vẫn chạy tiếp và tự ghi đè bằng dữ
  // liệu thật (danh sách chuyên mục), nên không mất gì khi mạng vẫn ổn.
  (function boQuaKhongCanChoMang() {
    var nutBoQua = document.getElementById('readerInfoAuthenticateClosePopup');
    var popup = document.getElementById('readerInfoAuthenticateFormPopup');
    if (!nutBoQua || !popup) return;

    var CHUYEN_MUC_MAC_DINH = 'Tổng Hợp,Học thuật,Code mới';

    function moKhoaGiaoDien() {
      popup.style.display = 'none';
      var loading = document.querySelector('.readerInfo-loadingPage');
      if (loading) loading.style.display = 'none';
      try {
        if (!localStorage.getItem('userType')) localStorage.setItem('userType', 'khach');
        if (!localStorage.getItem('typeMapSearchList')) {
          localStorage.setItem('typeMapSearchList', CHUYEN_MUC_MAC_DINH);
        }
      } catch (e) { /* trình duyệt chặn localStorage thì thôi */ }

      var formMain = document.getElementById('form-main');
      if (formMain) formMain.style.display = '';

      // Giống hệt createListTypeMapSearch() bản gốc: thay hẳn toàn bộ option
      // (kể cả option rỗng có sẵn trong HTML), không chỉ thêm vào khi rỗng.
      var mucChon = document.getElementById('typeMapSearch');
      if (mucChon) {
        mucChon.innerHTML = '';
        (localStorage.getItem('typeMapSearchList') || CHUYEN_MUC_MAC_DINH).split(',').forEach(function (ten) {
          if (!ten) return;
          var o = document.createElement('option');
          o.value = ten;
          o.textContent = ten;
          mucChon.appendChild(o);
        });
      }
    }

    nutBoQua.addEventListener('click', function () {
      // Nhường cho hàm gốc (nếu có) chạy xong phần đồng bộ của nó trước, rồi
      // mở khoá ngay bất kể máy chủ đã trả lời hay chưa. Dùng setTimeout chứ
      // không dùng requestAnimationFrame: rAF không chạy khi tab bị ẩn/chuyển
      // nền, lỡ vậy thì đúng lúc cần mở khoá nhất lại không chạy.
      setTimeout(moKhoaGiaoDien, 0);
    });
  })();

  // ---------------------------------------------------------- tiện ích

  /** Tách chuỗi form-urlencoded thành đối tượng. */
  function phanTichBody(body) {
    var ra = {};
    if (!body) return ra;
    if (typeof body === 'string') {
      body.split('&').forEach(function (c) {
        if (!c) return;
        var i = c.indexOf('=');
        var k = decodeURIComponent((i < 0 ? c : c.slice(0, i)).replace(/\+/g, ' '));
        var v = i < 0 ? '' : decodeURIComponent(c.slice(i + 1).replace(/\+/g, ' '));
        ra[k] = v;
      });
      return ra;
    }
    if (window.URLSearchParams && body instanceof URLSearchParams) {
      body.forEach(function (v, k) { ra[k] = v; });
    } else if (window.FormData && body instanceof FormData) {
      body.forEach(function (v, k) { ra[k] = v; });
    }
    return ra;
  }

  function tinhBanDoTuThamSo(t) {
    var d = new Date();
    return window.BeliEngine.tinhBanDo({
      hoVaTen: t.hoVaTen || '',
      tenThuongGoi: t.tenThuongGoi || '',
      ngay: Number(t.inputNgay),
      thang: Number(t.inputThang),
      nam: Number(t.inputNam),
      currentDate: Number(t.currentDate) || d.getDate(),
      currentMonth: Number(t.currentMonth) || (d.getMonth() + 1),
      today: { nam: d.getFullYear(), thang: d.getMonth() + 1, ngay: d.getDate() },
    });
  }

  // ---------------------------------------------------------- xuất ảnh nét

  var THE_CANVAS = 'beli-canvas://ban-do';
  var canvasCuoi = null;

  /**
   * Mức phóng lớn nhất còn an toàn.
   *
   * Trình duyệt giới hạn cả chiều dài mỗi cạnh lẫn tổng số điểm ảnh của canvas;
   * vượt ngưỡng thì ảnh ra trắng trơn hoặc tab bị treo. Bản đồ rất cao (gần
   * 4000px) nên cạnh mới là ràng buộc chính chứ không phải diện tích.
   */
  function mucPhong(el) {
    var rong = el.scrollWidth || el.offsetWidth || 1;
    var cao = el.scrollHeight || el.offsetHeight || 1;
    // Nhận diện máy điện thoại bằng kiểu con trỏ, không dựa vào chiều cao cửa
    // sổ — máy tính thu nhỏ cửa sổ sẽ bị nhận nhầm và mất oan độ nét.
    var conTroTho = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var diDong = conTroTho || Math.min(window.innerWidth, window.innerHeight) < 600;
    var canhToiDa = 16000;                        // giới hạn thực tế ~16384
    var diemAnhToiDa = diDong ? 30e6 : 60e6;      // máy điện thoại ít bộ nhớ hơn
    var tran = Math.min(
      canhToiDa / rong,
      canhToiDa / cao,
      Math.sqrt(diemAnhToiDa / (rong * cao))
    );
    return Math.max(1, Math.min(4, Math.floor(tran * 10) / 10));
  }

  /**
   * Đợi font và ảnh bên trong vùng chụp tải ổn định trước khi chụp.
   *
   * Máy nhanh máy chậm tải font/ảnh xong ở thời điểm khác nhau; nếu chụp
   * ngay lúc font web chưa kịp áp (chữ tạm hiện bằng font hệ thống, chiều
   * rộng khác) hoặc ảnh trong bản đồ chưa giải mã xong, ảnh/PDF xuất ra sẽ
   * lệch dòng hoặc có vùng trắng tuỳ máy. Đợi xong rồi mới đo kích thước và
   * chụp thì mọi máy cho ra cùng một kết quả.
   */
  function doiOnDinh(el) {
    var doiFont = (document.fonts && document.fonts.ready)
      ? document.fonts.ready.catch(function () {})
      : Promise.resolve();
    var anhs = el && el.querySelectorAll ? el.querySelectorAll('img') : [];
    var doiAnh = Array.prototype.map.call(anhs, function (img) {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      if (img.decode) return img.decode().catch(function () {});
      return new Promise(function (giai) {
        img.addEventListener('load', giai, { once: true });
        img.addEventListener('error', giai, { once: true });
        setTimeout(giai, 4000); // ảnh lỗi/mạng chậm thì thôi, đừng treo mãi
      });
    });
    return Promise.all([doiFont].concat(doiAnh)).then(function () {
      // Hai khung hình để trình duyệt vẽ lại xong sau khi font/ảnh đã sẵn sàng.
      return new Promise(function (giai) {
        requestAnimationFrame(function () { requestAnimationFrame(giai); });
      });
    });
  }

  // Bọc html2canvas để ép mức phóng cao. Dùng get/set vì thư viện có thể được
  // gán sau file này.
  (function bocHtml2canvas() {
    var thuc = window.html2canvas;
    function bocLai(fn) {
      return function (el, opts) {
        return doiOnDinh(el).then(function () {
          var o = {};
          for (var k in (opts || {})) o[k] = opts[k];
          o.scale = mucPhong(el);
          o.useCORS = true;
          o.allowTaint = false;       // giữ canvas xuất được, không bị "nhiễm"
          o.backgroundColor = '#ffffff';
          o.imageTimeout = 0;
          o.logging = false;
          return fn(el, o).then(function (canvas) {
            canvasCuoi = canvas;
            window.__BELI_XUAT = { rong: canvas.width, cao: canvas.height, mucPhong: o.scale };
            // Trả về thẻ ngắn thay cho chuỗi base64 hàng chục MB: bản gốc sẽ
            // nhét chuỗi này vào một lời gọi ajax, mà mình chặn lời gọi đó rồi.
            // Vẫn giữ hàm gốc để lúc dựng PDF còn lấy được ảnh thật.
            canvas.__toDataURLGoc = HTMLCanvasElement.prototype.toDataURL.bind(canvas);
            canvas.toDataURL = function () { return THE_CANVAS; };
            return canvas;
          });
        });
      };
    }
    try {
      Object.defineProperty(window, 'html2canvas', {
        configurable: true,
        get: function () { return thuc ? bocLai(thuc) : undefined; },
        set: function (v) { thuc = v; },
      });
    } catch (e) {
      if (thuc) window.html2canvas = bocLai(thuc);
    }
  })();

  // ---------------------------------------------------------- trình duyệt trong app (Zalo...)

  // Zalo, Messenger, Instagram... mở link bằng trình duyệt riêng nhúng trong
  // app, và trình duyệt đó thường CHẶN tải file (thẻ <a download>, blob URL
  // không chạy). Không có cách nào ép các app này tải file bằng JS được —
  // cách duy nhất là hướng dẫn người dùng tự mở link bằng Chrome/Safari.
  function laTrinhDuyetTrongApp() {
    return /Zalo|FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|TikTok/i.test(navigator.userAgent || '');
  }

  // Các ô dữ liệu cần giữ lại khi phải mở lại bằng trình duyệt khác — gồm cả
  // trang tra cứu 1 người (không hậu tố) lẫn tra cứu cặp đôi (hậu tố 1/2).
  var TRUONG_KHOI_PHUC = [
    'hoTen', 'inputTenThuongGoi', 'ngay', 'thang', 'nam',
    'hoTen1', 'inputTenThuongGoi1', 'ngay1', 'thang1', 'nam1',
    'hoTen2', 'inputTenThuongGoi2', 'ngay2', 'thang2', 'nam2',
  ];

  /** Đường dẫn trang hiện tại kèm dữ liệu đã nhập, để mở lại không phải gõ tay. */
  function taoLinkKhoiPhuc() {
    var url = new URL(location.href);
    url.search = '';
    TRUONG_KHOI_PHUC.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.value) url.searchParams.set(id, el.value);
    });
    return url.toString();
  }

  /**
   * Ghi dữ liệu hiện tại lên thanh địa chỉ (không tải lại trang), để nếu
   * người dùng tự sao chép link từ trình duyệt (kể cả nút "Chia sẻ"/"Sao
   * chép liên kết" có sẵn của Zalo, Messenger...) thì link đó cũng đã kèm
   * sẵn dữ liệu, không cần đợi bấm nút tải ảnh mới có.
   */
  function ghiDuLieuLenDiaChi() {
    try {
      history.replaceState(null, '', taoLinkKhoiPhuc());
    } catch (e) { /* trình duyệt cũ không hỗ trợ replaceState thì thôi */ }
  }

  // Cập nhật ngay khi bấm "Tra Cứu" — không đợi tính xong, vì dữ liệu cần
  // ghi (họ tên, ngày sinh...) đã có sẵn trong form ngay lúc bấm rồi.
  document.addEventListener('click', function (e) {
    var nutTraCuu = e.target && e.target.closest && e.target.closest('#submitBtn');
    if (nutTraCuu) ghiDuLieuLenDiaChi();
  }, true);

  // Nút "Chia sẻ" bản gốc bắt buộc phải có emailUser (chỉ có khi đăng nhập
  // thật bằng email+code) mới cho sao chép, nên khách bấm "Bỏ Qua" bấm Chia
  // sẻ chỉ hiện "Không thể sao chép!!" chứ không làm gì. Với khách (chưa
  // đăng nhập), chặn hành vi gốc lại và tự sao chép link theo đúng dữ liệu
  // đang có trên form — không cần tài khoản. Ai đã đăng nhập thật thì vẫn
  // để hành vi gốc chạy như cũ.
  document.addEventListener('click', function (e) {
    var nutChiaSe = e.target && e.target.closest && e.target.closest('#shareBtn');
    if (!nutChiaSe) return;
    var daDangNhap = (function () {
      try { return !!localStorage.getItem('emailUser'); } catch (err) { return false; }
    })();
    if (daDangNhap) return; // để hành vi gốc chạy bình thường

    e.preventDefault();
    e.stopImmediatePropagation();
    var link = taoLinkKhoiPhuc();
    var xong = function () { nutChiaSe.innerHTML = 'Đã sao chép!'; };
    var loi = function () { nutChiaSe.innerHTML = 'Không thể sao chép!!'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(xong).catch(function () {
        var o = document.createElement('input');
        o.value = link;
        document.body.appendChild(o);
        o.select();
        try { document.execCommand('copy'); xong(); } catch (e2) { loi(); }
        document.body.removeChild(o);
      });
    } else {
      loi();
    }
  }, true);

  /** Lúc trang vừa mở: nếu link có kèm dữ liệu (từ hộp thoại trên) thì tự điền vào form. */
  (function khoiPhucTuLink() {
    var qs = new URLSearchParams(location.search);
    if (!Array.from(qs.keys()).length) return;
    document.addEventListener('DOMContentLoaded', function () {
      TRUONG_KHOI_PHUC.forEach(function (id) {
        var v = qs.get(id);
        var el = document.getElementById(id);
        if (!v || !el) return;
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
  })();

  /** Hộp hướng dẫn mở bằng trình duyệt thật, kèm link đã có sẵn dữ liệu. */
  function hopMoTrinhDuyet(khiVanMuonThuTai) {
    var link = taoLinkKhoiPhuc();

    var nen = document.createElement('div');
    nen.setAttribute('style', [
      'position:fixed', 'inset:0', 'background:rgba(0,0,0,.5)', 'z-index:99999',
      'display:flex', 'align-items:center', 'justify-content:center', 'padding:16px',
    ].join(';'));

    var hop = document.createElement('div');
    hop.setAttribute('style', [
      'background:#fff', 'border-radius:12px', 'padding:24px', 'max-width:380px',
      'width:100%', 'box-shadow:0 10px 40px rgba(0,0,0,.3)', 'text-align:center',
      'font-family:inherit',
    ].join(';'));

    var tieuDe = document.createElement('div');
    tieuDe.textContent = 'Mở bằng trình duyệt để tải file';
    tieuDe.setAttribute('style', 'font-size:18px;font-weight:700;margin-bottom:6px;color:#1f2937');

    var moTa = document.createElement('div');
    moTa.innerHTML = 'Ứng dụng bạn đang mở (Zalo, Messenger...) không cho tải file trực tiếp. Chạm biểu tượng <b>⋮</b> hoặc <b>···</b> ở góc trên, chọn <b>"Mở bằng trình duyệt"</b> (Chrome/Safari), dữ liệu bạn đã nhập sẽ tự điền lại, không cần gõ lại.';
    moTa.setAttribute('style', 'font-size:14px;color:#4b5563;margin-bottom:16px;text-align:left;line-height:1.5');

    var oLink = document.createElement('input');
    oLink.type = 'text';
    oLink.readOnly = true;
    oLink.value = link;
    oLink.setAttribute('style', [
      'display:block', 'width:100%', 'min-height:40px', 'margin-bottom:10px',
      'padding:8px 10px', 'border:1px solid #d1d5db', 'border-radius:8px',
      'font-size:13px', 'color:#374151', 'background:#f9fafb',
    ].join(';'));
    oLink.onclick = function () { oLink.select(); };

    function nut(chu, mau, chuMau) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = chu;
      b.setAttribute('style', [
        'display:block', 'width:100%', 'min-height:44px', 'margin-bottom:10px',
        'padding:10px 14px', 'border:0', 'border-radius:8px', 'cursor:pointer',
        'background:' + mau, 'color:' + chuMau, 'font-size:15px', 'font-weight:600',
      ].join(';'));
      return b;
    }

    var bSaoChep = nut('Sao chép link', '#1d4ed8', '#fff');
    bSaoChep.onclick = function () {
      var xong = function () { bSaoChep.textContent = 'Đã sao chép ✓'; setTimeout(function () { bSaoChep.textContent = 'Sao chép link'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(xong).catch(function () { oLink.select(); document.execCommand('copy'); xong(); });
      } else {
        oLink.select();
        try { document.execCommand('copy'); xong(); } catch (e) {}
      }
    };

    var bVanThuTai = document.createElement('button');
    bVanThuTai.type = 'button';
    bVanThuTai.textContent = 'Vẫn thử tải trong này';
    bVanThuTai.setAttribute('style', [
      'display:block', 'width:100%', 'min-height:44px', 'border:1px solid #d1d5db',
      'border-radius:8px', 'background:#fff', 'color:#374151', 'cursor:pointer',
      'font-size:14px', 'margin-bottom:10px',
    ].join(';'));

    var bDong = document.createElement('button');
    bDong.type = 'button';
    bDong.textContent = 'Đóng';
    bDong.setAttribute('style', [
      'display:block', 'width:100%', 'min-height:36px', 'border:0',
      'background:none', 'color:#9ca3af', 'cursor:pointer', 'font-size:13px',
    ].join(';'));

    function dong() { if (nen.parentNode) nen.parentNode.removeChild(nen); }

    bVanThuTai.onclick = function () { dong(); khiVanMuonThuTai(); };
    bDong.onclick = dong;
    nen.onclick = function (e) { if (e.target === nen) dong(); };

    hop.appendChild(tieuDe);
    hop.appendChild(moTa);
    hop.appendChild(oLink);
    hop.appendChild(bSaoChep);
    hop.appendChild(bVanThuTai);
    hop.appendChild(bDong);
    nen.appendChild(hop);
    document.body.appendChild(nen);
  }

  // ---------------------------------------------------------- chọn định dạng

  var dinhDangChon = 'png';     // 'png' hoặc 'pdf'
  var dangChoLai = false;

  function hopChon(khiChon) {
    var nen = document.createElement('div');
    nen.setAttribute('style', [
      'position:fixed', 'inset:0', 'background:rgba(0,0,0,.5)', 'z-index:99999',
      'display:flex', 'align-items:center', 'justify-content:center', 'padding:16px',
    ].join(';'));

    var hop = document.createElement('div');
    hop.setAttribute('style', [
      'background:#fff', 'border-radius:12px', 'padding:24px', 'max-width:360px',
      'width:100%', 'box-shadow:0 10px 40px rgba(0,0,0,.3)', 'text-align:center',
      'font-family:inherit',
    ].join(';'));

    var tieuDe = document.createElement('div');
    tieuDe.textContent = 'Tải bản đồ về máy';
    tieuDe.setAttribute('style', 'font-size:18px;font-weight:700;margin-bottom:6px;color:#1f2937');

    var moTa = document.createElement('div');
    moTa.textContent = 'Chọn định dạng bạn muốn tải.';
    moTa.setAttribute('style', 'font-size:14px;color:#4b5563;margin-bottom:18px');

    function nut(chu, phu, mau) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('style', [
        'display:block', 'width:100%', 'min-height:44px', 'margin-bottom:10px',
        'padding:10px 14px', 'border:0', 'border-radius:8px', 'cursor:pointer',
        'background:' + mau, 'color:#fff', 'font-size:15px', 'font-weight:600',
      ].join(';'));
      b.innerHTML = chu + '<div style="font-size:12px;font-weight:400;opacity:.9">' + phu + '</div>';
      return b;
    }

    var bAnh = nut('Tải ảnh PNG', 'Ảnh nét, dán vào Zalo hay Facebook được ngay', '#1d4ed8');
    var bPdf = nut('Tải PDF', 'Một trang dài, hợp để in hoặc gửi khách', '#047857');

    var bHuy = document.createElement('button');
    bHuy.type = 'button';
    bHuy.textContent = 'Huỷ';
    bHuy.setAttribute('style', [
      'display:block', 'width:100%', 'min-height:44px', 'border:1px solid #d1d5db',
      'border-radius:8px', 'background:#fff', 'color:#374151', 'cursor:pointer',
      'font-size:15px',
    ].join(';'));

    function dong() { if (nen.parentNode) nen.parentNode.removeChild(nen); }

    bAnh.onclick = function () { dong(); khiChon('png'); };
    bPdf.onclick = function () { dong(); khiChon('pdf'); };
    bHuy.onclick = dong;
    nen.onclick = function (e) { if (e.target === nen) dong(); };

    hop.appendChild(tieuDe);
    hop.appendChild(moTa);
    hop.appendChild(bAnh);
    hop.appendChild(bPdf);
    hop.appendChild(bHuy);
    nen.appendChild(hop);
    document.body.appendChild(nen);
    bAnh.focus();
  }

  // Chặn cú bấm đầu tiên để hỏi định dạng, rồi bấm lại để bản gốc chạy tiếp.
  // Trong app Zalo/Messenger... thì hỏi định dạng cũng vô ích vì tải sẽ thất
  // bại, nên chặn sớm hơn để hướng dẫn mở bằng trình duyệt trước.
  document.addEventListener('click', function (e) {
    var nutChup = e.target && e.target.closest && e.target.closest('#screenshot-btn');
    if (!nutChup || dangChoLai) return;
    e.preventDefault();
    e.stopImmediatePropagation();

    function hoiDinhDangRoiTai() {
      hopChon(function (dinhDang) {
        dinhDangChon = dinhDang;
        dangChoLai = true;
        try {
          nutChup.click();
        } finally {
          dangChoLai = false;
        }
      });
    }

    if (laTrinhDuyetTrongApp()) {
      hopMoTrinhDuyet(hoiDinhDangRoiTai);
    } else {
      hoiDinhDangRoiTai();
    }
  }, true);

  // ---------------------------------------------------------- dựng PDF

  var JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

  function napJsPDF() {
    var co = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (co) return Promise.resolve(co);
    return new Promise(function (giai, tuChoi) {
      var s = document.createElement('script');
      s.src = JSPDF_CDN;
      s.onload = function () {
        var f = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        f ? giai(f) : tuChoi(new Error('Không nạp được thư viện PDF'));
      };
      s.onerror = function () { tuChoi(new Error('Không tải được thư viện PDF')); };
      document.head.appendChild(s);
    });
  }

  /** Xuất canvas thành PDF một trang dài, giữ nguyên tỉ lệ bản đồ. */
  function xuatPDF(canvas, ten) {
    return napJsPDF().then(function (jsPDF) {
      var rongMm = 210;                                    // bằng khổ A4
      var caoMm = rongMm * (canvas.height / canvas.width);
      var pdf = new jsPDF({
        orientation: caoMm >= rongMm ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [rongMm, caoMm],
        compress: true,
      });
      var anh = canvas.__toDataURLGoc
        ? canvas.__toDataURLGoc('image/jpeg', 0.95)
        : canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(anh, 'JPEG', 0, 0, rongMm, caoMm, undefined, 'FAST');
      pdf.save(ten);
      if (window.__BELI_XUAT) window.__BELI_XUAT.pdfMm = Math.round(rongMm) + ' x ' + Math.round(caoMm);
    });
  }

  function luuTep(blob, ten) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = ten;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  function taiAnhVeMay(t) {
    var ten = t.file_name || 'ban-do-cuoc-doi.png';

    if (dinhDangChon === 'pdf' && t.base64_image === THE_CANVAS && canvasCuoi) {
      xuatPDF(canvasCuoi, ten.replace(/\.png$/i, '') + '.pdf').catch(function (e) {
        alert('Không tạo được PDF: ' + e.message + '. Bạn thử tải ảnh PNG nhé.');
      });
      return { result: true, message: '', fileUrl: '' };
    }

    try {
      if (t.base64_image === THE_CANVAS && canvasCuoi) {
        // toBlob nhanh hơn và tốn ít bộ nhớ hơn hẳn so với chuỗi base64
        if (canvasCuoi.toBlob) {
          canvasCuoi.toBlob(function (b) {
            if (b) {
              if (window.__BELI_XUAT) window.__BELI_XUAT.dungLuong = b.size;
              luuTep(b, ten);
            }
          }, 'image/png');
        } else {
          luuTep(new Blob([canvasCuoi.toDataURL('image/png')]), ten);
        }
      } else if (t.base64_image) {
        var phan = String(t.base64_image).split(',');
        var nhiPhan = atob(phan[1] || phan[0]);
        var mang = new Uint8Array(nhiPhan.length);
        for (var i = 0; i < nhiPhan.length; i++) mang[i] = nhiPhan.charCodeAt(i);
        luuTep(new Blob([mang], { type: 'image/png' }), ten);
      }
    } catch (e) {
      /* trình duyệt chặn thì thôi, phần dọn giao diện vẫn phải chạy tiếp */
    }
    // fileUrl rỗng để bản gốc không mở thêm tab
    return { result: true, message: '', fileUrl: '' };
  }

  // ---------------------------------------------------------- chặn XHR

  var XHR = window.XMLHttpRequest;
  if (!XHR) return;

  var openGoc = XHR.prototype.open;
  var sendGoc = XHR.prototype.send;
  var setHeaderGoc = XHR.prototype.setRequestHeader;

  XHR.prototype.open = function (method, url) {
    var u = String(url || '');
    var chan = null;
    if (u.indexOf(TRANSFER) !== -1 && window.BeliEngine) chan = 'tinh';
    else if (u.indexOf(SAVE_IMAGE) !== -1) chan = 'anh';

    this.__beliChan = chan;
    if (chan) return;            // không mở kết nối thật
    return openGoc.apply(this, arguments);
  };

  XHR.prototype.setRequestHeader = function () {
    if (this.__beliChan) return;  // chưa mở thật thì bỏ qua, tránh lỗi
    return setHeaderGoc.apply(this, arguments);
  };

  XHR.prototype.send = function (body) {
    if (!this.__beliChan) return sendGoc.apply(this, arguments);

    var t = phanTichBody(body);
    var kq;
    try {
      kq = this.__beliChan === 'tinh' ? tinhBanDoTuThamSo(t) : taiAnhVeMay(t);
    } catch (e) {
      kq = { result: false, message: 'Lỗi xử lý tại chỗ: ' + e.message };
    }
    var text = JSON.stringify(kq);

    // Giả lập một phản hồi thành công ngay trên chính đối tượng XHR này.
    var co = { configurable: true };
    Object.defineProperty(this, 'readyState', Object.assign({ get: function () { return 4; } }, co));
    Object.defineProperty(this, 'status', Object.assign({ get: function () { return 200; } }, co));
    Object.defineProperty(this, 'statusText', Object.assign({ get: function () { return 'OK'; } }, co));
    Object.defineProperty(this, 'responseText', Object.assign({ get: function () { return text; } }, co));
    Object.defineProperty(this, 'response', Object.assign({ get: function () { return text; } }, co));
    Object.defineProperty(this, 'responseType', Object.assign({ get: function () { return ''; } }, co));
    this.getAllResponseHeaders = function () { return 'content-type: application/json; charset=utf-8\r\n'; };
    this.getResponseHeader = function (n) {
      return String(n).toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null;
    };
    this.abort = function () {};

    // Gọi đồng bộ để hoạt động cả với ajax async:false của bản gốc.
    if (typeof this.onreadystatechange === 'function') this.onreadystatechange();
    if (typeof this.onload === 'function') this.onload();
    if (typeof this.onloadend === 'function') this.onloadend();
    try {
      this.dispatchEvent(new Event('readystatechange'));
      this.dispatchEvent(new Event('load'));
      this.dispatchEvent(new Event('loadend'));
    } catch (e) {
      /* trình duyệt cũ không dựng được Event thì bỏ qua */
    }
  };

  // Bản gốc mở tab mới tới fileUrl của ảnh đã lưu trên máy chủ. Bản tĩnh tải
  // thẳng về máy nên fileUrl rỗng, và bản gốc vẫn nối thêm "?nocache=..." rồi
  // gọi mở — thành ra mở lại chính trang này. Chặn cả hai trường hợp đó.
  var moGoc = window.open;
  window.open = function (url) {
    var u = String(url || '');
    if (!u || u.charAt(0) === '?' || u.charAt(0) === '&') return null;
    return moGoc.apply(window, arguments);
  };
})();
