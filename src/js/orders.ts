// src/orders.ts

// Get the server host from environment variables
const serverHost: string = import.meta.env.VITE_SERVER_HOST as string;

/**
 * Generic function to send an HTTP request with a JSON body
 * @param {string} url - The request URL
 * @param {Object} requestBody - The request body
 * @param {string} [method='POST'] - The HTTP method (default 'POST')
 * @returns {Promise<Object|number>} The JSON response or the response status
 */
const httpRequest = async (url: string, requestBody: Object, method: string = 'POST'): Promise<Object | number> => {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error(`Error: Request to ${url} failed with status ${response.status}`)
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const jsonResponse = await response.json();

    if (jsonResponse.error) {
      throw new Error(jsonResponse.message || 'Unknown error');
    }

    return jsonResponse.data || response.status;
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`, error)
    throw error
  }
}

/**
 * Cancels all orders for a given platform and asset
 * @param {string} platform - The platform identifier
 * @param {string} asset - The concerned asset
 * @returns {Promise<Object>} The JSON response from the API
 */
const cancelAllOrders = (platform: string, asset: string): Promise<Object> => {
  return httpRequest(`${serverHost}/orders/cancel/all`, { platform, asset })
}

/**
 * Cancels all sell orders for a given platform and asset
 * @param {string} platform - The platform identifier
 * @param {string} asset - The concerned asset
 * @returns {Promise<Object>} The JSON response from the API
 */
const cancelAllSellOrders = (platform: string, asset: string): Promise<Object> => {
  return httpRequest(`${serverHost}/orders/cancel/all/sell`, { platform, asset })
}

/**
 * Places a market sell order for a given platform and asset
 * @param {string} platform - The platform identifier
 * @param {string} asset - The concerned asset
 * @param {number} amount - The amount of the asset to sell
 * @returns {Promise<number>} The response status
 */
const marketSellOrder = (platform: string, asset: string, amount: number): Promise<number> => {
  return httpRequest(`${serverHost}/orders/market-sell-order`, { platform, asset, amount })
}

/**
 * Places multiple limit sell orders for a given platform and asset
 * @param {string} platform - The platform identifier
 * @param {string} asset - The concerned asset
 * @param {number} amount - The amount of the asset
 * @param {number} price - The price of the asset
 * @returns {Promise<number>} The response status
 */
const bunchLimitSellOrders = (platform: string, asset: string, amount: number, price: number): Promise<number> => {
  return httpRequest(`${serverHost}/orders/bunch-limit-sell-orders`, {
    platform,
    asset,
    amount,
    price
  })
}

/**
 * Places multiple limit buy orders for a given platform and asset
 * @param {string} platform - The exchange identifier
 * @param {string} asset - The concerned asset
 * @param {number} amount - The amount of the asset
 * @param {number} price - The price of the asset
 * @returns {Promise<number>} The response status
 */
const bunchLimitBuyOrders = (platform: string, asset: string, amount: number, price: number): Promise<number> => {
  return httpRequest(`${serverHost}/orders/bunch-limit-buy-orders`, {
    platform,
    asset,
    amount,
    price
  })
}

export {
  cancelAllOrders,
  cancelAllSellOrders,
  marketSellOrder,
  bunchLimitSellOrders,
  bunchLimitBuyOrders
}
