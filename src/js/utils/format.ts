// src/js/utils/format.ts
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
