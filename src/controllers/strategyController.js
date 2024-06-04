// src/controllers/strategyController.js
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { deleteAllDataMDB, saveData } = require("../services/mongodbService.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");
const {errorLogger, infoLogger}  = require("../utils/loggerUtil.js");

async function getStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await getData(req, res, collection);
}

async function getSavedStrat() {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  try {
    const strat = await getDataFromCollection(collection);
    console.log("Retrieved saved strat from the database.");
    //infoLogger.info("Retrieved saved strat from the database.");
    return strat;
  } catch (error) {
    console.log("Failed to get saved strat", { error: error.message });
    errorLogger.error("Failed to get saved strat", { error: error.message });
    throw error;
  }
}

async function updateStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  const strat = req.body;

  try {
    await deleteAllDataMDB(collection);
    const data = await saveData(strat, collection);
    saveLastUpdateToMongoDB(process.env.TYPE_STRATEGY, "");

    res.json(data);
  } catch (err) {
    console.error(err);
    console.log("Error updateStrat:", err);
    res.status(500).send({ error: err.name + ": " + err.message });
  }
}

module.exports = { getStrat, getSavedStrat, updateStrat };
