// src/services/mapping.js
function mapBalance(platform, data) {
  //console.log('map balance :: ' + JSON.stringify(data));
  switch (platform) {
    case "binance":
      return data.info.balances
        .filter((item) => parseFloat(item.free) > 0 || parseFloat(item.locked))
        .map((item) => ({
          symbol: item.asset,
          balance: parseFloat(item.free) + parseFloat(item.locked),
          available: item.free,
          platform: platform,
        }));
    case "kucoin":
      return data.info.data
        .filter((item) => parseFloat(item.balance) > 0)
        .map((item) => ({
          symbol: item.currency,
          balance: item.balance,
          available: item.available,
          platform: platform,
        }));
    case "htx":
      return Object.entries(data)
        .filter(
          ([key, value]) =>
            key !== "info" &&
            key !== "free" &&
            key !== "used" &&
            key !== "total" &&
            value.total > 0
        )
        .map(([key, value]) => ({
          symbol: key.toUpperCase(),
          balance: value.total,
          available: value.free,
          platform: platform,
        }));
    case "okx":
      return data.info.data[0].details
        .filter((item) => parseFloat(item.cashBal) > 0)
        .map((item) => ({
          symbol: item.ccy,
          balance: item.cashBal,
          available: item.availBal,
          platform: platform,
        }));
    case "gateio":
      return data.info
        .filter(
          (item) => parseFloat(item.available) > 0 || parseFloat(item.locked)
        )
        .map((item) => ({
          symbol: item.currency,
          balance: parseFloat(item.available) + parseFloat(item.locked),
          available: item.available,
          platform: platform,
        }));
  }
}

// Fonction utilitaire pour obtenir la valeur de totalUSDT
function getTotalUSDT(symbol, cost) {
  const stableCoins = ["USDT", "USDC", "DAI", "FDUSD", "USDD", "TUSD", "FRAX", "PYUSD", "USDJ", "USDP", "GUSD", "LUSD"];

  // Vérifier si altB est un stable coin adossé au dollar
  const isStableCoin = stableCoins.includes(symbol.split("/")[1].toUpperCase());

  // Si altB est un stable coin, renvoyer la valeur de cost, sinon renvoyer null
  return isStableCoin ? parseFloat(cost) : null;

  //TODO rajouter les cas ou le second symbol est BTC ou ETH ( faire appel a la base de donnee pour recuperer la valeur de btc au timestamp / date donnee)
}

function mapBinanceTrades(data) {
  return data.map((item) => {
    console.log('binance trade item', item);
    const splitSymbol = item.symbol.split("/"); 
    const totalUSDT = getTotalUSDT(item.symbol, item.cost); 

    return {
      altA: splitSymbol[0], 
      altB: splitSymbol[1], 
      pair: item.symbol, 
      timestamp: item.timestamp,
      type: item.takerOrMaker,
      type: item.side,
      price: parseFloat(item.price), 
      amount: parseFloat(item.amount), 
      total: parseFloat(item.cost), 
      fee: parseFloat(item.fee.cost), 
      feecoin: item.fee.currency,
      platform: "binance",
      totalUSDT: totalUSDT, 
    };
  });
}

// Fonction de mapping pour Kucoin
function mapKucoinTrades(data) {
  return data.map((item) => {
    console.log('kucoin trade item', item);

    const splitSymbol = item.symbol.split("/"); 
    const totalUSDT = getTotalUSDT(item.symbol, item.cost); 

    return {
      altA: splitSymbol[0], 
      altB: splitSymbol[1], 
      timestamp: item.timestamp,
      pair: item.symbol, 
      type: item.side,
      price: parseFloat(item.price), 
      amount: parseFloat(item.amount), 
      total: parseFloat(item.cost), 
      fee: parseFloat(item.fee.cost), 
      feecoin: item.fee.currency,
      feeRate: item.fee.rate,
      platform: "kucoin",
      totalUSDT: totalUSDT, 
    };
  });
}

// Fonction de mapping pour HTX
function mapHtxTrades(data) {
  return data.map((item) => {
    console.log('htx trade item', item);

    const splitSymbol = item.symbol.split("/"); 
    const totalUSDT = getTotalUSDT(item.symbol, item.cost); 

    return {
      altA: splitSymbol[0], 
      altB: splitSymbol[1], 
      pair: item.symbol, 

      timestamp: item.timestamp,
      type: item.side,
      price: parseFloat(item.price), 
      amount: parseFloat(item.amount), 
      total: parseFloat(item.cost), 
      fee: parseFloat(item.fee.cost), 
      feecoin: item.fee.currency,
      feeRate: item.fee.rate,
      platform: "htx",
      totalUSDT: totalUSDT, 
    };
  });
}

