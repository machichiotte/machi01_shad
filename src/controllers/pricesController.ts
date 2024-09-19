// src/controllers/pricesController.ts
import { Request, Response } from 'express'
import { getData } from '../utils/dataUtil'

/**
 * Récupère les données de prix à partir d'une collection MongoDB spécifiée.
 */
async function getPrice(req: Request, res: Response, collectionName: string): Promise<void> {
  const collection = process.env[collectionName]
  if (collection) {
    await getData(collection)
  } else {
    throw new Error(
      `La collection ${collectionName} n'est pas définie dans les variables d'environnement.`
    )
  }
}

/**
 * Récupère le prix du Bitcoin.
 */
async function getPriceBtc(req: Request, res: Response): Promise<void> {
  await getPrice(req, res, 'MONGODB_COLLECTION_PRICE_BTC')
}

/**
 * Récupère le prix de l'Ethereum.
 */
async function getPriceEth(req: Request, res: Response): Promise<void> {
  await getPrice(req, res, 'MONGODB_COLLECTION_PRICE_ETH')
}

export { getPriceBtc, getPriceEth }
