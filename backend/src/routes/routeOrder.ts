// src/routes/routeOrder.ts
import express from 'express'
import {
  fetchLastOpenOrders,
  getOrders,
  updateOrders,
} from '@ctrl/ctrlOrderBalance'

import {
  deleteOrder,
  createMarketBuyOrder,
  createMarketSellOrder,
  createLimitBuyOrder,
  createLimitSellOrder,
  cancelAllOrders,
  cancelAllSellOrders,
  cancelAllBuyOrders
} from '@ctrl/ctrlOrderMarket'

const router = express.Router()

router.get('/get', getOrders)
router.get('/fetch/:platform', fetchLastOpenOrders)
router.get('/update/:platform', updateOrders)

router.post('/cancel', deleteOrder)
router.post('/market-buy-order', createMarketBuyOrder)
router.post('/market-sell-order', createMarketSellOrder)
router.post('/limit-sell-order', createLimitSellOrder)
router.post('/limit-buy-order', createLimitBuyOrder)
router.post('/cancel-all', cancelAllOrders)
router.post('/cancel/all', cancelAllOrders)
router.post('/order/cancel/all', cancelAllOrders)
router.post('/cancel-all-sell', cancelAllSellOrders)
router.post('/cancel-all-buy', cancelAllBuyOrders)

export default router
