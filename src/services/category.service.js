const prisma = require("../lib/prisma")

class CategoryService{
    async getAll(){
        return await prisma.categories.findMany()
    }

    async getById(id){
        return await prisma.categories.findUnique({
            where: {id}
        })
    }

    async create(data){
        return await prisma.categories.create({
            data: {name: data.name}
        })
    }

    async delete(id){
        return await prisma.categories.delete({
            where: {id}
        })
    }
}

module.exports = new CategoryService()