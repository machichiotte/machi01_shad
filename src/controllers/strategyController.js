// src/controllers/strategyController.js
const {
  getData,
  saveLastUpdateToMongoDB,
  getDataFromCollection,
} = require("../services/utils.js");
const { deleteAllDataMDB, saveData } = require("../services/mongodb.js");

async function getStrat(req, res) {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await getData(req, res, collection);
}

async function getSavedStrat() {
  const collection = process.env.MONGODB_COLLECTION_STRAT;
  await getDataFromCollection(collection);
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
