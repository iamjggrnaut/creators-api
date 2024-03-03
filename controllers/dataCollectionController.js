const {
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
            calculateOrders(orders.data, days),
            calculateOrders(sales.data, days),
            calculateReturn(orders.data, days),
            calculateBuyout(orders.data, days),
            calculateAverageReceipt(sales.data, days),
            calculatePenalty(reportDetailByPeriod.data, days),
            calculateAdditionalPayment(reportDetailByPeriod.data, days),
            calculateCommission(reportDetailByPeriod.data, days),
            calculateDeliveryCost(reportDetailByPeriod.data, days),
            calculateMarginalProfit(reportDetailByPeriod.data, days),
            calculateReturn(orders.data, days),
            calculateOrders(sales.data, days),
            calculateMargin(reportDetailByPeriod.data, days),
            calculateNetProfit(reportDetailByPeriod.data, days),
            calculateAverageProfit(sales.data, days),
            calculatePurchasePercentage(sales.data, reportDetailByPeriod.data, days),
            calculateROI(reportDetailByPeriod.data, days),
            calculateGrossProfit(sales.data, reportDetailByPeriod.data, days),
            calculateGrossProfit(sales.data, reportDetailByPeriod.data, days),
            calculateAdvertisementMetrics(add.data, calculateOrders(sales.data, days).sum, days),
            calculateCommissionFromProfit(reportDetailByPeriod.data, days),
            calculateCommissionFromDelivery(reportDetailByPeriod.data, days)
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
            fbo: await findFBSFBO(orders.data, warehouses.data, days),
            fbs: await findFBSFBO(orders.data, warehouses.data, days),
            toClient: stocks.data.filter(i => i.inWayToClient),
            fromClient: stocks.data.filter(i => i.inWayFromClient),
            notSorted: await calculateToClients(stocks.data, days),
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
            calculateOrders(orders.data, days),
            calculateOrders(sales.data, days),
            calculateReturn(orders.data, days),
            calculateBuyout(orders.data, days),
            calculateAverageReceipt(sales.data, days),
            calculatePenalty(reportDetailByPeriod.data, days),
            calculateAdditionalPayment(reportDetailByPeriod.data, days),
            calculateCommission(reportDetailByPeriod.data, days),
            calculateDeliveryCost(reportDetailByPeriod.data, days),
            calculateMarginalProfit(reportDetailByPeriod.data, days),
            calculateReturn(orders.data, days),
            calculateOrders(sales.data, days),
            calculateMargin(reportDetailByPeriod.data, days),
            calculateNetProfit(reportDetailByPeriod.data, days),
            calculateAverageProfit(sales.data, days),
            calculatePurchasePercentage(sales.data, reportDetailByPeriod.data, days),
            calculateROI(reportDetailByPeriod.data, days),
            calculateGrossProfit(sales.data, reportDetailByPeriod.data, days),
            calculateGrossProfit(sales.data, reportDetailByPeriod.data, days),
            calculateAdvertisementMetrics(add.data, calculateOrders(sales.data, days).sum, days),
            calculateCommissionFromProfit(reportDetailByPeriod.data, days),
            calculateCommissionFromDelivery(reportDetailByPeriod.data, days)
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
            fbo: await findFBSFBO(orders.data, warehouses.data, days),
            fbs: await findFBSFBO(orders.data, warehouses.data, days),
            toClient: stocks.data.filter(i => i.inWayToClient),
            fromClient: stocks.data.filter(i => i.inWayFromClient),
            notSorted: await calculateToClients(stocks.data, days),
            advertisment,
            commissionFromProfit,
            logisticsFromProfit
        };

        return res.json({ warehouses, warehousesWB, supplies, newOrders, reshipmentOrders, incomes, stocks, orders, sales, reportDetailByPeriod, add, info, content })
    }

    async getGeographyData(req, res) {
        const { id } = req.params
        const { days, brandName } = req.query

        const orders = await Order.findOne({ where: { userId: id, brandName } })
        const sales = await Sale.findOne({ where: { userId: id, brandName } })

        return res.json({ orders, sales })
    }

}


module.exports = new DataCollectionController()