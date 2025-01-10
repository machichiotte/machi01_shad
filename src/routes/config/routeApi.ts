// src/routes/config/routeApi.ts
import express from 'express'
import { getApiConfig, updateApiConfig, updateApiKey } from '@ctrl/config/ctrlConfigApi'

const router = express.Router()

router.get('/get', getApiConfig)
router.post('/update', updateApiConfig)
router.post('/update/key', updateApiKey)

export default router 