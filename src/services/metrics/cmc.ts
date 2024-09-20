// src/services/metrics/cmc.ts
import { MappedCmc } from "@models/dbTypes"

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
 */
//function getCmcValues(cmc: MappedCmc[],currentPrice : number): CmcValues {
function getCmcValues(cmc: MappedCmc, currentPrice: number | undefined): CmcValues {
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

  const getPercentChange = (value: number | undefined): number | 'N/A' =>
    value !== undefined ? value / 100 : 'N/A'
  return {
    rank: parseInt(cmc.cmc_rank?.toString() || '0'),
    currentCmcPrice: cmc.quote?.USD?.price
      ? parseFloat(cmc.quote.USD.price.toFixed(7))
      : 'N/A',
    iconUrl: cmc.id ? getIconUrl(cmc.id) : '',
    cryptoPercentChange24h: getPercentChange(cmc.quote?.USD?.percent_change_24h),
    cryptoPercentChange7d: getPercentChange(cmc.quote?.USD?.percent_change_7d),
    cryptoPercentChange30d: getPercentChange(cmc.quote?.USD?.percent_change_30d),
    cryptoPercentChange60d: getPercentChange(cmc.quote?.USD?.percent_change_60d),
    cryptoPercentChange90d: getPercentChange(cmc.quote?.USD?.percent_change_90d)
  }
}

/**
 * Generates the URL for the cryptocurrency icon based on its CoinMarketCap ID.
 */
function getIconUrl(id: string | number): string {
  return `https://s2.coinmarketcap.com/static/img/coins/64x64/${parseInt(
    id.toString()
  )}.png`
}

export { getCmcValues, getIconUrl }