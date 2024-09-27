// src/utils/retryUtil.ts
import { handleServiceError } from '@utils/errorUtil'

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
            attempt++;
            if (attempt >= retries) {
                handleServiceError(error, 'retry', `Toutes les ${attempt} tentatives de ${functionName} ont échoué`)
                throw error;
            }

            handleServiceError(error, 'retry', `Nouvelle tentative de ${functionName}... essai ${attempt} après ${delay}ms`)
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Backoff exponentiel
        }
    }
    throw new Error(`La fonction ${functionName} n'a pas réussi après ${attempt} tentatives`);
}