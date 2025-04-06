// src/services/serviceGemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { config } from '@config/index'
import { RepoConfigApi } from '@repo/config/repoConfigApi'
import { handleServiceError } from '@utils/errorUtil'
import { AnalysisWithSummary, FinancialAnalysis } from "@src/types/rss"
import { DEFAULT_APICONFIG } from "@config/default"

const SERVICE_NAME = 'ServiceGemini'

interface GeminiModel {
    generateContent(prompt: string): Promise<{ response: { text: () => string } }>
}

export class ServiceGemini {

    private static async initializeModel(): Promise<GeminiModel | null> {
        const geminiConfig = config.apiConfig.gemini;
        if (!geminiConfig) {
            console.warn(`[${SERVICE_NAME}] Service désactivé car la configuration Gemini est manquante.`)
            return null;
        }

        const decryptedGeminiConfig = RepoConfigApi.decryptConfigGemini(geminiConfig);
        if (!decryptedGeminiConfig || !decryptedGeminiConfig.apiKey) {
            console.warn(`[${SERVICE_NAME}] Service désactivé car la configuration Gemini est invalide.`)
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
     * Retourne un objet contenant l'analyse et le résumé, ou null en cas d'erreur.
     */
    static async analyzeText(text: string): Promise<AnalysisWithSummary | null> {
        const model = await this.initializeModel();
        if (!model) return null;

        try {
            console.info(`[${SERVICE_NAME}] Demande d'analyse financière et de résumé...`);
            // Mise à jour du prompt pour demander le résumé et l'analyse dans un seul JSON
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
            console.info(`[${SERVICE_NAME}] Réponse JSON (analyse + résumé) reçue, tentative de parsing...`);

            if (!responseText || responseText.trim() === '') {
                console.warn(`[${SERVICE_NAME}] Réponse JSON reçue vide.`);
                return null;
            }

            let parsedJson: unknown;
            try {
                // Nettoyage potentiel si Gemini ajoute des ```json ... ``` autour
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

            // 1. Valider et extraire le résumé
            if (typeof potentialCombinedData.summary !== 'string' || potentialCombinedData.summary.trim() === '') {
                console.warn(`[${SERVICE_NAME}] Champ 'summary' manquant, invalide ou vide dans la réponse JSON.`, parsedJson);
                // Vous pourriez décider de retourner null ou de continuer sans résumé
                // Ici, on choisit de retourner null car le résumé est demandé explicitement.
                return null;
            }
            const summary: string = potentialCombinedData.summary;

            // 2. Préparer l'objet pour la validation de FinancialAnalysis (exclure le résumé)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { summary: _summary, ...potentialAnalysis } = potentialCombinedData;


            // 3. Valider les champs de FinancialAnalysis (comme avant, mais sur l'objet 'potentialAnalysis')
            const isValidRelevant = typeof potentialAnalysis.isRelevant === 'string' &&
                ['Yes', 'No', 'Partial'].includes(potentialAnalysis.isRelevant as string);

            // Rendre isRelevant obligatoire comme demandé dans le prompt
            if (!isValidRelevant) {
                console.warn(`[${SERVICE_NAME}] Champ 'isRelevant' manquant ou invalide dans la réponse JSON.`, parsedJson);
                return null;
            }

            const isValidAssets = potentialAnalysis.mentionedAssets === undefined ||
                (Array.isArray(potentialAnalysis.mentionedAssets) &&
                    potentialAnalysis.mentionedAssets.every(asset => typeof asset === 'string'));

            const isValidSentiment = potentialAnalysis.financialSentiment === undefined ||
                (typeof potentialAnalysis.financialSentiment === 'string' &&
                    ['Positive', 'Negative', 'Neutral', 'Mixed'].includes(potentialAnalysis.financialSentiment as string));

            // Validation des autres champs (string ou undefined)
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
                // Vous pourriez décider de retourner quand même l'analyse partielle si certains champs sont bons
                // Ici, on est strict et on retourne null si la structure n'est pas parfaite.
                return null;
            }

            // 4. Construire l'objet FinancialAnalysis validé
            //    On force le type car on a validé les champs nécessaires.
            const validatedAnalysis = potentialAnalysis as FinancialAnalysis;

            console.info(`[${SERVICE_NAME}] Parsing et validation JSON (analyse + résumé) réussis.`);

            // 5. Retourner l'objet combiné
            return {
                analysis: validatedAnalysis,
                summary: summary
            };

        } catch (error: unknown) {
            if (error instanceof Error) {
                handleServiceError(error, SERVICE_NAME, `Erreur lors de l'analyse et du résumé`);
            } else {
                handleServiceError(new Error('Erreur inconnue'), SERVICE_NAME, `Erreur lors de l'analyse et du résumé`);
            }
            return null;
        }
    }

}