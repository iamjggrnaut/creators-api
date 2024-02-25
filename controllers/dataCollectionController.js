const { User, DataCollection } = require('../models/models')

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


function filterArrays(obj, days) {
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            if (obj[key].length) {
                obj[key] = obj[key].filter(item => {
                    const date = item.date ? new Date(item.date) : item.lastChangeDate ? new Date(item.lastChangeDate) : new Date(item.create_dt);
                    const weekAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                    return date >= weekAgo;
                });
            }
        }
    }
    return obj
}