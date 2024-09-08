/**
 * MongoDB Service Module
 * 
 * This module provides functions for interacting with a MongoDB database.
 * It includes operations for connecting to the database, managing collections,
 * and performing CRUD operations.
 */

require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let mongoInstance;
let db;

/**
 * Establishes a connection to the MongoDB client.
 * @returns {Promise<MongoClient>} The MongoDB client instance.
 */
async function getMongoClient() {
  if (!mongoInstance) {
    try {
      console.log("Attempting to connect to MongoDB...");
      mongoInstance = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      await mongoInstance.connect();
      console.log("Successfully connected to MongoDB");
    } catch (error) {
      console.log("Error connecting to MongoDB:", error);
      throw error;
    }
  }
  return mongoInstance;
}

/**
 * Retrieves the database instance.
 * @returns {Promise<Db>} The database instance.
 */
async function getDB() {
  if (!db) {
    const client = await getMongoClient();
    try {
      db = client.db(process.env.MONGODB_DATABASE);
      console.log("Database selected:", process.env.MONGODB_DATABASE);
    } catch (error) {
      console.log(`🚀 ~ file: mongodbService.js:37 ~ getDB ~ error:`, error);
      throw error;
    }
  }
  return db;
}

/**
 * Retrieves a specific collection from the database.
 * @param {string} collectionName - The name of the collection to retrieve.
 * @returns {Promise<Collection>} The requested collection.
 */
async function getCollection(collectionName) {
  const db = await getDB();
  return db.collection(collectionName);
}

/**
 * Cleans the 'collection_trades' by removing duplicates and updating records.
 * @returns {Promise<void>}
 */
async function cleanCollectionTrades() {
  const collectionTrades = await getCollection("collection_trades");

  const duplicates = await collectionTrades
    .aggregate([
      {
        $match: {
          $or: [{ date: { $exists: true } }, { timestamp: { $exists: true } }],
        },
      },
      {
        $group: {
          _id: {
            base: "$base",
            quote: "$quote",
            price: "$price",
            amount: "$amount",
            type: "$type",
            timestamp: "$timestamp",
          },
          count: { $sum: 1 },
          documents: { $push: "$$ROOT" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ])
    .toArray();

  await Promise.all(
    duplicates.map(async (group) => {
      const documentsToKeep = group.documents.filter((doc) => doc.timestamp);
      const documentsToDelete = group.documents.filter(
        (doc) => !doc.timestamp || doc.date
      );

      if (documentsToKeep.length > 0) {
        const documentToKeep = documentsToKeep[0];

        await Promise.all(
          group.documents
            .filter((doc) => doc._id !== documentToKeep._id)
            .map(async (doc) => {
              if (doc.totalUSDT && !documentToKeep.totalUSDT) {
                await collectionTrades.updateOne(
                  { _id: documentToKeep._id },
                  { $set: { totalUSDT: doc.totalUSDT } }
                );
              }

              await collectionTrades.deleteOne({ _id: doc._id });
            })
        );
      }
    })
  );
}

/**
 * Executes an operation with retry logic.
 * @param {Function} operation - The operation to execute.
 * @param {Array} args - Arguments for the operation.
 * @param {number} retryDelay - Delay between retries in milliseconds.
 * @param {number} maxRetries - Maximum number of retry attempts.
 * @returns {Promise<*>} The result of the operation.
 */
async function handleRetry(operation, args, retryDelay = 5000, maxRetries = 5) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await operation(...args);
    } catch (error) {
      attempts++;
      console.warn(
        `Opération échouée (tentative ${attempts}/${maxRetries}): ${error.message}`
      );
      if (
        attempts === maxRetries ||
        !["ECONNRESET", "ETIMEDOUT", "ENETDOWN", "ENETUNREACH"].includes(
          error.code
        )
      ) {
        throw error;
      }
      await new Promise((res) => setTimeout(res, retryDelay * attempts));
    }
  }
}

/**
 * Creates a collection if it doesn't already exist.
 * @param {string} collectionName - The name of the collection to create.
 * @returns {Promise<void>}
 */
async function createCollectionIfNotExists(collectionName) {
  await handleRetry(async () => {
    const db = await getDB();
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`Collection ${collectionName} created.`);
    }
  }, []);
}

/**
 * Saves data to a specified collection.
 * @param {Array|Object} data - The data to save.
 * @param {string} collectionName - The name of the collection to save to.
 * @returns {Promise<*>} The result of the save operation.
 */
async function saveData(data, collectionName) {
  if (!Array.isArray(data) && typeof data !== "object") {
    throw new TypeError("Data must be an array or an object");
  }

  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    if (Array.isArray(data)) {
      const result = await collection.insertMany(data);
      console.log(
        `🚀 ~ file: mongodbService.js:92 ~ saveData ~ inserted ${result.insertedCount} items in collection ${collectionName}`
      );
      return result;
    } else {
      const result = await collection.insertOne(data);
      console.log(
        `~ file: mongodbService.js:96 ~ saveData ~ inserted document ID: ${result.insertedId} in collection ${collectionName}`
      );
      return result;
    }
  }, [data, collectionName]);
}

/**
 * Retrieves all data from a specified collection.
 * @param {string} collectionName - The name of the collection to retrieve from.
 * @returns {Promise<Array>} An array of documents from the collection.
 */
async function getDataMDB(collectionName) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.find().toArray();
    console.log(
      `🚀 ~ getDataMDB ~ fetched ${result.length} documents in collection ${collectionName}`
    );
    return result;
  }, [collectionName]);
}

/**
 * Inserts a single document into a specified collection.
 * @param {string} collectionName - The name of the collection to insert into.
 * @param {Object} document - The document to insert.
 * @returns {Promise<string>} The ID of the inserted document.
 */
