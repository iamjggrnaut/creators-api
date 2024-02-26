function getDatesInInterval(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

function filterArrays(obj, days) {
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            console.log(key);
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

function calculateOrders(data, days) {

    const currentDate = new Date();
    // Получение даты 14 дней назад
    const lastDaysDate = new Date(currentDate);
    lastDaysDate.setDate(lastDaysDate.getDate() - days);
    // Получение даты 28 дней назад (предыдущие days дней)
    const previousDaysDate = new Date(lastDaysDate);
    previousDaysDate.setDate(previousDaysDate.getDate() - days);
    // Получение всех дней в последних 14 днях и предыдущих 14 днях
    const lastDays = getDatesInInterval(lastDaysDate, currentDate);
    const previousDays = getDatesInInterval(previousDaysDate, lastDaysDate);

    function dateMatches(date1, date2) {
        return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
    }

    const dataInLastDays = data.filter(item => {
        const itemDate = new Date(item.date);
        return lastDays.some(date => dateMatches(itemDate, date));
    });

    const dataInPreviousDays = data.filter(item => {
        const itemDate = new Date(item.date);
        return previousDays.some(date => dateMatches(itemDate, date));
    });

    function getTotalCostInPeriod(data) {
        return data.reduce((total, item) => total + (item.forPay || item.finishedPrice), 0);
    }

    const totalCostInLastDays = getTotalCostInPeriod(dataInLastDays);
    const totalCostInPreviousDays = getTotalCostInPeriod(dataInPreviousDays);
    const percentPriceChange = ((totalCostInLastDays - totalCostInPreviousDays) / totalCostInPreviousDays) * 100;
    const percentAmountChange = ((dataInLastDays.length - dataInPreviousDays.length) / dataInPreviousDays.length) * 100;

    let amount = dataInLastDays.length
    let priceArrayCurrent = dataInLastDays.map(item => (item.forPay || item.finishedPrice))
    let sum = priceArrayCurrent.reduce((a, b) => a + b, 0)

    const revenueIncrease = (totalCostInLastDays - totalCostInPreviousDays) / lastDays.length;
    const amountIncrease = (dataInLastDays.length - dataInPreviousDays.length) / lastDays.length;

    return {
        amount: amount,
        sum: sum,
        sumPercent: percentPriceChange.toFixed(2),
        amountPercent: percentAmountChange.toFixed(2),
        revenueIncrese: revenueIncrease,
        amountIncrese: amountIncrease,
    }
}

function calculateReturn(data, days) {

    data = data.filter(item => item.sale_dt || (item.return_amount && item.retail_price))

    const currentDate = new Date();
    const lastDaysDate = new Date(currentDate);
    lastDaysDate.setDate(lastDaysDate.getDate() - days);
    const previousDaysDate = new Date(lastDaysDate);
    previousDaysDate.setDate(previousDaysDate.getDate() - days);
    const lastDays = getDatesInInterval(lastDaysDate, currentDate);
    const previousDays = getDatesInInterval(previousDaysDate, lastDaysDate);

    const dataInLastDays = data.filter(item => {
        const itemDate = new Date(item.sale_dt);
        return lastDays.some(date => dateMatches(itemDate, date));
    });

    const dataInPreviousDays = data.filter(item => {
        const itemDate = new Date(item.sale_dt);
        return previousDays.some(date => dateMatches(itemDate, date));
    });

    const getTotalReturn = data => data.reduce((total, item) => total + item.retail_price * item.return_amount, 0);
    const totalReturnInLastDays = getTotalReturn(dataInLastDays);
    const totalReturnInPreviousDays = getTotalReturn(dataInPreviousDays);

    const totalReturnQuantityInLastDays = dataInLastDays.reduce((total, item) => total + item.return_amount, 0);
    const totalReturnQuantityInPreviousDays = dataInPreviousDays.reduce((total, item) => total + item.return_amount, 0);

    const percentReturnQuantityChange = ((totalReturnQuantityInLastDays - totalReturnQuantityInPreviousDays) / totalReturnQuantityInPreviousDays) * 100;
    const percentReturnSumChange = ((totalReturnInLastDays - totalReturnInPreviousDays) / totalReturnInPreviousDays) * 100;

    return {
        sum: totalReturnInLastDays.toFixed(2),
        amount: totalReturnQuantityInLastDays,
        percentAmount: percentReturnQuantityChange.toFixed(2),
        percentSum: percentReturnSumChange.toFixed(2),
    };
}

function calculateBuyout(orders, days) {

    const totalOrders = orders.length;

    // Подсчет количества отмененных заказов
    const canceledOrders = orders.filter(order => order.isCancel === true);
    const canceledOrdersCount = canceledOrders.length;

    // Вычисление доли выкупа
    const purchaseRate = (totalOrders - canceledOrdersCount) / totalOrders;

    // Получение доли выкупа для текущего периода
    const currentPeriodOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        const currentDate = new Date();
        const daysAgo = new Date(currentDate.setDate(currentDate.getDate() - days));
        return orderDate >= daysAgo && orderDate <= new Date();
    });

    const totalCurrentPeriodOrders = currentPeriodOrders.length;
    const canceledCurrentPeriodOrders = currentPeriodOrders.filter(order => order.isCancel === true).length;
    const purchaseRateCurrentPeriod = (totalCurrentPeriodOrders - canceledCurrentPeriodOrders) / (totalCurrentPeriodOrders || 1);

    // Получение доли выкупа для предыдущего периода
    const previousPeriodOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        const currentDate = new Date();
        const daysAgo = new Date(currentDate.setDate(currentDate.getDate() - (2 * days)));
        const daysBeforeAgo = new Date(currentDate.setDate(currentDate.getDate() - days));
        return orderDate >= daysAgo && orderDate <= daysBeforeAgo;
    });

    const totalPreviousPeriodOrders = previousPeriodOrders.length;
    const canceledPreviousPeriodOrders = previousPeriodOrders.filter(order => order.isCancel === true).length;
    const purchaseRatePreviousPeriod = (totalPreviousPeriodOrders - canceledPreviousPeriodOrders) / (totalPreviousPeriodOrders || 1);

    // Вычисление процентного роста
    const percentGrowth = ((purchaseRateCurrentPeriod - purchaseRatePreviousPeriod) / (purchaseRatePreviousPeriod || 1)) * 100;

    // Возвращаем результаты
    return {
        purchaseRate: purchaseRate.toFixed(2),
        percentGrowth: percentGrowth.toFixed(2)
    };
}


function dateMatches(date1, date2) {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
}


module.exports = {
    filterArrays,
    calculateOrders,
    calculateReturn,
    calculateBuyout
}