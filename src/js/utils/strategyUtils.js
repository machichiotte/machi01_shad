export function getSelectedStrategy(strat, asset, platform) {
    const item = strat.value.find((item) => item.asset === asset);
    return item ? item.strategies[platform] || '' : '';
  }
  
  export function setSelectedStrategy(strat, asset, platform, value) {
    const item = strat.value.find((item) => item.asset === asset);
    if (item) {
      item.strategies[platform] = value;
    }
  }
  
  export function isDisabled(balance, asset, platform) {
    const assetsFiltered = balance.value.filter((item) => item.base === asset);
    const platformsFiltered = assetsFiltered.map((item) => item.platform);
    return !platformsFiltered.includes(platform);
  }
  
  export function getSelectedMaxExposure(strat, asset, platform) {
    const item = strat.value.find((item) => item.asset === asset);
    return item ? item.maxExposure[platform] || '' : '';
  }
  
  export function setSelectedMaxExposure(strat, asset, platform, value) {
    const item = strat.value.find((item) => item.asset === asset);
    if (item) {
      item.maxExposure[platform] = value;
    }
  }