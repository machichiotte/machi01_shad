// src/controllers/shadController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData } = require("../utils/dataUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil.js");

validateEnvVariables(['MONGODB_COLLECTION_CMC', 'TYPE_CMC']);

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getShad(req, res) {
  const collectionName = process.env.MONGODB_COLLECTION_SHAD;
  try {
    const data = await getData(collectionName);
    console.log("Retrieved Shad data", { collectionName, count: data.length });
    res.json(data);
  } catch (error) {
    errorLogger.error(`Error in getShad: ${error.message}`, { error });
    handleErrorResponse(res, error, "getShad");
  }
}

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @returns {Promise<Object[]>} - The latest CMC data from the database.
 */
async function fetchShadInDatabase() {
  const collectionName = process.env.MONGODB_COLLECTION_CMC;
  try {
    const data = await getData(collectionName);
    console.log("Fetched Shad data from database", { collectionName, count: data.length });
    return data;
  } catch (error) {
    errorLogger.error(`Error in fetchShadInDatabase: ${error.message}`, { error });
    throw error;
  }
}

module.exports = { getShad, fetchShadInDatabase };
