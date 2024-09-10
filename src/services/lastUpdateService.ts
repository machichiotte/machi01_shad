// src/services/lastUpdateService.ts
import { getData } from '@utils/dataUtil'
import { updateInDatabase } from './mongodbService'

interface LastUpdateData {
  [key: string]: number | { [key: string]: number }
}

/**
 * Fetches the last update information from the database.
 * @returns {Promise<LastUpdateData[]>} The last update data.
 */
async function fetchDatabaseLastUpdate(): Promise<LastUpdateData[]> {
  const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE
  return await getData(collectionName as string)
}

/**
 * Saves the last update information to the database.
 * @param {string} type - The type of update.
 * @param {string} [platform] - The platform for the update (optional).
 * @returns {Promise<void>}
 */
async function saveLastUpdateToDatabase(
  type: string,
  platform?: string
): Promise<void> {
  const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE
  // Récupérer les données actuelles dans la collection
  const data: LastUpdateData = (await fetchDatabaseLastUpdate())[0] || {}
  console.log(
    `saveLastUpdateToDatabase data: ${type} ${platform} ${JSON.stringify(data)}`
  )
  // Mettre à jour les données avec le nouveau timestamp
  if (!platform) {
    data[type] = Date.now()
  } else {
    if (!data[type] || typeof data[type] === 'number') {
      data[type] = {}
    }

    ;(data[type] as { [key: string]: number })[platform] = Date.now()
    console.log(
      `data[type] ${(data[type] as { [key: string]: number })[platform]}`
    )
  }

  // Enregistrer les données mises à jour dans MongoDB
  const filter = {}
  const update = { $set: data }

  await updateInDatabase(collectionName as string, filter, update)
}

export { fetchDatabaseLastUpdate, saveLastUpdateToDatabase }
