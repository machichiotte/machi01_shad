// src/routes/tickersRoutes.ts
import express from 'express';
import { getAllTickers, updateAllTickers } from '../controllers/tickersController';

const router = express.Router();

router.get('/get', getAllTickers);
router.get('/update', updateAllTickers);

export default router;