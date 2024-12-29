// src/routes/index.ts
import { Router } from 'express';

import converterRoutes from './converterRoutes';
import authRoutes from './authRoutes';
import balanceRoutes from './balanceRoutes';
import cmcRoutes from './cmcRoutes';
import strategyRoutes from './strategyRoutes';
import orderRoutes from './orderRoutes';
import marketRoutes from './marketRoutes';
import tradeRoutes from './tradeRoutes';
import tickerRoutes from './tickerRoutes';
import timestampRoutes from './timestampRoutes';
import machiRoutes from './machiRoutes';
import apiRoutes from './config/apiRoutes';

const router = Router();

// Enregistrement des routes
router.use('/converter', converterRoutes);
router.use('/auth', authRoutes);
router.use('/balance', balanceRoutes);
router.use('/cmc', cmcRoutes);
router.use('/strategy', strategyRoutes);
router.use('/order', orderRoutes);
router.use('/market', marketRoutes);
router.use('/trade', tradeRoutes);
router.use('/ticker', tickerRoutes);
router.use('/timestamp', timestampRoutes);
router.use('/machi', machiRoutes);
router.use('/config/api', apiRoutes);

export default router;
