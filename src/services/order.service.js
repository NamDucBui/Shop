const prisma = require('../lib/prisma')
const AppError = require('../utils/appError')

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

            // B2 - Kiểm tra stock từng sản phẩm
            for(const item of cart.cart_items) {
                if(item.products.stock < item.quantity){
                    throw new Error(`${item.products.name} chỉ còn ${item.products.stock} sản phẩm`)
                }
            }

            // B3 - Tính tổng tiền
            const total = cart.cart_items.reduce((sum, item) => {
                return sum + Number(item.products.price) * item.quantity
            }, 0)

            // B4 - Tạo order
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

            // B6 - Trừ stock
            for(const item of cart.cart_items){
                await tx.products.update({
                    where: {id: item.product_id},
                    data: {stock: { decrement: item.quantity}}
                })
            }

            // B7 - Xóa giỏ hàng
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
            throw new AppError("Không tìm thấy đơn hàng", 404)
        }

        // User chỉ xem đơn của mình
        if(role !== 'admin' && order.user_id !== userId){
            throw new AppError("Không có quyền xem đơn hàng này", 403)
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
            throw new AppError('Không tìm thấy đơn hàng', 404)
        }

        // Không thể thay đổi đơn đã cancell/deli
        if(['cancelled', 'delivered'].includes(order.status)){
            throw new AppError(`Không thể thay đổi đơn hàng đã ${order.status}`, 400)
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
                throw new AppError("Không tìm thấy đơn hàng", 404)
            }
            if(order.user_id !== userId){
                throw new AppError("Không có quyền hủy đơn hàng này", 403)
            }
            if(order.status !== 'pending'){
                throw new AppError("Chỉ hủy được đơn hàng đang chờ xử lý", 400)
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