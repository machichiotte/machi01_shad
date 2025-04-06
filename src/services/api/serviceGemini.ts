// src/services/serviceGemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { config } from '@config/index'
import { RepoConfigApi } from '@repo/config/repoConfigApi'
import { handleServiceError } from '@utils/errorUtil'
import { FinancialAnalysis } from "@src/types/rss"

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

    static async analyzeText(text: string): Promise<FinancialAnalysis | null> {
        const model = await this.initializeModel();
        if (!model) return null;

        try {
            console.info(`[${SERVICE_NAME}] Demande d'analyse financière...`);
            //const prompt = `Analyse le texte suivant en français. Identifie les points clés, le sentiment général (positif, négatif, neutre), et les entités nommées principales (personnes, organisations, lieux) :\n\n${text}`; //avant

            const prompt = `Effectue une analyse financière et cryptomonnaie approfondie du texte suivant, en français. Concentre-toi sur les aspects suivants :

            1.  **Pertinence Financière/Crypto:** Évalue si cet article est pertinent pour un investisseur ou un analyste dans le domaine de la finance traditionnelle ou des cryptomonnaies. Justifie brièvement (Oui/Non/Partiellement, et pourquoi).
            2.  **Actifs Mentionnés:** Liste tous les actifs financiers ou cryptomonnaies spécifiquement mentionnés (par exemple, actions (avec ticker si possible), obligations, indices, matières premières, cryptomonnaies (ex: Bitcoin, Ethereum, etc.), projets DeFi, NFT, etc.).
            3.  **Sentiment Financier:** Quel est le sentiment général de l'article vis-à-vis des marchés, des actifs mentionnés, ou des événements économiques décrits ? (Positif, Négatif, Neutre, Mixte). Explique brièvement.
            4.  **Impact Potentiel:** L'article suggère-t-il un impact potentiel (positif ou négatif) sur certains actifs, secteurs ou sur le marché en général ? Décris cet impact potentiel.
            5.  **Thèmes Clés Financiers:** Identifie les principaux thèmes ou sujets financiers/crypto abordés (ex: régulation, adoption, innovation technologique, résultats d'entreprise, politique monétaire, analyse technique, etc.).
            6.  **Informations exploitables (sans conseil) :** Extrait les informations factuelles clés qui pourraient être utiles pour une prise de décision d'investissement (par exemple, annonces de partenariat, lancement de produit, chiffres clés, prévisions mentionnées *par l'article*, avertissements sur les risques). **Ne fournis AUCUN conseil d'achat ou de vente.**
            
            Voici le texte :
            \n\n${text}`;

            const result = await model.generateContent(prompt);
            const analysisText = result.response.text();
            console.info(`[${SERVICE_NAME}] Analyse textuelle reçue, tentative de parsing...`);

            if (!analysisText || analysisText.trim() === '') {
                console.warn(`[${SERVICE_NAME}] Analyse reçue vide.`);
                return null;
            }

            // Parse the text response into a FinancialAnalysis object
            const parsedAnalysis = ServiceGemini.parseAnalysisText(analysisText);
            console.info(`[${SERVICE_NAME}] Parsing de l'analyse terminé.`);
            return parsedAnalysis;

        } catch (error: unknown) {
            if (error instanceof Error) {
                handleServiceError(error, SERVICE_NAME, `Erreur lors de l'analyse`);
            } else {
                handleServiceError(new Error('Erreur inconnue'), SERVICE_NAME, `Erreur lors de l'analyse`);
            }
            return null;
        }
    }

    private static parseAnalysisText(text: string): FinancialAnalysis | null {
        try {
            const analysis: FinancialAnalysis = {
                isRelevant: null,
                relevanceReason: null,
                mentionedAssets: null,
                financialSentiment: null,
                sentimentReason: null,
                potentialImpact: null,
                financialThemes: null,
                actionableInfo: null,
            };

            const lines = text.split('\n');
            let currentSection = '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('1. **Pertinence Financière/Crypto:**')) {
                    currentSection = 'relevance';
                    const content = trimmedLine.substring('1. **Pertinence Financière/Crypto:**'.length).trim();
                    const matchRel = content.match(/^(Oui|Non|Partiellement)/i);
                    if (matchRel) {
                        const relevance = matchRel[1].toLowerCase();
                        if (relevance === 'oui') analysis.isRelevant = 'Yes';
                        else if (relevance === 'non') analysis.isRelevant = 'No';
                        else if (relevance === 'partiellement') analysis.isRelevant = 'Partial';
                    }
                    const reasonMatch = content.match(/Raison : (.*)/i);
                    analysis.relevanceReason = reasonMatch ? reasonMatch[1].trim() : content.replace(/^(Oui|Non|Partiellement)[.,]?\s*/i, '').trim(); // Fallback if "Raison:" missing
                } else if (trimmedLine.startsWith('2. **Actifs Mentionnés:**')) {
                    currentSection = 'assets';
                    const content = trimmedLine.substring('2. **Actifs Mentionnés:**'.length).trim();
                    if (content.toLowerCase() !== 'aucun' && content.length > 0) {
                        analysis.mentionedAssets = content.split(',').map(a => a.trim()).filter(a => a.length > 0);
                    } else {
                        analysis.mentionedAssets = null; // Explicitly null if "Aucun" or empty
                    }
                } else if (trimmedLine.startsWith('3. **Sentiment Financier:**')) {
                    currentSection = 'sentiment';
                    const content = trimmedLine.substring('3. **Sentiment Financier:**'.length).trim();
                    const matchSent = content.match(/^(Positif|Négatif|Neutre|Mixte)/i);
                    if (matchSent) {
                        const sentiment = matchSent[1].toLowerCase();
                        if (sentiment === 'positif') analysis.financialSentiment = 'Positive';
                        else if (sentiment === 'négatif') analysis.financialSentiment = 'Negative';
                        else if (sentiment === 'neutre') analysis.financialSentiment = 'Neutral';
                        else if (sentiment === 'mixte') analysis.financialSentiment = 'Mixed';
                    }
                    const reasonMatch = content.match(/Raison : (.*)/i);
                    analysis.sentimentReason = reasonMatch ? reasonMatch[1].trim() : content.replace(/^(Positif|Négatif|Neutre|Mixte)[.,]?\s*/i, '').trim(); // Fallback
                } else if (trimmedLine.startsWith('4. **Impact Potentiel:**')) {
                    currentSection = 'impact';
                    const content = trimmedLine.substring('4. **Impact Potentiel:**'.length).trim();
                    analysis.potentialImpact = (content.toLowerCase() !== 'aucun impact clair mentionné' && content.length > 0) ? content : null;
                } else if (trimmedLine.startsWith('5. **Thèmes Clés Financiers:**')) {
                    currentSection = 'themes';
                    const content = trimmedLine.substring('5. **Thèmes Clés Financiers:**'.length).trim();
                    if (content.toLowerCase() !== 'aucun thème spécifique' && content.length > 0) {
                        analysis.financialThemes = content.split(',').map(t => t.trim()).filter(t => t.length > 0);
                    } else {
                        analysis.financialThemes = null; // Explicitly null
                    }
                } else if (trimmedLine.startsWith('6. **Informations exploitables (sans conseil) :**')) {
                    currentSection = 'actionable';
                    const content = trimmedLine.substring('6. **Informations exploitables (sans conseil) :**'.length).trim();
                    analysis.actionableInfo = (content.toLowerCase() !== 'aucune information exploitable spécifique' && content.length > 0) ? content : null;
                } else if (trimmedLine.length > 0 && currentSection) {
                    // Attempt to append continuation lines (basic approach)
                    switch (currentSection) {
                        case 'relevance': {
                            analysis.relevanceReason = (analysis.relevanceReason ?? '') + ` ${trimmedLine}`;
                            break;
                        }
                        case 'sentiment': {
                            analysis.sentimentReason = (analysis.sentimentReason ?? '') + ` ${trimmedLine}`;
                            break;
                        }
                        case 'assets': { // Added braces for block scope
                            const assets = trimmedLine.split(',').map(a => a.trim()).filter(a => a.length > 0);
                            if (assets.length > 0) {
                                analysis.mentionedAssets = [...(analysis.mentionedAssets || []), ...assets];
                            }
                            break;
                        }
                        case 'impact': { // Added braces for consistency and safer concatenation
                            analysis.potentialImpact = (analysis.potentialImpact ?? '') + ` ${trimmedLine}`;
                            break;
                        }
                        case 'themes': { // Added braces for block scope
                            const themes = trimmedLine.split(',').map(t => t.trim()).filter(t => t.length > 0);
                            if (themes.length > 0) {
                                analysis.financialThemes = [...(analysis.financialThemes || []), ...themes];
                            }
                            break;
                        }
                        case 'actionable': { // Added braces for consistency and safer concatenation
                            analysis.actionableInfo = (analysis.actionableInfo ?? '') + ` ${trimmedLine}`;
                            break;
                        }
                    }
                } else {
                    // Reset current section if line doesn't match or is empty
                    currentSection = '';
                }
            }

            // Trim potential leading/trailing spaces from appended lines
            analysis.relevanceReason = analysis.relevanceReason?.trim() ?? null;
            analysis.sentimentReason = analysis.sentimentReason?.trim() ?? null;
            analysis.potentialImpact = analysis.potentialImpact?.trim() ?? null;
            analysis.actionableInfo = analysis.actionableInfo?.trim() ?? null;

            // Basic validation: Check if at least one field was parsed
            if (Object.values(analysis).every(v => v === null)) {
                console.warn(`[${SERVICE_NAME}] Parsing failed to extract any structured data from analysis text.`);
                // Optionally, store the raw text in a specific field if needed for debugging
                // analysis.rawText = text; // Example
                return null; // Or return the partially filled object if preferred
            }

            return analysis;
        } catch (error) {
            console.error(`[${SERVICE_NAME}] Error parsing analysis text: `, error);
            console.error(`[${SERVICE_NAME}] Raw text being parsed:\n---\n${text}\n---`);
            return null; // Return null if parsing fails catastrophically
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