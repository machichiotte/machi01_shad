// src/services/databaseService.ts
import { deleteAndSaveData } from "./mongodbService";
import { saveLastUpdateToDatabase } from "./lastUpdateService";

/**
 * Saves data to the database and updates the last update date.
 * @param {Object[]} data - The data to be saved.
 * @param {string} collectionName - The name of the MongoDB collection.
 * @param {string} platform - The platform identifier.
 * @param {string} updateType - The update type for lastUpdateService.
 */
async function saveDataToDatabase(data: Object[], collectionName: string, platform: string, updateType: string): Promise<void> {
  try {
    await deleteAndSaveData(data, collectionName, platform);
    await saveLastUpdateToDatabase(updateType, platform);
    console.log(`Données sauvegardées dans la base de données`, { platform, collectionName });
  } catch (error) {
    console.error(`Échec de la sauvegarde des données dans la base de données`, {
      platform,
      collectionName,
      error: (error as Error).message,
    });
    throw error;
  }
}

export {
  saveDataToDatabase,
};