// src/utils/loggerUtil.ts
import winston from 'winston';
import { config } from '@config/index';
import path from 'path'; // Pour gérer les chemins de fichiers

// Assurez-vous que le répertoire des logs existe (optionnel, mais bonne pratique)
import fs from 'fs';
const isProduction = process.env.NODE_ENV === 'production';
const OPS_LOG_DIR = '/media/machi/Data/Dev/machi-workspace/machi-projects/machi00_ops/machi01_shad/debug-logs';
let logDir = path.dirname(config.serverConfig.logFiles.info);

if (!isProduction) {
  logDir = OPS_LOG_DIR;
}

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Définir le niveau de log en fonction de l'environnement
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Format pour la console (plus lisible pour l'humain)
const consoleFormat = winston.format.combine(
  winston.format.colorize(), // Ajoute des couleurs
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Horodatage
  winston.format.errors({ stack: true }), // Affiche la stacktrace des erreurs
  winston.format.printf(({ timestamp, level, message, service, stack, ...metadata }) => {
    const serviceLabel = service ? `[${service}] ` : ''; // Ajoute un label de service si défini
    const metaString = metadata && Object.keys(metadata).length > 0 ? `\n${JSON.stringify(metadata, null, 2)}` : ''; // Metadonnées formatées

    // Gère le message et la stacktrace
    let output = `${timestamp} ${level}: ${serviceLabel}${message}`;
    if (stack) {
      // Si une stacktrace existe (via format.errors), l'ajouter
      output += `\n${stack}`;
    }
    output += metaString; // Ajoute les métadonnées supplémentaires
    return output;
  })
);

// Format pour les fichiers (JSON structuré pour l'analyse machine)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), // Inclure la stacktrace dans l'objet log
  winston.format.json() // Format JSON
);

// Création de l'instance principale du logger
const logger = winston.createLogger({
  level: level, // Niveau de log basé sur l'environnement
  format: fileFormat, // Format par défaut (sera utilisé par les transports de fichiers)
  defaultMeta: { service: 'backend-service' }, // Métadonnée par défaut (ajustez le nom du service)
  transports: [
    // Transport pour toutes les erreurs (niveau 'error') dans un fichier dédié
    new winston.transports.File({
      filename: path.join(logDir, path.basename(config.serverConfig.logFiles.error)),
      level: 'error',
      format: fileFormat, // Garder JSON pour les erreurs
    }),
    // Transport pour tous les logs (à partir du niveau 'info' ou 'debug') dans un fichier combiné
    new winston.transports.File({
      filename: path.join(logDir, path.basename(config.serverConfig.logFiles.info)),
      format: fileFormat, // JSON aussi pour le fichier combiné
    }),
  ],
  // Gestionnaires pour les exceptions non capturées et les rejets de promesses non gérés
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, path.basename(config.serverConfig.logFiles.exceptions)) }),
    new winston.transports.Console({ format: consoleFormat }) // Affiche aussi en console
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, path.basename(config.serverConfig.logFiles.rejections)) }),
    new winston.transports.Console({ format: consoleFormat }) // Affiche aussi en console
  ],
  exitOnError: false, // Winston ne quittera pas le processus sur une exception gérée
});

// Ajouter le transport console pour le développement ou selon la configuration
// Toujours ajouter la console, mais avec des niveaux différents potentiellement
logger.add(new winston.transports.Console({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Plus verbeux en dev
  format: consoleFormat, // Utiliser le format lisible pour la console
  handleExceptions: true, // Gère aussi les exceptions
  handleRejections: true, // Gère aussi les rejets
}));

// Exportation de l'instance unique du logger
export { logger };