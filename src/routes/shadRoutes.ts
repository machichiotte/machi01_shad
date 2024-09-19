// src/routes/shadRoutes.ts
import express from 'express'
import { getShad, handleTrailingStopHedge } from '@controllers/shadController'

const router = express.Router()

router.get('/get', getShad)
router.post('/trailing', handleTrailingStopHedge)

export default router
