// src/services/api/serviceGemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerativeModel } from "@google/generative-ai";
import { config } from '@config/index';
import { RepoConfigApi } from '@repo/config/repoConfigApi';
import { handleServiceError } from '@utils/errorUtil';
import { AnalysisWithSummary, FinancialAnalysis } from "@typ/rss";
import { DEFAULT_APICONFIG } from "@config/default";

// --- Constants ---
const SERVICE_NAME = 'ServiceGemini';
const MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 60000; // 60 seconds default
const QUOTA_ERROR_STATUS_CODE_NUM = 429; // Numeric status code
const QUOTA_ERROR_STATUS_CODE_STR = '429'; // String status code
const QUOTA_ERROR_MESSAGE_FRAGMENT = 'quota'; // Keyword to look for in messages

// Regex to extract retry delay (adjust if API error format changes)
const RETRY_DELAY_REGEX_PRIMARY = /"retryDelay":\s*"(\d+)s"/;
const RETRY_DELAY_REGEX_FALLBACK = /retry delay.*?(\d+)\s*s/i;

// --- JSON Structure Keys ---
const KEY_SUMMARY = 'summary';
const KEY_IS_RELEVANT = 'isRelevant';
const KEY_RELEVANCE_REASON = 'relevanceReason';
const KEY_MENTIONED_ASSETS = 'mentionedAssets';
const KEY_FINANCIAL_SENTIMENT = 'financialSentiment';
const KEY_SENTIMENT_REASON = 'sentimentReason';
const KEY_POTENTIAL_IMPACT = 'potentialImpact';
const KEY_FINANCIAL_THEMES = 'financialThemes';
const KEY_ACTIONABLE_INFO = 'actionableInfo';

// Expected values
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

// Result type for _attemptAnalysis
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
        console.debug(`[${SERVICE_NAME}] Parsed retry delay: ${seconds}s`);
        return seconds * 1000;
    }

    console.debug(`[${SERVICE_NAME}] Could not parse retry delay from error message.`);
    return null;
};

// --- Service Class ---
export class ServiceGemini {
    // --- Static Properties for Global Quota Handling ---
    private static isGloballyPaused: boolean = false;
    private static globalPauseUntil: number = 0;
    private static globalPausePromise: Promise<void> | null = null;

    // --- Model Initialization ---
    private static async initializeModel(): Promise<GenerativeModel | null> {
        const geminiConfig = config.apiConfig.gemini;
        if (!geminiConfig) {
            console.warn(`[${SERVICE_NAME}] Service disabled: Gemini configuration missing.`);
            return null;
        }

        const decryptedConfig = RepoConfigApi.decryptConfigGemini(geminiConfig);
        // Use optional chaining for safer access
        if (!decryptedConfig?.apiKey) {
            console.warn(`[${SERVICE_NAME}] Service disabled: Invalid or incomplete Gemini configuration (API key missing?).`);
            return null;
        }

        try {
            const genAI = new GoogleGenerativeAI(decryptedConfig.apiKey);
            // Use optional chaining and nullish coalescing for safer defaults
            const modelName = decryptedConfig?.model ?? DEFAULT_APICONFIG.gemini.model;

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
            handleServiceError(error, SERVICE_NAME, `Error initializing Gemini model`);
            return null;
        }
    }

    // --- Prompt Building ---
    private static _buildAnalysisPrompt(text: string): string {
        // Using template literal for better readability
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
        // Ensure it's a non-null object
        if (typeof parsedJson !== 'object' || parsedJson === null) {
            console.warn(`[${SERVICE_NAME}] Validation failed: Parsed JSON is not an object. Received:`, parsedJson);
            return null;
        }

        // Type assertion after check
        const data = parsedJson as Record<string, unknown>;

        const summary = data[KEY_SUMMARY];
        const isRelevant = data[KEY_IS_RELEVANT];

        // Validate mandatory fields
        if (typeof summary !== 'string' || summary.trim() === '') {
            console.warn(`[${SERVICE_NAME}] Validation failed: '${KEY_SUMMARY}' is missing, invalid, or empty. JSON:`, JSON.stringify(data));
            return null;
        }
        if (typeof isRelevant !== 'string' || !VALID_RELEVANCE.includes(isRelevant)) {
            console.warn(`[${SERVICE_NAME}] Validation failed: '${KEY_IS_RELEVANT}' is missing or invalid ('${isRelevant}'). JSON:`, JSON.stringify(data));
            return null;
        }

        // Helper type guards
        const isString = (val: unknown): val is string => typeof val === 'string';
        const isStringArray = (val: unknown): val is string[] => Array.isArray(val) && val.every(isString);
        // Use 'FinancialAnalysis['financialSentiment']' for precise type checking
        const isValidSentiment = (val: unknown): val is FinancialAnalysis['financialSentiment'] =>
            isString(val) && (VALID_SENTIMENT as ReadonlyArray<string>).includes(val);

        // Validate optional fields using type guards
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
            console.warn(`[${SERVICE_NAME}] Validation failed: One or more optional fields have incorrect types. JSON:`, JSON.stringify(data));
            return null;
        }

