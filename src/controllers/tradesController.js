// src/controllers/tradesController.js
const tradesService = require('../services/tradesService');
const { handleErrorResponse } = require("../utils/errorUtil.js");

async function getTrades(req, res) {
  try {
    const trades = await tradesService.fetchDatabaseTrades();
    res.json(trades);
  } catch (error) {
    handleErrorResponse(res, error, "getTrades");
  }
}

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

async function addTradesManually(req, res) {
  const tradesData = req.body.trades_data;
  try {
    const result = await tradesService.addTradesManually(tradesData);
    res.status(result.status).json(result);
  } catch (error) {
    handleErrorResponse(res, error, "addTradesManually");
  }
}

async function updateTrades(req, res) {
  const { platform } = req.params;
  try {
    const result = await tradesService.updateTrades(platform);
    res.status(result.status).json(result);
  } catch (error) {
    handleErrorResponse(res, error, "updateTrades");
  }
}

async function fetchLastTrades(req, res) {
  const { platform, symbol } = req.params;
  try {
    const trades = await tradesService.fetchLastTrades(platform, symbol);
    res.json(trades);
  } catch (error) {
    handleErrorResponse(res, error, "fetchLastTrades");
  }
}

async function saveTradesToDatabase(req, res) {
  const { newTrades } = req.body;
  try {
    await tradesService.saveTradesToDatabase(newTrades);
    res.status(200).json({ message: "Trades sauvegardés avec succès" });
  } catch (error) {
    handleErrorResponse(res, error, "saveTradesToDatabase");
  }
}

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