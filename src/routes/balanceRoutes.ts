// src/routes/balanceRoutes.ts
import express from 'express'
import {
  getBalances,
  updateCurrentBalance
} from '@ctrl/balanceController'

const router = express.Router()

router.get('/get', getBalances)
router.get('/update/:platform', updateCurrentBalance)

export default router
