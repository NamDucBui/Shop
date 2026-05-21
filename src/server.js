const express = require('express')
const prisma = require('./lib/prisma')

const app = express()
require ('dotenv').config()
app.use(express.json())

app.get('/', (req, res) => {
    res.json({message: 'Server đang chạy'})
})

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany()
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`)
})