import { MongodbService } from '@services/mongodbService'
import { LastUpdateService } from '@services/lastUpdateService'
import { MappedData } from 'src/models/dbTypes'
import { handleServiceError } from '@utils/errorUtil';
class DatabaseService {
  /**
   * Saves data to the database and updates the last update date.
   */
  static async saveDataToDatabase(data: MappedData[], collectionName: string, platform: string, updateType: string): Promise<void> {
    console.log(`Sauvegarde des données de ${platform} dans la base de données de ${collectionName}`)
    try {
      await MongodbService.deleteAndSaveData(collectionName, data, platform)
      await LastUpdateService.saveLastUpdateToDatabase(updateType, platform)
      console.log(`Données de ${platform} sauvegardées dans la base de données de ${collectionName}`)
    } catch (error) {
      handleServiceError(error, 'saveDataToDatabase', 'Erreur lors de la sauvegarde des données dans la base de données')
      throw error
    }
  }
}

export { DatabaseService }