// src/calculs.js
function getBalance(platform, balances) {
    console.log("getBalance");
    console.log("platform :: " + platform + " --- " + JSON.stringify(balances));
    switch (platform) {
        case 'binance':
            return balances.info.balances
                .filter((item) => parseFloat(item.free) > 0 || parseFloat(item.locked))
                .map((item) => ({
                    symbol: item.asset,
                    balance: parseFloat(item.free) + parseFloat(item.locked),
                    available: item.free
                }));
        case 'kucoin':
            return balances.info.data
                .filter((item) => parseFloat(item.balance) > 0)
                .map((item) => ({
                    symbol: item.currency,
                    balance: item.balance,
                    available: item.available
                }));
        case 'huobi':
            return balances.info.data.list
                .filter((item) => parseFloat(item.balance) > 0)
                .map((item) => ({
                    symbol: item.currency,
                    balance: item.balance,
                    available: item.available
                }));
        case 'okex':
            return balances.info.data
                .filter((item) => parseFloat(item.cashBal) > 0)
                .map((item) => ({
                    symbol: item.ccy,
                    balance: item.cashBal,
                    available: item.availBal
                }));
        case 'gateio':
            return balances.info
                .filter((item) => parseFloat(item.available) > 0 || parseFloat(item.locked))
                .map((item) => ({
                    symbol: item.currency,
                    balance: item.available + item.locked,
                    available: item.available
                }));
    }
}

function getActiveOrders(platform, orders) {
    console.log("getBalance");
    console.log("platform :: " + platform + " --- " + JSON.stringify(orders));
    switch (platform) {
        case 'binance':
            return orders
            .map((item) => ({
                orderId: item.clientOrderId,
                    symbol: item.symbol,
                    type: item.type,
                    side: item.side,
                    amount: item.amount,
                    price: item.price,
                }));
        case 'kucoin':
            return orders
                .map((item) => ({
                orderId: item.clientOrderId,
                    symbol: item.symbol,
                    type: item.type,
                    side: item.side,
                    amount: item.amount,
                    price: item.price,
                }));
        case 'huobi':
            return orders
            .map((item) => ({
                orderId: item.clientOrderId,
                    symbol: item.symbol,
                    type: item.type,
                    side: item.side,
                    amount: item.amount,
                    price: item.price,
                }));
        case 'okex':
            return orders
            .map((item) => ({
                orderId: item.clientOrderId,
                    symbol: item.symbol,
                    type: item.type,
                    side: item.side,
                    amount: item.amount,
                    price: item.price,
                }));
        case 'gateio':
            return orders
                .map((item) => ({
                    orderId: item.clientOrderId,
                        symbol: item.symbol,
                        type: item.type,
                        side: item.side,
                        amount: item.amount,
                        price: item.price,
                    }));
    }
}

module.exports = { getBalance, getActiveOrders };