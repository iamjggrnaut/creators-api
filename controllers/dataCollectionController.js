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
        const warehouses = await Warehouse.findOne({ where: { userId: id, brandName } })
        const warehousesWB = await WarehouseWB.findOne({ where: { userId: id, brandName } })
        const supplies = await Supply.findOne({ where: { userId: id, brandName } })
        const newOrders = await NewOrder.findOne({ where: { userId: id, brandName } })
        const reshipmentOrders = await ReshipmentOrder.findOne({ where: { userId: id, brandName } })
        const incomes = await Income.findOne({ where: { userId: id, brandName } })
        const stocks = await Stock.findOne({ where: { userId: id, brandName } })
        const orders = await Order.findOne({ where: { userId: id, brandName } })
        const sales = await Sale.findOne({ where: { userId: id, brandName } })
        const reportDetailByPeriod = await ReportDetailByPeriod.findOne({ where: { userId: id, brandName } })
        const add = await Add.findOne({ where: { userId: id, brandName } })
        const info = await Info.findOne({ where: { userId: id, brandName } })

        const [
            orderStat,
            salesStat,
            returned,
            buyout,
            averageCheck,
            penalty,
            additionalPayment,
            wbComission,
            logistics,
            marginRevenue,
            lostProfit,
            profit,
            marginCosts,
            netProfit,
            averageProfit,
            buyoutPercentage,
            roi,
            vpProfitMargin,
            opProfitMargin,
            advertisment,
            commissionFromProfit,
            logisticsFromProfit
        ] = await Promise.all([
            calculateOrders(orders, days),
            calculateOrders(sales, days),
            calculateReturn(orders, days),
            calculateBuyout(orders, days),
            calculateAverageReceipt(sales, days),
            calculatePenalty(reportDetailByPeriod, days),
            calculateAdditionalPayment(reportDetailByPeriod, days),
            calculateCommission(reportDetailByPeriod, days),
            calculateDeliveryCost(reportDetailByPeriod, days),
            calculateMarginalProfit(reportDetailByPeriod, days),
            calculateReturn(orders, days),
            calculateOrders(sales, days),
            calculateMargin(reportDetailByPeriod, days),
            calculateNetProfit(reportDetailByPeriod, days),
            calculateAverageProfit(sales, days),
            calculatePurchasePercentage(sales, reportDetailByPeriod, days),
            calculateROI(reportDetailByPeriod, days),
            calculateGrossProfit(sales, reportDetailByPeriod, days),
            calculateGrossProfit(sales, reportDetailByPeriod, days),
            calculateAdvertisementMetrics(add, calculateOrders(sales, days).sum, days),
            calculateCommissionFromProfit(reportDetailByPeriod, days),
            calculateCommissionFromDelivery(reportDetailByPeriod, days)
        ]);

        const content = {
            orderStat,
            salesStat,
            returned,
            buyout,
            averageCheck,
            chartData: null,
            initialPrice: 0,
            penalty,
            additionalPayment,
            wbComission,
            logistics,
            marginRevenue,
            lostProfit,
            profit,
            marginCosts,
            grossProfit: { sum: profit.sum, percent: 0 },
            tax: { sum: 0, percent: 0 },
            netProfit,
            averageProfit,
            buyoutPercentage,
            roi,
            vpProfitMargin,
            opProfitMargin,
            yearProfitMargin: null,
            fbo: await findFBSFBO(orders, warehouses, days),
            fbs: await findFBSFBO(orders, warehouses, days),
            toClient: stocks.filter(i => i.inWayToClient),
            fromClient: stocks.filter(i => i.inWayFromClient),
            notSorted: await calculateToClients(stocks, days),
            advertisment,
            commissionFromProfit,
            logisticsFromProfit
        };

        return res.json({ warehouses, warehousesWB, supplies, newOrders, reshipmentOrders, incomes, stocks, orders, sales, reportDetailByPeriod, add, info, content })
    }

    async getFilteredCollection(req, res) {
        const { id } = req.params
        const { days, brandName } = req.query

        const warehouses = await Warehouse.findOne({ where: { userId: id, brandName } })
        const warehousesWB = await WarehouseWB.findOne({ where: { userId: id, brandName } })
        const supplies = await Supply.findOne({ where: { userId: id, brandName } })
        const newOrders = await NewOrder.findOne({ where: { userId: id, brandName } })
        const reshipmentOrders = await ReshipmentOrder.findOne({ where: { userId: id, brandName } })
        const incomes = await Income.findOne({ where: { userId: id, brandName } })
        const stocks = await Stock.findOne({ where: { userId: id, brandName } })
        const orders = await Order.findOne({ where: { userId: id, brandName } })
        const sales = await Sale.findOne({ where: { userId: id, brandName } })
        const reportDetailByPeriod = await ReportDetailByPeriod.findOne({ where: { userId: id, brandName } })
        const add = await Add.findOne({ where: { userId: id, brandName } })
        const info = await Info.findOne({ where: { userId: id, brandName } })

        const [
            orderStat,
            salesStat,
            returned,
            buyout,
            averageCheck,
            penalty,
            additionalPayment,
            wbComission,
            logistics,
            marginRevenue,
            lostProfit,
            profit,
            marginCosts,
            netProfit,
            averageProfit,
            buyoutPercentage,
            roi,
            vpProfitMargin,
            opProfitMargin,
            advertisment,
            commissionFromProfit,
            logisticsFromProfit
        ] = await Promise.all([
            calculateOrders(orders, days),
            calculateOrders(sales, days),
            calculateReturn(orders, days),
            calculateBuyout(orders, days),
            calculateAverageReceipt(sales, days),
            calculatePenalty(reportDetailByPeriod, days),
            calculateAdditionalPayment(reportDetailByPeriod, days),
            calculateCommission(reportDetailByPeriod, days),
            calculateDeliveryCost(reportDetailByPeriod, days),
            calculateMarginalProfit(reportDetailByPeriod, days),
            calculateReturn(orders, days),
            calculateOrders(sales, days),
            calculateMargin(reportDetailByPeriod, days),
            calculateNetProfit(reportDetailByPeriod, days),
            calculateAverageProfit(sales, days),
            calculatePurchasePercentage(sales, reportDetailByPeriod, days),
            calculateROI(reportDetailByPeriod, days),
            calculateGrossProfit(sales, reportDetailByPeriod, days),
            calculateGrossProfit(sales, reportDetailByPeriod, days),
            calculateAdvertisementMetrics(add, calculateOrders(sales, days).sum, days),
            calculateCommissionFromProfit(reportDetailByPeriod, days),
            calculateCommissionFromDelivery(reportDetailByPeriod, days)
        ]);

        const content = {
            orderStat,
            salesStat,
            returned,
            buyout,
            averageCheck,
            chartData: null,
            initialPrice: 0,
            penalty,
            additionalPayment,
            wbComission,
            logistics,
            marginRevenue,
            lostProfit,
            profit,
            marginCosts,
            grossProfit: { sum: profit.sum, percent: 0 },
            tax: { sum: 0, percent: 0 },
            netProfit,
            averageProfit,
            buyoutPercentage,
            roi,
            vpProfitMargin,
            opProfitMargin,
            yearProfitMargin: null,
            fbo: await findFBSFBO(orders, warehouses, days),
            fbs: await findFBSFBO(orders, warehouses, days),
            toClient: stocks.filter(i => i.inWayToClient),
            fromClient: stocks.filter(i => i.inWayFromClient),
            notSorted: await calculateToClients(stocks, days),
            advertisment,
            commissionFromProfit,
            logisticsFromProfit
        };

        return res.json({ warehouses, warehousesWB, supplies, newOrders, reshipmentOrders, incomes, stocks, orders, sales, reportDetailByPeriod, add, info, content })
    }

}


module.exports = new DataCollectionController()