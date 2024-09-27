// src/types/cron
export interface Task {
    schedule: string
    task: () => void
    name: string
}