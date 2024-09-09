// src/services/metrics/utils.ts

import { MappedBalance } from "@services/mapping";

const THRESHOLD = 0.01; // 1% threshold

/**
 * Calcule la possession actuelle en fonction du prix actuel et du solde.
 * @param {number} currentPrice - Le prix actuel.
 * @param {number} balance - Le solde.
 * @returns {number} La possession actuelle arrondie à deux décimales.
 */
function getCurrentPossession(currentPrice: number | undefined, balance: number | undefined): number {
  if (currentPrice === undefined || balance === undefined) return -1;
  return Math.round(currentPrice * balance * 100) / 100;
}

/**
 * Calcule la différence en pourcentage entre deux valeurs.
 * @param {number|string} newValue - La nouvelle valeur.
 * @param {number|string} oldValue - L'ancienne valeur.
 * @returns {number|string} La différence en pourcentage ou "N/A" si invalide.
 */
function getPercentageDifference(newValue: number | undefined, oldValue: number | undefined): number | undefined {
  //if newValue or oldValue is undefined, return undefined
  if (newValue === undefined || newValue < 0) return undefined;
  if (oldValue === undefined || oldValue < 0) return undefined;

  return Number(((newValue - oldValue) / oldValue).toFixed(2));
}

/**
 * Calcule le profit en fonction des achats totaux, des ventes totales, du prix actuel et du solde.
 * @param {number} totalBuy - Le total des achats.
 * @param {number} totalSell - Le total des ventes.
 * @param {number} currentPrice - Le prix actuel.
 * @param {number} balance - Le solde.
 * @returns {number} Le profit calculé ou NaN si les entrées sont invalides.
 */
function getProfit(totalBuy: number | undefined, totalSell: number | undefined, currentPrice: number | undefined, balance: number | undefined): number {
  if (currentPrice === undefined || balance === undefined) return -1;
  if (totalBuy === undefined) totalBuy = 0;
  if (totalSell === undefined) totalSell = 0;
  return currentPrice * balance + totalSell - totalBuy;
}

/**
 * Récupère le solde pour un symbole donné à partir d'un objet de solde.
 * @param {string} base - Le symbole de base.
 * @param {MappedBalance} balanceObj - L'objet contenant les informations de solde.
 * @returns {number} Le solde pour le symbole donné ou 0 si invalide.
 */
function getBalanceBySymbol(base: string, balanceObj: MappedBalance): number {
  if (typeof balanceObj !== "object" || balanceObj === null) {
    console.warn(`balanceObj is invalid: ${balanceObj}`);
    return 0;
  }

  if (balanceObj.base !== base) {
    console.warn(`base not found: ${base}`);
    return 0;
  }

  const balanceAsNumber = balanceObj.balance;
  if (!isNaN(balanceAsNumber)) return balanceAsNumber;

  console.warn(`Invalid balance value for symbol ${base}: ${balanceObj.balance}`);
  return 0;
}

/**
 * Détermine le statut des ordres de vente ouverts par rapport aux valeurs TP.
 * @param {Array} openSellOrders - Les ordres de vente ouverts.
 * @param {...number} tpValues - Les valeurs TP.
 * @returns {Array} Un tableau de résultats indiquant le statut de chaque ordre.
 */
function getStatus(openSellOrders: Array<{ amount: number; price: number }>, ...tpValues: number[]): number[] {
  const isClose = (value1: number, value2: number): boolean => Math.abs((value1 - value2) / value1) <= THRESHOLD;
  const results: number[] = new Array(5).fill(0);

  openSellOrders.forEach((order) => {
    for (let i = 0; i < 5; i++) {
      if (isClose(order.amount, tpValues[i]) && isClose(order.price, tpValues[i + 5])) {
        results[i] = 1;
      }
    }
  });

  return results;
}

/**
 * Calcule le pourcentage de progression entre deux valeurs.
 * @param {number} newValue - La nouvelle valeur.
 * @param {number} oldValue - L'ancienne valeur.
 * @returns {number} Le pourcentage de progression ou undefined si invalide.
 */
function getPercentageToNextTp(newValue: number | undefined, oldValue: number | undefined): number | undefined {
  if (newValue === undefined || newValue < 0) return undefined;
  if (oldValue === undefined || oldValue < 0) return undefined;

  return Number((((oldValue - newValue) / newValue) * 100).toFixed(2));
}

export {
  getCurrentPossession,
  getPercentageDifference,
  getProfit,
  getBalanceBySymbol,
  getStatus,
  getPercentageToNextTp
};