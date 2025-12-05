// src/services/content/serviceRssProcessor.ts
import path from 'path'

import { config } from '@config/index'
import { DEFAULT_SERVER_CONFIG } from '@config/default'

import { ServiceRssFetcher } from '@services/content/serviceRssFetcher'
import { ServiceContentScraper } from '@services/content/serviceContentScraper'
import { ServiceGemini } from '@services/api/gemini/serviceGemini'

import { RepoRss } from '@repo/repoRss'

import { handleServiceError } from '@utils/errorUtil'
import { logger } from '@utils/loggerUtil'
import { parseDateRss } from '@utils/timeUtil'

import {
  RssArticle,
  RssFeedConfig,
  ServerRssConfig,
  ProcessedArticleData,
  FinancialAnalysis,
  AnalysisWithSummary
} from '@typ/rss'

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

export class ServiceRssProcessor {
  // fetchDatabaseRss reste principalement inchangé, mais on améliore le contexte d'erreur
  public static async fetchDatabaseRss(): Promise<ProcessedArticleData[]> {
    const operation = 'fetchDatabaseRss'
    try {
      //logger.debug(`Fetching all RSS data from database...`, { module: path.parse(__filename).name, operation });
      const data = await RepoRss.fetchAll()
      //logger.debug(`Fetched ${data.length} articles from database.`, { module: path.parse(__filename).name, operation, count: data.length });
      return data
    } catch (error) {
      handleServiceError(
        error,
        `${path.parse(__filename).name}:${operation}`, // Nom de fonction plus spécifique
        'Error fetching RSS data from database' // Message en anglais standardisé
      )
      throw error // Relancer l'erreur après l'avoir loguée
    }
  }

  static async processAllFeeds(): Promise<void> {
    const operation = 'processAllFeeds'
    logger.info(`Starting processing of all RSS feeds...`, {
      module: path.parse(__filename).name,
      operation
    })

    const rssConfig = config.serverConfig?.rss

    if (!rssConfig || !rssConfig.enabled) {
      logger.warn(
        `RSS processing is disabled or configuration is missing. Aborting.`,
        { module: path.parse(__filename).name, operation }
      )
      return
    }

    const delayBetweenArticles =
      rssConfig.delayBetweenArticlesMs ??
      DEFAULT_SERVER_CONFIG.rss.delayBetweenArticlesMs
    const delayBetweenFeeds =
      rssConfig.delayBetweenFeedsMs ??
      DEFAULT_SERVER_CONFIG.rss.delayBetweenFeedsMs

    // Priorisation et collecte des flux (logique inchangée, on remplace les logs)
    const priorityCategories = new Set([
      'finance',
      'crypto',
      'economy',
      'politics'
    ])
    const priorityFeeds: RssFeedConfig[] = []
    const otherFeeds: RssFeedConfig[] = []

    if (rssConfig.categories) {
      // logger.debug(`Reading categories from configuration...`, { module: path.parse(__filename).name, operation });
      for (const categoryName in rssConfig.categories) {
        const categoryFeeds = rssConfig.categories[categoryName] || []
        //logger.debug(`Found category: ${categoryName} with ${categoryFeeds.length} feeds.`, { module: path.parse(__filename).name, operation, category: categoryName, feedCount: categoryFeeds.length });
        const isPriority = priorityCategories.has(categoryName.toLowerCase())

        for (const feed of categoryFeeds) {
          if (feed.enabled !== false) {
            const feedWithCategory = { ...feed, category: categoryName }
            if (isPriority) {
              priorityFeeds.push(feedWithCategory)
              //logger.debug(`Added to PRIORITY list: ${feed.name}`, { module: path.parse(__filename).name, operation, feedName: feed.name, category: categoryName });
            } else {
              otherFeeds.push(feedWithCategory)
              //logger.debug(`Added to OTHER list: ${feed.name}`, { module: path.parse(__filename).name, operation, feedName: feed.name, category: categoryName });
            }
          } else {
            //logger.debug(`Skipping disabled feed: ${feed.name}`, { module: path.parse(__filename).name, operation, feedName: feed.name, feedUrl: feed.url });
          }
        }
      }
    }
    const feedsToProcess = [...priorityFeeds, ...otherFeeds]

    if (feedsToProcess.length === 0) {
      logger.warn(`No enabled RSS feeds found in configuration. Aborting.`, {
        module: path.parse(__filename).name,
        operation
      })
      return
    }

    const feedNames = feedsToProcess.map((f) => `${f.name} [${f.category}]`)
    logger.info(
      `RSS feeds to process (${feedsToProcess.length}): ${feedNames.join(', ')}`,
      {
        module: path.parse(__filename).name,
        operation,
        feedCount: feedsToProcess.length,
        feedNames
      }
    )

    for (let i = 0; i < feedsToProcess.length; i++) {
      const feed = feedsToProcess[i]
      const feedContext = {
        module: path.parse(__filename).name,
        operation,
        feedName: feed.name,
        feedUrl: feed.url,
        category: feed.category,
        feedIndex: `${i + 1}/${feedsToProcess.length}`
      }
      //logger.debug(`=== Starting processing for feed: ${feed.name} ===`, feedContext);

      let articlesFromFeed: RssArticle[] = []
      try {
        //logger.debug(`Fetching articles from feed...`, feedContext);
        articlesFromFeed = await ServiceRssFetcher.getArticlesFromFeed(feed.url)
        //logger.debug(`Fetched ${articlesFromFeed.length} raw articles.`, { ...feedContext, rawArticleCount: articlesFromFeed.length });
      } catch (fetchError) {
        handleServiceError(
          fetchError,
          `${path.parse(__filename).name}:${operation}:fetchFeed`,
          `Error fetching feed ${feed.name}`
        )
        if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
          // logger.debug(`Applying delay (${delayBetweenFeeds}ms) before next feed after fetch error.`, { ...feedContext, delayMs: delayBetweenFeeds });
          await sleep(delayBetweenFeeds)
        }
        continue // Passe au flux suivant
      }

      const totalArticlesInFeed = articlesFromFeed.length
      // logger.debug(`${totalArticlesInFeed} articles retrieved from ${feed.name}. Checking which need analysis...`, { ...feedContext, totalArticlesInFeed });

      if (totalArticlesInFeed === 0) {
        // logger.debug(`No articles found for ${feed.name}. Skipping to next feed.`, feedContext);
        if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
          // logger.debug(`Applying delay (${delayBetweenFeeds}ms) before next feed.`, { ...feedContext, delayMs: delayBetweenFeeds });
          await sleep(delayBetweenFeeds)
        }
        continue
      }

