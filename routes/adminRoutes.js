const Router = require('express')
const userController = require('../controllers/userController')
const bookingController = require('../controllers/bookingController')
const { authMiddleware } = require('../middleware/authMiddleware')
const checkRoleMiddleware = require('../middleware/CheckRoleMiddleware')
const router = new Router()


router.get('/secure/get-user/:id', checkRoleMiddleware('ADMIN'), userController.getOne)
router.get('/secure/all-users', checkRoleMiddleware('ADMIN'), userController.getAll)
router.put('/secure/update-user/:id', checkRoleMiddleware('ADMIN'), userController.updateUser)


module.exports = router