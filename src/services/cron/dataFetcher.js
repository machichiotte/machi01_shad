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
    fetchBalancesInDatabase,
    fetchCurrentBalance,
    saveBalanceInDatabase,
    fetchOrdersInDatabase,
    updateOrdersFromServer,
    fetchTradesInDatabase,
    fetchLastTrades,
    saveTradesToDatabase,
    saveAllTradesToDatabase,
    fetchTickersInDatabase,
    getSavedAllTickersByExchange,
    fetchStratsInDatabase,
    fetchCmcInDatabase,
  };
  