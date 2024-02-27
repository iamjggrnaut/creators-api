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

    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - days);

    // Фильтруем данные по текущему и предыдущему периодам
    const currentPeriodData = data.filter(item => new Date(item.date) >= previousDate && new Date(item.date) <= currentDate);
    const previousPeriodData = data.filter(item => new Date(item.date) < previousDate);

    // Подсчет суммы возвратов и их количества для текущего периода
    const currentReturnsSum = currentPeriodData.reduce((total, item) => total + (item.isCancel ? item.finishedPrice : 0), 0);
    const currentReturnsCount = currentPeriodData.filter(item => item.isCancel).length;

    // Подсчет суммы возвратов и их количества для предыдущего периода
    const previousReturnsSum = previousPeriodData.reduce((total, item) => total + (item.isCancel ? item.finishedPrice : 0), 0);
    const previousReturnsCount = previousPeriodData.filter(item => item.isCancel).length;

    // Подсчет доли роста суммы возвратов и количества возвратов
    const returnsSumGrowth = ((currentReturnsSum - previousReturnsSum) / previousReturnsSum) * 100;
    const returnsCountGrowth = ((currentReturnsCount - previousReturnsCount) / previousReturnsCount) * 100;

    // Возвращаем результаты
    return {
        currentReturnsSum,
        currentReturnsCount,
        returnsSumGrowth,
        returnsCountGrowth
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

function calculateAverageReceipt(data, days) {
    const currentDate = new Date();
    const lastDaysDate = new Date(currentDate);
    lastDaysDate.setDate(lastDaysDate.getDate() - days);
    const previousDaysDate = new Date(lastDaysDate);
    previousDaysDate.setDate(previousDaysDate.getDate() - days);

    const lastDays = getDatesInInterval(lastDaysDate, currentDate);
    const previousDays = getDatesInInterval(previousDaysDate, lastDaysDate);

    const dataInLastDays = data.filter(item => {
        const itemDate = new Date(item.date);
        return lastDays.some(date => dateMatches(itemDate, date));
    });

    const dataInPreviousDays = data.filter(item => {
        const itemDate = new Date(item.date);
        return previousDays.some(date => dateMatches(itemDate, date));
    });

    const sumLastDays = dataInLastDays.reduce((sum, item) => sum + item.forPay, 0);
    const sumPreviousDays = dataInPreviousDays.reduce((sum, item) => sum + item.forPay, 0);
    const averageReceiptLastDays = sumLastDays / dataInLastDays.length;
    const averageReceiptPreviousDays = sumPreviousDays / dataInPreviousDays.length;

    const growthRate = ((averageReceiptLastDays - averageReceiptPreviousDays) / averageReceiptPreviousDays) * 100;

    return {
        averageReceiptLastDays,
        growthRate
    };
}

function calculatePenalty(data, days) {
    data = data.filter(item => item.rr_dt)
    const currentDate = new Date();
    const lastDaysDate = new Date(currentDate);
    lastDaysDate.setDate(lastDaysDate.getDate() - days);

    // Функция для проверки, входит ли дата в заданный период
    function isInPeriod(itemDate, startDate, endDate) {
        return itemDate >= startDate && itemDate <= endDate;
    }

    // Фильтрация данных по заданному периоду
    const dataInPeriod = data.filter(item => {
        const itemDate = new Date(item.rr_dt); // Используем дату продажи
        return isInPeriod(itemDate, lastDaysDate, currentDate);
    });

    // Подсчет суммы штрафов
    const totalPenalty = dataInPeriod.reduce((sum, item) => sum + item.penalty, 0);

    return totalPenalty;
}

function calculateAdditionalPayment(data, days) {
    const currentDate = new Date();
    // Получение даты days дней назад
    const lastDaysDate = new Date(currentDate);
    lastDaysDate.setDate(lastDaysDate.getDate() - days);

    // Функция для проверки, попадает ли дата объекта в заданный период
    function isWithinPeriod(item) {
        const itemDate = new Date(item.rr_dt); // Используем дату создания записи
        return itemDate >= lastDaysDate && itemDate <= currentDate;
    }

    // Фильтрация данных для получения записей, попадающих в заданный период
    const dataInPeriod = data.filter(isWithinPeriod);

    // Используем reduce для вычисления суммы дополнительных платежей
    const totalAdditionalPayment = dataInPeriod.reduce((total, item) => total + item.additional_payment, 0);

    return totalAdditionalPayment;
}

function calculateCommission(data, days) {

    data = data.filter(item => item.retail_price && item.rr_dt)

    const currentDate = new Date();
    // Получение даты days дней назад
    const lastDaysDate = new Date(currentDate);
    lastDaysDate.setDate(lastDaysDate.getDate() - days);

    // Функция для проверки, попадает ли дата объекта в заданный период
    function isWithinPeriod(item) {
        const itemDate = new Date(item.rr_dt);
        return itemDate >= lastDaysDate && itemDate <= currentDate;
    }

    // Фильтрация данных для получения записей, попадающих в заданный период
    const dataInPeriod = data.filter(isWithinPeriod);

    // Используем reduce для вычисления суммы комиссии
    const totalCommission = dataInPeriod.reduce((total, item) => total + (item.quantity * item.retail_price * item.commission_percent), 0);

    return totalCommission;
}

function calculateDeliveryCost(data, days) {
    const currentDate = new Date();
    // Получение даты days дней назад
    const lastDaysDate = new Date(currentDate);
    lastDaysDate.setDate(lastDaysDate.getDate() - days);

    // Функция для проверки, попадает ли дата объекта в заданный период
    function isWithinPeriod(item) {
        const itemDate = new Date(item.rr_dt); // Используем дату создания записи
        return itemDate >= lastDaysDate && itemDate <= currentDate;
    }

    // Фильтрация данных для получения записей, попадающих в заданный период
    const dataInPeriod = data.filter(isWithinPeriod);

    // Используем reduce для вычисления суммы расходов на логистику
    const totalDeliveryCost = dataInPeriod.reduce((total, item) => total + item.delivery_rub, 0);

    return totalDeliveryCost;
}

function calculateMarginalProfit(data, days) {

    // data = data.filter(item => item.ppvz_for_pay)

    // Получаем текущую дату
    const currentDate = new Date();

    // Получаем дату предыдущего периода
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - days);

    // Функция для вычисления маржинальной прибыли из массива данных
    function calculateProfit(item) {
        return item.ppvz_for_pay - item.retail_price * item.quantity;
    }

    // Функция для фильтрации объектов по датам
    function filterByDate(item) {
        const itemDate = new Date(item.rr_dt);
        return itemDate >= previousDate && itemDate <= currentDate;
    }

    // Фильтруем данные для текущего периода
    const currentPeriodData = data.filter(filterByDate);

    // Считаем маржинальную прибыль для текущего периода
    const currentMarginalProfit = currentPeriodData.reduce((total, item) => total + calculateProfit(item), 0);

    // Фильтруем данные для предыдущего периода
    const previousPeriodData = data.filter(item => !filterByDate(item));

    // Считаем маржинальную прибыль для предыдущего периода
    const previousMarginalProfit = previousPeriodData.reduce((total, item) => total + calculateProfit(item), 0);

    // Вычисляем долю роста маржинальной прибыли
    const profitGrowth = ((currentMarginalProfit - previousMarginalProfit) / previousMarginalProfit || 1) * 100;

    return {
        currentMarginalProfit,
        previousMarginalProfit,
        profitGrowth
    };
}

