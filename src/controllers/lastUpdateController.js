const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { getDataMDB } = require("../services/mongodbService.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil");

validateEnvVariables(['MONGODB_COLLECTION_LAST_UPDATE']);

/**
 * Retrieves the unique last update record for a given exchange and type.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getUniqueLastUpdate(req, res) {
  try {
    const { exchangeId, type } = req.params;
    const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;

    const filter = { exchangeId, type };
    const lastUpdateData = await getDataMDB(collectionName, filter);

    if (lastUpdateData.length > 0) {
      console.log("Fetched unique last update from the database.", {
        exchangeId,
        type,
      });
      res.json(lastUpdateData[0]);
    } else {
      console.log("No last update found, returning null timestamp.", {
        exchangeId,
        type,
      });
      res.json({ exchangeId, type, timestamp: null });
    }
  } catch (error) {
    errorLogger.error("Failed to get unique last update.", {
      error: error.message,
      exchangeId: req.params.exchangeId,
      type: req.params.type,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Retrieves all last update records from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getLastUpdate(req, res) {
  const collection = process.env.MONGODB_COLLECTION_LAST_UPDATE;
  try {
    const data = await getData(req, res, collection);
    console.log("Fetched all last update records from the database.", { count: data.length });
  } catch (error) {
    errorLogger.error("Failed to get all last updates.", { error: error.message });
    handleErrorResponse(res, error, "getLastUpdate");
  }
}

/**
 * Retrieves all saved last updates from the database.
 * @returns {Promise<Object[]>} - A promise that resolves with the array of last updates.
 */
async function getSavedLastUpdate() {
  const collection = process.env.MONGODB_COLLECTION_LAST_UPDATE;
  try {
    const data = await getDataFromCollection(collection);
    console.log("Fetched saved last updates from the database.", { count: data.length });
    return data;
  } catch (error) {
    errorLogger.error("Failed to fetch saved last updates.", { error: error.message });
    throw error;
  }
}

/**
 * Updates the last update record for a specific type and exchange.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function updateLastUpdateByType(req, res) {
  try {
    const { exchangeId, type } = req.params;
    await saveLastUpdateToMongoDB(type, exchangeId);
    const timestamp = new Date().toISOString();
    console.log("Updated last update record.", { exchangeId, type, timestamp });
    res.json({ exchangeId, type, timestamp });
  } catch (error) {
    errorLogger.error("Failed to update last update by type.", {
      error: error.message,
      exchangeId: req.params.exchangeId,
      type: req.params.type,
    });
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getLastUpdate,
  getSavedLastUpdate,
  getUniqueLastUpdate,
  updateLastUpdateByType,
};
