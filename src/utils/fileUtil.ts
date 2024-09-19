// src/utils/fileUtil.ts
import path from 'path'

/**
 * Get the path to the mock data file for a given collection.
 */
function getMockDataPath(collection: string): string {
  // Add logic to return the specific mock name based on the collection
  const collectionMockName = `${collection}.json`
  return path.join(__dirname, 'mockData', 'mongodb', collectionMockName)
}

export { getMockDataPath }