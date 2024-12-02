// src/services/metrics/utils.ts
import { MappedBalance } from '@typ/balance'

const THRESHOLD = 0.01 // 1% threshold

/**
 * Calcule la possession actuelle en fonction du prix actuel et du solde.
 */
function getCurrentPossession(
  currentPrice: number | undefined,
  balance: number | undefined,
): number {
  if (currentPrice === undefined || balance === undefined)
    return -1

  return Math.round(currentPrice * balance * 100) / 100

  return -1
}



/**
 * Calcule le profit en fonction des achats totaux, des ventes totales, du prix actuel et du solde.
 */
function getProfit(
  totalBuy: number | undefined,
  totalSell: number | undefined,
  currentPrice: number | undefined,
  balance: number | undefined
): number {
  if (currentPrice === undefined || balance === undefined) return -1
  if (totalBuy === undefined) totalBuy = 0
  if (totalSell === undefined) totalSell = 0
  return currentPrice * balance + totalSell - totalBuy
}

/**
 * Récupère le solde pour un symbole donné à partir d'un objet de solde.
 */
function getBalanceBySymbol(base: string, balanceObj: MappedBalance): number {
  if (typeof balanceObj !== 'object' || balanceObj === null) {
    console.warn(`balanceObj is invalid: ${balanceObj}`)
    return 0
  }

  if (balanceObj.base !== base) {
    console.warn(`base not found: ${base}`)
    return 0
  }

  const balanceAsNumber = balanceObj.balance
  if (!isNaN(balanceAsNumber)) return balanceAsNumber

  console.warn(
    `Invalid balance value for symbol ${base}: ${balanceObj.balance}`
  )
  return 0
}

/**
 * Détermine le statut des ordres de vente ouverts par rapport aux valeurs TP.
 */
function getTakeProfitStatus(
  openSellOrders: Array<{ amount: number; price: number }>,
  ...tpValues: number[]
): number[] {
  const isClose = (value1: number, value2: number): boolean =>
    Math.abs((value1 - value2) / value1) <= THRESHOLD
  const results: number[] = new Array(5).fill(0)

  openSellOrders.forEach((order) => {
    for (let i = 0; i < 5; i++) {
      if (
        isClose(order.amount, tpValues[i]) &&
        isClose(order.price, tpValues[i + 5])
      ) {
        results[i] = 1
      }
    }
  })

  return results
}



export {
  getCurrentPossession,
  getProfit,
  getBalanceBySymbol,
  getTakeProfitStatus,
}