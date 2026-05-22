const CartService = require('../services/cart.service')

class CartController {
    async getCart(req, res) {
        try {
            const cart = await CartService.getCart(req.user.id)
            res.json(cart)
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }

    async addToCart(req, res) {
        try {
            const item = await CartService.addToCard(req.user.id, req.validatedData)
            res.status(201).json({message: 'Thêm vào giỏ hàng thành công', item})
        } catch (error) {
            const status = error.message.includes('không tồn tại') ? 404 : 400
            res.status(status).json({message: error.message})
        }
    }

    async updateCartItem(req, res) {
        try {
            const productId = parseInt(req.params.productId)
            const {quantity} = req.validatedData

            const item = await CartService.updateCartItems(req.user.id, productId, quantity)
            res.json({message: "Cập nhật giỏ hàng thành công", item})
        } catch (error) {
            const status = error.message.includes('không') ? 404 : 400
            res.status(status).json({message: error.message})
        }
    }

    async removeFromCart(req, res) {
        try {
            const productId = parseInt(req.params.productId)
            await CartService.removeFromCart(req.user.id, productId)
            res.json({message: 'Xóa sản phẩm khỏi giỏ hàng thành công'})
        } catch (error) {
            res.status(404).json({message: error.message})
        }
    }

    async clearCart(req, res) {
        try {
            await CartService.clearCart(req.user.id)
            res.json({message: 'Xóa toàn bộ giỏ hàng thành công'})
        } catch (error) {
            res.status(500).json({message: error.message})
        }
    }
}

module.exports = new CartController()