// src/server.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { config } from '@config/index';
import apiRoutes from '@routes/index';
import path from 'path';
import { logger } from '@utils/loggerUtil';
import { formatErrorForLog } from '@utils/errorUtil';

const PORT = config.port || 10000;
const app = express() as express.Application;

// Middleware CORS
app.use(cors());
app.options('*', cors());

// Middlewares
app.use(express.static('dist')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  const status = 404;
  const message = 'Route not found';
  logger.warn(`${message}: ${req.method} ${req.originalUrl}`, {
    module: path.parse(__filename).name,
    status,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  res.status(status).json({ status: 'error', message });
});

// Error handler (4 args signature)
app.use((error: Error, req: Request, res: Response) => {
  const status = 500;
  const message = 'Internal Server Error';

  logger.error(`${message} on ${req.method} ${req.originalUrl}`, {
    module: path.parse(__filename).name,
    status,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    error: formatErrorForLog(error)
  });

  res.status(status).json({
    status: 'error',
    message,
    error: process.env.NODE_ENV !== 'production' ? error.message : undefined
  });
});

export interface BroadcastTickerData {
  type: string;
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  eventTime: number;
}

// WebSocket Server Setup
let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

/**
 * Broadcasts data to all connected WebSocket clients.
 */
function broadcast(data: BroadcastTickerData): void {
  if (!wss) {
    logger.warn('[Broadcast] WebSocket Server not initialized.');
    return;
  }
  const jsonData = JSON.stringify(data);
  // logger.info(`[Broadcast] Sending to ${clients.size} clients:`, { data });

  clients.forEach((client) => {
    // logger.debug('[Broadcast] Client state:', { open: client.readyState === WebSocket.OPEN });
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData, (err) => {
        if (err) {
          logger.error('[Broadcast] Error sending to client:', { error: formatErrorForLog(err) });
        }
        // else logger.debug('[Broadcast] Message sent');
      });
    }
  });
}

/**
 * Starts HTTP and WebSocket servers.
 */
function startServer(): Promise<{ httpServer: Server; wss: WebSocketServer }> {
  const operation = 'startServer';
  return new Promise((resolve, reject) => {
    const httpServer = app.listen(PORT, () => {
      // logger.debug(`HTTP Server listening on port ${PORT}`, { module: path.parse(__filename).name, operation, port: PORT });

      wss = new WebSocketServer({ server: httpServer });
      // logger.debug(`WebSocket Server attached on port ${PORT}`, { module: path.parse(__filename).name, operation, port: PORT });

      wss.on('connection', (ws: WebSocket, req) => {
        const ip = req.socket.remoteAddress;
        // logger.debug(`[WebSocket] Client connected: ${ip}`);
        clients.add(ws);

        /* ws.on('message', (message: Buffer) => {
          logger.debug(`[WebSocket] Message from ${ip}: ${message.toString()}`);
        }); */

        ws.on('close', () => {
          logger.warn(`[WebSocket] Client disconnected: ${ip}`);
          clients.delete(ws);
        });

        ws.on('error', (error) => {
          logger.error(`[WebSocket] Client error ${ip}:`, { error: formatErrorForLog(error) });
          clients.delete(ws);
        });
      });

      wss.on('error', (error) => {
        logger.error('WebSocket Server error:', { module: path.parse(__filename).name, operation, error: formatErrorForLog(error) });
      });

      resolve({ httpServer, wss });
    });

    httpServer.on('error', (error) => {
      logger.error('HTTP Server startup failed:', { module: path.parse(__filename).name, operation, port: PORT, error: formatErrorForLog(error) });
      reject(error);
    });
  });
}

export { app, startServer, broadcast };
