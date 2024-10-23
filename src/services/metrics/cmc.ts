// src/services/metrics/cmc.ts
import { MappedCmc } from "@typ/cmc"

interface CmcValues {
  rank: number,
  name: string,
  currentCmcPrice: number
  iconUrl: string
  cryptoPercentChange24h: number
  cryptoPercentChange7d: number
  cryptoPercentChange30d: number
  cryptoPercentChange60d: number
  cryptoPercentChange90d: number
}

/**
 * Retrieves CoinMarketCap values for a given object.
 */
//function getCmcValues(cmc: MappedCmc[],currentPrice : number): CmcValues {
function getCmcValues(cmc: MappedCmc, currentPrice: number | undefined): CmcValues {
  if (currentPrice === undefined) {

    return {
      rank: 0,
      name: '',
      currentCmcPrice: NaN,
      iconUrl: '',
      cryptoPercentChange24h: NaN,
      cryptoPercentChange7d: NaN,
      cryptoPercentChange30d: NaN,
      cryptoPercentChange60d: NaN,
      cryptoPercentChange90d: NaN
    }
  }

  const getPercentChange = (value: number | undefined): number =>
    value !== undefined ? value / 100 : NaN
  return {
    rank: parseInt(cmc.cmc_rank?.toString() || '0'),
    currentCmcPrice: cmc.quote?.USD?.price
      ? parseFloat(cmc.quote.USD.price.toFixed(7))
      : NaN,
    iconUrl: cmc.id ? getIconUrl(cmc.id) : '',
    name: cmc.name,
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