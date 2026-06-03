const ProductService = require('../services/product.service')

class ProductController {

    async getAll(req, res) {
        try {

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10

            const products = await ProductService.getAll(page, limit)
            res.json(products)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async getById(req, res) {
        try {
            const id = parseInt(req.params.id)
            const product = await ProductService.getById(id)

            if (!product) {
                return res.status(404).json({ message: "Không tìm thấy product" })
            }

            res.json(product)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async getByCategory(req, res) {
        try {
            const { categoryId } = req.params;

            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10

            const products = await ProductService.getByCategory(categoryId, page, limit)
            if (!products) {
                return res.status(404).json({ message: "Không tìm thấy product" })
            }
            res.json(products)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async create(req, res) {
        try {
            const imageUrl = req.file ? (req.file.path || `/uploads/products/${req.file.filename}`) : null;

            const productData = {
                ...req.validatedData,
                image: imageUrl
            }
            const product = await ProductService.create(productData)
            res.status(201).json(product)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async update(req, res) {
        try {
            const id = parseInt(req.params.id)
            const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

            const existing = await ProductService.getById(id)
            if (!existing) {
                return res.status(404).json({ message: "Không tìm thấy product" })
            }

            const product = await ProductService.update(id, req.validatedData, imageUrl)
            res.json(product)
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async delete(req, res) {
        try {
            const id = parseInt(req.params.id)

            const existing = await ProductService.getById(id)
            if (!existing) {
                return res.status(404).json({ message: "Không tìm thấy product" })
            }

            await ProductService.delete(id)
            res.json({ message: "Xóa thành công" })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }

    async importExcelWithImages(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Vui lòng tải lên file Excel!" });
            }

            // Gọi hàm xử lý bóc tách text + image từ service
            const result = await ProductService.importExcelWithEmbeddedImages(req.file.buffer);

            res.status(200).json({
                message: `Nhập dữ liệu thành công! Đã thêm ${result.count} sản phẩm bao gồm cả hình ảnh đính kèm.`,
                count: result.count
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ProductController()