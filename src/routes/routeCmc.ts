// src/routes/routeCmc.ts
import express from 'express'
import { getCmc, updateCmc } from '@ctrl/ctrlCmc'

const router = express.Router()

router.get('/get', getCmc)
router.get('/update', updateCmc)

export default router
