// src/routes/cmcRoutes.js
const express = require('express');
const { getCmcData, updateCmcData } = require('../controllers/cmcController.js');

const router = express.Router();

router.get('/get', getCmcData);
router.get('/update', updateCmcData);
module.exports = router;