function calculateMargin(data, days) {
    // Функция для вычисления маржинальной стоимости
    function calculateGrossMargin(deliveryRub, retailPrice) {
        return retailPrice - deliveryRub;
    }

    // Получаем текущую дату
    const currentDate = new Date();

    // Получаем дату days дней назад
    const lastDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Фильтруем данные за текущий и предыдущий периоды
    const currentPeriodData = data.filter(item => new Date(item.rr_dt) >= lastDate && new Date(item.rr_dt) <= currentDate);
    const previousPeriodData = data.filter(item => {
        const date = new Date(item.rr_dt);
        return date < lastDate;
    });

    // Суммируем переменные расходы за текущий и предыдущий периоды
    const currentDeliverySum = currentPeriodData.reduce((sum, item) => sum + item.delivery_rub, 0);
    const previousDeliverySum = previousPeriodData.reduce((sum, item) => sum + item.delivery_rub, 0);

    // Суммируем стоимость товара за текущий и предыдущий периоды
    const currentRetailPriceSum = currentPeriodData.reduce((sum, item) => sum + item.retail_price, 0);
    const previousRetailPriceSum = previousPeriodData.reduce((sum, item) => sum + item.retail_price, 0);

    // Вычисляем маржинальную стоимость для текущего и предыдущего периодов
    const currentGrossMargin = calculateGrossMargin(currentDeliverySum, currentRetailPriceSum);
    const previousGrossMargin = calculateGrossMargin(previousDeliverySum, previousRetailPriceSum);

    // Вычисляем долю роста маржинальной стоимости
    const marginGrowth = ((currentGrossMargin - previousGrossMargin) / previousGrossMargin) * 100;

    // Возвращаем результаты
    return {
        currentGrossMargin: currentGrossMargin,
        previousGrossMargin: previousGrossMargin,
        marginGrowth: marginGrowth
    };
}

