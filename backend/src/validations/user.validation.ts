import { z } from 'zod';
import { USER_ROLES } from '../constants';

const staffRoles = [
  USER_ROLES.ADMIN,
  USER_ROLES.KASIR,
  USER_ROLES.MEKANIK,
  USER_ROLES.PEMILIK,
] as const;

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Nama lengkap wajib diisi' }).min(2).max(100),
    email: z.string({ required_error: 'Email wajib diisi' }).email('Format alamat email tidak valid'),
    password: z.string({ required_error: 'Kata sandi wajib diisi' }).min(6, 'Kata sandi minimal 6 karakter'),
    role: z.enum(staffRoles, {
      errorMap: () => ({ message: 'Peran staf harus salah satu dari: admin, kasir, mekanik, pemilik' }),
    }),
    phone: z.string({ required_error: 'Nomor telepon wajib diisi' }).min(8),
  }),
});

export const userQuerySchema = z.object({
  query: z.object({
    role: z.enum(Object.values(USER_ROLES) as [string, ...string[]]).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
    search: z.string().optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean({ required_error: 'Status isActive (true/false) wajib diisi' }),
  }),
});
