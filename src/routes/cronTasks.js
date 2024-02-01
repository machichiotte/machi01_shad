// src/routes/cronTasks.js
const cron = require('node-cron');
const { cronMarkets } = require('../services/utils.js');

const exchangesToUpdate = ['binance', 'kucoin', 'htx', 'okx', 'gateio'];
const CRON_MARKETS = '08 14 * * *';

async function updateMarketsForExchange(exchangeId) {
  try {
    await cronMarkets(exchangeId);
    console.log(`updateMarkets completed for ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating markets for ${exchangeId}:`, error);
  }
}

function setupCronTasks() {
  cron.schedule(CRON_MARKETS, async () => {
    console.log('Running the cron job for updateMarkets...');

    for (const exchangeId of exchangesToUpdate) {
      await updateMarketsForExchange(exchangeId);
    }
  });
}

module.exports = { setupCronTasks };
