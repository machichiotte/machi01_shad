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

const {errorLogger, infoLogger}  = require("../utils/loggerUtil.js");

/**
 * Retrieves the last recorded balance from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @returns {Object} - The last recorded orders.
 */
async function getOrders(req, res) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;

  try {
    console.log(
      `Retrieving active orders from MongoDB collection: ${collection}`
    );
    const orders = await getData(req, res, collection);

    if (orders) {
      console.log(`Retrieved ${orders.length} active orders`);
      res.json(orders); // Envoyer la réponse ici, après avoir vérifié si les commandes sont définies
    } else {
      console.error(
        "Error retrieving active orders from MongoDB: Orders is undefined"
      );
      res
        .status(500)
        .json({ error: "Error retrieving active orders from MongoDB" }); // Envoyer une réponse d'erreur si les commandes sont indéfinies
    }
  } catch (error) {
    console.error(`Error retrieving active orders from MongoDB:`, error);
    handleErrorResponse(res, error, "getOrders"); // Gérer l'erreur de manière appropriée
  }
}

/**
 * Retrieves the last recorded balance from the database.
 * @returns {Object} - The last recorded orders.
 */
async function getSavedOrders() {
  console.log("getSavedOrders");
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;

  try {
    console.log(
      `Retrieving active orders from MongoDB collection: ${collection}`
    );
    const orders = await getDataFromCollection(collection);
    console.log("Retrieved saved orders from the database.");
    infoLogger.info("Retrieved saved orders from the database.");
    return orders;
  } catch (error) {
    console.log("Failed to get saved orders", { error: error.message });

    errorLogger.error("Failed to get saved orders", { error: error.message });
    throw error;
  }
}

async function fetchAndMapOrders(exchangeId) {
  try {
    console.log(`Fetching open orders from exchange: ${exchangeId}`);
    const data = await fetchOpenOrdersByExchangeId(exchangeId);
    console.log(`Mapping fetched orders (exchange: ${exchangeId})`);
    const mappedData = mapOrders(exchangeId, data);
    return mappedData;
  } catch (error) {
    console.error(
      `Error fetching and mapping orders for exchange ${exchangeId}:`,
      error
    );
    throw error; // Re-throw the error for now
  }
}

async function saveMappedOrders(mappedData, exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;

  try {
    console.log(
      `Deleting existing orders and saving new mapped orders for exchange ${exchangeId}`
    );
    await deleteAndSaveData(mappedData, collection, exchangeId);

    console.log(
      `Saving last update timestamp for active orders (exchange: ${exchangeId}) to MongoDB`
    );
    await saveLastUpdateToMongoDB(process.env.TYPE_ACTIVE_ORDERS, exchangeId);

    console.log(
      `Successfully updated active orders for exchange ${exchangeId}`
    );
  } catch (error) {
    console.error(
      `Error saving mapped orders for exchange ${exchangeId}:`,
      error
    );
    // Consider adding more specific error handling here (e.g., retry logic, logging specific error types)
    throw error; // Re-throw the error for now
  }
}

async function updateOrders(req, res) {
  const { exchangeId } = req.params;

  console.log(`** Update Orders for Exchange: ${exchangeId} **`);

  try {
    console.log(`Fetching and mapping orders for exchange ${exchangeId}`);
    const mappedData = await fetchAndMapOrders(exchangeId);

    console.log(
      `Saving mapped order data to MongoDB for exchange ${exchangeId}`
    );
    await saveMappedOrders(mappedData, exchangeId);

    console.log(`Update successful for exchange ${exchangeId}`);
    res.status(200).json(mappedData);
  } catch (error) {
    console.error(
      `** Error updating orders for exchange ${exchangeId}: **`,
      error
    );
    handleErrorResponse(res, error, "updateOrders");
  }
}

async function updateOrdersFromServer(exchangeId) {
  console.log(`Starting update process for exchange: ${exchangeId}`);

  try {
    const mappedData = await fetchAndMapOrders(exchangeId);
    await saveMappedOrders(mappedData, exchangeId);
    console.log(`Orders updated successfully for exchange ${exchangeId}`);
  } catch (error) {
    console.error(`Error updating orders for exchange ${exchangeId}:`, error);
    // Vous pouvez choisir de gérer l'erreur ici ou de la propager pour une gestion ultérieure
    throw error;
  }
}

