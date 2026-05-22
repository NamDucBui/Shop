const express         = require('express')
const router          = express.Router()
const OrderController = require('../controllers/order.controller')
const authMiddleware  = require('../middlewares/auth.middleware')
const roleMiddleware  = require('../middlewares/role.middleware')
const validate        = require('../middlewares/validate.middleware')
const {updateOrderStatusSchema} = require('../validations/order.validations')

router.use(authMiddleware)

router.post('/', OrderController.createOrder.bind(OrderController))
router.get('/my', OrderController.getMyOrders.bind(OrderController))
router.get('/:id', OrderController.getOrderById.bind(OrderController))
router.patch('/:id/cancel', OrderController.cancelOrder.bind(OrderController))

router.get('/', 
    roleMiddleware('admin'),
    OrderController.getAllOrders.bind(OrderController)
)

router.patch('/:id/status', 
    roleMiddleware('admin'),
    validate(updateOrderStatusSchema),
    OrderController.updateStatus.bind(OrderController)
)

module.exports = router