// src/services/cmcService.ts
import { getData } from '@utils/dataUtil'
import { saveLastUpdateToDatabase } from './lastUpdateService'
import { deleteAllDataMDB, saveData } from './mongodbService'

import { MappedCmc } from './mapping'

interface FetchResponse {
  data: MappedCmc[]
  status: {
    total_count: number
  }
}

/**
 * Fetches the latest CoinMarketCap data from the CoinMarketCap API.
 * @returns {Promise<MappedCmc[]>} - A promise resolved with the fetched CoinMarketCap data.
 */
async function fetchCurrentCmc(): Promise<MappedCmc[]> {
  const API_KEY = process.env.CMC_APIKEY
  const limit = 5000
  const baseStart = 1
  const convert = 'USD'

  let start = baseStart
  const allData: MappedCmc[] = []

  try {
    while (true) {
      const URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=${convert}`

      const response = await fetch(URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CMC_PRO_API_KEY': API_KEY as string
        }
      })

      if (!response.ok) {
        throw new Error(
          `Échec de la récupération des données CoinMarketCap: ${response.statusText}`
        )
      }

      const { data, status }: FetchResponse = await response.json()

      if (data.length === 0) {
        break
      }

      allData.push(...data)
      start += data.length

      if (status.total_count <= start) {
        break
      }
    }
  } catch (error) {
    console.error(`Erreur dans fetchCmcData: ${(error as Error).message}`)
    throw error
  }

  return allData
}

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @returns {Promise<MappedCmc[]>} - The latest CMC data from the database.
 */
async function fetchDatabaseCmc(): Promise<MappedCmc[]> {
  const collectionName = process.env.MONGODB_COLLECTION_CMC as string
  try {
    const data = await getData(collectionName)
    console.log(`🚀 ~ file: cmcService.ts ~ fetchDatabaseCmc :`, {
      collectionName,
      count: data.length
    })
    return data as MappedCmc[]
  } catch (error) {
    console.error(`Erreur dans fetchDatabaseCmc: ${(error as Error).message}`, {
      error
    })
    throw error
  }
}

/**
 * Updates the CoinMarketCap data in the database.
 * @param {MappedCmc[]} data - Array of CoinMarketCap data to update.
 * @returns {Promise<Object>} - Result of the update operation.
 */
async function updateDatabaseCmcData(data: MappedCmc[]): Promise<object> {
  const collectionName = process.env.MONGODB_COLLECTION_CMC
  try {
    const deleteResult = await deleteAllDataMDB(collectionName as string)
    const saveResult = await saveData(data, collectionName as string)
    await saveLastUpdateToDatabase(process.env.TYPE_CMC as string, '')

    console.log('Données CMC mises à jour dans la base de données', {
      deleteResult,
      saveResult,
      totalCount: data.length
    })

    return {
      status: true,
      message: 'Données CMC mises à jour avec succès',
      data: data,
      deleteResult,
      saveResult,
      totalCount: data.length
    }
  } catch (error) {
    console.error(
      `Erreur dans updateDatabaseCmcData: ${(error as Error).message}`,
      { error }
    )
    throw error
  }
}

/**
 * Updates CoinMarketCap data by fetching the latest information from the CoinMarketCap API and saving it to the database.
 * @returns {Promise<Object>} - Result of the update operation.
 */
async function updateCmcData(): Promise<object> {
  try {
    const data = await fetchCurrentCmc()
    console.log('Dernières données CMC récupérées', { count: data.length })
    return await updateDatabaseCmcData(data)
  } catch (error) {
    console.error(`Erreur dans updateCmcData: ${(error as Error).message}`, {
      error
    })
    throw error
  }
}

export { fetchCurrentCmc, fetchDatabaseCmc, updateCmcData }
