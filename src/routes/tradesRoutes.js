// src/routes/tradesRoutes.js
const express = require('express');
const { getTrades, addTradesManually, updateTrades} = require('../controllers/tradesController.js');

const router = express.Router();

router.get('/get/trades', getTrades);
router.post('/add/trades', addTradesManually);
router.get('/update/trades/:exchangeId', updateTrades);

module.exports = router;