const multer = require("multer");
const path = require("node:path");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs')

// Tạo thư mục nếu chưa có
const uploadDir = 'uploads/products'
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true})
}

// Lưu local
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const filename = `${uuidv4()}${ext}`
        cb(null, filename)
    }
})

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp)'), false)
    }
}

const upload = multer({
    storage: localStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

module.exports = upload
