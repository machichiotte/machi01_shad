// src/controllers/ordersController.js
const ccxt = require("ccxt");
const {
  saveLastUpdateToMongoDB,
  handleErrorResponse,
} = require("../services/utils.js");
const {
  createExchangeInstance,
  createExchangeInstanceWithReq,
  getData,
  deleteAndSaveData,
} = require("../services/utils.js");
const { mapOrders } = require("../services/mapping.js");

async function getOrders(req, res) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  await getData(
    req,
    res,
    collection,
    "db_machi_shad.collection_active_orders.json"
  );
}

async function fetchAndMapOrders(exchangeId) {
  try {
    const data = await fetchOpenOrdersByExchangeId(exchangeId);
    return mapOrders(exchangeId, data);
  } catch (error) {
    throw error;
  }
}

async function saveMappedOrders(mappedData, exchangeId) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;

  try {
    await deleteAndSaveData(mappedData, collection, exchangeId);
    saveLastUpdateToMongoDB(process.env.TYPE_ACTIVE_ORDERS, exchangeId);
  } catch (error) {
    throw error;
  }
}

async function updateOrders(req, res) {
  const { exchangeId } = req.params;

  try {
    const mappedData = await fetchAndMapOrders(exchangeId);
    await saveMappedOrders(mappedData, exchangeId);
    res.status(200).json(mappedData);
  } catch (error) {
    handleErrorResponse(res, error, "updateOrders");
  }
}

async function deleteOrder(req, res) {
  const { exchangeId, oId, symbol } = req.body;

  try {
    const exchange = createExchangeInstance(exchangeId);
    const data = await exchange.cancelOrder(oId, symbol.replace("/", ""));
    res.json(data);
  } catch (error) {
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

async function cancelAllOrdersForOkx(exchange, symbol) {
  const orders = await exchange.fetchOpenOrders(symbol);
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return { message: "No open orders for this asset" };
  } else {
    return exchange.cancelOrders(orderIds, symbol);
  }
}

function getSymbolForExchange(exchangeId, asset) {
  switch (exchangeId) {
    case "kucoin":
      return `${asset}-USDT`;
    case "binance":
      return `${asset}USDT`;
    case "htx":
      return `${asset.toLowerCase()}usdt`;
    case "gateio":
      return `${asset.toUpperCase()}_USDT`;
    case "okx":
      return `${asset}-USDT`;
    default:
      throw new Error(`Unsupported exchange: ${exchangeId}`);
  }
}

module.exports = {
  getOrders,
  updateOrders,
  deleteOrder,
  createBunchOrders,
  cancelAllOrders,
};
