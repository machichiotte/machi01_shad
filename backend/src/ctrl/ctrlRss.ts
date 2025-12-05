// src/ctrl/ctrlRss.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceRssProcessor } from '@services/content/serviceRssProcessor'

/**
 * Récupère les dernières données Rss de la base de données.
 */
async function getRss(req: Request, res: Response): Promise<void> {
  try {
    const data = await ServiceRssProcessor.fetchDatabaseRss()
    res.status(200).json({
      status: "success",
      message: 'Données Rss récupérées avec succès',
      data
    })
  } catch (error) {
    handleControllerError(res, error, getRss.name)
  }
}

export { getRss }