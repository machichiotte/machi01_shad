import { createPlatformInstance, getSymbolForPlatform } from "@utils/platformUtil";
import { getData } from "@utils/dataUtil";
import { saveDataToDatabase } from "./databaseService";
import { mapOrders, MappedOrder } from "./mapping";
import { Order, Exchange } from "ccxt";

/**
 * Fetches orders from the database.
 * @returns {Promise<MappedOrder[]>} A promise that resolves to an array of orders.
 */
async function fetchDatabaseOrders(): Promise<MappedOrder[]> {
  const collectionName = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  return await getData(collectionName as string);
}

/**
 * Fetches and maps orders for a given platform.
 * @param {string} platform - The platform to fetch orders for.
 * @returns {Promise<MappedOrder[]>} A promise that resolves to an array of mapped orders.
 * @throws {Error} If fetching or mapping fails.
 */
async function fetchAndMapOrders(platform: string): Promise<MappedOrder[]> {
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

/**
 * Sauvegarde les données d'ordres fournies dans la base de données.
 * @param {MappedOrder[]} mappedData - Les données de marché à sauvegarder.
 * @param {string} platform - Identifiant de la plateforme.
 */
async function saveMappedOrders(platform: string, mappedData: MappedOrder[]): Promise<void> {
  const collection = process.env.MONGODB_COLLECTION_ACTIVE_ORDERS;
  const updateType = process.env.TYPE_ACTIVE_ORDERS;

  if (collection && updateType) {
    await saveDataToDatabase(
      mappedData,
      collection,
      platform,
      updateType
    );
  } else {
    throw new Error("Missing environment variables for collection or update type");
  }
}

/**
 * Updates orders from the server for a given platform.
 * @param {string} platform - The platform to update orders for.
 * @returns {Promise<Order[]>} A promise that resolves to an array of updated orders.
 * @throws {Error} If updating fails.
 */
async function updateOrdersFromServer(platform: string): Promise<MappedOrder[]> {
  try {
    const mappedData = await fetchAndMapOrders(platform);
    await saveMappedOrders(platform, mappedData);
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

/**
 * Deletes an order for a given platform.
 * @param {string} platform - The platform to delete the order from.
 * @param {string} oId - The order ID to delete.
 * @param {string} symbol - The symbol of the order.
 * @returns {Promise<any>} A promise that resolves to the result of the deletion.
 * @throws {Error} If deletion fails.
 */
async function deleteOrder(platform: string, oId: string, symbol: string): Promise<any> {
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

/**
 * Creates a market order for a given platform.
 * @param {string} platform - The platform to create the order on.
 * @param {string} asset - The asset to trade.
 * @param {number} amount - The amount to trade.
 * @param {string} orderType - The type of order ('buy' or 'sell').
 * @returns {Promise<any>} A promise that resolves to the created order.
 * @throws {Error} If order creation fails.
 */
async function createMarketOrder(platform: string, asset: string, amount: number, orderType: 'buy' | 'sell'): Promise<any> {
  createOrder(platform, asset, amount, orderType, 'market');
}

/**
 * Creates a limit order for a given platform.
 * @param {string} platform - The platform to create the order on.
 * @param {string} asset - The asset to trade.
 * @param {number} amount - The amount to trade.
 * @param {number} price - The price for the limit order.
 * @param {string} orderType - The type of order ('buy' or 'sell').
 * @returns {Promise<any>} A promise that resolves to the created order.
 * @throws {Error} If order creation fails.
 */
async function createLimitOrder(platform: string, asset: string, amount: number, orderType: 'buy' | 'sell', price: number): Promise<any> {
  createOrder(platform, asset, amount, orderType, 'limit', price);
}

/**
 * Creates an order for a given platform.
 * @param {string} platform - The platform to create the order on.
 * @param {string} asset - The asset to trade.
 * @param {number} amount - The amount to trade.
 * @param {string} orderType - The type of order ('buy' or 'sell').
 * @param {string} orderMode - The mode of order ('market' or 'limit').
 * @param {number} [price] - The price for limit orders.
 * @returns {Promise<any>} A promise that resolves to the created order.
 * @throws {Error} If order creation fails.
 */
async function createOrder(
  platform: string,
  asset: string,
  amount: number,
  orderType: 'buy' | 'sell',
  orderMode: 'market' | 'limit',
  price?: number
): Promise<any> {
  try {
    const platformInstance = createPlatformInstance(platform);
    const symbol = getSymbolForPlatform(platform, asset);

    let result;
    // Determine the type of order and mode
    if (orderMode === 'market') {
      result = orderType === 'buy'
        ? await platformInstance.createMarketBuyOrder(symbol, amount)
        : await platformInstance.createMarketSellOrder(symbol, amount);
    } else if (orderMode === 'limit') {
      if (price === undefined) {
        throw new Error('Price must be specified for limit orders.');
      }
      result = orderType === 'buy'
        ? await platformInstance.createLimitBuyOrder(symbol, amount, price)
        : await platformInstance.createLimitSellOrder(symbol, amount, price);
    }

    //todo ici recuperer le result pour trouver le price par exemple si cest en market


    console.log(`Created ${orderType} ${orderMode} order for ${platform}.`, {
      symbol,
      amount,
      price: result?.price,
    });

    return result;
  } catch (error) {
    console.error(`Failed to create ${orderType} ${orderMode} order for ${platform}:`, error);
    throw error;
  }
}


/**
 * Cancels all orders for a given platform and asset.
 * @param {string} platform - The platform to cancel orders on.
 * @param {string} asset - The asset to cancel orders for.
 * @returns {Promise<any>} A promise that resolves to the result of the cancellation.
 * @throws {Error} If cancellation fails.
 */
async function cancelAllOrders(platform: string, asset: string): Promise<any> {
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

/**
 * Cancels all sell orders for a given platform and asset.
 * @param {string} platform - The platform to cancel orders on.
 * @param {string} asset - The asset to cancel orders for.
 * @returns {Promise<any>} A promise that resolves to the result of the cancellation.
 * @throws {Error} If cancellation fails.
 */
async function cancelAllSellOrders(platform: string, asset: string): Promise<any> {
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

/**
 * Cancels all orders for OKX platform.
 * @param {PlatformInstance} platformInstance - The platform instance for OKX.
 * @param {string} symbol - The symbol to cancel orders for.
 * @returns {Promise<any>} A promise that resolves to the result of the cancellation.
 */
async function cancelAllOrdersForOkx(platformInstance: Exchange, symbol: string): Promise<any> {
  const orders = await platformInstance.fetchOpenOrders(symbol);
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return { message: "No open orders for this symbol" };
  } else {
    //todo trouver la fonction qui permet de canceler plusieurs ordres en une seule requête
    //return platformInstance.cancelOrders(orderIds, symbol);
  }
}

/**
 * Fetches open orders for a given platform.
 * @param {string} platform - The platform to fetch orders from.
 * @returns {Promise<Order[]>} A promise that resolves to an array of open orders.
 * @throws {Error} If fetching fails.
 */
async function fetchOpenOrdersByPlatform(platform: string): Promise<Order[]> {
  const platformInstance = createPlatformInstance(platform);
  try {
    if (platform === "binance" && platformInstance.options) {
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

/**
 * Fetches open orders for Kucoin platform.
 * @param {PlatformInstance} platformInstance - The platform instance for Kucoin.
 * @returns {Promise<Order[]>} A promise that resolves to an array of open orders.
 */
async function fetchOpenOrdersForKucoin(platformInstance: Exchange): Promise<Order[]> {
  const pageSize = 50;
  let currentPage = 1;
  let data: Order[] = [];

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

export {
  fetchDatabaseOrders,
  updateOrdersFromServer,
  deleteOrder,
  createMarketOrder,
  createLimitOrder,
  cancelAllOrders,
  cancelAllSellOrders,
};
