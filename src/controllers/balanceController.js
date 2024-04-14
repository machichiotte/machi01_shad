// src/controllers/balanceController.js

const {
  createExchangeInstance,
  saveLastUpdateToMongoDB,
  deleteAndSaveData,
  handleErrorResponse,
  getData,
} = require("../services/utils.js");
const { mapBalance } = require("../services/mapping.js");

/**
 * Retrieves the last recorded balance from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getLastBalance(req, res) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  const lastBalance = await getData(
    req,
    res,
    collection,
    "db_machi_shad.collection_balance.json"
  );

  if (!res) return lastBalance;
}

/**
 * Fetches the current balance from an exchange.
 * @param {string} exchangeId - Identifier of the exchange.
 * @returns {Promise<Object>} - A promise resolved with the fetched balance data.
 */
async function fetchCurrentBalance(exchangeId) {
  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.fetchBalance();
    const mappedData = mapBalance(exchangeId, data);
    return mappedData;
  } catch (error) {
    throw error;
  }
}

/**
 * Saves the provided balance data to MongoDB.
 * @param {Object} data - Balance data to be saved.
 * @param {string} exchangeId - Identifier of the exchange.
 * @param {Object} res - HTTP response object.
 */
async function saveBalanceInDatabase(mappedData, exchangeId, res) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    await deleteAndSaveData(mappedData, collection, exchangeId);
    saveLastUpdateToMongoDB(process.env.TYPE_BALANCE, exchangeId);

    if (res) res.status(200).json(mappedData);
  } catch (error) {
    if (res) handleErrorResponse(res, error, "saveBalanceToMongoDB");
    console.error("saveBalanceToMongoDB", error);
  }
}

/**
 * Updates the current balance by fetching it from an exchange and saving it to MongoDB.
 * @param {Object} req - HTTP request object containing the exchange identifier.
 * @param {Object} res - HTTP response object.
 */
async function updateCurrentBalance(req, res) {
  const { exchangeId } = req.params;
  try {
    const balanceData = await fetchCurrentBalance(exchangeId);
    await saveBalanceInDatabase(balanceData, exchangeId, res);
  } catch (error) {
    handleErrorResponse(res, error, "updateCurrentBalance");
  }
}

module.exports = {
  getLastBalance,
  fetchCurrentBalance,
  saveBalanceInDatabase,
  updateCurrentBalance,
};
