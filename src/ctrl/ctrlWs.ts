// src/ctrl/ctrlWs.ts
import { Request, Response } from 'express'
import { handleControllerError } from '@utils/errorUtil'
import { ServiceBinanceWs } from '@services/api/platform/serviceBinanceWs';

/**
 * Démarre la connexion WebSocket Binance.
 */
async function startBinanceWs(req: Request, res: Response): Promise<void> {
  try {
    ServiceBinanceWs.connect();
    res.status(200).json({ status: 'success', message: 'WebSocket Binance démarré.' });
  } catch (error) {
    handleControllerError(res, error, 'startBinanceWs');
  }
}

/**
 * Arrête la connexion WebSocket Binance.
 */
async function stopBinanceWs(req: Request, res: Response): Promise<void> {
  try {
    ServiceBinanceWs.disconnect();
    res.status(200).json({ status: 'success', message: 'WebSocket Binance arrêté.' });
  } catch (error) {
    handleControllerError(res, error, 'stopBinanceWs');
  }
}

export { startBinanceWs, stopBinanceWs }