// src/routes/marketRoutes.ts
import express from 'express'
import { getMarkets } from '@ctrl/marketController'

const router = express.Router()

router.get('/get', getMarkets)

export default router
