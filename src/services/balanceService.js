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
    return data.filter((item) => item.platform === platform);
  } catch (error) {
    if (
      retries > 0 &&
      shouldRetry(platform, error, await loadErrorPolicies())
    ) {
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

const databaseService = require("./databaseService");
/**
 * Sauvegarde les données de solde fournies dans la base de données.
 * @param {Object[]} mappedData - Les données de marché à sauvegarder.
 * @param {string} platform - Identifiant de la plateforme.
 */
async function saveDatabaseBalance(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  const updateType = process.env.TYPE_BALANCE;

  await databaseService.saveDataToDatabase(
    mappedData,
    collection,
    platform,
    updateType
  );
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
