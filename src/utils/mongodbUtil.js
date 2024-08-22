// src/utils/mongodbUtil.js
const {
  updateDataMDB,
  getAllDataMDB,
  deleteMultipleDataMDB,
  deleteAllDataMDB,
  saveData,
} = require("../services/mongodbService.js");

async function updateTimestampInMongoDB(collectionName, filter, update) {
  try {
    await updateDataMDB(collectionName, filter, update);
  } catch (err) {
    console.error(err);
  }
}

async function saveLastUpdateToMongoDB(type, platform) {
  console.log(`🚀 ~ file: mongodbUtil.js:19 ~ saveLastUpdateToMongoDB ~ saveLastUpdateToMongoDB:`, saveLastUpdateToMongoDB)
  const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;

  // Récupérer les données actuelles dans la collection
  const existingData = (await getAllDataMDB(collectionName))[0] || {};

  // Mettre à jour les données avec le nouveau timestamp
  if (!platform) {
    existingData[type] = Date.now();
  } else {
    if (!existingData[type]) {
      existingData[type] = {};
    }

    existingData[type][platform] = Date.now();
  }

  // Enregistrer les données mises à jour dans MongoDB
  const filter = {};
  const update = { $set: existingData };

  await updateTimestampInMongoDB(collectionName, filter, update);
}

async function deleteAndSaveData(mapData, collection, platform) {
  if (mapData && mapData.length > 0) {
    const deleteParam = { platform };
    await deleteMultipleDataMDB(collection, deleteParam);
    await saveData(mapData, collection);
  }
}

async function deleteAndSaveObject(mapData, collectionName) {
  if (mapData && Object.keys(mapData).length > 0) {
    await deleteAllDataMDB(collectionName);
    await saveData(mapData, collectionName);
  }
}

module.exports = {
  updateTimestampInMongoDB,
  saveLastUpdateToMongoDB,
  deleteAndSaveData,
  deleteAndSaveObject,
};
