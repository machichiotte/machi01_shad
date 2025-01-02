// src/routes/timestampRoutes.ts
import express from 'express'
import {
  getTimestamp,
  getUniqueTimestamp,
  updateTimestampByType
} from '@ctrl/timestampController'

const router = express.Router()

router.get('/get', getTimestamp)
router.get('/get/:type/:platform', getUniqueTimestamp)
router.get('/update/:type', updateTimestampByType)

export default router
