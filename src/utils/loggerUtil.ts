// src/utils/loggerUtil.ts
import winston from 'winston';
import { config } from '@config/index';

const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: config.serverConfig.logFiles.error })
  ]
});

const infoLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: config.serverConfig.logFiles.info })
  ]
});

// Méthodes pour loguer des messages
export const logError = (message: string) => {
  errorLogger.error(message);
};

export const logInfo = (message: string) => {
  infoLogger.info(message);
};

export { infoLogger, errorLogger };