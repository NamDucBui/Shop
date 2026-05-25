const OrderService = require('../services/order.service')
const AppError = require('../utils/appError')

class OrderController {

    // Tạo đơn
    async createOrder(req, res){
        try {
            const order = await OrderService.createOrder(req.user.id)
            res.status(201).json({
                message: 'Đặt hàng thành công',
                order
            })
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({message: error.message})
        }
    }

    // Lịch sử đơn hàng
    async getMyOrders(req, res){
        try {
            const orders = await OrderService.getMyOrders(req.user.id)
            res.json(orders)
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({message: error.message})
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
            res.status(status).json({message: error.message})
        }
    }

    // Admin lấy tất cả
    async getAllOrders(req, res){
        try {
            const result = await OrderService.getAllOrders(req.query)
            res.json(result)
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({message: error.message})
        }
    }

    // Admin update status
    async updateStatus (req, res) {
        try {
            const order = await OrderService.updateStatus(
                parseInt(req.params.id),
                req.body.status
            )
            res.json({message: 'Cập nhật trạng thái đơn hàng thành công', order})
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({message: error.message})
        }
    }

    // User hủy đơn
    async cancelOrder(req, res){
        try {
            const order = await OrderService.cancelOrder(
                parseInt(req.params.id),
                req.user.id
            )
            res.json({message: "Hủy đơn hàng thành công", order})
        } catch (error) {
            const status = error instanceof AppError ? error.statusCode : 500
            res.status(status).json({message: error.message})
        }
    }
}

module.exports = new OrderController()