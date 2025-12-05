// src/types/email.ts
export interface EmailOptions {
    to: string
    from: string
    subject: string
    text?: string
    html?: string
    [key: string]: string | number | boolean | object | undefined
}