// src/services/mongodbService.ts
import { MongoClient, ServerApiVersion, Db, InsertManyResult, InsertOneResult, Document } from 'mongodb'
import { MappedData } from '@models/dbTypes'
import { databaseOperations } from '@services/databaseOperationsService'
import { handleServiceError } from '@utils/errorUtil'
import { retry } from '@utils/retryUtil'
import { getMockedData } from '@src/utils/mockUtil'
import { LastUpdateService } from '@services/lastUpdateService'
import config from '@config/index';

if (!config.database) {
  throw new Error('La configuration de la base de données est manquante');
}

const uri = `mongodb+srv://${config.database.user}:${config.database.password}@${config.database.dbName}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

let mongoInstance: MongoClient | null = null
let db: Db | null = null

export interface UpdateDataMDBParams {
  matchedCount: number
  modifiedCount: number
  upsertedId: object
  upsertedCount: number
}

interface CacheItem {
  data: Document[]
  timestamp: number
}

export class MongodbService {

  /**
 * Main function to get data from the collection
 */
  static async getData(collectionName: string | undefined): Promise<MappedData[]> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }

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
   * Creates a collection if it doesn't already exist.
   */
  static async createCollectionIfNotExists(collectionName: string | undefined): Promise<void> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    await retry(MongodbService.createCollection, [collectionName], 3)
  }

  /**
   * Creates a collection.
   */
  static async createCollection(collectionName: string | undefined): Promise<void> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }

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
  static async saveData(collectionName: string | undefined, data: object[] | object): Promise<InsertOneResult<Document> | InsertManyResult<Document>> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
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
      handleServiceError(error, 'saveData', `Error saving data in ${collectionName}`)
      throw error
    }
  }

  /**
   * Retrieves all data from a specified collection.
   */
  static async getDataMDB(collectionName: string | undefined): Promise<Document[]> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    return await retry(databaseOperations.find, [collectionName, {}], 3)
  }

  /**
   * Retrieves a single document from a specified collection based on a query.
   */
  static async getOne(collectionName: string | undefined, query: object): Promise<Document | null> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    return await retry(databaseOperations.findOne, [collectionName, query], 3)
  }



  private static cache: { [key: string]: CacheItem } = {}

  /**
   * Retrieves all data from a specified collection with caching.
   */
  static async getAllDataMDB(collectionName: string | undefined): Promise<CacheItem[] | Document[]> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    // Toujours retourner le cache si disponible
    if (MongodbService.cache[collectionName]) {
      // Si le cache est encore valide, le retourner
      const cacheExpirationTimes: { [key: string]: number } = {
        'collection_balance': config.cacheExpirationTimes?.balances ?? 0,
        'collection_cmc': config.cacheExpirationTimes?.cmc ?? 0,
        'collection_highest_prices': config.cacheExpirationTimes?.highestPrices ?? 0,
        'collection_last_update': config.cacheExpirationTimes?.lastUpdates ?? 0,
        'collection_active_orders': config.cacheExpirationTimes?.orders ?? 0,
        'collection_load_markets': config.cacheExpirationTimes?.markets ?? 0,
        'collection_shad': config.cacheExpirationTimes?.shad ?? 0,
        'collection_strat': config.cacheExpirationTimes?.strats ?? 0,
        'collection_swap': config.cacheExpirationTimes?.swaps ?? 0,
        'collection_tickers': config.cacheExpirationTimes?.tickers ?? 0,
        'collection_trades': config.cacheExpirationTimes?.trades ?? 0,
        'collection_users': config.cacheExpirationTimes?.users ?? 0,
      };
      const defaultExpirationTime = 0; // 30 secondes par défaut

      if (Date.now() - MongodbService.cache[collectionName].timestamp < (cacheExpirationTimes[collectionName] || defaultExpirationTime)) {
        return MongodbService.cache[collectionName].data;
      }
    }

    // Tenter de récupérer les données si le cache est expiré ou non existant
    try {
      console.log(`Fetching new data for collection: ${collectionName}`);
      const result = await retry(databaseOperations.find, [collectionName], 3);
      MongodbService.addToCache(collectionName, result);
      return MongodbService.cache[collectionName].data;
    } catch (error) {
      handleServiceError(error, 'getAllDataMDB', `Error fetching data from ${collectionName}`)
      return MongodbService.cache[collectionName]?.data || [];
    }
  }


  static addToCache(collectionName: string | undefined, data: Document[]): void {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }

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
   * Updates a document in a specified collection.
   */
  static async updateDataMDB(collectionName: string | undefined, filter: object, update: object): Promise<boolean> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    return await retry(databaseOperations.updateOne, [collectionName, filter, update], 3)
  }

  /**
   * Deletes a single document from a specified collection.
   */
  static async deleteOneDataMDB(collectionName: string | undefined, filter: object): Promise<boolean> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    return await retry(databaseOperations.deleteOne, [collectionName, filter], 3)
  }

  /**
   * Deletes multiple documents from a specified collection.
   */
  static async deleteMultipleDataMDB(collectionName: string | undefined, filter: object): Promise<number> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    return await retry(databaseOperations.deleteMany, [collectionName, filter], 3)
  }

  /**
   * Deletes all documents from a specified collection.
   */
  static async deleteAllDataMDB(collectionName: string | undefined): Promise<number> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    return await retry(databaseOperations.deleteMany, [collectionName, {}], 3)
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
        MongodbService.createCollectionIfNotExists(collectionName as string)
      ))
    } catch (error) {
      handleServiceError(error, 'connectToMongoDB', 'Erreur de connexion à MongoDB')
      throw error
    }
  }

  /**
   * Updates a document in the database.
   */
  static async updateInDatabase(collectionName: string | undefined, filter: object, update: object): Promise<void> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }

    try {
      await MongodbService.updateDataMDB(collectionName, filter, update)
    } catch (error) {
      handleServiceError(error, 'updateInDatabase', `Error updating data in ${collectionName}`)
    }
  }

  static async deleteAndProcessData(
    collectionName: string | undefined,
    mapData: MappedData[],
    platform: string,
    replaceAll: boolean = false
  ): Promise<void> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }
    try {
      if (mapData && mapData.length > 0) {
        if (replaceAll) {
          await MongodbService.deleteAllDataMDB(collectionName)
        } else {
          const deleteParam = { platform }
          await MongodbService.deleteMultipleDataMDB(collectionName, deleteParam)
        }
        await MongodbService.saveData(collectionName, mapData)
      }
    } catch (error) {
      handleServiceError(error, 'deleteAndProcessData', `Error processing data in ${collectionName}`)
    }
  }

  static async saveDataToDatabase(data: MappedData[], collectionName: string | undefined, platform: string, updateType: string | undefined): Promise<void> {
    if (!collectionName) {
      throw new Error("La collection MongoDB n'est pas définie");
    }

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