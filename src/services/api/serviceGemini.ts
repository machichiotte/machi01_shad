// src/services/serviceGemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { config } from '@config/index';
import { RepoConfigApi } from '@repo/config/repoConfigApi';
import { handleServiceError } from '@utils/errorUtil';
import { AnalysisWithSummary, FinancialAnalysis } from "@src/types/rss";
import { DEFAULT_APICONFIG } from "@config/default";

const SERVICE_NAME = 'ServiceGemini';
const MAX_RETRIES = 3; // Maximum number of retries for quota errors
const DEFAULT_RETRY_DELAY_MS = 60000; // Default delay (60 seconds) if parsing fails

interface GeminiModel {
    generateContent(prompt: string): Promise<{ response: { text: () => string } }>;
}

// Helper function to pause execution
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to parse retry delay from error message
const parseRetryDelay = (errorMessage: string): number | null => {
    // Look for the RetryInfo structure, specifically the retryDelay value
    // Example: ... RetryInfo","retryDelay":"51s"}]
    const match = errorMessage.match(/"retryDelay":"(\d+)s"/);
    if (match && match[1]) {
        const seconds = parseInt(match[1], 10);
        if (!isNaN(seconds)) {
            return seconds * 1000; // Convert to milliseconds
        }
    }
    // Fallback regex if the above fails (less specific)
    const fallbackMatch = errorMessage.match(/retry delay.*?(\d+)\s*s/i);
    if (fallbackMatch && fallbackMatch[1]) {
        const seconds = parseInt(fallbackMatch[1], 10);
        if (!isNaN(seconds)) {
            return seconds * 1000; // Convert to milliseconds
        }
    }
    return null;
};

export class ServiceGemini {

    private static async initializeModel(): Promise<GeminiModel | null> {
        const geminiConfig = config.apiConfig.gemini;
        if (!geminiConfig) {
            console.warn(`[${SERVICE_NAME}] Service désactivé car la configuration Gemini est manquante.`);
            return null;
        }

        const decryptedGeminiConfig = RepoConfigApi.decryptConfigGemini(geminiConfig);
        if (!decryptedGeminiConfig || !decryptedGeminiConfig.apiKey) {
            console.warn(`[${SERVICE_NAME}] Service désactivé car la configuration Gemini est invalide.`);
            return null;
        }

        try {
            const genAI = new GoogleGenerativeAI(decryptedGeminiConfig.apiKey);
            return genAI.getGenerativeModel({
                model: decryptedGeminiConfig.model || DEFAULT_APICONFIG.gemini.model,
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
            }) as GeminiModel;
        } catch (error) {
            console.error(`[${SERVICE_NAME}] Erreur lors de l'initialisation du modèle Gemini :`, error);
            return null;
        }
    }

