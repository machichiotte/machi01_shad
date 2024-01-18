// src/controllers/balanceController.js
const { createExchangeInstance, saveLastUpdateToMongoDB, getData, deleteAndSaveData, handleErrorResponse } = require('../services/utils.js');
const { mapBalance } = require('../services/mapping.js');

async function getBalance(req, res) {
    const collection = process.env.MONGODB_COLLECTION_BALANCE;
    await getData(req, res, collection, 'db_machi_shad.collection_balance.json');
}

async function updateBalance(req, res) {
    const { exchangeId } = req.params;
    console.log('updateBalance exchangeId', exchangeId);
    const collection = process.env.MONGODB_COLLECTION_BALANCE;

    try {
        const exchange = createExchangeInstance(exchangeId);
        const data = await exchange.fetchBalance();
        console.log('updateBalance data', data);
        const mappedData = mapBalance(exchangeId, data);
        console.log('updateBalance mappedData ', mappedData);

        await deleteAndSaveData(mappedData, collection, exchangeId);
        res.status(200).json(mappedData);
        saveLastUpdateToMongoDB(process.env.TYPE_BALANCE, exchangeId);
    } catch (error) {
        handleErrorResponse(res, error, 'updateBalance');
    }
}

module.exports = { getBalance, updateBalance };