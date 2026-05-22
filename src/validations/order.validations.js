const {z} = require('zod')

const updateOrderStatusSchema = z.object({
    status: z.enum(
        ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        {message: 'Status không hợp lệ'}
    )
})

module.exports = {updateOrderStatusSchema}

