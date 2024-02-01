// src/routes/tickersRoutes.js
const express = require('express');
const { getAllTickers, updateAllTickers } = require('../controllers/tickersController.js');

const router = express.Router();

router.get('/get', getAllTickers);
router.get('/update', updateAllTickers);

module.exports = router;