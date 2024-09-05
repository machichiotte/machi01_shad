// src/services/mapping.js

const stableCoins = [
  "USDT",
  "USDC",
  "DAI",
  "FDUSD",
  "USDD",
  "TUSD",
  "FRAX",
  "PYUSD",
  "USDJ",
  "USDP",
  "GUSD",
  "LUSD",
];
const cryptoMajorPairs = ["BTC", "ETH"];

function isStableCoin(symbol) {
  return stableCoins.includes(symbol.toUpperCase());
}

function isMajorCryptoPair(symbol) {
  return cryptoMajorPairs.includes(symbol.toUpperCase());
}

// Utility function to get the value in USDT
function getTotalUSDT(symbol, cost, conversionRates = {}) {
  const [baseAsset, quoteAsset] = symbol.split("/");
  if (!quoteAsset || !baseAsset) {
    console.error(`Invalid symbol format: ${symbol}`);
    return null;
  }

  if (isStableCoin(quoteAsset)) {
    return parseFloat(cost);
  }

  if (quoteAsset in conversionRates) {
    return parseFloat(cost) * conversionRates[quoteAsset];
  }

  //console.warn(`Conversion rate for ${quoteAsset} not found.`);
  return null;
}

function mapBalanceCommon(base, balance, available, platform) {
  return {
    base,
    balance: parseFloat(balance),
    available: parseFloat(available),
    platform,
  };
}

function mapBalance(platform, data) {
  const mappings = {
    binance: (item) => mapBalanceCommon(
      item.asset,
      parseFloat(item.free) + parseFloat(item.locked),
      item.free,
      platform
    ),
    kucoin: (item) => mapBalanceCommon(
      item.currency,
      item.balance,
      item.available,
      platform
    ),
    htx: ([key, value]) => mapBalanceCommon(
      key.toUpperCase(),
      value.total,
      value.free,
      platform
    ),
    okx: (item) => mapBalanceCommon(
      item.ccy,
      item.cashBal,
      item.availBal,
      platform
    ),
    gateio: (item) => mapBalanceCommon(
      item.currency,
      parseFloat(item.available) + parseFloat(item.locked),
      item.available,
      platform
    ),
  };

  const platformMapping = mappings[platform];
  if (!platformMapping) {
    console.warn(`Plateforme ${platform} non supportée.`);
    return [];
  }

  const balanceData = Array.isArray(data.info.balances || data.info.data || data) 
    ? (data.info.balances || data.info.data || data)
    : Object.entries(data).filter(([key, value]) => !['info', 'free', 'used', 'total'].includes(key) && value.total > 0);

  return balanceData
    .filter(item => {
      const balance = parseFloat(item.balance || item.free || item.cashBal || item.available || item.locked || item[1]?.total || 0);
      return balance > 0;
    })
    .map(platformMapping);
}


function mapTradeCommon(item, platform, conversionRates = {}) {
  const [baseAsset, quoteAsset] = item.symbol.toUpperCase().split("/");
  const totalUSDT = getTotalUSDT(item.symbol.toUpperCase(), item.cost, conversionRates);

  const feeCost = item.fee ? parseFloat(item.fee.cost) : 0;
  const feeCurrency = item.fee ? item.fee.currency.toUpperCase() : "N/A";

  return {
    base: baseAsset,
    quote: quoteAsset,
    pair: item.symbol.toUpperCase(),
    timestamp: item.timestamp,
    type: item.side,
    price: parseFloat(item.price),
    amount: parseFloat(item.amount),
    total: parseFloat(item.cost),
    fee: feeCost,
    feecoin: feeCurrency,
    platform,
    totalUSDT,
  };
}

function mapTrades(platform, data, conversionRates = {}) {
  return data.map((item) => {
    const commonData = mapTradeCommon(item, platform, conversionRates);
    if (platform === 'okx' && data.info && data.info.data && data.info.data[0] && data.info.data[0].details) {
      return data.info.data[0].details.map((item) => mapTradeCommon(item, "okx", conversionRates));
    }
    return commonData;
  }).flat();
}

function mapOrders(platform, data) {
  return data.map((item) => ({
    oId: item.id,
    cId: item.clientOrderId,
    platform,
    symbol: item.symbol,
    type: item.type,
    side: item.side,
    amount: item.amount,
    price: item.price,
  }));
}

function mapTickers(data, platform) {
  return Object.values(data).map((item) => ({
    symbol: item.symbol,
    timestamp: item.timestamp,
    last: item.last,
    platform,
  }));
}

function mapMarkets(data, platform) {
  return Object.values(data)
    .filter(
      (item) => item.quote.endsWith("USDT") || item.quote.endsWith("BUSD") //here all stableCoins instead of only 2
    )
    .map((item) => ({
      symbol: item.id,
      base: item.base,
      quote: item.quote,
      active: item.active,
      type: item.type,
      amountMin: item.limits?.amount?.min || "N/A",
      priceMin: item.limits?.price?.min || "N/A",
      costMin: item.limits?.cost?.min || "N/A",
      taker: item.taker,
      maker: item.maker,
      precisionAmount: item.precision?.amount || "N/A",
      precisionPrice: item.precision?.price || "N/A",
      platform,
    }));
}


function mapTradesAddedManually(data) {
  return data.map((item) => ({
    date: item.date,
    base: item.base,
    quote: item.quote,
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
