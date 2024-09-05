// src/controllers/cmcController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil.js");
const cmcService = require("../services/cmcService");

validateEnvVariables(["MONGODB_COLLECTION_CMC", "TYPE_CMC"]);

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 * @param {Object} req - Objet de requête HTTP.
 * @param {Object} res - Objet de réponse HTTP.
 */
async function getCmc(req, res) {
  try {
    const data = await cmcService.fetchDatabaseCmc();
    console.log("Données CMC récupérées", {
      collectionName: process.env.MONGODB_COLLECTION_CMC,
      count: data.length,
    });
    res.json(data);
  } catch (error) {
    errorLogger.error(`Erreur dans getCmc: ${error.message}`, { error });
    handleErrorResponse(res, error, "getCmc");
  }
}

/**
 * Met à jour les données CoinMarketCap en récupérant les dernières informations de l'API CoinMarketCap et en les sauvegardant dans la base de données.
 * @param {Object} req - Objet de requête HTTP.
 * @param {Object} res - Objet de réponse HTTP.
 */
async function updateCmc(req, res) {
  try {
    const result = await cmcService.updateCmcData();
    res.status(200).json(result);
  } catch (error) {
    errorLogger.error(`Erreur dans updateCmc: ${error.message}`, { error });
    handleErrorResponse(res, error, "updateCmc");
  }
}

module.exports = { getCmc, updateCmc };
