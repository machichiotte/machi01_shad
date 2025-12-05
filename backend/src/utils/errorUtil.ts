// src/utils/errorUtil.ts
import { AuthenticationError } from 'ccxt'; // Gardez vos imports spécifiques
import { Response } from 'express';
import path from 'path'; import { logger } from './loggerUtil'; // Importer notre logger configuré

// Fonction helper pour extraire les détails de l'erreur de manière sûre
const getErrorDetails = (error: unknown): { message: string; stack?: string; name?: string, details?: unknown } => {
  if (error instanceof Error) {
    // Si c'est une instance d'Error standard, extraire message, stack, nom
    return { message: error.message, stack: error.stack, name: error.name };
  } else if (typeof error === 'string') {
    // Si c'est juste une chaîne
    return { message: error };
  } else {
    // Pour tout autre type (objet, etc.)
    return { message: 'An unknown error structure was encountered.', details: error };
  }
}

// Gestion des erreurs au niveau du contrôleur (qui envoie une réponse HTTP)
function handleControllerError(res: Response, error: unknown, functionName: string): void {
  const errorDetails = getErrorDetails(error);
  const logContext = {
    functionName, // Contexte de la fonction
    errorName: errorDetails.name || 'UnknownError',
    errorMessage: errorDetails.message,
    // Ajoutez ici d'autres contextes pertinents si disponibles (ex: ID de requête, URL)
    // requestId: res.locals?.requestId, // Si vous utilisez un middleware pour ajouter un ID de requête
  };

  // Loguer l'erreur détaillée avec Winston (inclut la stacktrace si disponible)
  logger.error(`Controller Error in ${functionName}`, { ...logContext, stack: errorDetails.stack, details: errorDetails.details });

  let statusCode = 500;
  let responseMessage = `Internal server error in ${functionName}. Please check logs.`; // Message générique pour le client

  // Adapter le statut et message selon le type d'erreur spécifique
  if (error instanceof AuthenticationError) {
    statusCode = 401;
    responseMessage = `Authentication Failed in ${functionName}.`;
  }
  // Ajoutez d'autres `else if` pour des erreurs spécifiques (ex: validation, not found)

  // Envoyer une réponse JSON standardisée et sécurisée au client
  res.status(statusCode).json({
    status: "error",
    message: responseMessage,
    // En production, ne jamais envoyer les détails bruts de l'erreur au client
    errorDetails: process.env.NODE_ENV !== 'production' ? errorDetails.message : undefined,
    // errorId: logContext.requestId // Peut être utile pour corréler avec les logs
  });
}

// Gestion des erreurs au niveau service (qui ne renvoie pas de réponse HTTP directement)
function handleServiceError(error: unknown, functionName: string, customMessage?: string): void {
  const errorDetails = getErrorDetails(error);
  const logContext = {
    functionName,
    errorName: errorDetails.name || 'UnknownError',
    errorMessage: errorDetails.message,
    customMessage: customMessage || 'No additional context provided.',
  };

  // Loguer l'erreur détaillée (toujours inclure la stacktrace pour les erreurs de service)
  logger.error(customMessage || `Service Error in ${functionName}`, { ...logContext, stack: errorDetails.stack, details: errorDetails.details });

  // Les erreurs de service ne renvoient pas de réponse HTTP ici.
  // Elles sont généralement propagées (re-throw) pour être gérées plus haut (ex: par handleControllerError).
}

function formatErrorForLog(error: unknown): object {
  if (error instanceof Error) {
    // Inclut les propriétés standard + stacktrace
    return { name: error.name, message: error.message, stack: error.stack };
  }
  // Gère les types non-Error
  return { message: String(error) };
};

export { handleControllerError, handleServiceError, formatErrorForLog };