async function deleteOrder(req, res) {
  const { exchangeId, oId, symbol } = req.body;

  try {
    console.log(
      `Deleting order (exchangeId: ${exchangeId}, orderId: ${oId}, symbol: ${symbol})`
    );
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.cancelOrder(oId, symbol.replace("/", ""));
    console.log(
      `Order deleted successfully (exchangeId: ${exchangeId}, orderId: ${oId}, symbol: ${symbol})`
    );
    res.json(data);
  } catch (error) {
    console.error(
      `Error deleting order (exchangeId: ${exchangeId}, orderId: ${oId}, symbol: ${symbol})`,
      error
    );
    handleErrorResponse(res, error, "deleteOrder");
  }
}

async function createBunchOrders(req, res) {
  const exchangeId = req.body.exchangeId;
  const price = req.body.price;
  const amount = req.body.amount;

  try {
    const { symbol, exchangeParams } = createExchangeInstanceWithReq(
      exchangeId,
      req
    );
    const exchange = new ccxt[exchangeId](exchangeParams);

    const result = await exchange.createLimitSellOrder(symbol, amount, price);

    res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, error, "createBunchOrders");
  }
}

async function cancelAllOrders(req, res) {
  const exchangeId = req.body.exchangeId;
  let symbol, result;

  try {
    const exchange = createExchangeInstance(exchangeId);
    symbol = getSymbolForExchange(exchangeId, req.body.asset);

    switch (exchangeId) {
      case "kucoin":
      case "binance":
      case "htx":
      case "gateio":
        result = await exchange.cancelAllOrders(symbol);
        break;
      case "okx":
        result = await cancelAllOrdersForOkx(exchange, symbol);
        break;
      default:
        throw new Error(`Unsupported exchange: ${exchangeId}`);
    }

    res.status(200).json({ message: result, status: 200 });
  } catch (error) {
    handleErrorResponse(res, error, "cancelAllOrders");
  }
}

async function cancelAllSellOrders(req, res) {
  const exchangeId = req.body.exchangeId;
  let symbol;

  try {
    const exchange = createExchangeInstance(exchangeId);
    symbol = getSymbolForExchange(exchangeId, req.body.asset);

    const openOrders = await exchange.fetchOpenOrders(symbol);
    // Filtrer les ordres pour ne garder que les ordres de vente
    const sellOrders = openOrders.filter((order) => order.side === "sell");

    const sellIds = sellOrders.map((order) => order.id);

    if (sellIds.length === 0) {
      return { message: "No open sell orders for this asset" };
    } else {
      for (const order of sellOrders) {
        await exchange.cancelOrder(order.id, order.symbol);
      }

      res.status(200).json({
        success: true,
        message: "All sell orders canceled successfully",
        status: 200,
      });
    }
  } catch (error) {
    handleErrorResponse(res, error, "cancelAllSellOrders");
  }
}

async function cancelAllOrdersForOkx(exchange, symbol) {
  const orders = await exchange.fetchOpenOrders(symbol);
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return { message: "No open orders for this asset" };
  } else {
    return exchange.cancelOrders(orderIds, symbol);
  }
}

async function fetchOpenOrdersByExchangeId(exchangeId) {
  const exchange = createExchangeInstance(exchangeId);

  if (exchangeId === "binance") {
    exchange.options.warnOnFetchOpenOrdersWithoutSymbol = false;
  }

  if (exchangeId === "kucoin") {
    return fetchOpenOrdersForKucoin(exchange);
  } else {
    return exchange.fetchOpenOrders();
  }
}

async function fetchOpenOrdersForKucoin(exchange) {
  const pageSize = 50;
  let currentPage = 1;
  let data = [];

  while (true) {
    const limit = 50;
    const params = {
      currentPage: currentPage,
    };
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
  getSavedOrders,
  updateOrders,
  updateOrdersFromServer,
  deleteOrder,
  createBunchOrders,
  cancelAllOrders,
  cancelAllSellOrders,
};
