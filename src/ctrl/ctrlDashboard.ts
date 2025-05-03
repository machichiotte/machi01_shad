// src/ctrl/Dashboard.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceDashboard } from '@src/services/api/platform/serviceDashboard'
import { ServiceTrailingStop } from '@services/serviceTrailingStop'

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 */
async function getDashboard(req: Request, res: Response): Promise<void> {
    try {
        const data = await ServiceDashboard.fetchDashboardInDatabase()
        res.status(200).json({ status: "success", message: 'Données Dashboard récupérées', data })
    } catch (error) {
        handleControllerError(res, error, getDashboard.name)
    }
}

async function handleTrailingStopHedge(req: Request, res: Response): Promise<void> {
    try {
        // Vérifie si des actifs sélectionnés sont fournis dans les paramètres, sinon les définit comme undefined
        const simplifiedSelectedBases = req.params.simplifiedSelectedBases
            ? JSON.parse(req.params.simplifiedSelectedBases as string) as Array<{ base: string, platform: string }>
            : undefined;

        const data = await ServiceTrailingStop.handleTrailingStopHedge(simplifiedSelectedBases);
        res.status(200).json({ status: "success", message: 'Mise à jour des ordres de trailing stop terminée', data });
    } catch (error) {
        handleControllerError(res, error, handleTrailingStopHedge.name);
    }
}

export { getDashboard, handleTrailingStopHedge }