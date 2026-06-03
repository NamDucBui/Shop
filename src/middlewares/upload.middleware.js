// src/middlewares/upload.middleware.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Cấu hình xác thực tài khoản Cloudinary từ file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình bộ lưu trữ Cloudinary Storage cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Tên thư mục chứa ảnh sản phẩm trên Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Các định dạng ảnh cho phép
    transformation: [{ width: 600, height: 600, crop: 'limit' }], // Tự động tối ưu/nén kích thước ảnh khi upload để tiết kiệm dung lượng
  },
});

// 3. Tạo middleware upload
const upload = multer({ storage: storage });

module.exports = upload;