        // Construct validated object with type safety
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

        return {
            analysis: validatedAnalysis,
            summary: summary // Validated non-empty string
        };
    }

    // --- Single API Attempt (Revised Error Handling) ---
    private static async _attemptAnalysis(model: GenerativeModel, text: string): Promise<AttemptResult> {
        const prompt = this._buildAnalysisPrompt(text);
        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            if (!responseText?.trim()) {
                console.warn(`[${SERVICE_NAME}] Received empty response from API.`);
                return 'empty_response';
            }

            let parsedJson: unknown;
            try {
                const cleanedText = responseText.replace(/^```(?:json)?\s*|```$/g, '').trim();
                if (!cleanedText) {
                    console.warn(`[${SERVICE_NAME}] Received empty response after cleaning markdown.`);
                    return 'empty_response';
                }
                parsedJson = JSON.parse(cleanedText);
            } catch (parseError) {
                console.error(`[${SERVICE_NAME}] JSON parsing error: `, parseError);
                console.error(`[${SERVICE_NAME}] Raw text received (invalid JSON):\n---\n${responseText}\n---`);
                return 'parse_error';
            }

            const validatedData = this._validateAnalysisResponse(parsedJson);
            if (!validatedData) {
                return 'validation_error';
            }

            return validatedData; // Success

        } catch (error: unknown) {
            let errorMessage = "Unknown error during API call";
            let isQuotaError = false;
            let httpStatusCode: string | number | undefined = undefined;

            // Check if it's an Error instance to access message safely
            if (error instanceof Error) {
                errorMessage = error.message;

                // Check for common status/code properties without using 'any'
                // Check if 'status' property exists and is of expected type
                if ('status' in error && (typeof error.status === 'number' || typeof error.status === 'string')) {
                    httpStatusCode = error.status;
                    // Check if 'code' property exists and is of expected type (fallback)
                } else if ('code' in error && (typeof error.code === 'number' || typeof error.code === 'string')) {
                    httpStatusCode = error.code;
                }
                // We avoid GoogleGenerativeAIError specific internal properties like statusInfo

                // Determine if it's a quota error based on status or message
                isQuotaError = (httpStatusCode === QUOTA_ERROR_STATUS_CODE_NUM || httpStatusCode === QUOTA_ERROR_STATUS_CODE_STR) ||
                    errorMessage.toLowerCase().includes(QUOTA_ERROR_MESSAGE_FRAGMENT);

            } else {
                // Handle non-Error throws
                errorMessage = String(error);
                // Check message fragment as the only option
                isQuotaError = errorMessage.toLowerCase().includes(QUOTA_ERROR_MESSAGE_FRAGMENT);
            }

            // Handle Quota Error specifically
            if (isQuotaError) {
                console.warn(`[${SERVICE_NAME}] Quota error detected. Status: ${httpStatusCode ?? 'N/A'}. Raw error:`, error);
                const retryDelayMs = parseRetryDelay(errorMessage);
                // Return the specific QuotaError
                return new QuotaError(errorMessage, retryDelayMs);
            } else {
                // Handle other API errors
                handleServiceError(error, SERVICE_NAME, `Non-quota API error during analysis attempt. Status: ${httpStatusCode ?? 'N/A'}`);
                // Return the original error if it's an Error instance, otherwise wrap it
                return error instanceof Error ? error : new Error(errorMessage);
            }
        }
    }

    // --- Main Analysis Method (Revised with Global Pause and Retry Logic) ---
    static async analyzeText(text: string): Promise<AnalysisWithSummary | null> {
        // 1. Check and wait for global pause
        if (ServiceGemini.isGloballyPaused) {
            const now = Date.now();
            if (now < ServiceGemini.globalPauseUntil) {
                const waitTime = ServiceGemini.globalPauseUntil - now;
                console.warn(`[${SERVICE_NAME}] Global quota pause active. Waiting for ${Math.ceil(waitTime / 1000)}s...`);

                // Ensure only one sleep promise is active globally
                if (!ServiceGemini.globalPausePromise) {
                    ServiceGemini.globalPausePromise = sleep(waitTime).then(() => {
                        console.info(`[${SERVICE_NAME}] Global quota pause finished.`);
                        // Reset flags only if this promise was the one setting the current pause time
                        if (Date.now() >= ServiceGemini.globalPauseUntil) {
                            ServiceGemini.isGloballyPaused = false;
                            ServiceGemini.globalPauseUntil = 0;
                            ServiceGemini.globalPausePromise = null;
                        }
                    }).catch(err => {
                        // Handle potential errors in sleep/timeout itself
                        console.error(`[${SERVICE_NAME}] Error during global pause sleep:`, err);
                        ServiceGemini.isGloballyPaused = false; // Attempt to reset state
                        ServiceGemini.globalPauseUntil = 0;
                        ServiceGemini.globalPausePromise = null;
                    });
                }
                // Wait for the single global pause promise to resolve
                try {
                    await ServiceGemini.globalPausePromise;
                } catch { /* Error handled in the promise catch */ }

            } else {
                // Pause duration already expired, ensure flags are reset
                if (ServiceGemini.isGloballyPaused) {
                    console.info(`[${SERVICE_NAME}] Global quota pause already expired. Resetting flag.`);
                    ServiceGemini.isGloballyPaused = false;
                    ServiceGemini.globalPauseUntil = 0;
                    ServiceGemini.globalPausePromise = null; // Clear any lingering promise
                }
            }
        }

        // 2. Initialize model
        const model = await this.initializeModel();
        if (!model) {
            console.error(`[${SERVICE_NAME}] Failed to initialize model. Cannot analyze text.`);
            return null;
        }

        // 3. Retry loop for the specific request
        let retries = 0;
        while (retries <= MAX_RETRIES) {
            const result: AttemptResult = await this._attemptAnalysis(model, text);

            // a) Success
            if (typeof result === 'object' && result !== null && !(result instanceof Error) && 'analysis' in result && 'summary' in result) {
                return result; // Analysis successful
            }

            // b) Quota Error
            if (result instanceof QuotaError) {
                if (retries < MAX_RETRIES) {
                    const delayMs = result.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
                    retries++;
                    console.warn(`[${SERVICE_NAME}] Quota error (429). Activating global pause. Retrying attempt ${retries + 1}/${MAX_RETRIES + 1} in ${delayMs / 1000}s...`);
                    console.warn(`[${SERVICE_NAME}] Quota error detail: ${result.message}`);

                    // --- Activate Global Pause ---
                    const pauseUntil = Date.now() + delayMs;
                    // Update global pause only if this request requires a longer pause
                    if (pauseUntil > ServiceGemini.globalPauseUntil) {
                        console.info(`[${SERVICE_NAME}] Setting/Extending global pause until ${new Date(pauseUntil).toISOString()}`);
                        ServiceGemini.isGloballyPaused = true;
                        ServiceGemini.globalPauseUntil = pauseUntil;

                        // Create/replace the global pause promise
                        ServiceGemini.globalPausePromise = sleep(delayMs).then(() => {
                            console.info(`[${SERVICE_NAME}] Global quota pause finished (timer initiated by this request).`);
                            // Reset flags only if the pause hasn't been extended further by another request in the meantime
                            if (Date.now() >= ServiceGemini.globalPauseUntil) {
                                ServiceGemini.isGloballyPaused = false;
                                ServiceGemini.globalPauseUntil = 0;
                                ServiceGemini.globalPausePromise = null;
                            } else {
                                console.info(`[${SERVICE_NAME}] Global pause was extended further by another request. Not resetting flags.`);
                            }
                        }).catch(err => {
                            console.error(`[${SERVICE_NAME}] Error during global pause sleep:`, err);
                            ServiceGemini.isGloballyPaused = false; // Attempt reset
                            ServiceGemini.globalPauseUntil = 0;
                            ServiceGemini.globalPausePromise = null;
                        });
                    } else {
                        console.info(`[${SERVICE_NAME}] Global pause already active and extends further. This request will wait.`);
                        // If another request already set a longer pause, this request just waits its turn
                        // The check at the start of analyzeText will handle the waiting.
                    }
                    // --- End Global Pause Activation ---

                    // Wait for the *current* request's individual retry delay before continuing the loop
                    await sleep(delayMs);
                    continue; // Go to next retry attempt
                } else {
                    // Max retries exceeded for quota error
                    const errorMessage = `Quota error persisted after ${MAX_RETRIES + 1} attempts. Last error: ${result.message}`;
                    console.error(`[${SERVICE_NAME}] ${errorMessage}`);
                    handleServiceError(new Error(errorMessage), SERVICE_NAME, `Quota error persisted`);
                    return null; // Failed after retries
                }
            }

            // c) Other specific non-retryable errors ('parse_error', 'validation_error', 'empty_response')
            if (typeof result === 'string') {
                console.error(`[${SERVICE_NAME}] Non-retryable error during analysis: ${result}. See previous logs.`);
                return null; // Exit immediately
            }

            // d) Generic API Error or other unexpected Error instance
            if (result instanceof Error) {
                // Error should have been logged by _attemptAnalysis or handleServiceError
                console.error(`[${SERVICE_NAME}] Unhandled non-quota API error encountered: ${result.message}. Aborting analysis for this item.`);
                return null; // Exit immediately, non-retryable generic error
            }

            // Safeguard for unexpected results
            console.error(`[${SERVICE_NAME}] Unexpected state in analyzeText retry loop. Result:`, result);
            return null;

        } // End while loop

        // Should only be reached if MAX_RETRIES exceeded (handled inside the loop)
        console.error(`[${SERVICE_NAME}] Analysis failed after ${MAX_RETRIES + 1} attempts due to persistent issues.`);
        return null;
    }
}