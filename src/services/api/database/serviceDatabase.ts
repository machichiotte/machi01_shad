// src/services/api/database/serviceDatabase.ts
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
import { logger } from '@utils/loggerUtil'; // Ajout de l'import du logger

export class ServiceDatabase {
  static async insertDocuments(collectionName: string, data: object[] | object): Promise<InsertData> {
    logger.debug(`[ServiceDatabase] Début insertDocuments sur ${collectionName}`)
    try {
      if (!Array.isArray(data) && typeof data !== 'object') {
        throw new TypeError('Data must be an array or an object')
      }
      let result: InsertData
      if (Array.isArray(data)) {
        result = await retry(mongodbOperations.insertMany, [collectionName, data], 'insertDocuments')
      } else {
        result = await retry(mongodbOperations.insertOne, [collectionName, data], 'insertDocuments')
      }
      logger.debug(`[ServiceDatabase] Fin insertDocuments sur ${collectionName}`)
      return result
    } catch (error) {
      handleServiceError(error, 'insertDocuments', `Erreur lors de l'insertion dans ${collectionName}`)
      throw error
    }
  }

  static async findAllDocuments(collectionName: string): Promise<Document[]> {
    logger.debug(`[ServiceDatabase] Début findAllDocuments sur ${collectionName}`)
    try {
      const docs = await retry(mongodbOperations.find, [collectionName, {}], 'findAllDocuments')
      logger.debug(`[ServiceDatabase] Fin findAllDocuments sur ${collectionName} - ${docs.length} document(s) récupéré(s)`)
      return docs
    } catch (error) {
      handleServiceError(error, 'findAllDocuments', `Erreur lors de la récupération de tous les documents dans ${collectionName}`)
      throw error
    }
  }

  static async findSingleDocument(collectionName: string, query: object): Promise<Document | null> {
    logger.debug(`[ServiceDatabase] Début findSingleDocument sur ${collectionName} avec query: ${JSON.stringify(query)}`)
    try {
      const doc = await retry(mongodbOperations.findOne, [collectionName, query], 'findSingleDocument')
      logger.debug(`[ServiceDatabase] Fin findSingleDocument sur ${collectionName}`)
      return doc
    } catch (error) {
      handleServiceError(error, 'findSingleDocument', `Erreur lors de la récupération d'un document dans ${collectionName}`)
      throw error
    }
  }

  static async deleteSingleDocument(collectionName: string, filter: object): Promise<boolean> {
    logger.debug(`[ServiceDatabase] Début deleteSingleDocument sur ${collectionName} avec filter: ${JSON.stringify(filter)}`)
    try {
      const success = await retry(mongodbOperations.deleteOne, [collectionName, filter], 'deleteSingleDocument')
      logger.debug(`[ServiceDatabase] Fin deleteSingleDocument sur ${collectionName}`)
      return success
    } catch (error) {
      handleServiceError(error, 'deleteSingleDocument', `Erreur lors de la suppression d'un document dans ${collectionName}`)
      throw error
    }
  }

  static async deleteDocuments(collectionName: string, filter: object): Promise<number> {
    logger.debug(`[ServiceDatabase] Début deleteDocuments sur ${collectionName} avec filter: ${JSON.stringify(filter)}`)
    try {
      const count = await retry(mongodbOperations.deleteMany, [collectionName, filter], 'deleteDocuments')
      logger.debug(`[ServiceDatabase] Fin deleteDocuments sur ${collectionName} - ${count} document(s) supprimé(s)`)
      return count
    } catch (error) {
      handleServiceError(error, 'deleteDocuments', `Erreur lors de la suppression de documents dans ${collectionName}`)
      throw error
    }
  }

  static async deleteAllDocuments(collectionName: string): Promise<number> {
    logger.debug(`[ServiceDatabase] Début deleteAllDocuments sur ${collectionName}`)
    try {
      const count = await retry(mongodbOperations.deleteMany, [collectionName, {}], 'deleteAllDocuments')
      logger.debug(`[ServiceDatabase] Fin deleteAllDocuments sur ${collectionName} - ${count} document(s) supprimé(s)`)
      return count
    } catch (error) {
      handleServiceError(error, 'deleteAllDocuments', `Erreur lors de la suppression de tous les documents dans ${collectionName}`)
      throw error
    }
  }

  static async updateDocument(collectionName: string, filter: Document, update: Document): Promise<boolean> {
    logger.debug(`[ServiceDatabase] Début updateDocument sur ${collectionName} avec filter: ${JSON.stringify(filter)}`)
    try {
      const success = await retry(mongodbOperations.updateOne, [collectionName, filter, update], 'updateDocument')
      logger.debug(`[ServiceDatabase] Fin updateDocument sur ${collectionName}`)
      return success
    } catch (error) {
      handleServiceError(error, 'updateDocument', `Erreur lors de la mise à jour des données dans ${collectionName}`)
      throw error
    }
  }

