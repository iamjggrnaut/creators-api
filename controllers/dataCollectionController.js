const { User, DataCollection } = require('../models/models')
const { filterArrays } = require('../service/utils')

class DataCollectionController {

    async getDataCollection(req, res) {
        const { id } = req.params
        const data = await DataCollection.findOne({ where: { userId: id } })
        return res.json(data)
    }

    async getFilteredCollection(req, res) {
        const { id } = req.params
        const { days } = req.query
        const data = await DataCollection.findOne({ where: { userId: id } })
        const filtered = filterArrays(data.dataValues, days)
        console.log(filtered);
        return res.json(filtered)
    }

}


module.exports = new DataCollectionController()