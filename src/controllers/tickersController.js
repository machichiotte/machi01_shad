// src/controllers/tickersController.js
const { createExchangeInstance, saveLastUpdateToMongoDB, getData, deleteAndSaveObject, handleErrorResponse } = require('../services/utils.js');
const { mapTickers } = require('../services/mapping.js');

async function getAllTickers(req, res) {
    try {
        const collection = process.env.MONGODB_COLLECTION_TICKERS;
        const allTickers = await getData(req, res, collection, 'db_machi_shad.collection_tickers.json');
        res.status(200).json(allTickers);

    } catch (error) {
        handleErrorResponse(res, error, 'getAllTickers');
    }
}

async function getAllTickersByExchange(req, res, exchangeId) {
    try {
        const collection = process.env.MONGODB_COLLECTION_TICKERS;
        const allTickers = await getData(req, res, collection, 'db_machi_shad.collection_tickers.json');

        // Vérifiez si l'échange spécifié existe dans les données
        if (allTickers && allTickers[exchangeId]) {
            const exchangeTickers = allTickers[exchangeId];
            res.status(200).json(exchangeTickers);
        } else {
            res.status(404).json({ error: 'Exchange not found' });
        }

    } catch (error) {
        handleErrorResponse(res, error, 'getAllTickersByExchange');
    }
}

async function getAllTickersBySymbolFromExchange(req, res, exchangeId, symbol) {
    try {
        const collection = process.env.MONGODB_COLLECTION_TICKERS;
        const allTickers = await getData(req, res, collection, 'db_machi_shad.collection_tickers.json');

        // Vérifiez si l'échange spécifié existe dans les données
        if (allTickers && allTickers[exchangeId]) {
            const exchangeTickers = allTickers[exchangeId];

            // Filtrer les objets en fonction du champ "symbol"
            const filteredTickers = exchangeTickers.filter(ticker => ticker.symbol === symbol);

            // Vérifier si des données ont été trouvées pour le symbole spécifié
            if (filteredTickers.length > 0) {
                res.status(200).json(filteredTickers);
            } else {
                res.status(404).json({ error: 'Symbol not found for the given exchange' });
            }
        } else {
            res.status(404).json({ error: 'Exchange not found' });
        }

    } catch (error) {
        handleErrorResponse(res, error, 'getAllTickersBySymbolFromExchange');
    }
}


async function updateAllTickers(req, res) {
    console.log('updateAllTickers');
    try {
        const collection = process.env.MONGODB_COLLECTION_TICKERS;
        console.log('collection');
        console.log('collection', collection);

        const allTickers = {};

        // Loop through each exchangeId
        const exchangeIds = ['binance', 'kucoin', 'htx', 'okx', 'gateio'];
        for (const exchangeId of exchangeIds) {
            console.log('exchangeId', exchangeId);

            const exchange = createExchangeInstance(exchangeId);
            const data = await exchange.fetchTickers();
            const mappedData = mapTickers(data);
            //console.log('mappedData', mappedData);

            // Append or update the data for the current exchangeId in the overall collection
            allTickers[exchangeId] = mappedData;
        }

        //console.log('alltick', allTickers);
        // Save the combined data to MongoDB

        console.log('bef deleteAndSaveObject');

        await deleteAndSaveObject(allTickers, collection);
        res.status(200).json(allTickers);
        saveLastUpdateToMongoDB(process.env.TYPE_TICKERS, 'combined');

    } catch (error) {
        handleErrorResponse(res, error, 'updateAllTickers');
    }
}

module.exports = { getAllTickers, updateAllTickers, getAllTickersByExchange, getAllTickersBySymbolFromExchange };