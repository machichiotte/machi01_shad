// src/utils/retryUtil.ts
import { handleServiceError } from '@utils/errorUtil'
/**
 * Retries a function n number of times before giving up
 */
export async function retry<A extends unknown[], R>(
    fn: (...args: A) => Promise<R>,
    args: A,
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
                handleServiceError(error, 'retry', `All ${attempt} retry attempts exhausted`)
                throw error;
            }

            handleServiceError(error, 'retry', `Retrying ${fn.name}... attempt ${attempt} after ${delay}ms`)
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Backoff exponentiel
        }
    }
    throw new Error(`La fonction n'a pas réussi après ${attempt} tentatives`);
}