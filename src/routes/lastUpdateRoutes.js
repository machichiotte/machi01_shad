// src/routes/lastUpdateRoutes.js
const express = require('express');
const { getLastUpdate, getUniqueLastUpdate} = require('../controllers/lastUpdateController.js');

const router = express.Router();

router.get('/get/lastUpdate', getLastUpdate);
router.get('/get/lastUpdate/:type/:exchangeId', getUniqueLastUpdate);

module.exports = router;