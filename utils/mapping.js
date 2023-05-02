// utils/mapping.js
function mapBalance(platform, data) {
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
        case 'huobi':
            return data.info.data.list
                .filter((item) => parseFloat(item.balance) > 0)
                .map((item) => ({
                    symbol: item.currency,
                    balance: item.balance,
                    available: item.available,
                    platform: platform
                }));
        case 'okex':
            return data.info.data
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

function mapActiveOrders(platform, data) {
    return data
        .map((item) => ({
            orderId: item.clientOrderId,
            symbol: item.symbol,
            type: item.type,
            side: item.side,
            amount: item.amount,
            price: item.price,
            platform: platform
        }));
}

function mapLoadMarkets(platform, data) {
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

module.exports = { mapBalance, mapActiveOrders, mapLoadMarkets };