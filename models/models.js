const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    stage: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'USER' },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    patronym: { type: DataTypes.STRING },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
    isOnboarded: { type: DataTypes.BOOLEAN, },
    promoCode: { type: DataTypes.STRING, },
    confirmationCode: { type: DataTypes.STRING, },
    brandName: { type: DataTypes.STRING, },
    token: { type: DataTypes.TEXT, },
})

const DataCollection = sequelize.define('dataCollection', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // Идентификатор
    userId: { type: DataTypes.INTEGER, allowNull: false }, // Поле для связи с пользователем
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }, // Дата записи
    warehouses: { type: DataTypes.INTEGER }, // Склады
    supplies: { type: DataTypes.INTEGER }, // Поставки
    newOrders: { type: DataTypes.INTEGER }, // Новые заказы
    reshipmentOrders: { type: DataTypes.INTEGER }, // Переотправка заказов
    incomes: { type: DataTypes.FLOAT }, // Доходы
    stocks: { type: DataTypes.INTEGER }, // Складские запасы
    orders: { type: DataTypes.INTEGER }, // Заказы
    sales: { type: DataTypes.FLOAT }, // Продажи
    reportDetailByPeriod: { type: DataTypes.JSONB }, // Отчет по деталям за период
    info: { type: DataTypes.JSONB } // Информация
});

// Определение связи между пользователями и собранными данными
User.hasMany(DataCollection); // Один пользователь может иметь много записей о сборе данных
DataCollection.belongsTo(User); // Каждая запись о сборе данных принадлежит определённому пользователю

module.exports = {
    User,
    DataCollection
};