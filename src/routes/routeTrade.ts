// src/routes/routeTrade.ts
import express from 'express'
import {
  getTrades,
  insertNewTrades,
  updateTradesByPlatform,
  fetchLastTrades
} from '@ctrl/ctrlTrade'

const router = express.Router()

router.get('/get', getTrades)
router.get('/fetch/:platform/:base', fetchLastTrades)
router.post('/add', insertNewTrades)
router.get('/update/:platform', updateTradesByPlatform)

export default router
