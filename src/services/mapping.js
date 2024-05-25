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

  if (isStableCoin(quoteAsset)) {
    return parseFloat(cost);
  }

  if (quoteAsset in conversionRates) {
    return parseFloat(cost) * conversionRates[quoteAsset];
  }

  return null;
}

function mapBalanceCommon(symbol, balance, available, platform) {
  return {
    symbol,
    balance: parseFloat(balance),
    available: parseFloat(available),
    platform,
  };
}

function mapBalance(platform, data) {
  switch (platform) {
    case "binance":
      return data.info.balances
        .filter(
          (item) => parseFloat(item.free) > 0 || parseFloat(item.locked) > 0
        )
        .map((item) =>
          mapBalanceCommon(
            item.asset,
            parseFloat(item.free) + parseFloat(item.locked),
            item.free,
            platform
          )
        );
    case "kucoin":
      return data.info.data
        .filter((item) => parseFloat(item.balance) > 0)
        .map((item) =>
          mapBalanceCommon(
            item.currency,
            item.balance,
            item.available,
            platform
          )
        );
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
        .map(([key, value]) =>
          mapBalanceCommon(key.toUpperCase(), value.total, value.free, platform)
        );
    case "okx":
      return data.info.data[0].details
        .filter((item) => parseFloat(item.cashBal) > 0)
        .map((item) =>
          mapBalanceCommon(item.ccy, item.cashBal, item.availBal, platform)
        );
    case "gateio":
      return data.info
        .filter(
          (item) =>
            parseFloat(item.available) > 0 || parseFloat(item.locked) > 0
        )
        .map((item) =>
          mapBalanceCommon(
            item.currency,
            parseFloat(item.available) + parseFloat(item.locked),
            item.available,
            platform
          )
        );
    default:
      return [];
  }
}

function mapTradeCommon(item, platform, conversionRates = {}) {
  const [baseAsset, quoteAsset] = item.symbol.split("/");
  const totalUSDT = getTotalUSDT(item.symbol, item.cost, conversionRates);

  const feeCost = item.fee ? parseFloat(item.fee.cost) : 0;
  const feeCurrency = item.fee ? item.fee.currency : "N/A";

  return {
    altA: baseAsset,
    altB: quoteAsset,
    pair: item.symbol,
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

function mapBinanceTrades(data, conversionRates = {}) {
  return data.map((item) => mapTradeCommon(item, "binance", conversionRates));
}

function mapKucoinTrades(data, conversionRates = {}) {
  return data.map((item) => mapTradeCommon(item, "kucoin", conversionRates));
}

function mapHtxTrades(data, conversionRates = {}) {
  return data.map((item) => mapTradeCommon(item, "htx", conversionRates));
}

function mapOkxTrades(data, conversionRates = {}) {
  return data.info.data[0].details.map((item) =>
    mapTradeCommon(item, "okx", conversionRates)
  );
}

function mapGateioTrades(data, conversionRates = {}) {
  return data.map((item) => mapTradeCommon(item, "gateio", conversionRates));
}

function mapTrades(platform, data, conversionRates = {}) {
  switch (platform) {
    case "binance":
      return mapBinanceTrades(data, conversionRates);
    case "kucoin":
      return mapKucoinTrades(data, conversionRates);
    case "htx":
      return mapHtxTrades(data, conversionRates);
    case "okx":
      return mapOkxTrades(data, conversionRates);
    case "gateio":
      return mapGateioTrades(data, conversionRates);
    default:
      return [];
  }
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

function mapMarkets(platform, data) {
  return Object.values(data)
    .filter(
      (item) => item.quote.endsWith("USDT") || item.quote.endsWith("BUSD")
    )
    .map((item) => ({
      symbol: item.id,
      base: item.base,
      quote: item.quote,
      active: item.active,
      type: item.type,
      amountMin: item.limits.amount.min,
      priceMin: item.limits.price ? item.limits.price.min : "N/A",
      costMin: item.limits.cost ? item.limits.cost.min : "N/A",
      taker: item.taker,
      maker: item.maker,
      precisionAmount: item.precision.amount,
      precisionPrice: item.precision.price,
      platform,
    }));
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
