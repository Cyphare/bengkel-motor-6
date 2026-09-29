import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import { env } from '../config/env';

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Terjadi kesalahan internal pada server';
  let errors = err.errors;

  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Format JSON pada request body tidak valid';
  }

  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Format data tidak valid untuk field '${err.path}': ${err.value}`;
  }

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validasi data gagal';
    errors = Object.values(err.errors).map((item: any) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'data';
    const duplicatedValue = err.keyValue ? err.keyValue[duplicatedField] : '';
    message = `Data '${duplicatedField}' dengan nilai '${duplicatedValue}' sudah terdaftar`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token autentikasi tidak valid';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Sesi login telah kedaluwarsa, silakan login kembali';
  }

  if (statusCode >= 500) {
    console.error(`[error] Unhandled error: ${err.name} - ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  if (env.NODE_ENV === 'production' && !err.isOperational && statusCode === 500) {
    message = 'Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.';
    errors = undefined;
  }

  sendError(res, message, statusCode, errors);
};
