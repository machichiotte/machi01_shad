// src/utils/controllerUtil.js

/**
 * Validates required environment variables.
 * Throws an error if any required variable is missing.
 *
 * @param {string[]} requiredVariables - An array of required environment variable names.
 * @throws {Error} If any required environment variable is missing.
 */
async function validateEnvVariables(requiredVariables) {
    requiredVariables.forEach(variable => {
      if (!process.env[variable]) {
        throw new Error(`Missing environment variable: ${variable}`);
      }
    });
  }

  module.exports = {
    validateEnvVariables
  };