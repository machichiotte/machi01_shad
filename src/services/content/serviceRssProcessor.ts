// src/services/content/serviceRssProcessor.ts
import { ServiceRssFetcher } from '@services/content/serviceRssFetcher';
import { ServiceContentScraper } from '@services/content/serviceContentScraper';
import { ServiceGemini } from '@services/api/serviceGemini';
import { RepoRss } from '@repo/repoRss';
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';
import { RssArticle, RssFeedConfig, ServerRssConfig, ProcessedArticleData, FinancialAnalysis, AnalysisWithSummary } from '@typ/rss';
import { parseDateRss } from '@utils/timeUtil';
import { DEFAULT_SERVER_CONFIG } from '@config/default';
import { logger } from '@utils/loggerUtil';

// Utiliser une constante pour le nom du module/service dans les logs
const myService = 'ServiceRssProcessor';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export class ServiceRssProcessor {
    // fetchDatabaseRss reste principalement inchangé, mais on améliore le contexte d'erreur
    public static async fetchDatabaseRss(): Promise<ProcessedArticleData[]> {
        const operation = 'fetchDatabaseRss';
        try {
            logger.debug(`[${myService}] Fetching all RSS data from database...`, { module: myService, operation });
            const data = await RepoRss.fetchAll();
            logger.debug(`[${myService}] Fetched ${data.length} articles from database.`, { module: myService, operation, count: data.length });
            return data;
        } catch (error) {
            handleServiceError(
                error,
                `${myService}:${operation}`, // Nom de fonction plus spécifique
                'Error fetching RSS data from database' // Message en anglais standardisé
            );
            throw error; // Relancer l'erreur après l'avoir loguée
        }
    }

    static async processAllFeeds(): Promise<void> {
        const operation = 'processAllFeeds';
        logger.info(`[${myService}] Starting processing of all RSS feeds...`, { module: myService, operation });

        const rssConfig = config.serverConfig?.rss;

        if (!rssConfig || !rssConfig.enabled) {
            logger.warn(`[${myService}] RSS processing is disabled or configuration is missing. Aborting.`, { module: myService, operation });
            return;
        }

        const delayBetweenArticles = rssConfig.delayBetweenArticlesMs ?? DEFAULT_SERVER_CONFIG.rss.delayBetweenArticlesMs;
        const delayBetweenFeeds = rssConfig.delayBetweenFeedsMs ?? DEFAULT_SERVER_CONFIG.rss.delayBetweenFeedsMs;

        // Priorisation et collecte des flux (logique inchangée, on remplace les logs)
        const priorityCategories = new Set(['finance', 'crypto', 'economy', 'politics']);
        const priorityFeeds: RssFeedConfig[] = [];
        const otherFeeds: RssFeedConfig[] = [];

        if (rssConfig.categories) {
            logger.debug(`[${myService}] Reading categories from configuration...`, { module: myService, operation });
            for (const categoryName in rssConfig.categories) {
                const categoryFeeds = rssConfig.categories[categoryName] || [];
                logger.debug(`[${myService}] Found category: ${categoryName} with ${categoryFeeds.length} feeds.`, { module: myService, operation, category: categoryName, feedCount: categoryFeeds.length });
                const isPriority = priorityCategories.has(categoryName.toLowerCase());

                for (const feed of categoryFeeds) {
                    if (feed.enabled !== false) {
                        const feedWithCategory = { ...feed, category: categoryName };
                        if (isPriority) {
                            priorityFeeds.push(feedWithCategory);
                            logger.debug(`[${myService}] Added to PRIORITY list: ${feed.name}`, { module: myService, operation, feedName: feed.name, category: categoryName });
                        } else {
                            otherFeeds.push(feedWithCategory);
                            logger.debug(`[${myService}] Added to OTHER list: ${feed.name}`, { module: myService, operation, feedName: feed.name, category: categoryName });
                        }
                    } else {
                        logger.debug(`[${myService}] Skipping disabled feed: ${feed.name}`, { module: myService, operation, feedName: feed.name, feedUrl: feed.url });
                    }
                }
            }
        }
        const feedsToProcess = [...priorityFeeds, ...otherFeeds];

        if (feedsToProcess.length === 0) {
            logger.warn(`[${myService}] No enabled RSS feeds found in configuration. Aborting.`, { module: myService, operation });
            return;
        }

        const feedNames = feedsToProcess.map(f => `${f.name} [${f.category}]`);
        logger.info(`[${myService}] RSS feeds to process (${feedsToProcess.length}): ${feedNames.join(', ')}`, { module: myService, operation, feedCount: feedsToProcess.length, feedNames });

        for (let i = 0; i < feedsToProcess.length; i++) {
            const feed = feedsToProcess[i];
            const feedContext = { module: myService, operation, feedName: feed.name, feedUrl: feed.url, category: feed.category, feedIndex: `${i + 1}/${feedsToProcess.length}` };
            logger.info(`[${myService}] === Starting processing for feed: ${feed.name} ===`, feedContext);

            let articlesFromFeed: RssArticle[] = [];
            try {
                logger.debug(`[${myService}] Fetching articles from feed...`, feedContext);
                articlesFromFeed = await ServiceRssFetcher.getArticlesFromFeed(feed.url);
                logger.debug(`[${myService}] Fetched ${articlesFromFeed.length} raw articles.`, { ...feedContext, rawArticleCount: articlesFromFeed.length });
            } catch (fetchError) {
                handleServiceError(fetchError, `${myService}:${operation}:fetchFeed`, `Error fetching feed ${feed.name}`);
                if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                    logger.debug(`[${myService}] Applying delay (${delayBetweenFeeds}ms) before next feed after fetch error.`, { ...feedContext, delayMs: delayBetweenFeeds });
                    await sleep(delayBetweenFeeds);
                }
                continue; // Passe au flux suivant
            }

            const totalArticlesInFeed = articlesFromFeed.length;
            logger.info(`[${myService}] ${totalArticlesInFeed} articles retrieved from ${feed.name}. Checking which need analysis...`, { ...feedContext, totalArticlesInFeed });

            if (totalArticlesInFeed === 0) {
                logger.info(`[${myService}] No articles found for ${feed.name}. Skipping to next feed.`, feedContext);
                if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                    logger.debug(`[${myService}] Applying delay (${delayBetweenFeeds}ms) before next feed.`, { ...feedContext, delayMs: delayBetweenFeeds });
                    await sleep(delayBetweenFeeds);
                }
                continue;
            }

            // Filtrage des articles (logique inchangée, on remplace les logs)
            const articlesToAnalyze: RssArticle[] = [];
            let articlesSkipped = 0;
            let articlesExisting = 0;
            let articlesDbError = 0;
            for (const article of articlesFromFeed) {
                if (!article.link) {
                    logger.warn(`[${myService}] Article skipped (missing link).`, { ...feedContext, articleTitle: article.title || 'N/A' });
                    articlesSkipped++;
                    continue;
                }
                const articleContext = { ...feedContext, articleLink: article.link, articleTitle: article.title };
                try {
                    const existingArticle = await RepoRss.findByLink(article.link);
                    const needsAnalysis = !existingArticle || !existingArticle.processedAt || existingArticle.error; // Analyse si non existant, pas traité, ou en erreur

                    if (needsAnalysis) {
                        logger.debug(`[${myService}] Article needs analysis.`, articleContext);
                        articlesToAnalyze.push(article);
                    } else {
                        logger.debug(`[${myService}] Article already processed successfully, skipping.`, articleContext);
                        articlesExisting++;
                    }
                } catch (dbError) {
                    // Logguer l'erreur DB via handleServiceError
                    handleServiceError(dbError, `${myService}:${operation}:checkArticle`, `DB error checking article`);
                    logger.warn(`[${myService}] Adding article to analysis queue due to DB check error.`, articleContext);
                    articlesToAnalyze.push(article); // Analyse par précaution
                    articlesDbError++;
                }
            }

            const totalToAnalyzeCount = articlesToAnalyze.length;
            if (totalToAnalyzeCount > 0) {
                logger.info(`[${myService}] Analysis needed for ${totalToAnalyzeCount} out of ${totalArticlesInFeed} articles.`, { ...feedContext, articlesToAnalyze: totalToAnalyzeCount, articlesExisting, articlesSkipped, articlesDbError });
            } else {
                logger.info(`[${myService}] No articles require new analysis for ${feed.name}.`, { ...feedContext, articlesToAnalyze: 0, articlesExisting, articlesSkipped, articlesDbError });
                if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                    logger.debug(`[${myService}] Applying delay (${delayBetweenFeeds}ms) before next feed.`, { ...feedContext, delayMs: delayBetweenFeeds });
                    await sleep(delayBetweenFeeds);
                }
                continue;
            }

            // Traitement des articles à analyser (logique inchangée, on remplace les logs)
            for (let j = 0; j < articlesToAnalyze.length; j++) {
                const article = articlesToAnalyze[j];
                const articleTitle = article.title || 'Sans titre';
                const articleContext = { ...feedContext, articleLink: article.link, articleTitle, articleIndex: `${j + 1}/${totalToAnalyzeCount}` };

                logger.info(`[${myService}] --> Analyzing article ${j + 1}/${totalToAnalyzeCount}: [${articleTitle}]`, articleContext);

                try {
                    await ServiceRssProcessor.processSingleArticle(article, feed, rssConfig);
                } catch (processingError) {
                    // Normalement, processSingleArticle devrait gérer ses erreurs internes et les logger via handleServiceError.
                    // Ce catch est une sécurité supplémentaire pour les erreurs imprévues.
                    handleServiceError(processingError, `${myService}:${operation}:processArticleLoop`, `Unhandled error processing article`);
                }

                if (delayBetweenArticles > 0 && j < articlesToAnalyze.length - 1) {
                    logger.debug(`[${myService}] Applying delay (${delayBetweenArticles}ms) before next article.`, { ...articleContext, delayMs: delayBetweenArticles });
                    await sleep(delayBetweenArticles);
                }
            }

            logger.info(`[${myService}] === Finished processing for ${totalToAnalyzeCount} analyzed articles from feed: ${feed.name} ===`, { ...feedContext, analyzedCount: totalToAnalyzeCount });

            if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                logger.debug(`[${myService}] Applying delay (${delayBetweenFeeds}ms) before next feed.`, { ...feedContext, delayMs: delayBetweenFeeds });
                await sleep(delayBetweenFeeds);
            }
        }

        logger.info(`[${myService}] Processing of all RSS feeds finished.`, { module: myService, operation });
    }

    private static async processSingleArticle(
        article: RssArticle,
        feed: RssFeedConfig,
        rssConfig: ServerRssConfig
    ): Promise<void> {
        const operation = 'processSingleArticle';
        const fetchedAtDate = new Date();
        const articleContext = { module: myService, operation, articleLink: article.link, articleTitle: article.title, feedName: feed.name, category: feed.category };

        try {
            let fullContent = article.contentSnippet;
            let scraped = false;
            const minContentLength = rssConfig.minContentLengthForScraping ?? DEFAULT_SERVER_CONFIG.rss.minContentLengthForScraping;

            if (!fullContent || fullContent.length < minContentLength) {
                logger.info(`[${myService}] Short or missing content, attempting scrape...`, { ...articleContext, currentLength: fullContent?.length ?? 0, minLength: minContentLength });
                try {
                    const scrapeResult = await ServiceContentScraper.scrapeArticleContent(article.link);
                    if (scrapeResult) {
                        fullContent = scrapeResult;
                        scraped = true;
                        logger.info(`[${myService}] Scrape successful.`, { ...articleContext, contentLength: fullContent.length });
                        const scrapeDelay = rssConfig.scrapeRetryDelayMs ?? DEFAULT_SERVER_CONFIG.rss.scrapeRetryDelayMs;
                        if (scrapeDelay > 0) {
                            logger.debug(`[${myService}] Applying post-scrape delay: ${scrapeDelay}ms`, { ...articleContext, delayMs: scrapeDelay });
                            await sleep(scrapeDelay);
                        }
                    } else {
                        logger.warn(`[${myService}] Scrape returned no content.`, articleContext);
                    }
                } catch (scrapeError) {
                    handleServiceError(scrapeError, `${myService}:${operation}:scrape`, `Scraping failed`);
                    // Garde le contenu snippet s'il existe, sinon fullContent reste vide/null
                    fullContent = article.contentSnippet;
                    scraped = false; // Échec du scraping
                }
            }

            const publicationDateObject = parseDateRss(article.isoDate);

            // Données de base avant l'analyse IA
            const baseData: Partial<ProcessedArticleData> = {
                link: article.link,
                title: article.title,
                sourceFeed: feed.url,
                feedName: feed.name,
                category: feed.category,
                fetchedAt: fetchedAtDate.toISOString(),
                scrapedContent: scraped,
                publicationDate: publicationDateObject?.toISOString() ?? null, // Garde null si invalide
            };

            let articleDataToSave: Partial<ProcessedArticleData>;
            const processedAtDate = new Date();

            if (!fullContent || fullContent.trim().length === 0) {
                logger.warn(`[${myService}] Final content unavailable or empty. Saving partial data with error.`, articleContext);
                articleDataToSave = {
                    ...baseData,
                    summary: null,
                    analysis: null,
                    processedAt: processedAtDate.toISOString(),
                    error: `Content unavailable (${scraped ? 'scrape failed or empty' : 'snippet missing or empty'})`,
                };
            } else {
                logger.debug(`[${myService}] Content ready for Gemini analysis. Length: ${fullContent.length}`, { ...articleContext, contentLength: fullContent.length });
                let summary: string | null = null;
                let analysis: FinancialAnalysis | null = null;
                let geminiError: string | null = null;

                const geminiDelay = rssConfig.geminiRequestDelayMs ?? DEFAULT_SERVER_CONFIG.rss.geminiRequestDelayMs;
                if (geminiDelay > 0) {
                    logger.debug(`[${myService}] Applying Gemini request delay: ${geminiDelay}ms`, { ...articleContext, delayMs: geminiDelay });
                    await sleep(geminiDelay);
                }

                try {
                    logger.info(`[${myService}] --> Sending request to Gemini...`, articleContext);
                    const analysisResult: AnalysisWithSummary | null = await ServiceGemini.analyzeText(fullContent);

                    if (analysisResult && analysisResult.summary && analysisResult.analysis) { // Vérifie si les résultats sont valides
                        summary = analysisResult.summary;
                        analysis = analysisResult.analysis;
                        logger.info(`[${myService}] <-- Gemini analysis successful.`, { ...articleContext, summaryLength: summary?.length, analysisKeys: analysis ? Object.keys(analysis) : [] });
                    } else {
                        geminiError = 'Gemini processing failed or returned empty/invalid results.';
                        logger.warn(`[${myService}] <-- ${geminiError}`, articleContext);
                    }
                } catch (geminiErr) {
                    // Log l'erreur via handleServiceError
                    handleServiceError(geminiErr, `${myService}:${operation}:gemini`, `Gemini API Error`);
                    geminiError = `Gemini API Error: ${geminiErr instanceof Error ? geminiErr.message : String(geminiErr)}`;
                    logger.warn(`[${myService}] <-- Gemini API Error captured.`, { ...articleContext, errorMessage: geminiError });
                }

                articleDataToSave = {
                    ...baseData,
                    summary: summary,
                    analysis: analysis,
                    processedAt: processedAtDate.toISOString(),
                    error: geminiError, // Sera null si succès
                };
            }

            // Nettoyer les clés undefined avant sauvegarde
            Object.keys(articleDataToSave).forEach((key) => {
                const typedKey = key as keyof ProcessedArticleData;
                if (articleDataToSave[typedKey] === undefined) {
                    delete articleDataToSave[typedKey];
                }
            });

            logger.info(`[${myService}] Saving results to database...`, { ...articleContext, hasError: !!articleDataToSave.error });
            await RepoRss.upsertByLink(articleDataToSave);
            logger.info(`[${myService}] Results saved successfully.`, { ...articleContext, hasError: !!articleDataToSave.error });

        } catch (error) {
            // Ce catch global est pour les erreurs imprévues dans processSingleArticle
            const errorMessage = `Unhandled error processing article: ${error instanceof Error ? error.message : String(error)}`;
            handleServiceError(error, `${myService}:${operation}:global`, errorMessage);
            try {
                // Tentative ultime de marquer l'article comme échoué en DB
                logger.error(`[${myService}] Attempting to save error status to DB after unhandled exception...`, { ...articleContext, finalErrorMessage: errorMessage });
                await RepoRss.updateErrorStatus(article.link, errorMessage);
                logger.warn(`[${myService}] Error status saved to DB after unhandled exception.`, { ...articleContext, finalErrorMessage: errorMessage });
            } catch (dbError) {
                handleServiceError(dbError, `${myService}:${operation}:saveErrorStatus`, `CRITICAL: Failed to save error status to DB`);
            }
            // Pas besoin de relancer ici, on a loggé l'erreur et tenté de sauver l'état.
        }
    }
}