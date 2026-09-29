import { Request, Response, NextFunction } from 'express';
import { getDatabaseStatus } from '../config/db';
import { env } from '../config/env';
import { sendSuccess } from '../utils/response';

/**
 * Controller untuk pemeriksaan kesehatan (Health Check) server MotorCenter
 */
export const getHealth = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const dbStatus = getDatabaseStatus();
    const memoryUsage = process.memoryUsage();

    const healthData = {
      app: env.APP_NAME,
      version: '1.0.0',
      environment: env.NODE_ENV,
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMB: {
          rss: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
          heapTotal: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          heapUsed: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        },
      },
    };

    sendSuccess(res, `Sistem backend ${env.APP_NAME} berjalan normal`, healthData);
  } catch (error) {
    next(error);
  }
};
