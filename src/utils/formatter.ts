// src/utils/formatter.ts
export const formatNumberWithDynamicPrecision = (
  value: number | null,
  referenceValue: number
): string => {
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return '0' // Default value
  }

  // Calculate the number of decimal places based on referenceValue
  const decimalPlaces = referenceValue.toString().split('.')[1]?.length || 0

  // Format the number with the calculated decimal places
  return value.toFixed(decimalPlaces)
}

export const formatPrice = (value: number | null): string => {
  if (value === null || value === undefined) {
    return '0'; // Retourne un format par défaut ou une valeur vide
  }

  return value.toFixed(2); // Formatte avec 2 décimales
}

/**
 * Formats a date string into a localized string representation.
 * Handles undefined, null, or invalid date strings gracefully.
 *
 * @param dateString - The date string to format (ISO format preferred).
 * @param options - Optional Intl.DateTimeFormatOptions to customize the output.
 * @returns The formatted date string, 'Date inconnue', 'Date invalide', or 'Erreur date'.
 */
export const formatDate = (dateString: string | undefined | null, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'Date inconnue';
  try {
    const dateObj = new Date(dateString);
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date string passed to formatDate:", dateString);
      return 'Date invalide';
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
    };
    return dateObj.toLocaleString('fr-FR', defaultOptions);
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Erreur date';
  }
};

