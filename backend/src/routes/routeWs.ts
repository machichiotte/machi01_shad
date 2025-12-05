// src/routes/routeRss.ts
import { startBinanceWs, stopBinanceWs } from '@ctrl/ctrlWs'
import express from 'express'

const router = express.Router()

router.get('/start', startBinanceWs);
router.get('/stop', stopBinanceWs);

export default router
