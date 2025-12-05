// src/services/api/gemini/utils.ts

//import { logger } from '@utils/loggerUtil'; // Import Winston logger (optional for uncommented logs)
//import path from 'path'; // Import path (optional for uncommented logs)
import { RETRY_DELAY_REGEX_PRIMARY, RETRY_DELAY_REGEX_FALLBACK } from './constants';

// --- Utility Functions ---

/**
 * Pauses execution for a specified duration.
 * @param ms - The duration to sleep in milliseconds.
 * @returns A promise that resolves after the specified duration.
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parses the retry delay (in milliseconds) from a Gemini API error message.
 * @param errorMessage - The error message string.
 * @returns The retry delay in milliseconds, or null if not found.
 */
export const parseRetryDelay = (errorMessage: string): number | null => {
    if (!errorMessage) return null;
    let seconds: number | null = null;

    const matchPrimary = errorMessage.match(RETRY_DELAY_REGEX_PRIMARY);
    if (matchPrimary && matchPrimary[1]) {
        seconds = parseInt(matchPrimary[1], 10);
    } else {
        const matchFallback = errorMessage.match(RETRY_DELAY_REGEX_FALLBACK);
        if (matchFallback && matchFallback[1]) {
            seconds = parseInt(matchFallback[1], 10);
        }
    }

    if (seconds !== null && !isNaN(seconds)) {
        //logger.debug(`Parsed retry delay: ${seconds}s`, { module: path.parse(__filename).name });
        return seconds * 1000;
    }

    //logger.debug('Could not parse retry delay from error message.', { module: path.parse(__filename).name, errorMessage });
    return null;
};

/**
 * Helper to structure error details for logging, converting non-Error types to strings.
 * @param error - The error object or value.
 * @returns An object containing error details (name, message, stack).
 */
export const formatErrorForLog = (error: unknown): { name?: string; message: string; stack?: string } => {
    if (error instanceof Error) {
        return { name: error.name, message: error.message, stack: error.stack };
    }
    return { message: String(error) };
};

/**
 * Cleans potential JSON string returned by the API, removing markdown code fences
 * and trailing commas before closing braces/brackets.
 * @param input - The raw string potentially containing JSON.
 * @returns A cleaned string hopefully representing valid JSON.
 */
export const cleanJsonMarkdown = (input: string): string => {
    return input
        .replace(/^```(?:json)?\s*|```$/g, '')    // Remove markdown code fences (json optional)
        .replace(/,\s*}/g, '}')                   // Remove trailing comma before }
        .replace(/,\s*]/g, ']')                   // Remove trailing comma before ]
        .trim();
};