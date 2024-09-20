// src/utils/retryUtil.ts
import { handleServiceError } from '@utils/errorUtil'
/**
 * Retries a function n number of times before giving up
 */
export async function retry<A extends unknown[], R>(
    fn: (...args: A) => Promise<R>,
    args: A,
    maxTry: number,
    retryCount = 1
): Promise<R> {
    try {
        return await fn(...args);
    } catch (error) {
        handleServiceError(error, 'retry', `Error retrying function ${fn.name}`)
        if (retryCount >= maxTry) {
            handleServiceError(error, 'retry', `All ${maxTry} retry attempts exhausted`)
            throw error;
        }
        return retry(fn, args, maxTry, retryCount + 1);
    }
}
