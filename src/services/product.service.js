const prisma = require("../lib/prisma")
const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')
const ExcelJS = require('exceljs')
const cloudinary = require('cloudinary').v2

const uploadExcelImageToCloudinary = (fileBuffer, ext) => {
    return new Promise((resolve, reject) => {
        const options = { folder: 'products' };
        if (ext === 'webp') options.format = 'webp';

        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (result) resolve(result.secure_url);
            else reject(error);
        });
        stream.end(fileBuffer);
    });
};

class ProductService {
    async getAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit
        const take = parseInt(limit)

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                skip: skip,
                take: take,
                orderBy: { id: 'desc' }
            }),
            prisma.products.count()
        ])
        return {
            products,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        }
    }

    async getById(id) {
        return await prisma.products.findUnique({
            where: { id }
        })
    }

    async getByCategory(categoryId, page = 1, limit = 10) {
        const skip = (page - 1) * limit
        const take = parseInt(limit)
        const whereClause = { category_id: parseInt(categoryId) }
        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: whereClause,
                skip: skip,
                take: take,
                orderBy: { id: 'desc' }
            }),
            prisma.products.count({
                where: whereClause
            })
        ]);

        return {
            products,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        };
    }

    async create(data) {
        return await prisma.products.create({
            data: {
                name: data.name,
                price: parseFloat(data.price),
                stock: parseInt(data.stock),
                category_id: parseInt(data.category_id),
                image: data.image
            }
        })
    }

    async update(id, data, imageUrl) {
        if (imageUrl) {
            const existing = await prisma.products.findUnique({ where: { id } })
            if (existing?.image) {
                const oldPath = path.join('uploads/products', path.basename(existing.image))
                if (existing?.image && existing.image.includes('cloudinary')) {
                    const publicId = existing.image.split('/').pop().split('.')[0]
                    await cloudinary.uploader.destroy(`products/${publicId}`)
                }
            }
        }
        return await prisma.products.update({
            where: { id },
            data: {
                ...data,
                price: data.price ? parseFloat(data.price) : undefined,
                stock: data.stock ? parseInt(data.stock) : undefined,
                category_id: data.category_id ? parseInt(data.category_id) : undefined,
                image: imageUrl ?? undefined
            }
        })
    }

    async delete(id) {
        return await prisma.products.delete({
            where: { id }
        })
    }

    async importExcelWithEmbeddedImages(fileBuffer) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên

        const productsData = [];

        // Chặng 1: Quét dữ liệu chữ từ dòng số 2 (bỏ qua tiêu đề)
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;

            const name = row.getCell(1).value ? String(row.getCell(1).value).trim() : '';
            const price = parseFloat(row.getCell(2).value || 0);
            const stock = parseInt(row.getCell(3).value || 0);
            const category_id = parseInt(row.getCell(4).value || 0);

            if (name) {
                productsData.push({
                    rowNumber, // Giữ lại để dò khớp ảnh ở Chặng 2
                    name,
                    price: isNaN(price) ? 0 : price,
                    stock: isNaN(stock) ? 0 : stock,
                    category_id: isNaN(category_id) ? null : category_id,
                    image: null // Mặc định chưa có ảnh
                });
            }
        });

        // Chặng 2: Bóc tách hình ảnh trong ô và đẩy thẳng lên Cloudinary
        const embeddedImages = worksheet.getImages();

        for (const img of embeddedImages) {
            const imageObj = workbook.getImage(img.imageId);
            // Tính toán vị trí dòng và cột chứa ảnh (exceljs tính từ 0 nên phải + 1)
            const imageRowInExcel = Math.floor(img.range.tl.row) + 1;
            const imageColInExcel = Math.floor(img.range.tl.col) + 1;

            // Kiểm tra nếu ảnh nằm đúng ở cột 5 (Cột E) và có dữ liệu nhị phân
            if (imageColInExcel === 5 && imageObj.buffer) {
                try {
                    const ext = imageObj.extension || 'jpg';
                    // TỰ ĐỘNG ĐẨY BUFFER ẢNH LÊN MÂY CLOUDINARY
                    const cloudinaryUrl = await uploadExcelImageToCloudinary(imageObj.buffer, ext);

                    // Tìm sản phẩm thuộc dòng này để gán link mây vào
                    const productAtRow = productsData.find(p => p.rowNumber === imageRowInExcel);
                    if (productAtRow) {
                        productAtRow.image = cloudinaryUrl;
                    }
                } catch (err) {
                    console.error(`Lỗi khi đẩy ảnh tại dòng ${imageRowInExcel} lên Cloudinary:`, err);
                }
            }
        }

        // Chặng 3: Loại bỏ thuộc tính tạm rowNumber và tiến hành Bulk Insert qua Prisma
        const finalProducts = productsData.map(({ rowNumber, ...rest }) => rest);

        if (finalProducts.length === 0) {
            throw new Error("File Excel trống hoặc không có sản phẩm hợp lệ!");
        }

        return await prisma.products.createMany({
            data: finalProducts,
            skipDuplicates: true
        });
    }
}

module.exports = new ProductService()