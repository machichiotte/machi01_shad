// src/controllers/marketsController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData } = require("../utils/dataUtil.js");
const { mapMarkets } = require("../services/mapping.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveData,
} = require("../utils/mongodbUtil.js");
const { createExchangeInstance } = require("../utils/exchangeUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil");

validateEnvVariables(["MONGODB_COLLECTION_LOAD_MARKETS", "TYPE_LOAD_MARKETS"]);

const { loadErrorPolicies, shouldRetry } = require("../utils/errorUtil");

/**
 * Retrieves the latest market data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getMarkets(req, res) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  try {
    const data = await getData(collection);
    console.log("Retrieved market data from the database.", {
      collection,
      count: data.length,
    });
    res.json(data);
  } catch (error) {
    errorLogger.error("Failed to retrieve market data.", {
      error: error.message,
    });
    handleErrorResponse(res, error, "getMarkets");
  }
}

/**
 * Fetches the current markets from the specified exchange.
 * @param {string} exchangeId - Identifier for the exchange.
 * @param {number} [retries=3] - Number of retry attempts.
 * @returns {Promise<Object[]>} - The fetched market data.
 */
async function fetchCurrentMarkets(exchangeId, retries = 3) {
  const errorPolicies = await loadErrorPolicies(); // Load error policies

  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.fetchMarkets();
    const mappedData = mapMarkets(data, exchangeId); // Assuming you have a mapMarkets function
    return mappedData;
  } catch (error) {
    console.log(
      `🚀 ~ file: marketController.js:58 ~ fetchCurrentMarkets ~ error:`,
      error
    );

    // Check if the error justifies a retry
    if (retries > 0 && shouldRetry(exchangeId, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000; // Exponential delay
      console.log(`Retrying fetchCurrentMarkets... (${3 - retries + 1}/3)`, {
        delay,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentMarkets(exchangeId, retries - 1);
    }

    // Log non-recoverable errors
    errorLogger.error("Failed to fetch current markets from exchange", {
      exchangeId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Saves the provided market data to the database.
 * @param {Object[]} mappedData - The market data to be saved.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function saveMarketsInDatabase(mappedData, exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  try {
    await deleteAndSaveData(mappedData, collection, exchangeId);
    await saveLastUpdateToMongoDB(process.env.TYPE_LOAD_MARKETS, exchangeId);
    console.log("Saved market data to the database", { exchangeId });
  } catch (error) {
    errorLogger.error("Failed to save market data to database", {
      exchangeId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Retrieves the latest market data from the database.
 * @returns {Promise<Object[]>} - The last recorded markets.
 */
async function getSavedMarkets() {
  const collectionName = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  try {
    const data = await getData(collectionName);
    console.log("Fetched saved market data from the database.", {
      collectionName,
      count: data.length,
    });
    return data;
  } catch (error) {
    errorLogger.error("Failed to fetch saved market data.", {
      error: error.message,
    });
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
    console.log(`Fetched market data from ${exchangeId}.`, {
      count: Object.keys(data).length,
    });
    return data;
  } catch (error) {
    errorLogger.error(`Failed to fetch market data from ${exchangeId}.`, {
      error: error.message,
    });
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
    console.log(`Updated market data in database for ${exchangeId}.`, {
      count: mappedData.length,
    });
    res.status(200).json(mappedData);
  } catch (error) {
    errorLogger.error("Failed to update market data in database.", {
      error: error.message,
    });
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
    errorLogger.error(`Failed to update markets for ${exchangeId}.`, {
      error: error.message,
    });
    handleErrorResponse(res, error, "updateMarkets");
  }
}

module.exports = {
  getMarkets,
  fetchCurrentMarkets,
  saveMarketsInDatabase,
  getSavedMarkets,
  updateMarkets,
};
