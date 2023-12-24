// src/routes/lastUpdateRoutes.js
const express = require('express');
const { getLastUpdate, getUniqueLastUpdate} = require('../controllers/lastUpdateController.js');

const router = express.Router();

router.get('/get', getLastUpdate);
router.get('/get/:type/:exchangeId', getUniqueLastUpdate);

module.exports = router;