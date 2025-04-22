// src/services/api/gemini/serviceGemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerativeModel } from "@google/generative-ai";
import { config } from '@config/index';
import { RepoConfigApi } from '@repo/config/repoConfigApi';
import { handleServiceError } from '@utils/errorUtil';
import type { AnalysisWithSummary, FinancialAnalysis } from "@typ/rss";
import { DEFAULT_APICONFIG } from "@config/default";
import path from 'path';
import { logger } from '@utils/loggerUtil'; // Import Winston logger

// Import from local files
import {
    MAX_RETRIES,
    DEFAULT_RETRY_DELAY_MS,
    QUOTA_ERROR_STATUS_CODE_NUM,
    QUOTA_ERROR_STATUS_CODE_STR,
    QUOTA_ERROR_MESSAGE_FRAGMENT,
    KEY_SUMMARY,
    KEY_IS_RELEVANT,
    KEY_RELEVANCE_REASON,
    KEY_MENTIONED_ASSETS,
    KEY_FINANCIAL_SENTIMENT,
    KEY_SENTIMENT_REASON,
    KEY_POTENTIAL_IMPACT,
    KEY_FINANCIAL_THEMES,
    KEY_ACTIONABLE_INFO,
    VALID_RELEVANCE,
    VALID_SENTIMENT
} from './constants';
import { QuotaError, type AttemptResult } from './types';
import { sleep, parseRetryDelay, formatErrorForLog, cleanJsonMarkdown } from './utils';

// --- Service Class ---
export class ServiceGemini {
    // --- Static Properties for Global Quota Handling ---
    private static isGloballyPaused: boolean = false;
    private static globalPauseUntil: number = 0;
    private static globalPausePromise: Promise<void> | null = null;

