// src/controllers/balanceController.js
const { handleErrorResponse } = require("../utils/errorUtil");
const { getData, getDataFromCollection } = require("../utils/dataUtil");
const { createExchangeInstance } = require("../utils/exchangeUtil");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveData,
} = require("../utils/mongodbUtil");
const { mapBalance } = require("../services/mapping");
const { errorLogger, infoLogger } = require("../utils/loggerUtil.js");

/**
 * Retrieves the latest recorded balance from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getBalance(req, res) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    const lastBalance = await getData(req, res, collection);
    infoLogger.info("Fetched the last recorded balance from the database.");
    console.log("Fetched the last recorded balance from the database.");
    res.json(lastBalance);
  } catch (error) {
    errorLogger.error("Failed to get balance", { error: error.message });
    console.log("Failed to get balance", { error: error.message });
    handleErrorResponse(res, error, "getBalance");
  }
}

/**
 * Retrieves the latest recorded balance from the database.
 * @returns {Promise<Object>} - The latest recorded balance.
 */
async function getSavedBalance() {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    const balance = await getDataFromCollection(collection);
    infoLogger.info("Retrieved saved balance from the database.");
    console.log("Retrieved saved balance from the database.");
    return balance;
  } catch (error) {
    errorLogger.error("Failed to get saved balance", { error: error.message });
    console.log("Failed to get saved balance", { error: error.message });
    throw error;
  }
}

/**
 * Fetches the current balance from the specified exchange.
 * @param {string} exchangeId - Identifier for the exchange.
 * @returns {Promise<Object>} - The fetched balance data.
 */
async function fetchCurrentBalance(exchangeId) {
  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.fetchBalance();
    const mappedData = mapBalance(exchangeId, data);
    infoLogger.info(
      "Fetched and mapped balance from the " +
        {
          exchangeId,
        }
    );
    console.log(
      "Fetched and mapped balance from " +
        {
          exchangeId,
        }
    );
    return mappedData;
  } catch (error) {
    errorLogger.error("Failed to fetch current balance from exchange", {
      exchangeId,
      error: error.message,
    });
    console.log("Failed to fetch current balance from exchange", {
      exchangeId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Saves the provided balance data to the database.
 * @param {Object} mappedData - The balance data to be saved.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function saveBalanceInDatabase(mappedData, exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_BALANCE;
  try {
    await deleteAndSaveData(mappedData, collection, exchangeId);
    await saveLastUpdateToMongoDB(process.env.TYPE_BALANCE, exchangeId);
    infoLogger.info("Saved balance data to the database.", { exchangeId });
    console.log("Saved balance data to the database.", { exchangeId });
  } catch (error) {
    errorLogger.error("Failed to save balance data to database", {
      exchangeId,
      error: error.message,
    });
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
    infoLogger.info("Updated current balance successfully.", { exchangeId });
  } catch (error) {
    errorLogger.error("Failed to update current balance", {
      exchangeId,
      error: error.message,
    });
    handleErrorResponse(res, error, "updateCurrentBalance");
  }
}

module.exports = {
  getBalance,
  getSavedBalance,
  fetchCurrentBalance,
  saveBalanceInDatabase,
  updateCurrentBalance,
};
