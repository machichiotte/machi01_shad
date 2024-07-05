// src/controllers/strategyController.js
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const { deleteAllDataMDB, saveData } = require("../services/mongodbService.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");

const { handleErrorResponse } = require("../utils/errorUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");

async function getStrat(req, res) {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  console.log(`🚀 ~ file: strategyController.js:14 ~ getStrat ~ collectionName:`, collectionName)
  try {
    const lastStrats = await getData(collectionName);
    console.log("Retrieved last strats", { collectionName, count: lastStrats.length });
    res.json(lastStrats);
  } catch (error) {
    errorLogger.error("Failed to get strats", { error: error.message });
    handleErrorResponse(res, error, "getStrat");
  }
}

async function fetchStratsInDatabase() {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  
  console.log(`🚀 ~ file: strategyController.js:13 ~ fetchStratsInDatabase ~ collectionName:`, collectionName)
  const data = await getDataFromCollection(collectionName);
  console.log("🚀 ~ fetchStratsInDatabase ~ data:", data.length);
  return data;
}

async function updateStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  console.log("🚀 ~ updateStrat ~ collection:", collection);
  const strat = req.body;
  console.log("🚀 ~ updateStrat ~ strat:", strat);

  try {
    await deleteAllDataMDB(collection);
    const data = await saveData(strat, collection);
    console.log("🚀 ~ updateStrat ~ data:", data);
    saveLastUpdateToMongoDB(process.env.TYPE_STRATEGY, "");

    res.json(data);
  } catch (err) {
    console.log("🚀 ~ updateStrat ~ err:", err);
    res.status(500).send({ error: err.name + ": " + err.message });
  }
}

module.exports = { getStrat, fetchStratsInDatabase, updateStrat };
