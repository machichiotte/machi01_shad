// src/utils/dataUtil.ts
import { promises as fs } from 'fs'
import { getMockDataPath } from './fileUtil'
import { getAllDataMDB } from '@services/mongodbService'
import { MappedBalance, MappedTrade, MappedOrder } from '@services/mapping'

type Data = MappedBalance | MappedOrder | MappedTrade;
/**
 * Retrieves data from the specified collection.
 * @param {string} collectionName - The MongoDB collection name.
 * @returns {Promise<Data[]>} - The retrieved data.
 */
async function getData(collectionName: string): Promise<Data[]> {
  try {
    const data = await getDataFromCollection(collectionName)
    return data
  } catch (error) {
    console.log('🚀 ~ getData ~ error:', error)
    throw new Error('Failed to get data from collection')
  }
}

/**
 * Main function to get data from the collection
 * @param {string} collectionName - The name of the collection to retrieve data from
 * @returns {Promise<Data[]>} - The retrieved data as an array of objects
 */
async function getDataFromCollection(collectionName: string): Promise<Data[]> {
  try {
    if (process.env.OFFLINE_MODE === 'true') {
      // Get the mock data file path for the given collection
      const mockDataPath = getMockDataPath(collectionName)

      // Read the mock data from the file
      const jsonData = await fs.readFile(mockDataPath, 'utf8')

      // Return parsed JSON data
      return JSON.parse(jsonData)
    } else {
      // Fetch data from MongoDB
      const data = await getAllDataMDB(collectionName)
      // Return data, ensuring it's an array
      return Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.log('🚀 ~ getDataFromCollection ~ error:', error)
    return []
  }
}

export { getData }
