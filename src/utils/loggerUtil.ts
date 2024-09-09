/**
 * Ce module fournit des fonctions utilitaires pour la journalisation en utilisant Winston.
 * Il configure deux journaux : un pour les messages d'erreur et un pour les messages d'information.
 * Les journaux sont écrits dans des fichiers séparés comme spécifié dans la configuration.
 */

// src/utils/loggerUtil.ts
import winston from "winston";
import config from "../services/config";

const errorLogger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: config.logFiles.error })],
});

const infoLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: config.logFiles.info })],
});

export { infoLogger, errorLogger };
