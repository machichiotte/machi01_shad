// src/routes/strategyRoutes.js
const express = require('express');
const { getStrat, updateStrat } = require('../controllers/strategyController.js');

const router = express.Router();

router.get('/get/strategy', getStrat);
router.post('/update/strategy', updateStrat);
module.exports = router;