function mapOkxTrades(data) {
  //surement faux, il faudra modifier
  return data.map((item) => {
    console.log('okx trade item', item);

    const splitSymbol = item.symbol.split("/"); 
    const totalUSDT = getTotalUSDT(item.symbol, item.cost); 

    return {
      altA: splitSymbol[0], 
      altB: splitSymbol[1], 
      pair: item.symbol, 
      timestamp: item.timestamp,
      type: item.side,
      price: parseFloat(item.price), 
      amount: parseFloat(item.amount), 
      total: parseFloat(item.cost), 
      fee: parseFloat(item.fee.cost), 
      feecoin: item.fee.currency,
      feeRate: item.fee.rate,
      platform: "htx",
      totalUSDT: totalUSDT, 
    };
  });
}
function mapGateioTrades(data) {
  //surement faux, il faudra modifier

  return data.map((item) => {
    console.log('gateio trade item', item);

    const splitSymbol = item.symbol.split("/"); 
    const totalUSDT = getTotalUSDT(item.symbol, item.cost); 

    return {
      altA: splitSymbol[0], 
      altB: splitSymbol[1], 
      timestamp: item.timestamp,
      type: item.side,
      price: parseFloat(item.price), 
      amount: parseFloat(item.amount), 
      total: parseFloat(item.cost), 
      fee: parseFloat(item.fee.cost), 
      feecoin: item.fee.currency,
      feeRate: item.fee.rate,
      platform: "htx",
      totalUSDT: totalUSDT, 
    };
  });
}

function mapTrades(platform, data) {
  switch (platform) {
    case "binance":
      return mapBinanceTrades(data);
    case "kucoin":
      return mapKucoinTrades(data);
    case "htx":
      return mapHtxTrades(data);
    case "okx":
      return mapOkxTrades(data);
    case "gateio":
      return mapGateioTrades(data);
  }
}

function mapTickers(data) {
  return Object.keys(data).map((symbol) => {
    const item = data[symbol];
    return {
      symbol: item.symbol,
      timestamp: item.timestamp,
      last: item.last,
    };
  });
}

function mapOrders(platform, data) {
  // console.log('map active orders :: ' + JSON.stringify(data));
  return data.map((item) => ({
    oId: item.id,
    cId: item.clientOrderId,
    platform: platform,
    symbol: item.symbol,
    type: item.type,
    side: item.side,
    amount: item.amount,
    price: item.price,
  }));
}

function mapMarkets(platform, data) {
  // console.log('map load markets :: ' + JSON.stringify(data));

  let objArray = [];

  for (const symbol in data) {
    const pairInfo = data[symbol];
    console.log(`Informations pour la paire ${symbol} : `, pairInfo);

    objArray.push({
      symbol: pairInfo.id,
      base: pairInfo.base,
      quote: pairInfo.quote,
      active: pairInfo.active,
      type: pairInfo.type,
      amountMin: pairInfo.limits.amount.min,
      priceMin: pairInfo.limits.price ? pairInfo.limits.price.min : "N/A",
      costMin: pairInfo.limits.cost ? pairInfo.limits.cost.min : "N/A",
      taker: pairInfo.taker,
      maker: pairInfo.maker,
      precisionAmount: pairInfo.precision.amount,
      precisionPrice: pairInfo.precision.price,
      platform: platform,
    });
  }
  const filteredArray = objArray.filter(
    (item) => item.quote.endsWith("USDT") || item.quote.endsWith("BUSD")
  );
  return filteredArray;
}

function mapTradesAddedManually(data) {
  return data.map((item) => ({
    date: item.date,
    altA: item.altA,
    altB: item.altB,
    type: item.type,
    price: item.price,
    amount: item.amount,
    total: item.total,
    fee: item.fee,
    feecoin: item.feecoin,
    platform: item.platform,
    explatform: item.explatform,
    pair: item.pair,
  }));
}

module.exports = {
  mapBalance,
  mapOrders,
  mapMarkets,
  mapTrades,
  mapTradesAddedManually,
  mapTickers,
};
