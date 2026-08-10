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
    var diDong = Math.min(window.innerWidth, window.innerHeight) < 768;
    var canhToiDa = 16000;                        // giới hạn thực tế ~16384
    var diemAnhToiDa = diDong ? 30e6 : 60e6;      // máy điện thoại ít bộ nhớ hơn
    var tran = Math.min(
      canhToiDa / rong,
      canhToiDa / cao,
      Math.sqrt(diemAnhToiDa / (rong * cao))
    );
    return Math.max(1, Math.min(4, Math.floor(tran * 10) / 10));
  }

  // Bọc html2canvas để ép mức phóng cao. Dùng get/set vì thư viện có thể được
  // gán sau file này.
  (function bocHtml2canvas() {
    var thuc = window.html2canvas;
    function bocLai(fn) {
      return function (el, opts) {
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
          canvas.toDataURL = function () { return THE_CANVAS; };
          return canvas;
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
