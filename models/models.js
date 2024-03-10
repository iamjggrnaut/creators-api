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

const Goods = sequelize.define('Goods', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

const InitialCostsAndTax = sequelize.define('Goods', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    tax: { type: DataTypes.JSON },
    brandName: { type: DataTypes.STRING },
});

const ReportDaily = sequelize.define('ReportDaily', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});
const ReportWeekly = sequelize.define('ReportWeekly', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});
const ReportTwoWeeks = sequelize.define('ReportTwoWeeks', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});
const ReportMonthly = sequelize.define('ReportMonthly', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});
const ReportThreeMonths = sequelize.define('ReportThreeMonths', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    data: { type: DataTypes.JSONB },
    brandName: { type: DataTypes.STRING },
});

// Определение связи между пользователями и собранными данными
ReportThreeMonths.belongsTo(User);
ReportMonthly.belongsTo(User);
Goods.belongsTo(User);
InitialCostsAndTax.belongsTo(User);
ReportWeekly.belongsTo(User);
ReportTwoWeeks.belongsTo(User);
ReportDaily.belongsTo(User);
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
    InitialCostsAndTax,
    ReportThreeMonths,
    ReportTwoWeeks,
    ReportMonthly,
    ReportWeekly,
    ReportDaily,
    User,
    Goods,
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