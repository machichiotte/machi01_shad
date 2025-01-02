// src/routes/routeAuth.ts
import express from 'express'
import { loginUser, registerUser } from '@src/ctrl/ctrlAuth'

const router = express.Router()

router.post('/login', loginUser)
router.post('/register', registerUser)

export default router
