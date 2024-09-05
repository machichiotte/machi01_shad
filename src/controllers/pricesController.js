// src/controllers/pricesController.js
const { getData } = require("../utils/dataUtil.js");

async function getPrice(req, res, collectionName) {
    const collection = process.env[collectionName];
    await getData(collection);
}

async function getPriceBtc(req, res) {
    await getPrice(req, res, 'MONGODB_COLLECTION_PRICE_BTC');
}

async function getPriceEth(req, res) {
    await getPrice(req, res, 'MONGODB_COLLECTION_PRICE_ETH');
}

module.exports = { getPriceBtc,  getPriceEth};