    // --- Model Initialization ---
    private static async initializeModel(): Promise<GenerativeModel | null> {
        const operation = 'initializeModel';
        const moduleName = path.parse(__filename).name;
        const geminiConfig = config.apiConfig.gemini;
        if (!geminiConfig) {
            logger.warn('Service disabled: Gemini configuration missing.', { module: moduleName, operation });
            return null;
        }

        const decryptedConfig = RepoConfigApi.decryptConfigGemini(geminiConfig);
        if (!decryptedConfig?.apiKey) {
            logger.warn('Service disabled: Invalid or incomplete Gemini configuration (API key missing?).', { module: moduleName, operation });
            return null;
        }

        try {
            const genAI = new GoogleGenerativeAI(decryptedConfig.apiKey);
            const modelName = decryptedConfig?.model ?? DEFAULT_APICONFIG.gemini.model;
            //logger.debug(`Initializing Gemini model: ${modelName}`, { module: moduleName, operation, modelName });

            return genAI.getGenerativeModel({
                model: modelName,
                safetySettings: [
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
            handleServiceError(error, `${moduleName}:${operation}`, `Error initializing Gemini model`);
            return null;
        }
    }

    // --- Prompt Building ---
    private static _buildAnalysisPrompt(text: string): string {
        // Convert VALID_* arrays to string literals for the prompt type definition
        const relevanceTypes = [...VALID_RELEVANCE].map(v => `"${v}"`).join(' | ');
        const sentimentTypes = [...VALID_SENTIMENT].map(v => `"${v}"`).join(' | ');

        return `Effectue une analyse financière et cryptomonnaie approfondie du texte suivant ET génère un résumé concis et informatif en français.
Retourne ta réponse **UNIQUEMENT** sous la forme d'un objet JSON valide, sans aucun autre texte avant ou après.
L'objet JSON doit avoir la structure suivante :
{
  "${KEY_SUMMARY}": string, // Le résumé concis en français du texte fourni. Ce champ est OBLIGATOIRE.
  "${KEY_IS_RELEVANT}": ${relevanceTypes}, // Pertinence du texte pour la finance/crypto. OBLIGATOIRE.
  "${KEY_RELEVANCE_REASON}"?: string, // Justification si pertinent ou partiellement pertinent.
  "${KEY_MENTIONED_ASSETS}"?: string[], // Liste des actifs (actions, cryptos, etc.) mentionnés.
  "${KEY_FINANCIAL_SENTIMENT}"?: ${sentimentTypes}, // Sentiment général du texte.
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
        const moduleName = path.parse(__filename).name;

        if (typeof parsedJson !== 'object' || parsedJson === null) {
            logger.warn('Validation failed: Parsed JSON is not an object.', { module: moduleName, operation, receivedType: typeof parsedJson });
            return null;
        }
        const data = parsedJson as Record<string, unknown>;
        const summary = data[KEY_SUMMARY];
        const isRelevant = data[KEY_IS_RELEVANT];

        if (typeof summary !== 'string' || summary.trim() === '') {
            logger.warn(`Validation failed: '${KEY_SUMMARY}' is missing, invalid, or empty.`, { module: moduleName, operation, receivedSummary: summary, jsonData: JSON.stringify(data) });
            return null;
        }
        if (typeof isRelevant !== 'string' || !(VALID_RELEVANCE as ReadonlyArray<string>).includes(isRelevant)) {
            logger.warn(`Validation failed: '${KEY_IS_RELEVANT}' is missing or invalid.`, { module: moduleName, operation, receivedRelevance: isRelevant, validValues: VALID_RELEVANCE, jsonData: JSON.stringify(data) });
            return null;
        }

        // Type guards
        const isString = (val: unknown): val is string => typeof val === 'string';
        const isStringArray = (val: unknown): val is string[] => Array.isArray(val) && val.every(isString);
        const isValidSentiment = (val: unknown): val is typeof VALID_SENTIMENT[number] =>
            isString(val) && (VALID_SENTIMENT as ReadonlyArray<string>).includes(val);

        // Validation checks for optional fields
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
            logger.warn('Validation failed: One or more optional fields have incorrect types.', { module: moduleName, operation, jsonData: JSON.stringify(data) });
            return null;
        }

        // Construct validated object
        const validatedAnalysis: FinancialAnalysis = {
            isRelevant: isRelevant as typeof VALID_RELEVANCE[number], // Cast to specific union type
            relevanceReason: data[KEY_RELEVANCE_REASON] as string | undefined,
            mentionedAssets: data[KEY_MENTIONED_ASSETS] as string[] | undefined,
            financialSentiment: data[KEY_FINANCIAL_SENTIMENT] as typeof VALID_SENTIMENT[number] | undefined, // Cast to specific union type
            sentimentReason: data[KEY_SENTIMENT_REASON] as string | undefined,
            potentialImpact: data[KEY_POTENTIAL_IMPACT] as string | undefined,
            financialThemes: data[KEY_FINANCIAL_THEMES] as string[] | undefined,
            actionableInfo: data[KEY_ACTIONABLE_INFO] as string | undefined,
        };

        return { analysis: validatedAnalysis, summary: summary };
    }


    // --- Single API Attempt ---
    private static async _attemptAnalysis(model: GenerativeModel, text: string): Promise<AttemptResult> {
        const operation = '_attemptAnalysis';
        const moduleName = path.parse(__filename).name;
        /*logger.debug(`Attempting analysis... Text length: ${text.length}`, {
            module: moduleName,
            operation,
            textLength: text.length,
        });*/

        const prompt = this._buildAnalysisPrompt(text);

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            if (!responseText?.trim()) {
                logger.warn('Received empty response from API.', { module: moduleName, operation });
                return 'empty_response';
            }

            /*logger.debug(`Received raw response. Length: ${responseText.length}`, {
                module: moduleName,
                operation,
                responseLength: responseText.length,
            });*/

            let parsedJson: unknown;

            try {
                const cleanedText = cleanJsonMarkdown(responseText); // Use utility function
                if (!cleanedText) {
                    logger.warn('Received empty response after cleaning markdown.', { module: moduleName, operation });
                    return 'empty_response';
                }

                parsedJson = JSON.parse(cleanedText);
                //logger.debug('Successfully parsed JSON response.', { module: moduleName, operation });
            } catch (parseError) {
                logger.error('JSON parsing error.', {
                    module: moduleName,
                    operation,
                    error: formatErrorForLog(parseError), // Use utility function
                    rawResponse: responseText,
                });
                return 'parse_error';
            }

            const validatedData = this._validateAnalysisResponse(parsedJson);
            if (!validatedData) {
                logger.warn('Response validation failed. See previous validation logs.', { module: moduleName, operation });
                return 'validation_error';
            }

            //logger.debug('Analysis attempt successful and validated.', { module: moduleName, operation });
            return validatedData;
        } catch (error: unknown) {
            const errorDetails = formatErrorForLog(error); // Use utility function
            let errorMessage = "Unknown error during API call";
            let httpStatusCode: string | number | undefined = undefined;
            let isQuotaError = false;

            if (error instanceof Error) {
                errorMessage = error.message;
                // Attempt to extract status code (common patterns)
                if ('status' in error && (typeof error.status === 'number' || typeof error.status === 'string')) {
                    httpStatusCode = error.status;
                } else if ('code' in error && (typeof error.code === 'number' || typeof error.code === 'string')) {
                    httpStatusCode = error.code;
                } else if ('response' in error && typeof error.response === 'object' && error.response !== null && 'status' in error.response) {
                     // Handle cases where status is nested (e.g., axios errors)
                     httpStatusCode = (error.response as { status?: number | string }).status;
                }


                isQuotaError =
                    (httpStatusCode === QUOTA_ERROR_STATUS_CODE_NUM ||
                     httpStatusCode?.toString() === QUOTA_ERROR_STATUS_CODE_STR) ||
                    errorMessage.toLowerCase().includes(QUOTA_ERROR_MESSAGE_FRAGMENT);
            } else {
                errorMessage = String(error);
                isQuotaError = errorMessage.toLowerCase().includes(QUOTA_ERROR_MESSAGE_FRAGMENT);
            }

            if (isQuotaError) {
                logger.warn('Quota error detected.', {
                    module: moduleName,
                    operation,
                    status: httpStatusCode ?? 'N/A',
                    error: errorDetails,
                });
                const retryDelayMs = parseRetryDelay(errorMessage); // Use utility function
                return new QuotaError(errorMessage, retryDelayMs); // Use custom error type
            }

            // Log non-quota errors using the shared handler
            handleServiceError(error, `${moduleName}:${operation}`, `Non-quota API error. Status: ${httpStatusCode ?? 'N/A'}`);
            return error instanceof Error ? error : new Error(errorMessage);
        }
    }


    // --- Main Analysis Method ---
    static async analyzeText(text: string): Promise<AnalysisWithSummary | null> {
        const operation = 'analyzeText';
        const moduleName = path.parse(__filename).name;
        //logger.debug('Analyze text request received.', { module: moduleName, operation, textLength: text.length });

        // 1. Check and wait for global pause
        if (ServiceGemini.isGloballyPaused) {
            const now = Date.now();
            if (now < ServiceGemini.globalPauseUntil) {
                const waitTime = ServiceGemini.globalPauseUntil - now;
                //logger.debug(`Global quota pause active. Waiting for ${Math.ceil(waitTime / 1000)}s...`, { module: moduleName, operation, waitMs: waitTime, pauseUntil: new Date(ServiceGemini.globalPauseUntil).toISOString() });

                // Ensure only one sleep promise is created
                if (!ServiceGemini.globalPausePromise) {
                    ServiceGemini.globalPausePromise = sleep(waitTime).then(() => { // Use utility function
                        logger.info('Global quota pause finished.', { module: moduleName, operation: 'globalPauseHandler' });
                        if (Date.now() >= ServiceGemini.globalPauseUntil) {
                            //logger.debug('Resetting global pause flags.', { module: moduleName, operation: 'globalPauseHandler' });
                            ServiceGemini.isGloballyPaused = false;
                            ServiceGemini.globalPauseUntil = 0;
                            ServiceGemini.globalPausePromise = null;
                        } else {
                            //logger.debug('Global pause extended by another request, flags not reset.', { module: moduleName, operation: 'globalPauseHandler', currentPauseUntil: new Date(ServiceGemini.globalPauseUntil).toISOString() });
                        }
                    }).catch(err => {
                        logger.error('Error during global pause sleep.', { module: moduleName, operation: 'globalPauseHandler', error: formatErrorForLog(err) });
                        ServiceGemini.isGloballyPaused = false; // Attempt reset on error
                        ServiceGemini.globalPauseUntil = 0;
                        ServiceGemini.globalPausePromise = null;
                    });
                }
                try {
                    await ServiceGemini.globalPausePromise;
                } catch { /* Error handled in the promise catch */ }

            } else {
                 // If pause time expired *before* we checked, reset flags
                 if (ServiceGemini.isGloballyPaused) {
                    logger.info('Global quota pause already expired. Resetting flag.', { module: moduleName, operation });
                    ServiceGemini.isGloballyPaused = false;
                    ServiceGemini.globalPauseUntil = 0;
                    ServiceGemini.globalPausePromise = null;
                 }
            }
        }

        // 2. Initialize model
        const model = await this.initializeModel();
        if (!model) {
            logger.error('Failed to initialize model. Cannot analyze text.', { module: moduleName, operation });
            return null;
        }

        // 3. Retry loop
        let retries = 0;
        while (retries <= MAX_RETRIES) {
            //logger.debug(`Attempt ${retries + 1}/${MAX_RETRIES + 1}...`, { module: moduleName, operation, attempt: retries + 1, maxAttempts: MAX_RETRIES + 1 });
            const result: AttemptResult = await this._attemptAnalysis(model, text);

            // a) Success
            if (typeof result === 'object' && result !== null && !(result instanceof Error) && 'analysis' in result && 'summary' in result) {
                logger.info('Analysis successful.', { module: moduleName, operation, attempt: retries + 1 });
                return result;
            }

            // b) Quota Error
            if (result instanceof QuotaError) {
                if (retries < MAX_RETRIES) {
                    const delayMs = result.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
                    retries++;
                    logger.warn(`Quota error (429). Activating global pause. Retrying attempt ${retries + 1}/${MAX_RETRIES + 1} in ${delayMs / 1000}s...`, { module: moduleName, operation, attempt: retries + 1, maxAttempts: MAX_RETRIES + 1, delayMs: delayMs, quotaErrorMessage: result.message });

                    // Activate Global Pause Logic
                    const pauseUntil = Date.now() + delayMs;
                    if (pauseUntil > ServiceGemini.globalPauseUntil) {
                        logger.warn(`Setting/Extending global pause until ${new Date(pauseUntil).toISOString()}`, { module: moduleName, operation: 'globalPauseActivation', pauseUntil: new Date(pauseUntil).toISOString(), triggeredByAttempt: retries });
                        ServiceGemini.isGloballyPaused = true;
                        ServiceGemini.globalPauseUntil = pauseUntil;
                        // Create a *new* promise for this pause duration, only if needed
                        ServiceGemini.globalPausePromise = sleep(delayMs).then(() => { // Use utility function
                            logger.warn('Global quota pause finished (timer initiated by this request).', { module: moduleName, operation: 'globalPauseHandler', triggeredByAttempt: retries });
                             if (Date.now() >= ServiceGemini.globalPauseUntil) {
                                //logger.debug('Resetting global pause flags after wait.', { module: moduleName, operation: 'globalPauseHandler' });
                                ServiceGemini.isGloballyPaused = false;
                                ServiceGemini.globalPauseUntil = 0;
                                ServiceGemini.globalPausePromise = null;
                             } else {
                                 logger.warn('Global pause was extended further. Not resetting flags.', { module: moduleName, operation: 'globalPauseHandler', currentPauseUntil: new Date(ServiceGemini.globalPauseUntil).toISOString() });
                             }
                        }).catch(err => {
                            logger.error('Error during global pause sleep.', { module: moduleName, operation: 'globalPauseHandler', error: formatErrorForLog(err) });
                            ServiceGemini.isGloballyPaused = false; ServiceGemini.globalPauseUntil = 0; ServiceGemini.globalPausePromise = null; // Reset state on error
                        });
                    } else {
                        logger.warn('Global pause already active and extends further. This request will wait.', { module: moduleName, operation, currentPauseUntil: new Date(ServiceGemini.globalPauseUntil).toISOString() });
                    }
                    // End Global Pause Activation

                    await sleep(delayMs); // Wait for individual retry delay regardless of global state
                    continue;
                } else {
                    // Max retries exceeded for quota error
                    const errorMessage = `Quota error persisted after ${MAX_RETRIES + 1} attempts. Last error: ${result.message}`;
                    logger.error(errorMessage, { module: moduleName, operation, maxAttempts: MAX_RETRIES + 1, lastError: result.message });
                    // Optionally use handleServiceError for consistency
                    // handleServiceError(new Error(errorMessage), `${moduleName}:${operation}`, `Quota error persisted`);
                    return null;
                }
            }

            // c) Other specific non-retryable errors (parse, validation, empty)
            if (typeof result === 'string') {
                logger.error(`Non-retryable error during analysis: ${result}. Aborting.`, { module: moduleName, operation, errorType: result, attempt: retries + 1 });
                return null;
            }

            // d) Generic API Error or other unexpected Error (non-quota)
            if (result instanceof Error) {
                 // Error should have already been logged by _attemptAnalysis via handleServiceError
                logger.error(`Unhandled non-quota API error encountered during retry loop. Aborting analysis.`, { module: moduleName, operation, error: formatErrorForLog(result), attempt: retries + 1 });
                return null;
            }

            // e) Safeguard for unexpected result types
            logger.error('Unexpected state in analyzeText retry loop. Aborting.', { module: moduleName, operation, result: result, attempt: retries + 1 });
            return null;

        } // End while loop

        // Should only be reached if loop finishes unexpectedly (e.g., MAX_RETRIES logic error)
        logger.error(`Analysis failed after ${MAX_RETRIES + 1} attempts due to persistent issues (exited loop unexpectedly).`, { module: moduleName, operation, maxAttempts: MAX_RETRIES + 1 });
        return null;
    }
}