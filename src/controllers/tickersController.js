// src/controllers/tickersController.js
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { createExchangeInstance } = require("../utils/exchangeUtil.js");
const { handleErrorResponse } = require("../utils/errorUtil.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveObject,
} = require("../utils/mongodbUtil.js");
const { mapTickers } = require("../services/mapping.js");

/**
 * Retrieves all tickers from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getAllTickers(req, res) {
  try {
    const collection = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(req, res, collection);
    res.status(200).json(tickersData);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickers");
  }
}

/**
 * Retrieves all tickers from the database.
 */
async function fetchTickersInDatabase() {
    const collection = process.env.MONGODB_COLLECTION_TICKERS;
    const data = await getDataFromCollection(collection);
    console.log("🚀 ~ fetchTickersInDatabase ~ data:", data.length)
    return data;
}

/**
 * Retrieves all tickers for a specific exchange.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function getAllTickersByExchange(req, res, exchangeId) {
  try {
    const collection = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(req, res, collection);

    if (tickersData && tickersData[exchangeId]) {
      const exchangeTickersData = tickersData[exchangeId];
      res.status(200).json(exchangeTickersData);
    } else {
      res.status(404).json({ error: "Exchange not found" });
    }
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersByExchange");
  }
}

/**
 * Retrieves all tickers for a specific exchange.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function getSavedAllTickersByExchange(exchangeId) {
  try {
    const collection = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getDataFromCollection(collection);

    // Vérification que tickersData est bien un tableau
    if (!Array.isArray(tickersData)) {
      console.log(`🚀 ~ file: tickersController.js:69 ~ getSavedAllTickersByExchange ~ tickersData:`, tickersData)
      return [];
    }

    const exchangeData = tickersData.filter((obj) => obj.platform === exchangeId);
    console.log("🚀 ~ getSavedAllTickersByExchange ~ exchangeData:", exchangeData.length)

    if (exchangeData) {
      return exchangeData;
    } else {
      return [];
    }
  } catch (error) {
    console.log("🚀 ~ getSavedAllTickersByExchange ~ error:", error)
    return [];
  }
}

/**
 * Retrieves all tickers for a specific symbol from a specific exchange.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @param {string} exchangeId - Identifier of the exchange.
 * @param {string} symbol - Symbol of the ticker.
 */
async function getAllTickersBySymbolFromExchange(req, res, exchangeId, symbol) {
  try {
    const collection = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(req, res, collection);

    if (tickersData && tickersData[exchangeId]) {
      const exchangeTickersData = tickersData[exchangeId];
      const filteredTickersData = exchangeTickersData.filter(
        (ticker) => ticker.symbol === symbol
      );

      if (filteredTickersData.length > 0) {
        res.status(200).json(filteredTickersData);
      } else {
        res
          .status(404)
          .json({ error: "Symbol not found for the given exchange" });
      }
    } else {
      res.status(404).json({ error: "Exchange not found" });
    }
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersBySymbolFromExchange");
  }
}

/**
 * Retrieves all tickers for a specific symbol from a specific exchange.
 * @param {string} exchangeId - Identifier of the exchange.
 * @param {string} symbol - Symbol of the ticker.
 */
async function getSavedAllTickersBySymbolFromExchange(exchangeId, symbol) {
  try {
    const collection = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getDataFromCollection(collection);

    if (tickersData && tickersData[exchangeId]) {
      const exchangeTickersData = tickersData[exchangeId];
      const filteredTickersData = exchangeTickersData.filter(
        (ticker) => ticker.symbol === symbol
      );

      if (filteredTickersData.length > 0) {
        return filteredTickersData;
      } else {
        throw new Error("Symbol not found for the given exchange");
      }
    } else {
      throw new Error("Exchange not found");
    }
  } catch (error) {
    throw new Error(
      "Failed to get saved tickers by symbol from exchange: " + error.message
    );
  }
}

/**
 * Updates all tickers by fetching the latest data from exchanges and saving it to the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function updateAllTickers(req, res) {
  try {
    const collection = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = {};
    const supportedExchanges = ["binance", "kucoin", "htx", "okx", "gateio"];

    for (const exchangeId of supportedExchanges) {
      const exchange = createExchangeInstance(exchangeId);
      const data = await exchange.fetchTickers();
      const mappedTickersData = mapTickers(data);
      tickersData[exchangeId] = mappedTickersData;
    }

    await deleteAndSaveObject(tickersData, collection);
    res.status(200).json(tickersData);
    saveLastUpdateToMongoDB(process.env.TYPE_TICKERS, "combined");
  } catch (error) {
    handleErrorResponse(res, error, "updateAllTickers");
  }
}

module.exports = {
  getAllTickers,
  fetchTickersInDatabase,
  updateAllTickers,
  getAllTickersByExchange,
  getSavedAllTickersByExchange,
  getAllTickersBySymbolFromExchange,
  getSavedAllTickersBySymbolFromExchange,
};
