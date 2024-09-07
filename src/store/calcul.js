// src/store/calcul.js
import { defineStore } from 'pinia'

import {
  fetchCmc,
  fetchBalances,
  fetchTrades,
  fetchOrders,
  fetchStrategy,
  fetchShad
} from '../js/fetchFromServer.js'

export const useCalculStore = defineStore('calcul', {
  state: () => ({
    balances: [],
    trades: [],
    strats: [],
    orders: [],
    cmc: [],
    buyOrders: [],
    sellOrders: [],
    shad: [],
    lastFetchTimestamp: {
      trades: null,
      balances: null,
      strats: null,
      cmc: null,
      orders: null
    }
  }),

  getters: {
    getShad: (state) => state.shad,
    getBalances: (state) => state.balances,
    getTrades: (state) => state.trades,
    getStrats: (state) => state.strats,
    getCmc: (state) => state.cmc,
    getOrders: (state) => state.orders,
    getBuyOrders: (state) => state.buyOrders,
    getSellOrders: (state) => state.sellOrders,
    getLastFetchTimestamp: (state) => (type) =>
      state.lastFetchTimestamp ? state.lastFetchTimestamp[type] : null
  },

  actions: {
    async fetchData() {
      const now = Date.now()
      console.log(`🚀 ~ file: calcul.js:48 ~ fetchData ~ now:`, now)
      const fetchFunctions = {
        balances: { fetchFn: fetchBalances, setFn: this.setBalances },
        trades: { fetchFn: fetchTrades, setFn: this.setTrades },
        strats: { fetchFn: fetchStrategy, setFn: this.setStrats },
        cmc: { fetchFn: fetchCmc, setFn: this.setCmc },
        orders: { fetchFn: fetchOrders, setFn: this.setOrders },
        shad: { fetchFn: fetchShad, setFn: this.setShad }
      }

      for (const [type, { fetchFn, setFn }] of Object.entries(fetchFunctions)) {
        console.log(`🚀 ~ file: calcul.js:58 ~ fetchData ~ type:`, type)
        const lastFetch = this.getLastFetchTimestamp(type)
        console.log(`🚀 ~ file: calcul.js:60 ~ fetchData ~ lastFetch:`, lastFetch)
        if (!lastFetch || this.shouldFetchData(lastFetch)) {
          console.log(`🚀 ~ file: calcul.js:62 ~ fetchData ~ lastFetch: ififfff`)
          try {
            const data = await fetchFn()
            if (data) {
              console.log(`🚀 ~ file: calcul.js:63 ~ fetchData ~ data:`, data)
              setFn(data)
              this.setLastFetchTimestamp({ type, timestamp: now })
              console.log(`🚀 ~ file: calcul.js:71 ~ fetchData ~ this.setLastFetchTimestamp:`, {
                type,
                timestamp: now
              })
            }
          } catch (error) {
            console.error(`Error fetching ${type}:`, error)
          }
        }
      }
    },

    shouldFetchData(lastFetch) {
      const now = Date.now()
      return !lastFetch || now - lastFetch > 15000
    },

    setBalances(balances) {
      this.balances = balances
    },
    setTrades(trades) {
      this.trades = trades
    },
    setStrats(strats) {
      this.strats = strats
    },
    setCmc(cmc) {
      this.cmc = cmc
    },
    setOrders(orders) {
      this.orders = orders
      this.buyOrders = orders.filter((order) => order.side === 'buy')
      this.sellOrders = orders.filter((order) => order.side === 'sell')
    },
    setLastFetchTimestamp({ type, timestamp }) {
      if (!this.lastFetchTimestamp) {
        this.lastFetchTimestamp = {}
      }
      this.lastFetchTimestamp[type] = timestamp
    },
    setShad(shad) {
      this.shad = shad
    }
  }
})
