// src/routes/index.ts
import { Router } from 'express';

import routeConverter from './routeConverter';
import routeAuth from './routeAuth';
import routeBalance from './routeBalance';
import routeCmc from './routeCmc';
import routeStrategy from './routeStrategy';
import routeOrder from './routeOrder';
import routeMarket from './routeMarket';
import routeTrade from './routeTrade';
import routeTicker from './routeTicker';
import routeTimestamp from './routeTimestamp';
import routeMachi from './routeMachi';
import routeAlarm from './routeAlarm';
import routeApi from './config/routeApi';
import routeRss from './routeRss';

const router = Router();

// Enregistrement des routes
router.use('/converter', routeConverter);
router.use('/auth', routeAuth);
router.use('/balance', routeBalance);
router.use('/cmc', routeCmc);
router.use('/strategy', routeStrategy);
router.use('/order', routeOrder);
router.use('/market', routeMarket);
router.use('/trade', routeTrade);
router.use('/ticker', routeTicker);
router.use('/timestamp', routeTimestamp);
router.use('/machi', routeMachi);
router.use('/config/api', routeApi);
router.use('/alarm', routeAlarm);
router.use('/rss', routeRss);

export default router;
