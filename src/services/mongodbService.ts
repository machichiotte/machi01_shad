// src/services/mongodbService.ts
import dotenv from 'dotenv'
import { MongoClient, ServerApiVersion, Db, InsertManyResult, InsertOneResult, Document } from 'mongodb'
import { MappedData } from 'src/models/dbTypes'
import { databaseOperations } from '@services/databaseOperationsService'
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

/**
 * Establishes a connection to the MongoDB client.
 */
async function getMongoClient(): Promise<MongoClient> {
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
      console.log('Error connecting to MongoDB:', error)
      throw error
    }
  }
  return mongoInstance
}

/**
 * Retrieves the database instance.
 */
async function getDB(): Promise<Db> {
  if (!db) {
    const client = await getMongoClient()
    try {
      db = client.db(process.env.MONGODB_DATABASE)
      console.log('Database selected:', process.env.MONGODB_DATABASE)
    } catch (error) {
      console.log(`Error, no database selected:`, error)
      throw error
    }
  }
  return db
}

/**
 * Retries a function n number of times before giving up
 */
export async function retry<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  args: A,
  maxTry: number,
  retryCount = 1
): Promise<R> {
  try {
    return await fn(...args);
  } catch (e) {
    console.log(`Retry ${retryCount} failed.`);
    if (retryCount >= maxTry) {
      console.log(`All ${maxTry} retry attempts exhausted`);
      throw e;
    }
    return retry(fn, args, maxTry, retryCount + 1);
  }
}

/**
 * Creates a collection if it doesn't already exist.
 */
async function createCollectionIfNotExists(collectionName: string): Promise<void> {
  await retry(createCollection, [collectionName], 3)
}

/**
 * Creates a collection.
 */
async function createCollection(collectionName: string): Promise<void> {
  const db = await getDB()
  const collections = await db
    .listCollections({ name: collectionName })
    .toArray()
  if (collections.length === 0) {
    await db.createCollection(collectionName)
    console.log(`Collection ${collectionName} created.`)
  }
}

/**
 * Saves data to a specified collection.
 */
async function saveData(collectionName: string, data: object[] | object): Promise<InsertOneResult<Document> | InsertManyResult<Document>> {
  if (!Array.isArray(data) && typeof data !== 'object') {
    throw new TypeError('Data must be an array or an object')
  }

  if (Array.isArray(data)) {
    return await retry(databaseOperations.insertMany, [collectionName, data], 3)
  } else {
    return await retry(databaseOperations.insertOne, [collectionName, data], 3)
  }
}

/**
 * Retrieves all data from a specified collection.
 */
async function getDataMDB(collectionName: string): Promise<Document[]> {
  return await retry(databaseOperations.find, [collectionName, {}], 3)
}

/**
 * Retrieves a single document from a specified collection based on a query.
 */
async function getOne(collectionName: string, query: object): Promise<Document | null> {
  return await retry(databaseOperations.findOne, [collectionName, query], 3)
}

interface CacheItem {
  data: Document[]
  timestamp: number
}

const cache: { [key: string]: CacheItem } = {}

/**
 * Retrieves all data from a specified collection with caching.
 */
async function getAllDataMDB(collectionName: string): Promise<CacheItem[] | Document[]> {
  // Toujours retourner le cache si disponible
  if (cache[collectionName]) {
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

    if (Date.now() - cache[collectionName].timestamp < (cacheExpirationTimes[collectionName] || defaultExpirationTime)) {
      return cache[collectionName].data;
    }
  }

  // Tenter de récupérer les données si le cache est expiré ou non existant
  try {
    console.log(`Fetching new data for collection: ${collectionName}`);
    const result = await retry(databaseOperations.find, [collectionName], 3);
    addToCache(collectionName, result);
    return cache[collectionName].data;
  } catch (error) {
    console.error(`Failed to fetch data for collection: ${collectionName}`, error);
    // Retourner le cache existant même s'il est expiré, ou un tableau vide
    return cache[collectionName]?.data || [];
  }
}


