// src/js/fetchFromServer.ts
const serverHost: string = import.meta.env.VITE_SERVER_HOST as string;
const ENDPOINTS: Record<string, string> = {
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
const fetchData = async (dataType: string, endpoint: string): Promise<any> => {
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
const getConvertedCsv = async (formData: FormData): Promise<any> => {
  console.log('getter getConvertedCsv formData', formData.get('csvFile'))
  return fetchData('converter CSV', ENDPOINTS.CONVERTER, {
    method: 'POST',
    body: formData
  })
}

// Wrapper functions for fetching different types of data
const fetchBalance = (): Promise<any> => fetchData('Balances', ENDPOINTS.BALANCE)
const fetchCmc = (): Promise<any> => fetchData('CMC', ENDPOINTS.CMC)
const fetchOrder = (): Promise<any> => fetchData('Orders', ENDPOINTS.ORDERS)
const fetchShad = (): Promise<any> => fetchData('Shad', ENDPOINTS.SHAD)
const fetchStrategy = (): Promise<any> => fetchData('Strategy', ENDPOINTS.STRATEGY)
const fetchTicker = (): Promise<any> => fetchData('Tickers', ENDPOINTS.TICKERS)
const fetchTrade = (): Promise<any> => fetchData('Trades', ENDPOINTS.TRADES)

export {
  getConvertedCsv,
  fetchStrategy,
  fetchShad,
  fetchCmc,
  fetchBalance,
  fetchTrade,
  fetchOrder,
  fetchTicker
}
