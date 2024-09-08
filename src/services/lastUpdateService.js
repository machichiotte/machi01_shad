// src/services/lastUpdateService.js
const { getData } = require("../utils/dataUtil.js");
const mongodbService = require("./mongodbService.js");

/**
 * Fetches the last update information from the database.
 * @returns {Promise<Object>} The last update data.
 */
async function fetchDatabaseLastUpdate() {
  const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;
  return await getData(collectionName);
}

/**
 * Saves the last update information to the database.
 * @param {string} type - The type of update.
 * @param {string} [platform] - The platform for the update (optional).
 * @returns {Promise<void>}
 */
async function saveLastUpdateToDatabase(type, platform) {
  const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;
  // Récupérer les données actuelles dans la collection
  const data = await fetchDatabaseLastUpdate()[0] || {};
  console.log(`saveLastUpdateToDatabase data: ${type} ${platform} ${data}`);
  // Mettre à jour les données avec le nouveau timestamp
  if (!platform) {
    data[type] = Date.now();
  } else {
    if (!data[type]) {
      data[type] = {};
    }

    data[type][platform] = Date.now();
    console.log(`data[type] ${data[type][platform]}`);

  }

  // Enregistrer les données mises à jour dans MongoDB
  const filter = {};
  const update = { $set: data };

  await mongodbService.updateInDatabase(collectionName, filter, update);
}

module.exports = {
  fetchDatabaseLastUpdate,
  saveLastUpdateToDatabase,
};
