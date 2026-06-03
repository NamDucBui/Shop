const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/product.controller')
const validate = require('../middlewares/validate.middleware')
const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')
const {createProductSchema, updateProductSchema } = require('../validations/product.validation')
const upload = require('../middlewares/upload.middleware')
const multer = require('multer')
const uploadExcelMemory = multer({storage: multer.memoryStorage()})

router.get('/', ProductController.getAll.bind(ProductController))
router.get('/:id', ProductController.getById.bind(ProductController))
router.get('/category/:categoryId', ProductController.getByCategory.bind(ProductController))
router.post('/',
    authMiddleware,
    roleMiddleware('admin'),
    upload.single('image'),
    validate(createProductSchema), ProductController.create.bind(ProductController))
router.put('/:id',
    authMiddleware,
    roleMiddleware('admin'),
    validate(updateProductSchema), ProductController.update.bind(ProductController))
router.delete('/:id',
    authMiddleware,
    roleMiddleware('admin'),
    ProductController.delete.bind(ProductController))
router.post('/import-excel',
    authMiddleware,
    roleMiddleware('admin'),
    uploadExcelMemory.single('file'), 
    ProductController.importExcelWithImages.bind(ProductController)
)
module.exports = router