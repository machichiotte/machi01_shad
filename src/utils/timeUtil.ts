import { logger } from "./loggerUtil";

// src/utils/timeUtil.ts
const myModule = 'timeUtil'

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
            logger.warn(`Invalid date string encountered: ${dateString}`, { module: myModule, operation });
            return null;
        }
        return date;
    } catch (error) {
        logger.warn(`Error parsing date string "${dateString}": ${error}`, { module: myModule, operation });
        return null;
    }
}