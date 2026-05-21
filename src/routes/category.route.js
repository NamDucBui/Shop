const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/category.controller')

router.get('/', CategoryController.getAll.bind(CategoryController))
router.get('/:id', CategoryController.getById.bind(CategoryController))
router.post('/', CategoryController.create.bind(CategoryController))
router.put('/:id', CategoryController.update.bind(CategoryController))
router.put('/:id', CategoryController.delete.bind(CategoryController))

module.exports = router