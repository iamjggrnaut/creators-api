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


module.exports = {
    User
}