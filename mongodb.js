// mongodb.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectMDB() {
    try {
        await client.connect();
        db = client.db(process.env.MONGODB_DATABASE);
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error(err);
    }
}

async function saveArrayDataMDB(data, collectionName) {
    try {
        const collection = db.collection(collectionName);
        await collection.insertMany(data);
        console.log(`Data saved to MongoDB in collection ${collectionName}!`);
        return data;
    } catch (err) {
        console.error(err);
    }
}

async function saveObjectDataMDB(data, collectionName) {
    try {
        const collection = db.collection(collectionName);
        await collection.insertOne(data);
        console.log(`Data saved to MongoDB in collection ${collectionName}!`);
        return data;
    } catch (err) {
        console.error(err);
        return err;
    }
}

async function getDataMDB(collectionName) {
    try {
        const collection = db.collection(collectionName);
        const data = await collection.find().toArray();
        console.log(`Data retrieved from MongoDB in collection ${collectionName}:`, data);
        return data;
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
    console.log("getAllDataMDB mongodb");
    try {
        const collection = db.collection(collectionName);
        const documents = await collection.find().toArray();
        console.log(`Found ${documents.length} documents in collection ${collectionName}`);
        return documents;
    } catch (err) {
        console.error(err);
        return err;
    }
}

// Update a document in a collection
async function updateDataMDB(collectionName, filter, update) {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(filter, update);
        console.log(`Updated ${result.modifiedCount} document in collection ${collectionName}`);
        return result.modifiedCount;
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