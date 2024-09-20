// src/routes/tickerRoutes.ts
import express from 'express'
import { getAllTickers, updateAllTickers } from '@src/controllers/tickerController'

const router = express.Router()

router.get('/get', getAllTickers)
router.get('/update', updateAllTickers)

export default router
