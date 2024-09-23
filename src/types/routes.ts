// src/types/routes
import { Router } from 'express';

export interface Routes {
  converter: Router,
  auth: Router,
  balance: Router,
  cmc: Router,
  strategy: Router,
  orders: Router,
  market: Router,
  trades: Router,
  tickers: Router,
  lastUpdate: Router,
  shad: Router
}