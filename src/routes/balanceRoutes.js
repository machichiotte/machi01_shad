// balanceRoutes.js
const express = require('express');
const { getBalance, updateBalance } = require('../controllers/balanceController.js');

const router = express.Router();

router.get('/get/balance', getBalance);
router.get('/update/balance/:exchangeId', updateBalance);

module.exports = router;