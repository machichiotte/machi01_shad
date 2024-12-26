// src/services/metrics/strategies.ts
import { MappedStrat } from "@typ/strat"
import { PLATFORM } from '@typ/platform';

/**
 * Constants for error margin and maximum exposure
 */
const ERROR_ALLOWED = 0.05
const MAX_EXPO = 10000

/**
 * Calculates the recovery amount for SHAD strategy
 */
function getRecupShad(totalBuy: number, totalSell: number, maxExposition: number): number {
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
function getRecupTp1(totalBuy: number, totalSell: number, maxExposition: number, recupTpX: number, totalShad: number): number {
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
    totalShad * totalBuy < (1 - ERROR_ALLOWED) * totalSell
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
function getRecupTpX(assetStrat: string, maxExposition: number, ratioShad: number): number {
  const result = (maxExposition * ratioShad * 0.5).toFixed(2)
  return parseFloat(result)
}

/**
 * Calculates the number of completed SHAD cycles
 */
function getDoneShad(totalBuy: number, totalSell: number, maxExposition: number, recupShad: number, recupTpX: number): number {
  if (
    maxExposition < (1 - ERROR_ALLOWED) * totalBuy &&
    totalSell < (1 - ERROR_ALLOWED) * (totalBuy - maxExposition)
  ) {
    return -1
  } else if (recupShad >= (1 - ERROR_ALLOWED) * recupTpX) {
    return -1 + Math.round(1 + ERROR_ALLOWED + recupShad / recupTpX)
  } else {
    return 0
  }
}

/**
 * Gets the SHAD ratio for a given strategy
 */
function getRatioShad(strat: string): number {
  const ratios: Record<string, number> = {
    'shad': 2,
    'shad skip x2': 4,
    'strategy 3': 8,
    'strategy 4': 16
  }
  return ratios[strat] || 8
}

/**
 * Calculates various recovery amounts and strategy parameters
 */
function calculateRecups(base: string, platform: string, totalBuy: number, totalSell: number, myStrat: Omit<MappedStrat, '_id'>) {
  const strat = myStrat.strategies[platform] || 'No strategy';
  const stratExpo = myStrat.maxExposure[platform] || MAX_EXPO;
  const maxExposition = Math.max(5 + 0.05, Math.min(totalBuy, stratExpo || MAX_EXPO))
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

  const result = {
    strat,
    stratExpo,
    maxExposition,
    ratioShad,
    recupTpX,
    recupShad,
    recupTp1,
    totalShad
  };

  return result;
}

/**
 * Calculates amount and price for SHAD strategy
 */
function calculateAmountAndPriceForShad(parsedRecup: number, parsedBalance: number, factor: number): { amount: number; price: number } {
  const amount = factor * parsedBalance
  const price = parsedRecup / amount

  return { amount, price }
}

/**
 * Retrieve the platform fee percentage based on the platform name
 */
function getPlatformFee(platform: PLATFORM): number {
  const fees: Record<string, number> = {
    binance: 0.1,
    kucoin: 0.1,
    htx: 0.1,
    okx: 0.1,
    gateio: 0.2,
    default: 0.2
  }

  return fees[platform.toLowerCase()] || fees.default
}

interface AmountsAndPrices {
  amountTp1: number;
  priceTp1: number;
  amountTp2: number;
  priceTp2: number;
  amountTp3: number;
  priceTp3: number;
  amountTp4: number;
  priceTp4: number;
  amountTp5: number;
  priceTp5: number;
}

/**
 * Calculates amounts and prices for SHAD strategy
 */
function calculateAmountsAndPricesForShad(recupTp1: number, balance: number, totalShad: number, recupTpX: number, averageEntryPrice: number, maxExposition: number, platform: PLATFORM): AmountsAndPrices {
  const FACTOR_SELL_SHAD = 0.5
  const parsedValues = {
    recupTp1,
    balance,
    recupTpX,
    averageEntryPrice
  }

  const platformFee = getPlatformFee(platform)
  const feeMultiplier = 1 + platformFee / 100

  const amountTp1 =
    totalShad > -1
      ? FACTOR_SELL_SHAD *
      (parsedValues.recupTp1 / parsedValues.recupTpX) *
      parsedValues.balance
      : parsedValues.balance - maxExposition / parsedValues.averageEntryPrice

  const priceTp1 =
    totalShad > -1
      ? (parsedValues.recupTp1 / amountTp1) * feeMultiplier
      : parsedValues.averageEntryPrice * feeMultiplier


  let remainingBalance = parsedValues.balance - amountTp1
  let amountTp2 = 0, amountTp3 = 0, amountTp4 = 0, amountTp5 = 0;
  let priceTp2 = 0, priceTp3 = 0, priceTp4 = 0, priceTp5 = 0;

  for (let i = 2; i <= 5; i++) {
    // Calcul des montants et prix pour chaque niveau de TP
    const { amount, price } = calculateAmountAndPriceForShad(
      parsedValues.recupTpX,
      remainingBalance,
      FACTOR_SELL_SHAD
    );

    // Utilisation des variables directement pour les montants et prix
    if (i === 2) {
      amountTp2 = amount;
      priceTp2 = price * feeMultiplier;
    } else if (i === 3) {
      amountTp3 = amount;
      priceTp3 = price * feeMultiplier;
    } else if (i === 4) {
      amountTp4 = amount;
      priceTp4 = price * feeMultiplier;
    } else if (i === 5) {
      amountTp5 = amount;
      priceTp5 = price * feeMultiplier;
    }

    // Mise à jour de la balance restante
    remainingBalance -= amount; // Soustraction du montant calculé

    // Vérification si la balance restante est épuisée
    if (remainingBalance <= 0) {
      break; // Sortir de la boucle si le solde est épuisé
    }
  }

  const amountsAndPrices: AmountsAndPrices = { amountTp1, priceTp1, amountTp2, amountTp3, amountTp4, amountTp5, priceTp2, priceTp3, priceTp4, priceTp5 }


  return amountsAndPrices
}

export {
  getRecupTp1,
  getRecupTpX,
  getRecupShad,
  getDoneShad,
  calculateRecups,
  calculateAmountsAndPricesForShad
}