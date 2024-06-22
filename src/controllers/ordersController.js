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

const { errorLogger, infoLogger } = require("../utils/loggerUtil.js");

/**
 * Retrieves the last recorded balance from the database.
 * @param {Object} req - HTTP request object.
 * @param {Object} res - HTTP response object.
 * @returns {Object} - The last recorded orders.
 */
async function getOrders(req, res) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  let responseSent = false;

  try {
    const orders = await getData(req, null, collection);
    console.log("🚀 ~ getOrders ~ orders:", orders);

    if (orders) {
      console.log("🚀 ~ getOrders ~ orders.length:", orders.length);
      if (!responseSent) {
        res.json(orders); // Envoyer la réponse ici, après avoir vérifié si les commandes sont définies
        responseSent = true;
      }
    } else {
      if (!responseSent) {
        res
          .status(500)
          .json({ error: "Error retrieving active orders from MongoDB" }); // Envoyer une réponse d'erreur si les commandes sont indéfinies
        responseSent = true;
      }
    }
  } catch (error) {
    console.log("🚀 ~ getOrders ~ error:", error);
    if (!responseSent) {
      handleErrorResponse(res, error, "getOrders"); // Gérer l'erreur de manière appropriée
      responseSent = true;
    }
  }
}

/**
 * Retrieves the last recorded balance from the database.
 * @returns {Object} - The last recorded orders.
 */
async function getSavedOrders() {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  console.log("🚀 ~ getSavedOrders ~ collection:", collection);

  try {
    const orders = await getDataFromCollection(collection);
    console.log("🚀 ~ getSavedOrders ~ orders:", orders.length);
    return orders;
  } catch (error) {
    console.log("🚀 ~ getSavedOrders ~ error:", error);

    errorLogger.error("Failed to get saved orders", { error: error.message });
    throw error;
  }
}

async function fetchAndMapOrders(exchangeId) {
  console.log("🚀 ~ fetchAndMapOrders ~ exchangeId:", exchangeId);
  try {
    const data = await fetchOpenOrdersByExchangeId(exchangeId);
    console.log("🚀 ~ fetchAndMapOrders ~ data:", data);
    const mappedData = mapOrders(exchangeId, data);
    return mappedData;
  } catch (error) {
    console.log("🚀 ~ fetchAndMapOrders ~ error:", error);
    throw error; // Re-throw the error for now
  }
}

async function saveMappedOrders(mappedData, exchangeId) {
  console.log("🚀 ~ saveMappedOrders ~ exchangeId:", exchangeId);
  console.log("🚀 ~ saveMappedOrders ~ mappedData:", mappedData);
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  console.log("🚀 ~ saveMappedOrders ~ collection:", collection);

  try {
    console.log(
      `Deleting existing orders and saving new mapped orders for exchange ${exchangeId}`
    );
    const deleteAndSave = await deleteAndSaveData(
      mappedData,
      collection,
      exchangeId
    );
    console.log("🚀 ~ saveMappedOrders ~ deleteAndSave:", deleteAndSave);
    const saveLastUpdate = await saveLastUpdateToMongoDB(
      process.env.TYPE_ACTIVE_ORDERS,
      exchangeId
    );
    console.log("🚀 ~ saveMappedOrders ~ saveLastUpdate:", saveLastUpdate);
  } catch (error) {
    console.log("🚀 ~ saveMappedOrders ~ error:", error);
    // Consider adding more specific error handling here (e.g., retry logic, logging specific error types)
    throw error; // Re-throw the error for now
  }
}

async function updateOrders(req, res) {
  const { exchangeId } = req.params;
  console.log("🚀 ~ updateOrders ~ exchangeId:", exchangeId);

  try {
    const mappedData = await fetchAndMapOrders(exchangeId);
    console.log("🚀 ~ updateOrders ~ mappedData:", mappedData);
    const saveMapped = await saveMappedOrders(mappedData, exchangeId);
    console.log("🚀 ~ updateOrders ~ saveMapped:", saveMapped);
    res.status(200).json(mappedData);
  } catch (error) {
    console.log("🚀 ~ updateOrders ~ error:", error);
    handleErrorResponse(res, error, "updateOrders");
  }
}

async function updateOrdersFromServer(exchangeId) {
  console.log("🚀 ~ updateOrdersFromServer ~ exchangeId:", exchangeId);

  try {
    const mappedData = await fetchAndMapOrders(exchangeId);
    console.log("🚀 ~ updateOrdersFromServer ~ mappedData:", mappedData);
    const saveMapped = await saveMappedOrders(mappedData, exchangeId);
    console.log("🚀 ~ updateOrdersFromServer ~ saveMapped:", saveMapped);
  } catch (error) {
    console.log("🚀 ~ updateOrdersFromServer ~ error:", error);
    // Vous pouvez choisir de gérer l'erreur ici ou de la propager pour une gestion ultérieure
    throw error;
  }
}

async function deleteOrder(req, res) {
  const { exchangeId, oId, symbol } = req.body;
  console.log("🚀 ~ deleteOrder ~ symbol:", symbol);
  console.log("🚀 ~ deleteOrder ~ oId:", oId);
  console.log("🚀 ~ deleteOrder ~ exchangeId:", exchangeId);

  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.cancelOrder(oId, symbol.replace("/", ""));
    console.log("🚀 ~ deleteOrder ~ data:", data);
    res.json(data);
  } catch (error) {
    console.log("🚀 ~ deleteOrder ~ error:", error);
    handleErrorResponse(res, error, "deleteOrder");
  }
}
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
  } catch (error) {
    console.error(error);
    handleErrorResponse(res, error, `createLimitOrder (${orderType})`);
  }
}

async function createBunchLimitSellOrders(req, res) {
  await createLimitOrder(req, res, "sell");
}

async function createBunchLimitBuyOrders(req, res) {
  await createLimitOrder(req, res, "buy");
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
  createBunchLimitSellOrders,
  createBunchLimitBuyOrders,
  cancelAllOrders,
  cancelAllSellOrders,
};
