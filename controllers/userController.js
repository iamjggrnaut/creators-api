const { User } = require('../models/models')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer');
const uuid = require('uuid');


const axios = require('axios');


const confirmationCodes = {};

const generateJWT = (id, email, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, image, updatedAt) => {
    return jwt.sign({ id, email, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, image, updatedAt }, process.env.SECRET_KEY, { expiresIn: '24h' })
}

class UserController {

    async register(req, res, next) {
        const { email, password, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, image, updatedAt } = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Incorrect email or password'))
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            return next(ApiError.badRequest('User with this email already exists'))
        }
        const hashPass = await bcrypt.hash(password, 5)
        const user = await User.create({ email, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, image, updatedAt, password: hashPass })

        const token = generateJWT(user.id, user.email, user.role, user.firstName, user.lastName, user.isActive, user.image, user.patronym, user.stage, user.confirmed, user.isOnboarded, user.promoCode)

        const confirmationCode = uuid.v4();
        confirmationCodes[email] = confirmationCode;

        user.update({ confirmationCode: confirmationCode }, { where: { email: email } })

        let transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: 'radar.analytica@mail.ru',
                pass: 'mgKvHuuHK8xXZnt33SGM',
            },
        });


        let result = await transporter.sendMail({
            from: 'radar.analytica@mail.ru',
            to: email,
            subject: 'Подтверждение регистрации',
            text: 'Данное письмо отправлено с сервиса Radat Analytica',
            html:
                `<div style="padding: 1rem; background-color: white; ">
                        <div style="padding: 1rem;">
                            <h1>Здраствуйте, ${lastName}!</h1>
                            <p style="color: #8C8C8C;">Осталось совсем чуть-чуть</p>
                            <br>
                            <p>Подтвердите регистрацию по ссылке:</p>
                            <a style="color: #5329FF; font-weight: bold;" href="https://radar-analytica.ru/development/confirmation/${email}/${confirmationCode}">Подтвердить</a>
                            <br>
                            <p>C наилучшими пожеланиями,</p>
                            <p>Команда сервиса Radar Analytica</p>
                        </div>
                        <div style="background-color: lightgrey; padding: 1rem; border-radius: 4px;">
                            <p>Вы получили это письмо, так как зарегистрировались на сайте</p>
                            <a href="https://radar-analytica.ru">https://radar-analytica.ru</a>
                            <br>
                            <p>Если вы не проводили регистрацию, <span style="color: red; font-weight: 700;">не переходите по ссылке</span>. Вы так же можете обратиться в службу поддержки</p>
                        </div>
                    </div>`,
        });


        return res.json(null)
    }

    async confirm(req, res, next) {
        const { email, code } = req.body
        const user = await User.findOne({ where: { email } })
        if (user && user.email === email && user.confirmationCode === code) {
            user.update({ confirmed: true }, { where: { email } })
        }
        return res.json({ confirmed: true })
    }

    async login(req, res, next) {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return next(ApiError.internal('User not found'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword && !user.confirmed) {
            return next(ApiError.internal('Wrong password or email is not confirmed'))
        }
        const token = generateJWT(user.id, user.email, user.phone, user.role, user.firstName, user.lastName, user.isActive, user.image, user.patronym, user.stage, user.confirmed, user.isOnboarded, user.promoCode)
        if (user.confirmed) {
            return res.json({ token })
        }
        return
    }

    async check(req, res) {
        const token = generateJWT(req.user.id, req.user.email, req.user.role, req.user.firstName, req.user.lastName,
            req.user.isActive, req.user.image, req.user.patronym, req.user.isOnboarded, req.user.stage, req.user.promoCode, req.user.confirmed, req.user.phone)
        return res.json({ token })
    }

    async getOne(req, res) {
        const { id } = req.params
        const user = await User.findOne({ where: { id } })
        user.password = ''
        return res.json(user)
    }

    async updateImage(req, res) {
        const { id } = req.params
        const { image } = req.body
        const user = await User.update({ image: image }, { where: { id } })
        return res.json(user)
    }

    async updateToken(req, res) {
        const { id } = req.params
        const { token, brandName } = req.body
        const user = await User.findOne({ where: { id } })
        try {
            const signedToken = jwt.sign({ token }, process.env.SECRET_KEY);
            await User.update({ token: signedToken, brandName }, { where: { id } });
            res.status(200).json({ success: true, message: 'Токен успешно обновлен и сохранен.' });
        } catch (error) {
            console.error('Ошибка при обновлении токена:', error);
            res.status(500).json({ success: false, message: 'Произошла ошибка при обновлении токена.' });
        }
    }

    async updateUser(req, res) {
        const { id, email, password, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, } = req.body
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
        if (isActive) {
            user.update({ isActive: isActive })
        }
        if (patronym) {
            user.update({ lastName: lastName })
        }
        if (promoCode) {
            user.update({ role: role })
        }
        if (isOnboarded) {
            user.update({ isActive: isActive })
        }
        if (phone) {
            user.update({ role: role })
        }
        if (stage) {
            user.update({ isActive: isActive })
        }
        if (confirmed) {
            user.update({ isActive: isActive })
        }
        return res.json(user)
    }

    async getAll(req, res) {
        const users = await User.findAll()
        users.forEach(x => x.password = '')
        return res.json(users)
    }

    async getWBData(req, res) {
        const { id } = req.params
        const { dateFrom } = req.query.dateFrom

        // const user = await User.findOne({ where: { id } })
        // const decodedToken = jwt.decode(user.token, { complete: true })
        // const resToken = decodedToken && decodedToken.payload ? decodedToken.payload.token : null




        // const url = `https://statistics-api.wildberries.ru/api/v1/supplier/sales?dateFrom=${'2024-01-10'}`
        // const config = {
        //     headers: {
        //         Authorization: `Bearer ${resToken}`
        //     }
        // }

        // try {
        //     const response = await axios.get(url, config);
        //     return res.json(response.data)
        // } catch (error) {
        //     console.error('Ошибка при запросе к API:', error);
        //     throw error;
        // }


        try {
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            const decodedToken = jwt.decode(user.token, { complete: true });
            const resToken = decodedToken && decodedToken.payload ? decodedToken.payload.token : null;

            const urls = [
                'https://suppliers-api.wildberries.ru/api/v3/warehouses?dateFrom=2024-01-10',
                'https://suppliers-api.wildberries.ru/api/v3/supplies?dateFrom=2024-01-10',
                'https://suppliers-api.wildberries.ru/api/v3/supplies?dateFrom=2024-01-10',
                'https://suppliers-api.wildberries.ru/api/v3/supplies/orders/reshipment?dateFrom=2024-01-10',
                'https://statistics-api.wildberries.ru/api/v1/supplier/incomes?dateFrom=2024-01-10',
                'https://statistics-api.wildberries.ru/api/v1/supplier/stocks?dateFrom=2024-01-10',
                'https://statistics-api.wildberries.ru/api/v1/supplier/orders?dateFrom=2024-01-10',
                'https://statistics-api.wildberries.ru/api/v1/supplier/sales?dateFrom=2024-01-10',
                'https://statistics-api.wildberries.ru/api/v1/supplier/reportDetailByPeriod?dateFrom=2024-01-10',
                'https://suppliers-api.wildberries.ru/public/api/v1/info'
            ];

            const responses = await Promise.all(
                urls.map(async (url) => {
                    try {
                        const response = await axios.get(url, {
                            headers: {
                                Authorization: `Bearer ${resToken}`
                            }
                        });
                        return response.data;
                    } catch (error) {
                        console.error('Ошибка при запросе к API:', error.message);
                        return null;
                    }
                })
            );

            const responseData = {
                warehouses: responses[0],
                supplies: responses[1],
                newOrders: responses[2],
                reshipmentOrders: responses[3],
                incomes: responses[4],
                stocks: responses[5],
                orders: responses[6],
                sales: responses[7],
                reportDetailByPeriod: responses[8],
                info: responses[9]
            };

            return res.json(responseData);
        } catch (error) {
            console.error('Ошибка при получении данных:', error.message);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }

    }

}


module.exports = new UserController()
