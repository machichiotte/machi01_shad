// src/controllers/lastUpdateController.ts
import { validateEnvVariables } from "../utils/controllerUtil";
import * as lastUpdateService from "../services/lastUpdateService";
import * as mongodbService from "../services/mongodbService";
import { Request, Response } from "express";

validateEnvVariables(["MONGODB_COLLECTION_LAST_UPDATE"]);

/**
 * Récupère l'enregistrement de dernière mise à jour unique pour une plateforme et un type donnés.
 * @param {Request} req - Objet de requête HTTP.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function getUniqueLastUpdate(req: Request, res: Response): Promise<void> {
  try {
    const { platform, type } = req.params;
    const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;

    if (!collectionName) {
      throw new Error("MONGODB_COLLECTION_LAST_UPDATE is not defined");
    }

    const filter = { platform, type };
    const lastUpdateData = await mongodbService.getDataMDB(collectionName, filter);

    if (lastUpdateData.length > 0) {
      console.log("Dernière mise à jour unique récupérée de la base de données.", {
        platform,
        type,
      });
      res.json(lastUpdateData[0]);
    } else {
      console.log("Aucune dernière mise à jour trouvée, retour d'un horodatage nul.", {
        platform,
        type,
      });
      res.json({ platform, type, timestamp: null });
    }
  } catch (error) {
    console.error("Échec de la récupération de la dernière mise à jour unique.", {
      error: error instanceof Error ? error.message : "Erreur inconnue",
      platform: req.params.platform,
      type: req.params.type,
    });
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * Récupère tous les enregistrements de dernière mise à jour de la base de données.
 * @param {Request} req - Objet de requête HTTP.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function getLastUpdate(req: Request, res: Response): Promise<void> {
  try {
    const data = await lastUpdateService.fetchDatabaseLastUpdate();
    console.log("Tous les enregistrements de dernière mise à jour récupérés de la base de données.", {
      count: data.length,
    });
    res.json(data);
  } catch (error) {
    console.error("Échec de la récupération de toutes les dernières mises à jour.", {
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
    handleErrorResponse(res, error, "getLastUpdate");
  }
}

/**
 * Met à jour l'enregistrement de dernière mise à jour pour un type et une plateforme spécifiques.
 * @param {Request} req - Objet de requête HTTP.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function updateLastUpdateByType(req: Request, res: Response): Promise<void> {
  try {
    const { platform, type } = req.params;
    await lastUpdateService.saveLastUpdateToDatabase(type, platform);
    const timestamp = new Date().toISOString();
    console.log("Enregistrement de dernière mise à jour mis à jour.", { platform, type, timestamp });
    res.json({ platform, type, timestamp });
  } catch (error) {
    console.error("Échec de la mise à jour de la dernière mise à jour par type.", {
      error: error instanceof Error ? error.message : "Erreur inconnue",
      platform: req.params.platform,
      type: req.params.type,
    });
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

export {
  getLastUpdate,
  getUniqueLastUpdate,
  updateLastUpdateByType,
};
