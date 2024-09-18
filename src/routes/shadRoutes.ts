// src/routes/shadRoutes.ts
import express from 'express'
import { getShad, handleTrailingStopHedge, handleTrailingStopHedgeAssets } from '@controllers/shadController'

const router = express.Router()

router.get('/get', getShad)
router.post('/trailing', handleTrailingStopHedge)
router.post('/trailingassets', handleTrailingStopHedgeAssets)

export default router
