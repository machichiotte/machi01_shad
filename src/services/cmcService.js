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
        throw new Error(`Failed to fetch CoinMarketCap data: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.data.length === 0) {
        break; // No additional data, stop the loop
      }

      allData.push(...data.data);
      start += limit;
    }
  } catch (error) {
    errorLogger.error(`Error in fetchCmcData: ${error.message}`);
    throw error;
  }

  return allData;
}

module.exports = { fetchCmcData };