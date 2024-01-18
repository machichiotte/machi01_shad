// src/services/mapping.js
function mapBalance(platform, data) {
    //console.log('map balance :: ' + JSON.stringify(data));
    switch (platform) {
        case 'binance':
            return data.info.balances
                .filter((item) => parseFloat(item.free) > 0 || parseFloat(item.locked))
                .map((item) => ({
                    symbol: item.asset,
                    balance: parseFloat(item.free) + parseFloat(item.locked),
                    available: item.free,
                    platform: platform
                }));
        case 'kucoin':
            return data.info.data
                .filter((item) => parseFloat(item.balance) > 0)
                .map((item) => ({
                    symbol: item.currency,
                    balance: item.balance,
                    available: item.available,
                    platform: platform
                }));
        case 'htx':
            return Object.entries(data)
                .filter(([key, value]) => key !== "info" && key !== "free" && key !== "used" && key !== "total" && value.total > 0)
                .map(([key, value]) => ({
                    symbol: key.toUpperCase(),
                    balance: value.total,
                    available: value.free,
                    platform: platform,
                }));
        case 'okx':
            console.log('okxokxokxokxokxokx', JSON.stringify(data));
            return data.info.data[0].details
                .filter((item) => parseFloat(item.cashBal) > 0)
                .map((item) => ({
                    symbol: item.ccy,
                    balance: item.cashBal,
                    available: item.availBal,
                    platform: platform
                }));
        case 'gateio':
            return data.info
                .filter((item) => parseFloat(item.available) > 0 || parseFloat(item.locked))
                .map((item) => ({
                    symbol: item.currency,
                    balance: item.available + item.locked,
                    available: item.available,
                    platform: platform
                }));
    }
}

function mapTrades(platform, data) {
    switch (platform) {
        case 'kucoin':
            return data
                .map((item) => ({
                    symbol: item.symbol,
                    timestamp: item.timestamp,
                    type: item.type,
                    side: item.side,
                    price: item.price,
                    amount: item.amount,
                    cost: item.cost,
                    fee: item.fee.cost,
                    feeCurrency: item.fee.currency,
                    feeRate: item.fee.rate,
                    platform: platform
                }));
        case 'htx':
            return data
                .map((item) => ({
                    symbol: item.symbol,
                    timestamp: item.timestamp,
                    type: item.type,
                    side: item.side,
                    price: item.price,
                    amount: item.amount,
                    cost: item.cost,
                    fee: item.fee.cost,
                    feeCurrency: item.fee.currency,
                    feeRate: item.fee.rate,
                    platform: platform
                }));
    }
}

function mapTickers(data) {
    return Object.keys(data).map((symbol) => {
        const item = data[symbol];
        return {
            symbol: item.symbol,
            timestamp: item.timestamp,
            last: item.last
        };
    });
}

function mapOrders(platform, data) {
    // console.log('map active orders :: ' + JSON.stringify(data));
    return data
        .map((item) => ({
            oId: item.id,
            cId: item.clientOrderId,
            platform: platform,
            symbol: item.symbol,
            type: item.type,
            side: item.side,
            amount: item.amount,
            price: item.price,
        }));
}

function mapLoadMarkets(platform, data) {
    // console.log('map load markets :: ' + JSON.stringify(data));

    let objArray = [];

    for (const symbol in data) {
        const pairInfo = data[symbol];
        console.log(`Informations pour la paire ${symbol} : `, pairInfo);

        objArray.push({
            symbol: pairInfo.id,
            base: pairInfo.base,
            quote: pairInfo.quote,
            active: pairInfo.active,
            type: pairInfo.type,
            amountMin: pairInfo.limits.amount.min,
            priceMin: pairInfo.limits.price ? pairInfo.limits.price.min : "N/A",
            costMin: pairInfo.limits.cost ? pairInfo.limits.cost.min : "N/A",
            taker: pairInfo.taker,
            maker: pairInfo.maker,
            precisionAmount: pairInfo.precision.amount,
            precisionPrice: pairInfo.precision.price,
            platform: platform
        });
    }
    const filteredArray = objArray.filter(item => item.quote.endsWith('USDT') || item.quote.endsWith('BUSD'));
    return filteredArray;
}

function mapTradesAddedManually(data) {
    return data.map((item) => ({
        date: item.date,
        altA: item.altA,
        altB: item.altB,
        type: item.type,
        price: item.price,
        amount: item.amount,
        total: item.total,
        fee: item.fee,
        feecoin: item.feecoin,
        platform: item.platform,
        explatform: item.explatform,
        pair: item.pair
    }));
}

module.exports = { mapBalance, mapOrders, mapLoadMarkets, mapTrades, mapTradesAddedManually, mapTickers };