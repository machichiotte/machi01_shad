// src/controllers/timestampController.ts
import { TimestampService } from '@src/services/api/database/timestampService'
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { TimestampRepository } from '@repositories/timestampRepository'

/**
 * Récupère l'enregistrement de dernière mise à jour unique pour une plateforme et un type donnés.
 */
async function getUniqueTimestamp(req: Request, res: Response): Promise<void> {
  try {
    const { platform, type } = req.params
    const filter = { platform, type }

    const timestampData = await TimestampRepository.findTimestamp(filter)

    if (timestampData) {
      res.status(200).json({
        status: "success",
        message: `Dernière mise à jour unique récupérée de la base de données. Platform: ${platform}, Type: ${type}`,
        data: timestampData
      })
    } else {
      res.status(404).json({
        message: `Aucune dernière mise à jour trouvée, retour d'un horodatage nul. Platform: ${platform}, Type: ${type}`,
        error: `Aucune dernière mise à jour trouvée, retour d'un horodatage nul. Platform: ${platform}, Type: ${type}`
      })
    }
  } catch (error) {
    console.error(
      `Échec de la récupération de la dernière mise à jour unique. Platform: \`${req.params.platform}\`, Type: \`${req.params.type}\`, Erreur: \`${error instanceof Error ? error.message : 'Erreur inconnue'}\``
    )
    res.status(500).json({
      status: "error",
      message: 'Erreur interne du serveur',
      error
    })
  }
}

/**
 * Récupère tous les enregistrements de dernière mise à jour de la base de données.
 */
async function getTimestamp(req: Request, res: Response): Promise<void> {
  try {
    const data = await TimestampService.fetchDatabaseTimestamp()
    res.status(200).json({ status: "success", message: 'Dernières mises à jour récupérées', data })
  } catch (error) {
    handleControllerError(res, error, 'getTimestamp')
  }
}

/**
 * Met à jour l'enregistrement de dernière mise à jour pour un type et une plateforme spécifiques.
 */
async function updateTimestampByType(req: Request, res: Response): Promise<void> {
  try {
    const { platform, type } = req.params
    await TimestampService.saveTimestampToDatabase(type, platform)
    const timestamp = new Date().toISOString()
    res.status(200).json({ status: "success", message: 'Dernière mise à jour mise à jour', data: { platform, type, timestamp } })
  } catch (error) {
    handleControllerError(res, error, 'updateTimestampByType')
  }
}

export { getTimestamp, getUniqueTimestamp, updateTimestampByType }