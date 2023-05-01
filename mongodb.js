require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectToMongo() {
    try {
        await client.connect();
        db = client.db(process.env.MONGODB_DATABASE);
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error(err);
    }
}

async function saveDataToMongoDB(data, collectionName) {
    try {
        const collection = db.collection(collectionName);
        await collection.insertMany(data);
        console.log(`Data saved to MongoDB in collection ${collectionName}!`);
    } catch (err) {
        console.error(err);
    }
}

module.exports = { connectToMongo, saveDataToMongoDB };