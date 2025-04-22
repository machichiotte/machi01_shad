// src/services/api/gemini/serviceGemini.ts
import path from 'path';
import { logger } from '@utils/loggerUtil';
import type { AnalysisWithSummary, FinancialAnalysis } from "@typ/rss";
import {
    MAX_RETRIES,
    DEFAULT_RETRY_DELAY_MS,
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
import { sleep, formatErrorForLog, cleanJsonMarkdown } from './utils';
import { QuotaManager } from './quotaManager';
import { GeminiClient } from './client';

const moduleName = path.parse(__filename).name;

export class ServiceGemini {
    private static client: GeminiClient | null = null;

    private static async getClient(): Promise<GeminiClient | null> {
        if (!ServiceGemini.client) {
            ServiceGemini.client = new GeminiClient();
            await ServiceGemini.client.initialize();
        }
        return ServiceGemini.client;
    }

    private static _buildAnalysisPrompt(text: string): string {
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

    private static _validateAnalysisResponse(parsedJson: unknown): AnalysisWithSummary | null {
        const operation = '_validateAnalysisResponse';

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

    private static async _attemptAnalysis(text: string): Promise<AttemptResult> {
        const operation = '_attemptAnalysis';
        const client = await this.getClient();
        if (!client) {
            return new Error('Gemini client not initialized.');
        }

        const prompt = this._buildAnalysisPrompt(text);

        const response = await client.generateContent(prompt);

        if (typeof response === 'string') {
            const cleanedText = cleanJsonMarkdown(response);
            if (!cleanedText) {
                logger.warn('Received empty response after cleaning markdown.', { module: moduleName, operation });
                return 'empty_response';
            }
            try {
                const parsedJson: unknown = JSON.parse(cleanedText);
                //logger.debug('Successfully parsed JSON response.', { module: moduleName, operation });
                const validatedData = this._validateAnalysisResponse(parsedJson);
                if (!validatedData) {
                    logger.warn('Response validation failed. See previous validation logs.', { module: moduleName, operation });
                    return 'validation_error';
                }
                return validatedData;
            } catch (parseError) {
                logger.error('JSON parsing error.', {
                    module: moduleName,
                    operation,
                    error: formatErrorForLog(parseError),
                    rawResponse: response,
                });
                return 'parse_error';
            }
        } else if (response instanceof QuotaError) {
            return response;
        } else if (response instanceof Error) {
            logger.error(`API error during attempt: ${response.message}`, { module: moduleName, operation, error: formatErrorForLog(response) });
            return response;
        } else if (response === 'empty_response') {
            return 'empty_response';
        } else {
            logger.error('Unexpected response type from generateContent.', { module: moduleName, operation, responseType: typeof response });
            return new Error('Unexpected response from API.');
        }
    }

    static async analyzeText(text: string): Promise<AnalysisWithSummary | null> {
        const operation = 'analyzeText';
        //logger.debug('Analyze text request received.', { module: moduleName, operation, textLength: text.length });

        // 1. Wait for global pause if active
        await QuotaManager.waitForGlobalPause();

        // 2. Retry loop
        let retries = 0;
        while (retries <= MAX_RETRIES) {
            //logger.debug(`Attempt ${retries + 1}/${MAX_RETRIES + 1}...`, { module: moduleName, operation, attempt: retries + 1, maxAttempts: MAX_RETRIES + 1 });
            const result: AttemptResult = await this._attemptAnalysis(text);

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
                    await QuotaManager.pauseGlobally(delayMs, retries);
                    await sleep(delayMs); // Wait for individual retry delay as well
                    continue;
                } else {
                    // Max retries exceeded for quota error
                    const errorMessage = `Quota error persisted after ${MAX_RETRIES + 1} attempts. Last error: ${result.message}`;
                    logger.error(errorMessage, { module: moduleName, operation, maxAttempts: MAX_RETRIES + 1, lastError: result.message });
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
                // Error should have already been logged by _attemptAnalysis
                logger.error(`Unhandled non-quota API error encountered during retry loop. Aborting analysis.`, { module: moduleName, operation, error: formatErrorForLog(result), attempt: retries + 1 });
                return null;
            }

            // e) Safeguard for unexpected result types
            logger.error('Unexpected state in analyzeText retry loop. Aborting.', { module: moduleName, operation, result: result, attempt: retries + 1 });
            return null;

        } // End while loop

        // Should only be reached if loop finishes unexpectedly
        logger.error(`Analysis failed after ${MAX_RETRIES + 1} attempts due to persistent issues (exited loop unexpectedly).`, { module: moduleName, operation, maxAttempts: MAX_RETRIES + 1 });
        return null;
    }
}