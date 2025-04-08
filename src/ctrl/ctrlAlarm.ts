// src/ctrl/ctrlAlarm.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceAlarm } from '@services/serviceAlarm'
import { AlarmInput } from '@typ/database'
import { ServiceTicker } from '@services/api/platform/serviceTicker'
import { STABLECOINS } from '@constants/coins'

/**
 * Méthode pour créer une alarme
 */
async function setAlarm(req: Request, res: Response): Promise<void> {
  const { platform, base, price } = req.body

  try {
    const createdAt = new Date(Date.now())
    const status = 'open'

    let oldPrice = -1 // Par défaut, si aucun prix n'est trouvé

    // Fonction pour chercher un prix valide parmi les tickers
    const findLastPrice = (tickers: Array<{ last?: number }>) => {
      for (const ticker of tickers) {
        if (ticker.last !== undefined) {
          return ticker.last
        }
      }
      return -1 // Aucun prix valide trouvé
    }

    // Si aucun prix valide trouvé, on teste avec les autres stablecoins
    if (oldPrice === -1) {
      for (const stablecoin of STABLECOINS) {
        const tickerData =
          await ServiceTicker.getAllTickersBySymbolFromPlatform(
            platform,
            base + '/' + stablecoin
          )

        oldPrice = findLastPrice(tickerData)
        if (oldPrice !== -1) break // Sortir de la boucle si un prix est trouvé
      }
    }

    // Si aucun prix n'a été trouvé, renvoyer une erreur
    if (oldPrice === -1) {
      res.status(500).json({
        status: 'error',
        message: `Aucun prix valide trouvé pour ${base}.`
      })
    } else {
      // Préparation des données pour l'alarme
      const alarmInput: AlarmInput = {
        platform,
        base,
        price,
        oldPrice,
        status,
        createdAt
      }

      // Création de l'alarme dans le service
      const data = await ServiceAlarm.createAlarm(alarmInput)

      res.status(200).json({
        status: 'success',
        message: `Alarme enregistrée pour ${platform} ${base} ${price} avec succès.`,
        data: data
      })
    }
  } catch (error) {
    handleControllerError(res, error, setAlarm.name)

    res.status(500).json({
      status: 'error',
      message: "Erreur lors de la création de l'alarme."
    })
  }
}

export { setAlarm }
