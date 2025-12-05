// src/utils/mockUtil.ts
import { promises as fs } from 'fs'
import path from 'path'
import { config } from '@config/index'

async function getMockedData(collectionName: string) {
    const mockDataPath = getMockDataPath(collectionName)
    const jsonData = await fs.readFile(mockDataPath, 'utf8')
    return JSON.parse(jsonData)
}

/**
 * Get the path to the mock data file for a given collection.
 */
function getMockDataPath(collection: string): string {
    // Add logic to return the specific mock name based on the collection
    const collectionMockName = `${config.databaseConfig.collection.dbName}.${collection}.json`
    return path.join('mockData', 'json', 'mongodb', collectionMockName)
}

export { getMockedData }