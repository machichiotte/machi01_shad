// src/js/metrics/strategies.js

/**
 * Constants for error margin and maximum exposure
 */
const ERROR_ALLOWED = 0.05;
const MAX_EXPO = 10000;

/**
 * Calculates the recovery amount for SHAD strategy
 * @param {number} totalBuy - Total buy amount
 * @param {number} totalSell - Total sell amount
 * @param {number} maxExposition - Maximum exposure allowed
 * @returns {number} Recovery amount for SHAD
 */
function getRecupShad(totalBuy, totalSell, maxExposition) {
  if (totalSell > 0) {
    if (maxExposition < totalBuy && totalSell < totalBuy - maxExposition) {
      return 0;
    } else {
      return Math.round(totalSell - (totalBuy - maxExposition), 2);
    }
  }
  return 0;
}

/**
 * Calculates the recovery amount for TP1 (Take Profit 1)
 * @param {number} totalBuy - Total buy amount
 * @param {number} totalSell - Total sell amount
 * @param {number} maxExposition - Maximum exposure allowed
 * @param {number} recupTpX - Recovery amount for TPX
 * @param {number} totalShad - Total SHAD amount
 * @returns {number} Recovery amount for TP1
 */
function getRecupTp1(totalBuy, totalSell, maxExposition, recupTpX, totalShad) {
  let valueToRecup = 0;
  if (maxExposition < totalBuy) {
    if (totalSell < totalBuy - maxExposition) {
      valueToRecup = totalBuy - maxExposition - totalSell;
    } else {
      const result = (totalSell - (totalBuy - maxExposition)) / maxExposition;
      const decimalPart = result - Math.floor(result);
      valueToRecup = decimalPart * maxExposition;
    }
  } else if (
    (totalShad + 1) * totalBuy > totalSell &&
    totalShad * totalBuy < (1 - ERROR_ALLOWED) * totalSell
  ) {
    valueToRecup = recupTpX - (totalShad + 1) * totalBuy - totalSell;
  }

  if (valueToRecup > 5.05) {
    return valueToRecup;
  }

  return recupTpX;
}

/**
 * Calculates the recovery amount for TPX (Take Profit X)
 * @param {string} assetStrat - Asset strategy
 * @param {number} maxExposition - Maximum exposure allowed
 * @param {number} ratioShad - SHAD ratio
 * @returns {number} Recovery amount for TPX
 */
function getRecupTpX(assetStrat, maxExposition, ratioShad) {
  const result = (maxExposition * ratioShad * 0.5).toFixed(2);
  // console.log(`🚀 ~ file: strategies.js:43 ~ getRecupTpX asset ${assetStrat} ~ result:`, result)
  return parseFloat(result);
}

/**
 * Calculates the number of completed SHAD cycles
 * @param {number} totalBuy - Total buy amount
 * @param {number} totalSell - Total sell amount
 * @param {number} maxExposition - Maximum exposure allowed
 * @param {number} recupShad - Recovery amount for SHAD
 * @param {number} recupTpX - Recovery amount for TPX
 * @returns {number} Number of completed SHAD cycles
 */
function getDoneShad(totalBuy, totalSell, maxExposition, recupShad, recupTpX) {
  if (
    maxExposition < (1 - ERROR_ALLOWED) * totalBuy &&
    totalSell < (1 - ERROR_ALLOWED) * (totalBuy - maxExposition)
  ) {
    return -1;
  } else if (recupShad >= (1 - ERROR_ALLOWED) * recupTpX) {
    return -1 + Math.round(1 + ERROR_ALLOWED + recupShad / recupTpX, 2);
  } else {
    return 0;
  }
}

/**
 * Retrieves the strategy and maximum exposure for an asset on a given platform
 * @param {string} platform - Platform identifier
 * @param {Object} strats - Saved strategies
 * @returns {Object} Strategy and maximum exposure
 */
function getStrat(platform, strats) {
  // Vérifie si 'strats' est un objet valide et contient des données
  if (!strats || typeof strats !== "object") {
    console.warn("🚀 ~ getStrat ~ strats is invalid or not an object:", strats);
    return { strat: "No strategy", stratExpo: MAX_EXPO };
  }

  return {
    strat: strats.strategies?.[platform] || "No strategy",
    stratExpo: strats.maxExposure?.[platform] || MAX_EXPO
  };
}

/**
 * Gets the SHAD ratio for a given strategy
 * @param {string} strat - Strategy name
 * @returns {number} SHAD ratio
 */
function getRatioShad(strat) {
  const ratios = {
    "Shad": 2,
    "Shad skip x2": 4,
    "Strategy 3": 8,
    "Strategy 4": 16
  };
  return ratios[strat] || 8;
}

