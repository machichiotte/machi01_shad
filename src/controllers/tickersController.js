// src/controllers/tickersController.js
const { getData } = require("../utils/dataUtil.js");
const { createPlatformInstance } = require("../utils/platformUtil.js");
const { handleErrorResponse } = require("../utils/errorUtil.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveObject,
  deleteAndSaveData,
} = require("../utils/mongodbUtil.js");
const { mapTickers } = require("../services/mapping.js");
const { getPlatforms } = require("../utils/platformUtil.js");
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
async function fetchDatabaseTickers() {
  const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
  const data = await getData(collectionName);
  console.log(
    `🚀 ~ file: tickersController.js:37 ~ fetchDatabaseTickers :`,
    { collectionName, count: data.length }
  );
  return data;
}

/**
 * Fetches the current tickers from the specified platform.
 * @param {string} platform - Identifier for the platform.
 * @param {number} [retries=3] - Number of retry attempts.
 * @returns {Promise<Object[]>} - The fetched ticker data.
 */
async function fetchCurrentTickers(platform, retries = 3) {
  const errorPolicies = await loadErrorPolicies(); // Load error policies

  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchTickers();
    const mappedData = mapTickers(data, platform);
    return mappedData;
  } catch (error) {
    console.log(
      `🚀 ~ file: tickerController.js:58 ~ fetchCurrentTickers ~ error:`,
      error
    );

    // Check if the error justifies a retry
    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000; // Exponential delay
      console.log(`Retrying fetchCurrentTickers... (${3 - retries + 1}/3)`, {
        delay,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentTickers(platform, retries - 1);
    }

    throw error;
  }
}

/**
 * Saves the provided ticker data to the database.
 * @param {Object[]} mappedData - The ticker data to be saved.
 * @param {string} platform - Identifier of the platform.
 */
async function saveDatabaseTickers(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_TICKERS;
  try {
    await deleteAndSaveData(mappedData, collection, platform);
    await saveLastUpdateToMongoDB(process.env.TYPE_TICKERS, platform);
    console.log("Saved ticker data to the database", { platform });
  } catch (error) {
    errorLogger.error("Failed to save ticker data to database", {
      platform,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Retrieves all tickers for a specific platform.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @param {string} platform - Identifier of the platform.
 */
async function getAllTickersByPlatform(req, res, platform) {
  try {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);

    if (tickersData && tickersData[platform]) {
      const platformTickersData = tickersData[platform];
      res.status(200).json(platformTickersData);
    } else {
      res.status(404).json({ error: "Platform not found" });
    }
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersByPlatform");
  }
}

/**
 * Retrieves all tickers for a specific platform.
 * @param {string} platform - Identifier of the platform.
 */
async function getSavedAllTickersByPlatform(platform) {
  try {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);
    console.log(
      `🚀 ~ file: tickersController.js:121 ~ getSavedAllTickersByPlatform ~ tickersData:`,
      tickersData.length
    );
    console.log(
      `🚀 ~ file: tickersController.js:122 ~ getSavedAllTickersByPlatform ~ tickersData:`,
      tickersData[0]
    );

    // Vérification que tickersData est bien un tableau
    if (!Array.isArray(tickersData)) {
      console.log(
        `🚀 ~ file: tickersController.js:125 ~ getSavedAllTickersByPlatform ~ tickersData:`,
        tickersData[0]
      );
      return [];
    }

    const platformData = tickersData.filter((obj) => obj.platform === platform);

    if (platformData) {
      return platformData;
    } else {
      return [];
    }
  } catch (error) {
    console.log(
      `🚀 ~ file: tickersController.js:138 ~ getSavedAllTickersByPlatform ~ error:`,
      error
    );
    return [];
  }
}

/**
 * Retrieves all tickers for a specific symbol from a specific platform.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @param {string} platform - Identifier of the platform.
 * @param {string} symbol - Symbol of the ticker.
 */
async function getAllTickersBySymbolFromPlatform(req, res, platform, symbol) {
  try {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);

    if (tickersData && tickersData[platform]) {
      const platformTickersData = tickersData[platform];
      const filteredTickersData = platformTickersData.filter(
        (ticker) => ticker.symbol === symbol
      );

      if (filteredTickersData.length > 0) {
        res.status(200).json(filteredTickersData);
      } else {
        res
          .status(404)
          .json({ error: "Symbol not found for the given platform" });
      }
    } else {
      res.status(404).json({ error: "Platform not found" });
    }
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersBySymbolFromPlatform");
  }
}

/**
 * Retrieves all tickers for a specific symbol from a specific platform.
 * @param {string} platform - Identifier of the platform.
 * @param {string} symbol - Symbol of the ticker.
 */
async function getSavedAllTickersBySymbolFromPlatform(platform, symbol) {
  try {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = await getData(collectionName);

    if (tickersData && tickersData[platform]) {
      const platformTickersData = tickersData[platform];
      const filteredTickersData = platformTickersData.filter(
        (ticker) => ticker.symbol === symbol
      );

      if (filteredTickersData.length > 0) {
        return filteredTickersData;
      } else {
        throw new Error("Symbol not found for the given platform");
      }
    } else {
      throw new Error("Platform not found");
    }
  } catch (error) {
    throw new Error(
      "Failed to get saved tickers by symbol from platform: " + error.message
    );
  }
}

/**
 * Updates all tickers by fetching the latest data from platforms and saving it to the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function updateAllTickers(req, res) {
  try {
    const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
    const tickersData = {};
    const platforms = getPlatforms();
    for (const platform of platforms) {
      const platformInstance = createPlatformInstance(platform);
      const data = await platformInstance.fetchTickers();
      const mappedTickersData = mapTickers(data);
      tickersData[platform] = mappedTickersData;
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
  fetchDatabaseTickers,
  fetchCurrentTickers,
  saveDatabaseTickers,
  updateAllTickers,
  getAllTickersByPlatform,
  getSavedAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  getSavedAllTickersBySymbolFromPlatform,
};
