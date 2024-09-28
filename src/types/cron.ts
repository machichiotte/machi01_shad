// src/types/cron.ts
export interface Task {
    schedule: string
    task: () => void
    name: string
}