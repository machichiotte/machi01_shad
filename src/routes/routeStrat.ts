// src/routes/routeStrat.ts
import express from 'express'
import { getStrat, updateStrat, updateStrategyById, updateStrategyByIds } from '@src/ctrl/ctrlStrategy'

const router = express.Router()

router.get('/get', getStrat)
router.post('/update', updateStrat)
router.post('/updateById', updateStrategyById)
router.post('/updateByIds', updateStrategyByIds)

export default router
