const express = require('express')
const route = express.Router()
const AuthController = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')
const {registerSchema, loginSchema} = require('../validations/auth.validation')

route.post('/register', validate(registerSchema), AuthController.register.bind(AuthController))
route.post('/login', validate(loginSchema), AuthController.login.bind(AuthController))
route.post('/logout', authMiddleware, AuthController.logout.bind(AuthController))

module.exports = route