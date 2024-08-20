// src/js/metrics/trades.js
import store from '@/store/store.js'
import { GET_TRADES } from '@/store/storeconstants'

function getTotalAmountAndBuy(symbol) {
  const trades = store.getters['calcul/' + GET_TRADES]
  const filteredTrades = trades.filter((trade) => trade.base === symbol && trade.type === 'buy')
  const totalBuy = filteredTrades.reduce((total, trade) => total + parseFloat(trade.totalUSDT), 0)
  const totalAmount = filteredTrades.reduce((total, trade) => total + parseFloat(trade.amount), 0)

  const averageEntryPrice = (parseFloat(totalBuy) / parseFloat(totalAmount)).toFixed(8)

  return {
    totalAmount,
    totalBuy: totalBuy.toFixed(2),
    averageEntryPrice
  }
}

function getTotalSell(symbol) {
  const trades = store.getters['calcul/' + GET_TRADES]
  // Implementation for getting the total sell amount for a given symbol
  const filteredTrades = trades.filter((trade) => trade.base === symbol && trade.type === 'sell')
  const sellTotal = filteredTrades.reduce((total, trade) => total + parseFloat(trade.totalUSDT), 0)

  return Math.round(sellTotal, 2)
}

function getTradesHistory(symbol) {
  const trades = store.getters['calcul/' + GET_TRADES]
  // Implementation for getting the trades history for a given symbol
  return trades.filter((trade) => trade.base === symbol)
}

function getBalance(symbol) {
  // Implementation for getting the balance for a given symbol
  const balance = sortedBalances.find((item) => item.symbol === symbol)
  return balance ? balance.balance : 'N/A'
}

function getProfit(totalBuy, totalSell, currentPrice, balance) {
  const currentPossession = currentPrice * balance
  return currentPossession + totalSell - totalBuy
}

export { getTotalAmountAndBuy, getTotalSell, getTradesHistory, getBalance, getProfit }
