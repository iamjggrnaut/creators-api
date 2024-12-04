const jwt = require('jsonwebtoken');
const { User } = require('../models/models');

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Нет токена' });

    try {
        const decoded = jwt.verify(token);
        req.user = await User.findByPk(decoded.id);
        if (!req.user) return res.status(401).json({ error: 'Неавторизован' });

        next();
    } catch (err) {
        res.status(401).json({ error: 'Неверный токен' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Недостаточно прав' });
    next();
};

module.exports = { authMiddleware, adminMiddleware };
