// src/services/shadService.ts
import { MongodbService } from '@services/mongodbService'
import { ShadData, HighestPrices } from '@typ/database'
import { databaseOperations } from '@services/databaseOperationsService'
import { config } from '@config/index';
import { PLATFORM } from '@src/types/platform';

const COLLECTION_NAME_SHAD = config.collection.shad
const COLLECTION_NAME_HIGH_PRICE = config.collection.highestPrice

export class ShadService {
  /**
   * Fetches the most recent SHAD data from the database.
   * This function uses the getData utility to retrieve information from a MongoDB collection.
   * The collection name is specified in the environment variable MONGODB_COLLECTION_SHAD.
   */
  static async fetchShadInDatabase(): Promise<ShadData[]> {
    return await MongodbService.getData(COLLECTION_NAME_SHAD) as ShadData[]
  }

  static async getHighestPrices(): Promise<HighestPrices[]> {
    return await MongodbService.getData(COLLECTION_NAME_HIGH_PRICE) as HighestPrices[]
  }

  static async updateHighestPrice(platform: PLATFORM, base: string, price: number): Promise<void> {
    //ici le update ne fonctionne pas si il ny a pas dobjet avec la base et la platform 
    await databaseOperations.updateOneUpsert(COLLECTION_NAME_HIGH_PRICE, { base, platform },
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