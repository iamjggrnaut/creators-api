const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const dataCollectionRouter = require('./dataCollectionRouter')
const ordersRouter = require('./ordersRouter')
const salesRouter = require('./ordersRouter')

router.use('/user', userRouter)
router.use('/data-collection', dataCollectionRouter)
router.use('/orders', ordersRouter)
router.use('/sales', salesRouter)


module.exports = router