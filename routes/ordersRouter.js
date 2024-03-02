const Router = require('express')
const ordersController = require('../controllers/ordersController')
const router = new Router()


router.get('/:id', ordersController.getOrders)

module.exports = router