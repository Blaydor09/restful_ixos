import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatorio'),
  DB_SSL: z
    .string()
    .default('false')
    .transform((value) => value.toLowerCase() === 'true'),
  CORS_ORIGIN: z
    .string()
    .default('*')
    .transform((value) =>
      value === '*'
        ? ['*']
        : value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
    ),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
});

export const env = envSchema.parse(process.env);

