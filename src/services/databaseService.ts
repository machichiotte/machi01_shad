// src/services/databaseService.ts
import { Document } from 'mongodb'
import { MappedData } from '@typ/database'
import { retry } from '@utils/retryUtil'
import { getMockedData } from '@utils/mockUtil'
import { handleServiceError } from '@utils/errorUtil'
import { TimestampService } from '@services/timestampService'
import { mongodbOperations } from '@services/mongodbOperationsService'
import { CacheItem } from '@typ/mongodb'
import { CacheService } from '@services/cacheService'
import { config } from '@config/index';
import { InsertData } from '@src/types/trade'
import { PLATFORM } from '@src/types/platform'

export class DatabaseService {

    static async insertData(collectionName: string, data: object[] | object): Promise<InsertData> {
        try {
            if (!Array.isArray(data) && typeof data !== 'object') {
                throw new TypeError('Data must be an array or an object')
            }

            if (Array.isArray(data)) {
                return await retry(mongodbOperations.insertMany, [collectionName, data], 'insertData')
            } else {
                return await retry(mongodbOperations.insertOne, [collectionName, data], 'insertData')
            }
        } catch (error) {
            handleServiceError(error, 'insertData', `Error saving data in ${collectionName}`)
            throw error
        }
    }

    static async findData(collectionName: string): Promise<Document[]> {
        try {
            return await retry(mongodbOperations.find, [collectionName, {}], 'findData')
        } catch (error) {
            handleServiceError(error, 'findOneData', `Error findData in ${collectionName}`)
            throw error
        }
    }

    static async findOneData(collectionName: string, query: object): Promise<Document | null> {
        try {
            return await retry(mongodbOperations.findOne, [collectionName, query], 'findOneData')
        } catch (error) {
            handleServiceError(error, 'findOneData', `Error findOneData in ${collectionName}`)

            throw error
        }
    }

    static async deleteOneData(collectionName: string, filter: object): Promise<boolean> {
        try {
            return await retry(mongodbOperations.deleteOne, [collectionName, filter], 'deleteOneData')
        } catch (error) {
            handleServiceError(error, 'deleteOneData', `Error deleteOneData data from ${collectionName}`);
            throw error;
        }
    }

    static async deleteMultipleData(collectionName: string, filter: object): Promise<number> {
        try {
            return await retry(mongodbOperations.deleteMany, [collectionName, filter], 'deleteMultipleData')
        } catch (error) {
            handleServiceError(error, 'deleteMultipleData', `Error deleteMultipleData data from ${collectionName}`);
            throw error;
        }
    }

    static async deleteAllData(collectionName: string): Promise<number> {
        try {
            return await retry(mongodbOperations.deleteMany, [collectionName, {}], 'deleteAllData')
        } catch (error) {
            handleServiceError(error, 'deleteAllData', `Error deleteAllData data from ${collectionName}`);
            throw error
        }
    }

    static async updateOneData(collectionName: string, filter: Document, update: Document): Promise<boolean> {
        try {
            return await retry(mongodbOperations.updateOne, [collectionName, filter, update], 'updateOneData');
        } catch (error) {
            handleServiceError(error, 'updateOneData', `Erreur lors de la mise à jour des données dans ${collectionName}`);
            throw error;
        }
    }

    static async deleteAndInsertData(collectionName: string, mapData: Omit<MappedData, '_id'>[], platform?: PLATFORM): Promise<void> {
        try {
            if (mapData && mapData.length > 0) {
                if (!platform) {
                    await DatabaseService.deleteAllData(collectionName)
                } else {
                    const deleteParam = { platform }
                    await DatabaseService.deleteMultipleData(collectionName, deleteParam)
                }
                await DatabaseService.insertData(collectionName, mapData)
            }
        } catch (error) {
            handleServiceError(error, 'deleteAndInsertData', `Error processing data in ${collectionName}`)
            throw error;
        }
    }

    static async saveDataAndTimestampToDatabase(data: Omit<MappedData, '_id'>[], collectionName: string, tsCategory: string, platform?: PLATFORM): Promise<void> {
        const startTime = Date.now();

        try {
            await DatabaseService.deleteAndInsertData(collectionName, data, platform)
            await TimestampService.saveTimestampToDatabase(tsCategory, platform)
            const duration = Date.now() - startTime;

            console.log(`${Date.now()} : Save Bdd - ${collectionName} for ${platform} in ${duration}ms.`)
        } catch (error) {
            handleServiceError(error, 'saveDataAndTimestampToDatabase', 'Erreur lors de la sauvegarde des données dans la base de données')
            throw error
        }
    }

    static async getData(collectionName: string): Promise<MappedData[]> {
        try {
            if (config.isOffline) {
                console.log('offline')
                return getMockedData(collectionName)
            } else {
                const data = await DatabaseService.getCacheOrFetchCollection(collectionName)
                return Array.isArray(data) ? data as MappedData[] : []
            }
        } catch (error) {
            handleServiceError(error, 'getData', `Failed to get data from collection ${collectionName}`)
            throw error
        }
    }

    static async getCacheOrFetchCollection(collectionName: string): Promise<CacheItem[] | Document[]> {
        // Déterminer la clé de cache appropriée
        const key = CacheService.getCacheKeyForCollection(collectionName);

        // Vérifier d'abord le cache
        const cachedData = await CacheService.getFromCache(key);
        if (cachedData) return cachedData;

        // Récupérer de nouvelles données si le cache est expiré
        return this.fetchAndCacheData(collectionName);
    }

    static async fetchAndCacheData(collectionName: string): Promise<Document[]> {
        try {
            const result = await retry(mongodbOperations.find, [collectionName], 'fetchAndCacheData');
            await CacheService.addToCache(collectionName, result as MappedData[]);
            return result;
        } catch (error) {
            handleServiceError(error, 'fetchAndCacheData', `Error fetching data from ${collectionName}`);
            return [];
        }
    }
}