function calculateNetProfit(data, days) {
    // Функция для вычисления маржинальной стоимости
    function calculateGrossMargin(deliveryRub, retailPrice) {
        return retailPrice - deliveryRub;
    }

    // Получаем текущую дату
    const currentDate = new Date();

    // Получаем дату days дней назад
    const lastDate = new Date(currentDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Фильтруем данные за текущий и предыдущий периоды
    const currentPeriodData = data.filter(item => new Date(item.rr_dt) >= lastDate && new Date(item.rr_dt) <= currentDate);
    const previousPeriodData = data.filter(item => {
        const date = new Date(item.rr_dt);
        return date < lastDate;
    });

    // Суммируем стоимость товара за текущий и предыдущий периоды
    const currentRetailPriceSum = currentPeriodData.reduce((sum, item) => sum + item.ppvz_for_pay, 0);
    const previousRetailPriceSum = previousPeriodData.reduce((sum, item) => sum + item.ppvz_for_pay, 0);

    // Вычисляем долю роста маржинальной стоимости
    const marginGrowth = ((currentRetailPriceSum - previousRetailPriceSum) / previousRetailPriceSum) * 100;

    // Возвращаем результаты
    return {
        sum: currentRetailPriceSum,
        marginGrowth: marginGrowth
    };
}

function calculateAverageProfit(data, days) {
    const currentDate = new Date();
    const lastDaysDate = new Date(currentDate);
    lastDaysDate.setDate(lastDaysDate.getDate() - days);
    const previousDaysDate = new Date(lastDaysDate);
    previousDaysDate.setDate(previousDaysDate.getDate() - days);

    const lastDays = getDatesInInterval(lastDaysDate, currentDate);
    const previousDays = getDatesInInterval(previousDaysDate, lastDaysDate);

    const dataInLastDays = data.filter(item => {
        const itemDate = new Date(item.date);
        return lastDays.some(date => dateMatches(itemDate, date));
    });

    const dataInPreviousDays = data.filter(item => {
        const itemDate = new Date(item.date);
        return previousDays.some(date => dateMatches(itemDate, date));
    });

    const sumLastDays = dataInLastDays.reduce((sum, item) => sum + item.forPay, 0);
    const sumPreviousDays = dataInPreviousDays.reduce((sum, item) => sum + item.forPay, 0);
    const averageReceiptLastDays = sumLastDays / days;
    const averageReceiptPreviousDays = sumPreviousDays / days;

    const growthRate = ((averageReceiptLastDays - averageReceiptPreviousDays) / averageReceiptPreviousDays) * 100;

    return {
        averageReceiptLastDays,
        growthRate
    };
}

function calculatePurchasePercentage(sales, report, days) {

    const currentDate = new Date();
    const fromDate = new Date(currentDate);
    fromDate.setDate(fromDate.getDate() - days); // Рассчитываем дату начала периода

    const salesInPeriod = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= fromDate && saleDate <= currentDate;
    });

    // Считаем общее количество проданных товаров за указанный период
    const totalSalesAmount = salesInPeriod.reduce((total, sale) => total + sale.quantity, 0);

    // Считаем общее количество возвратов за указанный период
    const totalReturnAmount = report
        .filter(item => {
            const returnDate = new Date(item.date);
            return returnDate >= fromDate && returnDate <= currentDate;
        })
        .reduce((total, item) => total + item.return_amount, 0);

    // Вычисляем процент выкупа
    const purchasePercentage = ((totalSalesAmount - totalReturnAmount) / totalSalesAmount) * 100;

    return purchasePercentage;
}

