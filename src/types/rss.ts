// src/types/rss.ts
import { ObjectId } from 'mongodb';

export interface AnalysisWithSummary {
    analysis: FinancialAnalysis;
    summary: string;
}

export interface ProcessedArticleData {
    _id?: ObjectId;
    title: string;
    link: string;
    publicationDate?: string | null;
    sourceFeed?: string | null;
    feedName?: string | null;
    category?: string | null;
    fetchedAt: string | null;
    processedAt?: string | null;
    summary?: string | null;
    // analysis?: string | null; avant
    analysis?: FinancialAnalysis | null; // maintenant
    error?: string | null;
    scrapedContent?: boolean;
}

export interface FinancialAnalysis {
    isRelevant?: 'Yes' | 'No' | 'Partial';
    relevanceReason?: string;
    mentionedAssets?: string[];
    financialSentiment?: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
    sentimentReason?: string;
    potentialImpact?: string;
    financialThemes?: string[];
    actionableInfo?: string;
}

export interface RssArticle {
    title: string;
    link: string;
    contentSnippet?: string; // Extrait fourni par le flux RSS
    isoDate?: string;        // Date au format ISO
    sourceFeed: string;       // URL du flux d'origine
}

/**
 * Représente un flux RSS unique dans la configuration.
 */
export interface RssFeedConfig {
    name: string;         // Nom affichable du flux (ex: "CoinTribune")
    url: string;          // URL du flux RSS
    enabled?: boolean;    // Activer/désactiver ce flux spécifique (défaut: true si absent)
    category?: string;    // Catégorie (sera ajoutée dynamiquement lors du traitement)
}

/**
 * Structure pour les catégories de flux RSS.
 * Les clés sont les noms des catégories (ex: "News", "Crypto").
 */
export type RssCategoryConfig = Record<string, RssFeedConfig[]>;

/**
 * Configuration complète pour le traitement RSS.
 */
export interface ServerRssConfig {
    enabled: boolean;                   // Activer/désactiver globalement le traitement RSS
    delayBetweenArticlesMs: number;     // Délai entre les articles
    delayBetweenFeedsMs: number;        // Délai entre les différents flux (URLs)
    minContentLengthForScraping: number; // Seuil pour le scraping
    scrapeRetryDelayMs: number;         // Délai après scraping réussi
    geminiRequestDelayMs: number; // Délai avant chaque série d'appels Gemini (résumé/analyse)
    categories: RssCategoryConfig;      // Les catégories et leurs flux
}