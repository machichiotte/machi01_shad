// src/controllers/balanceController.js
const { createExchangeInstance, saveLastUpdateToMongoDB, getData, deleteAndSaveData } = require('../services/utils.js');
const { mapBalance } = require('../services/mapping.js');
const { AuthenticationError } = require('ccxt');

async function getBalance(req, res) {
    const collection = process.env.MONGODB_COLLECTION_BALANCE;
    await getData(req, res, collection, 'db_machi_shad.collection_balance.json');
}

async function updateBalance(req, res) {
    const { exchangeId } = req.params;
    console.log('exchangeId', exchangeId);
    const collection = process.env.MONGODB_COLLECTION_BALANCE;

    try {
        const exchange = createExchangeInstance(exchangeId);
        const data = await exchange.fetchBalance();
        console.log('data update balance ', data);
        const mappedData = mapBalance(exchangeId, data);
        console.log('mappedData ', mappedData);

        await deleteAndSaveData(mappedData, collection, exchangeId);
        res.status(200).json(mappedData);
        saveLastUpdateToMongoDB(process.env.TYPE_BALANCE, exchangeId);
    } catch (error) {
        if (error instanceof AuthenticationError) {
            // Gérez l'erreur d'authentification ici
            console.error("Erreur d'authentification lors de updateBalance :", error.message);
            res.status(401).json({ success: false, message: "Erreur d'authentification lors de updateBalance" });
        } else {
            // Gérez d'autres erreurs ici
            console.error("Erreur lors de updateBalance :", error);
            res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
    }
}

module.exports = { getBalance, updateBalance };