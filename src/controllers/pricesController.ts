// src/controllers/pricesController.ts
import { Request, Response } from 'express'
import { getData } from '../utils/dataUtil'

/**
 * Récupère les données de prix à partir d'une collection MongoDB spécifiée.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 * @param {string} collectionName - Le nom de la variable d'environnement contenant le nom de la collection MongoDB.
 */
async function getPrice(
  req: Request,
  res: Response,
  collectionName: string
): Promise<void> {
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
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function getPriceBtc(req: Request, res: Response): Promise<void> {
  await getPrice(req, res, 'MONGODB_COLLECTION_PRICE_BTC')
}

/**
 * Récupère le prix de l'Ethereum.
 * @param {Request} req - L'objet de requête.
 * @param {Response} res - L'objet de réponse.
 */
async function getPriceEth(req: Request, res: Response): Promise<void> {
  await getPrice(req, res, 'MONGODB_COLLECTION_PRICE_ETH')
}

export { getPriceBtc, getPriceEth }
