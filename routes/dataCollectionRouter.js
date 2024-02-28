const Router = require('express')
const dataCollectionController = require('../controllers/dataCollectionController')
const router = new Router()


router.get('/:id', dataCollectionController.getDataCollection)
router.get('/filtered/:id', dataCollectionController.getFilteredCollection)
router.get('/names/:id', dataCollectionController.getBrandNames)

module.exports = router