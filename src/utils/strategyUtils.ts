// src/utils/strategyUtils.ts
import { Strat } from "../types/responseData";

// src/js/utils/strategyUtils.ts
export function getSelectedStrategy(strat: Strat[], base: string, platform: string): string {
  const item = strat.find((item) => item.base === base)
  return item ? item.strategies[platform] || '' : ''
}

export function setSelectedStrategy(strat: Strat[], base: string, platform: string, value: string): void {
  const item = strat.find((item) => item.base === base)
  if (item) {
    item.strategies[platform] = value
  }
}

export function isVisible(data: Strat[], base: string, platform: string): boolean {

  if (!Array.isArray(data)) {
    console.error('isVisible: data n\'est pas un tableau', data);
    return false;  // Ou lever une exception selon vos besoins
  }

  const basesFiltered = data.filter((item) => item.base === base)

  // Filtrer par la présence du champ 'platform' dans 'strategies' ou 'maxExposure'
  const platformsFiltered = basesFiltered.filter((item) => {
    return (
      (item.strategies && item.strategies.hasOwnProperty(platform)) ||
      (item.maxExposure && item.maxExposure.hasOwnProperty(platform))
    );
  });


  // Retourner 'true' si la plateforme est trouvée dans les éléments filtrés
  return platformsFiltered.length > 0;

}

export function getSelectedMaxExposure(strat: Strat[], base: string, platform: string): number | undefined {
  const item = strat.find((item) => item.base === base)
  return item ? item.maxExposure[platform] || undefined : undefined
}

export function setSelectedMaxExposure(strat: Strat[], base: string, platform: string, value: number): void {
  const item = strat.find((item) => item.base === base)
  if (item) {
    item.maxExposure[platform] = value
  }
}
