// src/controllers/marketsController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { mapMarkets } = require("../services/mapping.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveData,
} = require("../utils/mongodbUtil.js");
const { createExchangeInstance } = require("../utils/exchangeUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil");

validateEnvVariables(['MONGODB_COLLECTION_LOAD_MARKETS', 'TYPE_LOAD_MARKETS']);

/**
 * Retrieves the latest market data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getMarkets(req, res) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  try {
    const data = await getData(collection);
    console.log("Retrieved market data from the database.", { collection, count: data.length });
    res.json(data);
  } catch (error) {
    errorLogger.error("Failed to retrieve market data.", { error: error.message });
    handleErrorResponse(res, error, "getMarkets");
  }
}

/**
 * Retrieves the latest market data from the database.
 * @returns {Promise<Object[]>} - The last recorded markets.
 */
async function getSavedMarkets() {
  const collectionName = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  try {
    const data = await getDataFromCollection(collectionName);
    console.log("Fetched saved market data from the database.", { collectionName, count: data.length });
    return data;
  } catch (error) {
    errorLogger.error("Failed to fetch saved market data.", { error: error.message });
    throw error;
  }
}

/**
 * Fetches the latest market data from an exchange.
 * @param {string} exchangeId - Identifier of the exchange.
 * @returns {Promise<Object>} - The fetched market data.
 */
async function fetchMarketData(exchangeId) {
  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.loadMarkets();
    console.log(`Fetched market data from ${exchangeId}.`, { count: Object.keys(data).length });
    return data;
  } catch (error) {
    errorLogger.error(`Failed to fetch market data from ${exchangeId}.`, { error: error.message });
    throw error;
  }
}

/**
 * Updates the market data in the database.
 * @param {Object} data - Market data to be updated.
 * @param {string} exchangeId - Identifier of the exchange.
 * @param {Object} res - HTTP response object.
 */
async function updateMarketDataInDatabase(data, exchangeId, res) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  try {
    const mappedData = mapMarkets(exchangeId, data);
    await deleteAndSaveData(mappedData, collection, exchangeId);
    await saveLastUpdateToMongoDB(process.env.TYPE_LOAD_MARKETS, exchangeId);
    console.log(`Updated market data in database for ${exchangeId}.`, { count: mappedData.length });
    res.status(200).json(mappedData);
  } catch (error) {
    errorLogger.error("Failed to update market data in database.", { error: error.message });
    handleErrorResponse(res, error, "updateMarketDataInDatabase");
  }
}

/**
 * Updates the market data by fetching the latest information from an exchange and saving it to the database.
 * @param {Object} req - HTTP request object containing the exchange identifier.
 * @param {Object} res - HTTP response object.
 */
async function updateMarkets(req, res) {
  const { exchangeId } = req.params;
  try {
    const marketData = await fetchMarketData(exchangeId);
    await updateMarketDataInDatabase(marketData, exchangeId, res);
  } catch (error) {
    errorLogger.error(`Failed to update markets for ${exchangeId}.`, { error: error.message });
    handleErrorResponse(res, error, "updateMarkets");
  }
}

module.exports = { getMarkets, getSavedMarkets, updateMarkets };
