const ordersService = require('../services/ordersService');
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil");

validateEnvVariables([
  "MONGODB_COLLECTION_ACTIVE_ORDERS",
  "TYPE_ACTIVE_ORDERS",
]);

async function getOrders(req, res) {
  try {
    const orders = await ordersService.fetchDatabaseOrders();
    return res.status(200).json(orders);
  } catch (error) {
    handleErrorResponse(res, error, "getOrders");
  }
}

async function updateOrders(req, res) {
  const { platform } = req.params;
  try {
    const mappedData = await ordersService.updateOrdersFromServer(platform);
    res.status(200).json(mappedData);
  } catch (error) {
    handleErrorResponse(res, error, "updateOrders");
  }
}

async function deleteOrder(req, res) {
  const { platform, oId, symbol } = req.body;
  try {
    const data = await ordersService.deleteOrder(platform, oId, symbol);
    res.json(data);
  } catch (error) {
    handleErrorResponse(res, error, "deleteOrder");
  }
}

async function createMarketBuyOrder(req, res) {
  await createMarketOrder(req, res, "buy");
}

async function createMarketSellOrder(req, res) {
  await createMarketOrder(req, res, "sell");
}

async function createMarketOrder(req, res, orderType) {
  const { platform, asset, amount } = req.body;
  try {
    const result = await ordersService.createMarketOrder(platform, asset, amount, orderType);
    res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    handleErrorResponse(res, error, `createMarketOrder (${orderType})`);
  }
}

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

async function createBunchLimitSellOrders(req, res) {
  await createLimitOrder(req, res, "sell");
}

async function createBunchLimitBuyOrders(req, res) {
  await createLimitOrder(req, res, "buy");
}

async function cancelAllOrders(req, res) {
  const { platform, asset } = req.body;
  try {
    const result = await ordersService.cancelAllOrders(platform, asset);
    res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    handleErrorResponse(res, error, "cancelAllOrders");
  }
}

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