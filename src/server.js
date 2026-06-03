require ('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const app = express()

const authRouter = require('./routes/auth.route')
const categoryRouter = require('./routes/category.route')
const productRouter = require('./routes/product.route')
const cartRouter = require('./routes/cart.route')
const orderRouter = require('./routes/order.route')

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.get('/', (req, res) => {
    res.json({message: 'Server đang chạy'})
})

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/auth', authRouter)
app.use('/categories', categoryRouter)
app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`)
})