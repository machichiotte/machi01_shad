// src/routes/tradeRoutes.ts
import express from 'express'
import {
  getTrades,
  insertNewTrades,
  updateTradesByPlatform,
  fetchLastTrades
} from '@ctrl/tradeController'

const router = express.Router()

router.get('/get', getTrades)
router.get('/fetch/:platform/:base', fetchLastTrades)
router.post('/add', insertNewTrades)
router.get('/update/:platform', updateTradesByPlatform)

export default router
