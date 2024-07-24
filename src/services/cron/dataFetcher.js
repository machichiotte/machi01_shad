// src/services/cron/dataFetcher.js
const {
    fetchBalancesInDatabase,
    fetchCurrentBalance,
    saveBalanceInDatabase,
  } = require("../../controllers/balanceController.js");
  const {
    fetchOrdersInDatabase,
    updateOrdersFromServer,
  } = require("../../controllers/ordersController.js");
  const {
    fetchTradesInDatabase,
    fetchLastTrades,
    saveTradesToDatabase,
    saveAllTradesToDatabase,
  } = require("../../controllers/tradesController.js");
  const {
    fetchTickersInDatabase,
    getSavedAllTickersByExchange,
  } = require("../../controllers/tickersController.js");
  const { fetchStratsInDatabase } = require("../../controllers/strategyController.js");
  const { fetchCmcInDatabase } = require("../../controllers/cmcController.js");
  
  module.exports = {
    getSavedAllTickersByExchange,

    fetchBalancesInDatabase,
    fetchCurrentBalance,
    fetchOrdersInDatabase,
    fetchTradesInDatabase,
    fetchLastTrades,
    fetchTickersInDatabase,
    fetchStratsInDatabase,
    fetchCmcInDatabase,

    updateOrdersFromServer,

    saveBalanceInDatabase,
    saveTradesToDatabase,
    saveAllTradesToDatabase,
  };
  