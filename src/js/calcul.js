function getProfit(totalBuy, totalSell, currentPrice, balance) {
    const buyTotal = parseFloat(totalBuy);
    const sellTotal = parseFloat(totalSell);
    const price = parseFloat(currentPrice);
    const bal = parseFloat(balance);

    if (isNaN(buyTotal) || isNaN(sellTotal) || isNaN(price) || isNaN(bal)) {
        return 'N/A';
    }

    const totalInvestment = buyTotal - sellTotal;
    const currentValue = price * bal;
    const profit = currentValue - totalInvestment;

    return profit.toFixed(2);
}

function getRecupShad(totalBuy, totalSell, maxWanted) {
    if (totalSell > 0) {
        if (maxWanted < totalBuy) {
            return Math.round(totalSell - totalBuy + maxWanted, 2);
        } else {
            return Math.round(totalSell, 2);
        }
    }
    return 0;
}

function getRecupTp1(totalBuy, totalSell, maxWanted, recupShad, recupTpX, totalShad) {
    let recupTp1 = (maxWanted) + (totalSell) < (totalBuy) ? (totalBuy) - (totalSell) - (maxWanted) :
        (recupTpX) - (recupShad) + (totalShad) * (recupTpX);
    if ((recupTp1) <= 1) {
        recupTp1 = (recupTpX);
    }
    return recupTp1;
}

function getRecupTpX(maxWanted, ratioShad) {
    return maxWanted * ratioShad * .5;
}

function getDoneShad(totalBuy, totalSell, maxWanted, recupShad, recupTpX) {
    if (Math.abs(totalBuy - maxWanted) > 0.5 && totalSell < 0.95 * Math.abs(totalBuy - maxWanted)) {
        return -1;
    } else if (recupShad >= 0.95 * recupTpX) {
        return -1 + Math.round(1.1 + recupShad / recupTpX, 2);
    } else {
        return 0;
    }
}

function getPriceTp1(recupTp1, amountTp1) {
    return parseFloat(recupTp1) / parseFloat(amountTp1);
}

function getAmountTp1(recupTp1, averageEntryPrice, balance, totalBuy, totalSell, totalShad) {
    const parsedRecupTp1 = parseFloat(recupTp1);
    const parsedEntryAvg = parseFloat(averageEntryPrice);
    const parsedBalance = parseFloat(balance);
    const parsedTotalBuy = parseFloat(totalBuy);
    const parsedTotalSell = parseFloat(totalSell);

    if (totalShad > -1) {
        return 0.5 * parsedBalance;
    } else if (parsedRecupTp1 / parsedEntryAvg < parsedBalance) {
        return parsedRecupTp1 / parsedEntryAvg;
    } else {
        return parsedRecupTp1 * parsedBalance / (parsedTotalBuy - parsedTotalSell);
    }
}

function getTotalBuy(asset, exchangeId, trades) {
    const filteredTrades = trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'buy' && trade.platform === exchangeId);
    const buyTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
    return buyTotal.toFixed(2);
}

function getTotalAmount(asset, exchangeId, trades) {
    const filteredTrades = trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'buy' && trade.platform === exchangeId);
    const amountBuy = filteredTrades.reduce((total, trade) => total + parseFloat(trade.amount), 0);
    return amountBuy;
}

function getMaxWanted(rank, totalBuy) {
    switch (true) {
        case (rank > 1000):
            return (Math.min(totalBuy, 5)).toFixed(2);
        case (rank > 800):
            return (Math.min(totalBuy, 10)).toFixed(2);
        case (rank > 600):
            return (Math.min(totalBuy, 25)).toFixed(2);
        case (rank > 400):
            return (Math.min(totalBuy, 50)).toFixed(2);
        case (rank > 300):
            return (Math.min(totalBuy, 100)).toFixed(2);
        case (rank > 200):
            return (Math.min(totalBuy, 200)).toFixed(2);
        case (rank <= 200):
            return totalBuy;
    }
}

