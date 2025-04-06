// src/utils/timeUtil.ts
export function hasTimeElapsed(lastTimestamp: string, intervalInMs: number): boolean {
    const lastUpdate = parseInt(lastTimestamp, 10);
    if (isNaN(lastUpdate)) return false;

    const currentTime = Date.now();
    return (currentTime - lastUpdate) > intervalInMs;
}

export function parseDateRss(dateString: string | undefined | null): Date | null {
    if (!dateString) {
        return null;
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn(`Invalid date string encountered: ${dateString}`);
            return null;
        }
        return date;
    } catch (e) {
        console.warn(`Error parsing date string "${dateString}":`, e);
        return null;
    }
}