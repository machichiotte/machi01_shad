// src/services/metrics/cmc.js
/**
 * Retrieves CoinMarketCap values for a given object.
 *
 * @param {Object} cmc - The CoinMarketCap data object.
 * @returns {Object} - An object containing information about the cryptocurrency.
 */
function getCmcValues(cmc) {
  if (typeof cmc !== 'object' || cmc === null || Object.keys(cmc).length === 0) {
    return {
      rank: 0,
      currentCmcPrice: "N/A",
      iconUrl: "",
      cryptoPercentChange24h: "N/A",
      cryptoPercentChange7d: "N/A",
      cryptoPercentChange30d: "N/A",
      cryptoPercentChange60d: "N/A",
      cryptoPercentChange90d: "N/A"
    };
  }

  const getPercentChange = (value) => (value / 100) || "N/A";

  return {
    rank: parseInt(cmc.cmc_rank) || 0,
    currentCmcPrice: parseFloat(cmc.quote?.USD?.price?.toFixed(7)) || "N/A",
    iconUrl: cmc.id ? getIconUrl(cmc.id) : "",
    cryptoPercentChange24h: getPercentChange(cmc.quote?.USD?.percent_change_24h),
    cryptoPercentChange7d: getPercentChange(cmc.quote?.USD?.percent_change_7d),
    cryptoPercentChange30d: getPercentChange(cmc.quote?.USD?.percent_change_30d),
    cryptoPercentChange60d: getPercentChange(cmc.quote?.USD?.percent_change_60d),
    cryptoPercentChange90d: getPercentChange(cmc.quote?.USD?.percent_change_90d)
  };
}

/**
 * Generates the URL for the cryptocurrency icon based on its CoinMarketCap ID.
 *
 * @param {string|number} id - The CoinMarketCap ID of the cryptocurrency.
 * @returns {string} - The URL of the cryptocurrency icon.
 */
function getIconUrl(id) {
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${parseInt(
    id
  )}.png`;
}

module.exports = { getCmcValues };
