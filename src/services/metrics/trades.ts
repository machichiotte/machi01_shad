// src/services/metrics/trades.ts
import { MappedTrade } from '@models/dbTypes'

/**
 * Checks if a value is a positive number.
 * @param {unknown} value - The value to check.
 * @returns {boolean} - True if the value is a positive number, false otherwise.
 */
const isPositiveNumber = (value: unknown): boolean =>
  typeof value === 'number' && !isNaN(value) && value > 0

/**
 * Converts a fee to its equivalent in the quote currency.
 * @param {number} fee - The fee amount.
 * @param {number} price - The price of the asset.
 * @returns {number} - The fee converted to quote currency, or 0 if inputs are invalid.
 */
const convertFeeToQuote = (fee: number, price: number): number =>
  isPositiveNumber(fee) && isPositiveNumber(price) ? fee * price : 0

interface Trade {
  base: string
  type: string
  fee: string
  price: string
  feecoin: string
  quote: string
  amount: string
  totalUSDT: string
}

interface TotalAmountAndBuy {
  totalAmount: number
  totalBuy: number
  averageEntryPrice: number
}

/**
 * Calculate the total amount, total buy value, and average entry price from trades.
 * @param {string} symbol - The trading symbol to filter trades by.
 * @param {MappedTrade[]} trades - The array of trade objects.
 * @returns {TotalAmountAndBuy} - An object containing total amount and total buy value.
 */
function getTotalAmountAndBuy(symbol: string, trades: MappedTrade[]): TotalAmountAndBuy {
  const filteredTrades = trades.filter(
    (trade) => trade.base === symbol && trade.type === 'buy'
  )

  return filteredTrades.reduce(
    (acc: TotalAmountAndBuy, trade: MappedTrade) => {
      const fee = trade.fee
      const price = trade.price
      const feeInQuote =
        trade.feecoin === trade.quote
          ? fee > 0
            ? fee
            : 0
          : convertFeeToQuote(fee, price)
      const amount = trade.amount > 0 ? trade.amount : 0

      acc.totalBuy += trade.totalUSDT + feeInQuote
      acc.totalAmount += amount
      acc.averageEntryPrice = acc.totalBuy / acc.totalAmount

      return acc
    },
    { totalAmount: 0, totalBuy: 0, averageEntryPrice: 0 }
  )
}

/**
 * Calculate the total sell value for a given symbol, adjusting for fees.
 * @param {string} symbol - The trading symbol to filter trades by.
 * @param {MappedTrade[]} trades - The array of trade objects.
 * @returns {number} - The total sell value after adjusting for fees.
 */
function getTotalSell(symbol: string, trades: MappedTrade[]): number {
  return trades
    .filter((trade) => trade.base === symbol && trade.type === 'sell')
    .reduce((total: number, trade: MappedTrade) => {
      const fee = trade.fee
      const price = trade.price
      const feeInQuote =
        trade.feecoin === trade.quote
          ? isPositiveNumber(fee)
            ? fee
            : 0
          : convertFeeToQuote(fee, price)
      return total + trade.totalUSDT - feeInQuote
    }, 0)
}

/**
 * Retrieves the trade history for a specific symbol.
 * @param {string} symbol - The trading symbol to filter trades by.
 * @param {Trade[]} trades - The array of all trade objects.
 * @returns {Trade[]} - An array of trade objects for the specified symbol.
 */
function getTradesHistory(symbol: string, trades: Trade[]): Trade[] {
  return trades.filter((trade) => trade.base === symbol)
}

export { getTotalAmountAndBuy, getTotalSell, getTradesHistory }
