// src/routes/cronTasks.js
const cron = require('node-cron');
const { cronLoadMarkets } = require('../services/utils.js');

const exchangesToUpdate = ['binance', 'kucoin', 'huobi', 'okx', 'gateio'];
const CRON_LOAD_MARKETS = '40 10 * * *';

async function updateMarketsForExchange(exchangeId) {
  try {
    await cronLoadMarkets(exchangeId);
    console.log(`updateLoadMarkets completed for ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating markets for ${exchangeId}:`, error);
  }
}

function setupCronTasks() {
  cron.schedule(CRON_LOAD_MARKETS, async () => {
    console.log('Running the cron job for updateLoadMarkets...');

    for (const exchangeId of exchangesToUpdate) {
      await updateMarketsForExchange(exchangeId);
    }
  });
}

module.exports = { setupCronTasks };
