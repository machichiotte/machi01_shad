// src/routes/pricesRoutes.ts
import express from 'express';
import { getPriceBtc, getPriceEth } from '../controllers/pricesController';

const router = express.Router();

router.get('/get/history/btc', getPriceBtc);
router.get('/get/history/eth', getPriceEth);

export default router;