      // Filtrage des articles (logique inchangée, on remplace les logs)
      const articlesToAnalyze: RssArticle[] = []
      // let articlesSkipped = 0;
      // let articlesExisting = 0;
      // let articlesDbError = 0;
      for (const article of articlesFromFeed) {
        if (!article.link) {
          logger.warn(`Article skipped (missing link).`, {
            ...feedContext,
            articleTitle: article.title || 'N/A'
          })
          //articlesSkipped++;
          continue
        }
        const articleContext = {
          ...feedContext,
          articleLink: article.link,
          articleTitle: article.title
        }
        try {
          const existingArticle = await RepoRss.findByLink(article.link)
          const needsAnalysis =
            !existingArticle ||
            !existingArticle.processedAt ||
            existingArticle.error // Analyse si non existant, pas traité, ou en erreur

          if (needsAnalysis) {
            //logger.debug(`Article needs analysis.`, articleContext);
            articlesToAnalyze.push(article)
          } else {
            //logger.debug(`Article already processed successfully, skipping.`, articleContext);
            //articlesExisting++;
          }
        } catch (dbError) {
          // Logguer l'erreur DB via handleServiceError
          handleServiceError(
            dbError,
            `${path.parse(__filename).name}:${operation}:checkArticle`,
            `DB error checking article`
          )
          logger.warn(
            `Adding article to analysis queue due to DB check error.`,
            articleContext
          )
          articlesToAnalyze.push(article) // Analyse par précaution
          // articlesDbError++;
        }
      }