function calculateROI(data, days) {
    // Фильтрация данных за указанный период
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - days);
    const filteredData = data.filter(item => {
        const itemDate = new Date(item.rr_dt); // Предполагается, что в объекте есть поле date с датой
        return itemDate >= startDate && itemDate <= currentDate;
    });

    // Вычисление общих затрат за период (стоимость товаров + затраты на доставку)
    const totalCost = filteredData.reduce((acc, item) => acc + item.delivery_rub, 0);

    // Вычисление общей выручки за период
    const totalRevenue = filteredData.reduce((acc, item) => acc + item.retail_price, 0);

    // Вычисление ROI
    const roi = ((totalRevenue - totalCost) / totalCost) * 100;

    return roi;
}

function calculateGrossProfit(salesData, deliveryData, days) {
    // Функция для получения дат последних days дней
    function getLastDaysDates(days) {
        const currentDate = new Date();
        const lastDaysDates = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            lastDaysDates.push(date.toISOString().split('T')[0]);
        }
        return lastDaysDates;
    }

    // Функция для фильтрации данных за последние days дней
    function filterDataByLastDays(data, lastDaysDates) {

        const getDateProp = (item) => {
            if (item.date) {
                return item.date
            } else if (item.rr_dt) {
                return item.rr_dt
            }
        }

        return data.filter(item => {
            let date = getDateProp(item)
            return lastDaysDates.includes(date.split('T')[0] || date.split('T')[0])
        });
    }

    // Получаем даты последних days дней
    const lastDaysDates = getLastDaysDates(days);

    // Фильтруем данные о продажах за последние days дней
    const filteredSalesData = filterDataByLastDays(salesData, lastDaysDates);

    // Фильтруем данные о доставках за последние days дней
    const filteredDeliveryData = filterDataByLastDays(deliveryData, lastDaysDates);

    // Суммируем стоимость товаров из данных о продажах
    const totalSalesCost = filteredSalesData.reduce((total, item) => total + item.forPay, 0);

    // Суммируем затраты на доставку
    const totalDeliveryCost = filteredDeliveryData.reduce((total, item) => total + item.delivery_rub, 0);

    // Вычисляем валовую прибыль
    const grossProfit = totalSalesCost - totalDeliveryCost;

    return (grossProfit / totalSalesCost) * 100;
}

function calculateToClients(data, days) {

    data = data.filter(item => item.inWayToClient)

    // Получаем текущую дату
    const currentDate = new Date();

    // Вычисляем дату days дней назад
    const startDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Фильтруем данные за период
    const filteredData = data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= currentDate;
    });

    // Считаем количество товаров в пути к клиенту
    const goodsInTransit = filteredData.reduce((total, item) => {
        return item.isSupply ? total + item.quantity : total;
    }, 0);

    return goodsInTransit;
}

function calculateCommissionFromProfit(data, days) {
    // Фильтруем объекты за указанный период
    const filteredData = data.filter(item => {
        const currentDate = new Date(item.rr_dt);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days); // Начальная дата = текущая дата - days
        return currentDate >= startDate && currentDate <= new Date(); // Проверяем, попадает ли дата объекта в период
    });

    // Вычисляем сумму комиссии в рублях
    const commissionSum = filteredData.reduce((sum, item) => sum + (item.commission_percent * (item.retail_price * item.quantity)), 0);

    // Вычисляем средний процент комиссии
    const commissionPercent = filteredData.reduce((sum, item) => sum + item.commission_percent, 0)

    // Находим предыдущий период
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - 2 * days); // Начальная дата предыдущего периода
    const previousEndDate = new Date();
    previousEndDate.setDate(previousEndDate.getDate() - days); // Конечная дата предыдущего периода

    // Фильтруем объекты за предыдущий период
    const previousData = data.filter(item => {
        const currentDate = new Date(item.rr_dt);
        return currentDate >= previousStartDate && currentDate <= previousEndDate; // Проверяем, попадает ли дата объекта в предыдущий период
    });

    // Вычисляем сумму комиссии за предыдущий период
    const previousCommissionSum = previousData.reduce((sum, item) => sum + (item.commission_percent * (item.retail_price * item.quantity)), 0);
    const previousCommissionPercent = previousData.reduce((sum, item) => sum + item.commission_percent, 0);

    // Вычисляем долю роста суммы комиссии по отношению к предыдущему периоду
    const commissionSumGrowth = (commissionSum / previousCommissionSum) * 100;

    // Вычисляем долю роста комиссии в процентах по отношению к предыдущему периоду
    const commissionPercentGrowth = (commissionSumGrowth / previousCommissionPercent) * 100;

    return {
        commissionSum,
        commissionPercent,
        commissionSumGrowth,
        commissionPercentGrowth
    };
}

