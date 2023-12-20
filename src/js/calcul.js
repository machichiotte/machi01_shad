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

function getTotalAmountAndBuy(asset, exchangeId, trades) {
    const filteredTrades = trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'buy' && trade.platform === exchangeId);
    const totalBuy = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
    const totalAmount = filteredTrades.reduce((total, trade) => total + parseFloat(trade.amount), 0);
    return {
        totalAmount,
        totalBuy: totalBuy.toFixed(2)
    };
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
    // Assurez-vous que strats est défini et a la structure attendue
    if (strats && typeof strats === 'object') {
        // Assurez-vous que la clé asset existe dans l'objet strats
        const assetData = strats.find((item) => item.asset === asset);

        if (assetData && assetData.strategies && typeof assetData.strategies === 'object') {
            // Assurez-vous que la clé exchangeId existe dans les données de l'actif
            const strategy = assetData.strategies[exchangeId];

            if (strategy !== undefined) {
                // Mettez à jour les valeurs de retour en fonction de la stratégie
                switch (strategy) {
                    case 'strategy1':
                        return 2;
                    case 'strategy2':
                        return 4;
                    case 'strategy3':
                        return 8;
                    default:
                        return '8'; // 'NULL' ou une valeur par défaut de votre choix
                }
            }
        }
    }

    // Gérez le cas où la structure n'est pas conforme à ce que vous attendez
    return '/'; // 'NULL' ou une valeur par défaut de votre choix
}



function getTotalSell(asset, trades) {
    const filteredTrades = trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'sell');
    const sellTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.total), 0);
    return sellTotal.toFixed(2);
}

function getAverageEntryPrice(asset, trades) {
    // Filtrer les transactions d'achat pour l'actif spécifié
    const filteredBuyTrades = trades.filter(trade => trade.pair === `${asset}/USDT` && trade.type === 'buy');

    // Si aucune transaction d'achat n'est trouvée, la moyenne est nulle
    if (filteredBuyTrades.length === 0) {
        return 0;
    }

    // Calculer la somme totale des valeurs d'entrée (total) et des quantités (amount)
    const totalEntryValue = filteredBuyTrades.reduce((total, buyTrade) => total + parseFloat(buyTrade.total), 0);
    const totalEntryQuantity = filteredBuyTrades.reduce((total, buyTrade) => total + parseFloat(buyTrade.amount), 0);

    // Si la somme totale des quantités est nulle, la moyenne est également nulle pour éviter une division par zéro
    const averageEntryPrice = totalEntryQuantity === 0 ? 0 : totalEntryValue / totalEntryQuantity;

    return averageEntryPrice;
}


function getBalance(asset, sortedBalances) {
    const balance = sortedBalances.find(item => item.symbol === asset);
    return balance ? balance.balance : 'N/A';
}

function getIconUrl(id) {
    const baseIconUrl = 'https://s2.coinmarketcap.com/static/img/coins/32x32/';
    return `<img src='${baseIconUrl}${parseInt(id)}.png' alt="Icon"  width="32" height="32"></img>`
}

function getCmcValues(asset, cmcData) {

    const crypto = cmcData.find(item => item.symbol === asset);
    if (crypto) {
        return {
            rank: crypto.cmc_rank ? parseInt(crypto.cmc_rank) : 0,
            currentPrice: crypto.quote.USD.price ? crypto.quote.USD.price.toFixed(7) : 'N/A',
            iconUrl: crypto.id ? getIconUrl(crypto.id) : '',
            cryptoPercentChange24h: crypto.quote.USD.percent_change_24h ? crypto.quote.USD.percent_change_24h / 100 : 'N/A',
            cryptoPercentChange7d: crypto.quote.USD.percent_change_7d ? crypto.quote.USD.percent_change_7d / 100 : 'N/A',
            cryptoPercentChange30d: crypto.quote.USD.percent_change_30d ? crypto.quote.USD.percent_change_30d / 100 : 'N/A',
            cryptoPercentChange60d: crypto.quote.USD.percent_change_60d ? crypto.quote.USD.percent_change_60d / 100 : 'N/A',
            cryptoPercentChange90d: crypto.quote.USD.percent_change_90d ? crypto.quote.USD.percent_change_90d / 100 : 'N/A'
        };
    } else {
        return {
            cryptoPercentChange24h: 'N/A',
            cryptoPercentChange7d: 'N/A',
            cryptoPercentChange30d: 'N/A',
            cryptoPercentChange60d: 'N/A',
            cryptoPercentChange90d: 'N/A'
        };
    }
}

function getPercentageDifference(currentPrice, averageEntryPrice) {
    const price = parseFloat(currentPrice);
    const avgEntryPrice = parseFloat(averageEntryPrice);
    if (isNaN(price) || isNaN(avgEntryPrice)) {
        return 'N/A';
    }
    const percentageDifference = ((price - avgEntryPrice) / avgEntryPrice);
    return percentageDifference.toFixed(2);
}

