// src/services/api/gemini/types.ts

import type { AnalysisWithSummary } from "@typ/rss";

// --- Custom Error Type ---
export class QuotaError extends Error {
    public retryDelayMs: number | null;
    constructor(message: string, retryDelayMs: number | null) {
        super(message);
        this.name = 'QuotaError';
        this.retryDelayMs = retryDelayMs;
    }
}

// --- Result Type for API Attempt ---
export type AttemptResult = AnalysisWithSummary | 'parse_error' | 'validation_error' | 'empty_response' | QuotaError | Error;