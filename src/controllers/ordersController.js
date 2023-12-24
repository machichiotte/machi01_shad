// src/controllers/ordersController.js
const ccxt = require('ccxt');

const { saveLastUpdateToMongoDB } = require('../services/utils.js');
const { createExchangeInstance, createExchangeInstanceWithReq, getData, deleteAndSaveData } = require('../services/utils.js');
const { mapOrders } = require('../services/mapping.js');


async function getOrders(req, res) {
    const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
    await getData(req, res, collection, 'db_machi_shad.collection_active_orders.json');
}
async function updateOrders(req, res) {
    const { exchangeId } = req.params;

    const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
    let data;
    try {
        const exchange = createExchangeInstance(exchangeId);

        if (exchangeId === 'binance') {
            exchange.options.warnOnFetchOpenOrdersWithoutSymbol = false;
        }

        if (exchangeId === 'kucoin') {
            const pageSize = 50;
            let currentPage = 1;
            data = [];

            while (true) {
                const limit = 50
                const params = {
                    'currentPage': currentPage,
                }
                const orders = await exchange.fetchOpenOrders(undefined, undefined, limit, { 'currentPage': currentPage });
                data = data.concat(orders);
                if (orders.length < pageSize) {
                    break;
                }
                currentPage++;
            }
        } else {
            data = await exchange.fetchOpenOrders();
        }

        const mappedData = mapOrders(exchangeId, data);
        await deleteAndSaveData(mappedData, collection, exchangeId);
        res.status(200).json(mappedData);

        saveLastUpdateToMongoDB(process.env.TYPE_ACTIVE_ORDERS, exchangeId);

    } catch (err) {
        console.error(err);
        console.log('Error updateOrders : ' + err);

        res.status(500).json({ error: err.name + ': ' + err.message });
    }
}
async function deleteOrder(req, res) {
    const { exchangeId, oId, symbol } = req.body;

    try {
        const exchange = createExchangeInstance(exchangeId);
        const data = await exchange.cancelOrder(oId, symbol.replace("/", ""));
        res.json(data);
        //mise a jour order si envie ?
    } catch (err) {
        console.log('Error deleteOrder : ' + err);
        //console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}
async function createBunchOrders(req, res) {
    const exchangeId = req.body.exchangeId;
    const price = req.body.price;
    const amount = req.body.amount;

    try {
        const { symbol, exchangeParams } = createExchangeInstanceWithReq(exchangeId, req);

        const exchange = new ccxt[exchangeId](exchangeParams);
        const result = await exchange.createLimitSellOrder(symbol, amount, price);

        res.status(200).json({ message: result, status: 200 })

    } catch (err) {
        //console.error(err);
        console.log('Error createBunchOrders :: ' + err);
        res.status(500).json({ error: 'Internal server error', status: 500 });
    }
}
async function cancelAllOrders(req, res) {
    const exchangeId = req.body.exchangeId;
    let symbol, result;
    try {
        const exchange = createExchangeInstance(exchangeId);

        switch (exchangeId) {
            case 'kucoin':
                symbol = req.body.asset + '-USDT';
                result = await exchange.cancelAllOrders(symbol)
                break;
            case 'binance':
                symbol = req.body.asset + 'USDT';
                result = await exchange.cancelAllOrders(symbol)
                break;
            case 'huobi':
                symbol = req.body.asset.toLowerCase() + 'usdt';
                result = await exchange.cancelAllOrders(symbol)
                break;
            case 'gateio':
                symbol = req.body.asset.toUpperCase() + '_USDT';
                result = await exchange.cancelAllOrders(symbol)
                break;
            case 'okex':
                symbol = req.body.asset + '-USDT';

                // Obtenir les ordres ouverts pour l'actif spécifié
                const orders = await exchange.fetchOpenOrders(symbol);

                // Obtenir les IDs des ordres
                const orderIds = orders.map(order => order.id);

                if (orderIds.length === 0) {
                    result = { message: 'Aucun ordre ouvert pour cet actif' };
                } else {
                    // Appeler la méthode cancelOrders() de CCXT pour OKEx avec les IDs des ordres à annuler
                    result = await exchange.cancelOrders(orderIds, symbol);
                }
                break;
            default:
                throw new Error(`Unsupported exchange: ${exchangeId}`);
        }

        res.status(200).json({ message: result, status: 200 })
    } catch (err) {
        console.log('Error cancelAllOrders :: ' + err)
        //console.error(err);
        res.status(500).json({ error: 'Internal server error', status: 500 });
    }
}

module.exports = { getOrders, updateOrders, deleteOrder, createBunchOrders, cancelAllOrders };


