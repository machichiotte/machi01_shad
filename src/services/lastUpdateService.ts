// src/services/lastUpdateService.ts
import { MongodbService } from '@services/mongodbService'

interface LastUpdateData {
  [key: string]: number | { [key: string]: number }
}

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_LAST_UPDATE as string

export class LastUpdateService {
  /**
   * Fetches the last update information from the database.
   */
  static async fetchDatabaseLastUpdate(): Promise<LastUpdateData[]> {
    return await MongodbService.getData(COLLECTION_NAME) as LastUpdateData[]
  }

  /**
   * Saves the last update information to the database.
   */
  static async saveLastUpdateToDatabase(type: string, platform?: string): Promise<void> {
    const data: LastUpdateData = (await this.fetchDatabaseLastUpdate())[0] || {}
    console.log(`saveLastUpdateToDatabase Type: ${type} | Platform: ${platform} | Size: ${Array.isArray(data) ? data.length : Object.keys(data).length} | Data: ${JSON.stringify(data)}`)
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

    await MongodbService.updateInDatabase(COLLECTION_NAME, filter, update)
  }
}