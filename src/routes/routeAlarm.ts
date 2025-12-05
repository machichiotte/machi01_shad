// src/routes/routeAlarm.ts
import express from 'express'
import { setAlarm } from '@ctrl/ctrlAlarm'

const router = express.Router()

router.post('/set', setAlarm)

export default router
