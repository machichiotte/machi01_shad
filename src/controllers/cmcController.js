// src/controllers/cmcController.js

const { getData, saveLastUpdateToMongoDB, handleErrorResponse } = require('../services/utils.js');
const { deleteAllDataMDB, saveData } = require('../services/mongodb.js');

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getCmc(req, res) {
    const collection = process.env.MONGODB_COLLECTION_CMC;
    await getData(req, res, collection, 'db_machi_shad.collection_cmc.json');
}

/**
 * Fetches the latest CoinMarketCap data from the CoinMarketCap API.
 * @returns {Promise<Array>} - A promise resolved with the fetched CoinMarketCap data.
 */
async function fetchCmcData() {
    const API_KEY = process.env.CMC_APIKEY;
    const limit = 5000;
    const baseStart = 1;
    const convert = 'USD';

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
            break; // No additional data, stop the loop
        }

        allData.push(...data.data);
        start += limit;
    }

    return allData;
}

/**
 * Updates the CoinMarketCap data in the database.
 * @param {Array} cmcData - Array of CoinMarketCap data to be updated.
 * @param {Object} res - HTTP response object.
 */
async function updateCmcDataInDatabase(cmcData, res) {
    const collection = process.env.MONGODB_COLLECTION_CMC;
    try {
        const deleteResult = await deleteAllDataMDB(collection);
        const saveResult = await saveData(cmcData, collection);
        saveLastUpdateToMongoDB(process.env.TYPE_CMC, "");

        res.status(200).json({
            data: cmcData,
            deleteResult: deleteResult,
            saveResult: saveResult,
            totalCount: cmcData.length
        });
    } catch (error) {
        handleErrorResponse(res, error, 'updateCmcDataInDatabase');
    }
}

/**
 * Updates the CoinMarketCap data by fetching the latest information from the CoinMarketCap API and saving it to the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function updateCmc(req, res) {
    try {
        const cmcData = await fetchCmcData();
        await updateCmcDataInDatabase(cmcData, res);
    } catch (error) {
        handleErrorResponse(res, error, 'updateCmc');
    }
}

module.exports = { getCmc, updateCmc };