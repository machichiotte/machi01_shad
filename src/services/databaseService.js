// src/services/databaseService.js
const mongodbService = require("./mongodbService");
const lastUpdateService = require("./lastUpdateService");

/**
 * Sauvegarde les données dans la base de données et met à jour la dernière date de mise à jour.
 * @param {Object[]} data - Les données à sauvegarder.
 * @param {string} collectionName - Le nom de la collection MongoDB.
 * @param {string} platform - L'identifiant de la plateforme.
 * @param {string} updateType - Le type de mise à jour pour lastUpdateService.
 */
async function saveDataToDatabase(data, collectionName, platform, updateType) {
  try {
    await mongodbService.deleteAndSaveData(data, collectionName, platform);
    await lastUpdateService.saveLastUpdateToDatabase(updateType, platform);
    console.log(`Données sauvegardées dans la base de données`, { platform, collectionName });
  } catch (error) {
    console.error(`Échec de la sauvegarde des données dans la base de données`, {
      platform,
      collectionName,
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  saveDataToDatabase,
};