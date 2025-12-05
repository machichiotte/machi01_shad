// src/routes/routeTicker.ts
import express from 'express'
import { fetchLastTickers, getAllTickers, updateAllTickers } from '@ctrl/ctrlTicker'

const router = express.Router()

router.get('/get', getAllTickers)
router.get('/update', updateAllTickers)
router.get('/fetch/:platform', fetchLastTickers)

export default router
