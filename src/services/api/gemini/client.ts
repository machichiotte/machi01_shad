import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerativeModel } from "@google/generative-ai";
import { config } from '@config/index';
import { RepoConfigApi } from '@src/repo/repoConfigApi';
import { handleServiceError } from '@utils/errorUtil';
import { DEFAULT_APICONFIG } from "@config/default";
import path from 'path';
import { logger } from '@utils/loggerUtil';
import { QuotaError } from './types';
import { formatErrorForLog, parseRetryDelay } from './utils';
import {
    QUOTA_ERROR_STATUS_CODE_NUM,
    QUOTA_ERROR_STATUS_CODE_STR,
    QUOTA_ERROR_MESSAGE_FRAGMENT,
} from './constants';

const moduleName = path.parse(__filename).name;

export class GeminiClient {
    private model: GenerativeModel | null = null;

    async initialize(): Promise<void> {
        const operation = 'initialize';
        const geminiConfig = config.apiConfig.gemini;
        if (!geminiConfig) {
            logger.warn('Service disabled: Gemini configuration missing.', { module: moduleName, operation });
            this.model = null;
            return;
        }

        const decryptedConfig = RepoConfigApi.decryptConfigGemini(geminiConfig);
        if (!decryptedConfig?.apiKey) {
            logger.warn('Service disabled: Invalid or incomplete Gemini configuration (API key missing?).', { module: moduleName, operation });
            this.model = null;
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(decryptedConfig.apiKey);
            const modelName = decryptedConfig?.model ?? DEFAULT_APICONFIG.gemini.model;
            //logger.debug(`Initializing Gemini model: ${modelName}`, { module: moduleName, operation, modelName });

            this.model = genAI.getGenerativeModel({
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
            this.model = null;
        }
    }

    async generateContent(prompt: string): Promise<string | QuotaError | Error | null> {
        const operation = 'generateContent';
        if (!this.model) {
            logger.error('Gemini model not initialized.', { module: moduleName, operation });
            return new Error('Gemini model not initialized.');
        }

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            if (!responseText?.trim()) {
                logger.warn('Received empty response from API.', { module: moduleName, operation });
                return 'empty_response'; // Consider creating a specific EmptyResponseError
            }

            /*logger.debug(`Received raw response. Length: ${responseText.length}`, {
                module: moduleName,
                operation,
                responseLength: responseText.length,
            });*/

            return responseText;

        } catch (error: unknown) {
            const errorDetails = formatErrorForLog(error);
            let errorMessage = "Unknown error during API call";
            let httpStatusCode: string | number | undefined = undefined;
            let isQuotaError = false;
            let retryDelayMs: number | null | undefined;

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

                if (isQuotaError && 'message' in error && typeof error.message === 'string') {
                    retryDelayMs = parseRetryDelay(error.message);
                }
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
                return new QuotaError(errorMessage, retryDelayMs ?? null); // Provide null as default if undefined
            }

            // Log non-quota errors using the shared handler
            handleServiceError(error, `${moduleName}:${operation}`, `Non-quota API error. Status: ${httpStatusCode ?? 'N/A'}`);
            return error instanceof Error ? error : new Error(errorMessage);
        }
    }
}