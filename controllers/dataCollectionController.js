const {
    User,
    DataCollection,
    Warehouse,
    WarehouseWB,
    Supply,
    NewOrder,
    ReshipmentOrder,
    Income,
    Stock,
    Order,
    Sale,
    ReportDetailByPeriod,
    Add,
    Info
} = require('../models/models')
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
        const data = await Warehouse.findAll({ where: { userId: id } })
        const names = data.map(el => el.brandName)
        return res.json(names)
    }

    async getAllForUser(req, res) {
        const { id } = req.params
        const data = await Order.findAll({ where: { userId: id } })
        return res.json(data)
    }

    async getDataCollection(req, res) {
        const { id } = req.params
        const { days, brandName } = req.query
        const warehouses = await Warehouse.findOne({ where: { userId: id } })
        const warehousesWB = await WarehouseWB.findOne({ where: { userId: id } })
        const supplies = await Supply.findOne({ where: { userId: id } })
        const newOrders = await NewOrder.findOne({ where: { userId: id } })
        const reshipmentOrders = await ReshipmentOrder.findOne({ where: { userId: id } })
        const incomes = await Income.findOne({ where: { userId: id } })
        const stocks = await Stock.findOne({ where: { userId: id } })
        const orders = await Order.findOne({ where: { userId: id } })
        const sales = await Sale.findOne({ where: { userId: id } })
        const reportDetailByPeriod = await ReportDetailByPeriod.findOne({ where: { userId: id } })
        const add = await Add.findOne({ where: { userId: id } })
        const info = await Info.findOne({ where: { userId: id } })

        // let content = {
        //     orderStat: await calculateOrders(data.orders, days),
        //     salesStat: await calculateOrders(data.sales, days),
        //     returned: await calculateReturn(data.orders, days),
        //     buyout: await calculateBuyout(data.orders, days),
        //     averageCheck: await calculateAverageReceipt(data.sales, days),
        //     chartData: null,
        //     initialPrice: 0,
        //     penalty: await calculatePenalty(data.reportDetailByPeriod, days),
        //     additionalPayment: await calculateAdditionalPayment(data.reportDetailByPeriod, days),
        //     wbComission: await calculateCommission(data.reportDetailByPeriod, days),
        //     logistics: await calculateDeliveryCost(data.reportDetailByPeriod, days),
        //     marginRevenue: await calculateMarginalProfit(data.reportDetailByPeriod, days),
        //     lostProfit: await calculateReturn(data.orders, days),
        //     profit: await calculateOrders(data.sales, days),
        //     marginCosts: await calculateMargin(data.reportDetailByPeriod, days),
        //     grossProfit: { sum: await calculateOrders(data.sales, days), percent: 0 },
        //     tax: { sum: 0, percent: 0 },
        //     netProfit: await calculateNetProfit(data.reportDetailByPeriod, days),
        //     averageProfit: await calculateAverageProfit(data.sales, days),
        //     buyoutPercentage: await calculatePurchasePercentage(data.sales, data.reportDetailByPeriod, days),
        //     roi: await calculateROI(data.reportDetailByPeriod, days),
        //     vpProfitMargin: await calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
        //     opProfitMargin: await calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
        //     yearProfitMargin: null,
        //     fbo: await findFBSFBO(data.orders, data.warehouses, days),
        //     fbs: await findFBSFBO(data.orders, data.warehouses, days),
        //     toClient: data.stocks.filter(i => i.inWayToClient),
        //     fromClient: data.stocks.filter(i => i.inWayFromClient),
        //     notSorted: await calculateToClients(data.stocks, days),
        //     advertisment: await calculateAdvertisementMetrics(data.add, calculateOrders(data.sales, days).sum, days),
        //     commissionFromProfit: await calculateCommissionFromProfit(data.reportDetailByPeriod, days),
        //     logisticsFromProfit: await calculateCommissionFromDelivery(data.reportDetailByPeriod, days),
        // }
        return res.json({ warehouses, warehousesWB, supplies, newOrders, reshipmentOrders, incomes, stocks, orders, sales, reportDetailByPeriod, add, info })
    }

    async getFilteredCollection(req, res) {
        const { id } = req.params
        const { days, brandName } = req.query

        const data = await DataCollection.findOne({ where: { userId: id, brandName } })

        let content = {
            orderStat: await calculateOrders(data.orders, days),
            salesStat: await calculateOrders(data.sales, days),
            returned: await calculateReturn(data.orders, days),
            buyout: await calculateBuyout(data.orders, days),
            averageCheck: await calculateAverageReceipt(data.sales, days),
            chartData: null,
            initialPrice: 0,
            penalty: await calculatePenalty(data.reportDetailByPeriod, days),
            additionalPayment: await calculateAdditionalPayment(data.reportDetailByPeriod, days),
            wbComission: await calculateCommission(data.reportDetailByPeriod, days),
            logistics: await calculateDeliveryCost(data.reportDetailByPeriod, days),
            marginRevenue: await calculateMarginalProfit(data.reportDetailByPeriod, days),
            lostProfit: await calculateReturn(data.orders, days),
            profit: await calculateOrders(data.sales, days),
            marginCosts: await calculateMargin(data.reportDetailByPeriod, days),
            grossProfit: { sum: await calculateOrders(data.sales, days), percent: 0 },
            tax: { sum: 0, percent: 0 },
            netProfit: await calculateNetProfit(data.reportDetailByPeriod, days),
            averageProfit: await calculateAverageProfit(data.sales, days),
            buyoutPercentage: await calculatePurchasePercentage(data.sales, data.reportDetailByPeriod, days),
            roi: await calculateROI(data.reportDetailByPeriod, days),
            vpProfitMargin: await calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
            opProfitMargin: await calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
            yearProfitMargin: null,
            fbo: await findFBSFBO(data.orders, data.warehouses, days),
            fbs: await findFBSFBO(data.orders, data.warehouses, days),
            toClient: data.stocks.filter(i => i.inWayToClient),
            fromClient: data.stocks.filter(i => i.inWayFromClient),
            notSorted: await calculateToClients(data.stocks, days),
            advertisment: await calculateAdvertisementMetrics(data.add, calculateOrders(data.sales, days).sum, days),
            commissionFromProfit: await calculateCommissionFromProfit(data.reportDetailByPeriod, days),
            logisticsFromProfit: await calculateCommissionFromDelivery(data.reportDetailByPeriod, days),
        }
        return res.json({ ...data.dataValues, content: content })
    }

}


module.exports = new DataCollectionController()