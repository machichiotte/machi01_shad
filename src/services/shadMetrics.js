// src/services/shadMetrics.js

const MAX_EXPO = 10000;
const ERROR_ALLOWED = 0.05;

function getProfit(totalBuy, totalSell, currentPrice, balance) {
  const buyTotal = parseFloat(totalBuy);
  const sellTotal = parseFloat(totalSell);
  const price = parseFloat(currentPrice);
  const bal = parseFloat(balance);

  if (isNaN(buyTotal) || isNaN(sellTotal) || isNaN(price) || isNaN(bal)) {
    return "N/A";
  }

  const totalInvestment = buyTotal - sellTotal;
  const currentValue = price * bal;
  const profit = currentValue - totalInvestment;

  return profit.toFixed(2);
}

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
      //return difference.toFixed(2) // Round and return with 2 decimal places
    } else {
      const result = (totalSell - (totalBuy - maxExposition)) / maxExposition;
      const decimalPart = result - Math.floor(result);
      valueToRecup = decimalPart * maxExposition;
      //return result2.toFixed(2) // Round and return with 2 decimal places
    }
  } else if (
    (totalShad + 1) * totalBuy > totalSell &&
    totalShad * totalBuy < (1 - ERROR_ALLOWED) * totalSell
  ) {
    valueToRecup = recupTpX - (totalShad + 1) * totalBuy - totalSell;
    // return adjustedValue.toFixed(2) // Round and return with 2 decimal places
  }

  if (valueToRecup > 5.05) {
    return valueToRecup;
  }

  return recupTpX; // Round and return with 2 decimal places
}

