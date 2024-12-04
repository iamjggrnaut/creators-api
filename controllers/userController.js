const { User } = require('../models/models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const generateJWT = (id, email, role, firstName, lastName, phone, referredBy, cashback, updatedAt) => {
    return jwt.sign({ id, email, role, firstName, lastName, phone, referredBy, cashback, updatedAt }, process.env.SECRET_KEY, { expiresIn: '24h' })
}

class UserController {

    async register(req, res, next) {
        const { email, password, role, phone, firstName, lastName } = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Incorrect email or password'))
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            return next(ApiError.badRequest('User with this email already exists'))
        }
        const hashPass = await bcrypt.hash(password, 5)
        const user = await User.create({ email, role, firstName, lastName, password: hashPass, phone })
        const token = generateJWT(user.id, user.email, user.role, user.firstName, user.lastName, user.phone)
        return res.json({ token })
    }

    async login(req, res, next) {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return next(ApiError.internal('User not found'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Wrong password'))
        }
        const token = generateJWT(user.id, user.email, user.role, user.firstName, user.lastName, user.phone, user.updatedAt)
        return res.json({ token })
    }

    async getOne(req, res) {
        const { id } = req.params
        const user = await User.findOne({ where: { id } })
        user.password = ''
        return res.json(user)
    }

    async updateUser(req, res) {
        const { id, email, password, firstName, lastName, role, phone, referredBy, cashback } = req.body
        const user = await User.findOne({ where: { id } })
        if (email) {
            user.update({ email: email })
        }
        if (password) {
            const hashPass = await bcrypt.hash(password, 5)
            user.update({ password: hashPass })
        }
        if (firstName) {
            user.update({ firstName: firstName })
        }
        if (lastName) {
            user.update({ lastName: lastName })
        }
        if (role) {
            user.update({ role: role })
        }
        if (phone) {
            user.update({ phone: phone })
        }
        if (referredBy) {
            user.update({ referredBy: referredBy })
        }
        if (cashback) {
            user.update({ cashback: cashback })
        }
        return res.json(user)
    }

    async getAll(req, res) {
        const users = await User.findAll()
        users.forEach(x => x.password = '')
        return res.json(users)
    }

}

module.exports = new UserController()