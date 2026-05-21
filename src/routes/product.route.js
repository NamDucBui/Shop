const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/product.controller')
const validate = require('../middlewares/validate.middleware')
const {createProductSchema, updateProductSchema } = require('../validations/product.validation')

router.get('/', ProductController.getAll.bind(ProductController))
router.get('/:id', ProductController.getById.bind(ProductController))
router.post('/',validate(createProductSchema), ProductController.create.bind(ProductController))
router.put('/:id',validate(updateProductSchema), ProductController.update.bind(ProductController))
router.delete('/:id', ProductController.delete.bind(ProductController))

module.exports = router