function getRecupTpX(assetStrat, maxExposition, ratioShad) {
  const result = (maxExposition * ratioShad * 0.5).toFixed(2);

  // Log a message indicating potential future refinement based on strategy
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

function getTotalAmountAndBuy(asset, trades) {
  const filteredTrades = trades.filter(
    (trade) => trade.altA === asset && trade.type === "buy"
  );
  const totalBuy = filteredTrades.reduce(
    (total, trade) => total + parseFloat(trade.totalUSDT),
    0
  );
  const totalAmount = filteredTrades.reduce(
    (total, trade) => total + parseFloat(trade.amount),
    0
  );

  const averageEntryPrice = (
    parseFloat(totalBuy) / parseFloat(totalAmount)
  ).toFixed(8);

  return {
    totalAmount,
    totalBuy: totalBuy.toFixed(2),
    averageEntryPrice,
  };
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

function getTotalSell(asset, trades) {
  const filteredTrades = trades.filter(
    (trade) => trade.altA === asset && trade.type === "sell"
  );
  const sellTotal = filteredTrades.reduce(
    (total, trade) => total + parseFloat(trade.totalUSDT),
    0
  );

  return Math.round(sellTotal, 2);
}

//TODO add by platform
function getBalance(asset, sortedBalances) {
  const balance = sortedBalances.find((item) => item.symbol === asset);
  return balance ? balance.balance : "N/A";
}

function getIconUrl(id) {
  const baseIconUrl = "https://s2.coinmarketcap.com/static/img/coins/32x32/";
  return `${baseIconUrl}${parseInt(id)}.png`;
}

function getCmcValues(asset, cmc) {
  const crypto = cmc.find((item) => item.symbol === asset) || {};

  return {
    rank: parseInt(crypto.cmc_rank) || 0,
    iconUrl: crypto.id ? getIconUrl(crypto.id) : "",
    cryptoPercentChange24h:
      crypto.quote?.USD?.percent_change_24h / 100 || "N/A",
    cryptoPercentChange7d: crypto.quote?.USD?.percent_change_7d / 100 || "N/A",
    cryptoPercentChange30d:
      crypto.quote?.USD?.percent_change_30d / 100 || "N/A",
    cryptoPercentChange60d:
      crypto.quote?.USD?.percent_change_60d / 100 || "N/A",
    cryptoPercentChange90d:
      crypto.quote?.USD?.percent_change_90d / 100 || "N/A",
  };
}

function getPercentageDifference(currentPrice, averageEntryPrice) {
  const price = parseFloat(currentPrice);
  const avgEntryPrice = parseFloat(averageEntryPrice);
  if (isNaN(price) || isNaN(avgEntryPrice)) {
    return "N/A";
  }
  const percentageDifference = (price - avgEntryPrice) / avgEntryPrice;
  return percentageDifference.toFixed(2);
}

function getCurrentPossession(currentPrice, balance) {
  if (isNaN(currentPrice) || isNaN(balance)) {
    return 0;
  }
  const currentPossession = (currentPrice * balance).toFixed(2);
  return currentPossession;
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
  averageEntryPrice
) {
  const parsedRecupTp1 = parseFloat(recupTp1);
  const parsedBalance = parseFloat(balance);
  const parsedTotalBuy = parseFloat(totalBuy);
  const parsedRecupTpX = parseFloat(recupTpX);
  const parsedAverageEntryPrice = parseFloat(averageEntryPrice);

  let amountTp1;
  let priceTp1;

  if (totalShad > -1) {
    amountTp1 = 0.5 * parsedBalance;
    priceTp1 = parsedRecupTp1 / parseFloat(amountTp1);
  } else {
    if (parsedRecupTp1 / parsedAverageEntryPrice <= parsedBalance) {
      priceTp1 = parsedAverageEntryPrice;
      amountTp1 = parsedRecupTp1 / parsedAverageEntryPrice;
    } else {
      amountTp1 = 0.5 * parsedBalance;
      priceTp1 = parsedRecupTp1 / parseFloat(amountTp1);
    }
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

function getStatus(
  openSellOrders,
  amountTp1,
  amountTp2,
  amountTp3,
  amountTp4,
  amountTp5,
  priceTp1,
  priceTp2,
  priceTp3,
  priceTp4,
  priceTp5
) {
  const THRESHOLD = 0.01; // 1% threshold

  // Fonction pour vérifier si deux valeurs sont proches l'une de l'autre avec une marge d'erreur
  const isClose = (value1, value2) => {
    return Math.abs((value1 - value2) / value1) <= THRESHOLD;
  };
  // Initialiser un tableau de résultats avec des valeurs par défaut à 0
  const results = [0, 0, 0, 0, 0];

  // Vérifier chaque paire d'openSellOrders par rapport à chaque paire d'amount et price
  openSellOrders.forEach((order) => {
    if (isClose(order.amount, amountTp1) && isClose(order.price, priceTp1)) {
      results[0] = 1;
    }
    if (isClose(order.amount, amountTp2) && isClose(order.price, priceTp2)) {
      results[1] = 1;
    }
    if (isClose(order.amount, amountTp3) && isClose(order.price, priceTp3)) {
      results[2] = 1;
    }
    if (isClose(order.amount, amountTp4) && isClose(order.price, priceTp4)) {
      results[3] = 1;
    }
    if (isClose(order.amount, amountTp5) && isClose(order.price, priceTp5)) {
      results[4] = 1;
    }
  });

  return results;
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

function getAllCalculs(
  asset,
  exchangeId,
  lastCmc,
  lastBalance,
  lastTrades,
  lastOpenOrders,
  lastStrategies,
  lastTickers
) {
  //TODO add cmc, trades, strats, buyOrders, sellOrders

  console.log('getAllCalculs')
  console.log('asset', asset)
  const symbol = asset + "/USDT";
  const balance = getBalance(asset, lastBalance);
  console.log('balance',balance)

  const {
    rank,
    iconUrl,
    cryptoPercentChange24h,
    cryptoPercentChange7d,
    cryptoPercentChange30d,
    cryptoPercentChange60d,
    cryptoPercentChange90d,
  } = getCmcValues(asset, lastCmc);

  console.log('rank',rank);

  const currentPrice = lastTickers.filter(
    (ticker) =>
      ticker.symbol === asset + "/USDT" && ticker.platform === exchangeId
  );
  console.log('currentPrice',currentPrice);

  const totalSell = getTotalSell(asset, lastTrades);

  const buyOrders = lastOpenOrders.filter(
    (order) => order.side === "buy" && order.platform === exchangeId
  );
  const sellOrders = lastOpenOrders.filter(
    (order) => order.side === "sell" && order.platform === exchangeId
  );

  const openBuyOrders = buyOrders.filter((order) => {
    const [leftSymbol] = order.symbol.split("/");
    return leftSymbol === asset;
  });

  const openSellOrders = sellOrders.filter((order) => {
    const [leftSymbol] = order.symbol.split("/");
    return leftSymbol === asset;
  });
  console.log('openSellOrders',openSellOrders);

  const { totalAmount, totalBuy, averageEntryPrice } = getTotalAmountAndBuy(
    symbol,
    lastTrades
  );

  const currentPossession = getCurrentPossession(currentPrice, balance);
  const profit = getProfit(totalBuy, totalSell, currentPrice, balance);

  const {
    strat,
    stratExpo,
    maxExposition,
    ratioShad,
    recupTpX,
    recupShad,
    recupTp1,
    totalShad,
  } = calculateRecups(asset, platform, totalBuy, totalSell, lastStrategies);

  const {
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
  } = calculateAmountsAndPrices(
    recupTp1,
    balance,
    totalBuy,
    totalShad,
    recupTpX,
    averageEntryPrice
  );

  const percentageDifference = getPercentageDifference(
    currentPrice,
    averageEntryPrice
  );

  const status = getStatus(
    openSellOrders,
    amountTp1,
    amountTp2,
    amountTp3,
    amountTp4,
    amountTp5,
    priceTp1,
    priceTp2,
    priceTp3,
    priceTp4,
    priceTp5
  );

  const percentToNextTp = (priceTp1 - currentPrice) / currentPrice;

  return {
    iconUrl,
    asset: symbol,
    status,
    strat,
    ratioShad,
    totalShad,
    rank,
    averageEntryPrice,
    totalBuy,
    maxExposition,
    percentageDifference,
    currentPrice,
    currentPossession,
    profit,
    totalSell,
    recupShad,
    nbOpenBuyOrders: openBuyOrders.length,
    nbOpenSellOrders: openSellOrders.length,
    totalAmount,
    balance,
    recupTp1,
    recupTpX,
    amountTp1,
    priceTp1,
    amountTp2,
    priceTp2,
    amountTp3,
    priceTp3,
    amountTp4,
    priceTp4,
    amountTp5,
    priceTp5,
    cryptoPercentChange24h,
    cryptoPercentChange7d,
    cryptoPercentChange30d,
    cryptoPercentChange60d,
    cryptoPercentChange90d,
    exchangeId,
    percentToNextTp,
  };
}

module.exports = { getAllCalculs };
