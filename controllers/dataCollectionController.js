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

    async getAllForUser(req, res) {
        const { id } = req.params
        const data = await DataCollection.findAll({ where: { userId: id } })
        return res.json(data)
    }

    async getDataCollection(req, res) {
        const { id } = req.params
        const { days, brandName } = req.query


        try {
            const data = await DataCollection.findOne({ where: { userId: id, brandName } });

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
                grossProfit,
                tax,
                netProfit,
                averageProfit,
                buyoutPercentage,
                roi,
                vpProfitMargin,
                opProfitMargin,
                fbo,
                fbs,
                toClient,
                fromClient,
                notSorted,
                advertisment,
                commissionFromProfit,
                logisticsFromProfit
            ] = await Promise.all([
                calculateOrders(data.orders, days),
                calculateOrders(data.sales, days),
                calculateReturn(data.orders, days),
                calculateBuyout(data.orders, days),
                calculateAverageReceipt(data.sales, days),
                calculatePenalty(data.reportDetailByPeriod, days),
                calculateAdditionalPayment(data.reportDetailByPeriod, days),
                calculateCommission(data.reportDetailByPeriod, days),
                calculateDeliveryCost(data.reportDetailByPeriod, days),
                calculateMarginalProfit(data.reportDetailByPeriod, days),
                calculateReturn(data.orders, days),
                calculateOrders(data.sales, days),
                calculateMargin(data.reportDetailByPeriod, days),
                { sum: await calculateOrders(data.sales, days), percent: 0 },
                { sum: 0, percent: 0 },
                calculateNetProfit(data.reportDetailByPeriod, days),
                calculateAverageProfit(data.sales, days),
                calculatePurchasePercentage(data.sales, data.reportDetailByPeriod, days),
                calculateROI(data.reportDetailByPeriod, days),
                calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
                calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
                findFBSFBO(data.orders, data.warehouses, days),
                findFBSFBO(data.orders, data.warehouses, days),
                data.stocks.filter(i => i.inWayToClient),
                data.stocks.filter(i => i.inWayFromClient),
                calculateToClients(data.stocks, days),
                calculateAdvertisementMetrics(data.add, calculateOrders(data.sales, days).sum, days),
                calculateCommissionFromProfit(data.reportDetailByPeriod, days),
                calculateCommissionFromDelivery(data.reportDetailByPeriod, days)
            ]);

            const content = {
                orderStat,
                salesStat,
                returned,
                buyout,
                averageCheck,
                chartData: null,
                penalty,
                additionalPayment,
                wbComission,
                logistics,
                marginRevenue,
                lostProfit,
                profit,
                marginCosts,
                grossProfit,
                tax,
                netProfit,
                averageProfit,
                buyoutPercentage,
                roi,
                vpProfitMargin,
                opProfitMargin,
                yearProfitMargin: null,
                fbo,
                fbs,
                toClient,
                fromClient,
                notSorted,
                advertisment,
                commissionFromProfit,
                logisticsFromProfit
            };

            return res.json({ ...data.dataValues, content });
        } catch (error) {
            console.error('Ошибка при получении данных из базы данных:', error);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }

    async getFilteredCollection(req, res) {
        const { id } = req.params
        const { days, brandName } = req.query

        try {
            const data = await DataCollection.findOne({ where: { userId: id, brandName } });

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
                grossProfit,
                tax,
                netProfit,
                averageProfit,
                buyoutPercentage,
                roi,
                vpProfitMargin,
                opProfitMargin,
                fbo,
                fbs,
                toClient,
                fromClient,
                notSorted,
                advertisment,
                commissionFromProfit,
                logisticsFromProfit
            ] = await Promise.all([
                calculateOrders(data.orders, days),
                calculateOrders(data.sales, days),
                calculateReturn(data.orders, days),
                calculateBuyout(data.orders, days),
                calculateAverageReceipt(data.sales, days),
                calculatePenalty(data.reportDetailByPeriod, days),
                calculateAdditionalPayment(data.reportDetailByPeriod, days),
                calculateCommission(data.reportDetailByPeriod, days),
                calculateDeliveryCost(data.reportDetailByPeriod, days),
                calculateMarginalProfit(data.reportDetailByPeriod, days),
                calculateReturn(data.orders, days),
                calculateOrders(data.sales, days),
                calculateMargin(data.reportDetailByPeriod, days),
                { sum: await calculateOrders(data.sales, days), percent: 0 },
                { sum: 0, percent: 0 },
                calculateNetProfit(data.reportDetailByPeriod, days),
                calculateAverageProfit(data.sales, days),
                calculatePurchasePercentage(data.sales, data.reportDetailByPeriod, days),
                calculateROI(data.reportDetailByPeriod, days),
                calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
                calculateGrossProfit(data.sales, data.reportDetailByPeriod, days),
                findFBSFBO(data.orders, data.warehouses, days),
                findFBSFBO(data.orders, data.warehouses, days),
                data.stocks.filter(i => i.inWayToClient),
                data.stocks.filter(i => i.inWayFromClient),
                calculateToClients(data.stocks, days),
                calculateAdvertisementMetrics(data.add, calculateOrders(data.sales, days).sum, days),
                calculateCommissionFromProfit(data.reportDetailByPeriod, days),
                calculateCommissionFromDelivery(data.reportDetailByPeriod, days)
            ]);

            const content = {
                orderStat,
                salesStat,
                returned,
                buyout,
                averageCheck,
                chartData: null,
                penalty,
                additionalPayment,
                wbComission,
                logistics,
                marginRevenue,
                lostProfit,
                profit,
                marginCosts,
                grossProfit,
                tax,
                netProfit,
                averageProfit,
                buyoutPercentage,
                roi,
                vpProfitMargin,
                opProfitMargin,
                yearProfitMargin: null,
                fbo,
                fbs,
                toClient,
                fromClient,
                notSorted,
                advertisment,
                commissionFromProfit,
                logisticsFromProfit
            };

            return res.json({ ...data.dataValues, content });
        } catch (error) {
            console.error('Ошибка при получении данных из базы данных:', error);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }

}


module.exports = new DataCollectionController()