// src/types/auth.ts
export interface User {
    email: string;
    password: string;
    [key: string]: string | number | boolean | undefined;
}