// src/store/modules/calcul/actions.js
import {
  FETCH_DATA,
  FETCH_SHAD,
  FETCH_TRADES,
  FETCH_STRATS,
  FETCH_BALANCES,
  FETCH_CMC,
  FETCH_ORDERS,
  GET_LAST_FETCH_TIMESTAMP,
  SET_SHAD,
  SET_BALANCES,
  SET_TRADES,
  SET_STRATS,
  SET_CMC,
  SET_ORDERS,
  SET_LAST_FETCH_TIMESTAMP
} from '../../storeconstants'

import {
  fetchCmc,
  fetchBalances,
  fetchTrades,
  fetchOrders,
  fetchStrategy,
  fetchShad
} from '../../../js/fetchFromServer.js'

const shouldFetchData = (lastFetch) => {
  const now = Date.now()

  return !lastFetch || now - lastFetch > 5000 // 15 secondes
}

export default {
  async [FETCH_DATA](context) {
    const now = Date.now()

    const getLastFetchTimestamp = context.getters[GET_LAST_FETCH_TIMESTAMP]
    let lastFetchBalance = null
    let lastFetchTrades = null
    let lastFetchStrats = null
    let lastFetchCmc = null
    let lastFetchOrders = null
    let lastShad = null

    // Vérifiez si le getter existe et est une fonction
    if (typeof getLastFetchTimestamp === 'function') {
      lastFetchBalance = getLastFetchTimestamp('balances')
      lastFetchTrades = getLastFetchTimestamp('trades')
      lastFetchStrats = getLastFetchTimestamp('strats')
      lastFetchCmc = getLastFetchTimestamp('cmc')
      lastFetchOrders = getLastFetchTimestamp('orders')
      lastFetchShad = getLastFetchTimestamp('shad')
    }

    try {
      if (!lastFetchBalance || shouldFetchData(lastFetchBalance)) {
        const balances = await fetchBalances()
        if (balances) {
          context.commit(SET_BALANCES, balances)
          context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'balances', timestamp: now })
        }
      }

      if (!lastFetchTrades || shouldFetchData(lastFetchTrades)) {
        const trades = await fetchTrades()
        if (trades) {
          context.commit(SET_TRADES, trades)
          context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'trades', timestamp: now })
        }
      }

      if (!lastFetchStrats || shouldFetchData(lastFetchStrats)) {
        const strats = await fetchStrategy()
        if (strats) {
          context.commit(SET_STRATS, strats)
          context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'strats', timestamp: now })
        }
      }

      if (!lastFetchCmc || shouldFetchData(lastFetchCmc)) {
        const cmc = await fetchCmc()
        if (cmc) {
          context.commit(SET_CMC, cmc)
          context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'cmc', timestamp: now })
        }
      }

      if (!lastFetchOrders || shouldFetchData(lastFetchOrders)) {
        const orders = await fetchOrders()
        if (orders) {
          context.commit(SET_ORDERS, orders)
          context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'orders', timestamp: now })
        }
      }

      if (!lastFetchShad || shouldFetchData(lastFetchShad)) {
        const shad = await fetchShad()
        if (shad) {
          context.commit(SET_SHAD, shad)
          context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'shad', timestamp: now })
        }
      }
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error)
    }
  },

  async [FETCH_BALANCES](context) {
    const now = Date.now()
    const getLastFetchTimestamp = context.getters[GET_LAST_FETCH_TIMESTAMP]
    let lastFetch = null

    // Vérifiez si le getter existe et est une fonction
    if (typeof getLastFetchTimestamp === 'function') {
      lastFetch = getLastFetchTimestamp('balances')
    }

    if (!lastFetch || shouldFetchData(lastFetch)) {
      try {
        const data = await fetchBalances()
        context.commit(SET_BALANCES, data)
        context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'balances', timestamp: now })
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error)
      }
    }
  },

  async [FETCH_TRADES](context) {
    const now = Date.now()
    const getLastFetchTimestamp = context.getters[GET_LAST_FETCH_TIMESTAMP]
    let lastFetch = null

    if (typeof getLastFetchTimestamp === 'function') {
      lastFetch = getLastFetchTimestamp('trades')
    }

    if (!lastFetch || shouldFetchData(lastFetch)) {
      try {
        const data = await fetchTrades()
        context.commit(SET_TRADES, data)
        context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'trades', timestamp: now })
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error)
      }
    }
  },

  async [FETCH_STRATS](context) {
    const now = Date.now()
    const getLastFetchTimestamp = context.getters[GET_LAST_FETCH_TIMESTAMP]
    let lastFetch = null

    if (typeof getLastFetchTimestamp === 'function') {
      lastFetch = getLastFetchTimestamp('strats')
    }

    if (!lastFetch || shouldFetchData(lastFetch)) {
      try {
        const data = await fetchStrategy()
        context.commit(SET_STRATS, data)
        context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'strats', timestamp: now })
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error)
      }
    }
  },

  async [FETCH_CMC](context) {
    const now = Date.now()
    const getLastFetchTimestamp = context.getters[GET_LAST_FETCH_TIMESTAMP]
    let lastFetch = null

    if (typeof getLastFetchTimestamp === 'function') {
      lastFetch = getLastFetchTimestamp('cmc')
    }

    if (!lastFetch || shouldFetchData(lastFetch)) {
      try {
        const data = await fetchCmc()
        context.commit(SET_CMC, data)
        context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'cmc', timestamp: now })
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error)
      }
    }
  },

  async [FETCH_ORDERS](context) {
    const now = Date.now()
    const getLastFetchTimestamp = context.getters[GET_LAST_FETCH_TIMESTAMP]
    let lastFetch = null

    if (typeof getLastFetchTimestamp === 'function') {
      lastFetch = getLastFetchTimestamp('orders')
    }

    if (!lastFetch || shouldFetchData(lastFetch)) {
      try {
        const data = await fetchOrders()
        context.commit(SET_ORDERS, data)
        context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'orders', timestamp: now })
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error)
      }
    }
  },

  async [FETCH_SHAD](context) {
    const now = Date.now()
    const getLastFetchTimestamp = context.getters[GET_LAST_FETCH_TIMESTAMP]
    let lastFetch = null

    if (typeof getLastFetchTimestamp === 'function') {
      lastFetch = getLastFetchTimestamp('shad')
    }

    if (!lastFetch || shouldFetchData(lastFetch)) {
      try {
        const data = await fetchShad()
        context.commit(SET_SHAD, data)
        context.commit(SET_LAST_FETCH_TIMESTAMP, { type: 'shad', timestamp: now })
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données :", error)
      }
    }
  }
}
