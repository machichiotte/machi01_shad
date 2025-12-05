// src/middlewares/fileUploadMiddleware.ts
import { handleControllerError } from '@utils/errorUtil';
import { Request, Response, NextFunction } from 'express';

// Définir une interface pour étendre la requête avec le fichier uploadé
interface FileUploadRequest extends Request {
  file?: Express.Multer.File; // Optionnel: Type pour le fichier uploadé
  uploadedFile?: Express.Multer.File; // Type ajouté pour le fichier traité
}

// Middleware pour la gestion de l'upload de fichier
function fileUploadMiddleware(req: FileUploadRequest, res: Response, next: NextFunction): void {
  try {
    // Vérifier si un fichier a été uploadé
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return
    }

    // Assigner le fichier uploadé à une nouvelle propriété de la requête pour traitement ultérieur
    req.uploadedFile = req.file;

    // Continuer vers le prochain middleware ou gestionnaire de route
    next();
  } catch (error) {
    handleControllerError(res, error, 'Une erreur s\'est produite lors du téléchargement du fichier.')
    res.status(500).json({ success: 'error', message: 'Une erreur s\'est produite lors du téléchargement du fichier.', error: error instanceof Error ? error.message : String(error) });
  }
}

export { fileUploadMiddleware };
