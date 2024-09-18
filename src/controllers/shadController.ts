// src/controllers/shadController.ts
import { Request, Response } from 'express'
import { handleErrorResponse } from '../utils/errorUtil'
import { validateEnvVariables } from '../utils/controllerUtil'
import { ShadService } from '../services/shadService'
import { BalancesService } from '../services/balancesService'
import { TickersService } from '../services/tickersService' // Assurez-vous que ce service existe
import { OrdersService } from '../services/ordersService' // Créez ce service pour gérer les ordres

validateEnvVariables(['MONGODB_COLLECTION_CMC', 'TYPE_CMC'])

/**
 * Récupère les dernières données CoinMarketCap de la base de données.
 * @param {Request} req - Objet de requête HTTP.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function getShad(req: Request, res: Response): Promise<void> {
  try {
    const data = await ShadService.fetchShadInDatabase()
    console.log('Données Shad récupérées', { count: data.length })
    res.json(data)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur dans getShad: ${error.message}`, { error })
      handleErrorResponse(res, error, 'getShad')
    } else {
      console.error('Erreur inconnue dans getShad')
      handleErrorResponse(res, new Error('Erreur inconnue'), 'getShad')
    }
  }
}

async function handleTrailingStopHedgeAssets(req: Request, res: Response): Promise<void> {
  try {
    const simplifiedSelectedAssets = JSON.parse(req.params.simplifiedSelectedAssets as string) as Array<{ asset: string, platform: string }>;

    // Grouper les actifs par plateforme
    const assetsByPlatform = simplifiedSelectedAssets.reduce<Record<string, string[]>>((acc, { asset, platform }) => {
      if (!acc[platform]) acc[platform] = [];
      acc[platform].push(asset);
      return acc;
    }, {});

    const [balances, highestPrices] = await Promise.all([
      BalancesService.fetchDatabaseBalances(),
      ShadService.getHighestPrices()
    ]);

    const updatedOrders = [];
    const PERCENTAGE_TO_LOSE = 0.05;

    for (const [platform, assets] of Object.entries(assetsByPlatform)) {
      const platformTickers = await TickersService.fetchCurrentTickers(platform);

      for (const asset of assets) {
        const balance = balances.find(b => b.base === asset && b.platform === platform);
        const ticker = platformTickers.find(t => t.symbol === asset);

        if (!balance || !ticker) {
          console.log(`Actif ${asset} non trouvé dans les soldes ou les tickers pour la plateforme ${platform}`);
          continue;
        }

        const { last: currentPrice } = ticker;
        const highestPrice = highestPrices.find(hp => hp.base === asset && hp.platform === platform)?.highestPrice || currentPrice;

        if (highestPrice && currentPrice && currentPrice > highestPrice) {
          const stopLossPrice = currentPrice * (1 - PERCENTAGE_TO_LOSE);

          await OrdersService.cancelAllOrders(platform, asset);
          const order = await OrdersService.createOrUpdateStopLossOrder(platform, stopLossPrice, asset, balance.balance);
          await ShadService.updateHighestPrice(platform, asset, currentPrice);

          updatedOrders.push(order);
          console.log(`Ordre de trailing stop créé/mis à jour pour ${asset} sur ${platform}`, { order });
        }
      }
    }

    console.log(`Mise à jour des ordres de trailing stop terminée`, { count: updatedOrders.length });
    res.status(200).json({ updatedOrders });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur dans handleTrailingStopHedgeAssets: ${error.message}`, { error });
      handleErrorResponse(res, error, 'handleTrailingStopHedgeAssets');
    } else {
      console.error('Erreur inconnue dans handleTrailingStopHedgeAssets');
      handleErrorResponse(res, new Error('Erreur inconnue'), 'handleTrailingStopHedgeAssets');
    }
  }
}

/**
 * Gère la demande de hedge avec trailing stop pour tous les symboles.
 * @param {Request} req - Objet de requête HTTP.
 * @param {Response} res - Objet de réponse HTTP.
 */
async function handleTrailingStopHedge(req: Request, res: Response): Promise<void> {
  console.log('handleTrailingStopHedge')
  try {
    const [shadData, highestPrices] = await Promise.all([
      BalancesService.fetchDatabaseBalances(),
      ShadService.getHighestPrices()
    ]);

    const symbolsAndBalanceByPlatform = shadData.reduce<Record<string, Set<{ base: string; balance: number; }>>>((acc, bal) => {
      const platform = bal.platform as string;
      if (platform !== 'binance' && platform !== 'kucoin') {
        return acc;
      }
      if (!acc[platform]) acc[platform] = new Set();
      acc[platform].add({
        base: bal.base,
        balance: bal.balance
      });
      return acc;
    }, {});

    const updatedOrders = [];
    const PERCENTAGE_TO_LOSE = 0.01;

    // ici il faut boucler sur les base + balance de chaque plateforme, modifie la ligne suivante
    for (const [platform, symbolsAndBalances] of Object.entries(symbolsAndBalanceByPlatform)) {
      const platformTickers = await TickersService.fetchCurrentTickers(platform);

      for (const { base, balance } of symbolsAndBalances) {
        // Condition pour ne créer que sur une base unique sur Kucoin
        if (platform !== 'kucoin') continue;
        const balanceToSell = balance;

        const ticker = platformTickers.find(t => t.symbol === `${base}/USDT`);
        if (!ticker) continue;

        const { last: currentPrice } = ticker;
        const matchingHighestPrice = highestPrices.find(hp => hp.base === base && hp.platform === platform);

        let highestPrice = matchingHighestPrice?.highestPrice;        //ici dans le cas ou cest vide
        console.warn('currentPrice', currentPrice)
        console.warn('highestPrice', highestPrice)

        if (!highestPrice && currentPrice) {
          console.log('highestPrice is null')
          highestPrice = currentPrice
          const stopPrice = currentPrice * (1 - PERCENTAGE_TO_LOSE);
          await OrdersService.cancelAllOrders(platform, base);
          await OrdersService.createOrUpdateStopLossOrder(platform, stopPrice, base, balanceToSell);
          await ShadService.updateHighestPrice(platform, base, currentPrice);
          updatedOrders.push({ base, platform });
          console.log(`Ordre de trailing stop créé pour ${base}`);
        }

        if (highestPrice && currentPrice && currentPrice > highestPrice) {
          console.log('currentPrice is greater than highestPrice')
          const stopLossPrice = Math.max(highestPrice, currentPrice) * (1 - PERCENTAGE_TO_LOSE);
          await OrdersService.cancelAllOrders(platform, base);
          const order = await OrdersService.createOrUpdateStopLossOrder(platform, stopLossPrice, base, balance);
          await ShadService.updateHighestPrice(platform, base, currentPrice);
          updatedOrders.push(order);
          console.log(`Ordre de trailing stop mis à jour pour ${base}`, { order });
        }
      }
    }

    console.log(`Mise à jour des ordres de trailing stop terminée`, { count: updatedOrders.length });

    // 6. Renvoyer la réponse
    res.status(200).json({ updatedOrders });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur dans handleTrailingStopHedge: ${error.message}`, { error });
      handleErrorResponse(res, error, 'handleTrailingStopHedge');
    } else {
      console.error('Erreur inconnue dans handleTrailingStopHedge');
      handleErrorResponse(res, new Error('Erreur inconnue'), 'handleTrailingStopHedge');
    }
  }
}

export { getShad, handleTrailingStopHedge, handleTrailingStopHedgeAssets }
