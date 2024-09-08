const ordersService = require('../services/ordersService');
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil");

validateEnvVariables([
  "MONGODB_COLLECTION_ACTIVE_ORDERS",
  "TYPE_ACTIVE_ORDERS",
]);

/**
 * Retrieves all orders from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with orders or error.
 */
async function getOrders(req, res) {
  try {
    const orders = await ordersService.fetchDatabaseOrders();
    return res.status(200).json(orders);
  } catch (error) {
    handleErrorResponse(res, error, "getOrders");
  }
}

/**
 * Updates orders from the server for a specific platform.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with mapped data or error.
 */
async function updateOrders(req, res) {
  const { platform } = req.params;
  try {
    const mappedData = await ordersService.updateOrdersFromServer(platform);
    res.status(200).json(mappedData);
  } catch (error) {
    handleErrorResponse(res, error, "updateOrders");
  }
}

/**
 * Deletes a specific order.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with deletion result or error.
 */
async function deleteOrder(req, res) {
  const { platform, oId, symbol } = req.body;
  try {
    const data = await ordersService.deleteOrder(platform, oId, symbol);
    res.json(data);
  } catch (error) {
    handleErrorResponse(res, error, "deleteOrder");
  }
}

/**
 * Creates a market buy order.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function createMarketBuyOrder(req, res) {
  await createMarketOrder(req, res, "buy");
}

/**
 * Creates a market sell order.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function createMarketSellOrder(req, res) {
  await createMarketOrder(req, res, "sell");
}

/**
 * Creates a market order (buy or sell).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} orderType - The type of order ("buy" or "sell").
 * @returns {Object} JSON response with order creation result or error.
 */
async function createMarketOrder(req, res, orderType) {
  const { platform, asset, amount } = req.body;
  try {
    const result = await ordersService.createMarketOrder(platform, asset, amount, orderType);
    res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    handleErrorResponse(res, error, `createMarketOrder (${orderType})`);
  }
}

/**
 * Creates a limit order (buy or sell).
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {string} orderType - The type of order ("buy" or "sell").
 * @returns {Object} JSON response with order creation result or error.
 */
async function createLimitOrder(req, res, orderType) {
  const { platform, price, amount, asset } = req.body;
  try {
    const result = await ordersService.createLimitOrder(platform, asset, amount, price, orderType);
    res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    console.log(`🚀 ~ file: ordersController.js:63 ~ createLimitOrder ~ error:`, error)
    handleErrorResponse(res, error, `createLimitOrder (${orderType})`);
    res.status(500)
  }
}

/**
 * Creates a bunch of limit sell orders.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function createBunchLimitSellOrders(req, res) {
  await createLimitOrder(req, res, "sell");
}

/**
 * Creates a bunch of limit buy orders.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function createBunchLimitBuyOrders(req, res) {
  await createLimitOrder(req, res, "buy");
}

/**
 * Cancels all orders for a specific platform and asset.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with cancellation result or error.
 */
async function cancelAllOrders(req, res) {
  const { platform, asset } = req.body;
  try {
    const result = await ordersService.cancelAllOrders(platform, asset);
    res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    handleErrorResponse(res, error, "cancelAllOrders");
  }
}

/**
 * Cancels all sell orders for a specific platform and asset.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with cancellation result or error.
 */
async function cancelAllSellOrders(req, res) {
  const { platform, asset } = req.body;
  try {
    const result = await ordersService.cancelAllSellOrders(platform, asset);
    res.status(200).json(result);
  } catch (error) {
    handleErrorResponse(res, error, "cancelAllSellOrders");
  }
}

module.exports = {
  getOrders,
  updateOrders,
  deleteOrder,
  createBunchLimitSellOrders,
  createBunchLimitBuyOrders,
  cancelAllOrders,
  cancelAllSellOrders,
  createMarketBuyOrder,
  createMarketSellOrder,
};