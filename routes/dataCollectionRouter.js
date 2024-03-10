const Router = require('express')
const dataCollectionController = require('../controllers/dataCollectionController')
const router = new Router()


router.get('/:id', dataCollectionController.getDataCollection)
router.get('/user/:id', dataCollectionController.getAllForUser)
router.get('/filtered/:id', dataCollectionController.getFilteredCollection)
router.get('/names/:id', dataCollectionController.getBrandNames)
router.get('/geo/:id', dataCollectionController.getGeographyData)
router.get('/costs/:id', dataCollectionController.getCostsFile)

module.exports = router