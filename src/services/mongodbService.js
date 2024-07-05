require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let mongoInstance;
let db;

async function getMongoClient() {
  if (!mongoInstance) {
    try {
      console.log("🚀 ~ Attempting to connect to MongoDB...");
      mongoInstance = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
      await mongoInstance.connect();
      console.log("🚀 ~ Successfully connected to MongoDB");
    } catch (error) {
      console.error("🚀 ~ Error connecting to MongoDB:", error);
      throw error;
    }
  }
  return mongoInstance;
}

async function getDB() {
  if (!db) {
    const client = await getMongoClient();
    try {
      db = client.db(process.env.MONGODB_DATABASE);
      console.log("🚀 ~ Database selected:", process.env.MONGODB_DATABASE);
    } catch (error) {
      console.error("🚀 ~ Error selecting database:", error);
      throw error;
    }
  }
  return db;
}

async function getCollection(collectionName) {
  const db = await getDB();
  return db.collection(collectionName);
}

async function handleRetry(operation, args, retryDelay = 5000, maxRetries = 5) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await operation(...args);
    } catch (error) {
      if (["ECONNRESET", "ETIMEDOUT", "ENETDOWN", "ENETUNREACH"].includes(error.code)) {
        attempts++;
        await new Promise(res => setTimeout(res, retryDelay * attempts));
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Operation failed after ${maxRetries} attempts`);
}

async function createCollectionIfNotExists(collectionName) {
  await handleRetry(async () => {
    const db = await getDB();
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`Collection ${collectionName} created.`);
    }
  }, []);
}

async function saveData(data, collectionName) {
  if (!Array.isArray(data) && typeof data !== "object") {
    throw new TypeError("Data must be an array or an object");
  }

  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    if (Array.isArray(data)) {
      const result = await collection.insertMany(data);
      console.log(`🚀 ~ saveData ~ inserted ${result.insertedCount} items`);
      return result;
    } else {
      const result = await collection.insertOne(data);
      console.log(`🚀 ~ saveData ~ inserted document ID: ${result.insertedId}`);
      return result;
    }
  }, [data, collectionName]);
}

async function getDataMDB(collectionName) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.find().toArray();
    console.log(`🚀 ~ getDataMDB ~ fetched ${result.length} documents`);
    return result;
  }, [collectionName]);
}

async function insertDataMDB(collectionName, document) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.insertOne(document);
    console.log(`🚀 ~ insertDataMDB ~ inserted document ID: ${result.insertedId}`);
    return result.insertedId;
  }, [collectionName, document]);
}

async function getOne(collectionName, query) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.findOne(query);
    console.log("🚀 ~ getOne ~ result:", result);
    return result;
  }, [collectionName, query]);
}

async function getAllDataMDB(collectionName) {
  console.log(`🚀 ~ file: mongodbService.js:124 ~ getAllDataMDB ~ collectionName:`, collectionName)
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.find().toArray();
    console.log(`🚀 ~ getAllDataMDB ~ fetched ${result.length} documents`);
    return result;
  }, [collectionName]);
}

async function updateDataMDB(collectionName, filter, update) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.updateOne(filter, update, { upsert: true });
    console.log("🚀 ~ updateDataMDB ~ result:", result);
    return result;
  }, [collectionName, filter, update]);
}

async function deleteDataMDB(collectionName, filter) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne(filter);
    console.log(`🚀 ~ deleteDataMDB ~ deleted ${result.deletedCount} document(s)`);
    return result.deletedCount;
  }, [collectionName, filter]);
}

async function deleteMultipleDataMDB(collectionName, deleteParam) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteMany(deleteParam);
    console.log(`🚀 ~ deleteMultipleDataMDB ~ deleted ${result.deletedCount} document(s)`);
    return result.deletedCount;
  }, [collectionName, deleteParam]);
}

async function deleteAllDataMDB(collectionName) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteMany({});
    console.log(`🚀 ~ deleteAllDataMDB ~ deleted ${result.deletedCount} document(s)`);
    return result.deletedCount;
  }, [collectionName]);
}

async function connectToMongoDB() {
  try {
    await getDB();
    console.log("🚀 ~ connectToMongoDB ~ Connected to MongoDB!");

    const collectionsToCreate = [
      "collection_active_orders",
      "collection_balance",
      "collection_cmc",
      "collection_load_markets",
      "collection_strategy",
      "collection_trades",
      "collection_tickers",
      "collection_last_update",
    ];

    for (const collectionName of collectionsToCreate) {
      await createCollectionIfNotExists(collectionName);
    }
  } catch (error) {
    console.error("🚀 ~ connectToMongoDB ~ error:", error);
    throw error;
  }
}

module.exports = {
  connectToMongoDB,
  saveData,
  getDataMDB,
  getOne,
  insertDataMDB,
  getAllDataMDB,
  updateDataMDB,
  deleteDataMDB,
  deleteMultipleDataMDB,
  deleteAllDataMDB,
};
