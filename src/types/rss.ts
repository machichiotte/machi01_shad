// src/types/rss.ts
import { ObjectId } from 'mongodb';

export interface ProcessedArticleData {
    _id?: ObjectId;
    title: string;
    link: string;
    publicationDate?: Date | null;
    sourceFeed: string;
    fetchedAt: Date;
    processedAt?: Date;
    summary?: string | null;
    analysis?: string | null;
    error?: string | null;
    scrapedContent?: boolean;
}