function getCurrentPossession(currentPrice, balance) {
    if (isNaN(currentPrice) || isNaN(balance)) {
        return 0;
    }
    const currentPossession = (currentPrice * balance).toFixed(2);
    return currentPossession;
}

function calculateAmountAndPrice(parsedRecup, parsedBalance, factor) {
    const amount = factor * parsedBalance;
    const price = parsedRecup / amount;

    return { amount, price };
}

function calculateAmountsAndPrices(recupTp1, averageEntryPrice, balance, totalBuy, totalSell, totalShad, recupTpX) {
    const parsedRecupTp1 = parseFloat(recupTp1);
    const parsedEntryAvg = parseFloat(averageEntryPrice);
    const parsedBalance = parseFloat(balance);
    const parsedTotalBuy = parseFloat(totalBuy);
    const parsedTotalSell = parseFloat(totalSell);
    const parsedRecupTpX = parseFloat(recupTpX);

    const amountTp1 = (totalShad > -1) ? 0.5 * parsedBalance : parsedRecupTp1 / parsedEntryAvg < parsedBalance ? parsedRecupTp1 / parsedEntryAvg : parsedRecupTp1 * parsedBalance / (parsedTotalBuy - parsedTotalSell);

    const priceTp1 = parsedRecupTp1 / parseFloat(amountTp1);
    const { amount: amountTp2, price: priceTp2 } = calculateAmountAndPrice(parsedRecupTpX, parsedBalance - amountTp1, 0.5);
    const { amount: amountTp3, price: priceTp3 } = calculateAmountAndPrice(parsedRecupTpX, parsedBalance - amountTp1 - amountTp2, 0.5);
    const { amount: amountTp4, price: priceTp4 } = calculateAmountAndPrice(parsedRecupTpX, parsedBalance - amountTp1 - amountTp2 - amountTp3, 0.5);
    const { amount: amountTp5, price: priceTp5 } = calculateAmountAndPrice(parsedRecupTpX, parsedBalance - amountTp1 - amountTp2 - amountTp3 - amountTp4, 0.5);

    return {
        amountTp1,
        amountTp2,
        amountTp3,
        amountTp4,
        amountTp5,
        priceTp1,
        priceTp2,
        priceTp3,
        priceTp4,
        priceTp5
    };
}

function getAssetId(asset, cmcData) {
    const crypto = cmcData.find(item => item.symbol === asset);
    if (crypto)
        return crypto.id;
}

function getDataBTC(cmcData) {
    return cmcData.find(item => item.symbol === 'BTC');
}

function getDataETH(cmcData) {
    return cmcData.find(item => item.symbol === 'ETH');
}

function getTradesHistory(asset, trades) {
    return trades.filter(trade => trade.pair === `${asset}/USDT`);
}

function getAllCalculs(item, cmcData, trades, strats, buyOrders, sellOrders) {
    const { symbol, platform, balance } = item;
    const exchangeId = platform;

    const {
        rank,
        currentPrice,
        iconUrl,
        cryptoPercentChange24h,
        cryptoPercentChange7d,
        cryptoPercentChange30d,
        cryptoPercentChange60d,
        cryptoPercentChange90d
    } = getCmcValues(symbol, cmcData);

    const totalSell = getTotalSell(symbol, trades);
    const averageEntryPrice = getAverageEntryPrice(symbol, trades);
    const openBuyOrders = buyOrders.filter(order => order.symbol.includes(symbol)).length;
    const openSellOrders = sellOrders.filter(order => order.symbol.includes(symbol)).length;

    const ratioShad = getRatioShad(symbol, exchangeId, strats);

    const {
        totalAmount,
        totalBuy
    } = getTotalAmountAndBuy(symbol, exchangeId, trades);

    const maxWanted = getMaxWanted(rank, totalBuy);
    const recupShad = getRecupShad(totalBuy, totalSell, maxWanted);
    const percentageDifference = getPercentageDifference(currentPrice, averageEntryPrice);
    const currentPossession = getCurrentPossession(currentPrice, balance);
    const profit = getProfit(totalBuy, totalSell, currentPrice, balance);
    const recupTpX = getRecupTpX(maxWanted, ratioShad);
    const totalShad = getDoneShad(totalBuy, totalSell, maxWanted, recupShad, recupTpX);
    const recupTp1 = getRecupTp1(totalBuy, totalSell, maxWanted, recupShad, recupTpX, totalShad);

    const { amountTp1, amountTp2, amountTp3, amountTp4, amountTp5, priceTp1, priceTp2, priceTp3, priceTp4, priceTp5 } = calculateAmountsAndPrices(recupTp1, averageEntryPrice, balance, totalBuy, totalSell, totalShad, recupTpX);

    return {
        iconUrl,
        asset: symbol,
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

export { getDataBTC, getDataETH, getAllCalculs, getBalance, getAssetId, getTradesHistory };