function addToCache(collectionName: string, data: Document[]): void {
  if (data.length > 0) {
    cache[collectionName] = {
      data,
      timestamp: Date.now()
    }
  }
}



/**
 * Updates a document in a specified collection.
 */
async function updateDataMDB(collectionName: string, filter: object, update: object): Promise<boolean> {
  return await retry(databaseOperations.updateOne, [collectionName, filter, update], 3)
}

/**
 * Deletes a single document from a specified collection.
 */
async function deleteOneDataMDB(collectionName: string, filter: object): Promise<boolean> {
  return await retry(databaseOperations.deleteOne, [collectionName, filter], 3)
}

/**
 * Deletes multiple documents from a specified collection.
 */
async function deleteMultipleDataMDB(collectionName: string, filter: object): Promise<number> {
  return await retry(databaseOperations.deleteMany, [collectionName, filter], 3)
}

/**
 * Deletes all documents from a specified collection.
 */
async function deleteAllDataMDB(collectionName: string): Promise<number> {
  return await retry(databaseOperations.deleteMany, [collectionName, {}], 3)
}

const activeOrdersCollection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS
const balanceCollection = process.env.MONGODB_COLLECTION_BALANCE
const cmcCollection = process.env.MONGODB_COLLECTION_CMC
const lastUpdateCollection = process.env.MONGODB_COLLECTION_LAST_UPDATE
const loadMarketsCollection = process.env.MONGODB_COLLECTION_LOAD_MARKETS
const shadCollection = process.env.MONGODB_COLLECTION_SHAD
const stratCollection = process.env.MONGODB_COLLECTION_STRAT
const swapCollection = process.env.MONGODB_COLLECTION_SWAP
const tradesCollection = process.env.MONGODB_COLLECTION_TRADES
const tickersCollection = process.env.MONGODB_COLLECTION_TICKERS
const usersCollection = process.env.MONGODB_COLLECTION_USERS
const highestPricesCollection = process.env.MONGODB_COLLECTION_HIGHEST_PRICES

/**
 * Connects to MongoDB and creates necessary collections.
 */
async function connectToMongoDB(): Promise<void> {
  try {
    await getDB()
    console.log('Connected to MongoDB!')

    const collectionsToCreate = [
      activeOrdersCollection,
      balanceCollection,
      cmcCollection,
      lastUpdateCollection,
      loadMarketsCollection,
      shadCollection,
      stratCollection,
      swapCollection,
      tradesCollection,
      tickersCollection,
      usersCollection,
      highestPricesCollection
    ]

    for (const collectionName of collectionsToCreate) {
      await createCollectionIfNotExists(collectionName as string)
    }
  } catch (error) {
    console.error('🚀 ~ connectToMongoDB ~ error:', error)
    throw error
  }
}

/**
 * Updates a document in the database.
 */
async function updateInDatabase(
  collectionName: string,
  filter: object,
  update: object
): Promise<void> {
  try {
    await updateDataMDB(collectionName, filter, update)
  } catch (error) {
    console.error(error)
  }
}

/**
 * Deletes existing data and saves new data for a specific platform.
 */
async function deleteAndSaveData(collectionName: string, mapData: MappedData[], platform: string): Promise<void> {
  if (mapData && mapData.length > 0) {
    const deleteParam = { platform }
    await deleteMultipleDataMDB(collectionName, deleteParam)
    await saveData(collectionName, mapData)
  }
}

/**
 * Deletes all existing data and saves a new object in a collection.
 */
async function deleteAndReplaceAll(collectionName: string, mapData: MappedData[]): Promise<void> {
  if (mapData && mapData.length > 0) {
    await deleteAllDataMDB(collectionName)
    await saveData(collectionName, mapData)
  }
}

export {
  connectToMongoDB,
  saveData,
  getDataMDB,
  getOne,
  getAllDataMDB,
  updateDataMDB,
  deleteOneDataMDB,
  deleteMultipleDataMDB,
  deleteAllDataMDB,
  updateInDatabase,
  deleteAndSaveData,
  deleteAndReplaceAll,
  getDB
}