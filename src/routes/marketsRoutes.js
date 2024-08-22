// src/routes/marketsRoutes.js
const express = require('express');
const { getMarkets, updateMarkets} = require('../controllers/marketsController.js');

const router = express.Router();

router.get('/get', getMarkets);
router.get('/update/:platform', updateMarkets);

module.exports = router;