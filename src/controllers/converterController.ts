// src/controllers/converterController.ts
import Papa from 'papaparse';
import { Request, Response } from 'express';
import * as converterService from '../services/converterService';

/**
 * Convertit un fichier CSV en format JSON.
 * @param {Request} req - L'objet de requête HTTP contenant le fichier CSV.
 * @param {Response} res - L'objet de réponse HTTP.
 */
async function getConvertedCsv(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file as Express.Multer.File;
    const { buffer } = file;

    // Utiliser PapaParse pour lire les données CSV du buffer
    Papa.parse(buffer.toString('utf-8'), {
      complete: async (result: Papa.ParseResult<unknown[]>) => {
        console.log("🚀 ~ complete: ~ result:", result);
        const jsonData = result ? await converterService.convertToJSON(result.data) : [];
        console.log("🚀 ~ complete: ~ jsonData:", jsonData);

        res.json({ success: true, data: jsonData });
      },
      error: (error: Papa.ParseError) => {
        console.log("🚀 ~ Papa.parse ~ error:", error);
        res.status(500).json({ success: false, message: "Erreur Serveur" });
      },
      header: true,
    });
  } catch (error) {
    console.log("🚀 ~ getConvertedCsv ~ error:", error);
    res.status(500).json({ success: false, message: "Erreur Interne du Serveur" });
  }
}

export { getConvertedCsv };