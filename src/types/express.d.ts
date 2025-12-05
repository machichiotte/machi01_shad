// src/types/express.d.ts
import 'express';

// Étendre l'interface Request pour inclure uploadedFile
declare module 'express-serve-static-core' {
    interface Request {
        uploadedFile?: Express.Multer.File; // Ajout de la propriété uploadedFile au type Request
    }
}