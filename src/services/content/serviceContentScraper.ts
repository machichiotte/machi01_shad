// src/services/content/serviceContentScraper.ts
import * as cheerio from 'cheerio';
import { handleServiceError } from '@utils/errorUtil';

const SERVICE_NAME = 'ServiceContentScraper';
const MAX_CONTENT_LENGTH = 15000;
const FETCH_TIMEOUT = 15000;

export class ServiceContentScraper {
    static async scrapeArticleContent(url: string): Promise<string | null> {
        const controller = new AbortController(); // Pour gérer le timeout
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            // console.debug(`[${SERVICE_NAME}] Fetching : ${url}`);
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
                    console.debug(`[${SERVICE_NAME}] Contenu trouvé avec le sélecteur : ${selector}`);
                    break;
                }
            }

            if (!content || content.trim().length < 100) {
                console.warn(`[${SERVICE_NAME}] Contenu insuffisant ou non trouvé pour ${url}`);
                return null;
            }

            content = content.replace(/(\r\n|\n|\r)/gm, " ")
                .replace(/\s\s+/g, ' ')
                .trim();

            if (content.length > MAX_CONTENT_LENGTH) {
                console.warn(`[${SERVICE_NAME}] Contenu tronqué pour ${url} (longueur: ${content.length})`);
                content = content.substring(0, MAX_CONTENT_LENGTH) + "... (tronqué)";
            }

            // console.debug(`[${SERVICE_NAME}] Scraping réussi pour : ${url} (longueur: ${content.length})`);
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