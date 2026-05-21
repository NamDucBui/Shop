const express = require('express')
const app = express()
const categoryRouter = require('./routes/category.route')
const productRouter = require('./routes/product.route')

require ('dotenv').config()
app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: 'Server đang chạy'})
})

app.use('/categories', categoryRouter)
app.use('/products', productRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`)
})