// src/js/metrics/strategies.js
const ERROR_ALLOWED = 0.05;
const MAX_EXPO = 10000;

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

function getRecupTpX(assetStrat, maxExposition, ratioShad) {
  const result = (maxExposition * ratioShad * 0.5).toFixed(2);
  console.log(
    `Calculated result: ${result} (Potential for refinement based on strategy ${assetStrat})`
  );
  return result;
}

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

function getStrat(exchangeId, asset, strats) {
  // Rechercher la stratégie correspondante à l'actif donné
  const filteredStrat = strats.find((strat) => strat.asset === asset) || {};

  console.log("filtered", exchangeId + " " + asset + " " + filteredStrat);
  // Déterminer la stratégie et l'exposition maximale
  const strat = filteredStrat.strategies?.[exchangeId] || "No strategy";
  const stratExpo = filteredStrat.maxExposure?.[exchangeId] || MAX_EXPO;

  return { strat, stratExpo };
}

function getRatioShad(strat) {
  if (strat !== undefined) {
    switch (strat) {
      case "Shad":
        return 2;
      case "Shad skip x2":
        return 4;
      case "Strategy 3":
        return 8;
      case "Strategy 4":
        return 16;
      default:
        return "8"; // 'NULL' ou une valeur par défaut de votre choix
    }
  }
  // Gérez le cas où la structure n'est pas conforme à ce que vous attendez
  return "/"; // 'NULL' ou une valeur par défaut de votre choix
}

function calculateRecups(asset, platform, totalBuy, totalSell, strats) {
  //const { assetStrat, assetExpo } = item;

  const symbol = asset + "/USDT";

  let { strat, stratExpo } = getStrat(platform, symbol, strats);
  if (stratExpo === undefined) {
    stratExpo = MAX_EXPO;
  }

  /*if (assetStrat) {
    strat = assetStrat;
  }

  if (assetExpo) {
    stratExpo = assetExpo;
  }*/

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

function calculateAmountAndPrice(parsedRecup, parsedBalance, factor) {
  const amount = factor * parsedBalance;
  const price = parsedRecup / amount;

  return { amount, price };
}

function calculateAmountsAndPrices(
  recupTp1,
  balance,
  totalBuy,
  totalShad,
  recupTpX,
  averageEntryPrice,
  maxExposition
) {

  const PERCENT_SELL_SHAD = 0.5;
  const parsedRecupTp1 = parseFloat(recupTp1);
  const parsedBalance = parseFloat(balance);
  const parsedTotalBuy = parseFloat(totalBuy);
  const parsedRecupTpX = parseFloat(recupTpX);
  const parsedAverageEntryPrice = parseFloat(averageEntryPrice);

  let amountTp1;
  let priceTp1;

  if (totalShad > -1) {
    amountTp1 = PERCENT_SELL_SHAD * (parsedRecupTp1/parsedRecupTpX) * parsedBalance;
    priceTp1 = parsedRecupTp1 / parseFloat(amountTp1);
  } else {
    amountTp1 = parsedBalance - (maxExposition/parsedAverageEntryPrice);
    priceTp1 = parsedAverageEntryPrice;
  }

  const { amount: amountTp2, price: priceTp2 } = calculateAmountAndPrice(
    parsedRecupTpX,
    parsedBalance - amountTp1,
    0.5
  );
  const { amount: amountTp3, price: priceTp3 } = calculateAmountAndPrice(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2,
    0.5
  );
  const { amount: amountTp4, price: priceTp4 } = calculateAmountAndPrice(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2 - amountTp3,
    0.5
  );
  const { amount: amountTp5, price: priceTp5 } = calculateAmountAndPrice(
    parsedRecupTpX,
    parsedBalance - amountTp1 - amountTp2 - amountTp3 - amountTp4,
    0.5
  );

  return {
    amountTp1,
    amountTp2,
    amountTp3,
    amountTp4,
    amountTp5,
    priceTp1,
    priceTp2,
    priceTp3,
    priceTp4,
    priceTp5,
  };
  // }
}

module.exports = {
  getRecupTp1,
  getRecupTpX,
  getRecupShad,
  getDoneShad,
  calculateRecups,
  calculateAmountsAndPrices,
};
