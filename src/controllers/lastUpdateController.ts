// src/controllers/lastUpdateController.ts
import { validateEnvVariables } from '@utils/controllerUtil'
import {
  LastUpdateService
} from '@services/lastUpdateService'
import { MongodbService } from '@services/mongodbService'
import { Request, Response } from 'express'

import { handleControllerError } from '@utils/errorUtil'

validateEnvVariables(['MONGODB_COLLECTION_LAST_UPDATE'])

/**
 * Récupère l'enregistrement de dernière mise à jour unique pour une plateforme et un type donnés.
 */
async function getUniqueLastUpdate(req: Request, res: Response): Promise<void> {
  try {
    const { platform, type } = req.params
    const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE

    if (!collectionName) {
      throw new Error('MONGODB_COLLECTION_LAST_UPDATE is not defined')
    }

    // check si besoin de filter
    //const filter = { platform, type }

    const lastUpdateData = await MongodbService.getDataMDB(collectionName)

    if (lastUpdateData.length > 0) {
      console.log(
        'Dernière mise à jour unique récupérée de la base de données.',
        {
          platform,
          type
        }
      )
      res.json(lastUpdateData[0])
    } else {
      console.log(
        "Aucune dernière mise à jour trouvée, retour d'un horodatage nul.",
        {
          platform,
          type
        }
      )
      res.json({ platform, type, timestamp: null })
    }
  } catch (error) {
    console.error(
      'Échec de la récupération de la dernière mise à jour unique.',
      {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        platform: req.params.platform,
        type: req.params.type
      }
    )
    res.status(500).json({ error: 'Erreur interne du serveur' })
  }
}

/**
 * Récupère tous les enregistrements de dernière mise à jour de la base de données.
 */
async function getLastUpdate(req: Request, res: Response): Promise<void> {
  try {
    const data = await LastUpdateService.fetchDatabaseLastUpdate()
    res.status(200).json({ message: 'Dernières mises à jour récupérées', data })
  } catch (error) {
    handleControllerError(res, error, 'getLastUpdate')
  }
}

/**
 * Met à jour l'enregistrement de dernière mise à jour pour un type et une plateforme spécifiques.
 */
async function updateLastUpdateByType(req: Request, res: Response): Promise<void> {
  try {
    const { platform, type } = req.params
    await LastUpdateService.saveLastUpdateToDatabase(type, platform)
    const timestamp = new Date().toISOString()
    res.status(200).json({ message: 'Dernière mise à jour mise à jour', data: { platform, type, timestamp } })
  } catch (error) {
    handleControllerError(res, error, 'updateLastUpdateByType')
  }
}

export { getLastUpdate, getUniqueLastUpdate, updateLastUpdateByType }