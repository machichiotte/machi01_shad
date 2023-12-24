// src/routes/converterRoutes.js
const express = require('express');
const multer = require('multer');
const { getConvertedCsv } = require('../controllers/converterController.js');
const { fileUploadMiddleware } = require('../middlewares/fileUploadMiddleware.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/post', upload.single('csvFile'), fileUploadMiddleware, getConvertedCsv);

module.exports = router;