// src/routes/machiRoutes.ts
import express from 'express'
import { getMachi, handleTrailingStopHedge } from '@src/controllers/machiController'

const router = express.Router()

router.get('/get', getMachi)
router.post('/trailing', handleTrailingStopHedge)

export default router
