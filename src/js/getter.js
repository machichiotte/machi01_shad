// src/getter.js
const serverHost = import.meta.env.VITE_SERVER_HOST
const ENDPOINTS = {
  CMC: `${serverHost}/cmc/get`,
  CONVERTER: `${serverHost}/converter/post`,
  STRATEGY: `${serverHost}/strategy/get`,
  BALANCE: `${serverHost}/balance/get`,
  TRADES: `${serverHost}/trades/get`,
  ORDERS: `${serverHost}/orders/get`,
  TICKERS: `${serverHost}/tickers/get`,
  SHAD: `${serverHost}/shad/get`
}

// Generic function to fetch data from the API
const fetchData = async (dataType, endpoint) => {
  try {
    const response = await fetch(endpoint)
    if (!response.ok) throw new Error(`Failed to fetch ${dataType}`)
    return await response.json()
  } catch (err) {
    console.error(`Error fetching ${dataType} data:`, err)
    throw err
  }
}

// Function to post CSV data for conversion
const getConvertedCsv = async (formData) => {
  console.log('getter getConvertedCsv formData', formData.get('csvFile'))
  return fetchData('converter CSV', ENDPOINTS.CONVERTER, {
    method: 'POST',
    body: formData
  })
}

// Wrapper functions for fetching different types of data
const getShad = () => fetchData('Shad', ENDPOINTS.SHAD)
const getStrategy = () => fetchData('Strategy', ENDPOINTS.STRATEGY)
const getTickers = () => fetchData('Tickers', ENDPOINTS.TICKERS)
const getCmc = () => fetchData('CMC', ENDPOINTS.CMC)
const getBalances = () => fetchData('Balances', ENDPOINTS.BALANCE)
const getTrades = () => fetchData('Trades', ENDPOINTS.TRADES)
const getOrders = () => fetchData('Orders', ENDPOINTS.ORDERS)

// Fetch tickers by platform or symbol
const getTickersByPlatform = (platform) => fetchData('Tickers', `${ENDPOINTS.TICKERS}/${platform}`)
const getTickersBySymbolAndPlatform = async (platform, symbol) => {
  const items = await getTickersByPlatform(platform)
  return items.find((item) => item.symbol === symbol)
}

// Cancel an order
const cancelOrder = async (item) => {
  try {
    const response = await fetch(
      `${serverHost}/orders/cancel?platform=${item.platform}&oId=${item.oId}&symbol=${item.symbol}`
    )
    const data = await response.json()
    console.log('cancelOrder data.code :: ', data.code)
  } catch (err) {
    console.error("Erreur lors de la suppression de l'ordre :", err)
  }
}

export {
  getConvertedCsv,
  cancelOrder,
  getStrategy,
  getShad,
  getCmc,
  getBalances,
  getTrades,
  getOrders,
  getTickers,
  getTickersByPlatform,
  getTickersBySymbolAndPlatform
}
