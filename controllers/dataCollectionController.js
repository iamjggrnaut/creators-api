const { User, DataCollection } = require('../models/models')

class DataCollectionController {

    async getAll(req, res) {
        const data = await DataCollection.findAll()
        return res.json(data)
    }

}


module.exports = new DataCollectionController()