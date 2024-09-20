// src/services/mongodbService.ts
import dotenv from 'dotenv'
import { MongoClient, ServerApiVersion, Db, InsertManyResult, InsertOneResult, Document } from 'mongodb'
import { MappedData } from '@models/dbTypes'
import { databaseOperations } from '@services/databaseOperationsService'
import { handleServiceError } from '@utils/errorUtil'
import { retry } from '@utils/retryUtil'

dotenv.config()

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

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
      const client = await this.getMongoClient()
      try {
        db = client.db(process.env.MONGODB_DATABASE)
        console.log('Database selected:', process.env.MONGODB_DATABASE)
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
  static async createCollectionIfNotExists(collectionName: string): Promise<void> {
    await retry(this.createCollection, [collectionName], 3)
  }

  /**
   * Creates a collection.
   */
  static async createCollection(collectionName: string): Promise<void> {
    try {
      const db = await this.getDB()
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
  static async saveData(collectionName: string, data: object[] | object): Promise<InsertOneResult<Document> | InsertManyResult<Document>> {
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
  static async getDataMDB(collectionName: string): Promise<Document[]> {
    return await retry(databaseOperations.find, [collectionName, {}], 3)
  }

  /**
   * Retrieves a single document from a specified collection based on a query.
   */
  static async getOne(collectionName: string, query: object): Promise<Document | null> {
    return await retry(databaseOperations.findOne, [collectionName, query], 3)
  }



  private static cache: { [key: string]: CacheItem } = {}

  /**
   * Retrieves all data from a specified collection with caching.
   */
  static async getAllDataMDB(collectionName: string): Promise<CacheItem[] | Document[]> {
    // Toujours retourner le cache si disponible
    if (this.cache[collectionName]) {
      // Si le cache est encore valide, le retourner
      const cacheExpirationTimes: { [key: string]: number } = {
        'collection_active_orders': 60000,
        'collection_cmc': 14400000,
        'collection_tickers': 30000,
        'collection_trades': 30000,
        'collection_balance': 30000,
        'collection_last_update': 30000,
        'collection_load_markets': 86400000,
        'collection_shad': 60000,
        'collection_strat': 36000000,
        'collection_swap': 86400000,
        'collection_users': 0
      };
      const defaultExpirationTime = 0; // 30 secondes par défaut

      if (Date.now() - this.cache[collectionName].timestamp < (cacheExpirationTimes[collectionName] || defaultExpirationTime)) {
        return this.cache[collectionName].data;
      }
    }

    // Tenter de récupérer les données si le cache est expiré ou non existant
    try {
      console.log(`Fetching new data for collection: ${collectionName}`);
      const result = await retry(databaseOperations.find, [collectionName], 3);
      this.addToCache(collectionName, result);
      return this.cache[collectionName].data;
    } catch (error) {
      handleServiceError(error, 'getAllDataMDB', `Error fetching data from ${collectionName}`)
      return this.cache[collectionName]?.data || [];
    }
  }


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
   * Updates a document in a specified collection.
   */
  static async updateDataMDB(collectionName: string, filter: object, update: object): Promise<boolean> {
    return await retry(databaseOperations.updateOne, [collectionName, filter, update], 3)
  }

  /**
   * Deletes a single document from a specified collection.
   */
  static async deleteOneDataMDB(collectionName: string, filter: object): Promise<boolean> {
    return await retry(databaseOperations.deleteOne, [collectionName, filter], 3)
  }

  /**
   * Deletes multiple documents from a specified collection.
   */
  static async deleteMultipleDataMDB(collectionName: string, filter: object): Promise<number> {
    return await retry(databaseOperations.deleteMany, [collectionName, filter], 3)
  }

  /**
   * Deletes all documents from a specified collection.
   */
  static async deleteAllDataMDB(collectionName: string): Promise<number> {
    return await retry(databaseOperations.deleteMany, [collectionName, {}], 3)
  }

  private static readonly activeOrdersCollection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS
  private static readonly balanceCollection = process.env.MONGODB_COLLECTION_BALANCE
  private static readonly cmcCollection = process.env.MONGODB_COLLECTION_CMC
  private static readonly lastUpdateCollection = process.env.MONGODB_COLLECTION_LAST_UPDATE
  private static readonly loadMarketsCollection = process.env.MONGODB_COLLECTION_LOAD_MARKETS
  private static readonly shadCollection = process.env.MONGODB_COLLECTION_SHAD
  private static readonly stratCollection = process.env.MONGODB_COLLECTION_STRAT
  private static readonly swapCollection = process.env.MONGODB_COLLECTION_SWAP
  private static readonly tradesCollection = process.env.MONGODB_COLLECTION_TRADES
  private static readonly tickersCollection = process.env.MONGODB_COLLECTION_TICKERS
  private static readonly usersCollection = process.env.MONGODB_COLLECTION_USERS
  private static readonly highestPricesCollection = process.env.MONGODB_COLLECTION_HIGHEST_PRICES

  /**
   * Connects to MongoDB and creates necessary collections.
   */
  static async connectToMongoDB(): Promise<void> {
    try {
      await this.getDB()
      console.log('Connected to MongoDB!')

      const collectionsToCreate = [
        this.activeOrdersCollection,
        this.balanceCollection,
        this.cmcCollection,
        this.lastUpdateCollection,
        this.loadMarketsCollection,
        this.shadCollection,
        this.stratCollection,
        this.swapCollection,
        this.tradesCollection,
        this.tickersCollection,
        this.usersCollection,
        this.highestPricesCollection
      ]

      for (const collectionName of collectionsToCreate) {
        await this.createCollectionIfNotExists(collectionName as string)
      }
    } catch (error) {
      handleServiceError(error, 'connectToMongoDB', 'Error connecting to MongoDB')
      throw error
    }
  }

  /**
   * Updates a document in the database.
   */
  static async updateInDatabase(collectionName: string, filter: object, update: object): Promise<void> {
    try {
      await this.updateDataMDB(collectionName, filter, update)
    } catch (error) {
      handleServiceError(error, 'updateInDatabase', `Error updating data in ${collectionName}`)
    }
  }

  /**
   * Deletes existing data and saves new data for a specific platform.
   */
  static async deleteAndSaveData(collectionName: string, mapData: MappedData[], platform: string): Promise<void> {
    try {
      if (mapData && mapData.length > 0) {
        const deleteParam = { platform }
        await this.deleteMultipleDataMDB(collectionName, deleteParam)
        await this.saveData(collectionName, mapData)
      }
    } catch (error) {
      handleServiceError(error, 'deleteAndSaveData', `Error deleting and saving data in ${collectionName}`)
    }
  }

  /**
   * Deletes all existing data and saves a new object in a collection.
   */
  static async deleteAndReplaceAll(collectionName: string, mapData: MappedData[]): Promise<void> {
    try {
      if (mapData && mapData.length > 0) {
        await this.deleteAllDataMDB(collectionName)
        await this.saveData(collectionName, mapData)
      }
    } catch (error) {
      handleServiceError(error, 'deleteAndReplaceAll', `Error deleting and replacing all data in ${collectionName}`)
    }
  }
}