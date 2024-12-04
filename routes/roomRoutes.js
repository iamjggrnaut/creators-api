const Router = require('express')
const roomController = require('../controllers/roomController')
const { authMiddleware } = require('../middleware/authMiddleware')
const router = new Router()


router.get('/', roomController.getAllRooms)
router.get('/:id', roomController.getRoom)


module.exports = router