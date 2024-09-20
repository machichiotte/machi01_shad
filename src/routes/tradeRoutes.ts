// src/routes/tradeRoutes.ts
import express from 'express'
import {
  getTrades,
  addTradesManually,
  updateTrades
} from '@src/controllers/tradeController'

const router = express.Router()

router.get('/get', getTrades)
router.post('/add', addTradesManually)
router.get('/update/:platform', updateTrades)

export default router
