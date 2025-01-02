// src/routes/routeBalance.ts
import express from 'express'
import {
  getBalances,
  updateCurrentBalance
} from '@src/ctrl/ctrlBalance'

const router = express.Router()

router.get('/get', getBalances)
router.get('/update/:platform', updateCurrentBalance)

export default router
