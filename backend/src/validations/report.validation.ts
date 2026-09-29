import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal harus YYYY-MM-DD').refine(
  (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value,
  'Tanggal tidak valid'
);

export const revenueQuerySchema = z.object({
  query: z.object({ startDate: date.optional(), endDate: date.optional() }).refine(
    ({ startDate, endDate }) => (!startDate && !endDate) || (!!startDate && !!endDate && startDate <= endDate),
    'startDate dan endDate wajib bersama dan rentang tidak boleh terbalik'
  ),
});
