// src/utils/dataUtil.ts
import { promises as fs } from 'fs'
import { getMockDataPath } from './fileUtil'
import { getAllDataMDB } from '@services/mongodbService'
import { MappedData } from '@models/dbTypes'
import { handleServiceError } from './errorUtil'

/**
 * Main function to get data from the collection
 */
async function getData(collectionName: string): Promise<MappedData[]> {
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
      console.log(`🚀 ~ getData:`, { collectionName, count: data.length });

      return Array.isArray(data) ? data as MappedData[] : []
    }
  } catch (error) {
    handleServiceError(error, 'getData', `Failed to get data from collection ${collectionName}`)
    throw error
  }
}

export { getData }