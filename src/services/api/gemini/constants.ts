// src/services/api/gemini/constants.ts

// --- Constants ---
export const MAX_RETRIES = 3;
export const DEFAULT_RETRY_DELAY_MS = 60000; // 60 seconds default
export const QUOTA_ERROR_STATUS_CODE_NUM = 429;
export const QUOTA_ERROR_STATUS_CODE_STR = '429';
export const QUOTA_ERROR_MESSAGE_FRAGMENT = 'quota';

// Regex to extract retry delay
export const RETRY_DELAY_REGEX_PRIMARY = /"retryDelay":\s*"(\d+)s"/;
export const RETRY_DELAY_REGEX_FALLBACK = /retry delay.*?(\d+)\s*s/i;

// JSON Structure Keys (remain unchanged)
export const KEY_SUMMARY = 'summary';
export const KEY_IS_RELEVANT = 'isRelevant';
export const KEY_RELEVANCE_REASON = 'relevanceReason';
export const KEY_MENTIONED_ASSETS = 'mentionedAssets';
export const KEY_FINANCIAL_SENTIMENT = 'financialSentiment';
export const KEY_SENTIMENT_REASON = 'sentimentReason';
export const KEY_POTENTIAL_IMPACT = 'potentialImpact';
export const KEY_FINANCIAL_THEMES = 'financialThemes';
export const KEY_ACTIONABLE_INFO = 'actionableInfo';

// Valid values for specific fields
export const VALID_RELEVANCE = ['Yes', 'No', 'Partial'] as const; // Use 'as const' for stricter typing
export const VALID_SENTIMENT = ['Positive', 'Negative', 'Neutral', 'Mixed'] as const; // Use 'as const' for stricter typing