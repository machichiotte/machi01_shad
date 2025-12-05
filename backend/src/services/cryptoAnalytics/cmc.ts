// src/services/cryptoAnalytics/cmc.ts
import { config } from "@config/index"
import { MappedCmc } from "@typ/cmc"
import { CompactMappedCmc } from "@typ/cryptoAnalytics"

export function getCmcValues(cmc: MappedCmc): CompactMappedCmc {
  const getPercentChange = (value: number | undefined): number =>
    value !== undefined ? value / 100 : NaN
  return {
    rank: parseInt(cmc.cmc_rank?.toString() || '0'),
    currentCmcPrice: cmc.quote?.USD?.price
      ? parseFloat(cmc.quote.USD.price.toFixed(7))
      : NaN,
    iconUrl: cmc.id ? getIconUrl(cmc.id) : '',
    name: cmc.name,
    tags: cmc.tags,
    cryptoPercentChange24h: getPercentChange(cmc.quote?.USD?.percent_change_24h),
    cryptoPercentChange7d: getPercentChange(cmc.quote?.USD?.percent_change_7d),
    cryptoPercentChange30d: getPercentChange(cmc.quote?.USD?.percent_change_30d),
    cryptoPercentChange60d: getPercentChange(cmc.quote?.USD?.percent_change_60d),
    cryptoPercentChange90d: getPercentChange(cmc.quote?.USD?.percent_change_90d)
  }
}

export function getIconUrl(id: string | number): string {
  return `${config.apiConfig.cmc.base_url_icon}${parseInt(
    id.toString()
  )}.png`
}