function calculateCommissionFromDelivery(data, days) {
    // Фильтруем объекты за указанный период
    const filteredData = data.filter(item => {
        const itemDate = new Date(item.rr_dt);
        const currentDate = new Date();
        const periodStartDate = new Date(currentDate.setDate(currentDate.getDate() - days));
        return itemDate >= periodStartDate && itemDate <= new Date();
    });

    // Считаем сумму комиссии и доставки
    const deliverySum = filteredData.reduce((total, item) => total + item.delivery_rub, 0);

    // Считаем размер комиссии в процентах от выручки
    const totalSales = filteredData.reduce((total, item) => total + item.retail_price, 0);

    // Считаем долю роста суммы комиссии по отношению к предыдущему периоду
    // Предполагается, что данные отсортированы по дате в порядке возрастания
    const previousPeriodData = data.filter(item => {
        const itemDate = new Date(item.rr_dt);
        const previousPeriodStartDate = new Date(new Date().setDate(new Date().getDate() - days * 2)); // Предыдущий период
        return itemDate >= previousPeriodStartDate && itemDate < new Date();
    });
    const totalSalesPrev = previousPeriodData.reduce((total, item) => total + item.retail_price, 0);
    const deliveryPrev = previousPeriodData.reduce((total, item) => total + item.delivery_rub, 0);

    // Считаем долю роста суммы доставки по отношению к предыдущему периоду
    const previousDeliverySum = previousPeriodData.reduce((total, item) => total + item.delivery_rub, 0);
    const deliveryGrowth = (deliverySum / previousDeliverySum) * 100;

    const percent = (deliverySum / totalSales) * 100
    const percentPrev = (deliveryPrev / totalSalesPrev) * 100

    const percentGrowth = ((percent - percentPrev) / percentPrev) * 100


    return {
        deliverySum,
        deliveryGrowth,
        percent,
        percentGrowth
    };
}

const abcAnalysis = (products) => {

    const totalSales = products.reduce((total, product) => total + product.finishedPrice, 0);
    const totalQuantity = products.length

    // Ранжирование товаров по убыванию объема продаж
    const sortedProducts = products.sort((a, b) => b.finishedPrice - a.finishedPrice);

    // Рассчитываем долю каждого товара в общем объеме продаж и присваиваем категорию ABC
    const categoryA = sortedProducts.slice(0, Math.ceil(products.length * 0.2));
    const categoryB = sortedProducts.slice(Math.ceil(products.length * 0.2), Math.ceil(products.length * 0.5));
    const categoryC = sortedProducts.slice(Math.ceil(products.length * 0.5));

    [categoryA, categoryB, categoryC].forEach(category => {

        // Рассчитываем долю каждого товара в общем объеме продаж и присваиваем свойства
        category.forEach(product => {
            product.quantityPercentage = (category.length / totalQuantity) * 100;
            product.amount = (product.finishedPrice * product.quantity) || 1;
            product.salesPercentage = (category.map(i => i.finishedPrice).reduce((a, b) => a + b, 0) / totalSales) * 100;
            product.abcTotalAmount = category.length
            product.abcTotalSales = category.map(i => i.finishedPrice).reduce((a, b) => a + b, 0) || 0
            product.prodName = product.subject
            // Добавьте свои дополнительные действия, если необходимо
        });
    });
    return {
        categoryA: { totalAmount: categoryA[0].abcTotalAmount, totalSales: categoryA[0].abcTotalSales, quantityPercentage: categoryA[0].quantityPercentage, salesPercentage: categoryA[0].salesPercentage },
        categoryB: { totalAmount: categoryB[0].abcTotalAmount, totalSales: categoryB[0].abcTotalSales, quantityPercentage: categoryB[0].quantityPercentage, salesPercentage: categoryB[0].salesPercentage },
        categoryC: { totalAmount: categoryC[0].abcTotalAmount, totalSales: categoryC[0].abcTotalSales, quantityPercentage: categoryC[0].quantityPercentage, salesPercentage: categoryC[0].salesPercentage }
    }
}


module.exports = {
    calculateToClients,
    calculateCommissionFromProfit,
    calculateROI,
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
    calculateMargin,
    calculateNetProfit,
    calculateAverageProfit,
    calculatePurchasePercentage,
    calculateGrossProfit,
    calculateCommissionFromDelivery,
    abcAnalysis,
}