const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/product.controller')

router.get('/', ProductController.getAll.bind(ProductController))
router.get('/:id', ProductController.getById.bind(ProductController))
router.post('/', ProductController.create.bind(ProductController))
router.put('/:id', ProductController.update.bind(ProductController))
router.put('/:id', ProductController.delete.bind(ProductController))

module.exports = router