function getRatioShad(asset, exchangeId, strats) {
    const strategy = strats[0][asset][exchangeId];

    if (strategy) {
        switch (strategy) {
            case 'strategy1':
                return 2;
            case 'strategy2':
                return 4;
            case 'strategy3':
                return 8;
            default:
                return '8'; //'NULL'
        }
    } else {
        // Handle the case when strategy doesn't exist
        return '8'; //'NULL' or a default value of your choice
    }
}

function getTotalSell(asset, trades) {
    const filteredTrades = trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'sell');
    const sellTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
    return sellTotal.toFixed(2);
}

function getAverageEntryPrice(asset, trades) {
    const filteredTrades = trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'buy');
    if (filteredTrades.length === 0) {
        return 0;
    }
    const entryPrices = filteredTrades.map(trade => parseFloat(trade.price));
    const averageEntryPrice = entryPrices.reduce((total, price) => total + price, 0) / entryPrices.length;
    return averageEntryPrice;
}

function getBalance(asset, sortedBalances) {
    const balance = sortedBalances.find(item => item.symbol === asset);
    return balance ? balance.balance : 'N/A';
}

function getCryptoRank(asset, cmcData) {
    const crypto = cmcData.find(item => item.symbol === asset);
    return crypto ? parseInt(crypto.cmc_rank) : 0;
}

function getCryptoIconUrl(asset, cmcData) {
    const crypto = cmcData.find(item => item.symbol === asset);
    return crypto ? 'https://s2.coinmarketcap.com/static/img/coins/32x32/'+ parseInt(crypto.id)+'.png' : '';
}

function getCurrentPrice(asset, cmcData) {
    const crypto = cmcData.find(item => item.symbol === asset);
    return crypto ? crypto.quote.USD.price.toFixed(7) : 'N/A';
}

function getCryptoPercentChange(asset, timePeriod, cmcData) {
    const crypto = cmcData.find(item => item.symbol === asset);
    if (crypto) {
        const percentChange = crypto.quote.USD[`percent_change_${timePeriod}`];
        return percentChange ? percentChange.toFixed(2) + '%' : 'N/A';
    } else {
        return 'N/A';
    }
}

function getPercentageDifference(currentPrice, averageEntryPrice) {
    const price = parseFloat(currentPrice);
    const avgEntryPrice = parseFloat(averageEntryPrice);
    if (isNaN(price) || isNaN(avgEntryPrice)) {
        return 'N/A';
    }
    const percentageDifference = ((price - avgEntryPrice) / avgEntryPrice) * 100;
    return percentageDifference.toFixed(2) + '%';
}

function getCurrentPossession(currentPrice, balance) {
    if (isNaN(currentPrice) || isNaN(balance)) {
        return 0;
    }
    const currentPossession = (currentPrice * balance).toFixed(2);
    return currentPossession;
}

function getPriceTp2(recupTpX, amountTp2) {
    return recupTpX / amountTp2;
}

function getPriceTp3(recupTpX, amountTp3) {
    return recupTpX / amountTp3;
}

function getPriceTp4(recupTpX, amountTp4) {
    return recupTpX / amountTp4;
}

function getPriceTp5(recupTpX, amountTp5) {
    return recupTpX / amountTp5;
}

function getAmountTp2(balance, amountTp1) {
    return 0.5 * (balance - amountTp1);
}

function getAmountTp3(balance, amountTp1, amountTp2) {
    return 0.5 * (balance - amountTp1 - amountTp2);
}

function getAmountTp4(balance, amountTp1, amountTp2, amountTp3) {
    return 0.5 * (balance - amountTp1 - amountTp2 - amountTp3);
}

function getAmountTp5(balance, amountTp1, amountTp2, amountTp3, amountTp4) {
    return 0.5 * (balance - amountTp1 - amountTp2 - amountTp3 - amountTp4);
}

