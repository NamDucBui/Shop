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
            const {name, price, stock, category_id} = req.body
            
            if(!name){
                return res.status(400).json({message: "Thiếu tên product"})
            } 
            else if(!price){
                return res.status(400).json({message: "Thiếu giá product"})
            }
            else if(!stock){
                return res.status(400).json({message: "Thiếu số lượng product"})
            }
            else if(!category_id){
                return res.status(400).json({message: "Thiếu category"})
            }

            const product = await ProductService.create({name, price, stock, category_id})
            res.status(201).json(product)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async update(req, res){
        try {
            const id = parseInt(req.params.id)
            const {name, price, stock, category_id} = req.body

            if(!name){
                return res.status(400).json({message: "Thiếu tên product"})
            } 
            else if(!price){
                return res.status(400).json({message: "Thiếu giá product"})
            }
            else if(!stock){
                return res.status(400).json({message: "Thiếu số lượng product"})
            }
            else if(!category_id){
                return res.status(400).json({message: "Thiếu category"})
            }

            const existing = await ProductService.getById(id)
            if(!existing){
                return res.status(404).json({message: "Không tìm thấy product"})
            }

            const product = await ProductService.update(id, {name, price, stock, category_id})
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