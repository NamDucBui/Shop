const { sendOrderConfirmation } = require('../services/email.service')
const OrderService = require('../services/order.service')
const AppError = require('../utils/appError')

class OrderController {

    // Tạo đơn (Hỗ trợ cả đặt từ Giỏ hàng và Mua ngay trực tiếp)
    async createOrder(req, res) {
        try {
            const { product_id, quantity } = req.body;
            let directItem = null;

            // Nếu phía Client gửi kèm product_id lên -> Đây là TH "Mua ngay"
            if (product_id) {
                directItem = {
                    product_id: parseInt(product_id),
                    quantity: parseInt(quantity) || 1
                };
            }

            // Gọi service xử lý (Truyền thêm directItem nếu có)
            const order = await OrderService.createOrder(req.user.id, directItem)

            // Gửi email xác nhận đơn hàng (chạy bất đồng bộ nền)
            if (req.user.email) {
                sendOrderConfirmation(req.user.email, order)
                    .catch(err => console.error("Lỗi gửi email:", err))
            }


            res.status(201).json({
                message: 'Đặt hàng thành công',
                order
            })
        } catch (error) {
            // Đổi fallback mặc định thành 400 (BadRequest) thay vì 500 nếu Service ném ra lỗi thường (Error)
            const status = error instanceof AppError ? error.statusCode : 400
            res.status(status).json({ message: error.message })
        }
    }

    // Lịch sử đơn hàng
    async getMyOrders(req, res) {
        try {
            const orders = await OrderService.getMyOrders(req.user.id)
            res.json(orders)
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({ message: error.message })
        }
    }

    // Chi tiết đơn hàng
    async getOrderById(req, res) {
        try {
            const order = await OrderService.getOrderById(
                parseInt(req.params.id),
                req.user.id,
                req.user.role
            )
            res.json(order)
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({ message: error.message })
        }
    }

    // Admin lấy tất cả
    async getAllOrders(req, res) {
        try {
            const result = await OrderService.getAllOrders(req.query)
            res.json(result)
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({ message: error.message })
        }
    }

    // Admin update status
    async updateStatus(req, res) {
        try {
            const order = await OrderService.updateStatus(
                parseInt(req.params.id),
                req.body.status
            )
            res.json({ message: 'Cập nhật trạng thái đơn hàng thành công', order })
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({ message: error.message })
        }
    }

    // User hủy đơn
    async cancelOrder(req, res) {
        try {
            const order = await OrderService.cancelOrder(
                parseInt(req.params.id),
                req.user.id
            )
            res.json({ message: "Hủy đơn hàng thành công", order })
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({ message: error.message })
        }
    }
}

module.exports = new OrderController()