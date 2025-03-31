// src/services/serviceDatabase.ts
import { Document } from 'mongodb'
import { retry } from '@utils/retryUtil'
import { getMockedData } from '@utils/mockUtil'
import { handleServiceError } from '@utils/errorUtil'
import { ServiceTimestamp } from '@services/api/database/serviceTimestamp'
import { mongodbOperations } from '@services/api/database/serviceMongodbOperations'
import { ServiceCache } from '@services/serviceCache'
import { InsertData } from '@typ/trade'
import { PLATFORM } from '@typ/platform'
import { MappedData } from '@typ/database'
import { CacheItem } from '@typ/mongodb'

import { config } from '@config/index'

export class ServiceDatabase {
  static async insertDocuments(
    collectionName: string,
    data: object[] | object
  ): Promise<InsertData> {
    try {
      if (!Array.isArray(data) && typeof data !== 'object') {
        throw new TypeError('Data must be an array or an object')
      }

      if (Array.isArray(data)) {
        return await retry(
          mongodbOperations.insertMany,
          [collectionName, data],
          'insertDocuments'
        )
      } else {
        return await retry(
          mongodbOperations.insertOne,
          [collectionName, data],
          'insertDocuments'
        )
      }
    } catch (error) {
      handleServiceError(
        error,
        'insertDocuments',
        `Error insertDocuments in ${collectionName}`
      )
      throw error
    }
  }

  static async findAllDocuments(collectionName: string): Promise<Document[]> {
    try {
      return await retry(
        mongodbOperations.find,
        [collectionName, {}],
        'findAllDocuments'
      )
    } catch (error) {
      handleServiceError(
        error,
        'findAllDocuments',
        `Error findAllDocuments in ${collectionName}`
      )
      throw error
    }
  }

  static async findSingleDocument(
    collectionName: string,
    query: object
  ): Promise<Document | null> {
    try {
      return await retry(
        mongodbOperations.findOne,
        [collectionName, query],
        'findSingleDocument'
      )
    } catch (error) {
      handleServiceError(
        error,
        'findSingleDocument',
        `Error findSingleDocument in ${collectionName}`
      )

      throw error
    }
  }

  static async deleteSingleDocument(
    collectionName: string,
    filter: object
  ): Promise<boolean> {
    try {
      return await retry(
        mongodbOperations.deleteOne,
        [collectionName, filter],
        'deleteSingleDocument'
      )
    } catch (error) {
      handleServiceError(
        error,
        'deleteSingleDocument',
        `Error deleteSingleDocument data from ${collectionName}`
      )
      throw error
    }
  }

  static async deleteDocuments(
    collectionName: string,
    filter: object
  ): Promise<number> {
    try {
      return await retry(
        mongodbOperations.deleteMany,
        [collectionName, filter],
        'deleteDocuments'
      )
    } catch (error) {
      handleServiceError(
        error,
        'deleteDocuments',
        `Error deleteDocuments data from ${collectionName}`
      )
      throw error
    }
  }

  static async deleteAllDocuments(collectionName: string): Promise<number> {
    try {
      return await retry(
        mongodbOperations.deleteMany,
        [collectionName, {}],
        'deleteAllDocuments'
      )
    } catch (error) {
      handleServiceError(
        error,
        'deleteAllDocuments',
        `Error deleteAllDocuments data from ${collectionName}`
      )
      throw error
    }
  }

  static async updateDocument(
    collectionName: string,
    filter: Document,
    update: Document
  ): Promise<boolean> {
    try {
      return await retry(
        mongodbOperations.updateOne,
        [collectionName, filter, update],
        'updateDocument'
      )
    } catch (error) {
      handleServiceError(
        error,
        'updateDocument',
        `Erreur lors de la mise à jour des données dans ${collectionName}`
      )
      throw error
    }
  }

  static async replaceDocuments(
    collectionName: string,
    mapData: Omit<MappedData, '_id'>[],
    platform?: PLATFORM
  ): Promise<void> {
    try {
      if (mapData && mapData.length > 0) {
        if (!platform) {
          await ServiceDatabase.deleteAllDocuments(collectionName)
        } else {
          const deleteParam = { platform }
          await ServiceDatabase.deleteDocuments(collectionName, deleteParam)
        }
        await ServiceDatabase.insertDocuments(collectionName, mapData)
      }
    } catch (error) {
      handleServiceError(
        error,
        'replaceDocuments',
        `Error processing data in ${collectionName}`
      )
      throw error
    }
  }

  static async saveDocumentsWithTimestamp(
    data: Omit<MappedData, '_id'>[],
    collectionName: string,
    tsCategory: string,
    platform?: PLATFORM
  ): Promise<void> {
    try {
      await ServiceDatabase.replaceDocuments(collectionName, data, platform)
      await ServiceTimestamp.saveTimestampToDatabase(tsCategory, platform)
      /*
      const startTime = Date.now()
      const duration = Date.now() - startTime
      console.info(
        `Save Bdd - ${collectionName} for ${platform} in ${duration}ms.`
      )*/
    } catch (error) {
      handleServiceError(
        error,
        'saveDocumentsWithTimestamp',
        'Erreur lors de la sauvegarde des données dans la base de données'
      )
      throw error
    }
  }

  static async getCollectionDocuments(collectionName: string): Promise<MappedData[]> {
    try {
      if (config.isOffline) {
        console.info('offline')
        return getMockedData(collectionName)
      } else {
        const data =
          await ServiceDatabase.getCachedOrFetchedDocuments(collectionName)
        return Array.isArray(data) ? (data as MappedData[]) : []
      }
    } catch (error) {
      handleServiceError(
        error,
        'getCollectionDocuments',
        `Failed to get data from collection ${collectionName}`
      )
      throw error
    }
  }

  static async getDocumentByFilter(
    collectionName: string,
    filter: Document
  ): Promise<MappedData | null> {
    try {
      if (config.isOffline) {
        const mockedData = await getMockedData(collectionName)
        return mockedData.length > 0 ? mockedData[0] : null
      } else {
        const data =
          await ServiceDatabase.getCachedOrFetchedDocuments(collectionName)
        if (!Array.isArray(data)) return null
        const filteredData = data.find((doc) =>
          Object.entries(filter).every(([key, value]) => doc[key] === value)
        )
        return (filteredData as MappedData) || null
      }
    } catch (error) {
      handleServiceError(
        error,
        'getDocumentByFilter',
        `Failed to get document from collection ${collectionName}`
      )
      throw error
    }
  }

  static async getCachedOrFetchedDocuments(
    collectionName: string
  ): Promise<CacheItem[] | Document[]> {
    // Déterminer la clé de cache appropriée
    const key = ServiceCache.getCacheKeyForCollection(collectionName)
    // Vérifier d'abord le cache
    const cachedData = await ServiceCache.getFromCache(key)
    if (cachedData) return cachedData

    // Récupérer de nouvelles données si le cache est expiré
    return this.fetchAndCacheDocuments(collectionName)
  }

  static async fetchAndCacheDocuments(collectionName: string): Promise<Document[]> {
    try {
      const result = await retry(
        mongodbOperations.find,
        [collectionName],
        'fetchAndCacheDocuments'
      )
      await ServiceCache.addToCache(collectionName, result as MappedData[])
      return result
    } catch (error) {
      handleServiceError(
        error,
        'fetchAndCacheDocuments',
        `Error fetching data from ${collectionName}`
      )
      return []
    }
  }
}
