const Router = require('express')
const bookingController = require('../controllers/bookingController')
const { authMiddleware } = require('../middleware/authMiddleware')
const checkRoleMiddleware = require('../middleware/CheckRoleMiddleware')
const router = new Router()


router.get('/room/:id', bookingController.getRoomBookings)
router.get('/extended', checkRoleMiddleware('ADMIN'), bookingController.getRoomBookingsExtended)
router.get('/:id', checkRoleMiddleware('CLIENT'), bookingController.getUserBookings)
router.get('/admin/:id', checkRoleMiddleware('ADMIN'), bookingController.getUserBookings)
router.get('/partner/:id', checkRoleMiddleware("PARTNER"), bookingController.getUserBookings)
router.post('/add', bookingController.createBooking)
router.post('/fast/add', bookingController.createFastBooking)


module.exports = router