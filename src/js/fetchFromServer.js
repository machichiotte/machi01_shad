// src/js/fetchFromServer.js
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

/**
 * @param {string} dataType
 * @param {string} endpoint
 * @returns {Promise<any>}
 */
const fetchData = async (dataType, endpoint) => {
  try {
    const response = await fetch(endpoint)
    if (!response.ok) throw new Error(`Failed to fetch ${dataType}`)
    const responseJson = await response.json()
    return responseJson
  } catch (error) {
    console.error(`Error fetching ${dataType} data:`, error)
    throw error
  }
}

/**
 * @param {FormData} formData
 * @returns {Promise<any>}
 */
const getConvertedCsv = async (formData) => {
  console.log('getter getConvertedCsv formData', formData.get('csvFile'))
  return fetchData('converter CSV', ENDPOINTS.CONVERTER, {
    method: 'POST',
    body: formData
  })
}

// Wrapper functions for fetching different types of data
const fetchShad = () => fetchData('Shad', ENDPOINTS.SHAD)
const fetchStrategy = () => fetchData('Strategy', ENDPOINTS.STRATEGY)
const fetchTickers = () => fetchData('Tickers', ENDPOINTS.TICKERS)
const fetchCmc = () => fetchData('CMC', ENDPOINTS.CMC)
const fetchBalances = () => fetchData('Balances', ENDPOINTS.BALANCE)
const fetchTrades = () => fetchData('Trades', ENDPOINTS.TRADES)
const fetchOrders = () => fetchData('Orders', ENDPOINTS.ORDERS)

export {
  getConvertedCsv,
  fetchStrategy,
  fetchShad,
  fetchCmc,
  fetchBalances,
  fetchTrades,
  fetchOrders,
  fetchTickers
}
