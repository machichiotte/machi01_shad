// src/server.ts
import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Server } from 'http';
import { config } from '@config/index';
import apiRoutes from '@routes/index';

const PORT = config.port || 10000

const app = express() as express.Application

// Middleware CORS
app.use(cors())

// Middleware pour les requêtes `OPTIONS` pour les pré-requêtes CORS
app.options('*', cors())

// Configuration des middlewares
app.use(express.static('dist'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Utilisation des routes avec un préfixe commun '/api'
app.use('/api', apiRoutes);

//TODO VERIFIER SI UTILE OU PAS
// Middleware de gestion des erreurs
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error.stack)
  res.status(500).json({ status: "error", message: 'Internal Server Error', error })
  next(error)
})

//TODO VERIFIER SI UTILE OU PAS
// Middleware de gestion des erreurs 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ status: "error", message: 'Not Found' })
  next()
})

// Fonction pour démarrer le serveur
function startServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.info(`Serveur démarré sur le port: ${PORT}`)
      resolve(server)
    })
    server.on('error', reject)
  })
}

export { app, startServer }