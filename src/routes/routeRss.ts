// src/routes/routeRss.ts
import { getRss } from '@ctrl/ctrlRss'
import express from 'express'

const router = express.Router()

router.get('/get', getRss)

export default router
