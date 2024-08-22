// src/controllers/ordersController.js
const ccxt = require("ccxt");
const {
  createPlatformInstance,
  getSymbolForPlatform,
} = require("../utils/platformUtil.js");
const { handleErrorResponse } = require("../utils/errorUtil.js");
const { getData } = require("../utils/dataUtil.js");
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
    const data = await getData(collectionName);
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
 * Fetches and maps orders from the platform.
 * @param {string} platform - Identifier of the platform.
 * @returns {Promise<Object[]>} - The mapped orders.
 */
async function fetchAndMapOrders(platform) {
  try {
    const data = await fetchOpenOrdersByPlatform(platform);
    const mappedData = mapOrders(platform, data);
    console.log(
      `🚀 ~ file: ordersController.js:84 ~ fetchAndMapOrders ~ for ${platform} :`,
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
    throw error;
  }
}

/**
 * Saves mapped orders to the database.
 * @param {Object[]} mappedData - The mapped orders.
 * @param {string} platform - Identifier of the platform.
 */
async function saveMappedOrders(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  try {
    await deleteAndSaveData(mappedData, collection, platform);
    await saveLastUpdateToMongoDB(process.env.TYPE_ACTIVE_ORDERS, platform);
    console.log(`Saved mapped orders to the database for ${platform}.`, {
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
 * Updates orders from the platform and saves them to the database.
 * @param {Object} req - HTTP request object containing the platform identifier.
 * @param {Object} res - HTTP response object.
 */
async function updateOrders(req, res) {
  const { platform } = req.params;
  try {
    const mappedData = await fetchAndMapOrders(platform);
    await saveMappedOrders(mappedData, platform);
    res.status(200).json(mappedData);
    console.log(`Updated orders for ${platform}.`, {
      count: mappedData.length,
    });
  } catch (error) {
    console.log(
      `🚀 ~ file: ordersController.js:139 ~ updateOrders ~ error:`,
      error
    );
    handleErrorResponse(res, error, "updateOrders");
  }
}

/**
 * Updates orders from the server by fetching and mapping them.
 * @param {string} platform - Identifier of the platform.
 */
async function updateOrdersFromServer(platform) {
  try {
    const mappedData = await fetchAndMapOrders(platform);
    await saveMappedOrders(mappedData, platform);
    console.log(`Updated orders from server for ${platform}.`, {
      count: mappedData.length,
    });
  } catch (error) {
    errorLogger.error(`Failed to update orders from server for ${platform}.`, {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Deletes an order on the platform.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function deleteOrder(req, res) {
  const { platform, oId, symbol } = req.body;
  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.cancelOrder(
      oId,
      symbol.replace("/", "")
    );
    console.log(`Deleted order ${oId} for ${platform}.`, { symbol });
    res.json(data);
  } catch (error) {
    console.log(
      `🚀 ~ file: ordersController.js:179 ~ deleteOrder ~ error:`,
      error
    );
    handleErrorResponse(res, error, "deleteOrder");
  }
}

/**
 * Creates a limit order on the platform.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @param {string} orderType - Type of order to create ("buy" or "sell").
 */
async function createLimitOrder(req, res, orderType) {
  const { platform, price, amount } = req.body;
  try {
    const platformInstance = createPlatformInstance(platform);
    const symbol = getSymbolForPlatform(platform, req.body.asset);

    let result;
    if (orderType === "buy") {
      result = await platformInstance.createLimitBuyOrder(symbol, amount, price);
    } else if (orderType === "sell") {
      result = await platformInstance.createLimitSellOrder(symbol, amount, price);
    }

    res.status(200).json({ message: result, status: 200 });
    console.log(`Created ${orderType} limit order for ${platform}.`, {
      symbol,
      price,
      amount,
    });
  } catch (error) {
    console.log(
      `🚀 ~ file: ordersController.js:221 ~ createLimitOrder ~ error:`,
      error
    );

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
 * Cancels all orders for a given base on the platform.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function cancelAllOrders(req, res) {
  const { platform, base } = req.body;
  try {
    const platformInstance = createPlatformInstance(platform);
    const symbol = getSymbolForPlatform(platform, base);

    let result;
    if (platform === "okx") {
      result = await cancelAllOrdersForOkx(platformInstance, symbol);
    } else {
      result = await platformInstance.cancelAllOrders(symbol);
    }

    res.status(200).json({ message: result, status: 200 });
    console.log(`Cancelled all orders for ${platform}.`, { symbol });
  } catch (error) {
    console.log(
      `🚀 ~ file: ordersController.js:261 ~ cancelAllOrders ~ error:`,
      error
    );
    handleErrorResponse(res, error, "cancelAllOrders");
  }
}

/**
 * Cancels all sell orders for a given base on the platform.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 */
async function cancelAllSellOrders(req, res) {
  const { platform, base } = req.body;
  try {
    const platformInstance = createPlatformInstance(platform);
    const symbol = getSymbolForPlatform(platform, base);
    const openOrders = await platformInstance.fetchOpenOrders(symbol);
    const sellOrders = openOrders.filter((order) => order.side === "sell");

    if (sellOrders.length === 0) {
      res
        .status(200)
        .json({ message: "No open sell orders for this base", status: 200 });
      return;
    }

    for (const order of sellOrders) {
      await platformInstance.cancelOrder(order.id, order.symbol);
    }

    res.status(200).json({
      success: true,
      message: "All sell orders canceled successfully",
      status: 200,
    });
    console.log(`Cancelled all sell orders for ${platform}.`, { symbol });
  } catch (error) {
    console.log(
      `🚀 ~ file: ordersController.js:306 ~ cancelAllSellOrders ~ error:`,
      error
    );
    handleErrorResponse(res, error, "cancelAllSellOrders");
  }
}

/**
 * Cancels all orders for OKX.
 * @param {Object} platformInstance - Platform instance.
 * @param {string} symbol - The symbol to cancel orders for.
 * @returns {Promise<Object>} - The result of the cancellation.
 */
async function cancelAllOrdersForOkx(platformInstance, symbol) {
  const orders = await platformInstance.fetchOpenOrders(symbol);
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return { message: "No open orders for this symbol" };
  } else {
    return platformInstance.cancelOrders(orderIds, symbol);
  }
}

/**
 * Fetches open orders from the platform by its identifier.
 * @param {string} platform - Identifier of the platform.
 * @returns {Promise<Object[]>} - The fetched open orders.
 */
async function fetchOpenOrdersByPlatform(platform) {
  const platformInstance = createPlatformInstance(platform);
  try {
    if (platform === "binance") {
      platformInstance.options.warnOnFetchOpenOrdersWithoutSymbol = false;
    }

    if (platform === "kucoin") {
      return await fetchOpenOrdersForKucoin(platformInstance);
    } else {
      return await platformInstance.fetchOpenOrders();
    }
  } catch (error) {
    errorLogger.error(`Failed to fetch open orders for ${platform}.`, {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Fetches open orders specifically for KuCoin.
 * @param {Object} platformInstance - The platform instance.
 * @returns {Promise<Object[]>} - The fetched open orders.
 */
async function fetchOpenOrdersForKucoin(platformInstance) {
  const pageSize = 50;
  let currentPage = 1;
  let data = [];

  while (true) {
    const limit = pageSize;
    const params = { currentPage };
    const orders = await platformInstance.fetchOpenOrders(
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
