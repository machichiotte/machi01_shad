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

/**
 * @typedef {Object} CalculState
 * @property {Array} balances
 * @property {Array} trades
 * @property {Array} strats
 * @property {Array} orders
 * @property {Array} cmc
 * @property {Array} buyOrders
 * @property {Array} sellOrders
 * @property {Array} shad
 * @property {Object} lastFetchTimestamp
 */

/**
 * @typedef {Object} CalculGetters
 * @property {function(): Array} getShad
 * @property {function(): Array} getBalances
 * @property {function(): Array} getTrades
 * @property {function(): Array} getStrats
 * @property {function(): Array} getCmc
 * @property {function(): Array} getOrders
 * @property {function(): Array} getBuyOrders
 * @property {function(): Array} getSellOrders
 * @property {function(string): (number|null)} getLastFetchTimestamp
 */

/**
 * @typedef {Object} CalculActions
 * @property {function(): Promise<void>} fetchBalances
 * @property {function(): Promise<void>} fetchTrades
 * @property {function(): Promise<void>} fetchStrats
 * @property {function(): Promise<void>} fetchCmc
 * @property {function(): Promise<void>} fetchOrders
 * @property {function(): Promise<void>} fetchShad
 * @property {function(string, function(): Promise<any>, function(any): void): Promise<void>} fetchData
 * @property {function(number): boolean} shouldFetchData
 * @property {function(Array): void} setBalances
 * @property {function(Array): void} setTrades
 * @property {function(Array): void} setStrats
 * @property {function(Array): void} setCmc
 * @property {function(Array): void} setOrders
 * @property {function(Object): void} setLastFetchTimestamp
 * @property {function(Array): void} setShad
 */

/**
 * @type {import('pinia').StoreDefinition<'calcul', CalculState, CalculGetters, CalculActions>}
 */
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
    /**
     * @returns {Promise<void>}
     */
    async fetchBalances() {
      await this.fetchData('balances', fetchBalances, this.setBalances)
    },

    /**
     * @returns {Promise<void>}
     */
    async fetchTrades() {
      await this.fetchData('trades', fetchTrades, this.setTrades)
    },

    /**
     * @returns {Promise<void>}
     */
    async fetchStrats() {
      await this.fetchData('strats', fetchStrategy, this.setStrats)
    },

    /**
     * @returns {Promise<void>}
     */
    async fetchCmc() {
      await this.fetchData('cmc', fetchCmc, this.setCmc)
    },

    /**
     * @returns {Promise<void>}
     */
    async fetchOrders() {
      await this.fetchData('orders', fetchOrders, this.setOrders)
    },

    /**
     * @returns {Promise<void>}
     */
    async fetchShad() {
      await this.fetchData('shad', fetchShad, this.setShad)
    },

    /**
     * @param {string} type
     * @param {function(): Promise<any>} fetchFn
     * @param {function(any): void} setFn
     * @returns {Promise<void>}
     */
    async fetchData(type, fetchFn, setFn) {
      const now = Date.now()
      const lastFetch = this.getLastFetchTimestamp(type)
      if (!lastFetch || this.shouldFetchData(lastFetch)) {
        try {
          const data = await fetchFn()
          if (data) {
            setFn(data)
            this.setLastFetchTimestamp({ type, timestamp: now })
          }
        } catch (error) {
          console.error(`Error fetching ${type}:`, error)
        }
      }
    },

    /**
     * @param {number} lastFetch
     * @returns {boolean}
     */
    shouldFetchData(lastFetch) {
      const now = Date.now()
      return !lastFetch || now - lastFetch > 60000
    },

    /**
     * @param {Array} balances
     */
    setBalances(balances) {
      this.balances = balances
    },

    /**
     * @param {Array} trades
     */
    setTrades(trades) {
      this.trades = trades
    },

    /**
     * @param {Array} strats
     */
    setStrats(strats) {
      this.strats = strats
    },

    /**
     * @param {Array} cmc
     */
    setCmc(cmc) {
      this.cmc = cmc
    },

    /**
     * @param {Array} orders
     */
    setOrders(orders) {
      this.orders = orders
      this.buyOrders = orders.filter((order) => order.side === 'buy')
      this.sellOrders = orders.filter((order) => order.side === 'sell')
    },

    /**
     * @param {Object} param0
     * @param {string} param0.type
     * @param {number} param0.timestamp
     */
    setLastFetchTimestamp({ type, timestamp }) {
      this.lastFetchTimestamp[type] = timestamp
    },

    /**
     * @param {Array} shad
     */
    setShad(shad) {
      this.shad = shad
    }
  }
})
