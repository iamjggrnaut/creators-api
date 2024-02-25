const Router = require('express')
const dataCollectionController = require('../controllers/dataCollectionController')
const router = new Router()


router.get('/', dataCollectionController.getAll)