// src/controllers/loadMarketsController.js
const { createExchangeInstance, getData, deleteAndSaveData, saveLastUpdateToMongoDB } = require('../services/utils.js');
const { mapLoadMarkets } = require('../services/mapping.js');

async function getLoadMarkets(req, res) {
    const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
    await getData(req, res, collection, 'db_machi_shad.collection_load_markets.json');
}
async function updateLoadMarkets(req, res) {
    const { exchangeId } = req.params;

    const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
    const exchange = createExchangeInstance(exchangeId);

    try {
        const data = await exchange.loadMarkets();
        const mappedData = mapLoadMarkets(exchangeId, data);
        await deleteAndSaveData(mappedData, collection, exchangeId);
        saveLastUpdateToMongoDB(process.env.TYPE_LOAD_MARKETS, exchangeId);
        res.status(200).json(mappedData);
    } catch (err) {
        console.log('Error updateLoadMarkets:', err);
        res.status(500).json({ error: err.name + ': ' + err.message });
    }
}

module.exports = { getLoadMarkets, updateLoadMarkets }