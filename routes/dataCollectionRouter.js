const Router = require('express')
const dataCollectionController = require('../controllers/dataCollectionController')
const router = new Router()

const multer = require('multer');
const upload = multer();


router.get('/:id', dataCollectionController.getDataCollection)
router.get('/user/:id', dataCollectionController.getAllForUser)
router.get('/filtered/:id', dataCollectionController.getFilteredCollection)
router.get('/names/:id', dataCollectionController.getBrandNames)
router.get('/geo/:id', dataCollectionController.getGeographyData)
router.get('/costs/:id', dataCollectionController.getCostsFile)
router.post('/set-costs/:id', upload.single('excelFile'), dataCollectionController.updateInitialCosts)
router.post('/set-tax/:id', dataCollectionController.updateTax)

module.exports = router