const serverHost = "http://localhost:3000";

async function getBalanceFromDB() {
    try {
        const response = await fetch(serverHost + '/get/balance');
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

async function getTradesFromDB() {
    try {
        const response = await fetch(serverHost + '/get/trades');
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}
async function getStratsFromDB() {
    try {
        const response = await fetch(serverHost + '/get/strat');
        const data = await response.json();
        return data
    } catch (err) {
        console.error(err);
    }
}
async function getActiveOrdersFromDB() {
    try {
        const response = await fetch(serverHost + '/get/activeOrders');
        const data = await response.json();

        // Réinitialiser les propriétés openBuyOrders et openSellOrders
        const openBuyOrders = {};
        const openSellOrders = {};

        // Stocker tous les ordres ouverts par actif
        data.forEach(order => {
            const asset = order.symbol.split('/')[0]; // Récupérer l'asset sans la paire
            if (order.side === 'buy') {
                openBuyOrders[asset] = openBuyOrders[asset] || [];
                openBuyOrders[asset].push(order); // Ajouter l'ordre d'achat au tableau
            } else if (order.side === 'sell') {
                openSellOrders[asset] = openSellOrders[asset] || [];
                openSellOrders[asset].push(order); // Ajouter l'ordre de vente au tableau
            }

            console.log(asset + '--0--' + JSON.stringify(openSellOrders[asset]));
            console.log(asset + '--1--' + openSellOrders[asset].length);
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
        const response = await fetch(serverHost + '/get/cmcData');
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

module.exports = { getBalanceFromDB, getTradesFromDB, getStratsFromDB, getActiveOrdersFromDB, getCmcDataFromDB };