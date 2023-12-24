// src/routes/balanceRoutes.js
const express = require('express');
const { getBalance, updateBalance } = require('../controllers/balanceController.js');

const router = express.Router();

router.get('/get', getBalance);
router.get('/update/:exchangeId', updateBalance);

module.exports = router;