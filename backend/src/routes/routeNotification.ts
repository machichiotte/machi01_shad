// src/routes/routeNotification.ts
import { subscribe, sendNotification } from '@ctrl/ctrlNotification'
import express from 'express'

const router = express.Router()

// Endpoint pour enregistrer un abonnement
router.post('/subscribe', subscribe)

// Endpoint pour envoyer une notification
router.post('/send', sendNotification)


export default router
