const express = require('express')
const app = express()

require ('dotenv').config()

app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: 'Server đang chạy'})
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`)
})