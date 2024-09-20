// src/controllers/orderMarketController.ts
import { Request, Response } from 'express'
import { OrderMarketService } from '@services/orderMarketService';
import { handleControllerError } from '@utils/errorUtil'

enum OrderType {
  LIMIT_BUY = 'limitBuy',
  LIMIT_SELL = 'limitSell',
  MARKET_BUY = 'marketBuy',
  MARKET_SELL = 'marketSell',
  CANCEL_ALL = 'cancelAll',
  CANCEL_BUY = 'cancelBuy',
  CANCEL_SELL = 'cancelSell',
  DELETE = 'delete'
}

async function handleOrder(req: Request, res: Response, orderType: OrderType): Promise<void> {
  const { platform, asset, amount, price, oId, symbol } = req.body
  try {
    let data
    switch (orderType) {
      case OrderType.LIMIT_BUY:
      case OrderType.LIMIT_SELL:
        data = await OrderMarketService.createLimitOrder(platform, asset, amount, orderType.includes('Buy') ? 'buy' : 'sell', price)
        break
      case OrderType.MARKET_BUY:
      case OrderType.MARKET_SELL:
        data = await OrderMarketService.createMarketOrder(platform, asset, amount, orderType.includes('Buy') ? 'buy' : 'sell')
        break
      case OrderType.CANCEL_ALL:
        data = await OrderMarketService.cancelAllOrdersByBunch(platform, asset)
        break
      case OrderType.CANCEL_BUY:
      case OrderType.CANCEL_SELL:
        data = await OrderMarketService.cancelAllOrdersNoBunch(platform, asset, orderType.includes('Buy') ? 'buy' : 'sell')
        break
      case OrderType.DELETE:
        await OrderMarketService.deleteOrder(platform, oId, symbol)
        break
    }

    const message = getResponseMessage(orderType, asset, platform)
    res.status(200).json({ message, data })
  } catch (error) {
    handleControllerError(res, error, `handleOrder (${orderType})`)
  }
}

function getResponseMessage(orderType: OrderType, asset?: string, platform?: string): string {
  switch (orderType) {
    case OrderType.LIMIT_BUY:
    case OrderType.LIMIT_SELL:
      return `Ordre limit ${orderType.includes('Buy') ? 'd\'achat' : 'de vente'} créé`
    case OrderType.MARKET_BUY:
    case OrderType.MARKET_SELL:
      return 'Ordre au marché créé'
    case OrderType.CANCEL_ALL:
      return `Tous les ordres annulés pour ${asset} sur ${platform}`
    case OrderType.CANCEL_BUY:
      return `Tous les ordres d'achat annulés pour ${asset} sur ${platform}`
    case OrderType.CANCEL_SELL:
      return `Tous les ordres de vente annulés pour ${asset} sur ${platform}`
    case OrderType.DELETE:
      return 'Ordre supprimé'
    default:
      return 'Opération effectuée avec succès'
  }
}

// Fonctions simplifiées utilisant handleOrder
const createLimitSellOrder = (req: Request, res: Response) => handleOrder(req, res, OrderType.LIMIT_SELL)
const createLimitBuyOrder = (req: Request, res: Response) => handleOrder(req, res, OrderType.LIMIT_BUY)
const createMarketBuyOrder = (req: Request, res: Response) => handleOrder(req, res, OrderType.MARKET_BUY)
const createMarketSellOrder = (req: Request, res: Response) => handleOrder(req, res, OrderType.MARKET_SELL)
const cancelAllOrders = (req: Request, res: Response) => handleOrder(req, res, OrderType.CANCEL_ALL)
const cancelAllBuyOrders = (req: Request, res: Response) => handleOrder(req, res, OrderType.CANCEL_BUY)
const cancelAllSellOrders = (req: Request, res: Response) => handleOrder(req, res, OrderType.CANCEL_SELL)
const deleteOrder = (req: Request, res: Response) => handleOrder(req, res, OrderType.DELETE)

export {
  createLimitSellOrder,
  createLimitBuyOrder,
  cancelAllOrders,
  cancelAllSellOrders,
  cancelAllBuyOrders,
  createMarketBuyOrder,
  createMarketSellOrder,
  deleteOrder
}