// src/services/tickersService.js
const { getData } = require("../utils/dataUtil");
const {
  createPlatformInstance,
  getPlatforms,
} = require("../utils/platformUtil.js");
const { mapTickers } = require("./mapping.js");
const { loadErrorPolicies, shouldRetry } = require("../utils/errorUtil");

const lastUpdateService = require("./lastUpdateService.js");
const mongodbService = require("./mongodbService.js");

/**
 * Fetches tickers data from the database.
 * @returns {Promise<Object>} The tickers data.
 */
async function fetchDatabaseTickers() {
  const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
  return await getData(collectionName);
}

/**
 * Gets all tickers for a specific platform.
 * @param {string} platform - The platform to get tickers for.
 * @returns {Promise<Array>} An array of tickers for the platform.
 * @throws {Error} If the platform is not found.
 */
async function getAllTickersByPlatform(platform) {
  const data = await fetchDatabaseTickers();
  if (data && data[platform]) {
    return data[platform];
  } else {
    throw new Error("Platform not found");
  }
}

/**
 * Gets all tickers for a specific symbol from a platform.
 * @param {string} platform - The platform to get tickers from.
 * @param {string} symbol - The symbol to get tickers for.
 * @returns {Promise<Array>} An array of tickers for the symbol and platform.
 * @throws {Error} If the platform or symbol is not found.
 */
async function getAllTickersBySymbolFromPlatform(platform, symbol) {
  const data = await fetchDatabaseTickers();
  if (data && data[platform]) {
    const platformTickersData = data[platform];
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
}

/**
 * Updates all tickers for all platforms.
 * @returns {Promise<Object>} The updated tickers data.
 */
async function updateAllTickers() {
  const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
  const tickersData = {};
  const platforms = getPlatforms();
  for (const platform of platforms) {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchTickers();
    const mappedTickersData = mapTickers(data);
    tickersData[platform] = mappedTickersData;
  }

  await mongodbService.deleteAndSaveObject(tickersData, collectionName);
  await lastUpdateService.saveLastUpdateToDatabase(
    process.env.TYPE_TICKERS,
    "combined"
  );
  return tickersData;
}

/**
 * Fetches current tickers for a specific platform.
 * @param {string} platform - The platform to fetch tickers for.
 * @param {number} [retries=3] - The number of retry attempts.
 * @returns {Promise<Array>} The mapped tickers data.
 * @throws {Error} If fetching fails after all retries.
 */
async function fetchCurrentTickers(platform, retries = 3) {
  const errorPolicies = await loadErrorPolicies();

  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchTickers();
    return mapTickers(data, platform);
  } catch (error) {
    console.log(
      `Error while fetching tickers for ${platform}:`,
      error
    );

    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000;
      console.log(
        `Retrying fetchCurrentTickers... (${3 - retries + 1}/3)`,
        { delay }
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentTickers(platform, retries - 1);
    }

    throw error;
  }
}

const databaseService = require("./databaseService");
/**
 * Saves the provided tickers data to the database.
 * @param {Object[]} mappedData - The tickers data to be saved.
 * @param {string} platform - Identifier of the platform.
 */
async function saveDatabaseTickers(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_TICKERS;
  const updateType = process.env.TYPE_TICKERS;

  await databaseService.saveDataToDatabase(
    mappedData,
    collection,
    platform,
    updateType
  );
}

module.exports = {
  fetchDatabaseTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers,
  fetchCurrentTickers,
  saveDatabaseTickers,
};
