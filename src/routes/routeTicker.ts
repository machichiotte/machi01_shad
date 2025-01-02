// src/routes/routeTicker.ts
import express from 'express'
import { getAllTickers, updateAllTickers } from '@src/ctrl/ctrlTicker'

const router = express.Router()

router.get('/get', getAllTickers)
router.get('/update', updateAllTickers)

export default router
