// src/utils/timeUtil.ts
export function hasTimeElapsed(lastTimestamp: string, intervalInMs: number): boolean {
    const lastUpdate = parseInt(lastTimestamp, 10);
    if (isNaN(lastUpdate)) return false;

    const currentTime = Date.now();
    return (currentTime - lastUpdate) > intervalInMs;
}