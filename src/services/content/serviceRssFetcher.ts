// src/services/content/serviceRssFetcher.ts
import Parser from 'rss-parser';
import { handleServiceError } from '@utils/errorUtil';
import { RssArticle } from '@typ/rss';

const parser = new Parser({
    timeout: 10000
});
const SERVICE_NAME = 'ServiceRssFetcher';

export class ServiceRssFetcher {
    static async getArticlesFromFeed(feedUrl: string): Promise<RssArticle[]> {
        try {
            console.debug(`[${SERVICE_NAME}] Récupération du flux : ${feedUrl}`);
            const feed = await parser.parseURL(feedUrl);
            console.debug(`[${SERVICE_NAME}] Trouvé ${feed.items.length} articles dans ${feedUrl}`);

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
            handleServiceError(error, SERVICE_NAME, `Erreur lors de la récupération du flux RSS ${feedUrl}`);
            return [];
        }
    }
}