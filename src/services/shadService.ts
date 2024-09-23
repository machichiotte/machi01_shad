// src/services/shadService.ts
import { MongodbService } from '@services/mongodbService'
import { ShadData, HighestPrices } from '@typ/database'
import { databaseOperations } from '@services/databaseOperationsService'
import config from '@config/index'

export class ShadService {
  /**
   * Fetches the most recent SHAD data from the database.
   * This function uses the getData utility to retrieve information from a MongoDB collection.
   * The collection name is specified in the environment variable MONGODB_COLLECTION_SHAD.
   */
  static async fetchShadInDatabase(): Promise<ShadData[]> {
    const collectionName = config.collection.shad
    return await MongodbService.getData(collectionName) as ShadData[]
  }

  static async getHighestPrices(): Promise<HighestPrices[]> {
    const collectionName = config.collection.highestPrices
    return await MongodbService.getData(collectionName) as HighestPrices[]
  }

  static async updateHighestPrice(platform: string, base: string, price: number): Promise<void> {
    const collectionName = config.collection.highestPrices
    //ici le update ne fonctionne pas si il ny a pas dobjet avec la base et la platform 
    await databaseOperations.updateOneUpsert(collectionName, { base, platform },
      {
        $set: {
          base,
          platform,
          highestPrice: price
        },
      },
      { upsert: true }
    );
  }
}