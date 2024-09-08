/**
 * @param {Object} strat
 * @param {string} asset
 * @param {string} platform
 * @returns {string}
 */
export function getSelectedStrategy(strat, asset, platform) {
  const item = strat.value.find((item) => item.asset === asset)
  return item ? item.strategies[platform] || '' : ''
}

/**
 * @param {Object} strat
 * @param {string} asset
 * @param {string} platform
 * @param {string} value
 */
export function setSelectedStrategy(strat, asset, platform, value) {
  const item = strat.value.find((item) => item.asset === asset)
  if (item) {
    item.strategies[platform] = value
  }
}

/**
 * @param {Object} balance
 * @param {string} asset
 * @param {string} platform
 * @returns {boolean}
 */
export function isDisabled(balance, asset, platform) {
  const assetsFiltered = balance.value.filter((item) => item.base === asset)
  const platformsFiltered = assetsFiltered.map((item) => item.platform)
  return !platformsFiltered.includes(platform)
}

/**
 * @param {Object} strat
 * @param {string} asset
 * @param {string} platform
 * @returns {string}
 */
export function getSelectedMaxExposure(strat, asset, platform) {
  const item = strat.value.find((item) => item.asset === asset)
  return item ? item.maxExposure[platform] || '' : ''
}

/**
 * @param {Object} strat
 * @param {string} asset
 * @param {string} platform
 * @param {string} value
 */
export function setSelectedMaxExposure(strat, asset, platform, value) {
  const item = strat.value.find((item) => item.asset === asset)
  if (item) {
    item.maxExposure[platform] = value
  }
}
