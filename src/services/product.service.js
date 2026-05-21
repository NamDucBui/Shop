const prisma = require("../lib/prisma")

class ProductService{
    async getAll(){
        return await prisma.products.findMany()
    }

    async getById(id){
        return await prisma.products.findUnique({
            where: {id}
        })
    }

    async create(data){
        return await prisma.products.create({
            data: {name: data.name, price: data.price, stock: data.stock, category_id: data.category_id}
        })
    }

    async update(id, data) {
        return await prisma.products.update({
            where: { id },
            data
        })
    }

    async delete(id){
        return await prisma.products.delete({
            where: {id}
        })
    }
}

module.exports = new ProductService()