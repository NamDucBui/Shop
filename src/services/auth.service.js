const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

class AuthService{
    async register(data){
        const existing = await prisma.users.findUnique({
            where: {email: data.email}
        })

        if(existing){
            throw new Error('Email đã tồn tại')
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        const user = await prisma.users.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role ?? 'user'
            }
        })

        const {password, ...userWithoutPassword} = user
        return userWithoutPassword
    }

    async login(data){
        const user = await prisma.users.findUnique({
            where: {email: data.email}
        })

        if(!user){
            throw new Error('Email hoặc mật khẩu không đúng')
        }

        const isMatch = await bcrypt.compare(data.password, user.password)

        if(!isMatch){
            throw new Error('Email hoặc mật khẩu không đúng')
        }

        const token = jwt.sign(
            {id: user.id, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )

        const{password, ...userWithoutPassword} = user
        return {user: userWithoutPassword, token}
    }
}

module.exports = new AuthService()