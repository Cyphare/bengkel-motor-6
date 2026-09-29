import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Nama lengkap wajib diisi' }).min(2, 'Nama minimal 2 karakter').max(100),
    email: z.string({ required_error: 'Email wajib diisi' }).email('Format alamat email tidak valid'),
    password: z.string({ required_error: 'Kata sandi wajib diisi' }).min(6, 'Kata sandi minimal 6 karakter'),
    phone: z.string({ required_error: 'Nomor telepon wajib diisi' }).min(8, 'Nomor telepon minimal 8 digit'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email wajib diisi' }).email('Format alamat email tidak valid'),
    password: z.string({ required_error: 'Kata sandi wajib diisi' }).min(1, 'Kata sandi wajib diisi'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100).optional(),
    phone: z.string().min(8, 'Nomor telepon minimal 8 digit').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Kata sandi lama wajib diisi' }).min(1),
    newPassword: z.string({ required_error: 'Kata sandi baru wajib diisi' }).min(6, 'Kata sandi baru minimal 6 karakter'),
  }),
});
