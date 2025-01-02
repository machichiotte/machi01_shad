// src/routes/rotueMarket.ts
import express from 'express'
import { getMarkets } from '@src/ctrl/ctrlMarket'

const router = express.Router()

router.get('/get', getMarkets)

export default router
