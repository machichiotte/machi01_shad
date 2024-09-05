require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let mongoInstance;
let db;

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

async function getCollection(collectionName) {
  const db = await getDB();
  return db.collection(collectionName);
}

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
            timestamp: "$timestamp", // Ajouter le timestamp au groupement
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

  // Traiter chaque groupe de documents en double
  await Promise.all(
    duplicates.map(async (group) => {
      const documentsToKeep = group.documents.filter((doc) => doc.timestamp);
      const documentsToDelete = group.documents.filter(
        (doc) => !doc.timestamp || doc.date
      );

      if (documentsToKeep.length > 0) {
        // Conserver un seul document avec timestamp (le premier trouvé)
        const documentToKeep = documentsToKeep[0];

        // Supprimer les autres documents avec timestamp ou date
        await Promise.all(
          group.documents
            .filter((doc) => doc._id !== documentToKeep._id)
            .map(async (doc) => {
              // Mettre à jour le document à conserver avec `totalUSDT` si nécessaire
              if (doc.totalUSDT && !documentToKeep.totalUSDT) {
                await collectionTrades.updateOne(
                  { _id: documentToKeep._id },
                  { $set: { totalUSDT: doc.totalUSDT } }
                );
              }

              // Supprimer le document en double
              await collectionTrades.deleteOne({ _id: doc._id });
            })
        );
      }
    })
  );
}

async function handleRetry(operation, args, retryDelay = 5000, maxRetries = 5) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      return await operation(...args);
    } catch (error) {
      attempts++;
      console.warn(`Opération échouée (tentative ${attempts}/${maxRetries}): ${error.message}`);
      if (attempts === maxRetries || !["ECONNRESET", "ETIMEDOUT", "ENETDOWN", "ENETUNREACH"].includes(error.code)) {
        throw error;
      }
      await new Promise((res) => setTimeout(res, retryDelay * attempts));
    }
  }
}

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
    console.log(
      `🚀 ~ insertDataMDB ~ inserted document ID: ${result.insertedId}`
    );
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
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.find().toArray();
    //console.log(`🚀 ~ getAllDataMDB ~ fetched ${result.length} documents`);
    return result;
  }, [collectionName]);
}

async function updateDataMDB(collectionName, filter, update) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.updateOne(filter, update, { upsert: true });
    console.log(
      `🚀 ~ deleteDataMDB ~ modified ${result.modifiedCount} document(s)`
    );
    return result;
  }, [collectionName, filter, update]);
}

async function deleteDataMDB(collectionName, filter) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne(filter);
    console.log(
      `🚀 ~ deleteDataMDB ~ deleted ${result.deletedCount} document(s)`
    );
    return result.deletedCount;
  }, [collectionName, filter]);
}

async function deleteMultipleDataMDB(collectionName, deleteParam) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteMany(deleteParam);
    console.log(
      `🚀 ~ deleteMultipleDataMDB ~ deleted ${result.deletedCount} document(s)`
    );
    return result.deletedCount;
  }, [collectionName, deleteParam]);
}

async function deleteAllDataMDB(collectionName) {
  return await handleRetry(async () => {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteMany({});
    return result.deletedCount;
  }, [collectionName]);
}

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

async function updateInDatabase(collectionName, filter, update) {
  try {
    await updateDataMDB(collectionName, filter, update);
  } catch (err) {
    console.error(err);
  }
}

async function deleteAndSaveData(mapData, collection, platform) {
  if (mapData && mapData.length > 0) {
    const deleteParam = { platform };
    await deleteMultipleDataMDB(collection, deleteParam);
    await saveData(mapData, collection);
  }
}

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
