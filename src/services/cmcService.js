// src/services/cmcService.js

const fetch = require("node-fetch");
const {errorLogger}  = require("../utils/loggerUtil.js");

/**
 * Fetches the latest CoinMarketCap data from the CoinMarketCap API.
 * @returns {Promise<Array>} - A promise resolved with the fetched CoinMarketCap data.
 */
async function fetchCmcData() {
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
    errorLogger.error(`Erreur dans fetchCmcData: ${error.message}`);
    throw error;
  }

  return allData;
}

module.exports = { fetchCmcData };