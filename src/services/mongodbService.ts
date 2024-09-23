// src/services/mongodbService.ts
import { MongoClient, ServerApiVersion, Db, InsertManyResult, InsertOneResult, Document } from 'mongodb'
import { MappedData } from '@typ/database'
import { retry } from '@utils/retryUtil'
import { getMockedData } from '@utils/mockUtil'
import { handleServiceError } from '@utils/errorUtil'
import { LastUpdateService } from '@services/lastUpdateService'
import { databaseOperations } from '@services/databaseOperationsService'
import config from '@config/index';

if (!config) {
  throw new Error('La configuration est manquante');
}

if (!config.database) {
  throw new Error('La configuration de la base de données est manquante');
}

const uri = `mongodb+srv://${config.database.user}:${config.database.password}@${config.database.dbName}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

let mongoInstance: MongoClient | null = null
let db: Db | null = null

export interface updateOneDataParams {
  matchedCount: number
  modifiedCount: number
  upsertedId: object
  upsertedCount: number
}

type InsertData = InsertOneResult<Document> | InsertManyResult<Document>


interface CacheItem {
  data: Document[]
  timestamp: number
}

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
        db = client.db(config.database?.dbName)
        console.log('Database selected:', config.database?.dbName)
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
        MongodbService.createCollectionIfNotExists(collectionName)
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
    await retry(MongodbService.createCollection, [collectionName], 3)
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
        return await retry(databaseOperations.insertMany, [collectionName, data], 3)
      } else {
        return await retry(databaseOperations.insertOne, [collectionName, data], 3)
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
    return await retry(databaseOperations.find, [collectionName, {}], 3)
  }

  /**
   * Retrieves a single document from a specified collection based on a query.
   */
  static async findOneData(collectionName: string, query: object): Promise<Document | null> {
    return await retry(databaseOperations.findOne, [collectionName, query], 3)
  }



  private static cache: { [key: string]: CacheItem } = {}
  static addToCache(collectionName: string, data: Document[]): void {
    try {
      if (data.length > 0) {
        MongodbService.cache[collectionName] = {
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
    // Check cache first
    const cachedData = MongodbService.checkCache(collectionName);
    if (cachedData) return cachedData;

    // Fetch new data if cache is expired
    return MongodbService.fetchAndCacheData(collectionName);
  }

  private static checkCache(collectionName: string): Document[] | null {
    const cacheItem = MongodbService.cache[collectionName];
    const expirationTime = config.cacheExpirationTimes?.[collectionName] || 0;

    if (cacheItem && (Date.now() - cacheItem.timestamp < expirationTime)) {
      return cacheItem.data;
    }
    return null;
  }

  private static async fetchAndCacheData(collectionName: string): Promise<Document[]> {
    try {
      console.log(`Fetching new data for collection: ${collectionName}`);
      const result = await retry(databaseOperations.find, [collectionName], 3);
      MongodbService.addToCache(collectionName, result);
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
    return await retry(databaseOperations.deleteOne, [collectionName, filter], 3)
  }

  /**
   * Deletes multiple documents from a specified collection.
   */
  static async deleteMultipleData(collectionName: string, filter: object): Promise<number> {
    return await retry(databaseOperations.deleteMany, [collectionName, filter], 3)
  }

  /**
   * Deletes all documents from a specified collection.
   */
  static async deleteAllData(collectionName: string): Promise<number> {
    return await retry(databaseOperations.deleteMany, [collectionName, {}], 3)
  }

  /**
   * Updates a document in the database.
   */
  static async updateOneData(collectionName: string, filter: object, update: object): Promise<boolean> {
    return await retry(databaseOperations.updateOne, [collectionName, filter, update], 3)
  }

  static async deleteAndProcessData(collectionName: string, mapData: MappedData[], platform: string, replaceAll: boolean = false): Promise<void> {
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

  static async saveDataToDatabase(data: MappedData[], collectionName: string, platform: string, updateType: string): Promise<void> {
    try {
      await MongodbService.deleteAndProcessData(collectionName, data, platform)
      await LastUpdateService.saveLastUpdateToDatabase(updateType, platform)
      console.log(`Données de ${platform} sauvegardées dans la base de données de ${collectionName}`)
    } catch (error) {
      handleServiceError(error, 'saveDataToDatabase', 'Erreur lors de la sauvegarde des données dans la base de données')
      throw error
    }
  }
}