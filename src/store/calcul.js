// src/store/calcul.js
import { defineStore } from 'pinia';
import {
  fetchCmc,
  fetchBalances,
  fetchTrades,
  fetchOrders,
  fetchStrategy,
  fetchShad
} from '../js/fetchFromServer.js';

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
    // Actions de récupération spécifiques pour chaque type de données

    async fetchBalances() {
      await this.fetchData('balances', fetchBalances, this.setBalances);
    },

    async fetchTrades() {
      await this.fetchData('trades', fetchTrades, this.setTrades);
    },

    async fetchStrats() {
      await this.fetchData('strats', fetchStrategy, this.setStrats);
    },

    async fetchCmc() {
      await this.fetchData('cmc', fetchCmc, this.setCmc);
    },

    async fetchOrders() {
      await this.fetchData('orders', fetchOrders, this.setOrders);
    },

    async fetchShad() {
      await this.fetchData('shad', fetchShad, this.setShad);
    },

    // Fonction générique pour la récupération des données
    async fetchData(type, fetchFn, setFn) {
      const now = Date.now();
      const lastFetch = this.getLastFetchTimestamp(type);
      if (!lastFetch || this.shouldFetchData(lastFetch)) {
        try {
          const data = await fetchFn();
          if (data) {
            setFn(data);
            this.setLastFetchTimestamp({ type, timestamp: now });
          }
        } catch (error) {
          console.error(`Error fetching ${type}:`, error);
        }
      }
    },

    shouldFetchData(lastFetch) {
      const now = Date.now();
      return !lastFetch || now - lastFetch > 15000;
    },

    setBalances(balances) {
      this.balances = balances;
    },
    setTrades(trades) {
      this.trades = trades;
    },
    setStrats(strats) {
      this.strats = strats;
    },
    setCmc(cmc) {
      this.cmc = cmc;
    },
    setOrders(orders) {
      this.orders = orders;
      this.buyOrders = orders.filter((order) => order.side === 'buy');
      this.sellOrders = orders.filter((order) => order.side === 'sell');
    },
    setLastFetchTimestamp({ type, timestamp }) {
      this.lastFetchTimestamp[type] = timestamp;
    },
    setShad(shad) {
      this.shad = shad;
    }
  }
});
