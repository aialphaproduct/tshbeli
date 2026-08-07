/**
 * Lớp đệm cho bản tĩnh.
 *
 * Bản gốc lưu ảnh "Chia sẻ" lên máy chủ WordPress rồi mở đường dẫn ảnh. Ở đây
 * không có nơi lưu nên chặn lời gọi đó lại và tải thẳng ảnh về máy người dùng.
 */
(function () {
  // Trang "Tra cứu cặp đôi" có thể được mở thẳng, trong khi phần xác thực chỉ
  // chạy ở trang chủ. Nếu chưa có quyền thì xin quyền khách từ máy chủ, để gói
  // thành viên vẫn do máy chủ quyết định chứ không phải trình duyệt tự đặt.
  function xinQuyenKhach() {
    try {
      if (localStorage.getItem('userType')) return;
    } catch (e) {
      return;
    }
    var base = window.BELI_API_BASE || '';
    fetch(base + '/wp-json/readerinfo/v1/getDataInit', { method: 'POST' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.result) return;
        localStorage.setItem('userType', 'khach');
        localStorage.setItem('typeMapSearchList', d.listTypeMapSearch || '');
      })
      .catch(function () { /* mất mạng thì thôi */ });
  }

  if (!window.jQuery) return;
  var $ = window.jQuery;
  // Trang chủ gọi localStorage.clear() lúc ready nên phải chạy sau đó.
  $(function () {
    if (!document.getElementById('readerInfoAuthenticateFormPopup')) xinQuyenKhach();
  });

  var SAVE_IMAGE = '/wp-json/readerinfo/v1/save_base64_image';
  var goc = $.ajax;

  $.ajax = function (options) {
    var url = options && options.url ? String(options.url) : '';
    if (url.indexOf(SAVE_IMAGE) === -1) {
      return goc.apply(this, arguments);
    }

    var data = options.data || {};
    var base64 = data.base64_image || '';
    var ten = data.file_name || 'ban-do-cuoc-doi.png';

    try {
      var a = document.createElement('a');
      a.href = base64;
      a.download = ten;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      /* trình duyệt chặn thì thôi, vẫn phải chạy tiếp phần dọn giao diện */
    }

    // Trả về một "deferred" đã thành công để phần .done() của bản gốc chạy tiếp,
    // nhưng báo fileUrl rỗng để không mở tab mới.
    // jQuery Deferred đã có sẵn .done()/.fail() nên trả thẳng promise của nó.
    var d = $.Deferred();
    d.resolve({ result: true, message: '', fileUrl: '' });
    return d.promise();
  };

  // Bản gốc mở tab mới tới fileUrl; fileUrl rỗng thì bỏ qua.
  var moGoc = window.open;
  window.open = function (url) {
    if (!url) return null;
    return moGoc.apply(window, arguments);
  };
})();
