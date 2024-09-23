// src/server.ts
import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { Server } from 'http'; // Importation du type Server
import config from '@config/index';

const PORT = config.port || 10000

const app = express() as express.Application

import converterRoutes from '@routes/converterRoutes'
import authRoutes from '@routes/authRoutes'
import balanceRoutes from '@routes/balanceRoutes'
import cmcRoutes from '@routes/cmcRoutes'
import strategyRoutes from '@routes/strategyRoutes'
import ordersRoutes from '@routes/orderRoutes'
import marketsRoutes from '@routes/marketRoutes'
import tradesRoutes from '@routes/tradeRoutes'
import tickersRoutes from '@routes/tickerRoutes'
import lastUpdateRoutes from '@routes/lastUpdateRoutes'
import shadRoutes from '@routes/shadRoutes'
import { Routes } from '@typ/routes';

// Middleware CORS
app.use(cors())

// Middleware pour les requêtes `OPTIONS` pour les pré-requêtes CORS
app.options('*', cors())

// Configuration des middlewares
app.use(express.static('dist'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


const routes: Routes = {
  converter: converterRoutes,
  auth: authRoutes,
  balance: balanceRoutes,
  cmc: cmcRoutes,
  strategy: strategyRoutes,
  orders: ordersRoutes,
  market: marketsRoutes,
  trades: tradesRoutes,
  tickers: tickersRoutes,
  lastUpdate: lastUpdateRoutes,
  shad: shadRoutes
}

// Utilisation des routes avec une boucle
Object.entries(routes).forEach(([name, router]) => {
  if (router && typeof router === 'function') {
    app.use(`/api/${name}`, router)
  } else {
    console.error(`La route ${name} n'est pas une fonction middleware valide.`)
  }
})

// Middleware de gestion des erreurs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal Server Error' })
  next()
})

// Middleware de gestion des erreurs 404
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Not Found' })
  next()
})

// Fonction pour démarrer le serveur
function startServer(): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port: ${PORT}`)
      resolve(server)
    })
    server.on('error', reject)
  })
}

export { app, startServer }