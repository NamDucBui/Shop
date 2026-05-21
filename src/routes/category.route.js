const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/category.controller')
const validate = require('../middlewares/validate.middleware')
const {createCategorySchema, updateCategorySchema } = require('../validations/category.validation')

router.get('/', CategoryController.getAll.bind(CategoryController))
router.get('/:id', CategoryController.getById.bind(CategoryController))
router.post('/', validate(createCategorySchema), CategoryController.create.bind(CategoryController))
router.put('/:id', validate(updateCategorySchema), CategoryController.update.bind(CategoryController))
router.delete('/:id', CategoryController.delete.bind(CategoryController))

module.exports = router