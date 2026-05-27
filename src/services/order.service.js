const prisma = require('../lib/prisma')
const AppError = require('../utils/appError')

class OrderService {

    // Tạo đơn hàng từ giỏ hàng
    // Thay vì chỉ nhận userId, ta nhận thêm directItem nếu là "Mua ngay"
    async createOrder(userId, directItem = null) {
        return await prisma.$transaction(async (tx) => {

            let itemsToOrder = [];

            // TRƯỜNG HỢP 1: NGƯỜI DÙNG BẤM "MUA NGAY" TRÊN FRONT-END
            if (directItem) {
                // directItem dạng: { product_id: 29, quantity: 1 }
                const product = await tx.products.findUnique({
                    where: { id: directItem.product_id }
                });

                if (!product) {
                    throw new AppError('Sản phẩm không tồn tại', 404);
                }
                if (product.stock < directItem.quantity) {
                    throw new AppError(`${product.name} chỉ còn ${product.stock} sản phẩm`, 400);
                }

                // Gán thông tin cấu trúc giống hệt như lấy từ cart_items để dùng chung logic bên dưới
                itemsToOrder.push({
                    product_id: product.id,
                    quantity: directItem.quantity,
                    price: product.price,
                    products: product
                });

                // TRƯỜNG HỢP 2: CHECKOUT TỪ GIỎ HÀNG (Code cũ của bạn)
            } else {
                const cart = await tx.carts.findUnique({
                    where: { user_id: userId },
                    include: {
                        cart_items: {
                            include: { products: true }
                        }
                    }
                });

                if (!cart || cart.cart_items.length === 0) {
                    throw new AppError('Giỏ hàng trống', 400);
                }

                // Kiểm tra stock từng sản phẩm trong giỏ
                for (const item of cart.cart_items) {
                    if (item.products.stock < item.quantity) {
                        throw new AppError(`${item.products.name} chỉ còn ${item.products.stock} sản phẩm`, 400);
                    }
                }

                itemsToOrder = cart.cart_items;
            }

            // B3 - Tính tổng tiền (Dùng chung cho cả 2 trường hợp)
            const total = itemsToOrder.reduce((sum, item) => {
                return sum + Number(item.products.price) * item.quantity;
            }, 0);

            // B4 - Tạo order
            const order = await tx.orders.create({
                data: {
                    user_id: userId,
                    total,
                    status: 'pending',
                    order_items: {
                        create: itemsToOrder.map(item => ({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            price: item.products.price // Chụp lại giá tại thời điểm mua
                        }))
                    }
                },
                include: {
                    order_items: {
                        include: {
                            products: { select: { id: true, name: true } }
                        }
                    }
                }
            });

            // B6 - Trừ stock sản phẩm
            for (const item of itemsToOrder) {
                await tx.products.update({
                    where: { id: item.product_id },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // B7 - Xóa giỏ hàng (CHỈ thực hiện nếu user thanh toán từ nút trong Giỏ Hàng)
            if (!directItem) {
                const cart = await tx.carts.findUnique({ where: { user_id: userId } });
                await tx.cart_items.deleteMany({
                    where: { cart_id: cart.id }
                });
            }

            return order;
        });
    }

    // Lấy lịch sử đơn hàng của user
    async getMyOrders(userId) {
        return await prisma.orders.findMany({
            where: { user_id: userId },
            include: {
                order_items: {
                    include: {
                        products: {
                            select: { id: true, name: true, price: true }
                        }
                    }
                }
            },
            orderBy: { id: 'desc' }
        })
    }

    // Lấy chi tiết 1 đơn hàng
    async getOrderById(orderId, userId, role) {
        const order = await prisma.orders.findUnique({
            where: { id: orderId },
            include: {
                users: {
                    select: { id: true, name: true, email: true }
                },
                order_items: {
                    include: {
                        products: {
                            select: { id: true, name: true, price: true }
                        }
                    }
                }
            }
        })
        if (!order) {
            throw new AppError("Không tìm thấy đơn hàng", 404)
        }

        // User chỉ xem đơn của mình
        if (role !== 'admin' && order.user_id !== userId) {
            throw new AppError("Không có quyền xem đơn hàng này", 403)
        }

        return order
    }

    // Admin lấy tất cả đơn hàng
    async getAllOrders(query) {
        const { status, page = 1, limit = 10 } = query

        const where = status ? { status } : {}

        const [orders, total] = await Promise.all([
            prisma.orders.findMany({
                where,
                include: {
                    users: {
                        select: { id: true, name: true, email: true }
                    },
                    order_items: {
                        include: {
                            products: {
                                select: { id: true, name: true }
                            }
                        }
                    }
                },
                orderBy: { id: 'desc' },
                skip: (page - 1) * limit,
                take: parseInt(limit)
            }),
            prisma.orders.count({ where })
        ])

        return {
            data: orders,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        }
    }

    // Cập nhật status - Admin
    async updateStatus(orderId, status) {
        const order = await prisma.orders.findUnique({
            where: { id: orderId }
        })
        if (!order) {
            throw new AppError('Không tìm thấy đơn hàng', 404)
        }

        // Không thể thay đổi đơn đã cancell/deli
        if (['cancelled', 'delivered'].includes(order.status)) {
            throw new AppError(`Không thể thay đổi đơn hàng đã ${order.status}`, 400)
        }

        return await prisma.orders.update({
            where: { id: orderId },
            data: { status }
        })
    }

    // Hủy đơn - User
    async cancelOrder(orderId, userId) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.orders.findUnique({
                where: { id: orderId },
                include: { order_items: true }
            })
            if (!order) {
                throw new AppError("Không tìm thấy đơn hàng", 404)
            }
            if (order.user_id !== userId) {
                throw new AppError("Không có quyền hủy đơn hàng này", 403)
            }
            if (order.status !== 'pending') {
                throw new AppError("Chỉ hủy được đơn hàng đang chờ xử lý", 400)
            }

            // Hoàn lại stock
            for (const item of order.order_items) {
                await tx.products.update({
                    where: { id: item.product_id },
                    data: { stock: { increment: item.quantity } }
                })
            }

            return await tx.orders.update({
                where: { id: orderId },
                data: { status: 'cancelled' }
            })
        })
    }
}

module.exports = new OrderService()