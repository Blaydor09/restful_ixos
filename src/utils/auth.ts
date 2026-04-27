import { createHash } from 'crypto';

import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import { ApiError } from './api-error';

export interface AuthUserPayload {
  id: string;
  email: string;
  username: string;
}

interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  username: string;
  tokenType: 'access' | 'refresh';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

function signToken(
  user: AuthUserPayload,
  secret: string,
  expiresIn: string,
  tokenType: 'access' | 'refresh',
): string {
  const options: SignOptions = {
    subject: user.id,
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(
    {
      email: user.email,
      username: user.username,
      tokenType,
    },
    secret,
    options,
  );
}

export function signAccessToken(user: AuthUserPayload): string {
  return signToken(user, env.JWT_SECRET, env.JWT_EXPIRES_IN, 'access');
}

export function signRefreshToken(user: AuthUserPayload): string {
  return signToken(user, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN, 'refresh');
}

function verifyToken(
  token: string,
  secret: string,
  expectedType: 'access' | 'refresh',
): TokenPayload {
  try {
    const payload = jwt.verify(token, secret) as TokenPayload;

    if (payload.tokenType !== expectedType || !payload.sub) {
      throw new ApiError(401, 'Token inválido');
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, 'Token inválido o expirado');
  }
}

export function verifyAccessToken(token: string): AuthUserPayload {
  const payload = verifyToken(token, env.JWT_SECRET, 'access');
  return {
    id: payload.sub,
    email: payload.email,
    username: payload.username,
  };
}

export function verifyRefreshToken(token: string): AuthUserPayload {
  const payload = verifyToken(token, env.JWT_REFRESH_SECRET, 'refresh');
  return {
    id: payload.sub,
    email: payload.email,
    username: payload.username,
  };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getTokenExpiration(token: string): Date {
  const payload = jwt.decode(token) as JwtPayload | null;

  if (!payload?.exp) {
    throw new ApiError(500, 'No se pudo calcular la expiración del token');
  }

  return new Date(payload.exp * 1000);
}

