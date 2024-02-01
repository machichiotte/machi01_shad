// src/routes/lastUpdateRoutes.js
const express = require('express');
const { getLastUpdate, getUniqueLastUpdate, updateLastUpdateByType} = require('../controllers/lastUpdateController.js');

const router = express.Router();

router.get('/get', getLastUpdate);
router.get('/get/:type/:exchangeId', getUniqueLastUpdate);
router.get('/update/:type', updateLastUpdateByType);

module.exports = router;