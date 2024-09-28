// src/utils/retryUtil.ts
import { handleServiceError } from '@utils/errorUtil';

// Type spécifique pour définir une erreur irrécupérable
interface NonRetryableError extends Error {
    isNonRetryable?: boolean;
}

// Fonction utilitaire pour vérifier si une erreur est non récupérable
const isNonRetryableError = (error: unknown): boolean => {
    // Vérifie si l'erreur possède la propriété "isNonRetryable" ou correspond à un cas spécifique
    return (error as NonRetryableError).isNonRetryable === true ||
        (error as Error).message?.includes('API keys missing')
}

export async function retry<A extends unknown[], R>(
    fn: (...args: A) => Promise<R>,
    args: A,
    functionName: string,
    retries: number = 3,
    delay: number = 1000
): Promise<R> {
    let attempt = 0;

    while (attempt < retries) {
        try {
            return await fn(...args);
        } catch (error) {
            if (isNonRetryableError(error)) {
                // Si l'erreur est non récupérable, pas besoin de réessayer
                throw error;
            }

            attempt++;
            if (attempt >= retries) {
                handleServiceError(error, 'retry', `Toutes les ${attempt} tentatives de ${functionName} ont échoué`);
                throw error;
            }

            console.info(`Nouvelle tentative de ${functionName}... essai ${attempt} après ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Backoff exponentiel
        }
    }
    throw new Error(`La fonction ${functionName} n'a pas réussi après ${attempt} tentatives`);
}
