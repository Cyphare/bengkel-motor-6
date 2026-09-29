import { z } from 'zod';
import { BOOKING_TYPE, SERVICE_STATUS } from '../constants';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createOnlineBookingSchema = z.object({
  body: z.object({
    plateNumber: z.string({ required_error: 'Nomor plat kendaraan wajib diisi' }).min(3).max(15),
    motorModel: z.string({ required_error: 'Model motor wajib diisi' }).min(2).max(50),
    complaint: z.string({ required_error: 'Keluhan kendaraan wajib diisi' }).min(3).max(500),
    serviceId: z.string().regex(objectIdRegex, 'ID Layanan tidak valid').optional(),
    serviceDate: z.string().datetime({ message: 'Format tanggal harus ISO datetime' }).optional(),
  }),
});

export const createWalkInBookingSchema = z.object({
  body: z.object({
    customerName: z.string({ required_error: 'Nama pelanggan wajib diisi' }).min(2).max(100),
    customerPhone: z.string({ required_error: 'Nomor telepon pelanggan wajib diisi' }).min(8).max(20),
    plateNumber: z.string({ required_error: 'Nomor plat kendaraan wajib diisi' }).min(3).max(15),
    motorModel: z.string({ required_error: 'Model motor wajib diisi' }).min(2).max(50),
    complaint: z.string({ required_error: 'Keluhan kendaraan wajib diisi' }).min(3).max(500),
    serviceId: z.string().regex(objectIdRegex, 'ID Layanan tidak valid').optional(),
    mechanicId: z.string().regex(objectIdRegex, 'ID Mekanik tidak valid').optional(),
    serviceFee: z.coerce.number().min(0, 'Biaya jasa tidak boleh bernilai negatif').optional(),
  }),
});

export const assignMechanicSchema = z.object({
  body: z.object({
    mechanicId: z.string({ required_error: 'ID Mekanik wajib diisi' }).regex(objectIdRegex, 'Format ID Mekanik tidak valid'),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(SERVICE_STATUS) as [string, ...string[]], {
      required_error: 'Status baru wajib diisi',
      invalid_type_error: 'Status tidak valid',
    }),
    mechanicNotes: z.string().max(1000).optional(),
    serviceFee: z.coerce.number().min(0).optional(),
  }),
});

export const addPartToBookingSchema = z.object({
  body: z.object({
    partId: z.string({ required_error: 'ID Suku Cadang wajib diisi' }).regex(objectIdRegex, 'Format ID Part tidak valid'),
    quantity: z.coerce.number({ required_error: 'Jumlah (quantity) wajib diisi' }).int().min(1, 'Jumlah minimal 1'),
  }),
});

export const bookingQuerySchema = z.object({
  query: z.object({
    status: z.enum(Object.values(SERVICE_STATUS) as [string, ...string[]]).optional(),
    bookingType: z.enum(Object.values(BOOKING_TYPE) as [string, ...string[]]).optional(),
    plateNumber: z.string().optional(),
    mechanicId: z.string().regex(objectIdRegex).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
  }),
});
