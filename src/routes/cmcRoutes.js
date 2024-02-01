// src/routes/cmcRoutes.js
const express = require('express');
const { getCmc, updateCmc } = require('../controllers/cmcController.js');

const router = express.Router();

router.get('/get', getCmc);
router.get('/update', updateCmc);
module.exports = router;