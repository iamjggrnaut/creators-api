const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, unique: true },
    phone: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'CLIENT' },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    referredBy: { type: DataTypes.INTEGER },
    cashback: { type: DataTypes.INTEGER, defaultValue: 0 },
})

const Room = sequelize.define('room', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
})

const Booking = sequelize.define('booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.STRING },
    hour: { type: DataTypes.STRING },
    roomId: { type: DataTypes.INTEGER },
    email: { type: DataTypes.STRING },
    userData: { type: DataTypes.JSON },
})

User.hasMany(Booking)
Booking.belongsTo(User)

module.exports = {
    User,
    Booking,
    Room
}