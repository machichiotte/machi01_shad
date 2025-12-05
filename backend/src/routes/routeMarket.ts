// src/routes/rotueMarket.ts
import express from 'express'
import { getMarkets, fetchLastMarkets } from '@ctrl/ctrlMarket'

const router = express.Router()

router.get('/get', getMarkets)
router.get('/fetch/:platform', fetchLastMarkets)

export default router
