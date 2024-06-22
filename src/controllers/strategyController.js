// src/controllers/strategyController.js
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { deleteAllDataMDB, saveData } = require("../services/mongodbService.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");
const { errorLogger, infoLogger } = require("../utils/loggerUtil.js");

async function getStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await getData(req, res, collection);
}

async function getSavedStrat() {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  console.log("🚀 ~ getSavedStrat ~ collection:", collection);
  try {
    const strat = await getDataFromCollection(collection);
    console.log("🚀 ~ getSavedStrat ~ strat:", strat);
    return strat;
  } catch (error) {
    console.log("🚀 ~ getSavedStrat ~ error:", error);
    errorLogger.error("Failed to get saved strat", { error: error.message });
    throw error;
  }
}

async function updateStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  console.log("🚀 ~ updateStrat ~ collection:", collection)
  const strat = req.body;
  console.log("🚀 ~ updateStrat ~ strat:", strat)

  try {
    await deleteAllDataMDB(collection);
    const data = await saveData(strat, collection);
    console.log("🚀 ~ updateStrat ~ data:", data)
    saveLastUpdateToMongoDB(process.env.TYPE_STRATEGY, "");

    res.json(data);
  } catch (err) {
    console.log("🚀 ~ updateStrat ~ err:", err)
    res.status(500).send({ error: err.name + ": " + err.message });
  }
}

module.exports = { getStrat, getSavedStrat, updateStrat };