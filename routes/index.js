const Router = require('express')
const router = new Router()
const userRoutes = require('../routes/userRoutes')
const adminRoutes = require('../routes/adminRoutes')
const bookingRoutes = require('../routes/bookingRoutes')
const roomRoutes = require('../routes/roomRoutes')


router.use('/user', userRoutes)
router.use('/admin', adminRoutes)
router.use('/booking', bookingRoutes)
router.use('/room', roomRoutes)


module.exports = router