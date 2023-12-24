// src/controllers/balanceController.js
const { createExchangeInstance, saveLastUpdateToMongoDB, getData, deleteAndSaveData } = require('../services/utils.js');
const { mapBalance } = require('../services/mapping.js');

async function getBalance(req, res) {
    const collection = process.env.MONGODB_COLLECTION_BALANCE;
    await getData(req, res, collection, 'db_machi_shad.collection_balance.json');
}
async function updateBalance(req, res) {
    const { exchangeId } = req.params;
    console.log('exchangeId', exchangeId);
    const collection = process.env.MONGODB_COLLECTION_BALANCE;
    const exchange = createExchangeInstance(exchangeId);

    try {
        const data = await exchange.fetchBalance();
        console.log('data update balance ', data);
        const mappedData = mapBalance(exchangeId, data);
        console.log('mappedData ', mappedData);

        await deleteAndSaveData(mappedData, collection, exchangeId);
        res.status(200).json(mappedData);
        saveLastUpdateToMongoDB(process.env.TYPE_BALANCE, exchangeId);
    } catch (err) {
        console.log('Erreur lors de updateBalance:', err);
        res.status(500).json({ error: err.name + ': ' + err.message });
    }
}

module.exports = { getBalance, updateBalance };