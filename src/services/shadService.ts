// src/services/shadService.ts
import { getData } from '@utils/dataUtil'

export interface ShadData {
  // Define the structure of SHAD data here
  [key: string]: string | number | object
}

/**
 * Fetches the most recent SHAD data from the database.
 * This function uses the getData utility to retrieve information from a MongoDB collection.
 * The collection name is specified in the environment variable MONGODB_COLLECTION_SHAD.
 *
 * @returns {Promise<ShadData[]>} A promise that resolves to an array of SHAD data objects.
 */
async function fetchShadInDatabase(): Promise<ShadData[]> {
  const collectionName = process.env.MONGODB_COLLECTION_SHAD
  return await getData(collectionName as string)
}

export { fetchShadInDatabase }
