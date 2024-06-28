const { handleErrorResponse } = require("../utils/errorUtil");
const { getData, getDataFromCollection } = require("../utils/dataUtil");
const { createExchangeInstance } = require("../utils/exchangeUtil");
const { saveLastUpdateToMongoDB, deleteAndSaveData } = require("../utils/mongodbUtil");
const { mapBalance } = require("../services/mapping");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil.js");

validateEnvVariables(['MONGODB_COLLECTION_BALANCE', 'TYPE_BALANCE']);

/**
 * Retrieves the latest recorded balance from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getBalance(req, res) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    const lastBalance = await getData(req, null, collection);
    console.log("Retrieved last balance", { collection, count: lastBalance.length });
    res.json(lastBalance);
  } catch (error) {
    errorLogger.error("Failed to get balance", { error: error.message });
    handleErrorResponse(res, error, "getBalance");
  }
}

/**
 * Retrieves the latest recorded balance from the database.
 * @returns {Promise<Object[]>} - The latest recorded balance.
 */
async function fetchBalancesInDatabase() {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  const data = await getDataFromCollection(collection);
  console.log("Fetched balances from database", { collection, count: data.length });
  return data;
}

/**
 * Fetches the current balance from the specified exchange.
 * @param {string} exchangeId - Identifier for the exchange.
 * @param {number} [retries=3] - Number of retry attempts.
 * @returns {Promise<Object[]>} - The fetched balance data.
 */
async function fetchCurrentBalance(exchangeId, retries = 3) {
  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.fetchBalance();
    const mappedData = mapBalance(exchangeId, data);
    console.log(`Fetched current balance from ${exchangeId}`, { count: mappedData.length });
    return mappedData;
  } catch (error) {
    if (retries > 0) {
      const delay = (3 - retries) * 2000;
      console.log(`Retrying fetchCurrentBalance... (${3 - retries + 1}/3)`, { delay });
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchCurrentBalance(exchangeId, retries - 1);
    }
    errorLogger.error("Failed to fetch current balance from exchange", { exchangeId, error: error.message });
    throw error;
  }
}

/**
 * Saves the provided balance data to the database.
 * @param {Object[]} mappedData - The balance data to be saved.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function saveBalanceInDatabase(mappedData, exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    await deleteAndSaveData(mappedData, collection, exchangeId);
    await saveLastUpdateToMongoDB(process.env.TYPE_BALANCE, exchangeId);
    console.log("Saved balance data to the database", { exchangeId });
  } catch (error) {
    errorLogger.error("Failed to save balance data to database", { exchangeId, error: error.message });
    throw error;
  }
}

/**
 * Updates the current balance by fetching it from an exchange and saving it to the database.
 * @param {Object} req - HTTP request object containing the exchange identifier.
 * @param {Object} res - HTTP response object.
 */
async function updateCurrentBalance(req, res) {
  const exchangeId = req.params.exchangeId;
  try {
    const balanceData = await fetchCurrentBalance(exchangeId);
    await saveBalanceInDatabase(balanceData, exchangeId);
    res.status(200).json({
      status: true,
      message: "Current balance updated successfully.",
      data: balanceData,
    });
    console.log("Updated current balance successfully", { exchangeId });
  } catch (error) {
    errorLogger.error("Failed to update current balance", { exchangeId, error: error.message });
    handleErrorResponse(res, error, "updateCurrentBalance");
  }
}

module.exports = {
  getBalance,
  fetchBalancesInDatabase,
  fetchCurrentBalance,
  saveBalanceInDatabase,
  updateCurrentBalance,
};