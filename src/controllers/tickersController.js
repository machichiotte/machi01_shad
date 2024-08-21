// src/controllers/tickersController.js
const { getData} = require("../utils/dataUtil.js");
const { createExchangeInstance } = require("../utils/exchangeUtil.js");
const { handleErrorResponse } = require("../utils/errorUtil.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveObject,
  deleteAndSaveData
} = require("../utils/mongodbUtil.js");
const { mapTickers } = require("../services/mapping.js");
const { getExchanges } = require("../utils/exchangeUtil.js");
const { loadErrorPolicies, shouldRetry } = require("../utils/errorUtil");
const { errorLogger } = require("../utils/loggerUtil.js");

/**
 * Retrieves all tickers from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getAllTickers(req, res) {
  try {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);
    res.status(200).json(tickersData);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickers");
  }
}

/**
 * Retrieves all tickers from the database.
 */
async function fetchTickersInDatabase() {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const data = await getData(collectionName);
    console.log(`🚀 ~ file: tickersController.js:33 ~ fetchTickersInDatabase ~ data.length:`, data.length)
    return data;
}

/**
 * Fetches the current tickers from the specified exchange.
 * @param {string} exchangeId - Identifier for the exchange.
 * @param {number} [retries=3] - Number of retry attempts.
 * @returns {Promise<Object[]>} - The fetched ticker data.
 */
async function fetchCurrentTickers(exchangeId, retries = 3) {
  const errorPolicies = await loadErrorPolicies(); // Load error policies

  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.fetchTickers();
    const mappedData = mapTickers(data, exchangeId);
    return mappedData;
  } catch (error) {
    console.log(`🚀 ~ file: tickerController.js:58 ~ fetchCurrentTickers ~ error:`, error);

    // Check if the error justifies a retry
    if (retries > 0 && shouldRetry(exchangeId, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000; // Exponential delay
      console.log(`Retrying fetchCurrentTickers... (${3 - retries + 1}/3)`, { delay });
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchCurrentTickers(exchangeId, retries - 1);
    }

    // Log non-recoverable errors
    errorLogger.error("Failed to fetch current tickers from exchange", { exchangeId, error: error.message });
    throw error;
  }
}


/**
 * Saves the provided ticker data to the database.
 * @param {Object[]} mappedData - The ticker data to be saved.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function saveTickersInDatabase(mappedData, exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_TICKERS;
  try {
    await deleteAndSaveData(mappedData, collection, exchangeId);
    await saveLastUpdateToMongoDB(process.env.TYPE_TICKERS, exchangeId);
    console.log("Saved ticker data to the database", { exchangeId });
  } catch (error) {
    errorLogger.error("Failed to save ticker data to database", { exchangeId, error: error.message });
    throw error;
  }
}


/**
 * Retrieves all tickers for a specific exchange.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function getAllTickersByExchange(req, res, exchangeId) {
  try {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);

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
  console.log(`🚀 ~ file: tickersController.js:117 ~ getSavedAllTickersByExchange ~ getSavedAllTickersByExchange:`)
  try {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);
    console.log(`🚀 ~ file: tickersController.js:121 ~ getSavedAllTickersByExchange ~ tickersData:`, tickersData)

    // Vérification que tickersData est bien un tableau
    if (!Array.isArray(tickersData)) {
      console.log(`🚀 ~ file: tickersController.js:125 ~ getSavedAllTickersByExchange ~ tickersData:`, tickersData)
      return [];
    }
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')

    const exchangeData = tickersData.filter((obj) => obj.platform === exchangeId);

    if (exchangeData) {
      console.log(`🚀 ~ file: tickersController.js:134 ~ getSavedAllTickersByExchange ~ exchangeData:`, exchangeData)
      console.log(`🚀 ~ file: tickersController.js:134 ~ getSavedAllTickersByExchange ~ exchangeData.length:`, exchangeData.length)
      return exchangeData;
    } else {
      console.log(`🚀 ~ file: tickersController.js:139 ~ getSavedAllTickersByExchange ~ []:`)
      return [];
    }
  } catch (error) {
    console.log(`🚀 ~ file: tickersController.js:138 ~ getSavedAllTickersByExchange ~ error:`, error)
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
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);

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
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);

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
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = {};
    const exchanges = getExchanges();
    for (const exchangeId of exchanges) {
      const exchange = createExchangeInstance(exchangeId);
      const data = await exchange.fetchTickers();
      const mappedTickersData = mapTickers(data);
      tickersData[exchangeId] = mappedTickersData;
    }

    await deleteAndSaveObject(tickersData, collectionName);
    res.status(200).json(tickersData);
    saveLastUpdateToMongoDB(process.env.TYPE_TICKERS, "combined");
  } catch (error) {
    handleErrorResponse(res, error, "updateAllTickers");
  }
}

module.exports = {
  getAllTickers,
  fetchTickersInDatabase,
  fetchCurrentTickers,
  saveTickersInDatabase,
  updateAllTickers,
  getAllTickersByExchange,
  getSavedAllTickersByExchange,
  getAllTickersBySymbolFromExchange,
  getSavedAllTickersBySymbolFromExchange,
};
