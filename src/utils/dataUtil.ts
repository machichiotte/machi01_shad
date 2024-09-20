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
      const mockDataPath = getMockDataPath(collectionName)
      const jsonData = await fs.readFile(mockDataPath, 'utf8')
      return JSON.parse(jsonData)
    } else {
      const data = await getAllDataMDB(collectionName)
      console.log(`${data.length} éléments récupérés depuis ${collectionName}`);
      return Array.isArray(data) ? data as MappedData[] : []
    }
  } catch (error) {
    handleServiceError(error, 'getData', `Failed to get data from collection ${collectionName}`)
    throw error
  }
}

export { getData }