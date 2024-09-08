// src/controllers/tradesController.js
const tradesService = require('../services/tradesService');
const { handleErrorResponse } = require("../utils/errorUtil.js");

/**
 * Retrieves all trades from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function getTrades(req, res) {
  try {
    const trades = await tradesService.fetchDatabaseTrades();
    res.json(trades);
  } catch (error) {
    handleErrorResponse(res, error, "getTrades");
  }
}

/**
 * Updates a specific trade by its ID.
 * @param {Object} req - The request object containing the tradeId in params and updated trade data in body.
 * @param {Object} res - The response object.
 */
async function updateTradeById(req, res) {
  const { tradeId } = req.params;
  const updatedTrade = req.body;
  try {
    const result = await tradesService.updateTradeById(tradeId, updatedTrade);
    res.json(result);
  } catch (error) {
    handleErrorResponse(res, error, "updateTradeById");
  }
}

/**
 * Adds trades manually to the database.
 * @param {Object} req - The request object containing the trades data in the body.
 * @param {Object} res - The response object.
 */
async function addTradesManually(req, res) {
  const tradesData = req.body.trades_data;
  try {
    const result = await tradesService.addTradesManually(tradesData);
    res.status(result.status).json(result);
  } catch (error) {
    handleErrorResponse(res, error, "addTradesManually");
  }
}

/**
 * Updates trades for a specific platform.
 * @param {Object} req - The request object containing the platform in params.
 * @param {Object} res - The response object.
 */
async function updateTrades(req, res) {
  const { platform } = req.params;
  try {
    const result = await tradesService.updateTrades(platform);
    res.status(result.status).json(result);
  } catch (error) {
    handleErrorResponse(res, error, "updateTrades");
  }
}

/**
 * Fetches the last trades for a specific platform and symbol.
 * @param {Object} req - The request object containing the platform and symbol in params.
 * @param {Object} res - The response object.
 */
async function fetchLastTrades(req, res) {
  const { platform, symbol } = req.params;
  try {
    const trades = await tradesService.fetchLastTrades(platform, symbol);
    res.json(trades);
  } catch (error) {
    handleErrorResponse(res, error, "fetchLastTrades");
  }
}

/**
 * Saves new trades to the database.
 * @param {Object} req - The request object containing the new trades in the body.
 * @param {Object} res - The response object.
 */
async function saveTradesToDatabase(req, res) {
  const { newTrades } = req.body;
  try {
    await tradesService.saveTradesToDatabase(newTrades);
    res.status(200).json({ message: "Trades sauvegardés avec succès" });
  } catch (error) {
    handleErrorResponse(res, error, "saveTradesToDatabase");
  }
}

/**
 * Saves all new trades to the database.
 * @param {Object} req - The request object containing all new trades in the body.
 * @param {Object} res - The response object.
 */
async function saveAllTradesToDatabase(req, res) {
  const { newTrades } = req.body;
  try {
    await tradesService.saveAllTradesToDatabase(newTrades);
    res.status(200).json({ message: "Tous les trades sauvegardés avec succès" });
  } catch (error) {
    handleErrorResponse(res, error, "saveAllTradesToDatabase");
  }
}

module.exports = {
  updateTradeById,
  getTrades,
  addTradesManually,
  updateTrades,
  fetchLastTrades,
  saveTradesToDatabase,
  saveAllTradesToDatabase,
};