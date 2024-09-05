// src/controllers/shadController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil.js");
const shadService = require("../services/shadService.js");
validateEnvVariables(["MONGODB_COLLECTION_CMC", "TYPE_CMC"]);

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getShad(req, res) {
  try {
    const data = await shadService.fetchShadInDatabase();
    console.log("Retrieved Shad data", { collectionName, count: data.length });
    res.json(data);
  } catch (error) {
    console.error(`Error in getShad: ${error.message}`, { error });
    handleErrorResponse(res, error, "getShad");
  }
}

module.exports = { getShad };
