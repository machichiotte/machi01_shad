// src/services/content/serviceRssFetcher.ts
import Parser from 'rss-parser';
import { handleServiceError } from '@utils/errorUtil';
import { RssArticle } from '@typ/rss';
import path from 'path';
//import { logger } from '@utils/loggerUtil';

const parser = new Parser({
    timeout: 10000
});

export class ServiceRssFetcher {
    static async getArticlesFromFeed(feedUrl: string): Promise<RssArticle[]> {
        try {
            //logger.debug(`Récupération du flux : ${feedUrl}`, { module: path.parse(__filename).name, operation: 'getArticlesFromFeed' });
            const feed = await parser.parseURL(feedUrl);
            //logger.debug(`Trouvé ${feed.items.length} articles dans ${feedUrl}`, { module: path.parse(__filename).name, operation: 'getArticlesFromFeed' });

            return feed.items
                .map(item => ({
                    title: item.title || 'Sans titre',
                    link: item.link || '',
                    contentSnippet: item.contentSnippet || item.content,
                    isoDate: item.isoDate,
                    sourceFeed: feedUrl,
                }))
                .filter(item => item.link);

        } catch (error) {
            handleServiceError(error, path.parse(__filename).name, `Erreur lors de la récupération du flux RSS ${feedUrl}`);
            return [];
        }
    }
}