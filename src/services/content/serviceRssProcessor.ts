// src/services/content/serviceRssProcessor.ts
import { ServiceRssFetcher } from '@services/content/serviceRssFetcher';
import { ServiceContentScraper } from '@services/content/serviceContentScraper';
import { ServiceGemini } from '@src/services/api/serviceGemini';
import { RepoRss } from '@src/repo/repoRss'; // Import the repository
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';
import { RssArticle, RssFeedConfig, ServerRssConfig, ProcessedArticleData } from '@typ/rss';

const SERVICE_NAME = 'ServiceRssProcessor';

export class ServiceRssProcessor {
    public static async fetchDatabaseRss(): Promise<ProcessedArticleData[]> {
        try {
            // Data fetched here will now have dates as strings if the change below is implemented
            return await RepoRss.fetchAll()
        } catch (error) {
            handleServiceError(
                error,
                'fetchDatabaseRss',
                'Erreur lors de la récupération des données Rss de la base de données'
            )
            throw error
        }
    }

    static async processAllFeeds(): Promise<void> {
        console.info(`[${SERVICE_NAME}] Starting processing of all RSS feeds...`);

        const rssConfig = config.serverConfig?.rss;

        if (!rssConfig || !rssConfig.enabled) {
            console.warn(`[${SERVICE_NAME}] RSS processing is disabled or configuration is missing.`);
            return;
        }

        const delayBetweenArticles = rssConfig.delayBetweenArticlesMs ?? 2000;
        const delayBetweenFeeds = rssConfig.delayBetweenFeedsMs ?? 5000;

        const feedsToProcess: RssFeedConfig[] = [];
        if (rssConfig.categories) {
            for (const categoryName in rssConfig.categories) {
                const categoryFeeds = rssConfig.categories[categoryName] || [];
                for (const feed of categoryFeeds) {
                    if (feed.enabled !== false) {
                        feedsToProcess.push({ ...feed, category: categoryName });
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

        for (let i = 0; i < feedsToProcess.length; i++) {
            const feed = feedsToProcess[i];
            console.info(`[${SERVICE_NAME}] Processing feed: ${feed.name} (${feed.url}) from category [${feed.category}]`);
            try {
                const articles = await ServiceRssFetcher.getArticlesFromFeed(feed.url);
                console.info(`[${SERVICE_NAME}] Fetched ${articles.length} articles from ${feed.name}`);

                for (const article of articles) {
                    await ServiceRssProcessor.processSingleArticle(article, feed, rssConfig);

                    if (delayBetweenArticles > 0) {
                        await new Promise(resolve => setTimeout(resolve, delayBetweenArticles));
                    }
                }
            } catch (error) {
                handleServiceError(error, SERVICE_NAME, `Error processing feed ${feed.name} (${feed.url})`);
            }

            if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                console.debug(`[${SERVICE_NAME}] Delaying ${delayBetweenFeeds}ms before next feed.`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenFeeds));
            }
        }
        console.info(`[${SERVICE_NAME}] Finished processing all RSS feeds.`);
    }

    private static async processSingleArticle(
        article: RssArticle,
        feed: RssFeedConfig,
        rssConfig: ServerRssConfig
    ): Promise<void> {
        const fetchedAtDate = new Date(); // Keep as Date object for now
        console.debug(`[${SERVICE_NAME}] Processing article: ${article.link} from feed ${feed.name}`);

        try {
            const existingArticle = await RepoRss.findByLink(article.link);
            // Check assumes processedAt is stored as string now if previously processed successfully
            if (existingArticle?.processedAt && !existingArticle.error) {
                // Optionally add more robust check, e.g., check if processedAt is a valid date string
                console.debug(`[${SERVICE_NAME}] Article already successfully processed: ${article.link}`);
                return;
            }

            let fullContent = article.contentSnippet;
            let scraped = false;
            const minContentLength = rssConfig.minContentLengthForScraping ?? 250;

            if (!fullContent || fullContent.length < minContentLength) {
                console.info(`[${SERVICE_NAME}] Snippet insufficient for ${article.link}. Attempting scrape...`);
                try {
                    const scrapeResult = await ServiceContentScraper.scrapeArticleContent(article.link);
                    if (scrapeResult) {
                        fullContent = scrapeResult;
                        scraped = true;
                        console.info(`[${SERVICE_NAME}] Successfully scraped content for ${article.link}.`);
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

            // Parse the publication date first
            const publicationDateObject = ServiceRssProcessor.parseDate(article.isoDate);

            // MODIFIED: Base data now stores dates as ISO strings or null
            const baseData: Partial<ProcessedArticleData> = {
                link: article.link,
                title: article.title,
                sourceFeed: feed.url,
                feedName: feed.name,
                category: feed.category,
                // Convert Date object to ISO string
                fetchedAt: fetchedAtDate.toISOString(),
                scrapedContent: scraped,
                // Convert parsed Date object to ISO string, or null if parsing failed
                publicationDate: publicationDateObject?.toISOString() ?? null,
            };

            let articleDataToSave: Partial<ProcessedArticleData>;
            const processedAtDate = new Date(); // Get current date for processing

            if (!fullContent) {
                console.warn(`[${SERVICE_NAME}] Content could not be obtained for: ${article.link}. Saving partial data with error.`);
                articleDataToSave = {
                    ...baseData,
                    error: `Content unavailable (${scraped ? 'scrape failed' : 'snippet missing'})`,
                    // MODIFIED: Store processedAt as ISO string
                    processedAt: processedAtDate.toISOString(),
                    summary: null,
                    analysis: null
                };
            } else {
                let summary: string | null = null;
                let analysis: string | null = null;
                let geminiError: string | null = null;

                const geminiDelay = rssConfig.geminiRequestDelayMs ?? 8000;
                if (geminiDelay > 0) {
                    console.debug(`[${SERVICE_NAME}] Applying Gemini delay: ${geminiDelay}ms`);
                    await new Promise(resolve => setTimeout(resolve, geminiDelay));
                }

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
                    // MODIFIED: Store processedAt as ISO string
                    processedAt: processedAtDate.toISOString(),
                    error: geminiError // Will be null if no error
                };
            }

            // Optional: Clean undefined keys (though converting dates handles most cases)
            Object.keys(articleDataToSave).forEach((key) => {
                const typedKey = key as keyof ProcessedArticleData;
                if (articleDataToSave[typedKey] === undefined) {
                    // Set to null instead of deleting? Or ensure baseData has defaults
                    // With current changes (ISO strings or null), undefined shouldn't occur for dates.
                    delete articleDataToSave[typedKey]; // Keep deletion if other properties might be undefined
                }
            });

            console.info(`[${SERVICE_NAME}] Saving results via RepoRss for: ${article.link}`);
            // Ensure RepoRss.upsertByLink and the database schema expect/handle string dates
            await RepoRss.upsertByLink(articleDataToSave);

        } catch (error) {
            const errorMessage = `Major error processing article ${article.link} from feed ${feed.name}: ${error instanceof Error ? error.message : String(error)}`;
            handleServiceError(error, SERVICE_NAME, errorMessage);
            try {
                console.error(`[${SERVICE_NAME}] Attempting to save error state to DB for ${article.link}`);
                // Ensure updateErrorStatus also handles dates as strings if it updates timestamps
                await RepoRss.updateErrorStatus(article.link, errorMessage);
            } catch (dbError) {
                handleServiceError(dbError, SERVICE_NAME, `CRITICAL: Could not save error state to DB for article ${article.link}`);
            }
        }
    }

    // Keep parseDate as it is, returning Date | null
    private static parseDate(dateString: string | undefined | null): Date | null {
        if (!dateString) {
            return null;
        }
        try {
            const date = new Date(dateString);
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