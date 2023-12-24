// src/routes/strategyRoutes.js
const express = require('express');
const { getStrat, updateStrat } = require('../controllers/strategyController.js');

const router = express.Router();

router.get('/get', getStrat);
router.post('/update', updateStrat);
module.exports = router;