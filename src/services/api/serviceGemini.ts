// src/services/api/serviceGemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerativeModel } from "@google/generative-ai";
import { config } from '@config/index';
import { RepoConfigApi } from '@repo/config/repoConfigApi';
import { handleServiceError } from '@utils/errorUtil';
import { AnalysisWithSummary, FinancialAnalysis } from "@typ/rss";
import { DEFAULT_APICONFIG } from "@config/default";
import path from 'path'; import { logger } from '@utils/loggerUtil'; // Import Winston logger

// --- Constants ---
const MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 60000; // 60 seconds default
const QUOTA_ERROR_STATUS_CODE_NUM = 429;
const QUOTA_ERROR_STATUS_CODE_STR = '429';
const QUOTA_ERROR_MESSAGE_FRAGMENT = 'quota';

// Regex to extract retry delay
const RETRY_DELAY_REGEX_PRIMARY = /"retryDelay":\s*"(\d+)s"/;
const RETRY_DELAY_REGEX_FALLBACK = /retry delay.*?(\d+)\s*s/i;

// JSON Structure Keys (remain unchanged)
const KEY_SUMMARY = 'summary';
const KEY_IS_RELEVANT = 'isRelevant';
const KEY_RELEVANCE_REASON = 'relevanceReason';
const KEY_MENTIONED_ASSETS = 'mentionedAssets';
const KEY_FINANCIAL_SENTIMENT = 'financialSentiment';
const KEY_SENTIMENT_REASON = 'sentimentReason';
const KEY_POTENTIAL_IMPACT = 'potentialImpact';
const KEY_FINANCIAL_THEMES = 'financialThemes';
const KEY_ACTIONABLE_INFO = 'actionableInfo';
const VALID_RELEVANCE = ['Yes', 'No', 'Partial'];
const VALID_SENTIMENT = ['Positive', 'Negative', 'Neutral', 'Mixed'];

// --- Types ---
class QuotaError extends Error {
    public retryDelayMs: number | null;
    constructor(message: string, retryDelayMs: number | null) {
        super(message);
        this.name = 'QuotaError';
        this.retryDelayMs = retryDelayMs;
    }
}
type AttemptResult = AnalysisWithSummary | 'parse_error' | 'validation_error' | 'empty_response' | QuotaError | Error;

// --- Utility Functions ---
const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const parseRetryDelay = (errorMessage: string): number | null => {
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
        logger.debug(`Parsed retry delay: ${seconds}s`, { module: path.parse(__filename).name }); // Use logger.debug
        return seconds * 1000;
    }

    logger.debug('Could not parse retry delay from error message.', { module: path.parse(__filename).name, errorMessage }); // Use logger.debug
    return null;
};

// Helper to structure error details for logging
const formatErrorForLog = (error: unknown) => {
    if (error instanceof Error) {
        return { name: error.name, message: error.message, stack: error.stack };
    }
    return { message: String(error) };
};


// --- Service Class ---
export class ServiceGemini {
    // --- Static Properties for Global Quota Handling ---
    private static isGloballyPaused: boolean = false;
    private static globalPauseUntil: number = 0;
    private static globalPausePromise: Promise<void> | null = null;

