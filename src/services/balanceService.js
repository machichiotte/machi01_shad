// src/services/balanceService.js
const { getData } = require("../utils/dataUtil");
const { createPlatformInstance } = require("../utils/platformUtil");
const { loadErrorPolicies, shouldRetry } = require("../utils/errorUtil");

const mapping = require("../services/mapping");

const { validateEnvVariables } = require("../utils/controllerUtil");
validateEnvVariables(["MONGODB_COLLECTION_BALANCE", "TYPE_BALANCE"]);

/**
 * Fetches all balance data from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of balance data.
 */
async function fetchDatabaseBalances() {
  const collectionName = process.env.MONGODB_COLLECTION_BALANCE;
  return await getData(collectionName);
}

/**
 * Fetches balance data from the database for a specific platform.
 * @param {string} platform - The platform identifier.
 * @param {number} [retries=3] - The number of retry attempts.
 * @returns {Promise<Array>} A promise that resolves to an array of balance data for the specified platform.
 * @throws {Error} If fetching fails after all retry attempts.
 */
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

/**
 * Fetches current balance data from a specific platform.
 * @param {string} platform - The platform identifier.
 * @param {number} [retries=3] - The number of retry attempts.
 * @returns {Promise<Array>} A promise that resolves to an array of current balance data for the specified platform.
 * @throws {Error} If fetching fails after all retry attempts.
 */
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
 * Saves the provided balance data to the database.
 * @param {Object[]} mappedData - The balance data to save.
 * @param {string} platform - The platform identifier.
 * @returns {Promise<void>}
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

/**
 * Updates the balance for a specific platform by fetching current data and saving it to the database.
 * @param {string} platform - The platform identifier.
 * @returns {Promise<Array>} A promise that resolves to the updated balance data.
 */
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