  static async replaceDocuments(collectionName: string, mapData: Omit<MappedData, '_id'>[], platform?: PLATFORM): Promise<void> {
    logger.info(`[ServiceDatabase] Début replaceDocuments sur ${collectionName}`)
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
      logger.debug(`[ServiceDatabase] Fin replaceDocuments sur ${collectionName}`)
    } catch (error) {
      handleServiceError(error, 'replaceDocuments', `Erreur lors du remplacement des documents dans ${collectionName}`)
      throw error
    }
  }

  static async saveDocumentsWithTimestamp(
    data: Omit<MappedData, '_id'>[],
    collectionName: string,
    tsCategory: string,
    platform?: PLATFORM
  ): Promise<void> {
    logger.debug(`[ServiceDatabase] Début saveDocumentsWithTimestamp sur ${collectionName}`)
    try {
      await ServiceDatabase.replaceDocuments(collectionName, data, platform)
      await ServiceTimestamp.saveTimestampToDatabase(tsCategory, platform)
      logger.debug(`[ServiceDatabase] Fin saveDocumentsWithTimestamp sur ${collectionName}`)
    } catch (error) {
      handleServiceError(error, 'saveDocumentsWithTimestamp', `Erreur lors de la sauvegarde des documents dans ${collectionName}`)
      throw error
    }
  }

  static async getCollectionDocuments(collectionName: string): Promise<MappedData[]> {
    logger.debug(`[ServiceDatabase] Récupération des documents pour la collection ${collectionName}`)
    try {
      if (config.isOffline) {
        logger.debug('[ServiceDatabase] Mode offline activé')
        return getMockedData(collectionName)
      } else {
        const data = await ServiceDatabase.getCachedOrFetchedDocuments(collectionName)
        logger.debug(`[ServiceDatabase] Documents récupérés pour ${collectionName} (${Array.isArray(data) ? data.length : 0} élément(s))`)
        return Array.isArray(data) ? (data as MappedData[]) : []
      }
    } catch (error) {
      handleServiceError(error, 'getCollectionDocuments', `Échec de la récupération des documents pour ${collectionName}`)
      throw error
    }
  }

  static async getDocumentByFilter(collectionName: string, filter: Document): Promise<MappedData | null> {
    logger.debug(`[ServiceDatabase] Récupération d'un document dans ${collectionName} avec filter: ${JSON.stringify(filter)}`)
    try {
      if (config.isOffline) {
        const mockedData = await getMockedData(collectionName)
        return mockedData.length > 0 ? mockedData[0] : null
      } else {
        const data = await ServiceDatabase.getCachedOrFetchedDocuments(collectionName)
        if (!Array.isArray(data)) return null
        const filteredData = data.find((doc) =>
          Object.entries(filter).every(([key, value]) => doc[key] === value)
        )
        logger.debug(`[ServiceDatabase] Document ${filteredData ? 'trouvé' : 'non trouvé'} dans ${collectionName}`)
        return (filteredData as MappedData) || null
      }
    } catch (error) {
      handleServiceError(error, 'getDocumentByFilter', `Échec de la récupération du document dans ${collectionName}`)
      throw error
    }
  }

  static async getCachedOrFetchedDocuments(collectionName: string): Promise<CacheItem[] | Document[]> {
    logger.debug(`[ServiceDatabase] Tentative de récupération en cache pour ${collectionName}`)
    const key = ServiceCache.getCacheKeyForCollection(collectionName)
    const cachedData = await ServiceCache.getFromCache(key)
    if (cachedData) {
      logger.debug(`[ServiceDatabase] Cache valide trouvé pour ${collectionName}`)
      return cachedData
    }
    logger.debug(`[ServiceDatabase] Cache expiré ou absent pour ${collectionName} - récupération en base`)
    return this.fetchAndCacheDocuments(collectionName)
  }

  static async fetchAndCacheDocuments(collectionName: string): Promise<Document[]> {
    logger.debug(`[ServiceDatabase] Début fetchAndCacheDocuments pour ${collectionName}`)
    try {
      const result = await retry(mongodbOperations.find, [collectionName], 'fetchAndCacheDocuments')
      await ServiceCache.addToCache(collectionName, result as MappedData[])
      logger.debug(`[ServiceDatabase] Fin fetchAndCacheDocuments pour ${collectionName} - ${result.length} document(s) récupéré(s)`)
      return result
    } catch (error) {
      // Utilisation de logger.error ici car c'est une erreur attrapée
      logger.error({
        message: `Erreur lors de la récupération des documents depuis ${collectionName}`,
        error: error,
        method: 'fetchAndCacheDocuments'
      });
      // On loggue l'erreur via handleServiceError aussi si nécessaire, ou on assume que c'est fait à un niveau supérieur
      handleServiceError(error, 'fetchAndCacheDocuments', `Erreur lors de la récupération des documents depuis ${collectionName}`)
      return [] // Renvoyer un tableau vide comme avant pour ne pas bloquer le flux si possible
    }
  }
}