// src/types/cron.ts
import { PLATFORM } from './platform';

export type Task = {
    schedule: string;
    task: (() => void) | ((platform: PLATFORM) => Promise<void>); // Support des deux cas
    name: string;
};
