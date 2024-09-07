// src/services/shadService.js
const { getData } = require("../utils/dataUtil.js");

/**
 * Retrieves the latest CoinMarketCap data from the database.
 * @returns {Promise<Object[]>} - The latest SHAD data from the database.
 */
async function fetchShadInDatabase() {
  const collectionName = process.env.MONGODB_COLLECTION_SHAD;
  return await getData(collectionName);
}

module.exports = { fetchShadInDatabase };
