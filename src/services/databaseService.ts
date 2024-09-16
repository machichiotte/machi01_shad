import { deleteAndSaveData } from './mongodbService'
import { saveLastUpdateToDatabase } from './lastUpdateService'
import { MappedData } from 'src/models/dbTypes'

class DatabaseService {
  /**
   * Saves data to the database and updates the last update date.
   * @param {Object[]} data - The data to be saved.
   * @param {string} collectionName - The name of the MongoDB collection.
   * @param {string} platform - The platform identifier.
   * @param {string} updateType - The update type for lastUpdateService.
   */
  static async saveDataToDatabase(
    data: MappedData[],
    collectionName: string,
    platform: string,
    updateType: string
  ): Promise<void> {
    try {
      await deleteAndSaveData(collectionName, data, platform)
      await saveLastUpdateToDatabase(updateType, platform)
      console.log(`Données sauvegardées dans la base de données`, {
        platform,
        collectionName
      })
    } catch (error) {
      console.error(
        `Échec de la sauvegarde des données dans la base de données`,
        {
          platform,
          collectionName,
          error: (error as Error).message
        }
      )
      throw error
    }
  }
}

export { DatabaseService }