// src/controllers/cmcController.js

const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");
const { deleteAllDataMDB, saveData } = require("../services/mongodbService.js");
const { errorLogger, infoLogger } = require("../utils/loggerUtil.js");
const { fetchCmcData } = require("../services/cmcService.js");

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getCmc(req, res) {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  try {
    const data = await getData(req, res, collection);
    console.log("🚀 ~ getCmc ~ data:", data);
  } catch (error) {
    errorLogger.error(`Error in getCmc: ${error.message}`);
    handleErrorResponse(res, error, "getCmc");
  }
}

/**
 * Retrieves the latest CoinMarketCap data from the database.
 */
async function getSavedCmc() {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  try {
    const data = await getDataFromCollection(collection);
    console.log("🚀 ~ getSavedCmc ~ data:", data.length);
    return data;
  } catch (error) {
    errorLogger.error(`Error in getSavedCmc: ${error.message}`);
    throw error;
  }
}

/**
 * Updates the CoinMarketCap data in the database.
 * @param {Array} cmcData - Array of CoinMarketCap data to be updated.
 * @param {Object} res - HTTP response object.
 */
async function updateCmcDataInDatabase(cmcData, res) {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  try {
    const deleteResult = await deleteAllDataMDB(collection);
    const saveResult = await saveData(cmcData, collection);
    await saveLastUpdateToMongoDB(process.env.TYPE_CMC, "");

    res.status(200).json({
      data: cmcData,
      deleteResult,
      saveResult,
      totalCount: cmcData.length,
    });

    console.log("🚀 ~ res.status ~ res:", res);
  } catch (error) {
    errorLogger.error(`Error in updateCmcDataInDatabase: ${error.message}`);
    handleErrorResponse(res, error, "updateCmcDataInDatabase");
  }
}

/**
 * Updates the CoinMarketCap data by fetching the latest information from the CoinMarketCap API and saving it to the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function updateCmc(req, res) {
  try {
    const cmcData = await fetchCmcData();
    console.log("🚀 ~ updateCmc ~ cmcData:", cmcData)
    const update = await updateCmcDataInDatabase(cmcData, res);
    console.log("🚀 ~ updateCmc ~ update:", update)
  } catch (error) {
    errorLogger.error(`Error in updateCmc: ${error.message}`);
    handleErrorResponse(res, error, "updateCmc");
  }
}

module.exports = { getCmc, getSavedCmc, updateCmc };