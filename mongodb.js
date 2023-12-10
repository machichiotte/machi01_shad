// mongodb.js
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
        db = await client.db(process.env.MONGODB_DATABASE);
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error(err);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function saveArrayDataMDB(data, collectionName) {
    console.log("saveArrayDataMDB enter");
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
    console.log("getAllDataMDB mongodb");
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
    console.log('entre update MDB');
    try {
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(filter, update);
        if (result.modifiedCount > 0) {
            console.log(`Updated ${result.modifiedCount} document in collection ${collectionName}`);
        } else {
            console.log(`No document was modified in collection ${collectionName}`);
        }

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
    console.log('deleteMultipleDataMDB collectionName ' + collectionName);
    console.log('deleteMultipleDataMDB deleteParam ' + deleteParam);
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