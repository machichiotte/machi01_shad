const {
  createPlatformInstance,
  getSymbolForPlatform,
} = require("../utils/platformUtil.js");
const { getData } = require("../utils/dataUtil.js");
const { mapOrders } = require("./mapping.js");
const lastUpdateService = require("./lastUpdateService.js");
const mongodbService = require("./mongodbService.js");

async function fetchDatabaseOrders() {
  const collectionName = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  return await getData(collectionName);
}

async function fetchAndMapOrders(platform) {
  try {
    const data = await fetchOpenOrdersByPlatform(platform);
    const mappedData = mapOrders(platform, data);
    console.log(`Fetched and mapped orders for ${platform}:`, {
      count: mappedData.length,
    });
    return mappedData;
  } catch (error) {
    console.error(`Failed to fetch and map orders for ${platform}:`, error);
    throw error;
  }
}

const databaseService = require("./databaseService");
/**
 * Sauvegarde les données d'ordres fournies dans la base de données.
 * @param {Object[]} mappedData - Les données de marché à sauvegarder.
 * @param {string} platform - Identifiant de la plateforme.
 */
async function saveMappedOrders(mappedData, platform) {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  const updateType = process.env.TYPE_ACTIVE_ORDERS;

  await databaseService.saveDataToDatabase(
    mappedData,
    collection,
    platform,
    updateType
  );
}

async function updateOrdersFromServer(platform) {
  try {
    const mappedData = await fetchAndMapOrders(platform);
    await saveMappedOrders(mappedData, platform);
    console.log(`Updated orders from server for ${platform}.`, {
      count: mappedData.length,
    });
    return mappedData;
  } catch (error) {
    console.error(
      `Failed to update orders from server for ${platform}.`,
      error
    );
    throw error;
  }
}

async function deleteOrder(platform, oId, symbol) {
  try {
    const platformInstance = createPlatformInstance(platform);
    const data = await platformInstance.cancelOrder(
      oId,
      symbol.replace("/", "")
    );
    console.log(`Deleted order ${oId} for ${platform}.`, { symbol });
    return data;
  } catch (error) {
    console.error(`Failed to delete order for ${platform}:`, error);
    throw error;
  }
}

async function createMarketOrder(platform, asset, amount, orderType) {
  try {
    const platformInstance = createPlatformInstance(platform);
    const symbol = getSymbolForPlatform(platform, asset);
    let result;
    if (orderType === "buy") {
      result = await platformInstance.createMarketBuyOrder(symbol, amount);
    } else if (orderType === "sell") {
      result = await platformInstance.createMarketSellOrder(symbol, amount);
    }
    console.log(`Created ${orderType} market order for ${platform}.`, {
      symbol,
      amount,
    });
    return result;
  } catch (error) {
    console.error(`Failed to create market order for ${platform}:`, error);
    throw error;
  }
}

async function createLimitOrder(platform, asset, amount, price, orderType) {
  try {
    const platformInstance = createPlatformInstance(platform);
    const symbol = getSymbolForPlatform(platform, asset);
    let result;
    if (orderType === "buy") {
      result = await platformInstance.createLimitBuyOrder(
        symbol,
        amount,
        price
      );
    } else if (orderType === "sell") {
      result = await platformInstance.createLimitSellOrder(
        symbol,
        amount,
        price
      );
    }
    console.log(`Created ${orderType} limit order for ${platform}.`, {
      symbol,
      price,
      amount,
    });
    return result;
  } catch (error) {
    console.error(`Failed to create limit order for ${platform}:`, error);
    throw error;
  }
}

async function cancelAllOrders(platform, asset) {
  try {
    const platformInstance = createPlatformInstance(platform);
    const symbol = getSymbolForPlatform(platform, asset);
    let result;
    if (platform === "okx") {
      result = await cancelAllOrdersForOkx(platformInstance, symbol);
    } else {
      result = await platformInstance.cancelAllOrders(symbol);
    }
    console.log(`Cancelled all orders for ${platform}.`, { symbol });
    return result;
  } catch (error) {
    console.error(`Failed to cancel all orders for ${platform}:`, error);
    throw error;
  }
}

async function cancelAllSellOrders(platform, asset) {
  try {
    const platformInstance = createPlatformInstance(platform);
    const symbol = getSymbolForPlatform(platform, asset);
    const openOrders = await platformInstance.fetchOpenOrders(symbol);
    const sellOrders = openOrders.filter((order) => order.side === "sell");

    if (sellOrders.length === 0) {
      return { message: "No open sell orders for this asset", status: 200 };
    }

    for (const order of sellOrders) {
      await platformInstance.cancelOrder(order.id, order.symbol);
    }

    console.log(`Cancelled all sell orders for ${platform}.`, { symbol });
    return {
      success: true,
      message: "All sell orders canceled successfully",
      status: 200,
    };
  } catch (error) {
    console.error(`Failed to cancel all sell orders for ${platform}:`, error);
    throw error;
  }
}

async function cancelAllOrdersForOkx(platformInstance, symbol) {
  const orders = await platformInstance.fetchOpenOrders(symbol);
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return { message: "No open orders for this symbol" };
  } else {
    return platformInstance.cancelOrders(orderIds, symbol);
  }
}

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
    console.error(`Failed to fetch open orders for ${platform}.`, error);
    throw error;
  }
}

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
  fetchDatabaseOrders,
  updateOrdersFromServer,
  deleteOrder,
  createMarketOrder,
  createLimitOrder,
  cancelAllOrders,
  cancelAllSellOrders,
};
