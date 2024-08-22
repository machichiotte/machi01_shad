// src/routes/balanceRoutes.js
const express = require('express');
const { getBalances, updateCurrentBalance } = require('../controllers/balanceController.js');

const router = express.Router();

router.get('/get', getBalances);
router.get('/update/:platform', updateCurrentBalance);

module.exports = router;