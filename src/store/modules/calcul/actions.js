// src/store/modules/calcul/actions.js
import {
  FETCH_DATA,
  FETCH_TRADES,
  FETCH_STRATS,
  FETCH_BALANCES,
  FETCH_CMC,
  FETCH_ORDERS,
  SET_BALANCES,
  SET_TRADES,
  SET_STRATS,
  SET_CMC,
  SET_ORDERS
} from '../../storeconstants'

import { getCmc, getBalances, getTrades, getOrders, getStrategy } from '../../../js/getter'

export default {
  async [FETCH_DATA](context) {
    console.log('FETCH_DATA context', context)

    try {
      const balances = await getBalances()
      console.log('FETCH_DATA balances', balances)
      context.commit(SET_BALANCES, balances)

      const trades = await getTrades()
      context.commit(SET_TRADES, trades)

      const strats = await getStrategy()
      context.commit(SET_STRATS, strats)

      const cmc = await getCmc()
      context.commit(SET_CMC, cmc)

      const orders = await getOrders()
      context.commit(SET_ORDERS, orders)
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error)
    }
  },

  async [FETCH_BALANCES](context) {
    try {
      const data = await getBalances()
      context.commit(SET_BALANCES, data)
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error)
    }
  },

  async [FETCH_TRADES](context) {
    try {
      const data = await getTrades()
      context.commit(SET_TRADES, data)
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error)
    }
  },

  async [FETCH_STRATS](context) {
    try {
      const data = await getStrategy()
      context.commit(SET_STRATS, data)
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error)
    }
  },
  async [FETCH_CMC](context) {
    try {
      const data = await getCmc()
      context.commit(SET_CMC, data)
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error)
    }
  },
  async [FETCH_ORDERS](context) {
    try {
      const data = await getOrders()
      context.commit(SET_STRATS, data)
    } catch (error) {
      console.error("Une erreur s'est produite lors de la récupération des données :", error)
    }
  }
}
