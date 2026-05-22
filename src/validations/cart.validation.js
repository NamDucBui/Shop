const {z} = require('zod')

const addToCartSchema = z.object({
    product_id: z.number().int().positive('Product ID không hợp lệ'),
    quantity: z.number().int().min(1,'Số lượng ít nhất là 1').default(1)
})

const updateCartSchema = z.object({
    quantity: z.number().int().min(1,'Số lượng ít nhất là 1').default(1)
})

module.exports = {addToCartSchema, updateCartSchema}