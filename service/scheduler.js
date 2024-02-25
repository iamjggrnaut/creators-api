const cron = require('node-cron');
const userController = require('../controllers/userController')
const { User, DataCollection } = require('../models/models')
const jwt = require('jsonwebtoken')
const axios = require('axios')

// Расписание: каждый день в 00:00
cron.schedule('0 0 * * *', async () => {
    try {
        // Получение данных для всех пользователей
        const users = await User.findAll()

        // Для каждого пользователя запускаем функцию получения данных
        for (const user of users) {
            await fetchAndStore(user); // Подставьте свою фунsкцию получения данных для каждого пользователя
        }

        console.log('Сбор данных для всех пользователей завершен');
    } catch (error) {
        console.error('Ошибка при сборе данных для всех пользователей:', error);
    }
});


async function fetchAndStore(u, req, res) {


    try {
        const id = u.id
        const dateTo = new Date(new Date().setDate(new Date().getDate())).toLocaleDateString('ru').split('.').reverse().join('-')
        const dateFrom = new Date(new Date().setDate(new Date().getDate() - 92)).toLocaleDateString('ru').split('.').reverse().join('-')

        // Поиск пользователя
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const decodedToken = jwt.decode(user.token, { complete: true });
        const resToken = decodedToken && decodedToken.payload ? decodedToken.payload.token : null;

        // Создание массива URL-адресов эндпоинтов
        const urls = [
            `https://suppliers-api.wildberries.ru/api/v3/warehouses`,
            `https://suppliers-api.wildberries.ru/api/v3/supplies?dateFrom=${dateFrom}&limit=200&next=0`,
            `https://suppliers-api.wildberries.ru/api/v3/orders/new`,
            `https://suppliers-api.wildberries.ru/api/v3/supplies/orders/reshipment`,
            `https://statistics-api.wildberries.ru/api/v1/supplier/incomes?dateFrom=${dateFrom}`,
            `https://statistics-api.wildberries.ru/api/v1/supplier/stocks?dateFrom=${dateFrom}`,
            `https://statistics-api.wildberries.ru/api/v1/supplier/orders?dateFrom=${dateFrom}`,
            `https://statistics-api.wildberries.ru/api/v1/supplier/sales?dateFrom=${dateFrom}`,
            `https://statistics-api.wildberries.ru/api/v1/supplier/reportDetailByPeriod?dateFrom=${dateFrom}&dateTo=${dateTo}`,
            `https://suppliers-api.wildberries.ru/public/api/v1/info`
        ];

        // Объект для хранения полученных данных
        const responseData = {};

        // Массив названий для идентификации данных
        const names = [
            'warehouses',
            'supplies',
            'newOrders',
            'reshipmentOrders',
            'incomes',
            'stocks',
            'orders',
            'sales',
            'reportDetailByPeriod',
            'info'
        ];

        // Запрос данных по URL-адресам
        await Promise.all(urls.map(async (url, i) => {
            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${resToken}`
                    },
                    timeout: 62000 // Таймаут в 65 секунд
                });
                responseData[names[i]] = response.data;
            } catch (error) {
                console.error('Ошибка при запросе к API:', error);
                responseData[names[i]] = null;
            }
        }));

        // Поиск или создание записи в таблице DataCollection
        const [dataCollection, created] = await DataCollection.findOrCreate({
            where: {
                userId: id,
            },
            defaults: {
                userId: id,
                ...responseData // Данные с эндпоинтов
            }
        });

        // Если запись не была создана, обновляем существующую
        if (!created) {
            await dataCollection.update(responseData);
        }
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }
}

module.exports = { fetchAndStore }