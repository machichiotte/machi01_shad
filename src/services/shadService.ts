// src/services/shadService.ts
import { getData } from '@utils/dataUtil'
import { ShadData } from 'src/models/dbTypes'

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

}

