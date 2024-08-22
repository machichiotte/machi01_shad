// src/controllers/balanceController.js
const { handleErrorResponse } = require("../utils/errorUtil");
const { getData } = require("../utils/dataUtil");
const { createPlatformInstance } = require("../utils/platformUtil.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveData,
} = require("../utils/mongodbUtil");
const { mapBalance } = require("../services/mapping");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil.js");
const { loadErrorPolicies, shouldRetry } = require("../utils/errorUtil");

validateEnvVariables(["MONGODB_COLLECTION_BALANCE", "TYPE_BALANCE"]);

/**
 * Retrieves the latest recorded balance from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getBalances(req, res) {
  const collectionName = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    const data = await getData(collectionName);
    console.log(`🚀 ~ file: balanceController.js:23 ~ getBalances ~ res:`, {
      collectionName,
      count: data.length,
    });
    res.json(data);
  } catch (error) {
    errorLogger.error("Failed to get balances", { error: error.message });
    handleErrorResponse(res, error, "getBalances");
  }
}

/**
 * Retrieves the latest recorded balance from the database.
 * @returns {Promise<Object[]>} - The latest recorded balance.
 */
async function fetchBalancesInDatabase() {
  const collectionName = process.env.MONGODB_COLLECTION_BALANCE;
  const data = await getData(collectionName);
  console.log(
    `🚀 ~ file: balanceController.js:38 ~ fetchBalancesInDatabase ~ data:`,
    data.length
  );
  return data;
}

/**
 * Fetches the current balance from the specified platform.
 * @param {string} platform - Identifier for the platform.
 * @param {number} [retries=3] - Number of retry attempts.
 * @returns {Promise<Object[]>} - The fetched balance data.
 */
async function fetchCurrentBalance(platform, retries = 3) {
  const errorPolicies = await loadErrorPolicies(); // Charger les politiques d'erreurs

  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.fetchBalance();
    const mappedData = mapBalance(platform, data);
    console.log(
      `🚀 ~ file: balanceController.js:54 ~ fetchCurrentBalance ~ Fetched current balance from ${platform}`,
      { count: mappedData.length }
    );
    return mappedData;
  } catch (error) {
    console.log(
      `🚀 ~ file: balanceController.js:57 ~ fetchCurrentBalance ~ error:`,
      error
    );

    // Vérifiez si l'erreur justifie une nouvelle tentative
    if (retries > 0 && shouldRetry(platform, error, errorPolicies)) {
      const delay = Math.pow(2, 3 - retries) * 1000; // Délai exponentiel
      console.log(`Retrying fetchCurrentBalance... (${3 - retries + 1}/3)`, {
        delay,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchCurrentBalance(platform, retries - 1);
    }

    // Logger les erreurs non récupérables
    errorLogger.error("Failed to fetch current balance from platform", {
      platform,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Saves the provided balance data to the database.
 * @param {Object[]} mappedData - The balance data to be saved.
 * @param {string} platform - Identifier of the platform.
 */
async function saveBalanceInDatabase(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    await deleteAndSaveData(mappedData, collection, platform);
    await saveLastUpdateToMongoDB(process.env.TYPE_BALANCE, platform);
    console.log("Saved balance data to the database", { platform });
  } catch (error) {
    errorLogger.error("Failed to save balance data to database", {
      platform,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Updates the current balance by fetching it from a platform and saving it to the database.
 * @param {Object} req - HTTP request object containing the platform identifier.
 * @param {Object} res - HTTP response object.
 */
async function updateCurrentBalance(req, res) {
  const platform = req.params.platform;
  try {
    const data = await fetchCurrentBalance(platform);
    await saveBalanceInDatabase(data, platform);
    res.status(200).json({
      status: true,
      message: "Current balance updated successfully.",
      data: data,
    });
    console.log("Updated current balance successfully", {
      platform,
    });
  } catch (error) {
    errorLogger.error("Failed to update current balance", {
      platform,
      error: error.message,
    });
    handleErrorResponse(res, error, "updateCurrentBalance");
  }
}

module.exports = {
  getBalances,
  fetchBalancesInDatabase,
  fetchCurrentBalance,
  saveBalanceInDatabase,
  updateCurrentBalance,
};
