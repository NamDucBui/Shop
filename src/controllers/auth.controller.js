const AuthService = require('../services/auth.service')

class AuthController {
    async register (req, res) {
        try {
            const user = await AuthService.register(req.validatedData)
            res.status(201).json({
                message: 'Đăng ký thành công',
                user
            })
        } catch (error) {
            if(error.message === 'Email đã tồn tại'){
                return res.status(409).json({message: error.message})
            }
            res.status(500).json({message: error.message})
        }
    }

    async login (req, res){
        try {
            const {user, token} = await AuthService.login(req.validatedData)

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.json({
                message: 'Đăng nhập thành công',
                user,
                token
            })
        } catch (error) {
            res.status(401).json({message: error.message})
        }
    }

    async logout (req, res){
        res.clearCookie('token')
        res.json({message: 'Đăng xuất thành công'})
    }
}

module.exports = new AuthController()