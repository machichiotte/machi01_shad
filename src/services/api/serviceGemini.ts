// src/services/serviceGemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { config } from '@config/index'
import { RepoConfigApi } from '@repo/config/repoConfigApi'
import { handleServiceError } from '@utils/errorUtil'

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
                model: "gemini-1.5-flash", // Ou un autre modèle
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                ],
                generationConfig: {
                    maxOutputTokens: 8192,
                    responseMimeType: "text/plain",
                },
            }) as GeminiModel;
        } catch (error) {
            console.error(`[${SERVICE_NAME}] Erreur lors de l'initialisation du modèle Gemini :`, error);
            return null;
        }
    }

    static async summarizeText(text: string): Promise<string | null> {
        const model = await this.initializeModel();
        if (!model) return null;

        try {
            console.info(`[${SERVICE_NAME}] Demande de résumé...`);
            const prompt = `Résume le texte suivant de manière concise et informative en français :\n\n${text}`;
            const result = await model.generateContent(prompt);
            console.info(`[${SERVICE_NAME}] Résumé reçu.`);
            return result.response.text();
        } catch (error: unknown) {
            if (error instanceof Error) {
                handleServiceError(error, SERVICE_NAME, `Erreur lors du résumé`);
            } else {
                handleServiceError(new Error('Erreur inconnue'), SERVICE_NAME, `Erreur lors du résumé`);
            }
            return null;
        }
    }

    static async analyzeText(text: string): Promise<string | null> {
        const model = await this.initializeModel();
        if (!model) return null;

        try {
            console.info(`[${SERVICE_NAME}] Demande d'analyse...`);
            const prompt = `Analyse le texte suivant en français. Identifie les points clés, le sentiment général (positif, négatif, neutre), et les entités nommées principales (personnes, organisations, lieux) :\n\n${text}`;
            const result = await model.generateContent(prompt);
            console.info(`[${SERVICE_NAME}] Analyse reçue.`);
            return result.response.text();
        } catch (error: unknown) {
            if (error instanceof Error) {
                handleServiceError(error, SERVICE_NAME, `Erreur lors de l'analyse`);
            } else {
                handleServiceError(new Error('Erreur inconnue'), SERVICE_NAME, `Erreur lors de l'analyse`);
            }
            return null;
        }
    }

    static async createBrief(texts: string[]): Promise<string | null> {
        const model = await this.initializeModel();
        if (!model) return null;

        if (texts.length === 0) return "Aucun texte fourni pour le brief.";

        try {
            console.info(`[${SERVICE_NAME}] Demande de création de brief pour ${texts.length} article(s)...`);
            const combinedText = texts.join("\n\n---\n\n");
            const prompt = `À partir des articles suivants, crée un brief d'actualité cohérent et concis en français, mettant en évidence les informations les plus importantes :\n\n${combinedText}`;
            const result = await model.generateContent(prompt);
            console.info(`[${SERVICE_NAME}] Brief reçu.`);
            return result.response.text();
        } catch (error: unknown) {
            if (error instanceof Error) {
                handleServiceError(error, SERVICE_NAME, `Erreur lors de la création du brief`);
            } else {
                handleServiceError(new Error('Erreur inconnue'), SERVICE_NAME, `Erreur lors de la création du brief`);
            }
            return null;
        }
    }
}