/**
 * Địa chỉ API cho bản tĩnh.
 *
 * Trỏ sang Cloudflare Worker riêng nên web chạy độc lập, không phụ thuộc
 * tshbeli.com.vn. Engine trong Worker đã đối chiếu khớp 100% với API gốc.
 *
 * Muốn quay lại dùng API của site gốc thì đổi thành 'https://tshbeli.com.vn'.
 */
window.BELI_API_BASE = 'https://beli-api.myluu-190193.workers.dev';
