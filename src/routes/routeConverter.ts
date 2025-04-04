// src/routes/routeConverter.ts
import express from 'express'
import multer from 'multer'
import { convertCsvFileToJson } from '@ctrl/ctrlConverter'
import { fileUploadMiddleware } from '@src/middlewares/fileUploadMiddleware'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/post', upload.single('csvFile'), fileUploadMiddleware as any, convertCsvFileToJson)

export default router
