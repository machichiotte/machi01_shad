// src/controllers/cmcController.js
const { getData, saveLastUpdateToMongoDB } = require('../services/utils.js');

async function getCmcData(req, res) {
    const collection = process.env.MONGODB_COLLECTION_CMC;
    await getData(req, res, collection, 'db_machi_shad.collection_cmc.json');
}
async function updateCmcData(req, res) {
    const collection = process.env.MONGODB_COLLECTION_CMC;
    const API_KEY = process.env.CMC_APIKEY;
    const limit = 5000;
    const baseStart = 1;
    const convert = 'USD';

    try {
        let start = baseStart;
        const allData = [];

        while (true) {
            const URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=${convert}`;

            const response = await fetch(URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CMC_PRO_API_KEY': API_KEY
                }
            });

            const data = await response.json();

            if (data.data.length === 0) {
                break; // Pas de données supplémentaires, arrêter la boucle
            }

            allData.push(...data.data);
            start += limit;
        }

        // Enregistrement des données dans MongoDB
        const deleteResult = await deleteAllDataMDB(collection);
        const saveResult = await saveArrayDataMDB(allData, collection);
        saveLastUpdateToMongoDB(process.env.TYPE_CMC, "");

        res.status(200).json({
            data: allData,
            deleteResult: deleteResult,
            saveResult: saveResult,
            totalCount: allData.length
        });
    } catch (err) {
        console.error(err);
        console.log('Error updateCmcData:', err);
        res.status(500).json({ error: err.name + ': ' + err.message });
    }
}

module.exports = { getCmcData, updateCmcData };