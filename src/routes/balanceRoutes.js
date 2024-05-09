// src/routes/balanceRoutes.js
const express = require('express');
const { getBalance, updateCurrentBalance } = require('../controllers/balanceController.js');

const router = express.Router();

router.get('/get', getBalance);
router.get('/update/:exchangeId', updateCurrentBalance);

module.exports = router;