// src/controllers/shadController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");
const { deleteAllDataMDB, saveData } = require("../services/mongodbService.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { fetchCmcData } = require("../services/cmcService.js");
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
    const data = await getDataFromCollection(collectionName);
    console.log("Fetched Shad data from database", { collectionName, count: data.length });
    return data;
  } catch (error) {
    errorLogger.error(`Error in fetchShadInDatabase: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Updates the shad data in the database.
 * @param {Object[]} data - Array of shad data to be updated.
 * @param {Object} res - HTTP response object.
 */
async function updateShadDataInDatabase(data, res) {
  const collectionName = process.env.MONGODB_COLLECTION_SHAD;
  try {
    const deleteResult = await deleteAllDataMDB(collectionName);
    const saveResult = await saveData(data, collectionName);
    await saveLastUpdateToMongoDB(process.env.TYPE_SHAD, "");

    res.status(200).json({
      status: true,
      message: "shad data updated successfully",
      data,
      deleteResult,
      saveResult,
      totalCount: data.length,
    });

    console.log("Shad data updated in database", { deleteResult, saveResult, totalCount: data.length });
  } catch (error) {
    errorLogger.error(`Error in updatesShadDataInDatabase: ${error.message}`, { error });
    handleErrorResponse(res, error, "updateShadDataInDatabase");
  }
}

/**
 * Updates the CoinMarketCap data by fetching the latest information from the CoinMarketCap API and saving it to the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function updateShad(req, res) {
  try {
    const data = await fetchShadData();
    console.log("Fetched latest CMC data", { count: data.length });
    await updateShadDataInDatabase(data, res);
  } catch (error) {
    errorLogger.error(`Error in updateShad: ${error.message}`, { error });
    handleErrorResponse(res, error, "updateShad");
  }
}

module.exports = { getShad, fetchShadInDatabase, updateShad };
