// src/controllers/pricesController.js
const { getData } = require("../utils/dataUtil.js");

/**
 * Retrieves price data from a specified MongoDB collection.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} collectionName - The name of the environment variable containing the MongoDB collection name.
 */
async function getPrice(req, res, collectionName) {
    const collection = process.env[collectionName];
    await getData(collection);
}

/**
 * Retrieves the price of Bitcoin.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function getPriceBtc(req, res) {
    await getPrice(req, res, 'MONGODB_COLLECTION_PRICE_BTC');
}

/**
 * Retrieves the price of Ethereum.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function getPriceEth(req, res) {
    await getPrice(req, res, 'MONGODB_COLLECTION_PRICE_ETH');
}

module.exports = { getPriceBtc, getPriceEth };