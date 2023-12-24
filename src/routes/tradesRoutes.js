// src/routes/tradesRoutes.js
const express = require('express');
const { getTrades, addTradesManually, updateTrades} = require('../controllers/tradesController.js');

const router = express.Router();

router.get('/get', getTrades);
router.post('/add', addTradesManually);
router.get('/update/:exchangeId', updateTrades);

module.exports = router;