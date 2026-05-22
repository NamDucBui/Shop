const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/product.controller')
const validate = require('../middlewares/validate.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')
const {createProductSchema, updateProductSchema } = require('../validations/product.validation')

router.get('/', ProductController.getAll.bind(ProductController))
router.get('/:id', ProductController.getById.bind(ProductController))
router.post('/',
    authMiddleware,
    roleMiddleware('admin'),
    validate(createProductSchema), ProductController.create.bind(ProductController))
router.put('/:id',
    authMiddleware,
    roleMiddleware('admin'),
    validate(updateProductSchema), ProductController.update.bind(ProductController))
router.delete('/:id',
    authMiddleware,
    roleMiddleware('admin'),
    ProductController.delete.bind(ProductController))

module.exports = router