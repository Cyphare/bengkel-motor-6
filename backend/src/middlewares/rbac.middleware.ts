import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants';
import { ForbiddenError, UnauthorizedError } from '../utils/appError';

/**
 * Middleware untuk membatasi akses endpoint berdasarkan peran pengguna (RBAC)
 * @param allowedRoles Daftar peran yang diizinkan mengakses endpoint
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Autentikasi diperlukan sebelum otorisasi peran'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Akses ditolak: Peran '${req.user.role}' tidak memiliki wewenang untuk mengakses endpoint ini`
        )
      );
    }

    next();
  };
};
