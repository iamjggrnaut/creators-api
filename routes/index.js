const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')

router.use('/user', userRouter)
router.use('/data-collection', userRouter)


module.exports = router