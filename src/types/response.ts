// src/types/response.ts
export interface ApiResponse<T> {
    status: 'success' | 'error';
    message: string;
    timestamp: number;
    data: T | null;
    error?: string | null;
}