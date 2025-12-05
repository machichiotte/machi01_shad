// src/utils/metricsUtil.ts
/**
 * Calcule la différence en pourcentage entre deux valeurs.
 */
export function calculatePercentageChange(
    newValue: number | undefined,
    oldValue: number | undefined
): number | undefined {
    //if newValue or oldValue is undefined, return undefined
    if (newValue === undefined || newValue < 0) return undefined
    if (oldValue === undefined || oldValue < 0) return undefined

    return Number(((newValue - oldValue) / oldValue).toFixed(2))
}

/**
* Calcule le pourcentage de progression entre deux valeurs.
*/
export function calculateProgressPercentage(
    newValue: number | undefined,
    oldValue: number | undefined
): number | undefined {
    if (newValue === undefined || newValue < 0) return undefined
    if (oldValue === undefined || oldValue < 0) return undefined

    return Number((((oldValue - newValue) / newValue) * 100).toFixed(2))
}