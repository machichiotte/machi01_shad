// src/controllers/ordersController.js
const ccxt = require("ccxt");
const {
  createExchangeInstance,
  createExchangeInstanceWithReq,
  getSymbolForExchange,
} = require("../utils/exchangeUtil.js");
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData, getDataFromCollection } = require("../utils/dataUtil.js");
const {
  saveLastUpdateToMongoDB,
  deleteAndSaveData,
} = require("../utils/mongodbUtil.js");
const { mapOrders } = require("../services/mapping.js");
const { errorLogger } = require("../utils/loggerUtil.js");
const { validateEnvVariables } = require("../utils/controllerUtil");

validateEnvVariables([
  "MONGODB_COLLECTION_ACTIVE_ORDERS",
  "TYPE_ACTIVE_ORDERS",
]);

/**
 * Retrieves the last recorded orders from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function getOrders(req, res) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  try {
    const orders = await getData(collection); // getData ne prend plus req ou res en argument

    // Ensure orders is an array
    if (!Array.isArray(orders)) {
      console.log("Expected an array of orders");
      orders = [];
    }

    console.log("Retrieved orders from the database.", {
      collection,
      count: orders.length,
    });
    return res.status(200).json(orders); // Envoyer la réponse ici
  } catch (error) {
    errorLogger.error("Failed to retrieve orders.", { error: error.message });
    handleErrorResponse(res, error, "getOrders"); // Envoyer la réponse en cas d'erreur
  }
}

/**
 * Retrieves the last recorded orders from the database.
 * @returns {Promise<Object[]>} - The last recorded orders.
 */
async function fetchOrdersInDatabase() {
  const collectionName = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  try {
    const data = await getDataFromCollection(collectionName);
    console.log(
      `🚀 ~ file: ordersController.js:58 ~ fetchOrdersInDatabase ~ data:`,
      {
        collectionName,
        count: data.length,
      }
    );
    return data;
  } catch (error) {
    console.log(
      `🚀 ~ file: ordersController.js:67 ~ fetchOrdersInDatabase ~ error:`,
      error
    );
    /*errorLogger.error("Failed to fetch orders from database.", {
      error: error.message,
    });*/
    throw error;
  }
}

/**
 * Fetches and maps orders from the exchange.
 * @param {string} exchangeId - Identifier of the exchange.
 * @returns {Promise<Object[]>} - The mapped orders.
 */
async function fetchAndMapOrders(exchangeId) {
  try {
    const data = await fetchOpenOrdersByExchangeId(exchangeId);
    const mappedData = mapOrders(exchangeId, data);
    console.log(
      `🚀 ~ file: ordersController.js:84 ~ fetchAndMapOrders ~ for ${exchangeId} :`,
      {
        count: mappedData.length,
      }
    );
    return mappedData;
  } catch (error) {
    console.log(
      `🚀 ~ file: ordersController.js:89 ~ fetchAndMapOrders ~ error:`,
      error
    );
    /* errorLogger.error(`Failed to fetch and map orders for ${exchangeId}.`, {
      error: error.message,
    });*/
    throw error;
  }
}

/**
 * Saves mapped orders to the database.
 * @param {Object[]} mappedData - The mapped orders.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function saveMappedOrders(mappedData, exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  try {
    await deleteAndSaveData(mappedData, collection, exchangeId);
    await saveLastUpdateToMongoDB(process.env.TYPE_ACTIVE_ORDERS, exchangeId);
    console.log(`Saved mapped orders to the database for ${exchangeId}.`, {
      count: mappedData.length,
    });
  } catch (error) {
    errorLogger.error("Failed to save mapped orders to the database.", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Updates orders from the exchange and saves them to the database.
 * @param {Object} req - HTTP request object containing the exchange identifier.
 * @param {Object} res - HTTP response object.
 */
async function updateOrders(req, res) {
  const { exchangeId } = req.params;
  try {
    const mappedData = await fetchAndMapOrders(exchangeId);
    await saveMappedOrders(mappedData, exchangeId);
    res.status(200).json(mappedData);
    console.log(`Updated orders for ${exchangeId}.`, {
      count: mappedData.length,
    });
  } catch (error) {
    errorLogger.error(`Failed to update orders for ${exchangeId}.`, {
      error: error.message,
    });
    handleErrorResponse(res, error, "updateOrders");
  }
}

/**
 * Updates orders from the server by fetching and mapping them.
 * @param {string} exchangeId - Identifier of the exchange.
 */
async function updateOrdersFromServer(exchangeId) {
  try {
    const mappedData = await fetchAndMapOrders(exchangeId);
    await saveMappedOrders(mappedData, exchangeId);
    console.log(`Updated orders from server for ${exchangeId}.`, {
      count: mappedData.length,
    });
  } catch (error) {
    errorLogger.error(
      `Failed to update orders from server for ${exchangeId}.`,
      { error: error.message }
    );
    throw error;
  }
}

/**
 * Deletes an order on the exchange.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function deleteOrder(req, res) {
  const { exchangeId, oId, symbol } = req.body;
  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.cancelOrder(oId, symbol.replace("/", ""));
    console.log(`Deleted order ${oId} for ${exchangeId}.`, { symbol });
    res.json(data);
  } catch (error) {
    errorLogger.error("Failed to delete order.", {
      error: error.message,
      exchangeId,
      oId,
      symbol,
    });
    handleErrorResponse(res, error, "deleteOrder");
  }
}

/**
 * Creates a limit order on the exchange.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @param {string} orderType - Type of order to create ("buy" or "sell").
 */