async function insertDataMDB(collectionName, document) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.insertOne(document);
    console.log(
      `🚀 ~ insertDataMDB ~ inserted document ID: ${result.insertedId} in collection ${collectionName}`
    );
    return result.insertedId;
  }, [collectionName, document]);
}

/**
 * Retrieves a single document from a specified collection based on a query.
 * @param {string} collectionName - The name of the collection to query.
 * @param {Object} query - The query to find the document.
 * @returns {Promise<Object|null>} The found document or null if not found.
 */
async function getOne(collectionName, query) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.findOne(query);
    console.log(
      `🚀 ~ getOne ~ fetched ${result.length} documents in collection ${collectionName}`
    );
    return result;
  }, [collectionName, query]);
}

const cache = {};
/**
 * Retrieves all data from a specified collection with caching.
 * @param {string} collectionName - The name of the collection to retrieve from.
 * @returns {Promise<Array>} An array of documents from the collection.
 */
async function getAllDataMDB(collectionName) {
  if (
    cache[collectionName] &&
    Date.now() - cache[collectionName].timestamp < 30000
  ) {
    console.log(`Using cached data for collection: ${collectionName}`);
    return cache[collectionName].data;
  }

  console.log(`Not using cached data for collection: ${collectionName}`);

  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.find().toArray();

    cache[collectionName] = {
      data: result,
      timestamp: Date.now(),
    };

    return result;
  }, [collectionName]);
}

/**
 * Updates a document in a specified collection.
 * @param {string} collectionName - The name of the collection to update.
 * @param {Object} filter - The filter to find the document to update.
 * @param {Object} update - The update to apply to the document.
 * @returns {Promise<Object>} The result of the update operation.
 */
async function updateDataMDB(collectionName, filter, update) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.updateOne(filter, update, { upsert: true });
    console.log(
      `🚀 ~ updateDataMDB ~ modified ${result.modifiedCount} document(s)`
    );
    return result;
  }, [collectionName, filter, update]);
}

/**
 * Deletes a single document from a specified collection.
 * @param {string} collectionName - The name of the collection to delete from.
 * @param {Object} filter - The filter to find the document to delete.
 * @returns {Promise<number>} The number of deleted documents.
 */
async function deleteDataMDB(collectionName, filter) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne(filter);
    console.log(
      `🚀 ~ deleteDataMDB ~ deleted ${result.deletedCount} document(s) in collection ${collectionName}`
    );
    return result.deletedCount;
  }, [collectionName, filter]);
}

/**
 * Deletes multiple documents from a specified collection.
 * @param {string} collectionName - The name of the collection to delete from.
 * @param {Object} deleteParam - The filter to find the documents to delete.
 * @returns {Promise<number>} The number of deleted documents.
 */
async function deleteMultipleDataMDB(collectionName, deleteParam) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteMany(deleteParam);
    console.log(
      `🚀 ~ deleteMultipleDataMDB ~ deleted ${result.deletedCount} document(s) in collection ${collectionName}`
    );
    return result.deletedCount;
  }, [collectionName, deleteParam]);
}

/**
 * Deletes all documents from a specified collection.
 * @param {string} collectionName - The name of the collection to clear.
 * @returns {Promise<number>} The number of deleted documents.
 */
async function deleteAllDataMDB(collectionName) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteMany({});
    return result.deletedCount;
  }, [collectionName]);
}

/**
 * Connects to MongoDB and creates necessary collections.
 * @returns {Promise<void>}
 */
async function connectToMongoDB() {
  try {
    await getDB();
    console.log("Connected to MongoDB!");

    const collectionsToCreate = [
      "collection_active_orders",
      "collection_balance",
      "collection_cmc",
      "collection_load_markets",
      "collection_strategy",
      "collection_trades",
      "collection_tickers",
      "collection_last_update",
      "collection_shad",
      "collection_swap",
    ];

    for (const collectionName of collectionsToCreate) {
      await createCollectionIfNotExists(collectionName);
    }
  } catch (error) {
    console.error("🚀 ~ connectToMongoDB ~ error:", error);
    throw error;
  }
}

/**
 * Updates a document in the database.
 * @param {string} collectionName - The name of the collection to update.
 * @param {Object} filter - The filter to find the document to update.
 * @param {Object} update - The update to apply to the document.
 * @returns {Promise<void>}
 */
async function updateInDatabase(collectionName, filter, update) {
  try {
    await updateDataMDB(collectionName, filter, update);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Deletes existing data and saves new data for a specific platform.
 * @param {Array} mapData - The new data to save.
 * @param {string} collection - The name of the collection to update.
 * @param {string} platform - The platform identifier.
 * @returns {Promise<void>}
 */
async function deleteAndSaveData(mapData, collection, platform) {
  if (mapData && mapData.length > 0) {
    const deleteParam = { platform };
    await deleteMultipleDataMDB(collection, deleteParam);
    await saveData(mapData, collection);
  }
}

/**
 * Deletes all existing data and saves a new object in a collection.
 * @param {Object} mapData - The new data object to save.
 * @param {string} collectionName - The name of the collection to update.
 * @returns {Promise<void>}
 */
async function deleteAndSaveObject(mapData, collectionName) {
  if (mapData && Object.keys(mapData).length > 0) {
    await deleteAllDataMDB(collectionName);
    await saveData(mapData, collectionName);
  }
}

module.exports = {
  connectToMongoDB,
  cleanCollectionTrades,
  saveData,
  getDataMDB,
  getOne,
  insertDataMDB,
  getAllDataMDB,
  updateDataMDB,
  deleteDataMDB,
  deleteMultipleDataMDB,
  deleteAllDataMDB,
  updateInDatabase,
  deleteAndSaveData,
  deleteAndSaveObject,
};
