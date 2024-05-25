// src/services/metrics/cmc.js
function getCmcValues(symbol, cmc) {
  const crypto = cmc.find((item) => item.symbol === symbol) || {};

  return {
    rank: parseInt(crypto.cmc_rank) || 0,
    currentPrice: crypto.quote?.USD?.price.toFixed(7) || "N/A",
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

function getIconUrl(id) {
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${parseInt(
    id
  )}.png`;
}

module.exports = { getCmcValues };
