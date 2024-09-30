// src/routes/index.ts
import { Router } from 'express';

import converterRoutes from './converterRoutes';
import authRoutes from './authRoutes';
import balanceRoutes from './balanceRoutes';
import cmcRoutes from './cmcRoutes';
import strategyRoutes from './strategyRoutes';
import ordersRoutes from './orderRoutes';
import marketsRoutes from './marketRoutes';
import tradesRoutes from './tradeRoutes';
import tickersRoutes from './tickerRoutes';
import timestampRoutes from './timestampRoutes';
import shadRoutes from './shadRoutes';

const router = Router();

// Enregistrement des routes
router.use('/converter', converterRoutes);
router.use('/auth', authRoutes);
router.use('/balance', balanceRoutes);
router.use('/cmc', cmcRoutes);
router.use('/strategy', strategyRoutes);
router.use('/orders', ordersRoutes);
router.use('/market', marketsRoutes);
router.use('/trades', tradesRoutes);
router.use('/tickers', tickersRoutes);
router.use('/timestamp', timestampRoutes);
router.use('/shad', shadRoutes);

export default router;
