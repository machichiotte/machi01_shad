// src/services/content/serviceRssFetcher.ts
import Parser from 'rss-parser';
import { handleServiceError } from '@utils/errorUtil';
import { RssArticle } from '@typ/rss';

const parser = new Parser({
    timeout: 10000 // Timeout de 10 secondes
});
const SERVICE_NAME = 'ServiceRssFetcher';

export class ServiceRssFetcher {
    static async getArticlesFromFeed(feedUrl: string): Promise<RssArticle[]> {
        try {
            console.info(`[${SERVICE_NAME}] Récupération du flux : ${feedUrl}`);
            const feed = await parser.parseURL(feedUrl);
            console.info(`[${SERVICE_NAME}] Trouvé ${feed.items.length} articles dans ${feedUrl}`);

            return feed.items
                .map(item => ({
                    title: item.title || 'Sans titre',
                    link: item.link || '',
                    contentSnippet: item.contentSnippet || item.content,
                    isoDate: item.isoDate,
                    sourceFeed: feedUrl,
                }))
                .filter(item => item.link); // Garder seulement ceux avec un lien

        } catch (error) {
            handleServiceError(error, SERVICE_NAME, `Erreur lors de la récupération du flux RSS ${feedUrl}`);
            return []; // Retourne un tableau vide en cas d'erreur
        }
    }
}