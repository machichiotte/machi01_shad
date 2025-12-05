// src/routes/index.ts
import { Router } from 'express';

import routeAlarm from './routeAlarm';
import routeAuth from './routeAuth';
import routeBalance from './routeBalance';
import routeCmc from './routeCmc';
import routeConfigApi from './routeConfigApi';
import routeConverter from './routeConverter';
import routeDashboard from './routeDashboard';
import routeMarket from './routeMarket';
import routeOrder from './routeOrder';
import routeRss from './routeRss';
import routeStrategy from './routeStrategy';
import routeTicker from './routeTicker';
import routeTimestamp from './routeTimestamp';
import routeTrade from './routeTrade';
import routeWs from './routeWs';

const router = Router();

// Enregistrement des routes
router.use('/alarm', routeAlarm);
router.use('/auth', routeAuth);
router.use('/balance', routeBalance);
router.use('/cmc', routeCmc);
router.use('/config_api', routeConfigApi);
router.use('/converter', routeConverter);
router.use('/dashboard', routeDashboard);
router.use('/market', routeMarket);
router.use('/order', routeOrder);
router.use('/rss', routeRss);
router.use('/strategy', routeStrategy);
router.use('/ticker', routeTicker);
router.use('/timestamp', routeTimestamp);
router.use('/trade', routeTrade);
router.use('/ws', routeWs);

export default router;
