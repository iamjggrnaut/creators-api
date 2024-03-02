const { User, DataCollection } = require('../models/models')
const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { fetchAllData } = require('../service/scheduler')
const Queue = require('bull');


async function fetchData(url, resToken) {
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
}




const confirmationCodes = {};

const generateJWT = (id, email, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, updatedAt, brandName) => {
    return jwt.sign({ id, email, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, updatedAt }, process.env.SECRET_KEY, { expiresIn: '24h' })
}

class UserController {

    async register(req, res, next) {
        const { email, password, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, updatedAt } = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Incorrect email or password'))
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            return next(ApiError.badRequest('User with this email already exists'))
        }
        const hashPass = await bcrypt.hash(password, 5)
        const user = await User.create({ email, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, updatedAt, password: hashPass })

        const token = generateJWT(user.id, user.email, user.role, user.firstName, user.lastName, user.isActive, user.patronym, user.stage, user.confirmed, user.isOnboarded, user.promoCode)

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

        const imagePath = path.join(__dirname, '../static/logo.png');


        let result = await transporter.sendMail({
            from: 'radar.analytica@mail.ru',
            to: email,
            subject: 'Подтверждение регистрации',
            text: 'Данное письмо отправлено с сервиса Radat Analytica',
            attachments: [
                {
                    filename: 'logo.png',
                    path: imagePath,
                    cid: 'unique-image-id' // Идентификатор изображения, используемый в HTML-коде письма
                }
            ],
            html:
                `<div style="padding: 1rem; background-color: white; width: 420px;">
                        <div style="padding: 1rem; width: 400px;">
                            <img src="cid:unique-image-id" alt="Изображение" style="max-width: 200px;">
                            <h1>Здраствуйте, ${lastName}!</h1>
                            <p style="color: #8C8C8C;">Осталось совсем чуть-чуть</p>
                            <br>
                            <p>Подтвердите регистрацию:</p>
                            <div style="display: flex; width: 400px; text-align: center;">
                            <a href="https://radar-analytica.ru/development/confirmation/${email}/${confirmationCode}" style='border: none; margin: 8px 0px; background-color: #5329FF; color: white; border-radius: 8px; padding: 20px 32px; font-weight: 700;text-decoration: none; width: 320px;'>Подтвердить</a>
                            </div>
                            <br>
                            <p>C наилучшими пожеланиями,</p>
                            <p>Команда сервиса Radar Analytica</p>
                        </div>
                        <div style="background-color: lightgrey; padding: 1rem; border-radius: 4px; width: 400px;">
                            <p>Вы получили это письмо, так как зарегистрировались на сайте</p>
                            <a href="https://radar-analytica.ru">https://radar-analytica.ru</a>
                            <br>
                            <p>Если вы не проводили регистрацию, <span style="color: red; font-weight: 700;">не переходите по ссылке</span>. Вы так же можете обратиться в службу поддержки</p>
                        </div>
                    </div>`,
        });


