// src/services/metrics/trades.ts
import { MappedTrade } from '@typ/trade'

/**
 * Checks if a value is a positive number.
 */
const isPositiveNumber = (value: unknown): boolean =>
  typeof value === 'number' && !isNaN(value) && value > 0

/**
 * Converts a fee to its equivalent in the quote currency.
 */
const convertFeeToQuote = (fee: number, price: number): number =>
  isPositiveNumber(fee) && isPositiveNumber(price) ? fee * price : 0

interface Trade {
  base: string
  side: string
  fee: string
  price: string
  feecoin: string
  quote: string
  amount: string
  eqUSD: string
}

interface TotalAmountAndBuy {
  totalAmount: number
  totalBuy: number
  averageEntryPrice: number
}

/**
 * Calculate the total amount, total buy value, and average entry price from trades.
 */
function getTotalAmountAndBuy(symbol: string, trades: MappedTrade[]): TotalAmountAndBuy {
  const filteredTrades = trades.filter(
    (trade) => trade.base === symbol && trade.side === 'buy'
  )

  return filteredTrades.reduce(
    (acc: TotalAmountAndBuy, trade: MappedTrade) => {
      const fee = Number(trade.fee)
      const price = Number(trade.price)
      const feeInQuote =
        trade.feecoin === trade.quote
          ? fee > 0
            ? fee
            : 0
          : convertFeeToQuote(fee, price)
      const amount = Number(trade.amount) > 0 ? Number(trade.amount) : 0 // Assurez-vous que amount est un nombre

      acc.totalBuy += trade.eqUSD + feeInQuote
      acc.totalAmount += amount
      acc.averageEntryPrice = acc.totalBuy / acc.totalAmount

      // Formater les valeurs pour avoir 2 chiffres après la virgule
      acc.totalBuy = parseFloat(acc.totalBuy.toFixed(2));
      acc.totalAmount = parseFloat(acc.totalAmount.toFixed(2));
      acc.averageEntryPrice = parseFloat(acc.averageEntryPrice.toFixed(2));

      return acc
    },
    { totalAmount: 0, totalBuy: 0, averageEntryPrice: 0 }
  )
}

/**
 * Calculate the total sell value for a given symbol, adjusting for fees.
 */
function getTotalSell(symbol: string, trades: MappedTrade[]): number {
  return trades
    .filter((trade) => trade.base === symbol && trade.side === 'sell')
    .reduce((total: number, trade: MappedTrade) => {
      const fee = trade.fee
      const price = trade.price
      const feeInQuote =
        trade.feecoin === trade.quote
          ? isPositiveNumber(fee)
            ? fee
            : 0
          : convertFeeToQuote(fee, price)
      return total + trade.eqUSD - feeInQuote
    }, 0)
}

/**
 * Retrieves the trade history for a specific symbol.
 */
function getTradesHistory(symbol: string, trades: Trade[]): Trade[] {
  return trades.filter((trade) => trade.base === symbol)
}

export { getTotalAmountAndBuy, getTotalSell, getTradesHistory }