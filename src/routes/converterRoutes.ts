// src/routes/converterRoutes.ts
import express from 'express'
import multer from 'multer'
import { getConvertedCsv } from '@ctrl/converterController'
import { fileUploadMiddleware } from '@src/middlewares/fileUploadMiddleware'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/post', upload.single('csvFile'), fileUploadMiddleware, getConvertedCsv)

export default router
