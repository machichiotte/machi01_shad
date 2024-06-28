// src/services/metrics/cmc.js
/**
 * Récupère les valeurs de CoinMarketCap pour un symbole donné.
 *
 * @param {string} symbol - Le symbole de la cryptomonnaie.
 * @param {Array} cmc - La liste des données de CoinMarketCap.
 * @returns {Object} - Un objet contenant les informations sur le symbole.
 */
function getCmcValues(symbol, cmc) {
  // Vérifiez que cmc est un tableau et non vide
  if (!Array.isArray(cmc) || cmc.length === 0) {
    return {
      rank: 0,
      currentPrice: "N/A",
      iconUrl: "",
      cryptoPercentChange24h: "N/A",
      cryptoPercentChange7d: "N/A",
      cryptoPercentChange30d: "N/A",
      cryptoPercentChange60d: "N/A",
      cryptoPercentChange90d: "N/A"
    };
  }

  // Trouvez l'élément dans le tableau cmc
  const crypto = cmc.find((item) => item.symbol === symbol) || {};

  // Utilisation de l'opérateur de chaîne optionnelle pour éviter les erreurs si les propriétés n'existent pas
  return {
    rank: parseInt(crypto.cmc_rank) || 0,
    currentPrice: crypto.quote?.USD?.price?.toFixed(7) || "N/A",
    iconUrl: crypto.id ? getIconUrl(crypto.id) : "",
    cryptoPercentChange24h: (crypto.quote?.USD?.percent_change_24h / 100) || "N/A",
    cryptoPercentChange7d: (crypto.quote?.USD?.percent_change_7d / 100) || "N/A",
    cryptoPercentChange30d: (crypto.quote?.USD?.percent_change_30d / 100) || "N/A",
    cryptoPercentChange60d: (crypto.quote?.USD?.percent_change_60d / 100) || "N/A",
    cryptoPercentChange90d: (crypto.quote?.USD?.percent_change_90d / 100) || "N/A"
  };
}


function getIconUrl(id) {
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${parseInt(
    id
  )}.png`;
}

module.exports = { getCmcValues };
