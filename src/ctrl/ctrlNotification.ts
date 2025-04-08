// src/ctrl/ctrlNotification.ts
import webPush from 'web-push'
import { Request, Response } from 'express'
import { handleControllerError } from '@src/utils/errorUtil'

// Clés VAPID (remplacez par les vôtres)
// const vapidKeys = {
//   publicKey: '<YOUR_PUBLIC_KEY>',
//   privateKey: '<YOUR_PRIVATE_KEY>'
// }

const vapidKeys = webPush.generateVAPIDKeys()

//console.debug('Clé VAPID publique:', vapidKeys.publicKey)
//console.debug('Clé VAPID privée:', vapidKeys.privateKey)

// Configurer web-push
webPush.setVapidDetails({
  subject: 'mailto:your-email@example.com',
  publicKey: vapidKeys.publicKey,
  privateKey: vapidKeys.privateKey
})

const subscriptions: Array<webPush.Subscription> = [] // Stockage temporaire des abonnements


// Endpoint pour enregistrer un abonnement
//router.post('/subscribe', (req, res) => {

export async function subscribe(req: Request, res: Response): Promise<void> {

  const subscription: webPush.Subscription = req.body
  if (!subscriptions.find((sub) => sub.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription)
    console.debug('Nouvel abonnement enregistré:', subscription.endpoint)
  }

  res.status(201).json({ message: 'Abonnement enregistré avec succès.' })
}

// Endpoint pour envoyer une notification
//router.post('/send', async (req, res) => {

export async function sendNotification(req: Request, res: Response): Promise<void> {

  const {
    title,
    message
  } = req.body

  const payload = JSON.stringify({
    title: title || 'Notification',
    body: message || 'Ceci est une notification push.'
  })

  try {
    const promises = subscriptions.map((sub) =>
      webPush.sendNotification(sub, payload)
    )
    await Promise.all(promises)
    res.status(200).json({ message: 'Notifications envoyées.' })
  } catch (error) {
    handleControllerError(res, error, `Erreur lors de l'envoi des notifications:`)

    res
      .status(500)
      .json({ message: "Échec de l'envoi des notifications.", error })
  }
}
