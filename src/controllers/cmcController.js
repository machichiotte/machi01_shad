// src/controllers/cmcController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil.js");
const cmcService = require("../services/cmcService");

validateEnvVariables(["MONGODB_COLLECTION_CMC", "TYPE_CMC"]);

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getCmc(req, res) {
  try {
    const data = await cmcService.fetchDatabaseCmc();
    console.log("CMC data retrieved", {
      collectionName: process.env.MONGODB_COLLECTION_CMC,
      count: data.length,
    });
    res.json(data);
  } catch (error) {
    errorLogger.error(`Error in getCmc: ${error.message}`, { error });
    handleErrorResponse(res, error, "getCmc");
  }
}

/**
 * Updates CoinMarketCap data by fetching the latest information from the CoinMarketCap API and saving it to the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function updateCmc(req, res) {
  try {
    const result = await cmcService.updateCmcData();
    res.status(200).json(result);
  } catch (error) {
    errorLogger.error(`Error in updateCmc: ${error.message}`, { error });
    handleErrorResponse(res, error, "updateCmc");
  }
}

module.exports = { getCmc, updateCmc };
