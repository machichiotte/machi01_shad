// src/utils/loggerUtil.ts
import winston from 'winston'
import config from '@services/config'

const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: config.logFiles.error })]
})

const infoLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: config.logFiles.info })]
})

export { infoLogger, errorLogger }