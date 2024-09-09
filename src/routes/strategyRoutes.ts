// src/routes/strategyRoutes.ts
import express from 'express';
import { getStrat, updateStrat } from '@controllers/strategyController';

const router = express.Router();

router.get('/get', getStrat);
router.post('/update', updateStrat);

export default router;