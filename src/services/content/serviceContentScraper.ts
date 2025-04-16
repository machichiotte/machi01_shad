// src/services/content/serviceContentScraper.ts
import * as cheerio from 'cheerio';
import { handleServiceError } from '@utils/errorUtil';
import path from 'path'; import { logger } from '@src/utils/loggerUtil';

const SERVICE_NAME = 'ServiceContentScraper';
const MAX_CONTENT_LENGTH = 15000;
const FETCH_TIMEOUT = 15000;


export class ServiceContentScraper {
    static async scrapeArticleContent(url: string): Promise<string | null> {
        const operation = 'scrapeArticleContent'

        const controller = new AbortController(); // Pour gérer le timeout
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            // logger.debug(`Fetching : ${url}`, { module: path.parse(__filename).name, operation, url });
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                handleServiceError(
                    new Error(`HTTP error! Status: ${response.status} ${response.statusText}`),
                    SERVICE_NAME,
                    `Échec de la récupération de ${url}`
                );
                return null;
            }

            const htmlData = await response.text();
            const $ = cheerio.load(htmlData);

            const selectors = [
                'article .article-content',
                '.entry-content',
                '.article-body',
                '[itemprop=articleBody]',
                'article',
                'main',
                '.content',
                '.post-content'
            ];

            let content = '';
            for (const selector of selectors) {
                $(selector).find('script, style, noscript, iframe, header, footer, nav, aside, .sidebar, .related-posts, .comments, .share-buttons, form').remove();
                content = $(selector).text();
                if (content && content.trim().length > 100) {
                    // logger.debug(`Contenu trouvé avec le sélecteur : ${selector}`, { module: path.parse(__filename).name, operation, url });
                    break;
                }
            }

            if (!content || content.trim().length < 100) {
                logger.warn(`Contenu insuffisant ou non trouvé pour ${url}`, { module: path.parse(__filename).name, operation, url });
                return null;
            }

            content = content.replace(/(\r\n|\n|\r)/gm, " ")
                .replace(/\s\s+/g, ' ')
                .trim();

            if (content.length > MAX_CONTENT_LENGTH) {
                logger.warn(`Contenu tronqué pour ${url} (longueur: ${content.length})`, { module: path.parse(__filename).name, operation, url });
                content = content.substring(0, MAX_CONTENT_LENGTH) + "... (tronqué)";
            }

            // logger.debug(`[Scraping réussi pour : ${url} (longueur: ${content.length})`, { module: path.parse(__filename).name, operation, url });
            return content;

        } catch (error: unknown) {
            clearTimeout(timeoutId)
            if (error instanceof Error && error.name === 'AbortError') {
                handleServiceError(error, SERVICE_NAME, `Timeout lors du fetching de ${url} après ${FETCH_TIMEOUT}ms`)
            } else if (error instanceof Error) {
                handleServiceError(error, SERVICE_NAME, `Erreur lors du fetching/scraping de ${url}`)
            } else {
                handleServiceError(new Error('Erreur inconnue'), SERVICE_NAME, `Erreur lors du fetching/scraping de ${url}`)
            }
            return null
        }
    }
}