// src/services/api/gemini/quotaManager.ts

import { logger } from '@utils/loggerUtil';
import { sleep } from './utils';
import { formatErrorForLog } from './utils';
import path from 'path';

const moduleName = path.parse(__filename).name;

export class QuotaManager {
    private static isGloballyPaused: boolean = false;
    private static globalPauseUntil: number = 0;
    private static globalPausePromise: Promise<void> | null = null;

    static async pauseGlobally(durationMs: number, triggeredByAttempt: number) {
        const operation = 'pauseGlobally';
        const pauseUntil = Date.now() + durationMs;
        if (pauseUntil > QuotaManager.globalPauseUntil) {
            logger.warn(`Setting/Extending global pause until ${new Date(pauseUntil).toISOString()}`, { module: moduleName, operation, pauseUntil: new Date(pauseUntil).toISOString(), triggeredByAttempt });
            QuotaManager.isGloballyPaused = true;
            QuotaManager.globalPauseUntil = pauseUntil;
            // Create a *new* promise for this pause duration, only if needed
            QuotaManager.globalPausePromise = sleep(durationMs).then(() => {
                logger.warn('Global quota pause finished (timer initiated by this request).', { module: moduleName, operation: 'globalPauseHandler', triggeredByAttempt });
                if (Date.now() >= QuotaManager.globalPauseUntil) {
                    QuotaManager.resetGlobalPause();
                } else {
                    logger.warn('Global pause was extended further. Not resetting flags.', { module: moduleName, operation: 'globalPauseHandler', currentPauseUntil: new Date(QuotaManager.globalPauseUntil).toISOString() });
                }
            }).catch(err => {
                logger.error('Error during global pause sleep.', { module: moduleName, operation: 'globalPauseHandler', error: formatErrorForLog(err) });
                QuotaManager.resetGlobalPause(); // Reset state on error
            });
        } else {
            logger.warn('Global pause already active and extends further. This request will wait.', { module: moduleName, operation, currentPauseUntil: new Date(QuotaManager.globalPauseUntil).toISOString() });
        }
    }

    static async waitForGlobalPause() {
        const operation = 'waitForGlobalPause';
        if (QuotaManager.isGloballyPaused) {
            const now = Date.now();
            if (now < QuotaManager.globalPauseUntil) {
                const waitTime = QuotaManager.globalPauseUntil - now;
                logger.debug(`Global quota pause active. Waiting for ${Math.ceil(waitTime / 1000)}s...`, { module: moduleName, operation, waitMs: waitTime, pauseUntil: new Date(QuotaManager.globalPauseUntil).toISOString() });

                // Ensure only one sleep promise is created
                if (!QuotaManager.globalPausePromise) {
                    QuotaManager.globalPausePromise = sleep(waitTime).then(() => {
                        logger.info('Global quota pause finished.', { module: moduleName, operation: 'globalPauseHandler' });
                        QuotaManager.resetGlobalPause();
                    }).catch(err => {
                        logger.error('Error during global pause sleep.', { module: moduleName, operation: 'globalPauseHandler', error: formatErrorForLog(err) });
                        QuotaManager.resetGlobalPause(); // Attempt reset on error
                    });
                }
                try {
                    await QuotaManager.globalPausePromise;
                } catch { /* Error handled in the promise catch */ }

            } else {
                // If pause time expired *before* we checked, reset flags
                if (QuotaManager.isGloballyPaused) {
                    logger.info('Global quota pause already expired. Resetting flag.', { module: moduleName, operation });
                    QuotaManager.resetGlobalPause();
                }
            }
        }
    }

    private static resetGlobalPause() {
        //logger.debug('Resetting global pause flags.', { module: moduleName, operation: 'resetGlobalPause' });
        QuotaManager.isGloballyPaused = false;
        QuotaManager.globalPauseUntil = 0;
        QuotaManager.globalPausePromise = null;
    }

    static isPauseActive(): boolean {
        return QuotaManager.isGloballyPaused;
    }
}