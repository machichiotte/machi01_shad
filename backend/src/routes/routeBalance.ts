// src/routes/routeBalance.ts
import express from 'express'
import {
  getBalances,
  updateCurrentBalance,
  fetchLastBalances
} from '@ctrl/ctrlBalance'

const router = express.Router()

router.get('/get', getBalances)
router.get('/fetch/:platform', fetchLastBalances)
router.get('/update/:platform', updateCurrentBalance)

export default router
