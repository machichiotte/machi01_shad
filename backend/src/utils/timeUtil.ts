// src/utils/timeUtil.ts
import path from 'path'; import { logger } from "./loggerUtil";

export function hasTimeElapsed(lastTimestamp: string, intervalInMs: number): boolean {
    const lastUpdate = parseInt(lastTimestamp, 10);
    if (isNaN(lastUpdate)) return false;

    const currentTime = Date.now();
    return (currentTime - lastUpdate) > intervalInMs;
}

export function parseDateRss(dateString: string | undefined | null): Date | null {
    const operation = 'parseDateRss'
    if (!dateString) {
        return null;
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            logger.warn(`Invalid date string encountered: ${dateString}`, { module: path.parse(__filename).name, operation });
            return null;
        }
        return date;
    } catch (error) {
        logger.warn(`Error parsing date string "${dateString}": ${error}`, { module: path.parse(__filename).name, operation });
        return null;
    }
}