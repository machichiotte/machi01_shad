// src/utils/mockUtil.ts
import { promises as fs } from 'fs'
import { getMockDataPath } from './fileUtil'

async function getMockedData(collectionName: string) {
    const mockDataPath = getMockDataPath(collectionName)
    const jsonData = await fs.readFile(mockDataPath, 'utf8')
    return JSON.parse(jsonData)
}

export { getMockedData }