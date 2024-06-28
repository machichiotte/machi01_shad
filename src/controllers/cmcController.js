const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");
const { deleteAllDataMDB, saveData } = require("../services/mongodbService.js");
const { errorLogger, infoLogger } = require("../utils/loggerUtil.js");
const { fetchCmcData } = require("../services/cmcService.js");
const { validateEnvVariables } = require("../utils/controllerUtil.js");

validateEnvVariables(['MONGODB_COLLECTION_CMC', 'TYPE_CMC']);

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getCmc(req, res) {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  try {
    const data = await getData(req, res, collection);
    infoLogger.info("Retrieved CMC data", { collection, count: data.length });
    res.json(data);
  } catch (error) {
    errorLogger.error(`Error in getCmc: ${error.message}`, { error });
    handleErrorResponse(res, error, "getCmc");
  }
}

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @returns {Promise<Object[]>} - The latest CMC data from the database.
 */
async function fetchCmcInDatabase() {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  try {
    const data = await getDataFromCollection(collection);
    infoLogger.info("Fetched CMC data from database", { collection, count: data.length });
    return data;
  } catch (error) {
    errorLogger.error(`Error in fetchCmcInDatabase: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Updates the CoinMarketCap data in the database.
 * @param {Object[]} cmcData - Array of CoinMarketCap data to be updated.
 * @param {Object} res - HTTP response object.
 */
async function updateCmcDataInDatabase(cmcData, res) {
  const collection = process.env.MONGODB_COLLECTION_CMC;
  try {
    const deleteResult = await deleteAllDataMDB(collection);
    const saveResult = await saveData(cmcData, collection);
    await saveLastUpdateToMongoDB(process.env.TYPE_CMC, "");

    res.status(200).json({
      status: true,
      message: "CMC data updated successfully",
      data: cmcData,
      deleteResult,
      saveResult,
      totalCount: cmcData.length,
    });

    infoLogger.info("CMC data updated in database", { deleteResult, saveResult, totalCount: cmcData.length });
  } catch (error) {
    errorLogger.error(`Error in updateCmcDataInDatabase: ${error.message}`, { error });
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
    infoLogger.info("Fetched latest CMC data", { count: cmcData.length });
    await updateCmcDataInDatabase(cmcData, res);
  } catch (error) {
    errorLogger.error(`Error in updateCmc: ${error.message}`, { error });
    handleErrorResponse(res, error, "updateCmc");
  }
}

module.exports = { getCmc, fetchCmcInDatabase, updateCmc };
