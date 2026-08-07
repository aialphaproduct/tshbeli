# Beli — Thần Số học tỉnh thức

Bản dựng lại của tshbeli.com.vn: giao diện tĩnh chạy trên GitHub Pages, phần
tính toán chạy trên Cloudflare Worker.

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `index.html` | Tra cứu bản đồ cuộc đời cho một người |
| `tra-cuu-cap-doi.html` | Tra cứu cặp đôi |
| `assets/js/beli-config.js` | Địa chỉ API (Cloudflare Worker) |
| `assets/js/beli-tracuu-don.js` | Giao diện bản đồ cá nhân |
| `assets/js/beli-tracuu-capdoi.js` | Giao diện bản đồ cặp đôi |
| `assets/js/beli-static.js` | Lớp đệm cho bản tĩnh (tải ảnh về máy, bỏ bước xác thực) |

Mã nguồn Worker nằm ở kho riêng `tshbeli-api`.

## Đổi địa chỉ API

Sửa `assets/js/beli-config.js`:

```js
window.BELI_API_BASE = 'https://beli-api.myluu-190193.workers.dev';
```

## Chạy thử tại máy

```bash
npx serve -l 5183 .
```

Mở http://localhost:5183

## Triển khai

Đẩy nhánh `main` lên GitHub rồi bật **Settings → Pages → Deploy from a branch →
main / (root)**. File `.nojekyll` đảm bảo GitHub Pages không bỏ qua thư mục
`assets`.
