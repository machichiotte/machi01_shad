// src/calculs.js
function getBalance(platform, balances) {
    console.log("getBalance");
    console.log("platform :: " + platform + " --- " + JSON.stringify(balances));
    switch (platform) {
        case 'binance':
            return balances.info.balances.map((item) => ({
                symbol: item.asset,
                balance: parseFloat(item.free) + parseFloat(item.locked),
                available: item.free
            }));
        case 'kucoin':
            return balances.info.data.map((item) => ({
                symbol: item.currency,
                balance: item.balance,
                available: item.available
            }));
        case 'huobi':
            return;
        case 'okex':
            return balances.info.data.map((item) => ({
                symbol: item.ccy,
                balance: item.cashBal,
                available: item.availBal
            }));
        case 'gateio':
            return balances.info.map((item) => ({
                symbol: item.currency,
                balance: item.available + item.locked,
                available: item.available
            }));
    }
}

module.exports = { getBalance };