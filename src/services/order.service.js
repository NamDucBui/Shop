const prisma = require('../lib/prisma')

class OrderService {

    // Tạo đơn hàng từ giỏ hàng
    async createOrder(userId) {
        return await prisma.$transaction(async (tx) => {

            // B1 - Lấy giỏ hàng
            const cart = await tx.carts.findUnique({
                where: {user_id: userId},
                include: {
                    cart_items: {
                        include: {products: true}
                    }
                }
            })
            if(!cart || cart.cart_items.length === 0){
                throw new Error('Giỏ hàng trống')
            }

            // B2 - Tính tổng tiền
            const total = cart.cart_items.reduce((sum, item) => {
                return sum + Number(item.products.price) * item.quantity
            }, 0)

            // B3 - Tạo order
            const order = await tx.orders.create({
                data: {
                    user_id: userId,
                    total,
                    status: 'pending',
                    order_items: {
                        create: cart.cart_items.map(item => ({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            price: item.products.price
                        }))
                    }
                },
                include: {
                    order_items: {
                        include: {
                            products: {
                                select: {id: true, name: true}
                            }
                        }
                    }
                }
            })

            // B5 - Trừ stock
            for(const item of cart.cart_items){
                await tx.products.update({
                    where: {id: item.product_id},
                    data: {stock: { decrement: item.quantity}}
                })
            }

            // B6 - Xóa giỏ hàng
            await tx.cart_items.deleteMany({
                where: {cart_id: cart.id}
            })

            return order
        })
    }

    // Lấy lịch sử đơn hàng của user
    async getMyOrders(userId){
        return await prisma.orders.findMany({
            where: {user_id: userId},
            include: {
                order_items: {
                    include: {
                        products: {
                            select: {id: true, name: true, price: true}
                        }
                    }
                }
            },
            orderBy: {id: 'desc'}
        })
    }

    // Lấy chi tiết 1 đơn hàng
    async getOrderById(orderId, userId, role){ 
        const order = await prisma.orders.findUnique({
            where: {id: orderId},
            include: {
                users: {
                    select: {id: true, name: true, email: true}
                },
                order_items: {
                    include: {
                        products: {
                            select: {id: true, name: true, price: true}
                        }
                    }
                }
            }
        })
        if(!order){
            throw new Error("Không tìm thấy đơn hàng")
        }

        // User chỉ xem đơn của mình
        if(role !== 'admin' && order.user_id !== userId){
            throw new Error("Không có quyền xem đơn hàng này")
        }

        return order
    }

    // Admin lấy tất cả đơn hàng
    async getAllOrders(query){
        const {status, page = 1, limit = 10} = query

        const where = status ? {status} : {}

        const [orders, total] = await Promise.all([
            prisma.orders.findMany({
                where,
                include: {
                    users: {
                        select: {id: true, name: true, email: true}
                    },
                    order_items: {
                        include:{
                            products: {
                                select: {id: true, name: true}
                            }
                        }
                    }
                },
                orderBy: {id: 'desc'},
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.orders.count({where})
        ])

        return {
            data: orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total/limit)
        }
    }

    // Cập nhật status - Admin
    async updateStatus (orderId, status) {
        const order = await prisma.orders.findUnique({
            where: {id: orderId}
        })
        if(!order){
            throw new Error('Không tìm thấy đơn hàng')
        }

        // Không thể thay đổi đơn đã cancell/deli
        if(['cancelled', 'delivered'].includes(order.status)){
            throw new Error(`Không thể thay đổi đơn hàng đã ${order.status}`)
        }

        return await prisma.orders.update({
            where: {id: orderId},
            data: {status}
        })
    }

    // Hủy đơn - User
    async cancelOrder(orderId, userId){
        return await prisma.$transaction(async (tx) => {
            const order = await tx.orders.findUnique({
                where: {id: orderId},
                include: {order_items: true}
            })
            if(!order){
                throw new Error("Không tìm thấy đơn hàng")
            }
            if(order.user_id !== userId){
                throw new Error("Không có quyền hủy đơn hàng này")
            }
            if(order.status !== 'pending'){
                throw new Error("Chỉ hủy được đơn hàng đang chờ xử lý")
            }

            // Hoàn lại stock
            for(const item of order.order_items){
                await tx.products.update({
                    where: {id: item.product_id},
                    data: {stock: {increment: item.quantity}}
                })
            }

            return await tx.orders.update({
                where: {id: orderId},
                data: {status: 'cancelled'}
            })
        })
    }
}

module.exports = new OrderService()