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
    tokens: { type: DataTypes.JSONB, },
})

const Warehouse = sequelize.define('Warehouse', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const WarehouseWB = sequelize.define('WarehouseWB', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const Supply = sequelize.define('Supply', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const NewOrder = sequelize.define('NewOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const ReshipmentOrder = sequelize.define('ReshipmentOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const Income = sequelize.define('Income', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const Stock = sequelize.define('Stock', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const ReportDetailByPeriod = sequelize.define('ReportDetailByPeriod', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const Add = sequelize.define('Add', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const Info = sequelize.define('Info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

// Определение связи между пользователями и собранными данными
User.hasMany(DataCollection); // Один пользователь может иметь много записей о сборе данных
DataCollection.belongsTo(User); // Каждая запись о сборе данных принадлежит определённому пользователю
Warehouse.belongsTo(User);
WarehouseWB.belongsTo(User);
Supply.belongsTo(User);
NewOrder.belongsTo(User);
ReshipmentOrder.belongsTo(User);
Income.belongsTo(User);
Stock.belongsTo(User);
Order.belongsTo(User);
Sale.belongsTo(User);
ReportDetailByPeriod.belongsTo(User);
Add.belongsTo(User);
Info.belongsTo(User);

module.exports = {
    User,
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
};