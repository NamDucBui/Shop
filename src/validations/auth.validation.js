const {z} = require('zod')

const registerSchema = z.object({
    name: z.string().min(2, 'Tên ít nhất 2 ký tự').max(100),
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự').max(250),
    role: z.enum(['user', 'admin']).default('user')
})

const loginSchema = z.object({
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(1, 'Mật khẩu không được để trống')
})

module.exports = {registerSchema, loginSchema}