/**
 * This module provides utility functions for logging using Winston.
 * It sets up two loggers: one for error messages and one for info messages.
 * The logs are written to separate files as specified in the config.
 */

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
