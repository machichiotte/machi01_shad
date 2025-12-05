// src/services/serviceAlarm.ts
import path from 'path';
import { ObjectId } from 'mongodb';

import { RepoAlarm } from '@repo/repoAlarm';
import { RepoTicker } from '@repo/repoTicker';
import { AlarmInput, AlarmFilter, DbAlarm } from '@typ/database';
import { logger } from '@utils/loggerUtil';

export class ServiceAlarm {
  // Constructeur si nécessaire
  constructor() {
    // Initialisation ou dépendances
  }

  // Méthode pour créer une alarme
  static async createAlarm(data: AlarmInput): Promise<string> {
    const alarm: DbAlarm = { ...data, _id: new ObjectId() } // Génère un nouvel ObjectId pour _id
    return await RepoAlarm.createAlarm(alarm)
  }

  // Méthode pour récupérer les alarmes
  static async getAlarms(filter?: AlarmFilter): Promise<DbAlarm[]> {
    return await RepoAlarm.fetchAlarms(filter || {})
  }

  // Méthode pour mettre à jour une alarme
  static async updateAlarm(
    id: string,
    updates: Partial<DbAlarm>
  ): Promise<void> {
    await RepoAlarm.updateAlarm(id, updates)
  }

  // Méthode pour supprimer une alarme
  static async deleteAlarm(id: string): Promise<void> {
    await RepoAlarm.deleteAlarm(id)
  }

  static async checkAndTriggerAlarms(): Promise<void> {
    // Logique de déclenchement des alarmes
    // 1. récupérer les alarmes
    const alarms = await RepoAlarm.fetchAlarms()
    const openAlarms = alarms.filter((alarm) => alarm.status === 'open')

    // 2. récupérer les tickers
    const tickers = await RepoTicker.fetchAll()
    // 3. parcourir les alarmes

    // 4. vérifier si la condition est remplie
    openAlarms.forEach((alarm) => {
      const isTriggered = tickers.some((ticker) => {
        const lastPrice = ticker.last ?? 0 // Valeur par défaut si undefined
        return (
          ticker.symbol.split('/')[0] === alarm.base &&
          ((alarm.oldPrice < alarm.price && lastPrice >= alarm.price) || // Cas prix augmente
            (alarm.oldPrice > alarm.price && lastPrice <= alarm.price)) // Cas prix diminue
        )
      })

      if (isTriggered) {
        logger.debug(
          `Notification: Alarme déclenchée pour ${alarm.base} à ${alarm.price}`, { module: path.parse(__filename).name, operation: 'checkAndTriggerAlarms' }
        )

        RepoAlarm.updateAlarm(alarm._id.toString(), {
          status: 'closed'
        })
      }
    })
  }
}
