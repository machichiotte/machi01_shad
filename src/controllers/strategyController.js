// src/controllers/strategyController.js
const { getData } = require("../utils/dataUtil.js");
const { deleteAllDataMDB, saveData } = require("../services/mongodbService.js");
const { saveLastUpdateToMongoDB } = require("../utils/mongodbUtil.js");

const { handleErrorResponse } = require("../utils/errorUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");

async function getStrat(req, res) {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  try {
    const data = await getData(collectionName);
    console.log(
      `🚀 ~ file: strategyController.js:17 ~ getStrat ~ data:`,
      {
        collectionName,
        count: data.length,
      }
    );
    res.json(data);
  } catch (error) {
    console.log(
      `🚀 ~ file: strategyController.js:23 ~ getStrat ~ error:`,
      error
    );
    //errorLogger.error("Failed to get strats", { error: error.message });
    handleErrorResponse(res, error, "getStrat");
  }
}

async function fetchDatabaseStrategies() {
  const collectionName = process.env.MONGODB_COLLECTION_STRAT;
  const data = await getData(collectionName);
  console.log(
    `🚀 ~ file: strategyController.js:37 ~ fetchDatabaseStrategies :`,
    { collectionName, count: data.length }
  );  return data;
}

async function updateStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
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

module.exports = { getStrat, fetchDatabaseStrategies, updateStrat };
