// src/services/shadService.ts
import { getData } from '@utils/dataUtil'
import { ShadData, HighestPrices } from 'src/models/dbTypes'
import { databaseOperations } from './databaseOperationsService'

export class ShadService {
  /**
   * Fetches the most recent SHAD data from the database.
   * This function uses the getData utility to retrieve information from a MongoDB collection.
   * The collection name is specified in the environment variable MONGODB_COLLECTION_SHAD.
   *
   * @returns {Promise<ShadData[]>} A promise that resolves to an array of SHAD data objects.
   */
  static async fetchShadInDatabase(): Promise<ShadData[]> {
    const collectionName = process.env.MONGODB_COLLECTION_SHAD as string
    return await getData(collectionName) as ShadData[]
  }

  static async getHighestPrices(): Promise<HighestPrices[]> {
    const collectionName = process.env.MONGODB_COLLECTION_HIGHEST_PRICES as string
    return await getData(collectionName) as HighestPrices[]
  }

  static async updateHighestPrice(platform: string, base: string, price: number): Promise<void> {
    const collectionName = process.env.MONGODB_COLLECTION_HIGHEST_PRICES as string
    //ici le update ne fonctionne pas si il ny a pas dobjet avec la base et la platform 
    await databaseOperations.updateOneOne(collectionName, { base, platform },
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