/**
 * Calculates various recovery amounts and strategy parameters
 * @param {string} asset - Asset symbol
 * @param {string} platform - Platform identifier
 * @param {number} totalBuy - Total buy amount
 * @param {number} totalSell - Total sell amount
 * @param {Object} strats - Saved strategies
 * @returns {Object} Calculated recovery amounts and strategy parameters
 */
function calculateRecups(asset, platform, totalBuy, totalSell, strats) {
  let { strat, stratExpo } = getStrat(platform, strats);
  if (stratExpo === undefined) {
    stratExpo = MAX_EXPO;
  }

  const maxExposition = Math.max(5 + 0.05, Math.min(totalBuy, stratExpo));

  const ratioShad = getRatioShad(strat);
  const recupShad = getRecupShad(totalBuy, totalSell, maxExposition);
  const recupTpX = getRecupTpX(strat, maxExposition, ratioShad);
  const totalShad = getDoneShad(
    totalBuy,
    totalSell,
    maxExposition,
    recupShad,
    recupTpX
  );
  const recupTp1 = getRecupTp1(
    totalBuy,
    totalSell,
    maxExposition,
    recupTpX,
    totalShad
  );

  return {
    strat,
    stratExpo,
    maxExposition,
    ratioShad,
    recupTpX,
    recupShad,
    recupTp1,
    totalShad,
  };
}

/**
 * Calculates amount and price for SHAD strategy
 * @param {number} parsedRecup - Parsed recovery amount
 * @param {number} parsedBalance - Parsed balance
 * @param {number} factor - Factor for calculation
 * @returns {Object} Calculated amount and price
 */
function calculateAmountAndPriceForShad(parsedRecup, parsedBalance, factor) {
  const amount = factor * parsedBalance;
  const price = parsedRecup / amount;

  return { amount, price };
}

/**
 * Retrieve the platform fee percentage based on the platform name
 * @param {string} platform - The name of the trading platform
 * @returns {number} The fee percentage for the given platform
 */
function getPlatformFee(platform) {
  // Define the platform fees
  const fees = {
    binance: 0.1, // 0.1% fee
    kucoin: 0.1, // 0.1% fee
    htx: 0.1, // 0.1% fee
    okx: 0.1, // 0.1% fee
    gateio: 0.2, // 0.2% fee
    default: 0.2, // Default fee (if platform not found)
  };

  // Return the fee for the given platform, or the default fee if the platform is not found
  return fees[platform.toLowerCase()] || fees.default;
}

/**
 * Calculates amounts and prices for SHAD strategy
 * @param {number} recupTp1 - Recovery amount for TP1
 * @param {number} balance - Current balance
 * @param {number} totalShad - Total SHAD amount
 * @param {number} recupTpX - Recovery amount for TPX
 * @param {number} averageEntryPrice - Average entry price
 * @param {number} maxExposition - Maximum exposure allowed
 * @param {string} platform - Platform identifier
 * @returns {Object} Calculated amounts and prices for SHAD strategy
 */
function calculateAmountsAndPricesForShad(
  recupTp1,
  balance,
  totalShad,
  recupTpX,
  averageEntryPrice,
  maxExposition,
  platform
) {
  const FACTOR_SELL_SHAD = 0.5;
  const parsedValues = {
    recupTp1: parseFloat(recupTp1),
    balance: parseFloat(balance),
    recupTpX: parseFloat(recupTpX),
    averageEntryPrice: parseFloat(averageEntryPrice)
  };

  const platformFee = getPlatformFee(platform);
  const feeMultiplier = 1 + platformFee / 100;

  const amountTp1 = totalShad > -1
    ? FACTOR_SELL_SHAD * (parsedValues.recupTp1 / parsedValues.recupTpX) * parsedValues.balance
    : parsedValues.balance - maxExposition / parsedValues.averageEntryPrice;

  const priceTp1 = totalShad > -1
    ? (parsedValues.recupTp1 / amountTp1) * feeMultiplier
    : parsedValues.averageEntryPrice * feeMultiplier;

  const amountsAndPrices = { amountTp1, priceTp1 };

  let remainingBalance = parsedValues.balance - amountTp1;

  for (let i = 2; i <= 5; i++) {
    const { amount, price } = calculateAmountAndPriceForShad(
      parsedValues.recupTpX,
      remainingBalance,
      FACTOR_SELL_SHAD
    );

    amountsAndPrices[`amountTp${i}`] = amount;
    amountsAndPrices[`priceTp${i}`] = price * feeMultiplier;
    remainingBalance -= amount;
  }

  return amountsAndPrices;
}

module.exports = {
  getRecupTp1,
  getRecupTpX,
  getRecupShad,
  getDoneShad,
  calculateRecups,
  calculateAmountsAndPricesForShad,
};
