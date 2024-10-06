// src/js/utils/strategyUtils.ts
export function getSelectedStrategy(strat: { value: { asset: string; strategies: { [key: string]: string } }[] }, asset: string, platform: string): string {
  const item = strat.value.find((item) => item.asset === asset)
  return item ? item.strategies[platform] || '' : ''
}

export function setSelectedStrategy(strat: { value: { asset: string; strategies: { [key: string]: string } }[] }, asset: string, platform: string, value: string): void {
  const item = strat.value.find((item) => item.asset === asset)
  if (item) {
    item.strategies[platform] = value
  }
}

export function isDisabled(balance: { value: { base: string; platform: string }[] }, asset: string, platform: string): boolean {
  const assetsFiltered = balance.value.filter((item) => item.base === asset)
  const platformsFiltered = assetsFiltered.map((item) => item.platform)
  return !platformsFiltered.includes(platform)
}

export function getSelectedMaxExposure(strat: { value: { asset: string; maxExposure: { [key: string]: string } }[] }, asset: string, platform: string): string {
  const item = strat.value.find((item) => item.asset === asset)
  return item ? item.maxExposure[platform] || '' : ''
}

export function setSelectedMaxExposure(strat: { value: { asset: string; maxExposure: { [key: string]: string } }[] }, asset: string, platform: string, value: string): void {
  const item = strat.value.find((item) => item.asset === asset)
  if (item) {
    item.maxExposure[platform] = value
  }
}
