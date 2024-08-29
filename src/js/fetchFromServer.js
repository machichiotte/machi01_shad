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

export {
  getConvertedCsv,
  getStrategy,
  getShad,
  getCmc,
  getBalances,
  getTrades,
  getOrders,
  getTickers
}
