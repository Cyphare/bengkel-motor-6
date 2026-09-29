import { Response } from 'express';
import { HTTP_STATUS } from '../constants';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: any;
}

/**
 * Mengirim response sukses standar (200 OK)
 */
export const sendSuccess = <T>(
  res: Response,
  message: string = 'Operasi berhasil dilakukan',
  data?: T,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(responseBody);
};

/**
 * Mengirim response sukses pembuatan entitas baru (201 Created)
 */
export const sendCreated = <T>(
  res: Response,
  message: string = 'Data berhasil dibuat',
  data?: T
): Response => {
  return sendSuccess(res, message, data, HTTP_STATUS.CREATED);
};

/**
 * Mengirim response dengan data terpaginasi
 */
export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): Response => {
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
  const responseBody: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages,
    },
  };
  return res.status(HTTP_STATUS.OK).json(responseBody);
};

/**
 * Mengirim response error standar
 */
export const sendError = (
  res: Response,
  message: string = 'Terjadi kesalahan pada sistem',
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: any
): Response => {
  const responseBody: ApiResponse = {
    success: false,
    message,
    ...(errors !== undefined && { errors }),
  };
  return res.status(statusCode).json(responseBody);
};
