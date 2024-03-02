const cron = require('node-cron');
const {
    User,
    DataCollection,
    Warehouse,
    WarehouseWB,
    Supply,
    NewOrder,
    ReshipmentOrder,
    Income,
    Stock,
    Order,
    Sale,
    ReportDetailByPeriod,
    Add,
    Info
} = require('../models/models')
const jwt = require('jsonwebtoken')
const axios = require('axios')

// Расписание: каждый день в 00:00
cron.schedule('0 0 * * *', async () => {
    try {
        // Получение данных для всех пользователей
        const users = await User.findAll()

        // Для каждого пользователя запускаем функцию получения данных
        for (const user of users) {
            await fetchAllData(user); // Подставьте свою фунsкцию получения данных для каждого пользователя
        }

        console.log('Сбор данных для всех пользователей завершен');
    } catch (error) {
        console.error('Ошибка при сборе данных для всех пользователей:', error);
    }
});

// Define function to fetch data from all URLs
async function fetchAllData(user) {

    const models = [
        Warehouse,
        WarehouseWB,
        Supply,
        NewOrder,
        ReshipmentOrder,
        Income,
        Stock,
        Order,
        Sale,
        ReportDetailByPeriod,
        Add,
        Info
    ]

    let id = user.id

    for (const Model of models) {
        await fetchDataAndUpsert(Model, id);
    }
}

async function fetchDataAndUpsert(Model, id) {

    const dateTo = new Date(new Date().setDate(new Date().getDate())).toLocaleDateString('ru').split('.').reverse().join('-')
    const dateFrom = new Date(new Date().setDate(new Date().getDate() - 182)).toLocaleDateString('ru').split('.').reverse().join('-')
    const from = new Date(new Date().setDate(new Date().getDate() - 30)).toLocaleDateString('ru').split('.').reverse().join('-')

    const modelToUrlMap = {
        Warehouse: 'https://suppliers-api.wildberries.ru/api/v3/warehouses',
        WarehouseWB: 'https://suppliers-api.wildberries.ru/api/v3/offices',
        Supply: `https://suppliers-api.wildberries.ru/api/v3/supplies?dateFrom=${dateFrom}&limit=200&next=0`,
        NewOrder: `https://suppliers-api.wildberries.ru/api/v3/orders/new`,
        ReshipmentOrder: `https://suppliers-api.wildberries.ru/api/v3/supplies/orders/reshipment`,
        Income: `https://statistics-api.wildberries.ru/api/v1/supplier/incomes?dateFrom=${dateFrom}`,
        Stock: `https://statistics-api.wildberries.ru/api/v1/supplier/stocks?dateFrom=${dateFrom}`,
        Order: `https://statistics-api.wildberries.ru/api/v1/supplier/orders?dateFrom=${dateFrom}`,
        Sale: `https://statistics-api.wildberries.ru/api/v1/supplier/sales?dateFrom=${dateFrom}`,
        ReportDetailByPeriod: `https://statistics-api.wildberries.ru/api/v1/supplier/reportDetailByPeriod?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        Add: `https://advert-api.wb.ru/adv/v1/upd?from=${from}&to=${dateTo}`,
        Info: `https://suppliers-api.wildberries.ru/public/api/v1/info`
    };


    try {
        // Поиск пользователя
        const user = await User.findOne({ where: { id } });

        const url = modelToUrlMap[Model.name];
        if (!url) {
            console.error(`No corresponding URL found for model: ${Model.name}`);
            return;
        }

        const decodedTokens = user.tokens.map(token => ({ brandName: token.brandName, token: jwt.decode(token.token, { complete: true }) }))
        const resTokens = decodedTokens && decodedTokens.length ? decodedTokens.map(token => ({ brandName: token.brandName, token: token.token.payload.token })) : [];

        // // Создание массива URL-адресов эндпоинтов
        // const urls = [
        //     `https://suppliers-api.wildberries.ru/api/v3/warehouses`,
        //     `https://suppliers-api.wildberries.ru/api/v3/offices`,
        //     `https://suppliers-api.wildberries.ru/api/v3/supplies?dateFrom=${dateFrom}&limit=200&next=0`,
        //     `https://suppliers-api.wildberries.ru/api/v3/orders/new`,
        //     `https://suppliers-api.wildberries.ru/api/v3/supplies/orders/reshipment`,
        //     `https://statistics-api.wildberries.ru/api/v1/supplier/incomes?dateFrom=${dateFrom}`,
        //     `https://statistics-api.wildberries.ru/api/v1/supplier/stocks?dateFrom=${dateFrom}`,
        //     `https://statistics-api.wildberries.ru/api/v1/supplier/orders?dateFrom=${dateFrom}`,
        //     `https://statistics-api.wildberries.ru/api/v1/supplier/sales?dateFrom=${dateFrom}`,
        //     `https://statistics-api.wildberries.ru/api/v1/supplier/reportDetailByPeriod?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        //     `https://advert-api.wb.ru/adv/v1/upd?from=${from}&to=${dateTo}`,
        //     `https://suppliers-api.wildberries.ru/public/api/v1/info`
        // ];

        // // Массив названий для идентификации данных
        // const names = [
        //     'warehouses',
        //     'warehousesWB',
        //     'supplies',
        //     'newOrders',
        //     'reshipmentOrders',
        //     'incomes',
        //     'stocks',
        //     'orders',
        //     'sales',
        //     'reportDetailByPeriod',
        //     'add',
        //     'info'
        // ];



        if (resTokens && resTokens.length) {
            // Запрос данных по URL-адресам
            for (let item in resTokens) {


                try {
                    const response = await axios.get(url, {
                        headers: {
                            Authorization: `Bearer ${resTokens[item].token}`
                        },
                        timeout: 62000 // Таймаут в 62 секунд
                    });
                    const data = response.data;

                    // Upsert data into corresponding table
                    await Model.upsert({
                        userId: id,
                        brandName: resTokens[item].brandName,
                        data: JSON.stringify(data)
                    });

                    console.log(`Data from ${url} upserted successfully.`);
                } catch (error) {
                    console.error(`Error fetching data from ${url}: ${error}`);
                }




                // Объект для хранения полученных данных
                // const responseData = {};
                // await Promise.all(urls.map(async (url, i) => {
                //     try {
                //         const response = await axios.get(url, {
                //             headers: {
                //                 Authorization: `Bearer ${resTokens[item].token}`
                //             },
                //             timeout: 62000 // Таймаут в 62 секунд
                //         });
                //         responseData[names[i]] = response.data;
                //     } catch (error) {
                //         console.error('Ошибка при запросе к API:', error);
                //         responseData[names[i]] = null;
                //     }
                // }));

                // // Поиск или создание записи в таблице DataCollection
                // const [dataCollection, created] = await DataCollection.findOrCreate({
                //     where: {
                //         userId: id,
                //         brandName: resTokens[item].brandName
                //     },
                //     defaults: {
                //         userId: id,
                //         brandName: resTokens[item].brandName,
                //         ...responseData // Данные с эндпоинтов
                //     }
                // });

                // // Если запись не была создана, обновляем существующую
                // if (!created) {
                //     await dataCollection.update(responseData);
                // }
            }
        }

    } catch (error) {
        console.error('Ошибка при получении данных:', error);
    }
}

module.exports = { fetchAllData }