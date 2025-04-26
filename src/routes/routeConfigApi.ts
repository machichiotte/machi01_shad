// src/routes/routeConfigApi.ts
import express from 'express'
import { getConfigApi, updateConfigApi, updateApiKey } from '@ctrl/ctrlConfigApi'

const router = express.Router()

router.get('/get', getConfigApi)
router.post('/update', updateConfigApi)
router.post('/update/key', updateApiKey)

export default router 