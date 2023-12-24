// src/routes/cmcRoutes.js
const express = require('express');
const { getCmcData, updateCmcData } = require('../controllers/cmcController.js');

const router = express.Router();

router.get('/get/cmcData', getCmcData);
router.get('/update/cmcData', updateCmcData);
module.exports = router;