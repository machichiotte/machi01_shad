// src/routes/routeMachi.ts
import express from 'express'
import { getMachi, handleTrailingStopHedge } from '@ctrl/ctrlMachi'

const router = express.Router()

router.get('/get', getMachi)
router.post('/trailing', handleTrailingStopHedge)

export default router