async function createLimitOrder(req, res, orderType) {
  const { exchangeId, price, amount } = req.body;
  try {
    const { symbol, exchangeParams } = createExchangeInstanceWithReq(
      exchangeId,
      req
    );
    const exchange = new ccxt[exchangeId](exchangeParams);

    let result;
    if (orderType === "buy") {
      result = await exchange.createLimitBuyOrder(symbol, amount, price);
    } else if (orderType === "sell") {
      result = await exchange.createLimitSellOrder(symbol, amount, price);
    }

    res.status(200).json({ message: result, status: 200 });
    console.log(`Created ${orderType} limit order for ${exchangeId}.`, {
      symbol,
      price,
      amount,
    });
  } catch (error) {
    console.log(`🚀 ~ file: ordersController.js:221 ~ createLimitOrder ~ error:`, error)
    /*errorLogger.error(`Failed to create ${orderType} limit order.`, {
      error: error.message,
      exchangeId,
      symbol,
      price,
      amount,
    });*/
    
    handleErrorResponse(res, error, `createLimitOrder (${orderType})`);
  }
}

/**
 * Creates a bunch of limit sell orders.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function createBunchLimitSellOrders(req, res) {
  await createLimitOrder(req, res, "sell");
}

/**
 * Creates a bunch of limit buy orders.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function createBunchLimitBuyOrders(req, res) {
  await createLimitOrder(req, res, "buy");
}

/**
 * Cancels all orders for a given asset on the exchange.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function cancelAllOrders(req, res) {
  const { exchangeId, asset } = req.body;
  try {
    const exchange = createExchangeInstance(exchangeId);
    const symbol = getSymbolForExchange(exchangeId, asset);

    let result;
    if (exchangeId === "okx") {
      result = await cancelAllOrdersForOkx(exchange, symbol);
    } else {
      result = await exchange.cancelAllOrders(symbol);
    }

    res.status(200).json({ message: result, status: 200 });
    console.log(`Cancelled all orders for ${exchangeId}.`, { symbol });
  } catch (error) {
    errorLogger.error("Failed to cancel all orders.", {
      error: error.message,
      exchangeId,
      asset,
    });
    handleErrorResponse(res, error, "cancelAllOrders");
  }
}

/**
 * Cancels all sell orders for a given asset on the exchange.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function cancelAllSellOrders(req, res) {
  const { exchangeId, asset } = req.body;
  try {
    const exchange = createExchangeInstance(exchangeId);
    const symbol = getSymbolForExchange(exchangeId, asset);
    const openOrders = await exchange.fetchOpenOrders(symbol);
    const sellOrders = openOrders.filter((order) => order.side === "sell");

    if (sellOrders.length === 0) {
      res
        .status(200)
        .json({ message: "No open sell orders for this asset", status: 200 });
      return;
    }

    for (const order of sellOrders) {
      await exchange.cancelOrder(order.id, order.symbol);
    }

    res.status(200).json({
      success: true,
      message: "All sell orders canceled successfully",
      status: 200,
    });
    console.log(`Cancelled all sell orders for ${exchangeId}.`, { symbol });
  } catch (error) {
    errorLogger.error("Failed to cancel all sell orders.", {
      error: error.message,
      exchangeId,
      asset,
    });
    handleErrorResponse(res, error, "cancelAllSellOrders");
  }
}

/**
 * Cancels all orders for OKX.
 * @param {Object} exchange - Exchange instance.
 * @param {string} symbol - The symbol to cancel orders for.
 * @returns {Promise<Object>} - The result of the cancellation.
 */
async function cancelAllOrdersForOkx(exchange, symbol) {
  const orders = await exchange.fetchOpenOrders(symbol);
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return { message: "No open orders for this asset" };
  } else {
    return exchange.cancelOrders(orderIds, symbol);
  }
}

/**
 * Fetches open orders from the exchange by its identifier.
 * @param {string} exchangeId - Identifier of the exchange.
 * @returns {Promise<Object[]>} - The fetched open orders.
 */
async function fetchOpenOrdersByExchangeId(exchangeId) {
  const exchange = createExchangeInstance(exchangeId);
  try {
    if (exchangeId === "binance") {
      exchange.options.warnOnFetchOpenOrdersWithoutSymbol = false;
    }

    if (exchangeId === "kucoin") {
      return await fetchOpenOrdersForKucoin(exchange);
    } else {
      return await exchange.fetchOpenOrders();
    }
  } catch (error) {
    errorLogger.error(`Failed to fetch open orders for ${exchangeId}.`, {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Fetches open orders specifically for KuCoin.
 * @param {Object} exchange - The exchange instance.
 * @returns {Promise<Object[]>} - The fetched open orders.
 */
async function fetchOpenOrdersForKucoin(exchange) {
  const pageSize = 50;
  let currentPage = 1;
  let data = [];

  while (true) {
    const limit = pageSize;
    const params = { currentPage };
    const orders = await exchange.fetchOpenOrders(
      undefined,
      undefined,
      limit,
      params
    );
    data = data.concat(orders);

    if (orders.length < pageSize) {
      break;
    }

    currentPage++;
  }

  return data;
}

module.exports = {
  getOrders,
  fetchOrdersInDatabase,
  updateOrders,
  updateOrdersFromServer,
  deleteOrder,
  createBunchLimitSellOrders,
  createBunchLimitBuyOrders,
  cancelAllOrders,
  cancelAllSellOrders,
};
