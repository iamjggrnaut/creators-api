const Router = require('express')
const salesController = require('../controllers/salesController')
const router = new Router()


router.get('/:id', salesController.getSales)

module.exports = router