// src/services/mongodbService.ts
import { MongoClient, ServerApiVersion, Db, Document } from 'mongodb'
import { MappedData } from '@typ/database'
import { retry } from '@utils/retryUtil'
import { getMockedData } from '@utils/mockUtil'
import { handleServiceError } from '@utils/errorUtil'
import { TimestampService } from '@services/timestampService'
import { databaseOperations } from '@services/databaseOperationsService'
import { CacheItem } from '@typ/mongodb'
import { CacheService } from './cacheService'
import { config } from '@config/index';
import { InsertData } from '@src/types/trade'

let mongoInstance: MongoClient | null = null
let db: Db | null = null

export class MongodbService {

  /**
   * Main function to get data from the collection
   */
  static async getData(collectionName: string): Promise<MappedData[]> {
    try {
      if (config.isOffline) {
        return getMockedData(collectionName)
      } else {
        const data = await MongodbService.getAllDataMDB(collectionName)
        console.log(`${data.length} éléments récupérés depuis ${collectionName}`);
        return Array.isArray(data) ? data as MappedData[] : []
      }
    } catch (error) {
      handleServiceError(error, 'getData', `Failed to get data from collection ${collectionName}`)
      throw error
    }
  }

  /**
   * Establishes a connection to the MongoDB client.
   */
  static async getMongoClient(): Promise<MongoClient> {
    if (!mongoInstance) {
      const uri = `mongodb+srv://${config.database.user}:${config.database.password}@${config.database.cluster}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
      try {
        console.log('Attempting to connect to MongoDB...')
        mongoInstance = new MongoClient(uri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
          }
        })
        await mongoInstance.connect()
        console.log('Successfully connected to MongoDB')
      } catch (error) {
        handleServiceError(error, 'getMongoClient', 'Error connecting to MongoDB')
        throw error
      }
    }
    return mongoInstance
  }

  /**
   * Retrieves the database instance.
   */
  static async getDB(): Promise<Db> {
    if (!db) {
      const client = await MongodbService.getMongoClient()
      try {
        db = client.db(config.database.dbName)
      } catch (error) {
        handleServiceError(error, 'getDB', 'Error getting database')
        throw error
      }
    }
    return db
  }

  /**
   * Connects to MongoDB and creates necessary collections.
   */
  static async connectToMongoDB(): Promise<void> {
    try {
      await MongodbService.getDB()
      console.log('Connecté à MongoDB !')

      const collectionsToCreate = Object.values(config.collection ?? {})
      await Promise.all(collectionsToCreate.map(collectionName =>
        this.createCollectionIfNotExists(collectionName)
      ))
    } catch (error) {
      handleServiceError(error, 'connectToMongoDB', 'Erreur de connexion à MongoDB')
      throw error
    }
  }


  /**
   * Creates a collection if it doesn't already exist.
   */
  static async createCollectionIfNotExists(collectionName: string): Promise<void> {
    try {
      await retry(this.createCollection, [collectionName], 'createCollectionIfNotExists')
    } catch (error) {
      handleServiceError(error, 'createCollectionIfNotExists', 'pb createCollectionIfNotExists')
    }
  }

  /**
   * Creates a collection.
   */
  static async createCollection(collectionName: string): Promise<void> {
    try {
      const db = await MongodbService.getDB()
      const collections = await db
        .listCollections({ name: collectionName })
        .toArray()
      if (collections.length === 0) {
        await db.createCollection(collectionName)
        console.log(`Collection ${collectionName} created.`)
      }
    } catch (error) {
      handleServiceError(error, 'createCollection', `Error creating collection ${collectionName}`)
    }
  }

  /**
   * Saves data to a specified collection.
   */
  static async insertData(collectionName: string, data: object[] | object): Promise<InsertData> {
    try {
      if (!Array.isArray(data) && typeof data !== 'object') {
        throw new TypeError('Data must be an array or an object')
      }

      if (Array.isArray(data)) {
        return await retry(databaseOperations.insertMany, [collectionName, data], 'insertData')
      } else {
        return await retry(databaseOperations.insertOne, [collectionName, data], 'insertData')
      }
    } catch (error) {
      handleServiceError(error, 'insertData', `Error saving data in ${collectionName}`)
      throw error
    }
  }

  /**
   * Retrieves all data from a specified collection.
   */
  static async findData(collectionName: string): Promise<Document[]> {
    try {
      return await retry(databaseOperations.find, [collectionName, {}], 'findData')
    } catch (error) {
      handleServiceError(error, 'findOneData', `Error findData in ${collectionName}`)
      throw error
    }
  }

  /**
   * Retrieves a single document from a specified collection based on a query.
   */
  static async findOneData(collectionName: string, query: object): Promise<Document | null> {
    try {
      return await retry(databaseOperations.findOne, [collectionName, query], 'findOneData')
    } catch (error) {
      handleServiceError(error, 'findOneData', `Error findOneData in ${collectionName}`)

      throw error
    }
  }



  private static cache: { [key: string]: CacheItem } = {}
  static addToCache(collectionName: string, data: Document[]): void {
    try {
      if (data.length > 0) {
        this.cache[collectionName] = {
          data,
          timestamp: Date.now()
        }
      }
    } catch (error) {
      handleServiceError(error, 'addToCache', `Error adding to cache in ${collectionName}`)
    }
  }

  /**
   * Retrieves all data from a specified collection with caching.
   */
  static async getAllDataMDB(collectionName: string): Promise<CacheItem[] | Document[]> {
    // Déterminer la clé de cache appropriée
    const key = this.getCacheKeyForCollection(collectionName);

    // Vérifier d'abord le cache
    const cachedData = await CacheService.getFromCache(key);
    if (cachedData) return cachedData;

    // Récupérer de nouvelles données si le cache est expiré
    return this.fetchAndCacheData(collectionName);
  }

  private static getCacheKeyForCollection(collectionName: string): keyof typeof config.cacheExpirationTimes {
    switch (collectionName) {
      case config.collection.balance:
        return 'balance';
      case config.collection.cmc:
        return 'cmc';
      case config.collection.highestPrice:
        return 'highestPrice';
      case config.collection.timestamp:
        return 'timestamp';
      case config.collection.market:
        return 'market';
      case config.collection.order:
        return 'order';
      case config.collection.shad:
        return 'shad';
      case config.collection.strat:
        return 'strat';
      case config.collection.swap:
        return 'swaps';
      case config.collection.ticker:
        return 'ticker';
      case config.collection.trade:
        return 'trade';
      case config.collection.user:
        return 'user';
      default:
        throw new Error(`Collection non reconnue: ${collectionName}`);
    }
  }

  static async fetchAndCacheData(collectionName: string): Promise<Document[]> {
    try {
      console.log(`Fetching new data for collection: ${collectionName}`);
      const result = await retry(databaseOperations.find, [collectionName], 'fetchAndCacheData');
      await CacheService.addToCache(collectionName, result);
      return result;
    } catch (error) {
      handleServiceError(error, 'fetchAndCacheData', `Error fetching data from ${collectionName}`);
      return [];
    }
  }


  /**
   * Deletes a single document from a specified collection.
   */
  static async deleteOneData(collectionName: string, filter: object): Promise<boolean> {
    try {
      return await retry(databaseOperations.deleteOne, [collectionName, filter], 'deleteOneData')
    } catch (error) {
      handleServiceError(error, 'deleteOneData', `Error deleteOneData data from ${collectionName}`);
      throw error;
    }
  }

  /**
   * Deletes multiple documents from a specified collection.
   */
  static async deleteMultipleData(collectionName: string, filter: object): Promise<number> {
    try {
      return await retry(databaseOperations.deleteMany, [collectionName, filter], 'deleteMultipleData')
    } catch (error) {
      handleServiceError(error, 'deleteMultipleData', `Error deleteMultipleData data from ${collectionName}`);
      throw error;
    }
  }

  /**
   * Deletes all documents from a specified collection.
   */
  static async deleteAllData(collectionName: string): Promise<number> {
    try {
      return await retry(databaseOperations.deleteMany, [collectionName, {}], 'deleteAllData')
    } catch (error) {
      handleServiceError(error, 'deleteAllData', `Error deleteAllData data from ${collectionName}`);
      throw error
    }
  }

  /**
   * Updates a document in the database.
   */
  static async updateOneData(collectionName: string, filter: object, update: MappedData): Promise<boolean> {
    try {
      return await retry(databaseOperations.updateOne, [collectionName, filter, update], 'updateOneData')
    } catch (error) {
      handleServiceError(error, 'updateOneData', `Error updateOneData data from ${collectionName}`);
      throw error

    }
  }

  static async deleteAndProcessData(collectionName: string, mapData: Omit<MappedData, '_id'>[], platform: string, replaceAll: boolean = false): Promise<void> {
    try {
      if (mapData && mapData.length > 0) {
        if (replaceAll) {
          await MongodbService.deleteAllData(collectionName)
        } else {
          const deleteParam = { platform }
          await MongodbService.deleteMultipleData(collectionName, deleteParam)
        }
        await MongodbService.insertData(collectionName, mapData)
      }
    } catch (error) {
      handleServiceError(error, 'deleteAndProcessData', `Error processing data in ${collectionName}`)
      throw error;
    }
  }

  static async saveDataToDatabase(data: Omit<MappedData, '_id'>[], collectionName: string, platform: string, tsCategory: string): Promise<void> {
    try {
      await MongodbService.deleteAndProcessData(collectionName, data, platform)
      await TimestampService.saveTimestampToDatabase(tsCategory, platform)
      console.log(`Données de ${platform} sauvegardées dans la base de données de ${collectionName}`)
    } catch (error) {
      handleServiceError(error, 'saveDataToDatabase', 'Erreur lors de la sauvegarde des données dans la base de données')
      throw error
    }
  }
}