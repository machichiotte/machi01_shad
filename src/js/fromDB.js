const serverHost = process.env.VUE_APP_SERVER_HOST;
//require('dotenv').config();
//const serverHost = `https://${process.env.HOST}`;

async function getBalanceFromDB() {
    try {
        const response = await fetch(`${serverHost}/get/balance`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

async function getTradesFromDB() {
    try {
        const response = await fetch(`${serverHost}/get/trades`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}
async function getStratsFromDB() {
    try {
        const response = await fetch(`${serverHost}/get/strat`);
        const data = await response.json();
        return data
    } catch (err) {
        console.error(err);
    }
}
async function getActiveOrdersFromDB() {
    try {
        const response = await fetch(`${serverHost}/get/activeOrders`);
        const data = await response.json();

        const openBuyOrders = {};
        const openSellOrders = {};

        data.forEach(order => {
            const asset = order.symbol.split('/')[0];
            if (order.side === 'buy') {
                openBuyOrders[asset] = openBuyOrders[asset] || [];
                openBuyOrders[asset].push(order);
            } else if (order.side === 'sell') {
                openSellOrders[asset] = openSellOrders[asset] || [];
                openSellOrders[asset].push(order);
            }
        });

        return {
            data,
            openBuyOrders,
            openSellOrders
        };
    } catch (err) {
        console.error(err);
    }
}

async function getCmcDataFromDB() {
    try {
        const response = await fetch(`${serverHost}/get/cmcData`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

module.exports = { getBalanceFromDB, getTradesFromDB, getStratsFromDB, getActiveOrdersFromDB, getCmcDataFromDB };