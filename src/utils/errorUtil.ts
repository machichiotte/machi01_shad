// src/utils/errorUtil.ts
import { AuthenticationError } from 'ccxt'
import { Response } from 'express'

function handleControllerError(res: Response, error: unknown, functionName: string): void {
  if (error instanceof AuthenticationError) {
    console.error(`Controller Authentication error in ${functionName}:`, error.message)
    res.status(401).json({
      status: "error",
      message: `Authentication error in ${functionName}`,
      error: error.message
    })
  } else if (error instanceof Error) {
    console.error(`Controller Error in ${functionName}:`, error)
    res.status(500).json({
      status: "error",
      message: `Error in ${functionName}`,
      error: error.message
    })
  } else {
    console.error(`Controller Unknown error in ${functionName}:`, error)
    res.status(500).json({
      status: "error",
      message: `Unknown error in ${functionName}`,
      error: error
    })
  }
}

function handleServiceError(error: unknown, functionName: string, message?: string): void {
  if (error instanceof AuthenticationError) {
    console.error(`Service Authentication error in ${functionName} : (${error.message}):`)

  } else if (error instanceof Error) {
    console.error(`Service Error in ${functionName} (${message}):`, error.message)

  } else {
    console.error(`Service Unknown error in ${functionName} (${message}):`, error)

  }
}

export { handleControllerError, handleServiceError }
