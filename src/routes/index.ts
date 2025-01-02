// src/routes/index.ts
import { Router } from 'express';

import converterRoutes from './routeConverter';
import authRoutes from './routeAuth';
import balanceRoutes from './routeBalance';
import cmcRoutes from './routeCmc';
import strategyRoutes from './routeStrategy';
import orderRoutes from './routeOrder';
import marketRoutes from './routeMarket';
import tradeRoutes from './routeTrade';
import tickerRoutes from './routeTicker';
import timestampRoutes from './routeTimestamp';
import machiRoutes from './routeMachi';
import apiRoutes from './config/routeApi';

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
