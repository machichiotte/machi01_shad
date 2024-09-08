// src/controllers/tickersController.js
const { handleErrorResponse } = require("../utils/errorUtil.js");
const tickersService = require('../services/tickersService.js');

/**
 * Retrieves all tickers from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function getAllTickers(req, res) {
  try {
    const data = await tickersService.fetchDatabaseTickers();
    res.json(data);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickers");
  }
}

/**
 * Retrieves all tickers for a specific platform.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} platform - The platform to retrieve tickers for.
 */
async function getAllTickersByPlatform(req, res, platform) {
  try {
    const platformTickersData = await tickersService.getAllTickersByPlatform(platform);
    res.status(200).json(platformTickersData);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersByPlatform");
  }
}

/**
 * Retrieves all tickers for a specific symbol from a specific platform.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} platform - The platform to retrieve tickers from.
 * @param {string} symbol - The symbol to filter tickers by.
 */
async function getAllTickersBySymbolFromPlatform(req, res, platform, symbol) {
  try {
    const filteredTickersData = await tickersService.getAllTickersBySymbolFromPlatform(platform, symbol);
    res.status(200).json(filteredTickersData);
  } catch (error) {
    handleErrorResponse(res, error, "getAllTickersBySymbolFromPlatform");
  }
}

/**
 * Updates all tickers in the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
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