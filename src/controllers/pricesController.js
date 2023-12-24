// src/controllers/pricesController.js
async function getPriceBtc(req, res) {
    const collection = process.env.MONGODB_COLLECTION_PRICE_BTC;
    await getData(req, res, collection, 'db_machi_shad.price_btc.json');
}
async function getPriceEth(req, res) {
    const collection = process.env.MONGODB_COLLECTION_PRICE_ETH;
    await getData(req, res, collection, 'db_machi_shad.price_eth.json');
}

module.exports = { getPriceBtc,  getPriceEth};