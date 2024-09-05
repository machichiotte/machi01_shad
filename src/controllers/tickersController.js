// src/controllers/tickersController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const tickersService = require('../services/tickersService.js');

async function getAllTickers(req, res) {
  try {
    const data = await tickersService.fetchDatabaseTickers();
    res.json(data);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickers");
  }
}

async function getAllTickersByPlatform(req, res, platform) {
  try {
    const platformTickersData = await tickersService.getAllTickersByPlatform(platform);
    res.status(200).json(platformTickersData);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersByPlatform");
  }
}

async function getAllTickersBySymbolFromPlatform(req, res, platform, symbol) {
  try {
    const filteredTickersData = await tickersService.getAllTickersBySymbolFromPlatform(platform, symbol);
    res.status(200).json(filteredTickersData);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersBySymbolFromPlatform");
  }
}

async function updateAllTickers(req, res) {
  try {
    const tickersData = await tickersService.updateAllTickers();
    res.status(200).json(tickersData);
  } catch (error) {
    handleErrorResponse(res, error, "updateAllTickers");
  }
}

module.exports = {
  getAllTickers,
  getAllTickersByPlatform,
  getAllTickersBySymbolFromPlatform,
  updateAllTickers,
};