const prisma = require("../lib/prisma")
const fs = require('fs')
const path = require('path')

class ProductService{
    async getAll(){
        return await prisma.products.findMany()
    }

    async getById(id){
        return await prisma.products.findUnique({
            where: {id}
        })
    }

    async getByCategory(categoryId) {
        return await prisma.products.findMany({
            where: {
                category_id: parseInt(categoryId)
            },
        })
    }

    async create(data){
        return await prisma.products.create({
            data: {
                name: data.name, 
                price: parseFloat(data.price), 
                stock: parseInt(data.stock), 
                category_id: parseInt(data.category_id), 
                image: data.image}
        })
    }

    async update(id, data, imageUrl) {
        if(imageUrl){
            const existing = await prisma.products.findUnique({where: {id}})
            if(existing?.image){
                const oldPath = path.join('uploads/products', path.basename(existing.image))
                if(fs.existsSync(oldPath)){
                    fs.unlinkSync(oldPath)
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

    async delete(id){
        return await prisma.products.delete({
            where: {id}
        })
    }
}

module.exports = new ProductService()