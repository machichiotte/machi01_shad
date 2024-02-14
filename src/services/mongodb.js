// src/services/mongodb.js
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let db;

async function connectMDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        db = client.db(process.env.MONGODB_DATABASE);
        console.log("Connected to MongoDB!");

        // Liste des collections à créer
        const collectionsToCreate = [
            'collection_active_orders',
            'collection_balance',
            'collection_cmc',
            'collection_load_markets',
            'collection_strategy',
            'collection_trades',
            'collection_tickers',
            'collection_last_update'
        ];

        // Créer les collections si elles n'existent pas
        for (const collectionName of collectionsToCreate) {
            await createCollectionIfNotExists(collectionName);
        }
    } catch (err) {
        console.error(err);
    }
}

async function createCollectionIfNotExists(collectionName) {
    try {
        const collections = await db.listCollections({ name: collectionName }).toArray();

        if (collections.length === 0) {
            await db.createCollection(collectionName);
            console.log(`Collection ${collectionName} created in MongoDB!`);
        } else {
            console.log(`Collection ${collectionName} already exists in MongoDB.`);
        }
    } catch (err) {
        console.error(err);
        return err;
    }
}

async function saveArrayDataMDB(data, collectionName) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.insertMany(data);
        console.log(`Data saved to MongoDB in collection ${collectionName}!`);
        return result;
    } catch (err) {
        console.error(err);
    }
}

async function saveObjectDataMDB(data, collectionName) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(data);
        console.log(`Data saved to MongoDB in collection ${collectionName}!`);
        return result;
    } catch (err) {
        console.error(err);
        return err;
    }
}

async function getDataMDB(collectionName) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.find().toArray();
        console.log(`Data retrieved from MongoDB in collection ${collectionName}:`, result);
        return result;
    } catch (err) {
        console.error(err);
        return err;
    }
}

// Insert a document into a collection
async function insertDataMDB(collectionName, document) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(document);
        console.log(`Inserted document with ID ${result.insertedId} into collection ${collectionName}`);
        return result.insertedId;
    } catch (err) {
        console.error(err);
        return err;
    }
}

// Get all documents from a collection
async function getAllDataMDB(collectionName) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.find().toArray();
        console.log(`Found ${result.length} documents in collection ${collectionName}`);
        return result;
    } catch (err) {
        console.error(err);
        return err;
    }
}

// Update a document in a collection
async function updateDataMDB(collectionName, filter, update) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(filter, update, { upsert: true });
        if (result.modifiedCount > 0) {
            console.log(`Updated ${result.modifiedCount} document in collection ${collectionName}`);
        } else if (result.upsertedCount > 0) {
            console.log(`Added a new document in collection ${collectionName}`);
        } else {
            console.log(`No document was modified in collection ${collectionName}`);
        }
    } catch (err) {
        console.error(err);
        return err;
    }
}

// Delete a document from a collection
async function deleteDataMDB(collectionName, filter) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.deleteOne(filter);
        console.log(`Deleted ${result.deletedCount} document from collection ${collectionName}`);
        return result.deletedCount;
    } catch (err) {
        console.error(err);
        return err;
    }
}

async function deleteMultipleDataMDB(collectionName, deleteParam) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.deleteMany(deleteParam);
        console.log(`Deleted ${result.deletedCount} documents from collection ${collectionName}`);
        return result.deletedCount;
    } catch (err) {
        console.error(err);
        return err;
    }
}

// Delete all documents from a collection
async function deleteAllDataMDB(collectionName) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from collection ${collectionName}`);
        return result.deletedCount;
    } catch (err) {
        console.error(err);
        return err;
    }
}

module.exports = { connectMDB, saveArrayDataMDB, saveObjectDataMDB, getDataMDB, insertDataMDB, getAllDataMDB, updateDataMDB, deleteDataMDB, deleteMultipleDataMDB, deleteAllDataMDB };