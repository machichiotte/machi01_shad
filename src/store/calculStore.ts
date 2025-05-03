// src/store/calculStore.ts
import { defineStore } from 'pinia'
import {
  fetchCmc,
  fetchBalance,
  fetchOrder,
  fetchDashboard,
  fetchStrategy,
  fetchTrade,
  fetchTicker,
  fetchRss
} from '../server/fetchFromServer.js'
import { TYPES, Balance, Cmc, Order, Asset, Strat, Trade, Ticker, RssItem } from '../types/responseData.ts'

export const useCalculStore = defineStore('calcul', {
  state: () => ({
    balance: [] as Balance[],
    cmc: [] as Cmc[],
    order: [] as Order[],
    buyOrder: [] as Order[],
    sellOrder: [] as Order[],
    dashboard: [] as Asset[],
    strat: [] as Strat[],
    ticker: [] as Ticker[],
    trade: [] as Trade[],
    rss: [] as RssItem[],
    lastFetchTimestamp: {
      balance: 0 as number,
      cmc: 0 as number,
      order: 0 as number,
      dashboard: 0 as number,
      strat: 0 as number,
      ticker: 0 as number,
      trade: 0 as number,
      rss: 0 as number,
    }
  }),

  getters: {
    getTicker: (state) => state.ticker,
    getDashboard: (state) => state.dashboard,
    getBalance: (state) => state.balance,
    getTrade: (state) => state.trade,
    getStrat: (state) => state.strat,
    getCmc: (state) => state.cmc,
    getOrder: (state) => state.order,
    getBuyOrder: (state) => state.buyOrder,
    getSellOrder: (state) => state.sellOrder,
    getRss: (state) => state.rss,
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

    async loadDashboard() {
      await this.loadData(TYPES.DASHBOARD, fetchDashboard, this.setDashboard)
    },

    async loadRss() {
      await this.loadData(TYPES.RSS, fetchRss, this.setRss)
    },


    async loadData(type: TYPES, fetchFn: () => Promise<any>, setFn: (data: any) => void) {
      const now = Date.now()
      const lastFetch = this.getLastFetchTimestamp(type)

      if (!lastFetch || this.shouldFetchData(lastFetch)) {

        try {

          const result = await fetchFn()

          if (result) {

            setFn(result)
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

    setDashboard(data: Asset[]) {
      this.dashboard = data
    },

    setRss(data: RssItem[]) {
      // Vous pourriez vouloir trier les éléments par date de publication ici
      this.rss = data.sort((a, b) =>
        new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
      );
    },

    setLastFetchTimestamp({ type, timestamp }: { type: TYPES; timestamp: number }) {
      this.lastFetchTimestamp[type] = timestamp
    }
  }
})