function getAllCalculs(item, cmcData, trades, strats, buyOrders, sellOrders) {
    //console.log(item);
    const { symbol, platform, balance } = item;

    const asset = symbol;
    const exchangeId = platform;

    const rank = getCryptoRank(asset, cmcData);
    const totalSell = getTotalSell(asset, trades);
    const currentPrice = getCurrentPrice(asset, cmcData);
    const iconUrl = getCryptoIconUrl(asset, cmcData);
    const averageEntryPrice = getAverageEntryPrice(asset, trades);
    const openBuyOrders = buyOrders[asset] || 0;
    const openSellOrders = sellOrders[asset] || 0;

    const ratioShad = getRatioShad(asset, exchangeId, strats);
    const totalBuy = getTotalBuy(asset, exchangeId, trades);
    const totalAmount = getTotalAmount(asset, exchangeId, trades);

    const cryptoPercentChange24h = getCryptoPercentChange(asset, '24h', cmcData);
    const cryptoPercentChange7d = getCryptoPercentChange(asset, '7d', cmcData);
    const cryptoPercentChange30d = getCryptoPercentChange(asset, '30d', cmcData);
    const cryptoPercentChange60d = getCryptoPercentChange(asset, '60d', cmcData);
    const cryptoPercentChange90d = getCryptoPercentChange(asset, '90d', cmcData);

    const maxWanted = getMaxWanted(rank, totalBuy);
    const recupShad = getRecupShad(totalBuy, totalSell, maxWanted);
    const percentageDifference = getPercentageDifference(currentPrice, averageEntryPrice);
    const currentPossession = getCurrentPossession(currentPrice, balance);
    const profit = getProfit(totalBuy, totalSell, currentPrice, balance);
    const recupTpX = getRecupTpX(maxWanted, ratioShad);
    const totalShad = getDoneShad(totalBuy, totalSell, maxWanted, recupShad, recupTpX);
    const recupTp1 = getRecupTp1(totalBuy, totalSell, maxWanted, recupShad, recupTpX, totalShad);

    const amountTp1 = getAmountTp1(recupTp1, averageEntryPrice, balance, totalBuy, totalSell, totalShad);
    const amountTp2 = getAmountTp2(balance, amountTp1);
    const amountTp3 = getAmountTp3(balance, amountTp1, amountTp2);
    const amountTp4 = getAmountTp4(balance, amountTp1, amountTp2, amountTp3);
    const amountTp5 = getAmountTp5(balance, amountTp1, amountTp2, amountTp3, amountTp4);

    const priceTp1 = getPriceTp1(recupTp1, amountTp1);
    const priceTp2 = getPriceTp2(recupTpX, amountTp2);
    const priceTp3 = getPriceTp3(recupTpX, amountTp3);
    const priceTp4 = getPriceTp4(recupTpX, amountTp4);
    const priceTp5 = getPriceTp5(recupTpX, amountTp5);

    return {
        iconUrl,
        asset,
        ratioShad,
        totalShad,
        rank,
        averageEntryPrice,
        totalBuy,
        maxWanted,
        percentageDifference,
        currentPrice,
        currentPossession,
        profit,
        totalSell,
        recupShad,
        openBuyOrders,
        openSellOrders,
        totalAmount,
        balance,
        recupTp1,
        recupTpX,
        amountTp1,
        priceTp1,
        amountTp2,
        priceTp2,
        amountTp3,
        priceTp3,
        amountTp4,
        priceTp4,
        amountTp5,
        priceTp5,
        cryptoPercentChange24h,
        cryptoPercentChange7d,
        cryptoPercentChange30d,
        cryptoPercentChange60d,
        cryptoPercentChange90d,
        exchangeId
    };
}

module.exports = { getAllCalculs, getProfit, getRecupShad, getRecupTp1, getRecupTpX, getDoneShad, getPriceTp1, getAmountTp1, getTotalBuy, getTotalAmount, getMaxWanted, getRatioShad, getTotalSell, getAverageEntryPrice, getBalance, getCryptoRank, getCurrentPrice, getCryptoPercentChange, getPercentageDifference, getCurrentPossession, getPriceTp2, getPriceTp3, getPriceTp4, getPriceTp5, getAmountTp2, getAmountTp3, getAmountTp4, getAmountTp5 };

