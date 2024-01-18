// src/routes/tickersRoutes.js
const express = require('express');
//const { getTickersByExchange, getTickersBySymbolAndExchange, updateTickers } = require('../controllers/tickersController.js');
const { getAllTickers, updateAllTickers } = require('../controllers/tickersController.js');

const router = express.Router();

/*
router.get('/get/:exchangeId', getTickersByExchange);
router.get('/get/:exchangeId/:symbol', getTickersBySymbolAndExchange);
router.get('/update/:exchangeId', updateTickers);*/

router.get('/get', getAllTickers);
router.get('/update', updateAllTickers);

module.exports = router;