    /**
     * Analyse un texte pour en extraire des informations financières ET génère un résumé.
     * Gère les erreurs de quota Gemini avec une logique de retry et délai.
     * Retourne un objet contenant l'analyse et le résumé, ou null en cas d'erreur persistante.
     */
    static async analyzeText(text: string): Promise<AnalysisWithSummary | null> {
        const model = await this.initializeModel();
        if (!model) return null;

        let retries = 0;
        while (retries <= MAX_RETRIES) {
            try {
                console.info(`[${SERVICE_NAME}] Tentative ${retries + 1}/${MAX_RETRIES + 1}: Demande d'analyse financière et de résumé...`);
                const prompt = `Effectue une analyse financière et cryptomonnaie approfondie du texte suivant ET génère un résumé concis et informatif en français.
    Retourne ta réponse **UNIQUEMENT** sous la forme d'un objet JSON valide, sans aucun autre texte avant ou après.
    L'objet JSON doit avoir la structure suivante :
    {
      "summary": string, // Le résumé concis en français du texte fourni. Ce champ est OBLIGATOIRE.
      "isRelevant": "Yes" | "No" | "Partial", // Pertinence du texte pour la finance/crypto. OBLIGATOIRE.
      "relevanceReason"?: string, // Justification si pertinent ou partiellement pertinent.
      "mentionedAssets"?: string[], // Liste des actifs (actions, cryptos, etc.) mentionnés.
      "financialSentiment"?: "Positive" | "Negative" | "Neutral" | "Mixed", // Sentiment général du texte.
      "sentimentReason"?: string, // Justification du sentiment.
      "potentialImpact"?: string, // Impact potentiel sur les marchés ou actifs mentionnés.
      "financialThemes"?: string[], // Thèmes financiers principaux abordés.
      "actionableInfo"?: string // Informations concrètes ou points clés (pas de conseils).
    }

    N'inclus AUCUN conseil d'achat ou de vente. Assure-toi que le JSON est valide.

    Voici le texte :
    \n\n${text}`;

                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                // console.info(`[${SERVICE_NAME}] Réponse JSON (analyse + résumé) reçue, tentative de parsing...`);

                if (!responseText || responseText.trim() === '') {
                    console.warn(`[${SERVICE_NAME}] Réponse JSON reçue vide.`);
                    // Considérer ceci comme une erreur non récupérable pour cette tentative,
                    // mais pourrait être tenté à nouveau si d'autres erreurs le justifient.
                    // Pour l'instant, on retourne null. Si le problème est intermittent, la prochaine exécution pourrait réussir.
                    return null;
                }

                let parsedJson: unknown;
                try {
                    const cleanedText = responseText.replace(/^```json\s*|```$/g, '').trim();
                    parsedJson = JSON.parse(cleanedText);
                } catch (parseError) {
                    console.error(`[${SERVICE_NAME}] Erreur lors du parsing JSON: `, parseError);
                    console.error(`[${SERVICE_NAME}] Raw text reçu (non-JSON valide):\n---\n${responseText}\n---`);
                    return null;
                }

                if (typeof parsedJson !== 'object' || parsedJson === null) {
                    console.warn(`[${SERVICE_NAME}] Le JSON parsé n'est pas un objet.`, parsedJson);
                    return null;
                }

                const potentialCombinedData = parsedJson as Record<string, unknown>;

                // --- Validation du nouveau format ---
                if (typeof potentialCombinedData.summary !== 'string' || potentialCombinedData.summary.trim() === '') {
                    console.warn(`[${SERVICE_NAME}] Champ 'summary' manquant, invalide ou vide dans la réponse JSON.`, parsedJson);
                    return null; // Champ obligatoire manquant
                }
                const summary: string = potentialCombinedData.summary;

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { summary: _summary, ...potentialAnalysis } = potentialCombinedData;

                const isValidRelevant = typeof potentialAnalysis.isRelevant === 'string' &&
                    ['Yes', 'No', 'Partial'].includes(potentialAnalysis.isRelevant as string);

                if (!isValidRelevant) {
                    console.warn(`[${SERVICE_NAME}] Champ 'isRelevant' manquant ou invalide dans la réponse JSON.`, parsedJson);
                    return null; // Champ obligatoire manquant/invalide
                }

                const isValidAssets = potentialAnalysis.mentionedAssets === undefined ||
                    (Array.isArray(potentialAnalysis.mentionedAssets) &&
                        potentialAnalysis.mentionedAssets.every(asset => typeof asset === 'string'));

                const isValidSentiment = potentialAnalysis.financialSentiment === undefined ||
                    (typeof potentialAnalysis.financialSentiment === 'string' &&
                        ['Positive', 'Negative', 'Neutral', 'Mixed'].includes(potentialAnalysis.financialSentiment as string));

                const isValidStringOrUndefined = (field: unknown): boolean => field === undefined || typeof field === 'string';
                const isValidStringArrayOrUndefined = (field: unknown): boolean => field === undefined || (Array.isArray(field) && field.every(item => typeof item === 'string'));

                const isValidRelevanceReason = isValidStringOrUndefined(potentialAnalysis.relevanceReason);
                const isValidSentimentReason = isValidStringOrUndefined(potentialAnalysis.sentimentReason);
                const isValidPotentialImpact = isValidStringOrUndefined(potentialAnalysis.potentialImpact);
                const isValidThemes = isValidStringArrayOrUndefined(potentialAnalysis.financialThemes);
                const isValidActionableInfo = isValidStringOrUndefined(potentialAnalysis.actionableInfo);

                if (!isValidAssets || !isValidSentiment ||
                    !isValidRelevanceReason || !isValidSentimentReason ||
                    !isValidPotentialImpact || !isValidThemes || !isValidActionableInfo) {
                    console.warn(`[${SERVICE_NAME}] Un ou plusieurs champs de l'analyse financière ne correspondent pas au schéma attendu.`, potentialAnalysis);
                    // Structure invalide, on ne retente pas.
                    return null;
                }

                const validatedAnalysis = potentialAnalysis as FinancialAnalysis;

                // console.info(`[${SERVICE_NAME}] Parsing et validation JSON (analyse + résumé) réussis.`);

                // Succès ! Retourner le résultat
                return {
                    analysis: validatedAnalysis,
                    summary: summary
                };

            } catch (error: unknown) {
                // Gestion spécifique de l'erreur de quota
                if (error instanceof Error && error.message.includes('429 Too Many Requests') && error.message.includes('quota')) {
                    if (retries < MAX_RETRIES) {
                        const delayMs = parseRetryDelay(error.message) ?? DEFAULT_RETRY_DELAY_MS;
                        retries++;
                        console.warn(`[${SERVICE_NAME}] Erreur de quota (429) détectée. Tentative ${retries}/${MAX_RETRIES} dans ${delayMs / 1000} secondes...`);
                        console.warn(`[${SERVICE_NAME}] Détail erreur quota: ${error.message}`); // Log le message d'erreur complet pour debug
                        await sleep(delayMs);
                        continue; // Passe à l'itération suivante de la boucle while
                    } else {
                        handleServiceError(error, SERVICE_NAME, `Erreur de quota persistante après ${MAX_RETRIES} tentatives`);
                        return null; // Sortir après épuisement des tentatives
                    }
                } else {
                    // Gérer les autres erreurs (non-retryables dans ce contexte)
                    if (error instanceof Error) {
                        handleServiceError(error, SERVICE_NAME, `Erreur lors de l'analyse et du résumé (non-quota ou erreur inattendue)`);
                    } else {
                        handleServiceError(new Error('Erreur inconnue lors de l\'appel API ou du traitement'), SERVICE_NAME, `Erreur inconnue lors de l'analyse et du résumé`);
                    }
                    return null; // Sortir pour les erreurs non-retryables
                }
            }
        } // Fin de la boucle while

        // Si on sort de la boucle sans succès (ne devrait arriver que via MAX_RETRIES)
        console.error(`[${SERVICE_NAME}] Échec de l'analyse après ${MAX_RETRIES + 1} tentatives.`);
        return null;
    }
}