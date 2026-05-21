const ProductService = require('../services/product.service')

class ProductController{

    async getAll(req, res) {
        try {
            const products = await ProductService.getAll()
            res.json(products)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async getById(req, res) {
        try {
            const id = parseInt(req.params.id)
            const product = await ProductService.getById(id)

            if(!product){
                return res.status(404).json({message: "Không tìm thấy product"})
            }

            res.json(product)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async create(req, res) {
        try {
            const product = await ProductService.create(req.validatedData)
            res.status(201).json(product)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async update(req, res){
        try {
            const id = parseInt(req.params.id)
            

            const existing = await ProductService.getById(id)
            if(!existing){
                return res.status(404).json({message: "Không tìm thấy product"})
            }

            const product = await ProductService.update(id, req.validatedData)
            res.json(product)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async delete(req, res){
        try {
            const id = parseInt(req.params.id)

            const existing = await ProductService.getById(id)
            if(!existing){
                return res.status(404).json({message: "Không tìm thấy product"})
            }

            await ProductService.delete(id)
            res.json({message: "Xóa thành công"})
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = new ProductController()