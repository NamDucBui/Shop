const {z} = require('zod')

const createCategorySchema = z.object({
    name: z.string()
        .min(1, 'Tên không được để trống')
        .max(100, 'Tên không được quá 100 ký tự')
})

const updateCategorySchema = z.object({
    name: z.string()
        .min(1, 'Tên không được để trống')
        .max(100, 'Tên không được quá 100 ký tự')
})

module.exports = {createCategorySchema, updateCategorySchema}