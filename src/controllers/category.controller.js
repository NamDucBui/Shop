const CategoryService = require('../services/category.service')

class CategoryController{

    async getAll(req, res) {
        try {
            const categories = await CategoryService.getAll()
            res.json(categories)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async getById(req, res) {
        try {
            const id = parseInt(req.params.id)
            const category = await CategoryService.getById(id)

            if(!category){
                return res.status(404).json({message: "Không tìm thấy category"})
            }

            res.json(category)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async create(req, res) {
        try {
            const category = await CategoryService.create(req.validatedData)
            res.status(201).json(category)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async update(req, res){
        try {
            const id = parseInt(req.params.id)

            const existing = await CategoryService.getById(id)
            if(!existing){
                return res.status(404).json({message: "Không tìm thấy category"})
            }

            const category = await CategoryService.update(id, req.validatedData)
            res.json(category)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async delete(req, res){
        try {
            const id = parseInt(req.params.id)

            const existing = await CategoryService.getById(id)
            if(!existing){
                return res.status(404).json({message: "Không tìm thấy category"})
            }

            await CategoryService.delete(id)
            res.json({message: "Xóa thành công"})
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = new CategoryController()