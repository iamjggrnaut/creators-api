const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const dataCollectionRouter = require('./dataCollectionRouter')

router.use('/user', userRouter)
router.use('/data-collection', dataCollectionRouter)


module.exports = router