// src/controllers/swapController.js
const { getData } = require("../utils/dataUtil");

/**
 * Retrieves the last recorded trades from the database.
 * @returns {Object} - The last recorded trades.
 */
async function fetchDatabaseSwaps() {
    const collectionName = process.env.MONGODB_COLLECTION_SWAP;
    const data = await getData(collectionName);
    console.log(
      `🚀 ~ file: swapController.js:12 ~ fetchDatabaseSwaps :`,
      { collectionName, count: data.length }
    );
    return data;
  }

module.exports = {
    fetchDatabaseSwaps
}