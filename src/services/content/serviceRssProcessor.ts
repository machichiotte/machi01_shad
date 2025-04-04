// src/services/content/serviceRssProcessor.ts
// Removed: import { Collection } from 'mongodb';
// Removed: import { ServiceMongodb } from '@services/api/database/serviceMongodb';
import { ServiceRssFetcher } from '@services/content/serviceRssFetcher';
import { ServiceContentScraper } from '@services/content/serviceContentScraper';
import { ServiceGemini } from '@src/services/api/serviceGemini';
import { RepoRss } from '@src/repo/repoRss'; // Import the repository
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';
import { RssArticle, RssFeedConfig, ServerRssConfig, ProcessedArticleData } from '@typ/rss';

const SERVICE_NAME = 'ServiceRssProcessor';

export class ServiceRssProcessor {
    static async processAllFeeds(): Promise<void> {
        console.info(`[${SERVICE_NAME}] Starting processing of all RSS feeds...`);

        const rssConfig = config.serverConfig?.rss; // Récupérer la configuration RSS

        // Vérifier si la configuration RSS existe et est activée
        if (!rssConfig || !rssConfig.enabled) {
            console.warn(`[${SERVICE_NAME}] RSS processing is disabled or configuration is missing.`);
            return;
        }

        // Extraire les délais de la configuration avec des valeurs par défaut
        const delayBetweenArticles = rssConfig.delayBetweenArticlesMs ?? 2000;
        const delayBetweenFeeds = rssConfig.delayBetweenFeedsMs ?? 5000;

        // Créer une liste plate de tous les flux activés, en ajoutant la catégorie
        const feedsToProcess: RssFeedConfig[] = [];
        if (rssConfig.categories) {
            for (const categoryName in rssConfig.categories) {
                const categoryFeeds = rssConfig.categories[categoryName] || [];
                for (const feed of categoryFeeds) {
                    // Traiter si 'enabled' est true ou non défini (par défaut true)
                    if (feed.enabled !== false) {
                        feedsToProcess.push({ ...feed, category: categoryName }); // Ajoute la catégorie au feed pour référence future
                    } else {
                        console.debug(`[${SERVICE_NAME}] Skipping disabled feed: ${feed.name} (${feed.url})`);
                    }
                }
            }
        }

        if (feedsToProcess.length === 0) {
            console.warn(`[${SERVICE_NAME}] No enabled RSS feeds found in the configuration.`);
            return;
        }

        console.info(`[${SERVICE_NAME}] RSS feeds to process: ${feedsToProcess.map(f => `${f.name} [${f.category}]`).join(', ')}`);

        // Itérer sur la liste plate des flux à traiter
        for (let i = 0; i < feedsToProcess.length; i++) {
            const feed = feedsToProcess[i];
            console.info(`[${SERVICE_NAME}] Processing feed: ${feed.name} (${feed.url}) from category [${feed.category}]`);
            try {
                // Utiliser feed.url pour récupérer les articles
                const articles = await ServiceRssFetcher.getArticlesFromFeed(feed.url);
                console.info(`[${SERVICE_NAME}] Fetched ${articles.length} articles from ${feed.name}`);

                for (const article of articles) {
                    // Passer l'article brut et la configuration pertinente à processSingleArticle
                    // On passe aussi l'objet 'feed' pour que processSingleArticle connaisse la catégorie
                    await ServiceRssProcessor.processSingleArticle(article, feed, rssConfig); // << Passer feed et rssConfig

                    // Appliquer le délai entre les articles
                    if (delayBetweenArticles > 0) {
                        await new Promise(resolve => setTimeout(resolve, delayBetweenArticles));
                    }
                }
            } catch (error) {
                // Gérer les erreurs au niveau du flux individuel (ex: URL invalide, problème réseau)
                handleServiceError(error, SERVICE_NAME, `Error processing feed ${feed.name} (${feed.url})`);
            }

            // Appliquer le délai entre les flux (sauf après le dernier)
            if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                console.debug(`[${SERVICE_NAME}] Delaying ${delayBetweenFeeds}ms before next feed.`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenFeeds));
            }
        }
        console.info(`[${SERVICE_NAME}] Finished processing all RSS feeds.`);
    }

    // Modifier la signature pour accepter l'article, les infos du flux et la config RSS
    private static async processSingleArticle(
        article: RssArticle,
        feed: RssFeedConfig, // Contient name, url, category
        rssConfig: ServerRssConfig // Contient les seuils et délais
    ): Promise<void> {
        const fetchedAt = new Date();
        console.debug(`[${SERVICE_NAME}] Processing article: ${article.link} from feed ${feed.name}`);

        try {
            const existingArticle = await RepoRss.findByLink(article.link);
            if (existingArticle?.processedAt && !existingArticle.error) {
                console.debug(`[${SERVICE_NAME}] Article already successfully processed: ${article.link}`);
                return;
            }

            let fullContent = article.contentSnippet;
            let scraped = false;
            // Utiliser le seuil de la configuration
            const minContentLength = rssConfig.minContentLengthForScraping ?? 250;

            if (!fullContent || fullContent.length < minContentLength) {
                console.info(`[${SERVICE_NAME}] Snippet insufficient for ${article.link}. Attempting scrape...`);
                try {
                    const scrapeResult = await ServiceContentScraper.scrapeArticleContent(article.link);
                    if (scrapeResult) {
                        fullContent = scrapeResult;
                        scraped = true;
                        console.info(`[${SERVICE_NAME}] Successfully scraped content for ${article.link}.`);
                        // Utiliser le délai de scraping de la config
                        const scrapeDelay = rssConfig.scrapeRetryDelayMs ?? 1000;
                        if (scrapeDelay > 0) {
                            await new Promise(resolve => setTimeout(resolve, scrapeDelay));
                        }
                    } else {
                        console.warn(`[${SERVICE_NAME}] Scraping failed to retrieve content for ${article.link}.`);
                    }
                } catch (scrapeError) {
                    handleServiceError(scrapeError, SERVICE_NAME, `Scraping failed for article: ${article.link}`);
                    fullContent = article.contentSnippet;
                    scraped = false;
                }
            }

            const baseData: Partial<ProcessedArticleData> = {
                link: article.link,
                title: article.title,
                sourceFeed: feed.url, // Ou feed.name si vous préférez
                feedName: feed.name,  // Ajout du nom du feed
                category: feed.category, // << Ajout de la catégorie
                fetchedAt: fetchedAt,
                scrapedContent: scraped,
                publicationDate: ServiceRssProcessor.parseDate(article.isoDate),
            };

            let articleDataToSave: Partial<ProcessedArticleData>;

            if (!fullContent) {
                console.warn(`[${SERVICE_NAME}] Content could not be obtained for: ${article.link}. Saving partial data with error.`);
                articleDataToSave = {
                    ...baseData,
                    error: `Content unavailable (${scraped ? 'scrape failed' : 'snippet missing'})`,
                    processedAt: new Date(),
                    summary: null,
                    analysis: null
                };
            } else {
                let summary: string | null = null;
                let analysis: string | null = null;
                let geminiError: string | null = null;

                try {
                    console.debug(`[${SERVICE_NAME}] Requesting Gemini summary for ${article.link}`);
                    summary = await ServiceGemini.summarizeText(fullContent);
                    console.debug(`[${SERVICE_NAME}] Requesting Gemini analysis for ${article.link}`);
                    analysis = await ServiceGemini.analyzeText(fullContent);

                    if (!summary || !analysis) {
                        geminiError = 'Gemini processing returned empty results.';
                        console.warn(`[${SERVICE_NAME}] ${geminiError} for ${article.link}`);
                    }
                } catch (geminiErr) {
                    handleServiceError(geminiErr, SERVICE_NAME, `Gemini API error for ${article.link}`);
                    geminiError = `Gemini API Error: ${geminiErr instanceof Error ? geminiErr.message : String(geminiErr)}`;
                }

                articleDataToSave = {
                    ...baseData,
                    summary: summary,
                    analysis: analysis,
                    processedAt: new Date(),
                    error: geminiError
                };
            }

            // Nettoyer les undefined (optionnel)
            Object.keys(articleDataToSave).forEach((key) => {
                const typedKey = key as keyof ProcessedArticleData;
                if (articleDataToSave[typedKey] === undefined) {
                    delete articleDataToSave[typedKey];
                }
            });

            console.info(`[${SERVICE_NAME}] Saving results via RepoRss for: ${article.link}`);
            await RepoRss.upsertByLink(articleDataToSave);

        } catch (error) {
            const errorMessage = `Major error processing article ${article.link} from feed ${feed.name}: ${error instanceof Error ? error.message : String(error)}`;
            handleServiceError(error, SERVICE_NAME, errorMessage);
            try {
                console.error(`[${SERVICE_NAME}] Attempting to save error state to DB for ${article.link}`);
                await RepoRss.updateErrorStatus(article.link, errorMessage);
            } catch (dbError) {
                handleServiceError(dbError, SERVICE_NAME, `CRITICAL: Could not save error state to DB for article ${article.link}`);
            }
        }
    }

    private static parseDate(dateString: string | undefined | null): Date | null {
        if (!dateString) {
            return null;
        }
        try {
            const date = new Date(dateString);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.warn(`[${SERVICE_NAME}] Invalid date string encountered: ${dateString}`);
                return null;
            }
            return date;
        } catch (e) {
            console.warn(`[${SERVICE_NAME}] Error parsing date string "${dateString}":`, e);
            return null;
        }
    }
}