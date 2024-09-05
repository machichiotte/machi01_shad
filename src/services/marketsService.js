// src/services/marketsService.js
const { getData } = require("../utils/dataUtil.js");
const { mapMarkets } = require("../services/mapping.js");
const { createPlatformInstance } = require("../utils/platformUtil.js");
const { loadErrorPolicies, shouldRetry } = require("../utils/errorUtil");
const lastUpdateService = require("./lastUpdateService.js");
const mongodbService = require("./mongodbService.js");
/**
 * Fetches the current markets from the specified platform.
 * @param {string} platform - Identifier for the platform.
 * @param {number} [retries=3] - Number of retry attempts.
 * @returns {Promise<Object[]>} - The fetched market data.
 */
async function fetchCurrentMarkets(platform, retries = 3) {
  const errorPolicies = await loadErrorPolicies(); // Load error policies

  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchMarkets();
    const mappedData = mapMarkets(data, platform); // Assuming you have a mapMarkets function
    return mappedData;
  } catch (error) {
    console.log(
      `🚀 ~ file: marketController.js:58 ~ fetchCurrentMarkets ~ error:`,
      error
    );

    // Check if the error justifies a retry
    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000; // Exponential delay
      console.log(`Retrying fetchCurrentMarkets... (${3 - retries + 1}/3)`, {
        delay,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentMarkets(platform, retries - 1);
    }

    // Log non-recoverable errors
    console.error("Failed to fetch current markets from platform", {
      platform,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Saves the provided market data to the database.
 * @param {Object[]} mappedData - The market data to be saved.
 * @param {string} platform - Identifier of the platform.
 */
async function saveDatabaseMarkets(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  try {
    await mongodbService.deleteAndSaveData(mappedData, collection, platform);
    await lastUpdateService.saveLastUpdateToDatabase(
      process.env.TYPE_LOAD_MARKETS,
      platform
    );
    console.log("Saved market data to the database", { platform });
  } catch (error) {
    console.error("Failed to save market data to database", {
      platform,
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
    console.error("Failed to fetch saved market data.", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Fetches the latest market data from an platform.
 * @param {string} platform - Identifier of the platform.
 * @returns {Promise<Object>} - The fetched market data.
 */
async function fetchMarketData(platform) {
  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.loadMarkets();
    console.log(`Fetched market data from ${platform}.`, {
      count: Object.keys(data).length,
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch market data from ${platform}.`, {
      error: error.message,
    });
    throw error;
  }
}

async function updateMarketDataInDatabase(data, platform) {
  const collection = process.env.MONGODB_COLLECTION_LOAD_MARKETS;
  const mappedData = mapMarkets(platform, data);
  await mongodbService.deleteAndSaveData(mappedData, collection, platform);
  await lastUpdateService.saveLastUpdateToDatabase(
    process.env.TYPE_LOAD_MARKETS,
    platform
  );
  console.log(`Updated market data in database for ${platform}.`, {
    count: mappedData.length,
  });
  return mappedData;
}

module.exports = {
  fetchCurrentMarkets,
  saveDatabaseMarkets,
  getSavedMarkets,
  fetchMarketData,
  updateMarketDataInDatabase,
};
