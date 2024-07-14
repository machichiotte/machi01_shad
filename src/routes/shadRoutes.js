// src/routes/shadRoutes.js
const express = require('express');
const { getShad } = require('../controllers/shadController.js');

const router = express.Router();

router.get('/get', getShad);

module.exports = router;