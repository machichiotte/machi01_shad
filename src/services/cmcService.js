// src/services/cmcService.js
const { getData } = require("../utils/dataUtil.js");
const lastUpdateService = require("../services/lastUpdateService.js");
const mongodbService = require("./mongodbService.js");

const fetch = require("node-fetch");

/**
 * Fetches the latest CoinMarketCap data from the CoinMarketCap API.
 * @returns {Promise<Array>} - A promise resolved with the fetched CoinMarketCap data.
 */
async function fetchCurrentCmc() {
  const API_KEY = process.env.CMC_APIKEY;
  const limit = 5000;
  const baseStart = 1;
  const convert = "USD";

  let start = baseStart;
  const allData = [];

  try {
    while (true) {
      const URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=${convert}`;

      const response = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CMC_PRO_API_KEY": API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Échec de la récupération des données CoinMarketCap: ${response.statusText}`);
      }

      const { data, status } = await response.json();

      if (data.length === 0) {
        break;
      }

      allData.push(...data);
      start += data.length; // Utiliser la longueur réelle des données reçues

      if (status.total_count <= start) {
        break; // Arrêter si nous avons atteint le nombre total de cryptomonnaies
      }
    }
  } catch (error) {
    console.error(`Erreur dans fetchCmcData: ${error.message}`);
    throw error;
  }

  return allData;
}

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 * @returns {Promise<Object[]>} - Les dernières données CMC de la base de données.
 */
async function fetchDatabaseCmc() {
  const collectionName = process.env.MONGODB_COLLECTION_CMC;
  try {
    const data = await getData(collectionName);
    console.log(`🚀 ~ file: cmcService.js ~ fetchDatabaseCmc :`, { collectionName, count: data.length });
    return data;
  } catch (error) {
    console.error(`Erreur dans fetchDatabaseCmc: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Met à jour les données CoinMarketCap dans la base de données.
 * @param {Object[]} data - Tableau de données CoinMarketCap à mettre à jour.
 * @returns {Promise<Object>} - Résultat de la mise à jour.
 */
async function updateDatabaseCmcData(data) {
  const collectionName = process.env.MONGODB_COLLECTION_CMC;
  try {
    const deleteResult = await mongodbService.deleteAllDataMDB(collectionName);
    const saveResult = await mongodbService.saveData(data, collectionName);
    await lastUpdateService.saveLastUpdateToDatabase(process.env.TYPE_CMC, "");

    console.log("Données CMC mises à jour dans la base de données", {
      deleteResult,
      saveResult,
      totalCount: data.length,
    });

    return {
      status: true,
      message: "Données CMC mises à jour avec succès",
      data: data,
      deleteResult,
      saveResult,
      totalCount: data.length,
    };
  } catch (error) {
    console.error(`Erreur dans updateDatabaseCmcData: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Met à jour les données CoinMarketCap en récupérant les dernières informations de l'API CoinMarketCap et en les sauvegardant dans la base de données.
 * @returns {Promise<Object>} - Résultat de la mise à jour.
 */
async function updateCmcData() {
  try {
    const data = await fetchCurrentCmc();
    console.log("Dernières données CMC récupérées", { count: data.length });
    return await updateDatabaseCmcData(data);
  } catch (error) {
    console.error(`Erreur dans updateCmcData: ${error.message}`, { error });
    throw error;
  }
}

module.exports = { fetchCurrentCmc, fetchDatabaseCmc, updateCmcData };