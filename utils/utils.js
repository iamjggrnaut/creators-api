const { User, Room } = require('../models/models')
const bcrypt = require('bcrypt');

const createAdmin = async () => {
    const adminUsername = process.env.ADMIN_USERNAME || 'creators_admin';
    const adminPassword = process.env.ADMIN_PASSWORD || '2024CreatorsAdmin!';

    const admin = await User.findOne({ where: { role: 'ADMIN' } });

    if (!admin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 5); // Хэширование пароля
        await User.create({
            email: adminUsername,
            phone: '',
            password: hashedPassword,
            role: 'ADMIN',
            firstName: 'Creators',
            lastName: 'Admin',
            referredBy: null,
            cashback: 0,
        });
        console.log('Admin user created');
    } else {
        console.log('Admin user already exists');
    }
};


module.exports = createAdmin