      const totalToAnalyzeCount = articlesToAnalyze.length
      if (totalToAnalyzeCount > 0) {
        //logger.debug(`Analysis needed for ${totalToAnalyzeCount} out of ${totalArticlesInFeed} articles.`, { ...feedContext, articlesToAnalyze: totalToAnalyzeCount, articlesExisting, articlesSkipped, articlesDbError });
      } else {
        //logger.debug(`No articles require new analysis for ${feed.name}.`, { ...feedContext, articlesToAnalyze: 0, articlesExisting, articlesSkipped, articlesDbError });
        if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
          // logger.debug(`Applying delay (${delayBetweenFeeds}ms) before next feed.`, { ...feedContext, delayMs: delayBetweenFeeds });
          await sleep(delayBetweenFeeds)
        }
        continue
      }

      // Traitement des articles à analyser
      for (let j = 0; j < articlesToAnalyze.length; j++) {
        const article = articlesToAnalyze[j]
        // const articleTitle = article.title || 'Sans titre';
        // const articleContext = { ...feedContext, articleLink: article.link, articleTitle, articleIndex: `${j + 1}/${totalToAnalyzeCount}` };

        //logger.debug(`Analyzing article ${j + 1}/${totalToAnalyzeCount}: [${articleTitle}]`, articleContext);

        try {
          await ServiceRssProcessor.processSingleArticle(
            article,
            feed,
            rssConfig
          )
        } catch (processingError) {
          // Normalement, processSingleArticle devrait gérer ses erreurs internes et les logger via handleServiceError.
          // Ce catch est une sécurité supplémentaire pour les erreurs imprévues.
          handleServiceError(
            processingError,
            `${path.parse(__filename).name}:${operation}:processArticleLoop`,
            `Unhandled error processing article`
          )
        }

        if (delayBetweenArticles > 0 && j < articlesToAnalyze.length - 1) {
          //logger.debug(`Applying delay (${delayBetweenArticles}ms) before next article.`, { ...articleContext, delayMs: delayBetweenArticles });
          await sleep(delayBetweenArticles)
        }
      }

      // logger.info(`Finished processing for ${totalToAnalyzeCount} analyzed articles from feed: ${feed.name} ===`, { ...feedContext, analyzedCount: totalToAnalyzeCount });

      if (delayBetweenFeeds > 0 && i < feedsToProcess.length - 1) {
        // logger.debug(`Applying delay (${delayBetweenFeeds}ms) before next feed.`, { ...feedContext, delayMs: delayBetweenFeeds });
        await sleep(delayBetweenFeeds)
      }
    }

    logger.info(`Processing of all RSS feeds finished.`, {
      module: path.parse(__filename).name,
      operation
    })
  }

  private static async processSingleArticle(
    article: RssArticle,
    feed: RssFeedConfig,
    rssConfig: ServerRssConfig
  ): Promise<void> {
    const operation = 'processSingleArticle'
    const fetchedAtDate = new Date()
    const articleContext = {
      module: path.parse(__filename).name,
      operation,
      articleLink: article.link,
      articleTitle: article.title,
      feedName: feed.name,
      category: feed.category
    }

    try {
      let fullContent = article.contentSnippet
      let scraped = false
      const minContentLength =
        rssConfig.minContentLengthForScraping ??
        DEFAULT_SERVER_CONFIG.rss.minContentLengthForScraping

      if (!fullContent || fullContent.length < minContentLength) {
        /* logger.warn(`Short or missing content, attempting scrape...`, {
          ...articleContext,
          currentLength: fullContent?.length ?? 0,
          minLength: minContentLength
        }) */
        try {
          const scrapeResult = await ServiceContentScraper.scrapeArticleContent(
            article.link
          )
          if (scrapeResult) {
            fullContent = scrapeResult
            scraped = true
            // logger.debug(`Scrape successful.`, { ...articleContext, contentLength: fullContent.length });
            const scrapeDelay =
              rssConfig.scrapeRetryDelayMs ??
              DEFAULT_SERVER_CONFIG.rss.scrapeRetryDelayMs
            if (scrapeDelay > 0) {
              // logger.debug(`Applying post-scrape delay: ${scrapeDelay}ms`, { ...articleContext, delayMs: scrapeDelay });
              await sleep(scrapeDelay)
            }
          } else {
            logger.warn(`Scrape returned no content.`, articleContext)
          }
        } catch (scrapeError) {
          handleServiceError(
            scrapeError,
            `${path.parse(__filename).name}:${operation}:scrape`,
            `Scraping failed`
          )
          // Garde le contenu snippet s'il existe, sinon fullContent reste vide/null
          fullContent = article.contentSnippet
          scraped = false // Échec du scraping
        }
      }

      const publicationDateObject = parseDateRss(article.isoDate)

      // Données de base avant l'analyse IA
      const baseData: Partial<ProcessedArticleData> = {
        link: article.link,
        title: article.title,
        sourceFeed: feed.url,
        feedName: feed.name,
        category: feed.category,
        fetchedAt: fetchedAtDate.toISOString(),
        scrapedContent: scraped,
        publicationDate: publicationDateObject?.toISOString() ?? null // Garde null si invalide
      }

      let articleDataToSave: Partial<ProcessedArticleData>
      const processedAtDate = new Date()

      if (!fullContent || fullContent.trim().length === 0) {
        logger.warn(
          `Final content unavailable or empty. Saving partial data with error.`,
          articleContext
        )
        articleDataToSave = {
          ...baseData,
          summary: null,
          analysis: null,
          processedAt: processedAtDate.toISOString(),
          error: `Content unavailable (${scraped ? 'scrape failed or empty' : 'snippet missing or empty'})`
        }
      } else {
        //logger.debug(`Content ready for Gemini analysis. Length: ${fullContent.length}`, { ...articleContext, contentLength: fullContent.length });
        let summary: string | null = null
        let analysis: FinancialAnalysis | null = null
        let geminiError: string | null = null

        const geminiDelay =
          rssConfig.geminiRequestDelayMs ??
          DEFAULT_SERVER_CONFIG.rss.geminiRequestDelayMs
        if (geminiDelay > 0) {
          //logger.debug(`Applying Gemini request delay: ${geminiDelay}ms`, { ...articleContext, delayMs: geminiDelay });
          await sleep(geminiDelay)
        }

        try {
          //logger.debug(`Sending request to Gemini...`, articleContext);
          const analysisResult: AnalysisWithSummary | null =
            await ServiceGemini.analyzeText(fullContent)

          if (
            analysisResult &&
            analysisResult.summary &&
            analysisResult.analysis
          ) {
            // Vérifie si les résultats sont valides
            summary = analysisResult.summary
            analysis = analysisResult.analysis
            // logger.debug(`Gemini analysis successful.`, { ...articleContext, summaryLength: summary?.length, analysisKeys: analysis ? Object.keys(analysis) : [] });
          } else {
            geminiError =
              'Gemini processing failed or returned empty/invalid results.'
            //  logger.warn(`${geminiError}`, articleContext)
          }
        } catch (geminiErr) {
          handleServiceError(
            geminiErr,
            `${path.parse(__filename).name}:${operation}:gemini`,
            `Gemini API Error`
          )
        }

        articleDataToSave = {
          ...baseData,
          summary: summary,
          analysis: analysis,
          processedAt: processedAtDate.toISOString(),
          error: geminiError // Sera null si succès
        }
      }

      // Nettoyer les clés undefined avant sauvegarde
      Object.keys(articleDataToSave).forEach((key) => {
        const typedKey = key as keyof ProcessedArticleData
        if (articleDataToSave[typedKey] === undefined) {
          delete articleDataToSave[typedKey]
        }
      })

      //logger.info(`Saving results to database...`, { ...articleContext, hasError: !!articleDataToSave.error });
      await RepoRss.upsertByLink(articleDataToSave)
      //logger.info(`Results saved successfully.`, { ...articleContext, hasError: !!articleDataToSave.error });
    } catch (error) {
      // Ce catch global est pour les erreurs imprévues dans processSingleArticle
      const errorMessage = `Unhandled error processing article: ${error instanceof Error ? error.message : String(error)}`
      handleServiceError(
        error,
        `${path.parse(__filename).name}:${operation}:global`,
        errorMessage
      )
      try {
        // Tentative ultime de marquer l'article comme échoué en DB
        logger.error(
          `Attempting to save error status to DB after unhandled exception...`,
          { ...articleContext, finalErrorMessage: errorMessage }
        )
        await RepoRss.updateErrorStatus(article.link, errorMessage)
        logger.warn(`Error status saved to DB after unhandled exception.`, {
          ...articleContext,
          finalErrorMessage: errorMessage
        })
      } catch (dbError) {
        handleServiceError(
          dbError,
          `${path.parse(__filename).name}:${operation}:saveErrorStatus`,
          `CRITICAL: Failed to save error status to DB`
        )
      }
      // Pas besoin de relancer ici, on a loggé l'erreur et tenté de sauver l'état.
    }
  }
}
