// src/orders.js

// Get the server host from environment variables
const serverHost = import.meta.env.VITE_SERVER_HOST

/**
 * Generic function to send an HTTP request with a JSON body
 * @param {string} url - The request URL
 * @param {Object} requestBody - The request body
 * @param {string} [method='POST'] - The HTTP method (default 'POST')
 * @returns {Promise<Object|number>} The JSON response or the response status
 */
const httpRequest = async (url, requestBody, method = 'POST') => {
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

    return method === 'POST' ? await response.json() : response.status
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
const cancelAllOrders = (platform, asset) => {
  return httpRequest(`${serverHost}/orders/cancel/all`, { platform, asset })
}

/**
 * Cancels all sell orders for a given platform and asset
 * @param {string} platform - The platform identifier
 * @param {string} asset - The concerned asset
 * @returns {Promise<Object>} The JSON response from the API
 */
const cancelAllSellOrders = (platform, asset) => {
  return httpRequest(`${serverHost}/orders/cancel/all/sell`, { platform, asset })
}

/**
 * Places a market sell order for a given platform and asset
 * @param {string} platform - The platform identifier
 * @param {string} asset - The concerned asset
 * @param {number} amount - The amount of the asset to sell
 * @returns {Promise<number>} The response status
 */
const marketSellOrder = (platform, asset, amount) => {
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
const bunchLimitSellOrders = (platform, asset, amount, price) => {
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
//const bunchLimitBuyOrders = (platform, asset, amount, price) => {
const bunchLimitBuyOrders = (platform, asset, amount, price) => {
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
