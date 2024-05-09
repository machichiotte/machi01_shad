// src/controllers/pricesController.js
async function getPriceBtc(req, res) {
    const collection = process.env.MONGODB_COLLECTION_PRICE_BTC;
    await getData(req, res, collection);
}
async function getPriceEth(req, res) {
    const collection = process.env.MONGODB_COLLECTION_PRICE_ETH;
    await getData(req, res, collection);
}

module.exports = { getPriceBtc,  getPriceEth};