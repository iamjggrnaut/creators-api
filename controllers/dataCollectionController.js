const { User, DataCollection } = require('../models/models')

class DataCollectionController {

    async getDataCollection(req, res) {
        const { id } = req.params
        const data = await DataCollection.findOne({ where: { userId: id } })
        return res.json(data)
    }

}


module.exports = new DataCollectionController()