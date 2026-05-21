const {z} = require('zod');

const createProductSchema = z.object({
    name: z.string()
        .min(1, 'Tên sản phẩm không được để trống')
        .max(255, "Tên không được quá 255 ký tự"),

    price: z.coerce.number()
        .positive('Giá phải là số dương'),

    stock: z.coerce.number()
        .int('Số lượng phải là số nguyên')
        .min(0, 'Số lượng không được âm')
        .optional(),

    category_id: z.coerce.number()
        .int('ID danh mục không hợp lệ')
        .optional()
})

const updateProductSchema = z.object({
    name: z.string()
        .min(1, 'Tên sản phẩm không được để trống')
        .max(255, "Tên không được quá 255 ký tự")
        .optional(),

    price: z.coerce.number()
        .positive('Giá phải là số dương')
        .optional(),

    stock: z.coerce.number()
        .int('Số lượng phải là số nguyên')
        .min(0, 'Số lượng không được âm')
        .optional(),

    category_id: z.coerce.number()
        .int('ID danh mục không hợp lệ')
        .optional()
})

module.exports = {createProductSchema, updateProductSchema}