    // --- Model Initialization ---
    private static async initializeModel(): Promise<GenerativeModel | null> {
        const operation = 'initializeModel';
        const geminiConfig = config.apiConfig.gemini;
        if (!geminiConfig) {
            logger.warn('Service disabled: Gemini configuration missing.', { module: path.parse(__filename).name, operation }); // Use logger.warn
            return null;
        }

        const decryptedConfig = RepoConfigApi.decryptConfigGemini(geminiConfig);
        if (!decryptedConfig?.apiKey) {
            logger.warn('Service disabled: Invalid or incomplete Gemini configuration (API key missing?).', { module: path.parse(__filename).name, operation }); // Use logger.warn
            return null;
        }

        try {
            const genAI = new GoogleGenerativeAI(decryptedConfig.apiKey);
            const modelName = decryptedConfig?.model ?? DEFAULT_APICONFIG.gemini.model;
            logger.debug(`Initializing Gemini model: ${modelName}`, { module: path.parse(__filename).name, operation, modelName });

            return genAI.getGenerativeModel({
                model: modelName,
                safetySettings: [ // Using standard safety settings
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                ],
                generationConfig: {
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json",
                },
            });
        } catch (error) {
            // handleServiceError uses logger.error internally
            handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Error initializing Gemini model`);
            return null;
        }
    }

    // --- Prompt Building ---
    private static _buildAnalysisPrompt(text: string): string {
        // Prompt logic remains the same
        return `Effectue une analyse financière et cryptomonnaie approfondie du texte suivant ET génère un résumé concis et informatif en français.
Retourne ta réponse **UNIQUEMENT** sous la forme d'un objet JSON valide, sans aucun autre texte avant ou après.
L'objet JSON doit avoir la structure suivante :
{
  "${KEY_SUMMARY}": string, // Le résumé concis en français du texte fourni. Ce champ est OBLIGATOIRE.
  "${KEY_IS_RELEVANT}": "${VALID_RELEVANCE.join('" | "')}", // Pertinence du texte pour la finance/crypto. OBLIGATOIRE.
  "${KEY_RELEVANCE_REASON}"?: string, // Justification si pertinent ou partiellement pertinent.
  "${KEY_MENTIONED_ASSETS}"?: string[], // Liste des actifs (actions, cryptos, etc.) mentionnés.
  "${KEY_FINANCIAL_SENTIMENT}"?: "${VALID_SENTIMENT.join('" | "')}", // Sentiment général du texte.
  "${KEY_SENTIMENT_REASON}"?: string, // Justification du sentiment.
  "${KEY_POTENTIAL_IMPACT}"?: string, // Impact potentiel sur les marchés ou actifs mentionnés.
  "${KEY_FINANCIAL_THEMES}"?: string[], // Thèmes financiers principaux abordés.
  "${KEY_ACTIONABLE_INFO}"?: string // Informations concrètes ou points clés (pas de conseils).
}

N'inclus AUCUN conseil d'achat ou de vente. Assure-toi que le JSON est valide.

Voici le texte :
\n\n${text}`;
    }

    // --- Response Validation ---
    private static _validateAnalysisResponse(parsedJson: unknown): AnalysisWithSummary | null {
        const operation = '_validateAnalysisResponse';
        if (typeof parsedJson !== 'object' || parsedJson === null) {
            logger.warn('Validation failed: Parsed JSON is not an object.', { module: path.parse(__filename).name, operation, receivedType: typeof parsedJson });
            return null;
        }
        const data = parsedJson as Record<string, unknown>;
        const summary = data[KEY_SUMMARY];
        const isRelevant = data[KEY_IS_RELEVANT];

        if (typeof summary !== 'string' || summary.trim() === '') {
            logger.warn(`Validation failed: '${KEY_SUMMARY}' is missing, invalid, or empty.`, { module: path.parse(__filename).name, operation, receivedSummary: summary, jsonData: JSON.stringify(data) });
            return null;
        }
        if (typeof isRelevant !== 'string' || !VALID_RELEVANCE.includes(isRelevant)) {
            logger.warn(`Validation failed: '${KEY_IS_RELEVANT}' is missing or invalid.`, { module: path.parse(__filename).name, operation, receivedRelevance: isRelevant, jsonData: JSON.stringify(data) });
            return null;
        }

        // Type guards remain the same
        const isString = (val: unknown): val is string => typeof val === 'string';
        const isStringArray = (val: unknown): val is string[] => Array.isArray(val) && val.every(isString);
        const isValidSentiment = (val: unknown): val is FinancialAnalysis['financialSentiment'] =>
            isString(val) && (VALID_SENTIMENT as ReadonlyArray<string>).includes(val);

        // Validation checks remain the same
        const validationChecks = [
            data[KEY_RELEVANCE_REASON] === undefined || isString(data[KEY_RELEVANCE_REASON]),
            data[KEY_MENTIONED_ASSETS] === undefined || isStringArray(data[KEY_MENTIONED_ASSETS]),
            data[KEY_FINANCIAL_SENTIMENT] === undefined || isValidSentiment(data[KEY_FINANCIAL_SENTIMENT]),
            data[KEY_SENTIMENT_REASON] === undefined || isString(data[KEY_SENTIMENT_REASON]),
            data[KEY_POTENTIAL_IMPACT] === undefined || isString(data[KEY_POTENTIAL_IMPACT]),
            data[KEY_FINANCIAL_THEMES] === undefined || isStringArray(data[KEY_FINANCIAL_THEMES]),
            data[KEY_ACTIONABLE_INFO] === undefined || isString(data[KEY_ACTIONABLE_INFO]),
        ];

        if (!validationChecks.every(check => check)) {
            logger.warn('Validation failed: One or more optional fields have incorrect types.', { module: path.parse(__filename).name, operation, jsonData: JSON.stringify(data) });
            return null;
        }

        // Construct validated object (remains the same)
        const validatedAnalysis: FinancialAnalysis = {
            isRelevant: isRelevant as FinancialAnalysis['isRelevant'],
            relevanceReason: data[KEY_RELEVANCE_REASON] as string | undefined,
            mentionedAssets: data[KEY_MENTIONED_ASSETS] as string[] | undefined,
            financialSentiment: data[KEY_FINANCIAL_SENTIMENT] as FinancialAnalysis['financialSentiment'] | undefined,
            sentimentReason: data[KEY_SENTIMENT_REASON] as string | undefined,
            potentialImpact: data[KEY_POTENTIAL_IMPACT] as string | undefined,
            financialThemes: data[KEY_FINANCIAL_THEMES] as string[] | undefined,
            actionableInfo: data[KEY_ACTIONABLE_INFO] as string | undefined,
        };

        return { analysis: validatedAnalysis, summary: summary };
    }

    private static _cleanJsonMarkdown(input: string): string {
        return input
            .replace(/^```(?:json)?\s*|```$/g, '')        // Enlève les balises markdown
            .replace(/,\s*}/g, '}')                       // Supprime les virgules invalides avant un objet
            .replace(/,\s*]/g, ']')                       // Supprime les virgules invalides avant un tableau
            .trim();
    }

    // --- Single API Attempt ---
    private static async _attemptAnalysis(model: GenerativeModel, text: string): Promise<AttemptResult> {
        const operation = '_attemptAnalysis';
        logger.debug(`Attempting analysis... Text length: ${text.length}`, {
            module: path.parse(__filename).name,
            operation,
            textLength: text.length,
        });

        const prompt = this._buildAnalysisPrompt(text);

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            if (!responseText?.trim()) {
                logger.warn('Received empty response from API.', { module: path.parse(__filename).name, operation });
                return 'empty_response';
            }

            logger.debug(`Received raw response. Length: ${responseText.length}`, {
                module: path.parse(__filename).name,
                operation,
                responseLength: responseText.length,
            });

            let parsedJson: unknown;

            try {
                const cleanedText = this._cleanJsonMarkdown(responseText);
                if (!cleanedText) {
                    logger.warn('Received empty response after cleaning markdown.', { module: path.parse(__filename).name, operation });
                    return 'empty_response';
                }

                parsedJson = JSON.parse(cleanedText);
                logger.debug('Successfully parsed JSON response.', { module: path.parse(__filename).name, operation });
            } catch (parseError) {
                logger.error('JSON parsing error.', {
                    module: path.parse(__filename).name,
                    operation,
                    error: formatErrorForLog(parseError),
                    rawResponse: responseText,
                });
                return 'parse_error';
            }

            const validatedData = this._validateAnalysisResponse(parsedJson);
            if (!validatedData) {
                logger.warn('Response validation failed. See previous validation logs.', { module: path.parse(__filename).name, operation });
                return 'validation_error';
            }

            logger.debug('Analysis attempt successful and validated.', { module: path.parse(__filename).name, operation });
            return validatedData;
        } catch (error: unknown) {
            const errorDetails = formatErrorForLog(error);
            let errorMessage = "Unknown error during API call";
            let httpStatusCode: string | number | undefined = undefined;
            let isQuotaError = false;

            if (error instanceof Error) {
                errorMessage = error.message;
                if ('status' in error && (typeof error.status === 'number' || typeof error.status === 'string')) {
                    httpStatusCode = error.status;
                } else if ('code' in error && (typeof error.code === 'number' || typeof error.code === 'string')) {
                    httpStatusCode = error.code;
                }

                isQuotaError =
                    httpStatusCode === QUOTA_ERROR_STATUS_CODE_NUM ||
                    httpStatusCode === QUOTA_ERROR_STATUS_CODE_STR ||
                    errorMessage.toLowerCase().includes(QUOTA_ERROR_MESSAGE_FRAGMENT);
            } else {
                errorMessage = String(error);
                isQuotaError = errorMessage.toLowerCase().includes(QUOTA_ERROR_MESSAGE_FRAGMENT);
            }

            if (isQuotaError) {
                logger.warn('Quota error detected.', {
                    module: path.parse(__filename).name,
                    operation,
                    status: httpStatusCode ?? 'N/A',
                    error: errorDetails,
                });
                const retryDelayMs = parseRetryDelay(errorMessage);
                return new QuotaError(errorMessage, retryDelayMs);
            }

            handleServiceError(error, `${path.parse(__filename).name}:${operation}`, `Non-quota API error. Status: ${httpStatusCode ?? 'N/A'}`);
            return error instanceof Error ? error : new Error(errorMessage);
        }
    }


    // --- Main Analysis Method ---
    static async analyzeText(text: string): Promise<AnalysisWithSummary | null> {
        const operation = 'analyzeText';
        logger.debug('Analyze text request received.', { module: path.parse(__filename).name, operation, textLength: text.length });

        // 1. Check and wait for global pause
        if (ServiceGemini.isGloballyPaused) {
            const now = Date.now();
            if (now < ServiceGemini.globalPauseUntil) {
                const waitTime = ServiceGemini.globalPauseUntil - now;
                logger.warn(`Global quota pause active. Waiting for ${Math.ceil(waitTime / 1000)}s...`, { module: path.parse(__filename).name, operation, waitMs: waitTime, pauseUntil: new Date(ServiceGemini.globalPauseUntil).toISOString() });

                if (!ServiceGemini.globalPausePromise) {
                    ServiceGemini.globalPausePromise = sleep(waitTime).then(() => {
                        logger.info('Global quota pause finished.', { module: path.parse(__filename).name, operation: 'globalPauseHandler' });
                        if (Date.now() >= ServiceGemini.globalPauseUntil) {
                            logger.debug('Resetting global pause flags.', { module: path.parse(__filename).name, operation: 'globalPauseHandler' });
                            ServiceGemini.isGloballyPaused = false;
                            ServiceGemini.globalPauseUntil = 0;
                            ServiceGemini.globalPausePromise = null;
                        } else {
                            logger.debug('Global pause extended by another request, flags not reset.', { module: path.parse(__filename).name, operation: 'globalPauseHandler', currentPauseUntil: new Date(ServiceGemini.globalPauseUntil).toISOString() });
                        }
                    }).catch(err => {
                        logger.error('Error during global pause sleep.', { module: path.parse(__filename).name, operation: 'globalPauseHandler', error: formatErrorForLog(err) });
                        ServiceGemini.isGloballyPaused = false; // Attempt reset
                        ServiceGemini.globalPauseUntil = 0;
                        ServiceGemini.globalPausePromise = null;
                    });
                }
                try {
                    await ServiceGemini.globalPausePromise;
                } catch { /* Error handled in the promise catch */ }

            } else {
                if (ServiceGemini.isGloballyPaused) { // Double check state after potential wait
                    logger.info('Global quota pause already expired. Resetting flag.', { module: path.parse(__filename).name, operation });
                    ServiceGemini.isGloballyPaused = false;
                    ServiceGemini.globalPauseUntil = 0;
                    ServiceGemini.globalPausePromise = null;
                }
            }
        }

        // 2. Initialize model
        const model = await this.initializeModel();
        if (!model) {
            logger.error('Failed to initialize model. Cannot analyze text.', { module: path.parse(__filename).name, operation });
            return null;
        }

        // 3. Retry loop
        let retries = 0;
        while (retries <= MAX_RETRIES) {
            logger.debug(`Attempt ${retries + 1}/${MAX_RETRIES + 1}...`, { module: path.parse(__filename).name, operation, attempt: retries + 1, maxAttempts: MAX_RETRIES + 1 });
            const result: AttemptResult = await this._attemptAnalysis(model, text);

            // a) Success
            if (typeof result === 'object' && result !== null && !(result instanceof Error) && 'analysis' in result && 'summary' in result) {
                logger.info('Analysis successful.', { module: path.parse(__filename).name, operation, attempt: retries + 1 });
                return result;
            }

            // b) Quota Error
            if (result instanceof QuotaError) {
                if (retries < MAX_RETRIES) {
                    const delayMs = result.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
                    retries++;
                    logger.warn(`Quota error (429). Activating global pause. Retrying attempt ${retries + 1}/${MAX_RETRIES + 1} in ${delayMs / 1000}s...`, { module: path.parse(__filename).name, operation, attempt: retries + 1, maxAttempts: MAX_RETRIES + 1, delayMs: delayMs, quotaErrorMessage: result.message });

                    // Activate Global Pause Logic (same as before, just logging changes)
                    const pauseUntil = Date.now() + delayMs;
                    if (pauseUntil > ServiceGemini.globalPauseUntil) {
                        logger.info(`Setting/Extending global pause until ${new Date(pauseUntil).toISOString()}`, { module: path.parse(__filename).name, operation: 'globalPauseActivation', pauseUntil: new Date(pauseUntil).toISOString(), triggeredByAttempt: retries }); // Use logger.info
                        ServiceGemini.isGloballyPaused = true;
                        ServiceGemini.globalPauseUntil = pauseUntil;
                        ServiceGemini.globalPausePromise = sleep(delayMs).then(() => {
                            logger.info('Global quota pause finished (timer initiated by this request).', { module: path.parse(__filename).name, operation: 'globalPauseHandler', triggeredByAttempt: retries });
                            if (Date.now() >= ServiceGemini.globalPauseUntil) {
                                logger.debug('Resetting global pause flags after wait.', { module: path.parse(__filename).name, operation: 'globalPauseHandler' });
                                ServiceGemini.isGloballyPaused = false;
                                ServiceGemini.globalPauseUntil = 0;
                                ServiceGemini.globalPausePromise = null;
                            } else {
                                logger.info('Global pause was extended further. Not resetting flags.', { module: path.parse(__filename).name, operation: 'globalPauseHandler', currentPauseUntil: new Date(ServiceGemini.globalPauseUntil).toISOString() });
                            }
                        }).catch(err => {
                            logger.error('Error during global pause sleep.', { module: path.parse(__filename).name, operation: 'globalPauseHandler', error: formatErrorForLog(err) });
                            ServiceGemini.isGloballyPaused = false; ServiceGemini.globalPauseUntil = 0; ServiceGemini.globalPausePromise = null; // Reset state on error
                        });
                    } else {
                        logger.info('Global pause already active and extends further. This request will wait.', { module: path.parse(__filename).name, operation, currentPauseUntil: new Date(ServiceGemini.globalPauseUntil).toISOString() });
                    }
                    // End Global Pause Activation

                    await sleep(delayMs); // Wait for individual retry delay
                    continue;
                } else {
                    // Max retries exceeded for quota error
                    const errorMessage = `Quota error persisted after ${MAX_RETRIES + 1} attempts. Last error: ${result.message}`;
                    logger.error(errorMessage, { module: path.parse(__filename).name, operation, maxAttempts: MAX_RETRIES + 1, lastError: result.message });
                    // Log with handleServiceError as well for consistency? Optional.
                    // handleServiceError(new Error(errorMessage), `${module}:${operation}`, `Quota error persisted`);
                    return null;
                }
            }

            // c) Other specific non-retryable errors
            if (typeof result === 'string') {
                logger.error(`Non-retryable error during analysis: ${result}. Aborting.`, { module: path.parse(__filename).name, operation, errorType: result, attempt: retries + 1 });
                return null;
            }

            // d) Generic API Error or other unexpected Error
            if (result instanceof Error) {
                logger.error(`Unhandled non-quota API error encountered. Aborting analysis.`, { module: path.parse(__filename).name, operation, error: formatErrorForLog(result), attempt: retries + 1 });
                // Error already logged by _attemptAnalysis via handleServiceError if it came from there.
                return null;
            }

            // e) Safeguard
            logger.error('Unexpected state in analyzeText retry loop. Aborting.', { module: path.parse(__filename).name, operation, result: result, attempt: retries + 1 });
            return null;

        } // End while loop

        // Should only be reached if loop finishes unexpectedly (e.g., MAX_RETRIES logic error), but safeguard log
        logger.error(`Analysis failed after ${MAX_RETRIES + 1} attempts due to persistent issues (exited loop).`, { module: path.parse(__filename).name, operation, maxAttempts: MAX_RETRIES + 1 });
        return null;
    }
}