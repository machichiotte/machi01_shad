// src/services/content/serviceRssProcessor.ts
// Removed: import { Collection } from 'mongodb';
// Removed: import { ServiceMongodb } from '@services/api/database/serviceMongodb';
import { ServiceRssFetcher, RssArticle } from '@services/content/serviceRssFetcher';
import { ServiceContentScraper } from '@services/content/serviceContentScraper';
import { ServiceGemini } from '@src/services/api/serviceGemini';
import { RepoRss } from '@src/repo/repoRss'; // Import the repository
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';
import { ProcessedArticleData } from '@typ/rss';

const SERVICE_NAME = 'ServiceRssProcessor';

export class ServiceRssProcessor {
    static async processAllFeeds(): Promise<void> {
        console.info(`[${SERVICE_NAME}] Starting processing of all RSS feeds...`);
        // Removed: collection fetching logic

        const rssFeeds: string[] = config.serverConfig?.rssFeeds || [];
        if (rssFeeds.length === 0) {
            console.warn(`[${SERVICE_NAME}] No RSS feeds configured in serverConfig.rssFeeds.`);
            return;
        }
        console.info(`[${SERVICE_NAME}] RSS feeds to process: ${rssFeeds.join(', ')}`);

        const delayBetweenArticles = 2000; // Consider making configurable
        const delayBetweenFeeds = 5000;    // Consider making configurable

        for (const feedUrl of rssFeeds) {
            console.info(`[${SERVICE_NAME}] Processing feed: ${feedUrl}`);
            try {
                const articles = await ServiceRssFetcher.getArticlesFromFeed(feedUrl);
                console.info(`[${SERVICE_NAME}] Fetched ${articles.length} articles from ${feedUrl}`);
                for (const article of articles) {

                    // Pass the article directly, RepoRss handles DB interaction
                    await ServiceRssProcessor.processSingleArticle(article);
                    if (delayBetweenArticles > 0) {
                        await new Promise(resolve => setTimeout(resolve, delayBetweenArticles));
                    }
                }
            } catch (error) {
                // Log feed-level processing errors
                handleServiceError(error, SERVICE_NAME, `Error processing feed ${feedUrl}`);
            }
            if (delayBetweenFeeds > 0 && rssFeeds.indexOf(feedUrl) < rssFeeds.length - 1) { // Avoid delay after last feed
                console.debug(`[${SERVICE_NAME}] Delaying ${delayBetweenFeeds}ms before next feed.`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenFeeds));
            }
        }
        console.info(`[${SERVICE_NAME}] Finished processing all RSS feeds.`);
    }

    private static async processSingleArticle(article: RssArticle): Promise<void> {
        const fetchedAt = new Date();
        console.debug(`[${SERVICE_NAME}] Processing article: ${article.link}`);

        try {
            // Use RepoRss to find the existing article
            const existingArticle = await RepoRss.findByLink(article.link);
            if (existingArticle?.processedAt && !existingArticle.error) { // Check if processedAt exists and error is null/undefined
                console.debug(`[${SERVICE_NAME}] Article already successfully processed: ${article.link}`);
                return; // Skip processing
            }

            let fullContent = article.contentSnippet;
            let scraped = false;
            const minContentLength = 250; // Consider making configurable

            if (!fullContent || fullContent.length < minContentLength) {
                console.info(`[${SERVICE_NAME}] Snippet insufficient for ${article.link}. Attempting scrape...`);
                try {
                    const scrapeResult = await ServiceContentScraper.scrapeArticleContent(article.link);
                    if (scrapeResult) {
                        fullContent = scrapeResult;
                        scraped = true;
                        console.info(`[${SERVICE_NAME}] Successfully scraped content for ${article.link}.`);
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Keep delay after successful scrape
                    } else {
                        console.warn(`[${SERVICE_NAME}] Scraping failed to retrieve content for ${article.link}.`);
                    }
                } catch (scrapeError) {
                    handleServiceError(scrapeError, SERVICE_NAME, `Scraping failed for article: ${article.link}`);
                    // Keep original snippet if scraping fails, proceed if snippet exists
                    fullContent = article.contentSnippet;
                    scraped = false;
                }
            }

            // Prepare data common to both success and content-error cases
            const baseData: Partial<ProcessedArticleData> = {
                link: article.link, // Crucial for upsertByLink
                title: article.title,
                sourceFeed: article.sourceFeed, // Assuming RssArticle has this field
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
                    summary: null, // Ensure these are nulled out on content error
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
                        // Decide if empty results should prevent saving summary/analysis or be saved as is
                    }
                } catch (geminiErr) {
                    handleServiceError(geminiErr, SERVICE_NAME, `Gemini API error for ${article.link}`);
                    geminiError = `Gemini API Error: ${geminiErr instanceof Error ? geminiErr.message : String(geminiErr)}`;
                }

                articleDataToSave = {
                    ...baseData,
                    summary: summary, // Will be null if error or empty result
                    analysis: analysis, // Will be null if error or empty result
                    processedAt: new Date(), // Mark as processed even if Gemini failed
                    error: geminiError // Store Gemini error if one occurred
                };
            }

            // Clean undefined fields before saving (optional, but good practice)
            Object.keys(articleDataToSave).forEach((key) => {
                const typedKey = key as keyof ProcessedArticleData;
                if (articleDataToSave[typedKey] === undefined) {
                    // Keep nulls, remove undefined
                    delete articleDataToSave[typedKey];
                }
            });

            console.info(`[${SERVICE_NAME}] Saving results via RepoRss for: ${article.link}`);
            // Use the new upsert method from the repository
            await RepoRss.upsertByLink(articleDataToSave);

        } catch (error) {
            // Catch errors during the main processing block (DB check, scrape, Gemini, final save)
            const errorMessage = `Major error processing article ${article.link}: ${error instanceof Error ? error.message : String(error)}`;
            handleServiceError(error, SERVICE_NAME, errorMessage);
            try {
                // Attempt to record the error in the database using the repository
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