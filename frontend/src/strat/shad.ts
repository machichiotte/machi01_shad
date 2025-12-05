// src/strat/shad.ts
import { Asset, TakeProfits } from '../types/responseData';
//import { calculateRecoveryGap, determineStrategyFactor } from './common';
import { determineStrategyFactor } from './common';

//const ERROR_ALLOWED = 0.05

// Calculate take profit values based on trading data and strategy parameters.
function getTakeProfitValues(data: Asset, maxExposition: number, ratioShad: number): TakeProfits {
  const totalBuy = data.orders.trade.totalBuy
  const totalSell = data.orders.trade.totalSell
  const balance = data.liveData.balance
  const averageEntryPrice = data.orders.trade.averageEntryPrice

  // Intermediate calculations
  const recupTpX = getRecupTpX(maxExposition, ratioShad)
  let recupTp1, priceTp1, amountTp1
  // Case 1
  if (maxExposition < totalBuy && totalBuy > totalSell + maxExposition) {
    recupTp1 = totalBuy - totalSell - maxExposition
    priceTp1 = averageEntryPrice
  } else {
    recupTp1 = recupTpX - (totalSell % recupTpX)
    priceTp1 = (2 * recupTpX * ratioShad) / balance
  }

  if (recupTp1 < 5.05) {
    recupTp1 = recupTp1 + recupTpX
    priceTp1 = priceTp1 * 2 * ratioShad
  }
  amountTp1 = recupTp1 / priceTp1

  // Check if amount1 is greater than balance
  if (amountTp1 > balance) {
    amountTp1 = balance // Assign balance to amount1
    priceTp1 = recupTp1 / balance // Recalculate price1
  }

  // Calculate subsequent amounts and prices
  const amountTp2 = (balance - amountTp1) / 2
  const amountTp3 = (balance - amountTp1 - amountTp2) / 2
  const amountTp4 = (balance - amountTp1 - amountTp2 - amountTp3) / 2
  const amountTp5 = (balance - amountTp1 - amountTp2 - amountTp3 - amountTp4) / 2

  const priceTp2 = amountTp2 > 0 ? recupTpX / amountTp2 : 0
  const priceTp3 = amountTp3 > 0 ? recupTpX / amountTp3 : 0
  const priceTp4 = amountTp4 > 0 ? recupTpX / amountTp4 : 0
  const priceTp5 = amountTp5 > 0 ? recupTpX / amountTp5 : 0

  const takeProfits: TakeProfits = {
    tp1: { price: priceTp1, amount: amountTp1 },
    tp2: { price: priceTp2, amount: amountTp2 },
    tp3: { price: priceTp3, amount: amountTp3 },
    tp4: { price: priceTp4, amount: amountTp4 },
    tp5: { price: priceTp5, amount: amountTp5 },
    status: []
  };

  return takeProfits;
}

// Calculate recovery values based on trading strategy and market conditions.
export function getShadTakeProfitsTargets(asset: Asset): TakeProfits {
  const stratExpo = asset.strat.maxExposition ?? 0 // Ensure default value
  const maxExposition = Math.max(0, stratExpo) // Ensure non-negative exposition
  const ratioShad = determineStrategyFactor(asset.strat.strategy)
  const calculatedValues = getTakeProfitValues(asset, maxExposition, ratioShad as number)
  return calculatedValues;
}

// Calculates the recovery value for a Take Profit X (TpX).
function getRecupTpX(maxExposition: number, ratioShad: number): number {
  const result = (maxExposition * ratioShad * 0.5).toFixed(2)
  return parseFloat(result)
}

/*
function getDoneShad(data: any, maxExposition: number, recupShad: number, recupTpX: number): number {
  const { totalBuy, totalSell } = data
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
}*/