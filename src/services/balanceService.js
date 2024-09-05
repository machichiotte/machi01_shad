// src/services/balanceService.js
const { getData } = require("../utils/dataUtil");
const { createPlatformInstance } = require("../utils/platformUtil");
const { loadErrorPolicies, shouldRetry } = require("../utils/errorUtil");

const lastUpdateService = require("./lastUpdateService");
const mongodbService = require("./mongodbService");
const mapping = require("../services/mapping");


const { validateEnvVariables } = require("../utils/controllerUtil");  
validateEnvVariables(["MONGODB_COLLECTION_BALANCE", "TYPE_BALANCE"]);


async function fetchDatabaseBalances() {
  const collectionName = process.env.MONGODB_COLLECTION_BALANCE;
  return await getData(collectionName);
}

async function fetchDatabaseBalancesByPlatform(platform, retries = 3) {
  try {
    const data = await fetchDatabaseBalances();
    return data.filter(item => item.platform === platform);
  } catch (error) {
    if (retries > 0 && shouldRetry(platform, error, await loadErrorPolicies())) {
      const delay = Math.pow(2, 3 - retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchDatabaseBalancesByPlatform(platform, retries - 1);
    }
    console.error("Failed to fetch current balance from platform", {
      platform,
      error: error.message,
    });
    throw error;
  }
}

async function fetchCurrentBalancesByPlatform(platform, retries = 3) {
  const errorPolicies = await loadErrorPolicies();
  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchBalance();
    return mapping.mapBalance(platform, data);
  } catch (error) {
    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentBalancesByPlatform(platform, retries - 1);
    }
    console.error("Failed to fetch current balance from platform", {
      platform,
      error: error.message,
    });
    throw error;
  }
}

async function saveDatabaseBalance(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    await mongodbService.deleteAndSaveData(mappedData, collection, platform);
    await lastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_BALANCE, platform);
  } catch (error) {
    console.error("Failed to save balance data to database", {
      platform,
      error: error.message,
    });
    throw error;
  }
}

async function updateBalanceForPlatform(platform) {
  const data = await fetchCurrentBalancesByPlatform(platform);
  await saveDatabaseBalance(data, platform);
  return data;
}

module.exports = {
  fetchDatabaseBalances,
  fetchDatabaseBalancesByPlatform,
  fetchCurrentBalancesByPlatform,
  saveDatabaseBalance,
  updateBalanceForPlatform,
};