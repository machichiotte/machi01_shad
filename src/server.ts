// src/server.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'http';
import { config } from '@config/index';
import apiRoutes from '@routes/index';
import { logger } from '@utils/loggerUtil'; // Importer le logger Winston
import { formatErrorForLog } from '@utils/errorUtil'; // Importer le helper

const PORT = config.port || 10000;
const moduleName = 'ExpressServer'; // Nom du module pour les logs

const app = express() as express.Application;

// Middleware CORS
app.use(cors());
app.options('*', cors()); // Gère les pré-requêtes CORS

// Configuration des middlewares
app.use(express.static('dist'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Utilisation des routes API
app.use('/api', apiRoutes);

// --- Gestionnaire d'erreurs 404 (Not Found) ---
// Doit être placé APRES vos routes API mais AVANT le gestionnaire d'erreurs général.
// Ce middleware est UTILE pour répondre proprement aux routes inexistantes.
app.use((req: Request, res: Response) => {
  const status = 404;
  const message = 'Route not found';
  // Loguer l'événement 404 comme un warning
  logger.warn(`${message}: ${req.method} ${req.originalUrl}`, {
    module: moduleName,
    status: status,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  res.status(status).json({ status: "error", message: message });
  // Pas besoin de next() ici car la réponse est envoyée.
});

// --- Gestionnaire d'erreurs général ---
// Ce middleware est ESSENTIEL pour attraper les erreurs non gérées dans vos routes/middlewares.
// Il doit être le DERNIER middleware 'use'.
app.use((error: Error, req: Request, res: Response) => {
  const status = 500; // Erreur serveur par défaut
  const message = 'Internal Server Error';

  // Loguer l'erreur avec logger.error et inclure les détails de la requête
  logger.error(`${message} on ${req.method} ${req.originalUrl}`, {
    module: moduleName,
    status: status,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    error: formatErrorForLog(error) // Utiliser le helper pour formater l'erreur
  });

  // Envoyer une réponse générique au client (surtout en production)
  res.status(status).json({
    status: "error",
    message: message,
    // Ne pas envoyer l'objet error détaillé en production
    error: process.env.NODE_ENV !== 'production' ? error.message : undefined
  });
  // next(error) n'est généralement pas nécessaire ici si c'est le dernier gestionnaire,
  // sauf si vous avez un autre gestionnaire d'erreurs spécifique après celui-ci.
});

// Fonction pour démarrer le serveur
function startServer(): Promise<Server> {
  const operation = 'startServer';
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      // Utiliser logger.info pour le démarrage réussi
      logger.info(`Server started successfully on port: ${PORT}`, { module: moduleName, operation, port: PORT });
      resolve(server);
    });
    server.on('error', (error) => {
      // Utiliser logger.error pour les erreurs de démarrage du serveur
      logger.error('Failed to start server:', { module: moduleName, operation, port: PORT, error: formatErrorForLog(error) });
      reject(error);
    });
  });
}

export { app, startServer };