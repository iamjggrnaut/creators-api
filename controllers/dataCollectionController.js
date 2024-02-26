const { User, DataCollection } = require('../models/models')
const { filterArrays, calculateOrders } = require('../service/utils')

class DataCollectionController {

    async getDataCollection(req, res) {
        const { id } = req.params
        const data = await DataCollection.findOne({ where: { userId: id } })
        return res.json(data)
    }

    async getFilteredCollection(req, res) {
        const { id } = req.params
        const { days } = req.query

        let content = {
            orders: null,
            sales: null,
            returned: null,
            buyout: null,
            averageCheck: null,
            chartData: null,
            initialPrice: null,
            penalty: null,
            additionalPayment: null,
            wbComission: null,
            logistics: null,
            marginRevenue: null,
            lostProfit: null,
            profit: null,
            marginCosts: null,
            grossProfit: null,
            tax: null,
            netProfit: null,
            averageProfit: null,
            buyoutPercentage: null,
            roi: null,
            vpProfitMargin: null,
            opProfitMargin: null,
            yearProfitMargin: null,
            fbo: null,
            fbs: null,
            toClient: null,
            fromClient: null,
            notSorted: null,
            advertisment: null,
            commissionFromProfit: null,
            logisticsFromProfit: null,
            abcAnalysis: null,
        }

        const data = await DataCollection.findOne({ where: { userId: id } })
        const stats = calculateOrders(data, days)
        // const filtered = filterArrays(data.dataValues, days)
        // console.log(filtered);
        return res.json({ data, stats })
    }

}


module.exports = new DataCollectionController()