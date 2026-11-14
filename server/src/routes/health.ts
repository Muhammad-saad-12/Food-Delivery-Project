import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    service: 'restaurant-management-api',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    database: dbStatusMap[dbState] || 'unknown',
  });
});
