// src/routes/marketsRoutes.js
const express = require('express');
const { getMarkets, updateMarkets} = require('../controllers/marketsController.js');

const router = express.Router();

router.get('/get', getMarkets);

module.exports = router;