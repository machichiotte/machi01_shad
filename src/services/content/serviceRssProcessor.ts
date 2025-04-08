// src/services/content/serviceRssProcessor.ts
import { ServiceRssFetcher } from '@services/content/serviceRssFetcher';
import { ServiceContentScraper } from '@services/content/serviceContentScraper';
import { ServiceGemini } from '@src/services/api/serviceGemini';
import { RepoRss } from '@src/repo/repoRss'; // Import the repository
import { handleServiceError } from '@utils/errorUtil';
import { config } from '@config/index';
import { RssArticle, RssFeedConfig, ServerRssConfig, ProcessedArticleData, FinancialAnalysis, AnalysisWithSummary } from '@typ/rss';
import { parseDateRss } from '@src/utils/timeUtil';
import { DEFAULT_SERVER_CONFIG } from '@config/default';

const SERVICE_NAME = 'ServiceRssProcessor';

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export class ServiceRssProcessor {
    // fetchDatabaseRss remains unchanged
    public static async fetchDatabaseRss(): Promise<ProcessedArticleData[]> {
        try {
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
        console.info(`[${SERVICE_NAME}] Démarrage du traitement de tous les flux RSS...`);

        const rssConfig = config.serverConfig?.rss;

        if (!rssConfig || !rssConfig.enabled) {
            console.warn(`[${SERVICE_NAME}] Le traitement RSS est désactivé ou la configuration est manquante.`);
            return;
        }

        const delayBetweenArticles = rssConfig.delayBetweenArticlesMs ?? 2000;
        const delayBetweenFeeds = rssConfig.delayBetweenFeedsMs ?? 2000;

        const priorityCategories = new Set(['finance', 'crypto', 'economy', 'politics']);
        const priorityFeeds: RssFeedConfig[] = [];
        const otherFeeds: RssFeedConfig[] = [];

        if (rssConfig.categories) {
            console.debug(`[${SERVICE_NAME}] Lecture des catégories depuis la configuration...`);
            for (const categoryName in rssConfig.categories) {
                const categoryFeeds = rssConfig.categories[categoryName] || [];
                console.debug(`[${SERVICE_NAME}] Catégorie trouvée: ${categoryName} avec ${categoryFeeds.length} flux.`);
                const isPriority = priorityCategories.has(categoryName.toLowerCase());

                for (const feed of categoryFeeds) {
                    if (feed.enabled !== false) {
                        const feedWithCategory = { ...feed, category: categoryName };
                        if (isPriority) {
                            priorityFeeds.push(feedWithCategory);
                            //console.debug(`[${SERVICE_NAME}] Ajout à la liste PRIORITAIRE: ${feed.name} [${categoryName}]`);
                        } else {
                            otherFeeds.push(feedWithCategory);
                            //console.debug(`[${SERVICE_NAME}] Ajout à la liste AUTRE: ${feed.name} [${categoryName}]`);
                        }
                    } else {
                        //console.debug(`[${SERVICE_NAME}] Flux désactivé ignoré: ${feed.name} (${feed.url})`);
                    }
                }
            }
        }
        const feedsToProcess = [...priorityFeeds, ...otherFeeds];

        if (feedsToProcess.length === 0) {
            console.warn(`[${SERVICE_NAME}] Aucun flux RSS activé trouvé dans la configuration.`);
            return;
        }

        console.info(`[${SERVICE_NAME}] Flux RSS à traiter (${feedsToProcess.length}): ${feedsToProcess.map(f => `${f.name} [${f.category}]`).join(', ')}`);

        for (let i = 0; i < feedsToProcess.length; i++) {
            const feed = feedsToProcess[i];
            console.info(`[${SERVICE_NAME}] === Début traitement du flux ${i + 1}/${feedsToProcess.length}: ${feed.name} (${feed.url}) [${feed.category}] ===`);

            let articlesFromFeed: RssArticle[] = [];
            try {
                // 1. Fetch all articles from the current feed
                articlesFromFeed = await ServiceRssFetcher.getArticlesFromFeed(feed.url);
            } catch (fetchError) {
                handleServiceError(fetchError, SERVICE_NAME, `Erreur lors de la récupération du flux ${feed.name} (${feed.url})`);
                // Optionally apply delay before next feed even if current one failed
                if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                    console.debug(`[${SERVICE_NAME}] Délai ${delayBetweenFeeds}ms avant le prochain flux après échec de récupération.`);
                    await sleep(delayBetweenFeeds);
                }
                continue;
            }

            // 2. Log total articles fetched
            const totalArticlesInFeed = articlesFromFeed.length;
            console.info(`[${SERVICE_NAME}] ${totalArticlesInFeed} articles récupérés depuis ${feed.name}. Vérification de ceux nécessitant une analyse...`);

            if (totalArticlesInFeed === 0) {
                console.info(`[${SERVICE_NAME}] Aucun article trouvé pour ${feed.name}. Passage au flux suivant.`);
                if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                    console.debug(`[${SERVICE_NAME}] Délai ${delayBetweenFeeds}ms avant le prochain flux.`);
                    await sleep(delayBetweenFeeds);
                }
                continue;
            }

            // 3. Filter articles needing analysis (Check DB)
            const articlesToAnalyze: RssArticle[] = [];
            for (const article of articlesFromFeed) {
                if (!article.link) {
                    console.warn(`[${SERVICE_NAME}] Article sans lien ignoré dans le flux ${feed.name}. Titre: ${article.title || 'N/A'}`);
                    continue;
                }
                try {
                    const existingArticle = await RepoRss.findByLink(article.link);
                    const needsAnalysis = !(existingArticle?.processedAt && !existingArticle.error);

                    if (needsAnalysis) {
                        articlesToAnalyze.push(article);
                    } else {
                        // console.debug(`[${SERVICE_NAME}] Article déjà traité avec succès, ignoré : ${article.link}`);
                    }
                } catch (dbError) {
                    console.error(`[${SERVICE_NAME}] Erreur DB lors de la vérification de l'article ${article.link} pour le flux ${feed.name}. Tentative d'analyse par précaution.`, dbError);
                    // Decide: Maybe add to articlesToAnalyze anyway? Or skip? Adding for safety here.
                    articlesToAnalyze.push(article);
                }
            }

            // 4. Log count of articles needing analysis
            const totalToAnalyzeCount = articlesToAnalyze.length;
            if (totalToAnalyzeCount > 0) {
                console.info(`[${SERVICE_NAME}] ${totalToAnalyzeCount} sur ${totalArticlesInFeed} articles de ${feed.name} nécessitent une analyse.`);
            } else {
                console.info(`[${SERVICE_NAME}] Aucun article de ${feed.name} ne nécessite une nouvelle analyse.`);
                if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                    console.debug(`[${SERVICE_NAME}] Délai ${delayBetweenFeeds}ms avant le prochain flux.`);
                    await sleep(delayBetweenFeeds);
                }
                continue;
            }

            // 5. Process articles needing analysis with progress logging
            for (let j = 0; j < articlesToAnalyze.length; j++) {
                const article = articlesToAnalyze[j];
                const articleTitle = article.title || 'Sans titre';

                console.info(`[${SERVICE_NAME}] --> Analyse article ${j + 1}/${totalToAnalyzeCount} (Flux ${feed.name}): [${articleTitle}] (${article.link})`);

                try {
                    await ServiceRssProcessor.processSingleArticle(article, feed, rssConfig);
                } catch (processingError) {
                    console.error(`[${SERVICE_NAME}] Erreur majeure non interceptée lors du traitement de l'article ${j + 1}/${totalToAnalyzeCount} (${article.link})`, processingError);
                    // Optionally save an error status again here, although processSingleArticle should have tried
                }

                if (delayBetweenArticles > 0 && j < articlesToAnalyze.length - 1) {
                    // console.debug(`[${SERVICE_NAME}] Délai ${delayBetweenArticles}ms avant le prochain article.`);
                    await sleep(delayBetweenArticles);
                }
            }

            console.info(`[${SERVICE_NAME}] === Fin traitement pour ${totalToAnalyzeCount} articles analysés du flux: ${feed.name} ===`);

            if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
                console.debug(`[${SERVICE_NAME}] Délai ${delayBetweenFeeds}ms avant le prochain flux.`);
                await sleep(delayBetweenFeeds);
            }

        }

        console.info(`[${SERVICE_NAME}] Traitement de tous les flux RSS terminé.`);
    }

    private static async processSingleArticle(
        article: RssArticle,
        feed: RssFeedConfig,
        rssConfig: ServerRssConfig
    ): Promise<void> {
        const fetchedAtDate = new Date();

        try {
            let fullContent = article.contentSnippet;
            let scraped = false;
            const minContentLength = rssConfig.minContentLengthForScraping ?? 250;

            if (!fullContent || fullContent.length < minContentLength) {
                console.info(`[${SERVICE_NAME}] Contenu court ou manquant pour ${article.link}. Tentative de scraping...`);
                try {
                    const scrapeResult = await ServiceContentScraper.scrapeArticleContent(article.link);
                    if (scrapeResult) {
                        fullContent = scrapeResult;
                        scraped = true;
                        console.info(`[${SERVICE_NAME}] Scraping réussi pour ${article.link}.`);
                        const scrapeDelay = rssConfig.scrapeRetryDelayMs ?? 1000;
                        if (scrapeDelay > 0) {
                            await sleep(scrapeDelay);
                        }
                    } else {
                        console.warn(`[${SERVICE_NAME}] Échec du scraping (pas de contenu retourné) pour ${article.link}.`);
                    }
                } catch (scrapeError) {
                    handleServiceError(scrapeError, SERVICE_NAME, `Échec du scraping pour l'article: ${article.link}`);
                    fullContent = article.contentSnippet;
                    scraped = false;
                }
            }

            const publicationDateObject = parseDateRss(article.isoDate);

            const baseData: Partial<ProcessedArticleData> = {
                link: article.link,
                title: article.title,
                sourceFeed: feed.url,
                feedName: feed.name,
                category: feed.category,
                fetchedAt: fetchedAtDate.toISOString(),
                scrapedContent: scraped,
                publicationDate: publicationDateObject?.toISOString() ?? null,
            };

            let articleDataToSave: Partial<ProcessedArticleData>;
            const processedAtDate = new Date();

            if (!fullContent || fullContent.trim().length === 0) {
                console.warn(`[${SERVICE_NAME}] Contenu final non disponible pour: ${article.link}. Sauvegarde partielle avec erreur.`);
                articleDataToSave = {
                    ...baseData,
                    summary: null,
                    analysis: null,
                    processedAt: processedAtDate.toISOString(),
                    error: `Content unavailable (${scraped ? 'scrape failed or empty' : 'snippet missing or empty'})`,
                };
            } else {
                let summary: string | null = null;
                let analysis: FinancialAnalysis | null = null;
                let geminiError: string | null = null;

                const geminiDelay = rssConfig.geminiRequestDelayMs ?? DEFAULT_SERVER_CONFIG.rss.geminiRequestDelayMs;
                if (geminiDelay > 0) {
                    console.debug(`[${SERVICE_NAME}] Application du délai Gemini: ${geminiDelay}ms avant l'appel pour ${article.link}`);
                    await sleep(geminiDelay);
                }

                try {
                    // console.debug(`[${SERVICE_NAME}] Requête d'analyse et résumé Gemini pour ${article.link}`); // Log now inside ServiceGemini
                    const analysisResult: AnalysisWithSummary | null = await ServiceGemini.analyzeText(fullContent);

                    if (analysisResult) {
                        summary = analysisResult.summary;
                        analysis = analysisResult.analysis;
                        console.info(`[${SERVICE_NAME}] <-- Analyse Gemini réussie pour ${article.link}`);
                    } else {
                        geminiError = 'Gemini processing failed or returned empty/invalid results.';
                        console.warn(`[${SERVICE_NAME}] <-- ${geminiError} pour ${article.link}`);
                    }
                } catch (geminiErr) {
                    handleServiceError(geminiErr, SERVICE_NAME, `Erreur API Gemini pour ${article.link}`);
                    geminiError = `Gemini API Error: ${geminiErr instanceof Error ? geminiErr.message : String(geminiErr)}`;
                    console.warn(`[${SERVICE_NAME}] <-- Erreur API Gemini pour ${article.link}: ${geminiError}`);
                }

                articleDataToSave = {
                    ...baseData,
                    summary: summary,
                    analysis: analysis,
                    processedAt: processedAtDate.toISOString(),
                    error: geminiError,
                };
            }

            Object.keys(articleDataToSave).forEach((key) => {
                const typedKey = key as keyof ProcessedArticleData;
                if (articleDataToSave[typedKey] === undefined) {
                    delete articleDataToSave[typedKey];
                }
            });

            console.info(`[${SERVICE_NAME}] Sauvegarde des résultats (RepoRss) pour: ${article.link}`);
            await RepoRss.upsertByLink(articleDataToSave); // Assumes DB handles string dates

        } catch (error) {
            const errorMessage = `Erreur majeure lors du traitement de l'article ${article.link} (Flux ${feed.name}): ${error instanceof Error ? error.message : String(error)}`;
            handleServiceError(error, SERVICE_NAME, errorMessage);
            try {
                console.error(`[${SERVICE_NAME}] Tentative de sauvegarde de l'état d'erreur en DB pour ${article.link}`);
                await RepoRss.updateErrorStatus(article.link, errorMessage); // Assumes it handles string dates if needed
            } catch (dbError) {
                handleServiceError(dbError, SERVICE_NAME, `CRITIQUE: Impossible de sauvegarder l'état d'erreur en DB pour l'article ${article.link}`);
            }
        }
    }
}