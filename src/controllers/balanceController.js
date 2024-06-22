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
  let responseSent = false;

  try {
    const lastBalance = await getData(req, null, collection);
    console.log("🚀 ~ getBalance ~ lastBalance:", lastBalance);
    if (!responseSent) {
      res.json(lastBalance);
      responseSent = true;
    }
  } catch (error) {
    console.log("🚀 ~ getBalance ~ error:", { error: error.message });
    errorLogger.error("Failed to get balance", { error: error.message });

    if (!responseSent) {
      handleErrorResponse(res, error, "getBalance");
      responseSent = true;
    }
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
    console.log("🚀 ~ getSavedBalance ~ balance:", balance.length);
    return balance;
  } catch (error) {
    console.log("🚀 ~ getSavedBalance ~ error:", { error: error.message });
    errorLogger.error("Failed to get saved balance", { error: error.message });
    throw error;
  }
}

/**
 * Fetches the current balance from the specified exchange.
 * @param {string} exchangeId - Identifier for the exchange.
 * @returns {Promise<Object>} - The fetched balance data.
 */
async function fetchCurrentBalance(exchangeId, retries = 3) {
  console.log("🚀 ~ fetchCurrentBalance ~ exchangeId:", exchangeId);
  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.fetchBalance();
    const mappedData = mapBalance(exchangeId, data);
    console.log("🚀 ~ fetchCurrentBalance ~ mappedData:", mappedData.length);
    return mappedData;
  } catch (error) {
    console.log("🚀 ~ fetchCurrentBalance ~ error:", error);

    if (retries > 0) {
      console.log(`Retrying... (${3 - retries + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchCurrentBalance(exchangeId, retries - 1);
    }

    errorLogger.error("Failed to fetch current balance from exchange", {
      exchangeId,
      error: error.message,
    });

    // throw error;
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
    //infoLogger.info("Saved balance data to the database.", { exchangeId });
    console.log("🚀 ~ saveBalanceInDatabase ~ exchangeId:", exchangeId);
  } catch (error) {
    console.log("🚀 ~ saveBalanceInDatabase ~ error:", error);
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
    //infoLogger.info("Updated current balance successfully.", { exchangeId });
    console.log("🚀 ~ updateCurrentBalance ~ exchangeId:", exchangeId);
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
