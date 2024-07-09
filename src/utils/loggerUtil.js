// src/utils/loggerUtil.js
const winston = require("winston");
const { logFiles } = require("../services/config.js");

const errorLogger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: logFiles.error })],
});

const infoLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: logFiles.info })],
});

module.exports = { infoLogger, errorLogger };
