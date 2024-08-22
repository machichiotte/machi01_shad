// src/getter.js
import {
  fetchDataFromIndexedDB,
  saveTickersToIndexedDB,
  saveBalancesDataToIndexedDB,
  saveStrategyToIndexedDB,
  saveTradesDataToIndexedDB,
  saveOrdersDataToIndexedDB,
  saveCmcToIndexedDB,
  saveShadToIndexedDB
} from '../js/indexedDB'

const serverHost = import.meta.env.VITE_SERVER_HOST
const CMC = 'cmc'
const CONVERTER = 'converter'
const STRATEGY = 'strategy'
const BALANCE = 'balance'
const TRADES = 'trades'
const ORDERS = 'orders'
const LAST_UPDATE = 'lastUpdate'
const TICKERS = 'tickers'
const SHAD = 'shad'

const getConvertedCsv = async (formData) => {
  const ENDPOINT = `${serverHost}/${CONVERTER}/post`

  console.log('getter getConvertedCsv formData', formData.get('csvFile'))
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Échec de la requête au serveur')
    }

    const data = await response.json()
    console.log('getter getConvertedCsv data', data)
    return data
  } catch (err) {
    console.error("Erreur lors de la suppression de l'ordre :", err)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
  }
}

const getShad = async () => {
  const ENDPOINT = `${serverHost}/${SHAD}/get`

  try {
    const items = await fetchDataWithCache(SHAD, ENDPOINT, saveShadToIndexedDB)
    return items
  } catch (err) {
    console.error(err)
  }
}

const getStrategy = async () => {
  const ENDPOINT = `${serverHost}/${STRATEGY}/get`

  try {
    const items = await fetchDataWithCache(STRATEGY, ENDPOINT, saveStrategyToIndexedDB)
    return items
  } catch (err) {
    console.error(err)
  }
}

const getTickers = async () => {
console.log(`🚀 ~ file: getter.js:70 ~ getTickers ~ getTickers`)

  const ENDPOINT = `${serverHost}/${TICKERS}/get`

  try {
    const items = await fetchDataWithCache(TICKERS, ENDPOINT, saveTickersToIndexedDB)
    console.log(`🚀 ~ file: getter.js:74 ~ getTickers ~ items:`, items)
    return items
  } catch (err) {
    console.error(err)
  }
}

const getTickersByPlatform = async (platform) => {
  const ENDPOINT = `${serverHost}/${TICKERS}/get/${platform}`

  try {
    const items = await fetchDataWithCache(TICKERS, ENDPOINT, saveTickersToIndexedDB)
    return items
  } catch (err) {
    console.error(err)
  }
}

const getTickersBySymbolAndPlatform = async (platform, symbol) => {
  const ENDPOINT = `${serverHost}/${TICKERS}/get/${platform}`

  try {
    const items = await fetchDataWithCache(TICKERS, ENDPOINT, saveTickersToIndexedDB)

    const itemsBySymbol = items.find((item) => item.symbol === symbol)

    return itemsBySymbol
  } catch (err) {
    console.error(err)
  }
}

const getCmc = async () => {
  const ENDPOINT = `${serverHost}/${CMC}/get`

  try {
    const items = await fetchDataWithCache(CMC, ENDPOINT, saveCmcToIndexedDB)
    return items
  } catch (err) {
    console.error(err)
  }
}

const getBalances = async () => {
  const ENDPOINT = `${serverHost}/${BALANCE}/get`

  try {
    const items = await fetchDataWithCache(BALANCE, ENDPOINT, saveBalancesDataToIndexedDB)
    return items
  } catch (err) {
    console.error(err)
  }
}

const getTrades = async () => {
  const ENDPOINT = `${serverHost}/${TRADES}/get`

  try {
    const items = await fetchDataWithCache(TRADES, ENDPOINT, saveTradesDataToIndexedDB)
    return items
  } catch (err) {
    console.error(err)
  }
}

const getOrders = async () => {
  console.log('getOrders')
  const ENDPOINT = `${serverHost}/${ORDERS}/get`

  try {
    const items = await fetchDataWithCache(ORDERS, ENDPOINT, saveOrdersDataToIndexedDB)
    return items
  } catch (err) {
    console.error('Erreur lors de la récupération des ordres actifs :', err)
  }
}

const cancelOrder = async (item) => {
  try {
    const response = await fetch(
      `${serverHost}/${ORDERS}/cancel?platform=${item.platform}&oId=${item.oId}&symbol=${item.symbol}`
    )
    const data = await response.json()
    console.log('cancelOrder data.code :: ', data.code)
  } catch (err) {
    console.error("Erreur lors de la suppression de l'ordre :", err)
    // Affichez un message d'erreur à l'utilisateur si nécessaire
  }
}

// Create a generic method for fetching data
const fetchDataWithCache = async (dataType, apiEndpoint, saveToIndexedDBFunction) => {
  console.log('fetchDataWithCache datatype', dataType)
  console.log('fetchDataWithCache apiEndpoint', apiEndpoint)

  try {
    const response = await fetch(apiEndpoint)
  console.log('fetchDataWithCache response', response)

    // Check if the request was successful
    const data = await response.json()
  console.log('fetchDataWithCache data', data)


    // Save the data to IndexedDB
    // await saveToIndexedDBFunction(data)

    return data
  } catch (err) {
    console.error(`Error fetching ${dataType} data: ${err}`)
    throw err
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