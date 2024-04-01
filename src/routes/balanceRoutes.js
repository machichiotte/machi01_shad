// src/routes/balanceRoutes.js
const express = require('express');
const { getLastBalance, updateCurrentBalance } = require('../controllers/balanceController.js');

const router = express.Router();

router.get('/get', getLastBalance);
router.get('/update/:exchangeId', updateCurrentBalance);

module.exports = router;