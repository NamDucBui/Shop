const express = require('express')
const route = express.Router()
const CartController = require('../controllers/cart.controller')
const validate = require('../middlewares/validate.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const {addToCartSchema, updateCartSchema} = require('../validations/cart.validation')

route.use(authMiddleware)

route.get('/', CartController.getCart.bind(CartController))
route.post('/', validate(addToCartSchema), CartController.addToCart.bind(CartController))
route.put('/:productId', validate(updateCartSchema), CartController.updateCartItem.bind(CartController))
route.delete('/:productId', CartController.removeFromCart.bind(CartController))
route.delete('/', CartController.clearCart.bind(CartController))

module.exports = route