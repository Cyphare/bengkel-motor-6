import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/appError';

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Rute ${req.method} ${req.originalUrl} tidak ditemukan pada server ini`));
};
