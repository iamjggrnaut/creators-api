const { User, DataCollection } = require('../models/models')
const {
    filterArrays,
    calculateOrders,
    calculateReturn,
    calculateBuyout,
    calculateAverageReceipt,
    calculatePenalty,
    calculateAdditionalPayment,
    calculateCommission,
    calculateDeliveryCost,
    calculateMarginalProfit,
    calculateAverageProfit,
    calculateROI,
    calculateNetProfit,
    calculateGrossProfit,
    calculateToClients,
    calculateMargin,
    calculateCommissionFromProfit,
    calculateCommissionFromDelivery,
    calculatePurchasePercentage,
    abcAnalysis,
    calculateAdvertisementMetrics,
    findFBSFBO
} = require('../service/utils')

class DataCollectionController {

    async getBrandNames(req, res) {
        const { id } = req.params
        const data = await DataCollection.findAll({ where: { userId: id } })
        const names = data.map(el => el.brandName)
        return res.json(names)
    }

    async getDataCollection(req, res) {
        const { id } = req.params
        const { days, brandName } = req.query
        const data = await DataCollection.findOne({ where: { userId: id, brandName } })

        let content = {
            orderStat: calculateOrders(data.orders, days),
            salesStat: calculateOrders(data.sales, days),
            returned: calculateReturn(data.orders, days),
            buyout: calculateBuyout(data.orders, days),
            averageCheck: calculateAverageReceipt(data.sales, days),
            chartData: null,
            initialPrice: 0,
            penalty: calculatePenalty(data.reportDetailByPeriod, days),
            additionalPayment: calculateAdditionalPayment(data.reportDetailByPeriod, days),
            wbComission: calculateCommission(data.reportDetailByPeriod, days),
            logistics: calculateDeliveryCost(data.reportDetailByPeriod, days),
            marginRevenue: calculateMarginalProfit(data.reportDetailByPeriod, days),
            lostProfit: calculateReturn(data.orders, days),
            profit: calculateOrders(data.sales, days),
            marginCosts: calculateMargin(data.reportDetailByPeriod, days),
            grossProfit: { sum: calculateOrders(data.sales, days), percent: 0 },
            tax: { sum: 0, percent: 0 },
            netProfit: calculateNetProfit(data.reportDetailByPeriod, days),
            averageProfit: calculateAverageProfit(data.sales, days),
            buyoutPercentage: calculatePurchasePercentage(data.sales, data.reportDetailByPeriod, days),
            roi: calculateROI(data.reportDetailByPeriod, days),
            vpProfitMargin: calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
            opProfitMargin: calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
            yearProfitMargin: null,
            fbo: findFBSFBO(data.orders, data.warehouses, days),
            fbs: findFBSFBO(data.orders, data.warehouses, days),
            toClient: data.stocks.filter(i => i.inWayToClient),
            fromClient: data.stocks.filter(i => i.inWayFromClient),
            notSorted: calculateToClients(data.stocks, days),
            advertisment: calculateAdvertisementMetrics(data.add, calculateOrders(data.sales, days).sum, days),
            commissionFromProfit: calculateCommissionFromProfit(data.reportDetailByPeriod, days),
            logisticsFromProfit: calculateCommissionFromDelivery(data.reportDetailByPeriod, days),
        }
        return res.json({ ...data.dataValues, content: content })
    }

    async getFilteredCollection(req, res) {
        const { id } = req.params
        const { days } = req.query

        const data = await DataCollection.findOne({ where: { userId: id } })

        let content = {
            orderStat: calculateOrders(data.orders, days),
            salesStat: calculateOrders(data.sales, days),
            returned: calculateReturn(data.orders, days),
            buyout: calculateBuyout(data.orders, days),
            averageCheck: calculateAverageReceipt(data.sales, days),
            chartData: null,
            initialPrice: 0,
            penalty: calculatePenalty(data.reportDetailByPeriod, days),
            additionalPayment: calculateAdditionalPayment(data.reportDetailByPeriod, days),
            wbComission: calculateCommission(data.reportDetailByPeriod, days),
            logistics: calculateDeliveryCost(data.reportDetailByPeriod, days),
            marginRevenue: calculateMarginalProfit(data.reportDetailByPeriod, days),
            lostProfit: calculateReturn(data.orders, days),
            profit: calculateOrders(data.sales, days),
            marginCosts: calculateMargin(data.reportDetailByPeriod, days),
            grossProfit: { sum: calculateOrders(data.sales, days), percent: 0 },
            tax: { sum: 0, percent: 0 },
            netProfit: calculateNetProfit(data.reportDetailByPeriod, days),
            averageProfit: calculateAverageProfit(data.sales, days),
            buyoutPercentage: calculatePurchasePercentage(data.sales, data.reportDetailByPeriod, days),
            roi: calculateROI(data.reportDetailByPeriod, days),
            vpProfitMargin: calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
            opProfitMargin: calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
            yearProfitMargin: null,
            fbo: findFBSFBO(data.orders, data.warehouses, days),
            fbs: findFBSFBO(data.orders, data.warehouses, days),
            toClient: data.stocks.filter(i => i.inWayToClient),
            fromClient: data.stocks.filter(i => i.inWayFromClient),
            notSorted: calculateToClients(data.stocks, days),
            advertisment: calculateAdvertisementMetrics(data.add, calculateOrders(data.sales, days).sum, days),
            commissionFromProfit: calculateCommissionFromProfit(data.reportDetailByPeriod, days),
            logisticsFromProfit: calculateCommissionFromDelivery(data.reportDetailByPeriod, days),
        }
        return res.json({ ...data.dataValues, content: content })
    }

}


module.exports = new DataCollectionController()