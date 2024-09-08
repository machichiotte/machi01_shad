// src/services/shadService.js
const { getData } = require("../utils/dataUtil.js");

/**
 * Fetches the most recent SHAD data from the database.
 * This function uses the getData utility to retrieve information from a MongoDB collection.
 * The collection name is specified in the environment variable MONGODB_COLLECTION_SHAD.
 * 
 * @returns {Promise<Object[]>} A promise that resolves to an array of SHAD data objects.
 */
async function fetchShadInDatabase() {
  const collectionName = process.env.MONGODB_COLLECTION_SHAD;
  return await getData(collectionName);
}

module.exports = { fetchShadInDatabase };
