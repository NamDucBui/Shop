const prisma = require("../lib/prisma");
const AppError = require("../utils/appError");

class CartService{

    // Lấy hoặc tạo cart cho user
    async getOrCreateCart(userId){
        let cart = await prisma.carts.findUnique({
            where: {user_id: userId}
        })

        if(!cart){
            cart = await prisma.carts.create({
                data: {user_id: userId}
            })
        }
        return cart
    }

    // Lấy giỏ hàng + items
    async getCart(userId){
        const cart = await prisma.carts.findUnique({
            where: {user_id: userId},
            include: {
                cart_items: {
                    include: {
                        products: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                stock: true
                            }
                        }
                    }
                }
            }
        })
        if(!cart) return {items: []}

        // Toàn bộ cart
        return {...cart}
    }

    // Thêm sản phẩm vào giỏ
    async addToCard(userId, data){

        // Kiểm tra sản phẩm tồn tại + còn hàng
        const product = await prisma.products.findUnique({
            where: {id: data.product_id}
        })

        if(!product){
            throw new AppError('Sản phẩm không tồn tại', 404)
        }

        if(product.stock < data.quantity){
            throw new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho`, 400)
        }

        // Lấy hoặc tạo cart
        const cart = await this.getOrCreateCart(userId)

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const existingItem = await prisma.cart_items.findUnique({
            where: {
                cart_id_product_id: {
                    cart_id: cart.id,
                    product_id: data.product_id
                }
            }
        })
        if(existingItem){
            // Đã có => tăng quantity
            const newQuantity = existingItem.quantity + data.quantity
            if(product.stock < newQuantity) {
                throw new AppError(`Chỉ còn ${product.stock} sản phẩm trong kho`, 400)
            }

            return await prisma.cart_items.update({
                where: {
                    cart_id_product_id: {
                        cart_id: cart.id,
                        product_id: data.product_id
                    }
                },
                data: {quantity: newQuantity}
            })
        }

        // Chưa có => thêm mới
        return await prisma.cart_items.create({
            data: {
                cart_id: cart.id,
                product_id: data.product_id,
                quantity: data.quantity
            }
        })
    }

    // Update số lượng
    async updateCartItems(userId, productId, quantity){
        const cart = await prisma.carts.findUnique({
            where: {user_id: userId}
        })

        if(!cart){
            throw new AppError('Giỏ hàng không tồn tại', 404)
        }

        // Kiểm tra item có trong giỏ không
        const item = await prisma.cart_items.findUnique({
            where: { 
                cart_id_product_id: {
                    cart_id: cart.id,
                    product_id: productId
                }
            }
        })
        if(!item) {
            throw new AppError('Sản phẩm không có trong giỏ hàng', 404)
        }

        // Kiểm tra stock
        const products = await prisma.products.findUnique({
            where: {id: productId}
        })
        if(products.stock < quantity) {
            throw new AppError(`Chỉ còn ${products.stock} sản phẩm trong kho`, 400)
        }

        return await prisma.cart_items.update({
            where: {
                cart_id_product_id: {
                    cart_id: cart.id,
                    product_id: productId
                }
            },
            data: {quantity}
        })
    }

    // Xóa 1 sản phẩm khỏi giỏ
    async removeFromCart(userId, productId){
        const cart = await prisma.carts.findUnique({
            where: {user_id: userId}
        })
        if(!cart){
            throw new AppError('Giỏ hàng không tồn tại', 404)
        }

        const items = await prisma.cart_items.findUnique({
            where: {
                cart_id_product_id: {
                    cart_id: cart.id,
                    product_id: productId
                }
            }
        })
        if(!items){
            throw new AppError('Sản phẩm không có trong giỏ hàng', 404)
        }

        return await prisma.cart_items.delete({
            where: {
                cart_id_product_id: {
                    cart_id: cart.id,
                    product_id: productId
                }
            }
        })
    }

    // Xóa toàn bộ giỏ hàng
    async clearCart(userId){
        const cart = await prisma.carts.findUnique({
            where: {user_id: userId}
        })
        if(!cart){
            throw new AppError('Giỏ hàng không tồn tại', 404)
        }

        return await prisma.cart_items.deleteMany({
            where: {cart_id: cart.id}
        })
    }
}

module.exports = new CartService()