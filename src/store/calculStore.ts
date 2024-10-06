// src/store/calculStoreStore.js
import { defineStore } from 'pinia'
import {
  fetchCmc,
  fetchBalance,
  fetchOrder,
  fetchShad,
  fetchStrategy,
  fetchTrade,
  fetchTicker
} from '../js/fetchFromServer.js'
import { TYPES, Balance, Cmc, Order, Shad, Strat, Trade, Ticker } from '@/types/calcul.js'

export const useCalculStore = defineStore('calcul', {
  state: () => ({
    fetchStrategy,
    balance: [] as Balance[],
    cmc: [] as Cmc[],
    order: [] as Order[],
    buyOrder: [] as Order[],
    sellOrder: [] as Order[],
    shad: [] as Shad[],
    strat: [] as Strat[],
    ticker: [] as Ticker[],
    trade: [] as Trade[],
    lastFetchTimestamp: {
      balance: 0 as number,
      cmc: 0 as number,
      order: 0 as number,
      shad: 0 as number,
      strat: 0 as number,
      ticker: 0 as number,
      trade: 0 as number,
    }
  }),

  getters: {
    getTicker: (state) => state.ticker,
    getShad: (state) => state.shad,
    getBalance: (state) => state.balance,
    getTrade: (state) => state.trade,
    getStrat: (state) => state.strat,
    getCmc: (state) => state.cmc,
    getOrder: (state) => state.order,
    getBuyOrder: (state) => state.buyOrder,
    getSellOrder: (state) => state.sellOrder,
    getLastFetchTimestamp: (state) => (type: TYPES) =>
      state.lastFetchTimestamp ? state.lastFetchTimestamp[type] : null
  },

  actions: {
    async loadTicker() {
      await this.loadData(TYPES.TICKER, fetchTicker, this.setTicker)
    },

    async loadBalance() {
      await this.loadData(TYPES.BALANCE, fetchBalance, this.setBalance)
    },

    async loadTrade() {
      await this.loadData(TYPES.TRADE, fetchTrade, this.setTrade)
    },

    async loadStrat() {
      await this.loadData(TYPES.STRAT, fetchStrategy, this.setStrat)
    },

    async loadCmc() {
      await this.loadData(TYPES.CMC, fetchCmc, this.setCmc)
    },

    async loadOrder() {
      await this.loadData(TYPES.ORDER, fetchOrder, this.setOrder)
    },

    async loadShad() {
      await this.loadData(TYPES.SHAD, fetchShad, this.setShad)
    },

    async loadData(type: TYPES, fetchFn: () => Promise<any>, setFn: (data: any) => void) {
      const now = Date.now()
      const lastFetch = this.getLastFetchTimestamp(type)
      if (!lastFetch || this.shouldFetchData(lastFetch)) {
        try {
          const result = await fetchFn()
          if (result) {
            setFn(result.data)
            this.setLastFetchTimestamp({ type, timestamp: now })
          }
        } catch (error) {
          console.error(`Error fetching ${type}:`, error)
        }
      }
    },

    shouldFetchData(lastFetch: number): boolean {
      const now = Date.now()
      return !lastFetch || now - lastFetch > 60000
    },

    setTicker(data: Ticker[]) {
      this.ticker = data
    },

    setBalance(data: Balance[]) {
      this.balance = data
    },

    setTrade(data: Trade[]) {
      this.trade = data
    },

    setStrat(data: Strat[]) {
      this.strat = data
    },

    setCmc(data: Cmc[]) {
      this.cmc = data
    },

    setOrder(data: Order[]) {
      this.order = data
      this.buyOrder = data.filter((order: any) => order.side === 'buy')
      this.sellOrder = data.filter((order: any) => order.side === 'sell')
    },

    setLastFetchTimestamp({ type, timestamp }: { type: TYPES; timestamp: number }) {
      this.lastFetchTimestamp[type] = timestamp
    },

    setShad(data: Shad[]) {
      this.shad = data
    }
  }
})
