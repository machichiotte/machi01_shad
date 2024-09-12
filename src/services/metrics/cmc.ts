// src/services/metrics/cmc.ts

interface CmcData {
  cmc_rank?: string
  quote?: {
    USD?: {
      price?: number
      percent_change_24h?: number
      percent_change_7d?: number
      percent_change_30d?: number
      percent_change_60d?: number
      percent_change_90d?: number
    }
  }
  id?: string | number
}

interface CmcValues {
  rank: number
  currentCmcPrice: number | 'N/A'
  iconUrl: string
  cryptoPercentChange24h: number | 'N/A'
  cryptoPercentChange7d: number | 'N/A'
  cryptoPercentChange30d: number | 'N/A'
  cryptoPercentChange60d: number | 'N/A'
  cryptoPercentChange90d: number | 'N/A'
}

/**
 * Retrieves CoinMarketCap values for a given object.
 *
 * @param {CmcData} cmc - The CoinMarketCap data object.
 * @returns {CmcValues} - An object containing information about the cryptocurrency.
 */
//function getCmcValues(cmc: CmcData[],currentPrice : number): CmcValues {
function getCmcValues(cmc: CmcData[], currentPrice: number | undefined): CmcValues {
  if (!Array.isArray(cmc) || cmc.length === 0 || currentPrice === undefined) {
    return {
      rank: 0,
      currentCmcPrice: 'N/A',
      iconUrl: '',
      cryptoPercentChange24h: 'N/A',
      cryptoPercentChange7d: 'N/A',
      cryptoPercentChange30d: 'N/A',
      cryptoPercentChange60d: 'N/A',
      cryptoPercentChange90d: 'N/A'
    }
  }

  // Trouver le CMC avec le prix le plus proche du prix actuel
  const cmcData = cmc.reduce((closest, current) => {
    const closestPrice = closest.quote?.USD?.price || 0;
    const closestDiff = Math.abs(closestPrice - currentPrice);
    const currentDiff = Math.abs(currentPrice - currentPrice);
    return currentDiff < closestDiff ? current : closest;
  });

  const getPercentChange = (value: number | undefined): number | 'N/A' =>
    value !== undefined ? value / 100 : 'N/A'

  return {
    rank: parseInt(cmcData.cmc_rank || '0') || 0,
    currentCmcPrice: cmcData.quote?.USD?.price
      ? parseFloat(cmcData.quote.USD.price.toFixed(7))
      : 'N/A',
    iconUrl: cmcData.id ? getIconUrl(cmcData.id) : '',
    cryptoPercentChange24h: getPercentChange(cmcData.quote?.USD?.percent_change_24h),
    cryptoPercentChange7d: getPercentChange(cmcData.quote?.USD?.percent_change_7d),
    cryptoPercentChange30d: getPercentChange(cmcData.quote?.USD?.percent_change_30d),
    cryptoPercentChange60d: getPercentChange(cmcData.quote?.USD?.percent_change_60d),
    cryptoPercentChange90d: getPercentChange(cmcData.quote?.USD?.percent_change_90d)
  }
}

/**
 * Generates the URL for the cryptocurrency icon based on its CoinMarketCap ID.
 *
 * @param {string|number} id - The CoinMarketCap ID of the cryptocurrency.
 * @returns {string} - The URL of the cryptocurrency icon.
 */
function getIconUrl(id: string | number): string {
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${parseInt(
    id.toString()
  )}.png`
}

export { getCmcValues, getIconUrl }
