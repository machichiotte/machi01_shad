import { deleteAndSaveData } from './mongodbService'
import { LastUpdateService } from './lastUpdateService'
import { MappedData } from 'src/models/dbTypes'

class DatabaseService {
  /**
   * Saves data to the database and updates the last update date.
   */
  static async saveDataToDatabase(
    data: MappedData[],
    collectionName: string,
    platform: string,
    updateType: string
  ): Promise<void> {
    console.log(`Sauvegarde des données dans la base de données`, {
      platform,
      collectionName
    })
    try {
      await deleteAndSaveData(collectionName, data, platform)
      await LastUpdateService.saveLastUpdateToDatabase(updateType, platform)
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