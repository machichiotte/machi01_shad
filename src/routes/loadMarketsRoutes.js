// src/routes/loadMarketsRoutes.js
const express = require('express');
const { getLoadMarkets, updateLoadMarkets} = require('../controllers/loadMarketsController.js');

const router = express.Router();

router.get('/get', getLoadMarkets);
router.get('/update/:exchangeId', updateLoadMarkets);

module.exports = router;