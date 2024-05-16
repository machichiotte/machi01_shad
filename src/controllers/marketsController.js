// src/controllers/marketsController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");

const { mapMarkets } = require("../services/mapping.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveData,
} = require("../utils/mongodbUtil.js");
const { createExchangeInstance } = require("../utils/exchangeUtil.js");
/**
 * Retrieves the latest market data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @returns {Object} - The last recorded markets.
 */
async function getMarkets(req, res) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  await getData(req, res, collection);
}

/**
 * Retrieves the latest market data from the database.
 * @returns {Object} - The last recorded markets.
 */
async function getSavedMarkets() {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  await getDataFromCollection(collection);
}

/**
 * Fetches the latest market data from an exchange.
 * @param {string} exchangeId - Identifier of the exchange.
 * @returns {Promise<Object>} - A promise resolved with the fetched market data.
 */
async function fetchMarketData(exchangeId) {
  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.loadMarkets();
    return data;
  } catch (error) {
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
    saveLastUpdateToMongoDB(process.env.TYPE_LOAD_MARKETS, exchangeId);
    res.status(200).json(mappedData);
  } catch (error) {
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
    handleErrorResponse(res, error, "updateMarkets");
  }
}

module.exports = { getMarkets, getSavedMarkets, updateMarkets };
