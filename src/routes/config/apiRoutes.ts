// src/routes/config/apiRoutes.ts
import express from 'express'
import { getApiConfig, updateApiConfig, updateApiKey } from '@src/controllers/config/apiConfigController'

const router = express.Router()

router.get('/get', getApiConfig)
router.post('/update', updateApiConfig)
router.post('/update/key', updateApiKey)

export default router