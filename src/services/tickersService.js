// src/services/tickersService.js
const { getData, deleteAndSaveData } = require("../utils/dataUtil");
const {
  createPlatformInstance,
  getPlatforms,
} = require("../utils/platformUtil.js");
const { mapTickers } = require("./mapping.js");
const { loadErrorPolicies, shouldRetry } = require("../utils/errorUtil");
const { errorLogger } = require("../utils/loggerUtil.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveObject,
  deleteAndSaveData,
} = require("../utils/mongodbUtil.js");

async function fetchDatabaseTickers() {
  const collectionName = process.env.MONGODB_COLLECTION_TICKERS;
  return await getData(collectionName);
}

async function getAllTickersByPlatform(platform) {
  const data = await fetchDatabaseTickers();
  if (data && data[platform]) {
    return data[platform];
  } else {
    throw new Error("Platform not found");
  }
}

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

  await deleteAndSaveObject(tickersData, collectionName);
  saveLastUpdateToMongoDB(process.env.TYPE_TICKERS, "combined");
  return tickersData;
}

async function fetchCurrentTickers(platform, retries = 3) {
  const errorPolicies = await loadErrorPolicies();

  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchTickers();
    return mapTickers(data, platform);
  } catch (error) {
    console.log(
      `Erreur lors de la récupération des tickers pour ${platform}:`,
      error
    );

    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000;
      console.log(
        `Nouvelle tentative de fetchCurrentTickers... (${3 - retries + 1}/3)`,
        { delay }
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentTickers(platform, retries - 1);
    }

    throw error;
  }
}

async function saveDatabaseTickers(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_TICKERS;
  try {
    await deleteAndSaveData(mappedData, collection, platform);
    await saveLastUpdateToMongoDB(process.env.TYPE_TICKERS, platform);
    console.log("Données des tickers sauvegardées dans la base de données", {
      platform,
    });
  } catch (error) {
    errorLogger.error(
      "Échec de la sauvegarde des données des tickers dans la base de données",
      {
        platform,
        error: error.message,
      }
    );
    throw error;
  }
}

module.exports = {
  fetchDatabaseTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers,
  fetchCurrentTickers,
  saveDatabaseTickers,
};
