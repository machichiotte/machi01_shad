// src/routes/routeConverter.ts
import express from 'express'
import multer from 'multer'
import { getConvertedCsv } from '@src/ctrl/ctrlConverter'
import { fileUploadMiddleware } from '@src/middlewares/fileUploadMiddleware'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/post', upload.single('csvFile'), fileUploadMiddleware, getConvertedCsv)

export default router
