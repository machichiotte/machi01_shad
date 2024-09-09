// src/routes/marketsRoutes.ts
import express from 'express';
import { getMarkets } from '@controllers/marketsController';

const router = express.Router();

router.get('/get', getMarkets);

export default router;