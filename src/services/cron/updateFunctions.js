// src/services/cron/updateFunctions.js
const { cronUtilsMarkets, cronUtilsTickers } = require("../../utils/cronUtil.js");

async function updateMarketsForExchange(exchangeId) {
  try {
    await cronUtilsMarkets(exchangeId);
    console.log(`Updated markets for ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating markets for ${exchangeId}:`, error);
    throw error;
  }
}

async function updateTickersForExchange(exchangeId) {
  try {
    await cronUtilsTickers(exchangeId);
    console.log(`Updated tickers for ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating tickers for ${exchangeId}:`, error);
    throw error;
  }
}

module.exports = {
  updateMarketsForExchange,
  updateTickersForExchange,
};
