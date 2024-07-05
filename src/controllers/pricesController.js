// src/controllers/pricesController.js
async function getPriceBtc(req, res) {
    const collection = process.env.MONGODB_COLLECTION_PRICE_BTC;
    await getData(collection);
}
async function getPriceEth(req, res) {
    const collection = process.env.MONGODB_COLLECTION_PRICE_ETH;
    await getData(collection);
}

module.exports = { getPriceBtc,  getPriceEth};