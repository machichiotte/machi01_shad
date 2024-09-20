// src/services/lastUpdateService.ts
import { MongodbService } from '@services/mongodbService'

interface LastUpdateData {
  [key: string]: number | { [key: string]: number }
}

export class LastUpdateService {
  /**
   * Fetches the last update information from the database.
   */
  static async fetchDatabaseLastUpdate(): Promise<LastUpdateData[]> {
    const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE as string
    return await MongodbService.getData(collectionName) as LastUpdateData[]
  }

  /**
   * Saves the last update information to the database.
   */
  static async saveLastUpdateToDatabase(type: string, platform?: string): Promise<void> {
    const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE
    // Récupérer les données actuelles dans la collection
    const data: LastUpdateData = (await this.fetchDatabaseLastUpdate())[0] || {}
    console.log(
      `saveLastUpdateToDatabase data: ${type} ${platform} ${JSON.stringify(data)}`
    )
    // Mettre à jour les données avec le nouveau timestamp
    if (!platform) {
      data[type] = Date.now()
    } else {
      if (!data[type] || typeof data[type] === 'number') {
        data[type] = {}
      }

      ; (data[type] as { [key: string]: number })[platform] = Date.now()
      console.log(
        `data[type] ${(data[type] as { [key: string]: number })[platform]}`
      )
    }

    // Enregistrer les données mises à jour dans MongoDB
    const filter = {}
    const update = { $set: data }

    await MongodbService.updateInDatabase(collectionName as string, filter, update)
  }
}