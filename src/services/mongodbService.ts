// src/services/mongodbService.ts
import { MongoClient, ServerApiVersion, Db } from 'mongodb'
import { retry } from '@utils/retryUtil'
import { handleServiceError } from '@utils/errorUtil'
import { config } from '@config/index';

let mongoInstance: MongoClient | null = null
let db: Db | null = null

export class MongodbService {

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

  static async createCollectionIfNotExists(collectionName: string): Promise<void> {
    try {
      await retry(this.createCollection, [collectionName], 'createCollectionIfNotExists')
    } catch (error) {
      handleServiceError(error, 'createCollectionIfNotExists', 'pb createCollectionIfNotExists')
    }
  }

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

}