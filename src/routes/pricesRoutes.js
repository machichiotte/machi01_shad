// pricesRoutes.js
const express = require('express');
const { getPriceBtc, getPriceEth} = require('../controllers/pricesController.js');

const router = express.Router();

router.get('/get/history/price/btc', getPriceBtc);
router.get('/get/history/price/eth', getPriceEth);

module.exports = router;