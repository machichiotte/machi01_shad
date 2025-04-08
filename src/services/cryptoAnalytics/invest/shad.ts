// src/services/cryptoAnalytics/invest/shad.ts

import { STRAT_ERROR_ALLOWED } from '@src/constants/metrics'
import { AmountsAndPrices } from '@typ/cryptoAnalytics'
import { getPlatformFee, Recup } from '.'

export interface RecupsShad {
  recupTp1: number
  recupTpX: number
  recupShad: number
  totalShad: number
}

/**
 * Calculates the recovery amount for SHAD strategy
 */
export function getRecupShad(
  totalBuy: number,
  totalSell: number,
  maxExposition: number
): number {
  if (totalSell > 0) {
    if (maxExposition < totalBuy && totalSell < totalBuy - maxExposition) {
      return 0
    } else {
      return Math.round(totalSell - (totalBuy - maxExposition))
    }
  }
  return 0
}

/**
 * Calculates the recovery amount for TP1 (Take Profit 1)
 */
export function getRecupTp1(
  totalBuy: number,
  totalSell: number,
  maxExposition: number,
  recupTpX: number,
  totalShad: number
): number {
  let valueToRecup = 0
  if (maxExposition < totalBuy) {
    if (totalSell < totalBuy - maxExposition) {
      valueToRecup = totalBuy - maxExposition - totalSell
    } else {
      const result = (totalSell - (totalBuy - maxExposition)) / maxExposition
      const decimalPart = result - Math.floor(result)
      valueToRecup = decimalPart * maxExposition
    }
  } else if (
    (totalShad + 1) * totalBuy > totalSell &&
    totalShad * totalBuy < (1 - STRAT_ERROR_ALLOWED) * totalSell
  ) {
    valueToRecup = recupTpX - (totalShad + 1) * totalBuy - totalSell
  }

  if (valueToRecup > 5.05) {
    return valueToRecup
  }

  return recupTpX
}

/**
 * Calculates the recovery amount for TPX (Take Profit X)
 */
export function getRecupTpX(
  assetStrat: string,
  maxExposition: number,
  ratioShad: number
): number {
  const result = (maxExposition * ratioShad * 0.5).toFixed(2)
  return parseFloat(result)
}

/**
 * Calculates the number of completed SHAD cycles
 */
export function getDoneShad(
  totalBuy: number,
  totalSell: number,
  maxExposition: number,
  recupShad: number,
  recupTpX: number
): number {
  if (
    maxExposition < (1 - STRAT_ERROR_ALLOWED) * totalBuy &&
    totalSell < (1 - STRAT_ERROR_ALLOWED) * (totalBuy - maxExposition)
  ) {
    return -1
  } else if (recupShad >= (1 - STRAT_ERROR_ALLOWED) * recupTpX) {
    return -1 + Math.round(1 + STRAT_ERROR_ALLOWED + recupShad / recupTpX)
  } else {
    return 0
  }
}

/**
 * Gets the SHAD ratio for a given strategy
 */
export function getRatioShad(strat: string): number {
  const ratios: Record<string, number> = {
    shad: 2,
    'shad skip x2': 4,
    'strategy 3': 8,
    'strategy 4': 16
  }
  return ratios[strat] || 8
}

export function calculateRecupsShad(
  strat: string,
  maxExposition: number,
  totalBuy: number,
  totalSell: number
): RecupsShad {
  const ratioShad = getRatioShad(strat)
  const recupShad = getRecupShad(totalBuy, totalSell, maxExposition)
  const recupTpX = getRecupTpX(strat, maxExposition, ratioShad)
  const totalShad = getDoneShad(
    totalBuy,
    totalSell,
    maxExposition,
    recupShad,
    recupTpX
  )

  const recupTp1 = getRecupTp1(
    totalBuy,
    totalSell,
    maxExposition,
    recupTpX,
    totalShad
  )

  return {
    recupTp1,
    recupTpX,
    recupShad,
    totalShad
  }
}

/**
 * Calculates amounts and prices for SHAD strategy
 */
export function calculateAmountsAndPricesForShad(
  balance: number,
  averageEntryPrice: number,
  recup: Recup
): AmountsAndPrices {
  const FACTOR_SELL_SHAD = 0.5
  const parsedValues = {
    recup: recup.stratTps,
    balance,
    averageEntryPrice
  }

  const platformFee = getPlatformFee(recup.platform)
  const feeMultiplier = 1 + platformFee / 100

  const amountTp1 =
    recup?.stratTps?.totalShad > -1
      ? FACTOR_SELL_SHAD *
      (parsedValues.recup.recupTp1 / parsedValues.recup.recupTpX) *
      parsedValues.balance
      : parsedValues.balance - recup.maxExposition / parsedValues.averageEntryPrice

  const priceTp1 =
    recup?.stratTps?.totalShad > -1
      ? (parsedValues.recup.recupTp1 / amountTp1) * feeMultiplier
      : parsedValues.averageEntryPrice * feeMultiplier

  let remainingBalance = parsedValues.balance - amountTp1
  let amountTp2 = 0,
    amountTp3 = 0,
    amountTp4 = 0,
    amountTp5 = 0
  let priceTp2 = 0,
    priceTp3 = 0,
    priceTp4 = 0,
    priceTp5 = 0

  for (let i = 2; i <= 5; i++) {
    // Calcul des montants et prix pour chaque niveau de TP
    const { amount, price } = calculateAmountAndPriceForShad(
      parsedValues.recup.recupTpX,
      remainingBalance,
      FACTOR_SELL_SHAD
    )

    // Utilisation des variables directement pour les montants et prix
    if (i === 2) {
      amountTp2 = amount
      priceTp2 = price * feeMultiplier
    } else if (i === 3) {
      amountTp3 = amount
      priceTp3 = price * feeMultiplier
    } else if (i === 4) {
      amountTp4 = amount
      priceTp4 = price * feeMultiplier
    } else if (i === 5) {
      amountTp5 = amount
      priceTp5 = price * feeMultiplier
    }

    // Mise à jour de la balance restante
    remainingBalance -= amount // Soustraction du montant calculé

    // Vérification si la balance restante est épuisée
    if (remainingBalance <= 0) {
      break // Sortir de la boucle si le solde est épuisé
    }
  }

  const amountsAndPrices: AmountsAndPrices = {
    amountTp1,
    priceTp1,
    amountTp2,
    amountTp3,
    amountTp4,
    amountTp5,
    priceTp2,
    priceTp3,
    priceTp4,
    priceTp5
  }

  return amountsAndPrices
}

/**
 * Calculates amount and price for SHAD strategy
 */
function calculateAmountAndPriceForShad(
  parsedRecup: number,
  parsedBalance: number,
  factor: number
): { amount: number; price: number } {
  const amount = factor * parsedBalance
  const price = parsedRecup / amount

  return { amount, price }
}
