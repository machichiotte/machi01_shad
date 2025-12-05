// src/routes/routeDashboard.ts
import express from 'express'
import { getDashboard, handleTrailingStopHedge } from '@src/ctrl/ctrlDashboard'

const router = express.Router()

router.get('/get', getDashboard)
router.post('/trailing', handleTrailingStopHedge)

export default router
