import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  APP_NAME: z.string().default('MotorCenter'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI wajib diisi'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET minimal 8 karakter').default('default_secret_key_paw_motorcenter_2026'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGIN: z.string().default('*'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const parseEnv = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET?.trim()) {
    console.error('Konfigurasi Environment tidak valid: JWT_SECRET wajib diisi di production');
    process.exit(1);
  }
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Konfigurasi Environment tidak valid:');
    result.error.errors.forEach((err) => {
      console.error(`   - ${err.path.join('.')}: ${err.message}`);
    });
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  return (result.success ? result.data : envSchema.parse({
    ...process.env,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/motorcenter'
  }));
};

export const env = parseEnv();
