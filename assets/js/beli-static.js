/**
 * Lớp đệm cho bản tĩnh.
 *
 * Bản gốc lưu ảnh "Chia sẻ" lên máy chủ WordPress rồi mở đường dẫn ảnh. Ở đây
 * không có nơi lưu nên chặn lời gọi đó lại và tải thẳng ảnh về máy người dùng.
 */
(function () {
  // Bản gốc chặn tra cứu khi chưa xác thực; bản tĩnh mở cho mọi người, và
  // trang "Tra cứu cặp đôi" có thể được mở thẳng nên phải tự đặt sẵn giá trị.
  // Trang chủ gọi localStorage.clear() lúc ready nên phải đặt lại sau đó nữa.
  function datMacDinh() {
    try {
      if (!localStorage.getItem('userType')) localStorage.setItem('userType', 'khach');
      if (!localStorage.getItem('typeMapSearchList')) {
        localStorage.setItem('typeMapSearchList', 'BẢN ĐỒ CUỘC ĐỜI BELI');
      }
    } catch (e) {
      /* trình duyệt chặn localStorage thì bỏ qua */
    }
  }
  datMacDinh();

  if (!window.jQuery) return;
  var $ = window.jQuery;
  $(datMacDinh);
  $(document).on('submit', 'form', datMacDinh);

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
