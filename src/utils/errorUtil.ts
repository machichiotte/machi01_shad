// src/utils/errorUtil.ts
import { AuthenticationError } from 'ccxt'
import { Response } from 'express'

/*
* Gestion des erreurs de réponse
*/
function handleControllerError(res: Response, error: unknown, functionName: string): void {
  if (error instanceof AuthenticationError) {
    console.error(`Authentication error in ${functionName}:`, error.message)
    res.status(401).json({
      message: `Authentication error in ${functionName}`,
      error: error.message
    })
  } else if (error instanceof Error) {
    console.error(`Error in ${functionName}:`, error)
    res.status(500).json({
      message: `Error in ${functionName}`,
      error: error.message
    })
  } else {
    console.error(`Unknown error in ${functionName}:`, error)
    res.status(500).json({
      message: `Unknown error in ${functionName}`,
      error: error
    })
  }
}

function handleServiceError(error: unknown, functionName: string, message?: string): void {
  if (error instanceof AuthenticationError) {
    console.error(`Authentication error in ${functionName} (${message}):`, error.message)

  } else if (error instanceof Error) {
    console.error(`Error in ${functionName} (${message}):`, error)

  } else {
    console.error(`Unknown error in ${functionName} (${message}):`, error)

  }
}

export { handleControllerError, handleServiceError }