        return res.json(null)
    }

    async restorePass(req, res, next) {
        const { email } = req.body
        const candidate = await User.findOne({ where: { email } })

        const confirmationCode = uuid.v4();

        candidate.update({ confirmationCode: confirmationCode }, { where: { email: email } })

        let transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: 'radar.analytica@mail.ru',
                pass: 'mgKvHuuHK8xXZnt33SGM',
            },
        });

        const imagePath = path.join(__dirname, '../static/logo.png');


        let result = await transporter.sendMail({
            from: 'radar.analytica@mail.ru',
            to: email,
            subject: 'Восстановление пароля',
            text: 'Данное письмо отправлено с сервиса Radat Analytica',
            attachments: [
                {
                    filename: 'logo.png',
                    path: imagePath,
                    cid: 'unique-image-id' // Идентификатор изображения, используемый в HTML-коде письма
                }
            ],
            html:
                `<div style="padding: 1rem; background-color: white; width: 420px;">
                            <div style="padding: 1rem; width: 400px;">
                                <img src="cid:unique-image-id" alt="Изображение" style="width: 200px;">
                                <h1>Восстановление пароля</h1>
                                <p style="color: #8C8C8C;">Не переживайте, это несложно и безопасно</p>
                                <br>
                                <p>Здравствуйте! Для вашего аккаунта в сервисе Radar Analytica создан запрос на восстановление пароля.</p>
                                <p>Ваш логин: ${email}</p>
                                <br>
                                <p>Если этот запрос сделали вы, перейдите по <a href="https://radar-analytica.ru/development/restore/${email}/${confirmationCode}" style='border: none; font-weight: 700;text-decoration: none;min-width: 400px;'>данной</a> ссылке для сброса пароля. </p>
                                <br>
                                <br>
                                <p>C наилучшими пожеланиями,</p>
                                <p>Команда сервиса Radar Analytica</p>
                            </div>
                            <div style="background-color: lightgrey; padding: 1rem; border-radius: 4px; width: 400px;">
                                <p>Вы получили это письмо, так как запросили восстановление пароля на сайте</p>
                                <a href="https://radar-analytica.ru">https://radar-analytica.ru</a>
                                <br>
                                <p>Если вы не запрашивали такую информацию, просто игнорируйте это письмо. Вы так же можете обратиться в службу поддержки:support@gmail.com</p>
                            </div>
                        </div>`,
        });


        return res.json({ sent: 'sent' })
    }

    async confirm(req, res, next) {
        const { email, code } = req.body
        const user = await User.findOne({ where: { email } })
        if (user && user.email === email && user.confirmationCode === code) {
            user.update({ confirmed: true }, { where: { email } })
        }
        return res.json({ confirmed: true })
    }

    async confirmReset(req, res, next) {
        const { email, code } = req.body
        const user = await User.findOne({ where: { email } })
        if (user && user.email === email && user.confirmationCode === code) {
            user.update({ confirmed: true }, { where: { email } })
            return res.json({ ...user.confirmed })
        } else {
            return res.json(null)
        }
    }


    async login(req, res, next) {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return next(ApiError.internal('User not found'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        console.log(comparePassword);
        if (!comparePassword) {
            res.status(500).json({ success: false, message: 'Неверный логин или пароль' })
        }
        if (!comparePassword && !user.confirmed) {
            return next(ApiError.internal('Wrong password or email is not confirmed'))
        }
        const token = generateJWT(user.id, user.email, user.phone, user.stage, user.role, user.firstName, user.lastName, user.patronym, user.confirmed, user.isOnboarded, user.promoCode, user.isActive, user.updatedAt)
        if (user.confirmed && comparePassword) {
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
            const newToken = {
                token: signedToken,
                brandName: brandName
            }
            const userTokens = user.tokens
            if (userTokens && userTokens.length) {
                const tokens = [...user.tokens, newToken]
                await User.update({ tokens: tokens, isOnboarded: true }, { where: { id } });
            }
            if (!userTokens) {
                const tokens = [newToken]
                await User.update({ tokens: tokens, isOnboarded: true }, { where: { id } });
            }
            setTimeout(async () => {
                await fetchAllData(user)
            }, 61000);
            const tkn = generateJWT(user.id, user.email, user.phone, user.stage, user.role, user.firstName, user.lastName, user.patronym, user.confirmed, user.isOnboarded, user.promoCode, user.isActive, user.updatedAt, user.brandName)
            res.status(200).json({ token: tkn });
        } catch (error) {
            console.error('Ошибка при обновлении токена:', error);
            res.status(500).json({ success: false, message: 'Произошла ошибка при обновлении токена.' });
        }
    }

    async updateUser(req, res) {
        const { id, email, password, phone, stage, role, firstName, lastName, patronym, confirmed, isOnboarded, promoCode, isActive, } = req.body
        const user = await User.findOne({ where: { email } })
        console.log(user);
        if (email && !password) {
            user.update({ email: email })
        }
        if (password && email) {
            try {
                const hashPass = await bcrypt.hash(password, 5)
                user.update({ password: hashPass })
                return res.status(200).json({ success: true, message: 'Пароль успешно обновлен' });
            } catch (error) {
                console.error('Ошибка при обновлении токена:', error);
                res.status(500).json({ success: false, message: 'Произошла ошибка при обновлении пароля.' });
            }
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

    async getData(req, res) {
        const { id } = req.params;
        try {
            const data = await DataCollection.findOne({ where: { userId: id } })
            return req.json(data)
        }
        catch (error) {
            console.error('Ошибка при получении данных:', error);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }

    }

    async getTokenExp(req, res) {
        const { id } = req.params

        try {
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            const decodedTokens = user.tokens.map(token => ({ brandName: token.brandName, token: jwt.decode(token.token, { complete: true }) }))
            const resTokens = decodedTokens && decodedTokens.length ? decodedTokens.map(token => ({ brandName: token.brandName, token: token.token.payload.token })) : [];


            let result = resTokens.map(token => ({ brandName: token.brandName, token: jwt.decode(token.token) }))

            return res.json(result);
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }

    }

}


module.exports = new UserController()
