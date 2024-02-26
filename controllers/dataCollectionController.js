const { User, DataCollection } = require('../models/models')
const { filterArrays, calculateOrders, calculateReturn, calculateBuyout } = require('../service/utils')

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

        let content = {
            orderStat: calculateOrders(data.orders, days),
            salesStat: calculateOrders(data.sales, days),
            returned: calculateReturn(data.reportDetailByPeriod, days),
            buyout: calculateBuyout(),
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
        // const filtered = filterArrays(data.dataValues, days)
        // console.log(filtered);
        return res.json({ ...data.dataValues, content: content })
    }

}


module.exports = new DataCollectionController()