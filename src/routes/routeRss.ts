// src/routes/routeRss.ts
import express from 'express'
import { getRss } from '@ctrl/ctrlRss'

const router = express.Router()

router.get('/get', getRss)

export default router
