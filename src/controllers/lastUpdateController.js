// src/controllers/lastUpdateController.js
const { getData } = require("../utils/dataUtil.js");
const { getDataMDB } = require("../services/mongodbService.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil");

validateEnvVariables(["MONGODB_COLLECTION_LAST_UPDATE"]);

/**
 * Retrieves the unique last update record for a given platform and type.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getUniqueLastUpdate(req, res) {
  try {
    const { platform, type } = req.params;
    const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;

    const filter = { platform, type };
    const lastUpdateData = await getDataMDB(collectionName, filter);

    if (lastUpdateData.length > 0) {
      console.log("Fetched unique last update from the database.", {
        platform,
        type,
      });
      res.json(lastUpdateData[0]);
    } else {
      console.log("No last update found, returning null timestamp.", {
        platform,
        type,
      });
      res.json({ platform, type, timestamp: null });
    }
  } catch (error) {
    errorLogger.error("Failed to get unique last update.", {
      error: error.message,
      platform: req.params.platform,
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
    const data = await getData(collection);
    console.log("Fetched all last update records from the database.", {
      count: data.length,
    });
  } catch (error) {
    errorLogger.error("Failed to get all last updates.", {
      error: error.message,
    });
    handleErrorResponse(res, error, "getLastUpdate");
  }
}

/**
 * Retrieves all saved last updates from the database.
 * @returns {Promise<Object[]>} - A promise that resolves with the array of last updates.
 */
async function getSavedLastUpdate() {
  const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;
  try {
    const data = await getData(collectionName);
    console.log("Fetched saved last updates from the database.", {
      collectionName,
      count: data.length,
    });
    return data;
  } catch (error) {
    errorLogger.error("Failed to fetch saved last updates.", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Updates the last update record for a specific type and platform.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function updateLastUpdateByType(req, res) {
  try {
    const { platform, type } = req.params;
    await saveLastUpdateToMongoDB(type, platform);
    const timestamp = new Date().toISOString();
    console.log("Updated last update record.", { platform, type, timestamp });
    res.json({ platform, type, timestamp });
  } catch (error) {
    errorLogger.error("Failed to update last update by type.", {
      error: error.message,
      platform: req.params.platform,
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