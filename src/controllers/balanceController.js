// src/controllers/balanceController.js

const balanceService = require('../services/balanceService');
const { handleErrorResponse } = require("../utils/errorUtil");

/**
 * Retrieves the latest recorded balance from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getBalances(req, res) {
  try {
    const data = await balanceService.fetchDatabaseBalances();
    res.json(data);
  } catch (error) {
    handleErrorResponse(res, error, "getBalances");
  }
}

/**
 * Updates the current balance by fetching it from a platform and saving it to the database.
 * @param {Object} req - HTTP request object containing the platform identifier.
 * @param {Object} res - HTTP response object.
 */
async function updateCurrentBalance(req, res) {
  const platform = req.params.platform;
  try {
    const data = await balanceService.updateBalanceForPlatform(platform);
    res.status(200).json({
      status: true,
      message: "Current balance updated successfully.",
      data: data,
    });
  } catch (error) {
    handleErrorResponse(res, error, "updateCurrentBalance");
  }
}

module.exports = {
  getBalances,
  updateCurrentBalance,
};
