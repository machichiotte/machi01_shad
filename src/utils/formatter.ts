// src/utils/formatter.ts
export const formatChangePercent = (percent: string | number | undefined): string => {
  if (percent == null) return 'N/A'
  const num = Number(percent)
  return isNaN(num) ? 'N/A' : `${num.toFixed(2)}%`
}

/**
 * Formate un nombre avec un nombre précis de décimales.
 *
 * @param value - Le nombre (ou sa représentation en chaîne) à formater. Peut être null ou undefined.
 * @param desiredDecimalPlaces - Le nombre exact de chiffres souhaités après la virgule.
 * @returns Le nombre formaté en chaîne de caractères, avec le nombre de décimales demandé.
 * Retourne '0' formaté avec les décimales si l'entrée est invalide (null, undefined, NaN).
 */
export const formatNumberWithDynamicPrecision = (
  value: number | string | null | undefined,
  desiredMaximumDecimalPlaces: number // Renommé pour plus de clarté
): string => {
  let num: number;
  let maxPrecision: number;

  // 1. Valider la précision maximale souhaitée
  maxPrecision = Math.max(0, Math.floor(desiredMaximumDecimalPlaces));

  // 2. Gérer les valeurs null, undefined ou non numériques
  if (value === null || value === undefined) {
    // Pour null/undefined, retourner '0' est logique
    return '0';
  } else {
    num = Number(value);
    if (isNaN(num)) {
      // Pour une chaîne non numérique, retourner '0'
      return '0';
    }
  }

  // 3. Gérer le cas spécifique de zéro
  //    toLocaleString(0, ...) retourne '0', donc on peut le laisser faire,
  //    ou le traiter explicitement pour potentiellement éviter l'overhead du formateur.
  if (num === 0) {
      return '0';
  }

  // 4. Formater en utilisant Intl.NumberFormat via toLocaleString
  //    - 'en-US' est utilisé pour garantir le '.' comme séparateur décimal (comme toFixed)
  //      et éviter la locale du navigateur qui pourrait utiliser ','.
  //    - `maximumFractionDigits` contrôle le nombre max de décimales.
  //    - `useGrouping: false` empêche les séparateurs de milliers (ex: 1,000).
  try {
    return num.toLocaleString('en-US', {
      maximumFractionDigits: maxPrecision,
      useGrouping: false // Comportement similaire à toFixed sur ce point
    });
  } catch (error) {
    // En cas d'erreur improbable avec toLocaleString (ex: options invalides futures)
    console.error("Erreur lors du formatage du nombre:", error);
    // Solution de secours: Convertir simplement en chaîne (perd le contrôle max des décimales)
    return String(num);
    // Ou revenir à l'ancien comportement en cas d'échec:
    // return num.toFixed(maxPrecision);
  }
};

export const formatPrice = (value: number | string | null): string => {
  return formatNumberWithDynamicPrecision(value, 2)
}

/**
 * Formats a date string into a localized string representation.
 * Handles undefined, null, or invalid date strings gracefully.
 *
 * @param dateString - The date string to format (ISO format preferred).
 * @param options - Optional Intl.DateTimeFormatOptions to customize the output.
 * @returns The formatted date string, 'Date inconnue', 'Date invalide', or 'Erreur date'.
 */
export const formatDate = (
  dateString: string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) return 'Date inconnue'
  try {
    const dateObj = new Date(dateString)
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date string passed to formatDate:', dateString)
      return 'Date invalide'
    }
    // Default options for FR locale, 24h format
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format
      ...options // Merge user options
    }
    return dateObj.toLocaleString('fr-FR', defaultOptions)
  } catch (e) {
    console.error('Error formatting date:', dateString, e)
    return 'Erreur date'
  }
}
