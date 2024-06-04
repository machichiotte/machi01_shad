// src/store/modules/calcul/mutations.js
import {
  SET_BALANCES,
  SET_TRADES,
  SET_STRATS,
  SET_CMC,
  SET_ORDERS,
  SET_LAST_FETCH_TIMESTAMP
} from '../../storeconstants'

export default {
  [SET_BALANCES](state, payload) {
    state.balances = payload
  },

  [SET_TRADES](state, payload) {
    state.trades = payload
  },

  [SET_STRATS](state, payload) {
    state.strats = payload
  },

  [SET_CMC](state, payload) {
    state.cmc = payload
  },

  [SET_ORDERS](state, payload) {
    state.orders = payload
    state.buyOrders = state.orders.filter((order) => order.side === 'buy')
    state.sellOrders = state.orders.filter((order) => order.side === 'sell')
  },

  [SET_LAST_FETCH_TIMESTAMP](state, { type, timestamp }) {
    if (!state.lastFetchTimestamp) {
      state.lastFetchTimestamp = {}
    }
    state.lastFetchTimestamp[type] = timestamp
  }
}
