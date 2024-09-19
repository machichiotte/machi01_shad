// src/utils/errorUtil.ts
import { AuthenticationError } from 'ccxt'
import { promises as fs } from 'fs'
import { Response } from 'express'
import path from 'path'

interface ErrorPolicy {
  retry: boolean
}

interface PlatformErrorPolicies {
  [errorName: string]: ErrorPolicy
}

export interface ErrorPolicies {
  [platform: string]: PlatformErrorPolicies
}

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

/*
* Charger les politiques d'erreurs depuis le fichier JSON
*/
async function loadErrorPolicies(): Promise<ErrorPolicies> {
  const filePath = path.resolve(__dirname, '../config/errorPolicies.json')
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
}

/*
* Détermine si une erreur justifie une nouvelle tentative
*/
function shouldRetry(platform: string, error: Error, errorPolicies: ErrorPolicies): boolean {
  const platformPolicies = errorPolicies[platform]
  if (platformPolicies) {
    const policy = platformPolicies[error.name]
    if (policy) {
      return policy.retry
    }
  }
  return true // Par défaut, retenter si la politique n'est pas définie
}

export { handleControllerError as handleControllerError, loadErrorPolicies, shouldRetry }
