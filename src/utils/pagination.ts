import { Request } from 'express';
import { z } from 'zod';

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export function pagination(req: Request) {
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '20'), 10) || 20, 1), 100);
  const offset = Math.max(parseInt(String(req.query.offset ?? '0'), 10) || 0, 0);
  return { limit, offset };
}

export function buildPaginationMeta(limit: number, offset: number, count: number) {
  return {
    limit,
    offset,
    count,
  };
}

