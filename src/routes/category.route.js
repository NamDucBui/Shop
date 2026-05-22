const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/category.controller')
const validate = require('../middlewares/validate.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')
const {createCategorySchema, updateCategorySchema } = require('../validations/category.validation')

router.get('/', CategoryController.getAll.bind(CategoryController))
router.get('/:id', CategoryController.getById.bind(CategoryController))
router.post('/', 
    authMiddleware,
    roleMiddleware('admin'),
    validate(createCategorySchema), 
    CategoryController.create.bind(CategoryController))
router.put('/:id',
    authMiddleware,
    roleMiddleware('admin'),
    validate(updateCategorySchema), 
    CategoryController.update.bind(CategoryController))
router.delete('/:id',
    authMiddleware,
    roleMiddleware('admin'),
    CategoryController.delete.bind(CategoryController))

module.exports = router