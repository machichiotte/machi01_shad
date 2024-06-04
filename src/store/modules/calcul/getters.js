// src/store/modules/calcul/getters.js
import {
  GET_BALANCES,
  GET_TRADES,
  GET_STRATS,
  GET_CMC,
  GET_ORDERS,
  GET_BUY_ORDERS,
  GET_SELL_ORDERS,
  GET_LAST_FETCH_TIMESTAMP
} from '../../storeconstants'

export default {
  [GET_BALANCES]: (state) => {
    return state.balances
  },

  [GET_TRADES]: (state) => {
    return state.trades
  },

  [GET_STRATS]: (state) => {
    return state.strats
  },

  [GET_CMC]: (state) => {
    return state.cmc
  },

  [GET_ORDERS]: (state) => {
    return state.orders
  },

  [GET_BUY_ORDERS]: (state) => {
    return state.buyOrders
  },

  [GET_SELL_ORDERS]: (state) => {
    return state.sellOrders
  },

  [GET_LAST_FETCH_TIMESTAMP]: (state) => (type) => {
    return state.lastFetchTimestamp ? state.lastFetchTimestamp[type] : null;
  },
}
